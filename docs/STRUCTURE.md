# Klasör mimarisi

Durum: uygulanmış yerel düzen. Tarih: 2 Kasım 2026. Bu belge dosyaların sorumluluğunu ve yeni dosyaların nereye konacağını tanımlar.

## Neden bu düzen?

Önceki düzende web kaynakları, üretilen bundle/worker ve kurulum dosyaları proje kökünü dolduruyordu. Eski inceleme kanıtları test çalıştırıldıkça değişiyordu. Kaynak ile çıktı ayrımını tek bir derleme hattında toplamak, hangi dosyanın düzenleneceğini açık hale getirir.

Seçenekler: kökteki bütün web dosyalarını korumak en az taşıma gerektiriyordu; fakat kaynak/çıktı ayrımını çözmüyordu. Yeni bir framework veya modül sistemi kurmak ise bu dosya düzenleme görevinin dışında ek ürün riski yaratıyordu. Seçilen düzen mevcut JavaScript modüllerini ve uygulama davranışını korur.

## Üretim akışı

```text
src/ + tools/module-order.json ── build ──> web/app.bundle.js
src/pwa/service-worker.js + web/ dosyaları ── build ──> web/sw.js
web/ ── bütünlük kontrolü ve izinli dosya listesi ──> public/
public/ + kurulum araçları ── package ──> dist/*_PWA.zip
kaynaklar + belgeler ── güvenli dosya filtresi ──> dist/*_Source.zip
tests/browser/ ── Chromium ──> test-results/ ve dist/store-listing/
```

`public/`, `dist/`, `test-results/`, `web/app.bundle.js` ve `web/sw.js` çıktıdır. Bunların içeriğini elle düzeltmeyin. Kaynak ZIP'i üretilen bundle/worker içermez; çıkarıldıktan sonra `npm ci` ve `npm run build` ile üretilir.

## Kaynak sorumlulukları

| Alan | Yeri | Kural |
|---|---|---|
| Saf hesaplama ve doğrulama | `src/domain/` | Ekran ve depolama katmanlarından ayrı tutulur |
| IndexedDB, yedek ve kurtarma | `src/storage/` | Veri şeması ve kulüp ayrımı korunur |
| Uygulama koordinasyonu ve görünümler | `src/app/`, `src/main.js` | Kalıcı veriye ilgili depolama modülü üzerinden erişilir |
| Saha, takım ve afiş çizimi | `src/pitch/`, `src/team/`, `src/posters/` | Mevcut özellik ayrımı korunur |
| PWA worker kaynağı | `src/pwa/` | Derlenen `web/sw.js` elle değiştirilmez |
| HTML, CSS, ikon ve marka görselleri | `web/` | Yayın adresleri aynı kalır; ör. `/index.html`, `/icons/icon-512.png` |
| Ortak yayın dosyası listesi | `tools/runtime-files.cjs` | Build, export ve sunucu aynı listeyi kullanır |
| Android TWA | `android/` | Varsa App Links kaynağı `web/.well-known/assetlinks.json`; özel anahtarlar dışarıda |
| Birim ve tarayıcı testleri | `tests/` | Yeni görseller `test-results/reviews/` içine yazılır |
| Korunan referans kanıtlar | `evidence/` | Testler bunların üzerine yazmaz |

Yeni dosyayı işlevine göre mevcut klasöre ekleyin. Proje kökü yalnızca başlangıç belgesi, ajan talimatları, paket tanımları ve araçların kökte aradığı yapılandırmaları içerir. Yeni bir üst klasörü yalnızca ayrı bir sorumluluk gerektiğinde açın.

## Uyumluluk ve sınırlar

- `npm start` kaynakta `web/` dosyalarını sunar. Bağımsız PWA ZIP'inde `tools/serve.cjs`, arşiv kökündeki runtime dosyalarını sunar; iki paketin dosya yerleşimi farklıdır.
- HTTP origin, port, PWA kapsamı, runtime dosya adları ve modül kimlikleri değişmez. Bu düzen veri migrasyonu gerektirmez.
- `src/` modülleri taşınmadı. Bundle içindeki modül yolları ve bağımlılık sırası korunur.
- Eski belgeler ve kanıtlar yazıldıkları tarihe aittir. İçlerindeki test/yayın sayıları güncel kabul kanıtı sayılmaz.
- Kökten kaldırılan `app.bundle.js`, `sw.js` ve `SHA256SUMS.txt` yeniden üretilebilir dosyalardır. Paket iç manifesti ZIP içinde, paket SHA-256 özetleri `dist/SHA256SUMS.txt` içinde üretilir.
- Taşıma dökümü ve geri dönüş bilgisi [düzenleme raporundadır](REORGANIZATION-20261102.md).

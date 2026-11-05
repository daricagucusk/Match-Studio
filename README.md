# Match Studio

Kulüp, grup, sporcu, kadro ve canlı maç yönetimi için çevrimdışı çalışabilen web uygulaması. Afiş üretimi, şifreli yedekleme ve geri yükleme içerir. Paket sürümü: `2.6.8-f.19-rc.1` (F.19 aday sürüm; F.18 `6470d9e` temel alınmıştır).

Birleşik sürüm; mevcut veri korumalarını, F.16 Sezon Analitiğini ve Stitch altın/obsidyen tasarımını birleştirir. Erişim ve tarayıcıdan güncelleme: [bağlantı rehberi](docs/guides/ERISIM_VE_GUNCELLEME.md).

Bu klasör tek yerel çalışma kaynağıdır. Yerel test başarısı, canlı sürümün veya Google Play yayınının kabul edildiği anlamına gelmez.

## Başlatma

Node.js 24 ve Python 3.8+ kullanın. Komutları bu klasörde çalıştırın:

```sh
npm ci
npm run build
npm start
```

Uygulama adresi: **http://127.0.0.1:8911/index.html**. `web/index.html` dosyasını çift tıklamak yerine yerel sunucuyu kullanın.

Kayıtlar site adresine ve tarayıcı profiline bağlıdır. Mevcut kulüp verilerine erişmek için aynı adres, port ve profili kullanın; düzenli şifreli dış yedek alın.

## Klasörler

| Konum | Sorumluluk |
|---|---|
| [`src/`](src/) | Uygulama JavaScript modülleri; `domain`, `storage`, `app` ve ekranlar |
| [`web/`](web/) | Düzenlenen HTML, CSS, manifest, görseller ve simgeler |
| [`tools/`](tools/) | Derleme, güvenli sunucu, paketleme ve Play kontrol araçları |
| [`tests/`](tests/) | Node testleri ve `browser/` altındaki tarayıcı senaryoları |
| [`android/`](android/) | Android TWA metadata dosyası; özel imza anahtarları burada tutulmaz |
| [`docs/`](docs/README.md) | Kurulum, yayın, Play, AI ve tarihsel belgeler |
| [`context/`](context/README.md) | Proje bağlamı, kararlar ve kullanıcı kaynaklarının haritası |
| [`evidence/`](evidence/README.md) | Korunan eski paketler, incelemeler ve dağıtım kayıtları |
| `public/` | Derlemeden üretilen web yayın çıktısı |
| `dist/` | Üretilen PWA/kaynak ZIP'leri ve mağaza görselleri |
| `test-results/` | Yeni test ölçümleri, ekran görüntüleri ve hata izleri |

`web/app.bundle.js` ve `web/sw.js` otomatik üretilir. Uygulama kodunu `src/` içinde, worker kodunu `src/pwa/service-worker.js` içinde değiştirin. Ayrıntılı sorumluluklar ve veri akışı: [klasör mimarisi](docs/STRUCTURE.md).

## Doğrulama ve paketleme

| Komut | Sonuç |
|---|---|
| `npm test` | Node, depolama ve paket güvenliği testleri |
| `npm run test:browser` | Masaüstü, telefon ve katlanabilir ekran Chromium senaryoları |
| `npm run check` | Derleme + Node + tarayıcı kontrolleri |
| `npm run build:vercel` | Bütünlüğü doğrulanmış dosyaları `public/` içine çıkarır |
| `npm run package` | `dist/` altında PWA ve kaynak ZIP'leri, özetler ve `release.json` üretir |
| `npm run release` | Tüm kontrolleri çalıştırır, ardından paketi üretir |
| `npm run check:play` | Play hazırlığı ve kalan engelleri raporlar |
| `npm run check:play:strict` | Uzak uçları da doğrular; engel varsa başarısız olur |

Tarayıcı testlerinden önce bir kez `npx playwright install chromium` çalıştırın. `check:play` hazırlık modunda engeller varken de çıkış kodu 0 verebilir; rapordaki engelleri esas alın.

## Çalışma ve yayın kuralları

- Proje talimatları: [CLAUDE.md](CLAUDE.md), Codex giriş noktası: [AGENTS.md](AGENTS.md).
- Kaynak modüllerin sırası `tools/module-order.json`, ortak yayın dosyaları `tools/runtime-files.cjs` içindedir. Dosyaların disk üzerindeki `web/` konumu yayın URL'lerine eklenmez.
- Veritabanı, şifreli yedek, kalıcı silme ve kurtarma korumaları korunur. Farklı ürünler arasında otomatik veri eşitleme yoktur.
- Gerçek sporcu bilgilerini test ve mağaza görsellerine koymayın. Parola, keystore ve imza anahtarlarını depoya eklemeyin.
- Push, main'e birleştirme, Vercel dağıtımı ve Play yayını ayrıca yetkilendirilir. Gerçek cihaz ve Play Console kabulü yerel otomasyondan ayrıdır.

Yayın ve geri dönüş: [RELEASE.md](docs/RELEASE.md). Cihaz kabulü: [kontrol listesi](docs/guides/DEVICE_CHECKLIST.md). Play çalışmaları: [yayın planı](docs/play/GOOGLE_PLAY_RELEASE_PLAN.md). Önceki teslimler: [tarihsel belgeler](docs/README.md#tarihsel-kayıtlar).

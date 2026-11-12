# Takım derinliği kabul kontrolü

6 Kasım 2026. Durum: uygulama tamamlandı; masaüstü/telefon/Fold açık görünümlerinde yerel Chromium kabulü PASS. Bu belge fiziksel cihaz veya yayın kabulü yerine geçmez.

Kaynak: `Calisma/Birlesik-Tek-Surum`, dal `work/birlesik-te-surum-20261105`, başlangıç HEAD `d90b875`. Önceden mevcut Yeni Maç değişiklikleri ayrı kapsamdır ve korunur. Canlı kabul: `tools/qa-team-depth.cjs`, `http://127.0.0.1:8913`, Chromium; rapor `evidence/team-depth/results.json` (`2026-11-06T15:04:30.684Z`).

| Kullanıcı gereksinimi | Kanıt | Durum |
|---|---|---|
| Önce araştırma, sonra uzman ajan üretimi | `TEAM-DEPTH-DESIGN.md` kaynak/ölçü sözleşmesi; `src/app/views/team-analysis.js` uygulaması | Tamamlandı |
| Kullanılabilecek bağlam, skill, eklenti ve GitHub kaynakları | Tasarım belgesindeki kaynak tablosu ve kullanım sınırları | Tamamlandı |
| Bütün aktif diziliş görevleri tek ekranda | 4-3-3 için 11/11 görev satırı dört görünümde de görünür; diziliş listesi 3v3–11v11 seçeneklerini korur | PASS (canlı 4-3-3) |
| Ana görünümde aşağı kaydırma olmaması | Belge, ana içerik ve tablo yüksekliği görünür alana eşit; ölçüm tablosu aşağıda | PASS |
| Ek tercihlere kolay erişim | Sütun okları 1. tercihten 4. tercihe (masaüstü/laptop) ve 3. tercihe (Fold/telefon) gidip döndü; 8 adaylı stoper kuyruğu; 30 oyuncu havuzu 6 sayfa | PASS |
| Basit oyuncu girişi | "Deneme Oyuncu" araması → seçim → 9. tercihe ekleme; uzun ad kırpılmadan erişilebilir; boş takımda açıklama | PASS |
| Tercih ve taktik rol düzenleme | Taktik rol `central-defender` olarak değişti; öncelik 9→8 yükseldi; ikisi de yenilemeden sonra korundu | PASS |
| Bağımsız sağ/sol görevler | Sol stoper `ball-playing-defender`, sağ stoper `stopper`; ilk adaylar farklı kuyruklardan | PASS (canlı) |
| Kulüp verisi ayrımı ve kayıp koruması | Mevcut kulüp kapsamlı IndexedDB ve depolama testleri kullanılıyor; bu turda ayrı kulüple canlı senaryo koşulmadı | Kısmi |
| Klavye ve erişilebilir düzenleyici | Açılışta arama odağı; 12 Tab boyunca odak düzenleyicide; Escape kapatıyor ve odak açan göreve dönüyor; hücre/görev `aria-label` ve tam ad `title` | PASS (Chromium) |
| Regresyon ve derleme | `npm run build:vercel` PASS; `npm test` 115/115 PASS; Playwright koşucusu bu ortamda worker açamadığı için tarayıcı seti yeniden koşulamadı | Kısmi |

## Ölçümler

| Görünüm | Görünür alan | Satır | Görünür satır | Satır yüksekliği | Sütun (görev + tercih) | Belge | Ana içerik | Tablo | Alt gezinme |
|---|---|---|---|---|---|---|---|---|---|
| Masaüstü | 1440×1000 | 11 | 11 | 62 px | 4 (1+3) | 1000×1440 | 1000/1000 | 751/751 | 988 |
| Laptop | 1280×720 | 11 | 11 | 37 px | 4 (1+3) | 720×1280 | 720/720 | 471/471 | 708 |
| Fold açık | 840×980 | 11 | 11 | 60 px | 3 (1+2) | 980×840 | 980/980 | 731/731 | 968 |
| Telefon | 360×780 | 11 | 11 | 45 px | 3 (1+2) | 780×360 | 780/780 | 559/559 | 706 |

Belge yüksekliği görünür alanı aşmıyor, yatay taşma yok; `main` ve `.depth-matrix` kaydırma üretmiyor. Satır metni 14 px (masaüstü/Fold açık), 12 px (1280×720 laptop), 13 px (telefon); dikey metin kırpılması dört görünümde 0. 1280×720'de 37 px satır yüksekliği tasarım hedefi olan 40–48 px'in altındadır; kısa ekran koşulunda 11 satırı kaydırmasız tutmak için bilinçli istisnadır ve metin iki satıra kadar kırpılmadan sığar. Telefon görünümünde üst bar ve mobil kulüp seçici gizlenerek 11 satıra yer açılıyor; 1023 px altında yerel durum/bağlantı göstergesi gizleniyor.

## Etkileşim kabulü

- Sütun okları: masaüstü/laptopta `1. tercih` → `4. tercih` → `1. tercih`; Fold/telefonda `1. tercih` → `3. tercih` → `1. tercih`. Satır sayısı ve kaydırmasızlık her adımda korundu.
- Düzenleyici: görev satırına dokununca modal açılıyor; ilk sayfada 5 aday; sayfalama `2 / N`; taktik rol ve arama aynı ekranda.
- Kalıcılık: seçim, öncelik ve taktik rol sayfa yenilendikten sonra aynı; arama sıfırlanıyor, veri korunuyor.
- Boş durum: oyuncusuz U12 grubunda "Bu takımda aktif oyuncu yok" açıklaması gösteriliyor.
- Odak: düzenleyici açılışında arama; Tab odak tuzağı; Escape ile kapanış ve açan göreve dönüş.
- Sayfa hatası ve konsol hatası: dört görünümde 0.

## Sınırlar

- Playwright standart koşucusu (`npx playwright test` / `node node_modules/@playwright/test/cli.js test`) bu oturumda testleri başlatmadan asılı kalıyor (`--list` çalışıyor). Bu nedenle canlı kabul doğrudan Chromium kullanan `tools/qa-team-depth.cjs` ile yapıldı; tarayıcı setinin tamamı (207 geçti / 12 atlandı tabanı) bu değişikliklerden sonra yeniden koşulamadı.
- Fiziksel telefon/tablet, zoom, ekran okuyucu ve yayın kabulü yapılmadı.
- Sonlu ekranda sınırsız tam oyuncu adının aynı anda görünmesi vaat edilmez; ek tercihler açık etiketli oklarla gezilir.
- Kulüp ayrımı canlı senaryoyla yeniden üretilmedi; mevcut kulüp kapsamlı depolama ve geri yükleme testlerine dayanıyor.

## Kanıt dosyaları

- `evidence/team-depth/results.json`: dört görünümün ölçüm ve etkileşim sonuçları.
- `evidence/team-depth/{desktop,laptop,fold-open,phone}-{overview,editor}.png`: canlı ekran görüntüleri.
- `tools/qa-team-depth.cjs`: tekrarlanabilir Chromium kabul betiği (`MATCHSTUDIO_QA_URL`, `MATCHSTUDIO_QA_OUT`).

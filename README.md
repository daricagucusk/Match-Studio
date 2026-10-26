# Match Studio — Kanonik PWA ve Google Play Üretim Hattı

**Aktif ürün:** Match Studio (v2.6.8-f.13 kod hattı)  
**Kanonik depo:** `daricagucusk/Match-Studio` / `main`  
**Canlı HTTPS:** https://match-studio-telefon.vercel.app  
**Son bağımsız doğrulanmış production temel commit:** `4cbf8f899cc1466fe1621d42900fa959357d985f` (26.10.2026).  
**Bu depo dalı:** Play Store adayı. Play onayı ve AAB yüklemesi henüz yapılmadı.

> Geçmiş README'deki F.11 ve "Vercel F.3" ibareleri tarihsel kaldı; güncel production sürümünü yansıtmıyordu. Bu belge o eski ifadelerin yerine geçer. Release kararı için GitHub main SHA, CI ve Vercel deploy SHA her seferinde yeniden doğrulanmalıdır.

## Özellikler

Yerel/çevrimdışı odaklı kulüp, grup, sporcu ve maç yönetimi; kadro hazırlama, sahada yerleşim, canlı maç saati/olayları, istatistikler, yayınlanabilir afiş/PNG, şifreli dışa aktarım/geri yükleme ve kulüp bazlı IndexedDB ayrımı. Kayıtların web origin ve tarayıcı profiline bağlı olması sebebiyle düzenli şifreli dış yedek gerekir.

Kulüp ve sporcu verileri farklı ürünlerle/paylaşımlarla otomatik eşitlenmez. Çocukların isim, fotoğraf ve özel sporcu bilgilerini mağaza görsellerinde göstermeyin.

## Hızlı çalışma

Node.js 22+ ve Python 3 gereklidir.

```sh
npm ci
npm run build
npm start
```

`http://127.0.0.1:8911/index.html` üzerinde açılır.

## Üretim ve test

```sh
npm test
npx playwright install chromium
npm run test:browser
npm run release
npm run build:vercel
npm run check:play
npm run check:play:strict
```

`npm run release`: Node + Chromium testleri, üretim paketi ve bütünlük doğrulaması. `npm run build:vercel`: yalnız doğrulanmış PWA runtime dosyalarını `public/` dizinine hazırlar. `check:play`: hazırlık durumunu bildirir, engeller varken bile çıkış kodu 0 olabilir. `check:play:strict`: gerçek gizlilik politikası, sertifika/assetlinks, Play hesap ve ağ kapıları sağlanmadıkça NO-GO.

## Android / Google Play

Android dağıtım stratejisi `android/twa-manifest.json` ve Bubblewrap üzerinden Trusted Web Activity'dir. Mevcut PWA işletim modeli korunur. Google Play için Android 16 **target API 36**, imzalı AAB, gerçek Play App Signing SHA-256 ile `/.well-known/assetlinks.json`, kamuya açık gizlilik politikası ve doğru Data Safety beyanı zorunludur.

**Güvenlik:** `.jks`, `.keystore`, parolalar ve Play Console hesap bilgileri GitHub'a commit edilmez. Geçici/demo sertifikayla Play/TWA doğrulaması tamamlandı denmez.

Play hazırlığı: `docs/GOOGLE_PLAY_RELEASE_PLAN.md`, `docs/PLAY_STORE_LISTING_TR.md`, `docs/PLAY_STORE_PRIVACY_DRAFT_TR.md`. Yayın takibi: https://github.com/daricagucusk/Match-Studio/issues/24

## Kalıcı silme ve kurtarma

Birleşik yayın adayında oyuncunun kalıcı silinmesi, eski kulüp kurtarma anlık görüntüsünü iptal etmeyi ve silinmiş oyuncu kimliklerini aynı tarayıcı profilindeki ayrı recovery veritabanında saklamayı içerir. Eski şifreli yedekle silinmiş oyuncu geri yüklenmesi reddedilir. **Bu davranış yayın adayındadır, canlıya geçmiş sayılmamalıdır**; gerçek cihaz testleri ve CI kabulü gerekir. Haricen indirilen yedek dosyalar cihazlardan uzaktan silinemez.

## Yayın politikası

1. Kanonik `main`, mevcut Codex Cloud görevi ve canlı Vercel sürümünü koru.
2. Yeni düzeltmeleri izole PR'da geliştir; CI, diff ve gerçek cihaz kabulünden önce main'e birleştirme.
3. Eski #17 / #19 ve diğer PR'ları güncel `main` üzerinde körlemesine merge etme.
4. Gerçek Play Console hesabı, target API, AAB ve gerekli kapalı test kanıtı olmadan 'Play Store'a yayınlandı' deme.
5. Geri dönüş ve test yönergeleri: `docs/RELEASE.md`, `docs/DEVICE_CHECKLIST.md`; yayın engelleri için Issue #24.

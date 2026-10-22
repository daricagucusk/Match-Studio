# Match Studio V2.6.8-F.13

Türkçe, yerel veri kullanan futbol kulübü PWA'sı. V2.6.8-F.1 R1 telefon paketinden geri kazanılmış geliştirme projesi.

## Çalıştırma

Node.js 22+ ve Python 3 kullanın. Python paket doğrulama testleri ve ZIP üretiminde gereklidir.

```sh
npm ci
npm run build
npm start
```

Adres: http://localhost:8911/index.html. Sunucu yalnızca 127.0.0.1 dinler.

## Doğrulama

```sh
npx playwright install chromium
npm run release
```

Linux'ta eksik tarayıcı sistem bağımlılıkları varsa `npx playwright install --with-deps chromium` kullanın.

- `npm test`: Node test runner + fake-indexeddb; kulüp ayrımı, atomiklik, şifreli yedek, kurtarma ve canlı maç.
- `npm run test:browser`: Chromium masaüstü, 360×780 telefon ve 840×980 katlanabilir ekran emülasyonu; gerçek IndexedDB, PWA, çoklu sekme ve PNG indirme.
- `npm run release`: tüm derleme, Node ve tarayıcı testlerini çalıştırır; başarılıysa ZIP üretir ve PWA arşivini otomatik doğrular.
- `npm run package`: PWA ZIP'i, geliştirme kaynak ZIP'i ve SHA256SUMS.txt üretir. Testleri kendisi çalıştırmaz; tam yayın kontrolü için `npm run release` kullanın.

## Kaynak yapısı

`src/` modülleri paket içinde kullanılan CommonJS tarzı exports/require sınırlarını korur. `tools/build.cjs`, module-order.json içindeki uygulama modüllerini özgün yükleyiciyle birleştirir; ardından service worker için içerik tabanlı sürüm ve dosya bütünlüğü manifesti üretir. `src/pwa/service-worker.js` ayrı service worker kaynağıdır ve uygulama modül listesine dahil edilmez.

Kaynakları düzenleyin; app.bundle.js ve sw.js derleme çıktısıdır. Paket adları ve önbellek sürümü package.json sürümünden türetilir. Dist klasöründeki SHA256SUMS.txt ZIP özetlerini, release.json ise arşiv doğrulama sonucunu içerir.

Mevcut HTML/CSS korunmuştur. baseline/ içinde özgün paket ve bundle karşılaştırma amacıyla saklanır; dağıtılan PWA'ya dahil edilmez. Gerçek sporcu kaydı eklenmez.

- [Doğrulama raporu](docs/VALIDATION.md)
- [Dağıtım ve geri dönüş](docs/RELEASE.md)
- [Gerçek cihaz kontrol listesi](docs/DEVICE_CHECKLIST.md)

Veriler aynı tarayıcı profili ve origin'e bağlıdır. İlk çevrimdışı kurulum için bağlantı gerekir; düzenli cihaz dışı şifreli yedek alın.

## Paket doğrulama ve CI

```sh
python3 tools/verify-release.py dist/MatchStudio_V268F13_PWA.zip
```

Doğrulayıcı ZIP'i çıkarmadan dosya yollarını, tekrarları, dosya özetlerini, service worker manifestini ve sürüm kimliğini denetler. Bu bir imza veya kaynak kimlik doğrulaması değildir.

GitHub Actions yapılandırması push/PR üzerinde aynı `npm run release` komutunu çalıştırır ve başarılı paketleri artifact olarak saklar; internet sitesine otomatik dağıtım yapmaz. Bu çalışma alanında GitHub üzerinde workflow çalıştırılmadı.

## GitHub üzerinden Vercel yayını

`npm run build:vercel` yalnızca doğrulanmış uygulama dosyalarını `public/` içine çıkarır. Vercel ayarları `vercel.json` içindedir; kaynak deposunun kökü doğrudan yayınlanmaz. Tarayıcı testleri de bu yayın klasörüne karşı çalışır. Mevcut Vercel projesi GitHub deposuna bağlandıktan sonra main değişiklikleri otomatik yayınlanır; Actions kontrolleri main'e birleştirmeden önce geçmelidir.

[İlk bağlantı, testler ve geri dönüş adımları](docs/GITHUB_VERCEL.md). Depo ve Vercel bağlantısı henüz tamamlanmadı; canlı adres halen F.3 olarak kayıtlıdır.

## F.13 GitHub eşitleme adayı (23 Ekim 2026)

F.12 (gerçek oyuncu katılımı) ve F.13 (asist düzeltme bütünlüğü) değişiklikleri bu dalda birlikte yer alır. GitHub Actions doğrulaması ve gerçek Z Fold 7 kabulü tamamlanmadan üretim dağıtımı yapılmamalıdır. `main` ve Vercel canlı dağıtımı bu dalın hazırlanmasıyla değişmez.

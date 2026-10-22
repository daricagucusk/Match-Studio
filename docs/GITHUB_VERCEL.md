# GitHub → mevcut Vercel projesi

Hedef depo: https://github.com/daricagucusk/Match-Studio (Private)
Mevcut uygulama: https://match-studio-telefon.vercel.app
Mevcut Vercel projesi: match-studio-telefon, daricagucusk-9093 kapsamı.

## İlk bağlantı

1. `daricagucusk/Match-Studio` deposu oluşturuldu. İlk kontrol sırasında Public olduğu görüldü. Kaynak yüklemesinden önce Settings → General → Danger Zone → Change repository visibility üzerinden Private seçilmelidir.
2. Telefonda mevcut uygulamadan şifreli yedek alın; indirdiğiniz dosyayı kontrol edin. Site verilerini temizlemeyin.
3. Vercel'de **mevcut** match-studio-telefon projesini açın. Settings → Git → Connect Git Repository bölümünden GitHub ve Match-Studio deposunu seçin. Yeni Vercel projesi oluşturmayın. Gerekirse GitHub'daki Vercel uygulamasına bu özel depo için erişim verin.
4. Production Branch: `main`. Root Directory: depo kökü (boş). Framework: Other. Node.js: 24.x. Dosyadaki ayarlarla çelişen eski panel geçersiz kılmalarını kaldırın: Install Command `npm ci --no-audit --no-fund`, Build Command `npm run build:vercel`, Output Directory `public`.
5. GitHub Actions'ta **Verify Match Studio release / verify** sonucunu kontrol edin. İlk main içeriği için tüm kontroller başarılı olduktan sonra Vercel'den üretim dağıtımını başlatın; panel bağlama sırasında otomatik dağıtım başlatırsa aynı commit'in test ve dağıtım sonuçlarını karşılaştırın.
6. Mevcut vercel.app alan adını değiştirmeyin. Yayın sonrası aynı adreste F.11'i kontrol edin. Uygulama güncelleme bildirimi gösteriyorsa açık işlemleri kaydedip güncellemeyi kabul edin.

Sohbetin Vercel bağlantısı 403 veriyor. Bu panel bağlantısını kendiliğinden yapamaz; ilk bağlantı için Vercel projesinin sahibi gerekir. GitHub oturumu mevcut olsa da bağlı entegrasyon yeni depo oluşturmayı reddetti. Parola veya erişim anahtarını sohbete göndermeyin.

## Sonraki güncellemeler

- Değişiklikleri ayrı dalda hazırlayın ve PR açın. Actions sonucu yeşil ve kullanıcı onayı alınmış olmadan main'e birleştirmeyin.
- Vercel Git bağlantısı kurulduktan sonra main'e alınan commit otomatik üretim dağıtımı başlatır; diğer dallar önizleme dağıtımı oluşturabilir.
- Vercel Git yayını ile GitHub Actions ayrı çalışır. Bu dosya tek başına test sonucuna göre yayını engellemez. Hesap planı destekliyorsa main dalında `verify` kontrolünü zorunlu kılan koruma kuralı tanımlayın. Desteklemiyorsa aynı kontrolü birleştirmeden önce uygulayın; zorunlu koruma kurulduğu iddia edilmemelidir.
- Yayın öncesi aynı commit için yerelde `npm run release` ve GitHub'da verify başarısı kontrol edilir. Vercel derlemesi `npm run build:vercel` ile aynı kaynakları kullanır. Bu, Node/Python ve Chromium kullanan tüm testleri Vercel derlemesinde tekrar çalıştırmaz.

## Yayın yapısı

`npm run build:vercel` önce uygulamayı ve service worker bütünlük manifestini üretir. `tools/export-static.cjs` manifestteki dosya özetlerini doğrular ve yalnızca izin verilen çalışma dosyalarını, sw.js ve robots.txt dosyasını public/ içine kopyalar. Önceki çıktıdan kalmış dosyalar kaldırılır. Kaynaklar, testler, belgeler, eski ZIP'ler, node_modules ve ortam dosyaları yayın klasörüne girmez.

vercel.json yalnızca public/ klasörünü sunar. HTML ve worker adresleri korunur, yeni dağıtımlarda dosyalar yeniden doğrulanır; tarayıcıdaki mevcut çevrimdışı uygulama ve kullanıcı tarafından kabul edilen güncelleme akışı sürer. Veri/yedek şeması değişmez.

## Kabul ve geri dönüş

- Aynı adresin HTTPS üzerinden F.11'i sunduğunu doğrulayın; app.bundle.js ve worker manifestinin yayınlanan kaynaklarla eşleştiğini kontrol edin.
- Telefonda mevcut kulübün açıldığını, sayfalarda taşma olmadığını, afiş PNG indirmesini ve hazır bildiriminden sonra çevrimdışı açılışı kontrol edin. Başka adrese taşınmadığı için kayıtlar aynı origin altında kalır.
- /src/main.js, /tests/, /docs/, /baseline/ ve /package.json sunucudan erişilememelidir. Bu dosyalar için gerçek 404 beklenir; HTML'e yönlendiren genel rewrite eklemeyin.
- Derleme hatasında önceki başarılı dağıtım kalır. Yayın sonrası sorun çıkarsa Vercel → Deployments üzerinden önceki başarılı dağıtıma geri dönün. Daha yeni çevrimdışı worker'ın geri dönüşü açık sekmelerde hemen uygulamayabileceğini unutmayın; eski sekmeleri kapatıp yeniden açın ve uygulamadaki güncelleme akışını kontrol edin. Site verilerini silmeyin.

## Mevcut durum

Yerel yayın hazırlığı tamamlanmıştır. GitHub deposu oluşturuldu; Private ayarı doğrulanması, kaynakların yüklenmesi ve mevcut Vercel projesinin bu depoya bağlanması beklenmektedir. Actions'ın GitHub üzerinde çalıştığı veya F.11'in canlıya çıktığı henüz doğrulanmamıştır.

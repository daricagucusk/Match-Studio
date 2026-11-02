# Match Studio — erişim ve güncelleme

Tek kaynak sürümü: **2.6.8-f.17**. Kaynak deposu `daricagucusk/Match-Studio`; yerel çalışma klasörü `Calisma/Birlesik-Aday`.

| İşlem | Bağlantı |
|---|---|
| Uygulamayı aç | https://match-studio-telefon.vercel.app |
| Kaynak kodunu aç | https://github.com/daricagucusk/Match-Studio |
| Tarayıcıdan kod düzenle | https://github.dev/daricagucusk/Match-Studio |
| Testleri ve indirilebilir paketleri gör | https://github.com/daricagucusk/Match-Studio/actions |
| Yayınları yönet | https://vercel.com/daricagucusk-9093/match-studio-telefon |

Kaynak deposu özeldir. Kaynak düzenleme ve yönetim bağlantıları yetkili GitHub/Vercel hesabıyla oturum açmayı gerektirir. Uygulama için aynı HTTPS adresini kullanın; yeni yayın adresi üretip kulüp kayıtlarını başka bir tarayıcı alanına taşımayın.

## Güncelleme akışı

1. GitHub'da depoyu açıp `.` tuşuna basın veya yukarıdaki tarayıcı editörünü açın.
2. Kod değişikliklerini yeni bir dalda kaydedin. Uygulama davranışı `src/`, HTML/CSS/görseller `web/` içindedir. Üretilen `public/`, `app.bundle.js` ve `sw.js` dosyalarını elle düzenlemeyin.
3. GitHub Actions içindeki **Verify Match Studio release** çalışmasını kontrol edin. Başarılı çalışma PWA ve kaynak ZIP'lerini indirilebilir artifact olarak üretir.
4. Başarılı testten sonra değişikliği `main` dalına birleştirin. Vercel Git bağlantısı yayını tetikler; bu, yayının başarılı olduğu anlamına gelmez. F.17'nin otomatik yayını commit yazarı/takım erişimi denetiminde **Blocked** oldu. Aynı test edilmiş commit yetkili Vercel bağlantısıyla ayrıca yayımlandı ve **Ready** olarak doğrulandı. Yeni güncellemelerde de Vercel durumunu kontrol edin; engel varsa yetkili proje hesabından test edilen commit'i yayımlayın. Erişim korumalarını kapatmayın. Canlı uygulamanın sürümünü ve kaynak commit'ini ayrıca doğrulayın.
5. Açık uygulamada güncelleme uyarısı geldiğinde devam eden maç işlemini tamamlayıp yenileyin. Her önemli güncellemeden önce Ayarlar'dan şifreli yedek alın.

## Bilgisayarlar ve telefonlar arasında veri

Bu bağlantılar uygulama ve kaynak koduna her yerden erişim sağlar. Kulüp kayıtları cihazın tarayıcı profilinde yerel tutulur; bulut veri eşitleme hizmeti eklenmemiştir. Başka cihaza geçerken uygulamanın şifreli yedek/dışa aktar ve geri yükle işlemlerini kullanın. Farklı kulübün dolu kayıtlarının üstüne yedek yüklenmesi veri koruma kontrolüyle engellenir.

`localhost`, `127.0.0.1`, farklı portlar, gizli pencere ve farklı tarayıcı profilleri ayrı veri alanlarıdır. Eski cihazdaki veriler kayboldu varsayılmadan önce aynı adres ve profil kontrol edilmelidir.

## Yerel çalışma

Node.js 24 ve Python 3 ile proje klasöründe `npm ci`, `npm run build`, `npm start` çalıştırılır. Adres: http://127.0.0.1:8911 . Masaüstündeki yerel başlatıcı bu klasördeki sürümü başlatır. ZIP paketi bağımsız olarak Node.js bulunan bir bilgisayarda çalışabilir; kaynak ZIP geliştirme içindir.

Google Play dağıtımı ayrı bir süreçtir: imzalı AAB, Play uygulama kaydı, imza parmak izi ve gerçek cihaz kabulü bu web yayınının yerine geçmez.

## 3 Kasım 2026 erişim kontrolü

- Kullanılacak kalıcı uygulama adresi: **https://match-studio-telefon.vercel.app/**. Uygulama bilgisayardaki Brave tarayıcısında F.17 olarak açıldı; Kontrol Merkezi ve Sezon Analitiği menüsü görüldü.
- GitHub Actions bağlantıları uygulamayı açmaz; test raporlarıdır. Depo özel olduğu için yetkisiz veya farklı hesapla açıldığında 404 görünebilir. Uygulamayı kullanmak için GitHub oturumu gerekmez.
- `main` üzerindeki F.17 kodu için başarılı test çalışması: https://github.com/daricagucusk/Match-Studio/actions/runs/41510271813 . Kalıcı ZIP paketleri: https://github.com/daricagucusk/Match-Studio/releases/tag/v2.6.8-f.17 .
- Canlı uygulamanın 26 dosya bütünlük kontrolü yeniden geçti; gizlilik ve robots adresleri 200, kontrol edilen 5 özel kaynak yolu 404 döndü.
- Bu kontrol yeni bir ürün sürümü oluşturmaz. F.17 uygulama kodu korunur; bu belge erişim ve yayın işlemini açıklığa kavuşturur.

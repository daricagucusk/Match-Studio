# Doğrulama raporu — V2.6.8-F.11

Tarih: 22 Ekim 2026. Ortam: Linux, Node.js 24.19.0, Playwright Chromium. Testler sentetik kulüp/oyuncularla çalıştırılır; gerçek sporcu bilgisi kullanılmaz.

## Otomatik kontroller

`npm run check`: derleme + 37 Node/IndexedDB/paket/yayın testi + 74 Chromium tarayıcı senaryosu. Güncelleme protokolü masaüstünde bir kez çalıştırılır; telefon ve katlanabilir projelerinde aynı protokol senaryosunun tekrarları bilerek atlanır (2 skip). Kopya maç taslağı uç senaryosu masaüstünde ayrıca çalışır; diğer iki ekranda tekrarı atlanır (toplam 4 skip).

| Alan | Doğrulanan davranış |
| --- | --- |
| Görsel dil ve metinler | Üç ekran boyutunda 6 senaryo: sekme/filtrelerin ortak seçili rengi, kulüp ve saha giriş yüzeyi, kulüp formu, 44px grup hedefi, afiş önizleme, Türkçe başlık ve şablon adı, yatay taşma; eski aktarım koşulu ve 12 karakter/7 gün yedek uyarıları. Telefon ekran görüntüleri reviews/update-08 içindedir. |
| GitHub/Vercel yayın çıktısı | Dört ek Node testi: yalnızca çalışma dosyalarının çıkarılması, eski çıktının temizlenmesi, değiştirilmiş dosya özetinin reddi ve önceki çıktının korunması, güvensiz/kaynak yolların reddi ve Vercel yayın ayarları. 74 tarayıcı senaryosu public/ çıktısı üzerinden çalışır. Uzak GitHub Actions ve Vercel yayını bağlantı bekler. |
| Modal odak yönetimi | Üç ekran boyutunda 12 senaryo: oyuncu penceresinde iki yönde Tab döngüsü, arka planın inert olması, Escape/Kapat ve kayıt sonrası odağın geri dönmesi; CSV devre dışı onay düğmesinin atlanması; saha numara/mevki/oyuncu pencerelerinde ilk odak ve yeniden çizilen saha menü düğmesine dönüş. |
| Çalışma alanı yoğunluğu | Üç ekran boyutunda 6 senaryo: ortak başlık yüksekliği, saha/arama/yayın hedefi konumları, yatay taşma olmaması, beş adımın en az 44px hedefleri, tarih/saat/stat ayrıntılarına erişim, saha görünümü değiştirme, gerçek PNG indirme ve maç bilgilerini koruyarak geri dönüş. Önce/sonra telefon ölçümleri reviews/update-06 içindedir. |
| Hızlı maç olayı | Üç ekran boyutunda 6 senaryo: kısayol erişimi, kaydırma sonrası erişim ve form odağı; gol/rakip golü/sarı-kırmızı kart; iptal edilen onayın kayıt yazmaması; not korunması ve geçersiz alanların temizlenmesi; yenilemede skor/olay kalıcılığı; oturum durumuna göre etkinlik ve telefon saat düğmeleriyle çakışmama. |
| İlk grup kurulumu | Yeni kulüp sonrası ilk ekrandan grup oluşturma; boş Oyuncular/Yeni Maç ve Arşiv başlangıcında form erişimi; grup kalıcılığı ve oyuncu/maç seçenekleri; oluşturma sırasında maç taslağının korunması; yinelenen adın reddi. Üç ekran boyutunda toplam 9 yeni senaryo; düğmenin alt menünün üstünde kalması ve yatay taşma kontrol edilir. |
| Canlı rapor yenileme | Kontrollü tarayıcı saatiyle çalışan/duraklayan/devre arası/tamamlanan maçta toplam ve oyuncu süreleri denetlenir. Oyuncu değişimi, katılım sayısı, form notu/seçimi/odak korunması, geciken sayaçta yazdırma, saat şüphesi uyarıları ve veritabanına sayaç yazısı olmaması üç ekran boyutunda doğrulanır. |
| Afiş müsabaka türü | Dört tür, eksik ve bilinmeyen tür; 4 şablon × 2 hedef × 2 boyut için gerçek Canvas çizim metinleri ve yerleşim kontrol edilir. Form → kayıt → önizleme → PNG indirme akışı hazırlık ve lig için üç ekran boyutunda doğrulanır. PNG imzası kontrol edilir; organizasyon adı korunur. |
| Maç taslağı | 20 form alanı bölüm değişimi ve yenilemede korunur; kaydetmeden veritabanında maç oluşmaz. Kaydedilmiş maç düzenlemeleri asıl kaydı değiştirmez. Kulüp ayrımı, silme onayı/iptali, kopya taslak yenilemesi ve bellek yedeği doğrulanır. |
| Kaynak ve paket | 49 özgün modül geri kazanımı, 3 yeni uygulama modülü; sözdizimi ve modül bağımlılıkları derlemede denetlenir. İçerik tabanlı service worker sürümü kullanılır. |
| Kulüp ayrımı | Bekleyen bağlantı ve sıraya alınmış yazma kulüp değişirse iptal edilir; diğer kulüpte kayıt oluşmaz. |
| Veritabanı uyumu | Sürüm 1 veritabanı sürüm 2'ye mevcut oyuncular korunarak açılır. Mevcut v2 ve yedek v1/v2/v3 korunur. |
| Atomiklik | İptal edilen çoklu store işlemi kayıtları korur. Maç silme bağlantılı oturum, olay, kadro, saha ve afişi birlikte temizler. Bağlı grup silinmez. Eski aktarım boş hedef gerektirir. |
| Şifreli yedek | AES-GCM dışa/içe aktarma; görsel Blob baytları ve canlı geçmiş eşleşir. Yanlış parola, değiştirilmiş şifreli veri, bozuk/eksik JSON ve iptal mevcut verileri değiştirmez. |
| Kurtarma | Önceki durum geri alınır. Kurtarma depolaması başarısızsa içe aktarma mevcut oyuncuları korur. Dosya çözülürken kulüp değişirse içe aktarma iptal edilir. |
| İşlem tekrarları | Süre/gerekçe, düzeltme içindeki oyuncu/tür/asist/not ve genel olay türü/içeriği/devresi/zamanı değişirse aynı anahtar reddedilir; olay sayısı ve revizyon korunur. Sonradan gol iptal edilse de eski asist isteğinin gerçek tekrarı kabul edilir. |
| Maç simülasyonu | Hızlandırılmış 90 dakika: 105 olay, 90 tekrar istek, 5 dakika duraklama, 15 dakika devre arası, 4 oyuncu değişimi ve 8 bağlantı yeniden açılışı. Skor 2–2, oyuncu süreleri 75/75/30 dakika; sıra/revizyon ve kayıt bütünlüğü doğru. |
| Canlı maç | Başlatma, duraklatma, devam, devre geçişi ve bitirme; arka plan süresinin duvar saatinden hesabı; şüpheli cihaz saati ve gerekçeli düzeltme. |
| Eşzamanlı olaylar | Aynı işlem anahtarı mükerrer olay oluşturmaz; eski revizyon reddedilir. Gol, kart, oyuncu değişikliği, olay sırası ve dakika hesabı doğrulanır. |
| Kullanıcı akışı | Kulüp/grup, dört oyuncu, fotoğraf, 3v3 maç, kadro, saha, canlı maç, değişiklik, sayfa yenileme ve PNG indirme. İkinci sekme olay değişikliğini alır. Masaüstünde sürükleyerek saha oyuncusu değişimi kontrol edilir. |
| Telefon yerleşimi | 1440×1000, 360×780 ve 840×980; temel sayfalarda yatay taşma ve işlenmemiş JavaScript hatası yok. |
| Yedek dosyası seçimi | Gerçek dosya seçici düğmesiyle aynı şifreli dosya iki kez seçilip geri yüklenir; üç ekran boyutunda uygulanır. |
| Çevrimdışı | Hazır durumundan sonra ağ kesilerek yenileme, kayıtların açılışı ve cihaz test sayfasına erişim. |
| Güncelleme | Bozuk dağıtım reddedilir; eski dosyalar sunulmaya devam eder. Yeni sürüm kabulü bekler; diğer sekmenin işlem kilidi güncellemeyi engeller. Kabul sonrası iki sekme yenilenir ve kulüp verisi korunur. |

## Paket doğrulaması

`npm run release` önce tüm testleri, ardından paket üretimi ve arşiv doğrulayıcıyı çalıştırır. ZIP içindeki SHA256SUMS.txt, service worker manifestindeki özetler ve içerik tabanlı sürüm kimliği otomatik kontrol edilir. Doğrulayıcı testleri önceki F.2 teslimatını kabul eder; bozuk, eksik, fazladan, yinelenen dosyaları, güvensiz yolları ve tutarsız worker manifestini reddeder. PWA paketinde kaynak, test bağımlılıkları veya başlangıç arşivi bulunmaz. Dist klasöründe ZIP özetleri SHA256SUMS.txt ve release.json içinde sunulur. Aynı kaynaklarla tekrar derleme/paketleme aynı çıktıları üretir.

## Gerçek cihazda kalan kabul

Gerçek Samsung Z Fold 7 donanımına erişim olmadığı için Android PWA kurulumu, ekran menteşesi/klavye davranışı, dokunma ergonomisi, paylaşım uygulamaları ve en az 90 dakikalık stres denemesi tamamlanmadı. [Cihaz kontrol listesi](DEVICE_CHECKLIST.md) bu kabul için hazırlanmıştır.

Bu rapor performans veya tam güvenlik sertifikası değildir; yukarıdaki senaryoların kapsamını kaydeder. Mevcut canlı adres: https://match-studio-telefon.vercel.app/ (F.3). F.11 yayını Vercel ekip erişim hatası 403 nedeniyle engellendi; F.11 henüz canlı değildir. Son başarılı dağıtım deployments/phone.json, bekleyen güncellemeler deployments/update-01.json, deployments/update-02.json, deployments/update-03.json, deployments/update-04.json, deployments/update-05.json, deployments/update-06.json deployments/update-07.json ve deployments/update-08.json içinde tutulur. GitHub Actions yapılandırması hazırlanmıştır; uzak GitHub üzerinde çalıştırılmadı.

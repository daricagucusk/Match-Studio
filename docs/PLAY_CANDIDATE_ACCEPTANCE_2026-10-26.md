# Birleşik Play adayı — doğrulama ve kalan kapılar

Bu belge üretim veya Play onayı değildir. Temel main `4cbf8f899cc1466fe1621d42900fa959357d985f`, aday başlangıcı `8d2b341c65953234515243f54b8727262cf45524`, sürüm `2.6.8-f.13`; çalışma yalnız PR #25 yayın adayı dalındadır. Önceki yerel gizlilik dalındaki commit edilmemiş çalışma korunmuştur.

## Kesinleşen kullanıcı kararları

- Android paket kimliği: `com.matchdaystudio.app`. Play Console uygunluğu ve uygulama kaydı henüz doğrulanmadı.
- Uygulama adı: Match Studio; kamuya açık geliştirici markası: Matchday Studio.
- Bildirilen yasal işletmeci/veri sorumlusu: Mehmet Yılmaz; destek: clupulse@gmail.com.
- İlk yayın ücretsiz, reklamsız ve Billing olmadan hazırlanır. Tek seferlik Pro sonraki sürümdür; fiyat/entitlement tamamlanmış sayılmaz.
- Geliştirici kimlik belgeleri incelemede. Hesap, uygulama kaydı, test uygunluğu ve yayın onayı tamamlanmış kabul edilmez.

## Veri koruma değişikliği

Mevcut kulüp IndexedDB şeması ve JSON v1/v2/v3 biçimleri korunur. Kurtarma DB v2 içindeki mevcut `erasedPlayers` kayıtlarına `pending` eklenir; yeni store veya kimlik biçimi yoktur. Önce silme kaydı ve önceki kurtarma noktasının iptali tek kurtarma işlemiyle yazılır; sonra kulübün kayıtları tek atomik işlemde temizlenir. Kesinti sonrası açılış, eski v2 silme kayıtları dahil, temizliği yeniden uygular. Silinen oyuncu değişiklik olayında çıkış/giriş tarafı anonim işaretle korunur; kalan oyuncunun dakika hesabı ve takım skoru bozulmaz.

Eski yedek kontrolü çözme sonrasında ve kulüp kilidi içinde yazmadan önce tekrarlanır. Geçerli temiz yedekler ve sonradan oluşturulan temiz kurtarma noktaları çalışmaya devam eder. Silme kayıtları aynı kulüp ve tarayıcı profiline özeldir; dışarıdaki dosyaları silemez, başka cihaz/profilde veya değiştirilmiş kimliklerle geri getirmeyi engellemez. Eski sürüme dönmek bu korumaları zayıflatabilir; gerçek verilerle geriye sürüm testi yapılmamalıdır.

## Android / imzalama sırası

1. CI, SDK 36 ile imzasız AAB üretir. `tools/inspect-android-aab.py` gerçek manifesti paket, sürüm, compile/target/min SDK ve Billing açısından denetler. Rapor ve AAB aynı CI artifact'ında bulunur. İmzasız AAB Play'e yüklenebilir sürüm değildir.
2. Play Console uygulama kaydı ve paket uygunluğu hesap sahibi tarafından doğrulanır. Kayıt kimliği `com.matchdaystudio.app` ile birebir aynı olmalıdır.
3. Upload key güvenli yerel ortamda, repo dışında tutulur. AAB aynı aday kaynaktan imzalanır; parola komut satırına, loglara veya GitHub'a konmaz. Play App Signing kurulumu ve upload certificate ayrı doğrulanır.
4. Java JDK ve doğrulanmış bundletool ile repo dışındaki imzalı dosyayı incele:
   `python3 tools/inspect-android-aab.py --aab /secure/matchstudio.aab --bundletool /tools/bundletool.jar --mode signed --report /secure/aab-report.json`
   Bu komut anahtar okumaz; bundle doğrulaması ve JAR imzasını kontrol eder. Rapor, AAB SHA-256 değerine bağlıdır; Play onayı değildir.
5. Play Console **App signing certificate** SHA-256 değeri ile `tools/generate-play-assetlinks.cjs` çıktısı hazırlanır. Upload key parmak izi yerine Play sertifikası kullanılmalıdır. Placeholder veya sentetik test parmak izi yayımlanmaz.
6. Üretim değişikliği ayrıca yetkilendirildiğinde assetlinks JSON ve onaylı gizlilik HTML'i yayımlanır. HTTP 200, doğru içerik türü, yönlendirme olmaması, tam paket/sertifika/relation eşleşmesi ve uygulama içi bağlantı denetlenir.
7. `MATCHSTUDIO_SIGNED_AAB_REPORT=/secure/aab-report.json PLAY_APP_SIGNING_SHA256=... npm run check:play:strict` çalıştırılır. Hazırlık komutunun sıfır çıkış kodu yayın izni değildir; BLOCKED satırları değerlendirilir.

## Galaxy Z Fold7 fiziksel kabul prosedürü

Yalnız sentetik iki kulüp, aynı adlı U14 grupları ve örnek oyuncular kullanın. Başlamadan aday commit, AAB SHA-256, paket/versionCode, Android/One UI ve Chrome sürümü, test tarihi ve testçi kaydedilsin. Önceki sürümün fiziksel kabulü bu adaya aktarılmaz.

| Adım | Beklenen sonuç | Kanıt |
|---|---|---|
| Kapalı dikey/yatay, açık dikey/yatay; oyuncu ve maç formu doldururken katla/aç | Alanlar ve seçimler korunur, klavye kayıt düğmesini engellemez, yatay taşma/erişilemez menü yok | Dört görünüm ekran görüntüsü ve sonuç |
| Tek elle kulüp seç, oyuncu ekle, maç/kadro oluştur, canlı gol/asist/düzeltme/değişiklik işle | Yanlışlıkla çift kayıt yok; geri tuşu ve onay/iptal anlaşılır; skor ve kalan oyuncu dakikaları doğru | İşlem adımları ve beklenen/gerçek değerler |
| TalkBack ve büyük yazı ile gezin | Alan etiketleri ve düğmeler okunur, odak görünür, kritik işlemler erişilebilir | Sonuç ve sorun varsa adım |
| A'da CSV/XLSX önizle; B'ye ve A'ya geç; yavaş dosya okuma sırasında kulüp değiştir/geri yükle | Eski önizleme geçersiz; her iki kulüpte kayıt sayıları aynı kalır | Önce/sonra sayımlar |
| Şifreli yedek al; yanlış parola, iptal ve bozuk dosya dene; temiz yedeği geri yükle/geri al | Hatalı işlemler kayıt değiştirmez; temiz yedek ve kurtarma eksiksiz | Sayım ve sentetik fotoğraf/kadro kontrolü |
| Oyuncuyu kalıcı sil; yeniden aç; eski yedeği dene | Kimlik/fotoğraf geri gelmez; eski kurtarma noktası yok; diğer kulüp ve takım skoru korunur | Önce/sonra ve ret mesajı |
| Test ortamında silme sırasında uygulamayı kapatıp aç | Temizlik tamamlanır; hata olursa başarı bildirimi verilmez | Yeniden açılış sonucu |
| İlk çevrimiçi açılıştan sonra uçak modu ve yeniden açılış | Kayıt, canlı işlemler, yerel afiş ve yedek mevcut yerel kaynaklarla çalışır | Çevrimdışı sonuç |
| Play test kanalından yüklenen TWA'yı aç, Android geri tuşu ve dosya paylaşımı dene | Doğrulanmış origin tam ekran; beklenmedik tarayıcı çubuğu/farklı origin yok; indirilen sentetik dosya açılabilir | TWA ve dosya kanıtı |

Her satır için PASS/FAIL/ÇALIŞTIRILMADI yazılır. Bir P0 veri kaybı/izolasyon hatası, başarısız imza/DAL veya eksik zorunlu Play kapısı yayını durdurur.

## Gizlilik ve mağaza beyanları

İsim/e-posta bildirimi gizlilik politikasının hukuki onayı değildir. Vercel erişim günlükleri ve saklama, son Android bağımlılıkları, gerçek ağ davranışı ve Data Safety yanıtları birlikte incelenmelidir. “Hiç veri toplanmaz”, “tam güvenlik” veya “Play onaylı” gibi doğrulanmamış beyanlar kullanılmaz. Görseller gerçek uygulamada yalnız sentetik kayıtlarla üretilir; Play boyut kontrolü ve görsel inceleme, fiziksel cihaz kabulünün yerine geçmez.

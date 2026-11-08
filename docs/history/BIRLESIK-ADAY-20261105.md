# Birleşik aday — 5 Kasım 2026

Bu çalışma ağacı, F.18 web sürümü `6470d9e` temelinden ve ayrı F.19 geliştirme ağacının kaynak değişikliklerinden oluşturuldu. Yedek önizlemesinde mevcut ve yedekteki kayıt sayıları gösterilir; kulüp dosya okunurken değişirse önizleme reddedilir. Başka kulüp ve eski yedeklerin boş hedefe aktarımı korunur; dolu hedefin üzerine farklı veya kimliği eksik yedek geri yüklenemez.

## Yerel kanıt

- Bu çalışma ağacında `npm test`: 115 başarılı, 0 başarısız.
- Bu çalışma ağacında `npm run build:vercel`: başarılı, 60 modül ve 30 statik dosya.
- Bu çalışma ağacında tam Playwright koşusu (8970 portu, 3 işçi, tekrar kapalı): 195 başarılı, 12 atlandı, 0 başarısız. Bu sonuç, fiziksel cihaz kabulü veya canlı dağıtım değildir.
- Yedek ve aktarım tarayıcı testleri aynı aday kopyasında masaüstü, telefon ve Fold profillerinde 6/6 başarılıdır.

## Açık noktalar

- Atlanan 12 sonuç altı senaryonun diğer ekran profillerindeki koşullu tekrarlarıdır: taslak kopyalama, mağaza grafik ve ekran görüntüleri, güncelleme protokolü ve Fold iç/dış ekran ölçümleri ilgili seçilmiş profilde çalışır.
- 5 Kasım'da bağlanan Galaxy Z Fold7 kapalı dış ekranında Android Chrome ile ayrı `127.0.0.1:8975` kökenindeki F.19 başlangıç ekranı görüntülendi. Bu kontrol yalnızca açılış ve görünür ilk ekran içindir; dokunmatik maç akışları, Fold iç ekranı, çevrimdışı kayıt ve uzun maç kabulü yapılmamıştır. APK/AAB veya Play kabulü değildir.
- Aynı cihazın dış ekranında ayrı test kökeninde sentetik kulüp, grup, oyuncular ve maç kurularak canlı saha ve saat açıldı. Ölçülen CSS alanı 351×679, belge genişliği 351 piksel; sekiz hızlı işlem bulundu. Gol/asist denemesinde bekleyen PWA güncelleme bildirimi Gol düğmesinin üzerine geldi ve dokunmayı engelledi. Sonraki güncelleme tıklamasındaki otomasyon onay penceresini ayrıca kabul edecek şekilde kurulmamıştı; dolayısıyla bildirimin kalması güncellemenin yeniden başarısız olduğuna kanıt değildir. Bu ilk denemede gol/asist ve yenileme sonrası kalıcılık doğrulanamadı.
- Çakışmaya karşı `Daha sonra` düğmesi eklendi; bekleyen güncelleme iptal edilmeden bildirim o sayfa oturumunda kaldırılır, sayfa yenilenince yeniden sunulur. Güncelleme protokolü tarayıcı testi ve 115 birim testi başarılıdır. Fiziksel cihazdaki sonraki dar kapsamlı sonuç aşağıdadır.
- Yeni kodla ayrı `127.0.0.1:8976` test kökeninde gerçek Fold7 üzerinde sentetik maçta sahadan golcü ve asist seçildi; skor 1:0 oldu ve sayfa yenilemeden sonra korundu. Test otomasyonu Android Chrome üzerinden yürütüldü. Kanıt: `../../../Incelemeler/F19-fold7-gol-asist-20261105.png`. Test anındaki katlanma durumu kaydedilmediğinden belirli bir ekrana atfedilemez. Bu testte bekleyen güncelleme yoktu.
- Ayrı `127.0.0.1:8977` test kökeninde gerçek Fold7 üzerinde bekleyen servis çalışanı güncellemesi oluşturuldu. `Daha sonra` ile bildirim kapandı, güncellemenin beklemeye devam ettiği doğrulandı ve sentetik maçta Gol düğmesiyle skor 1:0 oldu. Test Android Chrome üzerinde otomasyonla yürütüldü. Kanıt: `../../../Incelemeler/F19-fold7-guncelleme-ertele-gol-20261105.png`. Başlangıçta cihaz kapalı, son kontrolde açık raporlandı; test anındaki ekran durumu ayrıca kaydedilmediğinden belirli bir ekrana atfedilemez. Bu dar senaryo saha koşulları veya uzun maç kabulü yerine geçmez.
- Güncelleme düzeltmesinden sonraki ilk tam tarayıcı koşusu 194 başarılı, 12 atlanan, 1 başarısız sonuçlandı: Fold not paneli testinde asenkron tıklama işlemi tamamlanmadan durum okunuyordu. Test, davranışı Playwright'ın bekleyen kontrolüyle doğrulayacak şekilde düzeltildi; ilgili senaryo üç tekrarda geçti. Ardından tam koşu (`--workers=2 --retries=0`) 195 başarılı, 12 atlanan, 0 başarısız sonuçlandı.
- Gerçek kulüp kayıtlarını, geri dönüş kopyalarını, eski çalışma ağaçlarını ve Play imza materyallerini koruyun.
- GitHub main, Vercel ve Play sürümleri bu yerel adayla kendiliğinden güncellenmez.
- Önceki dallar ve arşivler yalnızca içeriğin korunduğu doğrulanarak düzenlenmelidir.

## 6 Kasım 2026 takip durumu

- **Canlı maç "Diğer" paneli kök-sorun düzeltmesi:** Panel, `position:fixed` kaplama olarak açıldığında üst konsol düğmelerini (Saati duraklat, Devreyi bitir, Su molası) dokunma akışında kesiyordu; bu, "diğer araçlar yerinde kalır" UX ilkesini bozuyordu. Panel akış içi panele alındı, `.main`/`.page` taşmaları `auto` yapıldı ve panelin açık durumu oturum boyunca `state.liveDetailsOpen` ile korundu. Kapalı panelde hiçbir düzen değişmedi.
- **CSV aktarımı hataya kapalı davranış:** Bozuk/eksik sütunlu CSV negatif yollarla reddedilir, 5 MB üzeri dosya okunmadan reddedilir, önizleme başarısız olunca giriş alanı sıfırlanır ve kulüp geçişinde bekleyen CSV durumu temizlenir.
- **Yeniden üretilebilir release testleri:** `tests/release.test.cjs` artık `evidence/baseline` eski ZIP'lerinden bağımsız; sentetik fixture üretir. İki eski ZIP sürüm denetiminden çıkarıldı; `app.bundle.js` + `provenance.json` tarihsel kanıt olarak korundu. Not: Bu adım, açık PR #30'un ("eski PWA arşivlerini temizle") hedefiydi; push/kapatma kullanıcı yetkisindedir.
- **VS Code yapılandırması:** `.vscode/extensions.json` sürüm denetimine girer; `tasks.json` mutlak `C:\Users\aearo` yolu içerdiğinden sürüm denetimi dışında tutulur.
- **Güvenlik:** Depo tarafı (çalışma ağacı, `web/`/`public/` çıktıları, Git geçmişi) düz metin anahtar içermez; yerel `NVIDIA APİLER.txt` ve `openroutterapikey.txt` dosyaları `D:\beyin2\.gitignore` kurallarıyla sürüm dışı. OpenRouter anahtar döndürme (revoke + yeni anahtarın GitHub Secret olarak tanımlanması) kullanıcı eylemidir ve tamamlanmadan güvenlik satırı "çözülmüş" sayılmaz.
- **Test kanıtı (bu takip gününde):** Birim testler `npm test` 115/115; etki alanı doğrulaması (etkilenen 6 spec × 3 profil) 48/48; nihai tam regresyon koşusu (build:vercel + 3 profil, tek işçi): 219 toplam — 207 başarılı, 12 atlanmış (bilinen profil gardları: taslak kopyalama, mağaza grafik/ekran görüntüsü, güncelleme protokolü, Fold iç/dış ölçümleri), 0 başarısız. Dock testi bu gününde güçlendirildi: panel açıkken sahanın görünür ve telefonda en az 200 CSS px kalması ölçülür; CSV 5 MB reddi artık `#csv-review` beklemektedir (`#csv-modal` boş sayım yerine). Bu sonuçlar fiziksel cihaz kabulü veya canlı dağıtım değildir.

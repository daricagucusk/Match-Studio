# V2.6.8-F.12 — Oyuncu katılım raporu doğruluğu

Bu sürüm yalnızca yeni bir **kaynak/test geliştirme dalında** hazırlanmıştır; `main` veya mevcut canlı Vercel dağıtımı değiştirilmemiştir.

- Maç başlamadan önce ilk kadro üyeleri raporda `katıldı` sayılmaz.
- Sahaya girmemiş yedek oyuncu kart/sakatlık/diğer sportif olay kaydı alırsa istatistiği korunur; fakat otomatik olarak maçta oynamış sayılmaz.
- Oyuncunun sahaya giriş olayı kaydedilmişse sıfır saniye geçmiş olsa bile `katıldı` kabul edilir.
- Eski kulüp veri şeması, olay kayıtları, yedekleme ve taktik saha konumları değiştirilmez.
- Tam kaynak regresyonu GitHub Actions üzerinde doğrulanmadan ve kullanıcı onayı alınmadan `main` dalına geçilmez.

## Önceki sürüm

# V2.6.8-F.11 dağıtımı

Bu paket üretim adayıdır. Gerçek cihaz kabulü için DEVICE_CHECKLIST.md kullanın.

## F.11 yayın altyapısı — GitHub ve Vercel

- Özel GitHub deposu ve mevcut Vercel projesi için yayın yapılandırması eklendi. `npm run build:vercel` yalnızca doğrulanmış uygulama dosyalarını public/ içine çıkarır; kaynaklar ve belgeler sunulmaz.
- GitHub Actions test ve paket kontrolü sonrası yayın çıktısını da üretir. Tarayıcı testleri public/ üzerinden çalışır; main'e birleştirmeden önce başarı kontrolü gerekir.
- Kullanıcı Match-Studio deposunu oluşturdu; özel depo ayarı doğrulanması ve kaynak yüklemesi bekleniyor. Vercel API erişimi 403 ile engelli. Panel bağlantısı tamamlanmadı ve yeni bir canlı dağıtım yapılmadı. Ayrıntılar GITHUB_VERCEL.md içindedir.
- Uygulama sürümü F.11 ve veri şeması korunur.

## F.11 — 8. kullanıcı deneyimi düzeltmesi

- Kulüp seçimi, çalışma adımları, afiş sekmeleri, yayın hedefi ve grup filtreleri ortak mavi palete alındı. Kulüp ve saha seçim alanları aynı koyu form yüzeyini kullanır. Grup filtreleri tüm ekranlarda en az 44px yüksekliğindedir.
- Kulüp yönetimi ve bilgi panellerindeki eski yeşil yüzeyler düzenlendi. Saha zemini, kulübün seçtiği renk, başarı işaretleri ve uyarı renkleri korunur.
- İngilizce başlıklar ve geliştirme etiketleri sade Türkçeyle değiştirildi. Afiş şablonlarının görünen adları Türkçeleştirildi; kayıt kimlikleri değişmedi.
- Eski kayıt aktarımı ve şifreli yedek açıklamaları sadeleştirildi. Aynı tarayıcı/site koşulu, boş hedef kulüp, en az 12 karakter parola ve unutulan parolanın kurtarılamaması uyarıları korunur.
- F.4–F.10 düzeltmeleri dahildir; veri/yedek şeması değişmedi. İlk incelemedeki sekiz düzeltme tamamlandı.
- F.11 henüz canlı değildir; mevcut Vercel 403 ekip erişim engeli nedeniyle canlı sürüm F.3'tür.

## F.10 — 7. kullanıcı deneyimi düzeltmesi

- Ortak modal odak denetleyicisi eklendi. Oyuncu, CSV, maç forma numarası ve maç mevki pencerelerinde arka plan inert olur; Tab/Shift+Tab pencerenin dışına çıkmaz.
- Odak, geçici UI işlem kilidi kalktıktan sonra ilk uygun form alanına verilir. Gizli/devre dışı kontroller odak döngüsüne girmez; mevcut pencere içi odak korunur.
- Escape ve Kapat pencereden çıkar; kayıt sonrası da odak açan kontrole döner. Yeniden çizilen düğmeler sabit kimlikleriyle bulunur. Saha menüsünden açılan pencereler kapanınca oyuncunun menü düğmesine dönülür.
- F.4–F.9 düzeltmeleri dahildir; veri/yedek şeması değişmedi. Sekizinci düzeltme (görsel dil ve kullanıcı metinlerinde tutarlılık) kullanıcı onayını bekler.
- F.10 henüz canlı değildir; önceki Vercel 403 ekip erişim engeli nedeniyle mevcut canlı sürüm F.3'tür.

## F.9 — 6. kullanıcı deneyimi düzeltmesi

- Kadro, saha ve afiş ekranlarının ortak başlığı kısaltıldı. Tekrarlanan kulüp/sürüm satırı çıkarıldı; takım/grup ve rakip görünür kaldı. Tarih, saat ve stat bilgileri Maç ayrıntıları bölümündedir.
- Beş adım bağlantısı telefonda tek sırada, kısa etiketlerle gösterilir. Tam erişilebilir adları ve etkin adım bilgisi korunur; düğmeler en az 44px yüksekliğindedir.
- Telefon özet kartları tek sıraya alındı; saha görünümü ve PNG düğmesi yan yana düzenlendi. Tekrarlanan alt başlıklar ve boşluklar azaltıldı. Kadro araması grup filtrelerinin önüne taşındı.
- 360×780 test görünümünde ortak başlık 310px'den 125px'e; saha başlangıcı 1037px'den 596px'e indi. Kadro araması 572–620px, afiş yayın hedefi 525–588px aralığında erişilebilir.
- Görünüm değişimi, PNG indirme ve seçili maç verileri korunur. F.4–F.8 düzeltmeleri dahildir; veri/yedek şeması değişmedi.
- Yedinci düzeltme (modal klavye odağının arka plana kaçması) kullanıcı onayını bekler. F.9 henüz canlı değildir; önceki Vercel 403 ekip erişim engeli nedeniyle mevcut canlı sürüm F.3'tür.

## F.8 — 5. kullanıcı deneyimi düzeltmesi

- Gol, Rakip golü, Sarı kart ve Kırmızı kart kısayolları eklendi. Telefonda alt menünün üstünde sabit, geniş ekranda kaydırırken üstte kalır.
- Kısayol yalnızca olay formunu hazırlar ve ilgili alana odaklar; kendiliğinden kayıt oluşturmaz. Olayı kaydet düğmesi ve mevcut kalıcı kayıt onayı korunur. Onay iptalinde girişler korunur.
- Olay giriş bölümü taktik saha ve oyuncu değişikliği bölümlerinin önüne taşındı. Rapor ayrı olarak aşağıda tutulur.
- Rakip golünde oyuncu/asist alanı, kartta geçersiz asist alanı temizlenir; not korunur. Kısayollar oturum durumu kurallarına uyar; başlatılmamış ve tamamlanmış maçlarda devre dışıdır.
- Telefon saat kontrolleri yan yana düzenlenerek kısayol çubuğuyla çakışması önlendi. Kısayollar yazdırmada gizlenir.
- F.4–F.7 düzeltmeleri dahildir; veri/yedek şeması değişmedi. Altıncı düzeltme (çalışma ekranlarında başlıkların kapladığı alan) kullanıcı onayını bekler.
- F.8 henüz canlı değildir; önceki Vercel 403 ekip erişim engeli nedeniyle mevcut canlı sürüm F.3'tür.

## F.7 — 4. kullanıcı deneyimi düzeltmesi

- Henüz grubu olmayan kulübün ana ekranının başına ilk takım / yaş grubu formu eklendi. Ad alanı ve oluşturma düğmesi 360×780 telefon görünümünde ilk ekrana sığar.
- Grup bulunmayan Oyuncular ve Yeni Maç ekranlarında da aynı form gösterilir. İlk grup eklendikten sonra bu başlangıç paneli kalkar; oluşturulan grup oyuncu/maç seçimlerinde kullanılabilir.
- Arşiv & Ayarlar'daki grup formu yönetim, yedek ve kurtarma bölümlerinin önüne taşındı. Ortak form kullanılır; aynı ekranda yinelenen form kimliği yoktur.
- Kulüp seçimi sonrası sayfanın başına dönülür. Grup oluşturma sırasında mevcut maç taslağı korunur. Yinelenen grup adı mevcut kontrolle reddedilir.
- F.4–F.6 düzeltmeleri dahildir. Veri/yedek şeması değişmedi. Canlı maç olay girişini kolaylaştıracak beşinci düzeltme kullanıcı onayını bekler.
- F.7 henüz canlı değildir; önceki Vercel 403 ekip erişim engeli nedeniyle mevcut canlı sürüm F.3'tür.

## F.6 — 3. kullanıcı deneyimi düzeltmesi

- Canlı maç saati, rapor toplamı, rapordaki oyuncu süreleri ve kadro kartları aynı zaman anından hesaplanıp saniyede bir güncellenir. Katılan oyuncu sayısı ve zaman kontrolü uyarıları da yenilenir.
- Güncelleme yalnızca ilgili metin alanlarını değiştirir; olay formu yeniden çizilmez, girilen not/seçimler ve odak korunur. Sayaç veritabanına veya olay geçmişine yazmaz.
- Duraklama, devre arası ve maç sonu sırasında oynanan süre artmaz. Devre saati sıfırlanırken rapor toplamı önceki devreyi korur. Oyuncu değişiminden sonra çıkan oyuncunun süresi sabit kalır.
- Yazdır / PDF düğmesi ve tarayıcının beforeprint olayı son zaman hesabını uygular. Şüpheli cihaz saati uyarısı raporda da görünür.
- F.4 taslak ve F.5 müsabaka türü düzeltmeleri dahildir. Veri/yedek şeması değişmedi. Dördüncü düzeltme (ilk grup kurulumunun görünürlüğü) kullanıcı onayını bekler.
- F.6 henüz canlı değildir. Vercel 403 ekip erişim engeli nedeniyle mevcut canlı sürüm F.3'tür.

## F.5 — 2. kullanıcı deneyimi düzeltmesi

- Müsabaka türü afiş belgesine aktarılır: Hazırlık → HAZIRLIK MAÇI, Resmî lig → LİG MAÇI, Turnuva → TURNUVA, Antrenman maçı → ANTRENMAN MAÇI.
- Dört şablonun sosyal medya ve veli/oyuncu çıktılarında, gönderi ve hikâye boyutlarında aynı tür kullanılır. Klasik şablondaki sabit lig ve kadro başlıkları kaldırıldı.
- Türü eksik veya tanınmayan eski maçlarda MAÇ kullanılır; kayıtlar değiştirilmez. Özel organizasyon adı varsa türle birlikte korunur.
- F.4 taslak düzeltmesi dahildir. Veritabanı ve yedek şeması değişmez. Canlı saat, telefon yerleşimi ve sonraki bulgular bu sürümün kapsamı değildir; üçüncü düzeltme kullanıcı onayını bekler.
- Yayın durumu: F.5 henüz canlı değildir. Önceki Vercel 403 ekip erişim engeli devam ediyor; mevcut canlı sürüm F.3.

## F.4 — 1. kullanıcı deneyimi düzeltmesi

- Maç formunun tüm alanları bölüm değişiminde ve aynı sekmenin yenilenmesinde korunur. Yeni maç, kayıtlı maç ve kulüp taslakları ayrı tutulur.
- Taslaklar sessionStorage kullanır; sekme kapatılınca veya farklı cihazda kalıcılık garantisi yoktur. Depolama engelliyse bellek kullanılır ve yenilemeden önce kaydetme uyarısı gösterilir.
- Kaydet işlemi başarılı olduğunda ilgili taslak temizlenir. Kaydedilmemiş düzenlemeler asıl maç kaydını değiştirmez. Taslak silme ve mevcut yeni taslak yerine kopya açma onay gerektirir.
- Veri/yedek şeması değişmedi. Afiş maç türü ve sonraki inceleme bulguları bu sürüm kapsamına alınmadı; sonraki güncelleme kullanıcı onayını bekler.

## F.3 eklemeleri

- Aynı işlem anahtarıyla farklı süre/gerekçe veya farklı olay düzeltmesi gönderilmesi reddedilir; özgün olay ve revizyon korunur. Aynı anlamdaki gerçek tekrarlar kabul edilir. Sonraki düzeltmeler eski isteğin anlamını değiştirmez.
- Genel olay kaydında tür, içerik, devre ve maç zamanı birlikte karşılaştırılır; JSON nesnelerinin anahtar sırası anlamı değiştirmez.
- 90 dakikalık maç, 105 olay, duraklama, devre arası ve bağlantı yenilemeleriyle hızlandırılmış olarak doğrulanır. Bu gerçek cihazda 90 dakika beklenen stres denemesi değildir.
- `npm run release`, testlerden sonra ZIP üretir ve bütünlük doğrulaması yapar. ZIP özetleri ve release.json ayrıca üretilir. GitHub Actions için aynı kontrol hazırlanmıştır.
- F.2 PWA paketi önceki teslimat ve test fixture'ı olarak baseline içinde korunur. Veri ve yedek şemaları değişmez.

## F.2’den korunan değişiklikler

- F.1 R1 paketindeki 49 modül kaynak dosyalarına çıkarıldı; 1 PWA güncelleme modülü eklendi. Derleme manifesti kaynaklar için açık sıralama tutar.
- Kulüp değişiminde bekleyen bağlantı/yazma işlemleri iptal edilir; eski bağlantılar kapatılır. Veritabanı sürümü 2 ve mevcut kayıt adları korunur.
- Geri yükleme ve kurtarma, aynı kulübün yazma işlemleriyle Web Locks üzerinden koordine edilir. Kurtarma kopyası kaydedilemezse mevcut kayıtlar silinmez.
- UI işlemleri sürerken kulüp/maç değişimi ve tekrarlanan giriş engellenir.
- Service worker her dosyayı derleme SHA-256 manifestiyle doğrular. Eksik dağıtım reddedilir. Etkin sürüm yalnızca kendi önbelleğinden çalışır.
- Yeni sürüm kullanıcı kabulünü bekler; açık sekmelerdeki işlemler tamamlanmadan etkinleştirilmez. Kabul tüm uygulama sekmelerini yeniden başlatır.

## Dağıtım ve geri dönüş

1. Cihaz dışına şifreli JSON yedeği alın; parolayı ayrıca saklayın.
2. PWA ZIP'ini **mevcut origin, port ve alt dizini koruyarak** yayınlayın. HTTPS gereklidir (localhost hariç).
3. Dosyaları tek dağıtım olarak yayınlayın. HTML/JS/CSS gövdelerini barındırıcıda otomatik dönüştürmeyin; service worker manifesti tam dosya baytlarını doğrular. HTTP sıkıştırması kullanılabilir.
4. `sw.js` için no-cache/no-store kullanın; HTML/JS/CSS dosyalarını yanlış MIME ile veya SPA fallback HTML'si olarak sunmayın. Yerel sunucu doğru başlıkları uygular.
5. Açık uygulamada güncelleme bildirimini bekleyin; formları kaydedip kabul edin. Eski F.1'den ilk geçişte çevrimiçi yeniden açılış gerekebilir.
6. Çevrimdışı açılış, kayıtlar, yedek ve afiş indirmeyi doğrulayın.

Geri dönüşte önceki tam paketi aynı adreste yeniden yayınlayın ve sekmeleri kapatıp açın. Tarayıcı/site verilerini temizlemeyin. F.2 veri şemasını değiştirmez. Yedek gerektiğinde aynı kulübe açık onayla geri yüklenir; geri yükleme mevcut kulüp kayıtlarını değiştirir.

Eski sürüm önbellekleri, açık sekmelerin dosyalarının kaybolmaması için otomatik silinmez; çok sayıda dağıtımda depolama büyüyebilir. Cihazda alan azsa güncelleme kurulamayabilir; önce dış yedek alın ve cihaz alanını kontrol edin. Site verilerini temizlemek kulüp verilerini de siler.

## Sınırlar

APK, sunucu, kullanıcı hesabı, bulut eşitlemesi veya telemetri eklenmedi. Eski F.1 sekmeleri yeni Web Locks protokolünü bilmez; ilk geçişten önce onları kapatın. Gerçek cihaz ergonomisi, Android dosya paylaşımı ve uzun süreli stres testi otomatik tarayıcı testleriyle doğrulanmış sayılmaz.

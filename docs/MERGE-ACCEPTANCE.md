# Match Studio — birleşik yerel aday kabulü

Tarih: 28 Ekim 2026. Kullanıcının onayladığı ilk dört aşama tamamlandı; beşinci aşama, tek çalışma girişine geçiş kararı bekliyor.

Aday: D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Aday
Dal: kervan/match-studio-tek-surum
Taban: Play 2b17cc594686e6650d3f409f6e09af63a70ef4c5.
İncelenen son kod: 93ef116a122c445c801fed6eecf67a459ba54da5. Sonraki değişiklikler kabul belgeleri ve üretilmiş build çıktılarıdır; teslim manifesti final Git kimliğini ayrıca kaydeder.
Paket etiketi: 2.6.8-f.13 korunmuştur; aday kimliği dosya adından değil bu Git geçmişinden anlaşılır.

## Uygulanan iş

- Play temelinden bağımsız Git adayı oluşturuldu. 117 yollu kaynak karar matrisi MERGE-SOURCE-MATRIX.csv içinde.
- F.14 Windows Python bulucusu uyarlandı. Güvenli sourceFiles listesi ve dördüncü Python argümanı korundu; eski kök taraması alınmadı.
- İmza/ortam/link dışlamaları korundu. Geçici .superpowers alanı da kaynak paketinin dışında.
- Windows'ta junction testi gerçek bağlantıyı sınar; atlanan bir güvenlik testi değildir.
- Excel tarayıcı fixture'ının doğrudan python3 çağrısı aynı bulucuya bağlandı; ikili XLSX Buffer korunuyor.
- F.12/F.13 rapor işlevleri zaten Play'de bulunduğu için tekrar taşınmadı. src/ modülleri, 55 modül sırası, device-test.html build/sunum girdileri değişmedi. Play'in modal odak, pitch metni ve şifreli varsayılanı korundu.

## Yeni doğrulama

Ortam: Windows, Node 24.19.0, Python 3.10.11, Playwright standart Chromium.

| Kontrol | Sonuç |
| --- | --- |
| npm ci | Adayda tamamlandı; lock güncellemesi yok |
| npm run release | Çıkış 0; derleme, testler, paket üretimi ve PWA doğrulaması tamam |
| Node testleri | 81 geçti, 0 hata |
| Tarayıcı | 127 geçti, 8 koşullu atlama, 0 hata; toplam 135 |
| Hedefli aktarım/silme/odak | 21 geçti |
| Rapor/katılım/asist | 12 geçti |
| Windows Python/paket koruması | 13 geçti; bağımsız inceleyen de aynı 13 kontrolü geçti |
| Excel düzeltmesi | Masaüstü/telefon/katlanabilir 3/3 geçti |
| npm run build:vercel | Çıkış 0; yerel statik çıktı, yayın değildir |
| Play strict remote | Çıkış 1; 13 kontrol, 7 yayın engeli; beklenen ayrı hazırlık durumu |

İlk tam koşuda 81 Node ve 124 tarayıcı geçti; üç Excel testi Windows python3 adı yüzünden hata verdi. xlsx-green.txt düzeltmeyi doğrular. release-final.txt yeni tam başarılı koşudur. Eski CI sayıları yeni adayın sonucu yerine kullanılmadı. Sekiz atlama mevcut platform/masaüstüne özgü senaryolardır; sayım baz çizgisiyle eşittir.

## Sentetik veri kabulü

Şifreli yedek, yanlış parola, bozuk dosya, iptal, diğer kulüp izolasyonu, JSON uyumu ve aynı kulüpte eski yedekten silinen oyuncuyu geri getirmeme yeniden sınandı. Kesintili kalıcı silme yanlış başarı vermedi; yeniden açılışta tamamlandı. Bağlantılı aktarımda 3 oyuncu, 1 grup, 1 maç, 3 kadro kaydı, 1 maç oturumu ve 1 görselin dokuz veri alanı eşit. Silmede oyuncu/kadro bağlantısı ve fotoğraf temizlenirken maç korundu.

Koruma aynı kulüp/profil kayıtlarına dayanır. İndirilmiş dış dosya silinmez; eski dosya başka temiz profil/kulübe aktarılabilir. Gerçek sporcu verisi veya kullanıcının Chrome/Brave profili kullanılmadı.

## Kaynak koruma ve teslim

D: özgün kaynağındaki 209 ve C: referansındaki 207 dosyanın içerikleri ile Git HEAD/durumları başlangıçla aynı. Bu kapsam bağımlılık/cache/.git içeriğinin tamamına ilişkin bir tarama iddiası değildir. Adayın kendi test görselleri özel kanıt alanında korunup kaynak görselleri geri kondu; bundle/SW derleme çıktısı olarak kaydedildi.

Teslim dizini: Projeler/MatchStudio/Teslimler/2026-10-28-Birlesik-Aday-93ef116.
PWA/source ZIP, release.json, dış SHA256SUMS, Türkçe rapor ve acceptance.json birlikte saklanır. ZIP CRC, dış SHA256, PWA iç manifesti ve kaynak ZIP'in yerel dosyalarla birebir eşitliği ayrı doğrulanır. Özetler release.json ve delivery-verification.json içindedir; bu belge kendi bulunduğu ZIP'in özetini içermez.

## Bağımsız inceleme ve sınırlar

MERGE-REVIEW.md: 0 kritik, 0 önemli, 0 küçük kod bulgusu. İnceleme salt okunur yapıldı. İnceleyenin son kabul dışında bıraktığı teslim/hash/özgün koruma kapıları yürütücü tarafından ayrı doğrulandı. Fiziksel cihaz/görsel kabulü, gerçek veri aktarımı, uzak CI ve yayın değerlendirme dışında kalır.

Play için hesap/uygulama doğrulaması, imzalı AAB, onaylı canlı gizlilik sayfası ve gerçek sertifikalı Digital Asset Links açık. Bugünkü privacy ve assetlinks yanıtları 404. Gerçek cihaz/TWA/çevrimdışı/paylaşım/güncelleme, Data Safety ve mağaza görselleri ayrıca kabul ister. Bu aday push edilmedi, birleştirilmedi, yayınlanmadı, imzalanmadı. Mevcut çalışma sicili yönlendirmesi değiştirilmedi.

## Yürütme kararları

1. Açıkça seçilen aday konumu için bağımsız clone kullanıldı; genel worktree önerisi uygulanmadı. Yanlış yorumun maliyeti fazladan disk alanıdır; özgün kaynak bağı yok.
2. Yerel ilk dört aşama yetkisi nedeniyle genel PR açma kuralı uygulanmadı. Maliyet: uzak CI ve ekip incelemesi henüz yok.
3. Plan görev başlıklarına parser'ın beklediği boşluk eklendi; kapsam aynı. Maliyet: yalnız belge biçimi değişikliği.
4. Windows ayrıcalık hatasında dosya symlink'i yerine gerçek directory junction sınandı; POSIX testi korundu. Maliyet: Windows dosya symlink türünün birebir testi yok; junction takibi ve paket dışlama gerçek.
5. Başarısız fixture ile görülen .superpowers sızıntısı dar dışlama ile kapatıldı. Maliyet: geçici ajan çalışma dosyaları kaynak ZIP'te bulunmaz; kalıcı ledger/inceleme docs içinde.
6. Otomatik onay denetimi geçici plan klasörünün silinmesini “blocked by policy” gerekçesiyle reddetti. Alternatif silme denenmedi; küçük yerel çalışma alanı korundu. Maliyet: yerel geçici dosyalar kalır; ZIP dışında oldukları doğrulanır.

Ertelenen küçük kod bulgusu yok. Sonraki karar: bu doğrulanmış adayı Beyin2 tek çalışma girişi olarak seçmek. Bu karar yayın yetkisi vermez.

Özel kanıt kökü: .beyin-state/matchstudio-unification/run-20261027. release-final.txt, vercel-build.txt, play-readiness.txt, source-preservation.json, delivery-verification.json, browser-acceptance/*.json. Özel kanıtlar kaynak paketine kopyalanmadı.

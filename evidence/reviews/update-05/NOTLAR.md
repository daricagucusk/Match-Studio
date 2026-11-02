# Güncelleme 05 — Hızlı maç olayı

Kök neden: Olay formu taktik saha ve oyuncu değişikliği bölümlerinden sonra çiziliyordu. Telefonun ilk ekranında olay girişine erişim yoktu. Başlangıç testi hızlı olay düğmesinin bulunamamasıyla beklenen biçimde başarısız oldu.

Çözüm: Dört kısayol (Gol, Rakip golü, Sarı kart, Kırmızı kart). Telefonda alt menü üstünde sabit, geniş ekranda üstte yapışkan. Form türü seçilir, ilgili alana odaklanılır; kayıt gönderilmez. Mevcut onaylı kayıt akışı kullanılır. DOM alanı hazırlayan bu işlem uygulamayı inert yapan yazma kilidine alınmaz; süren başka işlem varken mevcut yakalama engeli yine uygulanır.

Olay formu taktik saha/değişiklikten önce çizilir; rapor ayrı bölüm olarak aşağıda kalır. Not korunur; rakip golünde kulüp oyuncusu/asist seçimi, kartta asist temizlenir. Hazırlanmamış/tamamlanmış durumda kısayollar kapalıdır.

Testler: Masaüstü, telefon ve katlanabilir ekranda toplam 6 senaryo. İlk ekranda ve sayfanın en altında kısayol erişimi, en az 44px hedef, form odağı; gol/kart/rakip golü ile 1:1 skor; iptal edilen onay sonrası yalnızca başlangıç olayı; dört sportif kayıt sonrası yenilemede aynı skor ve 5 toplam olay. Veritabanı ham kayıtları anahtar sırası yerine sequence alanıyla sıralanır. Duraklama/devre arası/maç sonu durumları kontrol edilir.

Görsel kontrolde ilk çubuğun telefon saat düğmesini örttüğü görüldü; çakışma testi başarısız oldu. Saat kontrolleri yan yana düzenlendikten sonra bu kontrol ve altı hedef senaryo geçti. quick-events-phone.png 360×780 görünümüdür ve görsel olarak incelendi. Gerçek telefon klavye/donanım kabulü yerine geçmez.

F.8 önceki dört düzeltmeyi de içerir; Vercel ekip erişim engeli nedeniyle henüz canlı değildir. Altıncı düzeltme kullanıcı onayını bekler.

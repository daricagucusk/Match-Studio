# Güncelleme 07 — Modal klavye odağı

Kök neden: aria-modal tek başına klavye davranışını sağlamıyordu. Arka plan etkileşime açıktı; Tab sınırı yoktu. Açılışta root.inert işlem kilidi, doğrudan focus çağrısını engelliyordu. Başlangıç testi oyuncu penceresinin Kapat düğmesinden Shift+Tab ile odağın dışarı çıkmasıyla beklenen biçimde başarısız oldu.

Çözüm: Ortak modal-focus denetleyicisi. Arka plan kabuğu modal varken inert olur. Tab sınırları, görünür ve etkin kontrollerden her tuş basışında hesaplanır; iç kontrollerde tarayıcının doğal klavye davranışı korunur. Escape, IME kompozisyonu veya etkin UI kilidi yoksa kapatır. İlk odak, root kilidi kaldırıldıktan sonra atanır. Kapatma/kayıt sonrası açan kontrol aynı veri kimliğiyle yeniden bulunur; silinmişse kullanılabilir arka plan kontrolüne dönülür.

Saha menüsündeki komut modal açılınca kaybolduğu için, numara/mevki/oyuncu penceresinin dönüş hedefi ilgili saha menü düğmesidir. Yeni veri deposu veya veri yazısı eklenmedi.

Kontroller: Üç ekran boyutunda dört senaryo, toplam 12 test geçti. Oyuncu penceresinde 22 Tab adımı ve Shift+Tab sınırı; arka plan inert; Escape ve Kapat ile açıcıya dönüş; yeni oyuncu kaydı sonrası kullanılabilir arka plan; CSV'de devre dışı Onayla düğmesinin atlanması; saha numara/mevki/oyuncu pencerelerinde ilk odak ve tekrar oluşturulan oyuncu menüsüne dönüş.

modal-focus-phone.png 360×780 görünümünde forma numarası penceresi ve klavye odağını gösterir; görsel olarak incelenmiştir. Gerçek telefon/donanım ve ekran okuyucu kabulü yerine geçmez.

F.10 önceki altı düzeltmeyi içerir; Vercel ekip erişimi nedeniyle henüz yayında değildir. Sekizinci düzeltme kullanıcı onayını bekler.

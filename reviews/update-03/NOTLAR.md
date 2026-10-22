# Güncelleme 03 — Canlı rapor yenileme

Kök neden: saniyelik tickLiveClock, yalnızca ana saati ve data-live-minutes kartlarını güncelliyordu. Rapordaki toplam süre, oyuncu süre hücreleri ve katılım bilgisi render zamanında kalıyordu.

Doğrulanmış başlangıç hatası: ana saat 00:05 iken rapor 00:00 oynanan süre göstermeye devam etti. İlk test fixture'ındaki geçersiz 3v3/kaleci birleşimi düzeltildi; ardından gerçek regresyon bu beklenen farkla başarısız oldu.

Çözüm: tüm süre gösterimleri aynı nowMs ile rapor projeksiyonundan hesaplanır; yalnızca metin ve uyarı görünürlüğü güncellenir. Her render da tek zaman anı kullanır. Yazdırma öncesi son projeksiyon alınır; veri/olay yazısı yoktur.

Testler: 3 ekran boyutunda 2 senaryo. Saat sabitlenerek 5/10/15 saniye ilerleme; 60 saniye duraklama; p1 → p4 değişimi ve 65 saniye daha oynama; 30 saniye devre arası; ikinci devre ve bitirme. Not, oyuncu seçimi ve odak korunur. Yazdırma gecikmiş tick'i tamamlar; 2 saat cihaz saati sıçraması uyarı verir. Yazdırma ve tick sonrası kalıcı olay sayısı/revizyon 1/1 olarak kalır.

Test geliştirmede gerçek zamanın beklenen saniyeleri kaydırması pauseAt ile giderildi; oyuncu değişikliği onayı testte açıkça kabul edilerek değişim doğrulandı. Son altı hedef test geçti.

completed-report.png sentetik verilerle maç tamamlandıktan sonra alınan rapordur. F.6 önceki iki düzeltmeyi içerir; canlı yayın Vercel ekip erişim engelini bekler. Sonraki işe kullanıcı onayı olmadan başlanmaz.

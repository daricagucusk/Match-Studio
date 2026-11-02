# Güncelleme 06 — Çalışma alanı yoğunluğu

Kök neden: Ortak başlıkta kulüp/sürüm, büyük başlık, tekrar maç açıklaması, tarih kutusu ve geniş adım menüsü birlikte çok yer kaplıyordu. Telefonda özet kartları iki sıra ve saha araçları ayrı satırlardı. İlk test: başlık 309.94px, saha başlangıcı 1037.33px; hedef başlık yüksekliği kontrolü beklenen biçimde başarısız oldu.

Çözüm: Kısa ortak başlık, görünür grup/rakip ve açılabilir maç ayrıntıları. Tek sıra beş bağlantı; tam erişilebilir etiket ve etkin adım korunur. Telefon özetleri ve saha araçları sıklaştırıldı; küçük ikincil başlıklar azaltıldı. Kadro araması grup filtrelerinin önüne alındı. Renk sistemi veya diğer ekranlar yeniden tasarlanmadı.

Doğrulama: 3 ekran boyutunda 2 senaryo, toplam 6 hedef test. Başlık/çalışma bölgesi konumları, en az 44px adım düğmeleri, tarih/saat/stat bilgisi, yatay taşma, dört oyuncu, afiş yayın hedefi ve yerleşim doğrulaması; Tam Kadro Haritası → Maç Dizilişi → gerçek saha PNG indirme → maç formuna dönüş ve değişmemiş rakip/stat/saat.

Telefon ölçümleri: başlık 124.78px; saha başlangıcı 595.88px (441.45px yukarı). Kadro araması 572.06–620.06px, yayın hedefi 524.55–588.44px. Başlangıç ölçümü phone-before.json ve pitch-phone-before.png içinde saklandı. Sonuçlar ekran boyutu bazında measurements.json dosyalarındadır; son görseller pitch/roster/studio önekleriyle kayıtlıdır ve telefon görselleri incelendi.

Bu ölçümler Chromium emülasyonudur; gerçek cihaz klavyesi/donanım kabulü yerine geçmez. F.9 önceki beş düzeltmeyi içerir ve Vercel ekip erişim engelini bekler. Modal odak düzeltmesine kullanıcı onayı olmadan başlanmaz.

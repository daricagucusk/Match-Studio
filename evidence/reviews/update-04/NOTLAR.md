# Güncelleme 04 — İlk grup kurulumu

Kök neden: Grup ekleme formu yalnızca Arşiv & Ayarlar ekranında, kulüp yönetimi ve yedek/kurtarma bölümlerinden sonra bulunuyordu. Ana ekrandaki görev bağlantısı da yalnızca bu uzun ekranı açıyordu. Başlangıç testi yeni kulüp oluşturduktan sonra group-form bulunamadığı için beklendiği gibi başarısız oldu.

Çözüm: Ortak groupSetup görünümü. Ana ekran, Oyuncular ve Yeni Maç'ta yalnızca hiç grup yokken en üstte gösterilir. Arşiv'de her zaman en üsttedir; eski derin form kaldırılmıştır. Bir ekran üzerinde tek group-form bulunur. Mevcut kayıt/tekrar kontrolü kullanılır; veri şeması değişmez.

Doğrulama: Üç ekran boyutunda dokuz senaryo geçti. Yeni kulüp oluşturma → ilk ekrandan grup ekleme → oyuncu modalında grubu görme → yenileme → maçta grup seçme; boş oyuncu/maç ekranları; maç bilgileri yazılıyken grup oluşturup taslağı koruma; Arşiv başlangıcındaki form ve yinelenen adın reddi. Kaydırma animasyonu tamamlanana kadar beklenir; oluşturma düğmesinin alt mobil menünün üstünde kaldığı kontrol edilir.

first-group-phone.png 360×780 Chromium telefon görünümüdür; form ve düğme kaydırmadan erişilir, yatay taşma yoktur. Görsel olarak da incelenmiştir. Gerçek telefon klavyesi/donanım kabulü yerine geçmez.

F.7 önceki üç düzeltmeyi de içerir; Vercel ekip erişimi nedeniyle henüz yayında değildir. Beşinci düzeltme kullanıcı onayını bekler.

# Güncelleme 02 — Afişte müsabaka türü

Kök neden: poster belgesi matchType bilgisini taşımıyordu. Render motorlarında boş organizasyon için LİG MAÇI varsayılanı ve klasik özel afişte iki sabit lig başlığı bulunuyordu.

Önce regresyon testi çalıştırıldı: hazırlık maçının klasik sosyal medya afişinde HAZIRLIK MAÇI yok, LİG MAÇI var ve belge türü taşımıyor (beklenen başarısızlık).

Düzeltme: maç türü belgeye taşınır; ortak tür ve organizasyon başlığı hesaplanır. Tüm şablonlar bu başlıkları kullanır; klasik kadro bandı da müsabaka türünü izler. Türü bulunmayan eski kayıtlar MAÇ olarak gösterilir, kayıt değiştirilmez.

Doğrulama: 4 tür ve 2 eski/bilinmeyen durum × 4 şablon × 2 paylaşım hedefi × 2 boyut, üç Chromium ekran boyutunda kontrol edilir. Canvas fillText izlenirken gerçek çizim devam eder. Özel organizasyon adı, PNG dosya imzası ve yerleşim sonucu da denetlenir. Ayrı kullanıcı akışı formdaki türü kaydedip önizleme ve indirme işlemlerini hazırlık/lig için doğrular.

friendly-public.png ve league-public.png uygulamanın PNG İndir düğmesiyle sentetik kulüp verilerinden alınmıştır. Hazırlık PNG'si görsel olarak incelendi; başlık doğru ve görünürdür.

F.5, önceki F.4 taslak düzeltmesini de içerir. Vercel ekip erişim engeli nedeniyle henüz canlı değildir. Sonraki canlı saat/rapor düzeltmesine kullanıcı onayı olmadan başlanmaz.

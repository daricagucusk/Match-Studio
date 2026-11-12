---
paths:
  - "src/domain/match-*.js"
  - "src/domain/live-*.js"
  - "src/storage/live-match.js"
  - "src/storage/match-*.js"
  - "src/app/views/live-*.js"
---
# Canlı maç

- Olay geçmişi append-only. Düzeltme `EVENT_CORRECTION` ile yeni olay; hedef `targetEventId`.
- Aynı işlem anahtarı mükerrer yazmaz; eski revizyon reddedilir.
- Undo, son düzeltmeyi geri alır; iptal edilmiş olayı diriltmez, önceki oyuncuya döner.
- Skor ve oyuncu süreleri olay geçmişinden türetilir; sayaç veritabanına yazılmaz.
- Gol/asist/kart/değişiklik akışında onay iptali kayıt oluşturmaz; not ve seçim korunur.
- Değişiklikte çıkan oyuncunun süresi sabit kalır; devre arası ve duraklamada süre artmaz.
- Arka plan süresi duvar saatinden hesaplanır; şüpheli cihaz saati gerekçeli düzeltme ister.
- Kısayollar yalnız formu hazırlar ve odaklar; kendiliğinden kayıt oluşturmaz.

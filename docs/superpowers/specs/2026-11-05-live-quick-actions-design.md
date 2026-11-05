# F.19 Canlı Maç Saha Hızlı Aksiyonları — Tasarım

Tarih: 2026-11-05. Onay: Kullanıcı A (anında kayıt + geri al). Kapsam: F.19 geliştirme worktree, F.18 üretim değiştirilmez.

## Kullanıcı hedefi
Saha kenarında antrenör oyuncuyu kolayca görsün; gol, asist, sarı/kırmızı kart ve oyuncu değişikliği sahaya yansısın. Bir oyuncuya dokunup olay seçildiğinde veya önce olay modunu seçip ardından oyuncuya dokunulduğunda geçerli işlem tekrar onay istemeden kaydedilsin.

## Arayüz ve davranış
- Sahadaki her oyuncu ikonunun üzerinde, yalnızca geçerli kayıtlar varsa ufak ⚽ gol sayısı, A asist sayısı, 🟨 sarı ve 🟥 kırmızı kart göstergesi bulunur. Oyuna giren/çıkan oyunculara ⇧/⇩; sahadan çıkan oyuncu yedek listesinde gösterilir. İkon/bilgi asla takım forması numarasını örtmez.
- Oyuncuya dokunmak mini aksiyon şeridini açar: ⚽ Gol, 🟨 Sarı, 🟥 Kırmızı, ⇄ Değişim. Alternatif: alt hızlı işlem şeridinden mod seç, ardından sahadaki oyuncuya dokun.
- Gol anında kayıt edilir. O golle bağlantılı asist için ikinci bir oyuncuya dokunulabilir; “Asist yok” ile bağlantı kapatılır. Böylece gol, asisti beklemez ve iki kez yazılmaz.
- Sarı ve kırmızı kart anında kaydedilir. Kırmızı kart gösterimi oyuncunun sahadan çıkarılmasını otomatik yapmaz (müsabaka kuralı/antrenör kontrolü gerekir). İki sarı kart görünür; otomatik kırmızı kaydı uydurulmaz.
- Değişim: sahadan oyuncu + yedek oyuncu seçimi. Dönüş kuralı ek onay gerektirmiyorsa hemen kaydet. 'noReturn' ve 'competitionConfigured' durumlarında kural ihlalini atlama; gerekli durumda mevcut formda açık onay iste.
- Son sportif olayı geri al, append-only EVENT_CORRECTION void kaydı olarak hızlı çalışır. Oyuncu değişimlerinin otomatik ters işlemi müsabaka kurallarını ihlal edebileceği için mevcut kural kontrollü süreç dışında otomatik tersine çevrilmez. Bunu açık mesajla göster.
- Çift dokunmada tek kayıt, kulüp/maç değiştirme veya sürüm çakışmasında eskimiş sonuç uygulanmaz; her işlem revizyon ve idempotency anahtarını korur.
- Manuel tam olay/düzeltme formu ve maç saatinin durdurma, devre sonu, sakatlık/not işlevleri korunur.

## Teknik
Pure projection: `src/domain/live-action-indicators.js`, mevcut `projectMatchReport` ve `SUBSTITUTION` olayları. UI: `src/app/views/live-match-clock.js`, `src/main.js`, `web/matchstudio-premium-next.css`. Oturum veri modeli veya spor olaylarının saklanma şeması değişmez.

## Test
Node unit projection (düzeltmeler, asist, kart, değişim). Playwright desktop, phone, Fold: hızlı kart, gol + asist, geri al, değişim, yenileme sonrası görünürlük; çift dokunma. Tüm 112+ testler ve F.19 testleri korunur.

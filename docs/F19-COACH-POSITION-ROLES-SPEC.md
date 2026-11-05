# Match Studio F.19 — Mevki, Rol ve Saha Konsolu Şartnamesi

Tarih: 2026-11-05
Temel sürüm: doğrulanmış F.18 RC1, Git SHA `6470d9e31322f9b687a33137a0611500fdd84110`.
Kaynak: kullanıcının 05.11.2026 ekran görüntüsü ve açık talepleri.
Bu dosya, diğer kod ajanları için bağlayıcı işlevsel kaynak; ekran görüntüsü ise yalnızca kusur kanıtıdır.

## Kabul koşulları
1. Takım Derinliği'nde her formasyon görevi (örn. sol stoper ve sağ stoper; sol/sağ 8 numara) bağımsız kimlik, tercih sırası ve modern taktik rolü taşır.
2. Her görev kartında **1. tercih**, **2. tercih**, ardından sayı sınırı olmadan diğer uygun **alternatifler** görülebilir. En fazla iki oyuncu gösterme limiti kaldırılır. Gerçek aday listesi varsa sıralamayı antrenör belirler; isim/yaş/yetenek tahmin edilmez.
3. Bir sporcunun farklı mevkilere aday gösterilmesi serbesttir; tek diziliş analizinde aynı futbolcu sahada veya yedekte iki göreve birden sayılmaz.
4. Stoperler ve her orta saha görevi ayrı değerlendirilir. Taktik rol seçimleri Football Manager benzeri **rol adı + açıklama** ile sunulur; futbolcuya otomatik yetenek puanı verilmez.
5. Önceki `teamDepth:<groupId>` verileri değiştirilmeden okunur; yeni `slotCandidates` ve `tacticalRoles` alanları geriye uyumludur; sıfırdan başlayıp oyuncu kaydı silinmez.
6. Canlı Maç ekranında sahanın kapladığı alan gerçek antrenör kullanımı için büyütülür; aynı ekranda saat, skor, oyuncu değişimi, gol/kart, kısa not bulunur; 360px telefon, Fold açık ve masaüstünde taşma veya eylem kaybı yoktur.
7. Saha Dizilişi oyuncu seçildiğinde / yedek seçildiğinde sayfanın ve kendi iç listelerinin kaydırmasını ve saha ikonlarının koordinatlarını korur; seçim ekranda kaybolmaz.
8. Kaydetme sadece kullanıcı eylemiyle gerçekleşir. Canlı olay geçmişi, dakika hesaplama, maç kadrosu, gizlilik, yedek, silme güvenliği, Google Play App Links ve mevcut kulüp verileri değiştirilmez.

## Veri sözleşmesi
- Slot anahtarı: `<roleCode>:<roleIndex>` (örn. `CB:0`, `CB:1`).
- `teamDepth.roles[roleCode]`: eski ortak aday sırası; yeni görevin özelleştirmesi yoksa fallback.
- `teamDepth.slotCandidates[slotKey]`: bağımsız, tercih sıralı oyuncu kimlikleri; bulunmuyorsa ortak aday sırası kullanılır. Boş liste, bilinçli olarak boş seçilen görevi ifade eder.
- `teamDepth.tacticalRoles[slotKey]`: mevkiye uygun modern taktik rol ID'si; geçersiz/eskimiş değer otomatik varsayılana döner.
- Çapraz mevki çift adaylık yalnızca öneri verisidir, çoklu sahaya yazım değildir.
- `teamPitchPrefs` ve formasyon slotları korunur.

## Kalite sınırları
- Kirli orijinal çalışma klasörüne kod yazma; ayrı `feat/f19-position-roles-20261105` worktree kullan.
- Önce regresyon testi ekle, kırıldığını gör, sonra uygula, yeşil test sonucu al.
- Yeni oyun içi futbol rol adlarını Türkçe yaz; saha kartlarında kısa ama açıklayıcı başlıklar kullan.
- Görsel kimlik: Match Studio obsidyen/şampanya; mevcut logo, ikon, font ve navigasyon korunur.
- Gerçek oyuncu verisi ve imzalama anahtarı kod, görsel veya doküman içine kopyalanmaz.
- İnceleme testlerini tamamlamadan mevcut F.18 üretim dağıtımını değiştirme.

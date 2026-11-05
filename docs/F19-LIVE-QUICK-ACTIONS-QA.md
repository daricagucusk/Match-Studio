# Match Studio F.19 — Canlı Maç Hızlı Aksiyonlar: Uygulama ve QA

**Tarih:** 2026-11-05
**Kapsam:** `feat/f19-position-roles-20261105` bağlı çalışma klasörü; canlı F.18 yayınına aktarılmadı.
**Onaylanan UX:** A — anında kayıt ve sportif olayı tek işlemle geri al.

## Uygulanan davranış
- Canlı sahada oyuncu ikonu: gol, asist, sarı/kırmızı kart ve oyuna giriş rozetleri; sahadan çıkan için yedek listesinde çıkış rozeti. Rozetler kalıcı olay geçmişi ve düzeltme sonrası etkin olay projeksiyonundan türetilir.
- Alt hızlı işlem çubuğu: gol/kart modunu seç → saha oyuncusuna dokun → kayıt hemen oluşturulur. Oyuncuya önce dokunulduğunda mini işlem menüsü de açılır.
- Gol anında kaydedilir; ardından isteğe bağlı asist yapan başka bir oyuncuya dokunularak aynı gole bağlı asist kaydı eklenir. Asist yok seçeneği beklemeyi kapatır.
- İki farklı oyuncu seçilerek hızlı değişim; yeniden giriş kuralları gerektiğinde otomatik işlem engellenir ve mevcut kural kontrollü forma yönlendirilir.
- Son sportif olay, silme yerine `EVENT_CORRECTION` void kaydı ile geri alınır. Oyuncu değişimi otomatik tersine çevrilmez: müsabaka kuralı ihlal riski.
- Yanlış çift dokunma için tek işlem koruması, revizyon ve idempotency anahtarları korunur. Kırmızı kart oyuncuyu otomatik sahadan çıkarmaz; iki sarı karttan otomatik kırmızı uydurulmaz.

## Kaynak ve tasarım dosyaları
- `docs/superpowers/specs/2026-11-05-live-quick-actions-design.md`
- `docs/superpowers/plans/2026-11-05-live-quick-actions.md`
- `src/domain/live-action-indicators.js`
- `src/app/views/live-match-clock.js`
- `src/main.js`
- `web/matchstudio-premium-next.css`
- `tests/live-action-indicators.test.cjs`
- `tests/browser/live-tap-actions.spec.cjs`
- `tests/browser/live-quick-events.spec.cjs`
- `tests/browser/coach-console.spec.cjs`
- `tests/browser/coach-quick-actions.spec.cjs`

## Taze doğrulama sonuçları
| Kontrol | Sonuç |
|---|---|
| `npm test` | **114 geçti, 0 hata** |
| Hızlı olay + hızlı dokunuş tarayıcı testleri | **27 geçti, 0 hata** (desktop, phone, fold-open) |
| Önceki koç konsolu testlerinin güncel akışa uyarlanmış hali | **21 geçti, 0 hata** |
| `npm run build:vercel` | **Başarılı; 60 modül, 30 statik dosya** |
| Tüm Playwright regresyonu (`--workers=3 --retries=0`) | **195 geçti, 12 atlandı, 0 hata; exit code 0** (207 toplam) |

**Regresyon notu:** İlk tam koşuda 183 geçti / 12 başarısız / 12 atlandı. Başarısızlıkların tümü yeni UX öncesindeki manuel kaydetme ve onay akışını bekleyen dört eski testin desktop, phone ve fold-open tekrarlarından kaynaklanıyordu. `coach-console.spec.cjs` ve `coach-quick-actions.spec.cjs` testleri onaylanan anında kayıt davranışını doğrulayacak şekilde güncellendi; eski manuel kayıt zorunluluğu uygulamaya geri getirilmedi. Ardından tam regresyon 195/195 çalıştırılan senaryoda başarılı tamamlandı.

## Yayın öncesi sınırlar
- Tarayıcıdaki **phone/fold-open emülasyonu**, fiziksel Samsung Galaxy Z Fold7 testinin yerine geçmez.
- Gerçek dokunma hedefleri, saha kenarında güneşli ortam okunabilirliği, uzun maç boyunca ekranın açık kalması, çevrimdışı kayıt ve geri dönüş senaryoları fiziksel cihazda ayrıca kabul edilmelidir.
- 12 atlanan testin kapsamı ayrıca incelenmeli; atlanan kontroller başarılı kabul edilmemelidir.
- F.19 kodu hâlâ commit edilmemiş çalışma dosyaları içerir. GitHub `main`, Vercel üretim ve Play Store'a yayın yapılmadı.
- Yerel yapılandırmalarda daha önce bildirilen düz metin OpenRouter anahtarı riski ayrı güvenlik işi olarak çözülmelidir; hiçbir anahtar bu rapora alınmadı.

**Durum:** Geliştirme ve otomatik test kapıları geçti; fiziksel cihaz kabulü ile yayın kararı açık.

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

## 6 Kasım 2026 takip notu

- **Güvenlik tespiti (bağımsız okuma denetimi):** Depo tarafı temiz — çalışma ağacı, `web/`/`public/` çıktıları, `.vscode/` içerikleri ve Git geçmişi düz metin OpenRouter anahtarı içermiyor. Anahtar malzemesinin bulunduğu yerel dosyalar: `D:\beyin2\APİLER\NVIDIA APİLER.txt` ve `D:\beyin2\Projeler\KulupMerkezi\Calisma\openroutterapikey.txt` (değerler maskelemeyle raporlandı; geçmişten de çıkarım yapılmadı). Bu iki dosya artık `D:\beyin2\.gitignore` kurallarıyla versiyonlamaya kapalı; doğrulama `git check-ignore` çıktısıyla kaydedildi. Açık kullanıcı eylemi: OpenRouter üzerinde bu anahtarların döndürülmesi (revoke) ve yerine geçecek yeni anahtarın yalnızca GitHub Secret olarak tanımlanması. Bu adım tamamlanmadan yukarıdaki "ayrı güvenlik işi" satırı "çözülmüş" sayılmaz.
- **Atlanan 12 test:** Statik analiz sonucu — altı senaryonun seçilmiş profilde çalışıp diğer iki profilde atlanan 12 koşullu tekrarıdır: `match-drafts` (kopyalama), `play-store-feature` (mağaza görseli), `play-store-screenshots` (liste ekranları), `updates` (güncelleme protokolü) ve `zfold7` iç/dış ekran ölçümleri. Koşan profildeki iddiaların gerçek davranışı doğruladığı ayrıca kontrol edildi; atlanan testlerin arkasında gizli bir eksik yok. Gard ifadeleri `test.skip(...)`, `playwright.config.cjs` üç profili (desktop/phone/fold-open) ile eşleşiyor.
- **Canlı maç "Diğer" paneli kök-sorun düzeltmesi:** Panelin `position:fixed` kaplaması açıkken üst konsol düğmelerini (Saati duraklat, Devreyi bitir, Su molası, hızlı olaylar) dokunma akışında kesiyordu; `live-report-tick` (3 profil) ve `coach-quick-actions` sakatlık/su molası (phone) senaryoları 45 sn zaman aşımıyla düşüyordu. Panel akış içi konuma alındı ve `.main`/`.page` taşmaları `auto` yapıldı; kapalı panelde hiçbir düzen değişmedi. Doğrulama: etki alanındaki 6 spec × 3 profil = 48 test 0 başarısız (6 Kasım 2026).
- **İnceleme takibinden ertelenen işler (yorum yok, küçük düzeltme yok):** (1) `web/matchstudio-premium-next.css` dock kurallarındaki yığılma/mükerrer seçiciler (`:101, :155, :244, :285, :305, :326-336` çevresi) tek doğruluk kaynağına indirilebilir; mevcut kaskad tüm düzen testlerinde yeşil, bu nedenle refactor ayrı iş. (2) CSV önizlemede onay düğmesi etkinliği state yerine DOM'a bağlı (`src/main.js`): modal açıkken nadir bir yeniden çizimde kosmetik senkron kayması mümkün; veri hataya kapalı. (3) CSV oyuncu aktarımı hedef grubu her zaman ilk gruptan (`state.data.groups[0].id`) alır; `state.filterGroup` tutarlılığı ayrı değerlendirilecek.
- **Açık taslak PR durumu:** `daricagucusk/Match-Studio` deposunda 6 açık taslak PR var: #1, #4, #5, #17, #18 ve #30. #30 ("Eski PWA arşivlerini...temizle") bu ağaçtaki işle aynı hedefe yönelik: iki eski ZIP çıkarımı ve sentetik fixture yaklaşımı benziyor, ama uygulama ayrı (`tools/create-test-fixture.py` ekli, `verify.yml` ve `evidence/reviews/2026-10-22/INCELEME.html` dokunuşları var). Kapatma ve push kararları kullanıcı yetkisindedir; PR taşımak yerine bu çalışma ağacı aynı amacı kendi test setiyle karşılar.


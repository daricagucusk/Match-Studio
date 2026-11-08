# Proje Kararları

Bu dosya kesinleşmiş ve gelecekteki çalışmaları etkileyecek kararları kaydeder. Geçici fikirler veya henüz onaylanmamış seçenekler buraya yazılmaz.

| Tarih | Karar | Gerekçe | Durum | Etkilediği alanlar |
|---|---|---|---|---|
| 2026-11-02 | Web girdileri `web/`, geçmiş kanıtlar `evidence/`, konu belgeleri `docs/` altında tutulur; yeni test görselleri `test-results/reviews/` içine yazılır. | Kullanıcının klasör sadeleştirme talebi; kaynak, çıktı ve kanıt ayrımı. | aktif | Derleme, sunucu, paketleme, test ve belge yolları; ayrıntı `../docs/STRUCTURE.md` |
| 2026-11-02 | Birlesik-Aday ana kaynak olarak korunur; F.16 yenilikleri ve kullanıcı Stitch tasarımları seçici birleştirmeyle F.17 sürümüne alınır. | Kullanıcının tek sürüm, uzaktan erişim ve görsel entegrasyon talebi. | değiştirildi | Kaynak deposu, web yayını, DESIGN.md ve erişim rehberi |
| 2026-11-05 | `Birlesik-Tek-Surum` F.18 temeli, F.19 değişiklikleri ve geri yükleme önizlemesi için yerel birleşik adaydır. | Kullanıcının çalışmaların tek sürümde toplanması isteği; eski kaynaklar ve kanıtlar başlangıçta korunmuştur. | değiştirildi | Yerel çalışma kaynağı; canlı yayın ve Play için ayrı doğrulama gerekir. |
| 2026-11-06 | Tek aktif geliştirme kaynağı `Calisma/Birlesik-Tek-Surum`dur. Eski sürüm ZIP'leri ve yinelenen açılmış kaynaklar kalıcı temizlenir; testler geçici PWA örneği üretir. | Kullanıcının tek sürüm ve yedeksiz temizlik talebi. | aktif | Yerel kaynak, test altyapısı, VS Code görevleri; GitHub/main ve canlı yayın değiştirilmez. |
| 2026-11-06 | Release testleri production çıktısını sentetik fixture ile üretir; `evidence/baseline` eski ZIP'leri kaldırıldı, `app.bundle.js` + `provenance.json` tarihsel kanıt olarak korunur. | ZIP bağımlılığı 6 Kasım klasör sadeleşmesiyle kırılmıştı; yeniden üretilebilir testlere geçildi. | aktif | `tests/release.test.cjs` (fixture bu testte üretilir), `evidence/README.md` |
| 2026-11-06 | `.vscode/tasks.json` sürüm denetimi dışı bırakılır (mutlak `C:\Users\aearo` yolu içerir); `extensions.json` sürüm denetimine girer. | Görev dosyası makineye özeldir; paylaşılabilir kısmı extensions dosyasıdır. | aktif | VS Code yapılandırması, git commit kapsamı |
| 2026-11-06 | PR #30 açık taslak olarak kalır: bu ağaçtaki sentetik fixture işi aynı amacı (eski PWA arşiv bağımlılığından çıkış) kendi test setiyle karşılar; PR taşınmaz veya otomatik kapatılmaz. | Aynı hedefe iki ayrı uygulama var; push/kapatma kararı kullanıcı yetkisindedir. | aktif | `tests/release.test.cjs`, `evidence/baseline`, GitHub PR #30 |
| 2026-11-06 | Canlı maç "Diğer" paneli akış içi panelde gösterilir (kaplama `position:fixed` kaldırıldı) ve açık durumu oturum boyunca korunur (`state.liveDetailsOpen`). | Kaplama üst konsol düğmelerini dokunma akışında kesiyordu; akış içi panel kontrolleri kapatmaz. | aktif | `web/matchstudio-premium-next.css`, `src/main.js`, `src/app/views/live-match-clock.js`, canlı maç tarayıcı testleri |
| 2026-11-06 | Yeni Maç formundaki ayrı "Maçın yaş kategorisi" seçimi kaldırılır; yeni maçın kategorisi seçilen Takım / Grup kaydından türetilir. Mevcut maçın grubu değişmiyorsa kayıtlı kategori korunur. | Antrenörün aynı bilgiyi iki kez girmesini önlemek ve eski maç verilerini korumak. | aktif | `src/app/views/match-operations.js`, `src/main.js`, maç formu tarayıcı testleri |
| 2026-11-07 | F.19 için imzalı upload AAB versionCode 2 olarak üretildi; Play App Signing SHA-256 `49:8F:91:...:C0:4F` assetlinks ve Digital Asset Links API ile doğrulandı. AAB henüz Play Console'a yüklenmedi. | Paket kimliği, hedef API 36 ve gerçek Play imza sertifikası doğrulandı; yükleme ve test/üretim adımları hesap sahibinde. | aktif | `android/twa-manifest.json`, `docs/play/release-monetization.json`, `docs/play/PLAY_CONSOLE_READY_2026-11-07.md` |
| 2026-11-07 | Web F.19 sürümü, tam regresyon sonrası `main` üzerinden Vercel production'a alınacak; TWA canlı siteyi yüklediği için Android paketi ayrıca yeniden yayınlanmaz. | Play AAB'si web kodunu içermez; mağaza sürümünün güncel web sürümünü göstermesi gerekir. | aktif | Vercel production, `main`, `web/` |
| 2026-11-08 | Ayrı `feat/abacus-budget-router-20261108` geliştirme worktree'sinde Abacus görev yönlendirme prototipi oluşturulur; varsayılan dry-run, açık premium/ücretli izin ve yerel kredi önkontrolü zorunlu, uygulama kodunu yazma/yayınlama otomatik yapılmaz. | Basic kredi kullanımını korumak, mevcut F.19 ve GitHub/Vercel üretim sürümlerini değiştirmeden model rotasını doğrulamak. | pilot / kabul bekliyor | `tools/ai_budget_router.py`, `config/ai-budget-policy.json`, `docs/ai/ABACUS_BUDGET_ROUTER.md` |

## Kullanım kuralları

- Yeni kararları tarih ve kısa gerekçeyle ekleyin.
- Bir karar değiştiğinde eski kaydı sessizce silmeyin; durumunu değiştirin ve yeni kararı ayrı kayıt olarak ekleyin.
- `Durum` alanında `aktif`, `değiştirildi`, `iptal edildi` veya `tamamlandı` gibi açık ifadeler kullanın.
- Yalnızca gelecekte tekrar bilinmesi gereken kararları kaydedin.

# KONSOLİDE DENETİM VE ÜRETİM PLANI — 2026-11-08 (F.19 RC.1)

Kaynak: gerçek kod incelemesi (tüm dosya yolları doğrulanmış), 55 gerçek ekran görüntüsü
(`test-results/reviews/audit-360/`), ölçülmüş performans verileri ve geçen test paketleri.
Önceki varsayımsal 360° raporunun yerine geçer.

## 1. TEKNİK DURUM (kanıtlı)

| Alan | Bulgu | Kanıt |
|---|---|---|
| Mimari | Vanilla JS + IndexedDB + SW PWA; React/Vite/TS yok | `tools/build.cjs` 60 modül tek bundle, `package.json` bağımlılıkları yalnız Playwright+fake-indexeddb |
| Sürüm | 2.6.8-f.19-rc.1 | `package.json:3` |
| Rotalar | 11 rota: dashboard, matches, players, live, roster, team, pitch, studio, weekly, analytics, archive | `src/main.js:339-346` |
| Güvenlik | Katı CSP, şifreli yedek, kulüp anahtarı doğrulaması | `tools/security-headers.cjs`, `src/storage/db.js:6` |
| Birim test | 129/129 PASS | `npm test` (2026-11-08) |
| Playwright | 219 geçti, 0 başarısız, 12 skip (görünüm filtresi) | `npx playwright test` |
| Performans | FCP 68–84 ms, kabuk 91–153 ms (5 görünüm) | `perf-audit-results/raw-metrics.json`, `$TMPDIR/perf-lean.json` |
| Düzen | 0 yatay taşma, 0 sayfa hatası (5 görünüm × 11 rota) | `test-results/reviews/audit-360/layout-report.json` |

## 2. BU OTURUMDA BİRLEŞTİRİLENLER (tek kaynak)

- `origin/main`: F.19 skor-geri alma hotfix (PR #32), test backport (PR #33), CI kota guard (PR #34)
- `origin/work/birlesik-tek-surum-20261105`: aynı CI guard
- `Agent-Router-Isolated-20261108` deposu: Abacus bütçe router pilotu (309+247 satır, 26/26 test OK)
- 3 merge çakışması "birleşik dal daha güncel" ilkesiyle çözüldü
- Eski `tests/live-undo-correction.test.cjs` kaldırıldı (kapsam `tests/correction-undo.test.cjs` içinde)

## 3. DÜZELTİLEN EKSİKLER (bu oturum, kanıtlı)

1. **a11y — kenar çubuğu gizlilik bağlantısı** 12px → 35px dokunma alanı (ölçüldü)
2. **a11y — açılış (boot/onboarding) gizlilik bağlantısı** 15px → 35px
3. **a11y — haftalık pano onay kutusu** 23px → 24px (WCAG 2.5.8 tam eşik)
4. **tools/perf-audit.cjs** — 3 kırılma düzeltildi (tanımsız `page`, FCP kilitlenmesi, alan referansı); artık uçtan uca çalışıyor
5. **tools/audit-screens.cjs** — onboarding sırası düzeltildi (önce kulüp tohumlama, sonra shell bekleme)

## 4. RİSK VE ÖNCELİK MATRİSİ

| Öncelik | Sorun | Kanıt | Çözüm | Kabul kriteri |
|---|---|---|---|---|
| P2 | İlk yükleme ~2,5 MB (2 font + 459 KB bundle) | `perf-lean.json` net.transferKB=2588 | Fontları `font-display:swap` + alt kümeleme; bundle bölmesi | Mobil ilk yükleme < 1,5 MB |
| P2 | `perf-audit.cjs` çıktısında FCP/LCP N/A (observer ölçmez) | `raw-metrics.json` | Bunun yerine `perf-lean` yöntemi kullanıldı; vitals ölçümü ayrı iş | FCP/LCP alanları dolu rapor |
| P3 | 32–36 px kompakt hedefler (depth-role, toolbar select) — WCAG 24px alt sınırının üstünde, 40px idealin altında | layout-report.json | Premium fazda tek boyut değişkeni | Takım derinliği dokunma hatası şikâyeti olmaması |
| P3 | Skip'li 12 Playwright testi görünüm filtresi nedeniyle | pw log | Görünüm matrisi gözden geçirilecek | Skip sayısı < 5 |

Kritik (P0/P1) açık sorun **yok**: skor doğruluğu, veri bütünlüğü, güvenlik ve düzen testleri yeşil.

## 5. PREMİUM TASARIM SİSTEMİ (mevcut temel üzerine)

Mevcut altın/obsidyen sistem (`web/matchstudio-premium-next.css`, 456 satır) tutarlı ve
önceden tamamlanmış durumda. Bu oturumda görüntü incelemesi yeni bir yenileme gerektirmedi.
Faz 1'de uygulanacak küçük rafine listesi:

- Tipografik hiyerarşi: `--ms2-text` ailesini iki ağırlıkla sınırlama (800/600)
- Kompakt hedefler için tek `--target-min` değişkeni (32px mobil, 40px masaüstü)
- Canlı konsol skor sayılarında `tabular-nums` genişletme (mevcut kısmi)
- Onboarding ekranına (`.ms-onboarding`) premium sistemin ışık/vurgu token'ları

## 6. TEST EDİLEBİLİR ÜRETİM MASTER PLANI (fazlar)

**Faz 1 — Rafine (1 hafta):** Yukarıdaki 4 tasarım maddesi + font optimizasyonu.
Kabul: `npm run check` yeşil; mobil ilk yükleme < 1,5 MB; ekran denetimi 0 taşma.

**Faz 2 — Dayanıklılık (1-2 hafta):** `perf-audit` FCP/LCP ölçümü; skip'li testlerin
görünüm matrisi; `audit-screens` betiğinin `npm run check:audit` olarak eklenmesi.
Kabul: tüm vitals alanları dolu; skip < 5; denetim komutu pakette.

**Faz 3 — Yayın (kod değişikliği sonrası):** `npm run check:play:strict` → imzalı AAB →
Play konsol kapalı test kanıtı (mevcut akış `docs/play/PLAY_RELEASE_STATUS_2026-11-07.md`).
Kabul: kontrolcü script 0 hata; gerçek cihaz kabulü (mevcut F18 protokolü).

Her fazın kodu değiştirmesi halinde: `npm test` + `npx playwright test` + ekran denetimi
yeniden koşulur — "test ve derleme geçmeden iş bitmiş sayılmaz" kuralı.

## 7. SINIRLAR (bu oturum)

- Push, PR merge, production, Play Store güncellemesi yapılmadı — onay bekliyor.
- Gerçek sporcu verisi kullanılmadı; sentetik "Denetim Spor" kulübü (test-store, silinebilir).
- Yerel test gerçek cihaz/Play kabulü değildir.

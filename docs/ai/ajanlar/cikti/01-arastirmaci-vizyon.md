model: GEMINI_4_ARGON | cwd: D:\beyin2\Projeler\MatchStudio\Calisma\Birlesik-Tek-Surum | conversation: 16c74d25d
title: Match Studio Vizyonu
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Bash(command="cd 'D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Sur)
  ✗ Bash declined: blocked by the deny rule Bash
  ● Bash(command="cd 'D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Sur)
  ✗ Bash declined: blocked by the deny rule Bash
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Bash(command="ls 'D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Sur)
  ✗ Bash declined: blocked by the deny rule Bash
  ● Read(path="C:\\Users\\aearo\\.abacusai\\projects\\D-beyin2-Projeler-Ma)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su, limit=80)
  ● Read(limit=60, path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(limit=15, path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(limit=500, path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
  ● Read(limit=40, path="D:\\beyin2\\Projeler\\MatchStudio\\Calisma\\Birlesik-Tek-Su)
Credits used: 20.53

To resume Session:
abacusai -p --resume 16c74d25d
Bash bu oturumda izin kuralıyla engelli; yalnızca dosya okuma araçlarıyla ilerliyorum (plan modu, salt okunur).# Match Studio — Araştırma ve Vizyon Raporu (Ajan 1 / Argon, 2026-11-09)

## Durum Özeti

Tek kaynak dal `work/birlesik-tek-surum-20261105`, sürüm `2.6.8-f.19-rc.1`: vanilla JS + IndexedDB + Service Worker tabanlı PWA, 11 rota (`src/main.js:339-346`), React/Vite/TS yok (`docs/audit/KONSOLIDE-DENETIM-20261108.md`). Yapı: `src/` (domain, storage, app, pitch, team, posters, pwa), `tools/` (build.cjs, serve.cjs, security-headers.cjs, perf-audit.cjs, audit-screens.cjs, check-play-readiness.cjs, yeni live-review*.cjs), `tests/` (node:test birim + tests/browser Playwright), `docs/` (audit, play, ai/skills, history, plans).

Son 15 commit'i `git log` bu oturumda bash izin reddi nedeniyle çalıştıramadım; `.git/logs/HEAD` reflog'undan okudum: a11y dokunma alanı düzeltmeleri (WCAG 2.5.8), perf-audit/audit-screens onarımları, bütçe router pilotunun birleşmesi, konsolide denetim-üretim master planı, F.19 Play kanıtı — yön **kanıta dayalı kalite + yayın hazırlığı**.

Test: son yeşil kanıt 8 Kasım (129/129 birim, Playwright 219 geçti/0 başarısız/12 skip); 9 Kasım `npm test` 130/1 FAIL — `tests/security-headers.test.cjs:30`, üretilen `web/sw.js` içindeki `device-test.html` ağ istisnası "diagnostik precache dışı kalır" iddiasıyla çelişiyor (kaynak: `src/pwa/service-worker.js`). Çalışma ağacında commit edilmemiş değişiklikler duruyor.

Dış standartlar (kaynak adıyla, bu oturumda çevrim içi doğrulanmadı — metin bilgisi): **W3C WCAG 2.2, SC 2.5.8 "Target Size (Minimum)"** ≥24×24 CSS px (AA); **W3C Service Workers** ve **Web App Manifest** + MDN PWA önbellek yaşam döngüsü; SHA-256 bütünlük denetimi SubtleCrypto ile projeye özgü; **OWASP Secure Headers Cheat Sheet** (CSP `default-src 'self'`, `frame-ancestors 'none'`, X-Content-Type-Options, HSTS); **Google Play Console Yardımı** kapalı test gereksinimi 12 testçi × 14 gün (kişisel hesap koşulu doğrulanmadı); **Digital Asset Links / Chrome TWA** dokümanı.

## Vizyon Temaları

1. **İlk yükleme performansı.** Neden şimdi: ölçülmüş ~2,5 MB ilk yükleme (2 değişken font + 459 KB bundle) tek perf kalemi (perf-lean.json). Sorun: yavaş mobil ağda uzun ilk açılış, antrenörün saha kenarında beklemesi. Göstergesi: mobil ilk yükleme <1,5 MB, FCP/LCP alanları dolu rapor.
2. **Yayın olgunluğu (Play + Vercel).** Neden şimdi: imzalı AAB versionCode 2 hazır; kalan blokerler kullanıcı işlemleri (kimlik doğrulama, imza raporu, Türkiye/testçi seçimi). Sorun: kulübün güvenilir mağaza/dağıtım kanalı yok. Göstergesi: kapalı testte 12 testçi opt-in + 14 günlük ölçümün tamamlanması, sıfır çökme ile üretim başvurusu.
3. **Çevrimdışı güvenilirlik ve veri dayanıklılığı.** Neden şimdi: SW atomik SHA-256 precache güçlü; ama offline-refresh kalıcılık denetimi otomatik değil (proje-hafizasi.md blok 1). Sorun: saha kesintisinde veri kaybı korkusu. Göstergesi: Playwright network-emulation ile offline kalıcılık testi yeşil; senaryo başına kayıp 0.
4. **Erişilebilirlik ve premium rafine.** Neden şimdi: 24px taban sağlandı; 32–36px kompakt hedefler ve tek `--target-min` değişkeni master planda (master planı §5). Sorun: maç akışında küçük hedeflere yanlış dokunuş. Göstergesi: ekran denetiminde 0 ihlal + 0 yatay taşma, skip <5.
5. **Ölçülebilir kalite kapısı ve ajan ekonomisi.** Neden şimdi: bütçe router pilotu canlı ama denetim komutları paketleşmedi; kırmızı test sinyali bozuluyor. Sorun: kalite doğrulaması elle, kredi harcaması denetimsiz. Göstergesi: `npm run check` + `check:audit` tek komutla yeşil; pilotun karar kaydıyla kalıcılaşması.

## Riskler

| # | Risk | Etki × Olasılık |
|---|---|---|
| 1 | Bundle/font büyümesi tek bundle mimarisinde yeni özelliklerle sürer, ilk yükleme hedefi kaçar | Yüksek × Orta |
| 2 | `security-headers.test.cjs:30` kırmızı kalırsa "testler yeşil" kültürüne sinyal yorgunluğu | Orta × Yüksek |
| 3 | Play kimlik doğrulama gecikmesi + 12 testçi × 14 gün kuralı mağaza çıkışını aylar kadar geciktirir | Yüksek × Orta |
| 4 | OpenRouter anahtar döndürme tamamlanmadan yayın gündeme alınırsa ifşa edilmiş anahtar yayına taşınır (context/hedefler.md) | Yüksek × Düşük |
| 5 | Test ortamı blokları (offline/360px/fixture import) gerçek cihaz farklarını gizleyip yanlış güven yaratır | Orta × Orta |

## Yazar İçin Öncelikli İşler

1. `tests/security-headers.test.cjs:30` ile `src/pwa/service-worker.js`'teki `device-test.html` ağ istisnası arasındaki çelişkiyi çöz (istisnayı `tools/runtime-files.cjs` diagnostics listesinden türet veya testi ağ-istisnasını kabul edecek biçimde daralt) ve `npm test`'i yeşile getir.
2. `web/fonts/` altındaki iki değişken fontu alt kümeleyip `font-display:swap` ekle; bundle bölmeyi `tools/build.cjs` + `tools/runtime-files.cjs` üzerinde değerlendir.
3. `tools/perf-audit.cjs`'e PerformanceObserver tabanlı FCP/LCP ölçümünü ekleyip perf-lean yöntemiyle raporu birleştir.
4. `tests/browser/app.spec.cjs` ve `tests/browser/security-a11y.spec.cjs`'teki skip'li 12 testin görünüm matrisini gözden geçir.
5. `tests/browser/` altına Playwright network-emulation ile offline-refresh veri kalıcılığı testi ekle.
6. `tools/audit-screens.cjs`'i `package.json`'da `check:audit` komutu olarak paketle.
7. Çalışma ağacındaki commit edilmemiş değişiklikleri (`src/pwa/`, `tests/`, `tools/live-review*.cjs`, `context/`) kullanıcıyla gözden geçirip ayrışmış commit'lere hazırla.

## Doğrulanmamış Varsayımlar

- **PR #35 durumu çelişkili:** bağlam kaydı 2026-11-09'da `main`'e birleştiğini (`c205538`) söylüyor; oturum ortamı PR'ı "aktif" gösteriyor. Doğrulama bash/Git izin reddi nedeniyle yapılamadı.
- `npm test` 130/1 FAIL ve Playwright 219/0/12 skip sayıları 8–9 Kasım kayıtlarına dayanır; bu oturumda yeniden çalıştırılmadı.
- Google kapalı test kuralının yalnız 13 Kasım 2023 sonrası kişisel geliştirici hesapları için geçtiği doğrulanmadı.
- Background Sync API'nin Safari/iOS desteğinin yokluğu (offline senkron teması için) doğrulanmadı.
- Vercel production'ın `main` ile senkron olduğu varsayımı doğrulanmadı.
- Kredi maliyet ölçümleri (Argon 1,34 / Sonnet 1,31 kredi) kullanıcı defterinden; bağımsız doğrulama yok.

---
*Sınırlar uyuldu: kredi harcayan çağrı başlatılmadı, alt ajan açılmadı, `.env`/sır okunmadı, çalıştırılmayan hiçbir doğrulama "geçti" olarak iddia edilmedi. Çıktı yalnızca ekranda; dosya yazılmadı.*

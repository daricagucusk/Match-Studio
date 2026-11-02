# MATCH STUDIO — Üretim Optimizasyonu ve Tamamlama Planı (2026-11-02)

## 1. Kaynak ve sınırlar
- Seçilmiş yerel çalışma kaynağı: `D:\beyin2\Projeler\MatchStudio\Calisma\Birlesik-Aday`.
- Depo: `daricagucusk/Match-Studio` (özel); ana dal `main`, çalışma dalı `feat/play-store-readiness-managed-20261101`, incelenen HEAD `0b25ee416b67644fb6c0b7622bc241dedfab6fd7`.
- Paket sürümü: `2.6.8-f.13`. Paket sürümü canlı sürüm veya Play Store onayı demek değildir.
- Başlangıçta çalışma ağacında izlenen inceleme ekran görüntüleri, ölçümler ve `tests/static-export.test.cjs` değişiklikleri ile izlenmeyen `docs/play/PLAY-HANDOFF-20261101.md` vardı. Bunları körlemesine geri alma, commit'e ekleme veya üzerine yazma.
- `main`, canlı Vercel, Play Console, gerçek kulüp/sporcu verileri, IndexedDB ve gizli imza anahtarları korunur. Bu plan aşamasında push/merge/deploy yok.

## 2. Beyin2 ve agent bağlamı
- Sırasıyla oku: `D:\beyin2\AGENTS.md`, proje `AGENTS.md`, `D:\beyin2\.beyin-system\working-sources.json`, `README.md`, `docs/RELEASE.md`, `docs/VALIDATION.md`, `docs/play/PLAY-HANDOFF-20261101.md`.
- İlgili yerel yardımcılar: `D:\beyin2\.agents\skills\codex-proje-senkron\SKILL.md`, `D:\beyin2\.beyin-tools\recall.py`, `.superpowers/sdd/` ve `D:\beyin2\docs\superpowers\plans\`. Önce görev kapsamıyla eşleşen kaynağı incele; tüm vault'u sohbete ya da dış servislere kopyalama.
- Depodaki `AGENTS.md` kaynak-kod düzeni, veri güvenliği, PR/CI ve fiziksel cihaz kabulünde esas kurallarını korur.
- Bağlı araçlar/entegrasyonlar kullanılmadan önce yetki ve sağlık kontrolü yapılmalı. MCP bağlantısını sırf mevcut diye güvenilir/çalışır sayma.

## 3. Uygulanmış VS Code / Codex optimizasyonu
- Kullanıcı Codex ayarı (`C:\Users\aearo\.codex\config.toml`): `model = "gpt-6.1-sol"`, `model_reasoning_effort = "high"`. Önceki ayar `config.toml.before-prod-optimization-20261102` içine yedeklendi.
- Salt-okunur CLI doğrulaması: `OpenAI Codex v0.166.0`, `gpt-6.1-sol`, `high`, `OPTIMIZED_OK` ve çıkış 0. Bu, mevcut VS Code sohbetinin modelini otomatik değiştirdiğini kanıtlamaz; yeni sohbet ve VS Code Reload Window ile ayrıca kontrol et.
- Çalışma alanı `.vscode/settings.json`: `node_modules`, `dist`, `test-results` için izleme/arama dışlama; terminal 10.000 satır. Kaynak klasörleri ve `docs/` aranabilir kalır.
- Model politikası: karmaşık mimari/debug/çok-modüllü kod için Sol High; kısa ve tekrarlayan görevlerde Sol Medium; kritik güvenlik/mimari son incelemesi gerektiğinde Astra High/XHigh ancak gerçek hesap erişimi ve kota uygunluğuna göre. Model değiştirmek otomatik kalite garantisi değildir.
- Otomatik sınırsız izin / sandbox kapatma yok. Kaynak değişikliği, komutlar ve üçüncü taraf servislerde doğrulanabilir güvenlik sınırları uygulanır.

## 4. Doğrulanmış mevcut durum
- Yerel `npm test`: **84/84 PASS**, çıkış 0 (2026-11-02).
- Yerel `npm run check:play`: **10 kontrol / 4 engel**, hazırlık modunda çıkış 0; yeşil çıkış Play'e hazır anlamına GELMEZ.
- GitHub SHA `0b25ee4` üzerindeki `Verify Match Studio release` sonucu **failure**. Hata `npm run release` içindeki desktop Playwright sürükleme kontrolü: `tests/browser/app.spec.cjs:30`; sürükleme sonrası beklenen ilk oyuncu değişimi gerçekleşmedi. Bu runtime kusuru veya kararsız test etkileşimi olabilir, PR #29 bunu hedefliyor.
- Mevcut PR sırası: #27 gizlilik/Play hazırlığı -> #28 kulüpler arası yanlış şifreli yedek geri yükleme engeli -> #29 masaüstü pitch drag test istikrarı. #29 taslak ve #28 üstüne kurulmuş; CI/inceleme tamamlanmadan birleştirme yok.
- Son alınmış `docs/play/PLAY-HANDOFF-20261101.md` notunda ayrıca iki uzak HTTP 404: canlı `/privacy.html`, `/.well-known/assetlinks.json`; yeniden canlı URL doğrulaması gerekir.
- Yerel `npm run test:browser` (2026-11-02): **127 PASS, 8 koşullu SKIP, 0 FAIL**, çıkış 0 (yaklaşık 5 dakika). GitHub Linux CI sürükleme hatası ayrı durum olarak açık kalır.

## 5. Öncelikli üretim paketleri

### P0 — Kaynak ve CI güvenliği
1. Yerel değiştirilmiş dosyaları SHA/diff ile kaydet, önceki çalışmayı koru. Git branch/remote/main farklarını karşılaştır.
2. PR #27/#28/#29 değişikliklerini, baz/baş SHA'larını, test kanıtlarını ve bağımlılık zincirini incele. Başka dalı körlemesine merge etme.
3. Desktop drag testini Chromium'da izole ve tekrar eden koşularla doğrula; gerçek uygulama hatası ise `src/` içinde düzelt, test kararsızlığı ise testi doğruluğu zayıflatmadan sabitle.
4. Güncel adayda `npm ci`, `npm test`, `npm run test:browser`, `npm run release`, `npm run build:vercel` ve ilgili SHA için GitHub Actions PASS kanıtını topla.

### P1 — Masaüstü ürün kabulü
1. 1366/1440/1920 px masaüstünde kulüp, grup, sporcu, maç, kadro, saha/sürükleme, canlı saat, oyuncu değişikliği, rapor, afiş ve dosya dışa/geri aktarmayı uçtan uca doğrula.
2. Klavye odağı, modal kapatma, geri alma, yanlışlıkla silme, yatay taşma, anlaşılır Türkçe hata durumları ve performans darboğazlarını kayda al.
3. Çocuk/gerçek sporcu verilerini test fixture ve ekran görüntülerine taşıma; yalnızca sentetik veriler kullan.

### P1 — Veri koruma ve offline doğruluğu
1. PR #28 kapsamı: farklı kaynak kulüpten dolu hedefe yedek aktarmayı reddetme, aynı kulüp kurtarma ve boş kulüp içe aktarımını koruma.
2. Şifreli yedek, geçmiş JSON sürümleri, silinmiş oyuncu tombstone, çok sekme, offline ve sürüm yükseltme geri dönüş senaryolarını tekrar çalıştır.
3. Şema/origin değişirse ayrıca yedek-migrasyon-rollback testi zorunlu.

### P2 — Fold7 ve Android kabul
1. Gerçek Samsung Galaxy Z Fold 7 kapalı/açık durumlarda saha dokunuşu, kadro, maç yönetimi, çift sekme/offline, kurulum, TWA ve yedek kurtarmayı test et.
2. Chromium responsive ekran testleri fiziksel cihaz testinin yerine geçmez.

### P2 — Play Store yayın engelleri
1. Play Console uygulama kaydı / paket kullanılabilirliği; hesap doğrulaması.
2. Gerçek Play App Signing SHA-256, doğrulanmış `assetlinks.json`.
3. İmzalı AAB, targetSdk 36 ve bağımsız imza inceleme raporu.
4. Canlı HTTPS gizlilik politikası ve assetlinks uç noktalarında 200 + gerçek içerik kontrolü.
5. Data Safety, kapalı test gereksinimleri, mağaza ekranları/logo ve yayın kanıtları.
6. İzin, başarılı CI ve gerçek cihaz kabulü olmadan `main` merge / canlı deploy / Play yayın yok.

## 6. Her agent görevinin çalışma protokolü
1. Başlangıç: geçerli branch + SHA + `git status` + ilgili `AGENTS.md` ve görev belgeleri.
2. Bir seferde tek konu, açık kabul ölçütü, değişiklikten önce test/kanıt; yalnızca zorunlu dosyalara müdahale.
3. Her aşamadan sonra ilgili hedefli test -> Node -> tarayıcı -> paket bütünlük kontrolü.
4. Çıktı: değişen dosyalar, test sayısı ve başarısızlık, veri migrasyon etkisi, engeller, Git commit/PR (oluşturulmuşsa), rollback ve sonraki öncelik.
5. Kota/bağlantı kesilirse güncel durumu ve son doğrulanmış SHA'yı yerel rapora işle; başka modele geçilirse aynı kanıt ve diff tabanından devam et. Sessizce başka repo, dal veya canlı ortama geçme.

## 7. VS Code yeni agent oturumu için başlangıç mesajı
> `D:\beyin2\Projeler\MatchStudio\Calisma\Birlesik-Aday` kanonik çalışma alanında çalış. `D:\beyin2\AGENTS.md`, proje `AGENTS.md`, `docs/plans/PRODUCTION-OPTIMIZATION-PLAN-20261102.md`, `docs/play/PLAY-HANDOFF-20261101.md` ve ilgili Beyin2 bağlamını oku. Önce HEAD, mevcut değişiklikler, PR #27/#28/#29 ve CI/test durumunu doğrula. İlk iş olarak P0 masaüstü sürükleme/CI konusunu izole et. Ana dalı, canlı sürümü ve gerçek kulüp verilerini koru; secrets/kişisel veri paylaşma. Her aşamayı testle kanıtla; yalnızca test edilen değişiklikleri raporla. Kod ve ayarları sırf daha fazla değişiklik yapmak için değiştirme.

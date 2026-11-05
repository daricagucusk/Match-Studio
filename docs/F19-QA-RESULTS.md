# Match Studio F.19 RC1 — QA Kanıtı ve Açık Riskler
Tarih: 2026-11-05
Temel canlı sürüm: F.18 RC1, Git `6470d9e31322f9b687a33137a0611500fdd84110`.
Yeni dal: `feat/f19-position-roles-20261105` — **üretime dağıtılmadı**.

## Doğrulananlar
- `npm test`: **112/112 başarılı** (05.11.2026; sürümün son inceleme oturumunda).
- `npx playwright test tests/browser/f19-coach-position.spec.cjs`: **9/9 başarılı**, masaüstü, telefon ve Fold açık ekran profilinde. Stoper mevkilerinin ayrılması, rol kalıcılığı, 3.+ alternatifler, saha görünürlüğü ve oyuncu seçimi konum koruması.
- `npx playwright test tests/browser/ui-consistency.spec.cjs --project=phone`: **2/2 başarılı**.
- `npm run build:vercel`: başarılı; **59 modül** derlendi, **30 statik dosya** üretildi.
- `tests/browser/app.spec.cjs` masaüstü tam oyuncu→maç→kadro→canlı→afiş akışı, font ve iki animation-frame sonrası düzen sabitlenince tek başına testte **1/1 başarılı**. Bu düzeltme yalnızca testte uygulanmıştır; drag-and-drop üretim kodu değişmedi.
- F.18 orijinal masaüstü tam iş akışı kendi izole çalıştırmasında **1/1 başarılı**.
- Gerçek kullanıcı/kulüp verileriyle test yapılmadı; tüm browser test verileri izole tarayıcı depolamasında.

## Açık kanıt ve yayın engelleri
- F.19 ilk tam Playwright 189-test denemesinde **175 geçti, 2 başarısız, 12 atlandı**. İlk başarısızlık masaüstü dragTo olayının kimi testlerde hiç başlamaması; ikinci başarısızlık test-trace dosyasının bulunmaması (aynı test-results dizinini eşzamanlı kullanan test süreçleri vardı). Bu sonuç son kodla tüm testlerin geçtiği anlamına gelmez.
- DragTo testinin ardından font yüklenmesini ve iki animasyon karesini bekleyen bir test sabitlemesi eklendi. Bir tekrar testi geçti; **daha fazla tekrarlı tarayıcı koşumu gereklidir**.
- F.19 kodu üzerinde tam 189-test regresyonu yeniden tamamlanmadan ve gerçek cihaz kontrolü yapılmadan **GitHub main/üretim Vercel yayınını değiştirme**.
- Z Fold7 fiziksel cihazı ile gerçek dokunma, 90 dakika maç boyunca ekran sabitliği, oyuncu değişimi, kaydırma ve sahadaki ikon okunabilirliği henüz bu turda doğrulanmadı.
- F.19 imzalı Android paket/AAB oluşturulmadı; Play Store güncellemesi yapılmadı.

## Güvenlik
- Kullanıcının `.codex/config.toml` ve `.claude/settings.local.json` dosyalarında proje içinde düz metin OpenRouter anahtarı bulundu; **anahtar burada yazılmadı**. Yerel `.git/info/exclude` kurallarına eklendi ve `git check-ignore -v` ile doğrulandı. Bu, yanlışlıkla yeni Git commit'e girmesini önler; **sırların kötüye kullanımı riskini ortadan kaldırmaz**, OpenRouter'da anahtar yenilenmelidir. Yedeklerde veya geçmişte varsa bunlar ayrıca kontrol edilmelidir.
- Global `C:\Users\aearo\.codex\hooks.json` içinde `PreToolUse/Bash` için `rtk hook claude` tanımlı. Onay ekranında doğrulanmamış hook'a güvenmeyin, `Continue without trusting` seçimi güvenli geçiştir.

## Tekrar komutları
```powershell
cd "C:\Users\aearo\Documents\MatchStudio-Android-Release-Candidate\F19-role-console-worktree"
npm test
$env:MATCHSTUDIO_TEST_PORT="8951"
npx playwright test tests/browser/f19-coach-position.spec.cjs --reporter=line
$env:MATCHSTUDIO_TEST_PORT="8952"
npx playwright test tests/browser/app.spec.cjs --project=desktop --grep "complete player" --reporter=line
$env:MATCHSTUDIO_TEST_PORT="8953"
npx playwright test --reporter=dot
```

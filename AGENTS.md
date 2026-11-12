# Codex Uyumluluk Talimatları

Bu projede ana talimat dosyası `CLAUDE.md` dosyasıdır.

- Her göreve başlamadan önce proje kökündeki `CLAUDE.md` dosyasını tamamen oku ve uygula.
- Ardından `CLAUDE.md` dosyasının yönlendirdiği kanonik `D:\beyin2\Projeler\MatchStudio\docs-ai\context\README.md` haritasını kullan.
- Proje bağlamını, kaynak yönetimini, hafıza güncellemelerini, yetki sınırlarını ve doğrulama kurallarını `CLAUDE.md` dosyasındaki tanımlara göre yürüt.
- Kullanıcı “hafızayı güncelle”, “bağlamı denetle” veya “kaynakları denetle” dediğinde `.agents/skills/proje-hafizasi/SKILL.md` becerisini kullan.
- Bu dosya yalnızca Codex uyumluluk katmanıdır; ayrıntılı proje bilgisini veya `CLAUDE.md` içeriğini burada çoğaltma.

## Codex'e özel ek talimatlar

<!--
Gerçekten gerekmedikçe bu bölümü boş bırakın.
Yalnızca Codex'e özgü ve CLAUDE.md içinde bulunmaması gereken talimatlar eklenir.
-->

## Abacus AI ekonomik ajan yönlendirmesi (izole pilot)

- Bu projenin kaynak-of-truth talimatları hâlâ `CLAUDE.md` ve `D:\beyin2\Projeler\MatchStudio\docs-ai\context\README.md` dosyalarıdır; onları geçersiz kılma. Bu bölümdeki izinler yalnız Abacus CLI içindir; Claude Code ve Codex için `CLAUDE.md` §5 geçerlidir.
- Kullanıcı model seçimi, görev planı veya kredi tasarruflu ajan devri istediğinde `docs/ai/ABACUS_BUDGET_ROUTER.md` dosyasını oku.
- İlk kontrol: `py -3 -B tools/ai_budget_router.py "GÖREV"` (dry-run, kredi tüketmez).
- Abacus CLI'ye para harcatan `--execute` ancak kullanıcının güncel cüzdan bakiyesi ve açık izniyle kullanılabilir; `--allow-premium` ayrı opt-in'dir.
- Bu sistemin `implement` rolü yazma yetkilidir: `--permission-mode accept-edits` ile `Read,Grep,Glob,Write,Edit,NotebookEdit,Bash` araçlarını kullanır; `plan` ve `review` rolleri salt okunur kalır. Push, merge, yayın ve kimlik bilgileri hiçbir rolde otomatik izin kapsamında değildir.
- `tools/ai_handoff_router.py` GitHub Issue yedekleme akışı ayrı kalır; mevcut `.jarvis/integrations.json` rotalarını değiştirme.
- Ücretli model çağrısı (Opus 5.5 / Fable 5.1 / RouteLLM) gerektiğinde `docs/ai/skills/abacus-cli-cagrisi/SKILL.md` becerisini oku ve uygula; router'ı atlayıp doğrudan `abacusai` çağırma.
- Fable 5.1 (critical tier) çağrısında ayrıca `docs/ai/skills/fable-5-1-cagrisi/SKILL.md` becerisini uygula.
- Argon (`GEMINI_4_ARGON`) çağrısında `docs/ai/skills/argon-cagrisi/SKILL.md` becerisini uygula; router bu kimliği tanımaz, çağrı `abacusai -p --model argon` ile yapılır.
- Sonnet 5.5 (`CLAUDE_V5_5_SONNET`) çağrısında `docs/ai/skills/sonnet-5-5-cagrisi/SKILL.md` becerisini uygula; çağrı `abacusai -p --model sonnet` ile yapılır.

## Abacus AI: onaysız rutin geliştirme

- Normal kod veya belge düzenlemeleri için `accept-edits` modunda yerleşik Edit/Write kullan; onay isteyen `sed -i`, `perl -pi`, toplu Bash değiştirme komutlarına geçme. Riskli komut engellenirse eşdeğer küçük Edit/Write değişiklikleriyle devam et.
- Proje izinleri `.abacusai/config.json` içinde tanımlıdır: dosya okuma/yazma/silme, `git add/commit/checkout/restore/branch/stash`, `npm`/`node`/`py` komutları, `mcp__*` bağlantıları ve `plugin__*` eklentileri izinlidir (yalnız Abacus CLI; kayıt: `kararlar.md` 2026-11-09). `.env`, `git push`, `git reset --hard`, `git clean`, `npm publish`, `vercel --prod` ve `rm -rf` yasaklı kalır.
- Mevcut sürümleri, oyun içi canlı maç geri almayı ve test kapsamını koru. Silinen testin kapsamını mevcut testlerle karşılaştır; test ve derleme geçmeden işi tamamlandı diye raporlama.
- Kodu değiştirirken `npm test`, `npm run build` ve ilgili Playwright testlerini kullan. GitHub push, merge, canlı yayın, kimlik bilgileri, harici ücretli API ve geri alınamaz silmeler otomatik izin kapsamında değildir.

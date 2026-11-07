# Codex Uyumluluk Talimatları

Bu projede ana talimat dosyası `CLAUDE.md` dosyasıdır.

- Her göreve başlamadan önce proje kökündeki `CLAUDE.md` dosyasını tamamen oku ve uygula.
- Ardından `CLAUDE.md` dosyasının yönlendirdiği `context/README.md` haritasını kullan.
- Proje bağlamını, kaynak yönetimini, hafıza güncellemelerini, yetki sınırlarını ve doğrulama kurallarını `CLAUDE.md` dosyasındaki tanımlara göre yürüt.
- Kullanıcı “hafızayı güncelle”, “bağlamı denetle” veya “kaynakları denetle” dediğinde `.agents/skills/proje-hafizasi/SKILL.md` becerisini kullan.
- Bu dosya yalnızca Codex uyumluluk katmanıdır; ayrıntılı proje bilgisini veya `CLAUDE.md` içeriğini burada çoğaltma.

## Codex'e özel ek talimatlar

<!--
Gerçekten gerekmedikçe bu bölümü boş bırakın.
Yalnızca Codex'e özgü ve CLAUDE.md içinde bulunmaması gereken talimatlar eklenir.
-->

## Abacus AI ekonomik ajan yönlendirmesi (izole pilot)

- Bu projenin kaynak-of-truth talimatları hâlâ `CLAUDE.md` ve `context/README.md` dosyalarıdır; onları geçersiz kılma.
- Kullanıcı model seçimi, görev planı veya kredi tasarruflu ajan devri istediğinde `docs/ai/ABACUS_BUDGET_ROUTER.md` dosyasını oku.
- İlk kontrol: `py -3 -B tools/ai_budget_router.py "GÖREV"` (dry-run, kredi tüketmez).
- Abacus CLI'ye para harcatan `--execute` ancak kullanıcının güncel cüzdan bakiyesi ve açık izniyle kullanılabilir; `--allow-premium` ayrı opt-in'dir.
- Bu sistemin `implement` rolü de salt okunur öneri üretir; kendiliğinden kod değişikliği, push, merge veya yayın yapamaz.
- `tools/ai_handoff_router.py` GitHub Issue yedekleme akışı ayrı kalır; mevcut `.jarvis/integrations.json` rotalarını değiştirme.

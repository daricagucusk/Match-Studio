# Abacus AI Kredi Kontrollü Ajan Yönlendirme — Tasarım (2026-11-08)

## Amaç
Match Studio için kullanıcıya verilen bir yazılım görevini yerel, sınırlandırılmış ve maliyeti izlenebilir ajan aşamalarına yönlendirmek. Mevcut F.19 çalışma ağacı, GitHub main, Vercel ve Play Console değişmeyecek.

## Mevcut yapı ve kararlar
- GitHub Issue `[AI DEVIR]` yönlendiricisi `tools/ai_handoff_router.py` ile Gemini/OpenRouter **hata sonrası** fallback yapıyor; Abacus ile bağlantılı değil. Bu iş akışını değiştirmiyoruz.
- JARVIS planning=Ollama, analysis=OpenCode, review=Codex read-only; `.jarvis/integrations.json` korunacak.
- Yerel Abacus CLI 2.10.15; RouteLLM, Opus 5.5, Fable 5.1 çalıştığı doğrulandı. Kısa test kredi tüketimi sırasıyla 0,78 / 52,19 / 130,49; gerçek görev maliyeti değişken.
- Çalışma ayrı Git worktree ve `feat/abacus-budget-router-20261108` dalında. Kullanıcının mevcut kirli ağacına, production'a, GitHub main'e dokunulmaz.

## Seçilen yaklaşım
1. Bağımsız Python stdlib aracı (`tools/ai_budget_router.py`) ve deklaratif proje politikası (`config/ai-budget-policy.json`): başka API anahtarı, platform değişikliği ya da ek abonelik yok.
2. Görev ifadesi açık kurallarla `economy / advanced / critical` zorluğuna ayrılır. Tek aşamalı veya sıralı `plan -> implement -> review -> verify` devir planı yaratılır. Plan/review için uygun model; implement için öncelikle RouteLLM; verify için yerel test. Premium model yalnızca açık `--allow-premium` ve kredi kontrolüyle seçilir.
3. Varsayılan `--dry-run` tek bir kredili model çağrısı bile yapmaz. `--execute` yalnızca **plan/read-only** Abacus görevlerini çalıştırır; kod yazma, git push, merge, deploy, ödeme ve silme otomatik yapılamaz. Implement aşaması değişiklik değil, uygulanabilir patch/plan önerir.
4. Kredi defteri kullanıcı alanında (git dışında); günlük/dönem/toplam görev kredisi için **ön kontrol** yapılır. CLI'nin `Credits used:` çıktısından gerçekleşen tüketim kaydedilir. Maliyet çözümlenemezse işlem başarısız sayılır ve sonraki aşama çağrılmaz. CLI/faturalandırma gerçek hard cap sunmadığından görev başına kesin azami ücret garanti edilemez; yüksek maliyetli modeller manuel açık izin ister.
5. Ajan devri yalnızca önceki aşamanın 1.200 karakteri geçmeyen metin çıktısıyla olur; tam depo/sohbet bağlamı her aşamada yeniden gönderilmez. Yerel `verify` saf araç aşamasıdır.
6. İlk entegre bağlantı: `AGENTS.md` ve `docs/ai/AI_MODEL_ROUTING.md` içerisinde yerel yönlendiriciye referans; mevcut GitHub CI pilotu ve JARVIS rotaları değişmez.

## Risk kapıları
- Token ve API anahtarlarını göreve koyma; açık gizli anahtar örüntüsü varsa istek reddedilir.
- Yeni bağımsız branch/test çıktısı olmadan gerçek kod değişikliği ve yayın yapılmaz.
- Kredi sistemindeki kapsam dışı tüketimler (web ChatLLM veya başka CLI oturumu) yerel defterde görünmez; maliyet güvencesi sağlayıcı hesabıyla eşdeğer değildir.
- Çoklu ajan paralelleştirmesi yapılmaz. Kritik Fable erişimi varsayılan değil, bütçeye bağlı ve açık opt-in.
- Başarılı birim testler gerçek büyük kod görevinde kalite veya kredi garantisi değildir.

## Kabul ölçütleri
- Ekonomik/ileri/kritik model kararı ve premium opt-in testli.
- Günlük, dönem, görev rezerv bütçe sınırı ve hatalı/missing kredi çıktısında fail-closed testli.
- Alt ajan sıralaması ve kısıtlı devir özeti testli.
- CLI komutları `--permission-mode plan` ile oluşturulur; gerçek yazma/yayın yetkisi verilmez.
- 11 mevcut GitHub fallback testi ve 131 Node birim testi gerilemez; `npm run build` doğrulanır.
- Hiçbir gerçek Abacus çağrısı zorunlu test değildir; tüm maliyet testleri stub ile çalışır.

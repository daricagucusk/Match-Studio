---
name: sonnet-5-5-cagrisi
description: Kullanıcı Sonnet 5.5, "sonnet", Claude Sonnet veya router dışı bir Claude çağrısı istediğinde kullan. `abacusai -p --model sonnet` yolunu, kimlik doğrulamasını, maliyet kaydını ve raporlama kurallarını uygular.
---

# Sonnet 5.5 Çağrısı (CLAUDE_V5_5_SONNET, router dışı)

Genel yol `docs/ai/skills/abacus-cli-cagrisi/SKILL.md` içinde. Bu dosya yalnız Sonnet 5.5'e
özgü farkları taşır. Sonnet 5.5 `tools/ai_budget_router.py` içinde tanımlı değildir; router
üzerinden seçilemez, bu yüzden çağrı doğrudan CLI ile yapılır.

## 1. Kimlik

| Girdi | CLI'nin raporladığı model |
|---|---|
| `--model sonnet` | `CLAUDE_V5_5_SONNET` |
| `--model sonnet-5.5` | denenmedi; kısa ad zaten 5.5'e çözülüyor |
| `--model smaug` / `smaug-agentic` / `gpt-6-astra` | **yok** — `Warning: Model "..." not found. Using default: ROUTE_LLM.` |

Doğrulama 2026-11-09: `sonnet` geçerli, yanıt başında `model: CLAUDE_V5_5_SONNET` yazıyor.
Yanıt başındaki `model:` satırını her zaman oku; `ROUTE_LLM` görürsen istek karşılanmadı.

## 2. Komut

```bash
cd 'D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum'
timeout 120 abacusai -p "GÖREV" --model sonnet 2>&1 | tail -20
```

- `timeout` ver: yanıt 30-90 sn sürebiliyor.
- Çıktıyı `tail` ile kes; `Credits used:` satırı ve yanıt gövdesi son 20 satırda olur.
- `--resume <id>` bu ortamda `No input provided` hatası veriyor; yanıtı almak için soruyu
  `--model sonnet` ile yeniden gönder.

## 3. Maliyet

- Ölçülen: **1,31 kredi / çağrı** (2026-11-09).
- Router dışı olduğu için `~/.abacusai/matchstudio-budget-ledger.json` güncellenmez; oturum
  toplamını kullanıcıya ayrıca bildir ve `get_user_identity` ile canlı bakiyeyi doğrula.
- Politikadaki görev limiti 500, günlük 350, aylık 1500, asgari cüzdan 1000 bu çağrı için de geçerli.

## 4. Ne zaman Sonnet 5.5

- Kullanıcı açıkça Sonnet 5.5 / Sonnet istediğinde.
- Router'ın üç kimliği (`RouteLLM`, `Opus 5.5`, `Fable 5.1`) dışında bir Claude sürümü gerektiğinde.
- Opus 5.5'ten daha ucuz bir Claude yolu istendiğinde (1,31 vs 2,16-4,75 kredi).

Router'ın doğruladığı modeller için router'ı kullan; Sonnet'i varsayılan yapma.

## 5. Raporlarken

- `model: CLAUDE_V5_5_SONNET` satırını kanıt olarak göster.
- `Credits used:` değerini ve oturum toplamını yaz; defterin güncellenmediğini belirt.
- Modelin "test çalıştırdım" beyanını kabul etme; doğrulama için kendi `npm test` çıktını göster.

## 6. Yapılmayacaklar

- `--model sonnet` çağrısını router'a sokmaya çalışma (tanınmıyor, RouteLLM'e düşer).
- Kimliği doğrulamadan yanıtı "Sonnet 5.5'ten geldi" diye sunma.
- Onaysız toplu çağrı, push/merge/deploy, kimlik bilgisi okuma.

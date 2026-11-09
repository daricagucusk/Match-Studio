---
name: argon-cagrisi
description: Kullanıcı Argon, "argon modeli", Gemini 4 Argon veya router dışı bir model çağrısı istediğinde kullan. `abacusai -p --model argon` yolunu, kimlik doğrulamasını, maliyet kaydını ve raporlama kurallarını uygular.
---

# Argon Çağrısı (GEMINI_4_ARGON, router dışı)

Genel yol `docs/ai/skills/abacus-cli-cagrisi/SKILL.md` içinde. Bu dosya yalnız Argon'a özgü
farkları taşır. Argon `tools/ai_budget_router.py` içinde tanımlı değildir; router üzerinden
seçilemez, bu yüzden çağrı doğrudan CLI ile yapılır.

## 1. Kimlik

| Girdi | CLI'nin raporladığı model |
|---|---|
| `--model argon` | `GEMINI_4_ARGON` |
| `--model gpt-6-astra` | **yok** — `Warning: Model "gpt-6-astra" not found. Using default: ROUTE_LLM.` |

Doğrulama 2026-11-09: `argon` geçerli, yanıt başında `model: GEMINI_4_ARGON` yazıyor. Yanıt
başındaki `model:` satırını her zaman oku; `ROUTE_LLM` görürsen istek karşılanmadı.

## 2. Komut

```bash
cd 'D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum'
timeout 120 abacusai -p "GÖREV" --model argon 2>&1 | tail -20
```

- `timeout` ver: yanıt 30-90 sn sürebiliyor.
- Çıktıyı `tail` ile kes; `Credits used:` satırı ve yanıt gövdesi son 20 satırda olur.
- `--resume <id>` bu ortamda `No input provided` hatası veriyor; yanıtı almak için soruyu
  `--model argon` ile yeniden gönder. Oturum kimliğini raporla, ama resume'a güvenme.

## 3. Maliyet

- Ölçülen: **1,34 kredi / çağrı** (2026-11-09, iki çağrı 2,68).
- Router dışı olduğu için `~/.abacusai/matchstudio-budget-ledger.json` güncellenmez; oturum
  toplamını kullanıcıya ayrıca bildir ve `get_user_identity` ile canlı bakiyeyi doğrula.
- Politikadaki görev limiti 500, günlük 350, aylık 1500, asgari cüzdan 1000 bu çağrı için de geçerli.

## 4. Ne zaman Argon

- Kullanıcı açıkça Argon/Gemini 4 istediğinde.
- Router'ın üç kimliği (`RouteLLM`, `Opus 5.5`, `Fable 5.1`) dışında bir model gerektiğinde.
- Router'ın tier sınıflandırmasını atlatmak istendiğinde (Argon tier'a bakmaz).

Router'ın doğruladığı modeller için router'ı kullan; Argon'u varsayılan yapma.

## 5. Raporlarken

- `model: GEMINI_4_ARGON` satırını kanıt olarak göster.
- `Credits used:` değerini ve oturum toplamını yaz; defterin güncellenmediğini belirt.
- Modelin "test çalıştırdım" beyanını kabul etme; doğrulama için kendi `npm test` çıktını göster.

## 6. Yapılmayacaklar

- `--model argon` çağrısını router'a sokmaya çalışma (tanınmıyor, `KeyError`/RouteLLM'e düşer).
- Kimliği doğrulamadan yanıtı "Argon'dan geldi" diye sunma.
- Onaysız toplu çağrı, push/merge/deploy, kimlik bilgisi okuma.

---
name: fable-5-1-cagrisi
description: Kullanıcı Fable 5.1, "en üst orkestratör", kritik güvenlik/mimari liderliği veya en pahalı model çağrısını istediğinde kullan. tools/ai_budget_router.py üzerinden Fable 5.1'i yalnız critical tier'da seçtirir; dry-run doğrulaması, canlı cüzdan, rezerv ve raporlama kurallarını uygular.
---

# Fable 5.1 Çağrısı (critical tier, en yüksek maliyet)

Genel yol `docs/ai/skills/abacus-cli-cagrisi/SKILL.md` içinde. Bu dosya yalnız Fable 5.1'e
özgü farkları ve tuzakları taşır. Router'ı atlayıp doğrudan `abacusai -p --model` çağırma.

## 1. Fable 5.1 ne zaman seçilir

`choose_model` (`tools/ai_budget_router.py:48-56`) sırası:

| Koşul | Sonuç |
|---|---|
| rol `verify` | `LOCAL_TESTS` |
| rol `implement` | `RouteLLM` (Fable'a **hiç** gitmez) |
| `--allow-premium` yok | `RouteLLM` |
| tier `advanced` | `Opus 5.5` |
| tier `critical` | **`Fable 5.1`** |

Yani Fable 5.1 için üç şart birlikte gerekir: `--allow-premium`, `--execute` (ücretli çağrıda),
ve görev metninde **critical** anahtar kelime. `--stage` olarak `plan` veya `review` seç;
`implement` verirsen RouteLLM'e düşer.

## 2. Critical anahtar kelimeler — Türkçe karakter tuzağı

`CRITICAL` demeti (`tools/ai_budget_router.py:23-25`) şu dizelerle birebir eşleşir:

`kritik güvenlik`, `şifreleme`, `encryption`, `security architecture`, `auth mimarisi`,
`kimlik doğrulama güvenliği`, `veri kaybı`, `production security`, `critical security`

Eşleşme `casefold()` sonrası **alt dize** aramasıdır; Türkçe harfler korunur. 2026-11-09'da
"kritik guvenlik" (u harfiyle) yazıldığı için tier `advanced` çıktı ve plan Opus 5.5'e düştü.
Doğru yazım `kritik güvenlik` ile Fable 5.1 seçildi. Metni yazarken `ü`, `ş`, `ı` harflerini
kullan; emin değilsen `encryption` veya `security architecture` gibi ASCII anahtar kelime seç.

## 3. Zorunlu sıra

```bash
# 1) dry-run, 0 kredi — plan alanında "Fable 5.1" görünmeli
py -3 -B tools/ai_budget_router.py "… kritik güvenlik …" --allow-premium --stage plan

# 2) canlı bakiye: get_user_identity -> credits_remaining

# 3) ücretli tek rol
py -3 -B tools/ai_budget_router.py "… kritik güvenlik …" \
  --allow-premium --execute --wallet-balance <CANLI_BAKIYE> --stage plan
```

`plan` alanında `Opus 5.5` veya `RouteLLM` görürsen **çağrı yapma**; metni düzelt.

## 4. Maliyet ve rezerv

- Politika rezervi: **Fable 5.1 = 200 kredi** (`config/ai-budget-policy.json`), Opus 90, RouteLLM 3.
- Ölçülen gerçek tüketim (2026-11-09): selam çağrısı **1,08**, orkestratör liderlik sorusu **1,61**.
  Rezerv üst sınır, gerçek maliyet değil; yine de sert sınır sayma.
- Görev limiti 500, günlük 350, aylık 1500, asgari cüzdan 1000.
- Fable en pahalı yol olduğu için tek rol ve tek soruyla kullan; çok turlu tartışma için Opus 5.5
  veya RouteLLM yeterli.

## 5. Orkestratör rolü verilecekse

Fable 5.1 kendini "üst orkestratör" olarak konumlandırabiliyor (2026-11-09 yanıtı), ancak
`--permission-mode plan --disallowed-tools "*"` nedeniyle **salt okunur**: karar verir,
uygulayamaz. Liderlik verilecekse:

- Karar yetkisi: görev sıralaması, yama tasarımı, doğrulama seçimi, birleştirme öncesi kanıt listesi.
- Verilmeyen: merge/deploy onayı, sır işlemleri, kanıtsız "testler geçti" beyanı.
- Yürütme ayrı katmanda kalır; router bu ayrımı zorunlu kılıyor.

## 6. Raporlarken

- `results[].model == "Fable 5.1"` ve `model_confirmed: true` doğrula.
- `final_summary` 1.200 karaktere kırpılır; kesildiyse söyle.
- `credits` gerçek tüketim; defteri (`~/.abacusai/matchstudio-budget-ledger.json`) yalnız
  `file_read` ile oku, `bash`/`cat` AUTO kapısınca reddedilir.
- Modelin öz-beyanını bağımsız ölçüm gibi sunma.

## 7. Yapılmayacaklar

- `implement` rolüyle Fable 5.1 beklemek (RouteLLM'e düşer).
- Dry-run atlayıp doğrudan `--execute`.
- Onaysız `--execute`, push/merge/deploy, kimlik bilgisi okuma.

---
name: abacus-cli-cagrisi
description: Kullanıcı Opus 5.5, Fable 5.1, RouteLLM veya "CLI'ye sor" dediğinde ya da ücretli bir model çağrısı gerektiğinde kullan. tools/ai_budget_router.py üzerinden kredi kontrollü, salt okunur CLI çağrısı yapar; tier sınıflandırması, cüzdan doğrulaması, bağlam dosyası sınırları ve kanıt kurallarını uygular.
---

# Abacus CLI Çağrısı (kredi kontrollü)

Bu beceri, Match Studio deposunda ücretli model çağrısını **tek ve doğru yoldan** yapar:
`tools/ai_budget_router.py`. Doğrudan `abacusai -p --model ...` çağırmak bütçe defterini,
model kimliği doğrulamasını ve eşzamanlılık kilidini atlar; yapma.

## 1. Önce dry-run (0 kredi)

```bash
py -3 -B tools/ai_budget_router.py "GÖREV" --allow-premium
```

Çıktıdaki `plan` alanı hangi rolün hangi modele gideceğini söyler. Ücretli çağrıdan önce
mutlaka bunu gör. `--execute` yoksa `credits: "0"`.

## 2. Tier sınıflandırmasını bil (en sık hata)

`choose_model` (`tools/ai_budget_router.py:48-56`) şu sırayla karar verir:

| Koşul | Sonuç |
|---|---|
| rol `verify` | `LOCAL_TESTS` (ücretsiz, komut önerir) |
| rol `implement` | **her zaman** `RouteLLM` |
| `--allow-premium` yok | `RouteLLM` |
| tier `economy` | **`RouteLLM`** — `--allow-premium` verilse bile |
| tier `advanced` | `Opus 5.5` |
| tier `critical` | `Fable 5.1` |

Tier, görev metnindeki anahtar kelimelerle belirlenir (`classify_task`, satır 38-45):

- **critical:** `kritik güvenlik`, `şifreleme`, `encryption`, `security architecture`,
  `auth mimarisi`, `kimlik doğrulama güvenliği`, `veri kaybı`, `production security`,
  `critical security`
- **advanced:** `mimari`, `architecture`, `çok dosyalı`, `multi-file`, `refaktör`, `refactor`,
  `regresyon`, `regression`, `geri alma`, `rollback`, `eşzamanlılık`, `concurrency`,
  `offline sync`, `senkronizasyon`

**Sonuç:** "Opus 5.5'e sor" isteği, görev metninde advanced/critical bir kelime yoksa sessizce
RouteLLM'e düşer. Opus 5.5 istiyorsan görev metnine `mimari` veya `architecture` geçir
(ve `--stage plan` ya da `--stage review` kullan). Çağrı sonrası `results[].model` alanını
kontrol et; `Opus 5.5` değilse istek karşılanmadı demektir.

## 3. Cüzdan bakiyesini canlı al

`--execute` için `--wallet-balance` zorunlu ve **güncel** olmalı. Bakiyeyi tahmin etme:

- `get_user_identity` → `credits_remaining` (bu oturumda doğrulanmış tek kaynak).
- Bütçe defterini `~/.abacusai/matchstudio-budget-ledger.json` **yalnız `file_read` ile** oku.
  `bash`/`cat` ile okumak AUTO mod kapısınca reddedilir (çalışma alanı dışı config).

Politika (`config/ai-budget-policy.json`): aylık 1500, günlük 350, görev 500, asgari cüzdan 1000.
Rezervler: RouteLLM 3, Opus 5.5 90, Fable 5.1 200. Bunlar sert sınır değil, ön kontroldür.

## 4. Ücretli çağrı

```bash
py -3 -B tools/ai_budget_router.py "… mimari …" \
  --allow-premium --execute --wallet-balance <CANLI_BAKIYE> --stage plan
```

- `--stage` tekrarlanabilir; `plan`, `implement`, `review`, `verify`.
- Tek rol = tek çağrı = en düşük maliyet. Kullanıcı "sadece sor" dediyse `--stage plan` ver.
- `plan` ve `review` rolleri `--permission-mode plan` ile salt okunur çalışır: `--allowed-tools Read,Grep,Glob`,
  `--disallowed-tools Write,Edit,Bash,NotebookEdit,WebFetch,WebSearch,Task`.
- `implement` rolü yazma yetkilidir: `--permission-mode accept-edits`,
  `--allowed-tools Read,Grep,Glob,Write,Edit,NotebookEdit,Bash`, yalnız `WebFetch,WebSearch,Task` yasak.
  `.env`, kimlik bilgisi, `git push`, merge, deploy ve yayın hiçbir rolde otomatik izinli değildir.
- `.abacusai/` dizini CLI tarafından korunur: oraya yazma `accept-edits` modunda bile reddedilir.
  Yetki testlerini depo kökünde veya `$TEMP` altında yap.
- Zaman aşımı 600 sn (`CLI_TIMEOUT`); Opus çağrıları 1-4 dk sürebiliyor.
- Sağlayıcı sıfır olmayan kodla döner ve kredi satırı yoksa çağrı **bir kez** yeniden denenir;
  ikinci deneme de başarısızsa akış durur ve kredi defterine hiçbir şey yazılmaz.

## 5. Bağlam dosyası sınırları

`--context-file` (`read_source_context`, satır 133-162):

- en fazla **3** dosya
- yol `src/`, `tests/` veya `web/` ile başlamalı; `..` ve mutlak yol yasak
- uzantı: `.js .cjs .css .json .html`
- dosya başına 9.500 karakter, toplam 13.000 karakter; fazlası kırpılır veya hata verir
- içinde anahtar benzeri desen varsa reddedilir

## 6. Çıktıyı raporlarken

- `final_summary` artık **baş 4.000 + kuyruk 2.000** karakter tutar (`SUMMARY_HEAD`/`SUMMARY_TAIL`);
  araya `[...]` kırpma işareti girer. Tam metin `artifacts` alanındaki dosyadadır:
  `~/.abacusai/matchstudio-runs/<zaman>-<rol>-<model>.md` (ortam değişkeni
  `MATCHSTUDIO_RUN_DIR` ile taşınabilir). Tam yanıt gerekiyorsa bu dosyayı `file_read` ile oku.
- `model_confirmed: true` ve `results[].model` beklenen modelle eşleşmeli.
- `credits` alanı gerçek tüketimdir; oturum toplamını defterdeki `spent` ile karşılaştır.
- Model "testleri çalıştırdım" dese bile çalıştırmamıştır. Doğrulama iddiası için kendi
  `npm test` / `npm run build` çıktını göster.

## 7. Windows kabuğu

- `py -3 -B` kullan (`python3` yok).
- Geçici dosya `$TEMP` altına; `/tmp` bu makinede yok.
- Uzun çıktıyı `> "$TEMP/x.log" 2>&1; echo $?` ile dosyaya al, sonra `grep`/`tail` ile özetle.

## 8. Yapılmayacaklar

- `--execute` olmadan kredi harcama; kullanıcı açıkça istemediyse ücretli çağrı başlatma.
- `--allow-premium` olmadan premium model bekleme.
- `git push`, merge, deploy, kimlik bilgisi okuma.
- Router'ı atlayıp doğrudan `abacusai` çağırma.

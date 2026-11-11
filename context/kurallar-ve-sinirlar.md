# Kurallar ve Sınırlar

Bu dosya projede her zaman dikkate alınması gereken kalıcı kuralları, sınırları ve yasakları içerir.

## Zorunlu kurallar

- Çalışmaya başlamadan doğru çalışma ağacını, dalı ve mevcut değişiklikleri kontrol et; kullanıcı çalışmalarını koru.
- Uygulama kaynaklarını `src/` ve `web/` altında düzenle; üretilen dosyaları elle değiştirme. Dosya sorumlulukları: `../docs/STRUCTURE.md`.
- Kulüp ayrımını, yerel verileri ve yedekleme/kurtarma korumalarını koru; kritik değişiklikleri kapsamına uygun şekilde doğrula.

## Yapılmaması gerekenler

- Gerçek sporcu bilgilerini testlere veya mağaza görsellerine koyma; test ve yayın sonuçlarını doğrulanmadan başarılı gösterme.
- Başka çalışma ağaçlarını, canlı siteyi ve Play durumunu bu klasörle aynı kabul etme.

## Bütçe, süre ve kaynak sınırları

Doğrulanmış sabit bütçe veya son tarih kaydı yoktur. Harcama ve abonelik ayrıca yetkilendirilir.

- Ücretli model çağrısı (Opus 5.5 / Fable 5.1 / RouteLLM) yalnız `../tools/ai_budget_router.py` üzerinden yapılır; önce `--allow-premium` ile dry-run, sonra canlı `credits_remaining` ile `--execute --wallet-balance`. Router'ı atlayıp doğrudan `abacusai -p --model` çağırmak yasak. Ayrıntı: `../docs/ai/skills/abacus-cli-cagrisi/SKILL.md`, `../docs/ai/skills/fable-5-1-cagrisi/SKILL.md`.
- Argon (`--model argon` → `GEMINI_4_ARGON`) router dışıdır; yalnız `../docs/ai/skills/argon-cagrisi/SKILL.md` becerisiyle, `model:` satırı doğrulanarak çağrılır ve maliyeti deftere yazılmadığı için ayrıca raporlanır.
- Sonnet 5.5 (`--model sonnet` → `CLAUDE_V5_5_SONNET`) router dışıdır; yalnız `../docs/ai/skills/sonnet-5-5-cagrisi/SKILL.md` becerisiyle, `model:` satırı doğrulanarak çağrılır ve maliyeti deftere yazılmadığı için ayrıca raporlanır.
- Router'ın tanımadığı model kimliği (`RouteLLM`, `Opus 5.5`, `Fable 5.1` dışı) sessizce RouteLLM'e düşer ve yine kredi yazar; listede olmayan model için çağrı yapmadan kullanıcıya sor.
- Bütçe defteri `~/.abacusai/matchstudio-budget-ledger.json` yalnız `file_read` ile okunur; `bash`/`cat` AUTO mod kapısınca reddedilir.

## Hukuki, güvenlik ve gizlilik sınırları

- Parolaları, anahtarları ve gereksiz kişisel verileri bağlama veya depoya ekleme. Kaynakların orijinallerini koru.
- Tarayıcı verileri adres, port ve profile bağlıdır; veri temizleme veya taşıma işlemlerinde mevcut kayıtları koru.

## Kullanıcı onayı gerektiren işlemler

- Silme, veri kaybı riski taşıyan işlemler, ödeme, dışarıya mesaj gönderme ve yayın için açık yetki gerekir.
- Push, main'e birleştirme, Vercel dağıtımı ve Play yayını ayrıca yetkilendirilir. Yerel testler gerçek cihaz veya Play kabulü değildir. Dayanak: `../README.md`, `../CLAUDE.md`.

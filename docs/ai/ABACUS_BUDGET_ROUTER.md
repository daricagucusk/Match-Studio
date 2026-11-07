# Abacus AI — Kredi Kontrollü Görev Yönlendirici

**Kapsam:** Match Studio yerel geliştirme dalı. GitHub Issue `[AI DEVIR]` fallback motorundan ve JARVIS `.jarvis/integrations.json` rotalarından bağımsızdır. İkisi de değiştirilmemiştir.

## Gerçekleştirilen tasarım

- `tools/ai_budget_router.py`: Görev zorluğuna göre otomatik rol/model seçimi, alt ajan çıktı devri, CLI faturalama satırından tüketim okuma, bütçe önkontrolü.
- `config/ai-budget-policy.json`: Aylık **1500**, günlük **350**, tek görev **500** kredi *yerel ihtiyat limitleri*. Cüzdanda minimum **1000** kredi bırakılmaya çalışılır. Bu sayılar hesap bakiyesi değil, yalnız bu aracın kullanım bütçesidir.
- `tools/test_ai_budget_router.py`: Çevrimdışı güvenlik ve karar testleri. API veya kredi tüketmez.
- Sıralama: plan → implement (yalnızca değişiklik önerisi) → review → verify (sabit yerel test önerileri). Tüm çağrılar **read-only Plan** modunda; uygulama kodunu kendiliğinden değiştirmez.
- Basit işlerde RouteLLM; ileri/kritik plan ve incelemede yalnız açık `--allow-premium` varsa Opus 5.5 / Fable 5.1. Uygulama önerisi yine RouteLLM.
- Ücretli çağrılar yalnız açık `--execute` ve güncel, kullanıcı tarafından doğrulanmış `--wallet-balance` ile başlar. Varsayılan dry-run **0 kredi**.
- `--context-file` ile yalnız 3 küçük, izinli `src/`, `web/`, `tests/` dosyası bağlama alınır; yol dışına çıkma ve anahtar benzeri içerik engellenir.
- Ajan çıktısı sonraki role en fazla 1200 karakterlik özet olarak aktarılır. İki eşzamanlı çalıştırma yerel lock dosyasıyla engellenir.
- CLI beklenen model yerine başka modele yönlendirmişse işlem durur. Gerçek tüketim varsa kayıt edilir. Hata, eksik kredi raporu veya bütçe aşımı halinde sonraki model çalışmaz.

## Güvenli kullanım

İzole geliştirme klasöründeki terminal:

```powershell
py -3 -B tools/ai_budget_router.py "Canlı maç geri almayı analiz et"
```

Model planını **ücretsiz** görmek için bu yeterli.

Kritik görevde premium seçeneklerini *sadece planlamak* için:

```powershell
py -3 -B tools/ai_budget_router.py "Kritik güvenlik mimarisini değerlendir" --allow-premium
```

İlgili küçük kaynak dosyasını sınırlı bağlam olarak kullanmak için:

```powershell
py -3 -B tools/ai_budget_router.py "Kadrodaki alternatifleri analiz et" --context-file src/domain/team-depth.js
```

**Gerçek kredi tüketen isteğe örnek — yalnız bakiye ve bütçe ekranını kontrol ettikten sonra:**

```powershell
py -3 -B tools/ai_budget_router.py "Geri alma mimarisini analiz et" --allow-premium --execute --wallet-balance <GUNCEL_HESAP_KREDISI> --stage plan
```

Bu komutun kendisi ücretli model çağrıları yapabilir. Gerçek bakiye elle verilir; sağlayıcıdan otomatik çekilmez. Terminal komutunun `<GUNCEL_HESAP_KREDISI>` kısmını gerçek sayıyla değiştirmek gerekir.

## Uyarılar ve sınırlar

**Bütçe sert sınır değildir.** Abacus AI tek bir çağrıda tahmini rezervden daha fazla kredi kesebilir. Sağlayıcıda ayrıca hard cap veya otomatik kredi yükleme kapatılmalı. Başka ChatLLM oturumlarının tüketimi yerel defterde görünmez. Hata sonrası gerçek bakiyeyi `apps.abacus.ai` profilinden yeniden doğrula.

**Bir kodlama uygulama ajanı henüz değil:** Mevcut sürümde tüm ücretli CLI rollerini `--permission-mode plan` ve `--disallowed-tools "*"` ile salt okunur çalıştırıyoruz. Implement rolü yalnız uygulanabilir değişiklik önerir. Dosya yazma, build veya deploy otomasyonu hiçbir şekilde devrede değil; uygulama ve test ayrı adımlardır. Bu kasıtlı güvenlik kapısıdır.

**İzole dal kapsamı:** `feat/abacus-budget-router-20261108`. Bu dalı `main`e veya kirli F.19 dalına birleştirmeden önce kod inceleme ve tüm testler gerekir. `git push`, Play, Vercel veya otomatik yayın yok.

**Yenileme:** `cycle_id` başlangıçta `2026-11-07`. Aylık yenileme doğrulandıktan sonra güncelle; eski dosya/defter verisini silip limit sıfırlama. Kullanıcı alanındaki `~/.abacusai/matchstudio-budget-ledger.json` sadece bu aracın çağrılarını takip eder. Aynı anda çalışan araçların kontrolü bu sisteme dahil değildir.

## Doğrulama

```powershell
py -3 -B -m unittest discover -s tools -p "test_ai_budget_router.py" -v
py -3 -B -m unittest discover -s tools -p "test_ai_handoff_router.py" -v
npm test
npm run build
git diff --check
```

*Not:* Testler offline stub kullanır; gerçek Opus/Fable kodlama kalitesini, sağlayıcı fiyat politikasını veya API anahtarlarını doğrulamaz.

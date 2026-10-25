# Match Studio – telefon üzerinden çoklu kodlama ajanı devri

Bu çalışma yalnızca daricagucusk/Match-Studio GitHub deposu ve Android tarayıcı üzerinden yönetilir. Yerel PC kurulumu istemez.

## Başlatma

GitHub > Match-Studio > Issues > New issue > AI Devir - Mobil Kodlama.
Başlık tam olarak '[AI DEVIR]' ile başlamalı ve Issue'yu GitHub depo sahibi açmalıdır.

Issue, geliştirilecek 1 ila 3 **mevcut** kaynak dosyanın yolunu açıkça içermelidir;
örneğin src/main.js. Model yalnızca bu dosyalara, tam eşleşen kısa metin
değişiklikleri (find/replace) yapabilir. Dosya oluşturma, silme, yeniden
adlandırma ve shell çalıştırma desteklenmez. Büyük refaktörler için
bu dar kapsamlı pilotu kullanmayın.

**Önemli:** Bu sistem ChatGPT/Codex Android içindeki sohbeti veya
kota sayaçlarını okuyamaz. Codex kota dolunca GitHub Issue açmak gerekir.
Issue açıldıktan sonra modeller arasında geçiş otomatik olur.

## Model sırası (25 Ekim 2026)

| Sıra | Sağlayıcı | Model | Koşul |
| --- | --- | --- | --- |
| 1 | Google | gemini-3.8-flash | GEMINI_API_KEY |
| 2 | Google | gemini-3.5-flash-lite | GEMINI_API_KEY |
| 3 | OpenRouter | poolside/laguna-s-2.1:free | OPENROUTER_API_KEY, 31 Ekim 2026'da kaldırılması planlanıyor |
| 4 | OpenRouter | nvidia/nemotron-3-ultra-550b-a55b:free | OPENROUTER_API_KEY |
| 5 | OpenRouter | cohere/north-mini-code:free | OPENROUTER_API_KEY; hafif ajan odaklı kod modeli |
| 6 | OpenRouter | openrouter/free | OPENROUTER_API_KEY; sağlayıcı tarafından uygun ücretsiz model seçilir |
| 7 (opsiyonel) | OpenRouter | z-ai/glm-5.3-flash | Ücretli mod açık + kredi limiti |
| 8 (opsiyonel) | OpenRouter | deepseek/deepseek-v4.1-flash | Ücretli mod açık + kredi limiti |

Mevcut olmayan model/başarısız API erişimi/429 kota/503 yoğunluk/ağ hatası/
bozuk JSON/benzersiz olmayan edit doğrulaması => sıradaki modele geç.
Aynı görev baştan oluşturulmaz, görev metni ve dosya kapsamı korunur.
Yalnızca tamamen geçerli edit planı dosyaya yazılır.

OpenRouter ücretsiz modeller tüm hesapta ortak sınırlar uygular (genellikle
20 istek/dakika, 50 istek/gün; >= $10 kredi almış hesapta 1.000/gün);
yeni hesap/anahtar açmak bu sınırları sıfırlamaz. Modeller gün içinde
kaldırılabilir veya sağlayıcı şartları değişebilir.

## Güvenli anahtar ayarları

GitHub > Match-Studio > Settings > Secrets and variables > Actions:
- Mevcut GEMINI_API_KEY: Google AI Studio API anahtarı. Google AI Pro
  aboneliği API'ye otomatik ücretli kota vermez.
- Opsiyonel OPENROUTER_API_KEY: https://openrouter.ai/settings/keys
  adresinden oluşturulup GitHub'a **secret** olarak eklenir.
  Açık kaynak GitHub koduna, Issue'ya veya sohbet mesajına asla anahtar koyma.

**Varsayılan: yalnızca ücretsiz modeller.** Ücretli modellere geçiş yapmak
için:
1. OpenRouter hesabına istenilen kadar kredi yükleyin; otomatik dolumu kapalı tutun.
2. OPENROUTER_API_KEY için OpenRouter'da **$5 veya daha düşük kesin anahtar harcama limiti** tanımlayın.
3. GitHub > Settings > Secrets and variables > Actions > **Variables** bölümünde
   AI_ENABLE_PAID_FALLBACK değerini true yapın. Bu bir Repository Variable'dır,
   Secret değildir.
4. İş akışı ayrıca OpenRouter GET /api/v1/key üzerinden anahtarın $5 veya
   altında harcama limitini doğrular. Limit yoksa, doğrulanamıyorsa veya
   tüketildiyse ÜCRETLİ isteği atlar. Bütçeyi genişletmek için kod incelemesi gerekir.

Sistem API key bilgisini veya sağlayıcının kaynak kod içerebilen hata
gövdesini loglara dökmez. Bununla birlikte hangi sağlayıcıların kullanıldığı
raporlanır. OpenRouter ücretsiz servislerinin (özellikle NVIDIA/Poolside)
özel kodu nasıl saklayıp eğitimde kullanabileceğini önceden inceleyin.
NVIDIA ücretsiz uç noktası gizli bilgi ve kişisel veri gönderilmemesini
özellikle istiyor. Depoda gerçek oyuncu bilgisi ve canlı sırlar bulunmamalı.
Bu modellerin veri işleme şartlarını kabul etmiyorsanız OPENROUTER_API_KEY
secret'ını tanımlamayın.

## Güvenlik ve teslim

- GitHub Action owner-only Issue tetiklemesi ve read-only üretim işi kullanır.
- Harici modele sadece açıkça istenen 1–3 dosya (toplam en çok 170 KB) aktarılır.
- Salt metin JSON replacement planı uygulanır; model bilgisayarda komut çalıştıramaz.
- İzin verilen dosyalar ve değişiklik boyutu ikinci defa workflow tarafından denetlenir.
- npm derleme ve birim testleri geçmeden yama yüklenmez.
- Yazma izinli ayrı iş yalnızca branch ve DRAFT PR açar; main'e birleştirmez.
- İnsan kod incelemesi ve verify.yml kabul testi zorunludur.
- Açılan PR'daki değişiklikler Vercel preview dağıtımı yaratabilir, production'a
  ancak insan main'e birleştirirse çıkar.
- GitHub main dalı şu anda korumasızdır. Repository branch protection/ruleset
  etkinleştirilmeden kritik sürümler otomatik birleştirilmemelidir.

## İlk hata ve iyileştirme

Issue #7 / Actions 40199735715: Google Gemini CLI seçilen modelin aşırı
yoğunluğu nedeniyle 503 ve bağlantı hataları alıp başarısız oldu.
Bu yeni yönlendirici hatayı sınıflandırır, diğer bağımsız modele geçer,
varsayılan modeli sabitler ve kaynak dosya değişimini fail-closed uygular.

Doğrulama için yeni bir '[AI DEVIR]' Issue oluşturun; test konusu öncekiyle
aynı tek satırlık src/main.js yorum satırı olabilir. Uçtan uca başarılı
olduğu söylenebilmesi için ayrı ajan branch'i, bir DRAFT PR,
npm build+test ve verify.yml kontrolü gerçekten başarıyla tamamlanmalıdır.

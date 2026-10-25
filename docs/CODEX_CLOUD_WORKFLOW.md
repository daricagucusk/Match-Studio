# Match Studio — Codex Cloud Merkezi Geliştirme Ortamı
Tarih: 2026-10-26 | Durum: Bulut ortamı sahibinin Codex arayüzünde bağlanması ve Publish işlemi bekliyor.

## Tek kaynak
- GitHub: `daricagucusk/Match-Studio` (özel depo). Git branch `main` canlı PWA kaynağıdır; doğrulanan başlangıç commit'i `5c186735fbdebabb12375f791c4424ab7d4d2e0f`.
- Canlı PWA: https://match-studio-telefon.vercel.app
- Google Play hazırlıkları, **main'e henüz birleştirilmemiş** taslak PR #17: `release/google-play-readiness-20261025`.
- Her görev ayrı bulut çalışma alanı ve görev dalında yürüsün. Geliştirme çıktısı Pull Request, test kanıtı ve Vercel Preview ile gelsin; `main` ve production otomatik değişmesin.

## Codex masaüstü/web ortam oluşturma
1. ChatGPT/Codex'i PC veya webde aç; **Work in > Cloud > Select environment > Create environment**. Alternatif: Settings > Codex Cloud > Environments > Create environment.
2. GitHub hesabını bağla; `daricagucusk/Match-Studio` özel deposuna erişim ver (yetki ekranında kapsamı en aza indir). `Get started` ile başlangıç denetimine geç.
3. Codex'e aşağıdaki gereksinimleri söyle:
   - Node.js 24, Python 3.12, Chromium/Playwright; proje `package-lock.json` kullanır.
   - Paket kurulum komutu: `npm ci --no-audit --no-fund`; Playwright gerekiyorsa `npx playwright install --with-deps chromium`. Kaydedilen kurulum, Codex'in otomatik kurulumuyla çakışmamalı.
   - Temel doğrulama: `python3 -m unittest discover -s tools -p 'test_ai_handoff_router.py' -v`, `npm run release` ve `npm run build:vercel`.
   - Yerel önizleme gerekiyorsa `npm start` (serve script port 8911); hizmeti çalışma başlangıcında nasıl sunacağını Codex'in test etmesini iste.
   - Varsayılan internet erişimi yalnızca gereken kaynaklarla kısıtlı; API key, canlı kulüp verisi, Play Console şifresi ve imzalama anahtarına ihtiyaç yoktur.
4. Hazırlık raporunu ve kurulan bağımlılıkları incele; tüm adımlar çalıştığında **Save** ve **Publish** seç.
5. **Environment published** mesajından sonra `Start a new task` ile ilk salt-okunur denetim görevine geç.

Cloud ortamını bu ChatGPT görüşmesinden otomatik yayımlayamıyoruz; bağlantı ve Publish adımları sahibinin Codex web/masaüstü arayüzünde yapılmalıdır.

## Bulut iş düzeni
1. Denetim görevinde Git branch, commit, `AGENTS.md`, package scripts, açık PR'lar, gizlilik/çocuk verisi kuralları ve testler okunur. Kod değiştirmeden P0/P1/P2 öncelik listesi ile kanıt raporu üretilir.
2. Kritik fonksiyon hataları, veri/yedek bozulma, yetkisiz erişim, çökme = P0; telefon/fold ergonomisi, geri düğmesi, fikstür ve onboarding = P1; görsel iyileştirme, verimlilik ve ileri özellikler = P2.
3. Her aşama için ayrı görev ve çalışma dalı; küçük test edilebilir patch, test çıktısı, kullanıcıya etkiler, gözden geçirme; taslak PR.
4. GitHub Actions `.github/workflows/verify.yml` zorunlu denetimdir. Başarısız veya eksik CI ile yayın yapılmaz.
5. Vercel Preview üzerinden anonim test verisiyle kapalı/açık Fold7, telefon ve masaüstü kabulü yapılır.
6. Gerçek üretim veya Play Store yayını için ayrı açık onay, yasal gizlilik/onboarding/mağaza şartları ve alan adı/sertifika doğrulamaları gerekir.

## Her yerden erişim
- Masaüstü/web: Codex > Cloud > yayımlanmış **Match Studio** ortamı.
- Mobil: ChatGPT içindeki Codex > yayımlanmış ortamı seç > mevcut bulut görevini aç.
- Aynı göreve dönmek ilerlemeyi korur; yeni bir görev diğer görevin commit edilmemiş dosyalarını otomatik taşımaz. Değişiklikleri dal/commit/PR ile sakla.
- Bilgisayarın kapalı olması, sunucuda devam eden görevlerin tamamlanmasına engel değildir.
- Codex kullanım kotası buluta geçince sıfırlanmaz. Kota dolarsa resmi yenilenmesini bekle veya GitHub'daki ayrı Gemini/OpenRouter failover iş akışını kullan; Codex limitini otomatik algıladığını iddia etme.
- Bulutta gerçek sporcu verisi, hassas erişim anahtarları veya özel kulüp yedekleri kullanılmasın; demo/sentetik kayıtları kullan.

## Codex Cloud ilk görev talimatı (kopyala)
```text
Match Studio'nun kalite başmühendisi olarak yalnızca OKUMA/TESPİT yap.
Depo: daricagucusk/Match-Studio, main baz alınacak.
Önce AGENTS.md, README.md, package.json, docs/VALIDATION.md, docs/DEVICE_CHECKLIST.md, docs/UNIFIED_RELEASE_2026-10-25.md dosyalarını incele; ayrıca açık PR #17'yi ana dala birleştirmeden gözden geçir.
Mevcut uygulamayı uçtan uca denetle: işlevsel menüler, oyuncu/kulüp veri izolasyonu, istatistik doğruluğu, maç günü, offline/PWA, CSV/XLSX, şifreli yedek/geri yükleme, telefon ve Fold kapalı/açık responsive deneyimi, klavye/ekran okuyucu, gerçek hatalar, Play Store sürüm hazırlığı ve performans.
Önce npm ci ve mümkünse npm run release ile npm run build:vercel çalıştır. Gerçek çalışan test sonuçlarını kanıtlarıyla kaydet. Görsel, erişilebilirlik ve güvenlik bulgularını kanıt olmadığı yerde varsayım olarak etiketle.
P0/P1/P2 şeklinde bulgular, kullanıcıya etkileri, kod dosyaları, yeniden üretme adımları, kabul kriterleri ve uygulanabilir geliştirme dalı sıralaması çıkar. Eski kodları veya modülleri silme; kullanıcı/saha verisine erişme, gizli anahtar isteme.
BU İLK GÖREVDE KODU DEĞİŞTİRME, commit/PR/merge/deploy YAPMA. Salt-okunur denetim raporuyla bitir.
```

## Sonraki bulut uygulama görevleri
Denetim onaylandıktan sonra her P0/P1/P2 bileşeni ayrı işlenir. İşlev kaybı, konumsal kontrol, gizlilik, yerel veri kaybı ve hukuki riskler çözülmeden yüksek görsel işçilik “yayına hazır” diye sunulmaz.

## Güvenlik ve güncelleme
Ortam yapılandırması değişirse Settings > Codex Cloud > Environments > ... > Edit > Save > Republish; yeni görevler güncel ortamı, çalışan görevler kendi durumunu kullanır. Mevcut GitHub'ın `main` dalı branch protection'ı aktif değilse zorunlu PR ve verify koruması açılana kadar hiçbir otomatik production merge uygulanmaz.
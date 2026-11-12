# Match Studio — Çalışma Talimatları

Bu dosya her oturumda yüklenen ana talimattır. Ayrıntı `.claude/rules/`, `.claude/skills/` ve depo dışı bağlam haritasındadır. Codex giriş noktası `AGENTS.md`'dir.

## 1. Proje kimliği

- Match Studio: çevrimdışı çalışan kulüp, grup, sporcu, kadro, canlı maç ve afiş yönetimi PWA'sı; şifreli yedek ve geri yükleme içerir.
- Paket sürümü `2.6.8-f.19-rc.1`. Tek aktif kaynak bu klasördür. GitHub `main`, Vercel ve Play Console bu klasörle aynı durum sayılmaz.
- Yığın: bağımlılıksız ES modülleri (`src/`), statik `web/`, Node 24 derleme araçları (`tools/`), Playwright testleri (`tests/`). Çerçeve, paket yöneticisi katmanı veya yeni kütüphane ekleme; mevcut modülleri kullan.

## 2. Değişmez ürün kararları

- Kulüp ayrımı, IndexedDB şeması, AES-GCM şifreli yedek, kurtarma noktası, kalıcı silme ve fixture oturum izolasyonu korunur.
- Canlı maç geçmişi append-only'dir. Düzeltme ve iptal `EVENT_CORRECTION` ile yeni olay olarak yazılır; geçmiş kaydı geriye dönük değiştirilmez.
- Aynı işlem anahtarı mükerrer olay üretmez; eski revizyon reddedilir. Gol, asist, kart ve oyuncu değişikliği bu kurala tabidir.
- Takım derinliğinde her saha görevi bağımsız kimlik taşır (`<roleCode>:<roleIndex>`); alternatif sayısı sınırsızdır; `slotCandidates` ve `tacticalRoles` geriye uyumludur.
- Tasarım dili `DESIGN.md`: obsidyen zemin, şampanya eylem, zümrüt saha. Sahte reyting, uydurma metrik ve olmayan özellik iddiası yasaktır.
- `web/app.bundle.js`, `web/sw.js`, `public/`, `dist/` ve `test-results/` üretilen çıktıdır; elle düzenlenmez. Kaynak `src/` ve `web/` altındadır.

## 3. Bağlam haritası

- Her görevde oku: `D:\beyin2\Projeler\MatchStudio\docs-ai\context\README.md`, `proje-ozeti.md`, `kurallar-ve-sinirlar.md`.
- Göreve göre oku: `hedefler.md`, `kararlar.md`, `proje-hafizasi.md`, `kaynaklar/README.md`, `kaynaklar/kaynak-indeksi.md`.
- Haritada bulunmayan bağlam dosyası güvenilir kabul edilmez. Çelişki varsa sessiz seçim yapma; kullanıcıya bildir.
- Bağlam dosyası eklenir, taşınır, yeniden adlandırılır veya silinirse aynı işlemde `context/README.md` güncellenir. Kaynak işlemlerinde `kaynak-indeksi.md` güncellenir.
- "Hafızayı güncelle", "bağlamı denetle", "kaynakları denetle" dendiğinde `proje-hafizasi` becerisini kullan.

## 4. Kaynak seçme

- Önce `grep` ve `glob` ile dar arama yap; dosyayı baştan sona okuma yalnız gerektiğinde.
- Bir adımda ilgili 2-8 dosya oku; büyük log, tarama ve analiz subagent içinde yapılır, ana ajana karar ve kanıt döner.
- `docs/history/`, `docs/audit/` ve `evidence/` altındaki tarihli kayıtlar kanıttır; güncel durum değildir.
- Doğrulanmamış sayı, sürüm veya yayın durumunu kesin bilgi gibi aktarma.

## 5. Yetki ve güvenlik

- Açık yetki olmadan yapılmayacaklar: `git push`, `main`'e birleştirme, Vercel veya Play yayını, dosya silme, mevcut içeriğin üzerine yazma, dışarıya mesaj, ödeme, ücretli model çağrısı.
- Yasak komutlar: `git reset --hard`, `git clean`, `rm -rf`, `npm publish`, `vercel --prod`.
- `.env`, `*.jks`, `*.keystore`, `*.p12`, `android/key.properties` ve gerçek sporcu verisi depoya, rapora veya loga girmez. Sır değerini yanıtta tekrar etme; adıyla an.
- Ücretli model çağrısı yalnız `tools/ai_budget_router.py` dry-run veya ilgili beceri dosyası üzerinden yapılır; router atlanmaz.
- Göreve `git status`, dal ve mevcut değişiklikleri kontrol ederek başla; kullanıcı çalışmasını koru.

## 6. Geliştirme döngüsü

1. Talebi, ilgili dosyaları ve mevcut yapıyı incele.
2. İlgili `.claude/rules/` dosyası eşleşen dosya okunduğunda kendiliğinden yüklenir; ayrıca istemek gerekmez.
3. Küçük ve odaklı yama uygula; kapsam dışı dosyaya dokunma, biçimi değiştirme.
4. Davranış değişikliğinde önce kırılan regresyon testini yaz, sonra düzelt.
5. Bölüm 7'deki doğrulama komutlarını çalıştır.
6. Sonucu kanıtla teslim et.

## 7. Test ve doğrulama

| Komut | Kapsam |
|---|---|
| `npm run build` | `src/` + `web/` → `web/app.bundle.js`, `web/sw.js` |
| `npm test` | 26 Node test dosyası, IndexedDB, depolama, paket güvenliği |
| `npm run test:browser` | 32 Playwright senaryosu; `public/` çıktısı üzerinden |
| `npm run check` | Derleme + Node + tarayıcı (tam paket) |
| `npm run build:vercel` | Bütünlük doğrulanmış statik çıktı |
| `npm run package` | `release-security-check` + PWA/kaynak ZIP |
| `npm run release` | Tüm kontroller + paket |
| `npm run check:play` | Play hazırlık raporu (hazırlık modunda 0 dönebilir) |
| `npm run check:play:strict` | Uzak uçlar dahil, engelde başarısız |

- Playwright projeleri: `desktop` 1440×1000, `phone` 360×780, `fold-open` 840×980; `workers:1`.
- Yalnız `npm test` yeterli değildir; davranış değişikliğinde `npm run check` çalıştır.
- Gerçek cihaz ve Play kabulü otomasyondan ayrıdır: `docs/guides/DEVICE_CHECKLIST.md`.
- Test geçmediyse iş tamamlandı sayılmaz. Doğrulanamayan nokta açıkça yazılır.

## 8. Ajan politikası

- Varsayılan: işi ana ajan kendisi yapar. Ajan devri yalnız 3+ bağımsız modül, geniş kod taraması veya bağımsız denetim gerektiğinde.
- Roller `.claude/agents/` altındadır: `mimar`, `gelistirici`, `qa-denetci`, `guvenlik-denetci`, `arayuz-denetci`, `test-otomasyon`.
- Aynı dosyayı iki ajana yazdırma. Ana ajan mimari lider, koordinatör ve nihai kalite sorumlusudur.
- Agent Teams deneysel ve varsayılan kapalıdır; açmak kullanıcı kararıdır.
- Basit işte takım kurma; tek dosyalık düzeltme ana ajanda kalır.

## 9. Teslim ve raporlama

- Sonuç önce, kanıt sonra. Her iddia bir araç çıktısına bağlanır.
- "Yazıldı ama test edilmedi" ile "test geçti" ayrımını açık yaz.
- Rapor: değişen dosyalar, çalıştırılan komut ve sonucu, doğrulanamayan noktalar, kalan risk.
- Kullanıcının dilini izle; teknik terimi ilk kullanımda sade açıkla.

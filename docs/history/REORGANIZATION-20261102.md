# Klasör düzenleme raporu — 2 Kasım 2026

## Kapsam ve başlangıç

Çalışma kaynağı: `D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Aday`. Paket sürümü `2.6.8-f.13`, başlangıç HEAD `0b25ee416b67644fb6c0b7622bc241dedfab6fd7`, dal `feat/play-store-readiness-managed-20261101`.

Başlangıçta değiştirilmiş `AGENTS.md`, test/görsel dosyaları ve izlenmeyen talimat, bağlam, VS Code ve plan belgeleri vardı. Bunlar mevcut halleriyle yedeklendi; başka dal veya eski kaynak kopyası düzenlenmedi.

## Uygulanan düzen

| Önceki konum | Güncel konum / davranış |
|---|---|
| Kökteki HTML, CSS, manifest ve robots | `web/`; web adreslerine `web/` eklenmez |
| `assets/`, `icons/` | `web/assets/`, `web/icons/` |
| `baseline/`, `reviews/`, `deployments/` | `evidence/` altında aynı alt isimler |
| Kök `BASLAT_TERMUX.sh` | `tools/termux/BASLAT_TERMUX.sh`; PWA ZIP'inde yine kökte |
| Kök `TELEFON_KURULUM.txt` | `docs/guides/TELEFON_KURULUM.txt`; PWA ZIP'inde yine kökte |
| Kök `ILK-PROMPT.txt` | `docs/ai/ILK-PROMPT.txt` |
| Düz belge listesi | `docs/guides/`, `play/`, `ai/`, `plans/`, `history/`; ana indeks `docs/README.md` |
| Testlerin `reviews/` üzerine yazdığı görseller | `test-results/reviews/` |
| Kök bundle, worker ve checksum dosyası | Üretilen bundle/worker `web/` altında; checksum ZIP içinde ve `dist/` altında |

140 dosya taşındı. Başlangıçtaki 25 kök dosyasının yerini, `.gitattributes` dahil 9 gerekli giriş/yapılandırma dosyası aldı. Yeni üst klasörler yalnızca `web/` ve `evidence/`; mevcut uygulama modül ayrımı korundu.

## Kaldırılan fazlalıklar

- Kök `app.bundle.js` ve `sw.js`: yeniden derlenen `web/` çıktılarıyla bayt eşitliği doğrulandıktan sonra kaldırıldı.
- Kök `SHA256SUMS.txt`: paket iç checksum artık paket oluşturulurken hesaplanır; çıktı dosyaları kaynak kökünü doldurmaz.
- `docs/privacy-policy-tr.html` kopyası: taşındıktan sonra `web/privacy.html` ile bayt eşitliği doğrulandı ve kaldırıldı. Gizlilik belgesinin tek düzenlenen kaynağı `web/privacy.html` oldu.
- Taşıma sonrası boş kalan eski klasörler kaldırıldı.

Eski paketler, inceleme görselleri ve dağıtım kayıtları fazlalık sayılıp silinmedi: 98 kanıt dosyasının SHA-256 eşitliği başlangıç yedeğine karşı doğrulandı. `src/` altındaki 56 JavaScript kaynağının içeriği korundu; 55 uygulama modülü ve ayrı PWA worker kaynağı vardır.

## Araç uyarlamaları

- Build, export ve güvenli sunucu ortak `tools/runtime-files.cjs` listesini kullanır.
- Kaynak sunucu `web/`, statik sunucu `public/`, bağımsız PWA sunucusu arşiv kökünü okur. Kaynak ve talimat dosyaları HTTP üzerinden sunulmaz.
- PWA paketi statik export ile aynı doğrulanmış dosyaları alır; gizlilik sayfası da pakete girer. Kaynak paketi üretilen bundle/worker dosyalarını dışlar.
- Android metadata repo kökündedir; varsa App Links girdisi `web/.well-known/assetlinks.json` konumundan alınır. Sahte sertifika dosyası oluşturulmadı.
- Termux başlatıcısı önce bağımsız ZIP yerleşimini seçer; satır sonları LF'dir. `.gitattributes`, Windows'ta da bu biçimi korur.
- Testlerin disk yolları, CI kaynak kapsamı, doküman bağlantıları ve VS Code çıktı dışlamaları güncellendi.

## Doğrulama

| Kontrol | Sonuç |
|---|---|
| Düzenleme öncesi Node testleri | 84 başarılı |
| Düzenleme sonrası Node testleri | 87 başarılı, 0 başarısız |
| Python AI yönlendirme testleri | 11 başarılı |
| Statik yayın derlemesi | 55 modül; 18 doğrulanmış dosya |
| Kanıt ve uygulama kaynaklarını koruma | 98 kanıt dosyası ve tüm `src/` kaynakları aynı; beklenmeyen kayıp yok |
| Tam Chromium koşusu | 127 başarılı, 8 koşullu atlama, 0 başarısız, 0 kararsız sonuç; yaklaşık 5 dakika |
| PWA paket bütünlüğü | 26 dosya; iç SHA-256 manifesti, worker bütünlüğü ve ZIP kontrolü geçti |
| Kaynak ZIP'inden temiz kurulum | 285 dosya checkout ile aynı; boş klasörde `npm ci --ignore-scripts`, build, statik export ve 87 Node testi başarılı |
| Kaynak ZIP'inden yeniden üretim | 18 yayın dosyası checkout çıktılarıyla bayt olarak aynı |
| Bağımsız PWA ZIP sunucusu | 18 runtime yanıtı HTTP 200 ve doğru içerik; 7 özel kaynak yolu HTTP 404 |
| Termux başlatıcı yerleşimi | Git Bash ile shell sözdizimi, kaynak ve iç içe çıkarılmış ZIP klasör seçimi başarılı; fiziksel Termux kabulü değildir |
| Belge bağlantıları | README, docs, context ve evidence girişindeki yerel Markdown dosya hedefleri mevcut |
| Görev dosyalarının boşluk kontrolü | `git diff --check -- . ':!AGENTS.md'` başarılı; mevcut AGENTS değişikliği ayrı tutuldu |
| Play hazırlık kontrolü | 10 kontrol, 4 engel; hazırlık modu çıkış 0 |

İlk tarayıcı denemesi, taşıma sonrası kalan eski disk yolları giderilmek üzere durduruldu. Kabul sonucu yalnızca düzeltmelerden sonraki tam koşudan alınır.

`git diff --check` başlangıçtan kalan `AGENTS.md` dosyasında sonda boş satır bildirir. Kullanıcının mevcut talimat değişikliğine müdahale edilmedi; görev dosyalarının kontrolü ayrıca yapılır.

## Geri dönüş

Düzenleme öncesi yedek proje dışında:

`C:/Users/aearo/.codex/backups/MatchStudio/20261102-162809-folder-reorganization/`

- `workspace-before.zip`: izlenmeyen dosyalar dahil 289 kaynak/belge dosyası; ZIP CRC doğrulandı.
- `manifest-before.json`: özgün dosyaların SHA-256 özetleri.
- `git-status-before.txt`: başlangıç çalışma ağacı.
- `history.bundle`: başlangıç HEAD'e erişen Git geçmişi.
- `moves.json`: eski ve yeni dosya yollarının eşlemesi.
- `prior-dist/`: yeniden üretim öncesindeki PWA/kaynak ZIP'leri ve özetleri.
- `browser-results.json`: tam tarayıcı koşusunun makinece okunabilir sonucu.
- `package-verification.json`: boş klasörde paket kabulünün sonucu; kurulum/derleme/test günlükleri aynı yerdedir.

Bağımlılıklar, üretilen çıktılar ve Git çalışma dizini ZIP'e alınmadı; Git geçmişi ayrı bundle içindedir. Geri dönüş gerekirse önce yedeği ayrı bir klasöre açıp karşılaştırın; mevcut çalışmanın üzerine körlemesine açmayın.

## Kabul sınırı

Bu görev yerel klasör düzenlemesidir. Veritabanı/yedek şeması, site origin'i, runtime URL'leri ve modül kimlikleri değişmez. Uzak CI, gerçek Android/Termux/Fold cihazı, Play Console ve canlı yayın bu görevde doğrulanmış sayılmaz. Push, commit, merge ve deploy yapılmadı. Play hesabı/uygulama kaydı, gerçek imza sertifikası ve imzalı AAB engelleri sürer.

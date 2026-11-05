# MatchStudio F.18 RC1 — Premium Saha Konsolu
Tarih: 2026-11-04
Durum: YEREL GELİŞTİRME ÖNİZLEMESİ (resmî yayın değil)

## Kaynaklar ve tasarım ayrımı
- Kullanıcı tarafından verilen `canli-mac-konsolu.html`: yalnızca tek-ekran yerleşimi ve saha içi işlemlerin akış referansı. Gerçek oyuncu veya maç verisi yerine geçirilmedi.
- Önceki Stitch premium referansları: obsidyen yüzeyler, şampanya altın vurgu, zümrüt saha, premium tipografi. Stitch hesabında doğrudan değişiklik yapılmadı.
- Kanonik yerel kod: `D:\beyin2\Projeler\MatchStudio\Calisma\Birlesik-Aday`.
- Geliştirme dalı: `work/premium-coach-console-20261104`; mevcut kirli dosyalar ve F.18 kulüp kimliği çalışması korunmuştur.

## İşlevsel değişiklikler
1. Canlı maç konsolu: ekranın üstünde saat/skor/devre kontrolleri, ortada taktik saha + olay/değişim, altta hızlı işlem şeridi. Rapor/saat düzeltmesi ayrıntıları gerektiğinde açılır.
2. Sekiz hızlı olay: gol, rakip golü, sarı kart, kırmızı kart, değişim, sakatlık, su molası, teknik not.
3. Golcü, asist, kartlı/sakatlanan oyuncu sahadan seçilebilir; değişimde önce sahadan çıkan, ardından yedekten giren seçilebilir.
4. Olaylar, mevcut append-only maç kayıt mekanizmasına bağlanır. “Son olayı geri al” doğrudan veri silmez; düzeltme formunu doldurur ve kullanıcı onayı gerekir.
5. Telefon ekranında sabit sayaç/aksiyon alanı; orta saha ve form alanı kendi içinde kaydırılabilir. Fold ve masaüstünde iki sütun; tek ekran hedefi. Mobil menü erişimi korunur.
6. Kadro seçimi: listede kaldığı yeri koruma, yalnız seçilmemiş oyuncular filtresi, seçilenleri üste alma.
7. Dashboard, afiş stüdyosu ve diğer iş alanlarının mevcut işlevleri korunarak premium tasarım katmanı `web/matchstudio-premium-next.css` uygulanır.
8. PWA çalışma zamanı yeni CSS dosyasını manifestine dahil eder. Önizleme sürümü: `2.6.8-f.18-rc.1`.
9. Kaynak paketine kullanıcıya özel yerel `.codex` ve `.claude` klasörleri girmez.

## Doğrulama
- `npm test`: 109/109 PASS.
- Yeni fonksiyonel canlı maç + rapor/regresyon kontrolleri: 30/30 PASS (desktop, phone, fold-open).
- Premium görünüm, renk, font ve kadro konsolu kontrolleri: 15/15 PASS.
- Tam Playwright regresyonunun son koşusu ayrıca sonlandırılmalı ve sonucu ayrı raporlanmalıdır.
- Gerçek Galaxy Z Fold 7/ADB cihaz testi bu kaynak değişiklikleri için yapılmadı; Playwright viewport testleri gerçek cihaz testinin yerine geçmez.
- Play Store / imzalı AAB / canlı Vercel dağıtımı bu çalışmanın kapsamında yapılmadı.

## Geri dönüş ve veri güvenliği
- Önceki dosya yedekleri: `C:\Users\aearo\Documents\MatchStudio-Premium-Backup-20261104`.
- Git dalından `main`e merge, push veya deploy yapılmadı.
- Gerçek kulüp verileri, IndexedDB ve eski F.17 arşivleri değiştirilmedi.
- Kullanıcı tarayıcısındaki `http://127.0.0.1:8911/` eski Service Worker tutuyorsa, uygulamadaki **Güncelle ve yeniden başlat** kontrolü kullanılmalıdır; browser depolaması silinmemelidir.

## Paket ve yayın
- Önizleme paketleri `npm run package` sonrasında `dist/MatchStudio_V268F18RC1_PWA.zip` ve `dist/MatchStudio_V268F18RC1_Source.zip` olarak üretilir.
- Paket bütünlüğü SHA256 doğrulaması ile kontrol edilmeli, başarılı olmadan dağıtım etiketi kullanılmamalıdır.
- Üretim yayını öncesinde gerçek cihaz kabulü, doğrulanmış Play Console kaydı, imza/fingerprint ve gizlilik bağlantıları yeniden denetlenmelidir.

## 2026-11-04 Son kabul denetimi
- Tam Playwright koşusu: 174 test senaryosu; 164 başarılı, 8 koşullu atlama, 2 zaman aşımı/hata (altı eşzamanlı worker).
- Başarısız iki senaryo ayrı ve düşük eşzamanlılıkla tekrar koşuldu: 3 başarılı, 1 proje gereği atlandı. Bunların içinde şifreli yedek alma/geri yükleme ve örnek veriyle Play mağazası ekran görüntüsü üretimi var.
- Canlı maç kritik akışlarının tekrar koşusu: 30/30 başarı.
- Premium görsel ve konsol hedefli regresyonu: 15/15 başarı.
- Sürüm arşivi: `dist/MatchStudio_V268F18RC1_PWA.zip` ve `dist/MatchStudio_V268F18RC1_Source.zip`.
- Paket SHA-256 doğrulaması: başarılı. Kaynak ZIP içinde `.codex/` ve `.claude/` dosyası: 0.
- Yeni sürüm ayrı localhost origin üzerinde `http://127.0.0.1:8913/` açıldı; mevcut `8911` ve F.17 korunuyor. Bu yeni origin başlangıçta boş kulüp veritabanı gösterir; eski origin kayıtları otomatik taşınmaz.
- Kalıcı başlatma kısayolu: Windows masaüstü > `MatchStudio F18 Premium Onizleme`. Yerel başlatıcı: `tools/start-premium-preview.ps1`.

## Play Store yayın engelleri (sürümün PC kullanımını engellemez)
Yerel `npm run check:play` çıktısı dört yayın engeli belirledi: Google Play uygulama kaydı doğrulanmadı; Digital Asset Links / Play App Signing SHA-256 sağlanmadı; geliştirici hesabı incelemede; harici imzalı AAB denetim raporu yok. Bu nedenle Play Store'a gönderim veya canlı yayın yapılmadı.

## Kabul notu
Önizleme kullanılabilir; ticari yayın / fiziksel cihaz doğrulaması tamamlandı olarak işaretlenmemelidir. Gerçek Samsung Galaxy Z Fold7 üzerinde ADB ile yürütülen yeni sürüm kabul testi ayrı gerekliliktir.

## Son Playwright tam regresyon — düşük yük tekrarı
- Komut: `node ./node_modules/@playwright/test/cli.js test --workers=2 --reporter=line --retries=1`
- Sonuç: **165 passed · 1 flaky (retry ile geçti) · 8 skipped · 0 final failed**, çıkış kodu 0. Toplam 174 test senaryosu.
- İlk denemede takılan senaryo masaüstünde `data-pitch-player` sürükleyip `data-pitch-slot` üzerine bırakma; beklenti ilk seferde doğrulanmadı, tekrar denemede tüm iş akışı tamamlandı. Otomasyon sürükle hareketinin kararsızlığı ihtimali var; sahadaki gerçek kullanımda bunu ayrıca deneyin. Bu nedenle gerçek cihaz/kullanıcı kabulü tamamlandı denmez.
- Son terminal test kaydı: `C:\Users\aearo\Documents\MatchStudio-Premium-Backup-20261104\f18-final-browser-tests.log`.

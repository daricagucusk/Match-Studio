# MatchStudio F.18 RC1 — Samsung Galaxy Z Fold7 Gerçek Cihaz Kabul Raporu

Tarih: 4 Kasım 2026  
Cihaz: Samsung Galaxy Z Fold7, `SM-F966B`  
Uygulama türü: Android Chrome 156 üzerinden çalışan yerel PWA; **imzalı APK/AAB test edilmedi**.  
Kaynak: `D:\beyin2\Projeler\MatchStudio\Calisma\Birlesik-Aday`  
Dal: `work/premium-coach-console-20261104`  
Test kökeni: `http://127.0.0.1:8913/` (ADB reverse ile); gerçek kulüp verileri yerine `F18 Cihaz Kabul Testi` kulübü.

## Gerçek kapalı ekran (CLOSED, 1080×2520 fiziksel / 351×679 Chrome CSS)
- [x] ADB cihaz kimliği, USB bağlantısı, Chrome hata ayıklama ve PWA açılışı.
- [x] 1 test kulübü, U14 grubu ve 8 test oyuncusu oluşturma.
- [x] 3v3 maç oluşturma; 3 ilk kadro ve 5 yedek seçimi.
- [x] Yatay taşma yok; başlık ve hızlı olay şeridi görünür.
- [x] Saat başlatma, devre geçişi ve sayfa yeniden yüklenince maç verilerinin korunması.
- [x] Saha üstünden golcü ve asist seçimi; gol kaydı skor değiştiriyor.
- [x] Rakip golü, sarı kart, kırmızı kart, oyuncu değişikliği, su molası, teknik not kaydı.
- [x] Vazgeçilen onay, skoru değiştirmiyor.
- [x] Son olayı iptal etme: 1–4 → 1–3; kaynak olay silinmeden düzeltme geçmişine ekleniyor.
- [x] Android'in yerel JS confirm tutarsızlığı nedeniyle erişilebilir uygulama içi **Vazgeç/Onayla** penceresi oluşturuldu.
- [x] Mobil düzeltme formu ve not paneli sabit, kaydırılabilir pencerede erişilebilir.
- [x] USB bağlantısını kesmeden **yalnızca ADB localhost yönlendirmesi kaldırılarak** PWA yeniden yüklendi ve yeni not yerel veritabanına yazıldı (9→10); yönlendirme geri kurulunca not ve skor korundu.
  Bu, gerçek Wi-Fi/mobil veri uçak modu testi **değildir**; uygulama sunucusunun erişilemezliğine karşı çevrimdışı çalışma testidir.

## Gerçek açık iç ekran (OPENED, 1968×2184 fiziksel / 640×537 Chrome CSS)
- [x] `cmd device_state state` çıktısında **base-state OPENED**; ADB yazılım override daha sonra resetlendi, gerçek açık durum korundu.
- [x] Önceden 640 CSS px ekranın tek sütunlu telefon düzenine düşmesine neden olan breakpoint düzeltildi.
- [x] Taktik saha ve olaylar iki bağımsız kaydırılabilir sütunda: 340px + 278px genişlik.
- [x] İşlem çalışma yüksekliği 106px → **304px**; sekiz hızlı tuş tek yatay sırada, yatay taşma yok.
- [x] Sürüm içinde Ana ekran tuşu kullanılarak kontrol merkezine dönüş.
- [x] Rapor aç/kapat, not giriş paneli ve not kaydı (10→11).
- [x] Ana ekrana geçip canlı ekrana dönünce 1–3 skor ve 11 olay kaydı korunuyor.
- [x] Chrome hata kaydı oluşmadı (hedefli gerçek cihaz testleri).

## Kod değişiklikleri
- `web/matchstudio-premium-next.css`: Fold iç ekran breakpoint'i, tek-satır hızlı tuşlar, iç kaydırma panelleri; Android not ve olay düzeltme modalleri.
- `src/main.js`: Android'e özgü asenkron erişilebilir onay penceresi; olay kayıtları, değişim, saat ve maç bitirme onaylarına uygulandı; not kapatma işlemi.
- `src/app/views/live-events-report.js`: not paneli kapatma kontrolü.
- `src/app/views/live-match-clock.js`: Fold ekranında Ana ekran geçiş düğmesi.
- `tests/browser/zfold7-physical-viewport.spec.cjs`: ölçülen 351×679 ve 640×537 CSS viewportlar için kalıcı regresyon.

## Otomatik testler
- Birim: 109/109 PASS (son değişiklikler sonrası yeniden çalıştırılmalı).
- Yeni viewport regresyonu + saha/kadro testleri: 23 PASS, 4 SKIP, 0 FAIL.
- Tüm Playwright paketi: SON TEKRAR ÇALIŞIYOR; sonuç ve SHA-256 paket doğrulaması ayrıca eklenecek.

## Bilinen sınırlar ve yayın kapıları
- Bu test Android Chrome PWA testidir, **imzalı Android APK/AAB veya Google Play üretim yayını kabulü değildir**.
- Fiziksel cihaz üzerinde uzun süreli gerçek karşılaşma ve arka planda uyku/uygulama sonlandırma testleri yapılmadı; sahada kullanım öncesi saha kabulü önerilir.
- Off-grid testinde internet radyoları kapatılmadı; sadece PC'nin localhost tüneli kesildi.
- Gerçek kulüp kayıtları, orijinal F.17 paketleri ve canlı Git dalı değiştirilmedi; yalnızca F.18 test veritabanı kullanıldı.
- Kulüp veritabanını silme veya telefon önbelleğini temizleme yapılmadı.

## Kanıt ve sürüm güvenliği
Kanıt ekran görüntüleri ve test komut çıktıları kullanıcı PC'sinde `C:\Users\aearo\Documents\MatchStudio-Premium-Backup-20261104\ZFold7-Physical-Acceptance` altında saklanmalıdır.

## Nihai fiziksel cihaz işlemleri — tamamlandı
- Android gerçek iç ekranda `Sakatlık` seçimiyle olay kaydı **11→12** olarak doğrulandı (test maçının sonu beklendiği için oyuncu form listesinden seçildi).
- `Maçı tamamla` düğmesi, uygulama içi Android onayı ve `Tamamlandı` durumu doğrulandı.
- Nihai skor **1:3**. Maç sonu raporu açılıyor ve oyuncu istatistikleri gösteriliyor. Test gerçek resmî müsabaka olarak işaretlenmedi.
- İç ekranda `Rapor · Saat`, `Ana ekran`, maç ekranına dönüş ve test verisi kalıcılığı başarıyla denendi.
- Fiziksel açık cihaz ekranı PNG kanıtı: `C:\Users\aearo\Documents\MatchStudio-Premium-Backup-20261104\ZFold7-Physical-Acceptance\evidence\ZFOLD7_REAL_OPEN_ACCEPTANCE.png` (PNG 1968×2184 olarak doğrulandı).
- Nihai ekran: `...\evidence\ZFOLD7_REAL_OPEN_FINAL_REPORT.png` (tarayıcı ekran görüntüsü).
- Fiziksel ekran test betikleri (28 dosya): `...\ZFold7-Physical-Acceptance\scripts\`, kaynak pakete karışmaması için ayrı arşive taşındı.
- Gözlemlenen bir sınırlama: `awaitFinal` durumunda sahadaki oyuncular görsel olarak gösterilse de etkin saha seçme eylemleri yoktur; ilgili olay oyuncu açılır listesinden kaydedilebilir. Gerçek maçta devre bitmeden olay kaydı tercih edilmelidir.

## Regresyon takibi
- F.18 Z Fold7 yeni viewport testleri + kritik canlı/kadro senaryoları: **23 geçti, 4 atlandı, 0 hata**.
- İlk geniş koşu: **166 geçti, 12 atlandı, 1 test geçici hata, 1 eski kullanıcı akışı beklentisi başarısız**. Eski telefon beklentisi güncellenerek izole telefonda **3/3** geçti. Tam ikinci koşu devam ediyor, sonuç tamamlanınca güncellenecek.

## Son doğrulama (4 Kasım 2026)
- Son kod değişikliklerinden sonra `npm test`: **109 PASS / 0 FAIL**.
- `zfold7-physical-viewport.spec.cjs`, `coach-console.spec.cjs`, `coach-quick-actions.spec.cjs` tarayıcı regresyonu: **23 PASS, 4 SKIP, 0 FAIL**; `MATCHSTUDIO_TEST_PORT=8912`, `--workers=2`, `--retries=1`.
- `npm run package`: başarılı. PWA ve Source paketleri yeniden oluşturuldu.
- `dist/release.json` ile iki ZIP'in SHA-256 özeti yeniden hesaplanıp eşleşti: **PASS**.
- Kaynak ZIP içinde `.codex/` veya `.claude/` yerel ajan yapılandırması: **0**.
- Gerçek Galaxy Z Fold7 hâlen ADB'de ve `OPENED` durumunda. Android Chrome'da önizleme bağlantısı erişilebilir.
- Nihai sonucun kapsamı: **Android Chrome üzerinden PWA fiziksel cihaz kabulü**. İmzalı APK/AAB, Play Store ve uzun süreli saha maçı testi kapsam dışıdır.

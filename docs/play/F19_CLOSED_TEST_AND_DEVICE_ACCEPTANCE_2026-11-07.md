# Match Studio F.19 — Android Cihaz Kabulü ve Play Kapalı Test Durumu
Tarih: 2026-11-07 | Teknik durum: PARTIAL / NO-GO (üretim)

## Değişmeyen uygulama kimliği
- Paket: `com.matchdaystudio.app`
- Sürüm: 2.6.8 / versionCode 3 / targetSdk 36
- İmzalı yükleme dosyası: `C:\Users\aearo\Documents\MatchStudio-Android-Release-Candidate\artifacts\MatchStudio_F19RC1_UPLOAD_signed.aab`
- SHA-256: `3e8b67363861cb364ac62bbf7c6d318a00aabbc5db561c2ff2a3db3f93ca33c3`
- Yerel imza raporu: `AAB_SIGNED_INSPECTION_F19_V3.json`, signatureVerified=true, playUploadApproved=false
- Canlı DAL: `https://match-studio-telefon.vercel.app/.well-known/assetlinks.json`; HTTP 200, paket kimliği ve beyan edilen Google Play App Signing fingerprint eşleşmesi PASS
- Bu kontroller Play kanalı üzerinden yüklenmiş imzalı uygulamanın fiziksel cihaz kabulü değildir.

## Play Console — doğrudan gözlenen
- Alpha kapalı test: ETKİN DEĞİL, F.19 RC1 taslak, Türkiye 1 ülke
- Ayarlar: 2/4 tamamlandı, ülke ve yeni sürüm hazırlama tamamlandı
- 2026-11-07: `Match Studio F19 Kapali Test` e-posta listesi oluşturuldu; 1 Google hesabı (geliştirici hesabı) var
- Testçi listesi henüz alpha kanalı için kaydedilip incelemeye gönderilmedi
- Geri bildirim alanına geliştirici e-posta adresi yazıldı; ana sayfa `Kaydet` uygulanmadı
- Uzak görüntüleme/yürütme aracı `Kaydet` etkileşimini güvenlik incelemesinde engelledi; kullanıcıya tek tıklık işlem olarak bildirildi
- Testçi opt-in linki (`https://play.google.com/apps/testing/com.matchdaystudio.app`) yalnızca ilgili test sürümü yayımlandıktan sonra kullanılabilir
- **Gerçek testçi durumu:** 12 gerekli katılımdan hiçbiri için 14 günlük kesintisiz katılım doğrulanmadı

## Fiziksel Galaxy Z Fold7
- Telefon Termux cihaz kimliği: SM-F966B, Android 17
- Windows `adb devices -l`: hiçbir yetkili Android cihazı yok. USB üzerinden bağlı değil veya hata ayıklama yetkisi verilmemiş
- Yerel ağdaki `192.168.1.4:5555` ADB servisi Mi TV (aquaman), telefon değil. Yanlış cihaza bağlanma girişimi kesildi.
- Telefon Termux kabuğu Android uygulama sandbox'ındadır; Android yetkili shell erişimi ve dokunmatik otomasyon yok.
- Fold kapalı / açık ekran, Play App Signing sertifikalı tam ekran TWA, offline veri kalıcılığı, veri yedeği, güncelleme/güvenli geri alma kabulü **NOT RUN**. Başarılı gösterilmeyecek.

## TestSprite (web PWA, Android kabulü değil)
- Run: `cb65f8c7-8ee5-47c3-acb7-74c74d0a484c`
- 15 senaryo: 10 passed / 1 failed / 4 blocked. Kabul başarılı değil.
- Kritik regresyonun kök nedeni doğrulandı: son düzeltmeyi geri alma komutu kaynak golü iptal ediyordu. **PR #31**, geliştirme dalına merge edildi (a80bf0d). Append-only karşı düzeltme önceki skor ve golcü bilgisini koruyor. Ek kontroller: 131/131 birim testi ve 9/9 hedefli masaüstü/telefon/Fold tarayıcı testi PASS. **Eski TestSprite çalışması yeniden çalıştırılmış değildir; canlı production dağıtımı ayrı doğrulanmalı.**
- TestSprite sonucu Play kapalı testin, gerçek Play-signed APK kurulumunun ya da fiziksel cihaz testinin yerine geçmez.

## Bir sonraki kabul sırası
1. Play Console > Alpha > Test kullanıcıları: oluşturulan listeyi seçin; geri bildirim adresini denetleyip **Kaydet**. Ardından F.19 RC1 taslağını önizleyin ve varsa engelleri çözerek Google incelemesine gönderin.
2. 11+ ek, gerçekten kabul etmiş yetişkin Google kullanıcısı ekleyin; tercihen 15–20 kişiyle yedek katılımcı bırakın. Gerçek katılımcılara opt-in bağlantısını paylaşın. Kullanıcı onaylarını sahte hesap veya bot ile taklit etmeyin.
3. 12 gerçek kullanıcı 14 gün kesintisiz opt-in olmadan üretim erişim başvurusu yok. Süre, Play'in doğruladığı katılım tarihlerinden başlar; taslak oluşturma tarihinden değil.
4. Galaxy Z Fold7 USB data kablosuyla bağlanıp geliştirici seçeneklerinden USB hata ayıklama izni verilince `adb devices -l` ile yeniden kontrol. Gerçek cihaz verilerini silmeden Play üzerinden kurulan sürümü test edin.
5. Canlı maç geri alma düzeltmesi geliştirme dalında test edildi. Tam tarayıcı regresyonu ve güvenli üretim dağıtımı başarılı olursa TestSprite'ın aynı senaryosunu canlı sürümde yeniden çalıştır. İmzalı Android paket içeriği değişecekse versionCode artırarak yeni AAB üret; yalnızca web içeriği değişirse Play'deki mevcut AAB'nin yeniden yüklenmesi gerekip gerekmediğini ayrıca değerlendir.
6. Google Play uygulama içerikleri, veri güvenliği, mağaza girişi, satıcı statüsü ve üretim erişim incelemesini gerçek belgelerle tamamla.

Resmî kaynaklar:
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/9845334
- https://developer.android.com/training/app-links/verify-android-applinks

Bu kayıt hiçbir API anahtarı, keystore, parola veya gerçek sporcunun verisini içermez.

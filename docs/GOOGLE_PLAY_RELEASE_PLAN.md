# MATCH STUDIO – Google Play Son Üretim Planı
Tarih: 25 Ekim 2026 | Kanonik uygulama: https://match-studio-telefon.vercel.app

**Durum: Hazırlık. Play Store'a henüz bir AAB yüklenmedi; hesap erişimi ve imzalama anahtarı doğrulanmadı.**

## A. Mevcut teknik temel
- Tek ürün: Match Studio V2.6.8-F.13 PWA + Android Trusted Web Activity (TWA).
- PR #15 canlı main commit 5c186735; Vercel Production READY; PWA, manifest, offline servis çalışanı, ikonlar ve önceki tarayıcı testleri mevcut.
- TWA başlangıç yolu /index.html; sabit HTTPS host match-studio-telefon.vercel.app.
- Önizleme originleri farklı yerel IndexedDB kullandığı için Play paketinde preview URL kesinlikle kullanılmayacak.
- Android package ID önerisi **com.daricagucusk.matchstudio**. GEÇİCİDİR; ilk Play kaydından önce sahibi onaylamalı. Play'e ilk yüklemeden sonra paket ID değiştirilemez.
- Android sürüm adı 2.6.8, ilk versionCode 1. İleride versionCode monoton artmalı.
- PWA verileri tarayıcı profiline bağlıdır. ChatGPT içi tarayıcı, Chrome ve TWA'nın hepsinde aynı kayıtların bulunduğu varsayılmamalıdır. Şifreli dışa aktarma ve geri yükleme ile doğrulanmalıdır.

## B. Google Play 2026 zorunlu koşulları
1. Yeni Android uygulamaları 31 Ağustos 2026 itibarıyla **targetSdkVersion 36 / Android 16** hedeflemeli. Bubblewrap/PWABuilder çıktısı App Bundle Analyzer veya Play Console üzerinden API 36 olarak doğrulanmalı.
2. Google Play geliştirici hesabı gerekli; yeni hesap için tek seferlik 25 ABD doları ücret ve kimlik/iletişim doğrulaması söz konusu.
3. 13 Kasım 2023'ten sonra oluşturulmuş kişisel hesaplar genellikle **12 testçi / 14 gün kesintisiz kapalı test** sonrasında Production access başvurusu yapabilir.
4. Her uygulamanın Play Console ve uygulama içinden erişilebilen gizlilik politikası olmalı.
5. Gerçek işlevlere ait mağaza görüntüleri: 512x512 uygulama simgesi; 1024x500 feature graphic; asgari 2 gerçek ekran görüntüsü. Tercihen 4 ekran: ana ekran, kadro, maç günü, haftalık pano/afiş.
6. Oyuncu fotoğrafları ve çocukların kişisel verileri mağaza görsellerinde kullanılmamalı. Uygulama hedef kullanıcısı koçlar/kulüp yöneticileridir; çocuklara yönelik uygulama olarak yanlış sınıflandırılmamalı.
7. Data Safety, hedef kitle, reklam, içerik derecelendirmesi ve veri silme süreçleri **nihai AAB'nin ve web uygulamasının gerçek davranışına** dayanmalı.

## C. Telefonda paketleme – önerilen yol
1. Play Console hesabını aç ve doğrula: https://play.google.com/console
2. Telefon tarayıcısında https://www.pwabuilder.com/ adresini aç. PWA URL olarak https://match-studio-telefon.vercel.app ver.
3. PWABuilder PWA kalite raporunda hata varsa bunları düzelt. Android paketleme seçeneklerinde sabit host, paket ID, başlatma URL'si ve ikonları doğrula.
4. Android SDK hedefinin **API 36** olduğuna emin ol. Uygun değilse Bubblewrap'ın API 36 derleyen güncel şablonu ile Android Gradle projesi üret.
5. **İmzalı Android App Bundle (.aab)** ve fiziksel cihaz testi için signed APK oluştur. İmzalama/upload keystore'unu ve şifreleri yalnızca sahibinin güvenli kasasında sakla. Sohbete, GitHub kaynak koduna veya Issues'a yükleme.
6. Google Play App Signing etkinleştirildiğinde **App signing certificate SHA-256** fingerprint'ini Play Console > App integrity ekranından kopyala. Bu fingerprint, upload key fingerprint'inden farklı olabilir.
7. Domain doğrulama dosyasını üret: https://match-studio-telefon.vercel.app/.well-known/assetlinks.json. Dosya JSON Content-Type ile HTTP 200 dönmeli, Play signing SHA-256 ve kesin package ID içermeli. Henüz gerçek fingerprint olmadığından sahte bir dosya yayınlanmadı.
8. Play Console'daki Internal testing kanalına AAB yükle. Android 16 ve Fold7 üzerinde TWA'nın adres çubuğu göstermeden açıldığını, çevrimdışını, kamera/dosya seçimini, şifreli yedeği ve verilerin korunduğunu doğrula.
9. Hesap için gerekiyorsa Closed testing (12/14) ve Production access başvurusunu tamamla. İnceleme ve ülke dağıtımını sonra başlat.

**Not:** PWABuilder'ın dışa aktardığı paket teknik olarak AAB üretse bile, Play Console tarafından kabul edilene kadar yayın dosyası doğrulanmış sayılmaz.

## D. Güvenlik ve kabul blokajları
- [x] Birleşik PWA canlı, Play-öncesi 95 Playwright testi başarılı.
- [x] android/twa-manifest.json için geçici TWA metadata hazır.
- [x] tools/check-play-readiness.cjs dosyasıyla güvenli teknik ön kontrol hazır.
- [ ] Android package ID ve Play Console geliştirici hesabı onaylanmalı.
- [ ] İmzalı API 36 AAB ve onun keystore'u oluşturulmalı, Play Console kabul etmeli.
- [ ] Android App Links / TWA Digital Asset Links gerçekte doğrulanmalı.
- [ ] Uygulama içi ve canlı URL'de gizlilik politikası yayınlanmalı (önce yasal/veri işleme denetimi).
- [ ] Data Safety, kullanıcı destek e-postası, gizlilik sorumlusu, mağaza kategori/yaş/ülke kararları.
- [ ] 512 ikon, 1024x500 grafik ve gerçek (sentetik verili) screenshot'lar Play Console'a yüklenmeli.
- [ ] Hedef kullanıcı testleri ve gerekiyorsa 12 testçi/14 gün test şartı.
- [ ] GitHub main dalı zorunlu verify/ruleset ile korunmalı (Issue #16).
- [ ] Play Store listing onaylanmış ve Production durumu Published olmalı.

## E. Depo kontrolleri
Hazırlık kontrolü: npm run check:play
Eksik Play anahtarı / privacy / assetlinks varsa kontrol **BLOCKED** raporlar. Kırmızı blokajları gerçekte kapatmadan Play'e gönderme.
Son gate: npm run check:play:strict

Bu dosya **AAB değildir** ve Google Play'de yayınlandığını iddia etmez. Nihai hesap, sertifika, destek e-postası ve mağaza yüklemeleri sahibi tarafından doğrulanmalıdır.

Kaynaklar:
- https://support.google.com/googleplay/android-developer/answer/11926878
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/10144311
- https://support.google.com/googleplay/android-developer/answer/9866151
- https://github.com/pwa-builder/PWABuilder/blob/main/docs/builder/android.md
- https://github.com/googleChromeLabs/bubblewrap/blob/main/packages/cli/README.md


## GÜNCEL 26.10.2026 KANONİK DURUM

- Kaynak: `main` = `4cbf8f899cc1466fe1621d42900fa959357d985f`; Vercel Production READY aynı commit.
- PR #20 fikstür aktarım kulüp izolasyonu, PR #21 yatay ekran erişimi: **merged**. Eski PR #17 hazırlık olarak açık.
- Birleşik yeni yayın adayı PR #25; Play/TWA hazırlığı #22 ve P0-02 kalıcı silme #23 birlikte; iki PR ayrıca körlemesine birleştirilmez.
- `README.md` güncel kullanım ve test kaynak noktası; geçmiş F.11/F.3 doküman notları **geçmiş**.
- Başlıca NO-GO: Kalıcı silme Chrome/Z Fold7 kabulü, gerekli gizlilik onayı, gerçek Google Play App Signing SHA-256, assetlinks, imzalı target API 36 AAB, Data Safety ve Play Console test izinleri.
- Proje kontrol merkezi: https://github.com/daricagucusk/Match-Studio/issues/24


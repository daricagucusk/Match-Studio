# MATCH STUDIO — Play Store ilk yayın ve tek seferlik Pro planı

**Karar tarihi:** 26 Ekim 2026  
**Onaylı model:** Google Play'de ücretsiz indirme; ilk yayın sonrasında isteğe bağlı, tek seferlik (non-consumable) Match Studio Pro lisansı. **Abonelik yok.**  
**Fiyat:** 699 TL yalnızca doğrulanacak lansman fiyatı önerisi; satın alma ürünü/fiyatı henüz onaylanmış veya aktif değil.

## A. Galaxy Z Fold7 üzerinde şimdi: Play Console uygulama kaydı

1. Chrome'da https://play.google.com/console adresini aç; aktif bireysel geliştirici hesabıyla giriş yap. Gerekirse Chrome üç nokta > Masaüstü sitesi.
2. Home/Ana sayfa > Create app/Uygulama oluştur.
3. Ad: **Match Studio**; varsayılan dil: **Türkçe**; tür: **Uygulama** (oyun değil); fiyatlandırma: **Ücretsiz**.
4. Kullanıcıların erişebileceği, sahibince seçilen **destek e-postasını** gir. Burada onaylanmamış bir adres uydurma.
5. Developer Program Policies, US export laws ve Play App Signing beyanlarını okuyup kabul ederek **Uygulama oluştur**.
6. Bu işlem üretim yayını DEĞİLDİR. Dashboard görevleri açılacaktır. Uygulama oluşturulduğunda ekranın/menülerin durumunu yeniden doğrula.

**Ücretsiz seçimin etkisi:** Google Play'de uygulama ücretsiz sunulduktan sonra aynı uygulama ücretli indirmeye çevrilemez; ancak Google Play Billing ile uygulama içi Pro satın alma eklenebilir.

## B. İlk yayın: FREE — güvenli MVP

- Mevcut ana işlevlerin korunduğu, ücret talep etmeyen sürümü sun.
- İlk sürüme çalışan satın alma altyapısı olmadığı hâlde Pro/abonelik butonu ve sahte lisans kapısı ekleme.
- Mevcut oyuncu, maç, kulüp ve tarihsel kayıtları bozma; veri dışa aktarma/yedekleme/silme gibi kullanıcının verisini koruyan işlemleri ücretlendirme engeli yapma.
- Hazırdaki gerçek uygulama işlevleri dışında bulut senkronu, otomatik TFF veri entegrasyonu veya ödeme hizmeti vaat etme.
- Release candidate: https://github.com/daricagucusk/Match-Studio/pull/25
- QA unsigned AAB API 36 kanıtı: https://github.com/daricagucusk/Match-Studio/actions/runs/40370419012 (AAB 5.407.998 bayt, imzasız QA; Play'e yüklenemez).

## C. PLAY CONSOLE yayın kapıları — öncelikli sıra

1. **Hesap ve uygulama:** Bireysel hesabın açılış tarihi, üretim erişimi ve cihaz doğrulama durumunu kontrol; uygulama kaydı oluştur.
2. **Paket adı:** `com.daricagucusk.matchstudio` yalnız öneridir; ilk signed AAB upload'undan önce kesinleştir. TWA host `match-studio-telefon.vercel.app`.
3. **Gizlilik:** Veri sorumlusu, kamuya açık destek iletişimi, gerçek ağ/SDK davranışları ve çocuk sporcu fotoğraflarının işlenmesi doğrulanmış bir HTTPS privacy URL'si; uygulama içinden de erişim.
4. **Play bilgileri:** Spor kategorisi; Türkçe açıklama, reklamsızsa reklamsız beyanı, doğru hedef kitle/yaş değerlendirmesi, Data Safety, Play politika anketleri ve gerçek uygulamadan sentetik oyuncu verili ekran görüntüleri.
5. **İmzalı Android paket:** Güvenilir sahibin koruduğu upload key ile Android 16 **target API 36**, benzersiz versionCode içeren signed release AAB. JKS veya parola GitHub'a/sohbete gönderilmez.
6. **App Signing / Digital Asset Links:** Play Console App Integrity içindeki **App signing certificate SHA-256** kullan; upload key fingerprint'iyle karıştırma. Kamuya açık `/.well-known/assetlinks.json` doğru paket adı ve SHA içersin; gerçek telefonda TWA doğrulansın.
7. **Kabul:** Samsung Galaxy Z Fold7 iç/dış/yatay ekran, Android geri tuşu, offline ilk kurulum sonrası çalışma, şifreli yedek, kulüpler arası kayıt izolasyonu, kalıcı oyuncu silme ve eski yedekten tekrar ortaya çıkmama, PNG paylaşımları.
8. **Test kanalları:** Önce Internal testing; hesap 13 Kasım 2023 sonrası açılmışsa en az **12 testçi 14 gün kesintisiz opt-in** ile Closed testing, sonra Production access başvurusu ve onayı.
9. **GO/NO-GO:** Son CI, imzalı AAB, gerçek cihaz testleri, gizlilik/Play politika beyanları ve üretim erişimi onaylanmadan herkese açık yayına geçme.

## D. Pro yükseltmesi — ikinci yayın

- Google Play `one-time product` / **non-consumable**; önerilen ürün ID: `matchstudio_pro_lifetime` (Play Console'da açmadan önce onay).
- Örnek değer önerileri: ileri düzey maç raporu, premium afişler ve gelişmiş taktik araçlar; **nihai Pro sınırı kullanıcı tarafından ayrıca karara bağlanacak**.
- TWA'da Digital Goods API / Payment Request API ve Google Play Billing entegrasyonu; Play Console ürün katalogu; ilişkili Google Payments merchant hesabı.
- Satın alma token'ı **güvenilir sunucuda** Google Play Developer API ile doğrulanacak; çift kullanım/iptal/iade, acknowledgement, tekrar yükleme, farklı cihaz, offline geçici yetki ve eski kullanıcı hakları test edilecek. Yalnız localStorage `isPro=true` güvenli lisans değildir.
- **Mevcut ücretsiz kullanıcıların işlevlerini önceden haber vermeden ücretli kilitleme.** Önce müşteri/pilot doğrulaması, sonra ürün-kapsam-fiyat onayı.
- Başlangıç sürümü için abonelik, ücretli indirme veya ticari tahsilat altyapısını zorunlu bağımlılık yapma.

## E. Değişmez üretim kuralları

- Kanonik `main` ve canlı Vercel **korunur**: son doğrulanan temel `4cbf8f899cc1466fe1621d42900fa959357d985f`.
- PR #25 üzerinde test, CI ve cihaz kabulü; `main`e otomatik merge yok.
- Aktif Codex Cloud çalışmaları ve tarihsel dal/PR'lar körlemesine birleştirilmez.
- Bu belge Play Console uygulamasının oluşturulduğunu, signed AAB üretildiğini veya Play Store yayını yapıldığını iddia etmez.

## Resmî belgeler

- https://support.google.com/googleplay/android-developer/answer/9859152
- https://support.google.com/googleplay/android-developer/answer/6334373
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/11926878
- https://support.google.com/googleplay/android-developer/answer/10144311
- https://developer.chrome.com/docs/android/trusted-web-activity/receive-payments-play-billing
- https://developer.android.com/google/play/billing/security

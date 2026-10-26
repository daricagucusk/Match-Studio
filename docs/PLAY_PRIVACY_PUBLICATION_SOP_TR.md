# Match Studio — Gizlilik sayfasını güvenli yayına alma işlemi

**Durum:** Şu anda gizlilik sayfası hâlâ onaylı değil, `privacy.html` root dosyası kasıtlı olarak eklenmedi.

## Yayına alınması için

1. Ürünün gerçek yasal veri sorumlusu ve **herkese açık** destek e-posta adresini kullanıcı ayrıca onaylamalı; Play Console'daki geliştirici profiliyle tutarlı olmalı.
2. Veri işleme, saklama/silme, paylaşım, çocuk sporcu verisi ve Vercel erişim günlüklerinin doğrulanmış politikasını HTML olarak yayıma hazırla.
3. Yayın belgesini repo kökünde `privacy.html` olarak hazırla (PDF değil). `<title>Match Studio Gizlilik Politikası</title>`, uygulama adı, `mailto:` destek iletişimi, veri saklama/silme açıklaması zorunludur.
4. `index.html` içinde görünür ve klavyeyle erişilebilir `<a href="./privacy.html">Gizlilik Politikası</a>` bağlantısını ekle.
5. `tools/play-privacy-validate.cjs` ve `tools/export-static.cjs` kaynak doğrulamasından geçsin; placeholder içerik yayınlanamaz.
6. Onaylı PR birleşince https://match-studio-telefon.vercel.app/privacy.html için HTTP 200, HTML içerik ve uygulama içinden gezinme testi yap. Servis çalışanı bu URL'yi SPA ana sayfasına yönlendirmemelidir.
7. Google Play Console gizlilik URL'si, Play Data Safety ve uygulama içi belge aynı davranışı yansıtmalı.

**Not:** Otomatik regex kontrolü hukuki onay yerine geçmez. Gizlilik metni ve dışarıdan görünen kimlik/iletişim bilgileri onay olmadan yayımlanmayacak.

**Kaynak:** https://support.google.com/googleplay/android-developer/answer/10144311

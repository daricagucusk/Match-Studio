# Match Studio — Google Play görsel paketi (gerçek UI)

- Kaynak: `tests/browser/play-store-screenshots.spec.cjs`.
- Yalnızca **phone** Playwright projesinde ayrı ve boş tarayıcı profilinde örnek kulüp, örnek oyuncular, örnek rakip oluşturulur; gerçek sporcu/veli verisi yoktur.
- Üretilen ekranlar: ana ekran, oyuncular, maç planlama, afiş stüdyo (4 PNG).
- Her ekran **1080 x 2340** piksel ve gerçek uygulamanın Chromium ekran görüntüsüdür. Görsel oluşturmada kurgu UI kullanılmaz.
- Üretim: `npm run release` sırasında Playwright testi; GitHub `verify.yml` başarılı olunca `matchstudio-play-store-screenshots` adlı Actions artifact'i.
- Bunlar **Play Console'a eklemeden önce elle incelenecek aday görüntülerdir**. İzinli olmayan kulüp arması, gerçek oyuncu ismi/fotoğrafı, bitmemiş Pro/abonelik vadeleri veya ekranda okunmayan bölümler varsa yeniden çekin.
- Kullanıcı isterse aynı adımlar Fold7 Chrome üzerinde sentetik veriyle tekrar edilerek gerçek cihaz görselleri eklenebilir.
- 512x512 mağaza simgesi ve 1024x500 feature graphic ayrıca ürün kimliği ve görünür marka değerlendirmesinden geçmelidir.
- **Güvenlik:** GitHub artefaktı kullanıcı verisi taşımamalıdır; test profilinde PII kaydı yoktur. `dist/` kaynak ZIP dışıdır.

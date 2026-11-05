# Birleşik aday — 5 Kasım 2026

Bu çalışma ağacı, F.18 web sürümü `6470d9e` temelinden ve ayrı F.19 geliştirme ağacının kaynak değişikliklerinden oluşturuldu. Yedek önizlemesinde mevcut ve yedekteki kayıt sayıları gösterilir; kulüp dosya okunurken değişirse önizleme reddedilir. Başka kulüp ve eski yedeklerin boş hedefe aktarımı korunur; dolu hedefin üzerine farklı veya kimliği eksik yedek geri yüklenemez.

## Yerel kanıt

- Bu çalışma ağacında `npm test`: 115 başarılı, 0 başarısız.
- Bu çalışma ağacında `npm run build:vercel`: başarılı, 60 modül ve 30 statik dosya.
- Bu çalışma ağacında tam Playwright koşusu (8970 portu, 3 işçi, tekrar kapalı): 195 başarılı, 12 atlandı, 0 başarısız. Bu sonuç, fiziksel cihaz kabulü veya canlı dağıtım değildir.
- Yedek ve aktarım tarayıcı testleri aynı aday kopyasında masaüstü, telefon ve Fold profillerinde 6/6 başarılıdır.

## Açık noktalar

- Atlanan 12 sonuç altı senaryonun diğer ekran profillerindeki koşullu tekrarlarıdır: taslak kopyalama, mağaza grafik ve ekran görüntüleri, güncelleme protokolü ve Fold iç/dış ekran ölçümleri ilgili seçilmiş profilde çalışır. Gerçek cihaz kabulü ayrıca gereklidir; 5 Kasım kontrolünde ADB cihaz listelememiştir.
- Gerçek kulüp kayıtlarını, geri dönüş kopyalarını, eski çalışma ağaçlarını ve Play imza materyallerini koruyun.
- GitHub main, Vercel ve Play sürümleri bu yerel adayla kendiliğinden güncellenmez.
- Önceki dallar ve arşivler yalnızca içeriğin korunduğu doğrulanarak düzenlenmelidir.

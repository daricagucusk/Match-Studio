# Korunan kanıtlar

Bu klasör geçmiş inceleme ve teslim kayıtlarını içerir. Dosyalar güncel test çıktısı veya canlı yayın kabulü sayılmaz.

| Konum | Önceki konum | İçerik |
|---|---|---|
| `baseline/` | Proje kökündeki `baseline/` | Önceki kaynak kökeni ve tarihsel kayıt; release testleri geçici sentetik arşiv kullanır |
| `reviews/` | Proje kökündeki `reviews/` | Tarihli ekran görüntüleri, ölçümler ve inceleme notları |
| `deployments/` | Proje kökündeki `deployments/` | Önceki dağıtım kayıtları |

2 Kasım 2026 taşıması sırasında bu dosyaların içeriği korunmuştur. Önceden değiştirilmiş görseller de mevcut halleriyle taşınmıştır. İçlerinde yazan eski dosya yolları tarihsel kayıt olarak bırakılmıştır.

Yeni otomatik ekran görüntüleri ve ölçümler `test-results/reviews/` içine, mağaza görselleri `dist/store-listing/` içine üretilir. İnceleme sonucunu kalıcı kanıt olarak saklamak gerekiyorsa tarihli bir alt klasöre seçerek alın; bütün test çıktılarını buraya kopyalamayın.

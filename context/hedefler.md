# Hedefler

Bu belge Match Studio'nun aktif hedefleri, öncelikleri ve başarı ölçütlerini içerir.

## Aktif hedefler

- Takım derinliği: bütün saha görevlerini ana sayfayı aşağı kaydırmadan gösteren, aynı ekranda kolay oyuncu girişi ve tercih sıralaması sağlayan tasarım. Araştırma ve ajan üretimi kullanıcı tarafından istendi; uygulama sözleşmesi `../docs/TEAM-DEPTH-DESIGN.md`. Telefonun sonlu görünür alanında ek tercihlere erişim açık olmalı; veri kırpma veya okunamaz küçültme kabul sayılmaz. Ekran ve kalıcılık doğrulaması 6 Kasım 2026'da yerel Chromium'da PASS; fiziksel cihaz ve yayın kabulü ayrı hedeftir.
- Tek yerel kaynak: `Calisma/Birlesik-Tek-Surum`. F.19 canlı maç konsolu, takım derinliği ve taktik rollerindeki değişiklikleri tek kaynakta geliştirmek.
- Kulüp/sporcu verilerini, çevrimdışı kullanımı, şifreli geri yükleme ve maç geçmişini korumak.
- Masaüstü, telefon ve Fold açık/kapalı profillerinde canlı maç ekranını, gol/asist/kart/değişim akışlarını ve iptal/geri alma işlemlerini doğrulamak.
- Gerçek Galaxy Z Fold7 kabulünü tarayıcı emülasyonundan ayrı yürütmek; Play Store/Vercel yayını için ayrıca açık yetki ve doğrulama almak.
- 6 Kasım 2026 klasör sadeleştirmesi sonrasında yeniden üretilebilir testleri kalıcı eski ZIP paketlerine bağımlı bırakmamak.
- Açık güvenlik işi: ifşa olmuş OpenRouter anahtarları kullanıcı tarafından döndürülmeli (OpenRouter'da revoke; yeni anahtar yalnızca GitHub Secret). Yerel anahtar dosyaları `D:\beyin2\.gitignore` kurallarıyla sürüm denetimi dışı; bu adım tamamlanmadan yayına geçme gündeme alınmaz.

## Öncelik sırası

1. Mevcut kullanıcı verilerini ve kaydedilmemiş geliştirmeleri korumak.
2. Doğru kaynak sürümü üzerinde birim, tarayıcı ve derleme testlerini sürdürmek.
3. Gerçek cihazda kullanım ve çevrimdışı veri kabulünü tamamlamak.
4. Yayını yalnızca açık yetkilendirme ve kanıtlı regresyon sonrasında yapmak.

## Başarı ölçütleri

- Kaynak çalışma alanı tek ve açıkça belirtilmiştir; paralel eski sürümler üzerinde geliştirme yapılmaz.
- Güncel sürümde birim testleri ve derleme başarılıdır; tarihli test sonuçları koşuldukları koda aittir.
- Gerçek sporcu bilgileri test ve yayın görsellerinde kullanılmaz; şifreli yedek ve geri yükleme mantığı korunur.
- Cihaz, imzalı Android paketi ve Play/yayın kabulü otomatik testlerden ayrı doğrulanır.

## Zaman sınırları

Doğrulanmış zorunlu son tarih bulunmuyor.

## Tarihsel çalışmalar

F.17 ve F.18 sonuçları `docs/` altında tarihli raporlarda bulunabilir; bunlar F.19 fiziksel cihaz veya canlı yayın kabulü değildir.

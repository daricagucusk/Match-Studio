# Takım derinliği: araştırma ve uygulama sözleşmesi

Tarih: 6 Kasım 2026. Durum: uygulama tamamlandı; yerel Chromium kabulü PASS. Ayrıntı ve ölçümler: `TEAM-DEPTH-ACCEPTANCE.md`. Fiziksel cihaz/yayın kabulü değildir.

## Amaç ve mevcut kanıt

Antrenör tüm saha görevlerini tek ekranda görmeli, bir görev seçip aday ekleyebilmeli ve öncelik sırasını kolayca değiştirebilmelidir. Ana sayfa aşağı kaymamalıdır.

`src/app/views/team-analysis.js` şu anda başlık, takım araç çubuğu, format kontrolleri, saha ve sürekli açık atama panelini alt alta üretir. `src/team/team-pitch.js` aynı adayları saha kartları ve ayrıntılı görev listesinde tekrarlar; ardından mevki seçici ve açıklama ekler. Atama paneli de adayları seçici listesinde ve tam tercih listesinde tekrarlar. Bu tekrarlar yükseklik sorununu büyütür.

`src/domain/team-depth.js` bağımsız görev anahtarlarını, `slotCandidates`, `tacticalRoles`, eski ortak mevki listesinden dönüşü ve sınırsız alternatifleri destekler. Bu veri modeli korunmalıdır. Sol ve sağ stoper bağımsızdır. Aynı oyuncunun birden fazla göreve aday gösterilmesi veri kaybına yol açmamalıdır.

## Kullanılabilecek kaynaklar

| Kaynak | Değerlendirme | Uygulama kararı |
|---|---|---|
| Yerel `context/README.md`, `kurallar-ve-sinirlar.md`, `proje-ozeti.md`, `kararlar.md` | Ürün ve veri sınırlarının kaynağı | Öncelikli |
| `design:design-handoff` becerisi | Boyutlar, durumlar, etkileşim ve erişilebilirlik sözleşmesi | Bu belge için kullanıldı |
| Mobbin ekran/akış arama araçları | Yoğun kadro tabloları ve yan düzenleyici görsel referansları için uygun; futbol veri modeli sağlamaz | İsteğe bağlı görsel araştırma; bu çalışmada canlı çağrılmadı |
| GitHub eklentisi | Depo ve kaynak dosyalarını salt okunur incelemek için uygun | Yeni bağımlılık kurmak gerekmiyor |
| [SortableJS/Sortable](https://github.com/SortableJS/Sortable) | Resmî depo dokunmatik destekli, çerçevesiz sıralama sunduğunu belirtiyor | İleride sürükleme eklenirse aday; ilk üretimde mevcut düğmeler yeterli |
| [taye/interact.js](https://github.com/taye/interact.js) | Resmî depo sürükleme, boyutlandırma, çoklu dokunma ve hizalama sunuyor | Bu görev için gereksiz ek etkileşim yükü; kurulmayacak |
| [WAI modal dialog örüntüsü](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Odak yönetimi, Escape ve kapatınca odağı geri verme | Görev düzenleyici için kaynak |

GitHub depoları ve WAI sayfası 6 Kasım 2026'da doğrudan web aracıyla okundu. Depolardan kod indirilmedi veya çalıştırılmadı. `D:/AI-Agents/AGENCY-AGENTS-PLAYBOOK.md` bu ortamda bulunamadı; kullanılabilir uzman rolü UX Architect üzerinden çalışıldı.

## Uygulama sonucu

- Ana görünüm `src/app/views/team-analysis.js` içinde tek tablo, düzenleyici aynı ekranda native `<dialog>` olarak uygulandı; yinelenen saha kartı ve ikinci uzun aday listesi kaldırıldı.
- Durum ve olay bağları `src/main.js`, görünüm stilleri `web/matchstudio-premium-next.css`; yeni kütüphane kurulmadı.
- 4-3-3 için 11/11 görev satırı dört görünümde görünür; 1440×1000, 1280×720, 840×980 ve 360×780 ölçümlerinde belge, ana içerik ve tablo dikey kaydırma üretmiyor.
- Metin ölçüleri: 14 px (masaüstü/Fold açık), 12 px (1280×720 kısa ekran), 13 px (telefon); dikey metin kırpılması 0.
- Sütun gezinmesi, aday sayfalama, rol/öncelik kalıcılığı, odak tuzağı ve boş takım durumu canlı doğrulandı. Ayrıntı: `TEAM-DEPTH-ACCEPTANCE.md`; betik: `tools/qa-team-depth.cjs`.

## Önerilen ana görünüm

Ana görünüm bir derinlik tablosu: her bağımsız saha görevi bir satır, tercih sıraları sütunlar. Böylece 11 görev tek bakışta karşılaştırılır. Saha görünümü isteğe bağlı ikinci görünüm olabilir; aynı anda hem saha hem yinelenen uzun liste gösterilmez.

Üst satırda takım, diziliş ve düzenleme erişimi bulunur. Özetler tek kısa satırda: atanmış oyuncu, boş görev, toplam aday. Açıklamalar yardım düğmesinde açılır. Sayfa yüksekliği `100dvh` içindeki mevcut uygulama navigasyonu çıkarılarak hesaplanır; `.page` için genel taşma gizleme uygulanmaz. Modül özel düzeni `min-height:0` ve grid satırlarıyla sınırlandırılır.

Tablo 11 görev satırını korur. Her satırda görev adı ve tercih adayları bulunur. Boş hücrede `+ Oyuncu` metni bulunur; dolu hücre tıklanınca o görevin düzenleyicisi açılır. Takım ve diziliş değişince kayıtlı adaylar silinmez.

## Boyut ve kapasite sözleşmesi

| Görünüm | Hedef | Gerçekleşen (6 Kasım 2026) |
|---|---|---|
| Masaüstü | 1440×1000 ve 1280×720 | 1440×1000: 11 görev, 3 tercih, 62 px satır, 14 px metin. 1280×720: 11 görev, 3 tercih, 37 px satır, 12 px metin (kısa ekran istisnası). |
| Açık katlanabilir/tablet | 840×980 | 11 görev, 2 tercih, 60 px satır, 14 px metin. |
| Telefon dikey | 360×780 | 11 görev, 2 tercih, 45 px satır, 13 px metin; görev adı görsel olarak kısalır, tam ad `aria-label`/`title` ile erişilebilir. |
| Kısa yatay ekran / büyütülmüş metin | ör. 780×360 veya %200 yakınlaştırma | Okunabilirliği koruyan erişilebilir taşma; bu durumda kaydırmasız kabul iddiası yapılmaz |

Sınırsız adayın tüm tam adlarını sonlu bir telefon ekranında aynı anda göstermek fiziksel olarak mümkün değildir. `overflow:hidden`, 9 px metin veya görünmeyen alternatifler çözüm sayılmaz. İlk iki/üç tercih aynı anda görünür; sonraki tercih sütunları `3–4. tercihler` gibi açık etiketli önceki/sonraki düğmelerle aynı tablo içinde gezilir. Her satır toplam aday sayısını taşır. Bu davranış kullanıcının 'bütün derinlik' beklentisine sunulmalı; sınırsız alternatiflerin aynı anda görünmesi tamamlandı diye bildirilmemelidir.

Uzun isimler masaüstünde iki satıra kadar, dar görünümde görsel kısaltmayla gösterilir; erişilebilir isim tam kalır ve tıklanınca tam isim görünür. Kısaltma veri kaydını değiştirmez. Dokunma hedefleri mümkünse 44 px, en az 24 px ve yeterli aralıklı olmalıdır.

## Basit veri girişi

1. Görev satırına veya boş tercih hücresine dokun.
2. Görev başlığıyla açılan düzenleyicide oyuncuyu ara; sonuç satırındaki seçimi değiştir.
3. Seçili oyuncular numaralı sıra halinde görünür; yukarı/aşağı düğmeleriyle önceliği değiştir. Taktik rol tek seçiciden değişir.
4. Kaydetme mevcut yerel kalıcılık akışını kullanır. Başarısız yazma başarı gibi gösterilmez. Düzenleyici kapanınca aynı görev hücresine odak döner.

Düzenleyici masaüstünde yan panel/dialog, telefonda sınırlı yüksekliğe sahip dialog olabilir. Ana takım tablosu arkada aynı konumda kalır. Aday listesi beş sonuçluk sayfalara bölünür; önceki/sonraki düğmeleri, toplam sonuç ve sayfa bilgisi açıkça gösterilir. Düzenleyicide de aşağı kaydırma gerekmez. Arama sorgusu değişince ilk sonuç sayfasına dönülür. Oyuncu seçimi başka sayfadaki seçimleri silmez. Kapat düğmesi ve Escape çalışır; Tab modal içinde kalır. Yeniden render sonrasında arama ve odak korunur. Tam oyuncu adları düzenleyicide okunabilir olmalıdır; aşırı uzun adlar ve büyütülmüş metin için erişilebilir taşma istisnası ayrıca doğrulanır.

## Üretim sınırları ve kabul kanıtı

- Üretim dosyaları: `team-analysis.js`, `team-pitch.js`, ilgili CSS ve gerekli `main.js` olay bağları. Domain verisi ve kaydedilmiş kulüp verileri korunur.
- Boş takımda açık oyuncu ekleme yönlendirmesi; eksik grup varsa anlaşılır boş durum.
- 11 bağımsız görev DOM'da ve ekranda görünür olmalı; yalnızca scrollHeight ölçümü yeterli değildir. Her satırın bounding box sınırlarını, tıklanabilirliğini ve okunabilir ekran görüntüsünü kontrol et.
- 30 oyunculu sentetik takım, aynı role iki ayrı stoper, beşten fazla alternatif, uzun Türkçe isimler ve boş görevlerle doğrula.
- Seçim, sıra değiştirme, rol değiştirme, yenileme sonrası kalıcılık ve kulüp ayrımı test edilir.
- Masaüstü, telefon ve açık katlanabilir boyutlarında ekran görüntüsü ve gerçek tıklama kanıtı gerekir. Tarayıcı emülasyonu fiziksel cihaz kabulü değildir.
- Ek kütüphane kurulumu bu sözleşmenin gereği değildir. Native HTML kontrolleri, CSS Grid ve mevcut veri fonksiyonları ilk uygulama için yeterlidir.

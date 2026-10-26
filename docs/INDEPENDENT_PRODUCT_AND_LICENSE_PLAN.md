# Match Studio — Bağımsız Marka ve Ticari Yayın Kararı
Tarih: 25.10.2026 · Durum: Strateji taslağı / gerçek şirket ve Google Play kaydı onaylanmadı.

## Ürün sahipliği
- Match Studio; spor kulüplerinden bağımsız, ürün sahibine ait yazılım girişimi olarak yönetilecek.
- Darıca Gücü ve diğer kulüpler ancak ayrı izin/sözleşmeyle müşteri, pilot veya referans olabilir. Kulüp adının ya da logosunun kullanımı sahipliğin/devrin kanıtı değildir.
- GitHub deposu, kanonik alan adı, Play Console yayıncılığı, imza anahtarı, yazılım telifi, kullanıcı sözleşmesi ve gelir kayıtları tek bir bağımsız girişim altında tutarlı olmalı.
- Geliştirici hesabının tescilli bir marka veya telif hakkı devri olduğu varsayılmamalı.
- Marka ön araştırması: TÜRKPATENT, potansiyel sınıflar 9 (indirilebilir yazılım) / 42 (SaaS/yazılım); nihai sınıf ve marka benzerliği uzman incelemesine bağlı.
- İleride şirket kurulduğunda devir iki alternatifle yapılabilir: Play Console'un doğrulamalı kişisel→kurumsal hesap türü değiştirme akışı veya ayrı şirket hesabına resmî uygulama transferi. Doğrulama, ödemeler profili ve uygulama durumu gereklilikleri farklı olabilir. Sonuç otomatik garanti değildir.

## Google Play hesap seçimi
- **Henüz hiçbir şirket/işletme temsil edilmiyorsa** kişisel kullanım hesabıyla başlamak mümkündür; şirket/işletme adına açılıyorsa kurumsal hesap seçilmelidir.
- Kişisel hesapların Play Billing ile para kazanmasına izin verilir.
- 13.11.2023 sonrası yeni kişisel hesaplarda production başvurusundan önce 12 testçinin 14 gün kesintisiz kapalı testte katılımı gerekir.
- Kullanıcı paket adını `com.matchdaystudio.app` olarak kesinleştirdi. Play Console uygunluğu, marka ve alan adı sahipliği ayrıca doğrulanmalıdır.
- Gerçek yasal isim/adres, Google Play ve ödemeler profilinin görünürlük koşulları açıklanmadan hesap tamamlanmamalı. Kimlik bilgileri GitHub, Issue veya bu sohbete kopyalanmaz.

Resmî kaynaklar:
- https://support.google.com/googleplay/android-developer/answer/13634885
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/16260648
- https://support.google.com/googleplay/android-developer/answer/16909862

## Satış modeli — MVP
1. **Play Store ilk sürümü:** Ücretsiz, bireysel kullanım ve antrenör denemesi. Mevcut uygulamada ticari lisans sunucusu veya Play Billing yoktur.
2. **Pilot kulüp:** 30 günlük ücretsiz gerçek saha kullanımı, yazılı pilot onayı, test verileri veya hukuka uygun gerçek veriler. Pilot sayısı hedefi: 5 kulüp.
3. **Ücretli kulüp lisansı:** Sadece ödeme/tahsilat/fatura ve lisans kontrolü, haklar, veri ayrımı ve sözleşme hazır olduktan sonra başlat.
4. **Önerilen fiyat hipotezleri:** 690 TL/ay ya da 6.900 TL/yıl/tek kulüp; ayrı gerçek kurulum ve eğitim hizmeti 2.500 TL. Piyasa fiyatı değildir; 5 pilot kulüpte görüşme ve ödeme isteğiyle doğrulanacaktır. Vergi dahil/hariç bilgisi ticari modelde kesinleştirilir.
5. **İlk satış hedefi:** 5 pilot ardından 10 ücretli kulüp. Başarı metrikleri: ilk maç oluşturmaya kadar süre, haftalık aktif antrenör, kulüp başına maç/hafta, şifreli yedek tamamlama oranı, denemeden ücretliye dönüşüm, iptal nedeni.

## Hukuk, ödeme ve veri
- Google Play aracılığıyla dağıtılan uygulamada satılan dijital özellikler ve abonelikler genellikle **Google Play Billing** gerektirir. Bölgesel istisnalar ayrı başvuru/koşullara tabidir; uygulamada dış ödeme yoluna yönlendiren bağlantı eklememek gerekir.
- Dışarıda verilen gerçek yüz yüze eğitim ve kurulum hizmeti ticari sözleşmelerle ayrıca değerlendirilebilir; yalnızca hizmet adını değiştirmek dijital lisansı Billing kapsamından çıkarmaz.
- Fatura, gelir vergisi/KDV ve düzenli ticari kazanç için mali müşavirle kayıt ve doğru faaliyet modeli görüşülmeli. Teknik ürün sahibi olmak vergisel yükümlülüğü ortadan kaldırmaz.
- Kulüp ve veri sağlayıcı arasındaki sözleşmede: yazılım telif haklarının devredilmediği, lisans kapsamı/süresi, kulüp başına hesap/yetki, destek/ücret/iade, veriye erişim ve yedekleme, iptal sonrası veri dışa aktarma, teknik erişim kesintileri ve veri ihlali bildirim zinciri tanımlanmalı.
- Yaşça küçük futbolcuların fotoğraf ve verileri: kulüp/uygulama sahibi veri sorumlusu / veri işleyen rollerine göre KVKK aydınlatma ve uygun işleme şartlarıyla gerçek teknik veri akışı incelenmeli. Tüm kulüplere açık bir merkezi veritabanı olmadan da gizlilik yükümlülükleri olabilir.

Kaynaklar:
- https://support.google.com/googleplay/android-developer/answer/9858738
- https://www.kvkk.gov.tr/Icerik/2033/Aydinlatma-Yukumlulugu-

## Teknik ticarileştirme sırası
- Play Store yayınından **önce**: yayıncı türü, yasal geliştirici kimliği, paket adının kesinleştirilmesi, gizlilik bildirimi, Android API 36, Play Signing, domain doğrulaması, AAB, test planı.
- Beta **sonra**: farklı kulüp verilerinin kesin izolasyonu, lisans sunucusu, erişim süresi, çevrimdışı lisans doğrulama politikası, aktivasyon/silme kayıtları.
- Dijital ücretli özellik **sonra**: Google Play Billing ya da uygun alternatif programa uyumlu ödeme, vergi/faturalama, geri ödeme, destek.
- Her sürüm: zorunlu GitHub verify kontrolü, PR incelemesi, gerçek cihaz kabulü, Play Console paket/cihaz uyumluluğu.

## Belirsiz/kilitli kararlar
- [ ] Geliştiricinin mevcut şahıs işletmesi/şirket durumu henüz doğrulanmadı.
- [ ] Play Console bireysel hesap kaydı oluşturuldu ve kimlik doğrulandı mı bilinmiyor.
- [ ] Marka adı için TÜRKPATENT benzerlik araştırması tamamlanmadı.
- [ ] Nihai Android applicationId/package ID sahibi tarafından kabul edilmedi.
- [ ] Lisans fiyatları, pilot sözleşmesi ve ticari hesap sistemi henüz onaylı değil.
- [ ] Hiçbir ücretli özelliğin hazır veya Play Billing'e bağlanmış olduğu iddia edilmiyor.

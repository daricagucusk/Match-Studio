# Match Studio — Google Play Console yayın paketi (7 Kasım 2026)

Bu belge, Play Console'da yayına hazırlamak için gereken bütün alanların kopyala-yapıştır metinlerini, teknik kanıtları ve yalnızca hesap sahibinin yapabileceği son adımları içerir.

## 1. Doğrulanmış teknik durum

| Konu | Durum | Kanıt |
|---|---|---|
| Paket adı | `com.matchdaystudio.app` | Play Console uygulama kaydı 4 Kasım 2026'da doğrulandı |
| Uygulama kaydı | Var (Console ID `4976448898430635813`) | Play Console doğrulama tutanağı |
| İmzalı AAB | Var, versionCode **2**, versionName **2.6.8** | `C:\Users\aearo\Documents\MatchStudio-Android-Release-Candidate\artifacts\MatchStudio_F19RC1_UPLOAD_signed.aab` |
| AAB SHA-256 | `9a1fd54622c61c5c01fe0ff099f8e8ace84b8e3262781227572389eced3cb204` | SHA-256 hesaplandı |
| Hedef API | compileSdk/targetSdk **36**, minSdk **24** | bundletool manifest dump |
| İzinler | Yalnızca uygulama içi `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`; Billing/kamera/konum yok | bundletool manifest dump |
| Yerel kütüphane | Yok (16 KB hizalama riski yok) | AAB içinde `.so` sayısı 0 |
| Upload sertifikası | `B1:36:AF:04:F2:B1:9F:E3:77:2A:21:B3:09:8B:F3:A3:57:24:1E:70:46:60:94:20:9D:99:98:9F:DD:C8:DA:19` | apksigner/keytool |
| Play App Signing sertifikası | `49:8F:91:FC:D8:4F:80:11:88:F0:1D:E9:24:2B:B5:6D:7C:33:D6:E7:31:F5:C7:CE:02:B6:2C:B7:82:90:C0:4F` | Play Console 4 Kasım 2026 + Digital Asset Links API |
| Digital Asset Links | **linked=true** | Google Digital Asset Links API |
| Gizlilik politikası | Canlı, HTTP 200, Türkçe | `https://match-studio-telefon.vercel.app/privacy.html` |
| Mağaza görselleri | 512 ikon, 1024x500 grafik, 4 ekran görüntüsü (2:1) | `store-ready/` klasörü |
| Birim testleri | 122/122 PASS | `npm test` |
| Güvenlik taraması | PASS; 0 yüksek zafiyet | `release-security-check.cjs`, `npm audit` |

**Önemli:** AAB imzalanırken mevcut `F18-candidate-upload.jks` kullanıldı. Bu anahtar ve DPAPI parola dosyası `C:\Users\aearo\.matchstudio-private\keys\` altında; kaybedilirse gelecekteki güncellemeler yüklenemez. Parola hiçbir yere yazılmadı.

## 2. Mağaza girişi (Store listing)

**Uygulama adı (28 karakter):**
```
Match Studio – Futbol Kulübü
```

**Kısa açıklama (76 karakter):**
```
Futbol kulübünüzün maç, kadro, canlı skor ve afiş yönetimi bir arada.
```

**Tam açıklama:**

```
Match Studio, futbol kulüplerinin antrenörleri ve yetkili kulüp personeli için geliştirilmiş maç günü çalışma alanıdır. Oyuncuları ve kadroyu düzenleyin, maç hazırlığını yönetin, saha içindeki gelişmeleri kaydedin ve paylaşmaya hazır maç görselleri oluşturun.

MAÇ GÜNÜ MERKEZİ
• Takım ve yaş gruplarıyla maç oluşturun; rakip, tarih, saat ve sahayı planlayın.
• Kadro ve ilk on biri hazırlayın, saha dizilişini oluşturun.
• Canlı maçta skor, dakika, gol, asist, kart ve oyuncu değişikliği kayıtlarını tek ekrandan yönetin.

OYUNCU VE KADRO
• Oyuncu kartlarını, yaş gruplarını ve takım kadrolarını düzenleyin.
• Takım derinliğinde her mevki için alternatif oyuncuları sıralayın.
• Sol/sağ stoper ve orta saha rolleri dahil taktik rolleri ayrı ayrı atayın.
• Maç raporlarında gol, asist ve oyuncu katılımını inceleyin.

FİKSTÜR VE PAYLAŞIM
• Haftalık maç panosunu görüntüleyin.
• Desteklenen CSV/Excel maç programlarını önizleyerek içe aktarın.
• Afiş ve maç günü görsellerini kendi kulüp kimliğinizle oluşturun.

YEREL ÇALIŞMA VE VERİ GÜVENLİĞİ
• Uygulama, desteklenen akışlarda çevrimdışı çalışır.
• Kayıtlar normal kullanımda cihazda tutulur; otomatik bulut eşitlemesi yapılmaz.
• Şifreli yedek oluşturabilir ve kayıtlarınızı başka bir tarayıcı profiline geri yükleyebilirsiniz.
• Oyuncu ve maç verilerinin kullanım izinleri ile yedek güvenliği kulübün sorumluluğundadır.

Match Studio; antrenörler, futbol okulları, amatör ve altyapı kulüplerinin maç günü hazırlığını tek yerde toplamak için tasarlanmıştır.
```

**Kategori:** Spor (uygulama, oyun değil)  
**Varsayılan dil:** Türkçe  
**İletişim e-postası:** `clupulse@gmail.com`  
**Gizlilik politikası URL'si:** `https://match-studio-telefon.vercel.app/privacy.html`  
**Ücret:** Ücretsiz; reklam yok; uygulama içi satın alma yok.  
**İlk dağıtım ülkeleri:** Türkiye (istenirse sonradan genişletilebilir).

### Grafik dosyaları

- `C:\Users\aearo\Documents\MatchStudio-Android-Release-Candidate\store-ready-f19\app-icon-512.png` — 512x512 RGBA, 609 KB
- `C:\Users\aearo\Documents\MatchStudio-Android-Release-Candidate\store-ready-f19\feature-graphic-1024x500.png` — 1024x500 RGB
- `store-ready-f19\screenshots\01-ana-ekran.png` — 1170x2340
- `store-ready-f19\screenshots\02-oyuncular.png` — 1170x2340
- `store-ready-f19\screenshots\03-mac-planlama.png` — 1170x2340
- `store-ready-f19\screenshots\04-afis-studyo.png` — 1170x2340

Bütün ekran görüntüleri sentetik `Örnek Akademi` verisiyle üretildi; gerçek sporcu adı, fotoğrafı veya kulüp arması yok.

## 3. Uygulama içeriği formları

### Data safety (Veri güvenliği)

- **Uygulama veri topluyor mu?** Hayır.
- **Veri paylaşıyor mu?** Hayır.
- **Hesap oluşturma var mı?** Hayır.
- **Reklam var mı?** Hayır.
- **Analitik/üçüncü taraf SDK var mı?** Hayır. Ağ trafiği yalnızca aynı alan adından PWA dosyalarını yükler; CSP `connect-src 'self'` ile sınırlıdır.
- **Kullanıcı verisi cihazdan çıkıyor mu?** Yalnızca kullanıcının kendi başlattığı şifreli yedek dosyası ile; geliştirici bu dosyaya erişmez.
- **Veri silme:** Hesap olmadığı için hesap silme yok. Kullanıcı oyuncu/maç kayıtlarını uygulama içinden silebilir; yerel veriyi cihaz ayarlarından temizleyebilir.
- **Barındırma günlükleri:** Vercel, sayfa isteklerinde IP ve teknik istek bilgisi işleyebilir. Bu, uygulamaya girilen oyuncu/maç kayıtlarıyla birleştirilmez. Gizlilik politikasında açıklanmıştır.

> Console "No data collected" seçiminde ısrar ederse yukarıdaki gerekçe kullanılmalı. İnceleme ekibi barındırma günlüklerini ayrıca sorarsa, yalnızca IP/teknik günlük için "Device or other IDs → App functionality / Security → ephemeral, not shared" seçeneği değerlendirilebilir; uygulama içi sporcu verileri hiçbir koşulda toplanmış sayılmaz.

### Content rating (İçerik derecelendirmesi)

- **Kategori:** Spor
- Şiddet, cinsellik, çıplaklık, küfür, korku, kumar, uyuşturucu/alkol: **Yok**
- Kullanıcılar arası sohbet/etkileşim: **Yok**
- Konum paylaşımı: **Yok**
- Dijital satın alma: **Yok**
- Reklam: **Yok**
- Beklenen sonuç: **Herkese uygun / 3+ (PEGI 3)**

### Hedef kitle

- **Yaş grubu:** Yalnızca **18 yaş ve üzeri**
- Gerekçe: Uygulama yetişkin antrenörler ve kulüp personeli için profesyonel bir araçtır; çocuklara yönelik tasarlanmamıştır.
- **Designed for Families** programına katılmayın.
- Uygulama çocuk sporcuların verilerini yetişkin kulüp personeli aracılığıyla saklayabilir; gizlilik politikası bu sorumluluğu açıklar.

### App access (Uygulamaya erişim)

- **Tüm işlevler giriş gerektirmeden kullanılabilir.**
- İnceleme notu:
```
Uygulama hesap veya özel giriş bilgisi gerektirmez. Açılışta kulüp oluşturma ekranı gelir; herhangi bir kulüp adı girilerek tüm maç, kadro, takım derinliği, canlı maç ve afiş özellikleri denenebilir.
```
- **Reklamlar:** Uygulamada reklam yok.
- **Haber uygulaması:** Hayır.
- **COVID-19 uygulaması:** Hayır.
- **Finans/health/government:** Hayır.

## 4. Yükleme ve test sırası

1. **Web sürümünü doğrula:** F.19 canlıya çıktıktan sonra `https://match-studio-telefon.vercel.app` açılır; footer'daki Gizlilik Politikası ve assetlinks 200 döner.
2. **Internal testing:** Play Console → Test ve yayınla → Test → Internal testing → Yeni sürüm oluştur → `MatchStudio_F19RC1_UPLOAD_signed.aab` yükle.
   - İlk yüklemede Play, upload anahtarını kaydeder. Console "upload certificate mismatch" derse yeni uygulama oluşturmayın; upload key reset sürecini kullanın.
   - Sürüm notu: `F.19: tek ekran takım derinliği, taktik roller ve canlı maç konsolu iyileştirmeleri.`
3. **Kendi hesabını testçi ekle**, opt-in bağlantısından kur, şunları doğrula:
   - TWA tam ekran açılıyor, adres çubuğu yok (assetlinks `linked=true`).
   - Çevrimdışı açılış ve maç kaydı.
   - Şifreli yedek oluşturma ve geri yükleme.
   - Kulüp izolasyonu, oyuncu silme, afiş PNG paylaşımı.
4. **Closed testing:** En az **12 ayrı Google hesabı** ekle; testçiler opt-in olsun ve **14 gün kesintisiz** kalsın. Console 4 Kasım'da 0 testçi gösteriyordu.
5. **Production access:** 14 gün sonra Production → üretim erişimi başvurusu; soruları gerçek test süreciyle yanıtla.
6. **Production release:** Üretim erişimi onaylanınca yeni sürüm oluştur, %100 dağıtım, incelemeye gönder.
7. **Son onay:** "Yayına al / İncelemeye gönder" düğmesine basılması hesap sahibinde.

## 5. Yalnızca hesap sahibinin yapabilecekleri

- [ ] Play Console'da kimlik doğrulama durumunu kontrol et. Son kayıt **under_review**; onaylanmadan üretim erişimi verilmez.
- [ ] AAB'yi Internal testing kanalına yükle (dosya hazır).
- [ ] En az 12 testçiyi kapalı teste ekle ve 14 gün bekle.
- [ ] Üretim erişimi başvurusunu yap.
- [ ] Mağaza girişi, Data safety, content rating ve hedef kitle formlarını bu belgedeki metinlerle doldur.
- [ ] Son yayın düğmesine bas.

## 6. Doğrulama komutları

```powershell
# AAB kimliği ve imzası
java -jar tools\bundletool-all-1.18.3.jar dump manifest --bundle=<AAB>
jarsigner -verify -verbose <AAB>

# Play hazırlık (imzalı AAB raporuyla)
$env:MATCHSTUDIO_SIGNED_AAB_REPORT="C:\Users\aearo\Documents\MatchStudio-Android-Release-Candidate\artifacts\AAB_SIGNED_INSPECTION_F19.json"
npm run check:play:strict

# Canlı alan adları
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://match-studio-telefon.vercel.app/privacy.html
curl.exe -s "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://match-studio-telefon.vercel.app&relation=delegate_permission/common.handle_all_urls"
```

**Son not:** Bu belge Play yayınının tamamlandığını iddia etmez. AAB, mağaza metinleri ve teknik doğrulamalar hazırdır; yükleme, 12 testçi/14 gün ve üretim erişimi hesap sahibinin Console işlemleridir.

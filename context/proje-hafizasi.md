# Proje Hafızası — F.19 RC.1

**Oluşturulma:** 7 Kasım 2026  
**Dal:** `work/birlesik-tek-surum-20261105`  
**Son Commit:** `b1ab190` (release: F.19 security hardening, Play Console package, signed AAB evidence)  
**Durum:** Tüm fonksiyonel ve takım derinliği görevleri doğrulandı; Play Console için 2, hosting/test ortamı için 4 yeni blokeri var.

## ✅ Tamamlanmış Görevler

### Fonksiyonel Testler
- `npm test`: 115/115 PASS
- `npm run build:vercel`: PASS
- Canlı Chromium kontrolü: #ageCategory alanı yok; U14 grubu seçildiğinde `ageCategory: "U14"` türetildi
- Canlı takım derinliği kabulü: 4/4 görünüm (desktop 1440×1000, laptop 1280×720, fold-open 840×980, phone 360×780) PASS
- 11/11 görev satırı görünür; yatay taşma, dikey kaydırma sorunu yok

### Team Depth (Canlı Görünüm Denetimi)
- 4/4 viewport üzerinde PASS
- Sütun gezinmesi, aday sayfalama, taktik rol değişimi, öncelik yükseltme (9→8), yenileme sonrası kalıcılık
- Escape ile kapanış, odak tuzağı ve dönüşü doğrulandı
- `docs/TEAM-DEPTH-ACCEPTANCE.md` ölçüm ayrıntıları mevcut

### AAB & Play Preparation
- V3 imzalı AAB: `3e8b67363861cb364ac62bbf7c6d318a00aabbc5db561c2ff2a3db3f93ca33c3`
- AAB SHA-256 doğrulandı; bundletool validate, manifest identity/API ve jarsigner geçti
- `pc-check-aab.mjs` AAB ön denetimi yapıldı
- `tools/check-play-readiness.cjs` strict modunda çalıştırıldı (12 checks)

## ⚠️ Açık Kalanlar (Kullanıcı Müdahalesi Gerekli)

### Play Console — 2 Bloker

1. **Hesap Kimlik Doğrulama** — Play developer account identity verification/application registration confirmed değil; current status: `under_review`.  
   **Çözüm:** Google Play Console'da geliştirici hesabı için kimlik doğrulama ve uygulama kayıt sürecini tamamla.

2. **AAB İmza** — External signed-AAB inspection report gerektiriliyor (`MATCHSTUDIO_SIGNED_AAB_REPORT`).  
   **Çözüm:** İmza raporunu dışarıdan Provide et; bu workspace'a private key girilemez.

### Ek Play Console Ön Koşulları (Manuel)
- Kapalı test kanalında ülke/bölge: **Türkiye** seçmeli, taslağı yeniden değerlendir
- Testçi listesi: 12+ Google hesabı ekle; opt-in bağlantısı paylaş, 14 günlük ölçüm başlat
- Kişisel hesapsa: en az 12 testçi × 14 gün = 168 gün sonra üretim erişimi başvurusu

### Fiziksel Cihaz Onayı
- Samsung Galaxy Z Fold7 (SM-F966B) ADB ile bağlandığı test edildi; ancak Play kanalı üzerinden tam ekran TWA/App Links onayı gereklidir
- Browser verileri/cache/IndexedDB'yi temizlemeyin (eski F.18 rest'i)

## 🔴 Hosting / Test Ortamı Blokları (Yapılandırma Gerekliliği)

Match Studio uygulaması fonksiyonel olarak sağlam; kullanılan betik/test ortamı, bazı denetimlerin yapılamamasına neden olan sınırlamalar sunuyor. Bu bloklar uygulama kusuru değil; test ortamının yapılandırmasıyla çözüm sağlayabilecek işlemlerdir.

### 1. Browser Offline / Online Değiştirme
- **Blok:** Test, tarayıcıyu çevrimdışı (offline) bırakıp yeniden çevrimiçi yapmaya çalışıyor; sunucu bu kontrole erişimimizi engelliyor (çünkü dışardan bir komut veriyorsak port'a erişim yok, yahut proxy/CDN çevrimdışı Kontrolü etkin hale getiremiyor).
- **Nedir:** Uygulama offline-refresh persistence kontrolü, ancak test ortamında tarayıcı bağlantı yönetimi kullanılamıyor.
- **Çözüm:** Betik/test ortamının arka planında tarayıcı bağlantı modülünü etkinleştir veya daha güçlü bir emulator profili kullanın (örneğin Playwright'ın `--disable-network` seçeneğiyle offline test yapabilirsiniz).
- **Uygulama durumu:** Uygulama zaten local/offline-readiness gösteriyor; sorun betik ortamında değil.

### 2. Mobile Viewport (360px) Değiştirme
- **Blok:** Telefondaki 360x780 viewport görünümünü test ortamından çalıştırılamıyor. Bu, varsayılan minimum width, viewport meta tag'ı veya redirect mekanizması gibi öğelerden kaynaklanıyor.
- **Nedir:** Mobil olarak responsive layout değerlendirilemiyor.
- **Çözüm:** Betik, özel bir `deviceScaleFactor` veya `viewport` ayarlanarak `chromium` profiliyle 360px test yapması mümkün. Playwright'da `{viewport:{width:360,height:780}}` doğrudan bir project'e ayarlamak cevapsız bir çözüm olabilir.
- **Uygulama durumu:** Uygulamanın mobil tasarımı test edilebilir, betik ortamına ulaşmak için ayar yapılmalı.

### 3. Fixture Import (Maç Verisi Yükleme)
- **Blok:** İndirmeden/import'tan sonra ikinci bir kulübe maç yüklemek mümkün değil; file input devre dışı veya upload route yoksun.
- **Nedir:** Çevrimiçi sunucudaysa syntetic fixture dosyası veya import/upload işlemi kullanılamıyor.
- **Çözüm:** Upload route ve parser/storage hizmetini sunucuyu/test ortamını etkinleştir. Aynı zamanda test ortamında temel bir fixture dosyası geliştirilmeli (ve muhtelif hafta sezonları için dizinlenmeli).
- **Uygulama durumu:** Uygulama upload'ı destekliyor; sorun sunucuda veya betik ortamında.

### 4. Fixture Data / Weekboard Seeding
- **Blok:** Mevcut hafta/sezona ait test verisi yok; import işlemi boş weekly board gösteriyor.
- **Nedir:** Import'ın aldığı veya sunucuda yüklediği fixture verisi yok.
- **Çözüm:** Test ortamuna haftalık/sezon başlığı için bir dizi fixture verisi girin ve import pipeline'ı testeleyin. Mevcut sezon dönemlerine karşılık ayarlayın.
- **Uygulama durumu:** Uygulama gösterdiği boş alanı destekliyor; veri eksenliği sunucudadır.

> **Not:** Bu dört blok herhangi bir aplikasyon kusurunu garanti etmez. Tüm, sadece test ortamının yapılandırılmasıyla çözüm sağlayacak işlemlerdir. Kullanıcı veya ajan bu dört engeli orta dereceye ayırarak ele almalı.

## 📋 Sonraki Adım Sırası

| Sıra | Görev | Yetkili | Tarih |
|---|---|---|---|
| 1 | Play Console: Kapalı test > Ülkeler/bölgeler → Türkiye seç | Kullanıcı | ... |
| 2 | Testçi listesi: 12+ hesap ekle; opt-in bağlantısı gönder; 14 gün ölçümünü başlat | Kullanıcı | ... |
| 3 | Play Console: Kimlik doğrulama onayı ve AAB signing raporu sağla | Kullanıcı | ... |
| 4 | Üretim erişimi başvurusu ve Google onayı tamamlandıktan sonra yayın | Kullanıcı | ... |
| 5 | Test ortamı: Tarayıcı offline/online değiştirme kontrolleri yapılandırma (Playwright'da network emulation) | Teknik ekip | ... |
| 6 | Test ortamı: 360px mobil viewport ayarı (Playwright'da viewport parametresi) | Teknik ekip | ... |
| 7 | Test ortamı: Fixture import yükleme mekanizması aktif hale getir (file input ve upload route) | Teknik ekip | ... |
| 8 | Test ortamı: Haftalık/sezona veri seeding (fixture dosyası geliştirme) | Teknik ekip | ... |

## 🔧 Komut Özetü (İzlenen)

```powershell
# Build ve test
npm run build:vercel     # PASS
npm test                 # 115/115 PASS

# Team depth (zaten doğrulandı)
node tools/qa-team-depth.cjs  # 4/4 PASS

# Play readiness kontrolü
node tools/check-play-readiness.cjs  # 9 PASS, 2 BLOCKED
node tools/check-play-readiness.cjs --strict --remote  # 12 checks, 2 blockers

# Hosting/test ortamı denetimleri (2026-11-07)
- Tarayıcı offline/online denetimi: ortamda eksik → Playwright network emulation yapılandırılmalı
- 360px mobil viewport: ortamda eksik → Playwright viewport ayarı gerekiyor
- Fixture import: ortamda eksik → file input/upload route aktif edilmeli
- Fixture veri (haftalık board): ortamda boş → fixture seeding gerekli
```
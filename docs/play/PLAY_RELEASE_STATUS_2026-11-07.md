# Match Studio F.19 / Play Console — Son doğrulama ve devir kaydı
**Tarih:** 7 Kasım 2026 (Türkiye)
**Kaynak:** D:\beyin2\Projeler\MatchStudio\Calisma\Birlesik-Tek-Surum
**Dal / kod:** work/birlesik-tek-surum-20261105 / b1ab190
**Politika:** Eski kulüp/sporcu verisi silinmez; keystore ve parolalar Git'e konmaz.

## 1. Kanıtlı teknik durum
- Windows cihaz aearon ve Samsung Galaxy Z Fold7 (SM-F966B) ADB bağlantısı: **PASS**. `adb devices -l` yetkili cihaz gösterdi.
- Vercel production: `match-studio-telefon.vercel.app` için `main` commit `b1ab190` / READY.
- Google Play Console'daki Match Studio kapalı test taslağında sürüm **3 (2.6.8)**, hedef **API 36**, AAB yüklenmiş. Taslak henüz testçilere sunulmuş değil.
- V3 imzalı AAB: `C:\Users\aearo\Documents\MatchStudio-Android-Release-Candidate\artifacts\MatchStudio_F19RC1_UPLOAD_signed.aab`
- AAB SHA-256: `3e8b67363861cb364ac62bbf7c6d318a00aabbc5db561c2ff2a3db3f93ca33c3`
- V3 doğrulama raporu: `C:\Users\aearo\Documents\MatchStudio-Android-Release-Candidate\artifacts\AAB_SIGNED_INSPECTION_F19_V3.json`. bundletool validate, manifest identity/API ve jarsigner doğrulandı.
- Aynı sürümün APK'sı gerçek telefona ADB ile yüklendi, `com.matchdaystudio.app` versionCode **3** ile başlatıldı.
- `npm run check:play:strict` V3 raporuyla: AAB, genel manifest, gizlilik sayfası, assetlinks **PASS**; hesap kimlik doğrulama durumu yerel kayıtta hâlâ **under_review** ve dış Console'da kesin onay kanıtı yok.

## 2. Gerçek Fold7 kabulü (kısmi)
- Kapalı ekran: 1080x2520 fiziksel çözünürlükte uygulama açıldı, önceki kulüp ismi görünür ve oyuncu modülüne geçiş çalıştı.
- Samsung Internet Custom Tab ile açıldığı için APK'nın yerel **upload** imzası ile Play **app-signing** sertifikasının farklı olduğunu unutmayın. Bu kurulum üzerinden tam ekran TWA/App Links onayı verilemez; Play kanalı üzerinden yükleme gereklidir.
- Mevcut Samsung Internet profilinde eski F.18 service worker kontrolünde kalmış olabilecek `Yeni sürüm hazır` banner'ı görüntülendi. Güncelleme onayıyla kalıcı geçiş doğrulanamadı. F.18 kodunda `Daha sonra` seçeneği bulunmuyordu; F.19 kaynak kodunda mevcut. **Eski browser verilerini/cache/IndexedDB'yi temizlemeyin.**
- Fiziksel Fold **açık** ekran, uygulama içi offline/geri yükleme, gerçek TWA tam ekran, Play yüklemesi henüz kabul edilmedi.
- Hiçbir gerçek sporcu/kulüp kaydı eklenmedi, silinmedi veya değiştirilmedi.

## 3. Play Console engelleri (7 Kasım 2026 sayfası)
1. **HATA:** Kapalı test kanalında ülke/bölge seçilmemiş. İlk dağıtım Türkiye.
2. **UYARI:** Kapalı test kullanıcı listesi boş. Uygulama henüz hiçbir testçinin erişimine açılmamış.
3. **HESAP:** Kimlik doğrulama nihai onayı kontrol edilmeli; yerel `under_review` kaydı bu kanıt gelene kadar değiştirilmez.
4. **KURAL:** Uygun kişisel hesaplar en az 12 ayrı testçinin 14 gün kesintisiz opt-in katılımından sonra üretim erişimine başvurabilir (Play Console yardım merkezi, 14151465).

## 4. Sonraki uygulama sırası
1. Play Console `Kapalı test > Ülkeler/bölgeler`: **Türkiye** seç, taslağı yeniden değerlendir.
2. Testçi listesine gerçekten izin vermiş, ulaşılabilir 12+ Google hesabı ekle; katılım bağlantısını paylaş, opt-in al ve 14 günlük ölçümü başlat.
3. Yalnız Play'den kurulan **app-signed** uygulamayla tam ekran TWA, kapalı/açık Fold, offline ve şifreli yedek kabulünü yap. Gerçek sporcu verileriyle test yapılmaz; sentetik ayrı kulüp kullanılmalı.
4. Play Console kimlik, veri güvenliği, içerik derecelendirme, hedef kitle ve satıcı beyanlarını doğrula. 1 Şubat 2027 satıcı beyanı için son tarih.
5. Üretim erişim başvurusu ve Google onayı tamamlanınca yayın kararı. Henüz `Published` statüsü yok.

**Durum:** F.19 web canlı; Android kapalı test **NO-GO: ülke/testçi/hesap ve gerçek Play-sertifikalı cihaz kabulü bekliyor**. Bu belge Google Play yayını olduğunu iddia etmez.

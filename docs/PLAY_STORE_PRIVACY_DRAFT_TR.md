# Match Studio — Gizlilik Politikası Taslağı / Yayın Öncesi İnceleme

**UYARI: Bu metin hukuki ve teknik taslaktır. Kamuya açık gizlilik sayfası değildir. Play Store'a eklenmeden önce veri sorumlusu, açık destek iletişimi, gerçek SDK/network davranışları, KVKK yükümlülükleri ve çocukların sporcu verileri açısından doğrulanmalıdır.**

Sürüm: 25 Ekim 2026
Uygulama: Match Studio
Hedef kullanıcılar: Futbol antrenörleri, kulüp yöneticileri ve yetkili yetişkin personel.

## 1. Veri sorumlusu ve iletişim
Veri sorumlusu (kuruluş / kişi): [ONAYLANACAK RESMİ KİMLİK]
İletişim e-postası: [KAMUYA AÇIK DESTEK E-POSTASI]
Gizlilik politikası adresi (yayın sonrasında): https://match-studio-telefon.vercel.app/privacy.html

## 2. Uygulamaya girilebilen bilgiler
Antrenör/kulüp kullanıcıları; kulüp adı, logo, takım/yaş grubu, sporcu ismi, oyuncu fotoğrafı, kadro, maç, saha, fikstür, skor, maç olayı ve taktik çizimler gibi bilgileri kaydedebilir. Küçük yaştaki oyunculara ait bilgiler girilebileceğinden kulüp yetkilileri gerekli yasal bilgilendirme ve izinlerden sorumludur.

## 3. Kayıt ve saklama modeli
Uygulamanın mevcut web sürümü kulüp kayıtlarını öncelikle yerel tarayıcı depolamasında (IndexedDB) tutmak üzere tasarlanmıştır. Mobil Android Trusted Web Activity aynı HTTPS siteyi açar. Tarayıcı profili, kaldırma ve depolama temizliği bu kayıtlara erişimi etkileyebilir.
Şifreli yedekler, kullanıcı tarafından seçilen dosyalara dışa aktarılabilir. Şifre/anahtar saklama, saklama süresi ve dosyanın korunması ayrıca nihai teknik incelemeyle doğrulanmalıdır.
Bu politika, kullanıcı dosyasını kendiliğinden merkezi sunucuya yükleme veya telefonlar arasında otomatik bulut senkronizasyonu varmış gibi göstermez.

## 4. Ağ iletişimi ve üçüncü taraflar
Uygulama Vercel'de HTTPS üzerinden sunulur; host sağlayıcısı ve tarayıcı doğal olarak IP adresi, bağlantı isteği ve teknik günlük işleyebilir.
**Yayın öncesi zorunlu denetim:** Android AAB içindeki bağımlılıklar ve web kaynak kodunda analitik, telemetri, crash SDK, üçüncü taraf font, dış servis, ağ sorgusu, reklâm veya kişisel veri aktarımı var mı kontrol edilmeli. Bu kontrol tamamlanmadan Google Play Data Safety'de 'hiç veri toplanmıyor' ifadesi işaretlenmemelidir.

## 5. Kullanım amaçları
Kulüp/oyuncu kayıtları ve maç günü yönetimi, kadro oluşturma, saha taktiği, skor/olay takibi, rapor/afiş oluşturma, şifreli yedekleme ve kullanıcı taleplerinin karşılanması. Veri, uygulamada tanımlanmamış pazarlama veya profil çıkarmaya kullanılacağı iddia edilmeksizin ele alınacaktır.

## 6. Kullanıcı tercihleri, silme ve kurtarma
Kullanıcı ilgili uygulama modüllerinde kayıt silme işlemleri yapabilir. Yerel tarayıcı verilerini temizlemek veya PWA/TWA'yı kaldırmak yerel verilere erişimi sonlandırabilir. Önce şifreli yedek alınmalıdır.
Kulüp/personel tarafından saklanan yedek dosyalarının silinmesi ve üçüncü kişilere aktarımı onların kontrolündedir. Kullanıcı hesabı oluşturma ve sunucuda hesap silme süreci varsa ayrıca açıklanmalıdır (mevcut sürümde böyle bir özellik doğrulanmadı).

## 7. Çocukların bilgileri ve KVKK
Çocuk sporcuların fotoğrafı ve kişisel bilgileri özel dikkat gerektirir. Kulüpler, ilgili kişilere/velilerine aydınlatma ve gerekli hukuki şartları sağlamakla yükümlüdür. Bu metin KVKK uyumunu kendiliğinden sağlamaz; hukuki dayanak, saklama ve imha süresi, aktarım ve veri sorumlusu netleştirilmelidir.

## 8. Güvenlik
Uygulama HTTPS ve yerel kayıtlar ile şifreli yedekleme özelliklerini kullanır. Cihaz güvenliği, güçlü parola seçimi ve güncel tarayıcı kullanımı önerilir. Hiçbir yazılım için mutlak koruma taahhüdü verilmez.

## 9. Değişiklikler
Politikadaki önemli değişiklikler, güncel sürüm ve yayın tarihiyle kamuya açık politikada gösterilmelidir. Play Console ve uygulama içi bağlantı aynı güncel belgeyi göstermelidir.

### Teknik yayına alma kapıları
- [ ] Destek e-postası ve veri sorumlusunun hukuken doğru adı girildi.
- [ ] Android/TWA + PWA network ve tüm SDK'lar denetlendi.
- [ ] Veriye erişim, silme, saklama ve kullanıcı onayı iş akışı doğrulandı.
- [ ] Hukuki metin nihai olarak onaylandı.
- [ ] Statik gizlilik sayfası /privacy.html HTTPS 200 olarak servis ediliyor.
- [ ] Uygulama içinden açık ve çalışır gizlilik bağlantısı mevcut.
- [ ] Google Play Data Safety yanıtları nihai Android AAB davranışıyla eşleşiyor.

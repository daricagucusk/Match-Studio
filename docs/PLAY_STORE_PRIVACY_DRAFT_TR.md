# Match Studio — Gizlilik Politikası Taslağı / Yayın Öncesi İnceleme

**UYARI: Bu metin hukuki ve teknik taslaktır. Kamuya açık gizlilik sayfası değildir. Play Store'a eklenmeden önce veri sorumlusu, açık destek iletişimi, gerçek SDK/network davranışları, KVKK yükümlülükleri ve çocukların sporcu verileri açısından doğrulanmalıdır.**

Sürüm: 26 Ekim 2026 — yayınlanmamış taslak
Uygulama: Match Studio
Hedef kullanıcılar: Futbol antrenörleri, kulüp yöneticileri ve yetkili yetişkin personel.

## 1. Veri sorumlusu ve iletişim
Veri sorumlusu / yasal işletmeci: Mehmet Yılmaz (kullanıcı tarafından bildirildi).
Kamuya açık geliştirici markası: Matchday Studio.
İletişim e-postası: clupulse@gmail.com
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
Oyuncunun kalıcı silinmesi, oyuncu kaydını ve bağlı kişisel referansları temizler; diğer oyuncuların süreleri ve takım skoru korunur. Önceki yerel kurtarma noktası iptal edilir. İşlem yarıda kesilirse uygulama yeniden açılırken temizlik tamamlanır. Aynı kulüp ve tarayıcı profilinde silinen oyuncu kimliği içeren eski yedeklerin geri yüklenmesi engellenir. Bu engelin çalışması için kulüp/oyuncu kimliklerinden oluşan yerel silme kaydı tutulur; isim ve fotoğraf bu kayıtta bulunmaz. Bu kayıt dışa aktarılan yedeğe taşınmaz. Başka profil/cihaz, temizlenmiş tarayıcı depolaması veya değiştirilmiş kimlikler için aynı engel garanti edilmez.
Yerel kurtarma noktası şifreli değildir ve 7 gün geçerlidir. Tarayıcı verilerini temizlemek veya PWA/TWA'yı kaldırmak yerel verilere erişimi etkileyebilir.
Kulüp/personel tarafından saklanan yedek dosyalarının silinmesi ve üçüncü kişilere aktarımı onların kontrolündedir. Kullanıcı hesabı oluşturma ve sunucuda hesap silme süreci varsa ayrıca açıklanmalıdır (mevcut sürümde böyle bir özellik doğrulanmadı).

## 7. Çocukların bilgileri ve KVKK
Çocuk sporcuların fotoğrafı ve kişisel bilgileri özel dikkat gerektirir. Kulüpler, ilgili kişilere/velilerine aydınlatma ve gerekli hukuki şartları sağlamakla yükümlüdür. Bu metin KVKK uyumunu kendiliğinden sağlamaz; hukuki dayanak, saklama ve imha süresi, aktarım ve veri sorumlusu netleştirilmelidir.

## 8. Güvenlik
Uygulama HTTPS ve yerel kayıtlar ile şifreli yedekleme özelliklerini kullanır. Cihaz güvenliği, güçlü parola seçimi ve güncel tarayıcı kullanımı önerilir. Hiçbir yazılım için mutlak koruma taahhüdü verilmez.

## 9. Değişiklikler
Politikadaki önemli değişiklikler, güncel sürüm ve yayın tarihiyle kamuya açık politikada gösterilmelidir. Play Console ve uygulama içi bağlantı aynı güncel belgeyi göstermelidir.

### Teknik yayına alma kapıları
- [x] Kullanıcının bildirdiği işletmeci adı ve kamuya açık destek e-postası girildi (hukuki doğrulama veya politika onayı anlamına gelmez).
- [ ] Android/TWA + PWA network ve tüm SDK'lar denetlendi.
- [ ] Veriye erişim, silme, saklama ve kullanıcı onayı iş akışı doğrulandı.
- [ ] Hukuki metin nihai olarak onaylandı.
- [ ] Statik gizlilik sayfası /privacy.html HTTPS 200 olarak servis ediliyor.
- [ ] Uygulama içinden açık ve çalışır gizlilik bağlantısı mevcut.
- [ ] Google Play Data Safety yanıtları nihai Android AAB davranışıyla eşleşiyor.

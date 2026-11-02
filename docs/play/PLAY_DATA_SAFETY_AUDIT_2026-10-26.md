# Match Studio — Play Data Safety / KVKK teknik kanıt ve onay matrisi

Tarih: 26 Ekim 2026 — `main` ve production değişmeden PR #25 hazırlığı.

**Uyarı:** Bu belge bir teknik ön incelemedir; nihai KVKK hukuk görüşü veya Play Console Data Safety yanıtı değildir.

| Konu | Depodan doğrulanabilen | Final onay / ek kanıt |
|---|---|---|
| Erişkin hedef kitle | Mağaza metinleri antrenör ve kulüp yetkililerine hitap ediyor | Play Console hedef yaş ve IARC anketi |
| Çocuk sporcu kayıtları | Yerel IndexedDB oyuncu adı/fotoğrafı, yaş grubu, maç verisi; dışa aktarım mevcut | İşleme hukuki şartı, veli bilgilendirmesi, kullanım talimatları |
| Şifreli yedek | Yerel dışa aktarım var; güvenli yedek ve kurtarma testleri | Gerçek Fold7 yedek/geri yükleme ve saklama/silme davranışı |
| Kalıcı silme | PR #25'te recovery eski yedek koruması eklendi | Gerçek cihaz ve ikinci profil regresyon kabulü |
| Web origin | `https://match-studio-telefon.vercel.app` üzerinde HTTPS PWA | Sunucu sağlayıcısı logları, retention, IP ve CDN detayları |
| Dış kaynaklar | `index.html` yalnız same-origin CSS/bundle/manifest yüklüyor; TWA bildirimi kapalı | Tüm çalışma zamanı ağ trafiği, üçüncü taraf SDK ve Android izin incelemesi |
| Gizlilik sayfası | `docs/play/PLAY_STORE_PRIVACY_DRAFT_TR.md` **taslak** | Yasal geliştirici kimliği, herkese açık iletişim, güncel politika, `/privacy.html` HTTP 200, uygulama içi link |
| Google Play Data Safety | Henüz kesin beyan yok | Uygulamanın kendisi, tarayıcı/WebView, hosting, Google Play hizmetleri ve tüm SDK davranışı karşılaştırılmalı |
| Kullanıcı hesabı | Mevcut PWA'nın ayrı çevrimiçi kullanıcı hesabı olduğu kanıtlanmadı | Hesap oluşturma varsa Play hesap ve veri silme politikası ayrıca uygulanmalı |
| Reklam / Billing | TWA'da `enableNotifications=false`, `features={}`; ilk sürüm Billing yok | Nihai AAB izinleri ve Google Play beyanı |

## Yayımlamadan önce kanıtı gerekli işlemler

- [x] Kullanıcının bildirdiği kamuya açık bilgiler: Mehmet Yılmaz; geliştirici markası Matchday Studio; clupulse@gmail.com. Bu bilgi hukuki politika onayı değildir.
- [ ] Gerçek SDK ve ağ incelemesi (Android App Bundle analizi, tarayıcı network HAR, host log politikası)
- [ ] Veri koruma, saklama, silme ve velilerin hakları için doğru hukuki metin
- [ ] Policy'nin hem site üzerinden hem de uygulama içinde erişilebilir olduğunun testi
- [ ] `Data Safety` yanıtlarının gerçekte işlenen verilerle birebir örtüşmesi
- [ ] Mağaza ekran görüntülerinde gerçek sporcu adları, fotoğrafları, kulüp logosu/kimlik bilgileri bulunmaması
- [ ] Play Console hesabı doğrulama sonucu, gerekli kapalı test ve production erişimi

**Google resmî doküman:** https://support.google.com/googleplay/android-developer/answer/10144311
https://support.google.com/googleplay/android-developer/answer/10787469

**Üretim kuralı:** Taslaktaki kişi/iletişim alanlarına onay alınmadan sahte değer yazmayın, `privacy.html` yayımlandı demeyin.

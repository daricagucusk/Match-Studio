# Samsung Z Fold 7 / Android kabul kontrolü

Durum: **PR #20 için kullanıcı fiziksel kabulü alındı; genel listenin madde bazında sonuçları kayıtlı değil.** Ekran boyutu emülasyonu gerçek cihaz testi sayılmaz.

26 Ekim 2026: Kullanıcı PR #20 / `a69480b` P0-01 düzeltmesinin fiziksel testinin geçtiğini bildirdi. Cihaz, Android ve Chrome sürümleri belirtilmedi. Bu kayıt aşağıdaki genel kontrol listesinin tüm maddelerini veya sonraki yatay menü düzeltmesini onaylamaz.

Her denemede Android/Chrome sürümünü, ekran modunu, sonucu ve varsa hata adımlarını kaydedin. Gerçek sporcu verileri yerine deneme kulübü kullanın.

- [ ] HTTPS üzerinden PWA yüklenir; açılışta doğru sürüm ve kulüp görünür.
- [ ] Kapalı ve açık ekranda, yatay/dikey yönlerde tüm menülere ulaşılır; sayfa yatay taşmaz.
- [ ] Ekran katlanıp açıldığında form, seçili maç ve kadro korunur.
- [ ] Türkçe klavye açıkken oyuncu arama/yazma ve en alttaki kaydet düğmesi kullanılabilir.
- [ ] Saha oyuncularına dokunma, mevki/forma düzenleme ve yedek seçimi parmakla yapılabilir.
- [ ] Fotoğraf/logo seçimi, PNG indirme ve Android paylaşım menüsü çalışır; paylaşımı iptal etmek hata oluşturmaz.
- [ ] Şifreli JSON yedeği İndirilenler'e kaydedilir ve cihaz dışında saklanır; doğru parolayla içe alınır.
- [ ] Yanlış parola ve bozuk JSON mevcut verileri değiştirmez. Aynı yedek dosyası ikinci kez seçilebilir.
- [ ] Geri yükleme sonrası kurtarma noktasına dönüldüğünde önceki oyuncular, görseller ve maç geçmişi geri gelir.
- [ ] Çevrimdışı hazır mesajından sonra uçak modunda uygulama kapanıp açılır; kadro ve afiş kullanılabilir.
- [ ] En az 90 dakika süren deneme maçında ekran kilidi, arka plan, devre arası ve uygulamaya dönüşten sonra süre/olaylar doğrudur.
- [ ] Çift dokunma mükerrer canlı olay üretmez; iki sekmede yapılan güncellemeler görünür.
- [ ] Yeni sürüm beklerken maç sürdürülebilir; açık formlar kaydedildikten sonra güncelleme yapılır ve kayıtlar korunur.
- [ ] `device-test.html` üzerinden IndexedDB, PWA, katlama ve uçak modu raporu alınır.

Bu maddeler tamamlanmadan sürümün gerçek Z Fold 7 kabulünün geçtiği söylenmemelidir.

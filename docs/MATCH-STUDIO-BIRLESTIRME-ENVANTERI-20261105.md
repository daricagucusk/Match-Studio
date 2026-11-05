# Match Studio birleştirme ve temizlik envanteri

Tarih: 5 Kasım 2026. Bu kayıt ilk incelemedir; tüm bilgisayar taranmış veya temizlik tamamlanmış değildir.

## Doğrulanan çalışma ağaçları

| Konum | Dal ve temel | Durum |
| --- | --- | --- |
| `D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Aday` | `work/premium-coach-console-20261104`, `5c5e7a0` | Kaydedilmemiş F.18 ve bağlam değişiklikleri mevcut. |
| `C:/Users/aearo/Documents/MatchStudio-Android-Release-Candidate/F18-web-release-worktree` | `release/f18-web-20261104`, `6470d9e` | Çalışma ağacı temiz; GitHub main de bu committe. |
| `C:/Users/aearo/Documents/MatchStudio-Android-Release-Candidate/F19-role-console-worktree` | `feat/f19-position-roles-20261105`, `6470d9e` | F.19 ve hızlı olay çalışmaları kaydedilmemiş; izlenmeyen kaynak ve test dosyaları var. |
| `D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Aday-P0-20261102` | `feat/p0-data-reliability-20261102`, `0738aad` | Kaydedilmemiş kanıtlar ve test dosyaları var; yedek geri yükleme korumaları F.19 ile karşılaştırılmalı. |

F.19, F.18 commitini temel alır. Ancak ilk F.18 çalışma ağacındaki tüm kaydedilmemiş değişikliklerin yayın commitinde bulunup bulunmadığı ayrıca karşılaştırılmalıdır. P0 dalı eski klasör yapısına sahip olduğundan tüm dalın doğrudan birleştirilmesi uygunluğu kanıtlanmış değildir; ilgili güvenlik davranışları ve testleri seçilerek incelenmelidir.

### P0 karşılaştırması

`0738aad` ile F.18/F.19 temelindeki `src/storage/backup.js` karşılaştırıldı. F.19, dolu bir kulübe başka kulübün yedeğini geri yüklemeyi engelliyor; boş kulübe aktarımı ve kimliği bulunmayan eski yedeklerin aktarımını destekliyor. P0 ise başka kulüp kimliğini ve kulüp kimliği olmayan eski yedekleri boş hedefte bile reddediyor; ayrıca mevcut ve gelecek kayıt sayılarını önizliyor. P0 testleri de bu daha katı davranışı doğruluyor.

Bu bir basit eksik dosya aktarımı değildir: P0'nun koşulsuz engeli, mevcut kullanıcıya sunulan eski yedekten boş kulübe geçiş akışıyla çelişir. İki ihtiyacı birlikte karşılayan, hedefin boş olduğunu yazma kilidi altında tekrar denetleyen ve gerçek veriye dokunmadan test edilen çözüm değerlendirilmelidir. `docs/qa/P0-EXECUTION-REPORT-20261102.md` eski yedek davranışını farklı anlatmaktadır; incelemede esas alınan son kod ve `tests/backup-target.test.cjs` daha katı engeli göstermiştir.

## Mevcut doğrulama kayıtları

F.19 `docs/F19-LIVE-QUICK-ACTIONS-QA.md` raporu 114 birim testi ve tam tarayıcı koşusunda 195 başarılı, 12 atlanan senaryo kaydeder. Bu rapor tarihsel kanıttır. Fiziksel cihazda F.19 kabulü ve atlanan testlerin değerlendirilmesi açık olarak raporlanmıştır.

5 Kasım'daki bu incelemede F.19'un Git tarafından listelenen 330 kaynak dosyası (özel ajan/IDE ayarları hariç) `C:/Users/aearo/AppData/Local/Temp/matchstudio-consolidation-uzvhZ3` konumuna kopyalanarak bağımsız bir geçici aday oluşturuldu. Bağımlılıklar aynı F.19 çalışma ağacından kopyalandı. Bu adayda ilk `npm test` **114 başarılı, 0 başarısız**, `npm run build:vercel` **başarılı; 60 modül ve 30 statik dosya** verdi. İlk test denemesi sandbox alt süreç kısıtlaması nedeniyle EPERM ile çalışamadı; izinli yeniden deneme başarıyla tamamlandı.

Geçici adaya P0'nun mevcut/yedek kayıt sayısı karşılaştırması eklendi; eski yedeklerin boş kulübe taşınması korunuyor. Yedek okunurken kulüp değişirse önizleme reddediliyor. Bu değişikliklerden sonra `npm test` **115 başarılı**, `npm run build:vercel` **başarılı**. Ayrı tarayıcı profiline şifreli yedek geri yükleme ve aktarım ekranı testleri masaüstü, telefon ve Fold profilinde **6/6 başarılı**. İlk tarayıcı denemesinde 3 test, test dosyasındaki sabit 8911 portu nedeniyle başarısızdı; geçici adayda ikinci tarayıcı bağlamı etkin test adresini kullanacak şekilde düzeltildi ve altı test tekrar geçti. Bu yalnızca geçici adaydır; F.19 kaynak ağacına veya canlı sürüme aktarılmadı. Geçici klasör kalıcı yedek sayılmamalıdır.

Bu aday 5 Kasım'da `D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Yeni-Aday-20261105` konumuna kopyalandı; burada `npm test` yeniden **115/115** geçti. Kopya henüz Git çalışma ağacı veya yayın olarak belirlenmemiştir. Orijinal F.18 kirli ağacının değişmiş/izlenmeyen uygulama ve test yollarının 24'ü F.18 yayın ağacıyla SHA-256 bakımından aynı; karşılaştırılan farklı uygulama dosyası yok. `tools/start-premium-preview.ps1` yayın ağacında yoktur ve eski yerel önizleme başlatıcısı olarak ayrı değerlendirilmelidir. Bağlam, yerel ayar ve dokümanlar bu 24 dosyalık karşılaştırmanın dışındadır.

Aynı gün bu aday F.18 `6470d9e` temelinden açılan `D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum` çalışma ağacına aktarıldı; dal `work/birlesik-tek-surum-20261105`, yerel commit `d068d43`. Önceki çalışma ağaçları, yerel yapılandırmalar ve gerçek kulüp verileri değiştirilmemiştir. Hem aday kopyasında hem de yeni Git çalışma ağacında tam Playwright koşusu (`--workers=3 --retries=0`) **195 geçti, 12 atlandı, 0 başarısız**, çıkış kodu 0. Bunlar gerçek cihaz kabulü değildir.

Geçici `Birlesik-Yeni-Aday-20261105` kopyasının üretilen çıktı ve bağımlılıklar dışındaki 332 dosyası Git çalışma ağacıyla SHA-256 bakımından karşılaştırıldı: 332 aynı, eksik veya farklı dosya yok. Bu turda oluşturulan geçici kopya ardından kaldırıldı; `Birlesik-Tek-Surum` korundu. Atlanan 12 test, altı senaryonun ilgili olmayan ekran profillerindeki koşullu tekrarlarıdır; karşılıkları seçilen profilde çalışmıştır. 5 Kasım ADB kontrolünde bağlı fiziksel cihaz görünmedi.

Sonraki 5 Kasım kontrolünde Galaxy Z Fold7 bağlandı. Android Chrome'da, ADB ile yönlendirilmiş `127.0.0.1:8975` üzerinden F.19 adayının dış ekran başlangıcı görüldü; kanıt `../../../Incelemeler/F19-fold7-dis-ekran-acilis-20261105.png`. Bu yalnızca açılış kontrolüdür. Test sunucusu ve yönlendirme işlem sonunda kapatıldı; maç akışı, iç ekran ve çevrimdışı test edilmedi.

Temiz F.18 `release/f18-web-20261104` çalışma ağacı `git worktree remove` ile kaldırıldı. Öncesinde `git status` temizdi; göz ardı edilenler yalnızca bağımlılıklar, üretilen web çıktıları ve tek `.last-run.json` test kaydıydı. F.18 `6470d9e` commit'i, yerel dalı ve GitHub `main` korunmaktadır. F.19 ve P0 ağaçlarında kaydedilmemiş dosyalar bulunduğundan bu işlem onlara uygulanmadı.

Sonraki aşamada F.19 ağacındaki tüm kaydedilmemiş kaynaklar ve izlenmeyen dosyalar, `.superdesign`/`.vscode` dosyaları, `dist` mağaza görselleri ve `test-results` kanıtları dahil 79 dosya `Gecmis-Kaynaklar/F19-calisma-kanitlari-20261105.zip` içine alındı. Her dosya ZIP içeriğiyle SHA-256 karşılaştırmasından ve ZIP CRC kontrolünden geçti. Arşiv SHA-256: `3bc6db49741ea252515a8d43c5d65c1e6f6ddf9f833bd8bd3f9253b056be9fc0`. F.19'un kaynak değişiklikleri daha önce birleşik adayda korunmuştu; doğrulama sonrası eski F.19 çalışma ağacı Git aracılığıyla kaldırıldı. Dal/temel commit korunur. `node_modules`, `public` ve üretilen web bundle'ları yeniden üretilebilir çıktı olarak arşive alınmadı. P0 çalışma ağacı hâlâ korunuyor.

P0 çalışma ağacının 42 kaydedilmemiş dosyası ve arşivlenen çıktısı `Gecmis-Kaynaklar/P0-calisma-kanitlari-20261105.zip` içine alındı; ZIP CRC ve her dosyanın SHA-256 eşleşmesi doğrulandı. Arşiv SHA-256: `1f041418c76067ea89271850adb678a2e6aaa345155bf3e8a623c5a4635f100c`. Ardından eski P0 çalışma ağacı Git aracılığıyla kaldırıldı; kaynak değişikliklerini içeren `0738aad` ve `feat/p0-data-reliability-20261102` dalı korunuyor. P0'nun eski yedekleri kısıtlayan güvenlik yaklaşımı doğrudan birleşik sürüme taşınmamıştır; yukarıdaki uyumluluk farkı geçerlidir.

## GitHub — 5 Kasım salt okunur kontrol

Özel `daricagucusk/Match-Studio` deposunun `main` dalı `6470d9e31322f9b687a33137a0611500fdd84110` commitindedir. 15 açık taslak PR ve eski özellik, düzeltme, yayın ve ajan dalları vardır. Açık PR veya dallar tek tek incelenip içerikleri ve main ile ilişkileri doğrulanmadan kapatılmamalı veya silinmemelidir. `gh auth status` sandbox içinde başarısız olsa da yetkili ağ erişimiyle depo ve PR envanteri okunabilmiştir.

5 Kasım sonraki kontrolde GitHub main SHA tekrar doğrulandı. #26 başı `2a778d5` ve #27 başı `0b25ee4`, main geçmişinin atasıdır; her iki taslak bu nedenle kapatıldı, dalları silinmedi. Kalan taslaklar bu işlemle doğrulanmış veya kapatılmış sayılmaz.

#23 başı `bd008267` için `git cherry origin/main` aynı yamanın ana dalda bulunduğunu (`-`) gösterdi; GitHub'daki güncel baş doğrulandıktan sonra #23 de kapatıldı. #28 ve #29 için eşdeğer commit otomatik saptanmadı (`+`); inceleme için açık bırakıldı.

Sonraki içerik incelemesinde #28'in dolu kulübü farklı yedeğe karşı koruyan `assertBackupTarget` kodu ve testlerinin, #29'un `reducedMotion` test düzeltmesinin GitHub main kaynaklarında mevcut olduğu doğrulandı. Her iki PR'ın uzak başı tekrar denetlendikten sonra #28 ve #29 kapatıldı; dalları silinmedi.

#19'un kulüp değişimi, yavaş okuma, iptal ve geri yükleme sonrası fikstür önizlemesini geçersiz kılma amacı `origin/main` içinde farklı bir uygulama ile karşılanıyor; mevcut birim ve tarayıcı testlerinde aynı kulüp adlarıyla A→B→A, yavaş okuma ve geri yükleme senaryoları bulunuyor. Bu içerik incelemesinden sonra #19 kapatıldı; özgün dal silinmedi. Uygulamalar byte düzeyinde aynı değildir.

## Bağımsız Git geçişi

5 Kasım'da eski ortak depodan tüm Git referanslarını içeren `Gecmis-Kaynaklar/MatchStudio-tum-git-gecmisi-20261105.bundle` oluşturuldu ve `git bundle verify` başarılı oldu. SHA-256: `3e766d4f28d8d79ef8992e90581548b5ba1371926d350a5efe39c68ad1dadfd5`. Bağımsız depoda eski 47 `refs/` kaydı `refs/archive/` altında birebir doğrulandı; `git fsck --full` hata olmadan tamamlandı. Yerel bundle ve arşiv referansları özel çalışma geçmişi içerebilir; yayımlanmaz.

Bağımsız adayda 115 birim testi, derleme ve mevki/yedek odaklı 12 tarayıcı testi geçti. Bağlı eski adayın 42 `dist` ve test kanıtı ZIP ve SHA-256 kontrolüyle `Gecmis-Kaynaklar/Birlesik-tek-surum-test-kanitlari-20261105.zip` içine alındı; arşiv SHA-256 `20b5f6320854a736a3ac900dee4ee65197c2313e22a7120d6ef137ff11e03a5e`. Ardından eski bağlı çalışma ağacı kaldırıldı ve bağımsız depo aynı `Calisma/Birlesik-Tek-Surum` adına taşındı. Yeni deponun Git ortak dizini kendi `.git` klasörüdür; `origin` GitHub deposuna işaret eder. Eski `Birlesik-Aday` kişisel ayarlar ve kaydedilmemiş dosyalar için ayrıca korunmaktadır.

## Koruma ve sonraki inceleme

- Gerçek kulüp yedeği, imza materyali, Play kanıtları, kaynak görseller, fiziksel cihaz kanıtları ve ayrı çalışma ağaçlarındaki kaydedilmemiş işler silme adayı varsayılmaz.
- F.16 ve F.17 ZIP ve açılmış klasörleri, `Teslimler`, `Gecmis-Kaynaklar` ve Windows belgelerindeki Android aday klasörü envanterlenmiştir; içerik ve geri dönüş değeri henüz tam karşılaştırılmamıştır.
- Tek aday seçilmeden önce F.19 değişiklikleri, F.18 çalışma ağacı ve P0 güvenlik değişiklikleri ayrı ayrı karşılaştırılmalı; çalışır geri dönüş kopyası korunmalı.
- Dosya boyutları, tam kopyalar ve kullanım ilişkileri ölçülmeli; silme veya taşıma hedefleri somut listeyle doğrulanmalıdır.
- Yayınlanmış web sürümü, Play durumu, açık PR'lar ve eski dalların birleşme durumu ayrıca doğrulanmalıdır.

## İlk boyut ölçümü

5 Kasım taramasında (bağlantılar izlenmeden; bayt toplamı) `Gecmis-Kaynaklar` 588.853.973, `Kaynaklar` 808.733.157, `Teslimler` 159.978.241 bayt bulundu. Ana klasördeki F.16 kaynak ZIP 21.732.857, F.17 kaynak ZIP 21.882.790, Stitch görseller ZIP 25.555.890 bayt; açılmış karşılıkların bulunması tek başına içerik eşitliği kanıtı değildir. Ayrı Android aday klasöründe TWA 69.087.323, F.19 çalışma ağacı 69.446.521, F.18 çalışma ağacı 56.535.735 bayttır. Bu ölçümler silme önerisi değildir; gerçek yedekler, imzalama materyalleri, özgün tasarımlar, Git geçmişi ve benzersiz değişiklikler korunmalıdır.

F.16 PWA ZIP içindeki 28/28 dosya ve F.16 Source ZIP içindeki 233/233 dosya, aynı isimli açılmış klasörlerde SHA-256 ile birebir eşleşti; klasör dosya sayıları da aynı. `stitch görseller.zip` içindeki 54/54 dosya açılmış görsellerle eşleşti. Bu kontrol ZIP dışındaki başlatıcıların veya başka konumlardaki dosyaların kullanımını kanıtlamaz.

5 Kasım: F.16 PWA ve Source ZIP içerikleri dosya sayısı, güvenli yol ve SHA-256 ile yeniden kontrol edildi. İki ZIP `Gecmis-Kaynaklar/Korunan-F16-20261105/` altına taşındı ve taşıma öncesi/sonrası SHA-256 eşitliği doğrulandı. Ardından yalnızca bu ZIP'lerle birebir eşleşen iki açılmış F.16 klasörü kaldırıldı; yaklaşık 27.471.234 bayt açılmış kopya temizlendi. Stitch görselleri ve diğer kopyalar değiştirilmedi.

F.17 PWA ve Source ZIP'leri de 5 Kasım'da `Gecmis-Kaynaklar/Korunan-F17-20261105/` altına taşındı; taşıma öncesi ve sonrası SHA-256 eşleşti. PWA `64ff510102789b8ba20020cc463bfbc539a287c85d6d610c52d90fc645f9a478`, kaynak `225e17425ebb6f6a29caf0bad1888e79ed3aa6d66b5dfda19109452ac4224d51`. Taşıma disk alanı açmaz; eski paketleri çalışma girişinden ayırır.

`Kaynaklar/Toplu-Arsiv` içinde 14 numaralı ZIP kopyası, her kopya ve aynı klasörde korunan numarasız ana dosya için SHA-256 silme öncesi iki kez doğrulanarak kaldırıldı: 268B TamPaket (1–4), F13 PWA ve Source (1), F1R1 TamPaket (1), PC Windows Hazır (1), PC ve Telefon Tam Paket (1–6). Ana dosyalar ve farklı adlı diğer arşivler korundu. Açılan alan 143.573.071 bayttır. Yalnızca belirtilen dosyalar kaldırıldı.

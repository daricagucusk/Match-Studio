# F.19 ajan test raporları — 6 Kasım 2026

Bu belge, 6 Kasım 2026'da Match Studio ilk sürüm (başlangıç commit `d90b875`, dal `work/birlesik-te-surum-20261105`) için planlanan bağımsız ajan denetiminin ve yürütülebilen canlı kabulün kaydıdır. Kullanıcı isteği: "bütün testlerini ilgili ajanlar ayrı ayrı yapsın, canlı testler istiyorum, işlevsellik ve görsel olarak eksikleri raporlasınlar".

## Yöntem ve kurallar

- Canlı örnek: `http://127.0.0.1:8913/` (`node tools/serve.cjs 8913 --static`, `public/` çıktısı); gerçek Chromium.
- Aynı anda en fazla 3 uzman ajan çalışır (proje kuralı); dört kategori iki dalgada koşacaktı.
- Ajanlar yalnızca rapor/kanıt üretir: kaynak koduna (`src/`, `web/`, `tests/`, `docs/`, `context/`) dokunmaz, commit/push yapmaz.
- Gerçek kişiden veri kullanılmaz; tüm veri sentetiktir ("Süre Spor", "Deneme Oyuncu 01" vb.).

## Dalga ve ajan planı

| Dalga | Test kategorisi | Uzman ajan | Planlanan canlı iş | Sonuç |
|---|---|---|---|---|
| 1 | Fonksiyonel | test-automation-engineer | `npm test`, `npm run build`, tam `npx playwright test --workers=1`, 8913 üzerinde uçtan uca akışlar | Ajan başlatılamadı |
| 1 | Görsel bitiş kapısı | design-ui-finish-gate-reviewer | Dört görünümde gerçek Chromium ekran görüntüleri + token/boşluk denetimi | Ajan başlatılamadı |
| 1 | Performans | performance-benchmarker | FCP/LCP/TBT/CLS, CPU 4× kısıtlama, kaynak ağırlığı | Ajan başlatılamadı |
| 2 | Erişilebilirlik | accessibility-auditor | Klavye taraması, rol/etiket denetimi, kontrast | Ajan başlatılamadı |

Üç alt ajan denemesi servis tarafından "Free usage limit reached" hatasıyla düştü. Bu nedenle istenen bağımsız ajan ayrımı bu turda tamamlanamadı; aşağıdaki canlı kabul ana oturumda doğrudan Chromium ile yürütüldü ve ajan raporu yerine geçmez.

## Yürütülen canlı kabul

- Betik: `tools/qa-team-depth.cjs`; çıktı: `evidence/team-depth/results.json`.
- Kapsam: takım derinliği ekranı; 1440×1000 masaüstü, 1280×720 laptop, 840×980 Fold açık, 360×780 telefon.
- Sonuç: dört görünümde de PASS. 11/11 görev satırı görünür; belge, ana içerik ve tablo dikey kaydırma üretmiyor; yatay taşma yok.
- Etkileşim: sütun gezinmesi, aday sayfalama, taktik rol değişimi, öncelik yükseltme (9→8), yenileme sonrası kalıcılık, bağımsız sol/sağ stoper kuyrukları, boş takım açıklaması, açılış odağı, 12 Tab boyunca odak tuzağı, Escape ile kapanış ve odak dönüşü doğrulandı.
- Ölçüm ayrıntıları ve sınırlar: `docs/TEAM-DEPTH-ACCEPTANCE.md`.

## Bulgular

### Fonksiyonel

- `npm run build:vercel` PASS; `npm test` 115/115 PASS.
- Yeni Maç formu canlı Chromium kontrolü PASS: `#ageCategory` alanı yok (0); U14 grubu seçilerek kaydedilen maçta `ageCategory: "U14"` türetildi.
- Canlı takım derinliği kabulü 4/4 görünümde PASS; sayfa/konsol hatası 0.
- Standart Playwright koşucusu (`npx playwright test` ve `node node_modules/@playwright/test/cli.js test`) bu oturumda testleri başlatmadan asılı kaldı; `--list` çalışıyor, Chromium doğrudan Node ile açılabiliyor. Tam tarayıcı seti (önceki taban 207 geçti / 12 atlandı) bu değişikliklerden sonra yeniden koşulamadı.
- Yaş kategorisi sadeleştirmesi için maç formu tarayıcı testi güncellendi; Playwright runner engeli sürüyor, aynı akış yukarıdaki canlı Chromium kontrolüyle doğrulandı.

### Görsel

- Dört görünümün ana ekran ve düzenleyici görüntüleri `evidence/team-depth/` altında; 11 satır kırpılmadan görünüyor, alt gezinme ekran içinde kalıyor.
- Telefon görünümünde üst bar ve mobil kulüp seçici gizlenerek satırlara yer açılıyor; 1023 px altında yerel durum/bağlantı göstergesi gizleniyor.
- Bu, tam bir tasarım sistemi/bitiş denetimi değildir; bağımsız görsel ajan limit nedeniyle çalışmadı.

### Performans

- Bu turda ölçülmedi. FCP/LCP/TBT/CLS, CPU kısıtlama ve bellek testleri için sonuç iddia edilmiyor.

### Erişilebilirlik

- Canlı Chromium'da açılış odağı, Tab odak tuzağı, Escape ile kapanış, açan göreve odak dönüşü ve `aria-label`/`title` ile tam ad erişimi PASS.
- WCAG 2.1 AA taraması, kontrast ölçümü, ekran okuyucu ve fiziksel cihaz testi yapılmadı; bağımsız erişilebilirlik ajanı limit nedeniyle çalışmadı.

## Çözüm planı

- Test edilen kapsamda işlevsel veya görsel kusur bulunmadı.
- Açık kalanlar: Playwright koşucusunun ortam engelinin giderilmesi ve tam tarayıcı setinin yeniden koşulması; bağımsız görsel/performans/erişilebilirlik ajanlarının limit açıldığında çalıştırılması; fiziksel cihaz ve yayın kabulü.
- Push, birleştirme ve dağıtım kullanıcı yetkisi bekliyor.

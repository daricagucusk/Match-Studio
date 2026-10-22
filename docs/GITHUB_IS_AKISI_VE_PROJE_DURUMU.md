# Match Studio — GitHub entegrasyonu ve kaynak durum raporu

**İnceleme:** 22 Ekim 2026. **Depo:** `daricagucusk/Match-Studio` (private). **Varsayılan dal:** `main`.

## Doğrulanan kaynak durumu

- İncelenen `main` HEAD: `e9e56f6eb0714becaced6940e038df1cb20ca681`.
- `package.json` sürümü: `2.6.8-f.11`; `README.md` de `V2.6.8-F.11` olarak tanımlıyor.
- Proje kaynakları `src/` altında; `tools/build.cjs` + `tools/module-order.json` üzerinden `app.bundle.js` derleniyor. `sw.js` de üretilen dosya.
- Uygulamada `src/domain/match-clock.js`, `match-substitutions.js`, `live-pitch.js`, `match-events-report.js` ve ilgili `src/storage/` modülleri bulunuyor. Önceki sohbet ZIP'lerinin sürüm adlarına bakıp bunların depodakinden daha yeni olduğunu varsaymayın.
- `src/storage/db.js` dokuz alanlı IndexedDB V2 şemasını tanımlıyor: yedi eski alan ile `matchSessions` ve `matchEvents`.
- CI: `.github/workflows/verify.yml` → `npm run release` ve `npm run build:vercel`. Node/fake-indexeddb ve Playwright testleri var.
- `docs/VALIDATION.md` yerel Linux testlerinde **37 Node + 74 Chromium senaryosu** raporluyor; bu bir GitHub Actions veya fiziksel Z Fold kabul kanıtı değildir.
- GitHub Actions kontrolünde 22 Ekim itibarıyla **`f1e5c30...` için success** ve **`e9e56f6...` için cancelled** görüldü. Son commit'in CI doğrulaması açık kalite kapısıdır.
- `main` dalı GitHub sorgusunda **protected: false**; doğrudan yazmaları önleyen koruma görünmüyor.
- Belgelerde mevcut Vercel hedefi `https://match-studio-telefon.vercel.app` olarak geçiyor; belgedeki son bilinen canlı sürüm F.3. Bu URL'nin güncel dağıtımı burada doğrulanmadı. GitHub'a kod eklenmiş olması üretim yayını yapıldığı anlamına gelmez.

## Bundan sonraki çalışma akışı

1. **GitHub tek referans:** her görev başında `main` HEAD, sürüm, açık PR'lar ve CI incelenecek.
2. **Özellik dalı:** her değişiklik ayrı `feat/`, `fix/` veya `chore/` dalında tutulacak. Hiçbir sohbet ZIP'i doğrudan `main`e kopyalanmayacak.
3. **Kod + test + belgeler:** kaynak kod, yükseltme/kurtarma testi, tarayıcı kabul senaryoları ve sürüm notları birlikte gözden geçirilecek.
4. **PR ve onay:** GitHub Actions başarıyla tamamlanınca ve kullanıcı onay verince `main`e birleştirilecek; depo henüz zorunlu koruma kullanmıyorsa manuel kontrol uygulanacak.
5. **Yayın ayrı adım:** Vercel Git bağlantısı/üretim dağıtımı ayrıca doğrulanacak; üretim ve test ortamları ayrı tutulacak.
6. **Gerçek cihaz:** Samsung Z Fold 7 QA, emülasyon testiyle karıştırılmayacak. Doğrulanmamış hususlar raporda açık bırakılacak.
7. **Gizlilik:** gerçek sporcu/çocuk verileri commit edilmeyecek; testler sentetik verilerle yapılacak. Mevcut IndexedDB kayıtlarına müdahale edilmeyecek.

## Öncelikli açık işler

- Son `main` commit'i üzerinde iptal edilmiş CI'nin nedeni incelenip başarılı doğrulama sağlanmalı.
- GitHub dal koruması/required `verify` kontrolü uygun erişimle etkinleştirilmeli; Vercel üretim kaynağı doğrulanmalı.
- Geçmiş Paket C/D/E/F sohbet kapsamı ile depodaki F.11 modülleri ve testleri dosya bazında karşılaştırılmalı; eşdeğer olduğu varsayılmamalı.
- Gerçek Samsung Z Fold 7 kabul kontrol listesi tamamlanmalı; yayın ancak doğrulanmış commit üzerinden ilerlemeli.

**Bu belgenin eklenmesi uygulama kodunu, IndexedDB şemasını, gerçek kulüp kayıtlarını veya üretim dağıtımını değiştirmez.**

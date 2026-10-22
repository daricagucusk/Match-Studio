# Match Studio — GitHub senkronizasyon kaydı · 23 Ekim 2026

- Kaynak depo: `daricagucusk/Match-Studio` (private).
- Başlangıç `main`: `e9e56f6eb0714becaced6940e038df1cb20ca681` (V2.6.8-F.11).
- F.12 başlangıç: `66c47f6418baa9305ab63069efe2208d500f49df` (gerçek oyuncu katılımı, GitHub Actions başarılı).
- F.13 başlangıç: `02c45e079881dbc8b61f31a951b283a01b06298a` (asist düzeltme bütünlüğü, GitHub Actions başarılı).
- Bu dalda F.13 sürüm kimliği / HTML ve PWA manifest etiketleri eşitlendi; kaynak modüllerinin sportif hesaplama mantığı değiştirilmedi.
- `npm run release` ve `npm run build:vercel` GitHub Actions `Verify Match Studio release` işi tarafından denetlenecek.
- Koruma: `main` doğrudan değiştirilmez; pull request olarak hazırlanır. Gerçek Z Fold 7 kabulü olmadan prod'a birleştirilmez.
- Veri: Gerçek sporcu/çocuk kaydı repoya yüklenmez; kulüp veritabanı ve şifreli JSON yedek şeması değiştirilmez.
- Test ve tarayıcı çalıştırma sonuçları GitHub Actions ekranından ayrıca gözlenmelidir; bu dosya başarı belgesi değildir.

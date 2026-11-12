---
paths:
  - "tests/**/*.cjs"
  - "playwright.config.cjs"
---
# Testler

- Node testleri `node --test tests/*.test.cjs`; yeni test aynı klasöre `*.test.cjs`.
- Tarayıcı testi `public/` çıktısı üzerinden çalışır; önce `npm run build:vercel`.
- Projeler: desktop 1440×1000, phone 360×780, fold-open 840×980. `workers:1` korunur.
- Gerçek sporcu verisi ve sabit kişisel veri kullanma; sentetik fixture üret.
- Yeni görseller `test-results/reviews/` altına yazılır; `evidence/` üzerine yazılmaz.
- Testi geçirmek için üretim kodunu gevşetme; kapsamı daraltma, test silme.
- Davranış değişikliğinde önce kırılan testi yaz, kırmızıyı gör, sonra düzelt.
- Tarihli test sayıları kanıttır; güncel durum için komutu yeniden çalıştır.

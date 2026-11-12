---
name: release-hazirla
description: Kullanıcı sürüm, paket, yayın veya mağaza hazırlığı istediğinde kullan. Doğrulama, paketleme, Play hazırlığı ve yetki kapısı sırasını uygular.
---

# Release hazırla

## 1. Durum

- `git status`, dal, HEAD ve açık PR'ları kontrol et.
- `package.json` sürümünü ve `README.md` sürüm satırını karşılaştır.
- Kirli çalışma ağacıyla yayın hazırlığı yapma; önce kullanıcıya bildir.

## 2. Doğrulama (sırayla, atlamadan)

1. `npm test` → Node paketi.
2. `npm run build` → derleme.
3. `npm run test:browser` → Playwright (desktop, phone, fold-open).
4. `npm run check` → tam paket.
5. `npm run package` → `release-security-check` + ZIP bütünlüğü.
6. `npm run check:play` → hazırlık raporu.
7. `npm run check:play:strict` → uzak uçlar dahil.

Her adımın çıktısını kaydet; başarısız adımda dur ve nedeni raporla.

## 3. Engel listesi

- Play Console, imzalı AAB, gerçek cihaz ve Vercel adımlarını `docs/guides/DEVICE_CHECKLIST.md` ve `docs/play/` ile karşılaştır.
- Otomasyonla kapanmayan maddeleri "kullanıcı işlemi" olarak ayır.
- Yerel testi gerçek cihaz veya mağaza kabulü sayma.

## 4. Yetki kapısı

- `git push`, `main`'e merge, Vercel production, Play yükleme ve `npm publish` **ayrı açık yetki** ister.
- Yetki yoksa yalnız raporu ve hazır paketi teslim et; yayınlama.

## 5. Rapor

- Geçen/başarısız komutlar ve sayıları.
- Üretilen paket yolları ve SHA-256 özetleri.
- Kalan engeller ve kimin yapması gerektiği.
- Yayınlanmadıysa açıkça "yayınlanmadı" yaz.

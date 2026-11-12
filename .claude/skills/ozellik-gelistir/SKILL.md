---
name: ozellik-gelistir
description: Kullanıcı yeni bir özellik, ekran, modül veya kapsam genişletmesi istediğinde kullan. Kapsam sözleşmesi, regresyon testi, uygulama ve doğrulama sırasını uygular.
---

# Özellik geliştir

## Ön koşul

1. `CLAUDE.md` ve depo dışı bağlam haritasını oku.
2. `git status`, dal ve son commit'i kontrol et; kullanıcı değişikliklerini koru.
3. İlgili mevcut modülleri `grep`/`glob` ile bul; yeni dosya açmadan önce mevcut dosyaya eklemeyi değerlendir.

## Aşamalar

### 1. Kapsam sözleşmesi

- Kullanıcının istediği davranışı tek paragrafta yaz.
- Kapsam dışı olanları açıkça listele.
- Değişecek dosyaları ve veri sözleşmesini (alan adı, anahtar, geriye uyumluluk) belirle.
- Belirsizlik varsa tek soruda topla; varsayım yaptıysan yaz.

### 2. Regresyon testi

- Davranış değişikliği için önce kırılan testi yaz: `tests/<konu>.test.cjs`.
- Testi çalıştır, kırmızı olduğunu gör. Kırmızı görülmeden uygulamaya geçme.
- Tarayıcı davranışıysa `tests/browser/<konu>.spec.cjs`; mevcut `live-fixture.cjs` yardımcılarını kullan.

### 3. Uygulama

- En küçük odaklı yamayı uygula; kapsam dışı dosyaya dokunma.
- Katman kuralına uy: `domain` saf, `storage` IndexedDB, `app` koordinasyon.
- Yeni modül eklediysen `tools/module-order.json` sırasını güncelle.
- Mevcut biçimi koru; dosyayı yeniden biçimlendirme.

### 4. Doğrulama

- `npm test` → hedef test yeşil, mevcut testler bozulmamış.
- Davranış değişikliğinde `npm run check` (derleme + Node + tarayıcı).
- Arayüz değiştiyse 360×780, 840×980 ve 1440×1000 ölçülerinde taşma ve erişilebilirlik kontrolü.
- Veri şeması değiştiyse yedek uyumluluk testi ekle.

### 5. Teslim

- Değişen dosyalar, çalıştırılan komutlar ve sonuçları.
- Doğrulanamayan noktalar ve kalan risk.
- Kapsam dışı bırakılanlar.

## Yasaklar

- Testi geçirmek için üretim kodunu gevşetme.
- Üretilen dosyayı (`web/app.bundle.js`, `web/sw.js`, `public/`, `dist/`) elle düzenleme.
- Kullanıcı onayı olmadan yeni bağımlılık, şema migrasyonu veya yayın.

---
paths:
  - "src/**/*.js"
---
# Mimari ve kod

- Katman: `domain` saf hesaplama, `storage` IndexedDB, `app` koordinasyon. `domain` DOM veya IndexedDB'ye dokunmaz.
- Yeni modül `tools/module-order.json` içine doğru sırayla eklenir; sıra atlanırsa derleme kırılır.
- Kalıcı veriye yalnız ilgili `storage` modülü üzerinden erişilir.
- Mevcut biçimi koru: 1 boşluk girinti, noktalı virgül, tek tırnak. Dosyayı yeniden biçimlendirme.
- Yeni bağımlılık yok; çözüm mevcut modüllerle kurulur.
- `src/` modülleri taşınmaz; bundle içindeki modül yolları ve bağımlılık sırası korunur.

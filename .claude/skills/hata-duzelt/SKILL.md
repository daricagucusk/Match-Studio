---
name: hata-duzelt
description: Kullanıcı bir hata, kırık test, beklenmeyen davranış veya regresyon bildirdiğinde kullan. Yeniden üretme, kök neden, en küçük yama ve hedefli doğrulama sırasını uygular.
---

# Hata düzelt

## 1. Yeniden üret

- Hatayı tek cümlede tanımla: ne oluyor, ne bekleniyordu.
- Hatanın en küçük yeniden üretimini bul: test, komut veya ekran adımı.
- Yeniden üretemiyorsan bunu açıkça yaz; tahminle yama uygulama.

## 2. Kök neden

- Hata mesajını önce mesajın kendisinden açıkla; dosya, satır, eksik bağımlılık genelde orada yazar.
- `git log` ve `git blame` ile son değişikliği kontrol et.
- Katmanı belirle: `domain` hesabı mı, `storage` yazımı mı, `app` koordinasyonu mu, CSS mi.
- İki farklı düzeltme denemesi sonuç vermediyse dur; yeniden teşhis et ve neyin yanlış olduğunu yaz.

## 3. Yama

- Kök nedeni düzelten en küçük değişikliği yap; belirtiyi gizleyen yama yapma.
- Kapsam dışı dosyayı biçimlendirme, yeniden adlandırma, refaktör etme.
- Davranış değişikliği varsa önce kırılan testi ekle.

## 4. Doğrulama

- Hedef test: `node --test tests/<dosya>.test.cjs`.
- Ardından `npm test` → tam Node paketi.
- Arayüz veya canlı maç hatasında `npm run check` ve ilgili Playwright senaryosu.
- Düzeltme sonrası aynı hatanın yeniden üretim adımını tekrar çalıştır; kapandığını göster.

## 5. Rapor

- Kök neden (kanıtla), yapılan değişiklik, test sonucu, kalan risk.
- Düzeltilemeyen kısım varsa nedenini ve neyin gerektiğini yaz.

---
name: bagimsiz-qa
description: Kullanıcı "denetle", "QA", "gözden geçir", "yayına hazır mı" dediğinde veya bir değişiklik teslim edilmeden önce kullan. Bağımsız, kanıta dayalı denetim yapar; kod yazmaz.
---

# Bağımsız QA denetimi

## Kapsam belirle

- Varsayılan: `git diff` (çalışma ağacı) + `git diff main...HEAD`.
- Kullanıcı PR numarası, dal veya yol verdiyse onu kullan.

## Denetim eksenleri

1. **Doğruluk** — mantık hatası, sınır durumu, boş/null, eşzamanlılık, mükerrer kayıt.
2. **Veri bütünlüğü** — kulüp ayrımı, atomiklik, şema uyumu, yedek/kurtarma etkisi.
3. **Canlı maç** — append-only geçmiş, düzeltme/undo tutarlılığı, süre hesabı.
4. **Arayüz** — 44px hedef, taşma, odak tuzağı, kontrast, `DESIGN.md` uyumu.
5. **Test kapsamı** — yeni davranış test edilmiş mi, test gevşetilmiş mi, silinmiş test var mı.
6. **Güvenlik** — sır, yetki, enjeksiyon, yol geçişi, paket filtresi.

## Kanıt kuralı

- Her bulgu bir dosya:satır ve okunmuş içeriğe dayanır.
- Çalıştırılmamış testi "geçti" sayma; çalıştırılmamışsa "doğrulanmadı" yaz.
- Araç hatası (timeout, kopan bağlantı) ürün hatası değildir; ayrı başlıkta raporla.

## Rapor biçimi

- Önem sırası: Kritik → Yüksek → Orta → Düşük.
- Her bulgu: konum, sorun, etki, önerilen düzeltme.
- Sonda: çalıştırılan komutlar ve sonuçları, doğrulanamayan noktalar.
- Bulgu yoksa "bulgu yok" de ve neyi kontrol ettiğini listele.

## Sınır

- Denetim sırasında kod değiştirme. Kullanıcı `--fix` veya "düzelt" derse ayrı iş olarak uygula.

# JARVIS Premium — Proje iş akışı
<!-- JARVIS-PREMIUM-KIT -->

Bu belge `AGENTS.md`, `CLAUDE.md` veya mevcut proje kararlarını **geçersiz kılmaz**.
Öncelik sırası: güvenlik ve kullanıcı onayı > projenin mevcut talimatları > doğrulanmış bağlam > bu şablon.

## 1) Görev öncesi
- `git status --short` ve aktif dalı kontrol et; kirli dosyaları olduğu gibi koru.
- Önce `AGENTS.md`, sonra proje bunu söylüyorsa `CLAUDE.md`, `context/README.md` ve ilgili bağlamı oku.
- Eksik bilgileri ve kabul kriterlerini belirt. Gerekirse kısa brainstorming yap.
- Kullanıcının yetkilendirmediği başka projeyi, hesabı veya dış kaynağı değiştirme.

## 2) Superpowers disiplin döngüsü
- Brainstorming: amacı, sınırları, kullanıcı senaryolarını netleştir.
- Writing Plans: işi yaklaşık 2–5 dakikalık doğrulanabilir mikro adımlara ayır.
- TDD: önce başarısız test / yeniden üretim, ardından minimal düzeltme, sonra regresyon.
- Review: gerekirse bağımsız Codex (read-only) veya OpenCode (plan) incelemesi al.
- Evidence: test çıktıları + değişen dosyalar + kalan riskler + geri dönüş yolu.

## 3) UI / UX kapıları
- Normal metin kontrastı WCAG AA ≥4.5:1.
- Dokunmatik kontroller en az 44×44 CSS px hedefi esas alınarak tasarlanır.
- Klavye/focus akışı, etiketler, error state, dar telefon ve katlanabilir viewport kontrol edilir.
- Ürün tasarım değişikliği öncesi hedef kullanıcı/görev ve kabul kriteri belirlenir.

## 4) Delege etme (sınırlı yetki)
- `jarvis plan -Message "..."` → yerel Ollama ile metinsel plan.
- `jarvis delegate -Agent codex -Message "..."` → sadece önizleme.
- Aynı komuta `-Execute` eklenirse Codex **read-only** görev alır.
- `jarvis delegate -Agent opencode -Message "..." -Execute` → OpenCode plan ajanı.
  DİKKAT: OpenCode plan ajanı normal kod dosyalarını düzenlemese de shell/harici yollar
  üzerinde tam OS sandbox garantisi vermez. Yetki ayarlarını ayrıca denetle.
- AI yanıtı, doğrulanmış test veya yazma onayı anlamına gelmez.

## 5) Koruma / yayın
- `git reset --hard`, kör `git clean`, dosya silme, merge, push, deploy, gerçek veri aktarımı
  ve reklam harcaması otomatik yapılamaz; açık ve kapsamlı kullanıcı onayı gerekir.
- Gizli anahtar/parola/veri dosyası ajan bağlamına dahil edilmez; `.env` örnekleri dışında okutma.
- Otomatik testlerden önce seçili projeyi ve mevcut çalışma dalını doğrula.
- Her projede aynı şablonu kullan, ancak teknoloji yığınına göre komutları uyarlamadan çalıştırma.

## 6) Görev kapanışı
Kısaca: mevcut durum, değişen dosyalar, test komutları ve sonuçları, açık riskler,
sonraki önerilen adım. Başarı kanıtı yoksa 'tamamlandı' deme.

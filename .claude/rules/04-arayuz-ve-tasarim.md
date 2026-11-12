---
paths:
  - "web/**/*.css"
  - "src/app/**/*.js"
  - "src/styles/**/*.css"
  - "src/posters/**/*.js"
---
# Arayüz ve tasarım

- Palet: obsidyen `#0B0E15`, şampanya `#E5C478`, zümrüt `#0D281E`. Neon mor ve dekoratif bildirim yok.
- Dokunma hedefi en az 44px; odak görünür; klavye akışı korunur.
- 360px telefonda yatay taşma olmaz; eylem gizlenerek ekran benzerliği sağlanmaz.
- `prefers-reduced-motion` dekoratif hareketi kapatır.
- Sahte reyting, uydurma metrik, olmayan özellik etiketi yasak.
- Modal odak tuzağı, Escape ile kapanış ve kayıt sonrası odağın geri dönüşü korunur.
- Fontlar çevrimdışı çalışır; çalışma anında Google Fonts'a bağımlılık kurulmaz.

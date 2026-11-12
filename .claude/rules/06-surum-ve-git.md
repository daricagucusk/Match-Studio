---
paths:
  - "tools/**/*.cjs"
  - "tools/**/*.py"
  - "package.json"
  - ".github/**/*.yml"
---
# Sürüm ve Git

- Sürüm `package.json` içinde tek yerde; README ve belge sayıları elle uyumlu tutulur.
- `tools/release-security-check.cjs` kaynak ve yayın çıktısında sır arar; CI'da iki kez çalışır.
- `npm audit --audit-level=high` CI kapısıdır; yeni yüksek açık bırakılmaz.
- Paket bütünlüğü: `dist/SHA256SUMS.txt`, `release.json`, service worker manifesti birlikte doğrulanır.
- `git push`, merge, tag ve yayın ayrı yetki ister; otomatik yapılmaz.
- `main`'e birleştirme öncesi CI yeşil olmalı; yerel test uzak CI sonucu yerine geçmez.
- Sürüm denetimine giren dosyalar: kaynak, belge, test, araç ve paylaşılabilir yapılandırma. Makineye özel dosyalar (`tasks.json`, `.mcp.json`, `.codex/`) girmez.

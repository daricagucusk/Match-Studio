---
paths:
  - "src/domain/team-depth.js"
  - "src/domain/lineup.js"
  - "src/domain/team-pitch-analysis.js"
  - "src/team/**/*.js"
  - "src/pitch/**/*.js"
  - "tests/team-role-slots.test.cjs"
---
# Takım derinliği

- Her saha görevi bağımsız kimlik taşır: `<roleCode>:<roleIndex>`.
- Alternatif sayısı sınırsızdır; yapay üst sınır ekleme.
- `slotCandidates` ve `tacticalRoles` geriye uyumlu kalır; eski kayıtlar okunabilmelidir.
- Kimlik üretimi yalnız `src/domain/team-depth.js` içindedir.
- Davranış değişikliğinde önce `tests/team-role-slots.test.cjs` içinde kırılan testi yaz.

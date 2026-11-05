# Match Studio F.19 RC1 — Agent Handoff

Date: 2026-11-05. Source of truth: audited F.18 web release 6470d9e. Working branch: feat/f19-position-roles-20261105. Active local worktree:
`C:\Users\aearo\Documents\MatchStudio-Android-Release-Candidate\F19-role-console-worktree`.
The original (dirty) D:\beyin2 development directory must not be overwritten, cleaned or reset.

## User intent (ordered)
1. Team Depth: Every position should list ALL players able to play there. Show first choice and second choice prominently, all further alternatives without limit; no fabricated skill ranking.
2. Each tactical formation slot independent. LCB / RCB, LCM / RCM and separate midfield assignments. Football Manager-like named tactical roles in Turkish with an explanatory description. User edits rank explicitly.
3. Live Match clock: The pitch was too small in the 1600x900 image; enlarge but retain running clock, score, goal/cards, substitutions and comments on a single usable coach screen, including phone and Fold.
4. Pitch Formation: Choosing players must not jump the scroll position or move player icons; preserve screen and nested list scrolls and keyboard focus.
5. Preserve every club, athlete, match, offline, backup, privacy and Google Play behavior, and write decision docs.

## Implementation contracts
- `src/domain/team-depth.js` `TEAM_ROLE_PROFILES`, `slotCandidates`, `tacticalRoles`, `getTeamSlotKey`/ `getSlotKey`, `getSlotIdentity`, `setTeamSlotPlayer`, `moveTeamSlotCandidate`, `setTeamTacticalRole`.
- `teamDepth:<groupId>` legacy stored record still valid. `roles.CB` remains fallback for any slot without explicit `slotCandidates.CB:0`. Empty slot list explicitly means no candidates. No IndexedDB schema migration needed.
- `src/domain/team-pitch-analysis.js`: `slots` includes keys, left/right labels, selected tactical role and unlimited candidates. Deterministic matching ensures an athlete fills at most one slot, including second choices.
- `src/team/team-pitch.js`: left visual pitch buttons and detailed role rows. Each instance has `data-team-slot="CB:0"` etc. Detailed row shows all alternatives; not just first two.
- `src/app/views/team-analysis.js`: role selector and checkbox/up-down candidate editor. Explicit `data-team-slot-key` is needed for the default (initially implicit) selected goalkeeper slot.
- `src/main.js`: role edits are saved only on user change, with `persistTeamDepth`; no name/skill inference; separate from official roster.
- `src/app/render-coordinator.js`: preserve nested scrollTop/scrollLeft and focus with preventScroll; do not force scrollIntoView on selecting pitch players.
- `web/matchstudio-premium-next.css`: increase live field to roughly 48dvh desktop, preserve fold/mobile responsive layout. Use original logo, colors and bundled fonts.
- `docs/F19-COACH-POSITION-ROLES-SPEC.md`: user-accepted requirement contract.
- `docs/design/F19/DESIGN.md`: on-brand UI details.
- `docs/superpowers/plans/2026-11-05-f19-position-roles-console.md`: actionable steps for other coding agents.
- **Never embed player identity or real club data inside tests or documentation.** Tests use dummy "Oyuncu" records and separate browser storage.

## Testing and acceptance
```powershell
cd "C:\Users\aearo\Documents\MatchStudio-Android-Release-Candidate\F19-role-console-worktree"
npm ci --no-audit --no-fund
npm test
$env:MATCHSTUDIO_TEST_PORT='8933'
npx playwright test tests/browser/f19-coach-position.spec.cjs --reporter=line
npm run build:vercel
```
Tests include independent CB/CM roles, 3rd+ candidates, persistence, pitch scroll, one-screen live controls and viewport safety. The complete Playwright suite may be long; do not claim it passed unless test output states so. Real Galaxy Z Fold7 device acceptance is distinct from Playwright emulation.

## Release safety
- Do not replace live F.18 production until all regressions pass.
- Never commit keystores, DPAPI credentials, `.codex`, `.claude` local settings, browser profiles or real player data.
- Real Google Play assetlinks must remain `/.well-known/assetlinks.json`, package `com.matchdaystudio.app` and SHA256 `49:8F:91:FC:D8:4F:80:11:88:F0:1D:E9:24:2B:B5:6D:7C:33:D6:E7:31:F5:C7:CE:02:B6:2C:B7:82:90:C0:4F`.
- To deploy: verify GitHub main SHA and Vercel production ID first; publish tested commit by regular fast-forward only (no force push); inspect live HTTPS, PWA service worker, JSON and Google Digital Asset Links.
- Vercel project `prj_Ys50DxhbfZRafC7hsBBdW5GXvb7f`, `https://match-studio-telefon.vercel.app`. F.18 rollback release `dpl_3mZM861LrZGvEShDx3df6fgjr5Nc`.
- Store/Android signed AAB unchanged and not automatically reissued by web updates.

## Next development requests
Do not infer any Football Manager proprietary player attributes, copyrighted club databases, player skills, scouting scores or predictive rankings; tactical role labels are ordinary football concepts selected by coach.

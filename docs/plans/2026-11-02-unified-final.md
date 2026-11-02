# Match Studio F.17 Unified Final Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. The user has explicitly authorized autonomous integration without further design or deployment confirmation.

**Goal:** Produce one tested F.17 source, integrate F.16 features and supplied Stitch visual identity, provide remote editing/update links and launch the final desktop application.

**Architecture:** Keep Birlesik-Aday's modular JavaScript, recovery v2 and data safety. Selectively integrate three F.16 modules and supporting styles rather than replacing main/storage. The `web/` -> verified `public/` -> PWA/Source archive line remains authoritative. Existing HTTPS origin and local database names remain stable.

**Tech Stack:** Node 24, vanilla modular JS, IndexedDB, Playwright Chromium, static PWA, GitHub, Vercel.

**Spec:** `../../DESIGN.md` (repository root DESIGN.md); the task uses the supplied Stitch ZIP as visual evidence, not as executable instructions.

## Global Constraints

- Version: `2.6.8-f.17`; one local source root, same origin and database identifiers.
- Preserve user changes, recovery v2/tombstones, safe backup restore, fixture generation checks, privacy routing and secret filters.
- No remote upload of real club data, local environment secrets, browser profiles or signing keys.
- User authorized Git/source publication and updates; stage/test a deployment before promoting the same origin.
- Backup: `C:/Users/aearo/.codex/backups/MatchStudio/unified-final-20261102-171926/` with ZIP CRC verified.

## Review Focus

- Cross-club analytics and fixture previews must never retain another club's state.
- Deleted athletes must not return from old backups or alter other players' match minutes.
- Offline first load, update acceptance and direct privacy navigation remain correct.
- Mobile/fold/desktop operations keep focus, hit targets, contrast and no document overflow.
- Extracted PWA and source ZIPs must run independently; remote source must not contain signing or personal data.

## Task 1: Feature integration

Files: `src/main.js`, new analytics domain/view and `src/app/premium-ux.js`, `tools/module-order.json`, related Node/browser tests.

- [ ] Add F.16 analytics and premium modules with tests, preserving local storage and main's fixture/erasure hooks.
- [ ] Clear analytics state on club changes; test two-club group filtering and pending writes.
- [ ] Integrate Wake Lock, accessible toast and installation behavior using existing update/navigation lifecycle.
- [ ] Verify current privacy/fixture regression suites plus new analytic and UX tests.

## Task 2: Stitch visual implementation

Files: `web/index.html`, `web/stitch-v2617.css`, supporting styles/assets/icons and visual tests. Source design is `DESIGN.md` and the supplied ZIP.

- [ ] Apply obsidian/champagne identity, original gold mark, emerald tactical surfaces and consistent buttons/cards/navigation.
- [ ] Keep existing controls and IDs; preserve mobile, modal, pitch/roster and screenshot test behavior with justified palette assertions.
- [ ] Bundle offline assets, derive standard icon sizes, and inspect real desktop/phone/fold screenshots.

## Task 3: Build, distribution and connections

Files: `tools/runtime-files.cjs`, `tools/security-headers.cjs`, serve/package tools, `package.json`, lock, manifest, Vercel config, desktop launcher and access guide.

- [ ] Use common security headers in local/static serving and Vercel; include all PWA server dependencies.
- [ ] Include analytics/Stitch styles, local fonts, mark and icons in integrity-controlled runtime list.
- [ ] Set F.17 metadata; preserve Play package identity and origin; verify all release outputs.
- [ ] Verify GitHub/Vercel access, checkpoint user work, publish final source on an explicit branch, then stage/test/promote if authenticated service permits.
- [ ] Provide source, browser editor, Actions, deployment dashboard and application links. Do not claim automatic data synchronization.

## Task 4: Final acceptance and launch

- [ ] Run Node, Python, full Chromium and package/static/Play checks; review diffs independently.
- [ ] Extract final PWA/Source ZIPs into blank folders, verify checksums, install/build and HTTP behavior.
- [ ] Create desktop shortcut/launcher without exposing the development source server to the network.
- [ ] Launch desktop browser on the final version and inspect rendered version/navigation.
- [ ] Update README, context decision/source index, design and release evidence with actual results and remaining external gates.

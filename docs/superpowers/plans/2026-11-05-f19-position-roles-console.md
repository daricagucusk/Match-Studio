# F.19 Coach Position Roles and Stable Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkboxes for tracking.

**Goal:** Independent tactical roles, unlimited position alternatives, larger one-screen live-match pitch, stable pitch selection.
**Architecture:** Extend existing teamDepth record with slotCandidates and tacticalRoles, augment slot analysis with unique keys; retain legacy roles as fallback. Preserve pitch/scroll/focus across rerenders; adjust responsive CSS without new dependencies.
**Tech Stack:** CommonJS JavaScript, CSS, node:test, Playwright, IndexedDB.
**Spec:** docs/F19-COACH-POSITION-ROLES-SPEC.md

## Global Constraints
Preserve existing club data, current navigation, Google Play assetlinks, storage safety, existing tests. Source release 6470d9e. No fake ratings or players. Use separate worktree.

## Review Focus
- Two stoper roles and two central midfield roles store independent candidate preference and tactical role.
- All candidates past second choice show, no double-counted starters.
- Old depth records still render.
- Pitch players do not jump after selection or scroll reset.
- One-screen live console on desktop and touch-friendly mobile/Fold.

### Task 1: Domain and tests
Files: src/domain/team-depth.js, src/domain/team-pitch-analysis.js, tests/team-role-slots.test.cjs
- [x] Add failing tests for per-slot ordering, tactical-role validation, 3+ alternatives, legacy fallback.
- [x] Run the tests and observe RED.
- [x] Implement optional compatible slot data.
- [x] Run GREEN plus existing unit suite.

### Task 2: UI role cards and actions
Files: src/team/team-pitch.js, src/app/views/team-analysis.js, src/main.js, tests/browser/team-role-slots.spec.cjs
- [x] Add browser assertions for distinct CB/CM slot cards, selection/ranking.
- [x] Add role names/selection controls and unlimited alternatives panel.
- [x] Wire persistence and state without changing players' official main positions.
- [x] Verify with browser test and reset.

### Task 3: Live pitch and scrolling
Files: web/matchstudio-premium-next.css, src/app/render-coordinator.js, tests/browser/f19-field-stability.spec.cjs
- [x] Add measured pitch width and scroll-anchor failing tests.
- [x] Increase field size, preserve one-screen controls.
- [x] Keep scrollTop and DOM focus for pitch and depth lists; ensure stable player coordinates.
- [x] Verify desktop, Fold-open and narrow mobile views.

### Task 4: Documentation and release QA
Files: docs/F19-AGENT-HANDOFF.md, docs/design/F19/DESIGN.md, README.md
- [x] Write field contracts and decision record for other tools.
- [x] Run unit, Playwright and static build; compare output to exact base.
- [x] Inspect Git diff and ensure no private files.
- [ ] Deploy only after passing end-to-end QA. (Kiler açık: yayına geçiş ayrı yetkidir; yerel kabul tamamlandı — 6 Kasım 2026 Hes. kaydı `docs/history/BIRLESIK-ADAY-20261105.md`.)

# F.19 Security and Release Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Check each gate against actual output.

**Goal:** Harden the F.19 release candidate without changing live production, GitHub main, Play Console, athlete data or the user's existing uncommitted test evidence.

**Architecture:** Reuse the existing Node test/Play preflight/CI pipeline. Add an offline, fail-closed repository secret scanner and run it before CI package upload. Pin the release verification workflow dependencies. Record factual technical and external account blockers.

**Tech Stack:** Node.js 24, node:test, git, GitHub Actions, Vercel static PWA, Play/TWA.
**Spec:** context/hedefler.md; context/kurallar-ve-sinirlar.md; docs/play/GOOGLE_PLAY_RELEASE_PLAN.md.

## Constraints
- Canonical source: Calisma/Birlesik-Tek-Surum; branch work/birlesik-tek-surum-20261105.
- Leave existing evidence/team-depth edits intact.
- Do not reveal, transmit, commit, or echo any API key or private signing material.
- No GitHub main merge, push, Vercel promotion/deploy, Play upload or credential revocation without a verified secure account path and authorization.
- Never mark Play/App Signing credentials or real-device acceptance as verified from project notes alone.

## Review Focus
- An actual credential inside a tracked source file must fail before artifact creation, with no credential bytes shown.
- A private-key file tracked under a misleading name must fail.
- A harmless code sample must not be mislabeled as a real secret.
- Workflow changes must not authorize deploy/write permissions.
- A current Play blocker must not be hidden merely because local tests pass.

### Task 1: Baseline and external dependencies
- [x] Confirm Git branch and preserve existing uncommitted evidence.
- [x] Verify npm audit and current Play readiness.
- [x] Inspect GitHub Secrets by name only and branch protection; Vercel production/preview state.
- [ ] Record remaining account actions without copying credential values.

### Task 2: Release credential gate
**Files:**
- Create: tools/release-security-check.cjs
- Create: tests/release-security-check.test.cjs
- Modify: .github/workflows/verify.yml

**Interface:** CLI exit code 0 for safe tracked source tree, 1 for prohibited path/secret pattern/read failure; output contains only relative file path, line and finding class, never matched values.

- [ ] RED: add tests for string scanner and prohibited tracked file paths.
- [ ] Run new tests to observe expected failure.
- [ ] GREEN: implement minimal scanner with safe default Git root and fail-closed behavior.
- [ ] Run new tests and npm test.
- [ ] Add the scanner plus high-severity dependency audit to release CI; pin third-party actions by reviewed SHA.
- [ ] Verify CI YAML structure and no excessive permissions.

### Task 3: Release gates
- [ ] Run npm run build:vercel, npm test, Playwright full regression, npm run package/release.
- [ ] Run npm run check:play:strict and public URL HEAD/body checks.
- [ ] Verify Git status/diff and document clear GO/NO-GO with external owner actions.
- [ ] Keep Git changes local; do not publish.

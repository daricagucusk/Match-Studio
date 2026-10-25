# Match Studio — Repository working rules

This repository is the canonical source for Match Studio development. The default branch is `main`. Do not treat old conversation ZIP exports as newer than this repository without an explicit comparison of versions, commits and changed files.

## Start every implementation
1. Inspect `README.md`, `package.json`, `docs/RELEASE.md`, `docs/VALIDATION.md`, and the relevant `src/` modules.
2. Inspect the current branch, HEAD, open pull requests, and the relevant GitHub Actions results.
3. Report the exact baseline commit and version. Use the package.json version only when verified from the current commit; do not infer a deployed version from stale release notes.
4. Create a task-specific branch and open a pull request. Do not edit or merge `main` directly without explicit user approval, passing release CI, code review and branch protection. The integration branch is not production.

## Preserve user data and functionality
- Never use real athletes' or minors' personal records in tests, fixtures, screenshots or commits.
- Do not modify real club IndexedDB data, delete databases, or silently change origin/storage without explicit instructions and a verified backup and migration plan.
- Preserve separate club storage, existing JSON backup compatibility, encrypted backup and recovery, public/private poster separation and offline behavior.
- Preserve flexible 3v3–11v11 formats, including Turkish U11–U12 8v8 played crosswise on half a full-size pitch with goals on opposing touchlines as a configurable layout.
- Preserve live match session/events, clock, substitutions, on-field roster, reports, event corrections, and player-minute accounting.
- When changing schemas, add explicit migration, rollback and backup tests. Do not overwrite historical match events or guess missing match data.

## Code and publishing
- Edit source modules under `src/`. `app.bundle.js` and `sw.js` are build outputs; regenerate through `npm run build`, not manual edits.
- Keep module ordering in `tools/module-order.json` consistent with the loader.
- Before opening a production-ready PR, run `npm ci`, `npm run release`, and `npm run build:vercel`; inspect errors and attach evidence. Unencrypted backup must never replace encrypted export as the default.
- GitHub Actions in `.github/workflows/verify.yml` is the CI gate. A cancelled, skipped, pending or missing run is not a passing check.
- A passing source test does not imply a real Galaxy Z Fold 7 acceptance test. Keep device QA separately tracked in `docs/DEVICE_CHECKLIST.md`.
- Vercel deployment is a separate state from source upload or passing CI; verify the actual production URL and commit before claiming a release.
- Never commit secrets, credentials, access tokens or production personal data.

## Product expectations
Turkish-language UI; mobile-first football-coach workflows; one-hand touch targets; closed/open foldable screens; clear player names; accessible controls; offline first. Preserve the mobile-first Match Studio design system while keeping club colors independent.

## Communication and delivery
For each change provide: baseline SHA, changed modules, migration impact, relevant tests/results, known unverified areas, commit and PR link, and next priority. Keep all major functionality in source control and review changes through PRs.

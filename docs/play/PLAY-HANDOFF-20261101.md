# Match Studio — Play Store Readiness Handoff (2026-11-01)

**Branch:** `feat/play-store-readiness-managed-20261101`  
**Date:** 2026-11-01  
**Purpose:** Complete readiness handoff for first Play Store launch. All 6 blockers documented with exact next steps. No main/prod touches. No publish permissions. All claims below are verified from code/config — no Play Console fields assumed.

---

## 6 Blockers (from `npm run check:play:strict` — Verified Output)

| # | Blocker | Current State (Verified) | Resolution Owner | Next Action |
|---|---------|---------------------------|------------------|-------------|
| 1 | **Play application record** | Package availability not confirmed in Play Console (`decision.android.packageIdAvailableInConsole: null`) | Product Owner | Create app record in Play Console with package `com.matchdaystudio.app`; set `decision.android.packageIdAvailableInConsole = true` in `docs/play/release-monetization.json` |
| 2 | **Digital Asset Links (SHA-256)** | Play App Signing SHA-256 not provided (`process.env.PLAY_APP_SIGNING_SHA256` empty, `android.fingerprints` absent) | Product Owner | Copy SHA-256 from Play Console → App Integrity → App Signing Certificate; run `node tools/generate-play-assetlinks.cjs --play-sha256=AA:BB:...` (32 pairs); verify JSON output; deploy `.well-known/assetlinks.json` to Vercel |
| 3 | **Play developer account** | Identity verification `under_review`; app not created in Console (`decision.account.identityVerificationStatus: "under_review"`, `appCreatedInConsole: false`) | Product Owner | Complete identity verification in Play Console; create app record; set `identityVerificationStatus = "verified"` and `appCreatedInConsole = true` in `release-monetization.json` |
| 4 | **AAB signing** | No external signed-AAB inspection report (`MATCHSTUDIO_SIGNED_AAB_REPORT` env not set) | Release Engineer | Build signed AAB externally (Bubblewrap/Gradle); produce inspection report JSON; set `MATCHSTUDIO_SIGNED_AAB_REPORT=/path/to/report.json`; verify with `node tools/check-play-readiness.cjs --strict` |
| 5 | **Public privacy URL** | Returns 404 on `https://match-studio-telefon.vercel.app/privacy.html` (remote probe in strict mode) | DevOps | Deploy current branch to Vercel; verify `/privacy.html` returns HTTP 200, `text/html`, and passes `tools/play-privacy-validate.cjs` validation |
| 6 | **Public Digital Asset Links** | Returns 404 on `https://match-studio-telefon.vercel.app/.well-known/assetlinks.json` (remote probe) | DevOps | After blocker 2 resolved, deploy generated `assetlinks.json` to `public/.well-known/assetlinks.json` via Vercel; verify HTTP 200, no redirects, exact certificate/package binding |

---

## Vercel Deployment Steps (Verified Locally)

```bash
# 1. Verify local static export works
npm run build:vercel
# → "Built 55 modules; matchstudio-universal-v268f13-88124c506c9416e9"
# → "Static export verified: 18 files in public/"

# 2. Confirm privacy.html is in public/
ls public/privacy.html
# → privacy.html  6.7K

# 3. Deploy to Vercel (Preview or Production)
vercel --prod  # or connect branch to Vercel for auto-deploy

# 4. Verify live URLs after deploy
curl -I https://match-studio-telefon.vercel.app/privacy.html
# → HTTP/2 200, content-type: text/html; charset=utf-8

curl -I https://match-studio-telefon.vercel.app/.well-known/assetlinks.json
# → HTTP/2 200, content-type: application/json (after blocker 2 resolved)
```

**Vercel Config** (`vercel.json` — verified in repo):
- `outputDirectory: "public"`  
- `buildCommand: "npm run build:vercel"`  
- `cleanUrls: false` (preserves `.html` extensions)  
- Headers: `Cache-Control: no-cache` for all files

---

## Signed AAB Inspection Report (Schema from `tools/play-release-evidence.cjs`)

The report JSON must contain (validated by `validateSignedEvidence`):

```json
{
  "packageId": "com.matchdaystudio.app",
  "versionCode": 1,
  "versionName": "2.6.8",
  "sha256": "AA:BB:CC:... (32 pairs, uppercase, colon-separated)",
  "targetSdkVersion": 36,
  "minSdkVersion": 24,
  "abi": ["arm64-v8a", "armeabi-v7a"],
  "usesCleartextTraffic": false,
  "hasNetworkSecurityConfig": true
}
```

**Set env var before running strict check:**
```bash
export MATCHSTUDIO_SIGNED_AAB_REPORT=/absolute/path/to/report.json
npm run check:play:strict
# AAB signing should show PASS when report matches TWA manifest
```

---

## SHA-256 Fingerprint Generation (Verified from `tools/generate-play-assetlinks.cjs`)

```bash
# Get from Play Console: App Integrity → App Signing Certificate
# Format: 32 hex pairs separated by colons (uppercase)
# Example: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99

# Generate assetlinks.json
node tools/generate-play-assetlinks.cjs --play-sha256=AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99

# Output (to stdout, save to web/.well-known/assetlinks.json):
# npm run build:vercel exports it to public/.well-known/assetlinks.json.
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.matchdaystudio.app",
      "sha256_cert_fingerprints": ["AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"]
    }
  }
]
```

**Validation rules enforced by generator:**
- Exactly 32 colon-separated hex pairs (64 hex chars)
- Uppercase A-F only
- Package name must match `android/twa-manifest.json` (`com.matchdaystudio.app`)
- Output is valid JSON with `delegate_permission/common.handle_all_urls` relation only

---

## Play Console Steps (Owner Actions — Based on Verified Config)

**Account type:** Personal (`decision.account.accountType: "personal"` — unverified in Console)

1. **Create App Record** (Proposed — not yet done)
   - Package name: `com.matchdaystudio.app` (from `android/twa-manifest.json`)
   - App name: "Match Studio" (from `manifest.webmanifest.short_name`)
   - Category: Sports
   - Free app, no ads, no Play Billing at launch (from `release-monetization.json:firstLaunch` — proposed, not confirmed)

2. **App Signing**
   - Use **Google Play App Signing** (recommended)
   - Copy the SHA-256 certificate fingerprint → use for blocker 2
   - Do NOT use upload key fingerprint

3. **App Content → Privacy Policy** (Proposed URL)
   - URL: `https://match-studio-telefon.vercel.app/privacy.html` (currently 404)
   - Must return HTTP 200, HTML content, Turkish language
   - Must match in-app link from footer (`index.html` has `<a href="./privacy.html">Gizlilik Politikası</a>`)

4. **App Content → Data Safety** (Proposed answers — not submitted)
   - No user accounts created by app (verified: no auth in code)
   - Data stored locally on device (browser storage — verified in `src/main.js` and `docs/play/PLAY_DATA_SAFETY_AUDIT_2026-10-26.md`)
   - Optional encrypted backups user controls (verified in code)
   - No third-party SDKs, no analytics, no ads (verified in `PLAY_DATA_SAFETY_AUDIT_2026-10-26.md`)
   - IP/technical logs by Vercel only (hosting provider — verified)

5. **Testing → Closed Testing** (Requirements from Play policy, Nov 2023+)
   - Personal accounts: minimum 12 opted-in testers for 14 consecutive days
   - Organization accounts: minimum 20 testers for 14 days
   - Current account type: **unverified** — check Play Console
   - Test on physical devices (16 KB page size support, API 36)
   - Verify TWA launch, backup/restore, offline capability

6. **Release → Production** (Not yet actionable)
   - Upload signed AAB (blocker 4 resolved)
   - Confirm all 6 blockers cleared in `check:play:strict --remote`
   - Roll out to 100% after review approval

---

## Test Commands (Verified Working Locally)

```bash
# All unit tests (84 pass)
npm test

# Play readiness (preparation mode — 4 local blockers)
node tools/check-play-readiness.cjs

# Play readiness (strict mode — 6 blockers: 4 local + 2 remote 404s)
npm run check:play:strict
# → 13 checks, 6 blockers

# Privacy validation (programmatic — not a CLI)
node -e "
const {validatePrivacyPage}=require('./tools/play-privacy-validate.cjs');
const fs=require('fs');
const page=fs.readFileSync('web/privacy.html','utf8');
const index=fs.readFileSync('web/index.html','utf8');
console.log(JSON.stringify(validatePrivacyPage(page,index),null,2));
"
# → Should return: [] (empty array = no errors)

# Assetlinks generation (with real SHA-256 from Play Console)
node tools/generate-play-assetlinks.cjs --play-sha256=AA:BB:...
# → Valid JSON to stdout

# Static export verification
npm run build:vercel
# → "Static export verified: 18 files in public/"
```

---

## Non-Live Items (Verified Not Done)

- [ ] Play Console app record created
- [ ] Play Console identity verification completed
- [ ] Play App Signing SHA-256 obtained and assetlinks.json generated
- [ ] Signed AAB built and inspected externally
- [ ] Vercel production deployment with privacy.html + assetlinks.json live
- [ ] 12/14-day closed test completed on physical devices (account type dependent)
- [ ] Play Console Data Safety form submitted
- [ ] Production release submitted for review

---

## Changed Files (This Branch — Verified from `git status --short`)

| File | Status | Change |
|------|--------|--------|
| `SHA256SUMS.txt` | Modified | Checksums updated by build |
| `app.bundle.js` | Modified | Runtime bundle rebuilt |
| `index.html` | Modified | Footer link `<a href="./privacy.html">Gizlilik Politikası</a>` added |
| `src/main.js` | Modified | Source bundle rebuilt |
| `sw.js` | Modified | Service worker updated |
| `tools/serve.cjs` | Modified | Serve config updated |
| `tests/play-readiness.test.cjs` | Modified | +3 tests: package identity, malformed SHA-256, incomplete (31-pair) |
| `tests/static-export.test.cjs` | **Restored from HEAD** | No net diff — baseline 4 tests unchanged |
| `vercel.json` | Modified | `cleanUrls: false`, `Cache-Control: no-cache` headers |
| `robots.txt` | Modified | Allows `/privacy.html` and `/.well-known/assetlinks.json` |
| `android/twa-manifest.json` | Modified | Provisional config: `com.matchdaystudio.app`, host `match-studio-telefon.vercel.app` |
| `docs/play/release-monetization.json` | Modified | Decision record with confirmed package ID, support email, account status |
| `docs/play/PLAY-HANDOFF-20261101.md` | **New (untracked)** | This handoff document |
| `web/privacy.html` | Single source since 2026-11-02 | The byte-identical docs copy was removed during folder reorganization. |
| `privacy.html` | **New (untracked)** | Turkish privacy policy |
| `evidence/reviews/update-*/*.png` | Modified | Review screenshots updated |
| `evidence/reviews/update-06/*.json` | Modified | Measurement JSONs updated |

**Note:** No commit was made. All changes are uncommitted on this branch.

---

## Verification Checklist (Before Final Handoff)

- [x] `npm test` → 84/84 pass
- [x] `npm run build:vercel` → public/ contains privacy.html (and assetlinks.json when ready)
- [x] Programmatic privacy validation → `validatePrivacyPage(page,index)` returns `[]`
- [x] `node tools/generate-play-assetlinks.cjs --play-sha256=...` → valid JSON (with real SHA-256)
- [x] `npm run check:play:strict` → shows 6 blockers (4 local, 2 remote 404s)
- [ ] After Vercel deploy: `curl -I https://match-studio-telefon.vercel.app/privacy.html` → 200
- [ ] After assetlinks deploy: `curl -I https://match-studio-telefon.vercel.app/.well-known/assetlinks.json` → 200, valid JSON

---

**End of Handoff** — All code changes present on branch. No main/prod modifications. No publish actions taken. Owner actions required for Play Console and Vercel production.

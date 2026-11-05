# Canlı Maç Anlık Aksiyonlar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sahada aksiyon rozetleri ve iki dokunuşlu kayıt ile F.19 canlı maç operasyonlarını hızlandırmak.

**Architecture:** Geçmişi değiştirmeyen pure projection; mevcut `commitSportingEvent` ve `commitSubstitution` atomik APIs; küçük eylem dock'u ve hızlı durum geçişleri.

**Tech Stack:** Vanilla JS / Node test / Playwright / PWA CSS.

**Spec:** docs/superpowers/specs/2026-11-05-live-quick-actions-design.md

## Global Constraints
- F.19 bağlı Git worktree'deki mevcut değişiklikler korunur; önceden alınmış dosya yedekleri geri alınabilir.
- F.18, GitHub main, Vercel ve gerçek kulüp verileri değiştirilmez.
- Önce başarısız test (RED), sonra en küçük kod (GREEN), sonra doğrulama.
- Sınırsız ücretsiz kullanım veya Android fiziksel test doğrulaması iddia edilmez.

## Review Focus
1. Gol düzeltmesiyle bağlı asistin rozetlerden düşmesi → unit.
2. Sarı/kırmızı + iki sarı kartın sayılması ve oyuncu kayıtlarının korunması → unit/browser.
3. Art arda iki dokunmada çift spor olayı oluşmaması → browser.
4. Dönüşü yasak oyuncu için hızlı değişimin gerçekleşmemesi → browser/domain.
5. Telefon ve Fold'da saha ikonu, araç çubuğu ve oyuncu adı alanlarının çakışmaması → browser.

---

### Task 1: Oyuncu olay rozetleri
**Files:** Create `src/domain/live-action-indicators.js`, `tests/live-action-indicators.test.cjs`; modify `tools/module-order.json`, `src/app/views/live-match-clock.js`, `web/matchstudio-premium-next.css`.

**Interfaces:**
- Produces `projectLiveActionIndicators(session,events,report)`: `Record<playerId,{goals,assists,yellow,red,inCount,outCount}>`.
- View consumes projection only; data storage unchanged.

- [x] **Step 1:** Test standard goal/assist/cards/subs and corrected goal no longer counted, then run node --test (RED).
- [x] **Step 2:** Add pure projection, connect to live pitch and bench badges; run unit test (GREEN).
- [x] **Step 3:** Run npm test and inspect CSS layout.

### Task 2: Anında sportif olay, asist ve geri al
**Files:** Modify `src/main.js`, `src/app/views/live-match-clock.js`; create `tests/browser/live-tap-actions.spec.cjs`; adapt legacy quick test.

**Interfaces:**
- Existing `commitSportingEvent({matchId,type,payload,expectedRevision,idempotencyKey})` returns `{event,duplicate}`.
- `quickCommitSporting(type,payload)` keeps one in-flight action and club/match scope.
- `EVENT_CORRECTION` void references last active sportive event.

- [x] **Step 1:** Playwright test yellow/red, goal then assist, quick undo, double click, reload (RED).
- [x] **Step 2:** Implement player menu and quick mode commit using existing append-only transaction; explicit manual edit continues.
- [x] **Step 3:** Run targeted Playwright and existing quick tests (GREEN).

### Task 3: Hızlı değişiklik ve cihaz testleri
**Files:** Modify `src/main.js`, `tests/browser/live-tap-actions.spec.cjs`, CSS.

**Interfaces:** Existing `commitSubstitution` enforces `returnAllowed/noReturn/competitionConfigured` policy.

- [x] **Step 1:** Playwright test two-pick substitution and prohibited return (RED).
- [x] **Step 2:** Implement auto-submit for eligible changes; require manual policy approval for return.
- [x] **Step 3:** Run targeted desktop/phone/fold, npm test, build, relevant F.19 tests.

### Task 4: Delivery and regression
- [x] **Step 1:** Confirm all changed files, HTML/CSS are built; no secret/config modifications.
- [x] **Step 2:** Run broad browser regression and note any unresolved flaky/physical-device risks.
- [x] **Step 3:** Keep unpublished F.19 worktree and write QA results; no Git push or Vercel deployment.

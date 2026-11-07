# Abacus Kredi Kontrollü Ajan Yönlendirici Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match Studio'ya ekonomik otomatik model seçimi, kredi önkontrolü ve sıralı alt ajan handoff mekanizması eklemek.

**Architecture:** CLI temelli, standart Python kütüphaneleriyle tek kullanıcılı yerel yönlendirici; GitHub `[AI DEVIR]` pilotundan tamamen bağımsız. Test ve taslak plan dışında hiçbir side effect varsayılan değil.

**Tech Stack:** Python 3.12, unittest, Abacus AI CLI 2.10.15, Git worktree, Node v+ mevcut npm test.

**Spec:** `docs/superpowers/specs/2026-11-08-abacus-budget-router-design.md`

## Global Constraints
- `D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum` mevcut dosyaları, GitHub main, Vercel production ve Play Console korunur.
- Ek API ücretlendirmesi, `push`, `merge`, `deploy` yok.
- Model çağrısı yalnız `--execute` ile; premium için ayrıca `--allow-premium` gerekir.
- Yeni modül standard library ile çalışır, secrets/logs eklemez.

## Review Focus
1. Kredi ön kontrolünden sonra provider beklenenden pahalı olursa sonraki çağrılar duruyor mu?
2. Bozuk CLI kredi çıktısı veya sağlayıcı hatası ledger'ın güvenilirliğini bozmadan duruyor mu?
3. İzin verilmeyen komut/injection, programdan shell olarak yürütülebiliyor mu?
4. Fable/Opus açık premium izni olmadan seçiliyor mu?
5. Ajan çıktısındaki çok uzun bağlam sonraki aşamada kredi maliyetini arttırıyor mu?

## Task 1: Politika ve karar motoru
**Files:** Create `config/ai-budget-policy.json`, `tools/ai_budget_router.py`, `tools/test_ai_budget_router.py`.
**Interfaces:** `classify_task(text)`, `choose_model(task, role, premium)`, `make_plan(task, premium)`.
- [ ] Kapsamlı model/rol karar testlerini yaz (TDD RED).
- [ ] Testlerin eksik modül/fonksiyon nedeniyle başarısız olduğunu gör.
- [ ] En küçük politika ve karar motorunu ekle (TDD GREEN).
- [ ] Testleri çalıştır ve sonucu doğrula.

## Task 2: Kredi defteri, güvenli yürütme, devir
**Files:** Modify `tools/ai_budget_router.py`, `tools/test_ai_budget_router.py`.
**Interfaces:** `BudgetLedger`, `parse_credits`, `make_prompt`, `run_pipeline`.
- [ ] Kredi/rol devri/secret/CLI yetki sınırı için önce başarısız testler ekle.
- [ ] Çalışma zamanı uygulamasını standard library ile ekle; aylık/günlük rezerv, fail-closed ve atomik defter.
- [ ] Stub ile deterministik testleri ve CLI `--dry-run` ile sıfır kredi çağrısı doğrula.

## Task 3: Güvenli proje entegrasyonu ve kabul
**Files:** Modify `AGENTS.md`, `docs/ai/AI_MODEL_ROUTING.md`; create `docs/ai/ABACUS_BUDGET_ROUTER.md`.
- [ ] Yerel Abacus yolunun GitHub workflow ve JARVIS yapısını değiştirmediğini dokümante et.
- [ ] `py -3 -B -m unittest discover -s tools -p test_ai_budget_router.py -v` çalıştır.
- [ ] `py -3 -B -m unittest discover -s tools -p test_ai_handoff_router.py -v` çalıştır.
- [ ] `npm test` (baseline 131 test), `npm run build`, `git diff --check` doğrula.
- [ ] Sonuçları derleyip yalnız izole dalda sakla; mevcut çalışma ağacı ve production aynı kalır.

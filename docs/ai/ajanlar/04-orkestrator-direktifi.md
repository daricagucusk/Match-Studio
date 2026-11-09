---
kaynak: docs/ai/ajanlar/cikti/03-elestirmen.md (Fable 5.1, CLAUDE_V5_1_FABLE, 2026-11-09)
hedef: docs/ai/ajanlar/02-yazar-kod-plan.md (Opus 5.5) — ikinci tur
karar: KOŞULLU ONAY
---

# Orkestratör Direktifi — Yazar Turu 2

Eleştirmen kararı **KOŞULLU ONAY**. Aşağıdaki 5 düzeltme yapılmadan plan onaylanmış sayılmaz.
Her düzeltme için dosya:satır kanıtı yaz; "beklenen" dilini koru, çalıştırmadığın testi "geçti" deme.
Bu turda da dosya yazma ve komut çalıştırma yok (plan modu).

## Zorunlu düzeltmeler

1. **B1 — satır pinleri.** Üç kanıt satırını yeniden pinle: `src/pwa/service-worker.js:43`,
   `tests/security-headers.test.cjs:30`, `tests/browser/app.spec.cjs:46`. Diff hunk başlıklarını
   gerçek satır numaralarına göre düzelt; kaymış `@@ -29 @@` / `@@ -60,9 @@` başlıklarını kullanma.
2. **B2 — çalışma ağacı sırası.** Madde 7'deki (a) ve (d) commit gruplarını yamalardan **önce**
   öner; yamaları temizlenmiş ağaca uygulanacak biçimde yaz. `app.spec.cjs` hem mevcut a11y
   değişikliklerini hem yamayı taşıdığı için tek başına geri alınamıyor — bunu açıkça yaz.
3. **B4 — seçici kanıtları.** Yama 3'ün seçicilerini `src/app/views/club-records.js:12`
   (`#player-form`, `fullName`, `birthYear`, `shirtNumber`, `name="groups"`) ve `src/main.js:616`
   (`submit-player`) ile tamamla. `validatePlayer` grup onayı zorunluluğunu test akışında denetlediğini yaz.
4. **B6 — perf tanımı.** Madde 3'ü şöyle yeniden yaz: FCP PerformanceObserver (`tools/perf-audit.cjs:27`),
   LCP `getEntriesByType` (`:38`) — ikisi de mevcut; iş yalnız null çıktı denetimi.
5. **B5 — takip maddesi.** Üretim artefaktı `web/sw.js` bağımlılığını "önerilir" değil, numaralı
   takip maddesi olarak plana işle (gitignore'lu üretilmiş dosya; `npm test` build'siz eski artefaktı ölçer).

## Çıktı biçimi

Markdown, en fazla 1.000 kelime. Başlıklar: `Düzeltme Tablosu` (5 satır: bulgu → yapılan → kanıt
dosya:satır), `Güncel Yama Taslakları`, `Doğrulama Planı`, `Takip Maddeleri`.

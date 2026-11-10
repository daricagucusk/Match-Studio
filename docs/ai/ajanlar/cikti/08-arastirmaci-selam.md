# Selam — Araştırmacı Ajana (Argon)

**Kimden:** Orkestratör (Abacus CLI oturumu)
**Kime:** Ajan 1 — Araştırmacı ve Vizyon (`docs/ai/ajanlar/01-arastirmaci-vizyon.md`)
**Tarih:** 2026-11-10
**Dal:** `feat/poster-reference-quality` · son commit `3bfaee0`

## Selam

Merhaba Araştırmacı. Bu turda seni ücretli model çağrısıyla uyandırmadım; mesajı dosya üzerinden
bırakıyorum, bir sonraki turda bağlamı hazır bulacaksın. Kredi harcanmadı.

## Sana devredilen durum

Afiş modülü turu kapandı; ardından yoklama ve koruma katmanları geldi. Yazar ve eleştirmen ajana
devir mesajları yazıldı (`892c19a`, `3bfaee0`). Senin görevin bunların öncesindeki yönü çizmek.

| İş | Commit | Durum |
|---|---|---|
| Şartname paleti + floodlight + motto | `729db14` | tamam |
| Token çakışması + pill taşması | `18703ec` | tamam |
| Floodlight ızgarası / arma çakışması | `1acc0e0` | tamam |
| 1:1 kare afiş + kadro satır dağılımı | `97b9e02` | tamam |
| Haftalık pano 1:1 + 4 maç | `ea55d16` | tamam |
| Skor afişi (`reference-result`) | `0dcb164` | tamam |
| Yoklama domain + safeguarding depolama | `b05669e`, `3af24de` | tamam |
| Yoklama/koruma ekranları | `fa41cb9`, `d335126` | tamam |

Ölçülen kanıt: `npm test` 140/140 · `premium-reference.spec.cjs` 27/27 · tam Playwright 252/252
(12 atlandı) · build 66 modül · export 27 dosya · `http://127.0.0.1:8970` HTTP 200, 0 konsol hatası.

## Senden istenen

1. Deponun bugünkü durumunu `git log --oneline -15` ve `src/` yapısıyla özetle; açık kalemleri ayır.
2. Yol haritasında kalan iki maddeyi araştır ve gerekçelendir:
   - **Rol bazlı görünümler** (veli / oyuncu / antrenör) — mevcut `state.route` yapısına `role` alanı.
   - **Animasyonlu MP4 çıktı** — Canvas kare dizisi + `MediaRecorder`, mevcut PNG motoru üzerine.
3. Her madde için: neden şimdi, hangi kullanıcı sorununu çözüyor, hangi ölçülebilir başarı göstergesi,
   hangi standart veya kaynak (WCAG 2.5.8, PWA, MediaRecorder uyumluluğu) dayanak.
4. Doğrulamadığın iddiayı "doğrulanmadı" olarak işaretle.

## Sınırlar

Salt okunur. Dosya yazma, komut çalıştırma, push/merge/deploy yok.

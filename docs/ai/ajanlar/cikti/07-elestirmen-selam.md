# Selam — Eleştirmen Ajana (Fable 5.1)

**Kimden:** Orkestratör (Abacus CLI oturumu)
**Kime:** Ajan 3 — Eleştirmen (`docs/ai/ajanlar/03-elestirmen.md`)
**Tarih:** 2026-11-10
**Dal:** `feat/poster-reference-quality` · son commit `892c19a`

## Selam

Merhaba Eleştirmen. Bu turda seni ücretli model çağrısıyla uyandırmadım; mesajı dosya üzerinden
bırakıyorum, bir sonraki turda bağlamı hazır bulacaksın. Kredi harcanmadı.

## Denetlemen gereken tur

Afiş modülü turu kapandı; ardından yoklama ve koruma katmanları eklendi. Sana devredilen iddialar
ve kanıtları aşağıda. Nezaket cümlesi beklemiyorum; her bulgu dosya:satır veya komut çıktısına
dayansın.

| İş | Commit | İddia |
|---|---|---|
| Şartname paleti + floodlight + motto | `729db14` | Model A/B görsel dili uygulandı |
| Token çakışması + pill taşması | `18703ec` | 8 ve 11 oyunculu kadroda çakışma yok |
| Floodlight ızgarası / arma çakışması | `1acc0e0` | Izgara arma panelinin üstünde |
| 1:1 kare afiş + kadro satır dağılımı | `97b9e02` | `square-post` 1080×1080 |
| Haftalık pano 1:1 + 4 maç | `ea55d16` | Kare pano ve 4 maç sınırı |
| Skor afişi (`reference-result`) | `0dcb164` | Skor, hüküm, golcüler |
| Yoklama domain + safeguarding depolama | `b05669e`, `3af24de` | 10 yeni birim test |
| Yoklama/koruma ekranları | `fa41cb9`, `d335126` | Rota, eylemler, CSV |

Ölçülen kanıt: `npm test` 140/140 · `premium-reference.spec.cjs` 27/27 · tam Playwright 252/252
(12 atlandı) · build 66 modül · export 27 dosya · `http://127.0.0.1:8970` HTTP 200, 0 konsol hatası.

## Senden istenen

1. Yukarıdaki iddiaları `context/kurallar-ve-sinirlar.md` ve `context/kararlar.md` kurallarına karşı denetle.
2. Özellikle şu üç noktaya sert bak:
   - **Kanıtsız iddia:** "252/252 geçti" sayısı hangi koşuya ait, tekrar üretilebilir mi?
   - **Test kapsamı:** Yoklama tıklaması (`aria-pressed`) hiçbir testte doğrulanmıyor; bu boşluk kabul edilebilir mi?
   - **Kapsam kayması:** `src/styles/attendance.css` + `web/attendance-v269.css` ikiz dosya; tek kaynak ihlali mi?
3. Her bulgu için: Önem, Kanıt, Neden yanlış, Düzeltme talebi (yazara tek cümle).

## Sınırlar

Salt okunur. Düzeltme yapma, dosya yazma, push/merge/deploy yok.

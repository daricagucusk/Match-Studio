# Match Studio — Tek Sürüm Birleştirme ve Yayın Kabulü

**Sürüm dalı:** `release/match-studio-unified-20261025`  
**Hedef:** Tüm güvenli ve doğrulanmış Match Studio kaynak geliştirmelerini tek PWA'da toplamak.  
**Üretim hedefi:** https://match-studio-telefon.vercel.app  
**Kapsam sınırı:** `main` üretimdir; bu dal yalnızca preview üretir.

## Kaynak PR birleştirme durumu

| Kaynak | Kapsam | Bu dalda uygulama kararı |
|---|---|---|
| PR #6 | GitHub → Gemini güvenli görev devri | Ana dalda mevcut; korunur |
| PR #8 | Ücretsiz önce Gemini + OpenRouter failover | Ana dalda mevcut; korunur |
| PR #11 | OpenRouter ücretsiz smoke yönlendirmesi | Ana dalda mevcut; korunur |
| PR #2 | F.12 maç oyuncusu katılımı | PR #14'ten dahil |
| PR #3 | F.13 gol / asist düzeltme | PR #14'ten dahil |
| PR #4 | F.12 / F.13 yayın adayı | İşlevsel karşılığı PR #14'te; ikinci kez birleştirilmez |
| PR #5 | F.14 sade veri aktarımı | Şifreli yedek varsayılanı, kurtarma ve denetim korunarak kullanıcı akışı uyarlanır; şifresiz yedeği öne çıkaran tehlikeli tasarım reddedilir |
| PR #1 | GitHub proje tek kaynak kuralları | AGENTS.md uyarlanarak dahil |
| PR #10 / #13 | Yapay zekâ ajanı tek satırlık smoke testleri | Ayrı taslak PR'larda kalır; runtime özelliği olmadıkları için kaynak işlevlerine kopyalanmaz |
| PR #14 | P0–P2 ana yayın adayı | Bu dalın başlangıç noktası; istatistik, canlı maç, şifreli yedek QA, CSV/XLSX önizleme dahildir |

## P0 / P1 / P2 kalite kapıları

1. **P0 — maç istatistikleri:** Gerçek oyuncu katılımı, gol iptali ve asist düzeltmelerinin sonuç, rapor ve geçmiş verilerde tutarlı olması. Node ve Playwright testleri yeşil olmadan yayın yok.
2. **P0 — veri kurtarma:** Şifreli yedeği başka tarayıcı profilinde açma, oyuncu, grup, maç ve fotoğraf bütünlüğü, yanlış parolanın mevcut kayıtları değiştirmemesi. Sentetik verilerle tam testi geçmeden yayın yok.
3. **P0 — yayın güvenliği:** GitHub Actions release CI, GitHub branch protection ve zorunlu PR review; gerçek üretim commit eşleşmesi.
4. **P1 — mobil saha:** Canlı maç saati, skor, düzeltme, oyuncu değişikliği ve tek el gezinmesi. Telefon emülasyonu + fiziksel Galaxy Z Fold7 kabulü.
5. **P1 — ilk kullanım:** İlk kulüp → ilk grup → oyuncu → maç akışı çalışmalı.
6. **P1 — program aktarımı:** CSV/XLSX önizleme; işlem öncesi antrenör onayı ve kulüp/grup uyuşmazlığında atomik ret. **PDF içe aktarma desteklendiğini iddia etmiyoruz**; OCR/PDF doğrulaması ayrı.
7. **P2 — sezon/performans:** Sezon devri veya büyük sürüm göçü ancak şema, yedek ve geri dönüş testi ile; mevcut sistemde doğrulanmadı.

## Uyumluluk ve geri dönüş

- Uygulama verileri yerel IndexedDB'dedir. Üretim origin'i aynı kalmalı ve veriler hiçbir zaman otomatik silinmemelidir.
- Kullanıcı aktarımı için mevcut şifreli JSON yedekleri ve eski sürüm uyumluluğu korunur.
- Build çıktıları kaynaktan üretilir; `app.bundle.js`, `sw.js`, `dist/` elle değiştirilmez.
- CI başarı durumu tek başına gerçek cihaz veya veri kurtarma kabulü değildir.
- Yayın öncesi ayrı tarayıcı profili ve gerçek cihazda yedek geri yükleme doğrulanmalı; olumsuz sonuçta `main` değişmemeli.
- Üretim dağıtımı/rollback ancak testler ve kullanıcı onayıyla yapılır.

## Yayın karar matrisi

- **CI başarısız / eksik** → Taslak PR. Production yok.
- **CI başarılı, fiziksel cihaz kabulü veya branch protection eksik** → Test edilmiş preview; production için açık kalite kapısı.
- **CI, şifreli veri kurtarma, gerçek cihaz ve dal koruması doğrulandı** → Korumalı main PR inceleme/onarımı, ardından Vercel production commit doğrulaması.

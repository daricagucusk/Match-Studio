# Korunan kan�tlar

Bu klas�r ge�mi� inceleme ve teslim kay�tlar�n� i�erir. Dosyalar g�ncel test ��kt�s� veya canl� yay�n kabul� say�lmaz.

| Konum | �nceki konum | ��erik |
|---|---|---|
| `baseline/` | Proje k�k�ndeki `baseline/` | �nceki kaynak k�keni ve tarihsel kay�t; release testleri sentetik ar�iv kullan�r |
| `reviews/` | Proje k�k�ndeki `reviews/` | Tarihli ekran g�r�nt�leri, �l��mler ve inceleme notlar� |
| `deployments/` | Proje k�k�ndeki `deployments/` | �nceki da��t�m kay�tlar� |

2 Kas�m 2026 ta��mas� s�ras�nda bu dosyalar�n i�eri�i korunmu�tur. �nceden de�i�tirilmi� g�rseller de mevcut halleriyle ta��nm��t�r. ��lerinde yazan eski dosya yollar� tarihsel kay�t olarak b�rak�lm��t�r.

Yeni otomatik ekran g�r�nt�leri ve �l��mler `test-results/reviews/` i�ine, ma�aza g�rselleri `dist/store-listing/` i�ine �retilir. �nceleme sonucunu kal�c� kan�t olarak saklamak gerekiyorsa tarihli bir alt klas�re se�erek al�n; b�t�n test ��kt�lar�n� buraya kopyalamay�n.

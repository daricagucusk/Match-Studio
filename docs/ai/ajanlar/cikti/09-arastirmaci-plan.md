








## Hedef
`feat/poster-reference-quality` üzerinde iki yol haritası maddesini (rol bazlı görünümler, animasyonlu MP4 çıktı) yazma yetkisi olmadan planlamak; her adımı dosya:satır ve doğrulama komutuyla bağlamak. Bu turda hiçbir komut çalıştırılmadı, hiçbir test sonucu iddia edilmiyor.

## Adımlar

1. **Taban çizgisi ve kırmızı test.** Önce `tests/security-headers.test.cjs:30` ile `src/pwa/service-worker.js:43` (`device-test.html` istisnası) çelişkisini kapat; aksi halde yeni işler kırmızı tabana biner. Doğrulama: `npm test` (yalnız bu dosya yeşile dönerse ilerle).

2. **Rol modeli (saf domain).** Yeni `src/domain/role-view.js`: `coach|player|guardian` sabitleri, rol→izinli rota listesi, `navForRole(role)` saf fonksiyonu. `tools/module-order.json` içine `src/domain/role-view.js` kaydı (mevcut `src/domain/*` bloğu, satır 12-33). Doğrulama: yeni `tests/role-view.test.cjs` + `npm test`.

3. **Durum ve kalıcılık.** `src/main.js:132` tek satırlık `state` nesnesine `role:'coach'` ekle; rol seçimi mevcut `settings` kaydına yazılsın (`src/storage/db.js` settings store, `src/main.js:698` çevresindeki ayar yazma deseniyle). Doğrulama: birim testte `state.role` varsayılanı ve geri yükleme; `npm test`.

4. **Rota kapısı.** `selectRoute` (`src/main.js:336`) başına rol kontrolü: izinsiz rota `dashboard`'a düşsün ve `toast` ile gerekçe göstersin. `render` switch'i (`src/main.js:372`) değişmez; filtre yalnız kapıda. Doğrulama: birim testte her rol için izinli/izinsiz rota matrisi.

5. **Gezinme ve rol seçici UI.** Nav dizileri `src/main.js:345-347`, `navLink` `src/main.js:348`; rol seçici `src/app/views/club-records.js:7-8` ayar kartı bölgesine. `subtitle` haritası (`src/main.js:343`) rol etiketiyle genişletilir. Doğrulama: `tests/browser/role-views.spec.cjs` — her rolde görünen nav sayısı ve gizli rotaya `data-nav` ile gidişin engellendiği.

6. **MP4 motoru.** Yeni `src/posters/video-export.js`: `renderPoster` (`src/posters/renderer.js:47`) kare kare çağrılır, `canvas.captureStream()` + `MediaRecorder` ile blob üretir; kodlama desteği yoksa `null` döner (çökme yok). `tools/module-order.json` kaydı. Doğrulama: birim testte destek yok senaryosunda `null`, destek var senaryosunda blob tipi; `npm test`.

7. **UI bağlantısı.** `src/app/views/media-studio.js:22-23` çıktı çubuğuna "MP4 indir" düğmesi (destek yoksa `disabled` + açıklama); eylem `src/main.js:690` (`export-png`/`share-png` case) yanına `export-mp4`. Dosya adı `src/domain/file-names.js` deseniyle. Doğrulama: `tests/browser/premium-reference.spec.cjs` tarzında canvas `evaluate` ile blob boyutu > 0 ve süre ≈ hedef.

8. **Paket ve birleşik kapı.** `npm run build` (66 modül beklentisi), `npm test`, `npm run test:browser`, son olarak `npm run check`. `npm run check:audit` yalnız ekran denetimi istendiğinde. Doğrulama: dört komutun çıktısı; hiçbiri bu planda çalıştırılmadı.

## Riskler
- **Rol filtresi güvenlik değildir:** veri yerel IndexedDB'de, kimlik doğrulama yok; veli görünümü yalnız sunum filtresi olarak etiketlenmeli, aksi halde yanlış güven üretir.
- **MediaRecorder uyumu:** Safari/iOS'ta `video/mp4` desteği garanti değil; kod çözücü seçimi `MediaRecorder.isTypeSupported` ile yapılmalı, doğrulanmadı.
- **Bellek:** 1080×1920 kare dizisi + kodlayıcı düşük RAM'li cihazda takılabilir; kare sayısı ve süre üst sınırı konmalı.
- **Test kırılganlığı:** `tests/browser/app.spec.cjs` sürükle-bırak kararsızlığı bilinen açık kalem; yeni Playwright testleri bu dosyaya bağlanmamalı.
- **Üretilmiş artefakt:** `web/sw.js` gitignore'lu; `npm test` build'siz eski artefaktı ölçebilir, sıra `build → test` olmalı.

## Doğrulanmamış
Rol/MP4 için mevcut kodda hazır altyapı yok; `state.route` dışında rol alanı, `MediaRecorder` kullanımı ve MP4 testi bulunmuyor (grep sonucu). Test sayıları (140/140, 252/252) önceki ajan raporundan alınmadı, bu turda doğrulanmadı.


model: ROUTE_LLM | cwd: D:\beyin2\Projeler\MatchStudio\Calisma\Birlesik-Tek-Surum | conversation: 10e955ea37
title: Araştırmacı Vizyon Planı
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/C)
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/c)
  ● Bash(command="cd 'D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Sur)
  ✗ Bash declined: blocked by the deny rule Bash
  ● Glob(pattern="docs/ai/**/*.md", path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum")
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/c)
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/c)
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/d)
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/d)
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/d)
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/d)
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/d)
  ● Grep(pattern="route|routes", path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/s)
  ● Glob(pattern="src/**/*.js", path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum")
  ● Grep(-n=true, head_limit=40)
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/s, start_line=336)
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/p)
  ● Grep(-n=true, head_limit=30)
  ● Glob(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum", pattern="tests/**/*.cjs")
  ● Glob(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum", pattern="docs/{plans,audit}/**/*.md")
  ● Grep(-n=true, head_limit=25)
  ● Grep(-n=true, head_limit=40)
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/s, start_line=1)
  ● Read(path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/s, start_line=1)
  ● Grep(-n=true, head_limit=20)
  ● Read(end_line=60, path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/t)
  ● Read(end_line=40, path="D:/beyin2/Projeler/MatchStudio/Calisma/Birlesik-Tek-Surum/s)
Credits used: 41.25

To resume Session:
abacusai -p --resume 10e955ea37

# Proje Özeti

Bu dosya projenin ne olduğunu, neden var olduğunu, kapsamını ve mevcut durumunu açıklar.

## Projenin adı

Match Studio — yerel aday paket sürümü `2.6.8-f.19-rc.1`.

## Kısa tanım

Çevrimdışı çalışabilen kulüp, grup, sporcu, kadro, canlı maç ve afiş yönetimi web uygulaması. Şifreli yedekleme ve geri yükleme içerir.

## Ana amaç

Kulübün maç öncesi hazırlık, saha operasyonu ve maç sonrası kayıt işlerini aynı yerel uygulamada yürütmek.

## Kapsama dahil olanlar

PWA kaynakları, veri koruma modülleri, Node/Chromium testleri, güvenli paketleme araçları ve Android TWA hazırlık metadata dosyası.

## Kapsam dışında kalanlar

Başka Match Studio kopyaları, uzaktaki main, canlı Vercel ve Play Console bu yerel klasörle aynı durum sayılmaz. Klasör düzenlemesi yayın veya gerçek cihaz kabulü içermez.

## Mevcut durum

`Calisma/Birlesik-Tek-Surum` 5 Kasım 2026'da F.18 temeli üzerine F.19 geliştirmeleri ve yedek önizlemesi eklenerek oluşturulan yerel çalışma adayıdır. Testler ve açık sınırlar `docs/BIRLESIK-ADAY-20261105.md` içindedir. Bu adayın yerel durumu GitHub main veya canlı yayınla aynı sayılmaz. Eski kabul raporları tarihsel kanıttır.

7 Kasım 2026: F.19 için imzalı upload AAB versionCode 2 üretildi; Play App Signing sertifikası assetlinks ve Digital Asset Links API ile doğrulandı. Play Console'a yükleme, 12 testçi/14 gün kapalı test ve üretim erişimi hesap sahibinin işlemleridir. Ayrıntı: `docs/play/PLAY_CONSOLE_READY_2026-11-07.md`.

## Önemli konumlar

Başlangıç: `README.md`. Mimari: `docs/STRUCTURE.md`. Belgeler: `docs/README.md`. Kod: `src/`. Web kaynakları: `web/`. Araçlar: `tools/`. Testler: `tests/`. Geçmiş kanıtlar: `evidence/`. Üretilen dosyalar: `public/`, `dist/`, `test-results/`.


Birleşik F.17: mevcut kulüp/veri korumaları korunarak F.16 sezon analitiği ve premium davranışları, Stitch altın/obsidyen tasarımı ve ortak güvenlik başlıkları birleştirildi. Erişim ve güncelleme: docs/guides/ERISIM_VE_GUNCELLEME.md. Test/yayın kanıtları docs/FINAL-F17-20261102.md içinde tutulur.

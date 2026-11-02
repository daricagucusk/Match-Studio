# Proje Özeti

Bu dosya projenin ne olduğunu, neden var olduğunu, kapsamını ve mevcut durumunu açıklar.

## Projenin adı

Match Studio — paket sürümü `2.6.8-f.17`.

## Kısa tanım

Çevrimdışı çalışabilen kulüp, grup, sporcu, kadro, canlı maç ve afiş yönetimi web uygulaması. Şifreli yedekleme ve geri yükleme içerir.

## Ana amaç

Kulübün maç öncesi hazırlık, saha operasyonu ve maç sonrası kayıt işlerini aynı yerel uygulamada yürütmek.

## Kapsama dahil olanlar

PWA kaynakları, veri koruma modülleri, Node/Chromium testleri, güvenli paketleme araçları ve Android TWA hazırlık metadata dosyası.

## Kapsam dışında kalanlar

Başka Match Studio kopyaları, uzaktaki main, canlı Vercel ve Play Console bu yerel klasörle aynı durum sayılmaz. Klasör düzenlemesi yayın veya gerçek cihaz kabulü içermez.

## Mevcut durum

`Calisma/Birlesik-Aday` seçilmiş yerel çalışma kaynağıdır. 2 Kasım 2026'da web girdileri, üretilen çıktılar, belgeler ve geçmiş kanıtlar ayrılmıştır. Güncel yerel doğrulama ve sınırlar: `docs/REORGANIZATION-20261102.md`. Eski kabul raporları tarihsel kanıttır.

## Önemli konumlar

Başlangıç: `README.md`. Mimari: `docs/STRUCTURE.md`. Belgeler: `docs/README.md`. Kod: `src/`. Web kaynakları: `web/`. Araçlar: `tools/`. Testler: `tests/`. Geçmiş kanıtlar: `evidence/`. Üretilen dosyalar: `public/`, `dist/`, `test-results/`.


Birleşik F.17: mevcut kulüp/veri korumaları korunarak F.16 sezon analitiği ve premium davranışları, Stitch altın/obsidyen tasarımı ve ortak güvenlik başlıkları birleştirildi. Erişim ve güncelleme: docs/guides/ERISIM_VE_GUNCELLEME.md. Test/yayın kanıtları docs/FINAL-F17-20261102.md içinde tutulur.

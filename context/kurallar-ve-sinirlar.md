# Kurallar ve Sınırlar

Bu dosya projede her zaman dikkate alınması gereken kalıcı kuralları, sınırları ve yasakları içerir.

## Zorunlu kurallar

- Çalışmaya başlamadan doğru çalışma ağacını, dalı ve mevcut değişiklikleri kontrol et; kullanıcı çalışmalarını koru.
- Uygulama kaynaklarını `src/` ve `web/` altında düzenle; üretilen dosyaları elle değiştirme. Dosya sorumlulukları: `../docs/STRUCTURE.md`.
- Kulüp ayrımını, yerel verileri ve yedekleme/kurtarma korumalarını koru; kritik değişiklikleri kapsamına uygun şekilde doğrula.

## Yapılmaması gerekenler

- Gerçek sporcu bilgilerini testlere veya mağaza görsellerine koyma; test ve yayın sonuçlarını doğrulanmadan başarılı gösterme.
- Başka çalışma ağaçlarını, canlı siteyi ve Play durumunu bu klasörle aynı kabul etme.

## Bütçe, süre ve kaynak sınırları

Doğrulanmış sabit bütçe veya son tarih kaydı yoktur. Harcama ve abonelik ayrıca yetkilendirilir.

## Hukuki, güvenlik ve gizlilik sınırları

- Parolaları, anahtarları ve gereksiz kişisel verileri bağlama veya depoya ekleme. Kaynakların orijinallerini koru.
- Tarayıcı verileri adres, port ve profile bağlıdır; veri temizleme veya taşıma işlemlerinde mevcut kayıtları koru.

## Kullanıcı onayı gerektiren işlemler

- Silme, veri kaybı riski taşıyan işlemler, ödeme, dışarıya mesaj gönderme ve yayın için açık yetki gerekir.
- Push, main'e birleştirme, Vercel dağıtımı ve Play yayını ayrıca yetkilendirilir. Yerel testler gerçek cihaz veya Play kabulü değildir. Dayanak: `../README.md`, `../CLAUDE.md`.


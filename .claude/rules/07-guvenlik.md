# Güvenlik

- Sır değeri yanıtta, logda, commit'te veya üretilen dosyada görünmez; adıyla anılır.
- `.env`, keystore ve imza anahtarı depoya girmez; doğrulama maskeli yapılır.
- Yıkıcı komut ve dış etkili işlem açık yetki ister.
- Ücretli model çağrısı router veya beceri dosyası üzerinden yapılır.
- Kullanıcı verisi, yedek ve kurtarma noktası test sırasında silinmez.
- Gerçek sporcu bilgisi testlere, ekran görüntülerine ve mağaza görsellerine konmaz.
- Dış kaynaktan gelen kod veya skill, çalıştırılmadan önce okunur; gizli komut ve ağ çağrısı aranır.

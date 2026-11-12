---
paths:
  - "src/storage/**/*.js"
  - "src/domain/validation.js"
  - "src/domain/workspace-quality.js"
---
# Veri ve depolama

- Kulüp kimliği her yazma işleminde doğrulanır; kulüp değişirse bekleyen işlem iptal edilir.
- Çoklu store işlemi atomiktir; hata hâlinde kısmi kayıt bırakmaz.
- Şema sürümü artırılırsa v1/v2/v3 yedek uyumluluğu korunur ve test eklenir.
- Şifreli yedek AES-GCM'dir; yanlış parola veya bozuk veri mevcut kayıtları değiştirmez.
- Kalıcı silme kurtarma noktasını iptal eder; eski yedek geri yüklenemez.
- Geri yükleme ve kurtarma aynı kulübün yazma işlemleriyle Web Locks üzerinden koordine edilir.
- Kurtarma kopyası kaydedilemezse mevcut kayıtlar silinmez.

const {test,expect}=require('@playwright/test');
const {setup,idle,nav}=require('./live-fixture.cjs');

test('F.14 unified transfer offers encrypted download and preserves recovery controls',async({page})=>{
 await page.goto('/');
 await page.locator('#club-create-form [name=clubName]').fill('Güvenli Aktarım Spor');
 await page.locator('#club-create-form button[type=submit]').click();
 await idle(page);
 await nav(page,'archive');
 const transfer=page.locator('[data-simple-transfer]');
 await expect(transfer).toBeVisible();
 await expect(transfer).toContainText('Verilerini güvenle taşı');
 await expect(transfer.locator('[data-action=backup-export-secure]')).toBeVisible();
 await expect(transfer.locator('[data-action=backup-import]')).toBeVisible();
 // Unencrypted JSON is available only inside explicit compatibility details.
 const legacy=transfer.locator('details');
 await expect(legacy).not.toHaveAttribute('open','');
 await expect(legacy.locator('[data-action=backup-export]')).toBeHidden();
 await expect(page.locator('[data-action=backup-rollback]')).toBeVisible();
 await expect(page.locator('[data-action=integrity-audit]')).toBeVisible();
});

test('archive file picker previews and imports CSV players without changing backup protection',async({page})=>{
 await setup(page);await nav(page,'archive');
 await page.locator('#backup-file').setInputFiles({name:'oyuncular.csv',mimeType:'text/csv',buffer:Buffer.from('Ad Soyad;Doğum Yılı;Forma No;Mevki\nDeneme Oyuncu;2013;9;FW')});
 await expect(page.locator('#csv-review')).toContainText('1 geçerli kayıt');
 await page.locator('#csv-confirm').click();await idle(page);await nav(page,'players');
 await expect(page.locator('body')).toContainText('Deneme Oyuncu');
});

test('oversized CSV player intake fails closed before the file is read',async({page})=>{
 await setup(page);await nav(page,'archive');
 await page.locator('#backup-file').setInputFiles({name:'oyuncular-buyuk.csv',mimeType:'text/csv',buffer:Buffer.alloc(5*1024*1024+1,0x41)});
  await expect(page.locator('.toast')).toContainText('5 MB sınırını aşıyor');
  await expect(page.locator('#csv-review')).toHaveCount(0);
});

test('an invalid CSV is previewed as zero rows and never enables confirmation',async({page})=>{
 await setup(page);await nav(page,'archive');
 await page.locator('#backup-file').setInputFiles({name:'bozuk.csv',mimeType:'text/csv',buffer:Buffer.from('Bozuk;Veri\nDeneme;2000')});
 await expect(page.locator('#csv-review')).toContainText('0 geçerli kayıt');
 await expect(page.locator('#csv-confirm')).toBeDisabled();
});

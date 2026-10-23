const {test,expect}=require('@playwright/test');
const {setup,idle,nav}=require('./live-fixture.cjs');

const technical=/\b(JSON|CSV|PWA|HTTPS|localhost|IndexedDB|AES(?:-GCM)?|origin|schema|PNG|WEBP|JPEG|veritabanı|sunucu)\b|yerel (?:kayıt|veri|kurtarma)|kayıt bütünlüğü/i;

test('coach sees one simple place to download or load club data',async({page})=>{
 await setup(page);await nav(page,'archive');
 const card=page.locator('[data-simple-transfer]');
 await expect(card).toBeVisible();
 await expect(card.getByRole('button',{name:'Yedeği indir'})).toBeVisible();
 await expect(card.getByRole('button',{name:'Dosyadan yükle'})).toBeVisible();
 await expect(page.locator('[data-action=backup-export-secure]')).toHaveCount(0);
 await expect(page.locator('[data-action=backup-confirm]')).toHaveCount(0);
 await expect(page.locator('[data-action=integrity-audit]')).toHaveCount(0);
 await expect(page.locator('body')).not.toContainText(technical);
 await nav(page,'players');
 await expect(page.locator('[data-action=csv-import]')).toHaveCount(0);
});

test('one load button restores a downloaded club backup without a password',async({page})=>{
 await setup(page);await nav(page,'archive');
 const downloadEvent=page.waitForEvent('download');
 await page.getByRole('button',{name:'Yedeği indir'}).click();
 const download=await downloadEvent,filename=await download.path();await idle(page);
 expect(download.suggestedFilename()).toMatch(/YEDEK/);
 const chooserEvent=page.waitForEvent('filechooser');
 await page.getByRole('button',{name:'Dosyadan yükle'}).click();
 await (await chooserEvent).setFiles(filename);
 await expect(page.locator('[data-backup-review]')).toContainText('4 oyuncu');
 await page.getByRole('button',{name:'Yüklemeyi tamamla'}).click();await idle(page);
 await expect(page.locator('.toast')).toContainText('Kayıtlar yüklendi');
});

test('the same load button recognizes a player list and asks only for the team',async({page})=>{
 await setup(page);await nav(page,'archive');
 const chooserEvent=page.waitForEvent('filechooser');
 await page.getByRole('button',{name:'Dosyadan yükle'}).click();
 await (await chooserEvent).setFiles({name:'oyuncular.csv',mimeType:'text/csv',buffer:Buffer.from('Ad Soyad;Doğum Yılı;Forma No;Mevki\nYeni Oyuncu;2013;9;FW')});
 await expect(page.getByRole('heading',{name:'Oyuncuları ekle'})).toBeVisible();
 await expect(page.locator('#import-group')).toHaveValue('g1');
 await page.getByRole('button',{name:'Oyuncuları ekle'}).click();await idle(page);
 await expect(page.locator('.toast')).toContainText('1 oyuncu eklendi');
 await nav(page,'players');await expect(page.locator('.player-list')).toContainText('Yeni Oyuncu');
});

test('technical implementation words are absent from normal screens',async({page})=>{
 await page.goto('/');
 await expect(page.locator('body')).not.toContainText(technical);
 await page.locator('#club-create-form [name=clubName]').fill('Sade Spor');
 await page.locator('#club-create-form button[type=submit]').click();await idle(page);
 for(const route of ['dashboard','players','matches','team','weekly','archive']){
  await nav(page,route);await expect(page.locator('body'),route).not.toContainText(technical);
 }
});

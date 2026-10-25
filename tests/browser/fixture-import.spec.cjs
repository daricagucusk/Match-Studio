const {test,expect}=require('@playwright/test');
const {idle,nav}=require('./live-fixture.cjs');

async function start(page){
 await page.goto('/');
 await page.locator('#club-create-form [name=clubName]').fill('CSV Kontrol Spor');
 await page.locator('#club-create-form button[type=submit]').click();await idle(page);
 await page.locator('#group-form [name=name]').fill('U14');
 await page.locator('#group-form button[type=submit]').click();await idle(page);
 await nav(page,'weekly');
 await page.locator('#weekly-import-heading').click();
}
async function upload(page,content){
 await page.locator('#weekly-import-file').setInputFiles({
  name:'fixture-test.csv',mimeType:'text/csv',buffer:Buffer.from(content,'utf8')
 });
 await idle(page);
}
test('P1: fixture preview requires coach approval and creates no records until confirmed',async({page})=>{
 await start(page);
 await upload(page,'Grup;Rakip;Tarih;Saat;Saha\nU14;Sahil Spor;08.11.2026;14.30;Merkez Stadı');
 await expect(page.locator('.weekly-import-preview')).toContainText('1 geçerli maç');
 await expect(page.locator('.weekly-import-preview')).toContainText('2026-11-08');
 await expect(page.locator('.weekly-roster')).toContainText('Henüz');
 page.once('dialog',d=>d.dismiss());
 await page.locator('[data-action=weekly-import-confirm]').click();await idle(page);
 await expect(page.locator('.weekly-import-preview')).toBeVisible();
 page.once('dialog',d=>d.accept());
 await page.locator('[data-action=weekly-import-confirm]').click();await idle(page);
 await expect(page.locator('.weekly-roster')).toContainText('Sahil Spor');
 await expect(page.locator('.weekly-import-preview')).toHaveCount(0);
});
test('P1: wrong or conflicting team refuses entire file and leaves matches unchanged',async({page})=>{
 await start(page);
 await upload(page,'Grup;Rakip;Tarih;Saat;Saha\nU15;Yanlış Grup;08.11.2026;14:30;Saha');
 await expect(page.locator('.weekly-import-preview')).toContainText('1 geçerli maç');
 await page.locator('[data-action=weekly-import-confirm]').click();await idle(page);
 await expect(page.locator('.toast')).toContainText('takım bulunamadı');
 await expect(page.locator('.weekly-roster')).toContainText('Henüz');
});

const {test,expect}=require('@playwright/test');
const {idle,nav}=require('./live-fixture.cjs');

async function createClub(page,name){
 const form=page.locator('#club-create-form:visible');
 await form.locator('[name=clubName]').fill(name);
 await form.locator('button[type=submit]').click();
 await idle(page);
}
async function createGroup(page){
 const form=page.locator('#group-form:visible');
 await form.locator('[name=name]').fill('U14');
 await form.locator('button[type=submit]').click();
 await idle(page);
}
async function switchClub(page,name){
 const select=page.locator('#club-switch:visible,#club-switch-mobile:visible').first();
 await select.selectOption({label:name});
 await idle(page);
}
async function uploadFixture(page){
 await nav(page,'weekly');
 await page.locator('#weekly-import-heading').click();
 await page.locator('#weekly-import-file').setInputFiles({
  name:'kocaeli-fixture.csv',mimeType:'text/csv',
  buffer:Buffer.from('Grup;Rakip;Tarih;Saat;Saha\nU14;Yanlis Kulup Maci;08.11.2026;14.30;Merkez','utf8')
 });
 await expect(page.locator('.weekly-import-preview')).toContainText('1 geçerli maç');
}

test('P0: unconfirmed fixture from club A never appears or writes in B sharing same group name',async({page})=>{
 await page.goto('/');
 await createClub(page,'Kulüp A Test');
 await createGroup(page);
 await nav(page,'archive');
 await page.locator('.ms-manager-details summary').filter({hasText:'Yeni kulüp oluştur'}).click();
 await createClub(page,'Kulüp B Test');
 await createGroup(page);
 await switchClub(page,'Kulüp A Test');
 await uploadFixture(page);
 await switchClub(page,'Kulüp B Test');
 await nav(page,'weekly');
 await expect(page.locator('.weekly-import-preview')).toHaveCount(0);
 await expect(page.locator('[data-action=weekly-import-confirm]')).toHaveCount(0);
 await page.locator('#weekly-range').selectOption('all');
 await expect(page.locator('.weekly-roster')).toContainText('Bu aralıkta kayıtlı maç yok');
 await switchClub(page,'Kulüp A Test');
 await nav(page,'weekly');
 await expect(page.locator('.weekly-import-preview')).toHaveCount(0);
 await page.locator('#weekly-range').selectOption('all');
 await expect(page.locator('.weekly-roster')).toContainText('Bu aralıkta kayıtlı maç yok');
});

test('P0: club switch while fixture file is still being read discards delayed preview',async({page})=>{
 await page.goto('/');
 await createClub(page,'Kulüp A Yavaş');
 await createGroup(page);
 await nav(page,'archive');
 await page.locator('.ms-manager-details summary').filter({hasText:'Yeni kulüp oluştur'}).click();
 await createClub(page,'Kulüp B Yavaş');
 await createGroup(page);
 await switchClub(page,'Kulüp A Yavaş');
 await nav(page,'weekly');
 await page.locator('#weekly-import-heading').click();
 await page.evaluate(()=>{
  const original=File.prototype.text;
  File.prototype.text=function(){
   return new Promise((resolve,reject)=>{
    window.completeFixtureRead=()=>original.call(this).then(resolve,reject);
   });
  };
 });
 await page.locator('#weekly-import-file').setInputFiles({
  name:'delayed.csv',mimeType:'text/csv',
  buffer:Buffer.from('Grup;Rakip;Tarih;Saat;Saha\nU14;Gecikmeli Mac;08.11.2026;14.30;Merkez')
 });
 await expect.poll(()=>page.evaluate(()=>typeof window.completeFixtureRead)).toBe('function');
 await switchClub(page,'Kulüp B Yavaş');
 await page.evaluate(()=>window.completeFixtureRead());
 await nav(page,'weekly');
 await expect(page.locator('.weekly-import-preview')).toHaveCount(0);
 await page.locator('#weekly-range').selectOption('all');
 await expect(page.locator('.weekly-roster')).toContainText('Bu aralıkta kayıtlı maç yok');
});

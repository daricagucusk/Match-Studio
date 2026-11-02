const {test,expect}=require('@playwright/test');
const {setup,idle,nav}=require('./live-fixture.cjs');
const fs=require('node:fs'),path=require('node:path');
const color=el=>el.evaluate(node=>getComputedStyle(node).backgroundColor);
test('selection colors and form surfaces agree across workspaces',async({page},info)=>{
 await setup(page);await nav(page,'pitch');
 expect(await color(page.locator('.workflow-tabs .current'))).toBe('rgb(58, 49, 31)');
 expect(await color(page.locator('#club-switch:visible,#club-switch-mobile:visible').first())).toBe('rgb(11, 14, 21)');
 expect(await color(page.locator('#pitch-player-shortcut'))).toBe('rgb(11, 14, 21)');
 await nav(page,'roster');expect(await color(page.locator('.group-chip.active').first())).toBe('rgb(58, 49, 31)');const filter=await page.locator('.group-chip.active').first().boundingBox();expect(filter.height).toBeGreaterThanOrEqual(44);
 await nav(page,'studio');expect(await color(page.locator('[data-kind=private]'))).toBe('rgb(58, 49, 31)');if(info.project.name==='phone')expect(await color(page.locator('.mobile-editor-tabs button.active'))).toBe('rgb(58, 49, 31)');
 await page.locator('[data-kind=public]').click();await idle(page);await expect(page.locator('#preview-status')).toContainText('Paylaşmaya hazır');await expect(page.locator('[data-template=classic-stadium]')).toContainText('Klasik Stadyum');
 if(info.project.name==='phone'){const dir=path.resolve(__dirname,'../../test-results/reviews/update-08');fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,'studio-consistent-phone.png')});}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('product labels are Turkish and backup restrictions remain understandable',async({page},info)=>{
 await setup(page);await nav(page,'dashboard');await expect(page.locator('.broadcast-live')).toHaveText('MAÇ MERKEZİ');await expect(page.locator('.fixture-topline')).toContainText('SIRADAKİ MAÇ');
 await nav(page,'live');await expect(page.locator('#live-event-title')).toBeVisible();await expect(page.locator('.live-event-zone')).not.toContainText('PAKET E');
 await nav(page,'archive');expect(await color(page.locator('#club-settings-form input[name=clubName]'))).toBe('rgb(11, 14, 21)');await expect(page.locator('.ms-import-panel')).not.toContainText('origin');await expect(page.locator('.ms-import-panel')).not.toContainText('dg-match-studio');await expect(page.locator('.ms-import-panel')).toContainText('aynı site adresi');
 await expect(page.locator('.settings-list')).toContainText('en az 12 karakter');await expect(page.locator('.settings-list')).toContainText('7 gün');await expect(page.locator('.settings-list')).not.toContainText('AES-GCM');
 if(info.project.name==='phone'){const dir=path.resolve(__dirname,'../../test-results/reviews/update-08');fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,'settings-copy-phone.png')});}
});

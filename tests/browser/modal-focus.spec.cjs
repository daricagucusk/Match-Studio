const {test,expect}=require('@playwright/test');
const {setup,idle,nav}=require('./live-fixture.cjs');
async function inside(page){expect(await page.evaluate(()=>Boolean(document.querySelector('[role=dialog]')?.contains(document.activeElement)))).toBe(true);}
test('player dialog traps keyboard focus, blocks background and restores its opener',async({page})=>{
 await setup(page);await nav(page,'players');const opener=page.locator('[data-action=add-player]').first();await opener.click();await idle(page);await expect(page.getByRole('dialog')).toBeVisible();
 await page.locator('.modal [data-action=close-modal]').focus();await page.keyboard.press('Shift+Tab');await inside(page);
 await expect(page.locator('.app-shell')).toHaveJSProperty('inert',true);
 for(let i=0;i<22;i++){await page.keyboard.press('Tab');await inside(page);}
 await page.locator('#fullName').fill('Geçici Oyuncu');await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(opener).toBeFocused();await expect(page.locator('.app-shell')).toHaveJSProperty('inert',false);
 await opener.click();await idle(page);await expect(page.locator('#fullName')).toBeFocused();await page.locator('.modal [data-action=close-modal]').click();await idle(page);await expect(opener).toBeFocused();
});
test('CSV dialog skips disabled confirmation and returns focus after escape',async({page})=>{
 await setup(page);await nav(page,'players');const opener=page.locator('[data-action=csv-import]');await opener.click();await idle(page);await expect(page.locator('#csv-group')).toBeFocused();await expect(page.locator('#csv-confirm')).toBeDisabled();
 await page.locator('#csv-file').focus();await page.keyboard.press('Tab');await expect(page.locator('.modal [data-action=close-modal]')).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(page.locator('#csv-file')).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(opener).toBeFocused();
});
test('saving a player closes the dialog and restores a usable background control',async({page})=>{
 await setup(page);await nav(page,'players');const opener=page.locator('[data-action=add-player]').first();await opener.click();await idle(page);await page.locator('#fullName').fill('Yeni Oyuncu');await page.locator('#birthYear').fill('2012');await page.locator('#player-form [name=groups]').check();await page.locator('[data-action=submit-player]').click();await idle(page);
 await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('.page')).toContainText('Yeni Oyuncu');await expect(opener).toBeFocused();await expect(page.locator('.app-shell')).toHaveJSProperty('inert',false);
});

test('pitch dialogs return focus to the player menu trigger after it is rebuilt',async({page},info)=>{
 await setup(page);await nav(page,'pitch');await page.locator('#pitch-player-shortcut').selectOption('p1');await idle(page);await page.locator('[data-pitch-slot="0"]').click();await idle(page);
 const trigger=page.locator('[data-pitch-menu-trigger="0"]');await expect(trigger).toBeVisible();
 for(const [action,field] of [['pitch-menu-number','#pitch-shirt-number'],['pitch-menu-role','#pitch-role-modal-select'],['pitch-menu-player','#fullName']]){
  await trigger.click();await page.locator(`[role=menu] [data-action=${action}]`).click();await idle(page);await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator(field)).toBeFocused();
  await page.locator('.modal [data-action=close-modal]').focus();await page.keyboard.press('Shift+Tab');await inside(page);
  if(info.project.name==='phone'&&action==='pitch-menu-number'){const fs=require('node:fs'),path=require('node:path'),dir=path.resolve(__dirname,'../../reviews/update-07');fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,'modal-focus-phone.png')});}
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(trigger).toBeFocused();await expect(page.locator('.app-shell')).toHaveJSProperty('inert',false);
 }
});

const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
async function idle(page){await expect(page.locator('#app')).not.toHaveAttribute('aria-busy','true');}
async function nav(page,route){const btn=page.locator(`[data-nav="${route}"]:visible`).first();if(await btn.count())await btn.click();else{await page.locator('.mobile-more summary').click();await page.locator(`.mobile-more [data-nav="${route}"]`).click();}await idle(page);}
async function club(page){await page.goto('/');await page.locator('#club-create-form [name=clubName]').fill('Kurulum Spor');await page.locator('#club-create-form button').click();await expect(page.locator('.app-shell')).toBeVisible();await idle(page);}
async function atTop(page){await expect(page.locator('#group-form')).toBeVisible();await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);const box=await page.locator('#group-form button').boundingBox();expect(box.y+box.height).toBeLessThan(page.viewportSize().height-80);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
test('first group can be created above the fold immediately after creating a club',async({page},info)=>{
 await club(page);await atTop(page);await expect(page.getByRole('heading',{name:'İlk takımını / yaş grubunu oluştur'})).toBeVisible();
 if(info.project.name==='phone'){const dir=path.resolve(__dirname,'../../reviews/update-04');fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,'first-group-phone.png')});}
 await page.locator('#group-form [name=name]').fill('U14');await page.locator('#group-form button').click();await idle(page);await expect(page.locator('#group-form')).toHaveCount(0);await expect(page.locator('.toast')).toContainText('Grup eklendi');
 await nav(page,'players');await expect(page.locator('#group-form')).toHaveCount(0);await page.locator('[data-action=add-player]').first().click();await idle(page);await expect(page.locator('#player-form [name=groups]')).toHaveCount(1);await expect(page.locator('#player-form')).toContainText('U14');await page.locator('[data-action=close-modal]').click();await idle(page);
 await page.reload();await expect(page.locator('.app-shell')).toBeVisible();await nav(page,'matches');await expect(page.locator('#groupId option')).toContainText(['Yaş grubu seç…','U14']);
});
test('empty player and match screens offer group creation; match draft survives creating a group',async({page})=>{
 await club(page);await nav(page,'players');await atTop(page);await nav(page,'matches');await atTop(page);
 await page.locator('#opponent').fill('Sahil Spor');await page.locator('#venue').fill('Kent Stadı');await page.locator('#coachNotes').fill('Kaybolmayan maç notu');
 await page.locator('#group-form [name=name]').fill('U12');await page.locator('#group-form button').click();await idle(page);await expect(page.locator('#group-form')).toHaveCount(0);await expect(page.locator('#opponent')).toHaveValue('Sahil Spor');await expect(page.locator('#venue')).toHaveValue('Kent Stadı');await expect(page.locator('#coachNotes')).toHaveValue('Kaybolmayan maç notu');await page.locator('#groupId').selectOption({label:'U12'});
 await nav(page,'players');await expect(page.locator('#group-form')).toHaveCount(0);await expect(page.locator('.group-pills')).toContainText('U12');
});
test('archive group creation stays at the top and rejects a duplicate without adding a group',async({page})=>{
 await club(page);await nav(page,'archive');await atTop(page);await expect(page.locator('#group-form')).toHaveCount(1);
 await page.locator('#group-form [name=name]').fill('U14');await page.locator('#group-form button').click();await idle(page);
 await page.locator('#group-form [name=name]').fill(' u14 ');await page.locator('#group-form button').click();await idle(page);await expect(page.locator('.toast')).toContainText('Bu grup zaten kayıtlı');
 await nav(page,'matches');await expect(page.locator('#groupId option')).toHaveCount(2);
});

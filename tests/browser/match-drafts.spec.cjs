const {test,expect}=require('@playwright/test');
async function idle(page){await expect(page.locator('#app')).not.toHaveAttribute('aria-busy','true');}
async function nav(page,route){const item=page.locator(`[data-nav="${route}"]:visible`).first();if(await item.count())await item.click();else{await page.locator('.mobile-more summary').click();await page.locator(`.mobile-more [data-nav="${route}"]`).click();}await idle(page);}
async function setup(page){await page.goto('/');await page.locator('#club-create-form [name=clubName]').fill('Taslak Spor');await page.locator('#club-create-form button').click();await expect(page.locator('.app-shell')).toBeVisible();await idle(page);await nav(page,'archive');await page.locator('#group-form [name=name]').fill('U14');await page.locator('#group-form button').click();await idle(page);await nav(page,'matches');}
async function values(page){return page.locator('#match-form').evaluate(form=>Object.fromEntries(new FormData(form)));}
async function fill(page,opponent='Sahil Spor'){await page.locator('#groupId').selectOption({label:'U14'});await page.locator('#opponent').fill(opponent);await page.locator('#venue').fill('Kent Stadı');await page.locator('#matchDate').fill('2026-10-24');await page.locator('#kickoffTime').fill('14:00');await page.locator('#gameSize').selectOption('3');await idle(page);await page.locator('#benchLimit').fill('2');await page.locator('#meetingPlace').fill('Tesisler');await page.locator('#coachNotes').fill('İlk satır\nİkinci satır');}
test('new match uses the selected group without a separate age category field',async({page})=>{
 await setup(page);await expect(page.locator('#ageCategory')).toHaveCount(0);await fill(page);await page.locator('[data-action=save-match]').click();await idle(page);
 const matches=await page.evaluate(async()=>{const name=(await indexedDB.databases()).find(x=>x.name.startsWith('matchstudio-club-')&&x.name!=='matchstudio-club-registry-v1')?.name;return new Promise((resolve,reject)=>{const request=indexedDB.open(name);request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,tx=db.transaction('matches'),rows=tx.objectStore('matches').getAll();tx.oncomplete=()=>{db.close();resolve(rows.result);};tx.onerror=()=>reject(tx.error);};});});
 expect(matches).toHaveLength(1);expect(matches[0].ageCategory).toBe('U14');
});
test('unsaved match fields survive navigation and reload without creating a saved match',async({page})=>{
 await setup(page);await fill(page);const before=await values(page);
 await nav(page,'players');await nav(page,'matches');expect(await values(page)).toEqual(before);
 await page.reload();await expect(page.locator('.app-shell')).toBeVisible();await nav(page,'matches');expect(await values(page)).toEqual(before);
 const count=await page.evaluate(async()=>{const names=(await indexedDB.databases()).filter(x=>x.name.startsWith('matchstudio-club-')&&x.name!=='matchstudio-club-registry-v1');return Promise.all(names.map(({name})=>new Promise((resolve,reject)=>{const q=indexedDB.open(name);q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,tx=db.transaction('matches'),r=tx.objectStore('matches').count();tx.oncomplete=()=>{db.close();resolve(r.result);};tx.onerror=()=>reject(tx.error);};})));});expect(count.reduce((sum,n)=>sum+n,0)).toBe(0);
});
test('saving clears the new draft; edits remain drafts until explicitly saved',async({page})=>{
 await setup(page);await fill(page);await page.locator('[data-action=save-match]').click();await idle(page);
 await page.locator('[data-action=edit-match]').click();await idle(page);await page.locator('#opponent').fill('Düzenlenen Rakip');
 await nav(page,'players');await nav(page,'matches');await expect(page.locator('#opponent')).toHaveValue('Düzenlenen Rakip');
 // The draft must not alter the stored match used by other screens.
 await nav(page,'archive');await expect(page.locator('.page')).toContainText('Sahil Spor');
 await page.reload();await expect(page.locator('.app-shell')).toBeVisible();await nav(page,'archive');await page.locator('[data-action=open-match]').first().click();await idle(page);await expect(page.locator('#opponent')).toHaveValue('Düzenlenen Rakip');
 await page.locator('[data-action=new-match]:visible').first().click();await idle(page);await expect(page.locator('#opponent')).toHaveValue('');
});
test('drafts are isolated between clubs and a clear action requires confirmation',async({page})=>{
 await setup(page);await fill(page,'Birinci Kulüp Rakibi');await nav(page,'archive');
 await page.locator('.ms-manager-details').filter({has:page.locator('#club-create-form')}).locator('summary').click();
 await page.locator('#club-create-form [name=clubName]').fill('İkinci Spor');await page.locator('#club-create-form button').click();await idle(page);
 await nav(page,'matches');await expect(page.locator('#opponent')).toHaveValue('');await page.locator('#opponent').fill('İkinci Kulüp Rakibi');
 await page.locator('#club-switch-mobile:visible,#club-switch:visible').selectOption({label:'Taslak Spor'});await idle(page);await nav(page,'matches');await expect(page.locator('#opponent')).toHaveValue('Birinci Kulüp Rakibi');
 page.once('dialog',d=>d.dismiss());await page.locator('[data-action=discard-match-draft]').click();await idle(page);await expect(page.locator('#opponent')).toHaveValue('Birinci Kulüp Rakibi');
 page.once('dialog',d=>d.accept());await page.locator('[data-action=discard-match-draft]').click();await idle(page);await expect(page.locator('#opponent')).toHaveValue('');
 await nav(page,'players');await nav(page,'matches');await expect(page.locator('#opponent')).toHaveValue('');
});

test('copied match draft survives reload and does not replace another draft without approval',async({page},info)=>{
 test.skip(info.project.name!=='desktop','Copy edge case tested once; core draft flow runs on all viewports.');
 await setup(page);await fill(page);await page.locator('[data-action=save-match]').click();await idle(page);await nav(page,'archive');
 await page.locator('[data-action=duplicate-match]').first().click();await idle(page);await page.locator('#opponent').fill('Kopya Rakip');await page.reload();await expect(page.locator('.app-shell')).toBeVisible();await nav(page,'matches');await expect(page.locator('#opponent')).toHaveValue('Kopya Rakip');await expect(page.locator('#gameSize')).toHaveValue('3');
 await nav(page,'archive');page.once('dialog',d=>d.dismiss());await page.locator('[data-action=duplicate-match]').first().click();await idle(page);await nav(page,'matches');await expect(page.locator('#opponent')).toHaveValue('Kopya Rakip');
});

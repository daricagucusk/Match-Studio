const {test,expect}=require('@playwright/test');
async function idle(page){await expect(page.locator('#app')).not.toHaveAttribute('aria-busy','true');}
async function nav(page,route){const item=page.locator(`[data-nav="${route}"]:visible`).first();if(await item.count())await item.click();else{await page.locator('.mobile-more summary').click();await page.locator(`.mobile-more [data-nav="${route}"]`).click();}await idle(page);}
async function createClub(page){await page.goto('/');await page.locator('#club-create-form [name=clubName]').fill('Üretim Test Spor');await page.locator('#club-create-form button[type=submit]').click();await expect(page.locator('.app-shell')).toBeVisible();await idle(page);}
async function group(page){await nav(page,'archive');await page.locator('#group-form [name=name]').fill('U14');await page.locator('#group-form button[type=submit]').click();await idle(page);}
test('club creation and all available pages load without errors or horizontal overflow',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await createClub(page);await group(page);
 for(const route of ['players','matches','team','weekly','archive','dashboard']){await nav(page,route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' overflows').toBe(true);}
 expect(errors).toEqual([]);
});
test('complete player, match, roster, live clock and poster workflow',async({page,context},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await createClub(page);
 await group(page);
 await nav(page,'players');
 for(let i=1;i<=4;i++){
  await page.locator('[data-action=add-player]').first().click();await idle(page);
  await page.locator('#fullName').fill('Oyuncu '+i);await page.locator('#birthYear').fill('2012');await page.locator('#shirtNumber').fill(String(i));
  await page.locator('#player-form [name=groups]').check();
  if(i===1)await page.locator('#player-photo').setInputFiles('icons/icon-192.png');
  await page.locator('[data-action=submit-player]').click();await idle(page);await expect(page.locator('#player-form')).toHaveCount(0);
 }
 await nav(page,'matches');await page.locator('#groupId').selectOption({label:'U14'});await page.locator('#ageCategory').selectOption('U14');
 await page.locator('#opponent').fill('Komşu Spor');await page.locator('#venue').fill('Merkez Stadı');await page.locator('#matchDate').fill('2026-10-24');await page.locator('#kickoffTime').fill('14:00');
 await page.locator('#gameSize').selectOption('3');await idle(page);await page.locator('#benchLimit').fill('2');
 await page.locator('[data-action=save-match]').click();await idle(page);
 const checkboxes=page.locator('input[data-player-id]');await expect(checkboxes).toHaveCount(4);
 for(let i=0;i<4;i++){await page.locator('input[data-player-id]').nth(i).check();await idle(page);}
 await nav(page,'pitch');await expect(page.locator('[data-pitch-slot]')).toHaveCount(3);
 if(info.project.name==='desktop'){await page.locator('[data-pitch-player]:visible').first().dragTo(page.locator('[data-pitch-slot]:visible').first());await idle(page);await expect(page.locator('[data-pitch-slot]')).toContainText(['Oyuncu 4','Oyuncu 2','Oyuncu 3']);}
 await nav(page,'live');await expect(page.locator('#live-rules-form')).toBeVisible();await page.locator('#live-substitution-mode').selectOption('returnAllowed');
 await page.locator('#live-rules-form button[type=submit]').click();await idle(page);await page.locator('[data-action=live-start]').click();await idle(page);
 await expect(page.locator('.live-status')).toHaveText('Oynanıyor');
 const matchId=await page.evaluate(async()=>{const databases=await indexedDB.databases();const name=databases.find(x=>x.name.startsWith('matchstudio-club-')).name;return new Promise(resolve=>{const q=indexedDB.open(name);q.onsuccess=()=>{const db=q.result,r=db.transaction('matches').objectStore('matches').getAll();r.onsuccess=()=>{resolve(r.result[0].id);db.close();};};});});
 const second=await context.newPage();await second.goto('/');await expect(second.locator('.app-shell')).toBeVisible();await nav(second,'live');await second.locator(`[data-action=live-open][data-id="${matchId}"]`).click();await idle(second);
 await page.locator('#live-sub-out').selectOption({index:1});await page.locator('#live-sub-in').selectOption({index:1});await page.locator('#live-substitution-form button[type=submit]').click();await idle(page);
 await expect(page.locator('.live-history')).toContainText('Oyuncu değişimi');await expect(second.locator('.live-history')).toContainText('Oyuncu değişimi');await second.close();
 await page.reload();await expect(page.locator('.app-shell')).toBeVisible();await nav(page,'live');await page.locator(`[data-action=live-open][data-id="${matchId}"]`).click();await idle(page);
 await expect(page.locator('.live-status')).toHaveText('Oynanıyor');await expect(page.locator('.live-history')).toContainText('Oyuncu değişimi');
 await nav(page,'studio');await expect(page.locator('[data-action=export-png]:visible').first()).toBeEnabled();
 const downloaded=page.waitForEvent('download');await page.locator('[data-action=export-png]:visible').first().click();const png=await downloaded;expect(png.suggestedFilename()).toMatch(/\.png$/);await idle(page);
 expect(errors).toEqual([]);
});
test('app caches a complete shell and opens with saved records while offline',async({page,context})=>{
 await createClub(page);await page.evaluate(()=>navigator.serviceWorker.ready);
 await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
 await page.reload();await expect(page.locator('.app-shell')).toBeVisible();
 await expect(page.locator('#offline-readiness')).toHaveText('Kayıtlar hazır');
 await context.setOffline(true);await page.reload();await expect(page.locator('.app-shell')).toBeVisible();await nav(page,'players');await nav(page,'archive');
 await expect(page.locator('#club-settings-form [name=clubName]')).toHaveValue('Üretim Test Spor');
 await context.setOffline(false);
});
test('a downloaded backup can be reselected and restored twice through the phone UI',async({page})=>{
 await createClub(page);await group(page);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Yedeği indir'}).click();const file=await download;const filename=await file.path();await idle(page);
 for(let i=0;i<2;i++){
  await page.locator('#data-file').setInputFiles(filename);await page.getByRole('button',{name:'Yüklemeyi tamamla'}).click();await idle(page);await expect(page.locator('.toast')).toContainText('Kayıtlar yüklendi');
  await nav(page,'archive');await expect(page.locator('#group-form')).toBeVisible();
 }
});

const {test,expect}=require('@playwright/test');
const {setup,idle,nav}=require('./live-fixture.cjs');
const fs=require('node:fs'),path=require('node:path');
async function count(page){
 return page.evaluate(()=>new Promise((resolve,reject)=>{
  const q=indexedDB.open('matchstudio-club-report_test_club');
  q.onerror=()=>reject(q.error);
  q.onsuccess=()=>{const db=q.result,tx=db.transaction('matchEvents','readonly'),r=tx.objectStore('matchEvents').getAll();tx.oncomplete=()=>{db.close();resolve(r.result.sort((a,b)=>a.sequence-b.sequence).map(e=>({type:e.type,payload:e.payload})));};};
 }));
}
test('quick event controls stay reachable and immediately save while retaining match history',async({page},info)=>{
 await setup(page);
 const goal=page.locator('[data-action=live-quick-event][data-event-type=GOAL]');
 await expect(goal).toBeVisible();await expect(goal).toBeDisabled();
 await page.locator('[data-action=live-start]').click();await idle(page);await expect(goal).toBeEnabled();
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
 const box=await goal.boundingBox();
 expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThan(page.viewportSize().height-(page.viewportSize().width<767?65:10));
 expect(box.height).toBeGreaterThanOrEqual(44);
 expect(await page.evaluate(()=>document.querySelector('.live-tactical').compareDocumentPosition(document.querySelector('.live-event-zone'))&Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
 if(info.project.name==='phone'){
  const toolbar=await page.locator('.live-event-shortcuts').boundingBox();
  for(const action of ['live-pause','live-end']){const control=await page.locator('[data-action='+action+']').boundingBox();expect(control.y+control.height).toBeLessThanOrEqual(toolbar.y);}
  const dir=path.resolve(__dirname,'../../test-results/reviews/update-05');
  fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,'quick-events-phone.png')});
 }
 await goal.click();
 await expect(page.locator('#live-coach-prompt')).toContainText('Golcüye dokun');
 expect((await count(page)).length).toBe(1);
 await page.locator('[data-live-pitch-out=p1]').click();await idle(page);
 await expect(page.locator('.live-e-score strong')).toHaveText('1 : 0');
 await expect(page.locator('[data-live-pitch-out=p1] [data-kind=goal]')).toHaveCount(1);
 await page.locator('[data-action=live-assist-none]').click();
 for(const type of ['YELLOW_CARD','RED_CARD']){
  await page.locator('[data-action=live-quick-event][data-event-type='+type+']').click();
  await page.locator('[data-live-pitch-out=p2]').click();await idle(page);
  await expect(page.locator('[data-live-pitch-out=p2] [data-kind='+(type==='YELLOW_CARD'?'yellow':'red')+']')).toHaveCount(1);
 }
 await page.locator('[data-action=live-quick-event][data-event-type=OPPONENT_GOAL]').click();await idle(page);
 await expect(page.locator('.live-e-score strong')).toHaveText('1 : 1');
 expect((await count(page)).map(e=>e.type)).toEqual(['PERIOD_START','GOAL','YELLOW_CARD','RED_CARD','OPPONENT_GOAL']);
 await page.reload();await expect(page.locator('.app-shell')).toBeVisible();await nav(page,'live');
 await page.locator('[data-action=live-open]').click();await idle(page);
 await expect(page.locator('.live-e-score strong')).toHaveText('1 : 1');
 await expect(page.locator('[data-live-pitch-out=p2] [data-kind=yellow]')).toHaveCount(1);
 expect((await count(page)).length).toBe(5);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('shortcuts remain reachable after scrolling and respect match status',async({page})=>{
 await setup(page);page.on('dialog',d=>d.accept());
 const goal=page.locator('[data-action=live-quick-event][data-event-type=GOAL]');
 await page.locator('[data-action=live-start]').click();await idle(page);
 await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
 const box=await goal.boundingBox();expect(box.y).toBeGreaterThanOrEqual(0);
 expect(box.y+box.height).toBeLessThan(page.viewportSize().height-(page.viewportSize().width<767?65:10));
 await goal.click();
 await expect(page.locator('#live-coach-prompt')).toContainText('Golcüye dokun');
 expect((await count(page)).length).toBe(1);
 await page.locator('[data-action=live-pause]').click();await idle(page);await expect(goal).toBeEnabled();
 await page.locator('[data-action=live-end]').click();await idle(page);await expect(goal).toBeEnabled();
 await page.locator('[data-action=live-next]').click();await idle(page);
 await page.locator('[data-action=live-end]').click();await idle(page);await expect(goal).toBeEnabled();
 await page.locator('[data-action=live-finish]').click();await idle(page);await expect(goal).toBeDisabled();
 await expect(page.locator('[data-action=live-quick-event]:enabled')).toHaveCount(0);
});
test('quick substitution opens eligible two-player selection without saving on first tap',async({page})=>{
 await setup(page);await page.locator('[data-action=live-start]').click();await idle(page);
 const quick=page.locator('.live-day-sub-link');await expect(quick).toBeVisible();
 const before=(await count(page)).length;
 await quick.click();
 await expect(page.locator('#live-coach-prompt')).toContainText('Değişim');
 await expect(page.locator('#live-sub-out')).toBeEnabled();
 await page.locator('[data-live-pitch-out=p1]').click();
 await expect(page.locator('#live-sub-out')).toHaveValue('p1');
 expect((await count(page)).length).toBe(before);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

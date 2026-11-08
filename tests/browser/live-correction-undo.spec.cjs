const {test,expect}=require('@playwright/test');
const {setup,idle,nav}=require('./live-fixture.cjs');

async function events(page){
 return page.evaluate(()=>new Promise((resolve,reject)=>{
  const q=indexedDB.open('matchstudio-club-report_test_club');
  q.onerror=()=>reject(q.error);
  q.onsuccess=()=>{const db=q.result,tx=db.transaction('matchEvents','readonly'),r=tx.objectStore('matchEvents').getAll();
   tx.oncomplete=()=>{db.close();resolve(r.result.sort((a,b)=>a.sequence-b.sequence))};tx.onerror=()=>reject(tx.error);
  };
 }));
}
async function scoreGoal(page){
 await page.locator('[data-action=live-start]').click();await idle(page);
 await page.locator('[data-action=live-quick-event][data-event-type=GOAL]').click();
 await page.locator('[data-live-pitch-out="p1"]').click();await idle(page);
 await expect(page.locator('.live-console-score')).toHaveText('1 : 0');
}
async function correctGoal(page,{voidGoal=false}={}){
 await page.locator('[data-action=live-coach-report]').click();
 await expect(page.locator('#live-console-secondary')).toHaveAttribute('open','');
 await page.locator('.live-e-history > summary').click();
 await page.locator('[data-action=live-edit-event]').first().click();
 await expect(page.locator('#live-event-correction-form')).toBeVisible();
 await page.locator('#live-event-correction-form [name=reason]').fill('Hakem olay düzeltmesi');
 if(voidGoal)await page.locator('#live-event-correction-form [name=void]').check();
 else await page.locator('#live-event-correction-form [name=playerId]').selectOption('p2');
 await page.locator('#live-event-correction-form button[type=submit]').click();await idle(page);
}
for(const [label,voidGoal] of [['corrected scorer',false],['voided goal',true]]){
 test('undo the latest '+label+' correction restores previous 1-0 score and keeps audit history',async({page})=>{
  page.on('dialog',dialog=>dialog.accept());
  await setup(page);await scoreGoal(page);
  await correctGoal(page,{voidGoal});
  await expect(page.locator('.live-console-score')).toHaveText(voidGoal?'0 : 0':'1 : 0');
  await page.locator('[data-action=live-coach-undo]').click();await idle(page);
  await expect(page.locator('.live-console-score')).toHaveText('1 : 0');
  const recorded=await events(page);
  expect(recorded.filter(e=>e.type==='GOAL')).toHaveLength(1);
  expect(recorded.filter(e=>e.type==='EVENT_CORRECTION')).toHaveLength(2);
  const base=recorded.find(e=>e.type==='GOAL');
  expect(recorded.filter(e=>e.type==='EVENT_CORRECTION').every(e=>e.payload.targetEventId===base.id)).toBe(true);
  await page.reload();await idle(page);
  await nav(page,'live');
  await page.locator('[data-action=live-open]').click();await idle(page);
  await expect(page.locator('.live-console-score')).toHaveText('1 : 0');
 });
}

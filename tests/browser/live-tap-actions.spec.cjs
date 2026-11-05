const {test,expect}=require('@playwright/test');
const {setup,idle,nav}=require('./live-fixture.cjs');
async function history(page){
 return page.evaluate(()=>new Promise((resolve,reject)=>{
  const request=indexedDB.open('matchstudio-club-report_test_club');
  request.onerror=()=>reject(request.error);
  request.onsuccess=()=>{
   const db=request.result,tx=db.transaction('matchEvents','readonly');
   const all=tx.objectStore('matchEvents').getAll();
   tx.oncomplete=()=>{db.close();resolve(all.result.sort((a,b)=>a.sequence-b.sequence));};
  };
 }));
}
test('a card is recorded on player tap, shown as a pitch badge and immediately undoable',async({page})=>{
 await setup(page);
 await page.locator('[data-action=live-start]').click();await idle(page);
 await page.locator('[data-action=live-quick-event][data-event-type=YELLOW_CARD]').click();
 await page.locator('[data-live-pitch-out=p2]').click();
 await idle(page);
 await expect.poll(async()=>(await history(page)).filter(x=>x.type==='YELLOW_CARD').length).toBe(1);
 await expect(page.locator('[data-live-pitch-out=p2] [data-kind=yellow]')).toContainText('1');
 await page.locator('[data-action=live-coach-undo]').click();await idle(page);
 await expect.poll(async()=>(await history(page)).filter(x=>x.type==='EVENT_CORRECTION').length).toBe(1);
 await expect(page.locator('[data-live-pitch-out=p2] [data-kind=yellow]')).toHaveCount(0);
});
test('one scorer tap records goal; second teammate tap adds linked assist without duplicate goal',async({page})=>{
 await setup(page);await page.locator('[data-action=live-start]').click();await idle(page);
 await page.locator('[data-action=live-quick-event][data-event-type=GOAL]').click();
 await page.locator('[data-live-pitch-out=p1]').click();await idle(page);
 await expect(page.locator('.live-e-score strong')).toHaveText('1 : 0');
 await expect(page.locator('[data-live-pitch-out=p1] [data-kind=goal]')).toContainText('1');
 await page.locator('[data-live-pitch-out=p2]').click();await idle(page);
 await expect(page.locator('[data-live-pitch-out=p2] [data-kind=assist]')).toContainText('1');
 const sporting=(await history(page)).filter(x=>x.type==='GOAL'||x.type==='ASSIST');
 expect(sporting.map(x=>x.type)).toEqual(['GOAL','ASSIST']);
 expect(sporting[1].payload.goalEventId).toBe(sporting[0].id);
});
test('player tap opens compact actions and second tap immediately records red card once',async({page})=>{
 await setup(page);await page.locator('[data-action=live-start]').click();await idle(page);
 await page.locator('[data-live-pitch-out=p3]').click();
 await expect(page.locator('#live-player-actions')).toBeVisible();
 await page.locator('[data-action=live-player-quick][data-event-type=RED_CARD]').click();
 await idle(page);
 await expect(page.locator('[data-live-pitch-out=p3] [data-kind=red]')).toHaveCount(1);
 expect((await history(page)).filter(x=>x.type==='RED_CARD').length).toBe(1);
});
test('substitution saves after selecting outgoing then incoming and updates both chips',async({page})=>{
 await setup(page);await page.locator('[data-action=live-start]').click();await idle(page);
 await page.locator('[data-action=live-quick-sub]').click();
 await page.locator('[data-live-pitch-out=p1]').click();
 await page.locator('[data-live-pitch-in=p4]').click();await idle(page);
 await expect.poll(async()=>(await history(page)).filter(x=>x.type==='SUBSTITUTION').length).toBe(1);
 await expect(page.locator('[data-live-pitch-out=p4] [data-kind=sub-in]')).toHaveCount(1);
 await expect(page.locator('[data-live-pitch-in=p1] [data-kind=sub-out]')).toHaveCount(1);
});

test('rapid double tap on the same player does not create duplicate yellow cards',async({page})=>{
 await setup(page);await page.locator('[data-action=live-start]').click();await idle(page);
 await page.locator('[data-action=live-quick-event][data-event-type=YELLOW_CARD]').click();
 await page.locator('[data-live-pitch-out=p1]').evaluate(button=>{button.click();button.click();});
 await expect.poll(async()=>(await history(page)).filter(x=>x.type==='YELLOW_CARD').length).toBe(1);
 await expect(page.locator('[data-live-pitch-out=p1] [data-kind=yellow]')).toContainText('1');
});
test('noReturn competition rule blocks a returning player on rapid substitutions',async({page})=>{
 await setup(page);
 await page.evaluate(()=>new Promise((resolve,reject)=>{
  const q=indexedDB.open('matchstudio-club-report_test_club');
  q.onerror=()=>reject(q.error);
  q.onsuccess=()=>{
   const db=q.result,tx=db.transaction('matchSessions','readwrite'),store=tx.objectStore('matchSessions');
   const req=store.get('session:m1');
   req.onsuccess=()=>{
    const session=req.result;session.rules.substitutionMode='noReturn';store.put(session);
   };
   tx.onerror=()=>reject(tx.error);
   tx.oncomplete=()=>{db.close();resolve();};
  };
 }));
 await page.reload();await nav(page,'live');
 await page.locator('[data-action=live-open]').click();await idle(page);
 await page.locator('[data-action=live-start]').click();await idle(page);
 await page.locator('[data-action=live-quick-sub]').click();
 await page.locator('[data-live-pitch-out=p1]').click();
 await page.locator('[data-live-pitch-in=p4]').click();await idle(page);
 await expect.poll(async()=>(await history(page)).filter(x=>x.type==='SUBSTITUTION').length).toBe(1);
 await page.locator('[data-action=live-quick-sub]').click();
 await page.locator('[data-live-pitch-out=p2]').click();
 await page.locator('[data-live-pitch-in=p1]').click();await idle(page);
 await expect(page.locator('.toast')).toContainText('tekrar oyuna giremez');
 expect((await history(page)).filter(x=>x.type==='SUBSTITUTION').length).toBe(1);
});

const {test,expect}=require('@playwright/test');
const {setup,idle,nav}=require('./live-fixture.cjs');

test('one-touch goal flow selects scorer and assist on tactical pitch and updates score',async({page})=>{
 await setup(page);
 await page.locator('[data-action=live-start]').click();await idle(page);
 await page.locator('[data-event-type=GOAL]').click();
 await page.locator('[data-live-pitch-out="p1"]').click();
 await expect(page.locator('#live-event-player')).toHaveValue('p1');
 await page.locator('[data-live-pitch-out="p2"]').click();
 await expect(page.locator('#live-event-assist')).toHaveValue('p2');
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#live-event-form button[type="submit"]').click();
 await expect(page.locator('.live-console-score')).toHaveText('1 : 0');
 await expect(page.locator('.live-e-history > summary')).toContainText('(1)');
});

test('one-touch substitution selects exiting and entering players on pitch and bench',async({page})=>{
 await setup(page);
 await page.locator('[data-action=live-start]').click();await idle(page);
 await page.locator('[data-action=live-quick-sub]').click();
 await page.locator('[data-live-pitch-out="p1"]').click();
 await expect(page.locator('#live-sub-out')).toHaveValue('p1');
 await page.locator('[data-live-pitch-in="p4"]').click();
 await expect(page.locator('#live-sub-in')).toHaveValue('p4');
 await expect(page.locator('#live-pitch-confirm')).toBeEnabled();
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#live-pitch-confirm').click();
 await expect(page.locator('[data-live-pitch-out="p4"]')).toHaveCount(1);
 await expect(page.locator('[data-live-pitch-in="p1"]')).toHaveCount(1);
});

test('roster can move selected players above unselected without losing existing selection',async({page})=>{
 await setup(page);await nav(page,'roster');
 await page.evaluate(()=>new Promise((resolve,reject)=>{
  const req=indexedDB.open('matchstudio-club-report_test_club');
  req.onerror=()=>reject(req.error);
  req.onsuccess=()=>{
   const db=req.result,tx=db.transaction('players','readwrite');
   const store=tx.objectStore('players');
   for(let i=5;i<=11;i++)store.put({id:'extra'+i,fullName:'Test Oyuncusu '+String(i).padStart(2,'0'),position:'MF',isActive:true,groupIds:['g1']});
   tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error);
  };
 }));
 await page.reload();await nav(page,'live');await page.locator('[data-action=live-open]').click();await idle(page);await nav(page,'roster');
 await page.locator('input[data-player-id="extra11"]').check();await idle(page);
 await page.locator('#roster-order').selectOption('selected-first');await idle(page);
 const ids=await page.locator('.roster-list input[data-player-id]').evaluateAll(els=>els.map(el=>({id:el.dataset.playerId,checked:el.checked})));
 expect(ids.slice(0,5).every(x=>x.checked)).toBe(true);
 expect(ids.findIndex(x=>x.id==='extra11')).toBeLessThan(ids.findIndex(x=>x.id==='extra10'));
 await expect(page.locator('input[data-player-id="extra11"]')).toBeChecked();
});

test('injury, water break and tactical note use protected match event history',async({page})=>{
 await setup(page);
 await page.locator('[data-action=live-start]').click();await idle(page);
 await page.locator('[data-event-type=INJURY]').click();
 await page.locator('[data-live-pitch-out="p1"]').click();
 await expect(page.locator('#live-event-type')).toHaveValue('INJURY');
 await expect(page.locator('#live-event-player')).toHaveValue('p1');
 page.on('dialog',dialog=>dialog.accept());
 await page.locator('#live-event-form button[type="submit"]').click();await idle(page);
 await expect(page.locator('.live-e-history > summary')).toContainText('(1)');
 await page.locator('[data-action=live-quick-note][data-note-kind=water]').click();
 await expect(page.locator('#live-event-type')).toHaveValue('NOTE');
 await expect(page.locator('#live-event-note')).toHaveValue('Su molası');
 await expect(page.locator('#live-event-player')).toHaveValue('');
 await page.locator('#live-event-form button[type="submit"]').click();await idle(page);
 await expect(page.locator('.live-e-history > summary')).toContainText('(2)');
 await page.locator('[data-action=live-quick-note][data-note-kind=technical]').click();
 await expect(page.locator('#live-event-type')).toHaveValue('NOTE');
 await page.locator('#live-event-note').fill('İkinci devrede presi artır');
 await page.locator('#live-event-form button[type="submit"]').click();await idle(page);
 await expect(page.locator('.live-e-history > summary')).toContainText('(3)');
});

test('quick undo proposes an append-only correction and restores the score after confirmation',async({page})=>{
 await setup(page);
 await page.locator('[data-action=live-start]').click();await idle(page);
 await page.locator('[data-event-type=GOAL]').click();
 await page.locator('[data-live-pitch-out="p1"]').click();
 page.on('dialog',dialog=>dialog.accept());
 await page.locator('#live-event-form button[type="submit"]').click();await idle(page);
 await expect(page.locator('.live-console-score')).toHaveText('1 : 0');
 await page.locator('[data-action=live-coach-undo]').click();
 await expect(page.locator('#live-event-correction-form')).toBeVisible();
 await expect(page.locator('#live-event-correction-form [name="void"]')).toBeChecked();
 await page.locator('#live-event-correction-form button[type="submit"]').click();await idle(page);
 await expect(page.locator('.live-console-score')).toHaveText('0 : 0');
});

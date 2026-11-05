const {test,expect}=require('@playwright/test');
const {setup,idle,nav}=require('./live-fixture.cjs');

async function seedDepth(page){
 await page.evaluate(async()=>{
  const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('matchstudio-club-report_test_club');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  await new Promise((resolve,reject)=>{
   const tx=db.transaction(['players','settings'],'readwrite');
   for(let i=5;i<=14;i++)tx.objectStore('players').put({id:'p'+i,fullName:'Oyuncu '+i,position:'DF',groupIds:['g1'],isActive:true});
   const ids=Array.from({length:13},(_,i)=>'p'+(i+2));
   tx.objectStore('settings').put({id:'teamDepth:g1',value:{
    groupId:'g1',roles:{CB:ids,CM:ids.slice().reverse()},
    slotCandidates:{'CB:0':ids,'CB:1':ids.slice().reverse()},
    tacticalRoles:{'CB:0':'ball-playing-defender','CB:1':'stopper'}
   }});
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
  });db.close();
 });
 await page.reload();
 await nav(page,'team');
}
test('each center back has distinct tactical role and sees every alternative',async({page})=>{
 await setup(page);await seedDepth(page);
 const left=page.locator('[data-team-slot="CB:0"]').first(),right=page.locator('[data-team-slot="CB:1"]').first();
 await expect(left).toContainText('Sol Stoper');
 await expect(right).toContainText('Sağ Stoper');
 await left.click();await idle(page);
 await expect(page.locator('#team-tactical-role')).toHaveValue('ball-playing-defender');
 await expect(page.locator('.dg-tp-full-depth li')).toHaveCount(13);
 await page.locator('#team-tactical-role').selectOption('central-defender');await idle(page);
 await expect(page.locator('#team-tactical-role')).toHaveValue('central-defender');
 await page.locator('[data-team-slot="CB:1"]').first().click();await idle(page);
 await expect(page.locator('#team-tactical-role')).toHaveValue('stopper');
 await expect(page.locator('.dg-tp-full-depth li')).toHaveCount(13);
 await page.locator('[data-team-slot="CB:0"]').first().click();await idle(page);
 await expect(page.locator('#team-tactical-role')).toHaveValue('central-defender');
});
test('selecting pitch player keeps coordinates and scrolling stable',async({page})=>{
 await setup(page);await nav(page,'pitch');
 const slot=page.locator('[data-pitch-slot]').first();
 const bench=page.locator('[data-pitch-player]').first();
 if(await bench.count()){
  // A user first scrolls to the bench; that intentional scroll is not a jump.
  // Snapshot immediately before clicking, then verify the rerender stays put.
  await bench.scrollIntoViewIfNeeded();
  const before=await slot.evaluate(e=>({left:e.getBoundingClientRect().left,top:e.getBoundingClientRect().top,y:window.scrollY}));
  await bench.click();await idle(page);
  const after=await page.locator('[data-pitch-slot]').first().evaluate(e=>({left:e.getBoundingClientRect().left,top:e.getBoundingClientRect().top,y:window.scrollY}));
  expect(Math.abs(before.left-after.left)).toBeLessThanOrEqual(2);
  expect(Math.abs(before.top-after.top)).toBeLessThanOrEqual(2);
  expect(Math.abs(before.y-after.y)).toBeLessThanOrEqual(2);
 }
});
test('live match pitch is large enough to read without losing match actions',async({page},info)=>{
 await setup(page);await page.locator('[data-action=live-start]').click();await idle(page);
 await expect(page.locator('.live-field')).toBeVisible();
 if(info.project.name==='desktop'){
  const metrics=await page.locator('.live-field').evaluate(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}));
  expect(metrics.w).toBeGreaterThan(310);
  expect(metrics.h).toBeGreaterThan(390);
  const bottom=await page.evaluate(()=>{
   const field=document.querySelector('.live-field').getBoundingClientRect();
   const scroller=document.querySelector('.live-console-pitch-column').getBoundingClientRect();
   return {fieldBottom:field.bottom,scrollerBottom:scroller.bottom};
  });
  expect(bottom.fieldBottom).toBeLessThanOrEqual(bottom.scrollerBottom+3);
 }
 await expect(page.locator('#live-clock-time')).toBeVisible();
 await expect(page.locator('.live-event-shortcuts')).toBeVisible();
 await expect(page.locator('#live-substitution-form')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
});

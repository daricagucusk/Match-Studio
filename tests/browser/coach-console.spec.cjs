const {test,expect}=require('@playwright/test');
const {setup,idle,nav}=require('./live-fixture.cjs');
const fs=require('node:fs'),path=require('node:path');

test('coach console keeps clock, score, actions, pitch and substitutions on one working screen',async({page},info)=>{
 await setup(page);
 await page.locator('[data-action=live-start]').click();await idle(page);
 await expect(page.locator('.live-match-console')).toBeVisible();
 await expect(page.locator('.live-console-score')).toHaveText('0 : 0');
 await expect(page.locator('.live-console-secondary')).not.toHaveAttribute('open','');
 const snapshot=await page.evaluate(()=>{
  const box=s=>{const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};
  return {viewport:{w:innerWidth,h:innerHeight},bodyOverflow:document.documentElement.scrollWidth>innerWidth+1,clock:box('#live-clock-time'),actions:box('.live-event-shortcuts'),pitch:box('.live-tactical'),event:box('#live-event-form'),sub:box('#live-substitution-form button[type=submit]')};
 });
 expect(snapshot.bodyOverflow).toBe(false);
 for(const key of ['clock','actions','pitch','event','sub'])expect(snapshot[key],key).toBeTruthy();
 if(info.project.name==='desktop'){
  for(const key of ['clock','actions','pitch','event','sub'])expect(snapshot[key].top,key+' above bottom of viewport').toBeLessThan(snapshot.viewport.h-25);
 }
 if(info.project.name==='desktop'){
  const dir=path.resolve(__dirname,'../../test-results/reviews/coach-console');fs.mkdirSync(dir,{recursive:true});
  await page.screenshot({path:path.join(dir,'desktop-live-console.png')});
 }
 await page.locator('[data-action=live-coach-report]').click();
 await expect(page.locator('.live-e-score')).toBeVisible();
 await expect(page.locator('.live-console-secondary')).toHaveAttribute('open','');
 await page.locator('.live-console-secondary > summary').click();
 await expect(page.locator('.live-console-secondary')).not.toHaveAttribute('open','');
 await page.locator('[data-action=live-quick-event][data-event-type=GOAL]').click();
 await expect(page.locator('#live-coach-prompt')).toContainText('Golcüye dokun');
});

test('roster selection preserves scroll offset and can filter out chosen players',async({page})=>{
 await setup(page);
 await page.evaluate(()=>new Promise((resolve,reject)=>{
  const req=indexedDB.open('matchstudio-club-report_test_club');
  req.onerror=()=>reject(req.error);
  req.onsuccess=()=>{
   const db=req.result,tx=db.transaction('players','readwrite'),store=tx.objectStore('players');
   for(let i=5;i<=39;i++)store.put({id:'extra'+i,fullName:'Test Oyuncusu '+String(i).padStart(2,'0'),position:'MF',isActive:true,groupIds:['g1']});
   tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
  };
 }));
 await page.reload();await nav(page,'live');await page.locator('[data-action=live-open]').click();await idle(page);await nav(page,'roster');
 await expect(page.locator('.roster-list input[data-player-id]')).toHaveCount(39);
 const target=page.locator('input[data-player-id="extra28"]');
 await target.scrollIntoViewIfNeeded();
 const before=await page.locator('.roster-list').evaluate(e=>e.scrollTop);
 expect(before).toBeGreaterThan(90);
 await target.check();await idle(page);
 await expect(page.locator('input[data-player-id="extra28"]')).toBeChecked();
 const after=await page.locator('.roster-list').evaluate(e=>e.scrollTop);
 expect(Math.abs(before-after)).toBeLessThanOrEqual(4);
 await page.locator('#roster-only-available').check();await idle(page);
 await expect(page.locator('input[data-player-id="extra28"]')).toHaveCount(0);
 await expect(page.locator('input[data-player-id="extra29"]')).toHaveCount(1);
 await page.locator('#roster-only-available').uncheck();await idle(page);
 await expect(page.locator('input[data-player-id="extra28"]')).toBeChecked();
});

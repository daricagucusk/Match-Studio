const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const sources=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'tools/module-order.json'),'utf8')).map(id=>[id,fs.readFileSync(path.join(root,id),'utf8')]));
async function idle(page){await expect(page.locator('#app')).not.toHaveAttribute('aria-busy','true');}
async function nav(page,route){const button=page.locator(`[data-nav="${route}"]:visible`).first();if(await button.count())await button.click();else{await page.locator('.mobile-more summary').click();await page.locator(`.mobile-more [data-nav="${route}"]`).click();}await idle(page);}
async function setup(page){
 await page.clock.install({time:new Date('2026-10-22T12:00:00Z')});await page.goto('/');
 await page.evaluate(async sources=>{
  const modules={};function load(id){if(modules[id])return modules[id];const exports={};modules[id]=exports;new Function('exports','require',sources[id])(exports,load);return exports;}window.testLoad=load;
  const registry=load('src/storage/club-registry.js'),db=load('src/storage/db.js'),live=load('src/storage/live-match.js');
  await registry.saveClub({id:'report_test_club',name:'Süre Spor',accent:'#4669D9',createdAt:new Date().toISOString()});registry.setActiveId('report_test_club');db.setClubDatabase('report_test_club');
  await db.putRecord('groups',{id:'g1',name:'U14',isActive:true});
  await db.putRecord('matches',{id:'m1',groupId:'g1',ageCategory:'U14',opponent:'Sahil Spor',venue:'Kent Stadı',matchDate:'2026-10-24',kickoffTime:'14:00',state:'draft',gameFormat:{playersPerSide:3,goalkeeperMode:'none',benchLimit:2}});
  const entries=[];for(let i=1;i<=4;i++){const id='p'+i,name='Oyuncu '+i;await db.putRecord('players',{id,fullName:name,position:i===1?'GK':'CM',isActive:true,groupIds:['g1']});entries.push({playerId:id,nameSnapshot:name,shirtNumberSnapshot:String(i),positionSnapshot:i===1?'GK':'CM'});}
  await db.putRecord('rosters',{id:'m1',matchId:'m1',entries});await live.createMatchSession({matchId:'m1',rules:{periods:[1,1],substitutionMode:'returnAllowed',maximumNamedSubstitutes:2},initialPlayerIds:['p1','p2','p3','p4'],currentOnFieldIds:['p1','p2','p3']});
 },sources);
 await page.reload();await expect(page.locator('.app-shell')).toBeVisible();await nav(page,'live');await page.locator('[data-action=live-open]').click();await idle(page);await expect(page.locator('[data-action=live-start]')).toBeVisible();await page.clock.pauseAt(new Date((await page.evaluate(()=>Date.now()))+1000));
}
const row=(page,n)=>page.locator('.live-e-table tbody tr').filter({has:page.getByRole('rowheader',{name:'Oyuncu '+n,exact:false})});
async function times(page,total,first,fourth){
 await expect(page.locator('#live-clock-total')).toHaveText(total);
 await expect(page.locator('.live-report p').first()).toContainText(total+' oynanan süre');
 await expect(row(page,1).locator('td').first()).toHaveText(first);
 await expect(row(page,4).locator('td').first()).toHaveText(fourth);
}
test('report ticks with the clock, preserves form input, and freezes through pauses and finish',async({page},info)=>{
 page.on('dialog',d=>d.accept());await setup(page);await page.locator('[data-action=live-start]').click();await idle(page);await page.clock.fastForward(5000);
 await times(page,'00:05','00:05','00:00');
 await page.locator('#live-event-note').fill('Kaydedilmemiş saha notu');await page.locator('#live-event-player').selectOption('p2');await page.locator('#live-event-note').focus();
 await page.clock.fastForward(5000);await times(page,'00:10','00:10','00:00');await expect(page.locator('#live-event-note')).toBeFocused();await expect(page.locator('#live-event-note')).toHaveValue('Kaydedilmemiş saha notu');await expect(page.locator('#live-event-player')).toHaveValue('p2');
 await page.locator('[data-action=live-pause]').click();await idle(page);await page.clock.fastForward(60000);await times(page,'00:10','00:10','00:00');
 await page.locator('[data-action=live-resume]').click();await idle(page);await page.clock.fastForward(5000);await times(page,'00:15','00:15','00:00');
 await page.locator('#live-sub-out').selectOption('p1');await page.locator('#live-sub-in').selectOption('p4');await page.locator('#live-substitution-form button[type=submit]').click();await idle(page);await expect(page.locator('.toast')).toContainText('Oyuncu değişikliği kaydedildi');
 await page.clock.fastForward(65000);await times(page,'01:20','00:15','01:05');await expect(row(page,4).locator('td').last()).toHaveText('Evet');
 await expect(page.locator('.live-report p').first()).toContainText('4/4 katılan');await expect(page.locator('[data-live-pitch-in=p1] small')).toContainText('0 dk');
 await page.locator('[data-action=live-end]').click();await idle(page);await page.clock.fastForward(30000);await times(page,'01:20','00:15','01:05');
 await page.locator('[data-action=live-next]').click();await idle(page);await page.clock.fastForward(5000);await times(page,'01:25','00:15','01:10');await expect(page.locator('#live-clock-time')).toHaveText('00:05');
 await page.locator('[data-action=live-end]').click();await idle(page);await page.locator('[data-action=live-finish]').click();await idle(page);await page.clock.fastForward(30000);await times(page,'01:25','00:15','01:10');
 await expect(page.locator('#live-report-title')).toHaveText('Maç tamamlandı');if(info.project.name==='desktop'){const dir=path.join(root,'reviews/update-03');fs.mkdirSync(dir,{recursive:true});await page.locator('.live-report').screenshot({path:path.join(dir,'completed-report.png')});}
});

test('print refreshes a delayed tick and clock-health warnings without creating events',async({page})=>{
 page.on('dialog',d=>d.accept());await setup(page);await page.locator('[data-action=live-start]').click();await idle(page);
 // Move wall time while timer callbacks are paused, as when a browser delays background work.
 const started=await page.evaluate(()=>Date.now());await page.clock.setSystemTime(started+7000);
 await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await times(page,'00:07','00:07','00:00');
 await page.clock.setSystemTime(started+11000);await page.evaluate(()=>{window.print=()=>{window.printedTotal=document.querySelector('.live-report p').textContent;};});
 await page.locator('[data-action=live-report-print]').click();await expect.poll(()=>page.evaluate(()=>window.printedTotal)).toContain('00:11 oynanan süre');await idle(page);await times(page,'00:11','00:11','00:00');
 await page.clock.setSystemTime(started+7200000);await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
 await expect(page.locator('#live-clock-health')).toContainText('şüpheli');await expect(page.locator('[data-live-report-warning=clock]')).toBeVisible();await expect(page.locator('[data-live-report-warning=minutes]')).toBeVisible();
 const persisted=await page.evaluate(()=>new Promise((resolve,reject)=>{const q=indexedDB.open('matchstudio-club-report_test_club');q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,tx=db.transaction(['matchEvents','matchSessions']),events=tx.objectStore('matchEvents').getAll(),sessions=tx.objectStore('matchSessions').getAll();tx.oncomplete=()=>{db.close();resolve({eventCount:events.result.length,revision:sessions.result[0].revision});};tx.onerror=()=>reject(tx.error);};}));
 expect(persisted).toEqual({eventCount:1,revision:1});
});

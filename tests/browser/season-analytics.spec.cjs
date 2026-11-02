const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const sources=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'tools/module-order.json'),'utf8')).map(id=>[id,fs.readFileSync(path.join(root,id),'utf8')]));
async function idle(page){await expect(page.locator('#app')).not.toHaveAttribute('aria-busy','true');}
async function nav(page,route){const item=page.locator(`[data-nav="${route}"]:visible`).first();if(await item.count())await item.click();else{await page.locator('.mobile-more summary').click();await page.locator(`.mobile-more [data-nav="${route}"]`).click();}await idle(page);}

// Seeds synthetic players and two finished matches plus one finished match with missing period events.
async function seedSeason(page,{secondClub=false}={}){
 await page.goto('/');
 await page.evaluate(async({sources,secondClub})=>{
  const modules={};function load(id){if(modules[id])return modules[id];const exports={};modules[id]=exports;new Function('exports','require',sources[id])(exports,load);return exports;}
  const registry=load('src/storage/club-registry.js'),db=load('src/storage/db.js'),live=load('src/storage/live-match.js'),clock=load('src/storage/match-clock.js'),sports=load('src/storage/match-sporting-events.js');
  await registry.saveClub({id:'season_browser_club',name:'Analitik Spor',accent:'#4669D9',createdAt:new Date().toISOString()});
  registry.setActiveId('season_browser_club');db.setClubDatabase('season_browser_club');
  await db.putRecord('groups',{id:'g1',name:'U12',isActive:true});
  for(const [id,fullName] of [['pA','Test Oyuncu A'],['pB','Test Oyuncu B'],['pC','Test Oyuncu C'],['pD','Test Oyuncu D']])await db.putRecord('players',{id,fullName,isActive:true,groupIds:['g1']});
  const act=async(matchId,action,nowMs)=>clock.commitClockAction({matchId,action,nowMs,expectedRevision:(await live.getMatchSession(matchId)).revision,idempotencyKey:action+nowMs});
  const create=async(id,matchDate,opponent,groupId='g1')=>{await db.putRecord('matches',{id,groupId,opponent,matchDate,kickoffTime:'14:00',state:'saved'});await live.createMatchSession({matchId:id,rules:{periods:[1,1],substitutionMode:'returnAllowed',maximumNamedSubstitutes:2},initialPlayerIds:['pA','pB','pC','pD'],currentOnFieldIds:['pA','pB','pC']});};
  const play=async(id,events)=>{await act(id,'START',1000);for(const [i,[type,payload]] of events.entries())await sports.commitSportingEvent({matchId:id,type,payload,nowMs:10000+i*1000,expectedRevision:(await live.getMatchSession(id)).revision,idempotencyKey:'e'+i});for(const [a,ms] of [['END_PERIOD',61000],['NEXT_PERIOD',62000],['END_PERIOD',122000],['FINISH',123000]])await act(id,a,ms);};
  await create('m1','2026-10-01','Test Rakip A');
  await play('m1',[['GOAL',{playerId:'pA'}],['GOAL',{playerId:'pB',assistPlayerId:'pC'}],['OPPONENT_GOAL',{}]]);
  await create('m2','2026-10-08','Test Rakip B');
  await play('m2',[['OPPONENT_GOAL',{}],['OPPONENT_GOAL',{}]]);
  await create('m3','2026-10-15','Test Rakip C');
  const session=await live.getMatchSession('m3');
  await db.putRecord('matchSessions',{...session,status:'finished'});
  if(secondClub){
   await registry.saveClub({id:'season_browser_other',name:'Diğer Analitik Spor',accent:'#4669D9',createdAt:new Date().toISOString()});
   db.setClubDatabase('season_browser_other');
   await db.putRecord('groups',{id:'other_group',name:'U14',isActive:true});
   for(const [id,fullName] of [['pA','Diğer Oyuncu A'],['pB','Diğer Oyuncu B'],['pC','Diğer Oyuncu C'],['pD','Diğer Oyuncu D']])await db.putRecord('players',{id,fullName,isActive:true,groupIds:['other_group']});
   await create('other_match','2026-11-01','Diğer Kulüp Rakibi','other_group');
   await play('other_match',[['GOAL',{playerId:'pA'}]]);
   db.setClubDatabase('season_browser_club');
  }
 },{sources,secondClub});
 await page.reload();await expect(page.locator('.app-shell')).toBeVisible();await idle(page);
}

test('season page summarises finished matches, sorts players, exports CSV and explains excluded matches',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await seedSeason(page);
 await nav(page,'analytics');
 await expect(page.getByRole('heading',{level:1,name:'Sezon Analitiği'})).toBeVisible();
 await expect(page.locator('.season-kpi').filter({hasText:'Oynanan maç'})).toContainText('2');
 await expect(page.locator('.season-kpi').filter({hasText:'G – B – M'})).toContainText('1 – 0 – 1');
 await expect(page.locator('.season-review')).toContainText('1 maç toplamlara alınmadı');
 const row=name=>page.locator('.season-players tbody tr').filter({has:page.getByRole('rowheader',{name})});
 await expect(row('Test Oyuncu A')).toContainText('100%');
 await expect(page.locator('.season-players tbody tr').first().getByRole('rowheader')).toHaveText('Test Oyuncu A');
 await page.locator('#season-sort').selectOption('assists');
 await expect(page.locator('.season-players tbody tr').first().getByRole('rowheader')).toHaveText('Test Oyuncu C');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:/CSV indir/}).click()]);
 const bytes=fs.readFileSync(await download.path());
 expect(bytes[0]).toBe(0xef);
 expect(bytes.toString('utf8')).toContain('Oyuncu;Maç;İlk 11');
 expect(bytes.toString('utf8')).toContain('Test Oyuncu C;');
 expect(errors).toEqual([]);
});

test('a club without finished matches gets an explanatory empty state',async({page})=>{
 await page.goto('/');
 await page.locator('#club-create-form [name=clubName]').fill('Boş Spor');await page.locator('#club-create-form button[type=submit]').click();
 await expect(page.locator('.app-shell')).toBeVisible();await idle(page);
 await nav(page,'analytics');
 await expect(page.getByRole('heading',{level:3,name:'Henüz analiz edilecek maç yok'})).toBeVisible();
 await expect(page.getByRole('button',{name:/CSV indir/})).toBeDisabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('switching clubs clears season filters and renders only the destination club snapshot',async({page})=>{
 await seedSeason(page,{secondClub:true});
 await nav(page,'analytics');
 await page.locator('#season-group').selectOption('g1');
 await page.locator('#season-from').fill('2026-10-01');
 await page.locator('#season-to').fill('2026-10-31');
 await page.locator('#season-sort').selectOption('assists');
 await expect(page.locator('.season-kpi').filter({hasText:'Oynanan maç'})).toContainText('2');
 await page.locator('#club-switch:visible, #club-switch-mobile:visible').first().selectOption('season_browser_other');
 await idle(page);await nav(page,'analytics');
 await expect(page.locator('#season-group')).toHaveValue('');
 await expect(page.locator('#season-from')).toHaveValue('');
 await expect(page.locator('#season-to')).toHaveValue('');
 await expect(page.locator('#season-sort')).toHaveValue('goals');
 await expect(page.locator('.season-kpi').filter({hasText:'Oynanan maç'})).toContainText('1');
 await expect(page.locator('#season-group')).toContainText('U14');
 await expect(page.locator('.season-players')).toContainText('Diğer Oyuncu A');
 await expect(page.locator('.season-players')).not.toContainText('Test Oyuncu A');
 await expect(page.locator('#season-matches-title').locator('..')).toContainText('Diğer Kulüp Rakibi');
 await expect(page.locator('.season-review')).toHaveCount(0);
});

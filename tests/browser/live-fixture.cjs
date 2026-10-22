const {expect}=require('@playwright/test');
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
module.exports={setup,idle,nav};

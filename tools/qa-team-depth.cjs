'use strict';
/* Live Chromium acceptance check for the team-depth screen.
 * Runs without the Playwright test runner (which is blocked by the local
 * process-spawn policy in this environment), but uses the same Chromium build. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');

const root=path.resolve(__dirname,'..');
const baseURL=process.env.MATCHSTUDIO_QA_URL||'http://127.0.0.1:8913';
const sources=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'tools/module-order.json'),'utf8')).map(id=>[id,fs.readFileSync(path.join(root,id),'utf8')]));
const evidence=path.join(root,'evidence','team-depth');
fs.mkdirSync(evidence,{recursive:true});

const views=[
 {name:'desktop',viewport:{width:1440,height:1000}},
 {name:'laptop',viewport:{width:1280,height:720}},
 {name:'fold-open',viewport:{width:840,height:980},isMobile:true,hasTouch:true},
 {name:'phone',viewport:{width:360,height:780},isMobile:true,hasTouch:true}
];

async function seed(page){
 await page.evaluate(async sources=>{
  const modules={};
  function load(id){if(modules[id])return modules[id];const exports={};modules[id]=exports;new Function('exports','require',sources[id])(exports,load);return exports;}
  const registry=load('src/storage/club-registry.js'),db=load('src/storage/db.js');
  await registry.saveClub({id:'report_test_club',name:'Süre Spor',accent:'#4669D9',createdAt:new Date().toISOString()});
  registry.setActiveId('report_test_club');db.setClubDatabase('report_test_club');
  await db.putRecord('groups',{id:'g1',name:'U14',isActive:true});
  await db.putRecord('groups',{id:'g2',name:'U12',isActive:true});
  const firstNames=['Aral','Berk','Cem','Deniz','Emir','Fatih','Giray','Hakan','Ilker','Jale','Kaan','Lale','Mert','Nehir','Oguz','Pinar','Rana','Sarp','Tuna','Umut','Volkan','Yigit','Zeki','Alp','Baran','Cenk','Doruk','Ege','Firat','Gokay'];
  const longNames=firstNames.map((n,i)=>i===0?'Deneme Oyuncu Uzunsoyadlitest':n+' Deneme');
  for(let i=1;i<=30;i++)await db.putRecord('players',{id:'p'+i,fullName:longNames[i-1],position:i===1?'GK':i<8?'DF':i<20?'MF':'FW',groupIds:['g1'],isActive:true});
  const ids=Array.from({length:30},(_,i)=>'p'+(i+1));
  await db.putRecord('settings',{id:'teamPitchPrefs:g1',value:{formation:'4-3-3',depthFactor:2}});
  await db.putRecord('settings',{id:'teamDepth:g1',value:{groupId:'g1',roles:{GK:ids.slice(0,5),CB:ids.slice(1,9),CM:ids.slice(9,17),ST:ids.slice(17,25)},
   slotCandidates:{'GK:0':ids.slice(0,5),'CB:0':ids.slice(1,9),'CB:1':ids.slice(2,10),'CM:0':ids.slice(9,17),'CM:1':ids.slice(10,18),'ST:0':ids.slice(17,25)},
   tacticalRoles:{'CB:0':'ball-playing-defender','CB:1':'stopper'}}});
 },sources);
 await page.reload();
 await page.waitForSelector('.app-shell',{timeout:15000});
}

async function nav(page,route){
 const visible=page.locator(`[data-nav="${route}"]:visible`).first();
 if(await visible.count())await visible.click();
 else{await page.locator('.mobile-more summary').click();await page.locator(`.mobile-more [data-nav="${route}"]`).click();}
 await idle(page);
}
async function idle(page){await page.waitForFunction(()=>document.querySelector('#app')?.getAttribute('aria-busy')!=='true');}
const rankOf=text=>{const match=String(text).match(/(\d+)\. tercih/);return match?Number(match[1]):null;};

async function metrics(page){
 return page.evaluate(()=>{
  const workspace=document.querySelector('.depth-workspace');
  const matrix=document.querySelector('.depth-matrix');
  const footer=document.querySelector('.depth-footer');
  const rows=[...document.querySelectorAll('.depth-row')];
  const viewport={w:innerWidth,h:innerHeight};
  const rect=workspace?.getBoundingClientRect();
  const footerRect=footer?.getBoundingClientRect();
  return {
   viewport,
   rows:rows.length,
   visibleRows:rows.filter(row=>{const r=row.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&r.width>0&&r.height>0;}).length,
   rowHeights:rows.map(row=>Math.round(row.getBoundingClientRect().height)),
   workspace:{top:Math.round(rect?.top||0),bottom:Math.round(rect?.bottom||0),height:Math.round(rect?.height||0)},
   footerBottom:Math.round(footerRect?.bottom||0),
   documentScroll:{height:document.documentElement.scrollHeight,width:document.documentElement.scrollWidth},
   mainScroll:{height:document.querySelector('.main')?.scrollHeight,clientHeight:document.querySelector('.main')?.clientHeight},
   matrixScroll:{height:matrix?.scrollHeight,clientHeight:matrix?.clientHeight},
   clippedCells:[...document.querySelectorAll('.depth-role,.depth-choice')].filter(el=>el.scrollHeight>el.clientHeight+1).length,
   columns:document.querySelector('.depth-row')?.children.length||0
  };
 });
}
function assertNoScroll(view,before,label){
 assert.ok(before.workspace.bottom<=before.viewport.h+1,`${view.name}: ${label} çalışma alanı ekranı taşıyor`);
 assert.ok(before.footerBottom<=before.viewport.h+1,`${view.name}: ${label} alt gezinme ekranı taşıyor`);
 assert.ok(before.documentScroll.height<=before.viewport.h+1,`${view.name}: ${label} belge dikey kaydırma üretiyor (${before.documentScroll.height}>${before.viewport.h})`);
 assert.ok(before.documentScroll.width<=before.viewport.w+1,`${view.name}: ${label} yatay taşma var`);
 assert.ok(before.mainScroll.height<=before.mainScroll.clientHeight+1,`${view.name}: ${label} ana içerik dikey kaydırma üretiyor`);
 assert.equal(before.clippedCells,0,`${view.name}: ${label} metin dikey kırpılıyor`);
}
async function openSlot(page,slot){
 await page.locator(`[data-team-slot="${slot}"]`).first().click();
 await page.locator('#team-depth-editor').waitFor({state:'visible',timeout:10000});
}
async function closeSlot(page){
 await page.locator('[data-team-editor-close]').click();
 await page.locator('#team-depth-editor').waitFor({state:'detached'});
}

(async()=>{
 const browser=await chromium.launch({headless:true});
 const results=[];
 try{
  for(const view of views){
   const context=await browser.newContext({viewport:view.viewport,isMobile:view.isMobile,hasTouch:view.hasTouch,locale:'tr-TR'});
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',error=>errors.push(String(error)));
   page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
   await page.goto(baseURL,{waitUntil:'domcontentloaded'});
   await seed(page);
   await nav(page,'team');
   await page.locator('[data-team-slot="GK:0"]').first().waitFor({state:'visible',timeout:10000});
   const before=await metrics(page);
   assert.equal(before.rows,11,`${view.name}: 11 görev satırı bekleniyordu`);
   assert.equal(before.visibleRows,11,`${view.name}: bütün görev satırları ekranda görünmeliydi`);
   assertNoScroll(view,before,'ana görünüm');
   assert.ok(before.columns===4||before.columns===3,`${view.name}: tercih sütunları eksik`);
   assert.equal(before.clippedCells,0,`${view.name}: ${before.clippedCells} hücrede metin dikey kırpılıyor`);
   await page.screenshot({path:path.join(evidence,`${view.name}-overview.png`),fullPage:false});

   // Extra preferences are reached with labelled arrows; the table must stay fixed.
   const prefColumns=before.columns-1;
   const headers=await page.locator('.depth-columns span').allInnerTexts();
   assert.equal(headers[1].trim().toLocaleLowerCase('tr-TR'),'1. tercih',`${view.name}: ilk tercih sütunu yanlış`);
   await page.locator('[data-team-depth-page="1"]').click();
   await idle(page);
   const nextHeaders=await page.locator('.depth-columns span').allInnerTexts();
   assert.equal(nextHeaders[1].trim().toLocaleLowerCase('tr-TR'),`${prefColumns+1}. tercih`,`${view.name}: sonraki tercih sütunları açılmadı`);
   assert.equal((await page.locator('.depth-row').count()),11,`${view.name}: sütun gezinmesi satırları kaybetti`);
   const afterColumns=await metrics(page);
   assertNoScroll(view,afterColumns,'sütun gezinmesi');
   assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.teamDepthPage),'1',`${view.name}: sütun düğmesi odağı korunmadı`);
   await page.locator('[data-team-depth-page="-1"]').click();
   await idle(page);
   const backHeaders=await page.locator('.depth-columns span').allInnerTexts();
   assert.equal(backHeaders[1].trim().toLocaleLowerCase('tr-TR'),'1. tercih',`${view.name}: önceki tercih sütunlarına dönülmedi`);

   // Escape must close the dialog and return focus to the row that opened it.
   await openSlot(page,'CB:0');
   assert.equal(await page.evaluate(()=>document.activeElement?.id),'team-search',`${view.name}: düzenleyici odağı aramaya taşınmadı`);
   const firstChoiceLabel=await page.locator('.depth-choice').first().getAttribute('aria-label');
   assert.ok(firstChoiceLabel&&firstChoiceLabel.length>3,`${view.name}: tercih hücresinin erişilebilir adı yok`);
   assert.match(await page.locator('[data-team-slot="CB:0"]').first().getAttribute('aria-label')||'',/Sol Stoper/,`${view.name}: görev düğmesinin erişilebilir adı yok`);
   for(let step=0;step<12;step++){
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>Boolean(document.activeElement?.closest('#team-depth-editor'))),true,`${view.name}: Tab odağı düzenleyiciden kaçtı`);
   }
   const leftFirst=await page.locator('.depth-candidate strong').first().innerText();
   await page.keyboard.press('Escape');
   await page.locator('#team-depth-editor').waitFor({state:'detached'});
   const escaped=await page.evaluate(()=>({slot:document.activeElement?.dataset?.teamSlot||null,inside:Boolean(document.activeElement?.closest('#team-depth-editor'))}));
   assert.equal(escaped.inside,false,`${view.name}: Escape sonrası odak düzenleyicide kaldı`);
   assert.equal(escaped.slot,'CB:0',`${view.name}: Escape sonrası odak açan göreve dönmedi`);

   await openSlot(page,'CB:0');
   assert.equal(await page.locator('.depth-candidate').count(),5,`${view.name}: düzenleyici ilk sayfada 5 aday göstermeliydi`);
   assert.match(await page.locator('.depth-pager').innerText(),/1 \/ \d+ · 30 oyuncu/,`${view.name}: aday sayfalama bilgisi yanlış`);
   assert.equal(await page.locator('#team-tactical-role').inputValue(),'ball-playing-defender',`${view.name}: taktik rol yüklenmedi`);
   await page.screenshot({path:path.join(evidence,`${view.name}-editor.png`),fullPage:false});
   await page.locator('[data-team-candidate-page="1"]').click();
   await page.waitForFunction(()=>/2 \/ \d+ · 30 oyuncu/.test(document.querySelector('.depth-pager')?.textContent||''));
   assert.equal(await page.locator('.depth-candidate').count(),5,`${view.name}: ikinci aday sayfası 5 satır göstermeliydi`);
   assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.teamCandidatePage),'1',`${view.name}: aday sayfası odağı korunmadı`);
   await page.locator('[data-team-candidate-page="-1"]').click();
   await page.waitForFunction(()=>/1 \/ \d+ · 30 oyuncu/.test(document.querySelector('.depth-pager')?.textContent||''));
   await page.locator('#team-tactical-role').selectOption('central-defender');
   await idle(page);
   assert.equal(await page.locator('#team-tactical-role').inputValue(),'central-defender',`${view.name}: taktik rol değişikliği uygulanmadı`);
   await closeSlot(page);

   // Right and left centre backs keep independent queues and roles.
   await openSlot(page,'CB:1');
   assert.equal(await page.locator('#team-tactical-role').inputValue(),'stopper',`${view.name}: sağ stoper taktik rolü karıştı`);
   const rightFirst=await page.locator('.depth-candidate strong').first().innerText();
   assert.notEqual(rightFirst,leftFirst,`${view.name}: sol ve sağ stoper aynı kuyruğu paylaşıyor`);
   await closeSlot(page);

   // Add a player, move the priority, then prove both survive a reload.
   await openSlot(page,'CB:0');
   assert.equal(await page.locator('#team-tactical-role').inputValue(),'central-defender',`${view.name}: taktik rol yenilemeden sonra kayboldu`);
   await page.locator('#team-search').fill('Deneme Oyuncu');
   await page.locator('.depth-candidate').first().waitFor({state:'visible'});
   assert.match(await page.locator('.depth-candidate').first().innerText(),/Deneme Oyuncu Uzunsoyadlitest/);
   await page.locator('.depth-candidate input').first().check();
   await page.waitForFunction(()=>/tercih/.test(document.querySelector('.depth-candidate small')?.textContent||''));
   const addedRank=rankOf(await page.locator('.depth-candidate small').first().innerText());
   assert.ok(addedRank>0,`${view.name}: aday seçimi sıraya yazılmadı`);
   await page.locator('[data-team-priority="up"]').first().click();
   await idle(page);
   await page.waitForFunction(previous=>{const text=document.querySelector('.depth-candidate small')?.textContent||'';const match=text.match(/(\d+)\. tercih/);return match&&Number(match[1])===previous-1;},addedRank);
   const movedRank=rankOf(await page.locator('.depth-candidate small').first().innerText());
   assert.equal(movedRank,addedRank-1,`${view.name}: öncelik yükseltme sırayı değiştirmedi`);
   await closeSlot(page);
   await page.reload();
   await page.locator('.app-shell').waitFor({state:'visible'});
   await nav(page,'team');
   await openSlot(page,'CB:0');
   assert.equal(await page.locator('#team-tactical-role').inputValue(),'central-defender',`${view.name}: taktik rol kalıcı değil`);
   await page.locator('#team-search').fill('Deneme Oyuncu');
   await page.locator('.depth-candidate').first().waitFor({state:'visible'});
   assert.equal(await page.locator('.depth-candidate input').first().isChecked(),true,`${view.name}: seçim yenilemeden sonra korunmadı`);
   assert.equal(rankOf(await page.locator('.depth-candidate small').first().innerText()),movedRank,`${view.name}: öncelik sırası yenilemeden sonra korunmadı`);
   await closeSlot(page);

   // A group without players must explain the empty state instead of faking rows.
   await page.locator('#team-group-select').selectOption('g2');
   await idle(page);
   await openSlot(page,'GK:0');
   assert.match(await page.locator('.depth-no-result').innerText(),/Bu takımda aktif oyuncu yok/,`${view.name}: boş takım açıklaması yok`);
   await closeSlot(page);

   assert.equal(errors.length,0,`${view.name}: sayfa hataları: ${errors.join(' | ')}`);
   results.push({view:view.name,...before,checks:{columnPaging:true,candidatePaging:true,focusReturn:true,rolePersistence:true,priorityMove:{from:addedRank,to:movedRank},independentSlots:true,emptyTeam:true},status:'PASS'});
   await context.close();
  }
  const report={status:'PASS',generatedAt:new Date().toISOString(),baseURL,results};
  if(process.env.MATCHSTUDIO_QA_OUT)fs.writeFileSync(path.resolve(root,process.env.MATCHSTUDIO_QA_OUT),JSON.stringify(report,null,2)+'\n','utf8');
  console.log(JSON.stringify(report,null,2));
 }finally{
  await browser.close();
 }
})().catch(error=>{console.error('FAIL',error);process.exit(1);});

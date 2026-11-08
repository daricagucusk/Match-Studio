'use strict';
// Salt okunur denetim betiği: sentetik kulüp/oyuncu/maç verisiyle gerçek ekranları
// yakalar ve düzen ölçümlerini JSON olarak yazar. Uygulama kodunu değiştirmez.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const outDir=process.argv[2]||path.join(root,'test-results','reviews','audit-360');
const base=process.argv[3]||'http://127.0.0.1:8913';
fs.mkdirSync(outDir,{recursive:true});
const sources=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'tools/module-order.json'),'utf8')).map(id=>[id,fs.readFileSync(path.join(root,id),'utf8')]));
const viewports={desktop:{width:1440,height:1000},foldOpen:{width:840,height:980},foldInner:{width:640,height:537},foldClosed:{width:351,height:679},phone:{width:360,height:780}};
const routes=['dashboard','matches','players','live','roster','team','pitch','studio','weekly','analytics','archive'];
async function seed(page){
 await page.evaluate(async sources=>{
  const modules={};function load(id){if(modules[id])return modules[id];const exports={};modules[id]=exports;new Function('exports','require',sources[id])(exports,load);return exports;}
  const registry=load('src/storage/club-registry.js'),db=load('src/storage/db.js'),live=load('src/storage/live-match.js');
  await registry.saveClub({id:'audit_club',name:'Denetim Spor',accent:'#4669D9',createdAt:new Date().toISOString()});registry.setActiveId('audit_club');db.setClubDatabase('audit_club');
  await db.putRecord('groups',{id:'g1',name:'U14',isActive:true});
  await db.putRecord('groups',{id:'g2',name:'U16',isActive:true});
  const names=['Kaleci Bir','Defans İki','Defans Üç','Orta Dört','Orta Beş','Forvet Altı','Yedek Yedi','Yedek Sekiz'];
  const entries=[];
  for(let i=1;i<=8;i++){const id='p'+i;await db.putRecord('players',{id,fullName:names[i-1],position:i===1?'GK':i<4?'CB':i<6?'CM':'ST',isActive:true,groupIds:[i%2?'g1':'g2'],birthDate:'2012-0'+(i%9+1)+'-1'+i});entries.push({playerId:id,nameSnapshot:names[i-1],shirtNumberSnapshot:String(i),positionSnapshot:i===1?'GK':i<4?'CB':i<6?'CM':'ST'});}
  await db.putRecord('matches',{id:'m1',groupId:'g1',ageCategory:'U14',opponent:'Sahil Spor',venue:'Kent Stadı',matchDate:'2026-11-14',kickoffTime:'14:00',state:'draft',gameFormat:{playersPerSide:7,goalkeeperMode:'required',benchLimit:3}});
  await db.putRecord('matches',{id:'m2',groupId:'g2',ageCategory:'U16',opponent:'Liman Gençlik',venue:'Deplasman',matchDate:'2026-11-21',kickoffTime:'11:00',state:'draft',gameFormat:{playersPerSide:7,goalkeeperMode:'required',benchLimit:3}});
  await db.putRecord('rosters',{id:'m1',matchId:'m1',entries});
  await live.createMatchSession({matchId:'m1',rules:{periods:[1,1],substitutionMode:'returnAllowed',maximumNamedSubstitutes:3},initialPlayerIds:['p1','p2','p3','p4','p5','p6','p7'],currentOnFieldIds:['p1','p2','p3','p4','p5','p6','p7']});
 },sources);
}
async function nav(page,route){
 const button=page.locator(`[data-nav="${route}"]:visible`).first();
 if(await button.count())await button.click();
 else{await page.locator('.mobile-more summary').click();await page.locator(`.mobile-more [data-nav="${route}"]`).click();}
 await page.waitForFunction(()=>document.querySelector('#app')?.getAttribute('aria-busy')!=='true');
 await page.waitForTimeout(350);
}
async function measure(page){
 return page.evaluate(()=>{
  const vw=innerWidth;
  const wide=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>vw+1||r.left<-1);}).slice(0,8).map(e=>({tag:e.tagName.toLowerCase(),cls:(e.className||'').toString().slice(0,60),right:Math.round(e.getBoundingClientRect().right)}));
  const small=[...document.querySelectorAll('button,a,input,select,textarea')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.height<40||r.width<40);}).slice(0,10).map(e=>({tag:e.tagName.toLowerCase(),cls:(e.className||'').toString().slice(0,50),h:Math.round(e.getBoundingClientRect().height),w:Math.round(e.getBoundingClientRect().width)}));
  return {viewport:{w:innerWidth,h:innerHeight},scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,overflowX:document.documentElement.scrollWidth>vw+1,wide,smallTargets:small,smallCount:small.length};
 });
}
(async()=>{
 const browser=await chromium.launch();
 const report={generatedAt:new Date().toISOString(),base,viewports:{},screens:{}};
 for(const [vpName,vp] of Object.entries(viewports)){
  const context=await browser.newContext({viewport:vp,isMobile:vp.width<900,hasTouch:vp.width<900,deviceScaleFactor:1});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e).slice(0,200)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,200));});
  await page.goto(base+'/');await page.waitForFunction(()=>Boolean(document.querySelector('#app')?.children.length));
  await seed(page);await page.reload();await page.waitForSelector('.app-shell');
  await page.waitForFunction(()=>document.querySelector('#app')?.getAttribute('aria-busy')!=='true');
  report.viewports[vpName]=vp;
  for(const route of routes){
   await nav(page,route);
   const file=path.join(outDir,`${vpName}-${route}.png`);
   await page.screenshot({path:file,fullPage:false});
   report.screens[`${vpName}/${route}`]={...(await measure(page)),shot:path.relative(root,file).replace(/\\/g,'/')};
  }
  report.screens[`${vpName}/errors`]=errors.slice(0,10);
  await context.close();
 }
 await browser.close();
 fs.writeFileSync(path.join(outDir,'layout-report.json'),JSON.stringify(report,null,1));
 console.log('Wrote',path.join(outDir,'layout-report.json'));
})().catch(e=>{console.error(e);process.exit(1);});

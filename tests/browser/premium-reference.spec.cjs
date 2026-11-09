const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const sources=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'tools/module-order.json'),'utf8')).map(id=>[id,fs.readFileSync(path.join(root,id),'utf8')]));
test('reference poster designs render editable match data and protect public output',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async source=>{
  const modules={};function load(id){if(modules[id])return modules[id];const exports={};modules[id]=exports;new Function('exports','require',source[id])(exports,load);return exports;}
  const {templates}=load('src/posters/registry.js');
  const {buildPosterDocument}=load('src/domain/poster-document.js');
  const {renderPoster}=load('src/posters/renderer.js');
  const match={matchType:'league',opponent:'Sentetik Rakip SK',venue:'Örnek Saha',matchDate:'2026-11-10',kickoffTime:'19:15',meetingTime:'18:15',meetingPlace:'Test Merkezi',mealDeadline:'17:30',mealMenu:'Sentetik Beslenme Notu',kitNotes:'Sentetik Forma',hydrationNotes:'Sentetik Sıvı Planı'};
  const entries=Array.from({length:26},(_,i)=>({playerId:'fake-'+i,nameSnapshot:'SENTETİK OYUNCU '+(i+1),shirtNumberSnapshot:String(i+1)}));
  const lineup={preset:'4-3-3',assignments:Object.fromEntries(Array.from({length:11},(_,i)=>[String(i),'fake-'+i]))};
  const output=[];
  for(const templateId of ['reference-roster','reference-pitch']){
   const doc=buildPosterDocument(match,{entries},{kind:'private',templateId,size:'portrait-post',overrides:{}},lineup,'SENTETİK SPOR KULÜBÜ');
   const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');const drawn=[];const old=ctx.fillText.bind(ctx);ctx.fillText=(v,...rest)=>{drawn.push(String(v));return old(v,...rest);};
   const status=await renderPoster(doc,canvas);
   output.push({templateId,available:templates.some(t=>t.id===templateId),fits:status.fits,warnings:status.warnings,hasMatch:drawn.some(v=>v.includes('SENTETİK RAKİP')),hasPlayer:drawn.some(v=>v.includes('SENTETİK OYUNCU')),hasTime:drawn.some(v=>v.includes('19:15')),width:canvas.width,height:canvas.height});
  }
  const publicDoc=buildPosterDocument(match,{entries},{kind:'public',templateId:'reference-roster',size:'portrait-post',overrides:{}},lineup,'SENTETİK SPOR KULÜBÜ');
  const c=document.createElement('canvas'),ctx=c.getContext('2d'),publicTexts=[],old=ctx.fillText.bind(ctx);ctx.fillText=(v,...rest)=>{publicTexts.push(String(v));return old(v,...rest);};const result=await renderPoster(publicDoc,c);
  return {output,publicFits:result.fits,publicLeak:publicTexts.some(s=>s.includes('SENTETİK OYUNCU')||s.includes('Sentetik Beslenme Notu'))};
 },sources);
 for(const item of result.output){expect(item.available,JSON.stringify(item)).toBe(true);expect(item.fits,JSON.stringify(item)).toBe(true);expect(item.hasMatch).toBe(true);expect(item.hasPlayer).toBe(true);expect(item.hasTime).toBe(true);expect(item.width).toBe(1080);expect(item.height).toBe(1350);}
 expect(result.publicFits).toBe(true);expect(result.publicLeak).toBe(false);
});
test('weekly reference poster shows match programme without private data',async({page})=>{
 await page.goto('/');
 const outcome=await page.evaluate(source=>{
  const mods={};function load(id){if(mods[id])return mods[id];const e={};mods[id]=e;new Function('exports','require',source[id])(e,load);return e;}
  const {prepareBoard,renderWeeklyBoard}=load('src/posters/weekly-board.js');
  const matches=[{id:'a',groupId:'g',opponent:'Sentetik Rakip A',matchDate:'2026-11-10',kickoffTime:'17:45',venue:'Sentetik Stadyum A'},{id:'b',groupId:'g',opponent:'Sentetik Rakip B',matchDate:'2026-11-10',kickoffTime:'19:00',venue:'Sentetik Stadyum B'}];
  const plan=prepareBoard(matches,[{id:'g',name:'U14'}],['a','b'],'portrait-post','SENTETİK SPOR KULÜBÜ');
  const c=document.createElement('canvas'),ctx=c.getContext('2d'),words=[],original=ctx.fillText.bind(ctx);ctx.fillText=(str,...a)=>{words.push(String(str));return original(str,...a);};
  const output=renderWeeklyBoard(plan,c);
  return {fits:output.fits,warnings:output.warnings,hasHeading:words.some(v=>v.includes('MAÇ PROGRAMI')),hasOpponent:words.some(v=>v.includes('SENTETİK RAKİP A')),hasVenue:words.some(v=>v.includes('Sentetik Stadyum')),hasPrivate:words.some(v=>v.includes('SENTETİK OYUNCU'))};
 },sources);
 expect(outcome.fits,JSON.stringify(outcome)).toBe(true);
 expect(outcome.hasHeading).toBe(true);expect(outcome.hasOpponent).toBe(true);expect(outcome.hasVenue).toBe(true);expect(outcome.hasPrivate).toBe(false);
});
test('reference templates stay valid as story and weekly five-match export',async({page})=>{
 await page.goto('/');
 const results=await page.evaluate(async sources=>{
  const mods={};function load(id){if(mods[id])return mods[id];const e={};mods[id]=e;new Function('exports','require',sources[id])(e,load);return e;}
  const {buildPosterDocument}=load('src/domain/poster-document.js'),{renderPoster}=load('src/posters/renderer.js'),{prepareBoard,renderWeeklyBoard}=load('src/posters/weekly-board.js');
  const match={matchType:'league',opponent:'Sentetik Rakip',venue:'Sentetik Saha',matchDate:'2026-11-10',kickoffTime:'19:15'};
  const entries=Array.from({length:26},(_,i)=>({playerId:'synthetic-'+i,nameSnapshot:'DENEME OYUNCU '+(i+1),shirtNumberSnapshot:String(i+1)}));
  const lineup={preset:'4-3-3',assignments:Object.fromEntries(Array.from({length:11},(_,i)=>[String(i),'synthetic-'+i]))};
  const output={};for(const templateId of ['reference-roster','reference-pitch']){const doc=buildPosterDocument(match,{entries},{kind:'private',size:'story',templateId,overrides:{}},lineup,'SENTETİK SPOR');const c=document.createElement('canvas');output[templateId]=await renderPoster(doc,c);}
  const matches=Array.from({length:5},(_,i)=>({id:String(i),groupId:'g',opponent:'Sentetik Rakip '+i,matchDate:'2026-11-10',kickoffTime:(14+i)+':00',venue:'Sentetik Stadyum'}));
  const board=prepareBoard(matches,[{id:'g',name:'U14'}],matches.map(m=>m.id),'portrait-post','SENTETİK SPOR');const c=document.createElement('canvas');output.weekly=renderWeeklyBoard(board,c);return output;
 },sources);
 for(const [key,value] of Object.entries(results))expect(value.fits,key+': '+JSON.stringify(value)).toBe(true);
});
test('synthetic preview PNG captures for visual review',async({page})=>{
 await page.goto('/');
 const imgs=await page.evaluate(async sources=>{
  const mods={};function load(id){if(mods[id])return mods[id];const e={};mods[id]=e;new Function('exports','require',sources[id])(e,load);return e;}
  const {buildPosterDocument}=load('src/domain/poster-document.js'),{renderPoster}=load('src/posters/renderer.js'),{prepareBoard,renderWeeklyBoard}=load('src/posters/weekly-board.js');
  const match={matchType:'league',competition:'U14 9. GRUP',opponent:'ÇAYIROVA SENTETİK SK',venue:'SENTETİK NENEHATUN STADI',matchDate:'2026-11-10',kickoffTime:'19:15',meetingTime:'18:15',meetingPlace:'Kulüp Tesisi',mealDeadline:'17:30',mealMenu:'Örnek beslenme notu',kitNotes:'Örnek forma talimatı',hydrationNotes:'Örnek sıvı planı'};
  const entries=Array.from({length:26},(_,i)=>({playerId:'synthetic-'+i,nameSnapshot:'SENTETİK SPORCU '+(i+1),shirtNumberSnapshot:String(i+1)}));
  const lineup={preset:'4-3-3',assignments:Object.fromEntries(Array.from({length:11},(_,i)=>[String(i),'synthetic-'+i]))};
  const out={};for(const templateId of ['reference-roster','reference-pitch']){const doc=buildPosterDocument(match,{entries},{kind:'private',size:'portrait-post',templateId,overrides:{}},lineup,'SENTETİK DARICA SPOR');const c=document.createElement('canvas');const status=await renderPoster(doc,c);if(!status.fits)throw Error(JSON.stringify(status));out[templateId]=c.toDataURL('image/png').split(',')[1];}
  const m=[0,1].map((i)=>({id:String(i),groupId:i?'u14':'u12',opponent:'SENTETİK RAKİP '+(i+1),matchDate:'2026-11-10',kickoffTime:i?'19:00':'17:45',venue:'SENTETİK SAHA '+(i+1)}));
  const plan=prepareBoard(m,[{id:'u12',name:'U12'},{id:'u14',name:'U14'}],m.map(v=>v.id),'portrait-post','SENTETİK DARICA SPOR');const can=document.createElement('canvas');renderWeeklyBoard(plan,can);out.weekly=can.toDataURL('image/png').split(',')[1];return out;
 },sources);
 const dir=path.join(root,'test-results','poster-preview-synthetic');fs.mkdirSync(dir,{recursive:true});
 for(const [name,png] of Object.entries(imgs))fs.writeFileSync(path.join(dir,name+'.png'),Buffer.from(png,'base64'));
 expect(Object.keys(imgs).length).toBe(3);
});

test('goalkeeper is rendered lower on the pitch than forwards',async({page})=>{
 await page.goto('/');
 const positions=await page.evaluate(sources=>{
  const mods={};function load(id){if(mods[id])return mods[id];const e={};mods[id]=e;new Function('exports','require',sources[id])(e,load);return e;}
  const {buildPosterDocument}=load('src/domain/poster-document.js'),{renderPoster}=load('src/posters/renderer.js');
  const entries=Array.from({length:11},(_,i)=>({playerId:'p'+i,nameSnapshot:'OYUNCU '+(i+1),shirtNumberSnapshot:String(i+1)}));
  const plan={preset:'4-3-3',assignments:Object.fromEntries(entries.map((p,i)=>[String(i),p.playerId]))};
  const match={matchType:'league',opponent:'SENTETİK RAKİP',venue:'SENTETİK STAD',matchDate:'2026-11-10',kickoffTime:'19:15'};
  const doc=buildPosterDocument(match,{entries},{kind:'private',size:'portrait-post',templateId:'reference-pitch',overrides:{}},plan,'SENTETİK SPOR');
  const c=document.createElement('canvas'),ctx=c.getContext('2d'),drawn=[],old=ctx.fillText.bind(ctx);
  ctx.fillText=(t,x,y,...args)=>{if(String(t).startsWith('OYUNCU '))drawn.push({text:String(t),y});return old(t,x,y,...args);};
  renderPoster(doc,c);return drawn;
 },Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'tools/module-order.json'),'utf8')).map(id=>[id,fs.readFileSync(path.join(root,id),'utf8')])));
 const gk=positions.find(v=>v.text==='OYUNCU 1'),striker=positions.find(v=>v.text==='OYUNCU 10');
 expect(gk).toBeDefined();expect(striker).toBeDefined();expect(gk.y).toBeGreaterThan(striker.y);
});

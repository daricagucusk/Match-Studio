const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const sources=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'tools/module-order.json'),'utf8')).map(id=>[id,fs.readFileSync(path.join(root,id),'utf8')]));
test('poster preview and PNG use the selected match type across templates and sizes',async({page})=>{
 await page.goto('/');
 const results=await page.evaluate(async sources=>{
  const modules={};function load(id){if(modules[id])return modules[id];const exports={};modules[id]=exports;new Function('exports','require',sources[id])(exports,load);return exports;}
  const {buildPosterDocument}=load('src/domain/poster-document.js'),{renderPoster,exportPng}=load('src/posters/renderer.js');
  const labels={friendly:'HAZIRLIK MAÇI',league:'LİG MAÇI',tournament:'TURNUVA',training:'ANTRENMAN MAÇI',unknown:'MAÇ',legacy:'MAÇ'};
  const results=[];
  for(const [type,label] of Object.entries(labels))for(const kind of ['public','private'])for(const size of ['portrait-post','story'])for(const templateId of ['classic-stadium','elite-minimal','tactical-board','matchday-pro']){
   const match={opponent:'Sahil Spor',venue:'Kent Stadı',matchDate:'2026-10-24',kickoffTime:'14:00',...(type==='legacy'?{}:{matchType:type})};
   const doc=buildPosterDocument(match,{entries:[{playerId:'p1',nameSnapshot:'Ali Test'}]},{kind,size,templateId,overrides:{}});
   const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),drawn=[],original=ctx.fillText.bind(ctx);ctx.fillText=(text,...args)=>{drawn.push(String(text));original(text,...args);};
   const rendering=await renderPoster(doc,canvas);
   results.push({type,kind,size,templateId,expected:label,hasLabel:drawn.some(s=>s.includes(label)),hasWrongLeague:type!=='league'&&drawn.some(s=>s.includes('LİG MAÇI')),fits:rendering.fits,carriedType:doc.match.matchType===match.matchType});
  }
  const custom=buildPosterDocument({matchType:'friendly',competition:'Bahar Kupası',opponent:'Sahil',venue:'Kent',matchDate:'2026-10-24',kickoffTime:'14:00'},null,{kind:'public',overrides:{}});
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),drawn=[],original=ctx.fillText.bind(ctx);ctx.fillText=(s,...args)=>{drawn.push(String(s));original(s,...args);};await renderPoster(custom,canvas);
  const png=await exportPng(custom);return {results,customLabel:drawn.some(s=>s.includes('BAHAR KUPASI')),customType:drawn.some(s=>s.includes('HAZIRLIK MAÇI')),pngType:png.type,pngSignature:Array.from(new Uint8Array(await png.arrayBuffer()).slice(0,8))};
 },sources);
 for(const row of results.results){expect(row.hasLabel,JSON.stringify(row)).toBe(true);expect(row.hasWrongLeague,JSON.stringify(row)).toBe(false);expect(row.carriedType,JSON.stringify(row)).toBe(true);expect(row.fits,JSON.stringify(row)).toBe(true);}
 expect(results.customLabel).toBe(true);expect(results.customType).toBe(true);expect(results.pngType).toBe('image/png');expect(results.pngSignature).toEqual([137,80,78,71,13,10,26,10]);
});

test('saved match type reaches the studio preview and downloaded PNG',async({page},info)=>{
 await page.addInitScript(()=>{window.posterDrawn=[];const original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(text,...args){window.posterDrawn.push({canvas:this.canvas.id,text:String(text)});return original.call(this,text,...args);};});
 const idle=async()=>expect(page.locator('#app')).not.toHaveAttribute('aria-busy','true');
 const nav=async route=>{const item=page.locator(`[data-nav="${route}"]:visible`).first();if(await item.count())await item.click();else{await page.locator('.mobile-more summary').click();await page.locator(`.mobile-more [data-nav="${route}"]`).click();}await idle();};
 await page.goto('/');await page.locator('#club-create-form [name=clubName]').fill('Afiş Test Spor');await page.locator('#club-create-form button').click();await expect(page.locator('.app-shell')).toBeVisible();await idle();
 await nav('archive');await page.locator('#group-form [name=name]').fill('U14');await page.locator('#group-form button').click();await idle();await nav('matches');
 await page.locator('#groupId').selectOption({label:'U14'});await page.locator('#ageCategory').selectOption('U14');await page.locator('#opponent').fill('Sahil Spor');await page.locator('#venue').fill('Kent Stadı');await page.locator('#matchDate').fill('2026-10-24');await page.locator('#kickoffTime').fill('14:00');
 for(const [type,label] of [['friendly','HAZIRLIK MAÇI'],['league','LİG MAÇI']]){
  await page.locator('#matchType').selectOption(type);await page.locator('[data-action=save-match]').click();await idle();await nav('studio');
  await page.locator('[data-kind=public]').click();await idle();await expect(page.locator('#preview-status')).toContainText('Paylaşmaya hazır');
  const preview=await page.evaluate(()=>window.posterDrawn.filter(x=>x.canvas==='poster-canvas').map(x=>x.text));expect(preview.some(s=>s.includes(label))).toBe(true);
  await page.evaluate(()=>{window.posterDrawn=[];});const downloading=page.waitForEvent('download');await page.locator('[data-action=export-png]:visible').first().click();const download=await downloading;expect(await download.failure()).toBe(null);
  const exported=await page.evaluate(()=>window.posterDrawn.map(x=>x.text));expect(exported.some(s=>s.includes(label))).toBe(true);if(type==='friendly')expect(exported.some(s=>s.includes('LİG MAÇI'))).toBe(false);
  if(info.project.name==='desktop'){const dir=path.join(root,'test-results/reviews/update-02');fs.mkdirSync(dir,{recursive:true});await download.saveAs(path.join(dir,type+'-public.png'));}
  await nav('matches');await expect(page.locator('#matchType')).toHaveValue(type);
 }
});

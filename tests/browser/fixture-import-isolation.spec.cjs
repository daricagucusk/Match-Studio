const {test,expect}=require('@playwright/test');
const {idle,nav}=require('./live-fixture.cjs');
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const sources=Object.fromEntries(['src/storage/club-registry.js','src/storage/db.js','src/storage/data-safety.js'].map(id=>[id,fs.readFileSync(path.join(root,id),'utf8')]));
const clubA='fixture_isolation_a',clubB='fixture_isolation_b';
const content='Grup;Rakip;Tarih;Saat;Saha\nU14;Sentetik Aktarim Rakibi;08.11.2026;14:00;Deneme Saha';
async function setup(page){
 await page.goto('/');
 await page.evaluate(async({sources,clubA,clubB})=>{
  const cache={};function load(id){if(cache[id])return cache[id];const e={};cache[id]=e;new Function('exports','require',sources[id])(e,load);return e;}
  const registry=load('src/storage/club-registry.js'),db=load('src/storage/db.js');
  for(const id of [clubA,clubB]){
   await registry.saveClub({id,name:'Sentetik '+id,accent:'#4669D9',createdAt:'2026-10-26T00:00:00Z'});
   db.setClubDatabase(id);
   await db.putRecord('groups',{id:'group_'+id,name:'U14',isActive:true});
   await db.putRecord('matches',{id:'existing_'+id,groupId:'group_'+id,opponent:'Korunan '+id,matchDate:'2026-11-01',kickoffTime:'12:00',venue:'Deneme',state:'draft'});
  }
  registry.setActiveId(clubA);db.closeClubDatabase();
 },{sources,clubA,clubB});
 await page.reload();await expect(page.locator('.app-shell')).toBeVisible();await idle(page);
}
async function snapshot(page){
 return page.evaluate(async ids=>{
  const result={};
  for(const id of ids)result[id]=await new Promise((resolve,reject)=>{
   const request=indexedDB.open('matchstudio-club-'+id);
   request.onerror=()=>reject(request.error);request.onsuccess=()=>{
    const db=request.result,stores=[...db.objectStoreNames],tx=db.transaction(stores),rows={};
    for(const name of stores){const q=tx.objectStore(name).getAll();q.onsuccess=()=>{rows[name]=q.result;};}
    tx.oncomplete=()=>{db.close();resolve(rows);};tx.onerror=()=>{db.close();reject(tx.error);};
   };
  });
  return result;
 },[clubA,clubB]);
}
async function switchClub(page,id){await page.locator('select[id^="club-switch"]:visible').selectOption(id);await idle(page);}
async function upload(page,name='fixtures.csv',buffer=Buffer.from(content)){
 await nav(page,'weekly');
 await page.locator('#weekly-import-file').setInputFiles({name,mimeType:name.endsWith('xlsx')?'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'text/csv',buffer});
}
async function delayRead(page){
 await page.evaluate(()=>{
  const original=File.prototype.text;
  File.prototype.text=async function(){const value=await original.call(this);if(this.name==='slow.csv'){window.fixtureReadStarted=true;await new Promise(resolve=>{window.finishFixtureRead=resolve;});}return value;};
 });
}
for(const slow of [false,true])test(`P0: ${slow?'slow file read':'ready preview'} cannot survive A to B to A with identically named groups`,async({page})=>{
 await setup(page);const before=await snapshot(page);
 if(slow)await delayRead(page);
 await upload(page,slow?'slow.csv':'fixtures.csv');
 if(slow)await expect.poll(()=>page.evaluate(()=>window.fixtureReadStarted)).toBe(true);
 else await expect(page.locator('.weekly-import-preview')).toBeVisible();
 await switchClub(page,clubB);await nav(page,'weekly');
 await expect(page.locator('.weekly-import-preview')).toHaveCount(0);
 await expect(page.locator('[data-action=weekly-import-confirm]')).toHaveCount(0);
 await switchClub(page,clubA);await nav(page,'weekly');
 if(slow){await page.evaluate(()=>window.finishFixtureRead());await expect(page.locator('.toast')).toContainText(/artık geçerli değil|kulüp değişti/);}
 await expect(page.locator('.weekly-import-preview')).toHaveCount(0);
 expect(await snapshot(page)).toEqual(before);
});
for(const slow of [false,true])test(`P0: encrypted restore invalidates ${slow?'in-flight parsing':'an existing preview'} in the same club`,async({page})=>{
 await setup(page);const before=await snapshot(page),password='synthetic-backup-password';
 page.on('dialog',d=>d.accept(d.type()==='prompt'?password:undefined));
 await nav(page,'archive');const download=page.waitForEvent('download');
 await page.locator('[data-action=backup-export-secure]').click();const backupPath=await (await download).path();await idle(page);
 if(slow)await delayRead(page);
 await upload(page,slow?'slow.csv':'fixtures.csv');
 if(slow)await expect.poll(()=>page.evaluate(()=>window.fixtureReadStarted)).toBe(true);
 else await expect(page.locator('.weekly-import-preview')).toBeVisible();
 await nav(page,'archive');await page.locator('#backup-file').setInputFiles(backupPath);
 await expect(page.locator('.toast')).toContainText('Yedek geri yüklendi');await idle(page);
 if(slow){await page.evaluate(()=>window.finishFixtureRead());await expect(page.locator('.toast')).toContainText(/artık geçerli değil|kulüp değişti/);}
 await nav(page,'weekly');await expect(page.locator('.weekly-import-preview')).toHaveCount(0);
 expect(await snapshot(page)).toEqual(before);
});
test('P0: cancelling a preview and rejecting a file leave both club databases unchanged',async({page})=>{
 await setup(page);const before=await snapshot(page);
 await upload(page);await expect(page.locator('.weekly-import-preview')).toBeVisible();
 await page.locator('[data-action=weekly-import-clear]').click();await idle(page);
 await expect(page.locator('.weekly-import-preview')).toHaveCount(0);
 await upload(page,'invalid.csv',Buffer.from('not a fixture'));
 await expect(page.locator('[data-action=weekly-import-confirm]')).toBeDisabled();
 expect(await snapshot(page)).toEqual(before);
});
test('XLSX preview still requires approval and writes only to its source club',async({page})=>{
 // A real, small ZIP/XML workbook, generated entirely from synthetic strings.
 const xlsx=execFileSync('python3',['-c',`import io,zipfile,sys
from xml.sax.saxutils import escape
rows=[['Grup','Rakip','Tarih','Saat','Saha'],['U14','Sentetik Excel Rakibi','2026-11-08','14:00','Deneme Saha']]
xml='<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'
for i,row in enumerate(rows,1):
 xml+='<row r="%d">'%i+''.join('<c r="%s%d" t="inlineStr"><is><t>%s</t></is></c>'%(chr(65+j),i,escape(v)) for j,v in enumerate(row))+'</row>'
xml+='</sheetData></worksheet>'
b=io.BytesIO()
with zipfile.ZipFile(b,'w',zipfile.ZIP_DEFLATED) as z:
 z.writestr('xl/worksheets/sheet1.xml',xml)
 z.writestr('xl/workbook.xml','<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Program" sheetId="1" r:id="rId1"/></sheets></workbook>')
 z.writestr('xl/_rels/workbook.xml.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>')
 z.writestr('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
 z.writestr('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>')
sys.stdout.buffer.write(b.getvalue())`]);
 await setup(page);const before=await snapshot(page);
 await upload(page,'fixtures.xlsx',xlsx);await expect(page.locator('.weekly-import-preview')).toContainText('1 geçerli maç');
 expect(await snapshot(page)).toEqual(before);
 page.once('dialog',d=>d.accept());await page.locator('[data-action=weekly-import-confirm]').click();await idle(page);
 await expect(page.locator('.weekly-import-preview')).toHaveCount(0);
 const after=await snapshot(page);expect(after[clubB]).toEqual(before[clubB]);
 expect(after[clubA].matches).toHaveLength(2);expect(after[clubA].matches.find(m=>m.opponent==='Sentetik Excel Rakibi').groupId).toBe('group_'+clubA);
});

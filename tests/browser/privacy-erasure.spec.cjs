const {test,expect}=require('@playwright/test');
const {idle,nav}=require('./live-fixture.cjs');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const sources=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'tools/module-order.json'),'utf8')).map(id=>[id,fs.readFileSync(path.join(root,id),'utf8')]));
const club='privacy_browser_a',other='privacy_browser_b',password='synthetic-privacy-password';
async function seed(page){
 await page.goto('/');
 const backup=await page.evaluate(async({sources,club,other,password})=>{
  const cache={};function load(id){if(cache[id])return cache[id];const e={};cache[id]=e;new Function('exports','require',sources[id])(e,load);return e;}
  const registry=load('src/storage/club-registry.js'),db=load('src/storage/db.js');
  for(const id of [other,club]){
   await registry.saveClub({id,name:'Sentetik '+id,accent:'#4669D9',createdAt:'2026-10-26T00:00:00Z'});db.setClubDatabase(id);
   await db.putRecord('groups',{id:'g1',name:'U14'});
   await db.putRecord('players',{id:'p1',fullName:'Sentetik Silinecek',isActive:true,groupIds:['g1'],photoAssetId:'photo1'});
   await db.putRecord('players',{id:'p2',fullName:'Sentetik Korunacak',isActive:true,groupIds:['g1']});
   await db.putRecord('assets',{id:'photo1',blob:new Blob([new Uint8Array([137,80,78,71])],{type:'image/png'})});
   await db.putRecord('matches',{id:'m1',groupId:'g1',opponent:'Sentetik Rakip',matchDate:'2026-11-08',kickoffTime:'14:00',venue:'Deneme',state:'draft'});
   await db.putRecord('rosters',{id:'m1',matchId:'m1',entries:[{playerId:'p1',nameSnapshot:'Sentetik Silinecek'},{playerId:'p2',nameSnapshot:'Sentetik Korunacak'}]});
  }
  registry.setActiveId(club);const backup=load('src/storage/backup.js');backup.setBackupClub({id:club,name:'Sentetik '+club});
  const file=await backup.exportEncryptedBackup(password);
  await load('src/storage/recovery.js').saveRestorePoint(club);db.closeClubDatabase();return file.text();
 },{sources,club,other,password});
 await page.reload();await expect(page.locator('.app-shell')).toBeVisible();await idle(page);return backup;
}
async function readStores(page){return page.evaluate(async({club,other})=>{
 const result={};
 for(const name of ['matchstudio-club-'+club,'matchstudio-club-'+other,'matchstudio-recovery-v1'])result[name]=await new Promise((resolve,reject)=>{
  const q=indexedDB.open(name);q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,names=[...db.objectStoreNames],tx=db.transaction(names),data={};
   for(const s of names){const r=tx.objectStore(s).getAll();r.onsuccess=()=>data[s]=r.result;}
   tx.oncomplete=()=>{db.close();resolve(data);};tx.onabort=()=>reject(tx.error);
  };
 });return result;
},{club,other});}
for(const failure of [null,'live'])test(`permanent erasure survives rollback and reload (${failure||'normal'})`,async({page})=>{
 await page.addInitScript(()=>{
  const original=IDBDatabase.prototype.transaction;
  IDBDatabase.prototype.transaction=function(stores,mode,...rest){
   const target=window.privacyFailure;
   if(mode==='readwrite'&&((target==='recovery'&&this.name==='matchstudio-recovery-v1'&&stores==='points')||(target==='live'&&this.name==='matchstudio-club-privacy_browser_a'&&Array.isArray(stores)&&stores.length===9))){window.privacyFailure=null;throw new Error('Synthetic interrupted erasure');}
   return original.call(this,stores,mode,...rest);
  };
 });
 const oldBackup=await seed(page),before=await readStores(page);
 page.on('dialog',d=>d.accept(d.type()==='prompt'?(d.message().includes('GERİ AL')?'GERİ AL':password):undefined));
 await nav(page,'players');await page.locator('[data-action=edit-player][data-id=p1]').click();await idle(page);
 if(failure)await page.evaluate(value=>window.privacyFailure=value,failure);
 await page.locator('[data-action=delete-player][data-id=p1]').click();await idle(page);
 await expect(page.locator('.toast')).toContainText(failure?'yeniden açın':'Oyuncu kalıcı silindi');
 await page.reload();await expect(page.locator('.app-shell')).toBeVisible();await idle(page);
 await nav(page,'players');await expect(page.locator('[data-action=edit-player][data-id=p1]')).toHaveCount(0);
 await expect(page.locator('[data-action=edit-player][data-id=p2]')).toHaveCount(1);
 await nav(page,'archive');await page.locator('[data-action=backup-rollback]').click();await idle(page);
 await expect(page.locator('.toast')).toContainText('geçerli kurtarma noktası yok');
 expect((await readStores(page))['matchstudio-recovery-v1'].points).toHaveLength(0);
 const download=page.waitForEvent('download');await page.locator('[data-action=backup-export-secure]').click();const cleanFile=await (await download).path();await idle(page);
 await page.locator('#backup-file').setInputFiles(cleanFile);await idle(page);await expect(page.locator('.toast')).toContainText('Yedek geri yüklendi');
 await nav(page,'archive');await page.locator('[data-action=backup-rollback]').click();await idle(page);
 await expect(page.locator('.toast')).toContainText('geri alındı');
 const after=await readStores(page),active=after['matchstudio-club-'+club],recovery=after['matchstudio-recovery-v1'];
 expect(JSON.stringify(active)).not.toContain('Sentetik Silinecek');expect(JSON.stringify(active)).not.toContain('"p1"');expect(active.assets).toHaveLength(0);
 expect(JSON.stringify(recovery.points)).not.toContain('Sentetik Silinecek');expect(JSON.stringify(recovery.points)).not.toContain('photo1');
 expect(recovery.erasedPlayers.find(e=>e.clubId===club).pending).toBe(false);
 expect(after['matchstudio-club-'+other]).toEqual(before['matchstudio-club-'+other]);
 await nav(page,'archive');await page.locator('#backup-file').setInputFiles({name:'old-synthetic-backup.json',mimeType:'application/json',buffer:Buffer.from(oldBackup)});await idle(page);
 await expect(page.locator('.toast')).toContainText('kalıcı olarak silinmiş');expect(await readStores(page)).toEqual(after);
});

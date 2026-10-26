const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createLoader}=require('./loader.cjs');
function locks(){
 const pending=new Map();
 return {request(name,options,fn){if(typeof options==='function'){fn=options;options={};}const old=pending.get(name)||Promise.resolve();const task=old.catch(()=>{}).then(()=>fn({name}));pending.set(name,task);return task;}};
}
async function fixture(){
 const env=createLoader({navigator:{locks:locks()}}),{load}=env,db=load('src/storage/db.js');db.setClubDatabase('club_test_01');
 const backup=load('src/storage/backup.js');backup.setBackupClub({id:'club_test_01',name:'Test Kulübü'});
 await db.putRecord('groups',{id:'g1',name:'U14',ageCategory:'U14'});
 for(const [id,name] of [['p1','Ali Bir'],['p2','Can İki'],['p3','Efe Üç']])await db.putRecord('players',{id,fullName:name,groupIds:['g1'],birthYear:2012});
 await db.putRecord('matches',{id:'m1',groupId:'g1',opponent:'Rakip Spor',matchDate:'2026-10-22',kickoffTime:'14:00',venue:'Merkez Saha',state:'draft'});
 return {...env,db,backup};
}
test('pending database open cannot attach to a different club',async()=>{
 const {load}=createLoader();const db=load('src/storage/db.js');
 db.setClubDatabase('club_first');const first=db.openDatabase();const rejection=assert.rejects(first,/kulüp değişti/);
 db.setClubDatabase('club_second');await db.openDatabase();await rejection;
 await db.putRecord('groups',{id:'second'});
 db.setClubDatabase('club_first');assert.equal((await db.listRecords('groups')).length,0);
});
test('transaction abort preserves all stores',async()=>{
 const {db}=await fixture();await assert.rejects(db.transact(['players','groups'],'readwrite',tx=>{tx.objectStore('players').clear();tx.objectStore('groups').clear();tx.abort();}));
 assert.equal((await db.listRecords('players')).length,3);assert.equal((await db.listRecords('groups')).length,1);
});
test('queued write cancelled on club switch',async()=>{
 const {db}=await fixture();let release,started;
 const gate=new Promise(r=>release=r),ready=new Promise(r=>started=r);
 const task=db.withExclusiveClubOperation(async()=>{started();await gate;});await ready;
 const pending=db.putRecord('groups',{id:'should-not-exist'});const check=assert.rejects(pending,/kulüp değişti/);
 db.setClubDatabase('club_other');release();await task;await check;
 assert.equal((await db.listRecords('groups')).length,0);
});
test('encrypted backup round trip preserves image and live history; rollback restores previous data',async()=>{
 const {db,backup,load}=await fixture();
 const live=load('src/storage/live-match.js'),clock=load('src/storage/match-clock.js');
 await live.createMatchSession({matchId:'m1',rules:{periods:[35,35],substitutionMode:'returnAllowed',maximumNamedSubstitutes:10},initialPlayerIds:['p1','p2','p3'],currentOnFieldIds:['p1','p2']});
 await clock.commitClockAction({matchId:'m1',action:'START',expectedRevision:0,idempotencyKey:'start',nowMs:1000});
 await db.putRecord('assets',{id:'photo',blob:new Blob([new Uint8Array([137,80,78,71])],{type:'image/png'}),mime:'image/png'});
 await db.putRecord('settings',{id:'clubLogo',value:'photo'});
 const password='a-long-test-password',file=await backup.exportEncryptedBackup(password);
 assert.equal((await backup.inspectBackup(file)).needsPassword,true);
 assert.equal((await backup.inspectBackup(file,'wrong-password-123')).valid,false);
 const report=await backup.inspectBackup(file,password);assert.equal(report.valid,true,report.warnings.join(';'));
 await db.putRecord('players',{id:'p4',fullName:'Son Kayıt',groupIds:['g1']});
 await assert.rejects(backup.restoreBackup(file,true,'wrong-password-123'));assert.equal((await db.listRecords('players')).length,4);
 await backup.restoreBackup(file,true,password);
 assert.equal((await db.listRecords('players')).length,3);
 assert.equal((await live.listMatchEvents('m1')).length,1);
 assert.deepEqual(new Uint8Array(await (await db.getRecord('assets','photo')).blob.arrayBuffer()),new Uint8Array([137,80,78,71]));
 await load('src/storage/recovery.js').rollbackToRestorePoint('club_test_01');
 assert.equal((await db.listRecords('players')).length,4);
});
test('malformed backup and cancelled restore leave data unchanged',async()=>{
 const {db,backup}=await fixture();
 for(const file of [new Blob(['{']),new Blob([JSON.stringify({application:'MatchStudioUniversal',schemaVersion:3,stores:{}})])]){
  await assert.rejects(backup.restoreBackup(file,true));assert.equal((await db.listRecords('players')).length,3);
 }
 await assert.rejects(backup.restoreBackup(await backup.exportBackup(),false));
 assert.equal((await db.listRecords('matches')).length,1);
});
test('legacy v1/v2 backups normalize live stores without changing database identity',async()=>{
 const {db,backup}=await fixture();const data=JSON.parse(await (await backup.exportBackup()).text());
 for(const schemaVersion of [1,2]){data.schemaVersion=schemaVersion;delete data.stores.matchSessions;delete data.stores.matchEvents;
  const file=new Blob([JSON.stringify(data)]);assert.equal((await backup.inspectBackup(file)).valid,true);await backup.restoreBackup(file,true);
  assert.equal((await db.listRecords('matchSessions')).length,0);assert.equal(db.getDatabaseName(),'matchstudio-club-club_test_01');}
});
test('restore rejected if club changes during file decoding',async()=>{
 const {db,backup}=await fixture();const file=await backup.exportBackup();let release;
 const delayed={size:file.size,text:()=>new Promise(r=>release=async()=>r(await file.text()))};
 const task=backup.restoreBackup(delayed,true);const check=assert.rejects(task,/kulüp değişti/);
 db.setClubDatabase('club_new_01');await release();await check;
 assert.equal((await db.listRecords('players')).length,0);
 db.setClubDatabase('club_test_01');assert.equal((await db.listRecords('players')).length,3);
});
module.exports={fixture};
test('recovery storage failure prevents destructive restore',async()=>{
 const {db,backup,context}=await fixture();const file=await backup.exportBackup();await db.putRecord('players',{id:'extra',fullName:'Korunacak Oyuncu',groupIds:['g1']});
 const factory=context.indexedDB,open=factory.open.bind(factory);factory.open=(name,...args)=>{if(name==='matchstudio-recovery-v1')throw Error('QuotaExceededError: kurtarma alanı dolu');return open(name,...args);};
 await assert.rejects(backup.restoreBackup(file,true),/QuotaExceeded/);assert.equal((await db.listRecords('players')).length,4);
});
test('authenticated encryption rejects tampered ciphertext',async()=>{
 const {backup,db}=await fixture();const password='a-long-test-password';const json=JSON.parse(await (await backup.exportEncryptedBackup(password)).text());json.data=(json.data[0]==='A'?'B':'A')+json.data.slice(1);
 await assert.rejects(backup.restoreBackup(new Blob([JSON.stringify(json)]),true,password));assert.equal((await db.listRecords('players')).length,3);
});
test('match deletion cleans linked session, events, lineup and poster atomically',async()=>{
 const {db,load}=await fixture();const live=load('src/storage/live-match.js');await live.createMatchSession({matchId:'m1',rules:{periods:[35,35],substitutionMode:'returnAllowed',maximumNamedSubstitutes:5},initialPlayerIds:['p1'],currentOnFieldIds:['p1']});
 await load('src/storage/match-clock.js').commitClockAction({matchId:'m1',action:'START',expectedRevision:0,idempotencyKey:'start',nowMs:1000});
 await db.putRecord('settings',{id:'lineup:m1',value:{assignments:{0:'p1'}}});await db.putRecord('rosters',{id:'m1',matchId:'m1',entries:[]});await db.putRecord('posterDrafts',{id:'m1:private',matchId:'m1'});
 await db.deleteMatchAtomic('m1');for(const name of ['matches','rosters','posterDrafts','settings','matchSessions','matchEvents'])assert.equal((await db.listRecords(name)).length,0,name);
 assert.equal((await db.listRecords('players')).length,3);
});
test('linked groups cannot be deleted; empty groups clean only their own settings',async()=>{
 const {db}=await fixture();await assert.rejects(db.safeDeleteGroup('g1'),/Grup silinemiyor/);assert.ok(await db.getRecord('groups','g1'));
 await db.putRecord('groups',{id:'empty'});await db.putRecord('settings',{id:'teamDepth:empty',value:{}});await db.putRecord('settings',{id:'keep',value:1});
 await db.safeDeleteGroup('empty');assert.equal(await db.getRecord('groups','empty'),null);assert.equal(await db.getRecord('settings','teamDepth:empty'),null);assert.equal((await db.getRecord('settings','keep')).value,1);
});
test('legacy import refuses a nonempty destination and leaves legacy input unchanged',async()=>{
 const {db}=await fixture();const incoming={groups:[{id:'legacy',name:'Eski Grup'}]};await assert.rejects(db.copyLegacyToActive(incoming),/boş kulübe/);assert.equal(await db.getRecord('groups','legacy'),null);
 db.setClubDatabase('empty_legacy');await db.copyLegacyToActive(incoming);assert.equal((await db.getRecord('groups','legacy')).name,'Eski Grup');assert.equal(incoming.groups.length,1);
});
test('database v1 upgrades to v2 without removing existing player records',async()=>{
 const {load,context}=createLoader();const name='matchstudio-club-upgrade_01';
 await new Promise((resolve,reject)=>{const q=context.indexedDB.open(name,1);q.onupgradeneeded=()=>{for(const store of ['players','groups','matches','rosters','posterDrafts','assets','settings'])q.result.createObjectStore(store,{keyPath:'id'});q.transaction.objectStore('players').add({id:'old-player',fullName:'Eski Oyuncu'});};q.onsuccess=()=>{q.result.close();resolve();};q.onerror=()=>reject(q.error);});
 const db=load('src/storage/db.js');db.setClubDatabase('upgrade_01');assert.equal((await db.getRecord('players','old-player')).fullName,'Eski Oyuncu');
 const connection=await db.openDatabase();assert.equal(connection.version,2);assert.equal(connection.objectStoreNames.contains('matchEvents'),true);assert.equal(connection.transaction('matchEvents').objectStore('matchEvents').indexNames.contains('sessionIdempotency'),true);
});

test('permanent erasure revokes the recovery point and denies old encrypted backup restores',async()=>{
 const {db,backup,load}=await fixture();
 const recovery=load('src/storage/recovery.js');
 const password='strong-test-only-passphrase';
 const older=await backup.exportEncryptedBackup(password);
 await recovery.saveRestorePoint('club_test_01');
 assert.ok(await recovery.readRestorePoint('club_test_01'));
 await db.erasePlayerAtomic('p1');
 assert.equal(await db.getRecord('players','p1'),null);
 assert.equal(await recovery.readRestorePoint('club_test_01'),null);
 assert.ok((await recovery.listErasedPlayerIds('club_test_01')).includes('p1'));
 await assert.rejects(backup.restoreBackup(older,true,password),/kalıcı olarak silinmiş oyuncu/);
 assert.equal(await db.getRecord('players','p1'),null);
 assert.equal((await db.listRecords('players')).length,2);
});
test('permanent erasure cannot start when recovery protection is unavailable',async()=>{
 const {db,context}=await fixture();
 const factory=context.indexedDB,realOpen=factory.open.bind(factory);
 factory.open=(name,...args)=>{if(name==='matchstudio-recovery-v1')throw Error('Recoverystore blocked');return realOpen(name,...args);};
 await assert.rejects(db.erasePlayerAtomic('p1'),/Recoverystore blocked/);
 assert.equal((await db.getRecord('players','p1')).fullName,'Ali Bir');
});

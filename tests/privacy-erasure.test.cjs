const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createLoader}=require('./loader.cjs');
const club='privacy_club_a';
function locks(){const queues=new Map();return {request(name,_options,fn){const next=(queues.get(name)||Promise.resolve()).catch(()=>{}).then(fn);queues.set(name,next);return next;}};}
async function fixture(){
 const env=createLoader({navigator:{locks:locks()}}),{load,context}=env,db=load('src/storage/db.js');
 let recoveryHandle;const open=context.indexedDB.open.bind(context.indexedDB);
 context.indexedDB.open=(name,...args)=>{const q=open(name,...args);if(name==='matchstudio-recovery-v1')q.addEventListener('success',()=>{recoveryHandle=q.result;});return q;};
 db.setClubDatabase(club);const recovery=load('src/storage/recovery.js'),backup=load('src/storage/backup.js');backup.setBackupClub({id:club,name:'Sentetik Gizlilik'});
 await db.putRecord('groups',{id:'g1',name:'U14'});
 for(const id of ['p1','p2','p3'])await db.putRecord('players',{id,fullName:'Sentetik '+id,groupIds:['g1'],...(id==='p1'?{photoAssetId:'photo1'}:{})});
 await db.putRecord('assets',{id:'photo1',blob:new Blob([new Uint8Array([137,80,78,71])],{type:'image/png'})});
 await db.putRecord('matches',{id:'m1',groupId:'g1',opponent:'Sentetik Rakip'});
 await db.putRecord('rosters',{id:'m1',matchId:'m1',entries:['p1','p2','p3'].map(playerId=>({playerId,nameSnapshot:'Sentetik '+playerId}))});
 await db.putRecord('settings',{id:'lineup:m1',value:{assignments:{0:'p1',1:'p3'},positionOverrides:{p1:'GK'},shirtNumberOverrides:{p1:1}}});
 await db.putRecord('settings',{id:'teamDepth:g1',value:{roles:{GK:['p1'],CM:['p2','p3']}}});
 await load('src/storage/live-match.js').createMatchSession({matchId:'m1',rules:{periods:[35,35],substitutionMode:'returnAllowed',maximumNamedSubstitutes:5},initialPlayerIds:['p1','p2','p3'],currentOnFieldIds:['p1','p3']});
 await load('src/storage/match-clock.js').commitClockAction({matchId:'m1',action:'START',expectedRevision:0,idempotencyKey:'start',nowMs:1000});
 await load('src/storage/match-sporting-events.js').commitSportingEvent({matchId:'m1',type:'GOAL',payload:{playerId:'p1',assistPlayerId:'p3'},expectedRevision:1,idempotencyKey:'goal',nowMs:301000});
 await load('src/storage/match-substitutions.js').commitSubstitution({matchId:'m1',outPlayerId:'p1',inPlayerId:'p2',expectedRevision:2,idempotencyKey:'sub',nowMs:601000});
 await load('src/storage/match-clock.js').commitClockAction({matchId:'m1',action:'PAUSE',expectedRevision:3,idempotencyKey:'pause',nowMs:1201000});
 await recovery.saveRestorePoint(club);
 return {...env,db,recovery,backup,recoveryHandle:()=>recoveryHandle};
}
const snapshot=env=>env.recovery.captureCurrentStores();
function report(env,stores){return env.load('src/domain/match-events-report.js').projectMatchReport(stores.matchSessions[0],stores.matchEvents,stores.players,stores.rosters[0],1201000);}
function clean(stores){const text=JSON.stringify(stores);assert.ok(!text.includes('"p1"'));assert.ok(!text.includes('Sentetik p1'));assert.ok(!text.includes('photo1'));}
async function rawPoint(env){return new Promise((resolve,reject)=>{const tx=env.recoveryHandle().transaction('points');const q=tx.objectStore('points').get(club);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});}


async function markers(env){return new Promise((resolve,reject)=>{const q=env.recoveryHandle().transaction('erasedPlayers').objectStore('erasedPlayers').getAll();q.onsuccess=()=>resolve(q.result.filter(r=>r.clubId===club));q.onerror=()=>reject(q.error);});}
for(const id of ['p1','p2'])test('erasure of '+id+' preserves score and other players substitution minutes',async()=>{
 const env=await fixture(),before=report(env,await snapshot(env));await env.db.erasePlayerAtomic(id);
 const after=await snapshot(env),projected=report(env,after);
 assert.equal(projected.ourGoals,before.ourGoals);assert.equal(projected.minutesReviewRequired,false);
 assert.deepEqual(JSON.parse(JSON.stringify(projected.players)),JSON.parse(JSON.stringify(before.players.filter(p=>p.id!==id))));
 assert.equal(await env.recovery.readRestorePoint(club),null);assert.equal(await rawPoint(env),undefined);
 if(id==='p1')clean(after);assert.equal((await markers(env))[0].pending,false);
 await env.recovery.saveRestorePoint(club);await env.recovery.rollbackToRestorePoint(club);
 assert.equal((await snapshot(env)).players.some(p=>p.id===id),false);
});
test('encrypted and legacy backups cannot resurrect erased identities or change recovery',async()=>{
 const env=await fixture(),password='synthetic-long-password',encrypted=await env.backup.exportEncryptedBackup(password),plain=JSON.parse(await (await env.backup.exportBackup()).text());
 await env.db.erasePlayerAtomic('p1');const before=JSON.stringify(await snapshot(env));
 assert.equal((await env.backup.inspectBackup(encrypted,password)).valid,false);
 await assert.rejects(env.backup.restoreBackup(encrypted,true,password),/kalıcı olarak silinmiş/);
 for(const schemaVersion of [1,2])await assert.rejects(env.backup.restoreBackup(new Blob([JSON.stringify({...plain,schemaVersion})]),true),/kalıcı olarak silinmiş/);
 assert.equal(JSON.stringify(await snapshot(env)),before);assert.equal(await rawPoint(env),undefined);
 await env.backup.restoreBackup(await env.backup.exportEncryptedBackup(password),true,password);clean(await snapshot(env));
});
test('journal failure leaves live records and original recovery intact',async()=>{
 const env=await fixture(),before=JSON.stringify(await snapshot(env)),point=JSON.stringify(await rawPoint(env)),handle=env.recoveryHandle(),transaction=handle.transaction.bind(handle);
 handle.transaction=(names,mode,...args)=>{if(mode==='readwrite'&&Array.isArray(names)&&names.includes('erasedPlayers'))throw Error('QuotaExceededError');return transaction(names,mode,...args);};
 await assert.rejects(env.db.erasePlayerAtomic('p1'),/QuotaExceeded/);handle.transaction=transaction;
 assert.equal(JSON.stringify(await snapshot(env)),before);assert.equal(JSON.stringify(await rawPoint(env)),point);assert.equal((await markers(env)).length,0);
});
test('restart completes an interrupted live erase using the existing v2 tombstones',async()=>{
 const env=await fixture(),handle=await env.db.openDatabase(),transaction=handle.transaction.bind(handle);
 handle.transaction=(names,mode,...args)=>{if(mode==='readwrite')throw Error('Injected interruption');return transaction(names,mode,...args);};
 await assert.rejects(env.db.erasePlayerAtomic('p1'),/yeniden açın/);handle.transaction=transaction;
 assert.equal((await markers(env))[0].pending,true);assert.equal(await env.recovery.readRestorePoint(club),null);
 env.db.closeClubDatabase();env.recoveryHandle().close();
 const restarted=createLoader({indexedDB:env.context.indexedDB,navigator:{locks:locks()}});
 restarted.load('src/storage/db.js').setClubDatabase(club);await restarted.load('src/storage/privacy-erasure.js').resumePlayerErasures();
 const recovery=restarted.load('src/storage/recovery.js');clean(await recovery.captureCurrentStores());
 await recovery.saveRestorePoint(club);await recovery.rollbackToRestorePoint(club);clean(await recovery.captureCurrentStores());
});
test('erasure during delayed file decoding is checked again under the restore lock',async()=>{
 const env=await fixture(),file=await env.backup.exportBackup();let finish;
 const delayed={size:file.size,text:()=>new Promise(resolve=>{finish=async()=>resolve(await file.text());})};
 const restoring=env.backup.restoreBackup(delayed,true),rejected=assert.rejects(restoring,/kalıcı olarak silinmiş/);
 await env.db.erasePlayerAtomic('p1');await finish();await rejected;clean(await snapshot(env));
});
test('the same player ID in another club and shared image references are retained',async()=>{
 const env=await fixture();await env.db.putRecord('settings',{id:'clubLogo',value:'photo1'});
 env.db.setClubDatabase('privacy_club_b');await env.db.putRecord('players',{id:'p1',fullName:'Other synthetic club'});
 env.db.setClubDatabase(club);await env.db.erasePlayerAtomic('p1');assert.ok(await env.db.getRecord('assets','photo1'));
 env.db.setClubDatabase('privacy_club_b');await env.load('src/storage/privacy-erasure.js').resumePlayerErasures();assert.equal((await env.db.getRecord('players','p1')).fullName,'Other synthetic club');
});
test('recovery v1 upgrade preserves existing points and old v2 markers are reconciled',async()=>{
 const env=createLoader({navigator:{locks:locks()}}),stores=Object.fromEntries(env.load('src/storage/db.js').STORES.map(s=>[s,[]]));
 const point={id:club,createdAt:new Date().toISOString(),stores,counts:Object.fromEntries(Object.keys(stores).map(s=>[s,0]))};
 await new Promise((resolve,reject)=>{const q=env.context.indexedDB.open('matchstudio-recovery-v1',1);q.onupgradeneeded=()=>{q.result.createObjectStore('points',{keyPath:'id'});q.transaction.objectStore('points').put(point);};q.onsuccess=()=>{q.result.close();resolve();};q.onerror=()=>reject(q.error);});
 const recovery=env.load('src/storage/recovery.js');assert.equal(JSON.stringify(await recovery.readRestorePoint(club)),JSON.stringify(point));
 const db=env.load('src/storage/db.js');db.setClubDatabase(club);await db.putRecord('players',{id:'p1',fullName:'Synthetic older interrupted delete'});
 await new Promise((resolve,reject)=>{const q=env.context.indexedDB.open('matchstudio-recovery-v1',2);q.onsuccess=()=>{const handle=q.result,tx=handle.transaction('erasedPlayers','readwrite');tx.objectStore('erasedPlayers').put({id:club+'|p1',clubId:club,playerId:'p1',erasedAt:'2026-10-26'});tx.oncomplete=()=>{handle.close();resolve();};tx.onerror=()=>reject(tx.error);};});
 await env.load('src/storage/privacy-erasure.js').resumePlayerErasures();assert.equal(await db.getRecord('players','p1'),null);
});

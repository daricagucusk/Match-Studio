const {planPlayerErasure}=require('src/storage/data-safety.js');
const DB_VERSION=2,LEGACY_STORES=['players','groups','matches','rosters','posterDrafts','assets','settings'],LIVE_STORES=['matchSessions','matchEvents'],STORES=[...LEGACY_STORES,...LIVE_STORES];
let currentClubId=null,opening=null,connection=null,generation=0;
const changed=()=>Error('Aktif kulüp değişti. İşlem iptal edildi; yeniden deneyin.');
function clubContext(){if(!currentClubId)throw Error('Önce bir kulüp seçin.');return {id:currentClubId,generation};}
function assertContext(ctx){if(ctx.id!==currentClubId||ctx.generation!==generation)throw changed();}
function setClubDatabase(id){if(!/^[a-zA-Z0-9_-]{8,80}$/.test(String(id||'')))throw Error('Geçersiz kulüp anahtarı.');if(id!==currentClubId){generation++;if(connection)connection.close();connection=null;opening=null;currentClubId=id;}}
function closeClubDatabase(id){if(id&&id!==currentClubId)return;generation++;if(connection)connection.close();connection=null;opening=null;currentClubId=null;}
function getDatabaseName(){return 'matchstudio-club-'+clubContext().id;}
function openDatabase(){
 if(opening)return opening;
 const ctx=clubContext(),name='matchstudio-club-'+ctx.id;
 let rejected=false;
 const promise=new Promise((resolve,reject)=>{
  const req=indexedDB.open(name,DB_VERSION);
  req.onupgradeneeded=()=>{const db=req.result;for(const store of STORES)if(!db.objectStoreNames.contains(store))db.createObjectStore(store,{keyPath:'id'});if(req.transaction){const sessions=req.transaction.objectStore('matchSessions'),events=req.transaction.objectStore('matchEvents');if(!sessions.indexNames.contains('matchId'))sessions.createIndex('matchId','matchId',{unique:true});if(!events.indexNames.contains('matchId'))events.createIndex('matchId','matchId');if(!events.indexNames.contains('sessionId'))events.createIndex('sessionId','sessionId');if(!events.indexNames.contains('sessionSequence'))events.createIndex('sessionSequence',['sessionId','sequence'],{unique:true});if(!events.indexNames.contains('sessionIdempotency'))events.createIndex('sessionIdempotency',['sessionId','idempotencyKey'],{unique:true});}};
  req.onsuccess=()=>{
   const db=req.result;
   if(rejected||ctx.id!==currentClubId||ctx.generation!==generation){db.close();reject(changed());return;}
   connection=db;
   db.onversionchange=()=>{db.close();if(connection===db){connection=null;opening=null;generation++;}};
   db.onclose=()=>{if(connection===db){connection=null;opening=null;generation++;}};
   resolve(db);
  };
  const fail=error=>{rejected=true;if(ctx.generation===generation&&ctx.id===currentClubId)opening=null;reject(error);};
  req.onerror=()=>fail(req.error);
  req.onblocked=()=>fail(Error('Veritabanı başka sekmede açık. Diğer sekmeleri kapatıp yeniden deneyin.'));
 });
 opening=promise;return promise;
}
async function withExclusiveClubOperation(handler,ctx=clubContext()){
 assertContext(ctx);
 if(!globalThis.navigator?.locks)throw Error('Güvenli geri yükleme için güncel Chrome veya HTTPS/localhost kullanın.');
 return navigator.locks.request('matchstudio-write:'+ctx.id,{mode:'exclusive'},async()=>{
  assertContext(ctx);
  const scope={...ctx,exclusive:true};
  return handler((names,mode,fn)=>transact(names,mode,fn,scope));
 });
}
async function transact(storeNames,mode,handler,scope=null){
 const ctx=scope||clubContext();assertContext(ctx);
 const run=async()=>{
  assertContext(ctx);const db=await openDatabase();assertContext(ctx);
  return new Promise((resolve,reject)=>{let outcome;const tx=db.transaction(storeNames,mode);tx.oncomplete=()=>resolve(outcome);tx.onerror=()=>reject(tx.error||Error('Depolama işlemi başarısız.'));tx.onabort=()=>reject(tx.error||Error('Depolama işlemi iptal edildi.'));try{outcome=handler(tx)}catch(e){tx.abort();reject(e)}});
 };
 if(mode==='readwrite'&&!scope?.exclusive&&globalThis.navigator?.locks)return navigator.locks.request('matchstudio-write:'+ctx.id,{mode:'shared'},run);
 return run();
}
async function putRecord(storeName,record){await transact([storeName],'readwrite',tx=>tx.objectStore(storeName).put(record));return record;}
async function getRecord(storeName,id){const db=await openDatabase();return new Promise((resolve,reject)=>{const req=db.transaction(storeName).objectStore(storeName).get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)});}
async function listRecords(storeName){const db=await openDatabase();return new Promise((resolve,reject)=>{const req=db.transaction(storeName).objectStore(storeName).getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});}
async function deleteRecord(storeName,id){return transact([storeName],'readwrite',tx=>tx.objectStore(storeName).delete(id));}
async function deleteMatchAtomic(id){await transact(['matches','rosters','settings','posterDrafts','matchSessions','matchEvents'],'readwrite',tx=>{tx.objectStore('matches').delete(id);tx.objectStore('rosters').delete(id);tx.objectStore('settings').delete('lineup:'+id);tx.objectStore('matchSessions').delete('session:'+id);const eventStore=tx.objectStore('matchEvents');if(typeof eventStore.index==='function'){const eventsReq=eventStore.index('matchId').openCursor(IDBKeyRange.only(id));eventsReq.onsuccess=()=>{const cursor=eventsReq.result;if(cursor){cursor.delete();cursor.continue();}};}else{const eventsReq=eventStore.getAll();eventsReq.onsuccess=()=>{for(const evt of eventsReq.result)if(evt.matchId===id)eventStore.delete(evt.id);};}const req=tx.objectStore('posterDrafts').getAll();req.onsuccess=()=>{for(const d of req.result)if(d.matchId===id)tx.objectStore('posterDrafts').delete(d.id);};});}
// One IndexedDB transaction ensures deletion and all linked cleanup either all commit or all roll back.
async function erasePlayerAtomic(id){
 let result=null;
 await transact(['players','rosters','settings','posterDrafts','assets','matchSessions','matchEvents'],'readwrite',tx=>{
  const names=['players','rosters','settings','posterDrafts','assets','matchSessions','matchEvents'];
  const snapshot={},read=[];
  for(const n of names){const r=tx.objectStore(n).getAll();r.onsuccess=()=>{snapshot[n]=r.result;read.push(n);if(read.length===names.length){
   try{
    const plan=planPlayerErasure(id,{...snapshot});
    tx.objectStore('players').delete(id);
    for(const row of plan.rosters)tx.objectStore('rosters').put(row);
    for(const row of plan.settings)tx.objectStore('settings').put(row);
    for(const aid of plan.removedAssets)tx.objectStore('assets').delete(aid);for(const row of plan.matchSessions)tx.objectStore('matchSessions').put(row);for(const row of plan.matchEvents)tx.objectStore('matchEvents').put(row);
    result={rosterCount:plan.rosterCount,erasedEntryCount:plan.erasedEntryCount,assetCount:plan.removedAssets.length};
   }catch(err){tx.abort();}
  }};}
 });
 if(!result)throw Error('Oyuncu silme işlemi tamamlanamadı; hiçbir kayıt değişmedi.');
 return result;
}
async function safeDeleteGroup(id){
 let problem=null;
 await transact(['players','matches','groups','settings'],'readwrite',tx=>{
  const players=tx.objectStore('players').getAll(),matches=tx.objectStore('matches').getAll();let ready=0;
  const check=()=>{if(++ready!==2)return;
   const n=players.result.filter(p=>(p.groupIds||[]).includes(id)).length,m=matches.result.filter(x=>x.groupId===id).length;
   if(n||m){problem=Error('Grup silinemiyor: '+n+' oyuncu, '+m+' maç bağlı. Önce bu kayıtları başka gruba taşıyın veya kaldırın.');return;}
   tx.objectStore('groups').delete(id);tx.objectStore('settings').delete('teamDepth:'+id);tx.objectStore('settings').delete('teamPitchPrefs:'+id);
  };
  players.onsuccess=check;matches.onsuccess=check;
 });
 if(problem)throw problem;
}
async function copyLegacyToActive(stores){
 if(!stores||typeof stores!=='object')throw Error('Geçersiz eski kayıtlar.');
 let notEmpty=false;
 await transact(STORES,'readwrite',tx=>{
  let completed=0;
  for(const name of STORES){const request=tx.objectStore(name).count();request.onsuccess=()=>{
   if(request.result)notEmpty=true;
   if(++completed===STORES.length&&!notEmpty){for(const target of STORES)for(const item of stores[target]||[])tx.objectStore(target).add(item);}
  };}
 });
 if(notEmpty)throw Error('Eski kayıt aktarımı yalnızca boş kulübe yapılabilir.');return true;
}
async function saveMatchAndRoster(match,roster,plan=null){return transact(plan?['matches','rosters','settings']:['matches','rosters'],'readwrite',tx=>{tx.objectStore('matches').put(match);tx.objectStore('rosters').put({id:match.id,...roster});if(plan)tx.objectStore('settings').put({id:'lineup:'+match.id,value:plan});});}
async function findLastRosterForGroup(groupId,excludeId=null){const [matches,rosters]=await Promise.all([listRecords('matches'),listRecords('rosters')]);const active=matches.find(m=>m.id===excludeId);const candidates=matches.filter(m=>m.groupId===groupId&&m.id!==excludeId&&(!active?.matchDate || !m.matchDate || m.matchDate<=active.matchDate)).sort((a,b)=>(b.matchDate||'').localeCompare(a.matchDate||'')||(b.updatedAt||'').localeCompare(a.updatedAt||''));for(const match of candidates){const roster=rosters.find(r=>r.id===match.id);if(roster?.entries?.length)return{match,roster};}return null;}
Object.assign(exports,{DB_VERSION,STORES,LEGACY_STORES,LIVE_STORES,clubContext,assertContext,withExclusiveClubOperation,getDatabaseName,setClubDatabase,closeClubDatabase,openDatabase,transact,putRecord,getRecord,listRecords,deleteRecord,deleteMatchAtomic,safeDeleteGroup,erasePlayerAtomic,copyLegacyToActive,saveMatchAndRoster,findLastRosterForGroup});

// P0.2 local recovery: one pre-import restore point per club. Same browser/origin only.
// Images remain Blob objects and are intentionally NOT exported or synced.
const {STORES,listRecords,transact,withExclusiveClubOperation,clubContext,assertContext}=require('src/storage/db.js');
const {checkSnapshotIntegrity}=require('src/storage/data-safety.js');
const DB_NAME='matchstudio-recovery-v1',STORE='points';
const DAYS=7,MAX_AGE=DAYS*24*3600*1000;
let recoveryHandle=null;
function openRecovery(){if(recoveryHandle)return Promise.resolve(recoveryHandle);return new Promise((resolve,reject)=>{const q=indexedDB.open(DB_NAME,1);q.onupgradeneeded=()=>q.result.createObjectStore(STORE,{keyPath:'id'});q.onsuccess=()=>{recoveryHandle=q.result;recoveryHandle.onversionchange=()=>{recoveryHandle.close();recoveryHandle=null;};resolve(recoveryHandle)};q.onerror=()=>reject(q.error);});}
const validId=id=>{if(!/^[A-Za-z0-9_-]{8,80}$/.test(String(id||'')))throw Error('Geçersiz kurtarma kulübü kimliği.');return id;};
async function recoveryTransaction(mode,callback){const db=await openRecovery();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode);let req;try{req=callback(tx.objectStore(STORE));}catch(err){tx.abort();reject(err);return;}tx.oncomplete=()=>resolve(req?.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Kurtarma depolama iptal edildi.'));});}
async function readRestorePoint(id){validId(id);const row=await recoveryTransaction('readonly',s=>s.get(id));if(!row)return null;if(Date.now()-Date.parse(row.createdAt)>MAX_AGE){await discardRestorePoint(id);return null;}return row;}
async function discardRestorePoint(id){validId(id);await recoveryTransaction('readwrite',s=>s.delete(id));}
async function captureCurrentStores(runTransaction=transact){const stores={};await runTransaction(STORES,'readonly',tx=>{for(const n of STORES){const req=tx.objectStore(n).getAll();req.onsuccess=()=>{stores[n]=req.result;};}});if(STORES.some(n=>!Array.isArray(stores[n])))throw Error('Tutarlı kurtarma anlık görüntüsü okunamadı.');return stores;}
function statsOf(stores){return Object.fromEntries(STORES.map(n=>[n,stores[n]?.length||0]));}
async function saveRestorePoint(clubId,runTransaction=transact){validId(clubId);
 if(clubContext().id!==clubId)throw Error('Kurtarma kulübü aktif kulüple eşleşmiyor.');
 // Fail closed: a corrupted existing club must not be discarded, but a recovery
 // copy still preserves the original state including its legacy inconsistencies.
 const existing=await readRestorePoint(clubId);
 const snapshot=await captureCurrentStores(runTransaction);
 const row={id:clubId,createdAt:new Date().toISOString(),stores:snapshot,counts:statsOf(snapshot),integrityWarnings:checkSnapshotIntegrity(snapshot)};
 await recoveryTransaction('readwrite',s=>s.put(row));
 const verify=await readRestorePoint(clubId);
 if(!verify||!STORES.every(n=>verify.counts[n]===row.counts[n]))throw Error('Kurtarma kopyası doğrulanamadı. Mevcut veriler korunuyor.');
 return {createdAt:verify.createdAt,counts:verify.counts,replacedPrevious:!!existing,integrityWarnings:verify.integrityWarnings};
}
async function rollbackToRestorePoint(clubId){const ctx=clubContext();if(ctx.id!==clubId)throw Error('Kurtarma kulübü aktif kulüple eşleşmiyor.');return withExclusiveClubOperation(async runTransaction=>{const point=await readRestorePoint(clubId);if(!point)throw Error('Bu kulüp için geçerli yerel kurtarma noktası bulunamadı.');
 // No clear occurs until a valid fully cloned snapshot exists.
 for(const name of STORES)if(!Array.isArray(point.stores?.[name]))throw Error('Kurtarma noktası bozuk: '+name);
 await runTransaction(STORES,'readwrite',tx=>{for(const name of STORES){const s=tx.objectStore(name);s.clear();for(const row of point.stores[name])s.put(row);}});
 // Preserve the point until the user explicitly discards it; retry possible.
 const restored=await captureCurrentStores(runTransaction);const actual=STORES.map(n=>restored[n].length);
 if(!STORES.every((n,i)=>actual[i]===point.counts[n]))throw Error('Kurtarma sonrası sayım uyuşmuyor; işlemi yeniden denetleyin.');
 return {counts:point.counts,createdAt:point.createdAt,integrityWarnings:point.integrityWarnings};
 },ctx);
}
Object.assign(exports,{DB_NAME,MAX_AGE,readRestorePoint,discardRestorePoint,saveRestorePoint,rollbackToRestorePoint,captureCurrentStores,statsOf});

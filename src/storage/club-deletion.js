// Two-phase, restartable deletion; registry tombstone precedes physical IDB deletion.
const {saveClub,getRegistryClub,removeRegistryClub,listDeletingClubs}=require('src/storage/club-registry.js');
const {closeClubDatabase}=require('src/storage/db.js');
const {discardRestorePoint}=require('src/storage/recovery.js');
const databaseName=id=>'matchstudio-club-'+id;
function deleteDatabaseStrict(name){return new Promise((resolve,reject)=>{let done=false;const q=indexedDB.deleteDatabase(name);
 const finish=(err)=>{if(done)return;done=true;clearTimeout(timer);err?reject(err):resolve(true)};
 const timer=setTimeout(()=>finish(Error('Başka sekmede veritabanı açık. Silme işlemi bekliyor; diğer sekmeleri kapatıp tekrar deneyin.')),6000);
 q.onsuccess=()=>finish();q.onerror=()=>finish(q.error||Error('Veritabanı silinemedi.'));
 q.onblocked=()=>{ /* timeout keeps deletion tombstoned for safe retry */ };});}
async function completePendingDeletion(id){const c=await getRegistryClub(id);if(!c||c.status!=='deleting')throw Error('Silme onayı veya bekleyen kayıt bulunamadı.');
 closeClubDatabase(id);
 await deleteDatabaseStrict(databaseName(id));
 // If metadata cleanup fails, the tombstone can be retried after restart.
 await discardRestorePoint(id);
 await removeRegistryClub(id);
 return true;
}
async function deleteClubSafely(id,confirmedName,backupVerified){const c=await getRegistryClub(id);
 if(!c||c.status==='deleting')throw Error('Kulüp silme işlemi zaten bekliyor veya kulüp bulunamadı.');
 if(c.name!==confirmedName)throw Error('Kulüp adını birebir girmeniz gerekir.');
 if(!backupVerified)throw Error('Silmeden önce şifreli yedeğinizi dışarıda doğrulamalısınız.');
 await saveClub({...c,status:'deleting',deleteApprovedAt:new Date().toISOString()});
 return completePendingDeletion(id);
}
async function retryPendingDeletions(){const pending=await listDeletingClubs(),results=[];
 for(const c of pending){try{await completePendingDeletion(c.id);results.push({id:c.id,ok:true})}catch(e){results.push({id:c.id,ok:false,error:e.message});}}
 return results;
}
Object.assign(exports,{deleteClubSafely,completePendingDeletion,retryPendingDeletions,deleteDatabaseStrict});

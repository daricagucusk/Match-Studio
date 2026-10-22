/* Read-model boundary for the current club. This module never writes IndexedDB.
 * If a club is switched while the six parallel reads are pending, discard the
 * now-obsolete response instead of showing records from the previous club. */
const STORES=Object.freeze(['players','groups','matches','rosters','posterDrafts','settings']);
function createWorkspaceSnapshot({getClubId,readStore,applySnapshot}){
 let revision=0;
 async function reload(){
  const request=++revision;
  const clubId=getClubId();
  const rows=await Promise.all(STORES.map(name=>readStore(name)));
  if(request!==revision||getClubId()!==clubId)return false;
  const snapshot=Object.fromEntries(STORES.map((name,i)=>[name,rows[i]]));
  applySnapshot(snapshot);
  return true;
 }
 function invalidate(){revision++;}
 return {reload,invalidate};
}
Object.assign(exports,{createWorkspaceSnapshot,STORES});

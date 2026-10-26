// Complete the candidate's existing durable erasedPlayers markers after a crash.
const {STORES,clubContext,withExclusiveClubOperation}=require('src/storage/db.js');
const {applyPlayerErasures}=require('src/storage/data-safety.js');
const {captureCurrentStores,listErasedPlayerIds,recordPlayerErasure,completePlayerErasures,purgeErasedRestorePoint}=require('src/storage/recovery.js');
async function reconcile(run,ctx,ids){
 if(!ids.length)return {erasedEntryCount:0,assetCount:0,rosterCount:0};
 await purgeErasedRestorePoint(ctx.id);
 const cleaned=applyPlayerErasures(await captureCurrentStores(run),ids);
 if(cleaned.changed)await run(STORES,'readwrite',tx=>{for(const name of STORES){const store=tx.objectStore(name);store.clear();for(const row of cleaned.stores[name])store.put(row);}});
 await completePlayerErasures(ctx.id);
 return {erasedEntryCount:cleaned.erasedEntryCount,assetCount:cleaned.assetCount,rosterCount:cleaned.rosterCount};
}
async function resumePlayerErasures(){
 const ctx=clubContext();if(!(await listErasedPlayerIds(ctx.id)).length)return;
 return withExclusiveClubOperation(async run=>reconcile(run,ctx,await listErasedPlayerIds(ctx.id)),ctx);
}
async function erasePlayerPermanently(id){
 const ctx=clubContext();
 return withExclusiveClubOperation(async run=>{
  const before=await captureCurrentStores(run),previous=await listErasedPlayerIds(ctx.id);
  if(!before.players.some(p=>p.id===id)&&!previous.includes(id))throw Error('Silinecek oyuncu bulunamadı.');
  await recordPlayerErasure(ctx.id,id);
  try{return await reconcile(run,ctx,[...new Set([...previous,id])]);}
  catch(error){throw Error('Kalıcı silme başlatıldı ancak tamamlanamadı. Uygulamayı yeniden açın; silme otomatik yeniden denenecek. '+error.message);}
 },ctx);
}
Object.assign(exports,{erasePlayerPermanently,resumePlayerErasures});

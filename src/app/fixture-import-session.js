/* A fixture preview belongs to the club and DB generation where the file
 * selection began. Async file reads and UI navigation must never retarget it
 * to the currently selected club. No IndexedDB writes in this module. */
function createFixtureImportSession(getClubContext){
 if(typeof getClubContext!=='function')throw TypeError('Club context reader required.');
 let sequence=0;
 const stale=()=>Error('Kulüp veya işlem değişti. Fikstür önizlemesi iptal edildi; dosyayı yeniden seçin.');
 function begin(){
  const ctx=getClubContext();
  if(!ctx?.id||!Number.isInteger(ctx.generation))throw stale();
  return Object.freeze({sequence:++sequence,clubId:ctx.id,generation:ctx.generation});
 }
 function assert(ticket){
  let ctx;try{ctx=getClubContext();}catch{throw stale();}
  if(!ticket||ticket.sequence!==sequence||ticket.clubId!==ctx?.id||ticket.generation!==ctx?.generation)throw stale();
  return Object.freeze({id:ticket.clubId,generation:ticket.generation});
 }
 function invalidate(){sequence++;}
 return Object.freeze({begin,assert,invalidate});
}
Object.assign(exports,{createFixtureImportSession});

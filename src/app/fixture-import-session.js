// A preview belongs to one club connection and one import attempt, never just a group name.
const {clubContext,assertContext,transact}=require('src/storage/db.js');
const {readFixtureFile}=require('src/domain/fixture-import.js');
function createFixtureImportSession({readFile=readFixtureFile}={}){
 let generation=0;
 const invalidate=()=>{generation++;};
 function assertCurrent(context){
  if(!context||context.generation!==generation)throw Error('Program önizlemesi artık geçerli değil. Dosyayı aktif kulüpte yeniden seçin.');
  assertContext({id:context.clubId,generation:context.databaseGeneration});
 }
 async function read(file){
  invalidate();
  const club=clubContext();
  const context=Object.freeze({clubId:club.id,databaseGeneration:club.generation,generation});
  const parsed=await readFile(file);
  assertCurrent(context);
  return {...parsed,filename:file.name,context};
 }
 async function commit(preview,matches){
  const context=preview?.context;
  assertCurrent(context);
  // Keep the captured DB scope across Web Lock/openDatabase awaits. Check the
  // import generation again inside the transaction, before the first write.
  await transact(['matches'],'readwrite',tx=>{
   assertCurrent(context);
   for(const match of matches)tx.objectStore('matches').add(match);
  },{id:context.clubId,generation:context.databaseGeneration});
 }
 return {read,commit,invalidate,assertCurrent};
}
Object.assign(exports,{createFixtureImportSession});

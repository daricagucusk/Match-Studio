const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createLoader}=require('./loader.cjs');
const csv='Grup;Rakip;Tarih;Saat;Saha\nU14;Sentetik Rakip;08.11.2026;14:00;Deneme Saha';
const file=()=>new File([csv],'fixtures.csv',{type:'text/csv'});
async function setup(extra={}){
 const {load}=createLoader(extra),db=load('src/storage/db.js');
 for(const id of ['isolation_club_a','isolation_club_b']){
  db.setClubDatabase(id);
  await db.putRecord('groups',{id:'group_'+id,name:'U14'});
  await db.putRecord('matches',{id:'existing',groupId:'group_'+id,opponent:'Existing '+id});
 }
 db.setClubDatabase('isolation_club_a');
 return {load,db,create:load('src/app/fixture-import-session.js').createFixtureImportSession};
}
async function assertUnchanged(db){
 for(const id of ['isolation_club_a','isolation_club_b']){
  db.setClubDatabase(id);
  const rows=await db.listRecords('matches');
  assert.equal(rows.length,1);assert.equal(rows[0].opponent,'Existing '+id);
 }
}
test('fixture preview cannot commit to another club with the same group name',async()=>{
 const {db,create}=await setup(),imports=create(),preview=await imports.read(file());
 assert.equal(preview.context.clubId,'isolation_club_a');
 db.setClubDatabase('isolation_club_b');
 await assert.rejects(imports.commit(preview,[{id:'wrong',groupId:'group_isolation_club_b'}]),/kulüp değişti/);
 await assertUnchanged(db);
});
test('A to B to A invalidates a preview even when clubId matches again',async()=>{
 const {db,create}=await setup(),imports=create(),preview=await imports.read(file());
 db.setClubDatabase('isolation_club_b');db.setClubDatabase('isolation_club_a');
 await assert.rejects(imports.commit(preview,[{id:'stale'}]),/kulüp değişti/);
 await assertUnchanged(db);
});
test('slow parsing cannot publish after an A to B to A transition',async()=>{
 const {db,create}=await setup();let finish;
 const imports=create({readFile:()=>new Promise(resolve=>{finish=resolve;})});
 const reading=imports.read(file());const rejected=assert.rejects(reading,/kulüp değişti/);
 db.setClubDatabase('isolation_club_b');db.setClubDatabase('isolation_club_a');
 finish({rows:[],errors:[]});await rejected;await assertUnchanged(db);
});
test('cancel, replacement file and restore invalidation reject old previews and slow readers',async()=>{
 const {db,create}=await setup(),imports=create(),preview=await imports.read(file());
 const newer=await imports.read(file());
 await assert.rejects(imports.commit(preview,[{id:'replaced'}]),/artık geçerli değil/);
 imports.invalidate();
 await assert.rejects(imports.commit(newer,[{id:'cancelled'}]),/artık geçerli değil/);
 let finish;const slow=create({readFile:()=>new Promise(resolve=>{finish=resolve;})});
 const reading=slow.read(file()),rejected=assert.rejects(reading,/artık geçerli değil/);
 slow.invalidate();finish({rows:[],errors:[]});await rejected;await assertUnchanged(db);
});
test('generation is checked after a queued write acquires its lock, before any rows change',async()=>{
 let queued=false,resume;
 const {db,create}=await setup({navigator:{locks:{request:(_name,_options,fn)=>queued?new Promise((resolve,reject)=>{resume=()=>Promise.resolve().then(fn).then(resolve,reject);}):fn()}}});
 const imports=create(),preview=await imports.read(file());queued=true;
 const writing=imports.commit(preview,[{id:'queued'}]);const rejected=assert.rejects(writing,/artık geçerli değil/);
 imports.invalidate();queued=false;resume();await rejected;await assertUnchanged(db);
});
test('current CSV import commits atomically; duplicate failure changes neither club',async()=>{
 const {db,create}=await setup(),imports=create(),preview=await imports.read(file());
 assert.equal(preview.rows[0].opponent,'Sentetik Rakip');
 await assert.rejects(imports.commit(preview,[{id:'new'}, {id:'existing'}]));
 assert.equal((await db.listRecords('matches')).length,1);
 await imports.commit(preview,[{id:'new',groupId:'group_isolation_club_a'}]);
 assert.equal((await db.listRecords('matches')).length,2);
 db.setClubDatabase('isolation_club_b');assert.equal((await db.listRecords('matches')).length,1);
});

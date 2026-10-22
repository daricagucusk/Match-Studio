const {test}=require('node:test');const assert=require('node:assert/strict');const {createLoader}=require('./loader.cjs');
const storage=()=>{const data=new Map();return {get length(){return data.size},key:i=>[...data.keys()][i]??null,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
const create=backend=>createLoader().load('src/app/match-form-drafts.js').createMatchDraftStore(backend);
const a={clubId:'club-a',matchId:null},b={clubId:'club-b',matchId:null},saved={clubId:'club-a',matchId:'match-1'};
test('draft survives store recreation and retains empty strings and multiline fields',()=>{
 const backend=storage(),store=create(backend);store.write(a,{fields:{opponent:'Sahil Spor',venue:'',coachNotes:'Bir\nİki'},seed:null});
 assert.deepEqual(JSON.parse(JSON.stringify(create(backend).read(a))),{fields:{opponent:'Sahil Spor',venue:'',coachNotes:'Bir\nİki'},seed:null});
});
test('drafts are isolated by club and saved match, and removal affects only the requested draft',()=>{
 const store=create(storage());for(const [scope,name] of [[a,'new-a'],[b,'new-b'],[saved,'saved-a']])store.write(scope,{fields:{opponent:name},seed:null});
 store.remove(a);assert.equal(store.read(a),null);assert.equal(store.read(b).fields.opponent,'new-b');assert.equal(store.read(saved).fields.opponent,'saved-a');store.clearClub('club-a');assert.equal(store.read(saved),null);assert.equal(store.read(b).fields.opponent,'new-b');
});
test('unavailable browser storage falls back to memory without losing the current draft',()=>{
 const store=create({getItem(){throw Error('blocked')},setItem(){throw Error('quota')},removeItem(){throw Error('blocked')}});
 store.write(a,{fields:{opponent:'Korunacak'},seed:null});assert.equal(store.read(a).fields.opponent,'Korunacak');assert.equal(store.isPersistent(),false);assert.equal(store.hasDrafts(),true);store.remove(a);assert.equal(store.read(a),null);assert.equal(store.hasDrafts(),false);
});
test('copied-match seed survives reload without mutating callers',()=>{
 const backend=storage(),store=create(backend),data={fields:{opponent:'Yeni Rakip'},seed:{id:'copy-1',gameFormat:{playersPerSide:8}}};store.write(a,data);data.seed.id='changed';assert.equal(create(backend).read(a).seed.id,'copy-1');
});

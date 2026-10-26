const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createFixtureImportSession}=require('../src/app/fixture-import-session.js');

function harness(){
 let club={id:'club_a001',generation:3};
 const sessions=createFixtureImportSession(()=>club);
 return {sessions,setContext:(id,generation)=>{club={id,generation};}};
}

test('fixture file read cannot complete in a different club',()=>{
 const h=harness(),ticket=h.sessions.begin();
 assert.deepEqual(h.sessions.assert(ticket),{id:'club_a001',generation:3});
 h.setContext('club_b001',4);
 assert.throws(()=>h.sessions.assert(ticket),/önizlemesi iptal edildi/);
});
test('A to B to A does not revive an old preview',()=>{
 const h=harness(),ticket=h.sessions.begin();
 h.sessions.invalidate();h.setContext('club_b001',4);
 h.sessions.invalidate();h.setContext('club_a001',5);
 assert.throws(()=>h.sessions.assert(ticket),/iptal edildi/);
});
test('new file selection supersedes an older slow file read',()=>{
 const h=harness(),slow=h.sessions.begin(),fast=h.sessions.begin();
 assert.throws(()=>h.sessions.assert(slow),/iptal edildi/);
 assert.deepEqual(h.sessions.assert(fast),{id:'club_a001',generation:3});
});
test('reset, restore or cancelled preview revokes same-club ticket',()=>{
 const h=harness(),ticket=h.sessions.begin();
 h.sessions.invalidate();
 assert.throws(()=>h.sessions.assert(ticket),/iptal edildi/);
});
test('IndexedDB generation changed for same club revokes ticket',()=>{
 const h=harness(),ticket=h.sessions.begin();
 h.setContext('club_a001',4);
 assert.throws(()=>h.sessions.assert(ticket),/iptal edildi/);
});
test('malformed/foreign preview fails closed and never exposes write scope',()=>{
 const h=harness(),ticket=h.sessions.begin();
 assert.throws(()=>h.sessions.assert(null),/iptal edildi/);
 assert.throws(()=>h.sessions.assert({...ticket,clubId:'club_b001'}),/iptal edildi/);
});

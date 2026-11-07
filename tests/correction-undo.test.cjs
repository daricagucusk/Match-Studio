const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createLoader}=require('./loader.cjs');
const {load}=createLoader();
const {planQuickSportingUndo,effectiveSportingEvents}=load('src/domain/match-events-report.js');
const base={id:'goal1',type:'GOAL',sequence:1,sessionId:'session:m1',payload:{playerId:'p1',assistPlayerId:null,goalEventId:null,note:''}};
const correct=(id,sequence,payload)=>({id,type:'EVENT_CORRECTION',sequence,sessionId:'session:m1',payload:{targetEventId:'goal1',reason:'Hakem düzeltmesi',...payload}});
test('undo latest scorer correction restores previous scorer, not voided score',()=>{
 const history=[base,correct('c1',2,{void:false,replacement:{type:'GOAL',payload:{playerId:'p2'}}})];
 const undo=planQuickSportingUndo(history);
 assert.deepEqual(JSON.parse(JSON.stringify(undo)),{targetEventId:'goal1',reason:'Son düzeltme geri alındı',void:false,replacement:{type:'GOAL',payload:base.payload}});
 const projected=effectiveSportingEvents([...history,correct('c2',3,undo)]);
 assert.equal(projected.length,1);assert.equal(projected[0].payload.playerId,'p1');
});
test('undo voided goal restores one previously scored goal',()=>{
 const history=[base,correct('c1',2,{void:true,replacement:null})];
 const undo=planQuickSportingUndo(history);
 assert.equal(undo.void,false);
 const projected=effectiveSportingEvents([...history,correct('c2',3,undo)]);
 assert.equal(projected.filter(e=>e.type==='GOAL').length,1);
});
test('undo latest correction restores previous own goal, not original goal',()=>{
 const history=[base,correct('c1',2,{void:false,replacement:{type:'OWN_GOAL',payload:{playerId:'p1'}}}),correct('c2',3,{void:false,replacement:{type:'GOAL',payload:{playerId:'p2'}}})];
 const undo=planQuickSportingUndo(history);
 assert.equal(undo.replacement.type,'OWN_GOAL');
 const projected=effectiveSportingEvents([...history,correct('c3',4,undo)]);
 assert.equal(projected[0].type,'OWN_GOAL');
});
test('undo latest correction of previously voided event keeps it voided',()=>{
 const history=[base,correct('c1',2,{void:true,replacement:null}),correct('c2',3,{void:false,replacement:{type:'GOAL',payload:{playerId:'p2'}}})];
 const undo=planQuickSportingUndo(history);
 assert.equal(undo.void,true);
 assert.equal(effectiveSportingEvents([...history,correct('c3',4,undo)]).length,0);
});
test('normal sporting event is not treated as correction undo',()=>{
 const undo=planQuickSportingUndo([base]);
 assert.equal(undo.void,true);
 assert.equal(undo.targetEventId,'goal1');
});

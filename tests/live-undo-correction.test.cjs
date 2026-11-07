const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createLoader}=require('./loader.cjs');
const {load}=createLoader();

const goal={id:'event:goal',type:'GOAL',sequence:1,sessionId:'session:m1',payload:{playerId:'p1',assistPlayerId:null,note:'',goalEventId:null}};
const correction={id:'event:correction',type:'EVENT_CORRECTION',sequence:2,sessionId:'session:m1',payload:{targetEventId:goal.id,reason:'Golcü değişti',void:false,replacement:{type:'GOAL',payload:{...goal.payload,playerId:'p2'}}}};

test('undoing latest scorer correction preserves the goal and restores original scorer',()=>{
 const {planQuickSportingUndo,effectiveSportingEvents}=load('src/domain/match-events-report.js');
 const planned=planQuickSportingUndo([goal,correction]);
 assert.equal(planned.targetEventId,goal.id);
 assert.equal(planned.void,false);
 assert.equal(planned.replacement.type,'GOAL');
 assert.equal(planned.replacement.payload.playerId,'p1');
 const undo={id:'event:undo',type:'EVENT_CORRECTION',sequence:3,sessionId:'session:m1',payload:planned};
 const effective=effectiveSportingEvents([goal,correction,undo]);
 assert.equal(effective.length,1);
 assert.equal(effective[0].type,'GOAL');
 assert.equal(effective[0].payload.playerId,'p1');
});

test('undoing latest goal cancellation restores the original 1-0 goal instead of leaving 0-0',()=>{
 const {planQuickSportingUndo,effectiveSportingEvents}=load('src/domain/match-events-report.js');
 const cancelled={...correction,payload:{targetEventId:goal.id,reason:'Gol iptal',void:true,replacement:null}};
 const planned=planQuickSportingUndo([goal,cancelled]);
 assert.equal(planned.targetEventId,goal.id);
 assert.equal(planned.void,false);
 const effective=effectiveSportingEvents([goal,cancelled,{id:'event:restore',type:'EVENT_CORRECTION',sequence:3,payload:planned}]);
 assert.deepEqual(effective.map(e=>e.type),['GOAL']);
});

test('ordinary latest goal quick undo still cancels that goal',()=>{
 const {planQuickSportingUndo,effectiveSportingEvents}=load('src/domain/match-events-report.js');
 const planned=planQuickSportingUndo([goal]);
 assert.equal(planned.void,true);
 assert.equal(planned.targetEventId,goal.id);
 assert.equal(effectiveSportingEvents([goal,{id:'event:void',type:'EVENT_CORRECTION',sequence:2,payload:planned}]).length,0);
});

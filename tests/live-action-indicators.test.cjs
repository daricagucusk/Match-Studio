const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createLoader}=require('./loader.cjs');
const {projectLiveActionIndicators}=createLoader().load('src/domain/live-action-indicators.js');

test('indicator projection combines goal/assist/cards with chronological substitutions',()=>{
 const session={id:'session:m1',initialPlayerIds:['p1','p2','p3','p4']};
 const report={players:[
  {id:'p1',goals:2,assists:0,yellow:1,red:0},
  {id:'p2',goals:0,assists:1,yellow:2,red:1},
  {id:'p3',goals:0,assists:0,yellow:0,red:0},
  {id:'p4',goals:0,assists:0,yellow:0,red:0}
 ]};
 const events=[
  {sessionId:'session:m1',type:'SUBSTITUTION',payload:{outPlayerId:'p1',inPlayerId:'p4'}},
  {sessionId:'another-session',type:'SUBSTITUTION',payload:{outPlayerId:'p2',inPlayerId:'p3'}}
 ];
 const byPlayer=projectLiveActionIndicators(session,events,report);
 assert.deepEqual(JSON.parse(JSON.stringify(byPlayer.p1)),{goals:2,assists:0,yellow:1,red:0,inCount:0,outCount:1});
 assert.deepEqual(JSON.parse(JSON.stringify(byPlayer.p2)),{goals:0,assists:1,yellow:2,red:1,inCount:0,outCount:0});
 assert.equal(byPlayer.p3.goals,0);
 assert.equal(byPlayer.p4.inCount,1);
});
test('correction-aware report drives indicators and fake substitutions are ignored',()=>{
 const session={id:'session:m1',initialPlayerIds:['p1','p2']};
 const report={players:[{id:'p1',goals:0,assists:0,yellow:0,red:0},{id:'p2',goals:0,assists:0,yellow:0,red:0}]};
 const events=[{sessionId:'session:m1',type:'EVENT_CORRECTION',payload:{targetEventId:'goal1',void:true}},{sessionId:'session:m1',type:'SUBSTITUTION',payload:{outPlayerId:'foreign',inPlayerId:'p2'}}];
 const result=projectLiveActionIndicators(session,events,report);
 assert.equal(result.p1.goals,0);
 assert.equal(result.p2.inCount,0);
 assert.equal(Object.keys(result).length,2);
});

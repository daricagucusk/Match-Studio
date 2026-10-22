const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createLoader}=require('./loader.cjs');
async function fixture(periods=[35,35]){const {load}=createLoader();const db=load('src/storage/db.js');db.setClubDatabase('live_test_01');
 await db.putRecord('matches',{id:'m1',groupId:'g1'});
 for(const id of ['p1','p2','p3'])await db.putRecord('players',{id});
 const live=load('src/storage/live-match.js');await live.createMatchSession({matchId:'m1',rules:{periods,substitutionMode:'returnAllowed',maximumNamedSubstitutes:10},initialPlayerIds:['p1','p2','p3'],currentOnFieldIds:['p1','p2']});
 return {load,db,live,clock:load('src/storage/match-clock.js'),sports:load('src/storage/match-sporting-events.js'),subs:load('src/storage/match-substitutions.js')};}
test('clock survives background time, pauses, period changes and finish',async()=>{
 const {load,live,clock}=await fixture();const project=load('src/domain/match-clock.js').projectClock;
 const act=async(action,nowMs)=>clock.commitClockAction({matchId:'m1',action,nowMs,expectedRevision:(await live.getMatchSession('m1')).revision,idempotencyKey:action+nowMs});
 await act('START',1000);assert.equal(project(await live.getMatchSession('m1'),61000).elapsedMatchMs,60000);
 await act('PAUSE',61000);assert.equal(project(await live.getMatchSession('m1'),121000).elapsedMatchMs,60000);
 await act('RESUME',121000);await act('END_PERIOD',181000);await act('NEXT_PERIOD',200000);await act('END_PERIOD',260000);await act('FINISH',261000);
 const session=await live.getMatchSession('m1');assert.equal(session.status,'finished');assert.equal(project(session,500000).elapsedMatchMs,180000);
});
test('concurrent clock commands cannot duplicate start or lose revision',async()=>{
 const {live,clock}=await fixture();const input={matchId:'m1',action:'START',nowMs:1000,expectedRevision:0,idempotencyKey:'same'};
 const replay=await Promise.all([clock.commitClockAction(input),clock.commitClockAction(input)]);assert.equal(replay.filter(x=>x.duplicate).length,1);
 assert.equal((await live.listMatchEvents('m1')).length,1);
 const conflicts=await Promise.allSettled(['a','b'].map(idempotencyKey=>clock.commitClockAction({matchId:'m1',action:'PAUSE',nowMs:2000,expectedRevision:1,idempotencyKey})));
 assert.equal(conflicts.filter(x=>x.status==='fulfilled').length,1);assert.equal((await live.getMatchSession('m1')).revision,2);
});
test('goal, card and substitution persist once; stale revisions and invalid substitutions fail',async()=>{
 const {live,clock,sports,subs}=await fixture();await clock.commitClockAction({matchId:'m1',action:'START',nowMs:1000,expectedRevision:0,idempotencyKey:'start'});
 const goal={matchId:'m1',type:'GOAL',payload:{playerId:'p1'},expectedRevision:1,idempotencyKey:'goal',nowMs:61000};await sports.commitSportingEvent(goal);assert.equal((await sports.commitSportingEvent(goal)).duplicate,true);
 await sports.commitSportingEvent({matchId:'m1',type:'YELLOW_CARD',payload:{playerId:'p2'},expectedRevision:2,idempotencyKey:'yellow',nowMs:62000});
 const input={matchId:'m1',outPlayerId:'p1',inPlayerId:'p3',expectedRevision:3,idempotencyKey:'sub',nowMs:121000};await subs.commitSubstitution(input);assert.equal((await subs.commitSubstitution(input)).duplicate,true);
 await assert.rejects(subs.commitSubstitution({...input,idempotencyKey:'stale'}));
 await assert.rejects(subs.commitSubstitution({...input,outPlayerId:'p3',inPlayerId:'p2',expectedRevision:4,idempotencyKey:'bad'}));
 const session=await live.getMatchSession('m1');assert.equal(session.currentOnFieldIds.includes('p3'),true);assert.equal(session.currentOnFieldIds.includes('p1'),false);
 const events=await live.listMatchEvents('m1');assert.deepEqual(Array.from(events,e=>e.sequence),[1,2,3,4]);
 const minutes=loadMinutes();function loadMinutes(){return require('./loader.cjs').createLoader().load('src/domain/match-substitutions.js').calculatePlayerMinutes(session,events,181000);}
 assert.equal(minutes.byPlayer.p1.playedMs,120000);assert.equal(minutes.byPlayer.p3.playedMs,60000);
});
test('suspicious wall clock requires explicit correction',async()=>{
 const {live,clock}=await fixture();await clock.commitClockAction({matchId:'m1',action:'START',nowMs:5000,expectedRevision:0,idempotencyKey:'start'});
 await assert.rejects(clock.commitClockAction({matchId:'m1',action:'PAUSE',nowMs:1,expectedRevision:1,idempotencyKey:'bad'}));
 assert.equal((await live.getMatchSession('m1')).status,'running');assert.equal((await live.listMatchEvents('m1')).length,1);
 await clock.commitClockAction({matchId:'m1',action:'CORRECT',nowMs:1,correctionMs:10000,reason:'Cihaz saati düzeltildi',expectedRevision:1,idempotencyKey:'fix'});
 assert.equal((await live.getMatchSession('m1')).clock.elapsedPeriodMs,10000);
});
test('clock correction retry rejects changed duration or reason and preserves original event',async()=>{
 const {live,clock}=await fixture();await clock.commitClockAction({matchId:'m1',action:'START',nowMs:1000,expectedRevision:0,idempotencyKey:'start'});
 const command={matchId:'m1',action:'CORRECT',nowMs:61000,correctionMs:90000,reason:'Hakem saati',expectedRevision:1,idempotencyKey:'fix'};
 const first=await clock.commitClockAction(command);
 assert.equal((await clock.commitClockAction({...command,nowMs:62000,reason:' Hakem saati '})).duplicate,true);
 await assert.rejects(clock.commitClockAction({...command,correctionMs:120000}),/farklı/);
 await assert.rejects(clock.commitClockAction({...command,reason:'Başka gerekçe'}),/farklı/);
 const session=await live.getMatchSession('m1');assert.equal(session.revision,2);assert.equal(session.clock.elapsedPeriodMs,90000);
 const events=await live.listMatchEvents('m1');assert.equal(events.length,2);assert.equal(events[1].id,first.event.id);
});
test('event correction retry rejects changed replacement player, type, assist or note',async()=>{
 const {live,clock,sports,load}=await fixture();await clock.commitClockAction({matchId:'m1',action:'START',nowMs:1000,expectedRevision:0,idempotencyKey:'start'});
 const goal=await sports.commitSportingEvent({matchId:'m1',type:'GOAL',payload:{playerId:'p1'},expectedRevision:1,idempotencyKey:'goal',nowMs:61000});
 const command={matchId:'m1',type:'EVENT_CORRECTION',payload:{targetEventId:goal.event.id,reason:'Golcü düzeltildi',replacement:{type:'GOAL',payload:{playerId:'p2',note:'Hakem teyidi'}}},expectedRevision:2,idempotencyKey:'fix-goal',nowMs:62000};
 const original=await sports.commitSportingEvent(command);assert.equal((await sports.commitSportingEvent(command)).duplicate,true);
 for(const replacement of [
  {type:'GOAL',payload:{playerId:'p1',note:'Hakem teyidi'}},
  {type:'OWN_GOAL',payload:{playerId:'p2',note:'Hakem teyidi'}},
  {type:'GOAL',payload:{playerId:'p2',assistPlayerId:'p3',note:'Hakem teyidi'}},
  {type:'GOAL',payload:{playerId:'p2',note:'Farklı not'}}
 ])await assert.rejects(sports.commitSportingEvent({...command,payload:{...command.payload,replacement}}),/farklı/);
 const events=await live.listMatchEvents('m1');assert.equal(events.length,3);assert.equal(events[2].id,original.event.id);
 const report=load('src/domain/match-events-report.js').projectMatchReport(await live.getMatchSession('m1'),events,[],null,63000);
 assert.equal(report.ourGoals,1);assert.equal(report.players.find(p=>p.id==='p2').goals,1);
});
test('generic event retry rejects changed event type, payload, period or match time',async()=>{
 const {live}=await fixture();const command={matchId:'m1',type:'NOTE',payload:{note:'İlk not',details:{a:1,b:2}},matchTimeMs:1000,periodIndex:0,expectedRevision:0,idempotencyKey:'note'};
 const original=await live.appendMatchEvent(command);
 assert.equal((await live.appendMatchEvent({...command,payload:{details:{b:2,a:1},note:'İlk not'}})).duplicate,true);
 for(const change of [{type:'INJURY'},{payload:{note:'Başka not'}},{periodIndex:1},{matchTimeMs:2000}])await assert.rejects(live.appendMatchEvent({...command,...change}),/farklı/);
 assert.equal((await live.getMatchSession('m1')).revision,1);assert.equal((await live.listMatchEvents('m1'))[0].id,original.event.id);
});
test('90-minute match simulation preserves exact minutes and score through pauses, intervals and reconnects',async()=>{
 const {load,db,live,clock,sports,subs}=await fixture([45,45]);await db.putRecord('groups',{id:'g1',name:'Deneme'});
 const minute=60000,start=100000;let key=0;
 const revision=async()=>(await live.getMatchSession('m1')).revision;
 const clockAction=async(action,nowMs)=>clock.commitClockAction({matchId:'m1',action,nowMs,expectedRevision:await revision(),idempotencyKey:'clock'+(++key)});
 const sporting=async(type,payload,nowMs,idempotencyKey='sport'+(++key))=>sports.commitSportingEvent({matchId:'m1',type,payload,nowMs,expectedRevision:await revision(),idempotencyKey});
 const substitution=async(outPlayerId,inPlayerId,nowMs)=>subs.commitSubstitution({matchId:'m1',outPlayerId,inPlayerId,nowMs,expectedRevision:await revision(),idempotencyKey:'sub'+(++key)});
 await clockAction('START',start);
 for(let half=0;half<2;half++){
  const halfStart=half?start+65*minute:start;
  for(let m=1;m<=45;m++){
   const now=halfStart+(m+(!half&&m>25?5:0))*minute;
   const note={note:`${half+1}. devre ${m}. dakika`},idempotencyKey=`note-${half}-${m}`;
   await sporting('NOTE',note,now,idempotencyKey);assert.equal((await sporting('NOTE',note,now+1,idempotencyKey)).duplicate,true);
   if(!half&&m===10)await sporting('GOAL',{playerId:'p1'},now);
   if(!half&&m===30)await sporting('GOAL',{playerId:'p2'},now);
   if(!half&&m===20)await substitution('p1','p3',now);
   if(!half&&m===35)await substitution('p3','p1',now);
   if(half&&m===15)await substitution('p2','p3',now);
   if(half&&m===30)await substitution('p3','p2',now);
   if(half&&m===20)await sporting('OPPONENT_GOAL',{},now);
   if(half&&m===40)await sporting('OWN_GOAL',{playerId:'p1'},now);
   if(!half&&m===25){await clockAction('PAUSE',now);await clockAction('RESUME',now+5*minute);}
   if(m%10===0){db.closeClubDatabase('live_test_01');db.setClubDatabase('live_test_01');await db.openDatabase();}
  }
  await clockAction('END_PERIOD',halfStart+(half?45:50)*minute);
  if(!half)await clockAction('NEXT_PERIOD',start+65*minute);
 }
 await clockAction('FINISH',start+110*minute);
 const session=await live.getMatchSession('m1'),events=await live.listMatchEvents('m1');assert.equal(session.status,'finished');assert.equal(events.length,105);
 assert.deepEqual(Array.from(events,e=>e.sequence),Array.from({length:105},(_,i)=>i+1));assert.equal(session.revision,105);
 const report=load('src/domain/match-events-report.js').projectMatchReport(session,events,[],null,start+120*minute);
 assert.equal(report.elapsedMatchMs,90*minute);assert.equal(report.ourGoals,2);assert.equal(report.opponentGoals,2);assert.equal(report.minutesReviewRequired,false);
 const totals=Object.fromEntries(report.players.map(p=>[p.id,p.playedMs]));assert.deepEqual(totals,{p1:75*minute,p2:75*minute,p3:30*minute});
 const snapshot=await load('src/storage/recovery.js').captureCurrentStores();assert.equal(load('src/storage/data-safety.js').checkSnapshotIntegrity(snapshot).length,0);
});
test('assist retry remains a duplicate after a later correction voids its goal',async()=>{
 const {live,clock,sports}=await fixture();await clock.commitClockAction({matchId:'m1',action:'START',nowMs:1000,expectedRevision:0,idempotencyKey:'start'});
 const goal=await sports.commitSportingEvent({matchId:'m1',type:'GOAL',payload:{playerId:'p1'},expectedRevision:1,idempotencyKey:'goal',nowMs:61000});
 const assist={matchId:'m1',type:'ASSIST',payload:{playerId:'p2',goalEventId:goal.event.id},expectedRevision:2,idempotencyKey:'assist',nowMs:62000};await sports.commitSportingEvent(assist);
 await sports.commitSportingEvent({matchId:'m1',type:'EVENT_CORRECTION',payload:{targetEventId:goal.event.id,reason:'Gol iptal edildi',void:true},expectedRevision:3,idempotencyKey:'void',nowMs:63000});
 assert.equal((await sports.commitSportingEvent(assist)).duplicate,true);assert.equal((await live.listMatchEvents('m1')).length,4);
});

test('report distinguishes a bench card from actually entering the field',async()=>{
 const {live,clock,sports,subs,load}=await fixture([1,1]);
 const project=load('src/domain/match-events-report.js').projectMatchReport;
 const before=project(await live.getMatchSession('m1'),[],[],null,1000);
 assert.deepEqual(Array.from(before.players,p=>p.participated),[false,false,false]);
 await clock.commitClockAction({matchId:'m1',action:'START',nowMs:1000,expectedRevision:0,idempotencyKey:'start'});
 await sports.commitSportingEvent({matchId:'m1',type:'YELLOW_CARD',payload:{playerId:'p3'},nowMs:2000,expectedRevision:1,idempotencyKey:'bench-yellow'});
 const report=project(await live.getMatchSession('m1'),await live.listMatchEvents('m1'),[],null,2100);
 const bench=report.players.find(p=>p.id==='p3');
 assert.equal(bench.yellow,1);
 assert.equal(bench.playedMs,0);
 assert.equal(bench.participated,false,'bench caution alone must not count as a match appearance');
 assert.equal(report.players.filter(p=>p.participated).length,2);
 await subs.commitSubstitution({matchId:'m1',outPlayerId:'p1',inPlayerId:'p3',nowMs:2100,expectedRevision:2,idempotencyKey:'sub'});
 const entered=project(await live.getMatchSession('m1'),await live.listMatchEvents('m1'),[],null,2100);
 assert.equal(entered.players.find(p=>p.id==='p3').playedMs,0);
 assert.equal(entered.players.find(p=>p.id==='p3').participated,true,'recorded entrance counts even if less than one second elapsed');
});


test('reclassifying an own goal back to goal cannot revive a self-assist',async()=>{
 const {live,clock,sports,load}=await fixture();
 const act=async(type,payload,key,nowMs)=>{
  const session=await live.getMatchSession('m1');
  return sports.commitSportingEvent({matchId:'m1',type,payload,expectedRevision:session.revision,idempotencyKey:key,nowMs});
 };
 await clock.commitClockAction({matchId:'m1',action:'START',nowMs:1000,expectedRevision:0,idempotencyKey:'start'});
 const goal=await act('GOAL',{playerId:'p1'},'goal',2000);
 const assist=await act('ASSIST',{playerId:'p2',goalEventId:goal.event.id},'assist',3000);
 assert.ok(assist.event.id);
 await act('EVENT_CORRECTION',{targetEventId:goal.event.id,reason:'Hakem kendi kalesine gol dedi',replacement:{type:'OWN_GOAL',payload:{playerId:'p1'}}},'own-goal',4000);
 const before=await live.getMatchSession('m1');
 await assert.rejects(act('EVENT_CORRECTION',{targetEventId:goal.event.id,reason:'Golcü tekrar değerlendirildi',replacement:{type:'GOAL',payload:{playerId:'p2'}}},'self-assist',5000),/asist/);
 const after=await live.getMatchSession('m1');
 assert.equal(after.revision,before.revision);
 const events=await live.listMatchEvents('m1');
 assert.equal(events.length,4);
 const report=load('src/domain/match-events-report.js').projectMatchReport(after,events,[],null,6000);
 assert.equal(report.ourGoals,0);
 assert.equal(report.opponentGoals,1);
 assert.equal(report.players.find(p=>p.id==='p2').assists,0);
});

test('voiding a linked assist permits legitimate scorer correction without reintroducing assist',async()=>{
 const {live,clock,sports,load}=await fixture();
 const act=async(type,payload,key,nowMs)=>{
  const session=await live.getMatchSession('m1');
  return sports.commitSportingEvent({matchId:'m1',type,payload,expectedRevision:session.revision,idempotencyKey:key,nowMs});
 };
 await clock.commitClockAction({matchId:'m1',action:'START',nowMs:1000,expectedRevision:0,idempotencyKey:'start'});
 const goal=await act('GOAL',{playerId:'p1'},'goal',2000);
 const assist=await act('ASSIST',{playerId:'p2',goalEventId:goal.event.id},'assist',3000);
 await act('EVENT_CORRECTION',{targetEventId:goal.event.id,reason:'Hakem kendi kalesine gol dedi',replacement:{type:'OWN_GOAL',payload:{playerId:'p1'}}},'own-goal',4000);
 await act('EVENT_CORRECTION',{targetEventId:assist.event.id,reason:'Asist geçersiz sayıldı',void:true},'void-assist',5000);
 await act('EVENT_CORRECTION',{targetEventId:goal.event.id,reason:'Asıl golcü düzeltildi',replacement:{type:'GOAL',payload:{playerId:'p2'}}},'goal-again',6000);
 const session=await live.getMatchSession('m1'),events=await live.listMatchEvents('m1');
 const report=load('src/domain/match-events-report.js').projectMatchReport(session,events,[],null,7000);
 assert.equal(report.ourGoals,1);
 assert.equal(report.opponentGoals,0);
 assert.equal(report.players.find(p=>p.id==='p2').goals,1);
 assert.equal(report.players.find(p=>p.id==='p2').assists,0);
});

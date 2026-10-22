// V2.6.8-E: single indexedDB transaction for validated sporting actions.
const {transact}=require('src/storage/db.js');
const {sessionIdFor}=require('src/storage/live-match.js');
const {projectClock}=require('src/domain/match-clock.js');
const {TYPES,normalizeSportsPayload,validateCorrection}=require('src/domain/match-events-report.js');
const isId=v=>typeof v==='string'&&/^[a-zA-Z0-9_.:-]{1,160}$/.test(v);
async function commitSportingEvent({matchId,type,payload={},expectedRevision,idempotencyKey,nowMs=Date.now()}){
 if(!isId(matchId)||!isId(idempotencyKey)||!Number.isSafeInteger(expectedRevision)||expectedRevision<0||!Number.isSafeInteger(nowMs)||nowMs<0||![...TYPES,'EVENT_CORRECTION'].includes(type))throw Error('Maç olayı parametreleri geçersiz.');
 const sid=sessionIdFor(matchId);let outcome,problem;
 await transact(['matchSessions','matchEvents'],'readwrite',tx=>{
  const sessions=tx.objectStore('matchSessions'),store=tx.objectStore('matchEvents');
  const idem=store.index('sessionIdempotency').get([sid,idempotencyKey]);
  idem.onsuccess=()=>{
   if(idem.result){
    const old=idem.result;
    if(old.type!==type){problem='Bu işlem anahtarı farklı bir olay için kullanılmış.';return;}
    const current=sessions.get(sid);
    current.onsuccess=()=>{
     if(!current.result){problem='Maç oturumu bulunamadı.';return;}
     const prior=store.index('matchId').getAll(matchId);
     prior.onsuccess=()=>{
      // Replay against history before this event, so later corrections or assists
      // cannot change the meaning or validity of the original request.
      const history=prior.result.filter(event=>event.sequence<old.sequence);
      const normalize=value=>type==='EVENT_CORRECTION'?validateCorrection(value,current.result,history):normalizeSportsPayload(type,value,current.result,history);
      try{
       if(JSON.stringify(normalize(payload))!==JSON.stringify(normalize(old.payload)))throw Error('different');
      }catch(error){problem='Bu işlem anahtarı farklı veya geçersiz bir olay için kullanılmış.';return;}
      outcome={duplicate:true,event:old,revision:null};
     };
    };
    return;
   }
   const r=sessions.get(sid);r.onsuccess=()=>{const session=r.result;
    if(!session){problem='Maç oturumu bulunamadı.';return;}
    if(session.revision!==expectedRevision){problem='Oturum başka bir işlemle değişti. Yeniden yükleyin.';return;}
    if(['prepared'].includes(session.status)||(!['EVENT_CORRECTION'].includes(type)&&session.status==='finished')){problem='Bu aşamada yeni maç olayı eklenemez.';return;}
    let clock;try{clock=projectClock(session,nowMs);if(clock.reviewRequired)throw Error(clock.warning);}catch(err){problem=err.message;return;}
    const all=store.index('matchId').getAll(matchId);all.onsuccess=()=>{
     let safe;try{safe=type==='EVENT_CORRECTION'?validateCorrection(payload,session,all.result):normalizeSportsPayload(type,payload,session,all.result);}catch(err){problem=err.message;return;}
     const sequence=(session.sequence||0)+1;
     const event={id:'event:'+crypto.randomUUID(),sessionId:sid,matchId,sequence,type,periodIndex:clock.periodIndex,matchTimeMs:clock.elapsedMatchMs,recordedAt:new Date(nowMs).toISOString(),actor:'coachLocal',payload:safe,idempotencyKey,revisesEventId:type==='EVENT_CORRECTION'?safe.targetEventId:null};
     store.add(event);sessions.put({...session,sequence,revision:session.revision+1,updatedAt:event.recordedAt});outcome={duplicate:false,event,revision:session.revision+1};
    };
   };
  };
 });
 if(problem)throw Error(problem);if(!outcome)throw Error('Olay kaydı tamamlanamadı.');return outcome;
}
Object.assign(exports,{commitSportingEvent});

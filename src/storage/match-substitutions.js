// V2.6.8-C — one durable transaction for the substitution, event and session revision.
const {transact}=require('src/storage/db.js');
const {sessionIdFor}=require('src/storage/live-match.js');
const {planSubstitution}=require('src/domain/match-substitutions.js');
const validId=v=>typeof v==='string'&&/^[A-Za-z0-9_.:-]{1,160}$/.test(v);
async function commitSubstitution({matchId,outPlayerId,inPlayerId,competitionReturnApproved=false,expectedRevision,idempotencyKey,nowMs=Date.now()}){
 if(!validId(matchId)||!validId(idempotencyKey)||!Number.isSafeInteger(expectedRevision)||expectedRevision<0||!Number.isSafeInteger(nowMs)||nowMs<0)throw Error('Oyuncu değişikliği kimliği ve zamanı geçersiz.');
 const sessionId=sessionIdFor(matchId);let outcome=null,problem=null;
 await transact(['matchSessions','matchEvents'],'readwrite',tx=>{
  const sessions=tx.objectStore('matchSessions'),events=tx.objectStore('matchEvents');
  const idem=events.index('sessionIdempotency').get([sessionId,idempotencyKey]);
  idem.onsuccess=()=>{
   if(idem.result){const e=idem.result;if(e.type!=='SUBSTITUTION'||e.payload?.inPlayerId!==inPlayerId||e.payload?.outPlayerId!==outPlayerId){problem='Bu işlem anahtarı farklı bir işlem için kullanılmış.';return;}
    outcome={duplicate:true,event:e,session:null,revision:null};return;}
   const req=sessions.get(sessionId);req.onsuccess=()=>{
    const session=req.result;if(!session){problem='Maç oturumu bulunamadı.';return;}
    if(session.revision!==expectedRevision){problem='Başka sekme maç kadrosunu değiştirmiş. Yeniden yükleyin.';return;}
    let plan;try{plan=planSubstitution(session,{outPlayerId,inPlayerId,competitionReturnApproved,nowMs});}catch(err){problem=err.message;return;}
    const sequence=(session.sequence||0)+1,revision=session.revision+1,recordedAt=new Date(nowMs).toISOString();
    const event={id:'event:'+crypto.randomUUID(),sessionId,matchId,sequence,type:'SUBSTITUTION',periodIndex:plan.periodIndex,matchTimeMs:plan.matchTimeMs,recordedAt,actor:'coachLocal',payload:plan.payload,idempotencyKey,revisesEventId:null};
    const updated={...session,currentOnFieldIds:plan.currentOnFieldIds,everPlayedIds:plan.everPlayedIds,substitutionCount:plan.substitutionCount,sequence,revision,updatedAt:recordedAt};
    events.add(event);sessions.put(updated);outcome={duplicate:false,event,session:updated,revision};
   };
  };
 });
 if(problem)throw Error(problem);if(!outcome)throw Error('Oyuncu değişimi güvenli biçimde kaydedilemedi.');return outcome;
}
Object.assign(exports,{commitSubstitution});

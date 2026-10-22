// Packet B: immutable wall-clock state transitions + event in one IndexedDB transaction.
const {transact}=require('src/storage/db.js');
const {sessionIdFor}=require('src/storage/live-match.js');
const {applyClockTransition}=require('src/domain/match-clock.js');
const ident=v=>typeof v==='string'&&/^[A-Za-z0-9_.:-]{1,160}$/.test(v);
async function commitClockAction({matchId,action,expectedRevision,idempotencyKey,nowMs=Date.now(),correctionMs,reason}){
 if(!ident(matchId)||!ident(idempotencyKey)||!Number.isSafeInteger(expectedRevision)||expectedRevision<0)throw Error('Saat işlemi kimliği/revizyonu geçersiz.');
 if(!Number.isSafeInteger(nowMs)||nowMs<0)throw Error('Cihaz saati geçersiz.');
 let outcome=null,conflict=null;const sessionId=sessionIdFor(matchId),recordedAt=new Date(nowMs).toISOString();
 await transact(['matchSessions','matchEvents'],'readwrite',tx=>{
  const s=tx.objectStore('matchSessions'),events=tx.objectStore('matchEvents');
  const q=events.index('sessionIdempotency').get([sessionId,idempotencyKey]);
  q.onsuccess=()=>{if(q.result){
    if(q.result.payload?.clockAction!==action||(action==='CORRECT'&&(q.result.payload.toMs!==correctionMs||q.result.payload.reason!==String(reason||'').trim()))){conflict='Bu işlem anahtarı farklı bir saat olayı için kullanılmış.';return;}
    outcome={duplicate:true,event:q.result,revision:null,session:null};return;
   }
   const r=s.get(sessionId);r.onsuccess=()=>{
    const session=r.result;
    if(!session){conflict='Canlı maç oturumu bulunamadı.';return;}
    if(session.revision!==expectedRevision){conflict='Başka sekme/işlem oturumu güncellemiş. Yeniden yükleyin.';return;}
    let next;try{next=applyClockTransition(session,action,{nowMs,correctionMs,reason});}catch(error){conflict=error.message;return;}
    const sequence=(session.sequence||0)+1,updated={...session,status:next.status,clock:next.clock,revision:session.revision+1,sequence,updatedAt:recordedAt};
    const event={id:'event:'+crypto.randomUUID(),sessionId,matchId,sequence,type:next.eventType,periodIndex:next.periodIndex,matchTimeMs:next.matchTimeMs,recordedAt,actor:'coachLocal',payload:{...next.payload,clockAction:action},idempotencyKey,revisesEventId:null};
    events.add(event);s.put(updated);outcome={duplicate:false,event,revision:updated.revision,session:updated};
   };
  };
 });
 if(conflict)throw Error(conflict);
 if(!outcome)throw Error('Maç saati kaydı tamamlanamadı.');
 return outcome;
}
Object.assign(exports,{commitClockAction});

// Match Studio V2.6.8 Packet A: persistence only (no timekeeping or match UI).
const {openDatabase,transact,getRecord}=require('src/storage/db.js');
const EVENT_TYPES=new Set(['PERIOD_START','PERIOD_END','CLOCK_PAUSE','CLOCK_RESUME','CLOCK_CORRECTION','SUBSTITUTION','GOAL','OWN_GOAL','OPPONENT_GOAL','ASSIST','YELLOW_CARD','RED_CARD','INJURY','NOTE','EVENT_CORRECTION','FINALIZE','ABANDON']);
const ident=value=>typeof value==='string'&&/^[A-Za-z0-9_.:-]{1,160}$/.test(value);
const sessionIdFor=matchId=>'session:'+matchId;
// Event payloads are compared by JSON content, independent of object key order.
const payloadIdentity=value=>JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
const safeArray=arr=>Array.isArray(arr)&&arr.every(ident)&&new Set(arr).size===arr.length;
function validateRules(rules){
 if(!rules||typeof rules!=='object'||!Array.isArray(rules.periods)||rules.periods.length<1||rules.periods.length>6||rules.periods.some(n=>!Number.isInteger(n)||n<1||n>120))throw Error('Maç devre süreleri açıkça ayarlanmalıdır.');
 if(!['returnAllowed','noReturn','competitionConfigured'].includes(rules.substitutionMode))throw Error('Oyuncu değişikliği kuralı seçilmelidir.');
 if(!Number.isInteger(rules.maximumNamedSubstitutes)||rules.maximumNamedSubstitutes<0||rules.maximumNamedSubstitutes>50)throw Error('Yedek sınırı geçersiz.');
 return structuredClone(rules);
}
async function createMatchSession({matchId,rules,initialPlayerIds=[],currentOnFieldIds=initialPlayerIds,kickoffPitchAssignments=null,kickoffPreset=null}){
 if(!ident(matchId)||!safeArray(initialPlayerIds)||!safeArray(currentOnFieldIds)||currentOnFieldIds.some(id=>!initialPlayerIds.includes(id)))throw Error('Canlı maç hazırlık listesi geçersiz.');
 const safeRules=validateRules(rules),id=sessionIdFor(matchId),now=new Date().toISOString();let result;
 const starterSet=new Set(currentOnFieldIds);let pitchSnapshot=null;
 if(kickoffPitchAssignments!==null){
  if(!kickoffPitchAssignments||typeof kickoffPitchAssignments!=='object'||Array.isArray(kickoffPitchAssignments))throw Error('Başlangıç saha yerleşimi geçersiz.');
  const entries=Object.entries(kickoffPitchAssignments);
  if(entries.length!==starterSet.size||entries.some(([slot,playerId])=>!/^(0|[1-9][0-9]*)$/.test(slot)||Number(slot)>10||!starterSet.has(playerId))||new Set(entries.map(([,id])=>id)).size!==entries.length)throw Error('Başlangıç saha yerleşimi ilk kadroyla eşleşmiyor.');
  pitchSnapshot=Object.fromEntries(entries);
 }
 if(kickoffPreset!==null&&(typeof kickoffPreset!=='string'||kickoffPreset.length>80))throw Error('Diziliş tanımı geçersiz.');
 await transact(['matches','matchSessions','players'],'readwrite',tx=>{
  const s=tx.objectStore('matchSessions');const found=s.get(id);
  found.onsuccess=()=>{if(found.result){tx.abort();return;}
   const matchReq=tx.objectStore('matches').get(matchId);matchReq.onsuccess=()=>{if(!matchReq.result){tx.abort();return;}
    if(!initialPlayerIds.length){ /* empty participant pool is allowed for draft preparation */ }
    const playerReq=tx.objectStore('players').getAllKeys();playerReq.onsuccess=()=>{
     const known=new Set(playerReq.result);if(initialPlayerIds.some(id=>!known.has(id))){tx.abort();return;}
     result={id,matchId,schemaVersion:1,status:'prepared',revision:0,sequence:0,rules:safeRules,initialPlayerIds:[...initialPlayerIds],currentOnFieldIds:[...currentOnFieldIds],kickoffOnFieldIds:[...currentOnFieldIds],kickoffPitchAssignments:pitchSnapshot,kickoffPreset:kickoffPreset||null,everPlayedIds:[...currentOnFieldIds],substitutionCount:0,clock:{periodIndex:0,runningAnchorWallMs:null,accumulatedMatchMs:0,manualAdjustmentMs:0},createdAt:now,updatedAt:now};s.add(result);
    };
   };
  };
 });
 if(!result)throw Error('Canlı oturum oluşturulamadı: maç/oyuncu bulunamıyor ya da oturum mevcut.');
 return result;
}
async function getMatchSession(matchId){if(!ident(matchId))throw Error('Geçersiz maç.');return getRecord('matchSessions',sessionIdFor(matchId));}
async function listMatchEvents(matchId){if(!ident(matchId))throw Error('Geçersiz maç.');const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction('matchEvents','readonly');const q=tx.objectStore('matchEvents').index('matchId').getAll(matchId);q.onsuccess=()=>resolve(q.result.sort((a,b)=>a.sequence-b.sequence));q.onerror=()=>reject(q.error);});}
// Session revision, event and event sequence are committed atomically.
// Replayed idempotency keys return the original event without appending a duplicate.
async function appendMatchEvent({matchId,type,payload={},matchTimeMs=0,periodIndex=0,idempotencyKey,expectedRevision}){
 if(!ident(matchId)||!EVENT_TYPES.has(type)||!ident(idempotencyKey)||!Number.isSafeInteger(expectedRevision)||expectedRevision<0||!Number.isSafeInteger(matchTimeMs)||matchTimeMs<0||!Number.isInteger(periodIndex)||periodIndex<0||periodIndex>5||!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('Canlı maç olayı eksik veya geçersiz.');
 const requestPayload=structuredClone(payload),identity=payloadIdentity(requestPayload);
 const sessionId=sessionIdFor(matchId),now=new Date().toISOString();let committed=null,duplicate=false,conflict=false;
 await transact(['matchSessions','matchEvents'],'readwrite',tx=>{
  const sessions=tx.objectStore('matchSessions'),events=tx.objectStore('matchEvents');
  const idemReq=events.index('sessionIdempotency').get([sessionId,idempotencyKey]);
  idemReq.onsuccess=()=>{if(idemReq.result){const old=idemReq.result;
    if(old.type!==type||old.periodIndex!==periodIndex||old.matchTimeMs!==matchTimeMs||payloadIdentity(old.payload)!==identity){conflict='Bu işlem anahtarı farklı bir olay için kullanılmış.';return;}
    duplicate=true;committed=old;return;}
   const q=sessions.get(sessionId);q.onsuccess=()=>{const session=q.result;
    if(!session){conflict='Canlı maç oturumu bulunamadı.';return;}
    if(session.revision!==expectedRevision){conflict='Başka sekme/işlem oturumu güncellemiş. Yeniden yükleyin.';return;}
    const seq=(session.sequence||0)+1;
    const event={id:'event:'+crypto.randomUUID(),sessionId,matchId,sequence:seq,type,periodIndex,matchTimeMs,recordedAt:now,actor:'coachLocal',payload:requestPayload,idempotencyKey,revisesEventId:null};
    events.add(event);sessions.put({...session,revision:session.revision+1,sequence:seq,updatedAt:now});committed=event;
   };
  };
 });
 if(conflict)throw Error(conflict);
 if(!committed)throw Error('Canlı maç olayı kaydedilemedi.');
 return {event:committed,duplicate,revision:duplicate?null:expectedRevision+1};
}
Object.assign(exports,{EVENT_TYPES,sessionIdFor,validateRules,createMatchSession,getMatchSession,listMatchEvents,appendMatchEvent});

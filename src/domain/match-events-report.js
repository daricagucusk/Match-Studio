// V2.6.8-E: append-only sporting events, corrections, and reporting.
const {calculatePlayerMinutes}=require('src/domain/match-substitutions.js');
const {projectClock}=require('src/domain/match-clock.js');
const TYPES=Object.freeze(['GOAL','OWN_GOAL','OPPONENT_GOAL','ASSIST','YELLOW_CARD','RED_CARD','INJURY','NOTE']);
const allowed=new Set(TYPES);
const ident=v=>typeof v==='string'&&/^[a-zA-Z0-9_.:-]{1,160}$/.test(v);
const text=(v,max=500)=>String(v??'').trim().slice(0,max);
function normalizeSportsPayload(type,input,session,events=[]){
 if(!allowed.has(type))throw Error('Maç olay türü tanınmıyor.');
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Olay ayrıntısı eksik.');
 const pool=new Set(session?.initialPlayerIds||[]);
 const pid=input.playerId?String(input.playerId):null;
 const aid=input.assistPlayerId?String(input.assistPlayerId):null;
 const playerRequired=['GOAL','OWN_GOAL','ASSIST','YELLOW_CARD','RED_CARD','INJURY'].includes(type);
 if(playerRequired&&(!pid||!ident(pid)||!pool.has(pid)))throw Error('Oyuncu bu maçın kayıtlı kadrosunda bulunmalı.');
 if(pid&&(!ident(pid)||!pool.has(pid)))throw Error('Oyuncu maça ait değil.');
 if(aid&&(!ident(aid)||!pool.has(aid)||aid===pid))throw Error('Asist yapan oyuncu geçersiz.');
 if(aid&&type!=='GOAL')throw Error('Asist yalnızca gole bağlanabilir.');
 if(type==='OPPONENT_GOAL'&&pid)throw Error('Rakip golünde kulüp oyuncusu seçmeyin.');
 const note=text(input.note,400);
 if(type==='NOTE'&&note.length<2)throw Error('Not en az iki karakter olmalı.');
 let goalEventId=null;
 if(type==='ASSIST'){
  goalEventId=String(input.goalEventId||'');
  const effective=effectiveSportingEvents(events);
  const goal=effective.find(e=>e.id===goalEventId&&e.type==='GOAL');
  if(!goal)throw Error('Asist için önce kayıtlı bir gol seçin.');
  if(goal.payload?.playerId===pid)throw Error('Golcü kendi golüne asist yapamaz.');
  if(goal.payload?.assistPlayerId||effective.some(e=>e.type==='ASSIST'&&e.payload?.goalEventId===goalEventId))throw Error('Bu gole ait asist zaten kayıtlı.');
 }
 return {playerId:pid,assistPlayerId:aid,note,goalEventId};
}
// Corrections never rewrite source events; the newest correction governs projection.
function effectiveSportingEvents(events=[]){
 const ordered=[...events].filter(e=>e&&Number.isSafeInteger(e.sequence)).sort((a,b)=>a.sequence-b.sequence);
 const base=new Map();const corrections=[];
 for(const e of ordered){if(allowed.has(e.type))base.set(e.id,{...e});else if(e.type==='EVENT_CORRECTION')corrections.push(e);}
 for(const c of corrections){const id=c.payload?.targetEventId,target=base.get(id);if(!target||c.sequence<=target.sequence)continue;
  if(c.payload?.void===true){base.set(id,{...target,voided:true,correctedBy:c.id});continue;}
  if(c.payload?.replacement&&allowed.has(c.payload.replacement.type))base.set(id,{...target,type:c.payload.replacement.type,payload:c.payload.replacement.payload,voided:false,correctedBy:c.id});
 }
 const live=[...base.values()].filter(e=>!e.voided);const goals=new Set(live.filter(e=>e.type==='GOAL').map(e=>e.id));
 return live.filter(e=>e.type!=='ASSIST'||goals.has(e.payload?.goalEventId)).sort((a,b)=>a.sequence-b.sequence);
}
function validateCorrection(input,session,events){
 const targetId=String(input?.targetEventId||'');
 const item=events.find(e=>e.id===targetId&&allowed.has(e.type)&&e.sessionId===session.id);
 if(!item)throw Error('Düzeltilecek sportif olay bulunamadı.');
 const reason=text(input.reason,200);if(reason.length<3)throw Error('Düzeltme gerekçesi en az üç karakter olmalı.');
 const voided=input.void===true;
 if(voided)return {targetEventId:targetId,reason,void:true,replacement:null};
 const newType=input.replacement?.type||item.type;
 // Exclude the target when validating an assist correction; prevent self-duplicate.
 const effective=effectiveSportingEvents(events).filter(e=>e.id!==targetId);
 const normalized=normalizeSportsPayload(newType,input.replacement?.payload||{},session,effective);
 if(item.type==='GOAL'&&newType==='GOAL'){const attached=effective.filter(e=>e.type==='ASSIST'&&e.payload?.goalEventId===targetId);if(attached.some(e=>e.payload?.playerId===normalized.playerId||Boolean(normalized.assistPlayerId)))throw Error('Bu gole bağlı ayrı asist kaydı var. Önce asisti düzeltin.');}
 return {targetEventId:targetId,reason,void:false,replacement:{type:newType,payload:normalized}};
}
function projectMatchReport(session,events=[],players=[],roster=null,nowMs=Date.now()){
 if(!session)return null;
 const pool=session.initialPlayerIds||[],starter=new Set(session.kickoffOnFieldIds||session.currentOnFieldIds||[]);
 const playerMap=new Map(players.map(p=>[p.id,p.fullName]));for(const e of roster?.entries||[])if(!playerMap.has(e.playerId))playerMap.set(e.playerId,e.nameSnapshot);
 const minute=calculatePlayerMinutes(session,events,nowMs);
 const real=effectiveSportingEvents(events);
 const byPlayer=Object.fromEntries(pool.map(id=>[id,{id,name:playerMap.get(id)||'Bilinmeyen oyuncu',starter:starter.has(id),playedMs:minute.byPlayer[id]?.playedMs||0,goals:0,assists:0,yellow:0,red:0,injuries:0,participated:starter.has(id)}]));
 let us=0,opponent=0;const notes=[];const goalsById=new Map(real.filter(e=>e.type==='GOAL').map(e=>[e.id,e]));const assignedAssists=new Set();
 for(const e of real){const p=e.payload||{},r=byPlayer[p.playerId];
  if(e.type==='GOAL'){us++;if(r)r.goals++;if(byPlayer[p.assistPlayerId]){byPlayer[p.assistPlayerId].assists++;assignedAssists.add(e.id);}}
  if(e.type==='OWN_GOAL')opponent++;
  if(e.type==='OPPONENT_GOAL')opponent++;
  if(e.type==='ASSIST'&&r&&!assignedAssists.has(p.goalEventId)&&goalsById.has(p.goalEventId)){r.assists++;assignedAssists.add(p.goalEventId);}
  if(e.type==='YELLOW_CARD'&&r)r.yellow++;
  if(e.type==='RED_CARD'&&r)r.red++;
  if(e.type==='INJURY'&&r)r.injuries++;
  if(e.type==='NOTE'||e.type==='INJURY')notes.push(e);
  if(r)r.participated=r.participated||['GOAL','OWN_GOAL','ASSIST','YELLOW_CARD','RED_CARD','INJURY'].includes(e.type);
 }
 const participants=Object.values(byPlayer).map(p=>({...p,participated:p.participated||p.playedMs>0}));
 const clock=projectClock(session,nowMs);
 return {matchId:session.matchId,status:session.status,ourGoals:us,opponentGoals:opponent,players:participants,events:real,notes,minutesReviewRequired:minute.reviewRequired,clockReviewRequired:clock.reviewRequired,elapsedMatchMs:clock.elapsedMatchMs,matchTimeLabel:session.status==='finished'?'Maç tamamlandı':'Geçici maç özeti',corrections:events.filter(e=>e.type==='EVENT_CORRECTION').length};
}
Object.assign(exports,{TYPES,normalizeSportsPayload,effectiveSportingEvents,validateCorrection,projectMatchReport});

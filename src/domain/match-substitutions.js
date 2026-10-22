// Match Studio V2.6.8-C — pure substitution and active-time projection.
const {projectClock}=require('src/domain/match-clock.js');
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_.:-]{1,160}$/.test(id);
const unique=items=>Array.isArray(items)&&items.every(validId)&&new Set(items).size===items.length;
function planSubstitution(session,{outPlayerId,inPlayerId,competitionReturnApproved=false,nowMs=Date.now()}={}){
 if(!session||!['running','paused','interval'].includes(session.status))throw Error('Oyuncu değişimi yalnızca maç sırasında veya devre arasında yapılabilir.');
 const clock=projectClock(session,nowMs);if(clock.reviewRequired)throw Error(clock.warning);
 const pool=session.initialPlayerIds||[],on=session.currentOnFieldIds||[];
 if(!unique(pool)||!unique(on)||on.some(id=>!pool.includes(id)))throw Error('Canlı maç kadrosu tutarsız; işlemi durdurun.');
 if(!validId(outPlayerId)||!validId(inPlayerId)||outPlayerId===inPlayerId)throw Error('Farklı iki oyuncu seçin.');
 if(!on.includes(outPlayerId))throw Error('Çıkan oyuncu şu anda sahada değil.');
 if(!pool.includes(inPlayerId)||on.includes(inPlayerId))throw Error('Giren oyuncu yedekler arasında bulunmalı.');
 const mode=session.rules?.substitutionMode;
 const everPlayed=session.everPlayedIds||session.kickoffOnFieldIds||on;
 const returning=everPlayed.includes(inPlayerId);
 if(returning && mode==='noReturn')throw Error('Bu maçta tekrar oyuna giriş yasak.');
 if(returning && mode==='competitionConfigured' && competitionReturnApproved!==true)throw Error('Organizasyon kuralına göre tekrar giriş için antrenör onayı gerekli.');
 if(!['noReturn','returnAllowed','competitionConfigured'].includes(mode))throw Error('Oyuncu değişikliği kuralı tanımsız.');
 const next=[...on];next.splice(next.indexOf(outPlayerId),1,inPlayerId);
 const ever=[...new Set([...everPlayed,inPlayerId])];
 const maximum=session.rules?.maximumNamedSubstitutes;
 if(!Number.isInteger(maximum)||pool.length-(session.kickoffOnFieldIds||on).length>maximum)throw Error('İsimli yedek sayısı müsabaka sınırını aşıyor.');
 return {currentOnFieldIds:next,everPlayedIds:ever,substitutionCount:(session.substitutionCount||0)+1,matchTimeMs:clock.elapsedMatchMs,periodIndex:clock.periodIndex,
  payload:{outPlayerId,inPlayerId,returning,competitionReturnApproved:Boolean(returning&&competitionReturnApproved),previousOnFieldIds:[...on],nextOnFieldIds:next}};
}
// Rebuild the played time from immutable, sequenced events, excluding pauses and intervals.
// All numerical durations are millisecond precision; minutes are formatted only in the UI.
function calculatePlayerMinutes(session,events=[],nowMs=Date.now()){
 if(!session)return {players:[],byPlayer:{},reviewRequired:false};
 const pool=unique(session.initialPlayerIds)?session.initialPlayerIds:[];
 const active=new Set((session.kickoffOnFieldIds||session.currentOnFieldIds||[]).filter(x=>pool.includes(x)));
 const totals=Object.fromEntries(pool.map(id=>[id,0]));
 const timeline=[...events].filter(e=>e?.sessionId===session.id).sort((a,b)=>a.sequence-b.sequence);
 let playing=false,last=0,reviewRequired=false,missingEvents=false;
 const accrue=to=>{if(!Number.isSafeInteger(to)||to<0){reviewRequired=true;return;}if(playing){const delta=to-last;if(delta<0){reviewRequired=true;return;}for(const id of active)if(id in totals)totals[id]+=delta;}last=to;};
 for(const event of timeline){
  const t=event.matchTimeMs;
  if(event.type==='CLOCK_CORRECTION'){
   const before=event.payload?.before?.elapsedMatchMs;
   if(Number.isSafeInteger(before)&&before>=0)accrue(before);
   const diff=t-last;
   if(diff!==0){reviewRequired=true;for(const id of active)totals[id]=Math.max(0,(totals[id]||0)+diff);}
   last=t;continue;
  }
  accrue(t);
  if(event.type==='PERIOD_START'||event.type==='CLOCK_RESUME')playing=true;
  else if(['CLOCK_PAUSE','PERIOD_END','FINALIZE','ABANDON'].includes(event.type))playing=false;
  else if(event.type==='SUBSTITUTION'){
   const out=event.payload?.outPlayerId,inside=event.payload?.inPlayerId;
   if(!active.has(out)||active.has(inside)||!pool.includes(inside)){reviewRequired=true;continue;}
   active.delete(out);active.add(inside);
  }
 }
 // Started sessions from Packet B include the full clock event history. If absent,
 // do not quietly report invented minutes.
 if(session.status!=='prepared'&&!timeline.some(e=>e.type==='PERIOD_START')){missingEvents=true;reviewRequired=true;}
 if(session.status==='running'){
  const projected=projectClock(session,nowMs);if(projected.reviewRequired)reviewRequired=true;
  else accrue(projected.elapsedMatchMs);
 }
 const byPlayer=Object.fromEntries(pool.map(id=>[id,{playerId:id,playedMs:Math.round(totals[id]||0),onField:active.has(id),playedBefore:(totals[id]||0)>0||(session.everPlayedIds||[]).includes(id)}]));
 return {players:pool.map(id=>byPlayer[id]),byPlayer,reviewRequired,missingEvents,totalRecordedEvents:timeline.length};
}
Object.assign(exports,{planSubstitution,calculatePlayerMinutes});

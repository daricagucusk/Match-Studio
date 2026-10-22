// V2.6.8 Packet B: pure deterministic match clock transitions. No timers or storage writes.
const STATUS = Object.freeze({prepared:'Hazır',running:'Oynanıyor',paused:'Duraklatıldı',interval:'Devre Arası',awaitFinal:'Maç Sonu Bekliyor',finished:'Tamamlandı'});
const MAX_GAP_AFTER_PERIOD_MS=60*60*1000;
const assertMs=(x,label)=>{if(!Number.isSafeInteger(x)||x<0)throw Error(label+' geçersiz.');return x;};
function validateClockRules(rules){
 if(!rules||!Array.isArray(rules.periods)||!rules.periods.length||rules.periods.length>6||rules.periods.some(v=>!Number.isInteger(v)||v<1||v>120))throw Error('Devre süreleri geçersiz.');
 return rules.periods;
}
function clockBase(session){
 const c=session?.clock||{};
 return {periodIndex:c.periodIndex??0,elapsedPeriodMs:c.elapsedPeriodMs??0,completedMs:c.completedMs??0,runningAnchorWallMs:c.runningAnchorWallMs??null,manualAdjustmentMs:c.manualAdjustmentMs??0,accumulatedMatchMs:c.accumulatedMatchMs??0,lastPeriodMs:c.lastPeriodMs??0};
}
function projectClock(session,nowMs=Date.now()){
 assertMs(nowMs,'Cihaz saati');const periods=validateClockRules(session?.rules),c=clockBase(session),status=session?.status||'prepared';
 if(!STATUS[status])throw Error('Bilinmeyen maç saati durumu.');
 if(!Number.isInteger(c.periodIndex)||c.periodIndex<0||c.periodIndex>=periods.length)throw Error('Devre indeksi geçersiz.');
 assertMs(c.elapsedPeriodMs,'Devre süresi');assertMs(c.completedMs,'Toplam süre');
 const scheduledPeriodMs=periods[c.periodIndex]*60*1000;
 let delta=0,reviewRequired=false,warning='';
 if(status==='running'){
  if(!Number.isSafeInteger(c.runningAnchorWallMs)||c.runningAnchorWallMs<0)throw Error('Çalışan saatin başlangıcı bulunamadı.');
  const diff=nowMs-c.runningAnchorWallMs;
  if(diff< -2000||diff>scheduledPeriodMs+MAX_GAP_AFTER_PERIOD_MS){reviewRequired=true;warning='Cihaz saati veya arka plan süresi şüpheli. Süreyi kontrol edip gerekirse düzeltin.';}
  else delta=Math.max(0,diff);
 }
 const closed=['interval','awaitFinal','finished'].includes(status);
 const elapsedPeriodMs=closed?(c.lastPeriodMs||c.elapsedPeriodMs):c.elapsedPeriodMs+delta;
 return {status,periodIndex:c.periodIndex,periodNumber:c.periodIndex+1,totalPeriods:periods.length,elapsedPeriodMs,elapsedMatchMs:c.completedMs+(closed?0:elapsedPeriodMs),scheduledPeriodMs,overrunMs:Math.max(0,elapsedPeriodMs-scheduledPeriodMs),reviewRequired,warning,clock:c};
}
function applyClockTransition(session,action,{nowMs=Date.now(),correctionMs,reason}={}){
 if(!['START','PAUSE','RESUME','END_PERIOD','NEXT_PERIOD','CORRECT','FINISH'].includes(action))throw Error('Bilinmeyen saat işlemi.');
 const view=projectClock(session,nowMs),clock={...view.clock},before={status:session.status,periodIndex:view.periodIndex,elapsedPeriodMs:view.elapsedPeriodMs,elapsedMatchMs:view.elapsedMatchMs};
 // Time anomalies require an explicit correction, not silently accruing hours of false play time.
 if(view.reviewRequired&&action!=='CORRECT')throw Error(view.warning);
 let status=session.status,eventType,payload={};
 const checkpoint=()=>{clock.elapsedPeriodMs=view.elapsedPeriodMs;clock.runningAnchorWallMs=null;clock.accumulatedMatchMs=view.elapsedMatchMs;};
 switch(action){
  case 'START':
   if(status!=='prepared')throw Error('Maç zaten başlatılmış.');
   status='running';clock.runningAnchorWallMs=nowMs;eventType='PERIOD_START';break;
  case 'PAUSE':
   if(status!=='running')throw Error('Yalnızca çalışan saat duraklatılabilir.');
   checkpoint();status='paused';eventType='CLOCK_PAUSE';break;
  case 'RESUME':
   if(status!=='paused')throw Error('Saat duraklatılmamış.');
   status='running';clock.runningAnchorWallMs=nowMs;eventType='CLOCK_RESUME';break;
  case 'END_PERIOD':
   if(!['running','paused'].includes(status))throw Error('Devre yalnızca oynanırken veya duraklatıldığında sonlandırılabilir.');
   checkpoint();clock.completedMs=view.elapsedMatchMs;clock.lastPeriodMs=view.elapsedPeriodMs;clock.elapsedPeriodMs=0;clock.accumulatedMatchMs=clock.completedMs;status=view.periodIndex+1<view.totalPeriods?'interval':'awaitFinal';eventType='PERIOD_END';break;
  case 'NEXT_PERIOD':
   if(status!=='interval')throw Error('Önce mevcut devreyi bitirin.');
   if(clock.periodIndex>=view.totalPeriods-1)throw Error('Yeni devre yok.');
   clock.periodIndex++;clock.lastPeriodMs=0;clock.elapsedPeriodMs=0;clock.runningAnchorWallMs=nowMs;clock.accumulatedMatchMs=clock.completedMs;
   status='running';eventType='PERIOD_START';break;
  case 'FINISH':
   if(status!=='awaitFinal')throw Error('Önce son devreyi bitirin.');
   status='finished';clock.runningAnchorWallMs=null;eventType='FINALIZE';break;
  case 'CORRECT':
   if(!['running','paused'].includes(status))throw Error('Saat düzeltmesi için devre oynanıyor veya duraklatılmış olmalı.');
   if(!Number.isSafeInteger(correctionMs)||correctionMs<0||correctionMs>view.scheduledPeriodMs+MAX_GAP_AFTER_PERIOD_MS)throw Error('Yeni süre geçersiz.');
   reason=String(reason||'').trim();if(reason.length<3||reason.length>200)throw Error('Düzeltme gerekçesi 3–200 karakter olmalı.');
   clock.manualAdjustmentMs+=correctionMs-view.elapsedPeriodMs;
   clock.elapsedPeriodMs=correctionMs;clock.runningAnchorWallMs=status==='running'?nowMs:null;
   clock.accumulatedMatchMs=clock.completedMs+correctionMs;eventType='CLOCK_CORRECTION';payload={reason,fromMs:view.elapsedPeriodMs,toMs:correctionMs};break;
 }
 const after=projectClock({...session,status,clock},nowMs);
 return {clock,status,eventType,periodIndex:after.periodIndex,matchTimeMs:after.elapsedMatchMs,payload:{...payload,before,after:{status,periodIndex:after.periodIndex,elapsedPeriodMs:after.elapsedPeriodMs,elapsedMatchMs:after.elapsedMatchMs},wallTimeMs:nowMs}};
}
function formatClock(ms){if(!Number.isFinite(ms)||ms<0)return '--:--';const v=Math.floor(ms/1000),mins=Math.floor(v/60),secs=v%60;return String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0');}
Object.assign(exports,{STATUS,MAX_GAP_AFTER_PERIOD_MS,validateClockRules,clockBase,projectClock,applyClockTransition,formatClock});

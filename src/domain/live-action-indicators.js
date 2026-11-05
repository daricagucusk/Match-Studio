// Read-only matchday badges. Never mutates a session or source event.
function projectLiveActionIndicators(session,events=[],report=null){
 const pool=Array.isArray(session?.initialPlayerIds)?session.initialPlayerIds:[];
 const allowed=new Set(pool);
 const fresh=()=>({goals:0,assists:0,yellow:0,red:0,inCount:0,outCount:0});
 const indicators=Object.fromEntries(pool.map(id=>[id,fresh()]));
 for(const player of report?.players||[]){
  if(!allowed.has(player.id))continue;
  const target=indicators[player.id];
  for(const key of ['goals','assists','yellow','red']){
   const count=Number(player[key]);target[key]=Number.isFinite(count)?Math.max(0,Math.floor(count)):0;
  }
 }
 for(const event of events||[]){
  if(event?.sessionId!==session?.id||event.type!=='SUBSTITUTION')continue;
  const out=event.payload?.outPlayerId,inside=event.payload?.inPlayerId;
  if(!allowed.has(out)||!allowed.has(inside)||out===inside)continue;
  indicators[out].outCount++;
  indicators[inside].inCount++;
 }
 return indicators;
}
Object.assign(exports,{projectLiveActionIndicators});

// Pure reconciliation for a permanent athlete erasure. No names/photos remain
// in roster snapshots, even for archived matches; match event records survive.
function containsPlayerReference(value,playerId){
 if(value===playerId)return true;
 if(Array.isArray(value))return value.some(v=>containsPlayerReference(v,playerId));
 return Boolean(value&&typeof value==='object'&&Object.entries(value).some(([k,v])=>k===playerId||containsPlayerReference(v,playerId)));
}
function planPlayerErasure(playerId, snapshot,{allowMissing=false}={}){
 const player=snapshot.players.find(p=>p.id===playerId);
 if(!player&&!allowMissing)throw Error('Silinecek oyuncu bulunamadı.');
 const rosters=snapshot.rosters.filter(r=>(r.entries||[]).some(e=>e.playerId===playerId)).map(r=>({
  ...r,entries:(r.entries||[]).filter(e=>e.playerId!==playerId).map((e,i)=>({...e,order:i})),updatedAt:new Date().toISOString()
 }));
 const settings=snapshot.settings.filter(s=>s.id.startsWith('lineup:')||s.id.startsWith('teamDepth:')).map(s=>{
  const v=s.value;if(!v||typeof v!=='object')return null;
  if(s.id.startsWith('teamDepth:')){
   const roles=Object.fromEntries(Object.entries(v.roles||{}).map(([role,ids])=>[role,Array.isArray(ids)?ids.filter(id=>id!==playerId):[]]));
   return JSON.stringify(roles)===JSON.stringify(v.roles||{})?null:{...s,value:{...v,roles,updatedAt:new Date().toISOString()}};
  }
  const assignments=Object.fromEntries(Object.entries(v.assignments||{}).filter(([,id])=>id!==playerId));
  const positionOverrides={...(v.positionOverrides||{})},shirtNumberOverrides={...(v.shirtNumberOverrides||{})};
  delete positionOverrides[playerId];delete shirtNumberOverrides[playerId];
  if(Object.keys(assignments).length===Object.keys(v.assignments||{}).length &&
     !(playerId in (v.positionOverrides||{}))&&!(playerId in (v.shirtNumberOverrides||{})))return null;
  return {...s,value:{...v,assignments,positionOverrides,shirtNumberOverrides,updatedAt:new Date().toISOString()}};
 }).filter(Boolean);
 // Keep asset when another player/settings/poster still uses it.
 const remainingPlayers=snapshot.players.filter(p=>p.id!==playerId);
 const refs=new Set(remainingPlayers.map(p=>p.photoAssetId).filter(Boolean));
 for(const s of snapshot.settings)if(s.id==='clubLogo'&&s.value)refs.add(s.value);
 for(const d of snapshot.posterDrafts){const bg=d?.overrides?.backgroundAssetId;if(bg)refs.add(bg);}
 // Historical live events remain for tactical audit, but removed player identifiers
 // must not survive a permanent privacy erasure in sessions or event payloads.
 const eraseIdentity=v=>{
  if(Array.isArray(v))return v.filter(item=>item!==playerId).map(eraseIdentity);
  if(v&&typeof v==='object'){
   const cleaned=Object.fromEntries(Object.entries(v).filter(([k])=>k!==playerId).map(([k,val])=>[k,val===playerId?null:eraseIdentity(val)]));
   // Preserve substitution chronology without retaining the erased identity.
   if(v.outPlayerId===playerId)cleaned.outPlayerErased=true;
   if(v.inPlayerId===playerId)cleaned.inPlayerErased=true;
   return cleaned;
  }
  return v===playerId?null:v;
 };
 const matchSessions=(snapshot.matchSessions||[]).filter(x=>containsPlayerReference(x,playerId)).map(x=>eraseIdentity(x));
 const matchEvents=(snapshot.matchEvents||[]).filter(x=>containsPlayerReference(x,playerId)).map(x=>eraseIdentity(x));
 const removedAssets=snapshot.assets.filter(a=>a.id===player?.photoAssetId&&!refs.has(a.id)).map(a=>a.id);
 return {player,rosters,settings,matchSessions,matchEvents,removedAssets,rosterCount:rosters.length,erasedEntryCount:snapshot.rosters.reduce((n,r)=>n+(r.entries||[]).filter(e=>e.playerId===playerId).length,0)};
}
function applyPlayerErasures(snapshot,playerIds=[]){
 let stores=snapshot;let erasedEntryCount=0,assetCount=0,rosterCount=0;
 for(const id of playerIds){
  const plan=planPlayerErasure(id,stores,{allowMissing:true});
  if(!plan.player&&!plan.rosters.length&&!plan.settings.length&&!plan.matchSessions.length&&!plan.matchEvents.length)continue;
  stores={...stores,players:stores.players.filter(p=>p.id!==id),assets:stores.assets.filter(a=>!plan.removedAssets.includes(a.id))};
  for(const name of ['rosters','settings','matchSessions','matchEvents']){
   const updates=new Map(plan[name].map(row=>[row.id,row]));
   stores[name]=(stores[name]||[]).map(row=>updates.get(row.id)||row);
  }
  erasedEntryCount+=plan.erasedEntryCount;assetCount+=plan.removedAssets.length;rosterCount+=plan.rosterCount;
 }
 return {stores,changed:stores!==snapshot,erasedEntryCount,assetCount,rosterCount};
}
function checkSnapshotIntegrity(stores){
 // Read-only audits can inspect v1 backup fixtures that predate live stores.
 stores={...stores,matchSessions:stores?.matchSessions||[],matchEvents:stores?.matchEvents||[]};
 const issues=[];
 for(const s of ['players','groups','matches','rosters','posterDrafts','assets','settings','matchSessions','matchEvents']){
  if(!Array.isArray(stores?.[s])){issues.push(`${s}: kayıt listesi eksik.`);continue;}
  const ids=new Set();for(const x of stores[s]){if(!x||typeof x.id!=='string'||!x.id)issues.push(`${s}: kayıt kimliği geçersiz.`);else if(ids.has(x.id))issues.push(`${s}: tekrar eden kimlik: ${x.id}`);else ids.add(x.id);}
 }
 if(issues.length)return issues;
 const players=new Set(stores.players.map(x=>x.id)), groups=new Set(stores.groups.map(x=>x.id)), matches=new Set(stores.matches.map(x=>x.id)), assets=new Set(stores.assets.map(x=>x.id));
 for(const p of stores.players){if((p.groupIds||[]).some(x=>!groups.has(x)))issues.push(`Oyuncu ${p.id}: bilinmeyen grup.`);if(p.photoAssetId&&!assets.has(p.photoAssetId))issues.push(`Oyuncu ${p.id}: fotoğraf varlığı eksik.`);}
 for(const m of stores.matches){if(!groups.has(m.groupId))issues.push(`Maç ${m.id}: grup bulunamadı.`);}
 for(const r of stores.rosters){if(!matches.has(r.matchId)||r.id!==r.matchId)issues.push(`Kadro ${r.id}: maç bağlantısı hatalı.`);const seen=new Set();for(const e of r.entries||[]){if(seen.has(e.playerId))issues.push(`Kadro ${r.id}: oyuncu tekrar ediyor.`);seen.add(e.playerId);if(!players.has(e.playerId))issues.push(`Kadro ${r.id}: silinmiş oyuncu bağlantısı var.`);}}
 for(const d of stores.posterDrafts){if(!matches.has(d.matchId))issues.push(`Afiş ${d.id}: maç bulunamadı.`);if(d?.overrides?.backgroundAssetId&&!assets.has(d.overrides.backgroundAssetId))issues.push(`Afiş ${d.id}: arka plan eksik.`);}
 for(const s of stores.settings){if(s.id==='clubLogo'&&s.value&&!assets.has(s.value))issues.push('Kulüp logosu varlığı eksik.');if(s.id.startsWith('lineup:')){if(!matches.has(s.id.slice(7)))issues.push(`Saha ${s.id}: maç bulunamadı.`);for(const id of Object.values(s.value?.assignments||{}))if(!players.has(id))issues.push(`Saha ${s.id}: silinmiş oyuncu var.`);}if(s.id.startsWith('teamDepth:'))for(const id of Object.values(s.value?.roles||{}).flat())if(!players.has(id))issues.push(`Takım derinliği ${s.id}: silinmiş oyuncu var.`);}
 const acceptedEventTypes=new Set(['PERIOD_START','PERIOD_END','CLOCK_PAUSE','CLOCK_RESUME','CLOCK_CORRECTION','SUBSTITUTION','GOAL','OWN_GOAL','OPPONENT_GOAL','ASSIST','YELLOW_CARD','RED_CARD','INJURY','NOTE','EVENT_CORRECTION','FINALIZE','ABANDON']);
 const sessionMap=new Map();for(const session of stores.matchSessions){
  if(!['prepared','firstHalf','halfTime','secondHalf','temporarilyPaused','suspended','abandoned','reviewRequired','finished','running','paused','interval','awaitFinal'].includes(session.status))issues.push(`Canlı oturum ${session.id}: durum geçersiz.`);
  if(!matches.has(session.matchId))issues.push(`Canlı oturum ${session.id}: maç bulunamadı.`);
  if(session.id!=='session:'+session.matchId)issues.push(`Canlı oturum ${session.id}: kimlik eşleşmiyor.`);
  if(sessionMap.has(session.id)||[...sessionMap.values()].some(x=>x.matchId===session.matchId))issues.push(`Canlı oturum ${session.id}: bir maç için çoklu oturum.`);
  sessionMap.set(session.id,session);
  if(!Number.isSafeInteger(session.revision)||session.revision<0)issues.push(`Canlı oturum ${session.id}: revizyon geçersiz.`);
  for(const key of ['initialPlayerIds','currentOnFieldIds']){
   if(!Array.isArray(session[key])){issues.push(`Canlı oturum ${session.id}: ${key} listesi eksik.`);continue;}
   const nonNull=session[key].filter(Boolean);if(new Set(nonNull).size!==nonNull.length)issues.push(`Canlı oturum ${session.id}: ${key} oyuncuları tekrar ediyor.`);
   if(nonNull.some(id=>!players.has(id)))issues.push(`Canlı oturum ${session.id}: ${key} silinmiş oyuncu var.`);
  }
 }
 const eventSeq=new Set(),idempotency=new Set(),seqForSession=new Map();for(const e of stores.matchEvents){
  if(!acceptedEventTypes.has(e.type))issues.push(`Canlı olay ${e.id}: olay türü geçersiz.`);
  seqForSession.set(e.sessionId,Math.max(seqForSession.get(e.sessionId)||0,e.sequence||0));
  const session=sessionMap.get(e.sessionId);
  if(!session||!matches.has(e.matchId)||session.matchId!==e.matchId)issues.push(`Canlı olay ${e.id}: maç/oturum bağlantısı geçersiz.`);
  if(!Number.isSafeInteger(e.sequence)||e.sequence<1)issues.push(`Canlı olay ${e.id}: sıra geçersiz.`);
  const key=e.sessionId+'|'+e.sequence,idem=e.sessionId+'|'+e.idempotencyKey;
  if(eventSeq.has(key))issues.push(`Canlı olay ${e.id}: aynı sıra kullanılmış.`);eventSeq.add(key);
  if(!e.idempotencyKey||idempotency.has(idem))issues.push(`Canlı olay ${e.id}: idempotency anahtarı hatalı.`);idempotency.add(idem);
  if(!Number.isFinite(e.matchTimeMs)||e.matchTimeMs<0)issues.push(`Canlı olay ${e.id}: maç zamanı geçersiz.`);
  for(const field of ['inPlayerId','outPlayerId','playerId','assistPlayerId'])if(e.payload?.[field]&&!players.has(e.payload[field]))issues.push(`Canlı olay ${e.id}: oyuncu referansı geçersiz.`);
 }
 for(const session of sessionMap.values())if((session.sequence||0)!==(seqForSession.get(session.id)||0))issues.push(`Canlı oturum ${session.id}: son olay sırası uyuşmuyor.`);
 return issues;
}
Object.assign(exports,{planPlayerErasure,applyPlayerErasures,containsPlayerReference,checkSnapshotIntegrity});

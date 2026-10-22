// Match Studio V2.6.8-D — pure projection; live pitch never rewrites the planned lineup.
// The session's persisted on-field IDs remain authoritative. The kickoff slot snapshot
// is used only for positions and is replayed through sequenced substitution events.
const {getPitchPresets}=require('src/domain/lineup.js');
const {isCrosswise,facilityHtml}=require('src/domain/pitch-layout.js');
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj||{},key);
const unique=ids=>Array.isArray(ids)&&new Set(ids).size===ids.length&&ids.every(x=>typeof x==='string');
function fallbackSlots(n){
 const ys=[86,64,42,20];
 return Array.from({length:n},(_,i)=>({x:n===1?50:16+68*((i%3)/2),y:ys[Math.floor(i/3)]??20,label:i===0?'KL':'OY'}));
}
function projectLivePitch({session,events=[],match=null,lineup=null}={}){
 if(!session||!unique(session.currentOnFieldIds)||!unique(session.kickoffOnFieldIds))throw Error('Canlı saha kimlikleri tutarsız.');
 const kickoff=session.kickoffOnFieldIds,nowOn=session.currentOnFieldIds;
 const presets=getPitchPresets();
 const formation=session.kickoffPreset||lineup?.preset||`Serbest ${kickoff.length}`;
 let slots=presets[formation];
 if(!Array.isArray(slots)||slots.length!==kickoff.length){
  slots=Object.values(presets).find(p=>p.length===kickoff.length)||fallbackSlots(kickoff.length);
 }
 let needsReview=false;
 const notes=[];
 let source=session.kickoffPitchAssignments;
 const isValid=source&&typeof source==='object'&&!Array.isArray(source)&&Object.keys(source).length===kickoff.length
  &&Object.keys(source).every(k=>/^\d+$/.test(k)&&Number(k)<slots.length&&kickoff.includes(source[k]))
  &&new Set(Object.values(source)).size===kickoff.length;
 if(!isValid){
  // Legacy sessions made before Packet D have no kickoff slot snapshot.
  // Preserve the set of players and flag any reconstructed geometry as provisional.
  source=Object.fromEntries(kickoff.map((id,i)=>[String(i),id]));
  if(session.status!=='prepared'){needsReview=true;notes.push('Eski canlı oturum: başlangıç saha konumları yaklaşık gösteriliyor.');}
 }
 const assignments={...source};
 const timeline=[...events].filter(e=>e?.sessionId===session.id&&e.type==='SUBSTITUTION').sort((a,b)=>a.sequence-b.sequence);
 for(const evt of timeline){
  const out=evt.payload?.outPlayerId,inside=evt.payload?.inPlayerId;
  const entry=Object.entries(assignments).find(([,id])=>id===out);
  if(!entry||!inside||Object.values(assignments).includes(inside)){needsReview=true;notes.push('Olay geçmişindeki saha yerleşimi kontrol edilmeli.');continue;}
  assignments[entry[0]]=inside;
 }
 // Every rendering is grounded in the authoritative session. Never silently show
 // a stale planned lineup or invent a player as being on the field.
 const set=new Set(nowOn);
 const displayed=Object.values(assignments),observed=new Set(displayed);
 if(displayed.length!==nowOn.length||observed.size!==displayed.length||displayed.some(id=>!set.has(id))||nowOn.some(id=>!observed.has(id))){
  needsReview=true;notes.push('Kaydedilen canlı kadro ile olay geçmişi farklı; saha yerleri kontrol edilmeli.');
  const preserved={};const used=new Set();
  for(const [slot,id] of Object.entries(assignments))if(set.has(id)&&!used.has(id)){preserved[slot]=id;used.add(id);}
  const holes=Array.from({length:slots.length},(_,i)=>String(i)).filter(k=>!own(preserved,k));
  for(const id of nowOn)if(!used.has(id)){const slot=holes.shift();if(slot===undefined)throw Error('Canlı saha kapasitesi aşıldı.');preserved[slot]=id;used.add(id);}
  Object.assign(assignments,preserved);
  for(const k of Object.keys(assignments))if(!own(preserved,k))delete assignments[k];
 }
 return {formation,slots,assignments,onFieldIds:nowOn,benchIds:(session.initialPlayerIds||[]).filter(id=>!set.has(id)),needsReview,warning:[...new Set(notes)].join(' '),isCrosswise:isCrosswise(match),facilityHtml};
}
Object.assign(exports,{projectLivePitch});

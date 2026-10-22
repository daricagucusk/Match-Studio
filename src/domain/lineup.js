

// Per-match tactical layout. Every entry references an existing roster player ID.
// The stored plan lives in the existing IndexedDB settings store, so V2 databases
// remain compatible and old JSON backup exports include tactical layouts.
const point=(x,y,label)=>({x,y,label});
const PRESETS={
 '1-2 (kalecisiz)':[point(24,65,'SV'),point(76,65,'SV'),point(50,23,'HÜ')],
 '2-2 (kalecisiz)':[point(28,75,'SV'),point(72,75,'SV'),point(28,30,'HÜ'),point(72,30,'HÜ')],
 '1-2-1':[point(50,90,'KL'),point(50,72,'SV'),point(23,47,'OS'),point(77,47,'OS'),point(50,20,'SF')],
 '2-2-1':[point(50,90,'KL'),point(32,72,'SV'),point(68,72,'SV'),point(30,42,'OS'),point(70,42,'OS'),point(50,20,'SF')],
 '3-2-1':[point(50,90,'KL'),point(20,74,'STP'),point(50,77,'STP'),point(80,74,'STP'),point(32,46,'OS'),point(68,46,'OS'),point(50,20,'SF')],
 '3-2-3':[point(50,90,'KL'),point(19,75,'STP'),point(50,78,'STP'),point(81,75,'STP'),point(31,52,'OS'),point(69,52,'OS'),point(18,23,'KA'),point(50,18,'SF'),point(82,23,'KA')],
 '3-3-3':[point(50,90,'KL'),point(20,76,'STP'),point(50,80,'STP'),point(80,76,'STP'),point(20,52,'OS'),point(50,56,'OS'),point(80,52,'OS'),point(18,23,'KA'),point(50,19,'SF'),point(82,23,'KA')],
 '4-3-3':[point(50,90,'KL'),point(13,72,'SB'),point(36,76,'STP'),point(64,76,'STP'),point(87,72,'SB'),point(26,51,'OS'),point(50,57,'DOS'),point(74,51,'OS'),point(17,25,'KA'),point(50,19,'SF'),point(83,25,'KA')],
 '4-2-3-1':[point(50,90,'KL'),point(13,73,'SB'),point(36,76,'STP'),point(64,76,'STP'),point(87,73,'SB'),point(37,61,'DOS'),point(63,61,'DOS'),point(16,40,'KA'),point(50,43,'OOS'),point(84,40,'KA'),point(50,19,'SF')],
 '4-4-2':[point(50,90,'KL'),point(13,74,'SB'),point(36,76,'STP'),point(64,76,'STP'),point(87,74,'SB'),point(13,49,'KA'),point(38,54,'OS'),point(62,54,'OS'),point(87,49,'KA'),point(36,23,'SF'),point(64,23,'SF')],
 '3-5-2':[point(50,90,'KL'),point(22,76,'STP'),point(50,78,'STP'),point(78,76,'STP'),point(11,50,'KNT'),point(32,54,'OS'),point(50,61,'DOS'),point(68,54,'OS'),point(89,50,'KNT'),point(34,22,'SF'),point(66,22,'SF')],
 '3-3-2':[point(50,90,'KL'),point(20,74,'STP'),point(50,77,'STP'),point(80,74,'STP'),point(20,52,'OS'),point(50,58,'OS'),point(80,52,'OS'),point(34,25,'SF'),point(66,25,'SF')],
 '3-3-1':[point(50,90,'KL'),point(20,74,'STP'),point(50,77,'STP'),point(80,74,'STP'),point(20,49,'OS'),point(50,56,'OS'),point(80,49,'OS'),point(50,23,'SF')],
 '2-3-1':[point(50,90,'KL'),point(33,76,'STP'),point(67,76,'STP'),point(18,49,'OS'),point(50,56,'OS'),point(82,49,'OS'),point(50,24,'SF')]
};
// Alternative formations are deliberately distinct tactical layouts, not age rules.
// Outfield rows are ordered DEFENCE -> MIDFIELD -> ATTACK; GK is always a slot.
function addFormation(name,rows){
 const count=rows.reduce((n,row)=>n+row,0), out=[point(50,90,'KL')];
 const ys=rows.length===2?[70,25]:rows.length===3?[73,49,24]:rows.length===4?[75,59,39,19]:[75,49,24];
 rows.forEach((n,ri)=>{
  for(let i=0;i<n;i++){
   const x=n===1?50:Math.round(16+(68*i)/(n-1));
   const label=ri===0?(n>=3&&(i===0||i===n-1)?'SB':'STP'):ri===rows.length-1?(n>=3&&(i===0||i===n-1)?'KA':'SF'):rows.length===4&&ri===1&&n<=2?'DOS':rows.length===4&&ri===2&&n<=2?'OOS':'OS';
   out.push(point(x,ys[ri]||25,label));
  }
 });
 if(out.length!==count+1)throw Error('Diziliş üretim hatası.');
 PRESETS[name]=out;
}
// More than one goalkeeper-based option for each supported 5v5-11v11 competition size.
const ALTERNATIVES={
 '2-1-1':[2,1,1], '1-1-2':[1,1,2], '1-3':[1,3],
 '1-3-1':[1,3,1], '2-1-2':[2,1,2],
 '3-1-2':[3,1,2], '2-1-3':[2,1,3],
 '2-3-2':[2,3,2], '3-2-2':[3,2,2], '2-4-1':[2,4,1],
 '2-4-2':[2,4,2], '4-3-1':[4,3,1],
 '4-3-2':[4,3,2], '3-4-2':[3,4,2],
 '3-4-3':[3,4,3], '4-1-4-1':[4,1,4,1], '3-4-1-2':[3,4,1,2],
};
for(const [name,rows] of Object.entries(ALTERNATIVES))addFormation(name,rows);
// Free-form training formats with no goalkeeper: the number of positions stays exact.
function freeFormSlots(n){
 const rows=n<=5?[Math.ceil(n/2),Math.floor(n/2)]:[Math.ceil(n/3),Math.ceil(n/3),n-2*Math.ceil(n/3)];
 const out=[];for(const [ri,count] of rows.entries())for(let i=0;i<count;i++)out.push(point(Math.round(50+(i-(count-1)/2)*(70/Math.max(1,count-1))),Math.round(77-ri*23),ri===0?'SV':ri===1?'OS':'HÜ'));
 return out;
}
for(let n=3;n<=11;n++)PRESETS[`Serbest ${n} (kalecisiz)`]=freeFormSlots(n);
for(let n=5;n<=11;n++){
 const rows=[Math.floor(n/3),Math.ceil(n/3),n-Math.floor(n/3)-Math.ceil(n/3)],out=[];
 rows.forEach((count,ri)=>{for(let i=0;i<count;i++)out.push(point(Math.round(50+(i-(count-1)/2)*(70/Math.max(1,count-1))),Math.round(78-ri*26),ri===0?'SV':ri===1?'OS':'HÜ'));});
 PRESETS[`Alternatif ${n} (kalecisiz)`]=out;
}
// An extra goalkeeper-free option for the smallest formats.
PRESETS['2-1 (kalecisiz)']=[point(30,72,'SV'),point(70,72,'SV'),point(50,24,'HÜ')];
PRESETS['1-2-1 (kalecisiz)']=[point(50,82,'SV'),point(27,52,'OS'),point(73,52,'OS'),point(50,22,'HÜ')];
const getPitchPresets=()=>PRESETS;
const presetHasGoalkeeper=preset=>!String(preset).includes('kalecisiz');
const makeLineup=(matchId,preset='4-3-3')=>({matchId,mode:'match',preset,assignments:{},positionOverrides:{},shirtNumberOverrides:{},updatedAt:new Date().toISOString()});
function normalizeLineup(plan,roster){
 const source=plan&&PRESETS[plan.preset]?plan:makeLineup(roster.matchId);
 const allowed=new Set((roster.entries||[]).map(e=>e.playerId));const assignments={};const assigned=new Set();
 for(const [slot,id] of Object.entries(source.assignments||{})){
  if(!/^\d+$/.test(slot)||Number(slot)>=PRESETS[source.preset].length||!allowed.has(id)||assigned.has(id))continue;
  assignments[slot]=id;assigned.add(id);
 }
 return {...source,mode:source.mode==='all'?'all':'match',assignments,positionOverrides:Object.fromEntries(Object.entries(source.positionOverrides||{}).filter(([id,role])=>allowed.has(id)&&['GK','DF','MF','FW','OTHER'].includes(role))),shirtNumberOverrides:Object.fromEntries(Object.entries(source.shirtNumberOverrides||{}).filter(([id,num])=>allowed.has(id)&&/^(?:[1-9]|[1-9][0-9])$/.test(String(num))).map(([id,num])=>[id,String(num)]))};
}
function placePlayer(plan,roster,playerId,slotIndex){
 if(!(roster.entries||[]).some(e=>e.playerId===playerId))throw Error('Oyuncu maç kadrosunda bulunmuyor.');
 const normalized=normalizeLineup(plan,roster);const slot=Number(slotIndex);
 if(!Number.isInteger(slot)||slot<0||slot>=PRESETS[normalized.preset].length)throw Error('Saha konumu geçersiz.');
 const assignments={...normalized.assignments};const targetKey=String(slot);const previous=assignments[targetKey];
 const fromKey=Object.keys(assignments).find(k=>assignments[k]===playerId);
 if(fromKey===targetKey)return normalized;
 if(fromKey!==undefined){if(previous)assignments[fromKey]=previous;else delete assignments[fromKey];}
 assignments[targetKey]=playerId;
 return {...normalized,assignments,updatedAt:new Date().toISOString()};
}
function removeFromPitch(plan,playerId){const assignments={...plan.assignments};for(const key of Object.keys(assignments))if(assignments[key]===playerId)delete assignments[key];return {...plan,assignments,updatedAt:new Date().toISOString()};}
function changePitchPreset(plan,preset){
 if(!PRESETS[preset])throw Error('Diziliş bulunamadı.');
 const count=PRESETS[preset].length;return {...plan,preset,assignments:Object.fromEntries(Object.entries(plan.assignments).filter(([slot])=>Number(slot)<count)),updatedAt:new Date().toISOString()};
}
function getBenchIds(plan,roster){const assigned=new Set(Object.values(normalizeLineup(plan,roster).assignments));return (roster.entries||[]).filter(e=>!assigned.has(e.playerId)).sort((a,b)=>a.order-b.order).map(e=>e.playerId);}
function setPlayerPitchRole(plan,roster,playerId,role){
 if(!(roster.entries||[]).some(e=>e.playerId===playerId))throw Error('Oyuncu maç kadrosunda bulunmuyor.');
 if(!['GK','DF','MF','FW','OTHER'].includes(role))throw Error('Mevki seçimi geçersiz.');
 return {...plan,positionOverrides:{...(plan.positionOverrides||{}),[playerId]:role},updatedAt:new Date().toISOString()};
}
function getFullPitchRows(roster,players=[],positionOverrides={}){
 const byId=new Map(players.map(p=>[p.id,p]));
 const groups=[{key:'GK',label:'Kaleciler',players:[]},{key:'DF',label:'Savunma',players:[]},{key:'MF',label:'Orta saha',players:[]},{key:'FW',label:'Hücum',players:[]},{key:'OTHER',label:'Mevkisi belirtilmeyenler',players:[]}];
 for(const e of roster.entries||[]){let position=positionOverrides[e.playerId]||byId.get(e.playerId)?.position||e.positionSnapshot||'OTHER';if(!['GK','DF','MF','FW'].includes(position))position='OTHER';groups.find(g=>g.key===position).players.push(e);}
 return groups;
}

function getPitchShirtNumber(plan,entry){return String(plan?.shirtNumberOverrides?.[entry?.playerId]??entry?.shirtNumberSnapshot??'').trim();}
// Jersey number override is per-match; it must not mutate the global player card or old snapshots.
function setPitchShirtNumber(plan,roster,playerId,number){
 const entry=(roster.entries||[]).find(e=>e.playerId===playerId);
 if(!entry)throw Error('Oyuncu maç kadrosunda bulunmuyor.');
 const value=String(number??'').trim();
 if(value!==''&&!/^(?:[1-9]|[1-9][0-9])$/.test(value))throw Error('Forma numarası 1–99 olmalı veya boş bırakılmalı.');
 const overrides={...(plan.shirtNumberOverrides||{})};
 if(value)overrides[playerId]=value;else delete overrides[playerId];
 if(value){const clash=roster.entries.find(e=>e.playerId!==playerId&&getPitchShirtNumber({shirtNumberOverrides:overrides},e)===value);if(clash)throw Error(`Bu numara ${clash.nameSnapshot} tarafından kullanılıyor.`);}
 return {...plan,shirtNumberOverrides:overrides,updatedAt:new Date().toISOString()};
}
Object.assign(exports,{getPitchShirtNumber,setPitchShirtNumber,getPitchPresets,presetHasGoalkeeper,makeLineup,normalizeLineup,placePlayer,removeFromPitch,changePitchPreset,getBenchIds,setPlayerPitchRole,getFullPitchRows});

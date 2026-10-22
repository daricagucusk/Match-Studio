
const {addPlayer}=require("src/domain/roster.js");
const {resolveMatchFormat,defaultPresetFor}=require("src/domain/match-format.js");


// Club policy. These limits are the user's internal roster workflow, not a statement of federation rules.
function parseAgeCategory(value){
 const match=String(value||'').toLocaleUpperCase('tr-TR').match(/\bU\s*-?\s*(\d{1,2})\b/);
 return match&&Number(match[1])>=6&&Number(match[1])<=23?`U${Number(match[1])}`:null;
}
function getRosterPolicy(match,groups=[]){
 if(!match)return null;
 const category=parseAgeCategory(match.ageCategory)||parseAgeCategory(groups.find(g=>g.id===match.groupId)?.name);
 const explicit=resolveMatchFormat(match);
 if(explicit){const starterLimit=explicit.playersPerSide,benchLimit=explicit.benchLimit;return {ageCategory:category||String(match.ageCategory||'Diğer'),starterLimit,benchLimit,maxPlayers:starterLimit+benchLimit,defaultPreset:defaultPresetFor(explicit),goalkeeperMode:explicit.goalkeeperMode,formatSource:'explicit'};}
 if(!category)return null;
 const junior=Number(category.slice(1))<=12;
 return {ageCategory:category,starterLimit:junior?8:11,benchLimit:junior?8:10,maxPlayers:junior?16:21,defaultPreset:junior?'3-3-1':'4-3-3'};
}
function filterMultiGroupPool(players,selectedGroupIds=[],query=''){
 const term=String(query).trim().toLocaleLowerCase('tr-TR');
 const ids=new Set(selectedGroupIds);
 return [...new Map(players.filter(p=>p.isActive!==false &&(!ids.size||(p.groupIds||[]).some(id=>ids.has(id)))&&(!term||String(p.fullName).toLocaleLowerCase('tr-TR').includes(term))).map(p=>[p.id,p])).values()].sort((a,b)=>a.fullName.localeCompare(b.fullName,'tr-TR'));
}
function availableRosterSpots(roster,policy){return {used:roster.entries.length,remaining:Math.max(0,policy.maxPlayers-roster.entries.length),max:policy.maxPlayers};}
function proposeRosterAddition(roster,player,policy){
 if(!policy)throw Error('Maç kategorisi belirtilmeli. U11–U12 veya U13+ seçin.');
 if(roster.entries.some(e=>e.playerId===player.id))return roster;
 if(roster.entries.length>=policy.maxPlayers)throw Error(`Bu kategori için maç kadrosu en fazla ${policy.maxPlayers} oyuncu içerebilir.`);
 return addPlayer(roster,player);
}
function proposeBulkRosterAddition(roster,players,policy){
 let result=roster;for(const player of players)if(player.isActive!==false)result=proposeRosterAddition(result,player,policy);
 return result;
}
function getMatchRosterSections(roster,plan,policy){
 const entries=roster.entries||[];const lookup=new Map(entries.map(e=>[e.playerId,e]));
 const ids=Object.entries(plan?.assignments||{}).filter(([slot,id])=>Number.isInteger(Number(slot))&&Number(slot)>=0&&Number(slot)<policy.starterLimit&&lookup.has(id)).sort((a,b)=>Number(a[0])-Number(b[0])).map(([,id])=>id);
 const seen=new Set();const starters=ids.filter(id=>!seen.has(id)&&seen.add(id)).map(id=>lookup.get(id));
 const bench=entries.filter(e=>!seen.has(e.playerId));
 return {starters,bench,slotsRemaining:Math.max(0,policy.starterLimit-starters.length),starterLimit:policy.starterLimit,benchLimit:policy.benchLimit,maxPlayers:policy.maxPlayers,overLimit:entries.length>policy.maxPlayers};
}
// The choice order is a provisional starting lineup, never an inferred sporting position.
// The coach remains free to move players between slots or substitute them.
function autofillStartingLineup(plan,roster,policy,{excludeIds=[]}={}){
 if(!policy)return plan;
 const valid=new Set((roster.entries||[]).map(e=>e.playerId));
 const assignments={};const used=new Set();
 for(const [slot,id] of Object.entries(plan.assignments||{})){
  if(Number.isInteger(Number(slot)) && Number(slot)>=0 && Number(slot)<policy.starterLimit &&valid.has(id)&&!used.has(id)){
   assignments[slot]=id;used.add(id);
  }
 }
 const forbidden=new Set(excludeIds);
 const pool=roster.entries.filter(e=>!used.has(e.playerId)&&!forbidden.has(e.playerId)).sort((a,b)=>a.order-b.order);
 for(let slot=0;slot<policy.starterLimit&&pool.length;slot++)if(!assignments[String(slot)]){const player=pool.shift();assignments[String(slot)]=player.playerId;used.add(player.playerId);}
 return {...plan,assignments,preset:plan?.preset&&require('src/domain/lineup.js').getPitchPresets()[plan.preset]?.length===policy.starterLimit?plan.preset:policy.defaultPreset,updatedAt:new Date().toISOString()};
}

// Preserve over-limit legacy rosters as drafts; no automatic player removal.
function capacityWarning(roster,policy){
 if(!policy)return 'Maç için yaş kategorisini belirtmelisin.';
 const excess=(roster.entries||[]).length-policy.maxPlayers;
 return excess>0?`Mevcut kadro ${policy.maxPlayers} kişilik sınırı ${excess} oyuncu aşıyor. Oyuncular silinmedi; kadroyu elle düzenle.`:null;
}

Object.assign(exports,{parseAgeCategory,getRosterPolicy,filterMultiGroupPool,availableRosterSpots,proposeRosterAddition,proposeBulkRosterAddition,getMatchRosterSections,autofillStartingLineup,capacityWarning});

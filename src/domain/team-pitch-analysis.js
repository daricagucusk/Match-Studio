
const {TEAM_ROLES,TEAM_ROLE_PROFILES,sanitizeTeamDepth,getSlotKey,getSlotIdentity,getTeamSlotCandidates}=require("src/domain/team-depth.js");
const {getPitchPresets}=require("src/domain/lineup.js");


// Formation slots are coaching benchmarks, not official competition eligibility limits.
const FORMATIONS={
 '5v5 · 1-2-1':{GK:1,RB:0,CB:1,LB:0,DM:0,CM:2,AM:0,RW:0,LW:0,ST:1},
 '7v7 · 2-3-1':{GK:1,RB:0,CB:2,LB:0,DM:0,CM:3,AM:0,RW:0,LW:0,ST:1},
 '8v8 · 3-3-1':{GK:1,RB:0,CB:3,LB:0,DM:0,CM:3,AM:0,RW:0,LW:0,ST:1},
 '9v9 · 3-3-2':{GK:1,RB:0,CB:3,LB:0,DM:0,CM:3,AM:0,RW:0,LW:0,ST:2},
 '4-3-3':{GK:1,RB:1,CB:2,LB:1,DM:1,CM:2,AM:0,RW:1,LW:1,ST:1},
 '4-2-3-1':{GK:1,RB:1,CB:2,LB:1,DM:2,CM:0,AM:1,RW:1,LW:1,ST:1},
 '4-4-2':{GK:1,RB:1,CB:2,LB:1,DM:0,CM:2,AM:0,RW:1,LW:1,ST:2}
};
// Team depth supports the very same formation catalogue as match pitch.
// Preserve legacy labels, infer role targets for newer tactical presets.
const TEAM_PITCH_FORMATIONS=[...Object.keys(FORMATIONS)];
const presetLookup={};
for(const [preset,slots] of Object.entries(getPitchPresets())){
 const size=slots.length;
 const display= size===11?preset:`${size}v${size} · ${preset}`;
 if(TEAM_PITCH_FORMATIONS.includes(display))continue;
 TEAM_PITCH_FORMATIONS.push(display);presetLookup[display]=preset;
}
const roleFromSlot=slot=>{
 switch(slot.label){
  case 'KL':return 'GK';case 'SB':case 'KNT':return slot.x<50?'LB':'RB';
  case 'STP':case 'SV':return 'CB';case 'DOS':return 'DM';case 'OOS':return 'AM';
  case 'OS':return 'CM';case 'KA':return slot.x<50?'LW':'RW';
  case 'HÜ':case 'SF':return 'ST';default:return 'CM';
 }
};
function normalizeTeamPitchPrefs(input={}){
 const formation=TEAM_PITCH_FORMATIONS.includes(input?.formation)?input.formation:'4-3-3';
 const depthFactor=input?.depthFactor===1?1:2;
 return {formation,depthFactor};
}
function getPositionTargets(formation='4-3-3'){
 if(FORMATIONS[formation])return {...FORMATIONS[formation]};
 const preset=presetLookup[formation];
 if(preset){
  const slots=getPitchPresets()[preset]||[],target=Object.fromEntries(TEAM_ROLES.map(r=>[r.code,0]));
  for(const slot of slots)target[roleFromSlot(slot)]++;
  return target;
 }
 return {...FORMATIONS['4-3-3']};
}
// Produce actual tactical position coordinates from the selected formation.
// Only occupied tactical roles appear on the pitch; other roles remain editable in the selector.
function getFormationPitchSlots(formation='4-3-3'){
 const targets=getPositionTargets(formation),slots=[];
 const rows=[
  {roles:['LW','ST','RW'],y:20},
  {roles:['AM'],y:37},
  {roles:['CM'],y:49},
  {roles:['DM'],y:61},
  {roles:['LB','CB','RB'],y:76},
  {roles:['GK'],y:91}
 ];
 for(const row of rows){
  const roleCodes=[];
  for(const role of row.roles)for(let i=0;i<(targets[role]||0);i++)roleCodes.push(role);
  if(!roleCodes.length)continue;
  const len=roleCodes.length;
  const xs=len===1?[50]:len===2?[32,68]:len===3?[19,50,81]:Array.from({length:len},(_,i)=>14+72*i/(len-1));
  const seen={};roleCodes.forEach((role,i)=>{let idx=seen[role]||0;seen[role]=idx+1;slots.push({role,roleIndex:idx,x:Math.round(xs[i]),y:row.y,roleTotal:targets[role]});});
 }
 return slots;
}
// Deterministic bipartite matching: the same athlete occupies at most one
// tactical slot (including reserve slots) in a simultaneous formation analysis.
// Fill all primary positions first, then use remaining athletes for backups.
// The augmenting path maximises filled positions instead of greedily consuming
// a versatile player while another role becomes empty.
function matchRoleSlots(slots,roles,idMap,excluded=new Set(),slotCandidates={}){
 const assigned=new Map(),claimedByPlayer=new Map();
 function find(slotIndex,visited){
  const slot=slots[slotIndex],role=slot.role,key=getSlotKey(role,slot.roleIndex);
  const candidates=Object.prototype.hasOwnProperty.call(slotCandidates,key)?slotCandidates[key]:roles[role];
  for(const id of candidates||[]){
   if(excluded.has(id)||!idMap.has(id)||visited.has(id))continue;
   visited.add(id);
   const old=claimedByPlayer.get(id);
   if(old===undefined||find(old,visited)){
    claimedByPlayer.set(id,slotIndex);assigned.set(slotIndex,id);
    return true;
   }
  }
  return false;
 }
 // Reverse iteration preserves the first position's highest priority choices
 // when several tactical slots use the same role.
 for(let i=slots.length-1;i>=0;i--)find(i,new Set());
 return assigned;
}
function getTeamPitchAnalysis(depth,players=[],prefs={}){
 const safePrefs=normalizeTeamPitchPrefs(prefs);
 const normalized=sanitizeTeamDepth(depth,players);
 const eligible=players.filter(p=>(p.groupIds||[]).includes(normalized.groupId)&&p.isActive!==false);
 const idMap=new Map(eligible.map(p=>[p.id,p]));
 const formationTargets=getPositionTargets(safePrefs.formation);
 const tacticalSlots=getFormationPitchSlots(safePrefs.formation);
 const first=matchRoleSlots(tacticalSlots,normalized.roles,idMap,new Set(),normalized.slotCandidates);
 const reserved=new Set(first.values());
 // Show two explicit coaching preferences even when the coverage goal is 1x.
 const second=matchRoleSlots(tacticalSlots,normalized.roles,idMap,reserved,normalized.slotCandidates);
 const selectedIds=new Set(),nominations=new Map(),nominatedRoles=new Map();
 const nominate=(id,code)=>{
  if(!idMap.has(id))return;
  selectedIds.add(id);
  const roles=nominatedRoles.get(id)||new Set();
  roles.add(code);nominatedRoles.set(id,roles);
 };
 for(const r of TEAM_ROLES)for(const id of normalized.roles[r.code]||[])nominate(id,r.code);
 for(const [slotKey,ids] of Object.entries(normalized.slotCandidates)){
  const code=slotKey.split(':')[0];
  for(const id of ids)nominate(id,code);
 }
 for(const [id,roles] of nominatedRoles)nominations.set(id,roles.size);
 const positions={};let missingSlots=0,assignedPrimary=0,assignedBackups=0;
 const assignments=tacticalSlots.map((slot,index)=>{
  const p=first.has(index)?idMap.get(first.get(index)):null;
  const backup=second.has(index)?idMap.get(second.get(index)):null;
  if(p)assignedPrimary++;else missingSlots++;
  if(backup)assignedBackups++;
  if(safePrefs.depthFactor===2&&!backup)missingSlots++;
  const identity=getSlotIdentity(slot);
  const pool=getTeamSlotCandidates(normalized,identity.key).map(id=>idMap.get(id)).filter(Boolean);
  const alternatives=pool.filter(candidate=>candidate.id!==p?.id&&candidate.id!==backup?.id);
  const availableRoles=TEAM_ROLE_PROFILES[slot.role];
  const tacticalRole=normalized.tacticalRoles[identity.key]||availableRoles[0].id;
  const tacticalRoleName=availableRoles.find(r=>r.id===tacticalRole)?.name||availableRoles[0].name;
  return {...slot,...identity,slotIndex:index,primary:p,backup,alternatives,candidateCount:pool.length,tacticalRole,tacticalRoleName};
 });
 for(const r of TEAM_ROLES){
  const roleSlots=assignments.filter(s=>s.role===r.code);
  const ids=[...new Set([...(normalized.roles[r.code]||[]),...roleSlots.flatMap(s=>getTeamSlotCandidates(normalized,s.key))])];
  const candidates=ids.map(id=>idMap.get(id)).filter(Boolean);
  const members=[...roleSlots.map(s=>s.primary),...roleSlots.map(s=>s.backup)].filter(Boolean);
  const slots=formationTargets[r.code]||0,target=slots*safePrefs.depthFactor,count=members.length;
  const status=target===0?(candidates.length?'alternative':'optional'):count<target?'missing':candidates.length>target?'crowded':'balanced';
  positions[r.code]={...r,slots,target,count,candidateCount:candidates.length,status,members,candidates};
 }
 const multiRoleCandidateIds=[...nominations].filter(([,n])=>n>1).map(([id])=>id);
 return {groupId:normalized.groupId,prefs:safePrefs,positions,slots:assignments,
  total:eligible.length,assignedUnique:selectedIds.size,assignments:[...nominations.values()].reduce((a,b)=>a+b,0),
  assignedPrimary,assignedBackups,filledUnique:assignedPrimary+assignedBackups,missingSlots,
  multiRoleCandidateIds,duplicateRoleNominations:multiRoleCandidateIds.length,
  unassigned:eligible.filter(p=>!selectedIds.has(p.id)),
  missingRoles:Object.values(positions).filter(p=>p.status==='missing').map(p=>p.code),
  crowdedRoles:Object.values(positions).filter(p=>p.status==='crowded').map(p=>p.code)};
}

Object.assign(exports,{TEAM_PITCH_FORMATIONS,normalizeTeamPitchPrefs,getPositionTargets,getFormationPitchSlots,getTeamPitchAnalysis,matchRoleSlots});

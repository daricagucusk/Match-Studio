

const TEAM_ROLES=[
 {code:'GK',name:'Kaleci',zone:'Kaleci'},
 {code:'RB',name:'Sağ Bek',zone:'Savunma'},
 {code:'CB',name:'Stoper',zone:'Savunma'},
 {code:'LB',name:'Sol Bek',zone:'Savunma'},
 {code:'DM',name:'Defansif Orta Saha',zone:'Orta Saha'},
 {code:'CM',name:'Merkez Orta Saha',zone:'Orta Saha'},
 {code:'AM',name:'Ofansif Orta Saha',zone:'Orta Saha'},
 {code:'RW',name:'Sağ Kanat',zone:'Hücum'},
 {code:'LW',name:'Sol Kanat',zone:'Hücum'},
 {code:'ST',name:'Santrfor',zone:'Hücum'}
];
const createTeamDepth=groupId=>({groupId,roles:Object.fromEntries(TEAM_ROLES.map(r=>[r.code,[]])),updatedAt:new Date().toISOString()});
function sanitizeTeamDepth(input,players=[]){
 const safe=createTeamDepth(input?.groupId||'');const allowed=new Set(players.filter(p=>(p.groupIds||[]).includes(safe.groupId)).map(p=>p.id));
 for(const role of TEAM_ROLES){safe.roles[role.code]=[...new Set((Array.isArray(input?.roles?.[role.code])?input.roles[role.code]:[]).filter(id=>allowed.has(id)))];}
 return {...safe,updatedAt:input?.updatedAt||safe.updatedAt};
}
function setTeamPlayerRole(depth,playerId,role,selected,players=[]){
 if(!TEAM_ROLES.some(r=>r.code===role))throw Error('Mevki tanımlı değil.');
 if(!players.some(p=>p.id===playerId&&(p.groupIds||[]).includes(depth.groupId)))throw Error('Oyuncu bu takımda kayıtlı değil. Önce oyuncuyu takıma ata.');
 const result=sanitizeTeamDepth(depth,players);const previous=result.roles[role];result.roles[role]=selected?[...new Set([...previous,playerId])]:previous.filter(id=>id!==playerId);
 result.updatedAt=new Date().toISOString();return result;
}
// The order within each role is the coach's explicit preference. Never infer ranking
// from insertion date, player name, age or performance.
function moveTeamRoleCandidate(depth,playerId,role,direction,players=[]){
 if(!TEAM_ROLES.some(r=>r.code===role))throw Error('Mevki tanımlı değil.');
 if(![-1,1].includes(direction))throw Error('Geçersiz sıralama yönü.');
 const next=sanitizeTeamDepth(depth,players),ids=next.roles[role];
 const index=ids.indexOf(playerId);
 if(index<0)throw Error('Oyuncu bu mevkiye atanmadı.');
 const other=index+direction;
 if(other<0||other>=ids.length)return next;
 [ids[index],ids[other]]=[ids[other],ids[index]];
 next.updatedAt=new Date().toISOString();return next;
}
function getTeamDepthStats(depth,players=[]){
 const selected=new Set(Object.values(depth.roles||{}).flat());const eligible=players.filter(p=>(p.groupIds||[]).includes(depth.groupId));
 return {total:eligible.length,coveredPlayerIds:eligible.filter(p=>selected.has(p.id)).map(p=>p.id),unassigned:eligible.filter(p=>!selected.has(p.id)),emptyRoles:TEAM_ROLES.filter(r=>!(depth.roles?.[r.code]||[]).length).map(r=>r.code)};
}

Object.assign(exports,{TEAM_ROLES,createTeamDepth,sanitizeTeamDepth,setTeamPlayerRole,moveTeamRoleCandidate,getTeamDepthStats});

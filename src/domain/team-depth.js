'use strict';

// Tactical-role preferences are coach choices, never inferred player skill ratings.
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
const roleOption=(id,name,description)=>Object.freeze({id,name,description});
const TEAM_ROLE_PROFILES=Object.freeze({
 GK:[roleOption('goalkeeper','Kaleci','Kale savunması ve güvenli oyun kurma'),roleOption('sweeper-keeper','Libero Kaleci','Savunma arkasını süpürme ve pas bağlantısı')],
 RB:[roleOption('full-back','Sağ Bek','Denge ve genişlik'),roleOption('wing-back','Hücumcu Bek','Çizgi boyunca bindirme'),roleOption('inverted-full-back','İçe Kat Eden Bek','Merkezde pas opsiyonu')],
 CB:[roleOption('central-defender','Stoper','Alan ve adam savunması'),roleOption('ball-playing-defender','Pasör Stoper','Geriden pasla oyun kurma'),roleOption('stopper','Öne Çıkan Stoper','Erken baskı ve karşılama'),roleOption('cover-defender','Süpürücü Stoper','Savunma arkası alanı koruma')],
 LB:[roleOption('full-back','Sol Bek','Denge ve genişlik'),roleOption('wing-back','Hücumcu Bek','Çizgi boyunca bindirme'),roleOption('inverted-full-back','İçe Kat Eden Bek','Merkezde pas opsiyonu')],
 DM:[roleOption('defensive-midfielder','Ön Libero','Savunma önü alan koruması'),roleOption('anchor','Çapa','Stoperler önünde konum koruma'),roleOption('deep-lying-playmaker','Geriden Oyun Kurucu','Derinden pas temposu'),roleOption('half-back','Geriye Sarkan Ön Libero','Oyun kurarken savunma hattına geçiş')],
 CM:[roleOption('central-midfielder','Merkez Orta Saha','Bağlantı ve denge'),roleOption('box-to-box-midfielder','İki Yönlü Orta Saha','Ceza sahaları arası koşu'),roleOption('mezzala','Mezzala','Yarı alanlara hücum koşusu'),roleOption('advanced-playmaker','İleri Oyun Kurucu','Yaratıcı pas kanalları')],
 AM:[roleOption('attacking-midfielder','Ofansif Orta Saha','Hatlar arası bağlantı'),roleOption('advanced-playmaker','İleri Oyun Kurucu','Merkezde yaratıcılık'),roleOption('shadow-striker','Gizli Forvet','Forvet arkasından ceza sahasına giriş')],
 RW:[roleOption('winger','Sağ Kanat','Çizgide genişlik'),roleOption('inverted-winger','İçe Kat Eden Kanat','Merkeze çapraz koşu'),roleOption('inside-forward','İç Forvet','Gol bölgesine kat etme')],
 LW:[roleOption('winger','Sol Kanat','Çizgide genişlik'),roleOption('inverted-winger','İçe Kat Eden Kanat','Merkeze çapraz koşu'),roleOption('inside-forward','İç Forvet','Gol bölgesine kat etme')],
 ST:[roleOption('advanced-forward','İleri Uç Forveti','Savunma arkasına koşu'),roleOption('deep-lying-forward','Bağlantı Forveti','Geriden top alma ve servis'),roleOption('pressing-forward','Pres Forveti','Ön alan baskısı'),roleOption('target-forward','Hedef Santrfor','Direkt top ve duvar bağlantısı')]
});
const validRole=role=>TEAM_ROLES.some(r=>r.code===role);
function assertSlotKey(key){
 const match=/^(GK|RB|CB|LB|DM|CM|AM|RW|LW|ST):([0-9]{1,2})$/.exec(String(key||''));
 if(!match||Number(match[2])>20)throw Error('Geçersiz bağımsız mevki görevi.');
 return {role:match[1],index:Number(match[2])};
}
function getSlotKey(role,index){if(!validRole(role)||!Number.isInteger(index)||index<0||index>20)throw Error('Geçersiz mevki görevi.');return role+':'+index;}
function getSlotIdentity(slot){
 const role=TEAM_ROLES.find(r=>r.code===slot.role);
 const count=slot.roleTotal||1,index=slot.roleIndex||0;
 if(!role)return {key:'',name:'Mevki',short:'OY'};
 const key=getSlotKey(slot.role,index);
 const sides=count===2?['Sol','Sağ']:count===3?['Sol','Merkez','Sağ']:count>3?Array.from({length:count},(_,i)=>String(i+1)+'.'):[null];
 const side=sides[Math.min(index,sides.length-1)];
 const name=side?side+' '+role.name:role.name;
 const SHORT={GK:'KL',RB:'SB',CB:'STP',LB:'SLB',DM:'ÖL',CM:'OS',AM:'OOS',RW:'SK',LW:'SLK',ST:'SF'};
 const short=count>1?(side==='Sol'?'S':side==='Sağ'?'Ğ':side==='Merkez'?'M':String(index+1))+SHORT[slot.role]:SHORT[slot.role];
 return {key,name,label:name,short};
}
const createTeamDepth=groupId=>({groupId,roles:Object.fromEntries(TEAM_ROLES.map(r=>[r.code,[]])),slotCandidates:{},tacticalRoles:{},updatedAt:new Date().toISOString()});
function sanitizeTeamDepth(input,players=[]){
 const safe=createTeamDepth(input?.groupId||'');
 const allowed=new Set(players.filter(p=>(p.groupIds||[]).includes(safe.groupId)).map(p=>p.id));
 for(const role of TEAM_ROLES){
  safe.roles[role.code]=[...new Set((Array.isArray(input?.roles?.[role.code])?input.roles[role.code]:[]).filter(id=>allowed.has(id)))];
 }
 for(const [slotKey,values] of Object.entries(input?.slotCandidates||{})){
  try{assertSlotKey(slotKey);}catch{continue;}
  if(!Array.isArray(values))continue;
  safe.slotCandidates[slotKey]=[...new Set(values.filter(id=>allowed.has(id)))];
 }
 for(const [slotKey,id] of Object.entries(input?.tacticalRoles||{})){
  let role;
  try{role=assertSlotKey(slotKey).role;}catch{continue;}
  if(TEAM_ROLE_PROFILES[role]?.some(x=>x.id===id))safe.tacticalRoles[slotKey]=id;
 }
 return {...safe,updatedAt:input?.updatedAt||safe.updatedAt};
}
function ensurePlayer(depth,playerId,players){
 if(!players.some(p=>p.id===playerId&&(p.groupIds||[]).includes(depth.groupId)))
  throw Error('Oyuncu bu takımda kayıtlı değil. Önce oyuncuyu takıma ata.');
}
function setTeamPlayerRole(depth,playerId,role,selected,players=[]){
 if(!validRole(role))throw Error('Mevki tanımlı değil.');
 ensurePlayer(depth,playerId,players);
 const result=sanitizeTeamDepth(depth,players),previous=result.roles[role];
 result.roles[role]=selected?[...new Set([...previous,playerId])]:previous.filter(id=>id!==playerId);
 result.updatedAt=new Date().toISOString();return result;
}
function moveTeamRoleCandidate(depth,playerId,role,direction,players=[]){
 if(!validRole(role))throw Error('Mevki tanımlı değil.');
 if(![-1,1].includes(direction))throw Error('Geçersiz sıralama yönü.');
 const next=sanitizeTeamDepth(depth,players),ids=next.roles[role],index=ids.indexOf(playerId);
 if(index<0)throw Error('Oyuncu bu mevkiye atanmadı.');
 const other=index+direction;
 if(other<0||other>=ids.length)return next;
 [ids[index],ids[other]]=[ids[other],ids[index]];
 next.updatedAt=new Date().toISOString();return next;
}
function getTeamSlotCandidates(depth,key){
 const role=assertSlotKey(key).role;
 return Object.prototype.hasOwnProperty.call(depth.slotCandidates||{},key)?depth.slotCandidates[key]||[]:depth.roles?.[role]||[];
}
function setTeamSlotPlayer(depth,key,playerId,selected,players=[]){
 const next=sanitizeTeamDepth(depth,players);
 assertSlotKey(key);ensurePlayer(next,playerId,players);
 const ids=[...getTeamSlotCandidates(next,key)];
 next.slotCandidates[key]=selected?[...new Set([...ids,playerId])]:ids.filter(id=>id!==playerId);
 next.updatedAt=new Date().toISOString();return next;
}
function moveTeamSlotCandidate(depth,key,playerId,direction,players=[]){
 assertSlotKey(key);if(![-1,1].includes(direction))throw Error('Geçersiz sıralama yönü.');
 const next=sanitizeTeamDepth(depth,players),ids=[...getTeamSlotCandidates(next,key)],index=ids.indexOf(playerId);
 if(index<0)throw Error('Oyuncu bu göreve atanmadı.');
 const other=index+direction;
 if(other<0||other>=ids.length)return next;
 [ids[index],ids[other]]=[ids[other],ids[index]];
 next.slotCandidates[key]=ids;next.updatedAt=new Date().toISOString();return next;
}
function setTeamTacticalRole(depth,key,roleId,players=[]){
 const role=assertSlotKey(key).role;
 if(!TEAM_ROLE_PROFILES[role].some(r=>r.id===roleId))throw Error('Bu mevki için geçersiz taktik rol.');
 const next=sanitizeTeamDepth(depth,players);
 next.tacticalRoles[key]=roleId;next.updatedAt=new Date().toISOString();return next;
}
function getTeamDepthStats(depth,players=[]){
 const selected=new Set([...Object.values(depth.roles||{}).flat(),...Object.values(depth.slotCandidates||{}).flat()]);
 const eligible=players.filter(p=>(p.groupIds||[]).includes(depth.groupId));
 return {total:eligible.length,coveredPlayerIds:eligible.filter(p=>selected.has(p.id)).map(p=>p.id),unassigned:eligible.filter(p=>!selected.has(p.id)),emptyRoles:TEAM_ROLES.filter(r=>!(depth.roles?.[r.code]||[]).length&& !Object.keys(depth.slotCandidates||{}).some(k=>k.startsWith(r.code+':')&&depth.slotCandidates[k].length)).map(r=>r.code)};
}
Object.assign(exports,{TEAM_ROLES,TEAM_ROLE_PROFILES,createTeamDepth,sanitizeTeamDepth,setTeamPlayerRole,moveTeamRoleCandidate,getTeamDepthStats,getSlotKey,getSlotIdentity,getTeamSlotCandidates,setTeamSlotPlayer,moveTeamSlotCandidate,setTeamTacticalRole});

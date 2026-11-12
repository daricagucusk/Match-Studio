'use strict';
// Yoklama/devam kaydı: antrenman ve maç katılımı, devamsızlık gerekçesi ve devam oranı.
// Saf fonksiyonlar; depolama katmanı bu modülün çıktısını settings altında saklar.
const STATUSES=['present','late','absent','excused'];
const LABELS={present:'Katıldı',late:'Geç katıldı',absent:'Katılmadı',excused:'Mazeretli'};
const REASONS=['okul','sağlık','aile','ulaşım','turnuva','diğer'];

function cleanText(value,max=80){return String(value??'').replace(/\s+/g,' ').trim().slice(0,max);}
function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(String(value||''))&&!Number.isNaN(Date.parse(String(value)));}

function createSession({id,date,kind='training',groupId='',note=''}={}){
 const issues=[];
 if(!validDate(date))issues.push('Yoklama tarihi geçersiz.');
 if(!['training','match'].includes(kind))issues.push('Yoklama türü geçersiz.');
 if(issues.length)throw Error(issues.join(' '));
 return {id:String(id||`${date}:${kind}:${groupId}`),date,kind,groupId:String(groupId||''),note:cleanText(note,160),entries:{},updatedAt:new Date().toISOString()};
}

function setEntry(session,playerId,status,reason=''){
 if(!session)throw Error('Yoklama oturumu bulunamadı.');
 if(!STATUSES.includes(status))throw Error('Katılım durumu geçersiz.');
 const id=String(playerId||'').trim();
 if(!id)throw Error('Oyuncu seçilmedi.');
 const entries={...session.entries};
 if(status==='absent'||status==='excused')entries[id]={status,reason:REASONS.includes(reason)?reason:'diğer'};
 else entries[id]={status};
 return {...session,entries,updatedAt:new Date().toISOString()};
}

function clearEntry(session,playerId){const entries={...session.entries};delete entries[String(playerId)];return {...session,entries,updatedAt:new Date().toISOString()};}

function sessionSummary(session,players=[]){
 const entries=session?.entries||{},counts={present:0,late:0,absent:0,excused:0,unmarked:0};
 for(const p of players){const id=String(p.id??p.playerId??'');const e=entries[id];if(!e){counts.unmarked++;continue;}counts[e.status]=(counts[e.status]||0)+1;}
 const marked=counts.present+counts.late+counts.absent+counts.excused;
 const rate=marked?Math.round(((counts.present+counts.late)/marked)*1000)/10:null;
 return {...counts,marked,rate};
}

function playerAttendance(sessions,playerId){
 const id=String(playerId||'');let present=0,late=0,absent=0,excused=0;
 for(const s of sessions||[]){const e=s?.entries?.[id];if(!e)continue;if(e.status==='present')present++;else if(e.status==='late')late++;else if(e.status==='absent')absent++;else if(e.status==='excused')excused++;}
 const marked=present+late+absent+excused;
 return {playerId:id,present,late,absent,excused,marked,rate:marked?Math.round(((present+late)/marked)*1000)/10:null};
}

function riskList(sessions,players=[],threshold=70){
 return (players||[]).map(p=>({player:p,...playerAttendance(sessions,p.id??p.playerId)})).filter(r=>r.marked>=2&&r.rate!==null&&r.rate<threshold).sort((a,b)=>a.rate-b.rate);
}

function attendanceCsv(sessions,players=[]){
 const rows=[['Tarih','Tür','Grup','Oyuncu','Durum','Gerekçe']];
 const byId=new Map((players||[]).map(p=>[String(p.id??p.playerId),p]));
 for(const s of sessions||[])for(const [id,e] of Object.entries(s.entries||{}))rows.push([s.date,s.kind==='match'?'Maç':'Antrenman',s.groupId||'',byId.get(id)?.name||byId.get(id)?.nameSnapshot||id,LABELS[e.status]||e.status,e.reason||'']);
 return rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
}

Object.assign(exports,{STATUSES,LABELS,REASONS,createSession,setEntry,clearEntry,sessionSummary,playerAttendance,riskList,attendanceCsv});

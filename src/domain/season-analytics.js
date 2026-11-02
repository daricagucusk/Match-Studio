/* Season analytics (V2.6.8-F.16). Pure aggregation over finished matches: no storage, DOM or clock access
 * beyond the injected nowMs. A match counts only when it is finished and its minutes and clock projections
 * need no review. Unfinished and doubtful matches are reported separately, never silently mixed in. */
const {projectMatchReport}=require('src/domain/match-events-report.js');

const RESULT_LABEL=Object.freeze({W:'G',D:'B',L:'M'});
const RESULT_NAME=Object.freeze({W:'Galibiyet',D:'Beraberlik',L:'Mağlubiyet'});
const SORT_KEYS=Object.freeze({goals:'Gol',assists:'Asist',contributions:'Gol katkısı',minutes:'Dakika',participation:'Katılım',name:'Ad'});
const CSV_HEADERS=Object.freeze(['Oyuncu','Maç','İlk 11','Dakika','Ort. dakika','Gol','Asist','Gol katkısı','Sarı kart','Kırmızı kart','Sakatlık','Katılım %']);
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const text=value=>String(value??'').trim();
const round=(value,digits=0)=>{const f=10**digits;return Math.round(value*f)/f;};

function buildSeasonAnalytics({matches=[],players=[],sessions=new Map(),events=new Map(),rosters=new Map(),filter={},nowMs=Date.now()}={}){
 const groupId=text(filter.groupId)||null;
 const from=DATE.test(filter.from||'')?filter.from:null;
 const to=DATE.test(filter.to||'')?filter.to:null;
 const sort=Object.prototype.hasOwnProperty.call(SORT_KEYS,filter.sort)?filter.sort:'goals';
 const names=new Map(players.map(p=>[p.id,text(p.fullName)]));
 const counts={candidates:0,unfinished:0,reviewRequired:0,included:0};
 const review=[],included=[],squad=new Map();

 for(const match of matches){
  if(!match?.id)continue;
  const date=text(match.matchDate);
  if(groupId&&match.groupId!==groupId)continue;
  if(from&&date<from)continue;
  if(to&&date>to)continue;
  counts.candidates++;
  const session=sessions.get(match.id);
  if(session?.status!=='finished'){counts.unfinished++;continue;}
  const row={matchId:match.id,matchDate:date,kickoffTime:text(match.kickoffTime),opponent:text(match.opponent)||'Rakip',groupId:match.groupId};

  let report=null,failure='';
  try{report=projectMatchReport(session,events.get(match.id)||[],players,rosters.get(match.id)||null,nowMs);}
  catch(error){failure=text(error?.message)||'Maç verisi okunamadı';}
  const reasons=[];
  if(!report)reasons.push(failure||'Maç verisi okunamadı');
  else{if(report.minutesReviewRequired)reasons.push('Oynama süresi');if(report.clockReviewRequired)reasons.push('Maç saati');}
  if(reasons.length){counts.reviewRequired++;review.push({...row,reasons});continue;}

  const ours=report.ourGoals,theirs=report.opponentGoals;
  const result=ours>theirs?'W':ours<theirs?'L':'D';
  included.push({...row,ourGoals:ours,opponentGoals:theirs,result});
  for(const p of report.players){
   const acc=squad.get(p.id)||{id:p.id,name:names.get(p.id)||text(p.name)||'Bilinmeyen oyuncu',matches:0,starts:0,playedMs:0,goals:0,assists:0,yellow:0,red:0,injuries:0};
   if(p.participated)acc.matches++;
   if(p.starter&&p.participated)acc.starts++;
   acc.playedMs+=Number(p.playedMs)||0;
   acc.goals+=p.goals||0;acc.assists+=p.assists||0;acc.yellow+=p.yellow||0;acc.red+=p.red||0;acc.injuries+=p.injuries||0;
   squad.set(p.id,acc);
  }
 }

 included.sort((a,b)=>a.matchDate.localeCompare(b.matchDate)||a.kickoffTime.localeCompare(b.kickoffTime)||a.matchId.localeCompare(b.matchId));
 const played=included.length;
 const tally={W:0,D:0,L:0};let goalsFor=0,goalsAgainst=0;
 for(const m of included){tally[m.result]++;goalsFor+=m.ourGoals;goalsAgainst+=m.opponentGoals;}
 counts.included=played;

 const squadRows=[...squad.values()].map(p=>{
  const minutes=Math.round(p.playedMs/60000);
  return {id:p.id,name:p.name,matches:p.matches,starts:p.starts,minutes,averageMinutes:p.matches?Math.round(minutes/p.matches):0,goals:p.goals,assists:p.assists,contributions:p.goals+p.assists,yellow:p.yellow,red:p.red,injuries:p.injuries,participation:played?Math.round(p.matches*100/played):0};
 });
 const order={
  goals:(a,b)=>b.goals-a.goals,
  assists:(a,b)=>b.assists-a.assists,
  contributions:(a,b)=>b.contributions-a.contributions,
  minutes:(a,b)=>b.minutes-a.minutes,
  participation:(a,b)=>b.matches-a.matches,
  name:(a,b)=>a.name.localeCompare(b.name,'tr-TR'),
 }[sort];
 squadRows.sort((a,b)=>order(a,b)||a.name.localeCompare(b.name,'tr-TR'));

 return {
  filter:{groupId,from,to,sort},
  sortLabel:SORT_KEYS[sort],
  counts,
  team:{
   played,wins:tally.W,draws:tally.D,losses:tally.L,goalsFor,goalsAgainst,
   goalDifference:goalsFor-goalsAgainst,points:tally.W*3+tally.D,
   averageGoals:played?round(goalsFor/played,1):0,
   form:included.slice(-5).map(m=>({result:m.result,label:RESULT_LABEL[m.result],name:RESULT_NAME[m.result]})),
  },
  matches:included,
  players:squadRows,
  review,
 };
}

// Spreadsheet-safe CSV cell: quotes fields with separators and neutralises formula prefixes.
function csvCell(value){
 let s=String(value??'');
 if(/^[\t\r\n]|^\s*[=+\-@]/.test(s))s="'"+s;
 return /[;"\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;
}
function seasonPlayersCsv(analytics){
 const rows=[CSV_HEADERS,...analytics.players.map(p=>[p.name,p.matches,p.starts,p.minutes,p.averageMinutes,p.goals,p.assists,p.contributions,p.yellow,p.red,p.injuries,p.participation])];
 return rows.map(row=>row.map(csvCell).join(';')).join('\r\n')+'\r\n';
}

Object.assign(exports,{RESULT_LABEL,RESULT_NAME,SORT_KEYS,CSV_HEADERS,buildSeasonAnalytics,csvCell,seasonPlayersCsv});

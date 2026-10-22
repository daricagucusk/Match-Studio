
const {normalizeDate,normalizeTime}=require("src/domain/validation.js");
const placeholders=new Set(['SS','TEST','DENEME','XXX','XX','?','-','ASD','ASDASD','ÖRNEK','123']);
const suspicious=v=>{
 const value=String(v??'').trim().toLocaleUpperCase('tr-TR');
 return placeholders.has(value)||/^(?:SS|TEST|DENEME|ASD|XXX|ÖRNEK)[\W_0-9]*[0-9A-Z]*$/.test(value)||/^(?:TEST|DEMO)[\s_-]*\d+$/.test(value);
};

function getRosterInsights(roster,players,matchGroupId){
 const lookup=new Map(players.map(p=>[p.id,p]));
 const entries=roster?.entries||[];
 return {total:entries.length,
  goalkeepers:entries.filter(e=>(e.positionSnapshot||lookup.get(e.playerId)?.position)==='GK').length,
  crossTeam:entries.filter(e=>{const p=lookup.get(e.playerId);return !!p&&!p.groupIds?.includes(matchGroupId)}).length,
  missingPosition:entries.filter(e=>{const position=e.positionSnapshot||lookup.get(e.playerId)?.position;return !position||position==='OTHER'}).length};
}
function getPosterReleaseIssues(match,roster,kind){
 const issues=[];
 const fields=[['opponent','Rakip takım'],['venue','Stat / saha'],['matchDate','Maç tarihi'],['kickoffTime','Maç saati']];
 for(const [key,label] of fields)if(!String(match?.[key]||'').trim()||suspicious(match[key]))issues.push(`${label} boş veya deneme verisi.`);
 if(match?.matchDate&&!normalizeDate(match.matchDate))issues.push('Maç tarihi geçersiz.');
 if(match?.kickoffTime&&!normalizeTime(match.kickoffTime))issues.push('Maç saati geçersiz.');
 if(kind==='private'){
  if(!(roster?.entries||[]).length)issues.push('Özel afiş için en az bir oyuncu seçin.');
  for(const [key,label] of [['meetingPlace','Toplanma yeri'],['mealMenu','Yemek menüsü'],['kitNotes','Kıyafet'],['hydrationNotes','Sıvı kontrolü'],['coachNotes','Antrenör notu']])if(suspicious(match?.[key]))issues.push(`${label} deneme verisi içeriyor.`);
 }
 return issues;
}

Object.assign(exports,{getRosterInsights,getPosterReleaseIssues});

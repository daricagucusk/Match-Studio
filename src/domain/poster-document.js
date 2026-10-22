
const {validateOverrides,formatTurkishDate}=require("src/domain/validation.js");
const {getRosterPolicy,getMatchRosterSections}=require("src/domain/roster-policy.js");


function posterMatchTypeLabel(match){return ({friendly:'HAZIRLIK MAÇI',league:'LİG MAÇI',tournament:'TURNUVA',training:'ANTRENMAN MAÇI'})[match?.matchType]||'MAÇ';}
function posterCompetitionLabel(match){const type=posterMatchTypeLabel(match),competition=String(match?.competition||'').trim().toLocaleUpperCase('tr-TR');return competition&&competition!==type?competition+' · '+type:type;}
const sizes={'portrait-post':[1080,1350],story:[1080,1920]};
function buildPosterDocument(match,roster,draft,lineupPlan=null,clubName="SPOR KULÜBÜ",clubAccent="#176B46"){const kind=draft.kind==='public'?'public':'private',o=validateOverrides(draft.overrides||{});if(!draft.overrides?.accent||draft.overrides.accent==='#176B46')o.accent=/^#[0-9a-fA-F]{6}$/.test(clubAccent)?clubAccent:'#176B46';const result={kind,templateId:draft.templateId||'classic-stadium',size:draft.size||'portrait-post',overrides:o,clubName:String(clubName||'SPOR KULÜBÜ').toLocaleUpperCase('tr-TR'),match:{matchType:match.matchType,competition:match.competition||'',opponent:match.opponent||'',matchDate:match.matchDate||'',dateLabel:formatTurkishDate(match.matchDate),kickoffTime:match.kickoffTime||'',venue:match.venue||''}};
if(kind==='private'){
 const policy=getRosterPolicy(match);
 const sections=lineupPlan&&policy?getMatchRosterSections(roster,lineupPlan,policy):null;
 const entries=sections?[...sections.starters,...sections.bench]:roster?.entries||[];
 const starters=new Set(sections?.starters.map(e=>e.playerId)||[]);
 result.players=entries.map(e=>({name:e.nameSnapshot,number:e.shirtNumberSnapshot,position:e.positionSnapshot,playerId:e.playerId,squadSection:sections?(starters.has(e.playerId)?'starter':'bench'):null}));
 if(sections)result.rosterSplit={starters:sections.starters.length,bench:sections.bench.length};
 result.instructions={meetingTime:match.meetingTime||'',meetingPlace:match.meetingPlace||'',mealDeadline:match.mealDeadline||'',mealMenu:match.mealMenu||'',kitNotes:match.kitNotes||'',hydrationNotes:match.hydrationNotes||'',coachNotes:match.coachNotes||''};}return result;}

Object.assign(exports,{sizes,buildPosterDocument,posterMatchTypeLabel,posterCompetitionLabel});

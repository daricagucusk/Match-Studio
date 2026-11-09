
const {validateOverrides,formatTurkishDate}=require("src/domain/validation.js");
const {normalizeClubPalette}=require("src/domain/club-brand.js");
const {getRosterPolicy,getMatchRosterSections}=require("src/domain/roster-policy.js");
const {getPitchPresets}=require("src/domain/lineup.js");


function posterMatchTypeLabel(match){return ({friendly:'HAZIRLIK MAÇI',league:'LİG MAÇI',tournament:'TURNUVA',training:'ANTRENMAN MAÇI'})[match?.matchType]||'MAÇ';}
function posterCompetitionLabel(match){const type=posterMatchTypeLabel(match),competition=String(match?.competition||'').trim().toLocaleUpperCase('tr-TR');return competition&&competition!==type?competition+' · '+type:type;}
const sizes={'portrait-post':[1080,1350],story:[1080,1920]};
function buildPosterDocument(match,roster,draft,lineupPlan=null,clubName="SPOR KULÜBÜ",clubAccent="#176B46",secondaryAccent="#FFFFFF"){
const kind=draft.kind==='public'?'public':'private',o=validateOverrides(draft.overrides||{});
// Old drafts inherit both current club colors; a custom palette must be explicit.
if(o.colorMode!=='custom'){
 const palette=normalizeClubPalette({accent:clubAccent,secondaryAccent});
 o.accent=palette.primary;
 o.secondaryAccent=palette.secondary;
}
const result={kind,templateId:draft.templateId||'classic-stadium',size:draft.size||'portrait-post',overrides:o,clubName:String(clubName||'SPOR KULÜBÜ').toLocaleUpperCase('tr-TR'),match:{matchType:match.matchType,competition:match.competition||'',opponent:match.opponent||'',matchDate:match.matchDate||'',dateLabel:formatTurkishDate(match.matchDate),kickoffTime:match.kickoffTime||'',venue:match.venue||''}};
if(kind==='private'){
 const policy=getRosterPolicy(match);
 const sections=lineupPlan&&policy?getMatchRosterSections(roster,lineupPlan,policy):null;
 const entries=sections?[...sections.starters,...sections.bench]:roster?.entries||[];
 const starters=new Set(sections?.starters.map(e=>e.playerId)||[]);
 result.players=entries.map(e=>({name:e.nameSnapshot,number:e.shirtNumberSnapshot,position:e.positionSnapshot,playerId:e.playerId,squadSection:sections?(starters.has(e.playerId)?'starter':'bench'):null}));
 if(sections)result.rosterSplit={starters:sections.starters.length,bench:sections.bench.length};
 const all=roster?.entries||[],lookup=new Map(all.map(e=>[e.playerId,e]));const slots=getPitchPresets()[lineupPlan?.preset]||[];
 result.lineupPositions=slots.map((slot,i)=>{const p=lookup.get(lineupPlan?.assignments?.[String(i)]);return p?{playerId:p.playerId,name:p.nameSnapshot,number:lineupPlan?.shirtNumberOverrides?.[p.playerId]||p.shirtNumberSnapshot||'',x:slot.x,y:slot.y,label:slot.label}:null}).filter(Boolean);
 result.instructions={meetingTime:match.meetingTime||'',meetingPlace:match.meetingPlace||'',mealDeadline:match.mealDeadline||'',mealMenu:match.mealMenu||'',kitNotes:match.kitNotes||'',hydrationNotes:match.hydrationNotes||'',coachNotes:match.coachNotes||''};}return result;}

Object.assign(exports,{sizes,buildPosterDocument,posterMatchTypeLabel,posterCompetitionLabel});

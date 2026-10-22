
const {now}=require("src/domain/validation.js");

const entry=(p,order)=>({playerId:p.id,nameSnapshot:p.fullName,shirtNumberSnapshot:p.shirtNumber||'',positionSnapshot:p.position||'OTHER',order});
const reindex=es=>es.map((e,i)=>({...e,order:i}));
function buildRoster(matchId,players=[]){return {matchId,entries:reindex(players.filter((p,i,a)=>a.findIndex(q=>q.id===p.id)===i).map(entry)),copiedFromMatchId:null,updatedAt:now()};}
function addPlayer(roster,player){if(roster.entries.some(e=>e.playerId===player.id))return roster;return {...roster,entries:[...roster.entries,entry(player,roster.entries.length)],updatedAt:now()};}
function removePlayer(roster,id){return {...roster,entries:reindex(roster.entries.filter(x=>x.playerId!==id)),updatedAt:now()};}
function movePlayer(roster,id,toIndex){const es=[...roster.entries],i=es.findIndex(x=>x.playerId===id);if(i<0)return roster;es.splice(Math.max(0,Math.min(es.length,toIndex)),0,...es.splice(i,1));return {...roster,entries:reindex(es),updatedAt:now()};}
function copyRosterForMatch(source,newMatchId){return {matchId:newMatchId,entries:source.entries.map(x=>({...x})),copiedFromMatchId:source.matchId,updatedAt:now()};}

// Preserve the original snapshot in archived matches, but keep active match cards
// consistent with the canonical player profile.
function syncRosterPlayerDetails(rosters, player, matches) {
 const byId=new Map(matches.map(m=>[m.id,m]));
 return rosters.map(r=>{
   const match=byId.get(r.matchId);
   if (!match || ['archived','completed','finished'].includes(match.state)) return r;
   let touched=false;
   const entries=(r.entries||[]).map(e=>{
     if(e.playerId!==player.id)return e;
     touched=true;
     return {...e,nameSnapshot:player.fullName,positionSnapshot:player.position||'OTHER',shirtNumberSnapshot:player.shirtNumber||'',sourceUpdatedAt:player.updatedAt};
   });
   return touched?{...r,entries,updatedAt:now()}:r;
 });
}

function addPlayersToRoster(roster,players,max=32){
 const existing=new Set(roster.entries.map(e=>e.playerId));
 const toAdd=players.filter(p=>p.isActive!==false&&!existing.has(p.id));
 if(roster.entries.length+toAdd.length>max)throw Error(`Kadro en fazla ${max} oyuncu içerebilir. Önce filtreyi daraltın.`);
 return toAdd.reduce((r,p)=>addPlayer(r,p),roster);
}

Object.assign(exports,{buildRoster,addPlayer,removePlayer,movePlayer,copyRosterForMatch,syncRosterPlayerDetails,addPlayersToRoster});

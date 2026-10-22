
const {validatePlayer}=require("src/domain/validation.js");

const normalizeText=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('tr-TR').replaceAll('ı','i').replace(/[^a-z0-9]/g,'');
const normalizePlayerKey=(name,birthDate)=>`${normalizeText(name)}|${birthDate||''}`;
function planRosterImport(existingPlayers,existingGroups,seedPlayers,seedGroups){
 const groups=existingGroups.map(x=>({...x}));const players=existingPlayers.map(x=>({...x,groupIds:[...(x.groupIds||[])]}));
 const bySourceGroup=new Map();let createdCount=0,updatedCount=0,newGroupsCount=0;
 for(const source of seedGroups){let group=groups.find(g=>normalizeText(g.name)===normalizeText(source.name));
 if(!group){group={id:source.id,name:source.name,seasonLabel:'2026-2027',isActive:true,sortOrder:groups.length,source:'2026-pdf'};groups.push(group);newGroupsCount++;}
 bySourceGroup.set(source.name,group.id);}
 for(const source of seedPlayers){const normalName=normalizeText(source.fullName);
 let matches=players.filter(p=>normalizeText(p.fullName)===normalName &&
    (p.birthDate===source.birthDate || (!p.birthDate&&(!p.birthYear||+p.birthYear===source.birthYear))));
 let player=players.find(p=>p.id===source.id)||(matches.length===1?matches[0]:null);
 const targetGroupIds=source.sourceGroups.map(g=>bySourceGroup.get(g)).filter(Boolean);
 if(!player){player=validatePlayer({id:source.id,fullName:source.fullName,birthDate:source.birthDate,birthYear:source.birthYear,groupIds:targetGroupIds,position:'OTHER',licenseStatus:'unknown',shirtNumber:'',isActive:true,source:'2026-pdf'}).data;players.push(player);createdCount++;}
 else {const combined=[...new Set([...(player.groupIds||[]),...targetGroupIds])];const changed=combined.length!==(player.groupIds||[]).length||(!player.birthDate&&source.birthDate)||(!player.birthYear&&source.birthYear);
 if(changed){player.groupIds=combined;player.birthDate=player.birthDate||source.birthDate;player.birthYear=player.birthYear||source.birthYear;updatedCount++;}}}
 return{players,groups,createdCount,updatedCount,newGroupsCount};
}
function filterRosterPool(players,{scope='all',query=''}={},matchGroupId){const term=normalizeText(query);
 return players.filter(p=>p.isActive!==false && (scope==='all'||(scope==='match'?p.groupIds?.includes(matchGroupId):p.groupIds?.includes(scope))) &&(!term||normalizeText(p.fullName).includes(term))).sort((a,b)=>a.fullName.localeCompare(b.fullName,'tr-TR'));
}

Object.assign(exports,{normalizeText,normalizePlayerKey,planRosterImport,filterRosterPool});

const {posterCompetitionLabel}=require("src/domain/poster-document.js");


// One deterministic two-column layout for the roster; refuse lossy exports.
function measureLayout(doc,width,height,measureText=(text,size)=>String(text).length*size*.56){if(doc.kind==='public'){
 const warnings=[];
 const match=doc.match||{};
 if(measureText(String(match.opponent||''),21)>width-155)warnings.push('Rakip takım adı afişe sığmıyor.');
 if(measureText(String(match.venue||''),19)>width-165)warnings.push('Stadyum adı afişe sığmıyor.');
 if(measureText(posterCompetitionLabel(match),22)>width-180)warnings.push('Müsabaka başlığı afişe sığmıyor.');
 return {fits:!warnings.length,warnings,fontSize:0,rowHeight:0,rows:0,columns:0};
 }
 const count=(doc.players||[]).length,rows=doc.rosterSplit?Math.max(doc.rosterSplit.starters,doc.rosterSplit.bench):Math.ceil(count/2),scale=doc.overrides?.typeScale||1;
 const headerBottom=height===1920?790:615, footerTop=height===1920?1560:1100,available=footerTop-headerBottom-25;
 const fontSize=Math.max(19,Math.min(30,(count>23?24:27)*scale));const rowHeight=fontSize*1.48;
 const maxWidth=width/2-123;const warnings=[];
 if(rows*rowHeight>available)warnings.push('Kadro satırları afiş alanına sığmıyor.');
 for(const item of doc.players||[]) if(measureText(item.name,fontSize)>maxWidth) warnings.push(`Oyuncu adı sığmıyor: ${item.name}`);
 if(count>32)warnings.push('Kadro iki sütun sınırını aşıyor.');
 return {fits:!warnings.length,warnings,fontSize,rowHeight,rows,columns:2,headerBottom,footerTop};}

Object.assign(exports,{measureLayout});

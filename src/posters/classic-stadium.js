const {posterMatchTypeLabel,posterCompetitionLabel}=require("src/domain/poster-document.js");
const {broadcastAtmosphere}=require("src/posters/broadcast-frame.js");


// Match Studio Classic Stadium — deterministic vector art. All user content stays editable.
// The extracted crest bundled with this project is a reference-poster asset, not a verified official master logo.
const WHITE='#F4F8F5', MINT='#BCE5CB', SILVER='#CFD9D3';
const font=(size,weight=800)=>`${weight} ${size}px "Arial Black","Segoe UI",system-ui,sans-serif`;
function fill(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h)}
function rule(c,x,y,w,color='#208657',thick=2){fill(c,x,y,w,thick,color)}
function label(c,string,x,y,size,color=WHITE,align='center',weight=800,style=''){
 c.save();c.font=font(size,weight);c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;
 if(style==='metal'){const m=c.createLinearGradient(0,y-size/2,0,y+size/2);m.addColorStop(0,'#FFFFFF');m.addColorStop(.42,'#F1F4F4');m.addColorStop(.52,'#98AAA2');m.addColorStop(1,'#EBF5ED');c.fillStyle=m;c.shadowColor='rgba(0,0,0,.85)';c.shadowBlur=9;c.shadowOffsetY=5;}
 c.fillText(String(string??''),x,y);c.restore();}
function glow(c,x,y,rx,ry,color){c.save();c.translate(x,y);c.scale(rx,ry);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,color);g.addColorStop(.22,'rgba(157,238,179,.28)');g.addColorStop(1,'rgba(69,200,117,0)');c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore()}
function polygon(c,pts,fillStyle,strokeStyle='',lineWidth=1){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fillStyle;c.fill();if(strokeStyle){c.strokeStyle=strokeStyle;c.lineWidth=lineWidth;c.stroke()}}
function panel(c,x,y,w,h,{emphasis=false}={}){
 c.save();c.shadowColor='rgba(0,0,0,.8)';c.shadowBlur=23;c.shadowOffsetY=8;
 const grad=c.createLinearGradient(0,y,0,y+h);grad.addColorStop(0,emphasis?'#193326':'#101F18');grad.addColorStop(.52,emphasis?'#0D2418':'#081710');grad.addColorStop(1,'#07130E');
 polygon(c,[[x+13,y],[x+w-13,y],[x+w,y+14],[x+w-14,y+h],[x+14,y+h],[x,y+h-14]],grad);c.restore();
 c.strokeStyle=emphasis?'#468665':'#365947';c.lineWidth=2;c.beginPath();c.moveTo(x+13,y+1);c.lineTo(x+w-13,y+1);c.moveTo(x+16,y+h-1);c.lineTo(x+w-16,y+h-1);c.stroke();
 fill(c,x+31,y,Math.max(0,w-62),2,emphasis?'#38A967':'#20764D');
 glow(c,x+w*.2,y,100,19,'rgba(178,255,188,.65)');glow(c,x+w*.8,y,95,13,'rgba(178,255,188,.5)');
}
function floodlight(c,x,y,s=1){
 c.save();c.translate(x,y);c.rotate((x<540?.18:-.18));glow(c,0,0,185*s,125*s,'rgba(255,255,253,.85)');
 for(let row=0;row<3;row++)for(let col=0;col<6;col++){const bx=(col-2.5)*23*s,by=(row-1)*22*s;
  c.shadowColor='#F8FFFB';c.shadowBlur=24*s;fill(c,bx-7*s,by-5*s,14*s,10*s,'#F9FFFD');c.shadowBlur=0;}
 c.restore();}
function paintCrowd(c,w,h,accent){
 c.save();const yy=h*.22;
 // Architectural stands / tier lines, borrowing the reference's stadium atmosphere without baked-in labels.
 for(let i=0;i<14;i++){
  const y=yy+i*19;rule(c,0,y,w,`rgba(141,179,147,${.025+.005*(i%3)})`,2);
  rule(c,0,y+9,w,`rgba(3,8,7,${.21})`,5);
 }
 let seed=9263;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<1600;i++){
  const xx=random()*w, y=yy+random()*210;
  const edge=Math.max(0.12,Math.min(1,Math.abs(xx-w/2)/260));
  c.globalAlpha=edge*(.10+random()*.22);fill(c,xx,y,1.5+random()*2,1.3+random()*1.8,random()>.75?'#53AD73':'#BFC8C0');
 }
 c.globalAlpha=1;
 for(const sign of [-1,1]){
  const x=sign===-1?0:w;
  polygon(c,[[x,h*.25],[x+sign*-210,h*.34],[x,h*.35]],'rgba(9,92,41,.53)','rgba(63,150,88,.3)',2);
  polygon(c,[[x,h*.35],[x+sign*-165,h*.42],[x,h*.44]],'rgba(7,63,34,.38)');
 }
 c.restore();}
function stadiumBackground(c,w,h,accent){
 const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#070F11');g.addColorStop(.19,'#10241C');g.addColorStop(.36,'#08120F');g.addColorStop(.72,'#0B1914');g.addColorStop(1,'#061510');fill(c,0,0,w,h,g);
 paintCrowd(c,w,h,accent);
 for(let side of [0,1]){const x=side? w-48:48;
   const halo=c.createLinearGradient(x,0,w/2,h*.45);halo.addColorStop(0,'rgba(214,255,225,.19)');halo.addColorStop(1,'rgba(0,0,0,0)');
   polygon(c,[[x,30],[side?w*.58:w*.42,h*.46],[side?w*.74:w*.26,h*.49]],halo);
   floodlight(c,x,74,.86);
 }
 const curtain=c.createLinearGradient(0,0,w,0);curtain.addColorStop(0,'rgba(1,12,7,.12)');curtain.addColorStop(.23,'rgba(2,12,8,.77)');curtain.addColorStop(.5,'rgba(1,13,8,.87)');curtain.addColorStop(.77,'rgba(2,12,8,.77)');curtain.addColorStop(1,'rgba(1,12,7,.12)');fill(c,0,0,w,h,curtain);
 // Distinct matchday green sweeps, framed safely away from live text.
 glow(c,40,h*.54,230,370,'rgba(12,128,54,.33)');glow(c,w-25,h*.52,240,420,'rgba(13,138,55,.28)');
 for(let i=0;i<18;i++){let x=(i*247)%w,y=h*.92+(i%5)*17;rule(c,x,y,48,'rgba(20,106,46,.11)',1)}
 fill(c,0,0,w,13,'#0E5B37');fill(c,0,h-13,w,13,'#0F5E3B');
}
function crest(c,img,x,y,size,accent,initials="MS"){
 if(img){const factor=Math.min(size/img.width,size/img.height);const w=img.width*factor,h=img.height*factor;
  c.save();c.shadowColor='rgba(0,0,0,.86)';c.shadowBlur=18;c.drawImage(img,x-w/2,y-h/2,w,h);c.restore();return;}
 // Visible fallback if a bundled logo has not yet finished loading.
 c.save();c.translate(x,y);c.scale(size/180,size/180);polygon(c,[[0,-88],[76,-57],[70,25],[55,60],[0,88],[-55,60],[-70,25],[-76,-57]],'#142A1F',accent,6);label(c,initials,0,1,57,WHITE,'center',900);c.restore();}
function jersey(c,x,y,size=21){c.save();c.translate(x,y);c.scale(size/24,size/24);polygon(c,[[-9,-10],[-3,-12],[3,-12],[9,-10],[13,-4],[9,0],[8,-3],[8,10],[-8,10],[-8,-3],[-9,0],[-13,-4]],'#E5EEE7');c.restore();}
function fitOneLine(value,maxWidth,preferred,minSize,measure){let chosen=preferred;while(chosen>=minSize&&measure(String(value),chosen)>maxWidth)chosen-=1;return {fits:chosen>=minSize,size:Math.max(minSize,chosen)};}
function classicGeometry(w,h,kind){const story=h>1500;
 if(kind==='public')return{kind,story,headerY:story?250:165,logoSize:story?320:250,clubY:story?470:334,clubFont:story?48:36,competitionY:story?554:390,competitionFont:story?36:33,headlineY:story?680:478,mainFont:story?116:97,footerStart:story?1500:1095,footerEnd:story?1750:1235,rosterStart:0,rowHeight:0};
 return{kind,story,headerY:story?240:143,headlineY:story?533:326,matchY:story?590:371,infoY:story?711:465,bannerY:story?817:562,rosterStart:story?935:648,rowHeight:story?44:35,footerStart:story?1495:1108,footerEnd:story?1815:1286};}
function classicRosterFits(geo,count,rows=Math.ceil(count/2)){if(!count)return true;return (rows-1)*geo.rowHeight+24<=geo.footerStart-geo.rosterStart-5;}
function wrapText(value,maxWidth,size,measure){const lines=[];let cur='';for(const word of String(value).split(/\s+/).filter(Boolean)){if(measure(word,size)>maxWidth)return {fits:false,lines};const proposed=cur?cur+' '+word:word;if(measure(proposed,size)>maxWidth&&cur){lines.push(cur);cur=word}else cur=proposed;}if(cur)lines.push(cur);return{fits:true,lines};}
function planClassicFooter(doc,geo,measure){const p=doc.instructions||{};
 if(doc.kind!=='private'||doc.overrides?.showOptionalSections===false)return{fits:true,warnings:[],rows:[]};
 const items=[];if(p.meetingTime)items.push(['TOPLANMA',p.meetingTime+(p.meetingPlace?' · '+p.meetingPlace:'')]);
 if(p.mealDeadline)items.push(['MAÇ YEMEĞİ',`En geç ${p.mealDeadline}`]);
 if(p.mealMenu)items.push(['MENÜ',p.mealMenu]);
 if(p.kitNotes)items.push(['KIYAFET',p.kitNotes]);
 if(p.hydrationNotes)items.push(['SIVI KONTROLÜ',p.hydrationNotes]);
 if(p.coachNotes)items.push(['ANTRENÖR NOTU',p.coachNotes]);
 const height=geo.footerEnd-geo.footerStart,rowsCount=Math.ceil(items.length/2),cellHeight=rowsCount?Math.floor((height-28)/rowsCount):0;
 const rows=[],warnings=[];for(let i=0;i<items.length;i++){
  const [title,value]=items[i],x=i%2===0?79:568,y=geo.footerStart+14+Math.floor(i/2)*cellHeight;
  const size=geo.story?23:18,wrapped=wrapText(value,423,size,measure);
  if(!wrapped.fits||wrapped.lines.length>2||cellHeight<48)warnings.push(`Talimat afişe sığmıyor: ${title}`);
  rows.push({title,value,x,y,lines:wrapped.lines,fontSize:size,cellHeight});
 }
 if(rowsCount>3)warnings.push('Organizasyon notları için ayrılan alan yetersiz.');
 return{fits:warnings.length===0,warnings,rows};
}
function drawFooter(c,doc,geo,accent,measure){const p=planClassicFooter(doc,geo,measure);
 if(!p.rows.length)return p;
 panel(c,46,geo.footerStart-35,988,geo.footerEnd-geo.footerStart+44,{emphasis:true});
 for(const row of p.rows){
  label(c,row.title,row.x,row.y,16,MINT,'left',900);
  row.lines.forEach((value,i)=>label(c,value,row.x,row.y+23+i*22,row.fontSize,WHITE,'left',700));
 }
 return p;
}
function slogan(c,w,h,accent){glow(c,w/2,h-47,280,26,'rgba(24,200,99,.39)');label(c,'BİRLİKTE DAHA GÜÇLÜ',w/2,h-43,28,MINT,'center',800);rule(c,w*.32,h-20,w*.36,accent,3);}
function matchStrip(c,doc,y,w,accent,measure){panel(c,42,y,w-84,80,{emphasis:true});
 const a=fitOneLine(`${doc.clubName}  VS  ${doc.match.opponent.toLocaleUpperCase('tr-TR')}`,900,42,19,measure);
 label(c,doc.clubName,w/2,y+27,16,MINT,'center',800);
 label(c,`VS   ${doc.match.opponent.toLocaleUpperCase('tr-TR')}`,w/2,y+53,Math.min(32,a.size),WHITE,'center',900);
 return a.fits;
}
function infoStrip(c,doc,y,w,accent,measure){panel(c,85,y,w-170,70);
 const date=String(doc.match.dateLabel||'').toLocaleUpperCase('tr-TR');
 const venue=String(doc.match.venue||'').toLocaleUpperCase('tr-TR');
 const dateFit=fitOneLine(date,385,25,17,measure),venueFit=fitOneLine(venue,390,24,17,measure);
 label(c,date,130,y+24,dateFit.size,MINT,'left',800);
 label(c,'SAAT '+doc.match.kickoffTime,130,y+49,23,WHITE,'left',900);
 rule(c,w/2-1,y+10,2,accent,45);
 label(c,'STAD',567,y+24,15,MINT,'left',800);
 label(c,venue,567,y+49,venueFit.size,WHITE,'left',800);
 return dateFit.fits&&venueFit.fits;
}
function privatePoster(c,doc,geo,w,h,accent,logo,measure){const warnings=[];
 crest(c,logo,w/2,geo.headerY,(geo.story?315:218)*(doc.overrides?.logoScale||1),accent,doc.clubName.slice(0,2));
 label(c,doc.clubName,w/2,geo.story?450:280,(geo.story?44:33)*(doc.overrides?.typeScale||1),SILVER,'center',900);
 const title=posterCompetitionLabel(doc.match);
 const tf=fitOneLine(title,w-110,(geo.story?67:60)*(doc.overrides?.typeScale||1),27,measure);label(c,title,w/2,geo.headlineY,tf.size,WHITE,'center',900,'metal');if(!tf.fits)warnings.push('Müsabaka başlığı sığmıyor.');
 if(!matchStrip(c,doc,geo.matchY,w,accent,measure))warnings.push('Rakip takım adı sığmıyor.');
 if(!infoStrip(c,doc,geo.infoY,w,accent,measure))warnings.push('Maç tarihi veya stat adı sığmıyor.');
 panel(c,48,geo.bannerY,w-96,62,{emphasis:true});label(c,posterMatchTypeLabel(doc.match)+' KADROSU',w/2,geo.bannerY+34,48,WHITE,'center',900,'metal');
 const names=doc.players||[],split=doc.rosterSplit?.starters??Math.ceil(names.length/2),maxLength=geo.footerStart-geo.rosterStart-26;
 if(doc.rosterSplit){label(c,`İLK ${doc.rosterSplit.starters}`,93,geo.rosterStart+8,19,MINT,'left',900);label(c,`YEDEKLER ${doc.rosterSplit.bench}`,564,geo.rosterStart+8,19,MINT,'left',900);}
 if(!classicRosterFits(geo,names.length,doc.rosterSplit?Math.max(doc.rosterSplit.starters,doc.rosterSplit.bench):Math.ceil(names.length/2)))warnings.push('Kadro afişin orta bölümüne sığmıyor.');
 c.save();c.strokeStyle='rgba(117,181,137,.37)';c.lineWidth=2;c.beginPath();c.moveTo(w/2,geo.rosterStart-7);c.lineTo(w/2,geo.rosterStart+Math.min(maxLength,split*geo.rowHeight+12));c.stroke();c.restore();
 for(let i=0;i<names.length;i++){
  const p=names[i],col=i<split?0:1,row=i<split?i:i-split,x=col===0?93:564,y=geo.rosterStart+(doc.rosterSplit?32:0)+row*geo.rowHeight;
  jersey(c,x,y,19);const full=String(p.name||''),width=col===0?397:420;
  const safe=fitOneLine(full,width,(geo.story?31:28)*(doc.overrides?.typeScale||1),21,measure);
  if(!safe.fits)warnings.push('Oyuncu ismi sığmıyor: '+full);
  label(c,full,x+30,y,safe.size,WHITE,'left',800);
 }
 const foot=drawFooter(c,doc,geo,accent,measure);warnings.push(...foot.warnings);
 slogan(c,w,h,accent);return warnings;
}
function publicPoster(c,doc,geo,w,h,accent,logo,measure){const warnings=[];
 crest(c,logo,w/2,geo.headerY,geo.logoSize,accent,doc.clubName.slice(0,2));
 label(c,doc.clubName,w/2,geo.clubY,geo.clubFont,MINT,'center',900);
 const comp=posterCompetitionLabel(doc.match);
 const cfit=fitOneLine(comp,900,geo.competitionFont,22,measure);label(c,comp,w/2,geo.competitionY,cfit.size,MINT,'center',900);if(!cfit.fits)warnings.push('Müsabaka bilgisi sığmıyor.');
 label(c,'MAÇ GÜNÜ',w/2,geo.headlineY,geo.mainFont,WHITE,'center',900,'metal');
 const matchY=geo.story?850:603;panel(c,59,matchY,w-118,240,{emphasis:true});
 label(c,doc.clubName,w/2,matchY+56,50,WHITE,'center',900);
 label(c,'VS',w/2,matchY+121,61,'#57CC81','center',900);
 const opp=String(doc.match.opponent||'').toLocaleUpperCase('tr-TR');const ofit=fitOneLine(opp,875,50,22,measure);
 label(c,opp,w/2,matchY+191,ofit.size,WHITE,'center',900);if(!ofit.fits)warnings.push('Rakip takım adı sığmıyor.');
 const detailsY=geo.story?1230:885;panel(c,90,detailsY,w-180,195);
 const date=String(doc.match.dateLabel||'').toLocaleUpperCase('tr-TR');const dateFit=fitOneLine(date,790,35,22,measure);
 label(c,date,w/2,detailsY+42,dateFit.size,MINT);if(!dateFit.fits)warnings.push('Tarih metni sığmıyor.');
 label(c,doc.match.kickoffTime||'',w/2,detailsY+108,80,WHITE,'center',900,'metal');
 const venue=String(doc.match.venue||'').toLocaleUpperCase('tr-TR');const venueFit=fitOneLine(venue,770,34,19,measure);
 label(c,venue,w/2,detailsY+161,venueFit.size,WHITE);if(!venueFit.fits)warnings.push('Stadyum adı sığmıyor.');
 slogan(c,w,h,accent);return warnings;
}
function renderClassicStadium(c,doc,{logo=null,background=null}={}){
 const {width:w,height:h}=c.canvas;const accent=doc.overrides?.accent||'#176B46';stadiumBackground(c,w,h,accent);broadcastAtmosphere(c,w,h,accent,'editorial');
 if(background){c.save();c.globalAlpha=.35;c.drawImage(background,0,0,w,h);c.restore();fill(c,0,0,w,h,'rgba(1,10,6,.55)');}
 const measure=(text,size)=>{c.font=font(size,800);return c.measureText(String(text)).width};
 const geo=classicGeometry(w,h,doc.kind);
 const typography=Number(doc.overrides?.typeScale||1),logoScale=Number(doc.overrides?.logoScale||1);
 geo.logoSize*=logoScale;geo.clubFont*=typography;geo.competitionFont*=typography;geo.mainFont*=typography;
 geo.rowHeight*=typography;
 const warnings=doc.kind==='private'?privatePoster(c,doc,geo,w,h,accent,logo,measure):publicPoster(c,doc,geo,w,h,accent,logo,measure);
 return{fits:warnings.length===0,warnings};
}

Object.assign(exports,{fitOneLine,classicGeometry,classicRosterFits,planClassicFooter,renderClassicStadium});

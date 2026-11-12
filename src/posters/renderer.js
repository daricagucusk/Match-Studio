const {broadcastAtmosphere,broadcastFrame}=require("src/posters/broadcast-frame.js");

const {renderClassicStadium}=require("src/posters/classic-stadium.js");
const {renderReferencePoster}=require("src/posters/reference-designs.js");
const {sizes,posterCompetitionLabel}=require("src/domain/poster-document.js");
const {measureLayout}=require("src/posters/layout.js");



const C={white:'#F6F8F4',sage:'#ADCEB9',dark:'#08130F'};
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h)}
function line(c,x1,y1,x2,y2,color,width=1){c.beginPath();c.strokeStyle=color;c.lineWidth=width;c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function text(c,s,x,y,font=32,color=C.white,align='left',weight='700'){c.font=`${weight} ${font}px system-ui, Arial, sans-serif`;c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.fillText(String(s??''),x,y)}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,color);g.addColorStop(.12,'rgba(193,240,205,.34)');g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
function bg(c,w,h,tpl,accent){const g=c.createLinearGradient(0,0,w,h);if(tpl==='elite-minimal'){g.addColorStop(0,'#131A17');g.addColorStop(1,'#26312B')}else if(tpl==='tactical-board'){g.addColorStop(0,'#143827');g.addColorStop(1,'#07140E')}else if(tpl==='matchday-pro'){g.addColorStop(0,'#0C1712');g.addColorStop(.48,'#12271C');g.addColorStop(1,'#0B1712')}else{g.addColorStop(0,'#08130F');g.addColorStop(.46,'#1A3022');g.addColorStop(1,'#06120A')}rect(c,0,0,w,h,g);
 if(tpl==='classic-stadium'){
  c.save();for(let i=0;i<14;i++){const xx=25+i*78;glow(c,xx,-40+(i%3)*23,140,'rgba(248,255,249,.9)');glow(c,xx,h*.24,105,'rgba(31,175,94,.35)')}for(let i=0;i<8;i++){glow(c,(-140+i*195),h*.38,170,'rgba(30,142,77,.22)')}c.restore();
  const turf=c.createLinearGradient(0,h*.76,0,h);turf.addColorStop(0,'rgba(4,35,17,0)');turf.addColorStop(.7,'rgba(6,37,17,.85)');turf.addColorStop(1,'#082B12');rect(c,0,h*.73,w,h*.27,turf);
  for(let j=0;j<70;j++){c.globalAlpha=.07;line(c,0,h*.88+j*3,w,h*.88+j*3,j%2?accent:'#FFFFFF',.8)}c.globalAlpha=1;
 }else if(tpl==='tactical-board'){
  c.strokeStyle='rgba(213,244,220,.15)';c.lineWidth=3;c.strokeRect(74,120,w-148,h-240);line(c,w/2,120,w/2,h-120,'rgba(213,244,220,.11)',3);c.beginPath();c.arc(w/2,h/2,150,0,Math.PI*2);c.stroke();c.strokeRect(74,h*.35,165,h*.3);c.strokeRect(w-239,h*.35,165,h*.3);
 }else if(tpl==='matchday-pro'){for(let i=0;i<7;i++)line(c,-70+i*230,0,-230+i*230,h, 'rgba(98,211,129,.075)',8)}else{for(let i=0;i<16;i++)line(c,75+i*60,0,75+i*60,h,'rgba(255,255,255,.016)')}
 rect(c,0,0,w,13,accent);rect(c,0,h-13,w,13,accent);
}
function shield(c,x,y,s,accent,logo,initials="MS"){if(logo){const factor=Math.min(s/logo.width,s/logo.height);const ww=logo.width*factor,hh=logo.height*factor;c.drawImage(logo,x-ww/2,y-hh/2,ww,hh);return;}
 c.save();c.translate(x,y);c.scale(s/180,s/180);c.beginPath();c.moveTo(0,-95);c.lineTo(73,-70);c.lineTo(68,20);c.quadraticCurveTo(61,68,0,91);c.quadraticCurveTo(-61,68,-68,20);c.lineTo(-73,-70);c.closePath();c.fillStyle='#091710';c.fill();c.lineWidth=7;c.strokeStyle=accent;c.stroke();c.beginPath();c.moveTo(0,-72);c.lineTo(50,-55);c.lineTo(47,12);c.quadraticCurveTo(36,48,0,65);c.quadraticCurveTo(-36,48,-47,12);c.lineTo(-50,-55);c.closePath();c.lineWidth=2;c.strokeStyle='#9EC7AC';c.stroke();text(c,initials,0,3,57,C.white,'center','900');c.restore();}
function centerTitle(c,doc,w,kind,accent,logo,ls){const h=c.canvas.height,story=h>1500;const logoY=story?270:197;shield(c,w/2,logoY,(story?215:165)*(doc.overrides.logoScale||1),accent,logo,doc.clubName.slice(0,2));
 text(c,doc.clubName,w/2,story?445:339,story?59:52,C.white,'center','900');rect(c,w*.14,story?501:391,w*.72,3,accent);
 if(kind==='public'){
  const base=story?630:507;text(c,'MAÇ GÜNÜ',w/2,base,story?97:88,C.white,'center','900');text(c,posterCompetitionLabel(doc.match),w/2,base+91,31,C.sage,'center','800');
  rect(c,80,base+160,w-160,4,accent);text(c,doc.clubName,w/2,base+255,story?72:64,C.white,'center','900');text(c,'VS',w/2,base+333,65,accent,'center','900');fitText(c,doc.match.opponent.toLocaleUpperCase('tr-TR'),w/2,base+412,w-142,70,C.white);
  rect(c,100,base+490,w-200,2,accent);text(c,doc.match.dateLabel||'',w/2,base+560,39,C.sage,'center');text(c,doc.match.kickoffTime||'',w/2,base+636,story?99:83,C.white,'center','900');fitText(c,doc.match.venue.toLocaleUpperCase('tr-TR'),w/2,base+725,w-100,38,C.white);
 }else{
  fitText(c,posterCompetitionLabel(doc.match)+' · MAÇ KADROSU',w/2,story?548:456,w-100,story?53:48,C.white);
  fitText(c,`${doc.clubName}   VS   ${doc.match.opponent}`,w/2,story?638:536,w-100,42,C.sage);text(c,`${doc.match.dateLabel}   ·   ${doc.match.kickoffTime}`,w/2,story?709:589,26,C.white,'center');
 }
}
function fitText(c,words,x,y,maxWidth,maxSize,color=C.white){let size=maxSize;do{c.font=`900 ${size}px system-ui, Arial, sans-serif`;if(c.measureText(words).width<=maxWidth)break;size-=1}while(size>17);text(c,words,x,y,size,color,'center','900');}
function roster(c,doc,w,h,layout,accent){const players=doc.players||[],half=doc.rosterSplit?.starters??Math.ceil(players.length/2);const y0=layout.headerBottom+layout.rowHeight*.75;
 const left=96,right=w/2+34;if(doc.rosterSplit){text(c,`İLK ${doc.rosterSplit.starters}`,left,layout.headerBottom-15,19,C.sage,'left','800');text(c,`YEDEKLER ${doc.rosterSplit.bench}`,right,layout.headerBottom-15,19,C.sage,'left','800');}rect(c,w/2-1,layout.headerBottom-8,2,layout.rows*layout.rowHeight+25,'rgba(157,216,176,.21)');for(let i=0;i<players.length;i++){const item=players[i],col=i<half?0:1,row=i<half?i:i-half,x=col?right:left,y=y0+row*layout.rowHeight;
  c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fillStyle=accent;c.fill();text(c,item.name,x+20,y,layout.fontSize,C.white,'left','700');
 }
}
function wrap(c,s,x,y,maxWidth,size,color,maxLines=2,lineHeight=30){const words=String(s).split(/\s+/),lines=[],current={value:''};c.font=`600 ${size}px system-ui,Arial,sans-serif`;for(const word of words){const next=current.value?current.value+' '+word:word;if(c.measureText(next).width>maxWidth&&current.value){lines.push(current.value);current.value=word;}else current.value=next;}if(current.value)lines.push(current.value);for(let i=0;i<Math.min(maxLines,lines.length);i++)text(c,lines[i],x,y+i*lineHeight,size,color,'left','600');return lines.length>maxLines;}
function footer(c,doc,w,h,accent){const x=86,y=h>1500?1615:1140,p=doc.instructions||{};rect(c,55,y-40,w-110,3,accent);const pairs=[];if(p.meetingTime)pairs.push(['TOPLANMA',p.meetingTime+(p.meetingPlace?' · '+p.meetingPlace:'')]);if(p.mealDeadline)pairs.push(['MAÇ YEMEĞİ / EN GEÇ',p.mealDeadline]);if(p.mealMenu)pairs.push(['MENÜ',p.mealMenu]);if(p.kitNotes)pairs.push(['KIYAFET',p.kitNotes]);if(p.hydrationNotes)pairs.push(['SIVI KONTROLÜ',p.hydrationNotes]);if(p.coachNotes)pairs.push(['ANTRENÖR NOTU',p.coachNotes]);if(doc.overrides.showOptionalSections===false) pairs.splice(0,pairs.length);const maxRows=h>1500?7:6,rowGap=h>1500?40:32,font=h>1500?24:19;
 let overflow=pairs.length>maxRows;for(let i=0;i<Math.min(maxRows,pairs.length);i++){const yy=y+i*rowGap;text(c,pairs[i][0],x,yy,font-3,'#A8C9B4','left','800');overflow=wrap(c,pairs[i][1],x+258,yy,w-375,font,C.white,1,rowGap)||overflow;}
 return overflow;
}
async function renderPoster(doc,canvas,{logo=null,background=null}={}){const [w,h]=sizes[doc.size]||sizes['portrait-post'];canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');if(doc.templateId==='reference-roster'||doc.templateId==='reference-pitch'||doc.templateId==='reference-result')return renderReferencePoster(c,doc,{logo,background});if(doc.templateId==='classic-stadium'){const r=renderClassicStadium(c,doc,{logo,background});broadcastFrame(c,w,h,doc.overrides.accent||'#17875D');return r;}let accent=doc.overrides.accent||'#176B46';bg(c,w,h,doc.templateId,accent);broadcastAtmosphere(c,w,h,accent,doc.templateId==='elite-minimal'?'minimal':doc.templateId==='tactical-board'?'tactical':'editorial');if(background){c.save();c.globalAlpha=.40;c.drawImage(background,0,0,w,h);c.restore();rect(c,0,0,w,h,'rgba(3,12,8,.39)');}
 centerTitle(c,doc,w,doc.kind,accent,logo);const layout=measureLayout(doc,w,h,(v,size)=>{c.font=`700 ${size}px system-ui,Arial,sans-serif`;return c.measureText(v).width;});let fit=layout.fits;
 if(doc.kind==='private'){roster(c,doc,w,h,layout,accent);if(footer(c,doc,w,h,accent)){layout.warnings.push('Organizasyon talimatları afişin alt bölümüne sığmıyor. Metni kısaltın.');fit=false;}}
 text(c,'BİRLİKTE DAHA GÜÇLÜ',w/2,h-42,28,'#B7D8C4','center','800');broadcastFrame(c,w,h,accent);
 return {fits:fit,warnings:layout.warnings};}
async function exportPng(doc,assets={}){const canvas=document.createElement('canvas');const result=await renderPoster(doc,canvas,assets);if(!result.fits)throw Error(result.warnings.join(' ')||'Afiş metni sığmadı.');return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG oluşturulamadı.')),'image/png'));}
function downloadPng(blob,filename){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);}
async function sharePng(blob,name){const file=new File([blob],name,{type:'image/png'});if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'Match Studio Maç Afişi'});return 'shared';}catch(e){if(e.name==='AbortError')return 'cancelled';}}downloadPng(blob,name);return 'download-fallback';}

Object.assign(exports,{renderPoster,exportPng,downloadPng,sharePng});

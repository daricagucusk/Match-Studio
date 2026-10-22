const {broadcastAtmosphere,broadcastFrame}=require("src/posters/broadcast-frame.js");


/** Public-only weekly match graphics: no player, meal, meeting or coach notes enter this model. */
function mondayOf(day){
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day||''));if(!m)return null;
 const date=new Date(Date.UTC(+m[1],+m[2]-1,+m[3],12));if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==day)return null;
 const offset=(date.getUTCDay()+6)%7;date.setUTCDate(date.getUTCDate()-offset);return date.toISOString().slice(0,10);
}
function pickBoardMatches(matches,day,mode='week'){
 const monday=mondayOf(day);const end=monday?new Date(Date.parse(monday+'T12:00:00Z')+7*86400000).toISOString().slice(0,10):null;
 return [...(matches||[])].filter(m=>mode==='all'||(monday&&m.matchDate>=monday&&m.matchDate<end)).sort((a,b)=>String(a.matchDate||'').localeCompare(b.matchDate||'')||String(a.kickoffTime||'').localeCompare(b.kickoffTime||'')||String(a.id||'').localeCompare(b.id||''));
}
function fakeValue(v){return /^(?:ss\d*|test\d*|demo\d*|taslak|deneme\d*|xxx+|aaa+|belirsiz|rakip|henüz\s+belirlenmedi)$/iu.test(String(v||'').trim());}
function validDate(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v||'')))return false;const d=new Date(String(v)+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v;}
function prepareBoard(allMatches,groups,selectedIds,size='portrait-post',clubName='SPOR KULÜBÜ',clubAccent='#17875D'){
 const issues=[];const max=size==='story'?8:5;
 if(!['portrait-post','story'].includes(size))issues.push('Çıktı oranı geçersiz.');
 const selection=[...new Set(selectedIds||[])],map=new Map((allMatches||[]).map(m=>[String(m.id),m]));
 if(!selection.length)issues.push('Paylaşmak için en az bir maç seç.');
 if(selection.length>max)issues.push(`Bu görsel boyutuna en fazla ${max} maç sığar. Hikâye formatını seç veya seçimi azalt.`);
 const grp=new Map((groups||[]).map(g=>[String(g.id),g.name]));
 const items=[];
 for(const id of selection){const m=map.get(String(id));if(!m){issues.push('Seçilen maç bulunamadı.');continue;}
  const group=String(grp.get(String(m.groupId))||m.ageCategory||'').trim();
  if(!group||fakeValue(group))issues.push('Maç grubu eksik.');
  if(!String(m.opponent||'').trim()||fakeValue(m.opponent))issues.push('Rakip takım bilgisi eksik veya deneme verisi.');
  if(!validDate(m.matchDate))issues.push('Maç tarihi geçersiz.');
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(m.kickoffTime||'')))issues.push('Maç saati eksik veya geçersiz.');
  if(!String(m.venue||'').trim()||fakeValue(m.venue))issues.push('Maç sahası eksik veya deneme verisi.');
  // Strict whitelist: never spread match records into a public artifact.
  items.push({id:String(m.id),group,opponent:String(m.opponent||'').trim(),date:String(m.matchDate||''),time:String(m.kickoffTime||''),venue:String(m.venue||'').trim()});
 }
 items.sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
 return {ok:issues.length===0,issues:[...new Set(issues)],items,size,max,clubName:String(clubName||"SPOR KULÜBÜ").toLocaleUpperCase("tr-TR"),clubAccent:/^#[0-9a-fA-F]{6}$/.test(clubAccent)?clubAccent:"#17875D"};
}
function rr(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.8;ctx.stroke()}}
function fillTextFit(ctx,value,x,y,maxWidth,maxSize,minSize=22,fill='#FFF',weight=800){
 const s=String(value||'');ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle=fill;
 let font=maxSize;while(font>minSize){ctx.font=`${weight} ${font}px system-ui, Arial, sans-serif`;if(ctx.measureText(s).width<=maxWidth)break;font-=1;}
 ctx.font=`${weight} ${font}px system-ui, Arial, sans-serif`;
 if(ctx.measureText(s).width>maxWidth)return false;ctx.fillText(s,x,y);return true;
}
function dateParts(s){let d=new Date(s+'T12:00:00Z');return {day:d.toLocaleDateString('tr-TR',{day:'2-digit',timeZone:'UTC'}),month:d.toLocaleDateString('tr-TR',{month:'short',timeZone:'UTC'}).toLocaleUpperCase('tr-TR'),weekday:d.toLocaleDateString('tr-TR',{weekday:'long',timeZone:'UTC'}).toLocaleUpperCase('tr-TR')};}
function renderWeeklyBoard(plan,canvas,{logo=null,watermark=null}={}){
 if(!plan.ok)throw Error(plan.issues.join(' '));const w=1080,h=plan.size==='story'?1920:1350;canvas.width=w;canvas.height=h;
 const c=canvas.getContext('2d');if(!c)throw Error('Canvas kullanılamıyor.');const warnings=[];
 const grad=c.createLinearGradient(0,0,w,h);grad.addColorStop(0,'#09151C');grad.addColorStop(.55,'#162E30');grad.addColorStop(1,'#0A141C');c.fillStyle=grad;c.fillRect(0,0,w,h);broadcastAtmosphere(c,w,h,plan.clubAccent,'editorial');
 // Stadium beams and geometries stay behind content, never behind primary labels.
 c.save();c.globalAlpha=.12;for(let i=-2;i<9;i++){c.beginPath();c.moveTo(i*210,0);c.lineTo(i*210+180,0);c.lineTo(540+i*80,h);c.fillStyle=i%2?'#34774E':'#A1DEB3';c.fill()}c.restore();
 c.fillStyle='#57B77B';c.fillRect(0,0,w,13);c.fillRect(0,h-15,w,15);
 if(logo){const scale=Math.min(128/logo.width,132/logo.height);c.drawImage(logo,76,65,logo.width*scale,logo.height*scale)}
 if(!fillTextFit(c,plan.clubName,logo?265:82,120,logo?700:900,35,22,'#D7F1DE',900))warnings.push('Kulüp adı üst başlığa sığmıyor.');
 const y=Number(plan.items[0].date.slice(0,4)),mo=Number(plan.items[0].date.slice(5,7)),season=mo>=8?y:y-1;
 fillTextFit(c,`SPOR KULÜBÜ  •  ${season}–${String(season+1).slice(-2)}`,logo?265:82,159,720,23,21,'#9DCEAF',700);
 fillTextFit(c,'HAFTANIN',82,273,915,82,60,'#F8FFF9',900);
 fillTextFit(c,'MAÇLARI',82,352,915,83,60,'#F8FFF9',900);
 rr(c,80,384,920,3,0,'#73D49C');
 const first=plan.items[0]?.date,last=plan.items[plan.items.length-1]?.date;
 const range=first===last?first:`${first} — ${last}`;
 fillTextFit(c,range,84,427,640,27,22,'#BDD9C5',700);
 c.textAlign='right';c.font='800 27px system-ui';c.fillStyle='#C0DFC9';c.fillText(`${plan.items.length} KARŞILAŞMA`,998,427);
 const listTop=460;const footerY=h-110;const listHeight=footerY-listTop-10;const gap=14;const rowH=Math.min(205,(listHeight-gap*(plan.items.length-1))/plan.items.length);
 for(let i=0;i<plan.items.length;i++){
  const m=plan.items[i],y=listTop+i*(rowH+gap),d=dateParts(m.date);
  rr(c,76,y,928,rowH,13,'#15282D','#3B5C5B');c.fillStyle=i%2?'#BFA06B':'#55C891';c.fillRect(76,y+13,4,rowH-26);
  rr(c,77,y+1,137,rowH-2,14,i%2?'#1C4932':'#224E36');
  c.fillStyle='#86DCA8';c.fillRect(217,y+22,3,rowH-44);
  const unit=(rowH>=160)?1:.86;
  if(!fillTextFit(c,d.day,99,y+77*unit,100,70*unit,53*unit,'#F6FFF8',900))warnings.push('Tarih sığmadı.');
  fillTextFit(c,d.month,99,y+111*unit,104,24*unit,20*unit,'#B5E1C4',900);
  fillTextFit(c,d.weekday.slice(0,10),99,y+140*unit,110,15*unit,12*unit,'#B3D0B9',700);
  if(!fillTextFit(c,m.group.toLocaleUpperCase('tr-TR'),243,y+39*unit,350,28*unit,21*unit,'#91D6AC',900))warnings.push(`Grup adı uzun: ${m.group}`);
  if(!fillTextFit(c,`${plan.clubName}  –  ${m.opponent.toLocaleUpperCase('tr-TR')}`,243,y+89*unit,735,35*unit,23*unit,'#F5FFF8',900))warnings.push(`Rakip adı uzun: ${m.opponent}`);
  if(!fillTextFit(c,`${m.time}  •  ${m.venue}`,243,y+133*unit,725,23*unit,18*unit,'#C3D7C9',650))warnings.push(`Saha adı uzun: ${m.venue}`);
 }
 c.fillStyle='#D5E8DA';c.font='800 24px system-ui';c.textAlign='left';c.fillText('BİRLİKTE DAHA GÜÇLÜ',80,h-63);
 c.fillStyle='#9EB7A5';c.font='600 19px system-ui';c.textAlign='right';c.fillText('Saat ve saha bilgilerini maç öncesi teyit edin.',1000,h-62);broadcastFrame(c,w,h,plan.clubAccent);
 if(watermark){c.save();c.translate(w/2,h/2);c.rotate(-.38);c.fillStyle='rgba(255,255,255,.32)';c.font='900 116px system-ui';c.textAlign='center';c.fillText(watermark,0,0);c.restore();}
 return {fits:!warnings.length,warnings,width:w,height:h};
}
async function exportWeeklyBoard(plan,assets={}){
 const canvas=document.createElement('canvas');const layout=renderWeeklyBoard(plan,canvas,assets);if(!layout.fits)throw Error('Bazı başlıklar sığmıyor: '+layout.warnings.join(' '));return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG oluşturulamadı.')),'image/png'));
}

Object.assign(exports,{mondayOf,pickBoardMatches,prepareBoard,renderWeeklyBoard,exportWeeklyBoard});

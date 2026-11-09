/* Premium public fixture art based on supplied programme reference. No private data access. */
const {enhanceStadium}=require('src/posters/stadium-effects.js');
const FONT=(size,weight=850)=>weight+' '+size+'px "Arial Black","Segoe UI",Arial,sans-serif';
function text(c,v,x,y,size,color='#F3FFF3',align='left',weight=850){c.save();c.font=FONT(size,weight);c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;if(size>=65&&color==='#F6FFF6'){const gradient=c.createLinearGradient(0,y-size/2,0,y+size/2);gradient.addColorStop(0,'#FFFFFF');gradient.addColorStop(.5,'#C4E0CD');gradient.addColorStop(1,'#FAFFF9');c.fillStyle=gradient;c.shadowColor='#000';c.shadowBlur=10;c.shadowOffsetY=4;}c.fillText(String(v??''),x,y);c.restore()}
function fit(c,v,x,y,max,size,min=13,color='#F6FFF4',align='left'){v=String(v??'');let s=size;c.font=FONT(s);while(s>min&&c.measureText(v).width>max){s--;c.font=FONT(s)}const good=c.measureText(v).width<=max;text(c,v,x,y,s,color,align);return good;}
function rect(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
function panel(c,x,y,w,h){const bg=c.createLinearGradient(x,y,x,y+h);bg.addColorStop(0,'#0D2F1BCC');bg.addColorStop(1,'#06170FEF');c.fillStyle=bg;c.strokeStyle='#69DB91';c.lineWidth=2;c.beginPath();c.roundRect(x,y,w,h,17);c.fill();c.stroke();}
function gradBg(c,w,h,accent){const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#05140B');g.addColorStop(.5,'#0F3820');g.addColorStop(1,'#041008');rect(c,0,0,w,h,g);
 for(let i=0;i<17;i++){c.strokeStyle='#67CA9120';c.lineWidth=2;c.beginPath();c.moveTo(0,130+i*20);c.lineTo(w,130+i*20);c.stroke();}
 for(const x of [68,w-68]){const s=c.createRadialGradient(x,60,0,x,60,230);s.addColorStop(0,'#E8FFF68F');s.addColorStop(1,'#B4FFDD00');rect(c,x-230,-170,460,460,s);for(let i=0;i<4;i++)for(let j=0;j<3;j++)rect(c,x+(i-1.5)*22-6,32+j*20,12,12,'#EBFFF4');}
 for(let i=0;i<850;i++){c.globalAlpha=.13;rect(c,(i*79)%w,190+(i*67)%190,2,2,i%3?'#80C69C':'#F9FFF7');}c.globalAlpha=1;
 rect(c,0,0,w,12,accent);rect(c,0,h-12,w,12,accent);}
function turkishDate(s){const d=new Date(String(s)+'T12:00:00Z');return d.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long',timeZone:'UTC'}).toLocaleUpperCase('tr-TR');}
function renderPremiumWeeklyBoard(plan,canvas,{logo=null,watermark=null}={}){if(!plan.ok)throw Error(plan.issues.join(' '));const w=1080,h=plan.size==='story'?1920:1350;canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');if(!c)throw Error('Canvas kullanılamıyor.');const warnings=[],accent=plan.clubAccent||'#59CF83';gradBg(c,w,h,accent);enhanceStadium(c,w,h,accent);
 if(logo){let scale=Math.min(160/logo.width,164/logo.height);c.drawImage(logo,52,34,logo.width*scale,logo.height*scale);}
 else{panel(c,49,48,165,149);fit(c,plan.clubName.split(' ').slice(0,2).map(p=>p[0]||'').join(''),131,122,145,46,22,'#B7ECC8','center');}
 fit(c,plan.clubName,540,77,590,35,18,'#BEF5CF','center');fit(c,'MAÇ PROGRAMI',625,170,745,76,58,'#F6FFF6','center');fit(c,turkishDate(plan.items[0].date),540,248,915,33,17,'#B7ECC8','center');
 const n=plan.items.length,top=295,bottom=h-196,gap=n>5?11:17,rowH=Math.min(n===1?420:n===2?300:270,(bottom-top-gap*(n-1))/n);if(rowH<130)warnings.push('Maç listesi afişe sığmıyor.');const startY=top+Math.max(0,(bottom-top-(n*rowH+gap*(n-1)))/2);
 for(let i=0;i<n;i++){const m=plan.items[i],y=startY+i*(rowH+gap);panel(c,42,y,996,rowH);rect(c,43,y+13,8,rowH-26,i%2?'#BFF398':'#79E69B');const unit=rowH>=235?1:rowH>=172?.82:.70;const left=85;
  if(rowH<206){
   fit(c,m.group.toLocaleUpperCase('tr-TR'),left,y+27,690,28,16,'#C2FFD0');
   if(!fit(c,plan.clubName+'  VS  '+m.opponent.toLocaleUpperCase('tr-TR'),left,y+rowH/2,700,29,16,'#FFFFFF'))warnings.push('Rakip uzun: '+m.opponent);
   if(!fit(c,m.venue,left,y+rowH-25,695,19,14,'#B2DDC1'))warnings.push('Saha adı uzun: '+m.venue);
   if(!fit(c,m.time,868,y+rowH/2,245,57,28,'#C2FFAA','center'))warnings.push('Saat alanı taşması.');
  }else{
   fit(c,m.group.toLocaleUpperCase('tr-TR'),left,y+42*unit,670,48*unit,17,'#C2FFD0');fit(c,plan.clubName,left,y+(88*unit),685,34*unit,16,'#FFFFFF');text(c,'VS',left+255,y+128*unit,30*unit,'#70E895','center');if(!fit(c,m.opponent.toLocaleUpperCase('tr-TR'),left,y+174*unit,700,38*unit,17,'#FFFFFF'))warnings.push('Rakip uzun: '+m.opponent);
   if(!fit(c,m.venue,left,y+rowH-34,695,24*unit,15,'#B2DDC1'))warnings.push('Saha adı uzun: '+m.venue);
   if(!fit(c,m.time,865,y+rowH/2-24,250,66*unit,28,'#C2FFAA','center'))warnings.push('Saat alanı taşması.');
   fit(c,turkishDate(m.date),865,y+rowH/2+37,265,17*unit,11,'#D1F4D9','center');
  }
 }
 text(c,'SAHADA GÜCÜMÜZÜ',540,h-168,50,'#F5FFF4','center');text(c,'GÖSTERİYORUZ!',540,h-106,62,'#9AFF77','center');if(watermark){c.save();c.translate(w/2,h/2);c.rotate(-.25);c.globalAlpha=.35;text(c,watermark,0,0,108,'#FFFFFF','center');c.restore();}
 return {fits:!warnings.length,warnings,width:w,height:h};
}
Object.assign(exports,{renderPremiumWeeklyBoard});
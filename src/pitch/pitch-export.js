
const {getPitchPresets,getBenchIds,getFullPitchRows,normalizeLineup,getPitchShirtNumber}=require("src/domain/lineup.js");
const {isCrosswise,drawFacilityCanvas}=require("src/domain/pitch-layout.js");

const font=(px,w=600)=>`${w} ${px}px system-ui, Arial, sans-serif`;
const text=(ctx,s,x,y,size=22,weight=700,color='#FFFFFF',align='left')=>{ctx.font=font(size,weight);ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(String(s),x,y);};
const line=(ctx,x1,y1,x2,y2)=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
const round=(ctx,x,y,w,h,r=14)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r)};
function fit(ctx,s,max,size=20){let v=String(s||'');ctx.font=font(size,750);while(ctx.measureText(v).width>max&&v.length>2)v=v.slice(0,-1);return v!==String(s||'')?v.slice(0,-1)+'…':v;}
async function pitchPng(match,roster,plan,players,mode='match',clubName='SPOR KULÜBÜ'){
 const w=1080,h=1350,c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');
 ctx.fillStyle='#0D1813';ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#8CDFAB';ctx.fillRect(0,0,8,h);
 text(ctx,String(clubName).toLocaleUpperCase('tr-TR')+'  /  SAHA DİZİLİŞİ',55,60,25,850,'#90BBA0');
 text(ctx,mode==='match'?'MAÇ DİZİLİŞİ':'TAM KADRO HARİTASI',55,119,47,850);
 const opponent=String(match?.opponent||'MAÇ');text(ctx,fit(ctx,opponent.toUpperCase(),700,25),55,165,25,700,'#B6CEBD');
 const date=String(match?.matchDate||'');text(ctx,`${date}  ·  ${match?.kickoffTime||''}`,1030,167,22,600,'#AFC8B7','right');
 ctx.fillStyle='#173724';round(ctx,55,202,970,856,26);ctx.fill();
 for(let i=0;i<9;i++){ctx.fillStyle=i%2?'#FFFFFF':'#000000';ctx.globalAlpha=0.027;ctx.fillRect(55,202+i*95,970,95);}ctx.globalAlpha=1;
 ctx.strokeStyle='rgba(230,255,234,0.6)';ctx.lineWidth=3;ctx.strokeRect(72,220,936,820);
 line(ctx,72,630,1008,630);ctx.beginPath();ctx.arc(540,630,94,0,Math.PI*2);ctx.stroke();
 if(isCrosswise(match)){ctx.strokeRect(385,220,310,88);ctx.strokeRect(385,952,310,88);}else{ctx.strokeRect(361,220,358,138);ctx.strokeRect(433,220,214,55);ctx.strokeRect(361,902,358,138);ctx.strokeRect(433,982,214,58);}
 ctx.fillStyle='#A2E0B4';ctx.fillRect(518,205,44,13);ctx.fillRect(518,1038,44,13);
 if(isCrosswise(match))drawFacilityCanvas(ctx,match,785,255,195,110);
 if(mode==='match'){
  plan=normalizeLineup(plan,roster);const byId=new Map(roster.entries.map(e=>[e.playerId,e]));
  getPitchPresets()[plan.preset].forEach((slot,i)=>{const entry=byId.get(plan.assignments[String(i)]);const x=72+slot.x/100*936,y=220+slot.y/100*820;
   ctx.beginPath();ctx.arc(x,y,29,0,Math.PI*2);ctx.fillStyle=entry?'#EDF7ED':'rgba(255,255,255,.12)';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=entry?'#FFFFFF':'rgba(255,255,255,.3)';ctx.stroke();
   text(ctx,entry?(getPitchShirtNumber(plan,entry)||String(i+1)):'+',x,y,24,850,entry?'#153C25':'#E6F2EB','center');
   round(ctx,x-78,y+33,156,30,9);ctx.fillStyle='rgba(7,25,15,.92)';ctx.fill();text(ctx,entry?fit(ctx,entry.nameSnapshot,145,15):'BOŞ',x,y+48,15,750,'#FFFFFF','center');
   text(ctx,slot.label,x,y+77,14,650,'#C8EBD3','center');
  });
  const benchIds=getBenchIds(plan,roster),entryMap=new Map(roster.entries.map(e=>[e.playerId,e]));
  text(ctx,`YEDEK KULÜBESİ · ${benchIds.length} OYUNCU`,55,1097,25,800,'#B2EDC7');
  benchIds.slice(0,18).forEach((id,index)=>{const e=entryMap.get(id);const col=index%2,row=Math.floor(index/2),x=55+col*480,y=1145+row*22;
   text(ctx,`${getPitchShirtNumber(plan,e)||'—'}  ${fit(ctx,e?.nameSnapshot,390,18)}`,x,y,18,650,'#DCEFE0');
  });
  if(benchIds.length>18)text(ctx,`+${benchIds.length-18} oyuncu daha`,55,1330,16,600,'#DCEFE0');
 }else{
  const groups=getFullPitchRows(roster,players,plan.positionOverrides);let y=245;const heights=groups.map(g=>Math.max(95,58+Math.ceil(g.players.length/3)*43));const factor=Math.min(1,800/heights.reduce((a,b)=>a+b,0));for(const [groupIndex,group] of groups.entries()){
    const block=heights[groupIndex]*factor;
    round(ctx,95,y,890,block-8,10);ctx.fillStyle='rgba(5,27,16,.42)';ctx.fill();text(ctx,`${group.label.toLocaleUpperCase('tr')}   ·   ${group.players.length}`,115,y+22,18,850,'#A9E4BF');
    group.players.forEach((e,i)=>{const x=116+(i%3)*287,ey=y+Math.min(60*factor,50)+Math.floor(i/3)*43*factor;
      text(ctx,fit(ctx,`${getPitchShirtNumber(plan,e)||'—'}  ${e.nameSnapshot}`,260,17),x,ey,17,650,'#FFFFFF');
    });y+=block;
  }
  if(y>1065)text(ctx,'Çok oyunculu görünüm: daha fazla bilgi için uygulamadaki saha haritasını kullanın.',55,1135,16,550,'#F6D7AB');
 }
 text(ctx,'BİRLİKTE DAHA GÜÇLÜ',540,1320,25,800,'#90C9A8','center');
 return await new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(Error('PNG çıktısı oluşturulamadı.')),'image/png'));
}

Object.assign(exports,{pitchPng});

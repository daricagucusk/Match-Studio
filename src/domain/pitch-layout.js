// A separate geometry model: physical facility view (goals on side touchlines)
// and rotated coach view (attack upwards). No unverified regulation dimensions.
const {normalizePitchLayout}=require('src/domain/match-format.js');
function isCrosswise(match){return match?.pitchLayout?.id==='half-pitch-crosswise';}
function facilityHtml(match){
 if(!isCrosswise(match))return '';
 const half=match.pitchLayout?.half==='south'?'south':'north';
 return `<div class="ms-facility"><div class="ms-facility-copy"><b>Tesis / Yarı Saha · Enine Oyun</b><small>Kaleler ana sahanın karşılıklı taç çizgilerinde. Taktik saha hücum yönüne göre döndürülmüştür.</small></div><div class="ms-facility-ground" aria-label="Tam sahanın ${half==='north'?'birinci':'ikinci'} yarısında, karşılıklı yan çizgilerde iki kale ve enine hücum yönü"><div class="ms-facility-mid"></div><div class="ms-facility-half ${half}"><i class="ms-goal west"></i><i class="ms-goal east"></i><strong>8v8 <span aria-hidden="true">→</span></strong></div></div></div>`;
}
function drawFacilityCanvas(ctx,match,x,y,w,h){
 if(!isCrosswise(match))return;
 const half=match.pitchLayout?.half==='south'?'south':'north';
 ctx.save();ctx.fillStyle='rgba(7,22,37,.94)';ctx.fillRect(x-9,y-34,w+18,h+60);
 ctx.font='700 17px system-ui';ctx.fillStyle='#D6EEFF';ctx.textAlign='left';ctx.fillText('TESİS: 8v8 ENİNE YARI SAHA',x,y-10);
 ctx.strokeStyle='#C3E3CE';ctx.lineWidth=2;ctx.fillStyle='#214A36';ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);
 ctx.beginPath();ctx.moveTo(x,y+h/2);ctx.lineTo(x+w,y+h/2);ctx.stroke();
 const ty=half==='north'?y:y+h/2;
 ctx.fillStyle='rgba(96,192,231,.20)';ctx.fillRect(x,ty,w,h/2);
 ctx.strokeStyle='#F7FBFF';ctx.lineWidth=3;
 ctx.strokeRect(x-10,ty+h/4-14,10,28);ctx.strokeRect(x+w,ty+h/4-14,10,28);
 ctx.font='700 15px system-ui';ctx.fillStyle='white';ctx.textAlign='center';ctx.fillText('8v8   →',x+w/2,ty+h/4+5);
 ctx.restore();
}
Object.assign(exports,{isCrosswise,facilityHtml,drawFacilityCanvas});

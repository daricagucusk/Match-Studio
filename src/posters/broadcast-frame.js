/* Deterministic, image-free broadcast treatments; only paints in decorative gutters. */
const validAccent=value=>/^#[0-9a-fA-F]{6}$/.test(String(value||''))?String(value):'#17875D';
function broadcastAtmosphere(ctx,width,height,color='#17875D',style='editorial'){
 const accent=validAccent(color);
 ctx.save();
 // Atmospheric lights are intentionally behind copy and hold no personal information.
 const aura=ctx.createRadialGradient(width*.55,height*.43,10,width*.55,height*.43,width*.82);
 aura.addColorStop(0,accent+'25');aura.addColorStop(.52,accent+'0D');aura.addColorStop(1,'#02070800');
 ctx.fillStyle=aura;ctx.fillRect(0,0,width,height);
 ctx.lineWidth=1;
 ctx.strokeStyle='#b9e8d00d';
 for(let i=0;i<20;i++){
  const y=height*(.17+i*.043);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();
 }
 if(style==='minimal'){
  ctx.save();ctx.translate(width*.81,height*.52);ctx.rotate(-.22);
  for(let i=0;i<5;i++){
   ctx.strokeStyle=i%2?accent+'22':'#daefe41a';ctx.lineWidth=9;
   ctx.strokeRect(-170-i*47,-height*.60-i*35,340+i*94,height*1.2+i*70);
  }
  ctx.restore();
 }else if(style==='tactical'){
  ctx.save();ctx.strokeStyle='#bdf2d324';ctx.lineWidth=2;
  const y=height*.72;
  for(let i=-2;i<8;i++){ctx.beginPath();ctx.moveTo(width*.06+i*185,y+130);ctx.lineTo(width*.06+i*185,0);ctx.stroke();}
  ctx.restore();
 }else{
  // Angled television-broadcast beams, positioned behind artwork.
  ctx.fillStyle=accent+'15';ctx.beginPath();ctx.moveTo(width*.81,0);ctx.lineTo(width,0);ctx.lineTo(width*.56,height*.96);ctx.lineTo(width*.42,height*.96);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e7b9670a';ctx.beginPath();ctx.moveTo(0,height*.16);ctx.lineTo(0,height*.25);ctx.lineTo(width*.38,height*.68);ctx.lineTo(width*.45,height*.68);ctx.closePath();ctx.fill();
 }
 ctx.restore();
}
function broadcastFrame(ctx,width,height,color='#17875D'){
 const accent=validAccent(color);
 ctx.save();
 ctx.strokeStyle='#b6eadc50';ctx.lineWidth=2;
 ctx.strokeRect(25,25,width-50,height-50);
 ctx.strokeStyle=accent;ctx.lineWidth=5;
 const a=55;
 for(const [x,y,dx,dy] of [[37,37,1,1],[width-37,37,-1,1],[37,height-37,1,-1],[width-37,height-37,-1,-1]]){
  ctx.beginPath();ctx.moveTo(x,y+a*dy);ctx.lineTo(x,y);ctx.lineTo(x+a*dx,y);ctx.stroke();
 }
 ctx.fillStyle=accent;ctx.fillRect(25,25,Math.min(200,width*.22),6);
 ctx.fillStyle='#e8bd7b';ctx.fillRect(width-25-Math.min(72,width*.08),25,Math.min(72,width*.08),6);
 ctx.strokeStyle='#ffffff12';ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(57,height-95);ctx.lineTo(width-57,height-95);ctx.stroke();
 ctx.restore();
}
Object.assign(exports,{broadcastAtmosphere,broadcastFrame});

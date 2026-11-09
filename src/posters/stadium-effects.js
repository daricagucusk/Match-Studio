/* Pure Canvas stadium treatments. No text, players, fixtures or external assets. */
function enhanceStadium(ctx,width,height,chosenAccent='#62D78D') {
 const accent=/^#[0-9a-fA-F]{6}$/.test(chosenAccent)?chosenAccent:'#62D78D';
 ctx.save();
 // High-level sports broadcast artwork: diagonally raked luminous LED strips.
 for (const side of [-1,1]) {
  const x=side<0?0:width;
  for(let i=0;i<4;i++){
   const startY=70+i*23;
   const edge=side<0?width*.34:width*.66;
   const fade=ctx.createLinearGradient(x,startY,edge,height*.58);
   fade.addColorStop(0,i%2?accent+'18':'#C8FFE41C');
   fade.addColorStop(.55,accent+'0A');
   fade.addColorStop(1,'#06130A00');
   ctx.fillStyle=fade;
   ctx.beginPath();
   ctx.moveTo(x,startY);ctx.lineTo(x,startY+15);
   ctx.lineTo(edge+side*115,height*.59);
   ctx.lineTo(edge+side*175,height*.57);
   ctx.closePath();ctx.fill();
  }
 }
 // Subtle concentric terraces, textured crowd behind all readable content.
 ctx.lineWidth=2;
 for(let j=0;j<9;j++){
  const yy=height*.12+j*22;
  ctx.strokeStyle=j%3===0?accent+'19':'#D7FFE90A';
  ctx.beginPath();ctx.moveTo(0,yy);
  ctx.quadraticCurveTo(width/2,yy+35,width,yy);
  ctx.stroke();
 }
 // Pitch-side neon underlight and angled corner flares.
 for(const [x,y,angle] of [[42,height*.67,-.24],[width-42,height*.69,.24]]) {
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  const gg=ctx.createRadialGradient(0,0,0,0,0,260);
  gg.addColorStop(0,accent+'2D');gg.addColorStop(.38,accent+'0E');gg.addColorStop(1,accent+'00');
  ctx.fillStyle=gg;ctx.fillRect(-260,-260,520,520);ctx.restore();
 }
 // Grass striations, confined to the peripheral lower background.
 for(let row=0;row<55;row++){
  const y=height*.77+row*height*.004;
  ctx.strokeStyle=row%4===0?accent+'16':'#9BDBAC08';
  ctx.lineWidth=row%4===0?1.5:.8;
  ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();
 }
 // Broadcast corners that stay outside all text boxes.
 ctx.lineWidth=4;ctx.strokeStyle=accent;
 for(const [x,y,sx,sy] of [[30,30,1,1],[width-30,30,-1,1],[30,height-30,1,-1],[width-30,height-30,-1,-1]]) {
  ctx.beginPath();ctx.moveTo(x+sx*52,y);ctx.lineTo(x,y);ctx.lineTo(x,y+sy*52);ctx.stroke();
 }
 ctx.restore();
}
Object.assign(exports,{enhanceStadium});

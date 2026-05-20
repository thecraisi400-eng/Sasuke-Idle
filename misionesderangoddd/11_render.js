// ═══════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════
function misionesderangod2Render(){
  const ctx=misionesderangod2Ctx;
  ctx.save();
  ctx.translate(misionesderangod2ShakeX,misionesderangod2ShakeY);
  if(misionesderangod2CritFlash>1){
    ctx.fillStyle='rgba(255,255,255,.9)';
    ctx.fillRect(-misionesderangod2ShakeX,-misionesderangod2ShakeY,misionesderangod2W,misionesderangod2H);
    ctx.restore(); return;
  }
  misionesderangod2DrawBG();
  for(const j of misionesderangod2Jutsus) j.draw(ctx);
  for(const f of misionesderangod2Fighters) f.draw(ctx);
  for(const p of misionesderangod2Particles) p.draw(ctx);
  for(const d of misionesderangod2DamageNums) d.draw(ctx);
  if(misionesderangod2GameOver && misionesderangod2SlowMo<1){
    ctx.save();
    ctx.fillStyle='rgba(255,220,0,.22)';
    ctx.font='bold 14px Arial Black';
    ctx.textAlign='center';
    ctx.fillText('K.O.',misionesderangod2W/2,28);
    ctx.restore();
  }
  ctx.restore();
}

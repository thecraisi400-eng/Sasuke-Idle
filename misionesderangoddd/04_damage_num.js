// ═══════════════════════════════════════════════════
//  DAMAGE NUMBER
// ═══════════════════════════════════════════════════
class misionesderangod2DamageNum {
  constructor(x,y,val,crit){
    this.x=x; this.y=y; this.val=Math.round(val);
    this.crit=crit;
    this.vx=(Math.random()-.5)*2.5;
    this.vy=-4.5;
    this.life=60; this.maxLife=60;
  }
  update(dt){ this.x+=this.vx*dt; this.vy+=.18*dt; this.y+=this.vy*dt; this.life-=dt; }
  isDead(){ return this.life<=0; }
  draw(ctx){
    const a=Math.max(0,this.life/this.maxLife);
    const sz=this.crit?15:11;
    ctx.save(); ctx.globalAlpha=a;
    ctx.font=`bold ${sz}px Arial Black`;
    ctx.textAlign='center';
    ctx.strokeStyle='#000'; ctx.lineWidth=3.5;
    ctx.strokeText(this.val,this.x,this.y);
    ctx.fillStyle=this.crit?'#FFE040':'#FF6644';
    ctx.fillText(this.val,this.x,this.y);
    if(this.crit){
      ctx.font='bold 7px Arial';
      ctx.fillStyle='#FFFACC';
      ctx.fillText('CRÍTICO!',this.x,this.y-13);
    }
    ctx.restore();
  }
}

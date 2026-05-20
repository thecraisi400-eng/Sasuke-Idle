// ═══════════════════════════════════════════════════
//  JUTSU PROJECTILE
// ═══════════════════════════════════════════════════
class misionesderangod2Jutsu {
  constructor(x,y,vx,vy,owner){
    this.x=x; this.y=y; this.vx=vx; this.vy=vy;
    this.owner=owner;
    this.color=owner.glowColor;
    this.size=9; this.life=200; this.dead=false;
    this.trail=[];
    this.id=Math.random();
  }
  update(dt){
    this.trail.unshift({x:this.x,y:this.y});
    if(this.trail.length>12) this.trail.pop();
    this.x+=this.vx*dt; this.y+=this.vy*dt;
    this.life-=dt;
    if(this.x<-12||this.x>misionesderangod2W+12||this.y<-12||this.y>misionesderangod2H+12||this.life<=0) this.dead=true;
    if(Math.random()<.35) misionesderangod2Particles.push(new misionesderangod2Particle(this.x,this.y,(Math.random()-.5)*1.5,(Math.random()-.5)*1.5,this.color,10,2,'spark'));
  }
  draw(ctx){
    for(let i=0;i<this.trail.length;i++){
      const t=this.trail[i];
      const r=this.size*(1-i/this.trail.length)*.9;
      if(r<=0) continue;
      ctx.save(); ctx.globalAlpha=(1-i/this.trail.length)*.55;
      ctx.fillStyle=this.color;
      ctx.beginPath(); ctx.arc(t.x,t.y,r,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size*2.2);
    g.addColorStop(0,'#FFFFFF');
    g.addColorStop(.35,this.color);
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.save(); ctx.globalAlpha=.92;
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(this.x,this.y,this.size*2.2,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

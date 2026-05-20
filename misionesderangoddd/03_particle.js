// ═══════════════════════════════════════════════════
//  PARTICLE
// ═══════════════════════════════════════════════════
class misionesderangod2Particle {
  constructor(x,y,vx,vy,color,life,size,type){
    this.x=x; this.y=y; this.vx=vx; this.vy=vy;
    this.color=color; this.life=life; this.maxLife=life;
    this.size=size; this.type=type;
    this.alpha=1;
    this.rot=Math.random()*Math.PI*2;
    this.rotS=(Math.random()-.5)*.15;
    this.grav=(type==='spark'||type==='dust')?misionesderangod2G*.45:0;
  }
  update(dt){
    this.x+=this.vx*dt; this.y+=this.vy*dt;
    this.vy+=this.grav*dt;
    if(this.type==='smoke'){this.vx*=.97;this.vy*=.97;this.size+=.35*dt;}
    if(this.type==='leaf'){
      this.vx=Math.sin(misionesderangod2FrameN*.025+this.x*.08)*.7;
      this.vy+=.025*dt;
      this.rot+=this.rotS*dt;
    }
    this.life-=dt;
    this.alpha=Math.max(0,this.life/this.maxLife);
  }
  draw(ctx){
    if(this.alpha<=0||this.size<=0) return;
    ctx.save(); ctx.globalAlpha=this.alpha;
    ctx.fillStyle=this.color;
    if(this.type==='leaf'){
      ctx.translate(this.x,this.y); ctx.rotate(this.rot);
      ctx.fillRect(-this.size,-this.size*.4,this.size*2,this.size*.8);
    } else {
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }
  isDead(){ return this.life<=0||(this.type==='smoke'&&this.size>45); }
}

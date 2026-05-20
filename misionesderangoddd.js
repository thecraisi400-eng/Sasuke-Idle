// ═══════════════════════════════════════════════════
//  misionesderangosdd.js — SHINOBI EVOLUTION Combat Engine
//  Todos los nombres globales usan prefijo "misionesderangod2"
//  para evitar conflictos con otros scripts del juego.
// ═══════════════════════════════════════════════════

(function() {

// ─── Inyectar estilos ────────────────────────────
const misionesderangod2Style = document.createElement('style');
misionesderangod2Style.id = 'misionesderangod2-battle-style';
misionesderangod2Style.textContent = `
* { margin:0; padding:0; box-sizing:border-box; }
body {
  background: #050308;
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; overflow: hidden;
  font-family: 'Arial Black', Impact, sans-serif;
}
#misionesderangod2Wrapper {
  position: relative; width: 100%; height: 100%;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255,120,0,0.25),
    0 0 30px rgba(255,80,0,0.3),
    0 0 80px rgba(120,0,255,0.15);
}
#misionesderangod2Wrapper canvas { position:absolute; top:0; left:0; display:block; }
#misionesderangod2Veil {
  position: absolute; top:0; left:0; width:100%; height:100%;
  pointer-events: none; z-index: 8;
  background: rgba(0,0,0,0);
  transition: background 0.2s ease;
}
#misionesderangod2WinnerScreen {
  position: absolute; top:0; left:0; width:100%; height:100%;
  display: none; flex-direction: column;
  justify-content: center; align-items: center;
  z-index: 20;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%);
}
#misionesderangod2WinBanner {
  border-top: 1px solid rgba(255,200,0,0.4);
  border-bottom: 1px solid rgba(255,200,0,0.4);
  padding: 12px 40px;
  text-align: center;
  animation: misionesderangod2WinPulse 0.8s ease-in-out infinite alternate;
}
#misionesderangod2WinLabel { font-size: 10px; letter-spacing: 6px; color: #AA8800; margin-bottom: 4px; }
#misionesderangod2WinName {
  font-size: 42px; font-weight: 900; letter-spacing: 5px;
  text-transform: uppercase;
  -webkit-text-stroke: 1px rgba(255,200,0,0.5);
}
#misionesderangod2WinSub { font-size: 11px; letter-spacing: 4px; color: #888; margin-top: 6px; }
#misionesderangod2BtnRestart {
  margin-top: 22px; padding: 9px 28px;
  background: transparent;
  border: 1px solid rgba(255,180,0,0.5);
  color: #FFD700; font-size: 11px; letter-spacing: 3px;
  cursor: pointer; text-transform: uppercase;
  transition: all 0.2s;
}
#misionesderangod2BtnRestart:hover {
  background: rgba(255,180,0,0.15);
  border-color: rgba(255,180,0,0.9);
}
@keyframes misionesderangod2WinPulse {
  from { filter: drop-shadow(0 0 8px rgba(255,200,0,0.3)); }
  to   { filter: drop-shadow(0 0 25px rgba(255,200,0,0.7)); }
}
`;
if (!document.getElementById('misionesderangod2-battle-style')) {
  document.head.appendChild(misionesderangod2Style);
}

// ─── Inyectar HTML ───────────────────────────────
const misionesderangod2Container = document.createElement('div');
misionesderangod2Container.id = 'misionesderangod2Wrapper';
misionesderangod2Container.innerHTML = `
  <canvas id="misionesderangod2Canvas" width="460" height="360" style="z-index:2;"></canvas>
  <div id="misionesderangod2Veil"></div>
  <div id="misionesderangod2WinnerScreen">
    <div id="misionesderangod2WinBanner">
      <div id="misionesderangod2WinLabel">VENCEDOR</div>
      <div id="misionesderangod2WinName" style="color:#FFD700;">UZUMAKI</div>
      <div id="misionesderangod2WinSub">&#9733; &nbsp; VICTORIA &nbsp; &#9733;</div>
    </div>
    <button id="misionesderangod2BtnRestart">&#9654; &nbsp; NUEVA BATALLA</button>
  </div>
`;

// ═══════════════════════════════════════════════════
//  CONSTANTES
// ═══════════════════════════════════════════════════
const misionesderangod2W = 460, misionesderangod2H = 360;
const misionesderangod2GROUND = misionesderangod2H - 50;
const misionesderangod2G = 0.44;
const misionesderangod2SC = 0.70;
const misionesderangod2NW = Math.round(30 * misionesderangod2SC);
const misionesderangod2NH = Math.round(50 * misionesderangod2SC);

let misionesderangod2Canvas;
let misionesderangod2Ctx;
let misionesderangod2Veil;
let misionesderangod2WinScreen;
let misionesderangod2WinName;

// ─── Estado global ───────────────────────────────
let misionesderangod2Particles  = [];
let misionesderangod2DamageNums = [];
let misionesderangod2Jutsus     = [];
let misionesderangod2Fighters   = [];
let misionesderangod2HitStop    = 0;
let misionesderangod2SlowMo     = 1;
let misionesderangod2FrameN     = 0;
let misionesderangod2GameOver   = false;

let misionesderangod2ShakeX=0, misionesderangod2ShakeY=0, misionesderangod2ShakeDur=0, misionesderangod2ShakeAmp=0;
let misionesderangod2CritFlash  = 0;
let misionesderangod2JutsuVeil  = 0;

let misionesderangod2BgMountains, misionesderangod2BgTrees, misionesderangod2BgStars;

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

// ═══════════════════════════════════════════════════
//  FIGHTER
// ═══════════════════════════════════════════════════
class misionesderangod2Fighter {
  constructor(x,id){
    this.id=id; this.x=x; this.y=misionesderangod2GROUND-misionesderangod2NH;
    this.vx=0; this.vy=0;
    this.onGround=true; this.facingRight=(id===0);
    this.name  = id===0 ? 'UZUMAKI' : 'UCHIHA';
    this.color = id===0 ? '#E8A030' : '#6855CC';
    this.glowColor = id===0 ? '#FF8C00' : '#9932CC';
    this.skinColor = id===0 ? '#F5C09A' : '#D8C8E8';
    this.hp=100; this.maxHp=100;
    this.dashTimer=0; this.dashInterval=800;
    this.tX=x; this.tY=misionesderangod2GROUND-misionesderangod2NH;
    this.atkCD=0; this.jutsuCD=0;
    this.shieldTime=0;
    this.shieldBroken=false;
    this.shieldBreakTimer=0;
    this.dmgBurst=0; this.dmgBurstTimer=0;
    this.defBreak=false; this.defBreakTimer=0;
    this.stunTimer=0;
    this.invincible=false; this.invTimer=0;
    this.flashTimer=0;
    this.animF=0; this.animT=0;
    this.trail=[];
    this.isDead=false; this.deathT=0; this.deathSmoke=0;
    this.winnerFlag=false;
  }

  get cx(){ return this.x+misionesderangod2NW/2; }
  get cy(){ return this.y+misionesderangod2NH/2; }

  receiveHit(rawDmg, fromX, attacker){
    if(this.isDead||this.invincible) return;
    if(Math.random()<.15 && this.stunTimer<=0){
      this.doKawarimi(attacker); return;
    }
    let dmg=rawDmg; let shielded=false;
    const canShield=!this.shieldBroken && !this.defBreak && this.shieldTime<2000;
    if(canShield && Math.random()<.30){
      dmg=rawDmg*.30; shielded=true;
      this.shieldTime+=500;
      misionesderangod2SpawnSparks(this.cx,this.cy,6,'#88CCFF');
      if(this.shieldTime>=2000){
        this.shieldBroken=true; this.shieldBreakTimer=90;
        this.shieldTime=0; this.stunTimer=35;
        misionesderangod2SpawnSparks(this.cx,this.cy,12,'#44AAFF');
      }
    }
    this.dmgBurst+=rawDmg;
    if(this.dmgBurst>=this.maxHp*.15){
      this.defBreak=true; this.defBreakTimer=90;
      this.dmgBurst=0;
      for(let i=0;i<8;i++) misionesderangod2Particles.push(new misionesderangod2Particle(this.cx,this.cy-misionesderangod2NH*.5,(Math.random()-.5)*4,-3-Math.random()*2,'#FF0000',28,3,'spark'));
    }
    this.hp=Math.max(0,this.hp-dmg);
    const isCrit=rawDmg>=14;
    misionesderangod2DamageNums.push(new misionesderangod2DamageNum(this.cx+(Math.random()-.5)*8,this.y-5,dmg,isCrit));
    const dir=(fromX<this.cx)?1:-1;
    const clr=isCrit?'#FFD700':'#FF4422';
    for(let i=0;i<(isCrit?16:9);i++){
      const ang=(Math.random()-.5)*Math.PI*.85+(dir>0?0:Math.PI);
      const spd=2+Math.random()*5;
      misionesderangod2Particles.push(new misionesderangod2Particle(this.cx,this.cy,Math.cos(ang)*spd,Math.sin(ang)*spd-1,clr,18+Math.random()*10,2+Math.random()*2,'spark'));
    }
    this.vx+=dir*11;
    this.flashTimer=18; this.stunTimer=22;
    misionesderangod2HitStop=3;
    misionesderangod2TriggerShake(isCrit?6:2, isCrit?20:9);
    if(isCrit) misionesderangod2CritFlash=2;
    if(this.hp<=0 && !this.isDead) this.die();
  }

  doKawarimi(attacker){
    const behind = attacker.facingRight
      ? attacker.x-misionesderangod2NW-28
      : attacker.x+misionesderangod2NW+28;
    const nx=Math.max(5,Math.min(misionesderangod2W-misionesderangod2NW-5,behind));
    misionesderangod2SpawnSmoke(this.cx,this.cy,18);
    this.x=nx; this.y=misionesderangod2GROUND-misionesderangod2NH;
    this.vx=0; this.vy=0; this.onGround=true;
    this.invincible=true; this.invTimer=35;
    misionesderangod2SpawnSmoke(this.cx,this.cy,12);
    misionesderangod2TriggerShake(2,6);
  }

  launchJutsu(target){
    if(this.jutsuCD>0) return;
    this.jutsuCD=90;
    const dx=target.cx-this.cx, dy=target.cy-this.cy;
    const d=Math.sqrt(dx*dx+dy*dy);
    const spd=5;
    misionesderangod2Jutsus.push(new misionesderangod2Jutsu(this.cx,this.cy,(dx/d)*spd,(dy/d)*spd,this));
    misionesderangod2SpawnSparks(this.cx,this.cy,14,this.glowColor);
    misionesderangod2JutsuVeil=30;
    misionesderangod2Veil.style.background='rgba(0,0,0,0.22)';
    misionesderangod2TriggerShake(6,14);
    this.flashTimer=8;
  }

  die(){
    this.isDead=true; misionesderangod2SlowMo=0.16; misionesderangod2GameOver=true;
    const winner=misionesderangod2Fighters.find(f=>!f.isDead);
    setTimeout(()=>misionesderangod2ShowWinner(winner?winner.name:'???'),2600);
  }

  update(dt, dms, enemy){
    if(this.isDead){
      this.deathT+=dt;
      this.deathSmoke=Math.min(1,this.deathT*.09);
      if(this.deathT%6<1) misionesderangod2SpawnSmoke(this.cx+(Math.random()-.5)*misionesderangod2NW,this.cy+(Math.random()-.5)*misionesderangod2NH,3);
      return;
    }
    if(misionesderangod2HitStop>0) return;
    if(this.flashTimer>0) this.flashTimer-=dt;
    if(this.stunTimer>0) this.stunTimer-=dt;
    if(this.atkCD>0) this.atkCD-=dt;
    if(this.jutsuCD>0) this.jutsuCD-=dt;
    if(this.invTimer>0){ this.invTimer-=dt; if(this.invTimer<=0) this.invincible=false; }
    if(this.defBreakTimer>0){ this.defBreakTimer-=dt; if(this.defBreakTimer<=0) this.defBreak=false; }
    if(this.shieldBreakTimer>0){ this.shieldBreakTimer-=dt; if(this.shieldBreakTimer<=0) this.shieldBroken=false; }
    if(this.shieldTime>0) this.shieldTime=Math.max(0,this.shieldTime-dms);
    this.dmgBurstTimer+=dms;
    if(this.dmgBurstTimer>=2000){ this.dmgBurstTimer=0; this.dmgBurst=0; }
    if(!this.onGround) this.vy+=misionesderangod2G*dt;
    this.x+=this.vx*dt; this.y+=this.vy*dt;
    this.vx*=.87;
    if(this.y>=misionesderangod2GROUND-misionesderangod2NH){ this.y=misionesderangod2GROUND-misionesderangod2NH; this.vy=0; this.onGround=true; }
    else this.onGround=false;
    if(this.y<4){ this.y=4; this.vy=0; }
    if(this.x<=3){ this.x=3; this.vx=4.5; if(this.onGround){this.vy=-9;this.onGround=false;} }
    if(this.x>=misionesderangod2W-misionesderangod2NW-3){ this.x=misionesderangod2W-misionesderangod2NW-3; this.vx=-4.5; if(this.onGround){this.vy=-9;this.onGround=false;} }
    this.facingRight=enemy.cx>this.cx;
    if(this.stunTimer>0) return;
    this.dashTimer+=dms;
    if(this.dashTimer>=this.dashInterval){
      this.dashTimer=0;
      const aerial=Math.random()<.38;
      this.tX=22+Math.random()*(misionesderangod2W-44-misionesderangod2NW);
      this.tY=aerial ? misionesderangod2GROUND-misionesderangod2NH-55-Math.random()*130 : misionesderangod2GROUND-misionesderangod2NH;
    }
    const tdx=this.tX-this.x, tdy=this.tY-this.y;
    const tLen=Math.sqrt(tdx*tdx+tdy*tdy);
    if(tLen>8){
      this.vx+=(tdx/tLen)*5*.26;
      if(tdy<-22 && this.onGround){ this.vy=-11; this.onGround=false; }
    }
    this.animT+=dt;
    if(this.animT>3){ this.animT=0; this.animF=(this.animF+1)%4;
      const spd=Math.abs(this.vx)+Math.abs(this.vy);
      if(spd>3.5){ this.trail.unshift({x:this.cx,y:this.cy,a:.5}); if(this.trail.length>6) this.trail.pop(); }
    }
    for(let t of this.trail) t.a-=.04*dt;
    this.trail=this.trail.filter(t=>t.a>0);
    if(!enemy.isDead){
      const dist=Math.hypot(this.cx-enemy.cx,this.cy-enemy.cy);
      if(dist<50 && this.atkCD<=0){
        const dmg=8+Math.random()*7;
        enemy.receiveHit(dmg,this.cx,this);
        this.atkCD=42;
      } else if(dist>150 && this.jutsuCD<=0){
        this.launchJutsu(enemy);
      }
    }
  }

  draw(ctx){
    for(const t of this.trail){
      ctx.save(); ctx.globalAlpha=t.a*.45;
      ctx.fillStyle=this.glowColor;
      ctx.beginPath(); ctx.ellipse(t.x,t.y,misionesderangod2NW*.38,misionesderangod2NH*.38,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    const deadAlpha=this.isDead ? Math.max(0,1-this.deathSmoke) : 1;
    if(deadAlpha<=0) return;
    const flashOn=this.flashTimer>0 && Math.sin(this.flashTimer*1.6)>0;
    const bC=flashOn?'#FF3333':this.color;
    const sC=flashOn?'#FF8866':this.skinColor;
    ctx.save();
    ctx.globalAlpha=deadAlpha;
    if(!this.facingRight){
      ctx.translate(this.x+misionesderangod2NW/2,0); ctx.scale(-1,1); ctx.translate(-(this.x+misionesderangod2NW/2),0);
    }
    const x=this.x, y=this.y;
    const lA=Math.sin(this.animF*Math.PI/2)*3;
    const jumping=!this.onGround;
    const sAlpha=Math.max(0,.4-(misionesderangod2GROUND-misionesderangod2NH-this.y)*.006);
    ctx.globalAlpha=deadAlpha*sAlpha;
    ctx.fillStyle='rgba(0,0,0,.5)';
    ctx.beginPath(); ctx.ellipse(x+misionesderangod2NW/2,misionesderangod2GROUND-1,misionesderangod2NW*.7,4,0,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=deadAlpha;
    ctx.fillStyle='#222';
    ctx.fillRect(x+1,    y+misionesderangod2NH-5, misionesderangod2NW*.42, 5);
    ctx.fillRect(x+misionesderangod2NW*.55,y+misionesderangod2NH-5, misionesderangod2NW*.42, 5);
    ctx.fillStyle=bC;
    ctx.fillRect(x+2,     y+misionesderangod2NH*.62, misionesderangod2NW*.4, misionesderangod2NH*.36+(jumping?-lA:lA));
    ctx.fillRect(x+misionesderangod2NW*.55,y+misionesderangod2NH*.62, misionesderangod2NW*.4, misionesderangod2NH*.36+(jumping?lA:-lA));
    ctx.fillStyle='#333'; ctx.fillRect(x+1,y+misionesderangod2NH*.60,misionesderangod2NW-2,3);
    ctx.fillStyle=bC; ctx.fillRect(x+2,y+misionesderangod2NH*.30,misionesderangod2NW-4,misionesderangod2NH*.32);
    if(this.id===0){
      ctx.fillStyle='#CC5500'; ctx.fillRect(x+misionesderangod2NW*.32,y+misionesderangod2NH*.28,misionesderangod2NW*.36,misionesderangod2NH*.12);
    } else {
      ctx.fillStyle='#3322AA'; ctx.fillRect(x+misionesderangod2NW*.32,y+misionesderangod2NH*.28,misionesderangod2NW*.36,misionesderangod2NH*.12);
    }
    const aS=Math.cos(this.animF*Math.PI/2)*2;
    ctx.fillStyle=bC;
    ctx.fillRect(x-4, y+misionesderangod2NH*.32+aS, 5, misionesderangod2NH*.25);
    ctx.fillRect(x+misionesderangod2NW-1,y+misionesderangod2NH*.32-aS, 5, misionesderangod2NH*.25);
    ctx.fillStyle='#5A4030';
    ctx.fillRect(x-4,    y+misionesderangod2NH*.50+aS, 5, misionesderangod2NH*.09);
    ctx.fillRect(x+misionesderangod2NW-1, y+misionesderangod2NH*.50-aS, 5, misionesderangod2NH*.09);
    ctx.fillStyle=sC;
    ctx.fillRect(x+misionesderangod2NW*.36,y+misionesderangod2NH*.27,misionesderangod2NW*.28,misionesderangod2NH*.06);
    const hR=misionesderangod2NW*.40;
    ctx.fillStyle=sC;
    ctx.beginPath(); ctx.arc(x+misionesderangod2NW/2,y+misionesderangod2NH*.155,hR,0,Math.PI*2); ctx.fill();
    if(this.id===0){
      ctx.fillStyle='#FFD020';
      ctx.beginPath(); ctx.arc(x+misionesderangod2NW/2,y+misionesderangod2NH*.10,hR,Math.PI,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FFD020';
      const spikes=[[-.4,-7],[-.1,-9],[.2,-8],[.5,-6]];
      for(const[ox,oy] of spikes){
        ctx.beginPath();
        ctx.moveTo(x+misionesderangod2NW*.25+ox*misionesderangod2NW*.5,y+misionesderangod2NH*.08);
        ctx.lineTo(x+misionesderangod2NW*.5+ox*misionesderangod2NW*.3, y+misionesderangod2NH*.05+oy);
        ctx.lineTo(x+misionesderangod2NW*.65+ox*misionesderangod2NW*.3,y+misionesderangod2NH*.09);
        ctx.closePath(); ctx.fill();
      }
    } else {
      ctx.fillStyle='#111118';
      ctx.beginPath(); ctx.arc(x+misionesderangod2NW/2,y+misionesderangod2NH*.10,hR,Math.PI,Math.PI*2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x+misionesderangod2NW*.15,y+misionesderangod2NH*.07);
      ctx.quadraticCurveTo(x+misionesderangod2NW*.75,y-6,x+misionesderangod2NW*.92,y+misionesderangod2NH*.12);
      ctx.lineTo(x+misionesderangod2NW/2,y+misionesderangod2NH*.07);
      ctx.closePath(); ctx.fill();
    }
    const hbCol=this.stunTimer>0||this.shieldBroken?'#CC2222':(this.id===0?'#FF6600':'#2233AA');
    ctx.fillStyle=hbCol;
    ctx.fillRect(x+misionesderangod2NW*.10,y+misionesderangod2NH*.07,misionesderangod2NW*.80,4);
    ctx.fillStyle='#C8C8C8';
    ctx.fillRect(x+misionesderangod2NW*.28,y+misionesderangod2NH*.07,misionesderangod2NW*.44,4);
    ctx.strokeStyle='#888'; ctx.lineWidth=.6;
    ctx.strokeRect(x+misionesderangod2NW*.28,y+misionesderangod2NH*.07,misionesderangod2NW*.44,4);
    ctx.strokeStyle='#999'; ctx.lineWidth=.5;
    ctx.beginPath(); ctx.moveTo(x+misionesderangod2NW*.35,y+misionesderangod2NH*.09); ctx.lineTo(x+misionesderangod2NW*.65,y+misionesderangod2NH*.09); ctx.stroke();
    ctx.fillStyle='#111';
    ctx.beginPath(); ctx.arc(x+misionesderangod2NW*.62,y+misionesderangod2NH*.155,2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#FFF';
    ctx.beginPath(); ctx.arc(x+misionesderangod2NW*.635,y+misionesderangod2NH*.150,.85,0,Math.PI*2); ctx.fill();
    if(this.id===1 && this.jutsuCD<25){
      ctx.strokeStyle='rgba(220,0,0,.8)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(x+misionesderangod2NW*.62,y+misionesderangod2NH*.155,2.3,0,Math.PI*2); ctx.stroke();
    }
    if(this.id===0){
      ctx.strokeStyle='#C07848'; ctx.lineWidth=.8;
      for(let j=0;j<3;j++){
        ctx.beginPath(); ctx.moveTo(x+misionesderangod2NW*.54,y+misionesderangod2NH*.155+j*2.4); ctx.lineTo(x+misionesderangod2NW*.76,y+misionesderangod2NH*.145+j*2.4-1); ctx.stroke();
      }
    }
    if(this.stunTimer>8){
      for(let i=0;i<3;i++){
        const ang=misionesderangod2FrameN*.1+i*Math.PI*2/3;
        const sx=x+misionesderangod2NW/2+Math.cos(ang)*(misionesderangod2NW*.55+2);
        const sy=y-4+Math.sin(ang)*4;
        ctx.fillStyle='#FFD700'; ctx.font='8px Arial'; ctx.textAlign='center';
        ctx.fillText('★',sx,sy);
      }
    }
    ctx.restore();
    this.drawHPBar(ctx, deadAlpha);
  }

  drawHPBar(ctx, alpha=1){
    const bW=30, bH=4;
    const bx=this.x+misionesderangod2NW/2-bW/2;
    const by=this.y-12;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle='rgba(0,0,0,.75)';
    ctx.fillRect(bx-1,by-1,bW+2,bH+2);
    const r=this.hp/this.maxHp;
    ctx.fillStyle=r>.5?'#44EE44':r>.25?'#FFAA00':'#FF2222';
    ctx.fillRect(bx,by,bW*r,bH);
    ctx.font='bold 7px Arial';
    ctx.textAlign='center';
    ctx.fillStyle=this.isDead?'#666':(this.id===0?'#FFD700':'#AA88FF');
    ctx.fillText(this.name,this.x+misionesderangod2NW/2,by-3);
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════
function misionesderangod2TriggerShake(amp,dur){
  misionesderangod2ShakeAmp=Math.max(misionesderangod2ShakeAmp,amp);
  misionesderangod2ShakeDur=Math.max(misionesderangod2ShakeDur,dur);
}

function misionesderangod2SpawnSparks(x,y,n,color){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2, spd=1.5+Math.random()*3.5;
    misionesderangod2Particles.push(new misionesderangod2Particle(x,y,Math.cos(a)*spd,Math.sin(a)*spd,color,18+Math.random()*10,2+Math.random()*1.5,'spark'));
  }
}

function misionesderangod2SpawnSmoke(x,y,count){
  const layers=[['#FFFFFF',.8],['#BBBBBB',.5],['#777777',.35]];
  for(let i=0;i<count;i++){
    const [col,spd]=layers[i%3];
    misionesderangod2Particles.push(new misionesderangod2Particle(
      x+(Math.random()-.5)*misionesderangod2NW,
      y+(Math.random()-.5)*misionesderangod2NH,
      (Math.random()-.5)*spd*2,
      -spd-.5-Math.random(),
      col,
      32+Math.random()*20,
      4+Math.random()*4+(i%3)*1.5,
      'smoke'
    ));
  }
}

function misionesderangod2ShowWinner(name){
  misionesderangod2WinName.textContent=name;
  misionesderangod2WinName.style.color=name==='UZUMAKI'?'#FFD700':'#CC88FF';
  misionesderangod2WinScreen.style.display='flex';
}

// ─── Generación de fondo ─────────────────────────
function misionesderangod2GenBG(){
  misionesderangod2BgMountains=[];
  for(let x=0;x<=misionesderangod2W;x+=12){
    misionesderangod2BgMountains.push({
      x,
      y: 60+Math.sin(x*.012)*80+Math.sin(x*.038)*40+Math.cos(x*.022+0.8)*30+Math.sin(x*.007)*25,
      layer:0
    });
  }
  for(let x=0;x<=misionesderangod2W;x+=12){
    misionesderangod2BgMountains.push({
      x,
      y: 90+Math.sin(x*.016+1.2)*65+Math.sin(x*.044+0.5)*30+Math.cos(x*.028+2.1)*22,
      layer:1
    });
  }
  misionesderangod2BgTrees=[];
  for(let i=0;i<8;i++){
    const bx=15+i*(misionesderangod2W/8)+Math.random()*30-15;
    const bh=70+Math.random()*50;
    const bw=22+Math.random()*16;
    misionesderangod2BgTrees.push({x:bx, h:bh, w:bw, layer:0, trunkW:4+Math.random()*3});
  }
  const frontPositions=[18,55,380,420];
  for(let i=0;i<frontPositions.length;i++){
    const bh=110+Math.random()*60;
    const bw=34+Math.random()*20;
    misionesderangod2BgTrees.push({x:frontPositions[i], h:bh, w:bw, layer:1, trunkW:7+Math.random()*5});
  }
  for(let i=0;i<6;i++){
    const bx=40+Math.random()*(misionesderangod2W-80);
    const bh=80+Math.random()*45;
    const bw=26+Math.random()*18;
    misionesderangod2BgTrees.push({x:bx, h:bh, w:bw, layer:0.5, trunkW:5+Math.random()*4});
  }
  misionesderangod2BgStars=[];
  for(let i=0;i<50;i++){
    misionesderangod2BgStars.push({x:(i*97+13)%misionesderangod2W, y:(i*53+7)%(misionesderangod2H*.52), s:(Math.random()<.1)?1.5:1, ph:Math.random()*Math.PI*2});
  }
}

function misionesderangod2DrawBG(){
  const ctx=misionesderangod2Ctx;
  const W=misionesderangod2W, H=misionesderangod2H, GROUND=misionesderangod2GROUND;
  const sky=ctx.createLinearGradient(0,0,0,H*.65);
  sky.addColorStop(0,'#3A7FBF');
  sky.addColorStop(0.35,'#5AABDE');
  sky.addColorStop(0.7,'#82C8E8');
  sky.addColorStop(1,'#B8DFF0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
  ctx.save();
  ctx.globalAlpha=0.55;
  ctx.fillStyle='#FFFFFF';
  const clouds=[
    {x:40,  y:28, rx:38, ry:14},
    {x:150, y:18, rx:52, ry:16},
    {x:290, y:32, rx:44, ry:13},
    {x:400, y:22, rx:36, ry:12},
  ];
  for(const c of clouds){
    ctx.beginPath(); ctx.ellipse(c.x,c.y,c.rx,c.ry,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x-c.rx*.35,c.y+c.ry*.4,c.rx*.55,c.ry*.7,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x+c.rx*.35,c.y+c.ry*.35,c.rx*.50,c.ry*.65,0,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
  ctx.save();
  const sunX=68, sunY=42;
  const sunHalo=ctx.createRadialGradient(sunX,sunY,12,sunX,sunY,38);
  sunHalo.addColorStop(0,'rgba(255,240,150,0.35)');
  sunHalo.addColorStop(1,'rgba(255,240,150,0)');
  ctx.fillStyle=sunHalo;
  ctx.beginPath(); ctx.arc(sunX,sunY,38,0,Math.PI*2); ctx.fill();
  ctx.shadowColor='#FFE060'; ctx.shadowBlur=22;
  ctx.fillStyle='#FFEE80';
  ctx.beginPath(); ctx.arc(sunX,sunY,14,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  ctx.restore();
  const mts0=misionesderangod2BgMountains.filter(p=>p.layer===0);
  ctx.fillStyle='#6B8FA8';
  ctx.beginPath(); ctx.moveTo(0,H);
  for(const p of mts0) ctx.lineTo(p.x,p.y);
  ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.55)';
  ctx.beginPath();
  let snowStarted=false;
  for(let i=0;i<mts0.length;i++){
    const p=mts0[i];
    if(p.y<90){
      if(!snowStarted){ ctx.moveTo(p.x,p.y); snowStarted=true; }
      else ctx.lineTo(p.x,p.y);
    } else if(snowStarted){
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); snowStarted=false;
    }
  }
  if(snowStarted){ ctx.closePath(); ctx.fill(); }
  const mts1=misionesderangod2BgMountains.filter(p=>p.layer===1);
  ctx.fillStyle='#4A7040';
  ctx.beginPath(); ctx.moveTo(0,H);
  for(const p of mts1) ctx.lineTo(p.x,p.y);
  ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(20,40,10,0.22)';
  ctx.beginPath(); ctx.moveTo(0,H);
  for(const p of mts1) ctx.lineTo(p.x+8,p.y+12);
  ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
  for(const t of misionesderangod2BgTrees.filter(t=>t.layer<=0.5).sort((a,b)=>a.layer-b.layer)){
    misionesderangod2DrawTree(t, t.layer===0 ? 0.52 : 0.72);
  }
  const groundGrad=ctx.createLinearGradient(0,GROUND-2,0,H);
  groundGrad.addColorStop(0,'#5A3A1A');
  groundGrad.addColorStop(0.08,'#4A2E10');
  groundGrad.addColorStop(0.3,'#3A2208');
  groundGrad.addColorStop(1,'#1E1004');
  ctx.fillStyle=groundGrad; ctx.fillRect(0,GROUND-2,W,H-GROUND+2);
  const grassGrad=ctx.createLinearGradient(0,GROUND-8,0,GROUND+6);
  grassGrad.addColorStop(0,'#4A7020');
  grassGrad.addColorStop(0.4,'#3A5818');
  grassGrad.addColorStop(1,'#2A3E0E');
  ctx.fillStyle=grassGrad; ctx.fillRect(0,GROUND-6,W,10);
  const dirtPatches=[
    {x:20,  y:GROUND+8,  rx:28, ry:5,  col:'rgba(80,50,20,0.4)'},
    {x:100, y:GROUND+14, rx:22, ry:4,  col:'rgba(60,35,10,0.35)'},
    {x:185, y:GROUND+10, rx:35, ry:6,  col:'rgba(90,55,22,0.3)'},
    {x:280, y:GROUND+16, rx:25, ry:5,  col:'rgba(55,30,8,0.38)'},
    {x:360, y:GROUND+9,  rx:30, ry:5,  col:'rgba(75,45,18,0.32)'},
    {x:435, y:GROUND+13, rx:20, ry:4,  col:'rgba(65,40,12,0.36)'},
  ];
  for(const p of dirtPatches){
    ctx.fillStyle=p.col;
    ctx.beginPath(); ctx.ellipse(p.x,p.y,p.rx,p.ry,0,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#2E1E0A';
  const rocks=[
    {x:50,  y:GROUND+5, rx:10, ry:3.5},
    {x:130, y:GROUND+7, rx:7,  ry:2.8},
    {x:200, y:GROUND+4, rx:13, ry:4  },
    {x:275, y:GROUND+6, rx:9,  ry:3  },
    {x:345, y:GROUND+5, rx:11, ry:3.5},
    {x:415, y:GROUND+7, rx:8,  ry:3  },
  ];
  for(const r of rocks){
    ctx.beginPath(); ctx.ellipse(r.x,r.y,r.rx,r.ry,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(80,55,25,0.5)';
    ctx.beginPath(); ctx.ellipse(r.x-2,r.y-1,r.rx*.6,r.ry*.5,-.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#2E1E0A';
  }
  ctx.strokeStyle='#3A6018';
  ctx.lineWidth=1.2;
  const grassBlades=[30,72,115,158,210,252,298,335,378,420,448];
  for(const gx of grassBlades){
    for(let k=0;k<3;k++){
      const ox=(k-1)*4+Math.sin(gx+k)*2;
      const gh=4+Math.sin(gx*k)*2;
      ctx.beginPath();
      ctx.moveTo(gx+ox, GROUND-4);
      ctx.quadraticCurveTo(gx+ox+Math.sin(gx*.1+k)*3, GROUND-4-gh, gx+ox+1, GROUND-4-gh-2);
      ctx.stroke();
    }
  }
  const mist=ctx.createLinearGradient(0,GROUND-12,0,GROUND+8);
  mist.addColorStop(0,'rgba(180,220,140,0)');
  mist.addColorStop(1,'rgba(80,120,40,0.18)');
  ctx.fillStyle=mist; ctx.fillRect(0,GROUND-12,W,20);
  for(const t of misionesderangod2BgTrees.filter(t=>t.layer===1)){
    misionesderangod2DrawTree(t, 0.88);
  }
}

function misionesderangod2DrawTree(t, alpha){
  const ctx=misionesderangod2Ctx;
  const GROUND=misionesderangod2GROUND;
  ctx.save();
  ctx.globalAlpha=alpha;
  const baseY=GROUND-2;
  const trunkH=t.h*.45;
  const trunkX=t.x-t.trunkW/2;
  ctx.globalAlpha=alpha*.25;
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.beginPath(); ctx.ellipse(t.x+6, baseY+3, t.w*.55, 4, 0.15, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha=alpha;
  const trunkGrad=ctx.createLinearGradient(trunkX,0,trunkX+t.trunkW,0);
  trunkGrad.addColorStop(0,'#2A1A08');
  trunkGrad.addColorStop(0.35,'#4A2E10');
  trunkGrad.addColorStop(0.65,'#3A2208');
  trunkGrad.addColorStop(1,'#1E1004');
  ctx.fillStyle=trunkGrad;
  ctx.beginPath();
  ctx.moveTo(trunkX - t.trunkW*.15, baseY);
  ctx.lineTo(trunkX + t.trunkW + t.trunkW*.15, baseY);
  ctx.lineTo(trunkX + t.trunkW, baseY-trunkH);
  ctx.lineTo(trunkX, baseY-trunkH);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.2)';
  ctx.lineWidth=0.6;
  for(let k=1;k<3;k++){
    const lx=trunkX+t.trunkW*(k/3);
    ctx.beginPath();
    ctx.moveTo(lx, baseY-trunkH*.1);
    ctx.lineTo(lx+Math.sin(k)*1.5, baseY-trunkH*.85);
    ctx.stroke();
  }
  const topY=baseY-trunkH;
  ctx.fillStyle='#1A3A0A';
  ctx.beginPath(); ctx.arc(t.x+t.w*.12, topY-t.h*.18, t.w*.48, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(t.x-t.w*.15, topY-t.h*.12, t.w*.42, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#2A5A10';
  ctx.beginPath(); ctx.arc(t.x, topY-t.h*.30, t.w*.52, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(t.x+t.w*.22, topY-t.h*.22, t.w*.44, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(t.x-t.w*.22, topY-t.h*.20, t.w*.45, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#3A7018';
  ctx.beginPath(); ctx.arc(t.x, topY-t.h*.42, t.w*.46, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(t.x+t.w*.18, topY-t.h*.36, t.w*.38, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(t.x-t.w*.18, topY-t.h*.32, t.w*.40, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#4A8820';
  ctx.beginPath(); ctx.arc(t.x-t.w*.05, topY-t.h*.54, t.w*.32, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(200,255,100,0.12)';
  ctx.beginPath(); ctx.arc(t.x-t.w*.12, topY-t.h*.50, t.w*.22, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════
//  JUTSU CLASH
// ═══════════════════════════════════════════════════
function misionesderangod2CheckJutsuClash(){
  for(let i=0;i<misionesderangod2Jutsus.length;i++){
    for(let j=i+1;j<misionesderangod2Jutsus.length;j++){
      const a=misionesderangod2Jutsus[i], b=misionesderangod2Jutsus[j];
      if(a.owner===b.owner||a.dead||b.dead) continue;
      if(Math.hypot(a.x-b.x,a.y-b.y)<a.size+b.size+6){
        const ex=(a.x+b.x)/2, ey=(a.y+b.y)/2;
        for(let k=0;k<22;k++){
          const ang=Math.random()*Math.PI*2, spd=3+Math.random()*5;
          misionesderangod2Particles.push(new misionesderangod2Particle(ex,ey,Math.cos(ang)*spd,Math.sin(ang)*spd-1,'#FFFFFF',22,3,'spark'));
          misionesderangod2Particles.push(new misionesderangod2Particle(ex,ey,Math.cos(ang)*spd*.5,Math.sin(ang)*spd*.5,'#FFD700',32,2.5,'spark'));
        }
        misionesderangod2CritFlash=2; misionesderangod2TriggerShake(6,18);
        a.dead=true; b.dead=true;
        for(const f of misionesderangod2Fighters){ f.vx+=(f.cx>ex?4.5:-4.5); }
      }
    }
  }
}

// ═══════════════════════════════════════════════════
//  UPDATE
// ═══════════════════════════════════════════════════
function misionesderangod2Update(dt, dms){
  misionesderangod2FrameN++;
  if(misionesderangod2FrameN%50===0){
    misionesderangod2Particles.push(new misionesderangod2Particle(
      Math.random()*misionesderangod2W,-5,0,.4+Math.random()*.6,
      Math.random()<.5?'#2A4A1A':'#386020',
      180+Math.random()*100,2+Math.random()*1.5,'leaf'
    ));
  }
  if(misionesderangod2CritFlash>0) misionesderangod2CritFlash-=dt;
  if(misionesderangod2ShakeDur>0){
    misionesderangod2ShakeDur-=dt;
    const f=misionesderangod2ShakeDur/10;
    misionesderangod2ShakeX=(Math.random()-.5)*misionesderangod2ShakeAmp*f;
    misionesderangod2ShakeY=(Math.random()-.5)*misionesderangod2ShakeAmp*f;
    if(misionesderangod2ShakeDur<=0){ misionesderangod2ShakeX=0; misionesderangod2ShakeY=0; misionesderangod2ShakeAmp=0; }
  }
  if(misionesderangod2JutsuVeil>0){ misionesderangod2JutsuVeil-=dt; if(misionesderangod2JutsuVeil<=0){ misionesderangod2JutsuVeil=0; misionesderangod2Veil.style.background='rgba(0,0,0,0)'; } }
  if(misionesderangod2HitStop>0){
    misionesderangod2HitStop-=dt;
    misionesderangod2Particles.forEach(p=>p.update(dt));
    misionesderangod2Particles=misionesderangod2Particles.filter(p=>!p.isDead());
    misionesderangod2DamageNums.forEach(d=>d.update(dt));
    misionesderangod2DamageNums=misionesderangod2DamageNums.filter(d=>!d.isDead());
    return;
  }
  const [f0,f1]=misionesderangod2Fighters;
  f0.update(dt,dms,f1);
  f1.update(dt,dms,f0);
  for(const j of misionesderangod2Jutsus) j.update(dt);
  for(const j of misionesderangod2Jutsus){
    if(j.dead) continue;
    for(const f of misionesderangod2Fighters){
      if(f===j.owner||f.isDead||f.invincible) continue;
      if(Math.hypot(j.x-f.cx,j.y-f.cy)<j.size+misionesderangod2NW/2){
        const dmg=10+Math.random()*10;
        f.receiveHit(dmg,j.x,j.owner);
        for(let i=0;i<16;i++){
          const ang=Math.random()*Math.PI*2, spd=2+Math.random()*4;
          misionesderangod2Particles.push(new misionesderangod2Particle(j.x,j.y,Math.cos(ang)*spd,Math.sin(ang)*spd,j.color,20,3,'spark'));
        }
        j.dead=true;
      }
    }
  }
  misionesderangod2CheckJutsuClash();
  misionesderangod2Jutsus=misionesderangod2Jutsus.filter(j=>!j.dead);
  misionesderangod2Particles.forEach(p=>p.update(dt));
  misionesderangod2Particles=misionesderangod2Particles.filter(p=>!p.isDead());
  misionesderangod2DamageNums.forEach(d=>d.update(dt));
  misionesderangod2DamageNums=misionesderangod2DamageNums.filter(d=>!d.isDead());
}

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

// ═══════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════
function misionesderangod2StartGame(){
  misionesderangod2Particles=[]; misionesderangod2DamageNums=[]; misionesderangod2Jutsus=[];
  misionesderangod2HitStop=0; misionesderangod2SlowMo=1; misionesderangod2FrameN=0; misionesderangod2GameOver=false;
  misionesderangod2ShakeX=0; misionesderangod2ShakeY=0; misionesderangod2ShakeDur=0; misionesderangod2ShakeAmp=0; misionesderangod2CritFlash=0;
  misionesderangod2JutsuVeil=0; misionesderangod2Veil.style.background='rgba(0,0,0,0)';
  misionesderangod2WinScreen.style.display='none';
  misionesderangod2Fighters=[new misionesderangod2Fighter(70,0), new misionesderangod2Fighter(360,1)];
  misionesderangod2Fighters[0].tX=120+Math.random()*80;
  misionesderangod2Fighters[1].tX=250+Math.random()*80;
}

// ═══════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════
let misionesderangod2LastTs=0;
function misionesderangod2Loop(ts){
  const rawDt=Math.min((ts-misionesderangod2LastTs)/16.667,3);
  misionesderangod2LastTs=ts;
  const dt=rawDt*misionesderangod2SlowMo;
  const dms=rawDt*16.667*misionesderangod2SlowMo;
  misionesderangod2Update(dt,dms);
  misionesderangod2Render();
  requestAnimationFrame(misionesderangod2Loop);
}

let misionesderangod2LoopStarted = false;

window.misionesderangodddMount = function(targetElement){
  if (!targetElement) return null;
  targetElement.innerHTML = '';
  targetElement.appendChild(misionesderangod2Container);

  misionesderangod2Canvas = document.getElementById('misionesderangod2Canvas');
  misionesderangod2Ctx = misionesderangod2Canvas.getContext('2d');
  misionesderangod2Veil = document.getElementById('misionesderangod2Veil');
  misionesderangod2WinScreen = document.getElementById('misionesderangod2WinnerScreen');
  misionesderangod2WinName = document.getElementById('misionesderangod2WinName');

  document.getElementById('misionesderangod2BtnRestart').onclick = misionesderangod2StartGame;

  misionesderangod2GenBG();
  misionesderangod2StartGame();

  if (!misionesderangod2LoopStarted) {
    misionesderangod2LoopStarted = true;
    requestAnimationFrame(ts=>{ misionesderangod2LastTs=ts; requestAnimationFrame(misionesderangod2Loop); });
  }

  return {
    destroy(){
      if (misionesderangod2Container.parentNode) {
        misionesderangod2Container.parentNode.removeChild(misionesderangod2Container);
      }
    }
  };
};

})(); // fin del IIFE
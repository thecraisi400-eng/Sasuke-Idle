(() => {
  const battleMissionHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>SHINOBI EVOLUTION</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  background: #050308;
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; overflow: hidden;
  font-family: 'Arial Black', Impact, sans-serif;
}
#wrapper {
  position: relative; width: 460px; height: 360px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255,120,0,0.25),
    0 0 30px rgba(255,80,0,0.3),
    0 0 80px rgba(120,0,255,0.15);
}
canvas { position:absolute; top:0; left:0; display:block; }
#veil {
  position: absolute; top:0; left:0; width:100%; height:100%;
  pointer-events: none; z-index: 8;
  background: rgba(0,0,0,0);
  transition: background 0.2s ease;
}
#winner-screen {
  position: absolute; top:0; left:0; width:100%; height:100%;
  display: none; flex-direction: column;
  justify-content: center; align-items: center;
  z-index: 20;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%);
}
#win-banner {
  border-top: 1px solid rgba(255,200,0,0.4);
  border-bottom: 1px solid rgba(255,200,0,0.4);
  padding: 12px 40px;
  text-align: center;
  animation: winPulse 0.8s ease-in-out infinite alternate;
}
#win-label { font-size: 10px; letter-spacing: 6px; color: #AA8800; margin-bottom: 4px; }
#win-name {
  font-size: 42px; font-weight: 900; letter-spacing: 5px;
  text-transform: uppercase;
  -webkit-text-stroke: 1px rgba(255,200,0,0.5);
}
#win-sub { font-size: 11px; letter-spacing: 4px; color: #888; margin-top: 6px; }
#btn-restart {
  margin-top: 22px; padding: 9px 28px;
  background: transparent;
  border: 1px solid rgba(255,180,0,0.5);
  color: #FFD700; font-size: 11px; letter-spacing: 3px;
  cursor: pointer; text-transform: uppercase;
  transition: all 0.2s;
}
#btn-restart:hover {
  background: rgba(255,180,0,0.15);
  border-color: rgba(255,180,0,0.9);
}
@keyframes winPulse {
  from { filter: drop-shadow(0 0 8px rgba(255,200,0,0.3)); }
  to   { filter: drop-shadow(0 0 25px rgba(255,200,0,0.7)); }
}
</style>
</head>
<body>
<div id="wrapper">
  <canvas id="canvas" width="460" height="360" style="z-index:2;"></canvas>
  <div id="veil"></div>
  <div id="winner-screen">
    <div id="win-banner">
      <div id="win-label">VENCEDOR</div>
      <div id="win-name" style="color:#FFD700;">UZUMAKI</div>
      <div id="win-sub">★ &nbsp; VICTORIA &nbsp; ★</div>
    </div>
    <button id="btn-restart" onclick="startGame()">▶ &nbsp; NUEVA BATALLA</button>
  </div>
</div>

<script>
// ═══════════════════════════════════════════════════
//  SHINOBI EVOLUTION — Complete Combat Engine
// ═══════════════════════════════════════════════════
const W = 460, H = 360;
const GROUND = H - 50;          // ground Y level
const G = 0.44;                  // gravity per frame
const SC = 0.70;                 // sprite scale
const NW = Math.round(30 * SC); // ninja width  ≈21
const NH = Math.round(50 * SC); // ninja height ≈35

const canvas   = document.getElementById('canvas');
const ctx      = canvas.getContext('2d');
const veil     = document.getElementById('veil');
const winScreen= document.getElementById('winner-screen');
const winName  = document.getElementById('win-name');

let particles  = [];
let damageNums = [];
let jutsus     = [];
let fighters   = [];
let hitStop    = 0;
let slowMo     = 1;
let frameN     = 0;
let gameOver   = false;

let shakeX=0, shakeY=0, shakeDur=0, shakeAmp=0;
let critFlash  = 0;
let jutsuVeil  = 0;
let bgMountains, bgTrees, bgStars;

class Particle { constructor(x,y,vx,vy,color,life,size,type){this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.color=color;this.life=life;this.maxLife=life;this.size=size;this.type=type;this.alpha=1;this.rot=Math.random()*Math.PI*2;this.rotS=(Math.random()-.5)*.15;this.grav=(type==='spark'||type==='dust')?G*.45:0;} update(dt){this.x+=this.vx*dt;this.y+=this.vy*dt;this.vy+=this.grav*dt;if(this.type==='smoke'){this.vx*=.97;this.vy*=.97;this.size+=.35*dt;}if(this.type==='leaf'){this.vx=Math.sin(frameN*.025+this.x*.08)*.7;this.vy+=.025*dt;this.rot+=this.rotS*dt;}this.life-=dt;this.alpha=Math.max(0,this.life/this.maxLife);} draw(ctx){if(this.alpha<=0||this.size<=0)return;ctx.save();ctx.globalAlpha=this.alpha;ctx.fillStyle=this.color;if(this.type==='leaf'){ctx.translate(this.x,this.y);ctx.rotate(this.rot);ctx.fillRect(-this.size,-this.size*.4,this.size*2,this.size*.8);} else {ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);ctx.fill();}ctx.restore();} isDead(){return this.life<=0||(this.type==='smoke'&&this.size>45);} }
class DamageNum { constructor(x,y,val,crit){this.x=x;this.y=y;this.val=Math.round(val);this.crit=crit;this.vx=(Math.random()-.5)*2.5;this.vy=-4.5;this.life=60;this.maxLife=60;} update(dt){this.x+=this.vx*dt;this.vy+=.18*dt;this.y+=this.vy*dt;this.life-=dt;} isDead(){return this.life<=0;} draw(ctx){const a=Math.max(0,this.life/this.maxLife);const sz=this.crit?15:11;ctx.save();ctx.globalAlpha=a;ctx.font=\`bold \${sz}px Arial Black\`;ctx.textAlign='center';ctx.strokeStyle='#000';ctx.lineWidth=3.5;ctx.strokeText(this.val,this.x,this.y);ctx.fillStyle=this.crit?'#FFE040':'#FF6644';ctx.fillText(this.val,this.x,this.y);if(this.crit){ctx.font='bold 7px Arial';ctx.fillStyle='#FFFACC';ctx.fillText('CRÍTICO!',this.x,this.y-13);}ctx.restore();} }
class Jutsu { constructor(x,y,vx,vy,owner){this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.owner=owner;this.color=owner.glowColor;this.size=9;this.life=200;this.dead=false;this.trail=[];this.id=Math.random();} update(dt){this.trail.unshift({x:this.x,y:this.y});if(this.trail.length>12)this.trail.pop();this.x+=this.vx*dt;this.y+=this.vy*dt;this.life-=dt;if(this.x<-12||this.x>W+12||this.y<-12||this.y>H+12||this.life<=0)this.dead=true;if(Math.random()<.35)particles.push(new Particle(this.x,this.y,(Math.random()-.5)*1.5,(Math.random()-.5)*1.5,this.color,10,2,'spark'));} draw(ctx){for(let i=0;i<this.trail.length;i++){const t=this.trail[i];const r=this.size*(1-i/this.trail.length)*.9;if(r<=0)continue;ctx.save();ctx.globalAlpha=(1-i/this.trail.length)*.55;ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(t.x,t.y,r,0,Math.PI*2);ctx.fill();ctx.restore();}const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size*2.2);g.addColorStop(0,'#FFFFFF');g.addColorStop(.35,this.color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.save();ctx.globalAlpha=.92;ctx.fillStyle=g;ctx.beginPath();ctx.arc(this.x,this.y,this.size*2.2,0,Math.PI*2);ctx.fill();ctx.restore();} }
class Fighter { constructor(x,id){this.id=id;this.x=x;this.y=GROUND-NH;this.vx=0;this.vy=0;this.onGround=true;this.facingRight=(id===0);this.name=id===0?'UZUMAKI':'UCHIHA';this.color=id===0?'#E8A030':'#6855CC';this.glowColor=id===0?'#FF8C00':'#9932CC';this.skinColor=id===0?'#F5C09A':'#D8C8E8';this.hp=100;this.maxHp=100;this.dashTimer=0;this.dashInterval=800;this.tX=x;this.tY=GROUND-NH;this.atkCD=0;this.jutsuCD=0;this.shieldTime=0;this.shieldBroken=false;this.shieldBreakTimer=0;this.dmgBurst=0;this.dmgBurstTimer=0;this.defBreak=false;this.defBreakTimer=0;this.stunTimer=0;this.invincible=false;this.invTimer=0;this.flashTimer=0;this.animF=0;this.animT=0;this.trail=[];this.isDead=false;this.deathT=0;this.deathSmoke=0;this.winnerFlag=false;} get cx(){return this.x+NW/2;} get cy(){return this.y+NH/2;} receiveHit(rawDmg,fromX,attacker){if(this.isDead||this.invincible)return; if(Math.random()<.15&&this.stunTimer<=0){this.doKawarimi(attacker);return;} let dmg=rawDmg;const canShield=!this.shieldBroken&&!this.defBreak&&this.shieldTime<2000;if(canShield&&Math.random()<.30){dmg=rawDmg*.30;this.shieldTime+=500;spawnSparks(this.cx,this.cy,6,'#88CCFF');if(this.shieldTime>=2000){this.shieldBroken=true;this.shieldBreakTimer=90;this.shieldTime=0;this.stunTimer=35;spawnSparks(this.cx,this.cy,12,'#44AAFF');}} this.dmgBurst+=rawDmg;if(this.dmgBurst>=this.maxHp*.15){this.defBreak=true;this.defBreakTimer=90;this.dmgBurst=0;} this.hp=Math.max(0,this.hp-dmg);damageNums.push(new DamageNum(this.cx+(Math.random()-.5)*8,this.y-5,dmg,rawDmg>=14));this.flashTimer=18;this.stunTimer=22;hitStop=3;triggerShake(2,9);if(this.hp<=0&&!this.isDead)this.die();} doKawarimi(attacker){const behind=attacker.facingRight?attacker.x-NW-28:attacker.x+NW+28;this.x=Math.max(5,Math.min(W-NW-5,behind));this.y=GROUND-NH;this.vx=0;this.vy=0;this.onGround=true;this.invincible=true;this.invTimer=35;} launchJutsu(target){if(this.jutsuCD>0)return;this.jutsuCD=90;const dx=target.cx-this.cx,dy=target.cy-this.cy,d=Math.sqrt(dx*dx+dy*dy),spd=5;jutsus.push(new Jutsu(this.cx,this.cy,(dx/d)*spd,(dy/d)*spd,this));jutsuVeil=30;veil.style.background='rgba(0,0,0,0.22)';} die(){this.isDead=true;slowMo=0.16;gameOver=true;const winner=fighters.find(f=>!f.isDead);setTimeout(()=>showWinner(winner?winner.name:'???'),2600);} update(dt,dms,enemy){if(this.isDead)return;if(hitStop>0)return;if(this.stunTimer>0)this.stunTimer-=dt;if(this.atkCD>0)this.atkCD-=dt;if(this.jutsuCD>0)this.jutsuCD-=dt;if(this.invTimer>0){this.invTimer-=dt;if(this.invTimer<=0)this.invincible=false;} if(!this.onGround)this.vy+=G*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.vx*=.87;if(this.y>=GROUND-NH){this.y=GROUND-NH;this.vy=0;this.onGround=true;} else this.onGround=false;this.facingRight=enemy.cx>this.cx;if(this.stunTimer>0)return;this.dashTimer+=dms;if(this.dashTimer>=this.dashInterval){this.dashTimer=0;this.tX=22+Math.random()*(W-44-NW);this.tY=Math.random()<.38?GROUND-NH-55-Math.random()*130:GROUND-NH;} const tdx=this.tX-this.x,tdy=this.tY-this.y,tLen=Math.sqrt(tdx*tdx+tdy*tdy);if(tLen>8){this.vx+=(tdx/tLen)*5*.26;if(tdy<-22&&this.onGround){this.vy=-11;this.onGround=false;}} if(!enemy.isDead){const dist=Math.hypot(this.cx-enemy.cx,this.cy-enemy.cy);if(dist<50&&this.atkCD<=0){enemy.receiveHit(8+Math.random()*7,this.cx,this);this.atkCD=42;} else if(dist>150&&this.jutsuCD<=0){this.launchJutsu(enemy);}} } draw(ctx){ctx.save();ctx.fillStyle=this.color;ctx.fillRect(this.x,this.y,NW,NH);ctx.restore();this.drawHPBar(ctx,1);} drawHPBar(ctx,a=1){const bW=30,bH=4,bx=this.x+NW/2-bW/2,by=this.y-12;ctx.save();ctx.globalAlpha=a;ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(bx-1,by-1,bW+2,bH+2);const r=this.hp/this.maxHp;ctx.fillStyle=r>.5?'#44EE44':r>.25?'#FFAA00':'#FF2222';ctx.fillRect(bx,by,bW*r,bH);ctx.restore();} }
function triggerShake(amp,dur){shakeAmp=Math.max(shakeAmp,amp);shakeDur=Math.max(shakeDur,dur);} function spawnSparks(x,y,n,color){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,spd=1.5+Math.random()*3.5;particles.push(new Particle(x,y,Math.cos(a)*spd,Math.sin(a)*spd,color,18+Math.random()*10,2+Math.random()*1.5,'spark'));}} function showWinner(name){winName.textContent=name;winScreen.style.display='flex';}
function genBG(){bgMountains=[];for(let x=0;x<=W;x+=18)bgMountains.push({x,y:95+Math.sin(x*.018)*65});bgTrees=[];bgStars=[];} function drawBG(){ctx.fillStyle='#111';ctx.fillRect(0,0,W,H);} function update(dt,dms){frameN++;if(hitStop>0){hitStop-=dt;return;}const [f0,f1]=fighters;f0.update(dt,dms,f1);f1.update(dt,dms,f0);for(const j of jutsus)j.update(dt);for(const j of jutsus){if(j.dead)continue;for(const f of fighters){if(f===j.owner||f.isDead||f.invincible)continue;if(Math.hypot(j.x-f.cx,j.y-f.cy)<j.size+NW/2){f.receiveHit(10+Math.random()*10,j.x,j.owner);j.dead=true;}}}jutsus=jutsus.filter(j=>!j.dead);} function render(){ctx.clearRect(0,0,W,H);drawBG();for(const j of jutsus)j.draw(ctx);for(const f of fighters)f.draw(ctx);} function startGame(){particles=[];damageNums=[];jutsus=[];hitStop=0;slowMo=1;frameN=0;gameOver=false;winScreen.style.display='none';fighters=[new Fighter(70,0),new Fighter(360,1)];}
let lastTs=0;function loop(ts){const rawDt=Math.min((ts-lastTs)/16.667,3);lastTs=ts;const dt=rawDt*slowMo;const dms=rawDt*16.667*slowMo;update(dt,dms);render();requestAnimationFrame(loop);} genBG();startGame();requestAnimationFrame(ts=>{lastTs=ts;requestAnimationFrame(loop);});
<\/script>
</body>
</html>`;

  window.BatallaMision = {
    getHtml() {
      return battleMissionHtml;
    }
  };
})();

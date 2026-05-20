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

(() => {
  function mount(container, mission, onComplete, onExit) {
    if (!container) return;

    container.innerHTML = `
      <div class="d-rank-battle-shell">
        <div class="d-rank-battle-topbar">
          <button class="d-rank-battle-back" data-action="exit-battle">◀ VOLVER</button>
          <div class="d-rank-battle-title">${mission.name}</div>
        </div>
        <div id="d-rank-wrapper" class="d-rank-wrapper">
          <canvas id="d-rank-canvas" style="z-index:2;"></canvas>
          <div id="d-rank-veil"></div>
          <div id="d-rank-winner-screen">
            <div id="d-rank-win-banner">
              <div id="d-rank-win-label">VENCEDOR</div>
              <div id="d-rank-win-name" style="color:#FFD700;">UZUMAKI</div>
              <div id="d-rank-win-sub">★ &nbsp; VICTORIA &nbsp; ★</div>
            </div>
            <button id="d-rank-btn-restart">▶ &nbsp; NUEVA BATALLA</button>
          </div>
        </div>
      </div>
    `;

    const wrapper = container.querySelector('#d-rank-wrapper');
    const canvas = container.querySelector('#d-rank-canvas');
    const ctx = canvas.getContext('2d');
    const veil = container.querySelector('#d-rank-veil');
    const winScreen = container.querySelector('#d-rank-winner-screen');
    const winName = container.querySelector('#d-rank-win-name');

    let W = wrapper.clientWidth || 464;
    let H = wrapper.clientHeight || 520;
    let GROUND = H - 50;
    const G = 0.44;
    const SC = 0.70;
    const NW = Math.round(30 * SC);
    const NH = Math.round(50 * SC);

    let particles = [];
    let damageNums = [];
    let jutsus = [];
    let fighters = [];
    let hitStop = 0;
    let slowMo = 1;
    let frameN = 0;
    let gameOver = false;

    let shakeX = 0, shakeY = 0, shakeDur = 0, shakeAmp = 0;
    let critFlash = 0;
    let jutsuVeil = 0;

    let bgMountains, bgTrees, bgStars;

    class Particle {
      constructor(x,y,vx,vy,color,life,size,type){
        this.x=x; this.y=y; this.vx=vx; this.vy=vy;
        this.color=color; this.life=life; this.maxLife=life;
        this.size=size; this.type=type;
        this.alpha=1;
        this.rot=Math.random()*Math.PI*2;
        this.rotS=(Math.random()-.5)*.15;
        this.grav = (type==='spark'||type==='dust') ? G*.45 : 0;
      }
      update(dt){
        this.x+=this.vx*dt; this.y+=this.vy*dt;
        this.vy+=this.grav*dt;
        if(this.type==='smoke'){this.vx*=.97;this.vy*=.97;this.size+=.35*dt;}
        if(this.type==='leaf'){
          this.vx=Math.sin(frameN*.025+this.x*.08)*.7;
          this.vy+=.025*dt;
          this.rot+=this.rotS*dt;
        }
        this.life-=dt;
        this.alpha=Math.max(0,this.life/this.maxLife);
      }
      draw(ctx2){
        if(this.alpha<=0||this.size<=0) return;
        ctx2.save(); ctx2.globalAlpha=this.alpha;
        ctx2.fillStyle=this.color;
        if(this.type==='leaf'){
          ctx2.translate(this.x,this.y); ctx2.rotate(this.rot);
          ctx2.fillRect(-this.size,-this.size*.4,this.size*2,this.size*.8);
        } else {
          ctx2.beginPath();
          ctx2.arc(this.x,this.y,this.size,0,Math.PI*2);
          ctx2.fill();
        }
        ctx2.restore();
      }
      isDead(){ return this.life<=0||(this.type==='smoke'&&this.size>45); }
    }

    class DamageNum {
      constructor(x,y,val,crit){
        this.x=x; this.y=y; this.val=Math.round(val);
        this.crit=crit;
        this.vx=(Math.random()-.5)*2.5;
        this.vy=-4.5;
        this.life=60; this.maxLife=60;
      }
      update(dt){ this.x+=this.vx*dt; this.vy+=.18*dt; this.y+=this.vy*dt; this.life-=dt; }
      isDead(){ return this.life<=0; }
      draw(ctx2){
        const a=Math.max(0,this.life/this.maxLife);
        const sz=this.crit?15:11;
        ctx2.save(); ctx2.globalAlpha=a;
        ctx2.font=`bold ${sz}px Arial Black`;
        ctx2.textAlign='center';
        ctx2.strokeStyle='#000'; ctx2.lineWidth=3.5;
        ctx2.strokeText(this.val,this.x,this.y);
        ctx2.fillStyle=this.crit?'#FFE040':'#FF6644';
        ctx2.fillText(this.val,this.x,this.y);
        if(this.crit){
          ctx2.font='bold 7px Arial';
          ctx2.fillStyle='#FFFACC';
          ctx2.fillText('CRÍTICO!',this.x,this.y-13);
        }
        ctx2.restore();
      }
    }

    class Jutsu {
      constructor(x,y,vx,vy,owner){
        this.x=x; this.y=y; this.vx=vx; this.vy=vy;
        this.owner=owner;
        this.color=owner.glowColor;
        this.size=9; this.life=200; this.dead=false;
        this.trail=[];
      }
      update(dt){
        this.trail.unshift({x:this.x,y:this.y});
        if(this.trail.length>12) this.trail.pop();
        this.x+=this.vx*dt; this.y+=this.vy*dt;
        this.life-=dt;
        if(this.x<-12||this.x>W+12||this.y<-12||this.y>H+12||this.life<=0) this.dead=true;
        if(Math.random()<.35) particles.push(new Particle(this.x,this.y,(Math.random()-.5)*1.5,(Math.random()-.5)*1.5,this.color,10,2,'spark'));
      }
      draw(ctx2){
        for(let i=0;i<this.trail.length;i++){
          const t=this.trail[i];
          const r=this.size*(1-i/this.trail.length)*.9;
          if(r<=0) continue;
          ctx2.save(); ctx2.globalAlpha=(1-i/this.trail.length)*.55;
          ctx2.fillStyle=this.color;
          ctx2.beginPath(); ctx2.arc(t.x,t.y,r,0,Math.PI*2); ctx2.fill();
          ctx2.restore();
        }
      }
    }

    class Fighter {
      constructor(x,id){
        this.id=id; this.x=x; this.y=GROUND-NH;
        this.vx=0; this.vy=0;
        this.onGround=true; this.facingRight=(id===0);
        this.name  = id===0 ? 'UZUMAKI' : 'UCHIHA';
        this.color = id===0 ? '#E8A030' : '#6855CC';
        this.glowColor = id===0 ? '#FF8C00' : '#9932CC';
        this.skinColor = id===0 ? '#F5C09A' : '#D8C8E8';
        this.hp=100; this.maxHp=100;
        this.dashTimer=0; this.dashInterval=800;
        this.tX=x; this.tY=GROUND-NH;
        this.atkCD=0; this.jutsuCD=0;
        this.stunTimer=0;
        this.invincible=false; this.invTimer=0;
        this.flashTimer=0;
        this.animF=0; this.animT=0;
        this.trail=[];
        this.isDead=false;
      }
      get cx(){ return this.x+NW/2; }
      get cy(){ return this.y+NH/2; }
      receiveHit(rawDmg, fromX){
        if(this.isDead||this.invincible) return;
        this.hp=Math.max(0,this.hp-rawDmg);
        const isCrit=rawDmg>=14;
        damageNums.push(new DamageNum(this.cx+(Math.random()-.5)*8,this.y-5,rawDmg,isCrit));
        const dir=(fromX<this.cx)?1:-1;
        this.vx+=dir*11;
        this.flashTimer=18; this.stunTimer=22;
        hitStop=3;
        triggerShake(isCrit?6:2, isCrit?20:9);
        if(isCrit) critFlash=2;
        if(this.hp<=0 && !this.isDead) this.die();
      }
      launchJutsu(target){
        if(this.jutsuCD>0) return;
        this.jutsuCD=90;
        const dx=target.cx-this.cx, dy=target.cy-this.cy;
        const d=Math.sqrt(dx*dx+dy*dy) || 1;
        const spd=5;
        jutsus.push(new Jutsu(this.cx,this.cy,(dx/d)*spd,(dy/d)*spd,this));
        jutsuVeil=30;
        veil.style.background='rgba(0,0,0,0.22)';
      }
      die(){
        this.isDead=true; slowMo=0.16; gameOver=true;
        const winner=fighters.find(f=>!f.isDead);
        setTimeout(()=>showWinner(winner?winner.name:'???'),1200);
      }
      update(dt, dms, enemy){
        if(this.isDead || hitStop>0) return;
        if(this.flashTimer>0) this.flashTimer-=dt;
        if(this.stunTimer>0) this.stunTimer-=dt;
        if(this.atkCD>0) this.atkCD-=dt;
        if(this.jutsuCD>0) this.jutsuCD-=dt;
        if(!this.onGround) this.vy+=G*dt;
        this.x+=this.vx*dt; this.y+=this.vy*dt;
        this.vx*=.87;
        if(this.y>=GROUND-NH){ this.y=GROUND-NH; this.vy=0; this.onGround=true; }
        else this.onGround=false;
        if(this.x<=3){ this.x=3; this.vx=4.5; }
        if(this.x>=W-NW-3){ this.x=W-NW-3; this.vx=-4.5; }
        this.facingRight=enemy.cx>this.cx;
        if(this.stunTimer>0) return;
        this.dashTimer+=dms;
        if(this.dashTimer>=this.dashInterval){
          this.dashTimer=0;
          this.tX=22+Math.random()*(W-44-NW);
        }
        const tdx=this.tX-this.x;
        if(Math.abs(tdx)>8) this.vx+=Math.sign(tdx)*1.3;
        this.animT+=dt;
        if(this.animT>3){ this.animT=0; this.animF=(this.animF+1)%4; }
        if(!enemy.isDead){
          const dist=Math.hypot(this.cx-enemy.cx,this.cy-enemy.cy);
          if(dist<50 && this.atkCD<=0){
            enemy.receiveHit(8+Math.random()*7,this.cx,this);
            this.atkCD=42;
          } else if(dist>150 && this.jutsuCD<=0){
            this.launchJutsu(enemy);
          }
        }
      }
      draw(ctx2){
        const flashOn=this.flashTimer>0 && Math.sin(this.flashTimer*1.6)>0;
        const bC=flashOn?'#FF3333':this.color;
        const sC=flashOn?'#FF8866':this.skinColor;
        ctx2.save();
        if(!this.facingRight){
          ctx2.translate(this.x+NW/2,0); ctx2.scale(-1,1); ctx2.translate(-(this.x+NW/2),0);
        }
        const x=this.x, y=this.y;
        ctx2.fillStyle=bC; ctx2.fillRect(x+2,y+NH*.30,NW-4,NH*.68);
        ctx2.fillStyle=sC;
        ctx2.beginPath(); ctx2.arc(x+NW/2,y+NH*.155,NW*.40,0,Math.PI*2); ctx2.fill();
        ctx2.restore();
        this.drawHPBar(ctx2);
      }
      drawHPBar(ctx2){
        const bW=30, bH=4;
        const bx=this.x+NW/2-bW/2;
        const by=this.y-12;
        ctx2.fillStyle='rgba(0,0,0,.75)';
        ctx2.fillRect(bx-1,by-1,bW+2,bH+2);
        const r=this.hp/this.maxHp;
        ctx2.fillStyle=r>.5?'#44EE44':r>.25?'#FFAA00':'#FF2222';
        ctx2.fillRect(bx,by,bW*r,bH);
      }
    }

    function triggerShake(amp,dur){ shakeAmp=Math.max(shakeAmp,amp); shakeDur=Math.max(shakeDur,dur); }
    function showWinner(name){
      winName.textContent=name;
      winName.style.color=name==='UZUMAKI'?'#FFD700':'#CC88FF';
      winScreen.style.display='flex';
      if(name === 'UZUMAKI' && typeof onComplete === 'function') {
        onComplete({ oro: Number(mission.gold), xp: Number(mission.xp) });
      }
    }
    function genBG(){
      bgMountains=[];
      for(let x=0;x<=W;x+=18){ bgMountains.push({x, y: 95+Math.sin(x*.018)*65+Math.sin(x*.055)*28}); }
      bgTrees=[];
      for(let i=0;i<14;i++){ bgTrees.push({x:15+Math.random()*(W-30),y:GROUND-35-Math.random()*55,h:38+Math.random()*55,w:10+Math.random()*14}); }
      bgStars=[];
      for(let i=0;i<50;i++){ bgStars.push({x:(i*97+13)%W, y:(i*53+7)%(H*.52), s:1, ph:Math.random()*Math.PI*2}); }
    }
    function drawBG(){
      const sky=ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0,'#060412'); sky.addColorStop(.5,'#150A30'); sky.addColorStop(1,'#200C08');
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
      for(const st of bgStars){
        const f=.5+.5*Math.sin(frameN*.04+st.ph);
        ctx.globalAlpha=f*.75; ctx.fillStyle='#FFFFFF'; ctx.fillRect(st.x,st.y,st.s,st.s);
      }
      ctx.globalAlpha=1;
      ctx.fillStyle='#12091E';
      ctx.beginPath(); ctx.moveTo(0,H);
      for(const p of bgMountains) ctx.lineTo(p.x,p.y);
      ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
      const grd=ctx.createLinearGradient(0,GROUND,0,H);
      grd.addColorStop(0,'#253A15'); grd.addColorStop(1,'#0A1408');
      ctx.fillStyle=grd; ctx.fillRect(0,GROUND,W,H-GROUND);
    }

    function update(dt, dms){
      frameN++;
      if(critFlash>0) critFlash-=dt;
      if(shakeDur>0){
        shakeDur-=dt;
        const f=shakeDur/10;
        shakeX=(Math.random()-.5)*shakeAmp*f;
        shakeY=(Math.random()-.5)*shakeAmp*f;
        if(shakeDur<=0){ shakeX=0; shakeY=0; shakeAmp=0; }
      }
      if(jutsuVeil>0){ jutsuVeil-=dt; if(jutsuVeil<=0){ jutsuVeil=0; veil.style.background='rgba(0,0,0,0)'; } }
      if(hitStop>0){
        hitStop-=dt;
        return;
      }
      const [f0,f1]=fighters;
      f0.update(dt,dms,f1);
      f1.update(dt,dms,f0);
      for(const j of jutsus) j.update(dt);
      for(const j of jutsus){
        if(j.dead) continue;
        for(const f of fighters){
          if(f===j.owner||f.isDead||f.invincible) continue;
          if(Math.hypot(j.x-f.cx,j.y-f.cy)<j.size+NW/2){
            f.receiveHit(10+Math.random()*10,j.x,j.owner);
            j.dead=true;
          }
        }
      }
      jutsus=jutsus.filter(j=>!j.dead);
      particles.forEach(p=>p.update(dt));
      particles=particles.filter(p=>!p.isDead());
      damageNums.forEach(d=>d.update(dt));
      damageNums=damageNums.filter(d=>!d.isDead());
    }

    function render(){
      ctx.save();
      ctx.translate(shakeX,shakeY);
      if(critFlash>1){
        ctx.fillStyle='rgba(255,255,255,.9)';
        ctx.fillRect(-shakeX,-shakeY,W,H);
        ctx.restore(); return;
      }
      drawBG();
      for(const j of jutsus) j.draw(ctx);
      for(const f of fighters) f.draw(ctx);
      for(const p of particles) p.draw(ctx);
      for(const d of damageNums) d.draw(ctx);
      ctx.restore();
    }

    function startGame(){
      particles=[]; damageNums=[]; jutsus=[];
      hitStop=0; slowMo=1; frameN=0; gameOver=false;
      shakeX=0; shakeY=0; shakeDur=0; shakeAmp=0; critFlash=0;
      jutsuVeil=0; veil.style.background='rgba(0,0,0,0)';
      winScreen.style.display='none';
      fighters=[new Fighter(70,0), new Fighter(Math.max(220, W-104),1)];
      const enemyHp = Math.max(100, Number(mission.hp) || 100);
      fighters[1].hp = enemyHp;
      fighters[1].maxHp = enemyHp;
    }

    function handleResize(){
      W = wrapper.clientWidth || 464;
      H = wrapper.clientHeight || 520;
      GROUND = H - 50;
      canvas.width = W;
      canvas.height = H;
      genBG();
    }

    let raf = null;
    let lastTs=0;
    function loop(ts){
      const rawDt=Math.min((ts-lastTs)/16.667,3);
      lastTs=ts;
      const dt=rawDt*slowMo;
      const dms=rawDt*16.667*slowMo;
      update(dt,dms);
      render();
      raf = requestAnimationFrame(loop);
    }

    const cleanup = () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      container.onclick = null;
      if (typeof onExit === 'function') onExit();
    };

    container.onclick = (event) => {
      const btn = event.target.closest('[data-action="exit-battle"]');
      if (btn) cleanup();
    };

    container.querySelector('#d-rank-btn-restart').onclick = startGame;

    handleResize();
    genBG();
    startGame();
    window.addEventListener('resize', handleResize, { passive: true });
    raf = requestAnimationFrame((ts)=>{ lastTs=ts; raf=requestAnimationFrame(loop); });
  }

  window.MissionRankDBattle = { mount };
})();

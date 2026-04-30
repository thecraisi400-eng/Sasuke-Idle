(() => {
  const TEMPLATE = `
    <div class="bm-root">
      <div class="bm-wrapper" id="bm-wrapper">
        <canvas id="bm-canvas" width="460" height="360" style="z-index:2;"></canvas>
        <div id="bm-veil"></div>
        <div id="bm-winner-screen">
          <div id="bm-win-banner">
            <div id="bm-win-label">VENCEDOR</div>
            <div id="bm-win-name" style="color:#FFD700;">UZUMAKI</div>
            <div id="bm-win-sub">★ &nbsp; VICTORIA &nbsp; ★</div>
          </div>
          <button id="bm-btn-restart">▶ &nbsp; NUEVA BATALLA</button>
          <button id="bm-btn-exit">⟵ VOLVER A MISIONES</button>
        </div>
      </div>
    </div>`;

  const STYLE_ID = 'batalla-mision-styles';
  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `.bm-root{height:100%;display:grid;place-items:center;padding:0}.bm-wrapper{position:relative;width:100%;height:100%;overflow:hidden;box-shadow:0 0 0 1px rgba(255,120,0,.25),0 0 30px rgba(255,80,0,.3),0 0 80px rgba(120,0,255,.15)}.bm-wrapper canvas{position:absolute;inset:0;display:block;width:100%;height:100%}#bm-veil{position:absolute;inset:0;pointer-events:none;z-index:8;background:rgba(0,0,0,0);transition:background .2s ease}#bm-winner-screen{position:absolute;inset:0;display:none;flex-direction:column;justify-content:center;align-items:center;z-index:20;background:radial-gradient(ellipse at center,rgba(0,0,0,.85) 0%,rgba(0,0,0,.95) 100%)}#bm-win-banner{border-top:1px solid rgba(255,200,0,.4);border-bottom:1px solid rgba(255,200,0,.4);padding:12px 40px;text-align:center;animation:bmWinPulse .8s ease-in-out infinite alternate}#bm-win-label{font-size:10px;letter-spacing:6px;color:#AA8800;margin-bottom:4px}#bm-win-name{font-size:42px;font-weight:900;letter-spacing:5px;text-transform:uppercase;-webkit-text-stroke:1px rgba(255,200,0,.5)}#bm-win-sub{font-size:11px;letter-spacing:4px;color:#888;margin-top:6px}#bm-btn-restart,#bm-btn-exit{margin-top:12px;padding:9px 28px;background:transparent;border:1px solid rgba(255,180,0,.5);color:#FFD700;font-size:11px;letter-spacing:3px;cursor:pointer;text-transform:uppercase}#bm-btn-restart:hover,#bm-btn-exit:hover{background:rgba(255,180,0,.15)}@keyframes bmWinPulse{from{filter:drop-shadow(0 0 8px rgba(255,200,0,.3))}to{filter:drop-shadow(0 0 25px rgba(255,200,0,.7))}}`;
    document.head.appendChild(s);
  }

  window.BatallaMision = {
    render(container, { onExit } = {}) {
      ensureStyles();
      container.innerHTML = TEMPLATE;
      const canvas = container.querySelector('#bm-canvas');
      const ctx = canvas.getContext('2d');
      const veil = container.querySelector('#bm-veil');
      const winScreen = container.querySelector('#bm-winner-screen');
      const winName = container.querySelector('#bm-win-name');
      const restartBtn = container.querySelector('#bm-btn-restart');
      const exitBtn = container.querySelector('#bm-btn-exit');

      const W = canvas.width = container.clientWidth || 460;
      const H = canvas.height = container.clientHeight || 360;
      const GROUND = H - 50; const G = 0.44; const SC = 0.70; const NW = Math.round(30 * SC); const NH = Math.round(50 * SC);
      let particles = [], damageNums = [], jutsus = [], fighters = [], hitStop = 0, slowMo = 1, frameN = 0, gameOver = false;
      let shakeX=0, shakeY=0, shakeDur=0, shakeAmp=0, critFlash=0, jutsuVeil=0;
      let bgMountains=[], bgTrees=[], bgStars=[]; let rafId = 0;
      class Particle { constructor(x,y,vx,vy,color,life,size,type){Object.assign(this,{x,y,vx,vy,color,life,maxLife:life,size,type,alpha:1,rot:Math.random()*Math.PI*2,rotS:(Math.random()-.5)*.15,grav:(type==='spark'||type==='dust')?G*.45:0});} update(dt){this.x+=this.vx*dt;this.y+=this.vy*dt;this.vy+=this.grav*dt;if(this.type==='smoke'){this.vx*=.97;this.vy*=.97;this.size+=.35*dt;} if(this.type==='leaf'){this.vx=Math.sin(frameN*.025+this.x*.08)*.7;this.vy+=.025*dt;this.rot+=this.rotS*dt;}this.life-=dt;this.alpha=Math.max(0,this.life/this.maxLife);} draw(ctx){if(this.alpha<=0||this.size<=0)return;ctx.save();ctx.globalAlpha=this.alpha;ctx.fillStyle=this.color;if(this.type==='leaf'){ctx.translate(this.x,this.y);ctx.rotate(this.rot);ctx.fillRect(-this.size,-this.size*.4,this.size*2,this.size*.8);}else{ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);ctx.fill();}ctx.restore();} isDead(){return this.life<=0||(this.type==='smoke'&&this.size>45);} }
      class DamageNum { constructor(x,y,val,crit){Object.assign(this,{x,y,val:Math.round(val),crit,vx:(Math.random()-.5)*2.5,vy:-4.5,life:60,maxLife:60});} update(dt){this.x+=this.vx*dt;this.vy+=.18*dt;this.y+=this.vy*dt;this.life-=dt;} isDead(){return this.life<=0;} draw(ctx){const a=Math.max(0,this.life/this.maxLife);ctx.save();ctx.globalAlpha=a;ctx.font=`bold ${this.crit?15:11}px Arial Black`;ctx.textAlign='center';ctx.strokeStyle='#000';ctx.lineWidth=3.5;ctx.strokeText(this.val,this.x,this.y);ctx.fillStyle=this.crit?'#FFE040':'#FF6644';ctx.fillText(this.val,this.x,this.y);ctx.restore();} }
      class Jutsu { constructor(x,y,vx,vy,owner){Object.assign(this,{x,y,vx,vy,owner,color:owner.glowColor,size:9,life:200,dead:false,trail:[]});} update(dt){this.trail.unshift({x:this.x,y:this.y});if(this.trail.length>12)this.trail.pop();this.x+=this.vx*dt;this.y+=this.vy*dt;this.life-=dt;if(this.x<-12||this.x>W+12||this.y<-12||this.y>H+12||this.life<=0)this.dead=true;} draw(ctx){for(let i=0;i<this.trail.length;i++){const t=this.trail[i];const r=this.size*(1-i/this.trail.length)*.9;if(r<=0)continue;ctx.save();ctx.globalAlpha=(1-i/this.trail.length)*.55;ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(t.x,t.y,r,0,Math.PI*2);ctx.fill();ctx.restore();}} }
      class Fighter { constructor(x,id){Object.assign(this,{id,x,y:GROUND-NH,vx:0,vy:0,onGround:true,facingRight:id===0,name:id===0?'UZUMAKI':'UCHIHA',color:id===0?'#E8A030':'#6855CC',glowColor:id===0?'#FF8C00':'#9932CC',skinColor:id===0?'#F5C09A':'#D8C8E8',hp:100,maxHp:100,dashTimer:0,dashInterval:800,tX:x,tY:GROUND-NH,atkCD:0,jutsuCD:0,stunTimer:0,flashTimer:0,isDead:false,deathT:0});}
        get cx(){return this.x+NW/2;} get cy(){return this.y+NH/2;}
        receiveHit(rawDmg,fromX){if(this.isDead)return;this.hp=Math.max(0,this.hp-rawDmg);damageNums.push(new DamageNum(this.cx,this.y-5,rawDmg,rawDmg>=14));this.vx+=(fromX<this.cx?1:-1)*11;this.flashTimer=18;this.stunTimer=22;hitStop=3;if(this.hp<=0)this.die();}
        launchJutsu(target){if(this.jutsuCD>0)return;this.jutsuCD=90;const dx=target.cx-this.cx,dy=target.cy-this.cy,d=Math.hypot(dx,dy)||1;jutsus.push(new Jutsu(this.cx,this.cy,(dx/d)*5,(dy/d)*5,this));jutsuVeil=30;veil.style.background='rgba(0,0,0,0.22)';}
        die(){this.isDead=true;slowMo=.16;gameOver=true;const winner=fighters.find(f=>!f.isDead);setTimeout(()=>showWinner(winner?winner.name:'???'),1200);}
        update(dt,dms,e){if(this.isDead||hitStop>0)return; if(this.flashTimer>0)this.flashTimer-=dt;if(this.stunTimer>0)this.stunTimer-=dt;if(this.atkCD>0)this.atkCD-=dt;if(this.jutsuCD>0)this.jutsuCD-=dt; if(!this.onGround)this.vy+=G*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.vx*=.87; if(this.y>=GROUND-NH){this.y=GROUND-NH;this.vy=0;this.onGround=true;} this.facingRight=e.cx>this.cx; if(this.stunTimer>0)return; this.dashTimer+=dms; if(this.dashTimer>=this.dashInterval){this.dashTimer=0;this.tX=22+Math.random()*(W-44-NW);this.tY=Math.random()<.38?GROUND-NH-55-Math.random()*130:GROUND-NH;} const tdx=this.tX-this.x, tdy=this.tY-this.y, tLen=Math.hypot(tdx,tdy); if(tLen>8){this.vx+=(tdx/tLen)*5*.26;if(tdy<-22&&this.onGround){this.vy=-11;this.onGround=false;}} if(!e.isDead){const dist=Math.hypot(this.cx-e.cx,this.cy-e.cy); if(dist<50&&this.atkCD<=0){e.receiveHit(8+Math.random()*7,this.cx,this);this.atkCD=42;} else if(dist>150&&this.jutsuCD<=0){this.launchJutsu(e);} }}
        draw(ctx){ctx.fillStyle=this.color;ctx.fillRect(this.x,this.y,NW,NH);this.drawHPBar(ctx);} drawHPBar(ctx){const bW=30,bH=4,bx=this.x+NW/2-bW/2,by=this.y-12;ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(bx-1,by-1,bW+2,bH+2);ctx.fillStyle='#44EE44';ctx.fillRect(bx,by,bW*(this.hp/this.maxHp),bH);} }
      function showWinner(name){winName.textContent=name;winScreen.style.display='flex';}
      function genBG(){ for(let x=0;x<=W;x+=18){bgMountains.push({x,y:95+Math.sin(x*.018)*65});} for(let i=0;i<20;i++){bgStars.push({x:Math.random()*W,y:Math.random()*(H*.52),s:1});}}
      function drawBG(){ctx.fillStyle='#060412';ctx.fillRect(0,0,W,H);ctx.fillStyle='#253A15';ctx.fillRect(0,GROUND,W,H-GROUND);}    
      function update(dt,dms){frameN++; if(jutsuVeil>0){jutsuVeil-=dt;if(jutsuVeil<=0)veil.style.background='rgba(0,0,0,0)';} if(hitStop>0){hitStop-=dt;return;} const [f0,f1]=fighters;f0.update(dt,dms,f1);f1.update(dt,dms,f0); for(const j of jutsus)j.update(dt); jutsus=jutsus.filter(j=>!j.dead);}      
      function render(){ctx.save();ctx.translate(shakeX,shakeY);drawBG();for(const j of jutsus)j.draw(ctx);for(const f of fighters)f.draw(ctx);ctx.restore();}
      function startGame(){particles=[];damageNums=[];jutsus=[];hitStop=0;slowMo=1;frameN=0;gameOver=false;winScreen.style.display='none';fighters=[new Fighter(70,0),new Fighter(W-100,1)];}
      let lastTs = 0; function loop(ts){const rawDt=Math.min((ts-lastTs)/16.667,3);lastTs=ts;const dt=rawDt*slowMo,dms=rawDt*16.667*slowMo;update(dt,dms);render();rafId=requestAnimationFrame(loop);}      
      restartBtn.onclick = () => startGame();
      exitBtn.onclick = () => { cancelAnimationFrame(rafId); if (typeof onExit === 'function') onExit(); };
      genBG(); startGame(); rafId=requestAnimationFrame(ts=>{lastTs=ts;rafId=requestAnimationFrame(loop);});
    }
  };
})();

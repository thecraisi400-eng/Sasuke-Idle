(() => {
  const BM_W = 460;
  const BM_H = 360;
  const BM_GROUND = BM_H - 50;
  const BM_G = 0.44;
  const BM_SC = 0.70;
  const BM_NW = Math.round(30 * BM_SC);
  const BM_NH = Math.round(50 * BM_SC);

  class BMParticle {
    constructor(x, y, vx, vy, color, life, size, type) {
      this.x = x; this.y = y; this.vx = vx; this.vy = vy;
      this.color = color; this.life = life; this.maxLife = life;
      this.size = size; this.type = type;
      this.alpha = 1;
      this.rot = Math.random() * Math.PI * 2;
      this.rotS = (Math.random() - 0.5) * 0.15;
      this.grav = (type === 'spark' || type === 'dust') ? BM_G * 0.45 : 0;
    }

    update(dt, frameN) {
      this.x += this.vx * dt; this.y += this.vy * dt;
      this.vy += this.grav * dt;
      if (this.type === 'smoke') { this.vx *= 0.97; this.vy *= 0.97; this.size += 0.35 * dt; }
      if (this.type === 'leaf') {
        this.vx = Math.sin(frameN * 0.025 + this.x * 0.08) * 0.7;
        this.vy += 0.025 * dt;
        this.rot += this.rotS * dt;
      }
      this.life -= dt;
      this.alpha = Math.max(0, this.life / this.maxLife);
    }

    draw(ctx) {
      if (this.alpha <= 0 || this.size <= 0) return;
      ctx.save(); ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      if (this.type === 'leaf') {
        ctx.translate(this.x, this.y); ctx.rotate(this.rot);
        ctx.fillRect(-this.size, -this.size * 0.4, this.size * 2, this.size * 0.8);
      } else {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    isDead() { return this.life <= 0 || (this.type === 'smoke' && this.size > 45); }
  }

  class BMDamageNum {
    constructor(x, y, val, crit) {
      this.x = x; this.y = y; this.val = Math.round(val); this.crit = crit;
      this.vx = (Math.random() - 0.5) * 2.5; this.vy = -4.5;
      this.life = 60; this.maxLife = 60;
    }
    update(dt) { this.x += this.vx * dt; this.vy += 0.18 * dt; this.y += this.vy * dt; this.life -= dt; }
    isDead() { return this.life <= 0; }
    draw(ctx) {
      const a = Math.max(0, this.life / this.maxLife);
      const sz = this.crit ? 15 : 11;
      ctx.save(); ctx.globalAlpha = a;
      ctx.font = `bold ${sz}px Arial Black`; ctx.textAlign = 'center';
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3.5; ctx.strokeText(this.val, this.x, this.y);
      ctx.fillStyle = this.crit ? '#FFE040' : '#FF6644'; ctx.fillText(this.val, this.x, this.y);
      if (this.crit) {
        ctx.font = 'bold 7px Arial'; ctx.fillStyle = '#FFFACC'; ctx.fillText('CRÍTICO!', this.x, this.y - 13);
      }
      ctx.restore();
    }
  }

  class BMJutsu {
    constructor(x, y, vx, vy, owner) {
      this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.owner = owner;
      this.color = owner.glowColor; this.size = 9; this.life = 200; this.dead = false;
      this.trail = [];
    }
    update(dt, particles) {
      this.trail.unshift({ x: this.x, y: this.y }); if (this.trail.length > 12) this.trail.pop();
      this.x += this.vx * dt; this.y += this.vy * dt; this.life -= dt;
      if (this.x < -12 || this.x > BM_W + 12 || this.y < -12 || this.y > BM_H + 12 || this.life <= 0) this.dead = true;
      if (Math.random() < 0.35) particles.push(new BMParticle(this.x, this.y, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, this.color, 10, 2, 'spark'));
    }
    draw(ctx) {
      for (let i = 0; i < this.trail.length; i += 1) {
        const t = this.trail[i];
        const r = this.size * (1 - i / this.trail.length) * 0.9;
        if (r <= 0) continue;
        ctx.save(); ctx.globalAlpha = (1 - i / this.trail.length) * 0.55;
        ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(t.x, t.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.2);
      g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.35, this.color); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save(); ctx.globalAlpha = 0.92; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 2.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }

  class BMFighter {
    constructor(x, id) {
      this.id = id; this.x = x; this.y = BM_GROUND - BM_NH;
      this.vx = 0; this.vy = 0; this.onGround = true; this.facingRight = (id === 0);
      this.name = id === 0 ? 'UZUMAKI' : 'UCHIHA';
      this.color = id === 0 ? '#E8A030' : '#6855CC';
      this.glowColor = id === 0 ? '#FF8C00' : '#9932CC';
      this.skinColor = id === 0 ? '#F5C09A' : '#D8C8E8';
      this.hp = 100; this.maxHp = 100;
      this.dashTimer = 0; this.dashInterval = 800; this.tX = x; this.tY = BM_GROUND - BM_NH;
      this.atkCD = 0; this.jutsuCD = 0; this.shieldTime = 0; this.shieldBroken = false; this.shieldBreakTimer = 0;
      this.dmgBurst = 0; this.dmgBurstTimer = 0; this.defBreak = false; this.defBreakTimer = 0;
      this.stunTimer = 0; this.invincible = false; this.invTimer = 0; this.flashTimer = 0;
      this.animF = 0; this.animT = 0; this.trail = []; this.isDead = false; this.deathT = 0; this.deathSmoke = 0;
    }
    get cx() { return this.x + BM_NW / 2; }
    get cy() { return this.y + BM_NH / 2; }
    receiveHit(rawDmg, fromX, attacker, gs) {
      if (this.isDead || this.invincible) return;
      if (Math.random() < 0.15 && this.stunTimer <= 0) { this.doKawarimi(attacker, gs); return; }
      let dmg = rawDmg;
      const canShield = !this.shieldBroken && !this.defBreak && this.shieldTime < 2000;
      if (canShield && Math.random() < 0.30) {
        dmg = rawDmg * 0.30; this.shieldTime += 500;
        gs.spawnSparks(this.cx, this.cy, 6, '#88CCFF');
        if (this.shieldTime >= 2000) {
          this.shieldBroken = true; this.shieldBreakTimer = 90; this.shieldTime = 0; this.stunTimer = 35;
          gs.spawnSparks(this.cx, this.cy, 12, '#44AAFF');
        }
      }
      this.dmgBurst += rawDmg;
      if (this.dmgBurst >= this.maxHp * 0.15) {
        this.defBreak = true; this.defBreakTimer = 90; this.dmgBurst = 0;
      }
      this.hp = Math.max(0, this.hp - dmg);
      gs.damageNums.push(new BMDamageNum(this.cx + (Math.random() - 0.5) * 8, this.y - 5, dmg, rawDmg >= 14));
      const dir = (fromX < this.cx) ? 1 : -1;
      this.vx += dir * 11; this.flashTimer = 18; this.stunTimer = 22;
      gs.hitStop = 3; gs.triggerShake(rawDmg >= 14 ? 6 : 2, rawDmg >= 14 ? 20 : 9); if (rawDmg >= 14) gs.critFlash = 2;
      if (this.hp <= 0 && !this.isDead) this.die(gs);
    }
    doKawarimi(attacker, gs) {
      const behind = attacker.facingRight ? attacker.x - BM_NW - 28 : attacker.x + BM_NW + 28;
      const nx = Math.max(5, Math.min(BM_W - BM_NW - 5, behind));
      gs.spawnSmoke(this.cx, this.cy, 18); this.x = nx; this.y = BM_GROUND - BM_NH; this.vx = 0; this.vy = 0; this.onGround = true;
      this.invincible = true; this.invTimer = 35; gs.spawnSmoke(this.cx, this.cy, 12); gs.triggerShake(2, 6);
    }
    launchJutsu(target, gs) {
      if (this.jutsuCD > 0) return;
      this.jutsuCD = 90;
      const dx = target.cx - this.cx; const dy = target.cy - this.cy; const d = Math.hypot(dx, dy) || 1;
      gs.jutsus.push(new BMJutsu(this.cx, this.cy, (dx / d) * 5, (dy / d) * 5, this));
      gs.spawnSparks(this.cx, this.cy, 14, this.glowColor); gs.jutsuVeil = 30; gs.veil.style.background = 'rgba(0,0,0,0.22)';
      gs.triggerShake(6, 14); this.flashTimer = 8;
    }
    die(gs) { this.isDead = true; gs.slowMo = 0.16; gs.gameOver = true; gs.scheduleWin(); }
    update(dt, dms, enemy, gs) {
      if (this.isDead || gs.hitStop > 0) return;
      if (this.flashTimer > 0) this.flashTimer -= dt;
      if (this.stunTimer > 0) this.stunTimer -= dt;
      if (this.atkCD > 0) this.atkCD -= dt;
      if (this.jutsuCD > 0) this.jutsuCD -= dt;
      if (this.invTimer > 0) { this.invTimer -= dt; if (this.invTimer <= 0) this.invincible = false; }
      if (this.defBreakTimer > 0) { this.defBreakTimer -= dt; if (this.defBreakTimer <= 0) this.defBreak = false; }
      if (this.shieldBreakTimer > 0) { this.shieldBreakTimer -= dt; if (this.shieldBreakTimer <= 0) this.shieldBroken = false; }
      if (this.shieldTime > 0) this.shieldTime = Math.max(0, this.shieldTime - dms);
      this.dmgBurstTimer += dms; if (this.dmgBurstTimer >= 2000) { this.dmgBurstTimer = 0; this.dmgBurst = 0; }
      if (!this.onGround) this.vy += BM_G * dt;
      this.x += this.vx * dt; this.y += this.vy * dt; this.vx *= 0.87;
      if (this.y >= BM_GROUND - BM_NH) { this.y = BM_GROUND - BM_NH; this.vy = 0; this.onGround = true; } else this.onGround = false;
      if (this.y < 4) { this.y = 4; this.vy = 0; }
      if (this.x <= 3) { this.x = 3; this.vx = 4.5; if (this.onGround) { this.vy = -9; this.onGround = false; } }
      if (this.x >= BM_W - BM_NW - 3) { this.x = BM_W - BM_NW - 3; this.vx = -4.5; if (this.onGround) { this.vy = -9; this.onGround = false; } }
      this.facingRight = enemy.cx > this.cx;
      if (this.stunTimer > 0) return;
      this.dashTimer += dms;
      if (this.dashTimer >= this.dashInterval) {
        this.dashTimer = 0; const aerial = Math.random() < 0.38;
        this.tX = 22 + Math.random() * (BM_W - 44 - BM_NW); this.tY = aerial ? BM_GROUND - BM_NH - 55 - Math.random() * 130 : BM_GROUND - BM_NH;
      }
      const tdx = this.tX - this.x; const tdy = this.tY - this.y; const tLen = Math.hypot(tdx, tdy);
      if (tLen > 8) { this.vx += (tdx / tLen) * 5 * 0.26; if (tdy < -22 && this.onGround) { this.vy = -11; this.onGround = false; } }
      if (!enemy.isDead) {
        const dist = Math.hypot(this.cx - enemy.cx, this.cy - enemy.cy);
        if (dist < 50 && this.atkCD <= 0) { enemy.receiveHit(8 + Math.random() * 7, this.cx, this, gs); this.atkCD = 42; } else if (dist > 150 && this.jutsuCD <= 0) this.launchJutsu(enemy, gs);
      }
    }
    draw(ctx) { ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, BM_NW, BM_NH); this.drawHPBar(ctx); }
    drawHPBar(ctx) {
      const bW = 30; const bH = 4; const bx = this.x + BM_NW / 2 - bW / 2; const by = this.y - 12;
      ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(bx - 1, by - 1, bW + 2, bH + 2);
      const r = this.hp / this.maxHp; ctx.fillStyle = r > 0.5 ? '#44EE44' : (r > 0.25 ? '#FFAA00' : '#FF2222'); ctx.fillRect(bx, by, bW * r, bH);
    }
  }

  const BatallaMision = {
    render(container, mission, playerState, onResult) {
      container.innerHTML = `<section class="bm-shell"><canvas class="bm-canvas" width="${BM_W}" height="${BM_H}"></canvas><div id="bm-veil"></div><div class="bm-top"><span class="bm-title">⚔ ${mission.rankTitle} · ${mission.name}</span><button class="bm-close" type="button">VOLVER</button></div><div class="bm-end" hidden><h3 class="bm-end-title"></h3><p class="bm-end-sub"></p><button class="bm-retry" type="button">NUEVA BATALLA</button><button class="bm-back" type="button">VOLVER</button></div></section>`;
      const canvas = container.querySelector('.bm-canvas');
      const ctx = canvas.getContext('2d');
      const veil = container.querySelector('#bm-veil');
      const endEl = container.querySelector('.bm-end');
      const endTitle = container.querySelector('.bm-end-title');
      const endSub = container.querySelector('.bm-end-sub');
      const closeBtn = container.querySelector('.bm-close');
      const retryBtn = container.querySelector('.bm-retry');
      const backBtn = container.querySelector('.bm-back');
      const gs = { particles: [], damageNums: [], jutsus: [], fighters: [], hitStop: 0, slowMo: 1, frameN: 0, gameOver: false, shakeX: 0, shakeY: 0, shakeDur: 0, shakeAmp: 0, critFlash: 0, jutsuVeil: 0, veil, won: null };
      gs.triggerShake = (amp, dur) => { gs.shakeAmp = Math.max(gs.shakeAmp, amp); gs.shakeDur = Math.max(gs.shakeDur, dur); };
      gs.spawnSparks = (x, y, n, color) => { for (let i = 0; i < n; i += 1) gs.particles.push(new BMParticle(x, y, Math.cos(Math.random() * Math.PI * 2) * (1.5 + Math.random() * 3.5), Math.sin(Math.random() * Math.PI * 2) * (1.5 + Math.random() * 3.5), color, 20, 2, 'spark')); };
      gs.spawnSmoke = (x, y, count) => { for (let i = 0; i < count; i += 1) gs.particles.push(new BMParticle(x, y, (Math.random() - 0.5) * 2, -1 - Math.random(), '#BBBBBB', 40, 6, 'smoke')); };
      gs.scheduleWin = () => { setTimeout(() => { const winner = gs.fighters.find((f) => !f.isDead); gs.won = winner && winner.id === 0; endEl.hidden = false; endTitle.textContent = gs.won ? '¡VICTORIA!' : 'DERROTA'; endSub.textContent = gs.won ? `Ganaste +${mission.xp} EXP y +${mission.gold} oro` : 'Reintenta esta misión cuando quieras'; if (typeof onResult === 'function') onResult({ won: gs.won, mission }); }, 2600); };
      gs.fighters = [new BMFighter(70, 0), new BMFighter(360, 1)];

      let frameId = 0; let lastTs = 0; let stopped = false;
      const teardown = (mode = 'back') => { if (stopped) return; stopped = true; cancelAnimationFrame(frameId); if (mode === 'back' && typeof onResult === 'function') onResult({ won: null, mission, closed: true }); };

      const update = (dt, dms) => {
        gs.frameN += 1;
        if (gs.shakeDur > 0) { gs.shakeDur -= dt; const f = gs.shakeDur / 10; gs.shakeX = (Math.random() - 0.5) * gs.shakeAmp * f; gs.shakeY = (Math.random() - 0.5) * gs.shakeAmp * f; }
        if (gs.jutsuVeil > 0) { gs.jutsuVeil -= dt; if (gs.jutsuVeil <= 0) gs.veil.style.background = 'rgba(0,0,0,0)'; }
        if (gs.hitStop > 0) { gs.hitStop -= dt; return; }
        const [a, b] = gs.fighters; a.update(dt, dms, b, gs); b.update(dt, dms, a, gs);
        for (const j of gs.jutsus) j.update(dt, gs.particles);
        gs.jutsus = gs.jutsus.filter((j) => !j.dead);
        gs.particles.forEach((p) => p.update(dt, gs.frameN)); gs.particles = gs.particles.filter((p) => !p.isDead());
        gs.damageNums.forEach((d) => d.update(dt)); gs.damageNums = gs.damageNums.filter((d) => !d.isDead());
      };

      const render = () => {
        ctx.save(); ctx.translate(gs.shakeX, gs.shakeY);
        const sky = ctx.createLinearGradient(0, 0, 0, BM_H); sky.addColorStop(0, '#060412'); sky.addColorStop(1, '#200C08'); ctx.fillStyle = sky; ctx.fillRect(0, 0, BM_W, BM_H);
        ctx.fillStyle = '#253A15'; ctx.fillRect(0, BM_GROUND, BM_W, BM_H - BM_GROUND);
        gs.jutsus.forEach((j) => j.draw(ctx)); gs.fighters.forEach((f) => f.draw(ctx)); gs.particles.forEach((p) => p.draw(ctx)); gs.damageNums.forEach((d) => d.draw(ctx));
        ctx.restore();
      };

      const loop = (ts) => {
        if (stopped) return;
        if (!lastTs) lastTs = ts;
        const rawDt = Math.min((ts - lastTs) / 16.667, 3); lastTs = ts;
        const dt = rawDt * gs.slowMo; const dms = rawDt * 16.667 * gs.slowMo;
        update(dt, dms); render(); frameId = requestAnimationFrame(loop);
      };

      closeBtn.addEventListener('click', () => teardown('back'));
      backBtn.addEventListener('click', () => teardown('back'));
      retryBtn.addEventListener('click', () => { teardown('silent'); BatallaMision.render(container, mission, playerState, onResult); });
      frameId = requestAnimationFrame(loop);
    }
  };

  window.BatallaMision = BatallaMision;
})();

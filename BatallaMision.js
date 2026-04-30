(() => {
  const CFG = {
    width: 460,
    height: 360,
    gravity: 0.42,
    groundOffset: 48,
    fpsStep: 16.667
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  class BMUnit {
    constructor({ x, side, hp, atk, def, color, name }) {
      this.x = x;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.side = side;
      this.name = name;
      this.color = color;
      this.maxHp = hp;
      this.hp = hp;
      this.atk = atk;
      this.def = def;
      this.w = 24;
      this.h = 42;
      this.cooldown = 0;
      this.stun = 0;
      this.dead = false;
    }

    get cx() { return this.x + this.w / 2; }
    get cy() { return this.y + this.h / 2; }
  }

  const BatallaMision = {
    render(container, mission, playerState, onResult) {
      container.innerHTML = `
        <section class="bm-shell">
          <canvas class="bm-canvas" width="${CFG.width}" height="${CFG.height}"></canvas>
          <div class="bm-top">
            <span class="bm-title">⚔ ${mission.rankTitle} · ${mission.name}</span>
            <button class="bm-close" type="button">✕</button>
          </div>
          <div class="bm-end" hidden>
            <h3 class="bm-end-title"></h3>
            <p class="bm-end-sub"></p>
            <button class="bm-retry" type="button">NUEVA BATALLA</button>
            <button class="bm-back" type="button">VOLVER</button>
          </div>
        </section>`;

      const shell = container.querySelector('.bm-shell');
      const canvas = container.querySelector('.bm-canvas');
      const ctx = canvas.getContext('2d');
      const endEl = container.querySelector('.bm-end');
      const endTitle = container.querySelector('.bm-end-title');
      const endSub = container.querySelector('.bm-end-sub');
      const closeBtn = container.querySelector('.bm-close');
      const retryBtn = container.querySelector('.bm-retry');
      const backBtn = container.querySelector('.bm-back');

      let frameId = 0;
      let lastTs = 0;
      let ended = false;
      const particles = [];
      const ground = CFG.height - CFG.groundOffset;

      const hero = new BMUnit({
        x: 70,
        side: 'hero',
        hp: Math.max(120, playerState.hpMax),
        atk: Math.max(18, playerState.atk),
        def: Math.max(8, playerState.def),
        color: '#f39c12',
        name: playerState.hero?.name || 'HÉROE'
      });
      const enemy = new BMUnit({
        x: CFG.width - 100,
        side: 'enemy',
        hp: mission.hp,
        atk: mission.atk,
        def: mission.def,
        color: '#8e44ad',
        name: mission.name
      });
      hero.y = ground - hero.h;
      enemy.y = ground - enemy.h;

      const createHitFx = (x, y, color) => {
        for (let i = 0; i < 7; i += 1) particles.push({ x, y, vx: rand(-2.2, 2.2), vy: rand(-2.8, -0.2), life: 22, color });
      };

      const hit = (attacker, target) => {
        const base = attacker.atk * rand(0.8, 1.25);
        const reduced = Math.max(1, Math.round(base - target.def * 0.35));
        target.hp = clamp(target.hp - reduced, 0, target.maxHp);
        target.stun = 12;
        target.vx += attacker.side === 'hero' ? 3.6 : -3.6;
        createHitFx(target.cx, target.cy, attacker.side === 'hero' ? '#ffd166' : '#d291ff');
        if (target.hp <= 0) {
          target.dead = true;
          endBattle(attacker.side === 'hero');
        }
      };

      const actAI = (self, other) => {
        if (self.dead || self.stun > 0) return;
        const dx = other.cx - self.cx;
        const dist = Math.abs(dx);
        const dir = dx > 0 ? 1 : -1;
        if (dist > 32) self.vx += dir * 0.65;
        if (dist <= 42 && self.cooldown <= 0) {
          hit(self, other);
          self.cooldown = 28;
        }
        if (Math.random() < 0.008 && self.y >= ground - self.h) self.vy = -8.2;
      };

      const updateUnit = (u, dt) => {
        if (u.dead) return;
        if (u.cooldown > 0) u.cooldown -= dt;
        if (u.stun > 0) u.stun -= dt;
        u.vy += CFG.gravity * dt;
        u.x += u.vx * dt;
        u.y += u.vy * dt;
        u.vx *= 0.85;
        if (u.y >= ground - u.h) {
          u.y = ground - u.h;
          u.vy = 0;
        }
        u.x = clamp(u.x, 4, CFG.width - u.w - 4);
      };

      const drawBar = (x, y, w, unit, tint) => {
        ctx.fillStyle = 'rgba(0,0,0,.6)';
        ctx.fillRect(x, y, w, 8);
        ctx.fillStyle = tint;
        ctx.fillRect(x, y, w * (unit.hp / unit.maxHp), 8);
      };

      const draw = () => {
        const sky = ctx.createLinearGradient(0, 0, 0, CFG.height);
        sky.addColorStop(0, '#09051a');
        sky.addColorStop(1, '#1a0e29');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, CFG.width, CFG.height);

        ctx.fillStyle = '#20381f';
        ctx.fillRect(0, ground, CFG.width, CFG.height - ground);

        [hero, enemy].forEach((u) => {
          if (u.dead) return;
          ctx.fillStyle = u.color;
          ctx.fillRect(u.x, u.y, u.w, u.h);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 9px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(u.name, u.cx, u.y - 6);
        });

        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1;
          ctx.globalAlpha = p.life / 22;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, 3, 3);
          ctx.globalAlpha = 1;
        });

        drawBar(14, 12, 180, hero, '#37d67a');
        drawBar(CFG.width - 194, 12, 180, enemy, '#ff5c5c');
      };

      const endBattle = (won) => {
        if (ended) return;
        ended = true;
        endEl.hidden = false;
        endTitle.textContent = won ? '¡VICTORIA!' : 'DERROTA';
        endSub.textContent = won ? `Ganaste +${mission.xp} EXP y +${mission.gold} oro` : 'Reintenta esta misión cuando quieras';
        if (typeof onResult === 'function') onResult({ won, mission });
      };

      const loop = (ts) => {
        if (!lastTs) lastTs = ts;
        const dtRaw = Math.min(3, (ts - lastTs) / CFG.fpsStep);
        lastTs = ts;

        if (!ended) {
          actAI(hero, enemy);
          actAI(enemy, hero);
          updateUnit(hero, dtRaw);
          updateUnit(enemy, dtRaw);
          for (let i = particles.length - 1; i >= 0; i -= 1) if (particles[i].life <= 0) particles.splice(i, 1);
        }

        draw();
        frameId = requestAnimationFrame(loop);
      };

      const teardown = (mode = 'back') => {
        cancelAnimationFrame(frameId);
        if (mode === 'back' && typeof onResult === 'function') onResult({ won: null, mission, closed: true });
      };

      closeBtn.addEventListener('click', () => teardown('back'));
      backBtn.addEventListener('click', () => teardown('back'));
      retryBtn.addEventListener('click', () => {
        teardown('silent');
        BatallaMision.render(container, mission, playerState, onResult);
      });

      frameId = requestAnimationFrame(loop);
      shell.dataset.active = '1';
    }
  };

  window.BatallaMision = BatallaMision;
})();

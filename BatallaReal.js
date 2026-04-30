(() => {
  const ARENA_W = 460;
  const ARENA_H = 360;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function createLayout() {
    return `
      <section class="br-shell" aria-label="Sistema Batalla Real">
        <div class="br-stage-wrap">
          <canvas class="br-canvas" width="${ARENA_W}" height="${ARENA_H}"></canvas>
          <div class="br-veil"></div>
          <div class="br-winner" hidden>
            <div class="br-winner-box">
              <small>VENCEDOR</small>
              <strong class="br-winner-name">---</strong>
              <button type="button" class="br-restart">▶ NUEVA BATALLA</button>
            </div>
          </div>
        </div>
      </section>`;
  }

  class Ninja {
    constructor(name, x, color) {
      this.name = name;
      this.x = x;
      this.y = 270;
      this.vx = 0;
      this.vy = 0;
      this.hpMax = 100;
      this.hp = 100;
      this.cdMelee = 0;
      this.cdSkill = 0;
      this.targetX = x;
      this.color = color;
    }

    get cx() { return this.x + 16; }
    get cy() { return this.y + 20; }
  }

  function battleRuntime(canvas, panel) {
    const ctx = canvas.getContext('2d');
    const veil = panel.querySelector('.br-veil');
    const winnerEl = panel.querySelector('.br-winner');
    const winnerNameEl = panel.querySelector('.br-winner-name');
    const restartBtn = panel.querySelector('.br-restart');

    const state = {
      particles: [],
      projectiles: [],
      ended: false,
      slow: 1,
      fighters: [
        new Ninja('SASUKE', 70, '#5f62ff'),
        new Ninja('ROGUE', 360, '#ff7b2f')
      ]
    };

    const spawnSpark = (x, y, color) => {
      state.particles.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: -1 - Math.random() * 2, life: 28, color });
    };

    const melee = (attacker, target) => {
      const dmg = 7 + Math.random() * 8;
      target.hp = clamp(target.hp - dmg, 0, target.hpMax);
      target.vx += attacker.cx < target.cx ? 6 : -6;
      for (let i = 0; i < 9; i += 1) spawnSpark(target.cx, target.cy, '#ffb347');
      if (target.hp <= 0 && !state.ended) {
        state.ended = true;
        state.slow = 0.22;
        setTimeout(() => {
          winnerNameEl.textContent = attacker.name;
          winnerEl.hidden = false;
        }, 1000);
      }
    };

    const cast = (attacker, target) => {
      const dx = target.cx - attacker.cx;
      const dy = target.cy - attacker.cy;
      const len = Math.hypot(dx, dy) || 1;
      state.projectiles.push({ x: attacker.cx, y: attacker.cy, vx: (dx / len) * 4.7, vy: (dy / len) * 4.7, from: attacker, life: 150 });
      veil.style.background = 'rgba(0,0,0,0.16)';
      setTimeout(() => { veil.style.background = 'rgba(0,0,0,0)'; }, 140);
    };

    const reset = () => {
      state.ended = false;
      state.slow = 1;
      state.particles = [];
      state.projectiles = [];
      state.fighters = [new Ninja('SASUKE', 70, '#5f62ff'), new Ninja('ROGUE', 360, '#ff7b2f')];
      winnerEl.hidden = true;
    };

    restartBtn.addEventListener('click', reset);

    let last = 0;
    const tick = (ts) => {
      const dt = Math.min((ts - last) / 16.667, 2.5) * state.slow;
      last = ts;

      ctx.clearRect(0, 0, ARENA_W, ARENA_H);
      const bg = ctx.createLinearGradient(0, 0, 0, ARENA_H);
      bg.addColorStop(0, '#090714');
      bg.addColorStop(1, '#1a0d08');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, ARENA_W, ARENA_H);
      ctx.fillStyle = '#223816';
      ctx.fillRect(0, 310, ARENA_W, 50);

      const [a, b] = state.fighters;
      if (!state.ended) {
        [[a, b], [b, a]].forEach(([f, e]) => {
          f.cdMelee = Math.max(0, f.cdMelee - dt);
          f.cdSkill = Math.max(0, f.cdSkill - dt);
          f.vy += 0.4 * dt;
          f.x += f.vx * dt;
          f.y += f.vy * dt;
          f.vx *= 0.85;
          if (f.y >= 270) { f.y = 270; f.vy = 0; }
          f.x = clamp(f.x, 4, ARENA_W - 36);

          if (Math.random() < 0.03) f.targetX = 30 + Math.random() * (ARENA_W - 60);
          const dx = f.targetX - f.x;
          if (Math.abs(dx) > 4) f.vx += Math.sign(dx) * 0.45;

          const dist = Math.hypot(f.cx - e.cx, f.cy - e.cy);
          if (dist < 55 && f.cdMelee <= 0) {
            melee(f, e);
            f.cdMelee = 34;
          } else if (dist > 150 && f.cdSkill <= 0) {
            cast(f, e);
            f.cdSkill = 95;
          }
        });
      }

      state.projectiles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        state.fighters.forEach((f) => {
          if (f === p.from || f.hp <= 0) return;
          if (Math.hypot(p.x - f.cx, p.y - f.cy) < 16) {
            f.hp = clamp(f.hp - (10 + Math.random() * 6), 0, f.hpMax);
            p.life = 0;
            for (let i = 0; i < 7; i += 1) spawnSpark(f.cx, f.cy, '#ffffff');
          }
        });
      });
      state.projectiles = state.projectiles.filter((p) => p.life > 0);

      state.particles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.15 * dt;
        p.life -= dt;
        ctx.globalAlpha = Math.max(0, p.life / 28);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      state.particles = state.particles.filter((p) => p.life > 0);
      ctx.globalAlpha = 1;

      state.projectiles.forEach((p) => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      state.fighters.forEach((f) => {
        ctx.fillStyle = f.color;
        ctx.fillRect(f.x + 6, f.y + 8, 20, 30);
        ctx.fillStyle = '#111';
        ctx.fillRect(f.x + 5, f.y + 38, 22, 4);

        const barW = 44;
        ctx.fillStyle = '#000';
        ctx.fillRect(f.x - 6, f.y - 10, barW + 2, 6);
        ctx.fillStyle = '#44dd44';
        ctx.fillRect(f.x - 5, f.y - 9, barW * (f.hp / f.hpMax), 4);
        ctx.fillStyle = '#f9f9f9';
        ctx.font = '700 8px Rajdhani';
        ctx.fillText(f.name, f.x - 2, f.y - 13);
      });

      requestAnimationFrame(tick);
    };

    requestAnimationFrame((t) => { last = t; requestAnimationFrame(tick); });
  }

  window.BatallaReal = {
    render(centerBodyEl, centerTitleEl, centerBadgeEl) {
      centerTitleEl.textContent = '⚔ SISTEMA BATALLA REAL';
      centerBadgeEl.textContent = 'SIMULACIÓN';
      centerBodyEl.innerHTML = createLayout();
      const panel = centerBodyEl.querySelector('.br-shell');
      const canvas = panel.querySelector('.br-canvas');
      battleRuntime(canvas, panel);
    }
  };
})();

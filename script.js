const state = {
  hp: 7200, hpMax: 10000,
  mp: 550, mpMax: 1000,
  exp: 3800, expMax: 10000,
  level: 42,
  atk: 4820, def: 2310, gold: 98400,
  activeSection: 'hero'
};

const dom = {
  hpFill: document.getElementById('hp-fill'),
  mpFill: document.getElementById('mp-fill'),
  expFill: document.getElementById('exp-fill'),
  hpNums: document.getElementById('hp-nums'),
  mpNums: document.getElementById('mp-nums'),
  expNums: document.getElementById('exp-nums'),
  expNext: document.getElementById('exp-next'),
  statAtk: document.getElementById('stat-atk'),
  statDef: document.getElementById('stat-def'),
  statGold: document.getElementById('stat-gold'),
  centerTitle: document.getElementById('center-title'),
  centerBadge: document.getElementById('center-badge'),
  centerBody: document.getElementById('center-body'),
  tooltip: document.getElementById('tooltip'),
  floatLayer: document.getElementById('float-layer'),
  navGrid: document.getElementById('nav-grid'),
  hudCenter: document.getElementById('hud-center')
};
const heroSystem = new window.BotonHero();

const sectionData = {
  hero: { title: '🥷 Perfil del Héroe', badge: 'HÉROE', cards: [
    { type: 'idle', tag: '📊 Estadísticas', text: 'Fuerza total combinada: <strong>12,450 CP</strong>', sub: 'Rango de poder: S-Class Shinobi' },
    { type: 'mission', tag: '🏅 Logros', text: 'Misiones completadas: <strong>347</strong> · Victorias en batalla: <strong>1,203</strong>', sub: 'Título desbloqueado: "Sombra del Konoha"' },
    { type: 'combat', tag: '⚡ Pasiva activa', text: 'Modo Sabio activo → +15% daño en combate Idle', sub: 'Duración restante: 4h 23min' }
  ] },
  mission: { title: '📜 Misiones', badge: '3 ACTIVAS', cards: [
    { type: 'mission', tag: '🟡 B-Rank · Activa', text: 'Guardianes del Bosque: elimina 5 enemigos', sub: 'Progreso: 3/5 · Recompensa: 5,000 oro + 1,200 EXP' },
    { type: 'mission', tag: '🔴 A-Rank · Pendiente', text: 'Infiltración en la Aldea de la Roca', sub: 'Requerido: Nivel 45 · Recompensa: Pergamino Raro' },
    { type: 'idle', tag: '🟢 Idle · En curso', text: 'Patrulla del Bosque de la Muerte (automática)', sub: 'Tiempo restante: 2h 14min · +80 oro/min' }
  ] },
  clan: { title: '🏯 Clanes', badge: 'MIEMBRO', cards: [
    { type: 'mission', tag: '🏯 Clan: Akatsuki Blanca', text: 'Miembros: <strong>48/50</strong> · Nivel de clan: <strong>7</strong>', sub: 'Bonus activo: +10% EXP grupal' },
    { type: 'combat', tag: '⚔ Guerra de Clanes', text: 'Próximo enfrentamiento: Clan Raikage en <strong>2h 30min</strong>', sub: 'Tu contribución: 12,400 puntos · Rango #3' },
    { type: 'idle', tag: '💰 Tributo', text: 'Tributo semanal recolectado: 340,000 oro', sub: 'Tu aporte: 22,000 oro · Bono pendiente: 3,500 oro' }
  ] },
  events: { title: '🎴 Eventos', badge: 'LIMITADO', cards: [
    { type: 'combat', tag: '🔥 Evento Especial', text: 'Festival del Fuego: jornada final', sub: 'Tiempo restante: 23h 14min · Puntos: 8,400/10,000' },
    { type: 'mission', tag: '🎁 Recompensas', text: 'Desbloquea a <strong>Minato Namikaze</strong> con 10,000 puntos', sub: 'Te faltan: 1,600 puntos' },
    { type: 'idle', tag: '📅 Próximo evento', text: 'Torneo de los Cinco Kages · Inicia en 3 días', sub: 'Inscripción gratuita disponible' }
  ] },
  jutsu: { title: '🌀 Jutsus', badge: '12 ACTIVOS', cards: [
    { type: 'combat', tag: '💥 Jutsu S-Rank', text: '<strong>Rasengan Supremo</strong> · Daño: 8,400 – 9,200', sub: 'Costo: 180 MP · Cooldown: 30s · Disponible ahora' },
    { type: 'mission', tag: '🌊 Jutsu A-Rank', text: '<strong>Tormenta de Shurikens</strong> · Daño: 4,200 x3', sub: 'Costo: 90 MP · Cooldown: 15s' },
    { type: 'idle', tag: '🛡 Jutsu Pasivo', text: '<strong>Armadura de Chakra</strong> · +20% DEF permanente', sub: 'Siempre activo · No consume MP' }
  ] },
  battle: { title: '⚔ Batallas', badge: 'EN COMBATE', cards: [
    { type: 'combat', tag: '⚔ Combate Activo', text: 'Kazuma vs. Orochimaru Rogue · Ronda 7/10', sub: 'Tu HP: 7,200 · Enemigo HP: 3,800 / 12,000' },
    { type: 'mission', tag: '🏆 Arena PvP', text: 'Liga de Ninjas · Temporada 4 · Rank: Platino II', sub: 'Racha de victorias: 7 · Tasa de victoria: 68%' },
    { type: 'idle', tag: '🤖 Idle Combat', text: 'Dungeon Automático: Cueva de los Susanoo · Piso 34', sub: 'Oro/min: +420 · EXP/min: +280' }
  ] },
  summon: { title: '🐉 Invocaciones', badge: 'X10 DISP.', cards: [
    { type: 'mission', tag: '⭐ Invocación Premium', text: 'Pergaminos disponibles: <strong>10</strong> · Próxima garantía en 40 tiros', sub: 'Tasa SSR: 3.0% · Tasa SR: 15%' },
    { type: 'combat', tag: '🐸 Invocado activo', text: 'Gamabunta · Nivel 38 · Bonus: +25% daño en área', sub: 'Stamina: 94% · Próxima mejora: Lv.40' },
    { type: 'idle', tag: '📦 Colección', text: 'Invocaciones desbloqueadas: 14 / 42', sub: 'Última obtenida: Manda la Serpiente (SR)' }
  ] },
  tree: { title: '🌿 Árbol de Habilidad', badge: '5 PTS DISP.', cards: [
    { type: 'mission', tag: '🌿 Rama Ninjutsu', text: 'Puntos invertidos: 24 / 30 · Próximo nodo: Lv.3 Fuego', sub: 'Bonificación: +12% daño de fuego acumulado' },
    { type: 'idle', tag: '💪 Rama Taijutsu', text: 'Puntos invertidos: 18 / 30 · Nodo activo: Velocidad III', sub: 'Bonificación: +8% velocidad de ataque' },
    { type: 'combat', tag: '⚡ Puntos disponibles', text: 'Tienes <strong>5 puntos de habilidad</strong> sin asignar', sub: 'Consejo: Invierte en Ninjutsu para misiones actuales' }
  ] },
  settings: { title: '⚙ Ajustes', badge: 'CONFIG', cards: [
    { type: 'idle', tag: '🔊 Audio', text: 'Música: ON · Efectos: ON · Voz: OFF', sub: 'Volumen música: 70% · Volumen FX: 90%' },
    { type: 'mission', tag: '📱 Rendimiento', text: 'Modo gráfico: Alto · FPS objetivo: 60', sub: 'Batería en segundo plano: Ahorro activo' },
    { type: 'combat', tag: '🔔 Notificaciones', text: 'Alertas de misión: ON · Invasión de clan: ON', sub: 'Silencio nocturno: 23:00 – 07:00' }
  ] }
};

const nf = new Intl.NumberFormat('es-ES');
function formatGold(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function updateBars() {
  const hpPct = Math.round((state.hp / state.hpMax) * 100);
  const mpPct = Math.round((state.mp / state.mpMax) * 100);
  const expPct = Math.round((state.exp / state.expMax) * 100);

  dom.hpFill.style.width = `${hpPct}%`;
  dom.mpFill.style.width = `${mpPct}%`;
  dom.expFill.style.width = `${expPct}%`;

  dom.hpNums.textContent = `${nf.format(state.hp)} / ${nf.format(state.hpMax)} · ${hpPct}%`;
  dom.mpNums.textContent = `${nf.format(state.mp)} / ${nf.format(state.mpMax)} · ${mpPct}%`;
  dom.expNums.textContent = `${nf.format(state.exp)} / ${nf.format(state.expMax)}`;
  dom.expNext.textContent = `Siguiente nivel: ${nf.format(state.expMax - state.exp)} EXP`;
  dom.statAtk.textContent = nf.format(state.atk);
  dom.statDef.textContent = nf.format(state.def);
  dom.statGold.textContent = formatGold(state.gold);
}

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d', { alpha: true });
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });

function spawnParticles(x, y, type = 'smoke') {
  const count = type === 'chakra' ? 18 : 12;
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = type === 'chakra' ? 1.5 + Math.random() * 3.5 : 0.5 + Math.random() * 2;
    const color = type === 'chakra'
      ? `hsl(${200 + Math.random() * 40}, 90%, 65%)`
      : `rgba(${160 + Math.random() * 60}, ${160 + Math.random() * 40}, 140,`;

    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (type === 'chakra' ? 2 : 0.5),
      life: 1,
      decay: type === 'chakra' ? 0.03 + Math.random() * 0.03 : 0.015 + Math.random() * 0.02,
      size: type === 'chakra' ? 3 + Math.random() * 4 : 6 + Math.random() * 10,
      color,
      type
    });
  }
}

function animateParticles() {
  if (document.hidden) {
    requestAnimationFrame(animateParticles);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter((p) => p.life > 0);

  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.life;
    if (p.type === 'chakra') {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
    } else {
      ctx.fillStyle = `${p.color}${p.life * 0.5})`;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.type === 'chakra' ? 1 : p.life), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life -= p.decay;
    p.size *= 0.99;
  }

  requestAnimationFrame(animateParticles);
}
animateParticles();

function spawnFloat(x, y, text, type = 'damage') {
  const el = document.createElement('div');
  el.className = `stat-float ${type}`;
  el.textContent = text;
  el.style.left = `${x - 30}px`;
  el.style.top = `${y - 20}px`;
  dom.floatLayer.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

function renderSection(section, btn) {
  const data = sectionData[section];
  if (!data) return;

  state.activeSection = section;
  dom.centerTitle.textContent = data.title;
  dom.centerBadge.textContent = data.badge;
  dom.centerBody.innerHTML = '';
  dom.centerBody.classList.toggle('hero-section-active', section === 'hero');
  dom.hudCenter.classList.toggle('hero-layout', section === 'hero');

  if (section === 'hero') {
    dom.centerTitle.textContent = '🥷 Centro de Héroe';
    dom.centerBadge.textContent = 'HÉROE';
    heroSystem.render(dom.centerBody);
  } else {
    data.cards.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = `event-card ${card.type}`;
      el.style.animationDelay = `${i * 0.07}s`;
      el.innerHTML = `<div class="event-tag">${card.tag}</div><div class="event-text">${card.text}</div><div class="event-sub">${card.sub}</div>`;
      dom.centerBody.appendChild(el);
    });
  }

  if (btn) {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    spawnParticles(cx, cy, 'smoke');
    spawnParticles(cx, cy, 'chakra');
    spawnFloat(cx, cy, '+Chakra', 'chakra');
  }
}

dom.navGrid.addEventListener('click', (event) => {
  const btn = event.target.closest('.nav-btn');
  if (!btn) return;

  dom.navGrid.querySelectorAll('.nav-btn').forEach((el) => el.classList.remove('active'));
  btn.classList.add('active');
  renderSection(btn.dataset.section, btn);
});

dom.navGrid.addEventListener('mouseover', (event) => {
  const btn = event.target.closest('.nav-btn');
  if (!btn || !event.relatedTarget || btn.contains(event.relatedTarget)) return;
  dom.tooltip.textContent = btn.dataset.tip;
  dom.tooltip.classList.add('show');
});

window.addEventListener('mousemove', (event) => {
  if (!dom.tooltip.classList.contains('show')) return;
  dom.tooltip.style.left = `${event.clientX + 12}px`;
  dom.tooltip.style.top = `${event.clientY - 28}px`;
}, { passive: true });

dom.navGrid.addEventListener('mouseout', (event) => {
  const btn = event.target.closest('.nav-btn');
  if (!btn || !event.relatedTarget || btn.contains(event.relatedTarget)) return;
  dom.tooltip.classList.remove('show');
});

function idleLoop() {
  if (state.mp < state.mpMax) state.mp = Math.min(state.mpMax, state.mp + 5);
  state.exp = Math.min(state.expMax, state.exp + Math.floor(Math.random() * 50 + 20));
  if (state.exp >= state.expMax) {
    state.exp = 0;
    state.level += 1;
  }

  state.gold += Math.floor(Math.random() * 80 + 20);

  const dmg = Math.floor(Math.random() * 80);
  state.hp = Math.max(1, Math.min(state.hpMax, state.hp - dmg + Math.floor(Math.random() * 60)));

  updateBars();

  if (Math.random() < 0.4) {
    const types = [['damage', `−${dmg}`], ['exp', '+EXP'], ['gold', '+Oro']];
    const [t, txt] = types[Math.floor(Math.random() * types.length)];
    const x = 60 + Math.random() * (window.innerWidth - 120);
    const y = window.innerHeight * 0.35 + Math.random() * (window.innerHeight * 0.3);
    spawnFloat(x, y, txt, t);
  }
}

setInterval(idleLoop, 1200);
updateBars();

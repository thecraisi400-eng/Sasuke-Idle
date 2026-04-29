const BASE_PLAYER = {
  level: 1,
  exp: 0,
  expMax: 68,
  gold: 0,
  hpMax: 100,
  mpMax: 50,
  hp: 100,
  mp: 50,
  atk: 15,
  def: 10,
  agi: 12,
  int: 10,
  luk: 5,
  res: 6,
  cri: 5,
  critDmg: 150
};

const GAME_STATE = {
  ...BASE_PLAYER,
  hero: {
    name: 'Sasuke',
    clan: 'Clan Uchiha',
    rank: 'ANBU',
    gearLevels: Array(8).fill(1)
  },
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
  statLevelBadge: document.getElementById('stat-level-badge'),
  statLevelCurrent: document.getElementById('stat-level-current'),
  centerTitle: document.getElementById('center-title'),
  centerBadge: document.getElementById('center-badge'),
  centerBody: document.getElementById('center-body'),
  tooltip: document.getElementById('tooltip'),
  floatLayer: document.getElementById('float-layer'),
  navGrid: document.getElementById('nav-grid')
};

const heroGearConfig = [
  { id: 0, name: 'Mano Principal', icon: '🗡️', stats: [{ key: 'STR', prop: 'atk', gain: 3, percent: false }, { key: 'C.DMG', prop: 'critDmg', gain: 1.5, percent: true }] },
  { id: 1, name: 'Cabeza', icon: '🪖', stats: [{ key: 'INT', prop: 'int', gain: 3, percent: false }, { key: 'MP', prop: 'mpMax', gain: 8, percent: false }] },
  { id: 2, name: 'Torso', icon: '🛡️', stats: [{ key: 'HP', prop: 'hpMax', gain: 25, percent: false }, { key: 'DEF', prop: 'def', gain: 4, percent: false }] },
  { id: 3, name: 'Piernas', icon: '👖', stats: [{ key: 'AGI', prop: 'agi', gain: 2, percent: false }, { key: 'LUK', prop: 'luk', gain: 0.5, percent: false }] },
  { id: 4, name: 'Pies', icon: '🥾', stats: [{ key: 'AGI', prop: 'agi', gain: 2, percent: false }, { key: 'HP', prop: 'hpMax', gain: 20, percent: false }] },
  { id: 5, name: 'Cuello', icon: '📿', stats: [{ key: 'RES', prop: 'res', gain: 0.2, percent: true }, { key: 'MP', prop: 'mpMax', gain: 6, percent: false }] },
  { id: 6, name: 'Anillo', icon: '💍', stats: [{ key: 'CRI', prop: 'cri', gain: 0.063, percent: true }, { key: 'LUK', prop: 'luk', gain: 0.5, percent: false }] },
  { id: 7, name: 'Accesorio', icon: '⛓️', stats: [{ key: 'DEF', prop: 'def', gain: 3, percent: false }, { key: 'RES', prop: 'res', gain: 0.15, percent: true }] }
];

const sectionData = {
  hero: { title: '🥷 Perfil del Héroe', badge: 'HÉROE', cards: [] },
  mission: { title: '📜 Misiones', badge: 'ACTIVAS', cards: [] },
  clan: { title: '🏯 Clanes', badge: 'MIEMBRO', cards: [] },
  events: { title: '🎴 Eventos', badge: 'LIMITADO', cards: [] },
  jutsu: { title: '🌀 Jutsus', badge: 'ACTIVOS', cards: [] },
  battle: { title: '⚔ Batallas', badge: 'EN CURSO', cards: [] },
  summon: { title: '🐉 Invocaciones', badge: 'DISP.', cards: [] },
  settings: { title: '⚙ Ajustes', badge: 'CONFIG', cards: [] }
};

const nf = new Intl.NumberFormat('es-ES');
const SAVE_KEY = 'sasuke_idle_save_v2';

function getExpRequired(level) {
  return Math.round(67.5 * (level ** 2));
}

function recalcDerivedStats() {
  const level = GAME_STATE.level;
  GAME_STATE.hpMax = 100 + (15 * (level - 1));
  GAME_STATE.mpMax = 50 + (12 * (level - 1));
  GAME_STATE.atk = 15 + (8 * (level - 1));
  GAME_STATE.agi = 12 + (3 * (level - 1));
  GAME_STATE.int = 10 + (10 * (level - 1));
  GAME_STATE.luk = 5 + (0.5 * (level - 1));
  GAME_STATE.def = 10 + (5 * (level - 1));
  GAME_STATE.res = 6 + (0.12 * (level - 1));
  GAME_STATE.cri = Math.min(30, 5 + (0.25 * (level - 1)));
  GAME_STATE.critDmg = 150 + (2 * (level - 1));

  GAME_STATE.hero.gearLevels.forEach((gearLevel, idx) => {
    const item = heroGearConfig[idx];
    if (!item) return;
    item.stats.forEach((stat) => {
      GAME_STATE[stat.prop] += stat.gain * gearLevel;
    });
  });

  GAME_STATE.hp = Math.min(GAME_STATE.hp, GAME_STATE.hpMax);
  GAME_STATE.mp = Math.min(GAME_STATE.mp, GAME_STATE.mpMax);
  GAME_STATE.expMax = getExpRequired(level);
}

function newGame() {
  Object.assign(GAME_STATE, {
    ...BASE_PLAYER,
    hero: { ...GAME_STATE.hero, gearLevels: Array(8).fill(1) }
  });
  recalcDerivedStats();
  GAME_STATE.hp = GAME_STATE.hpMax;
  GAME_STATE.mp = GAME_STATE.mpMax;
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(GAME_STATE));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return false;
    Object.assign(GAME_STATE, parsed);
    if (!Array.isArray(GAME_STATE.hero?.gearLevels) || GAME_STATE.hero.gearLevels.length !== 8) {
      GAME_STATE.hero.gearLevels = Array(8).fill(1);
    }
    recalcDerivedStats();
    return true;
  } catch {
    return false;
  }
}

function formatGold(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function updateBars() {
  const hpPct = Math.round((GAME_STATE.hp / GAME_STATE.hpMax) * 100);
  const mpPct = Math.round((GAME_STATE.mp / GAME_STATE.mpMax) * 100);
  const expPct = Math.round((GAME_STATE.exp / GAME_STATE.expMax) * 100);

  dom.hpFill.style.width = `${hpPct}%`;
  dom.mpFill.style.width = `${mpPct}%`;
  dom.expFill.style.width = `${expPct}%`;

  dom.hpNums.textContent = `${nf.format(GAME_STATE.hp)} / ${nf.format(GAME_STATE.hpMax)} · ${hpPct}%`;
  dom.mpNums.textContent = `${nf.format(GAME_STATE.mp)} / ${nf.format(GAME_STATE.mpMax)} · ${mpPct}%`;
  dom.expNums.textContent = `${nf.format(GAME_STATE.exp)} / ${nf.format(GAME_STATE.expMax)}`;
  dom.expNext.textContent = `Siguiente nivel: ${nf.format(GAME_STATE.expMax - GAME_STATE.exp)} EXP`;
  dom.statAtk.textContent = nf.format(GAME_STATE.atk);
  dom.statDef.textContent = nf.format(GAME_STATE.def);
  dom.statGold.textContent = `💰 ${formatGold(GAME_STATE.gold)}`;
  dom.statLevelBadge.textContent = `Lv.${GAME_STATE.level}`;
  dom.statLevelCurrent.textContent = `Nivel actual: ${GAME_STATE.level}`;
}

function getDynamicCards(section) {
  const lvl = GAME_STATE.level;
  const missionGoal = 3 + Math.ceil(lvl * 0.8);
  const missionProgress = Math.min(missionGoal, Math.floor((GAME_STATE.exp / GAME_STATE.expMax) * missionGoal));
  const nextMilestone = lvl + 2;

  const map = {
    mission: [
      { type: 'mission', tag: '🟡 B-Rank · Activa', text: `Guardianes del Bosque: elimina ${missionGoal} enemigos`, sub: `Progreso: ${missionProgress}/${missionGoal} · Recompensa: 💰 ${nf.format(200 + lvl * 90)} + ${nf.format(60 + lvl * 25)} EXP` },
      { type: 'mission', tag: '🔴 A-Rank · Pendiente', text: 'Infiltración en la Aldea de la Roca', sub: `Requerido: Nivel ${nextMilestone} · Recompensa: Pergamino Raro` },
      { type: 'idle', tag: '🟢 Exploración', text: 'Patrulla del Bosque de la Muerte', sub: 'No genera recompensas automáticas' }
    ],
    clan: [
      { type: 'mission', tag: '🏯 Clan', text: `Nivel de clan sugerido: ${Math.max(1, Math.floor(lvl / 3))}`, sub: `Bonus grupal: +${Math.min(20, 5 + lvl)}% EXP` },
      { type: 'combat', tag: '⚔ Guerra de Clanes', text: `Contribución actual: ${nf.format(GAME_STATE.gold)} puntos`, sub: `Meta semanal: ${nf.format(2000 + lvl * 400)}` },
      { type: 'idle', tag: '💰 Tributo', text: `Tributo acumulado: 💰 ${formatGold(Math.round(GAME_STATE.gold * 0.25))}`, sub: `Aporte por minuto según nivel ${lvl}` }
    ],
    events: [
      { type: 'combat', tag: '🔥 Evento Especial', text: `Festival del Fuego · Escala con nivel ${lvl}`, sub: `Objetivo: ${nf.format(1000 + lvl * 150)} pts` },
      { type: 'mission', tag: '🎁 Recompensas', text: 'Progreso de recompensas dinámico', sub: `Siguiente recompensa en nivel ${lvl + 1}` },
      { type: 'idle', tag: '📅 Próximo evento', text: 'Torneo de los Cinco Kages', sub: `Dificultad recomendada: Nivel ${lvl}` }
    ],
    jutsu: [
      { type: 'combat', tag: '💥 Jutsu Principal', text: `Daño base: ${nf.format(GAME_STATE.atk * 2)} - ${nf.format(Math.round(GAME_STATE.atk * 2.3))}`, sub: `Costo: ${Math.max(10, Math.round(GAME_STATE.mpMax * 0.12))} MP` },
      { type: 'mission', tag: '🌊 Jutsu Secundario', text: `Daño por golpe: ${nf.format(Math.round(GAME_STATE.atk * 0.8))} x3`, sub: `Escala con nivel ${lvl}` },
      { type: 'idle', tag: '🛡 Jutsu Pasivo', text: `Mitigación: +${Math.min(40, Math.round(GAME_STATE.def / 12))}% DEF`, sub: 'Siempre activo' }
    ],
    battle: [
      { type: 'combat', tag: '⚔ Combate Activo', text: `Ronda ${Math.max(1, lvl)} · Enemigo escalado`, sub: `Tu HP: ${nf.format(GAME_STATE.hp)} / ${nf.format(GAME_STATE.hpMax)}` },
      { type: 'mission', tag: '🏆 Arena PvP', text: `Liga de Ninjas · División ${Math.max(1, Math.ceil(lvl / 10))}`, sub: `Poder actual: ${nf.format(GAME_STATE.atk + GAME_STATE.def)}` },
      { type: 'idle', tag: '🤖 Simulación', text: `Dungeon · Piso ${Math.max(1, lvl)}`, sub: 'Sin ganancias automáticas por tiempo' }
    ],
    summon: [
      { type: 'mission', tag: '⭐ Invocación', text: `Pergaminos: ${Math.floor(GAME_STATE.gold / 500)}`, sub: 'Tasa SSR: 3.0% · SR: 15%' },
      { type: 'combat', tag: '🐸 Invocado activo', text: `Nivel invocado: ${Math.max(1, Math.floor(lvl * 0.9))}`, sub: `Bonus daño: +${Math.min(50, lvl)}%` },
      { type: 'idle', tag: '📦 Colección', text: `Invocaciones desbloqueadas: ${Math.min(42, lvl)} / 42`, sub: 'Se desbloquean al subir nivel' }
    ],
    settings: sectionData.settings.cards.length ? sectionData.settings.cards : [
      { type: 'idle', tag: '🔊 Audio', text: 'Música: ON · Efectos: ON · Voz: OFF', sub: 'Volumen música: 70% · Volumen FX: 90%' },
      { type: 'mission', tag: '📱 Rendimiento', text: 'Modo gráfico: Alto · FPS objetivo: 60', sub: 'Batería en segundo plano: Ahorro activo' },
      { type: 'combat', tag: '🔔 Notificaciones', text: 'Alertas de misión: ON · Invasión de clan: ON', sub: 'Silencio nocturno: 23:00 – 07:00' }
    ]
  };

  return map[section] || [];
}

function renderSection(section, btn) {
  const data = sectionData[section];
  if (!data) return;
  GAME_STATE.activeSection = section;
  const hudCenter = document.getElementById('hud-center');
  hudCenter.classList.remove('hero-mode', 'mission-mode');

  if (section === 'hero' && window.BotonHero) {
    window.BotonHero.render(dom.centerBody, dom.centerTitle, dom.centerBadge, hudCenter, GAME_STATE, heroGearConfig, saveGame, recalcDerivedStats, updateBars);
  } else if (section === 'mission' && window.MisionesTotal) {
    hudCenter.classList.add('mission-mode');
    window.MisionesTotal.render(dom.centerBody, dom.centerTitle, dom.centerBadge, GAME_STATE, (mission) => {
      GAME_STATE.gold += mission.oro;
      GAME_STATE.exp += mission.xp;
      while (GAME_STATE.exp >= GAME_STATE.expMax) {
        GAME_STATE.exp -= GAME_STATE.expMax;
        GAME_STATE.level += 1;
        recalcDerivedStats();
        GAME_STATE.hp = GAME_STATE.hpMax;
        GAME_STATE.mp = GAME_STATE.mpMax;
      }
      saveGame();
      updateBars();
    });
  } else {
    dom.centerTitle.textContent = data.title;
    dom.centerBadge.textContent = data.badge;
    dom.centerBody.innerHTML = '';
    const cards = getDynamicCards(section);
    cards.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = `event-card ${card.type}`;
      el.style.animationDelay = `${i * 0.07}s`;
      el.innerHTML = `<div class="event-tag">${card.tag}</div><div class="event-text">${card.text}</div><div class="event-sub">${card.sub}</div>`;
      dom.centerBody.appendChild(el);
    });
  }

  if (btn) {
    const rect = btn.getBoundingClientRect();
    spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 'smoke');
  }
}

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d', { alpha: true });
let particles = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });
function spawnParticles(x, y, type = 'smoke') { particles.push({ x, y, vx: Math.random() * 2 - 1, vy: -1 - Math.random(), life: 1, decay: 0.02, size: 3 + Math.random() * 6, color: type === 'smoke' ? 'rgba(180,180,180,' : 'rgba(90,180,255,' }); }
function animateParticles() { ctx.clearRect(0, 0, canvas.width, canvas.height); particles = particles.filter((p) => p.life > 0); for (const p of particles) { ctx.fillStyle = `${p.color}${p.life})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill(); p.x += p.vx; p.y += p.vy; p.life -= p.decay; } requestAnimationFrame(animateParticles); }
animateParticles();

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

if (!loadGame()) newGame();
recalcDerivedStats();
updateBars();
renderSection('hero');

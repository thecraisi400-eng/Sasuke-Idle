// ══════════════════════════════════════
//  GAME STATE
// ══════════════════════════════════════
const state = {
  gold       : 0,
  special    : 0,        // 💲
  level      : 1,        // player level, starts at 1
  xp         : 0,        // 0–100; fills completely each kill → level up
  dps        : 1,        // FIXED at 1; only upgradeable via Picos
  clickDmg   : 1,        // FIXED at 1; upgradeable via Picos
  pickSpeedLevel: 0,
  pickCritLevel : 0,

  rockLevel  : 1,        // current rock difficulty
  rockHpMax  : 0,
  rockHpCur  : 0,

  isShaking  : false,
  sectionOpen: false,
  crackPool  : [],
};

const baseHitRate = 1;
const baseCritChance = 0.0002; // 0.02%
const speedPerLevel = 0.02;
const critPerLevel = 0.00015; // 0.015%

function getHitRate() {
  return baseHitRate + state.pickSpeedLevel * speedPerLevel;
}
function getCritChance() {
  return baseCritChance + state.pickCritLevel * critPerLevel;
}

// ── Rock HP formula (hard difficulty)
// Level 1 → 30 HP, each subsequent rock ×3 harder
function calcRockHp(rl) {
  return Math.floor(35 * Math.pow(2.4, rl - 1));
}

// ── Gold reward per kill (scales with player level)
// Level 1 → 5 gold; each level multiplies reward by 2
function calcGoldReward(lvl) {
  return Math.floor(8 * Math.pow(1.7, lvl - 1));
}

// ── Init rock
function initRock() {
  state.rockHpMax = calcRockHp(state.rockLevel);
  state.rockHpCur = state.rockHpMax;
  state.crackPool = buildCrackPool(25);
}


function buildCrackPool(total = 25) {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const pts = [];
  const minDist = 11;
  let guard = 0;

  while (pts.length < total && guard < 1800) {
    guard++;
    const x = 14 + Math.random() * 72;
    const y = 12 + Math.random() * 76;
    if (pts.every(([px, py]) => Math.hypot(x - px, y - py) >= minDist)) pts.push([x, y]);
  }

  return pts.map(([x, y]) => {
    const segments = Math.random() < 0.35 ? 3 : 2;
    const crackType = Math.random();
    const baseLen = crackType < 0.3 ? 14 + Math.random() * 11 : 6 + Math.random() * 9;
    const roughness = 1.2 + Math.random() * 2.1;
    let currentX = x;
    let currentY = y;
    let angle = Math.random() * Math.PI * 2;
    const parts = [`M ${x.toFixed(1)} ${y.toFixed(1)}`];

    for (let i = 0; i < segments; i++) {
      const segLen = baseLen * (0.6 + Math.random() * 0.55);
      angle += (Math.random() - 0.5) * 0.9;
      const nextX = clamp(currentX + Math.cos(angle) * segLen, 6, 94);
      const nextY = clamp(currentY + Math.sin(angle) * segLen, 8, 92);
      const midx = (currentX + nextX) / 2 + (Math.random() - 0.5) * roughness;
      const midy = (currentY + nextY) / 2 + (Math.random() - 0.5) * roughness;
      parts.push(`Q ${midx.toFixed(1)} ${midy.toFixed(1)} ${nextX.toFixed(1)} ${nextY.toFixed(1)}`);
      currentX = nextX;
      currentY = nextY;
    }

    return {
      d: parts.join(' '),
      w: crackType < 0.3 ? (1.8 + Math.random() * 1.1).toFixed(2) : (0.7 + Math.random() * 1.1).toFixed(2),
      opacity: (0.56 + Math.random() * 0.32).toFixed(2),
    };
  });
}

// ══════════════════════════════════════
//  FORMATTERS
// ══════════════════════════════════════
function fmt(n) {
  n = Math.floor(n);
  if (n >= 1e12) return (n/1e12).toFixed(1) + 'T';
  if (n >= 1e9)  return (n/1e9 ).toFixed(1) + 'B';
  if (n >= 1e6)  return (n/1e6 ).toFixed(1) + 'M';
  if (n >= 1e3)  return (n/1e3 ).toFixed(1) + 'K';
  return n.toString();
}
function fmtHp(n) {
  n = Math.ceil(Math.max(0, n));
  if (n >= 1e12) return (n/1e12).toFixed(1) + 'T';
  if (n >= 1e9)  return (n/1e9 ).toFixed(1) + 'B';
  if (n >= 1e6)  return (n/1e6 ).toFixed(1) + 'M';
  if (n >= 1e3)  return (n/1e3 ).toFixed(1) + 'K';
  return n.toString();
}

// ══════════════════════════════════════
//  UI UPDATE
// ══════════════════════════════════════
function updateUI() {
  document.getElementById('gold-display').textContent    = fmt(state.gold);
  document.getElementById('special-display').textContent = fmt(state.special);
  document.getElementById('dps-display').textContent     = fmt(state.dps) + ' DPS';
  document.getElementById('level-label').textContent     = '⭐ NIV ' + state.level;
  document.getElementById('xp-bar').style.width          = Math.min(100, state.xp) + '%';

  const pct = Math.max(0, state.rockHpCur / state.rockHpMax * 100);
  document.getElementById('hp-red').style.width  = pct + '%';
  document.getElementById('hp-text').textContent =
    fmtHp(state.rockHpCur) + ' / ' + fmtHp(state.rockHpMax);
  renderSectionContent();
}

// ══════════════════════════════════════
//  DAMAGE NUMBERS + DEBRIS
// ══════════════════════════════════════
const DAMAGE_COLORS = {
  auto: 'dmg-white',
  crit: 'dmg-red',
  click: 'dmg-yellow',
};
const critPfx   = ['','','💥 ','⚡ ','🔥 '];

function spawnDmg(x, y, value, colorClass, isCrit) {
  const cave = document.getElementById('cave');
  if (!cave) return;
  const el   = document.createElement('div');
  el.className = 'damage-number ' + colorClass;
  const pfx  = isCrit ? critPfx[Math.floor(Math.random()*critPfx.length)] : '';
  el.textContent = pfx + fmtHp(value);
  if (isCrit) { el.style.fontSize='clamp(15px,4.2vw,22px)'; el.style.color='#FF4081'; }
  const rect = cave.getBoundingClientRect();
  el.style.left = (x - rect.left - 16) + 'px';
  el.style.top  = (y - rect.top  - 16) + 'px';
  el.style.setProperty('--dx', ((Math.random()-0.5)*48) + 'px');
  document.getElementById('particle-layer').appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function spawnDebris(x, y, intensity = 1) {
  const cave  = document.getElementById('cave');
  if (!cave) return;
  const rect  = cave.getBoundingClientRect();
  const cols  = ['#6b6b7e','#4a4a5a','#8d8d9a','#9ea7b3','#a1887f','#cfd8dc'];
  const amount = Math.max(5, Math.floor(10 * intensity));
  for (let i = 0; i < amount; i++) {
    const d  = document.createElement('div');
    d.className = 'debris';
    const sz = 3 + Math.random()*6;
    d.style.cssText = `width:${sz}px;height:${sz}px;background:${cols[Math.floor(Math.random()*cols.length)]};
      left:${x-rect.left}px;top:${y-rect.top}px;
      --dx:${(Math.random()-0.5)*(90*intensity)}px;--dy:${-(20+Math.random()*70*intensity)}px;--dur:${0.35+Math.random()*0.45}s;`; 
    document.getElementById('particle-layer').appendChild(d);
    d.addEventListener('animationend', () => d.remove());
  }
}


function spawnImpactBurst(intensity = 1) {
  const cave = document.getElementById('cave');
  const layer = document.getElementById('particle-layer');
  const rock = document.getElementById('rock');
  if (!cave || !layer || !rock) return;
  const caveRect = cave.getBoundingClientRect();
  const rockRect = rock.getBoundingClientRect();
  const cx = rockRect.left + rockRect.width / 2 - caveRect.left;
  const cy = rockRect.top + rockRect.height / 2 - caveRect.top;
  const maxR = Math.min(rockRect.width, rockRect.height) * 0.5;
  const count = Math.max(14, Math.floor(20 * intensity));

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'impact-particle';
    const angle = Math.random() * Math.PI * 2;
    const dist = (0.2 + Math.random() * 0.8) * maxR;
    const size = 3 + Math.random() * 7;
    p.style.cssText = `left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;--dur:${0.28+Math.random()*0.28}s;`;
    layer.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

function generateRockCracks() {
  const layer = document.getElementById('rock-cracks');
  if (!layer) return;

  const hpPct = (state.rockHpCur / state.rockHpMax) * 100;
  const targets = [
    { hp: 90, cracks: 2 }, { hp: 80, cracks: 4 }, { hp: 70, cracks: 6 },
    { hp: 60, cracks: 8 }, { hp: 50, cracks: 10 }, { hp: 40, cracks: 13 },
    { hp: 30, cracks: 16 }, { hp: 15, cracks: 19 }, { hp: 5, cracks: 25 },
  ];
  let crackCount = 0;
  for (const t of targets) if (hpPct <= t.hp) crackCount = t.cracks;

  layer.innerHTML = '';
  const visible = state.crackPool.slice(0, crackCount);
  for (const crack of visible) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', crack.d);
    path.setAttribute('stroke', `rgba(22,12,12,${crack.opacity ?? '0.82'})`);
    path.setAttribute('stroke-width', crack.w);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('fill', 'none');
    layer.appendChild(path);
  }
}
// ══════════════════════════════════════
//  LEVEL UP
// ══════════════════════════════════════
function doLevelUp() {
  state.level++;
  state.xp = 0;
  const cave   = document.getElementById('cave');
  if (!cave) return;
  const banner = document.createElement('div');
  banner.className   = 'level-up-banner';
  banner.textContent = '⬆ NIVEL ' + state.level + ' ⬆';
  cave.appendChild(banner);
  banner.addEventListener('animationend', () => banner.remove());
}

// ══════════════════════════════════════
//  ROCK RESPAWN
// ══════════════════════════════════════
function respawnRock() {
  // Award gold based on current player level
  const reward = calcGoldReward(state.level);
  state.gold  += reward;

  // Each kill → level up (1 rock = 1 level)
  doLevelUp();

  // Advance rock level and recalculate HP
  state.rockLevel++;
  initRock();
generateRockCracks();

  // Flash
  const rock = document.getElementById('rock');
  if (rock) {
    rock.style.filter = 'drop-shadow(0 0 16px #FFD740) brightness(2.2)';
    setTimeout(() => { rock.style.filter = ''; }, 260);
  }

  // Gold popup near rock container
  const cave = document.getElementById('cave');
  if (cave) {
    const rect = cave.getBoundingClientRect();
    spawnDmg(rect.left + rect.width*0.40, rect.top + rect.height*0.48, reward, 'dmg-yellow', true);
  }

  updateUI();
}

// ══════════════════════════════════════
//  CLICK ROCK
// ══════════════════════════════════════
function clickRock(e) {
  if (e) e.stopPropagation();

  // Shake
  const rock = document.getElementById('rock');
  if (rock && !state.isShaking) {
    state.isShaking = true;
    rock.classList.add('shake');
    rock.addEventListener('animationend', () => {
      rock.classList.remove('shake');
      state.isShaking = false;
    }, { once: true });
  }

  // Damage: clickDmg ±10%, 8% chance crit ×2.5
  const base   = state.clickDmg * (0.9 + Math.random()*0.2);
  const isCrit = Math.random() < getCritChance();
  const dmg    = isCrit ? base * 2 : base;

  state.rockHpCur = Math.max(0, state.rockHpCur - dmg);

  const cx = e ? e.clientX : window.innerWidth/2;
  const cy = e ? e.clientY : window.innerHeight/2;
  spawnDmg(cx, cy, dmg, isCrit ? DAMAGE_COLORS.crit : DAMAGE_COLORS.click, isCrit);

  if (Math.random() < 0.32) {
    setTimeout(() => {
      spawnDmg(cx+(Math.random()-0.5)*44, cy+(Math.random()-0.5)*32,
        dmg*(0.22+Math.random()*0.32), DAMAGE_COLORS.click, false);
    }, 65);
  }

  spawnDebris(cx, cy, 1.2);
  spawnImpactBurst(1.15);
  generateRockCracks();
  if (state.rockHpCur <= 0) respawnRock();
  updateUI();
}

// ══════════════════════════════════════
//  CAVE CLICK  (background only)
// ══════════════════════════════════════
function handleCaveClick(e) {
  if (state.sectionOpen) return;
  const t = e.target;
  // Only the rock SVG triggers damage
  if (t === document.getElementById('rock') || (t.closest && t.closest('#rock'))) return;
}

// ══════════════════════════════════════
//  IDLE TICK  — DPS is FIXED at 1
// ══════════════════════════════════════
let lastTick = Date.now();
function idleTick() {
  const now = Date.now();
  const dt  = (now - lastTick) / 1000;
  lastTick  = now;

  if (!state.sectionOpen) {
    const isCrit = Math.random() < getCritChance();
    const dmg = state.dps * getHitRate() * dt * (isCrit ? 2 : 1);
    state.rockHpCur = Math.max(0, state.rockHpCur - dmg);
    generateRockCracks();
    if (state.rockHpCur <= 0) respawnRock();
  }
  updateUI();
}
setInterval(idleTick, 100);

// ══════════════════════════════════════
//  SECTION NAVIGATION
// ══════════════════════════════════════
const sectionColors = {
  picks:'#0D47A1', clans:'#1565C0', battle:'#B71C1C',
  attrs:'#E65100', arena:'#880E4F', events:'#4A148C',
  prestige:'#3E2723', pets:'#1B5E20', settings:'#263238',
};

let activeKey = null;
let activeBtn = null;
let lastPicksMarkup = "";
let picksController = null;
let clanController = null;

function ensurePicksController() {
  if (!picksController && window.initPickButtons) {
    picksController = window.initPickButtons(state, { fmt, getHitRate, getCritChance, updateUI });
  }
}

function ensureClanController() {
  if (!clanController && window.initClanButtons) {
    clanController = window.initClanButtons(state, { fmt, updateUI });
  }
}

function renderSectionContent() {
  const content = document.getElementById('section-content');
  const coming = document.querySelector('.section-coming');
  if (!content || !coming) return;

  if (activeKey === 'picks') {
    ensurePicksController();
    content.classList.add('visible');
    coming.style.display = 'none';
    const nextMarkup = picksController ? picksController.renderPicksContent() : '';
    if (nextMarkup !== lastPicksMarkup) {
      const prevScrollTop = content.scrollTop;
      content.innerHTML = nextMarkup;
      content.scrollTop = prevScrollTop;
      lastPicksMarkup = nextMarkup;
    }
  } else if (activeKey === 'clans') {
    ensureClanController();
    content.classList.add('visible');
    coming.style.display = 'none';
    content.innerHTML = clanController ? clanController.renderClansContent() : '';
    lastPicksMarkup = '';
  } else {
    content.classList.remove('visible');
    content.innerHTML = '';
    lastPicksMarkup = '';
    coming.style.display = '';
  }
}

function toggleSection(btn, title, sub, key) {
  const cave  = document.getElementById('cave');
  const sbar  = document.getElementById('status-bar');
  const panel = document.getElementById('section-panel');

  if (activeKey === key) {
    btn.classList.remove('active');
    panel.classList.remove('visible');
    cave.style.display = ''; sbar.style.display = '';
    state.sectionOpen = false;
    activeKey = null; activeBtn = null;
    renderSectionContent();
    return;
  }

  if (activeBtn) activeBtn.classList.remove('active');

  const titleEl = document.getElementById('section-title');
  const subEl   = document.getElementById('section-sub');
  titleEl.textContent = title; subEl.textContent = sub;
  titleEl.style.animation = 'none'; subEl.style.animation = 'none';
  void titleEl.offsetWidth;
  titleEl.style.animation = ''; subEl.style.animation = '';

  const c = sectionColors[key] || '#111';
  panel.style.background = `linear-gradient(160deg,${c}ee 0%,${c}88 100%)`;

  cave.style.display = 'none'; sbar.style.display = 'none';
  panel.classList.add('visible');
  state.sectionOpen = true;

  btn.classList.add('active');
  activeKey = key; activeBtn = btn;
  renderSectionContent();
}

// ══════════════════════════════════════
//  BOOT
// ══════════════════════════════════════
initRock();
generateRockCracks();
ensurePicksController();
ensureClanController();
updateUI();

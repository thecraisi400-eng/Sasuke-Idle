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
const critPfx   = ['','','💥 ','⚡ ','🔥 '];



const crackStages = [
  { threshold: 90, totalCracks: 2 },
  { threshold: 80, totalCracks: 4 },
  { threshold: 70, totalCracks: 6 },
  { threshold: 60, totalCracks: 9 },
  { threshold: 50, totalCracks: 12 },
  { threshold: 40, totalCracks: 15 },
  { threshold: 30, totalCracks: 18 },
  { threshold: 15, totalCracks: 22 },
  { threshold: 5, totalCracks: 27 },
];
let rockCracks = [];
function spawnDmg(x, y, value, colorClass, isCrit) {
  const cave = document.getElementById('cave');
  if (!cave) return;
  const el   = document.createElement('div');
  el.className = 'damage-number ' + colorClass;
  const pfx  = isCrit ? critPfx[Math.floor(Math.random()*critPfx.length)] : '';
  el.textContent = pfx + fmtHp(value);
  if (isCrit) { el.style.fontSize='clamp(15px,4.2vw,22px)'; }
  const rect = cave.getBoundingClientRect();
  el.style.left = (x - rect.left - 16) + 'px';
  el.style.top  = (y - rect.top  - 16) + 'px';
  el.style.setProperty('--dx', ((Math.random()-0.5)*48) + 'px');
  document.getElementById('particle-layer').appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function spawnDebris(x, y) {
  const cave  = document.getElementById('cave');
  if (!cave) return;
  const rect  = cave.getBoundingClientRect();
  const cols  = ['#757989','#5b5e6e','#3e404c','#9ba1b1','#b4bac7'];
  for (let i = 0; i < 14; i++) {
    const d  = document.createElement('div');
    d.className = 'debris';
    const sz = 1.5 + Math.random()*5.5;
    d.style.cssText = `width:${sz}px;height:${sz}px;background:${cols[Math.floor(Math.random()*cols.length)]};
      left:${x-rect.left}px;top:${y-rect.top}px;
      --dx:${(Math.random()-0.5)*92}px;--dy:${-(14+Math.random()*58)}px;--dur:${0.35+Math.random()*0.55}s;`;
    document.getElementById('particle-layer').appendChild(d);
    d.addEventListener('animationend', () => d.remove());
  }
}

function spawnDestructionBurst(x, y, intensity = 1) {
  const cave  = document.getElementById('cave');
  if (!cave) return;
  const rect  = cave.getBoundingClientRect();
  const cols  = ['#949aaa', '#7d8294', '#626776', '#4f5360', '#b3bac8', '#d4dae6'];
  const count = Math.floor(8 + intensity * 14);

  for (let i = 0; i < count; i++) {
    const p  = document.createElement('div');
    p.className = 'debris';
    const sz = 3.5 + Math.random() * (7 + intensity * 3.5);
    const spreadX = (Math.random() - 0.5) * (120 + intensity * 75);
    const spreadY = -(20 + Math.random() * (75 + intensity * 35));
    const dur = 0.42 + Math.random() * 0.72;
    p.style.cssText = `width:${sz}px;height:${sz}px;background:${cols[Math.floor(Math.random()*cols.length)]};
      left:${x - rect.left + (Math.random() - 0.5) * 28}px;top:${y - rect.top + (Math.random() - 0.5) * 20}px;
      border-radius:${20 + Math.random() * 35}%;
      --dx:${spreadX}px;--dy:${spreadY}px;--dur:${dur}s;`;
    document.getElementById('particle-layer').appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}


function randomCrackPath() {
  const x = 16 + Math.random() * 88;
  const y = 12 + Math.random() * 74;
  const segments = 3 + Math.floor(Math.random() * 3);
  let d = `M${x.toFixed(1)},${y.toFixed(1)}`;
  let cx = x;
  let cy = y;
  for (let i = 0; i < segments; i++) {
    cx = Math.max(8, Math.min(112, cx + (Math.random() - 0.5) * 20));
    cy = Math.max(8, Math.min(92, cy + (Math.random() - 0.5) * 18));
    d += ` L${cx.toFixed(1)},${cy.toFixed(1)}`;
  }
  return d;
}

function updateRockCracks() {
  const crackLayer = document.getElementById('crack-layer');
  if (!crackLayer || !state.rockHpMax) return;
  const hpPct = (state.rockHpCur / state.rockHpMax) * 100;
  let targetCracks = 0;
  for (const stage of crackStages) {
    if (hpPct <= stage.threshold) targetCracks = stage.totalCracks;
  }

  while (rockCracks.length < targetCracks) {
    rockCracks.push(randomCrackPath());
  }

  crackLayer.innerHTML = rockCracks.map((d) =>
    `<path d="${d}" stroke="rgba(18,18,22,0.78)" stroke-width="${1.1 + Math.random() * 1.6}" fill="none" stroke-linecap="round"/>`
  ).join('');
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
  rockCracks = [];
  updateRockCracks();

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

  // Damage: clickDmg ±10%, crit = x2
  const base   = state.clickDmg * (0.9 + Math.random()*0.2);
  const isCrit = Math.random() < getCritChance();
  const dmg    = isCrit ? base * 2 : base;

  state.rockHpCur = Math.max(0, state.rockHpCur - dmg);

  const cx = e ? e.clientX : window.innerWidth/2;
  const cy = e ? e.clientY : window.innerHeight/2;
  spawnDmg(cx, cy, dmg, isCrit ? 'dmg-red' : 'dmg-yellow', isCrit);

  if (Math.random() < 0.32) {
    setTimeout(() => {
      spawnDmg(cx+(Math.random()-0.5)*44, cy+(Math.random()-0.5)*32,
        dmg*(0.22+Math.random()*0.32), 'dmg-yellow', false);
    }, 65);
  }

  spawnDebris(cx, cy);
  updateRockCracks();
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
    updateRockCracks();
    if (state.rockHpCur <= 0) respawnRock();

    // Very subtle idle damage number (dps=1 so it's tiny)
    if (Math.random() < 0.04) {
      const cave = document.getElementById('cave');
      if (cave) {
        const rect = cave.getBoundingClientRect();
        const rx   = rect.left + rect.width  * (0.3 + Math.random()*0.3);
        const ry   = rect.top  + rect.height * (0.35 + Math.random()*0.2);
        spawnDmg(rx, ry, dmg, isCrit ? 'dmg-red' : 'dmg-white', isCrit);
      }
    }

    if (Math.random() < 0.14) {
      const cave = document.getElementById('cave');
      if (cave) {
        const rect = cave.getBoundingClientRect();
        const rx = rect.left + rect.width * (0.28 + Math.random() * 0.44);
        const ry = rect.top + rect.height * (0.26 + Math.random() * 0.46);
        const hpPct = state.rockHpMax ? state.rockHpCur / state.rockHpMax : 1;
        const intensity = Math.min(2.5, 0.65 + (1 - hpPct) * 2 + (isCrit ? 0.45 : 0));
        spawnDestructionBurst(rx, ry, intensity);
      }
    }
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

function ensurePicksController() {
  if (!picksController && window.initPickButtons) {
    picksController = window.initPickButtons(state, { fmt, getHitRate, getCritChance, updateUI });
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
updateRockCracks();
ensurePicksController();
updateUI();

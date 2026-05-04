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


const crackStages = [
  { hpPct: 90, count: 2 },
  { hpPct: 80, count: 4 },
  { hpPct: 70, count: 6 },
  { hpPct: 60, count: 8 },
  { hpPct: 50, count: 10 },
  { hpPct: 40, count: 13 },
  { hpPct: 30, count: 16 },
  { hpPct: 15, count: 19 },
  { hpPct: 5,  count: 25 },
];

let rockCracks = [];
let lastAutoImpactAt = 0;

function getTargetCracks(hpPct) {
  let target = 0;
  for (const stage of crackStages) {
    if (hpPct <= stage.hpPct) target = stage.count;
  }
  return target;
}

function generateCrackPath(cx, cy, len, dirX, dirY) {
  const bend = (Math.random() - 0.5) * 0.65;
  const midX = cx + dirX * len * (0.45 + Math.random() * 0.2) + dirY * len * bend * 0.25;
  const midY = cy + dirY * len * (0.45 + Math.random() * 0.2) - dirX * len * bend * 0.25;
  const endX = cx + dirX * len;
  const endY = cy + dirY * len;
  return `M${cx.toFixed(2)},${cy.toFixed(2)} L${midX.toFixed(2)},${midY.toFixed(2)} L${endX.toFixed(2)},${endY.toFixed(2)}`;
}

function ensureRockCracks() {
  const hpPct = Math.max(0, (state.rockHpCur / state.rockHpMax) * 100);
  const target = getTargetCracks(hpPct);

  let attempts = 0;
  while (rockCracks.length < target && attempts < 1200) {
    attempts++;
    const x = 18 + Math.random() * 84;
    const y = 14 + Math.random() * 72;

    const tooClose = rockCracks.some((c) => {
      const dx = c.x - x;
      const dy = c.y - y;
      return Math.hypot(dx, dy) < 14;
    });
    if (tooClose) continue;

    const ang = Math.random() * Math.PI * 2;
    const len = 8 + Math.random() * 12;
    rockCracks.push({
      x, y,
      path: generateCrackPath(x, y, len, Math.cos(ang), Math.sin(ang)),
      width: (1.2 + Math.random() * 1.9).toFixed(2),
      glow: (0.35 + Math.random() * 0.3).toFixed(2),
    });
  }
  renderCracks();
}

function renderCracks() {
  const g = document.getElementById('dynamic-cracks');
  if (!g) return;
  g.innerHTML = rockCracks.map((c) => (
    `<path d="${c.path}" class="rock-crack-shadow" stroke-width="${c.width}"></path>` +
    `<path d="${c.path}" class="rock-crack-light" stroke-width="${c.glow}"></path>`
  )).join('');
}

function spawnAutoImpactBurst() {
  const cave = document.getElementById('cave');
  const rock = document.getElementById('rock');
  if (!cave || !rock) return;
  const caveRect = cave.getBoundingClientRect();
  const rockRect = rock.getBoundingClientRect();
  const cx = rockRect.left + rockRect.width / 2;
  const cy = rockRect.top + rockRect.height / 2;
  const maxTravel = Math.min(rockRect.width, rockRect.height) * 0.5;

  for (let i = 0; i < 9; i++) {
    const p = document.createElement('div');
    p.className = 'impact-chunk';
    const angle = Math.random() * Math.PI * 2;
    const dist = maxTravel * (0.4 + Math.random() * 0.6);
    const size = 4 + Math.random() * 8;
    p.style.cssText = `left:${cx - caveRect.left}px;top:${cy - caveRect.top}px;width:${size}px;height:${size * (0.75 + Math.random() * 0.5)}px;--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist}px;--rot:${(Math.random() - 0.5) * 420}deg;--dur:${0.3 + Math.random() * 0.25}s;`;
    document.getElementById('particle-layer').appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

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
  rockCracks = [];
  renderCracks();
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
const dmgColors = ['dmg-yellow','dmg-red','dmg-cyan','dmg-white'];
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

function spawnDebris(x, y) {
  const cave  = document.getElementById('cave');
  if (!cave) return;
  const rect  = cave.getBoundingClientRect();
  const cols  = ['#6b6b7e','#4a4a5a','#90a4ae','#78909c','#FFD740','#00E5FF'];
  for (let i = 0; i < 5; i++) {
    const d  = document.createElement('div');
    d.className = 'debris';
    const sz = 2 + Math.random()*4;
    d.style.cssText = `width:${sz}px;height:${sz}px;background:${cols[Math.floor(Math.random()*cols.length)]};
      left:${x-rect.left}px;top:${y-rect.top}px;
      --dx:${(Math.random()-0.5)*65}px;--dy:${-(12+Math.random()*45)}px;--dur:${0.3+Math.random()*0.3}s;`;
    document.getElementById('particle-layer').appendChild(d);
    d.addEventListener('animationend', () => d.remove());
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
  const dmg    = isCrit ? base * 2.5 : base;

  state.rockHpCur = Math.max(0, state.rockHpCur - dmg);

  const cx = e ? e.clientX : window.innerWidth/2;
  const cy = e ? e.clientY : window.innerHeight/2;
  spawnDmg(cx, cy, dmg, isCrit ? 'dmg-red' : dmgColors[Math.floor(Math.random()*dmgColors.length)], isCrit);

  if (Math.random() < 0.32) {
    setTimeout(() => {
      spawnDmg(cx+(Math.random()-0.5)*44, cy+(Math.random()-0.5)*32,
        dmg*(0.22+Math.random()*0.32), dmgColors[Math.floor(Math.random()*dmgColors.length)], false);
    }, 65);
  }

  spawnDebris(cx, cy);
  ensureRockCracks();
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
    const dmg = state.dps * getHitRate() * dt * (isCrit ? 2.2 : 1);
    state.rockHpCur = Math.max(0, state.rockHpCur - dmg);
    ensureRockCracks();
    if (state.rockHpCur <= 0) respawnRock();

    const nowBurst = Date.now();
    if (nowBurst - lastAutoImpactAt > 180) {
      lastAutoImpactAt = nowBurst;
      spawnAutoImpactBurst();
    }

    // Very subtle idle damage number (dps=1 so it's tiny)
    if (Math.random() < 0.04) {
      const cave = document.getElementById('cave');
      if (cave) {
        const rect = cave.getBoundingClientRect();
        const rx   = rect.left + rect.width  * (0.3 + Math.random()*0.3);
        const ry   = rect.top  + rect.height * (0.35 + Math.random()*0.2);
        spawnDmg(rx, ry, dmg, 'dmg-cyan', isCrit);
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
ensurePicksController();
updateUI();

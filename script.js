// ===== GAME STATE =====
const state = {
  level: 1,
  gold: 0,
  silver: 0,
  dps: 1,
  clickDamage: 2,
  rockHP: 35,
  rockMaxHP: 35,
  xp: 0,
  xpNeeded: 100,
};

// Variables globales solicitadas
let oroActual = state.gold;
let dañoActual = state.clickDamage;

// Configuración modular de mejoras de picos
const PICK_UPGRADES = {
  sharpPick: {
    id: 'sharpPick',
    nombre: 'PICO AFILADO',
    nivel: 0,
    maxNivel: 1000,
    baseValor: 2,
    incremento: 0.35,
    costoBase: 25,
    multiplicadorCosto: 1.14,
    get valorActual() {
      return roundTo(this.baseValor + this.nivel * this.incremento, 2);
    },
  },
  speedPick: {
    id: 'speedPick',
    nombre: 'VELOCIDAD PICO',
    nivel: 0,
    maxNivel: 1000,
    baseValor: 1,
    incremento: 0.02,
    costoBase: 60,
    multiplicadorCosto: 1.18,
    get valorActual() {
      return roundTo(this.baseValor + this.nivel * this.incremento, 2);
    },
  },
  critPick: {
    id: 'critPick',
    nombre: 'CRÍTICO PICO',
    nivel: 0,
    maxNivel: 1000,
    baseValor: 0.02,
    incremento: 0.015,
    costoBase: 90,
    multiplicadorCosto: 1.17,
    get valorActual() {
      return roundTo(this.baseValor + this.nivel * this.incremento, 3);
    },
  },
  doublePick: {
    id: 'doublePick',
    nombre: 'DOBLE PICO',
    nivel: 0,
    maxNivel: 1000,
    baseValor: 0.02,
    incremento: 0.01,
    costoBase: 100,
    multiplicadorCosto: 1.17,
    get valorActual() {
      return roundTo(this.baseValor + this.nivel * this.incremento, 3);
    },
  },
};

// Rock HP per level (exponentially harder)
const rockHPByLevel = [35, 80, 180, 380, 750, 1400, 2600, 4800, 8500, 15000];
// Gold reward per level
const goldRewardByLevel = [3, 8, 20, 55, 140, 360, 900, 2200, 5500, 14000];

function getRockHP(lvl) {
  if (lvl <= rockHPByLevel.length) return rockHPByLevel[lvl - 1];
  return Math.floor(rockHPByLevel[rockHPByLevel.length - 1] * Math.pow(2.2, lvl - rockHPByLevel.length));
}
function getGoldReward(lvl) {
  if (lvl <= goldRewardByLevel.length) return goldRewardByLevel[lvl - 1];
  return Math.floor(goldRewardByLevel[goldRewardByLevel.length - 1] * Math.pow(2.5, lvl - goldRewardByLevel.length));
}

// ===== DOM REFS =====
const goldEl = document.getElementById('gold-count');
const silverEl = document.getElementById('silver-count');
const hpFill = document.getElementById('hp-bar-fill');
const hpText = document.getElementById('hp-bar-text');
const levelLabel = document.getElementById('level-label');
const xpFill = document.getElementById('xp-bar-fill');
const dpsDisplay = document.getElementById('dps-display');
const rockEl = document.getElementById('rock');
const rockFlash = document.getElementById('rock-flash');
const caveArea = document.getElementById('cave-area');
const particlesContainer = document.getElementById('particles-container');
const levelupPopup = document.getElementById('levelup-popup');
const popupLevel = document.getElementById('popup-level');
const minerEl = document.getElementById('miner');
const picksModal = document.getElementById('picks-modal');
const picksCards = document.getElementById('picks-cards');

function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function syncGlobals() {
  oroActual = state.gold;
  dañoActual = state.clickDamage;
}

function updateUI() {
  syncGlobals();
  goldEl.textContent = formatNum(state.gold);
  silverEl.textContent = formatNum(state.silver);
  const pct = Math.max(0, (state.rockHP / state.rockMaxHP) * 100);
  hpFill.style.width = pct + '%';
  hpText.textContent = Math.ceil(state.rockHP) + ' / ' + state.rockMaxHP;
  levelLabel.textContent = 'Nivel ' + state.level;
  xpFill.style.width = (((state.rockMaxHP - state.rockHP) / state.rockMaxHP) * 100) + '%';
  dpsDisplay.textContent = roundTo(PICK_UPGRADES.speedPick.valorActual, 2).toFixed(2) + ' DPS';
  renderPickUpgrades();
}

function formatNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function getUpgradeCost(upgrade) {
  return Math.floor(upgrade.costoBase * Math.pow(upgrade.multiplicadorCosto, upgrade.nivel));
}

function buyPickUpgrade(upgradeId) {
  const upgrade = PICK_UPGRADES[upgradeId];
  if (!upgrade || upgrade.nivel >= upgrade.maxNivel) return;

  const cost = getUpgradeCost(upgrade);
  if (oroActual < cost) return;

  state.gold -= cost;
  upgrade.nivel += 1;

  if (upgradeId === 'sharpPick') {
    state.clickDamage = upgrade.valorActual;
    dañoActual = state.clickDamage;
  }

  updateUI();
}

function renderPickUpgrades() {
  if (!picksCards) return;
  const entries = Object.values(PICK_UPGRADES);

  picksCards.innerHTML = entries
    .map((upgrade) => {
      const cost = getUpgradeCost(upgrade);
      const disabled = oroActual < cost || upgrade.nivel >= upgrade.maxNivel;
      return `
        <article class="pick-card">
          <h3>${upgrade.nombre}</h3>
          <p>Valor actual: <strong>${upgrade.valorActual.toFixed(2)}</strong></p>
          <p>Nivel: <strong>${upgrade.nivel}/${upgrade.maxNivel}</strong></p>
          <button class="buy-btn" data-upgrade-id="${upgrade.id}" ${disabled ? 'disabled' : ''}>
            Comprar - ${formatNum(cost)} 💰
          </button>
        </article>
      `;
    })
    .join('');

  picksCards.querySelectorAll('.buy-btn').forEach((btn) => {
    btn.addEventListener('click', () => buyPickUpgrade(btn.dataset.upgradeId));
  });
}

function togglePicksModal(show) {
  picksModal.classList.toggle('show', show);
}

function processHit(isClick = false) {
  const baseDamage = dañoActual;
  const critRoll = Math.random() * 100;
  const doubleRoll = Math.random() * 100;
  const critTriggered = critRoll <= PICK_UPGRADES.critPick.valorActual;
  const doubleTriggered = doubleRoll <= PICK_UPGRADES.doublePick.valorActual;
  const totalHits = doubleTriggered ? 2 : 1;
  const damagePerHit = critTriggered ? baseDamage * 2 : baseDamage;

  for (let i = 0; i < totalHits; i++) {
    dealDamage(damagePerHit, isClick, critTriggered);
  }
}

// ===== CLICK ROCK =====
function clickRock() {
  processHit(true);
  minerEl.classList.remove('swing');
  void minerEl.offsetWidth;
  minerEl.classList.add('swing');
  minerEl.addEventListener('animationend', () => minerEl.classList.remove('swing'), {once: true});
  rockFlash.style.opacity = '0.18';
  setTimeout(() => { rockFlash.style.opacity = '0'; }, 60);
}

function dealDamage(dmg, isClick = false, isCritical = false) {
  state.rockHP -= dmg;
  spawnDamageNumber(dmg, isClick, isCritical);
  spawnImpactParticles();
  if (state.rockHP <= 0) {
    rockBroken();
  } else {
    rockEl.classList.remove('shake');
    void rockEl.offsetWidth;
    rockEl.classList.add('shake');
    rockEl.addEventListener('animationend', () => rockEl.classList.remove('shake'), {once: true});
  }
  updateUI();
}

function rockBroken() {
  const reward = getGoldReward(state.level);
  state.gold += reward;
  state.silver += Math.floor(reward * 0.1);
  spawnGoldFloat(reward);
  state.xp += 20 + state.level * 10;
  state.level++;
  state.rockMaxHP = getRockHP(state.level);
  state.rockHP = state.rockMaxHP;
  state.dps = Math.max(1, Math.floor(PICK_UPGRADES.speedPick.valorActual));
  state.clickDamage = Math.max(2, PICK_UPGRADES.sharpPick.valorActual);
  state.xpNeeded = 100 + state.level * 60;
  showLevelUp(state.level);
  updateUI();
}

function showLevelUp(lvl) {
  popupLevel.textContent = lvl;
  levelupPopup.classList.add('show');
  setTimeout(() => levelupPopup.classList.remove('show'), 2000);
}

function spawnDamageNumber(dmg, isClick, isCritical = false) {
  const el = document.createElement('div');
  el.className = 'dmg-number';
  if (isCritical) el.classList.add('critical-dmg');
  el.textContent = '-' + Math.ceil(dmg);
  const rect = rockEl.getBoundingClientRect();
  const caveRect = caveArea.getBoundingClientRect();
  const cx = rect.left - caveRect.left + rect.width / 2;
  const cy = rect.top - caveRect.top + rect.height / 2;
  el.style.left = (cx + (Math.random() * 60 - 30)) + 'px';
  el.style.top = (cy + (Math.random() * 30 - 40)) + 'px';
  if (isClick && !isCritical) { el.style.fontSize = '22px'; el.style.color = '#ffeeaa'; }
  caveArea.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function spawnGoldFloat(amount) { /* unchanged */
  const el = document.createElement('div');
  el.className = 'gold-float';
  el.textContent = '+' + formatNum(amount) + ' 💰';
  const rect = rockEl.getBoundingClientRect();
  const caveRect = caveArea.getBoundingClientRect();
  const cx = rect.left - caveRect.left + rect.width / 2;
  const cy = rect.top - caveRect.top;
  el.style.left = (cx - 30) + 'px';
  el.style.top = (cy - 10) + 'px';
  caveArea.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

function spawnImpactParticles() { const rect = rockEl.getBoundingClientRect(); const caveRect = caveArea.getBoundingClientRect(); const cx = rect.left - caveRect.left + rect.width / 2; const cy = rect.top - caveRect.top + rect.height / 2; for (let i = 0; i < 5; i++) { const p = document.createElement('div'); p.className = 'spark-particle'; p.style.left = (cx + (Math.random() * 40 - 20)) + 'px'; p.style.top = (cy + (Math.random() * 20 - 10)) + 'px'; const angle = Math.random() * Math.PI * 2; const dist = 20 + Math.random() * 30; p.style.setProperty('--sx', Math.cos(angle) * dist + 'px'); p.style.setProperty('--sy', (-15 - Math.random() * dist) + 'px'); p.style.animationDuration = (0.4 + Math.random() * 0.4) + 's'; caveArea.appendChild(p); setTimeout(() => p.remove(), 800); } }
function spawnDustParticle() { const p = document.createElement('div'); p.className = 'dust-particle'; const sz = 1 + Math.random() * 2.5; p.style.width = sz + 'px'; p.style.height = sz + 'px'; p.style.left = (Math.random() * 100) + '%'; p.style.top = (40 + Math.random() * 50) + '%'; p.style.setProperty('--dx', (Math.random() * 20 - 10) + 'px'); p.style.animationDuration = (4 + Math.random() * 6) + 's'; p.style.animationDelay = (Math.random() * 3) + 's'; particlesContainer.appendChild(p); setTimeout(() => p.remove(), 12000); }
setInterval(spawnDustParticle, 600);

setInterval(() => {
  if (state.rockHP > 0) {
    for (let i = 0; i < Math.max(1, Math.floor(PICK_UPGRADES.speedPick.valorActual)); i++) {
      processHit(false);
    }
  }
}, 1000);

const sectionBgs = { picks:'linear-gradient(180deg, #0a1228 0%, #0d1a3e 100%)',clans:'linear-gradient(180deg, #081828 0%, #0d2240 100%)',battle:'linear-gradient(180deg, #1a0808 0%, #2a0f0f 100%)',attrs:'linear-gradient(180deg, #1a1200 0%, #2e1e00 100%)',arena:'linear-gradient(180deg, #1a0410 0%, #2e0818 100%)',events:'linear-gradient(180deg, #0d0428 0%, #1a0840 100%)',prestige:'linear-gradient(180deg, #120800 0%, #221005 100%)',pets:'linear-gradient(180deg, #041210 0%, #081e14 100%)',settings:'linear-gradient(180deg, #0a0a12 0%, #141420 100%)'};

function switchSection(section) {
  const bg = sectionBgs[section] || sectionBgs.picks;
  document.getElementById('cave-bg').style.background = bg;
  if (section === 'picks') togglePicksModal(true);
  else togglePicksModal(false);
}

updateUI();

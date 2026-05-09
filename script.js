// ===== GAME BALANCE =====
// Ajustes principales de economía idle:
// - ROCK_HP_GROWTH controla la curva de dificultad. 1.15 = +15% por roca destruida.
//   Súbelo para una partida más dura; bájalo a 1.10-1.12 para progresión más suave.
// - GOLD_REWARD_RATE evita la inflación convirtiendo solo una fracción del HP en oro.
//   0.10 significa que una roca paga un 10% de su HP máximo.
// - UPGRADE_COST_GROWTH es el escalado de los picos. 1.40 = +40% por nivel comprado.
//   Con 1.40, sobre el nivel 50 una sola roca deja de pagar mejoras avanzadas y
//   el jugador necesita acumular, optimizar Crítico y usar Doble Pico para avanzar.
const BALANCE_CONFIG = {
  BASE_ROCK_HP: 25,
  ROCK_HP_GROWTH: 1.15,
  GOLD_REWARD_RATE: 0.10,
  UPGRADE_COST_GROWTH: 1.40,
  GOLD_FLOAT_HEIGHT_MULTIPLIER: 2.88,
  CRITICAL_DAMAGE_MULTIPLIER: 2,
  FAST_PROGRESSION_LEVEL_CAP: 10,
  HARD_GATE_LEVEL: 50,
};

// ===== GAME STATE =====
const state = {
  level: 1,
  gold: 0,
  silver: 0,
  dps: 1,
  clickDamage: 2,
  rockHP: getRockHP(1),
  rockMaxHP: getRockHP(1),
  rockReward: getGoldReward(1),
  xp: 0,
  xpNeeded: 100,
  totalGoldEarned: 0,
};

// Variables globales solicitadas
let oroActual = state.gold;
let dañoActual = state.clickDamage;
window.nivelActual = state.level;
window.dañoPermanenteTotal = Number(window.dañoPermanenteTotal ?? 0);

// Configuración modular de mejoras de picos
const PICK_UPGRADES = {
  sharpPick: {
    id: 'sharpPick',
    nombre: 'PICO AFILADO',
    nivel: 0,
    maxNivel: 1000,
    baseValor: 2,
    incrementoMin: 0.30,
    incrementoMax: 0.75,
    bonusValor: 0,
    decimalesValor: 2,
    costoBase: 12,
    multiplicadorCosto: BALANCE_CONFIG.UPGRADE_COST_GROWTH,
    get valorActual() {
      return roundTo(this.baseValor + this.bonusValor, this.decimalesValor);
    },
  },
  speedPick: {
    id: 'speedPick',
    nombre: 'VELOCIDAD PICO',
    nivel: 0,
    maxNivel: 1000,
    baseValor: 1,
    incrementoMin: 0.01,
    incrementoMax: 0.035,
    bonusValor: 0,
    decimalesValor: 2,
    costoBase: 22,
    multiplicadorCosto: BALANCE_CONFIG.UPGRADE_COST_GROWTH,
    get valorActual() {
      return roundTo(this.baseValor + this.bonusValor, this.decimalesValor);
    },
  },
  critPick: {
    id: 'critPick',
    nombre: 'CRÍTICO PICO',
    nivel: 0,
    maxNivel: 1000,
    baseValor: 0.02,
    incrementoMin: 0.01,
    incrementoMax: 0.03,
    bonusValor: 0,
    decimalesValor: 3,
    costoBase: 15,
    multiplicadorCosto: BALANCE_CONFIG.UPGRADE_COST_GROWTH,
    get valorActual() {
      return roundTo(this.baseValor + this.bonusValor, this.decimalesValor);
    },
  },
  doublePick: {
    id: 'doublePick',
    nombre: 'DOBLE PICO',
    nivel: 0,
    maxNivel: 1000,
    baseValor: 0.01,
    incrementoMin: 0.008,
    incrementoMax: 0.022,
    bonusValor: 0,
    decimalesValor: 3,
    costoBase: 18,
    multiplicadorCosto: BALANCE_CONFIG.UPGRADE_COST_GROWTH,
    get valorActual() {
      return roundTo(this.baseValor + this.bonusValor, this.decimalesValor);
    },
  },
};

function getRockHP(lvl) {
  // Fórmula base: HP = Base_HP * (1.15 ^ Nivel_Roca).
  // Usamos (lvl - 1) para que el nivel 1 empiece exactamente en BASE_ROCK_HP,
  // y cada nueva roca sea un 15% más resistente que la anterior.
  const hp = BALANCE_CONFIG.BASE_ROCK_HP * Math.pow(BALANCE_CONFIG.ROCK_HP_GROWTH, lvl - 1);
  return Math.max(1, Math.floor(hp));
}

function getGoldReward(lvl) {
  // Fórmula anti-inflación: Oro = HP_Roca * 0.10.
  // Si el early game se siente lento, sube GOLD_REWARD_RATE a 0.12-0.15;
  // si el jugador compra demasiadas mejoras, bájalo a 0.08.
  return Math.max(1, Math.ceil(getRockHP(lvl) * BALANCE_CONFIG.GOLD_REWARD_RATE));
}

function getDifficultyTier(lvl) {
  if (lvl >= BALANCE_CONFIG.HARD_GATE_LEVEL) return 'Extrema';
  if (lvl >= 30) return 'Difícil';
  if (lvl > BALANCE_CONFIG.FAST_PROGRESSION_LEVEL_CAP) return 'Media';
  return 'Fácil';
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

function formatDecimal(value, decimals = 2) {
  return roundTo(value, decimals).toFixed(decimals);
}

function getRandomUpgradeIncrement(upgrade) {
  const min = upgrade.incrementoMin ?? 0;
  const max = upgrade.incrementoMax ?? min;
  return roundTo(min + Math.random() * (max - min), upgrade.decimalesValor ?? 2);
}

function getCurrentDPS() {
  const pickDamage = Math.max(2, PICK_UPGRADES.sharpPick.valorActual);
  const pickSpeed = Math.max(1, PICK_UPGRADES.speedPick.valorActual);
  return roundTo(pickDamage * pickSpeed, 2);
}

function getPermanentDamageBonus() {
  return Math.max(0, Number(window.dañoPermanenteTotal ?? 0));
}

function syncCombatStats() {
  state.clickDamage = Math.max(2, PICK_UPGRADES.sharpPick.valorActual) + getPermanentDamageBonus();
  state.dps = getCurrentDPS() + getPermanentDamageBonus();
}

function syncGlobals() {
  syncCombatStats();
  oroActual = state.gold;
  dañoActual = state.clickDamage;
  window.nivelActual = state.level;
  window.oroActual = oroActual;
  window.dañoActual = dañoActual;
  window.totalGoldEarned = state.totalGoldEarned;
  window.oroTotalGanado = state.totalGoldEarned;
}

function updateUI() {
  syncGlobals();
  goldEl.textContent = formatNum(state.gold);
  silverEl.textContent = formatNum(state.silver);
  const pct = Math.max(0, (state.rockHP / state.rockMaxHP) * 100);
  hpFill.style.width = pct + '%';
  hpText.textContent = formatDecimal(Math.max(state.rockHP, 0), 2) + ' / ' + formatDecimal(state.rockMaxHP, 2);
  levelLabel.textContent = 'Nivel ' + state.level + ' · ' + getDifficultyTier(state.level);
  xpFill.style.width = (((state.rockMaxHP - state.rockHP) / state.rockMaxHP) * 100) + '%';
  dpsDisplay.textContent = state.dps.toFixed(2) + ' DPS';
  renderPickUpgrades();
}

function formatNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function formatUpgradeValue(upgrade) {
  if (upgrade.id === 'critPick' || upgrade.id === 'doublePick') {
    return `${Math.min(upgrade.valorActual * 100, 100).toFixed(1)}%`;
  }

  return upgrade.valorActual.toFixed(2);
}

function getUpgradeCost(upgrade) {
  // Fórmula: Costo = Base_Costo * (1.40 ^ Nivel_Mejora).
  // Cambia BALANCE_CONFIG.UPGRADE_COST_GROWTH si quieres endurecer o suavizar
  // todas las mejoras sin tocar cada pico manualmente.
  return Math.floor(upgrade.costoBase * Math.pow(upgrade.multiplicadorCosto, upgrade.nivel));
}

function checkTransaction(oroDisponible, costoMejora) {
  // Gatekeeping centralizado: ninguna compra debe saltarse esta validación.
  return oroDisponible >= costoMejora;
}

function buyPickUpgrade(upgradeId) {
  const upgrade = PICK_UPGRADES[upgradeId];
  if (!upgrade || upgrade.nivel >= upgrade.maxNivel) return;

  const cost = getUpgradeCost(upgrade);
  if (!checkTransaction(oroActual, cost)) return;

  state.gold -= cost;
  upgrade.nivel += 1;
  upgrade.bonusValor = roundTo(
    (upgrade.bonusValor ?? 0) + getRandomUpgradeIncrement(upgrade),
    upgrade.decimalesValor ?? 2
  );

  syncCombatStats();
  dañoActual = state.clickDamage;

  updateUI();
}

function renderPickUpgrades() {
  if (!picksCards) return;
  const entries = Object.values(PICK_UPGRADES);

  picksCards.innerHTML = entries
    .map((upgrade) => {
      const cost = getUpgradeCost(upgrade);
      const disabled = !checkTransaction(oroActual, cost) || upgrade.nivel >= upgrade.maxNivel;
      return `
        <article class="pick-card">
          <h3>${upgrade.nombre}</h3>
          <p>Valor actual: <strong>${formatUpgradeValue(upgrade)}</strong></p>
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
  if (!picksModal) return;
  picksModal.classList.toggle('show', show);
}

function resetearRocasANivel1() {
  state.level = 1;
  state.xp = 0;
  state.xpNeeded = 100;
  state.rockMaxHP = getRockHP(state.level);
  state.rockHP = state.rockMaxHP;
  state.rockReward = getGoldReward(state.level);
  syncGlobals();
  updateUI();
}

window.resetearRocasANivel1 = resetearRocasANivel1;
window.updatePrestigeUI = updateUI;


function resetGameForPrestige() {
  state.level = 0;
  state.gold = 0;
  state.silver = 0;
  state.dps = 1;
  state.clickDamage = 2;
  state.xp = 0;
  state.xpNeeded = 100;
  state.rockMaxHP = getRockHP(1);
  state.rockHP = state.rockMaxHP;
  state.rockReward = getGoldReward(1);

  Object.values(PICK_UPGRADES).forEach((upgrade) => {
    upgrade.nivel = 0;
    upgrade.bonusValor = 0;
  });

  syncGlobals();
  updateUI();
}

window.resetGameForPrestige = resetGameForPrestige;
window.prestigePointsAvailable = Number(window.prestigePointsAvailable ?? 0);
window.prestigePointsClaimed = Number(window.prestigePointsClaimed ?? 0);

function processHit(isClick = false) {
  syncCombatStats();
  const baseDamage = dañoActual;
  const critChance = Math.min(PICK_UPGRADES.critPick.valorActual, 1);
  const doubleChance = Math.min(PICK_UPGRADES.doublePick.valorActual, 1);
  const critTriggered = Math.random() <= critChance;
  const doubleTriggered = Math.random() <= doubleChance;
  const totalHits = doubleTriggered ? 2 : 1;
  const damagePerHit = critTriggered ? baseDamage * BALANCE_CONFIG.CRITICAL_DAMAGE_MULTIPLIER : baseDamage;

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
    checkRockStatus();
  } else {
    rockEl.classList.remove('shake');
    void rockEl.offsetWidth;
    rockEl.classList.add('shake');
    rockEl.addEventListener('animationend', () => rockEl.classList.remove('shake'), {once: true});
  }
  updateUI();
}

function checkRockStatus() {
  if (state.rockHP > 0) return false;

  const reward = state.rockReward;
  state.gold += reward;
  state.totalGoldEarned += reward;
  spawnGoldFloat(reward);

  state.xp += 20 + state.level * 10;
  state.level++;
  state.rockMaxHP = getRockHP(state.level);
  state.rockHP = state.rockMaxHP;
  state.rockReward = getGoldReward(state.level);
  syncCombatStats();
  state.xpNeeded = 100 + state.level * 60;
  showLevelUp(state.level);
  updateUI();
  return true;
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
  el.textContent = '-' + formatDecimal(dmg, 2);
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

function spawnGoldFloat(amount) {
  const el = document.createElement('div');
  el.className = 'gold-float';
  el.textContent = '+' + formatNum(amount) + ' 💰';
  const rect = rockEl.getBoundingClientRect();
  const caveRect = caveArea.getBoundingClientRect();
  const cx = rect.left - caveRect.left + rect.width / 2;
  const rockTop = rect.top - caveRect.top;
  const goldFloatVerticalOffset = rect.height * 1.43;
  el.style.left = (cx - 30) + 'px';
  el.style.top = (rockTop - 10 - goldFloatVerticalOffset) + 'px';
  caveArea.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

function spawnImpactParticles() { const rect = rockEl.getBoundingClientRect(); const caveRect = caveArea.getBoundingClientRect(); const cx = rect.left - caveRect.left + rect.width / 2; const cy = rect.top - caveRect.top + rect.height / 2; for (let i = 0; i < 5; i++) { const p = document.createElement('div'); p.className = 'spark-particle'; p.style.left = (cx + (Math.random() * 40 - 20)) + 'px'; p.style.top = (cy + (Math.random() * 20 - 10)) + 'px'; const angle = Math.random() * Math.PI * 2; const dist = 20 + Math.random() * 30; p.style.setProperty('--sx', Math.cos(angle) * dist + 'px'); p.style.setProperty('--sy', (-15 - Math.random() * dist) + 'px'); p.style.animationDuration = (0.4 + Math.random() * 0.4) + 's'; caveArea.appendChild(p); setTimeout(() => p.remove(), 800); } }
function spawnDustParticle() { if (!particlesContainer) return; const p = document.createElement('div'); p.className = 'dust-particle'; const sz = 1 + Math.random() * 2.5; p.style.width = sz + 'px'; p.style.height = sz + 'px'; p.style.left = (Math.random() * 100) + '%'; p.style.top = (40 + Math.random() * 50) + '%'; p.style.setProperty('--dx', (Math.random() * 20 - 10) + 'px'); p.style.animationDuration = (4 + Math.random() * 6) + 's'; p.style.animationDelay = (Math.random() * 3) + 's'; particlesContainer.appendChild(p); setTimeout(() => p.remove(), 12000); }
setInterval(spawnDustParticle, 600);

setInterval(() => {
  if (state.rockHP > 0) {
    syncCombatStats();
    dealDamage(state.dps, false, false);
  }
}, 1000);

const sectionBgs = { picks:'linear-gradient(180deg, #0a1228 0%, #0d1a3e 100%)',clans:'linear-gradient(180deg, #081828 0%, #0d2240 100%)',battle:'linear-gradient(180deg, #1a0808 0%, #2a0f0f 100%)',attrs:'linear-gradient(180deg, #1a1200 0%, #2e1e00 100%)',arena:'linear-gradient(180deg, #1a0410 0%, #2e0818 100%)',events:'linear-gradient(180deg, #0d0428 0%, #1a0840 100%)',prestige:'linear-gradient(180deg, #120800 0%, #221005 100%)',pets:'linear-gradient(180deg, #041210 0%, #081e14 100%)',settings:'linear-gradient(180deg, #0a0a12 0%, #141420 100%)'};

function switchSection(section) {
  const bg = sectionBgs[section] || sectionBgs.picks;
  document.getElementById('cave-bg').style.background = bg;

  if (section === 'picks') {
    togglePicksModal(true);
    return;
  }

  togglePicksModal(false);

  if (section === 'prestige' && typeof window.crearSistemaPrestigio === 'function') {
    window.crearSistemaPrestigio();
  }
}

updateUI();

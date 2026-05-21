// =============================================
// GAME STATE
// CAMBIO 2: crystals comienza en 0
// =============================================
const G = {
  gold: 0,
  crystals: 0,   // CAMBIO 2: siempre empieza en 0
  level: 1,
  xp: 0,
  xpNeeded: 100,
  prestigeMultiplier: 1,
  prestigeCount: 0,

  axeLevel: 1,
  axeGoldPerClick: 1,
  axeGoldPerSec: 0.5,
  axeDamage: 0.5,
  axeAttackSpeed: 1,
  axeCritChance: 0,
  axeDoubleChance: 0,
  whetstones: 0,
  whetstoneBoostUntil: 0,

  lumberLevel: 1,
  lumberBonus: 0,

  sound: true,
  notifications: true,

  totalClicks: 0,
  totalGoldEarned: 0,
  totalPrestige: 0,

  skillPoints: 0,
  skills: { strength: 0, speed: 0, luck: 0, endurance: 0 }
};

// =============================================
// SISTEMA DE TIEMPO
// =============================================
const TIME = {
  gameMinutes: 360,
  day: 1,
  lastRealSecond: Date.now()
};

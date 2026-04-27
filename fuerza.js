'use strict';

(function initFuerzaSystem(global) {
  const UPGRADES = [
    { key: 'clickDamage', icon: '👆', name: 'Daño por Clic', desc: 'Daña por cada clic en la pantalla.', baseCost: 12, growth: 1.45, effect: (lvl) => `+${lvl} daño directo` },
    { key: 'autoDamage', icon: '👊', name: 'Daño Automático', desc: 'Hace daño por segundo automáticamente.', baseCost: 25, growth: 1.5, effect: (lvl) => `+${lvl * 2} DPS` },
    { key: 'critChance', icon: '🎯', name: 'Probabilidad Crítico', desc: 'Aumenta la posibilidad de infligir daño doble.', baseCost: 50, growth: 1.55, effect: (lvl) => `${(lvl * 1.5).toFixed(1)}% de crítico x2` },
    { key: 'touchPower', icon: '💥', name: 'Poder Toque', desc: 'Incrementa el daño base por pulsación.', baseCost: 80, growth: 1.55, effect: (lvl) => `+${(lvl * 12).toFixed(0)}% daño por toque` },
    { key: 'rockPenetration', icon: '🛡️', name: 'Penetración Roca', desc: 'Reduce la defensa efectiva de las rocas.', baseCost: 120, growth: 1.6, effect: (lvl) => `${Math.min(80, lvl * 4)}% penetración` },
    { key: 'gemFind', icon: '💎', name: 'Hallazgo Gemas', desc: 'Eleva la probabilidad de extraer gemas.', baseCost: 160, growth: 1.6, effect: (lvl) => `+${(lvl * 1).toFixed(0)}% hallazgo` },
    { key: 'doubleStrike', icon: '⚡', name: 'Golpe Doble', desc: 'Probabilidad de ejecutar dos ataques seguidos.', baseCost: 220, growth: 1.65, effect: (lvl) => `${(lvl * 2).toFixed(0)}% doble golpe` },
    { key: 'breakDamage', icon: '🧱', name: 'Daño Ruptura', desc: 'Quita un porcentaje fijo de vida máxima.', baseCost: 300, growth: 1.7, effect: (lvl) => `${(lvl * 0.5).toFixed(1)}% vida máxima` },
    { key: 'goldImpact', icon: '💰', name: 'Oro Impacto', desc: 'Genera oro cada vez que golpea la roca.', baseCost: 180, growth: 1.55, effect: (lvl) => `+${lvl} oro por impacto` }
  ];

  function getLevel(state, key) {
    return state.forceUpgrades[key] || 0;
  }

  function getCost(state, key) {
    const cfg = UPGRADES.find((u) => u.key === key);
    if (!cfg) return Infinity;
    return Math.floor(cfg.baseCost * Math.pow(cfg.growth, getLevel(state, key)));
  }

  function initState(state) {
    if (!state.forceUpgrades) {
      state.forceUpgrades = {};
    }
    for (const upg of UPGRADES) {
      if (typeof state.forceUpgrades[upg.key] !== 'number') {
        state.forceUpgrades[upg.key] = 0;
      }
    }
    state.clickUpgLevel = state.forceUpgrades.clickDamage;
  }

  function getStats(state) {
    initState(state);
    const lvls = state.forceUpgrades;
    return {
      clickDamage: lvls.clickDamage,
      autoDamage: lvls.autoDamage,
      critChance: lvls.critChance * 1.5,
      touchPowerMult: 1 + lvls.touchPower * 0.12,
      penetration: Math.min(80, lvls.rockPenetration * 4),
      gemFindBonus: lvls.gemFind / 100,
      doubleStrikeChance: lvls.doubleStrike * 2,
      breakPercent: lvls.breakDamage * 0.005,
      goldImpact: lvls.goldImpact
    };
  }

  function getClickDamage(state) {
    const stats = getStats(state);
    let dmg = (1 + stats.clickDamage) * stats.touchPowerMult * state.permDmgMult;
    if (state.frenzyActive && Date.now() < state.frenzyEndTime) dmg *= 2;
    return Math.max(1, Math.floor(dmg));
  }

  function getAutoDps(state) {
    const stats = getStats(state);
    let dps = (stats.autoDamage * 2) * state.permDpsMult;
    if (state.frenzyActive && Date.now() < state.frenzyEndTime) dps *= 2;
    return dps;
  }

  function getBiomeDefense(state) {
    const baseDefense = 0.08 + state.rockLevel * 0.003 * state.currentBiome.mult;
    return Math.min(0.85, baseDefense);
  }

  function applyOnHit(state, baseDamage, source) {
    const stats = getStats(state);
    const defense = getBiomeDefense(state) * (1 - stats.penetration / 100);
    const mitigatedDamage = baseDamage * (1 - Math.max(0, defense));

    const critRoll = Math.random() * 100;
    const isCrit = critRoll < stats.critChance;
    let damage = mitigatedDamage * (isCrit ? 2 : 1);

    const ruptureDamage = state.rockMaxHP * stats.breakPercent;
    damage += ruptureDamage;

    let isDoubleStrike = false;
    if (source === 'click' && Math.random() * 100 < stats.doubleStrikeChance) {
      damage *= 2;
      isDoubleStrike = true;
    }

    const bonusGold = stats.goldImpact;
    return {
      damage,
      isCrit,
      isDoubleStrike,
      bonusGold
    };
  }

  function tryUpgrade(state, key) {
    initState(state);
    const cost = getCost(state, key);
    if (state.gold < cost) return { ok: false, cost };
    state.gold -= cost;
    state.forceUpgrades[key] += 1;
    state.clickUpgLevel = state.forceUpgrades.clickDamage;
    return { ok: true, cost, level: state.forceUpgrades[key] };
  }

  function reset(state) {
    initState(state);
    for (const upg of UPGRADES) {
      state.forceUpgrades[upg.key] = 0;
    }
    state.clickUpgLevel = 0;
  }

  global.FuerzaSystem = {
    UPGRADES,
    initState,
    getLevel,
    getCost,
    getStats,
    getClickDamage,
    getAutoDps,
    applyOnHit,
    tryUpgrade,
    reset
  };
})(window);

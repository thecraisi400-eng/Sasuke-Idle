(function () {
  const DIFFICULTIES = {
    easy: {
      id: 'easy', name: 'Fácil', baseDps: 1.0, baseHp: 7, hpGrowth: 1.115,
      dayGrowth: 0.06, goldMultiplier: 1.35, costMultiplier: 0.7, xpMultiplier: 1.15,
      crystalChance: 0.018, rareChance: 0.10, unlockSpeed: 0.75,
    },
    medium: {
      id: 'medium', name: 'Medio', baseDps: 1.0, baseHp: 12, hpGrowth: 1.145,
      dayGrowth: 0.08, goldMultiplier: 1, costMultiplier: 1, xpMultiplier: 1,
      crystalChance: 0.010, rareChance: 0.07, unlockSpeed: 1,
    },
    hard: {
      id: 'hard', name: 'Difícil', baseDps: 1.0, baseHp: 22, hpGrowth: 1.165,
      dayGrowth: 0.11, goldMultiplier: 0.8, costMultiplier: 1.5, xpMultiplier: 0.95,
      crystalChance: 0.007, rareChance: 0.055, unlockSpeed: 1.35,
    },
    impossible: {
      id: 'impossible', name: 'Imposible', baseDps: 1.0, baseHp: 50, hpGrowth: 1.185,
      dayGrowth: 0.14, goldMultiplier: 0.6, costMultiplier: 2.5, xpMultiplier: 0.9,
      crystalChance: 0.0045, rareChance: 0.04, unlockSpeed: 1.8,
    },
  };

  const AXE_UPGRADES = [
    { id: 'edge', name: 'FILO DEL HACHA', icon: '🪓', desc: 'Aumenta el daño plano de cada golpe automático.', baseCost: 8, costMult: 1.30, level: 0, type: 'gold', effectStep: 1.00, scalingStep: 0.14, roiTarget: '45-140 s early' },
    { id: 'quality', name: 'CALIDAD DEL FILO', icon: '⏱️', desc: 'Aumenta la velocidad de golpes del hacha.', baseCost: 30, costMult: 1.34, level: 0, type: 'gold', effectStep: 0.07, roiTarget: '70-180 s early' },
    { id: 'crit', name: 'HACHA CRÍTICOS', icon: '🎯', desc: 'Añade rating crítico con cap visible.', baseCost: 45, costMult: 1.38, level: 0, type: 'gold', effectStep: 5, ratingStep: 5, cap: 0.60, roiTarget: '2-5 min early' },
    { id: 'double', name: 'HACHA DOBLE FILO', icon: '🪓', desc: 'Añade rating de doble golpe con cap visible.', baseCost: 70, costMult: 1.42, level: 0, type: 'gold', effectStep: 4, ratingStep: 4, cap: 0.45, roiTarget: '3-8 min early' },
    { id: 'stone', name: 'PIEDRA DE AFILAR', icon: '☢️', desc: 'Consumible: burst temporal de daño. No se acumula.', baseCost: 250, costMult: 1.20, level: 0, type: 'item', effectStep: 1 },
  ];

  const ATTRIBUTE_UPGRADES = [
    { id: 'axe_mastery', emoji: '🪓', name: 'Maestría del Hacha', role: 'Daño estable', type: 'damage', maxLevel: 50, baseCost: 1, tierSize: 10, effectPerLevel: 0.04, desc: '+4% daño por golpe; cada 10 niveles añade +1 daño plano.', synergy: 'Filo del Hacha, Piedra de Afilar y Prestigio.', unlockLevel: 1 },
    { id: 'swift_chops', emoji: '⏱️', name: 'Brazada Rápida', role: 'Velocidad', type: 'speed', maxLevel: 40, baseCost: 1, tierSize: 8, effectPerLevel: 0.02, desc: '+2% golpes/s por nivel.', synergy: 'Calidad, crítico y doble golpe.', unlockLevel: 1 },
    { id: 'keen_eye', emoji: '🎯', name: 'Ojo del Leñador', role: 'Crítico', type: 'critRating', maxLevel: 35, baseCost: 1, tierSize: 7, effectPerLevel: 6, desc: '+6 rating crítico por nivel.', synergy: 'Hacha Críticos y Filo Partidor.', unlockLevel: 5 },
    { id: 'splitting_edge', emoji: '💥', name: 'Filo Partidor', role: 'Daño crítico', type: 'critDamage', maxLevel: 25, baseCost: 2, tierSize: 5, effectPerLevel: 0.04, desc: '+4% daño crítico por nivel.', synergy: 'Ojo del Leñador.', unlockLevel: 5 },
    { id: 'twin_swing', emoji: '🪓', name: 'Corte Gemelo', role: 'Doble golpe', type: 'doubleRating', maxLevel: 30, baseCost: 2, tierSize: 6, effectPerLevel: 5, desc: '+5 rating de doble golpe por nivel.', synergy: 'Brazada Rápida y combos.', unlockLevel: 8 },
    { id: 'golden_sap', emoji: '🍯', name: 'Savia Dorada', role: 'Oro', type: 'gold', maxLevel: 40, baseCost: 1, tierSize: 8, effectPerLevel: 0.03, desc: '+3% oro por árbol por nivel.', synergy: 'Misiones y eventos de oro.', unlockLevel: 12 },
    { id: 'forest_wisdom', emoji: '📚', name: 'Sabiduría del Bosque', role: 'XP', type: 'xp', maxLevel: 30, baseCost: 1, tierSize: 6, effectPerLevel: 0.025, desc: '+2.5% XP por árbol por nivel.', synergy: 'Niveles, puntos y desbloqueos.', unlockLevel: 12 },
    { id: 'rare_sense', emoji: '🌿', name: 'Instinto de Madera Rara', role: 'Rareza/cristales', type: 'rareRating', maxLevel: 20, baseCost: 2, tierSize: 4, effectPerLevel: 4, crystalEffectPerLevel: 0.01, desc: '+4 rating de madera rara y +1% hallazgo de cristal relativo.', synergy: 'Biomas y eventos de rareza.', unlockLevel: 10 },
    { id: 'boss_cleaver', emoji: '🛡️', name: 'Rompecorteza', role: 'Jefes', type: 'boss', maxLevel: 20, baseCost: 2, tierSize: 4, effectPerLevel: 0.02, armorIgnorePerLevel: 0.01, desc: '+2% daño contra jefes y +1% ignorar armadura.', synergy: 'Árboles legendarios.', unlockLevel: 15 },
    { id: 'ancient_roots', emoji: '👑', name: 'Raíces Antiguas', role: 'Prestigio', type: 'prestige', maxLevel: 15, baseCost: 3, tierSize: 3, effectPerLevel: 0.03, desc: '+3% eficacia de esencia por nivel.', synergy: 'Prestigio.', unlockLevel: 20 },
    { id: 'sharpening_ritual', emoji: '☢️', name: 'Ritual de Afilado', role: 'Piedra', type: 'whetstone', maxLevel: 15, baseCost: 2, tierSize: 3, effectPerLevel: 0.03, durationPerLevel: 15, desc: '+3% potencia de piedra y +15 s de duración.', synergy: 'Jefes y speedrun.', unlockLevel: 10 },
    { id: 'steady_hand', emoji: '🤲', name: 'Pulso Firme', role: 'Calidad de vida', type: 'steady', maxLevel: 20, baseCost: 1, tierSize: 5, effectPerLevel: 0.01, desc: '+1% mínimo garantizado a oro y XP; reduce varianza.', synergy: 'Economía y progreso estable.', unlockLevel: 1 },
  ];

  const UNLOCKS = {
    2: 'Mejorar Hacha: Filo del Hacha',
    3: 'Calidad del Filo',
    5: 'Hacha Críticos y primer cristal garantizado',
    8: 'Hacha Doble Filo',
    10: 'Piedra de Afilar y árboles raros',
    15: 'Precisión Quirúrgica y jefe menor',
    20: 'Prestigio inicial',
    25: 'Clima con modificadores',
    30: 'Talentos ramificados',
    50: 'Bioma nuevo',
  };

  function getDifficulty(id) {
    return DIFFICULTIES[id] || DIFFICULTIES.medium;
  }

  function xpNeededForLevel(level) {
    const safeLevel = Math.max(1, level);
    return Math.max(1, Math.floor(90 * Math.pow(1.13, safeLevel - 1) * (1 + 0.018 * safeLevel)));
  }

  function treeHp(level, day, difficultyId) {
    const diff = getDifficulty(difficultyId);
    const safeLevel = Math.max(1, level);
    return Math.max(1, Math.round(diff.baseHp * Math.pow(diff.hpGrowth, safeLevel - 1) * Math.pow(Math.max(1, day), diff.dayGrowth)));
  }

  function treeGold(level, difficultyId, goldBonus = 0, weatherMultiplier = 1, bossGoldFactor = 1) {
    const diff = getDifficulty(difficultyId);
    const safeLevel = Math.max(1, level);
    const base = 3 + Math.pow(safeLevel, 1.18);
    return Math.max(1, Math.floor(base * diff.goldMultiplier * weatherMultiplier * (1 + goldBonus) * bossGoldFactor));
  }

  function axeCost(upgrade, difficultyId, extraStock = 0) {
    const diff = getDifficulty(difficultyId);
    const level = upgrade.type === 'item' ? extraStock : upgrade.level;
    return Math.max(1, Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult || 1, level) * diff.costMultiplier));
  }

  function attributeCost(attr) {
    const tierSize = Math.max(1, attr.tierSize || 8);
    return Math.max(1, Math.floor((attr.baseCost || 1) + Math.floor((attr.level || 0) / tierSize)));
  }

  function chanceFromRating(rating, cap, softness) {
    const safeRating = Math.max(0, rating);
    return cap * (safeRating / (safeRating + softness));
  }

  function critFromRating(rating, cap = 0.60, softness = 120) {
    return chanceFromRating(rating, cap, softness);
  }

  function doubleFromRating(rating, cap = 0.45, softness = 160) {
    return chanceFromRating(rating, cap, softness);
  }

  window.BALANCE = {
    DIFFICULTIES,
    AXE_UPGRADES,
    ATTRIBUTE_UPGRADES,
    UNLOCKS,
    getDifficulty,
    xpNeededForLevel,
    treeHp,
    treeGold,
    axeCost,
    attributeCost,
    critFromRating,
    doubleFromRating,
    chanceFromRating,
  };
})();

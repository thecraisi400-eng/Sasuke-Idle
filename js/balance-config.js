(function () {
  const DIFFICULTIES = {
    easy: {
      id: 'easy', name: 'Fácil', baseDps: 1.2, baseHp: 6, hpGrowth: 1.12,
      dayGrowth: 0.08, goldMultiplier: 2, costMultiplier: 0.7,
      crystalChance: 0.018, rareChance: 0.10, unlockSpeed: 0.75,
    },
    medium: {
      id: 'medium', name: 'Medio', baseDps: 0.8, baseHp: 12, hpGrowth: 1.16,
      dayGrowth: 0.10, goldMultiplier: 1, costMultiplier: 1,
      crystalChance: 0.010, rareChance: 0.07, unlockSpeed: 1,
    },
    hard: {
      id: 'hard', name: 'Difícil', baseDps: 0.6, baseHp: 24, hpGrowth: 1.19,
      dayGrowth: 0.14, goldMultiplier: 0.75, costMultiplier: 1.5,
      crystalChance: 0.007, rareChance: 0.055, unlockSpeed: 1.35,
    },
    impossible: {
      id: 'impossible', name: 'Imposible', baseDps: 0.45, baseHp: 60, hpGrowth: 1.22,
      dayGrowth: 0.18, goldMultiplier: 0.5, costMultiplier: 2.5,
      crystalChance: 0.0045, rareChance: 0.04, unlockSpeed: 1.8,
    },
  };

  const AXE_UPGRADES = [
    { id: 'edge', name: 'FILO DEL HACHA', icon: '🪓', desc: 'Aumenta el daño plano de cada golpe automático.', baseCost: 8, costMult: 1.32, level: 0, type: 'gold', effectStep: 1.00, scalingStep: 0.18, roiTarget: '45-140 s early' },
    { id: 'quality', name: 'CALIDAD DEL FILO', icon: '⏱️', desc: 'Aumenta la velocidad de golpes del hacha.', baseCost: 35, costMult: 1.38, level: 0, type: 'gold', effectStep: 0.08, roiTarget: '70-180 s early' },
    { id: 'crit', name: 'HACHA CRÍTICOS', icon: '🎯', desc: 'Aumenta la probabilidad de golpe crítico x2.', baseCost: 45, costMult: 1.42, level: 0, type: 'gold', effectStep: 0.0015, cap: 0.45, roiTarget: '2-5 min early' },
    { id: 'double', name: 'HACHA DOBLE FILO', icon: '🪓', desc: 'Aumenta la probabilidad de doble golpe.', baseCost: 75, costMult: 1.48, level: 0, type: 'gold', effectStep: 0.0010, cap: 0.35, roiTarget: '3-8 min early' },
    { id: 'stone', name: 'PIEDRA DE AFILAR', icon: '☢️', desc: 'Consumible: duplica el daño automático por 5 minutos. No se acumula.', baseCost: 250, costMult: 1.25, level: 0, type: 'item', effectStep: 1 },
  ];

  const ATTRIBUTE_UPGRADES = [
    { id: 'carbon', emoji: '🪓', name: 'Filo de Carbono', type: 'dpsMultiplier', maxLevel: 30, baseCost: 1, costGrowth: 1.10, effectPerLevel: 0.08, desc: '+8% daño automático por nivel; cada 10 niveles añade +1 daño plano.', synergy: 'Filo del Hacha y Piedra de Afilar.' },
    { id: 'forest_reflex', emoji: '⏱️', name: 'Reflejo del Bosque', type: 'speedMultiplier', maxLevel: 25, baseCost: 2, costGrowth: 1.12, effectPerLevel: 0.025, desc: '+2.5% golpes/s por nivel.', synergy: 'Calidad, Doble Filo y Corte Resonante.' },
    { id: 'surgical_precision', emoji: '🎯', name: 'Precisión Quirúrgica', type: 'critChance', maxLevel: 20, baseCost: 3, costGrowth: 1.15, effectPerLevel: 0.002, desc: '+0.20% crítico por nivel; cada 5 niveles suma daño crítico.', synergy: 'Hacha Críticos y Ojo del Leñador.' },
    { id: 'golden_sap', emoji: '🍯', name: 'Savia Dorada', type: 'goldMultiplier', maxLevel: 25, baseCost: 2, costGrowth: 1.14, effectPerLevel: 0.03, desc: '+3% oro por árbol por nivel.', synergy: 'Misiones y eventos de oro.' },
    { id: 'tireless_arm', emoji: '💪', name: 'Brazo Incansable', type: 'fatigueResist', maxLevel: 20, baseCost: 2, costGrowth: 1.18, effectPerLevel: 0.015, desc: '+1.5% velocidad y resistencia a penalizaciones por nivel.', synergy: 'Reflejo y combos.' },
    { id: 'resonant_cut', emoji: '🔔', name: 'Corte Resonante', type: 'resonance', maxLevel: 10, baseCost: 4, costGrowth: 1.30, effectPerLevel: 0.08, desc: 'Golpes periódicos adicionales que escalan con velocidad.', synergy: 'Calidad y Doble Golpe.' },
    { id: 'clean_harvest', emoji: '🌿', name: 'Cosecha Limpia', type: 'rareChance', maxLevel: 15, baseCost: 3, costGrowth: 1.20, effectPerLevel: 0.02, desc: '+2% probabilidad de madera rara por nivel.', synergy: 'Biomas, gremios y eventos.' },
    { id: 'prestige_roots', emoji: '👑', name: 'Raíces del Prestigio', type: 'prestigePower', maxLevel: 10, baseCost: 5, costGrowth: 1.25, effectPerLevel: 0.04, desc: '+4% eficacia de esencias de prestigio por nivel.', synergy: 'Rebirth.' },
    { id: 'perfect_sharpening', emoji: '☢️', name: 'Afinado Perfecto', type: 'whetstonePower', maxLevel: 12, baseCost: 2, costGrowth: 1.22, effectPerLevel: 0.03, desc: '+3% potencia y +20 s de duración de Piedra por nivel.', synergy: 'Jefes y speedrun.' },
    { id: 'anti_bark', emoji: '🛡️', name: 'Corte Anticorteza', type: 'bossArmorIgnore', maxLevel: 8, baseCost: 6, costGrowth: 1.35, effectPerLevel: 0.02, desc: 'Ignora 2% de resistencia de árboles especiales por nivel.', synergy: 'Árboles legendarios.' },
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
    return Math.floor(100 * Math.pow(1.145, Math.max(0, level - 1)) * (1 + 0.02 * Math.sqrt(level)));
  }

  function treeHp(level, day, difficultyId) {
    const diff = getDifficulty(difficultyId);
    const safeLevel = Math.max(1, level);
    return Math.max(1, Math.round(diff.baseHp * Math.pow(diff.hpGrowth, safeLevel - 1) * Math.pow(Math.max(1, day), diff.dayGrowth)));
  }

  function treeGold(level, difficultyId, goldBonus = 0) {
    const diff = getDifficulty(difficultyId);
    const safeLevel = Math.max(1, level);
    const base = 3 * Math.pow(1.135, safeLevel - 1) * (1 + 0.01 * safeLevel);
    return Math.max(1, Math.floor(base * diff.goldMultiplier * (1 + goldBonus)));
  }

  function axeCost(upgrade, difficultyId, extraStock = 0) {
    const diff = getDifficulty(difficultyId);
    const level = upgrade.type === 'item' ? extraStock : upgrade.level;
    return Math.max(1, Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult || 1, level) * diff.costMultiplier));
  }

  function attributeCost(attr) {
    return Math.max(1, Math.ceil(attr.baseCost * Math.pow(attr.costGrowth, attr.level || 0)));
  }

  function critFromRating(rating, cap = 0.45, k = 0.25) {
    const safeRating = Math.max(0, rating);
    return cap * (safeRating / (safeRating + k));
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
  };
})();

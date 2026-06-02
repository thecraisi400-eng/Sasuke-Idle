(function () {
  const VERSION = 2;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function levelOf(context, id) {
    if (context?.attributes && Object.prototype.hasOwnProperty.call(context.attributes, id)) {
      return Number(context.attributes[id]) || 0;
    }
    return 0;
  }

  function upgradeLevel(context, id) {
    const upgrade = (context?.axeUpgrades || []).find(u => u.id === id);
    return Number(upgrade?.level) || 0;
  }

  function sumEdgeDamage(context) {
    const edge = (context?.axeUpgrades || []).find(u => u.id === 'edge');
    if (!edge) return 0;
    const level = Number(edge.level) || 0;
    const step = Number(edge.effectStep) || 1;
    const scaling = Number(edge.scalingStep) || 0;
    let total = 0;
    for (let i = 0; i < level; i += 1) total += step * (1 + i * scaling);
    return total;
  }

  function getNextUnlock(level, unlocks) {
    const next = Object.keys(unlocks || {})
      .map(Number)
      .filter(unlockLevel => unlockLevel > level)
      .sort((a, b) => a - b)[0];
    return next ? { level: next, label: unlocks[next] } : null;
  }

  function computeProgression(G, context = {}) {
    const balance = context.balance || window.BALANCE;
    const level = Math.max(1, Number(G.level) || 1);
    const xpNeeded = Math.max(1, Number(G.xpNeeded) || balance.xpNeededForLevel(level));
    const xp = Math.max(0, Number(G.xp) || 0);
    const skillPointsEarnedTotal = Math.floor((level - 1) / 5);
    const attributePointsEarnedTotal = Math.max(0, level - 1) + Math.floor(level / 10);

    return {
      level,
      xp,
      xpNeeded,
      xpProgress01: clamp(xp / xpNeeded, 0, 1),
      attributePointsAvailable: Number(G.attributePoints) || 0,
      attributePointsEarnedTotal,
      skillPointsAvailable: Number(G.skillPoints) || 0,
      skillPointsEarnedTotal,
      nextUnlock: getNextUnlock(level, balance.UNLOCKS),
    };
  }

  function computeTree(G, context = {}) {
    const balance = context.balance || window.BALANCE;
    const difficulty = context.difficulty || G.difficulty || 'medium';
    const level = Math.max(1, Number(G.level) || 1);
    const day = Math.max(1, Number(context.day) || 1);
    const isBoss = Boolean(context.isBoss);
    const bossArmorIgnore = clamp(levelOf(context, 'boss_cleaver') * 0.01, 0, 0.75);
    const bossMultiplier = isBoss ? Math.max(2.5, (4 + Math.floor(level / 15) * 0.75) * (1 - bossArmorIgnore)) : 1;
    const baseHp = balance.treeHp(level, day, difficulty);
    const finalHp = Math.max(1, Math.round(baseHp * bossMultiplier));

    return {
      level,
      baseHp,
      finalHp,
      isBoss,
      hpMultiplierBreakdown: [
        { id: 'difficulty', label: balance.getDifficulty(difficulty).name, value: baseHp },
        { id: 'boss', label: isBoss ? 'Jefe' : 'Árbol normal', value: bossMultiplier },
        { id: 'boss_cleaver', label: 'Ignorar armadura', value: bossArmorIgnore },
      ],
    };
  }

  function computeCombat(G, context = {}) {
    const balance = context.balance || window.BALANCE;
    const difficulty = context.difficulty || G.difficulty || 'medium';
    const diff = balance.getDifficulty(difficulty);
    const level = Math.max(1, Number(G.level) || 1);
    const weather = context.weather || { dps: 1, crit: 1 };
    const now = Number(context.now) || Date.now();
    const isBoss = Boolean(context.isBoss);

    const flatAxeDamage = sumEdgeDamage(context);
    const flatAttributeDamage = Math.floor(levelOf(context, 'axe_mastery') / 10);
    const baseDamage = Number(diff.baseDps) || 1;
    const attributeDamageMultiplier = 1 + levelOf(context, 'axe_mastery') * 0.04;
    const ancientRoots = levelOf(context, 'ancient_roots') * 0.03;
    const prestigeEssence = Math.max(0, Number(G.prestigeEssence) || 0);
    const prestigeMultiplier = prestigeEssence > 0 ? 1 + 0.10 * Math.pow(prestigeEssence, 0.82) * (1 + ancientRoots) : (Number(G.prestigeMultiplier) || 1);
    const stoneAttributeBonus = levelOf(context, 'sharpening_ritual') * 0.03;
    const stoneMultiplier = now < (Number(G.whetstoneBoostUntil) || 0) ? 2 * (1 + stoneAttributeBonus) : 1;
    const bossDamageMultiplier = isBoss ? 1 + levelOf(context, 'boss_cleaver') * 0.02 : 1;
    const clanDpsMultiplier = 1 + (Number(G.clanBonus?.dps) || 0);
    const skillDpsMultiplier = (1 + (Number(G.skills?.speed) || 0) * 0.15) * (1 + (Number(G.skills?.endurance) || 0) * 0.25);

    const damagePerHit = (baseDamage + flatAxeDamage + flatAttributeDamage)
      * attributeDamageMultiplier
      * prestigeMultiplier
      * stoneMultiplier
      * (Number(weather.dps) || 1)
      * clanDpsMultiplier
      * bossDamageMultiplier;

    const quality = (context.axeUpgrades || []).find(u => u.id === 'quality');
    const speedBonusAxe = (Number(quality?.effectStep) || 0.07) * upgradeLevel(context, 'quality');
    const speedBonusAttributes = levelOf(context, 'swift_chops') * 0.02 + levelOf(context, 'steady_hand') * 0.002;
    const speedBonusSkills = (Number(G.skills?.speed) || 0) * 0.03;
    const capSpeed = (Number(G.prestigeEssence) || 0) > 0 ? 12 : level >= 51 ? 8 : level >= 21 ? 5 : 3;
    const hitsPerSecond = clamp(1 * (1 + speedBonusAxe + speedBonusAttributes + speedBonusSkills), 0.25, capSpeed);

    const critRating = upgradeLevel(context, 'crit') * 5 + levelOf(context, 'keen_eye') * 6;
    const critChance = clamp(balance.critFromRating(critRating) * (Number(weather.crit) || 1), 0, 0.60);
    const critMultiplier = 2 + levelOf(context, 'splitting_edge') * 0.04;
    const expectedCritFactor = 1 + critChance * (critMultiplier - 1);

    const doubleRating = upgradeLevel(context, 'double') * 4 + levelOf(context, 'twin_swing') * 5;
    const doubleHitChance = balance.doubleFromRating(doubleRating);
    const doubleHitMultiplier = 1 + doubleHitChance;
    const activeBurstMultiplier = stoneMultiplier;
    const bossArmorIgnore = clamp(levelOf(context, 'boss_cleaver') * 0.01, 0, 0.75);
    const resonanceMultiplier = 1;
    const expectedDps = damagePerHit * hitsPerSecond * expectedCritFactor * doubleHitMultiplier * resonanceMultiplier * skillDpsMultiplier;
    const treeHp = Math.max(1, Number(context.currentTreeHp || context.treeHp || 0));

    return {
      damagePerHit,
      hitsPerSecond,
      expectedDps,
      critChance,
      critMultiplier,
      doubleHitChance,
      doubleHitMultiplier,
      activeBurstMultiplier,
      bossArmorIgnore,
      timeToChopSeconds: treeHp > 0 ? treeHp / Math.max(0.01, expectedDps) : 0,
      capSpeed,
      critRating,
      doubleRating,
    };
  }

  function computeRewards(G, context = {}) {
    const balance = context.balance || window.BALANCE;
    const difficulty = context.difficulty || G.difficulty || 'medium';
    const diff = balance.getDifficulty(difficulty);
    const level = Math.max(1, Number(G.level) || 1);
    const weather = context.weather || { gold: 1, xp: 1, rare: 0 };
    const isBoss = Boolean(context.isBoss);
    const goldBonus = levelOf(context, 'golden_sap') * 0.03 + levelOf(context, 'steady_hand') * 0.01 + (Number(G.clanBonus?.gold) || 0) + (Number(G.combo) || 0) * 0.002;
    const bossGoldFactor = isBoss ? 5 + Math.min(7, Math.floor(level / 30)) : 1;
    const goldPerTree = balance.treeGold(level, difficulty, goldBonus, Number(weather.gold) || 1, bossGoldFactor);

    const xpBonus = levelOf(context, 'forest_wisdom') * 0.025 + levelOf(context, 'steady_hand') * 0.01;
    const bossXPFactor = isBoss ? (level % 30 === 0 ? 8 : 3) : 1;
    const xpPerTree = Math.max(1, Math.floor((4 + Math.pow(level, 0.82)) * (diff.xpMultiplier || 1) * (Number(weather.xp) || 1) * (1 + xpBonus) * bossXPFactor));
    const rareRatingChance = balance.chanceFromRating(levelOf(context, 'rare_sense') * 4, 0.40, 120);
    const rareWoodChance = clamp((diff.rareChance || 0) + (Number(weather.rare) || 0) + rareRatingChance, 0, 0.60);
    const crystalChance = clamp((diff.crystalChance || 0) * (1 + levelOf(context, 'rare_sense') * 0.01), 0, 0.25);

    const seconds = Math.max(1, Number(context.timeToChopSeconds) || 60);
    return {
      goldPerTree,
      xpPerTree,
      rareWoodChance,
      crystalChance,
      goldPerMinuteEstimate: goldPerTree * (60 / seconds),
      xpPerMinuteEstimate: xpPerTree * (60 / seconds),
    };
  }

  function computePrestige(G, context = {}) {
    const runGold = Math.max(0, Number(G.totalGoldEarned || 0) - Number(G.goldAtLastPrestige || 0));
    const treesRun = Math.max(0, Number(G.treesChopped) || 0);
    const maxLevelRun = Math.max(1, Number(G.level) || 1);
    const ancientRoots = levelOf(context, 'ancient_roots') * 0.03;
    const rewardRaw = Math.sqrt(runGold / 6000) + treesRun / 120 + maxLevelRun / 10;
    const nextPrestigeReward = Math.max(1, Math.floor(rewardRaw));
    const essence = Math.max(0, Number(G.prestigeEssence) || 0);
    const multiplier = 1 + 0.10 * Math.pow(essence, 0.82) * (1 + ancientRoots);
    const projectedMultiplier = 1 + 0.10 * Math.pow(essence + nextPrestigeReward, 0.82) * (1 + ancientRoots);

    return {
      essence,
      multiplier,
      nextPrestigeReward,
      projectedMultiplier,
      canPrestige: maxLevelRun >= 20 || treesRun >= 150,
      sources: { runGold, treesRun, maxLevelRun },
    };
  }

  function buildSources(stats, G, context = {}) {
    const weather = context.weather || { name: 'Clima normal', dps: 1, gold: 1, xp: 1 };
    return [
      { id: 'base_damage', label: 'Daño base + hacha', stat: 'damagePerHit', operation: '+', value: stats.combat.damagePerHit, display: stats.combat.damagePerHit.toFixed(2), visible: true },
      { id: 'speed_cap', label: `Cap velocidad (${stats.combat.capSpeed}/s)`, stat: 'hitsPerSecond', operation: 'clamp', value: stats.combat.hitsPerSecond, display: `${stats.combat.hitsPerSecond.toFixed(2)}/s`, visible: true },
      { id: 'crit_cap', label: 'Crítico con cap 60%', stat: 'critChance', operation: 'rating', value: stats.combat.critChance, display: `${(stats.combat.critChance * 100).toFixed(1)}%`, visible: true },
      { id: 'double_cap', label: 'Doble golpe con cap 45%', stat: 'doubleHitChance', operation: 'rating', value: stats.combat.doubleHitChance, display: `${(stats.combat.doubleHitChance * 100).toFixed(1)}%`, visible: true },
      { id: 'weather', label: weather.name || 'Clima', stat: 'weather', operation: 'x', value: weather.dps || 1, display: `DPS x${(weather.dps || 1).toFixed(2)} · Oro x${(weather.gold || 1).toFixed(2)} · XP x${(weather.xp || 1).toFixed(2)}`, visible: true },
      { id: 'prestige', label: 'Prestigio', stat: 'prestigeMultiplier', operation: 'x', value: stats.prestige.multiplier || 1, display: `x${(stats.prestige.multiplier || 1).toFixed(2)}`, visible: true },
    ];
  }

  function computeAll(G, context = {}) {
    const balance = context.balance || window.BALANCE;
    const fullContext = { ...context, balance };
    const tree = computeTree(G, fullContext);
    const combat = computeCombat(G, { ...fullContext, treeHp: tree.finalHp });
    const rewards = computeRewards(G, { ...fullContext, timeToChopSeconds: combat.timeToChopSeconds });
    const progression = computeProgression(G, fullContext);
    const prestige = computePrestige(G, fullContext);
    const stats = { version: VERSION, combat, tree, rewards, progression, prestige };
    stats.breakdown = { sources: buildSources(stats, G, fullContext) };
    return stats;
  }

  window.STAT_ENGINE = {
    VERSION,
    computeAll,
    computeCombat,
    computeTree,
    computeRewards,
    computeProgression,
    computePrestige,
  };
})();

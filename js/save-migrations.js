(function () {
  const CURRENT_SAVE_VERSION = 2;
  const CURRENT_STATS_VERSION = 2;

  function normalizeNumber(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function migrateSave(rawSave) {
    const save = rawSave && typeof rawSave === 'object' ? rawSave : {};
    const version = normalizeNumber(save.saveVersion || save.version, 1);
    save.G = save.G && typeof save.G === 'object' ? save.G : {};

    save.G.saveVersion = CURRENT_SAVE_VERSION;
    save.G.statsVersion = CURRENT_STATS_VERSION;
    save.G.difficulty = save.G.difficulty || 'medium';
    save.G.gold = Math.max(0, normalizeNumber(save.G.gold, 0));
    save.G.crystals = Math.max(0, normalizeNumber(save.G.crystals, 0));
    save.G.level = Math.max(1, normalizeNumber(save.G.level, 1));
    save.G.xp = Math.max(0, normalizeNumber(save.G.xp, 0));
    save.G.attributePoints = Math.max(0, normalizeNumber(save.G.attributePoints, 0));
    save.G.skillPoints = Math.max(0, normalizeNumber(save.G.skillPoints, 0));
    save.G.prestigeEssence = Math.max(0, normalizeNumber(save.G.prestigeEssence, 0));
    save.G.prestigeMultiplier = Math.max(1, normalizeNumber(save.G.prestigeMultiplier, 1));
    save.G.treesChopped = Math.max(0, normalizeNumber(save.G.treesChopped, 0));
    save.G.totalTreesChopped = Math.max(0, normalizeNumber(save.G.totalTreesChopped, 0));
    save.G.totalGoldEarned = Math.max(0, normalizeNumber(save.G.totalGoldEarned, 0));
    save.G.goldAtLastPrestige = Math.max(0, normalizeNumber(save.G.goldAtLastPrestige, 0));
    save.G.clanBonus = save.G.clanBonus || { dps: 0, gold: 0 };
    save.G.skills = save.G.skills || { strength: 0, speed: 0, luck: 0, endurance: 0 };

    if (version < 2) {
      save.G.migratedFromSaveVersion = version;
      save.G.xpNeeded = window.BALANCE?.xpNeededForLevel?.(save.G.level) || save.G.xpNeeded || 100;
    }

    save.saveVersion = CURRENT_SAVE_VERSION;
    save.statsVersion = CURRENT_STATS_VERSION;
    return save;
  }

  window.SAVE_MIGRATIONS = {
    CURRENT_SAVE_VERSION,
    CURRENT_STATS_VERSION,
    migrateSave,
  };
})();

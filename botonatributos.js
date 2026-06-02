(function () {
  const ATTR_UPGRADES = (window.BALANCE?.ATTRIBUTE_UPGRADES || []).map(u => ({ ...u, level: 0 }));

  const LEGACY_ATTRIBUTE_MAP = {
    carbon: 'axe_mastery',
    forest_reflex: 'swift_chops',
    surgical_precision: 'keen_eye',
    golden_sap: 'golden_sap',
    tireless_arm: 'steady_hand',
    resonant_cut: 'twin_swing',
    clean_harvest: 'rare_sense',
    prestige_roots: 'ancient_roots',
    perfect_sharpening: 'sharpening_ritual',
    anti_bark: 'boss_cleaver',
  };

  function getAttrUpgrades() {
    return ATTR_UPGRADES;
  }

  function getAttrLevel(id) {
    return ATTR_UPGRADES.find(u => u.id === id)?.level || 0;
  }

  function getAttrLevels() {
    return ATTR_UPGRADES.reduce((acc, u) => {
      acc[u.id] = u.level;
      return acc;
    }, {});
  }

  function getAttrCost(u) {
    return window.BALANCE?.attributeCost ? window.BALANCE.attributeCost(u) : Math.max(1, (u.baseCost || 1) + Math.floor((u.level || 0) / (u.tierSize || 8)));
  }

  function getAttrEffectValue(id) {
    const u = ATTR_UPGRADES.find(attr => attr.id === id);
    if (!u) return 0;
    return u.level * u.effectPerLevel;
  }

  function getStatSnapshot() {
    if (!window.STAT_ENGINE || !window.G) return null;
    return window.STAT_ENGINE.computeAll(window.G, window.getStatsContext ? window.getStatsContext() : { attributes: getAttrLevels() });
  }

  function applyAttrToGPS(base) {
    return getStatSnapshot()?.combat.expectedDps || base;
  }

  function applyAttrToGPC(base) {
    return getStatSnapshot()?.rewards.goldPerTree || base;
  }

  function getCritBonus() {
    return getAttrLevel('keen_eye') * 6;
  }

  function getGoldBonus() {
    return getAttrLevel('golden_sap') * 0.03;
  }

  function getRareBonus() {
    return window.BALANCE?.chanceFromRating?.(getAttrLevel('rare_sense') * 4, 0.40, 120) || 0;
  }

  function getPrestigeBonus() {
    return getAttrLevel('ancient_roots') * 0.03;
  }

  function formatPercent(value) {
    return `${(value * 100).toFixed(value >= 0.1 ? 0 : 1)}%`;
  }

  function effectPreview(u, next = false) {
    const level = u.level + (next ? 1 : 0);
    switch (u.type) {
      case 'damage': return `+${(level * 4).toFixed(0)}% daño · +${Math.floor(level / 10)} plano`;
      case 'speed': return `+${(level * 2).toFixed(0)}% golpes/s`;
      case 'critRating': return `+${level * 6} rating crítico`;
      case 'critDamage': return `+${(level * 4).toFixed(0)}% daño crítico`;
      case 'doubleRating': return `+${level * 5} rating doble`;
      case 'gold': return `+${(level * 3).toFixed(0)}% oro`;
      case 'xp': return `+${(level * 2.5).toFixed(1)}% XP`;
      case 'rareRating': return `+${level * 4} rating raro · +${level}% cristal relativo`;
      case 'boss': return `+${(level * 2).toFixed(0)}% daño jefe · ${level}% ignora armadura`;
      case 'prestige': return `+${(level * 3).toFixed(0)}% eficacia esencia`;
      case 'whetstone': return `+${(level * 3).toFixed(0)}% piedra · +${level * 15}s`;
      case 'steady': return `+${level}% mínimo oro/XP`;
      default: return `Nv. ${level}`;
    }
  }

  function computeImpact(u) {
    const before = getStatSnapshot();
    if (!before || u.level >= u.maxLevel) return 'Máximo alcanzado';
    const attributes = getAttrLevels();
    attributes[u.id] = (attributes[u.id] || 0) + 1;
    const after = window.STAT_ENGINE.computeAll(window.G, { ...window.getStatsContext?.(), attributes });
    const deltas = [];
    const dpsGain = before.combat.expectedDps > 0 ? (after.combat.expectedDps / before.combat.expectedDps - 1) : 0;
    const goldGain = before.rewards.goldPerMinuteEstimate > 0 ? (after.rewards.goldPerMinuteEstimate / before.rewards.goldPerMinuteEstimate - 1) : 0;
    const xpGain = before.rewards.xpPerMinuteEstimate > 0 ? (after.rewards.xpPerMinuteEstimate / before.rewards.xpPerMinuteEstimate - 1) : 0;
    if (dpsGain > 0.001) deltas.push(`+${formatPercent(dpsGain)} DPS`);
    if (goldGain > 0.001) deltas.push(`+${formatPercent(goldGain)} oro/min`);
    if (xpGain > 0.001) deltas.push(`+${formatPercent(xpGain)} XP/min`);
    return deltas.length ? deltas.join(' · ') : 'Impacto situacional';
  }

  function renderAttrsModal() {
    const { G } = window;
    if (typeof G.attributePoints !== 'number') G.attributePoints = 0;
    const stats = getStatSnapshot();

    let html = `<section class="attrs-panel">
      <div class="attrs-header-card">
        <div class="attrs-header-title">✨ Centro de Atributos</div>
        <p class="attrs-header-subtitle">Atributos con rol claro, caps visibles e impacto estimado desde el motor de estadísticas.</p>
      </div>

      <div class="attrs-stats-grid">
        <div class="attrs-stat-chip">
          <span class="chip-emoji">⭐</span>
          <div><span class="chip-label">Nivel</span><strong class="chip-value">${G.level}</strong></div>
        </div>
        <div class="attrs-stat-chip">
          <span class="chip-emoji">🧠</span>
          <div><span class="chip-label">XP</span><strong class="chip-value">${Math.floor(G.xp)} / ${G.xpNeeded}</strong></div>
        </div>
        <div class="attrs-stat-chip attrs-stat-chip--points">
          <span class="chip-emoji">🎯</span>
          <div><span class="chip-label">Puntos disponibles</span><strong class="chip-value">${G.attributePoints}</strong></div>
        </div>
        <div class="attrs-stat-chip">
          <span class="chip-emoji">⚔️</span>
          <div><span class="chip-label">DPS esperado</span><strong class="chip-value">${stats ? stats.combat.expectedDps.toFixed(1) : '—'}</strong></div>
        </div>
      </div>
    </section>`;

    ATTR_UPGRADES.forEach((u, i) => {
      const locked = G.level < (u.unlockLevel || 1);
      const cost = getAttrCost(u);
      const canAfford = !locked && G.attributePoints >= cost && u.level < u.maxLevel;
      html += `<div class="upgrade-item attr-upgrade-card">
        <div class="upgrade-icon">${u.emoji}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${u.name}</div>
          <div class="upgrade-desc"><strong>Rol:</strong> ${u.role || 'Especialización'}<br>${u.desc}<br><strong>Sinergia:</strong> ${u.synergy}</div>
          <div class="attr-metrics">
            <span class="metric-pill">⭐ Nivel <strong>${u.level}/${u.maxLevel}</strong></span>
            <span class="metric-pill">🎯 Costo <strong>${cost}</strong></span>
            <span class="metric-pill">📌 Actual <strong>${effectPreview(u)}</strong></span>
            <span class="metric-pill">🔮 Siguiente <strong>${u.level >= u.maxLevel ? 'Máx.' : effectPreview(u, true)}</strong></span>
            <span class="metric-pill">📈 Impacto <strong>${computeImpact(u)}</strong></span>
            <span class="metric-pill">🧭 Cap <strong>${u.maxLevel}</strong></span>
          </div>
        </div>
        <button class="upgrade-btn attr-upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyAttrUpgrade(${i})">${u.level >= u.maxLevel ? 'Máx.' : locked ? `🔒 Nv. ${u.unlockLevel}` : canAfford ? '🚀 Mejorar' : '🔒 Sin puntos'}</button>
      </div>`;
    });

    return html;
  }

  function buyAttrUpgrade(i) {
    const { G, showToast, updateUI, openModal } = window;
    const u = ATTR_UPGRADES[i];
    if (!u) return;
    const cost = getAttrCost(u);
    if (G.level < (u.unlockLevel || 1)) { showToast(`🔒 Se desbloquea en nivel ${u.unlockLevel}`); return; }
    if (u.level >= u.maxLevel) { showToast('✅ Atributo al máximo'); return; }
    if (G.attributePoints < cost) { showToast('❌ No hay puntos'); return; }

    G.attributePoints -= cost;
    u.level += 1;

    showToast(`✅ ${u.name} subió a nivel ${u.level}`);
    updateUI();
    openModal('attrs');
  }

  function exportAttrSave() {
    return ATTR_UPGRADES.map(u => ({ id: u.id, level: u.level }));
  }

  function importAttrSave(values) {
    if (!Array.isArray(values)) return;
    values.forEach((value, i) => {
      const id = LEGACY_ATTRIBUTE_MAP[value?.id] || value?.id;
      const target = ATTR_UPGRADES.find(u => u.id === id) || (!value?.id ? ATTR_UPGRADES[i] : null);
      if (!target) return;
      const importedLevel = Math.max(0, Number(value.level) || 0);
      target.level = Math.max(target.level || 0, Math.min(target.maxLevel, target.level + importedLevel));
    });
  }

  function resetAttrUpgrades() {
    // Los atributos se mantienen como metaprogresión reasignable en esta versión.
  }

  window.attrSystem = {
    getAttrUpgrades,
    getAttrLevel,
    getAttrLevels,
    getAttrCost,
    getAttrEffectValue,
    applyAttrToGPS,
    applyAttrToGPC,
    getCritBonus,
    getGoldBonus,
    getRareBonus,
    getPrestigeBonus,
    renderAttrsModal,
    buyAttrUpgrade,
    exportAttrSave,
    importAttrSave,
    resetAttrUpgrades,
  };

  window.buyAttrUpgrade = buyAttrUpgrade;
})();

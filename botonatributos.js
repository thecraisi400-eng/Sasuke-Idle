(function () {
  const ATTR_UPGRADES = (window.BALANCE?.ATTRIBUTE_UPGRADES || []).map(u => ({ ...u, level: 0 }));

  function getAttrUpgrades() {
    return ATTR_UPGRADES;
  }

  function getAttrLevel(id) {
    return ATTR_UPGRADES.find(u => u.id === id)?.level || 0;
  }

  function getAttrCost(u) {
    return window.BALANCE?.attributeCost ? window.BALANCE.attributeCost(u) : Math.ceil(u.baseCost * Math.pow(u.costGrowth || 1.15, u.level));
  }

  function getAttrEffectValue(id) {
    const u = ATTR_UPGRADES.find(attr => attr.id === id);
    if (!u) return 0;
    return u.level * u.effectPerLevel;
  }

  function applyAttrToGPS(base) {
    const carbon = getAttrEffectValue('carbon');
    const reflex = getAttrEffectValue('forest_reflex');
    const tireless = getAttrEffectValue('tireless_arm');
    const resonance = getAttrEffectValue('resonant_cut');
    const sharpening = getAttrEffectValue('perfect_sharpening');
    const stoneBonus = Date.now() < (window.G?.whetstoneBoostUntil || 0) ? sharpening : 0;
    return base * (1 + carbon) * (1 + reflex + tireless) * (1 + resonance) * (1 + stoneBonus);
  }

  function applyAttrToGPC(base) {
    return base * (1 + getAttrEffectValue('golden_sap'));
  }

  function getCritBonus() {
    return getAttrEffectValue('surgical_precision');
  }

  function getGoldBonus() {
    return getAttrEffectValue('golden_sap');
  }

  function getRareBonus() {
    return getAttrEffectValue('clean_harvest');
  }

  function getPrestigeBonus() {
    return getAttrEffectValue('prestige_roots');
  }

  function effectPreview(u, next = false) {
    const level = u.level + (next ? 1 : 0);
    const effect = level * u.effectPerLevel;
    if (['critChance', 'rareChance', 'goldMultiplier', 'speedMultiplier', 'dpsMultiplier', 'fatigueResist', 'whetstonePower', 'bossArmorIgnore', 'prestigePower'].includes(u.type)) {
      return `+${(effect * 100).toFixed(1)}%`;
    }
    if (u.type === 'resonance') return `+${(effect * 100).toFixed(0)}% golpe periódico`;
    return `Nv. ${level}`;
  }

  function renderAttrsModal() {
    const { G } = window;
    if (typeof G.attributePoints !== 'number') G.attributePoints = 0;

    let html = `<section class="attrs-panel">
      <div class="attrs-header-card">
        <div class="attrs-header-title">✨ Centro de Atributos</div>
        <p class="attrs-header-subtitle">Atributos deterministas: planifica daño, velocidad, crítico, economía y prestigio sin azar.</p>
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
      </div>
    </section>`;

    ATTR_UPGRADES.forEach((u, i) => {
      const cost = getAttrCost(u);
      const canAfford = G.attributePoints >= cost && u.level < u.maxLevel;
      html += `<div class="upgrade-item attr-upgrade-card">
        <div class="upgrade-icon">${u.emoji}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${u.name}</div>
          <div class="upgrade-desc">${u.desc}<br><strong>Sinergia:</strong> ${u.synergy}</div>
          <div class="attr-metrics">
            <span class="metric-pill">⭐ Nivel <strong>${u.level}/${u.maxLevel}</strong></span>
            <span class="metric-pill">🎯 Costo <strong>${cost}</strong></span>
            <span class="metric-pill">📌 Actual <strong>${effectPreview(u)}</strong></span>
            <span class="metric-pill">🔮 Siguiente <strong>${u.level >= u.maxLevel ? 'Máx.' : effectPreview(u, true)}</strong></span>
          </div>
        </div>
        <button class="upgrade-btn attr-upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyAttrUpgrade(${i})">${u.level >= u.maxLevel ? 'Máx.' : canAfford ? '🚀 Mejorar' : '🔒 Sin puntos'}</button>
      </div>`;
    });

    return html;
  }

  function buyAttrUpgrade(i) {
    const { G, showToast, updateUI, openModal } = window;
    const u = ATTR_UPGRADES[i];
    if (!u) return;
    const cost = getAttrCost(u);
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
      const target = ATTR_UPGRADES.find(u => u.id === value.id) || ATTR_UPGRADES[i];
      if (!target) return;
      target.level = Math.max(0, Math.min(target.maxLevel, Number(value.level) || 0));
    });
  }

  function resetAttrUpgrades() {
    // Los atributos son metaprogresión: se mantienen al prestigiar.
  }

  window.attrSystem = {
    getAttrUpgrades,
    getAttrLevel,
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

(function () {
  const ATTR_UPGRADES = [
    { id:'at1', emoji:'🪓', name:'Filo de Carbono', desc:'Incrementa el daño automático DPS infligido al tronco en cada golpe automático', level:0, cost:1, effect:1.30 },
  ];

  const ATTR_COST_MULTIPLIERS = [1.5, 1.9, 2.2, 2.5, 3.1, 3.5];

  function getAttrUpgrades() {
    return ATTR_UPGRADES;
  }

  function applyAttrToGPS(base) {
    if (ATTR_UPGRADES[0]) base *= ATTR_UPGRADES[0].effect;
    return base;
  }

  function applyAttrToGPC(base) {
    return base;
  }

  function renderAttrsModal() {
    const { G } = window;
    G.level = 1;
    G.xp = 0;
    G.xpNeeded = 100;
    if (typeof G.attributePoints !== 'number') G.attributePoints = 0;

    let html = `<section class="attrs-panel">
      <div class="attrs-header-card">
        <div class="attrs-header-title">✨ Centro de Atributos</div>
        <p class="attrs-header-subtitle">Mejora tus estadísticas con una vista clara, profesional y fácil de leer.</p>
      </div>

      <div class="attrs-stats-grid">
        <div class="attrs-stat-chip">
          <span class="chip-emoji">⭐</span>
          <div><span class="chip-label">Nivel</span><strong class="chip-value">1</strong></div>
        </div>
        <div class="attrs-stat-chip">
          <span class="chip-emoji">🧠</span>
          <div><span class="chip-label">XP</span><strong class="chip-value">0 / 100</strong></div>
        </div>
        <div class="attrs-stat-chip attrs-stat-chip--points">
          <span class="chip-emoji">🎯</span>
          <div><span class="chip-label">Puntos disponibles</span><strong class="chip-value">${G.attributePoints}</strong></div>
        </div>
      </div>
    </section>`;

    ATTR_UPGRADES.forEach((u, i) => {
      const canAfford = G.attributePoints >= u.cost;
      html += `<div class="upgrade-item attr-upgrade-card">
        <div class="upgrade-icon">${u.emoji}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${u.name}</div>
          <div class="upgrade-desc">${u.desc}</div>
          <div class="attr-metrics">
            <span class="metric-pill">⭐ Nivel <strong>${u.level}</strong></span>
            <span class="metric-pill">🎯 Costo <strong>${u.cost}</strong></span>
            <span class="metric-pill">⚡ Potencia <strong>x${u.effect.toFixed(2)}</strong></span>
          </div>
        </div>
        <button class="upgrade-btn attr-upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyAttrUpgrade(${i})">${canAfford ? '🚀 Mejorar' : '🔒 Sin puntos'}</button>
      </div>`;
    });

    return html;
  }

  function buyAttrUpgrade(i) {
    const { G, showToast, updateUI, openModal } = window;
    const u = ATTR_UPGRADES[i];
    if (!u || G.attributePoints < u.cost) return;

    G.attributePoints -= u.cost;

    if (u.level > 0) {
      const increase = +(0.15 + Math.random() * 0.30).toFixed(2);
      u.effect = +(u.effect + increase).toFixed(2);
    }

    const costMultiplier = ATTR_COST_MULTIPLIERS[Math.floor(Math.random() * ATTR_COST_MULTIPLIERS.length)];
    u.cost = Math.max(1, Math.ceil(u.cost * costMultiplier));
    u.level += 1;

    showToast(`✅ ${u.name} mejorado: x${u.effect.toFixed(2)}`);
    updateUI();
    openModal('attrs');
  }

  function exportAttrSave() {
    return ATTR_UPGRADES.map(u => ({ level: u.level, cost: u.cost, effect: u.effect }));
  }

  function importAttrSave(values) {
    if (!Array.isArray(values)) return;
    values.forEach((value, i) => {
      if (!ATTR_UPGRADES[i]) return;
      ATTR_UPGRADES[i].level = Number(value.level) || 0;
      ATTR_UPGRADES[i].cost = Number(value.cost) || 1;
      ATTR_UPGRADES[i].effect = Number(value.effect) || 1.30;
    });
  }

  function resetAttrUpgrades() {
    // Mejoras de atributos permanentes: no se reinician con prestigio.
  }

  window.attrSystem = {
    getAttrUpgrades,
    applyAttrToGPS,
    applyAttrToGPC,
    renderAttrsModal,
    buyAttrUpgrade,
    exportAttrSave,
    importAttrSave,
    resetAttrUpgrades,
  };

  window.buyAttrUpgrade = buyAttrUpgrade;
})();

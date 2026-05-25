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

    let html = `<p class="modal-section-title" style="text-align:center;">Mejoras de Atributos</p>
    <div class="stat-row"><span class="label">Nivel</span><span class="value">1</span></div>
    <div class="stat-row"><span class="label">XP</span><span class="value">0 / 100</span></div>
    <div class="stat-row"><span class="label">Puntos Disponibles</span><span class="value">${G.attributePoints}</span></div>
    <br>`;

    ATTR_UPGRADES.forEach((u, i) => {
      const canAfford = G.attributePoints >= u.cost;
      html += `<div class="upgrade-item">
        <div class="upgrade-icon">${u.emoji}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${u.name}</div>
          <div class="upgrade-desc">${u.desc}</div>
          <div class="upgrade-cost">⭐ <strong>Nivel ${u.level}</strong> &nbsp;|&nbsp; 🎯 <strong>${u.cost}</strong> punto(s) &nbsp;|&nbsp; ⚡ <strong>x${u.effect.toFixed(2)}</strong></div>
        </div>
        <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyAttrUpgrade(${i})">${canAfford ? 'Mejorar' : 'Sin puntos'}</button>
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

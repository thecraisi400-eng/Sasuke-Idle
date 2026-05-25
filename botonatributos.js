(function () {
  const ATTR_UPGRADES = [
    {
      id: 'at1',
      emoji: '🪓',
      name: 'Filo de Carbono',
      desc: 'Incrementa el daño automático DPS infligido al tronco en cada golpe automático.',
      level: 0,
      cost: 1,
      effect: 1.30,
      costMultipliers: [1.5, 1.9, 2.2, 2.5, 3.1, 3.5],
      initialStep: 0.15,
      stepMin: 0.15,
      stepMax: 0.45,
      isPercent: false
    },
    {
      id: 'at2',
      emoji: '⏱️',
      name: 'Reflejo Del Bosque',
      desc: 'Aumenta la velocidad de los golpes del hacha por segundo.',
      level: 0,
      cost: 1.5,
      effect: 1.20,
      costMultipliers: [1.70, 2.10, 2.40, 2.70, 3.30, 3.80],
      initialStep: 0.20,
      stepMin: 0.13,
      stepMax: 0.37,
      isPercent: false
    },
    {
      id: 'at3',
      emoji: '🎯',
      name: 'Precisión Quirúrgica',
      desc: 'Eleva la probabilidad de que un golpe normal se convierta en crítico.',
      level: 0,
      cost: 3,
      effect: 0.0002,
      costMultipliers: [1.90, 2.30, 2.60, 2.90, 3.50, 4.00],
      initialStep: 0.0002,
      stepMin: 0.0001,
      stepMax: 0.00015,
      isPercent: true
    }
  ];

  function getAttrUpgrades() {
    return ATTR_UPGRADES;
  }

  function applyAttrToGPS(base) {
    if (ATTR_UPGRADES[0]) base *= ATTR_UPGRADES[0].effect;
    if (ATTR_UPGRADES[1]) base *= ATTR_UPGRADES[1].effect;
    return base;
  }

  function applyAttrToGPC(base) {
    return base;
  }

  function getCurrentDisplayValue(u) {
    return u.isPercent ? `${(u.effect * 100).toFixed(3)}%` : `x${u.effect.toFixed(2)}`;
  }

  function getNextDisplayValue(u) {
    const next = u.level === 0 ? (u.effect + u.initialStep) : (u.effect + u.stepMin);
    return u.isPercent ? `${(next * 100).toFixed(3)}%` : `x${next.toFixed(2)}`;
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
          <div><span class="chip-label">Puntos disponibles</span><strong class="chip-value">${G.attributePoints.toFixed(2)}</strong></div>
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
            <span class="metric-pill">🎯 Costo <strong>${u.cost.toFixed(2)}</strong></span>
            <span class="metric-pill">📌 Actual <strong>${getCurrentDisplayValue(u)}</strong></span>
            <span class="metric-pill">🚀 Próximo <strong>${getNextDisplayValue(u)}</strong></span>
          </div>
        </div>
        <button class="upgrade-btn attr-upgrade-btn" onclick="buyAttrUpgrade(${i})">${canAfford ? '🚀 Mejorar' : '🔒 Sin puntos'}</button>
      </div>`;
    });

    return html;
  }

  function buyAttrUpgrade(i) {
    const { G, showToast, updateUI, openModal } = window;
    const u = ATTR_UPGRADES[i];
    if (!u) return;

    if (G.attributePoints < u.cost) {
      showToast('❌ No hay puntos');
      return;
    }

    G.attributePoints = +(G.attributePoints - u.cost).toFixed(2);

    if (u.level === 0) {
      u.effect = +(u.effect + u.initialStep).toFixed(6);
    } else {
      const increase = +(u.stepMin + Math.random() * (u.stepMax - u.stepMin)).toFixed(6);
      u.effect = +(u.effect + increase).toFixed(6);
    }

    const costMultiplier = u.costMultipliers[Math.floor(Math.random() * u.costMultipliers.length)];
    u.cost = +(u.cost * costMultiplier).toFixed(2);
    u.level += 1;

    showToast(`✅ ${u.name} mejorado: ${getCurrentDisplayValue(u)}`);
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
      ATTR_UPGRADES[i].cost = Number(value.cost) || ATTR_UPGRADES[i].cost;
      ATTR_UPGRADES[i].effect = Number(value.effect) || ATTR_UPGRADES[i].effect;
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

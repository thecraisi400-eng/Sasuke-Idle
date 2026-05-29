(function () {
  const ATTR_UPGRADES = [
    { id:'at1', emoji:'🪓', name:'Filo de Carbono', desc:'Incrementa el daño automático DPS infligido al tronco en cada golpe automático', level:0, cost:1, effect:1.30, type:'dps' },
    { id:'at2', emoji:'⏱️', name:'Reflejo Del Bosque', desc:'Aumenta la velocidad de los golpes del hacha por segundo.', level:0, cost:1.5, effect:1.00, type:'speed' },
    { id:'at3', emoji:'🎯', name:'Precisión Quirúrgica', desc:'Eleva la probabilidad de que un golpe normal se convierta en crítico.', level:0, cost:3, effect:0, type:'crit' },
  ];

  const ATTR_COST_MULTIPLIERS = {
    at1: [1.5, 1.9, 2.2, 2.5, 3.1, 3.5],
    at2: [1.70, 2.10, 2.40, 2.70, 3.30, 3.80],
    at3: [1.90, 2.30, 2.60, 2.90, 3.50, 4.00],
  };

  const INITIAL_EFFECTS = {
    at1: 1.30,
    at2: 1.20,
    at3: 0.0002,
  };

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getAttrUpgrades() {
    return ATTR_UPGRADES;
  }

  function applyAttrToGPS(base) {
    const carbon = ATTR_UPGRADES[0];
    const speed = ATTR_UPGRADES[1];
    const crit = ATTR_UPGRADES[2];

    if (carbon) base *= carbon.effect;
    if (speed) base *= speed.effect;
    if (crit) base *= 1 + crit.effect;
    return base;
  }

  function applyAttrToGPC(base) {
    const speed = ATTR_UPGRADES[1];
    if (speed) base *= speed.effect;
    return base;
  }

  function nextEffectPreview(u) {
    if (u.type === 'speed') {
      if (u.level === 0) return 'x1.20';
      const nextInc = +(0.13 + Math.random() * (0.37 - 0.13)).toFixed(2);
      return `+x${nextInc.toFixed(2)}`;
    }
    if (u.type === 'crit') {
      if (u.level === 0) return '+0.02%';
      const nextInc = +(0.010 + Math.random() * 0.005).toFixed(3);
      return `+${nextInc.toFixed(3)}%`;
    }
    if (u.level === 0) return 'x1.30';
    const nextInc = +(0.15 + Math.random() * 0.30).toFixed(2);
    return `+x${nextInc.toFixed(2)}`;
  }

  function renderAttrsModal() {
    const { G } = window;
    if (typeof G.attributePoints !== 'number') G.attributePoints = 0;

    let html = `<section class="attrs-panel">
      <div class="attrs-header-card">
        <div class="attrs-header-title">✨ Centro de Atributos</div>
        <p class="attrs-header-subtitle">Mejora tus estadísticas con una vista clara, profesional y fácil de leer.</p>
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
      const canAfford = G.attributePoints >= u.cost;
      const currentText = u.type === 'crit'
        ? `${(u.effect * 100).toFixed(3)}%`
        : `x${u.effect.toFixed(2)}`;

      html += `<div class="upgrade-item attr-upgrade-card">
        <div class="upgrade-icon">${u.emoji}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${u.name}</div>
          <div class="upgrade-desc">${u.desc}</div>
          <div class="attr-metrics">
            <span class="metric-pill">⭐ Nivel <strong>${u.level}</strong></span>
            <span class="metric-pill">🎯 Costo <strong>${u.cost.toFixed(2)}</strong></span>
            <span class="metric-pill">📌 Actual <strong>${currentText}</strong></span>
            <span class="metric-pill">🔮 Siguiente <strong>${nextEffectPreview(u)}</strong></span>
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

    if (!u) return;
    if (G.attributePoints < u.cost) {
      showToast('❌ No hay puntos');
      return;
    }

    G.attributePoints -= u.cost;

    if (u.level === 0) {
      u.effect = +(u.effect * INITIAL_EFFECTS[u.id]).toFixed(4);
    } else if (u.type === 'speed') {
      const increase = +(0.13 + Math.random() * (0.37 - 0.13)).toFixed(2);
      u.effect = +(u.effect + increase).toFixed(2);
    } else if (u.type === 'crit') {
      const increase = +(0.010 + Math.random() * 0.005).toFixed(3);
      u.effect = +(u.effect + increase / 100).toFixed(6);
    } else {
      const increase = +(0.15 + Math.random() * 0.30).toFixed(2);
      u.effect = +(u.effect + increase).toFixed(2);
    }

    const costMultiplier = pickRandom(ATTR_COST_MULTIPLIERS[u.id]);
    u.cost = +(u.cost * costMultiplier).toFixed(2);
    u.level += 1;

    const effectText = u.type === 'crit' ? `${(u.effect * 100).toFixed(3)}%` : `x${u.effect.toFixed(2)}`;
    showToast(`✅ ${u.name} mejorado: ${effectText}`);
    updateUI();
    openModal('attrs');
  }

  function exportAttrSave() {
    return ATTR_UPGRADES.map(u => ({ id: u.id, level: u.level, cost: u.cost, effect: u.effect }));
  }

  function importAttrSave(values) {
    if (!Array.isArray(values)) return;
    values.forEach((value, i) => {
      if (!ATTR_UPGRADES[i]) return;
      ATTR_UPGRADES[i].level = Number(value.level) || 0;
      ATTR_UPGRADES[i].cost = Number(value.cost) || (i === 1 ? 1.5 : i === 2 ? 3 : 1);
      ATTR_UPGRADES[i].effect = Number(value.effect) || 1;
      if (i === 0 && ATTR_UPGRADES[i].effect === 1) ATTR_UPGRADES[i].effect = 1.30;
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

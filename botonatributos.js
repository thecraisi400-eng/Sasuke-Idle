(function () {
  const ATTR_CONFIG = {
    id: 'carbon-edge',
    name: 'Filo de Carbono',
    emoji: '🪓',
    desc: 'Incrementa el daño automático DPS infligido al tronco en cada golpe automático.',
    level: 0,
    currentMultiplier: 1.0,
    nextMultiplier: 1.3,
    cost: 1,
  };

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomCostFactor() {
    const factors = [1.5, 1.9, 2.2, 2.5, 3.1, 3.5];
    return factors[Math.floor(Math.random() * factors.length)];
  }

  function ensureState(G) {
    if (!G.attrPoints) G.attrPoints = 0;
    if (!G.attrUpgrades || !G.attrUpgrades[ATTR_CONFIG.id]) {
      G.attrUpgrades = G.attrUpgrades || {};
      G.attrUpgrades[ATTR_CONFIG.id] = { ...ATTR_CONFIG };
    }
    return G.attrUpgrades[ATTR_CONFIG.id];
  }

  window.ATTR_UPGRADES = [];

  window.getAttrPermanentDamageMultiplier = function (G) {
    const state = ensureState(G);
    return state.currentMultiplier;
  };

  window.renderAttrsModal = function (G) {
    const u = ensureState(G);
    const canAfford = G.attrPoints >= u.cost;
    return `
      <p class="modal-section-title" style="text-align:center;">Mejoras de Atributos</p>
      <div class="stat-row"><span class="label">Nivel</span><span class="value">1</span></div>
      <div class="stat-row"><span class="label">XP</span><span class="value">0 / 100</span></div>
      <div class="stat-row"><span class="label">Puntos Disponibles</span><span class="value">${G.attrPoints}</span></div>
      <br>
      <div class="upgrade-item">
        <div class="upgrade-icon">${u.emoji}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${u.name}</div>
          <div class="upgrade-desc">${u.desc}</div>
          <div class="upgrade-cost">📈 Multiplicador actual: x${u.currentMultiplier.toFixed(2)} → ✨ Próximo: x${u.nextMultiplier.toFixed(2)}</div>
          <div class="upgrade-cost">🎯 Nivel de mejora: ${u.level}</div>
          <div class="upgrade-cost">🧩 Costo actual: ${u.cost} punto(s)</div>
        </div>
        <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyAttrUpgrade(0)">${canAfford ? 'Mejorar' : 'Insuf.'}</button>
      </div>
    `;
  };

  window.buyAttrUpgrade = function (_index, G, deps) {
    const u = ensureState(G);
    if (G.attrPoints < u.cost) {
      deps.showToast('⚠️ No tienes puntos suficientes.');
      return;
    }

    G.attrPoints -= u.cost;
    u.level += 1;
    u.currentMultiplier *= u.nextMultiplier;

    if (u.level === 1) {
      u.nextMultiplier += randomBetween(0.15, 0.45);
    } else {
      u.nextMultiplier += randomBetween(0.15, 0.45);
    }
    u.cost = Math.max(1, Math.ceil(u.cost * randomCostFactor()));

    deps.showToast(`✅ ${u.name} mejorado. DPS permanente x${u.currentMultiplier.toFixed(2)}`);
    deps.updateUI();
    deps.openModal('attrs');
  };
})();

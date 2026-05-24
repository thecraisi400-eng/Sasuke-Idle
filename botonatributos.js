(function () {
  const COST_MULTIPLIERS = [1.5, 1.9, 2.2, 2.5, 3.1, 3.5];

  function ensureState() {
    if (!window.G) return null;
    if (!window.G.attributeState) {
      window.G.attributeState = {
        availablePoints: 0,
        carbonEdge: {
          level: 0,
          cost: 1,
          currentBonus: 1.0,
          nextGain: 1.3,
          applied: false
        }
      };
    }
    return window.G.attributeState;
  }

  function rollCostMultiplier() {
    return COST_MULTIPLIERS[Math.floor(Math.random() * COST_MULTIPLIERS.length)];
  }

  function rollNextGain() {
    const raw = 0.15 + (Math.random() * 0.30);
    return Number(raw.toFixed(2));
  }

  function renderAttrsModal() {
    const state = ensureState();
    if (!state) return '<p>Error: estado no disponible.</p>';
    const node = state.carbonEdge;
    const canBuy = state.availablePoints >= node.cost;
    const nextTotal = node.level === 0 ? node.nextGain : Number((node.currentBonus + node.nextGain).toFixed(2));

    return `
      <p class="modal-section-title attrs-title">Mejoras de Atributos</p>
      <div class="stat-row"><span class="label">Nivel</span><span class="value">1</span></div>
      <div class="stat-row"><span class="label">XP</span><span class="value">0 / 100</span></div>
      <div class="stat-row"><span class="label">Puntos Disponibles</span><span class="value">${state.availablePoints}</span></div>

      <div class="attr-card">
        <div class="attr-head"><span>🪓 Filo de Carbono</span><span class="attr-level">Nv. ${node.level}</span></div>
        <div class="attr-desc">Incrementa el daño automático DPS infligido al tronco en cada golpe automático.</div>
        <div class="mini-scrolls">
          <div class="mini-chip chip-now">⚡ Actual: x${node.currentBonus.toFixed(2)}</div>
          <div class="mini-chip chip-next">🚀 Siguiente: x${nextTotal.toFixed(2)}</div>
          <div class="mini-chip chip-cost">🎯 Costo: ${node.cost} punto(s)</div>
        </div>
        <button class="upgrade-btn" ${canBuy ? '' : 'disabled'} onclick="buyAttrUpgrade()">${canBuy ? 'Mejorar' : 'Sin puntos'}</button>
      </div>
    `;
  }

  function buyAttrUpgrade() {
    const state = ensureState();
    const node = state.carbonEdge;
    if (state.availablePoints < node.cost) {
      window.showToast('⚠️ No tienes puntos disponibles');
      return;
    }

    state.availablePoints -= node.cost;
    const appliedGain = node.level === 0 ? node.nextGain : Number((node.currentBonus + node.nextGain).toFixed(2));
    node.currentBonus = appliedGain;
    node.level += 1;
    if (!node.applied) node.applied = true;

    const costScale = rollCostMultiplier();
    node.cost = Math.max(1, Math.ceil(node.cost * costScale));
    node.nextGain = rollNextGain();

    window.showToast(`🪓 Filo de Carbono mejorado a x${node.currentBonus.toFixed(2)}`);
    window.updateUI();
    window.openModal('attrs');
  }

  function getCarbonEdgeMultiplier() {
    const state = ensureState();
    return state?.carbonEdge?.currentBonus || 1;
  }

  window.renderAttrsModal = renderAttrsModal;
  window.buyAttrUpgrade = buyAttrUpgrade;
  window.getCarbonEdgeMultiplier = getCarbonEdgeMultiplier;
})();

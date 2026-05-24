(function(){
  const COST_MULTIPLIERS = [1.5, 1.9, 2.2, 2.5, 3.1, 3.5];

  const state = window.ATTR_BUTTON_STATE || {
    carbonEdgeLevel: 0,
    carbonEdgeCost: 1,
    carbonEdgeMultiplier: 1,
    carbonEdgeNextGain: 1.30,
  };

  function randBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function renderAttrsModal() {
    const canAfford = (window.G?.skillPoints || 0) >= state.carbonEdgeCost;
    const currentMult = state.carbonEdgeMultiplier;
    const nextTotalMult = currentMult * state.carbonEdgeNextGain;

    return `
      <p class="modal-section-title" style="text-align:center;">Mejoras de Atributos</p>
      <div class="stat-row"><span class="label">Nivel</span><span class="value">1</span></div>
      <div class="stat-row"><span class="label">XP</span><span class="value">0 / 100</span></div>
      <div class="stat-row"><span class="label">Puntos Disponibles</span><span class="value">0</span></div>
      <br>
      <div class="upgrade-item" style="align-items:flex-start;">
        <div class="upgrade-icon">🪓</div>
        <div class="upgrade-info">
          <div class="upgrade-name">Filo de Carbono (Nv. ${state.carbonEdgeLevel})</div>
          <div class="upgrade-desc">Incrementa el daño automático DPS infligido al tronco en cada golpe automático.</div>
          <div class="upgrade-cost">Costo: ${state.carbonEdgeCost} punto(s)</div>
          <div class="upgrade-desc" style="margin-top:6px;">📊 Multiplicador actual: x${currentMult.toFixed(2)}</div>
          <div class="upgrade-desc">🚀 Próximo multiplicador total: x${nextTotalMult.toFixed(2)}</div>
          <div class="upgrade-desc">➕ Próxima ganancia: x${state.carbonEdgeNextGain.toFixed(2)}</div>
        </div>
        <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyCarbonEdgeUpgrade()">${canAfford ? 'Mejorar' : 'Insuf.'}</button>
      </div>
      <div class="upgrade-item"><div class="upgrade-info"><div class="upgrade-name">&nbsp;</div></div></div>
      <div class="upgrade-item"><div class="upgrade-info"><div class="upgrade-name">&nbsp;</div></div></div>
      <div class="upgrade-item"><div class="upgrade-info"><div class="upgrade-name">&nbsp;</div></div></div>
      <div class="upgrade-item"><div class="upgrade-info"><div class="upgrade-name">&nbsp;</div></div></div>
    `;
  }

  function buyCarbonEdgeUpgrade() {
    if (!window.G) return;
    if (window.G.skillPoints < state.carbonEdgeCost) {
      window.showToast('⭐ Puntos insuficientes');
      return;
    }

    window.G.skillPoints -= state.carbonEdgeCost;
    state.carbonEdgeLevel += 1;
    state.carbonEdgeMultiplier *= state.carbonEdgeNextGain;

    const growth = COST_MULTIPLIERS[Math.floor(Math.random() * COST_MULTIPLIERS.length)];
    state.carbonEdgeCost = Math.max(1, Math.ceil(state.carbonEdgeCost * growth));

    state.carbonEdgeNextGain = state.carbonEdgeLevel === 1
      ? randBetween(0.15, 0.45)
      : state.carbonEdgeNextGain + randBetween(0.15, 0.45);

    window.showToast('🪓 Filo de Carbono mejorado permanentemente');
    window.updateUI();
    window.openModal('attrs');
  }

  window.ATTR_BUTTON_STATE = state;
  window.renderAttrsModal = renderAttrsModal;
  window.buyCarbonEdgeUpgrade = buyCarbonEdgeUpgrade;
})();

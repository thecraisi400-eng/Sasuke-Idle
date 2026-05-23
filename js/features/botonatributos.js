(function(){
  const STATE = {
    level: 0,
    points: 0,
    cost: 1,
    mult: 1.30,
    minGain: 0.15,
    maxGain: 0.45
  };

  const COST_MULTS = [1.5, 1.9, 2.2, 2.5, 3.1, 3.5];

  function randomBetween(min, max) {
    return +(Math.random() * (max - min) + min).toFixed(2);
  }

  function randomCostMult() {
    return COST_MULTS[Math.floor(Math.random() * COST_MULTS.length)];
  }

  function nextBonus() {
    return +(STATE.mult + randomBetween(STATE.minGain, STATE.maxGain)).toFixed(2);
  }

  function renderAttrsModal() {
    const canAfford = STATE.points >= STATE.cost;
    const nextMult = STATE.level === 0 ? 1.30 : nextBonus();
    return `
      <p class="modal-section-title centered-section-title">Mejoras de Atributos</p>
      <div class="stat-row"><span class="label">Nivel</span><span class="value">1</span></div>
      <div class="stat-row"><span class="label">XP</span><span class="value">0 / 100</span></div>
      <div class="stat-row"><span class="label">Puntos Disponibles</span><span class="value">${STATE.points}</span></div>
      <br>
      <div class="upgrade-item atributo-card">
        <div class="upgrade-icon">🪓</div>
        <div class="upgrade-info">
          <div class="upgrade-name">Filo de Carbono</div>
          <div class="upgrade-desc">Incrementa el daño automático DPS infligido al tronco en cada golpe automático.</div>
          <div class="upgrade-desc"><strong>📈 Multiplicador actual:</strong> x${STATE.mult.toFixed(2)}</div>
          <div class="upgrade-desc"><strong>✨ Próximo multiplicador:</strong> x${nextMult.toFixed(2)}</div>
          <div class="upgrade-cost">🎯 Costo: ${STATE.cost} punto(s)</div>
        </div>
        <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyAttrUpgrade(0)">${canAfford ? 'Mejorar' : 'Sin puntos'}</button>
      </div>`;
  }

  function buyAttrUpgrade() {
    if (STATE.points < STATE.cost) {
      showToast('⚠️ No tienes puntos disponibles');
      return;
    }

    STATE.points -= STATE.cost;
    STATE.level += 1;
    if (STATE.level === 1) {
      STATE.mult = +(STATE.mult * 1.30).toFixed(2);
    } else {
      STATE.mult = +(STATE.mult + randomBetween(STATE.minGain, STATE.maxGain)).toFixed(2);
    }
    STATE.cost = Math.max(1, Math.ceil(STATE.cost * randomCostMult()));
    showToast(`🪓 Filo de Carbono mejorado a x${STATE.mult.toFixed(2)}`);
    openModal('attrs');
  }

  window.renderAttrsModal = renderAttrsModal;
  window.buyAttrUpgrade = buyAttrUpgrade;
  window.getAtributosDpsMultiplier = () => STATE.mult;
  window.getAtributosState = () => ({ ...STATE });
  window.setAtributosState = (data = {}) => {
    Object.assign(STATE, {
      level: Number(data.level) || 0,
      points: Number(data.points) || 0,
      cost: Math.max(1, Number(data.cost) || 1),
      mult: Number(data.mult) || 1.30
    });
  };
})();

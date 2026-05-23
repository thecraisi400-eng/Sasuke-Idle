(function(){
  const COST_MULTIPLIERS = [1.5, 1.9, 2.2, 2.5, 3.10, 3.50];
  const GAIN_INCREMENTS = [0.10, 0.17, 0.25, 0.29];

  const ATTR_STATE = {
    filoCarbono: {
      level: 0,
      pointsCost: 1,
      currentDamageMultiplier: 1.45,
    }
  };

  function randFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function renderAttrsModal() {
    let html = `<p class="modal-section-title">Mejoras de Atributos</p>
    <div class="stat-row"><span class="label">Nivel</span><span class="value">1</span></div>
    <div class="stat-row"><span class="label">XP</span><span class="value">0 / 100</span></div>
    <div class="stat-row"><span class="label">Puntos Disponibles</span><span class="value">0</span></div>
    <br>`;

    const u = ATTR_STATE.filoCarbono;
    html += `<div class="upgrade-item">
      <div class="upgrade-icon">⚔️</div>
      <div class="upgrade-info">
        <div class="upgrade-name">Filo de Carbono</div>
        <div class="upgrade-desc">Incrementa el daño automático DPS infligido al tronco en cada golpe automático.</div>
        <div class="upgrade-cost">Costo: ${u.pointsCost} punto${u.pointsCost === 1 ? '' : 's'}</div>
        <div class="upgrade-cost">Multiplicador actual: x${u.currentDamageMultiplier.toFixed(2)}</div>
      </div>
      <button class="upgrade-btn" disabled>Próximamente</button>
    </div>`;

    for (let i = 2; i <= 5; i++) {
      html += `<div class="upgrade-item">
        <div class="upgrade-icon">&nbsp;</div>
        <div class="upgrade-info">
          <div class="upgrade-name">&nbsp;</div>
          <div class="upgrade-desc">&nbsp;</div>
          <div class="upgrade-cost">&nbsp;</div>
        </div>
      </div>`;
    }

    return html;
  }

  function buyAttrUpgrade(index) {
    if (index !== 0) return;
    const state = ATTR_STATE.filoCarbono;
    const pointsAvailable = 0;
    if (pointsAvailable < state.pointsCost) {
      window.showToast('⚠️ No tienes puntos disponibles todavía.');
      return;
    }
    const currentDPS = window.getCurrentDPS();
    window.setCurrentDPS(currentDPS * state.currentDamageMultiplier);

    state.level += 1;
    state.pointsCost = Math.ceil(state.pointsCost * randFrom(COST_MULTIPLIERS));
    state.currentDamageMultiplier += randFrom(GAIN_INCREMENTS);

    window.updateUI();
    window.openModal('attrs');
  }

  window.renderAttrsModal = renderAttrsModal;
  window.buyAttrUpgrade = buyAttrUpgrade;
})();

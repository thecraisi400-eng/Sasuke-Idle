(function () {
  const COST_MULTIPLIERS = [1.5, 1.9, 2.2, 2.5, 3.1, 3.5];

  const state = {
    filoCarbono: {
      level: 0,
      pointsCost: 1,
      damageMultiplier: 1,
      nextGain: 1.30,
    }
  };

  function round2(n) { return Math.round(n * 100) / 100; }
  function randomBetween(min, max) { return Math.random() * (max - min) + min; }
  function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function getDamageMultiplier() {
    return state.filoCarbono.damageMultiplier;
  }

  function renderAttrsModal(G) {
    const upgrade = state.filoCarbono;
    const nextDamage = round2(upgrade.damageMultiplier * upgrade.nextGain);
    const canAfford = (G.skillPoints || 0) >= upgrade.pointsCost;

    let html = `<p class="modal-section-title centered-title">Mejoras de Atributos</p>
      <div class="stat-row"><span class="label">Nivel</span><span class="value">1</span></div>
      <div class="stat-row"><span class="label">XP</span><span class="value">0 / 100</span></div>
      <div class="stat-row"><span class="label">Puntos Disponibles</span><span class="value">0</span></div>
      <br>`;

    html += `<div class="upgrade-item">
      <div class="upgrade-icon">🪓</div>
      <div class="upgrade-info">
        <div class="upgrade-name">Filo de Carbono</div>
        <div class="upgrade-desc">Incrementa el daño automático DPS infligido al tronco en cada golpe automático.</div>
        <div class="upgrade-desc">Daño actual: x${upgrade.damageMultiplier.toFixed(2)} → Próximo: x${nextDamage.toFixed(2)}</div>
        <div class="upgrade-cost">Costo: ${upgrade.pointsCost} punto(s)</div>
      </div>
      <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyFiloCarbonoUpgrade()">${canAfford ? 'Mejorar' : 'Insuf.'}</button>
    </div>`;

    for (let i = 0; i < 4; i++) {
      html += `<div class="upgrade-item"><div class="upgrade-info" style="min-height:48px"></div></div>`;
    }
    return html;
  }

  function buyFiloCarbonoUpgrade(G, showToast, updateUI, openModal) {
    const upgrade = state.filoCarbono;
    if ((G.skillPoints || 0) < upgrade.pointsCost) {
      showToast('⚠️ No tienes puntos suficientes.');
      return;
    }

    G.skillPoints -= upgrade.pointsCost;
    upgrade.level += 1;
    upgrade.damageMultiplier = round2(upgrade.damageMultiplier * upgrade.nextGain);

    const nextCostMultiplier = randomFrom(COST_MULTIPLIERS);
    upgrade.pointsCost = Math.max(1, Math.ceil(upgrade.pointsCost * nextCostMultiplier));
    upgrade.nextGain = round2(randomBetween(0.15, 0.45));

    showToast(`✅ Filo de Carbono mejorado. DPS x${upgrade.damageMultiplier.toFixed(2)}`);
    updateUI();
    openModal('attrs');
  }

  function getSaveData() {
    return JSON.parse(JSON.stringify(state));
  }

  function loadFromSave(saveData) {
    if (!saveData || !saveData.filoCarbono) return;
    Object.assign(state.filoCarbono, saveData.filoCarbono);
  }

  window.AttrsFeature = {
    renderAttrsModal,
    buyFiloCarbonoUpgrade,
    getDamageMultiplier,
    getSaveData,
    loadFromSave,
  };
})();

(function () {
  const COST_MULTIPLIERS = [1.5, 1.9, 2.2, 2.5, 3.1, 3.5];

  function randomCostMultiplier() {
    const idx = Math.floor(Math.random() * COST_MULTIPLIERS.length);
    return COST_MULTIPLIERS[idx];
  }

  function randomGrowthIncrement() {
    return +(0.15 + Math.random() * 0.30).toFixed(2);
  }

  function ensureAttrState() {
    if (!window.G) return null;
    if (!window.G.attrSystem) {
      window.G.attrSystem = {
        availablePoints: 0,
        filoCarbono: {
          level: 0,
          currentCost: 1,
          currentMultiplier: 1.0,
          nextGain: 1.30,
          totalPermanentMultiplier: 1.0
        }
      };
    }
    return window.G.attrSystem;
  }

  function renderAttrsModal() {
    const attr = ensureAttrState();
    if (!attr) return '<p>Error cargando atributos.</p>';
    const filo = attr.filoCarbono;
    const canBuy = attr.availablePoints >= filo.currentCost;
    const nextTotal = +(filo.currentMultiplier + filo.nextGain).toFixed(2);

    return `
      <p class="modal-section-title" style="text-align:center">Mejoras de Atributos</p>
      <div class="stat-row"><span class="label">Nivel</span><span class="value">1</span></div>
      <div class="stat-row"><span class="label">XP</span><span class="value">0 / 100</span></div>
      <div class="stat-row"><span class="label">Puntos Disponibles</span><span class="value">${attr.availablePoints}</span></div>
      <br>
      <div class="upgrade-item" style="align-items:flex-start">
        <div class="upgrade-icon">🪓</div>
        <div class="upgrade-info">
          <div class="upgrade-name">Filo de Carbono · Nv. ${filo.level}</div>
          <div class="upgrade-desc">Incrementa el daño automático DPS infligido al tronco en cada golpe automático.</div>
          <div class="upgrade-cost">Costo: ${filo.currentCost} punto(s)</div>
          <div class="upgrade-desc">⚙️ Multiplicador actual: x${filo.currentMultiplier.toFixed(2)}</div>
          <div class="upgrade-desc">🚀 Próxima mejora: +x${filo.nextGain.toFixed(2)} → x${nextTotal.toFixed(2)}</div>
          <div class="upgrade-desc">💥 Multiplicador permanente total: x${filo.totalPermanentMultiplier.toFixed(2)}</div>
        </div>
        <button class="upgrade-btn" ${canBuy ? '' : 'disabled'} onclick="window.buyAttrUpgrade(0)">${canBuy ? 'Mejorar' : 'Sin puntos'}</button>
      </div>
    `;
  }

  function buyAttrUpgrade() {
    const attr = ensureAttrState();
    const filo = attr.filoCarbono;
    if (attr.availablePoints < filo.currentCost) {
      window.showToast('⚠️ No tienes puntos suficientes');
      return;
    }

    attr.availablePoints -= filo.currentCost;
    filo.level += 1;
    filo.currentMultiplier = +(filo.currentMultiplier + filo.nextGain).toFixed(2);
    filo.totalPermanentMultiplier = +(filo.totalPermanentMultiplier * filo.nextGain).toFixed(4);
    if (window.G) {
      window.G.attrPermanentDpsMultiplier = +(window.G.attrPermanentDpsMultiplier * filo.nextGain).toFixed(4);
    }

    const costScale = randomCostMultiplier();
    filo.currentCost = Math.max(1, Math.ceil(filo.currentCost * costScale));
    filo.nextGain = +(filo.nextGain + randomGrowthIncrement()).toFixed(2);

    window.showToast('✅ Filo de Carbono mejorado');
    window.updateUI();
    window.openModal('attrs');
  }

  window.renderAttrsModal = renderAttrsModal;
  window.buyAttrUpgrade = buyAttrUpgrade;
  window.ensureAttrState = ensureAttrState;
})();

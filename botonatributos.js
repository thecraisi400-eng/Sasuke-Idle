(function () {
  const FILO_COST_MULTIPLIERS = [1.5, 1.9, 2.2, 2.5, 3.1, 3.5];
  const REFLEJO_COST_MULTIPLIERS = [1.7, 2.1, 2.4, 2.7, 3.3, 3.8];
  const PRECISION_COST_MULTIPLIERS = [1.9, 2.3, 2.6, 2.9, 3.5, 4.0];

  function pickRandom(list) {
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }

  function randomGrowthIncrement() {
    return +(0.15 + Math.random() * 0.30).toFixed(2);
  }

  function randomReflejoGain() {
    return +(0.13 + Math.random() * (0.37 - 0.13)).toFixed(2);
  }

  function randomPrecisionGain() {
    return +(0.01 + Math.random() * (0.015 - 0.01)).toFixed(3);
  }

  function ensureAttrState() {
    if (!window.G) return null;

    window.G.attrPermanentDpsMultiplier = window.G.attrPermanentDpsMultiplier || 1;
    window.G.attrPermanentAttackSpeedMultiplier = window.G.attrPermanentAttackSpeedMultiplier || 1;
    window.G.attrPermanentCritChanceBonus = window.G.attrPermanentCritChanceBonus || 0;

    if (!window.G.attrSystem) {
      window.G.attrSystem = {
        availablePoints: 0,
        filoCarbono: {
          level: 0,
          currentCost: 1,
          currentMultiplier: 1.0,
          nextGain: 1.30,
          totalPermanentMultiplier: 1.0
        },
        reflejoBosque: {
          level: 0,
          currentCost: 1.5,
          currentMultiplier: 1.0,
          nextGain: 1.20,
          totalPermanentMultiplier: 1.0
        },
        precisionQuirurgica: {
          level: 0,
          currentCost: 3,
          currentChance: 0,
          nextGain: 0.02,
          totalChance: 0
        }
      };
    }

    return window.G.attrSystem;
  }

  function renderAttrsModal() {
    const attr = ensureAttrState();
    if (!attr) return '<p>Error cargando atributos.</p>';

    const filo = attr.filoCarbono;
    const reflejo = attr.reflejoBosque;
    const precision = attr.precisionQuirurgica;

    const canBuyFilo = attr.availablePoints >= filo.currentCost;
    const canBuyReflejo = attr.availablePoints >= reflejo.currentCost;
    const canBuyPrecision = attr.availablePoints >= precision.currentCost;

    const filoNextTotal = +(filo.currentMultiplier + filo.nextGain).toFixed(2);
    const reflejoNextTotal = +(reflejo.currentMultiplier + reflejo.nextGain).toFixed(2);
    const precisionNextTotal = +(precision.currentChance + precision.nextGain).toFixed(3);

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
          <div class="upgrade-desc">🚀 Próxima mejora: +x${filo.nextGain.toFixed(2)} → x${filoNextTotal.toFixed(2)}</div>
          <div class="upgrade-desc">💥 Multiplicador permanente total: x${filo.totalPermanentMultiplier.toFixed(2)}</div>
        </div>
        <button class="upgrade-btn" onclick="window.buyAttrUpgrade('filo')">Mejorar</button>
      </div>

      <div class="upgrade-item" style="align-items:flex-start">
        <div class="upgrade-icon">⏱️</div>
        <div class="upgrade-info">
          <div class="upgrade-name">Reflejo Del Bosque · Nv. ${reflejo.level}</div>
          <div class="upgrade-desc">Aumenta la velocidad de los golpes del hacha por segundo.</div>
          <div class="upgrade-cost">Costo: ${reflejo.currentCost.toFixed(1)} punto(s)</div>
          <div class="upgrade-desc">⚡ Velocidad actual: x${reflejo.currentMultiplier.toFixed(2)}</div>
          <div class="upgrade-desc">🚀 Próxima mejora: +x${reflejo.nextGain.toFixed(2)} → x${reflejoNextTotal.toFixed(2)}</div>
          <div class="upgrade-desc">🌲 Bonus permanente total: x${reflejo.totalPermanentMultiplier.toFixed(2)}</div>
        </div>
        <button class="upgrade-btn" onclick="window.buyAttrUpgrade('reflejo')">Mejorar</button>
      </div>

      <div class="upgrade-item" style="align-items:flex-start">
        <div class="upgrade-icon">🎯</div>
        <div class="upgrade-info">
          <div class="upgrade-name">Precisión Quirúrgica · Nv. ${precision.level}</div>
          <div class="upgrade-desc">Eleva la probabilidad de que un golpe normal se convierta en crítico.</div>
          <div class="upgrade-cost">Costo: ${precision.currentCost.toFixed(1)} punto(s)</div>
          <div class="upgrade-desc">🎯 Crítico actual: ${(precision.currentChance * 100).toFixed(2)}%</div>
          <div class="upgrade-desc">🚀 Próxima mejora: +${(precision.nextGain * 100).toFixed(2)}% → ${(precisionNextTotal * 100).toFixed(2)}%</div>
          <div class="upgrade-desc">💎 Bonus permanente total: ${(precision.totalChance * 100).toFixed(2)}%</div>
        </div>
        <button class="upgrade-btn" onclick="window.buyAttrUpgrade('precision')">Mejorar</button>
      </div>
    `;
  }

  function buyAttrUpgrade(type) {
    const attr = ensureAttrState();
    if (!attr) return;

    if (type === 'filo') {
      const filo = attr.filoCarbono;
      if (attr.availablePoints < filo.currentCost) return window.showToast('no hay puntos');

      attr.availablePoints -= filo.currentCost;
      filo.level += 1;
      filo.currentMultiplier = +(filo.currentMultiplier + filo.nextGain).toFixed(2);
      filo.totalPermanentMultiplier = +(filo.totalPermanentMultiplier * filo.nextGain).toFixed(4);
      window.G.attrPermanentDpsMultiplier = +(window.G.attrPermanentDpsMultiplier * filo.nextGain).toFixed(4);

      filo.currentCost = +Math.max(1, filo.currentCost * pickRandom(FILO_COST_MULTIPLIERS)).toFixed(1);
      filo.nextGain = +(filo.nextGain + randomGrowthIncrement()).toFixed(2);
      window.showToast('✅ Filo de Carbono mejorado');
    }

    if (type === 'reflejo') {
      const reflejo = attr.reflejoBosque;
      if (attr.availablePoints < reflejo.currentCost) return window.showToast('no hay puntos');

      attr.availablePoints -= reflejo.currentCost;
      reflejo.level += 1;
      reflejo.currentMultiplier = +(reflejo.currentMultiplier + reflejo.nextGain).toFixed(2);
      reflejo.totalPermanentMultiplier = +(reflejo.totalPermanentMultiplier * reflejo.nextGain).toFixed(4);
      window.G.attrPermanentAttackSpeedMultiplier = +(window.G.attrPermanentAttackSpeedMultiplier * reflejo.nextGain).toFixed(4);

      reflejo.currentCost = +(reflejo.currentCost * pickRandom(REFLEJO_COST_MULTIPLIERS)).toFixed(1);
      reflejo.nextGain = +(reflejo.nextGain + randomReflejoGain()).toFixed(2);
      window.showToast('✅ Reflejo Del Bosque mejorado');
    }

    if (type === 'precision') {
      const precision = attr.precisionQuirurgica;
      if (attr.availablePoints < precision.currentCost) return window.showToast('no hay puntos');

      attr.availablePoints -= precision.currentCost;
      precision.level += 1;
      precision.currentChance = +(precision.currentChance + precision.nextGain).toFixed(3);
      precision.totalChance = precision.currentChance;
      window.G.attrPermanentCritChanceBonus = precision.totalChance;

      precision.currentCost = +(precision.currentCost * pickRandom(PRECISION_COST_MULTIPLIERS)).toFixed(1);
      precision.nextGain = +(precision.nextGain + randomPrecisionGain()).toFixed(3);
      window.showToast('✅ Precisión Quirúrgica mejorada');
    }

    window.updateUI();
    window.openModal('attrs');
  }

  window.renderAttrsModal = renderAttrsModal;
  window.buyAttrUpgrade = buyAttrUpgrade;
  window.ensureAttrState = ensureAttrState;
})();

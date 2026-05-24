(function(){
  function ensureAttrState() {
    if (!state) return null;
    state.attrLevel = 1;
    state.attrXp = 0;
    state.attrXpNeeded = 100;
    state.attrAvailablePoints = Number.isFinite(state.attrAvailablePoints) ? state.attrAvailablePoints : 0;
    state.carbLvl = Number.isFinite(state.carbLvl) ? state.carbLvl : 0;
    state.carbCost = Number.isFinite(state.carbCost) ? state.carbCost : 1;
    state.carbMultiplier = Number.isFinite(state.carbMultiplier) ? state.carbMultiplier : 1.3;
    state.carbAppliedBase = Number.isFinite(state.carbAppliedBase) ? state.carbAppliedBase : 0;
    return state;
  }

  function rngFrom(list){ return list[Math.floor(Math.random()*list.length)]; }

  window.renderAtributosModal = function(externalState) {
    const state = externalState || ensureAttrState();
    if (!state) return '<p>Error: estado no disponible.</p>';
    const nextBonus = state.carbLvl === 0 ? 1.3 : Number((Math.random()*0.30 + 0.15).toFixed(2));
    state.carbPreviewBonus = nextBonus;

    return `
      <style>
        .attrs-centered{ text-align:center; }
        .attr-card{background:#f7fbff;border:1px solid #dcecff;border-radius:12px;padding:10px;margin-bottom:10px;}
        .attr-mini{display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700;margin:2px;}
        .mini-current{background:#e7f7e7;color:#1f7a1f;}
        .mini-next{background:#fff6d8;color:#8a6400;}
        .mini-cost{background:#ffe7e7;color:#9f2020;}
      </style>
      <p class="modal-section-title attrs-centered">Mejoras de Atributos</p>
      <div class="stat-row"><span class="label">Nivel</span><span class="value">1</span></div>
      <div class="stat-row"><span class="label">XP</span><span class="value">0 / 100</span></div>
      <div class="stat-row"><span class="label">Puntos Disponibles</span><span class="value">${state.attrAvailablePoints}</span></div>
      <br>
      <div class="attr-card">
        <div class="upgrade-item" style="margin:0;">
          <div class="upgrade-icon">🪓</div>
          <div class="upgrade-info">
            <div class="upgrade-name">Filo de Carbono</div>
            <div class="upgrade-desc">Incrementa el daño automático DPS infligido al tronco en cada golpe automático.</div>
            <div class="upgrade-desc">Costo actual: <b>${Math.max(1, Math.floor(state.carbCost))}</b> punto(s)</div>
            <div>
              <span class="attr-mini mini-current">📊 Actual x${state.carbMultiplier.toFixed(2)}</span>
              <span class="attr-mini mini-next">🚀 Siguiente +x${nextBonus.toFixed(2)}</span>
              <span class="attr-mini mini-cost">🎯 Requiere ${Math.max(1, Math.floor(state.carbCost))}</span>
            </div>
          </div>
          <button class="upgrade-btn" ${state.attrAvailablePoints >= state.carbCost ? '' : 'disabled'} onclick="buyAtributoUpgrade(0)">${state.attrAvailablePoints >= state.carbCost ? 'Mejorar' : 'Sin puntos'}</button>
        </div>
      </div>`;
  };

  window.buyAtributoUpgrade = function(i, externalState) {
    if (i !== 0) return;
    const state = externalState || ensureAttrState();
    const cost = Math.max(1, Math.floor(state.carbCost));
    if (state.attrAvailablePoints < cost) {
      if (window.showToast) showToast('⚠️ No tienes puntos disponibles.');
      return;
    }
    state.attrAvailablePoints -= cost;
    if (state.carbLvl === 0 && state.carbAppliedBase === 0) {
      state.axeDamage *= 1.3;
      state.carbAppliedBase = 1;
      state.carbMultiplier = 1.3;
    } else {
      const extra = Number((Math.random()*0.30 + 0.15).toFixed(2));
      state.carbMultiplier = Number((state.carbMultiplier + extra).toFixed(2));
      state.axeDamage *= (1 + extra);
    }
    state.carbLvl += 1;
    state.carbCost = Math.ceil(cost * rngFrom([1.5,1.9,2.2,2.5,3.1,3.5]));
    if (window.updateUI) updateUI();
    if (window.openModal) openModal('attrs');
  };
})();

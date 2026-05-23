const ATTR_STATE = {
  pointsAvailable: 0,
  upgrades: [
    {
      id: 'carbon-edge',
      name: 'Filo de Carbono',
      desc: 'Incrementa el daño automático DPS infligido al tronco en cada golpe automático.',
      level: 0,
      pointCost: 1,
      damageMultiplier: 1.30
    },
    { id: 'empty-2', name: '', desc: '', level: 0, pointCost: 0 },
    { id: 'empty-3', name: '', desc: '', level: 0, pointCost: 0 },
    { id: 'empty-4', name: '', desc: '', level: 0, pointCost: 0 },
    { id: 'empty-5', name: '', desc: '', level: 0, pointCost: 0 }
  ]
};

function getRandomAttrCostFactor() {
  const options = [1.5, 1.9, 2.2, 2.5, 3.10, 3.5];
  return options[Math.floor(Math.random() * options.length)];
}

function getRandomAttrDamageGain() {
  return +(0.15 + Math.random() * (0.45 - 0.15)).toFixed(2);
}

function renderAttrsModalContent(G) {
  let html = `<p class="modal-section-title" style="text-align:center;">Mejoras de Atributos</p>
  <div class="stat-row"><span class="label">Nivel</span><span class="value">1</span></div>
  <div class="stat-row"><span class="label">XP</span><span class="value">0 / 100</span></div>
  <div class="stat-row"><span class="label">Puntos Disponibles</span><span class="value">${ATTR_STATE.pointsAvailable}</span></div>
  <br>`;

  ATTR_STATE.upgrades.forEach((u, i) => {
    if (i === 0) {
      const canAfford = ATTR_STATE.pointsAvailable >= u.pointCost;
      html += `<div class="upgrade-item">
        <div class="upgrade-icon">⚔️</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${u.name}</div>
          <div class="upgrade-desc">${u.desc}</div>
          <div class="upgrade-cost">Costo: ${Math.ceil(u.pointCost)} punto(s) | Nivel ${u.level}</div>
        </div>
        <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyAttrUpgrade(${i})">
          ${canAfford ? 'Mejorar' : 'Insuf.'}
        </button>
      </div>`;
      return;
    }

    html += `<div class="upgrade-item">
      <div class="upgrade-icon"></div>
      <div class="upgrade-info">
        <div class="upgrade-name">&nbsp;</div>
        <div class="upgrade-desc">&nbsp;</div>
        <div class="upgrade-cost">&nbsp;</div>
      </div>
    </div>`;
  });
  return html;
}

function buyAttrUpgradeIndex(i, G, updateUI, openModal, showToast) {
  const u = ATTR_STATE.upgrades[i];
  if (!u || i !== 0) return;
  if (ATTR_STATE.pointsAvailable < u.pointCost) { showToast('No tienes puntos suficientes'); return; }
  ATTR_STATE.pointsAvailable -= Math.ceil(u.pointCost);
  const gain = u.level === 0 ? 1.30 : getRandomAttrDamageGain();
  u.damageMultiplier = +(u.damageMultiplier + (u.level === 0 ? 0 : gain)).toFixed(2);
  G.axeDamage = +(G.axeDamage * gain).toFixed(4);
  u.level += 1;
  u.pointCost = +(u.pointCost * getRandomAttrCostFactor()).toFixed(2);
  showToast(`✅ ${u.name} mejorado. Daño x${gain.toFixed ? gain.toFixed(2) : gain}`);
  updateUI();
  openModal('attrs');
}

window.ATTR_STATE = ATTR_STATE;
window.renderAttrsModalContent = renderAttrsModalContent;
window.buyAttrUpgradeIndex = buyAttrUpgradeIndex;

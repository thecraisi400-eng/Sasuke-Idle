window.ATTR_UPGRADES = [
  { id:'at1', name:'Fuerza I',      desc:'+10% Oro/seg',        cost:100,  costCurrency:'gold',    pct:0.10, owned:false },
  { id:'at2', name:'Fuerza II',     desc:'+25% Oro/seg',        cost:500,  costCurrency:'gold',    pct:0.25, owned:false },
  { id:'at3', name:'Resistencia I', desc:'+15% Oro/click',      cost:300,  costCurrency:'gold',    pct:0.15, owned:false },
  { id:'at4', name:'Agilidad',      desc:'+0.5 Oro/seg base',   cost:30,   costCurrency:'crystal', flat:0.5, owned:false },
  { id:'at5', name:'Maestría',      desc:'+50% todo el oro',    cost:100,  costCurrency:'crystal', pct:0.50, all:true, owned:false },
];

window.renderAttrsModal = function renderAttrsModal() {
  let html = `<p class="modal-section-title">Mejoras de Atributos</p>
  <div class="stat-row"><span class="label">Nivel</span><span class="value">${G.level}</span></div>
  <div class="stat-row"><span class="label">XP</span><span class="value">${Math.floor(G.xp)} / ${G.xpNeeded}</span></div>
  <div class="stat-row"><span class="label">Multiplicador Prestigio</span><span class="value">x${G.prestigeMultiplier.toFixed(2)}</span></div>
  <br>`;
  window.ATTR_UPGRADES.forEach((u, i) => {
    const canAfford = u.costCurrency === 'gold' ? G.gold >= u.cost : G.crystals >= u.cost;
    const icon = u.costCurrency === 'gold' ? '🪙' : '💎';
    html += `<div class="upgrade-item">
      <div class="upgrade-icon">💪</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${u.name} ${u.owned ? '✅' : ''}</div>
        <div class="upgrade-desc">${u.desc}</div>
        <div class="upgrade-cost">${u.owned ? 'Comprado' : `Costo: ${u.cost} ${icon}`}</div>
      </div>
      ${!u.owned ? `<button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyAttrUpgrade(${i})">
        ${canAfford ? 'Comprar' : 'Insuf.'}
      </button>` : ''}
    </div>`;
  });
  return html;
};

window.buyAttrUpgrade = function buyAttrUpgrade(i) {
  const u = window.ATTR_UPGRADES[i];
  if (!u || u.owned) return;
  if (u.costCurrency === 'gold' && G.gold < u.cost) { showToast('💰 Oro insuficiente'); return; }
  if (u.costCurrency === 'crystal' && G.crystals < u.cost) { showToast('💎 Cristales insuficientes'); return; }
  if (u.costCurrency === 'gold') G.gold -= u.cost;
  else G.crystals -= u.cost;
  u.owned = true;
  showToast(`✅ ¡${u.name} comprado!`);
  updateUI();
  openModal('attrs');
};

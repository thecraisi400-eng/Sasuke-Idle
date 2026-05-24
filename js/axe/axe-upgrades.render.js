window.renderAxeModal = function renderAxeModal() {
  let html = ``;
  window.AXE_UPGRADES.forEach((u, i) => {
    if (u.type === 'item') {
      html += `<div class="upgrade-item">
        <div class="upgrade-icon">${u.icon}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${u.name}</div>
          <div class="upgrade-desc">${u.desc}</div>
          <div class="upgrade-cost">Disponibles: ${G.whetstones} ${u.icon}</div>
        </div>
        <button class="upgrade-btn" ${G.whetstones <= 0 ? 'disabled' : ''} onclick="useWhetstone()">Usar</button>
      </div>`;
      return;
    }
    const cost = window.axeUpgradeCost(u);
    const canAfford = G.gold >= cost;
    const levelText = `Nivel ${u.level}`;
    let effectText = '';
    if (u.id === 'edge') {
      const nextGain = window.getAxeUpgradeGain(u);
      effectText = `Daño auto: +${nextGain.toFixed(2)} · Actual: ${G.axeDamage.toFixed(2)}`;
    }
    if (u.id === 'quality') effectText = `Velocidad: +${u.effectStep.toFixed(2)} golpes/s · Actual: ${G.axeAttackSpeed.toFixed(2)}`;
    if (u.id === 'crit') effectText = `Crítico: +0.05% · Actual: ${(G.axeCritChance * 100).toFixed(2)}%`;
    if (u.id === 'double') effectText = `Doble golpe: +0.05% · Actual: ${(G.axeDoubleChance * 100).toFixed(2)}%`;
    html += `<div class="upgrade-item">
      <div class="upgrade-icon">${u.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${u.name}</div>
        <div class="upgrade-desc">${levelText} · ${effectText}</div>
        <div class="upgrade-cost">Costo: ${fmtNum(cost)} 🪙</div>
      </div>
      <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyAxeUpgrade(${i})">${canAfford ? 'Mejorar' : 'Insuf.'}</button>
    </div>`;
  });
  return html;
};

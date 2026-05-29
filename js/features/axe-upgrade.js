// Sistema separado para "MEJORAR HACHA"
window.AXE_UPGRADES = [
  { id:'edge', name:'FILO DEL HACHA', icon:'🪓', desc:'Sube notablemente el daño automático del hacha.', baseCost:10, costMult:1.55, level:0, type:'gold', effectStep:1.25 },
  { id:'quality', name:'CALIDAD DEL FILO', icon:'⏱️', desc:'Aumenta la velocidad de golpe automático (+0.10/s).', baseCost:50, costMult:1.90, level:0, type:'gold', effectStep:0.10 },
  { id:'crit', name:'HACHA CRÍTICOS', icon:'🎯', desc:'Sube +0.05% la probabilidad de golpe crítico x2.', baseCost:60, costMult:2.10, level:0, type:'gold', effectStep:0.0005 },
  { id:'double', name:'HACHA DOBLE FILO', icon:'🪓', desc:'Sube +0.05% la probabilidad de doble golpe.', baseCost:100, costMult:2.35, level:0, type:'gold', effectStep:0.0005 },
  { id:'stone', name:'PIEDRA DE AFILAR', icon:'☢️', desc:'Consumible: duplica el daño automático por 5 minutos.', baseCost:1, level:0, type:'item', effectStep:1 },
];

window.axeUpgradeCost = function axeUpgradeCost(u) {
  const multiplier = u.costMult ?? 1.85;
  const difficultyCostMul = window.getDifficultyConfig ? window.getDifficultyConfig().costMul : 1;
  return Math.floor(u.baseCost * Math.pow(multiplier * difficultyCostMul, u.level));
};

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

window.getAxeUpgradeGain = function getAxeUpgradeGain(u) {
  if (u.id === 'edge') return u.effectStep * (1 + u.level * 0.18);
  return u.effectStep;
};

window.buyAxeUpgrade = function buyAxeUpgrade(i) {
  const u = window.AXE_UPGRADES[i];
  if (!u || u.type === 'item') return;
  const cost = window.axeUpgradeCost(u);
  if (G.gold < cost) { showToast('💰 Oro insuficiente'); return; }
  G.gold -= cost;
  u.level += 1;
  if (u.id === 'edge') G.axeDamage += window.getAxeUpgradeGain(u);
  if (u.id === 'quality') G.axeAttackSpeed += u.effectStep;
  if (u.id === 'crit') G.axeCritChance = Math.min(1, G.axeCritChance + u.effectStep);
  if (u.id === 'double') G.axeDoubleChance = Math.min(1, G.axeDoubleChance + u.effectStep);
  showToast(`✅ ${u.name} subió a nivel ${u.level}`);
  updateUI();
  openModal('axe');
};

window.useWhetstone = function useWhetstone() {
  if (G.whetstones <= 0) { showToast('☢️ Sin piedra de afilar'); return; }
  const duration = window.getDifficultyConfig ? window.getDifficultyConfig().whetstoneDurationMs : 5 * 60 * 1000;
  G.whetstones -= 1;
  G.whetstoneBoostUntil = Date.now() + duration;
  showToast(`☢️ Daño automático x2 por ${Math.round(duration / 60000)} minutos`);
  updateUI();
  openModal('axe');
};

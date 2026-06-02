// Sistema separado para "MEJORAR HACHA" con valores balanceados y ROI visible.
window.AXE_UPGRADES = (window.BALANCE?.AXE_UPGRADES || [
  { id:'edge', name:'FILO DEL HACHA', icon:'🪓', desc:'Sube el daño automático del hacha.', baseCost:8, costMult:1.32, level:0, type:'gold', effectStep:1.00, scalingStep:0.18 },
  { id:'quality', name:'CALIDAD DEL FILO', icon:'⏱️', desc:'Aumenta la velocidad de golpe automático.', baseCost:35, costMult:1.38, level:0, type:'gold', effectStep:0.08 },
  { id:'crit', name:'HACHA CRÍTICOS', icon:'🎯', desc:'Sube la probabilidad de golpe crítico x2.', baseCost:45, costMult:1.42, level:0, type:'gold', effectStep:0.0015, cap:0.45 },
  { id:'double', name:'HACHA DOBLE FILO', icon:'🪓', desc:'Sube la probabilidad de doble golpe.', baseCost:75, costMult:1.48, level:0, type:'gold', effectStep:0.0010, cap:0.35 },
  { id:'stone', name:'PIEDRA DE AFILAR', icon:'☢️', desc:'Consumible: duplica el daño automático por 5 minutos.', baseCost:250, costMult:1.25, level:0, type:'item', effectStep:1 },
]).map(u => ({ ...u }));

function getAxeDifficultyId() {
  return window.G?.difficulty || 'medium';
}

window.axeUpgradeCost = function axeUpgradeCost(u) {
  if (window.BALANCE?.axeCost) {
    return window.BALANCE.axeCost(u, getAxeDifficultyId(), window.G?.whetstonesBoughtToday || 0);
  }
  const multiplier = u.costMult ?? 1.85;
  return Math.floor(u.baseCost * Math.pow(multiplier, u.level));
};

window.getAxeUpgradeGain = function getAxeUpgradeGain(u) {
  if (u.id === 'edge') return u.effectStep * (1 + u.level * (u.scalingStep || 0));
  return u.effectStep;
};

window.applyAxeUpgradeStatsFromLevels = function applyAxeUpgradeStatsFromLevels() {
  if (!window.G) return;
  G.axeDamage = window.BALANCE?.getDifficulty?.(G.difficulty)?.baseDps || 0.8;
  G.axeAttackSpeed = 1;
  G.axeCritChance = 0;
  G.axeDoubleChance = 0;
  G.axeCritRating = 0;
  G.axeDoubleRating = 0;

  window.AXE_UPGRADES.forEach(u => {
    if (u.id === 'edge') {
      let damage = 0;
      for (let level = 0; level < u.level; level++) {
        damage += u.effectStep * (1 + level * (u.scalingStep || 0));
      }
      G.axeDamage += damage;
    }
    if (u.id === 'quality') G.axeAttackSpeed += u.effectStep * u.level;
    if (u.id === 'crit') {
      G.axeCritRating = (u.ratingStep || u.effectStep || 5) * u.level;
      G.axeCritChance = window.BALANCE?.critFromRating?.(G.axeCritRating) || 0;
    }
    if (u.id === 'double') {
      G.axeDoubleRating = (u.ratingStep || u.effectStep || 4) * u.level;
      G.axeDoubleChance = window.BALANCE?.doubleFromRating?.(G.axeDoubleRating) || 0;
    }
  });
};

window.renderAxeModal = function renderAxeModal() {
  let html = `<div class="stat-row"><span class="label">DPS esperado</span><span class="value">${computeGPS().toFixed(2)}</span></div>`;
  window.AXE_UPGRADES.forEach((u, i) => {
    if (u.type === 'item') {
      const cost = window.axeUpgradeCost(u);
      const canAfford = G.gold >= cost;
      html += `<div class="upgrade-item">
        <div class="upgrade-icon">${u.icon}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${u.name}</div>
          <div class="upgrade-desc">${u.desc}</div>
          <div class="upgrade-cost">Disponibles: ${G.whetstones} ${u.icon} · Comprar: ${fmtNum(cost)} 🪙</div>
        </div>
        <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyWhetstone()">${canAfford ? 'Comprar' : 'Insuf.'}</button>
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
      effectText = `Daño: +${nextGain.toFixed(2)} · Actual: ${G.axeDamage.toFixed(2)}`;
    }
    if (u.id === 'quality') effectText = `Velocidad: +${u.effectStep.toFixed(2)} golpes/s · Actual: ${G.axeAttackSpeed.toFixed(2)}`;
    if (u.id === 'crit') effectText = `Crítico: +${u.effectStep} rating · Actual: ${(G.axeCritChance * 100).toFixed(1)}%`;
    if (u.id === 'double') effectText = `Doble golpe: +${u.effectStep} rating · Actual: ${(G.axeDoubleChance * 100).toFixed(1)}%`;

    html += `<div class="upgrade-item">
      <div class="upgrade-icon">${u.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${u.name}</div>
        <div class="upgrade-desc">${levelText} · ${effectText}</div>
        <div class="upgrade-cost">Costo: ${fmtNum(cost)} 🪙 · ROI objetivo: ${u.roiTarget || 'variable'}</div>
      </div>
      <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyAxeUpgrade(${i})">${canAfford ? 'Mejorar' : 'Insuf.'}</button>
    </div>`;
  });
  return html;
};

window.buyAxeUpgrade = function buyAxeUpgrade(i) {
  const u = window.AXE_UPGRADES[i];
  if (!u || u.type === 'item') return;
  const cost = window.axeUpgradeCost(u);
  if (G.gold < cost) { showToast('💰 Oro insuficiente'); return; }
  G.gold -= cost;
  u.level += 1;
  window.applyAxeUpgradeStatsFromLevels();
  showToast(`✅ ${u.name} subió a nivel ${u.level}`);
  updateUI();
  openModal('axe');
};

window.buyWhetstone = function buyWhetstone() {
  const u = window.AXE_UPGRADES.find(upgrade => upgrade.id === 'stone');
  const cost = window.axeUpgradeCost(u);
  if (G.gold < cost) { showToast('💰 Oro insuficiente'); return; }
  G.gold -= cost;
  G.whetstones += 1;
  G.whetstonesBoughtToday = (G.whetstonesBoughtToday || 0) + 1;
  showToast('☢️ Piedra de Afilar comprada');
  updateUI();
  openModal('axe');
};

window.useWhetstone = function useWhetstone() {
  if (G.whetstones <= 0) { showToast('☢️ Sin piedra de afilar'); return; }
  if (Date.now() < G.whetstoneBoostUntil) { showToast('☢️ Ya hay una piedra activa'); return; }
  const bonusDuration = (window.attrSystem?.getAttrLevel?.('sharpening_ritual') || 0) * 15 * 1000;
  G.whetstones -= 1;
  G.whetstoneBoostUntil = Date.now() + (5 * 60 * 1000) + bonusDuration;
  showToast('☢️ Daño automático x2 por 5 minutos');
  updateUI();
  openModal('axe');
};

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
  G.whetstones -= 1;
  G.whetstoneBoostUntil = Date.now() + (5 * 60 * 1000);
  showToast('☢️ Daño automático x2 por 5 minutos');
  updateUI();
  openModal('axe');
};

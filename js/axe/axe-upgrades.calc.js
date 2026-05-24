window.axeUpgradeCost = function axeUpgradeCost(u) {
  const multiplier = u.costMult ?? 1.85;
  return Math.floor(u.baseCost * Math.pow(multiplier, u.level));
};

window.getAxeUpgradeGain = function getAxeUpgradeGain(u) {
  if (u.id === 'edge') return u.effectStep * (1 + u.level * 0.18);
  return u.effectStep;
};

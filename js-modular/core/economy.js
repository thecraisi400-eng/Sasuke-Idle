function computeGPS() {
  let baseDamage = G.axeDamage;
  if (Date.now() < G.whetstoneBoostUntil) baseDamage *= 2;
  const perHitExpected = baseDamage * (1 + G.axeCritChance) * (1 + G.axeDoubleChance);
  let base = perHitExpected * G.axeAttackSpeed;
  if (ATTR_UPGRADES[0].owned) base *= 1.10;
  if (ATTR_UPGRADES[1].owned) base *= 1.25;
  if (ATTR_UPGRADES[3].owned) base += 0.5;
  if (ATTR_UPGRADES[4].owned) base *= 1.50;
  base *= (1 + G.skills.speed * 0.15);
  base *= (1 + G.skills.endurance * 0.25);
  base *= G.prestigeMultiplier;
  return base;
}

function computeGPC() {
  let base = G.axeGoldPerClick;
  if (ATTR_UPGRADES[2].owned) base *= 1.15;
  if (ATTR_UPGRADES[4].owned) base *= 1.50;
  base *= (1 + G.skills.strength * 0.20);
  base *= G.prestigeMultiplier;
  if (G.skills.luck > 0 && Math.random() < G.skills.luck * 0.10) base *= 2;
  return Math.max(1, Math.floor(base));
}

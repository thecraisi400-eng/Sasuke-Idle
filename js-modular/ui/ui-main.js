function fmtNum(n) {
  const num = Number(n) || 0;
  const abs = Math.abs(num);
  if (abs < 1000) return Math.floor(num).toLocaleString();

  const units = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' }
  ];

  for (const unit of units) {
    if (abs >= unit.value) {
      const compact = (num / unit.value).toFixed(1).replace(/\.0$/, '');
      return `${compact}${unit.suffix}`;
    }
  }

  return Math.floor(num).toLocaleString();
}

function updateUI() {
  document.getElementById('gold-display').textContent = fmtNum(G.gold);
  document.getElementById('crystals-display').textContent = fmtNum(G.crystals);
  document.getElementById('level-display').textContent = 'Nivel ' + G.level;
  document.getElementById('dps-display').textContent = computeGPS().toFixed(1);
}

function checkLevelUp() {
  while (G.xp >= G.xpNeeded) {
    G.xp -= G.xpNeeded;
    G.level += 1;
    G.xpNeeded = Math.floor(G.xpNeeded * 1.5);
  }
}

function checkMissions() {
  MISSIONS.forEach(m => {
    if (missionClaimed[m.id]) return;
    if (G[m.stat] >= m.goal) {
      missionClaimed[m.id] = true;
      if (m.rewardType === 'gold') { G.gold += m.reward; G.totalGoldEarned += m.reward; }
      else G.crystals = 0;
      showToast(`✅ Misión "${m.name}" completada! +${m.reward} ${m.rewardType === 'gold' ? 'Oro' : 'Cristales'}`);
    }
  });
}

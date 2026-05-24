document.getElementById('top-section').addEventListener('click', e => {
  const rect = document.getElementById('top-section').getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const W = canvas.width, H = canvas.height;
  const groundY = H * 0.775;
  const pileX = getPileX(W);
  const pileRadius = 55;
  const offsetDown = H * 0.07;
  const pileYCenter = groundY + offsetDown - 20;

  const dx = clickX - pileX;
  const dy = clickY - pileYCenter;
  const distToPile = Math.sqrt(dx*dx + dy*dy);

  if (logPileClickable && collectedLogs > 0 && distToPile < pileRadius) {
    const ripple = document.createElement('div');
    ripple.className = 'log-ripple';
    ripple.style.left = clickX + 'px';
    ripple.style.top = clickY + 'px';
    document.getElementById('top-section').appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);

    pileClickEffect = { x: clickX, y: clickY, t: 0 };

    const earned = logPileGold;
    G.gold += earned;
    G.totalGoldEarned += earned;
    logPileGold = 0;
    collectedLogs = 0;
    logPileVisible = false;
    logPileClickable = false;

    const burst = document.createElement('div');
    burst.className = 'click-burst';
    burst.textContent = `+${fmtNum(earned)} 🪙`;
    burst.style.left = (clickX - 20) + 'px';
    burst.style.top = (clickY - 20) + 'px';
    document.getElementById('top-section').appendChild(burst);
    setTimeout(() => burst.remove(), 800);

    showToast(`🪙 ¡+${fmtNum(earned)} Oro reclamado!`);
    checkMissions();
    updateUI();
    return;
  }
});

// =============================================
// MODAL SYSTEM

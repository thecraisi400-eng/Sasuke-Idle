function gameLoop() {
  const now = Date.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  accumulator += dt;
  if (accumulator >= 1) {
    accumulator -= 1;
    G.xp += 1;
    damageLog(computeGPS());
    checkLevelUp();
    checkMissions();
    updateUI();
    saveGame();
  }
  setTimeout(gameLoop, 100);
}

// =============================================
// CLICK INTERACTION

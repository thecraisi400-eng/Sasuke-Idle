function updateAppHeight() {
  const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  if (viewportHeight) {
    document.documentElement.style.setProperty('--app-height', `${viewportHeight}px`);
  }
}

// =============================================
// INIT
// =============================================
let gameStarted = false;

function startGame() {
  if (gameStarted) return;
  gameStarted = true;

  updateAppHeight();
  loadGame();
  resizeCanvas();

  document.getElementById('day-display').textContent = `Día: ${TIME.day}`;
  document.getElementById('clock-display').textContent = getTimeLabel();

  const alpha = getNightAlpha();
  document.getElementById('night-overlay').style.background = `rgba(5,10,40,${alpha})`;

  drawScene();
  updateUI();


  gameLoop();
  setInterval(saveGame, 10000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startGame);
} else {
  startGame();

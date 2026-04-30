window.BATALLA_MISION_HTML = String.raw`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>SHINOBI EVOLUTION</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  background: #050308;
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; overflow: hidden;
  font-family: 'Arial Black', Impact, sans-serif;
}
#wrapper {
  position: relative; width: 460px; height: 360px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255,120,0,0.25),
    0 0 30px rgba(255,80,0,0.3),
    0 0 80px rgba(120,0,255,0.15);
}
canvas { position:absolute; top:0; left:0; display:block; }
#veil {
  position: absolute; top:0; left:0; width:100%; height:100%;
  pointer-events: none; z-index: 8;
  background: rgba(0,0,0,0);
  transition: background 0.2s ease;
}
#winner-screen {
  position: absolute; top:0; left:0; width:100%; height:100%;
  display: none; flex-direction: column;
  justify-content: center; align-items: center;
  z-index: 20;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%);
}
#win-banner {
  border-top: 1px solid rgba(255,200,0,0.4);
  border-bottom: 1px solid rgba(255,200,0,0.4);
  padding: 12px 40px;
  text-align: center;
  animation: winPulse 0.8s ease-in-out infinite alternate;
}
#win-label { font-size: 10px; letter-spacing: 6px; color: #AA8800; margin-bottom: 4px; }
#win-name {
  font-size: 42px; font-weight: 900; letter-spacing: 5px;
  text-transform: uppercase;
  -webkit-text-stroke: 1px rgba(255,200,0,0.5);
}
#win-sub { font-size: 11px; letter-spacing: 4px; color: #888; margin-top: 6px; }
#btn-restart {
  margin-top: 22px; padding: 9px 28px;
  background: transparent;
  border: 1px solid rgba(255,180,0,0.5);
  color: #FFD700; font-size: 11px; letter-spacing: 3px;
  cursor: pointer; text-transform: uppercase;
  transition: all 0.2s;
}
#btn-restart:hover {
  background: rgba(255,180,0,0.15);
  border-color: rgba(255,180,0,0.9);
}
@keyframes winPulse {
  from { filter: drop-shadow(0 0 8px rgba(255,200,0,0.3)); }
  to   { filter: drop-shadow(0 0 25px rgba(255,200,0,0.7)); }
}
</style>
</head>
<body>
<div id="wrapper">
  <canvas id="canvas" width="460" height="360" style="z-index:2;"></canvas>
  <div id="veil"></div>
  <div id="winner-screen">
    <div id="win-banner">
      <div id="win-label">VENCEDOR</div>
      <div id="win-name" style="color:#FFD700;">UZUMAKI</div>
      <div id="win-sub">★ &nbsp; VICTORIA &nbsp; ★</div>
    </div>
    <button id="btn-restart" onclick="startGame()">▶ &nbsp; NUEVA BATALLA</button>
  </div>
</div>

<script>
// ═══════════════════════════════════════════════════
//  SHINOBI EVOLUTION — Complete Combat Engine
// ═══════════════════════════════════════════════════
const W = 460, H = 360;
const GROUND = H - 50;          // ground Y level
const G = 0.44;                  // gravity per frame
const SC = 0.70;                 // sprite scale
const NW = Math.round(30 * SC); // ninja width  ≈21
const NH = Math.round(50 * SC); // ninja height ≈35

const canvas   = document.getElementById('canvas');
const ctx      = canvas.getContext('2d');
const veil     = document.getElementById('veil');
const winScreen= document.getElementById('winner-screen');
const winName  = document.getElementById('win-name');

// ... (script completo sin modificaciones)
</script>
</body>
</html>`;

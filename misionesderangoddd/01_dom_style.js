// ─── Inyectar estilos ────────────────────────────
const misionesderangod2Style = document.createElement('style');
misionesderangod2Style.id = 'misionesderangod2-battle-style';
misionesderangod2Style.textContent = `
* { margin:0; padding:0; box-sizing:border-box; }
body {
  background: #050308;
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; overflow: hidden;
  font-family: 'Arial Black', Impact, sans-serif;
}
#misionesderangod2Wrapper {
  position: relative; width: 100%; height: 100%;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255,120,0,0.25),
    0 0 30px rgba(255,80,0,0.3),
    0 0 80px rgba(120,0,255,0.15);
}
#misionesderangod2Wrapper canvas { position:absolute; top:0; left:0; display:block; }
#misionesderangod2Veil {
  position: absolute; top:0; left:0; width:100%; height:100%;
  pointer-events: none; z-index: 8;
  background: rgba(0,0,0,0);
  transition: background 0.2s ease;
}
#misionesderangod2WinnerScreen {
  position: absolute; top:0; left:0; width:100%; height:100%;
  display: none; flex-direction: column;
  justify-content: center; align-items: center;
  z-index: 20;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%);
}
#misionesderangod2WinBanner {
  border-top: 1px solid rgba(255,200,0,0.4);
  border-bottom: 1px solid rgba(255,200,0,0.4);
  padding: 12px 40px;
  text-align: center;
  animation: misionesderangod2WinPulse 0.8s ease-in-out infinite alternate;
}
#misionesderangod2WinLabel { font-size: 10px; letter-spacing: 6px; color: #AA8800; margin-bottom: 4px; }
#misionesderangod2WinName {
  font-size: 42px; font-weight: 900; letter-spacing: 5px;
  text-transform: uppercase;
  -webkit-text-stroke: 1px rgba(255,200,0,0.5);
}
#misionesderangod2WinSub { font-size: 11px; letter-spacing: 4px; color: #888; margin-top: 6px; }
#misionesderangod2BtnRestart {
  margin-top: 22px; padding: 9px 28px;
  background: transparent;
  border: 1px solid rgba(255,180,0,0.5);
  color: #FFD700; font-size: 11px; letter-spacing: 3px;
  cursor: pointer; text-transform: uppercase;
  transition: all 0.2s;
}
#misionesderangod2BtnRestart:hover {
  background: rgba(255,180,0,0.15);
  border-color: rgba(255,180,0,0.9);
}
@keyframes misionesderangod2WinPulse {
  from { filter: drop-shadow(0 0 8px rgba(255,200,0,0.3)); }
  to   { filter: drop-shadow(0 0 25px rgba(255,200,0,0.7)); }
}
`;
if (!document.getElementById('misionesderangod2-battle-style')) {
  document.head.appendChild(misionesderangod2Style);
}

// ─── Inyectar HTML ───────────────────────────────
const misionesderangod2Container = document.createElement('div');
misionesderangod2Container.id = 'misionesderangod2Wrapper';
misionesderangod2Container.innerHTML = `
  <canvas id="misionesderangod2Canvas" width="460" height="360" style="z-index:2;"></canvas>
  <div id="misionesderangod2Veil"></div>
  <div id="misionesderangod2WinnerScreen">
    <div id="misionesderangod2WinBanner">
      <div id="misionesderangod2WinLabel">VENCEDOR</div>
      <div id="misionesderangod2WinName" style="color:#FFD700;">UZUMAKI</div>
      <div id="misionesderangod2WinSub">&#9733; &nbsp; VICTORIA &nbsp; &#9733;</div>
    </div>
    <button id="misionesderangod2BtnRestart">&#9654; &nbsp; NUEVA BATALLA</button>
  </div>
`;

(function(){
  'use strict';
  const md2 = window.misionesderango2 || (window.misionesderango2 = {});
const misionesderango2HTML = `
    <div id="misionesderango2-main-menu-screen" class="misionesderango2-screen">
      <div id="misionesderango2-main-misiones" class="misionesderango2-menu-button">⚔️ MISIONES RANGO ⚔️</div>
    </div>

    <div id="misionesderango2-rank-list-screen" class="misionesderango2-screen misionesderango2-hidden">
      <div id="misionesderango2-rank-D" class="misionesderango2-rank-button misionesderango2-rank-d">📜 MISION RANGO D</div>
      <div id="misionesderango2-rank-C" class="misionesderango2-rank-button misionesderango2-rank-c">🔥 MISION RANGO C</div>
      <div id="misionesderango2-rank-B" class="misionesderango2-rank-button misionesderango2-rank-b">🌪️ MISION RANGO B</div>
      <div id="misionesderango2-rank-A" class="misionesderango2-rank-button misionesderango2-rank-a">💀 MISION RANGO A</div>
      <div id="misionesderango2-rank-S" class="misionesderango2-rank-button misionesderango2-rank-s">👑 MISION RANGO S</div>
      <div class="misionesderango2-back-button" id="misionesderango2-back-to-main-from-ranks">⬅️ Volver</div>
    </div>

    <div id="misionesderango2-missions-screen" class="misionesderango2-screen misionesderango2-hidden"></div>

    <div id="misionesderango2-battle-screen" class="misionesderango2-screen misionesderango2-hidden">
      <div class="misionesderango2-battle-container">
        <div class="misionesderango2-bg-layer misionesderango2-bg-layer-1"></div>
        <div class="misionesderango2-bg-layer misionesderango2-bg-layer-2"></div>
        <div id="misionesderango2-ground"></div>

        <div id="misionesderango2-hud">
          <div class="misionesderango2-hud-unit">
            <div class="misionesderango2-avatar">🍥</div>
            <div class="misionesderango2-hp-info">
              <div class="misionesderango2-unit-name">Naruto Uzumaki</div>
              <div class="misionesderango2-hp-bar-container"><div class="misionesderango2-hp-bar" id="misionesderango2-hero-hp-bar" style="width:100%"></div></div>
              <div class="misionesderango2-hp-text" id="misionesderango2-hero-hp-text">200 / 200</div>
              <div class="misionesderango2-chakra-bar-container"><div class="misionesderango2-chakra-bar-fill" id="misionesderango2-chakra-bar"></div></div>
            </div>
          </div>
          <div class="misionesderango2-hud-unit misionesderango2-enemy">
            <div class="misionesderango2-avatar misionesderango2-enemy-avatar">👹</div>
            <div class="misionesderango2-hp-info">
              <div class="misionesderango2-unit-name" id="misionesderango2-enemy-name">Enemigo</div>
              <div class="misionesderango2-hp-bar-container"><div class="misionesderango2-hp-bar" id="misionesderango2-enemy-hp-bar" style="width:100%"></div></div>
              <div class="misionesderango2-hp-text" id="misionesderango2-enemy-hp-text">0 / 0</div>
            </div>
          </div>
        </div>

        <div id="misionesderango2-turn-indicator">⚔ Combate Iniciado</div>

        <div id="misionesderango2-hero" class="misionesderango2-character">
          <div class="misionesderango2-hero-body">
            <div class="misionesderango2-hero-head">
              <div class="misionesderango2-hero-headband"></div>
              <div class="misionesderango2-hero-eyes">
                <div class="misionesderango2-hero-eye"></div>
                <div class="misionesderango2-hero-eye"></div>
              </div>
            </div>
            <div class="misionesderango2-hero-torso"></div>
            <div class="misionesderango2-hero-legs">
              <div class="misionesderango2-hero-leg"></div>
              <div class="misionesderango2-hero-leg"></div>
            </div>
          </div>
        </div>

        <div id="misionesderango2-enemy-char" class="misionesderango2-character">
          <div class="misionesderango2-enemy-body">
            <div class="misionesderango2-enemy-head">
              <div class="misionesderango2-enemy-eyes">
                <div class="misionesderango2-enemy-eye"></div>
                <div class="misionesderango2-enemy-eye"></div>
              </div>
            </div>
            <div class="misionesderango2-enemy-torso"></div>
            <div class="misionesderango2-enemy-legs">
              <div class="misionesderango2-enemy-leg"></div>
              <div class="misionesderango2-enemy-leg"></div>
            </div>
          </div>
        </div>

        <div id="misionesderango2-jutsu-overlay">
          <div class="misionesderango2-jutsu-kanji" id="misionesderango2-jutsu-kanji">忍</div>
          <div class="misionesderango2-jutsu-name" id="misionesderango2-jutsu-name"></div>
        </div>

        <div id="misionesderango2-combat-log">
          <div class="misionesderango2-log-line" id="misionesderango2-log-1">⚔ ¡El combate ha comenzado!</div>
          <div class="misionesderango2-log-line" id="misionesderango2-log-2"></div>
        </div>

        <div class="misionesderango2-back-battle-btn" id="misionesderango2-back-from-battle">⬅️ Abandonar</div>
        <div class="misionesderango2-stop-battle-btn" id="misionesderango2-stop-battle-btn">⏹️ DETENER</div>
      </div>
    </div>
  `;

  /* ============================================================
     DATOS DE MISIONES
  ============================================================ */

  md2.misionesderango2HTML = misionesderango2HTML;

})();

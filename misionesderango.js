/**
 * misionesderango.js
 * Sistema de Misiones de Rango - Naruto Idle RPG
 * 
 * INSTRUCCIONES DE USO:
 * 1. Importa este script en tu HTML: <script src="misionesderango.js"></script>
 * 2. Asegúrate de tener un div con id="misionesderango2-root" en tu HTML donde se insertará el sistema.
 * 3. Inicializa el sistema con: misionesderango2Init({ lvl: 1, hp: 200, atk: 25, def: 18 });
 *    (pasa las stats actuales de tu jugador)
 * 4. Para actualizar las stats del jugador en cualquier momento: misionesderango2SetPlayer({ lvl, hp, atk, def });
 */

(function() {
  'use strict';

  // ============================================
  // ESTILOS (inyectados dinámicamente)
  // ============================================
  const misionesderango2CSS = `
    #misionesderango2-root {
      font-family: 'Segoe UI', 'Arial Black', sans-serif;
      width: 100%;
      height: 100%;
      display: flex;
    }

    #misionesderango2-root *, #misionesderango2-root *::before, #misionesderango2-root *::after {
      box-sizing: border-box;
    }

    #misionesderango2-container {
      width: 100%;
      height: 100%;
      background-color: white;
      border-radius: 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      overflow: hidden;
      position: relative;
    }

    .misionesderango2-screen {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background: white;
      transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .misionesderango2-screen.misionesderango2-hidden {
      opacity: 0;
      pointer-events: none;
      transform: scale(0.95);
      display: none;
    }

    .misionesderango2-menu-button,
    .misionesderango2-rank-button,
    .misionesderango2-mission-item,
    .misionesderango2-back-button {
      background: #f0f0f0;
      border: 2px solid #ccc;
      border-radius: 30px;
      padding: 12px 8px;
      text-align: center;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 4px 0 #b0b0b0;
      transition: all 0.1s ease;
      width: 100%;
      flex-shrink: 0;
    }

    .misionesderango2-menu-button:active,
    .misionesderango2-rank-button:active,
    .misionesderango2-mission-item:active,
    .misionesderango2-back-button:active {
      transform: translateY(4px);
      box-shadow: none;
    }

    .misionesderango2-rank-d { background: linear-gradient(180deg, #9adf75 0%, #5aaf36 100%); border-color: #2f7d1f; color: #f5ffe9; }
    .misionesderango2-rank-c { background: linear-gradient(180deg, #6bd4ff 0%, #188bc4 100%); border-color: #0b5f8f; color: #f2fbff; }
    .misionesderango2-rank-b { background: linear-gradient(180deg, #ffd35f 0%, #ff9800 100%); border-color: #cc6c00; color: #fff8eb; }
    .misionesderango2-rank-a { background: linear-gradient(180deg, #ff8d8d 0%, #e53935 100%); border-color: #a81f1c; color: #fff1f1; }
    .misionesderango2-rank-s { background: linear-gradient(180deg, #d498ff 0%, #7b2cbf 100%); border-color: #4b1974; color: #f8f2ff; }

    .misionesderango2-mission-item {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 10px 8px;
      background: #fefefe;
      border-left: 8px solid;
      border-radius: 15px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      cursor: pointer;
      font-size: 12px;
      line-height: 1.4;
      gap: 5px;
    }

    .misionesderango2-mission-header {
      text-align: center;
      font-weight: 800;
      font-size: 14px;
      margin-bottom: 5px;
      text-transform: uppercase;
    }

    .misionesderango2-mission-details {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
    }

    .misionesderango2-mission-left,
    .misionesderango2-mission-right {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .misionesderango2-mission-left span,
    .misionesderango2-mission-right span {
      background: rgba(0,0,0,0.05);
      padding: 2px 6px;
      border-radius: 20px;
    }

    .misionesderango2-mission-lock {
      text-align: center;
      background: #ffebee;
      color: #c62828;
      border-radius: 20px;
      padding: 4px;
      font-size: 11px;
      font-weight: bold;
      border: 1px solid #ef9a9a;
    }

    .misionesderango2-locked {
      opacity: 0.7;
      filter: grayscale(0.5);
      border-color: #b0bec5 !important;
    }

    .misionesderango2-back-button {
      background: #cfd8dc;
      border-color: #607d8b;
      color: #263238;
      margin-top: 5px;
      font-size: 14px;
    }

    /* BATALLA */
    #misionesderango2-battle-screen {
      padding: 0;
      overflow: hidden;
    }

    .misionesderango2-battle-container {
      width: 100%;
      height: 100%;
      position: relative;
      background: linear-gradient(180deg, #1a0a2e 0%, #16213e 25%, #0f3460 45%, #1a5c2e 60%, #2d8a4e 100%);
      overflow: hidden;
    }

    .misionesderango2-bg-layer {
      position: absolute;
      width: 300%;
      height: 100%;
      background-repeat: repeat-x;
      background-size: auto 100%;
      will-change: transform;
    }

    .misionesderango2-bg-layer-1 {
      background: linear-gradient(180deg,
        #1a0a2e 0%, #16213e 25%, #0f3460 45%,
        #1a5c2e 60%, #2d8a4e 75%, #1a4a2e 100%);
      animation: misionesderango2ScrollBg 12s linear infinite;
      z-index: 0;
    }

    .misionesderango2-bg-layer-2 {
      background-image:
        radial-gradient(circle 18px at 350px 40px, #fffde7 60%, transparent 61%),
        radial-gradient(circle 22px at 350px 40px, rgba(255,253,231,0.3) 60%, transparent 61%);
      animation: misionesderango2ScrollBg2 8s linear infinite;
      z-index: 1;
      opacity: 0.5;
    }

    @keyframes misionesderango2ScrollBg {
      0% { transform: translateX(0); }
      100% { transform: translateX(-33.333%); }
    }
    @keyframes misionesderango2ScrollBg2 {
      0% { transform: translateX(0); }
      100% { transform: translateX(-33.333%); }
    }

    #misionesderango2-ground {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 70px;
      background: linear-gradient(180deg, #3a5a3a 0%, #2d4a2d 20%, #1a3a1a 100%);
      z-index: 3;
    }

    #misionesderango2-hud {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 20;
      padding: 6px 8px;
      display: flex;
      justify-content: space-between;
      background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%);
      pointer-events: none;
    }

    .misionesderango2-hud-unit {
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: 150px;
    }

    .misionesderango2-hud-unit.misionesderango2-enemy {
      flex-direction: row-reverse;
    }

    .misionesderango2-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid #FF6B00;
      flex-shrink: 0;
      background: linear-gradient(135deg, #FF6B00, #FF8F00);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .misionesderango2-avatar.misionesderango2-enemy-avatar {
      border-color: #FF1744;
      background: linear-gradient(135deg, #B71C1C, #D32F2F);
    }

    .misionesderango2-hp-info {
      flex: 1;
      min-width: 0;
    }

    .misionesderango2-unit-name {
      font-size: 8px;
      font-weight: 900;
      color: #fff;
      text-transform: uppercase;
      text-shadow: 0 0 6px rgba(0,0,0,0.8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .misionesderango2-hp-bar-container,
    .misionesderango2-chakra-bar-container {
      width: 100%;
      height: 8px;
      background: rgba(0,0,0,0.6);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 2px;
    }

    .misionesderango2-hp-bar,
    .misionesderango2-chakra-bar-fill {
      height: 100%;
      transition: width 0.2s;
    }

    .misionesderango2-hp-bar { background: linear-gradient(90deg, #f44336, #FF1744); }
    .misionesderango2-chakra-bar-fill { background: linear-gradient(90deg, #2196F3, #00B0FF); }

    .misionesderango2-hp-text {
      font-size: 7px;
      color: rgba(255,255,255,0.7);
      text-align: right;
    }

    .misionesderango2-character {
      position: absolute;
      bottom: 70px;
      z-index: 10;
    }

    #misionesderango2-hero {
      left: 20px;
      width: 45px;
      height: 65px;
    }

    .misionesderango2-hero-body {
      position: relative;
      width: 100%;
      height: 100%;
      animation: misionesderango2HeroIdle 2s ease-in-out infinite;
    }

    @keyframes misionesderango2HeroIdle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    .misionesderango2-hero-head {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 25px;
      height: 25px;
      background: linear-gradient(135deg, #FFCC80, #FFB74D);
      border-radius: 50%;
    }

    .misionesderango2-hero-headband {
      position: absolute;
      top: 5px;
      left: -2px;
      width: 29px;
      height: 7px;
      background: #1565C0;
      border-radius: 2px;
    }

    .misionesderango2-hero-eyes {
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      width: 16px;
      display: flex;
      justify-content: space-between;
    }

    .misionesderango2-hero-eye {
      width: 4px;
      height: 4px;
      background: #1565C0;
      border-radius: 50%;
    }

    .misionesderango2-hero-torso {
      position: absolute;
      top: 23px;
      left: 50%;
      transform: translateX(-50%);
      width: 22px;
      height: 20px;
      background: linear-gradient(180deg, #FF6B00, #E65100);
      border-radius: 4px;
    }

    .misionesderango2-hero-legs {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 18px;
      height: 14px;
      display: flex;
      gap: 2px;
    }

    .misionesderango2-hero-leg {
      flex: 1;
      background: #1565C0;
      border-radius: 0 0 3px 3px;
    }

    #misionesderango2-enemy-char {
      right: 20px;
      width: 50px;
      height: 70px;
    }

    .misionesderango2-enemy-body {
      position: relative;
      width: 100%;
      height: 100%;
      animation: misionesderango2EnemyIdle 2.5s ease-in-out infinite;
    }

    @keyframes misionesderango2EnemyIdle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }

    .misionesderango2-enemy-head {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 27px;
      height: 27px;
      background: linear-gradient(135deg, #9E9E9E, #757575);
      border-radius: 50%;
    }

    .misionesderango2-enemy-eyes {
      position: absolute;
      top: 13px;
      left: 50%;
      transform: translateX(-50%);
      width: 18px;
      display: flex;
      justify-content: space-between;
    }

    .misionesderango2-enemy-eye {
      width: 5px;
      height: 5px;
      background: #FF1744;
      border-radius: 50%;
      box-shadow: 0 0 4px #FF1744;
    }

    .misionesderango2-enemy-torso {
      position: absolute;
      top: 25px;
      left: 50%;
      transform: translateX(-50%);
      width: 25px;
      height: 23px;
      background: linear-gradient(180deg, #4A148C, #311B92);
      border-radius: 4px;
    }

    .misionesderango2-enemy-legs {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 14px;
      display: flex;
      gap: 2px;
    }

    .misionesderango2-enemy-leg {
      flex: 1;
      background: #37474F;
      border-radius: 0 0 3px 3px;
    }

    .misionesderango2-combat-text {
      position: absolute;
      z-index: 35;
      font-weight: 900;
      font-size: 18px;
      pointer-events: none;
      animation: misionesderango2CombatFloat 1s forwards;
      text-shadow: 2px 2px 0 #000;
      white-space: nowrap;
    }

    .misionesderango2-combat-text.misionesderango2-normal { color: #FFD600; }
    .misionesderango2-combat-text.misionesderango2-critical { color: #FF1744; font-size: 24px; }
    .misionesderango2-combat-text.misionesderango2-jutsu-dmg { color: #40C4FF; font-size: 22px; }

    @keyframes misionesderango2CombatFloat {
      0% { transform: translateY(0) scale(0.5); opacity: 0; }
      20% { transform: translateY(-10px) scale(1.1); opacity: 1; }
      100% { transform: translateY(-50px) scale(0.8); opacity: 0; }
    }

    .misionesderango2-hit-flash {
      animation: misionesderango2HitFlash 0.12s steps(1) 2 !important;
    }

    @keyframes misionesderango2HitFlash {
      0% { filter: brightness(0) invert(1); }
      100% { filter: brightness(0) invert(1); }
    }

    .misionesderango2-shake {
      animation: misionesderango2ScreenShake 0.3s;
    }

    @keyframes misionesderango2ScreenShake {
      0%,100% { transform: translate(0,0); }
      10%,30%,50%,70%,90% { transform: translate(-2px, -1px); }
      20%,40%,60%,80% { transform: translate(2px, 1px); }
    }

    .misionesderango2-shake-crit {
      animation: misionesderango2ScreenShakeCrit 0.4s;
    }

    @keyframes misionesderango2ScreenShakeCrit {
      0%,100% { transform: translate(0,0); }
      10%,30%,50%,70%,90% { transform: translate(-4px, -2px); }
      20%,40%,60%,80% { transform: translate(4px, 2px); }
    }

    #misionesderango2-jutsu-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.65);
      z-index: 30;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
    }

    #misionesderango2-jutsu-overlay.misionesderango2-active {
      opacity: 1;
      animation: misionesderango2JutsuDarken 1.8s forwards;
    }

    @keyframes misionesderango2JutsuDarken {
      0% { opacity: 0; }
      15% { opacity: 1; }
      70% { opacity: 1; }
      100% { opacity: 0; }
    }

    .misionesderango2-jutsu-name {
      font-size: 16px;
      font-weight: 900;
      color: #fff;
      text-transform: uppercase;
      text-shadow: 0 0 10px #2196F3, 2px 2px 0 #000;
      text-align: center;
    }

    .misionesderango2-jutsu-kanji {
      font-size: 28px;
      margin-bottom: 4px;
    }

    #misionesderango2-combat-log {
      position: absolute;
      bottom: 4px;
      left: 4px;
      right: 4px;
      z-index: 20;
      background: rgba(0,0,0,0.75);
      border-radius: 4px;
      padding: 3px 6px;
      max-height: 36px;
      overflow: hidden;
      pointer-events: none;
    }

    .misionesderango2-log-line {
      font-size: 8px;
      color: rgba(255,255,255,0.85);
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .misionesderango2-log-line .misionesderango2-dmg { color: #FF1744; }
    .misionesderango2-log-line .misionesderango2-jutsu-text { color: #00B0FF; }

    #misionesderango2-turn-indicator {
      position: absolute;
      top: 38px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
      font-size: 7px;
      font-weight: 900;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      pointer-events: none;
      white-space: nowrap;
    }

    .misionesderango2-projectile {
      position: absolute;
      z-index: 18;
      pointer-events: none;
    }

    .misionesderango2-projectile-rasengan {
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, #fff, #40C4FF, #0091EA, transparent);
      border-radius: 50%;
      box-shadow: 0 0 15px #40C4FF;
    }

    .misionesderango2-projectile-katon {
      width: 25px;
      height: 25px;
      background: radial-gradient(circle, #fff, #FF6B00, #FF1744, transparent);
      border-radius: 50%;
      box-shadow: 0 0 20px #FF6B00;
    }

    .misionesderango2-explosion-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      border: 2px solid;
      animation: misionesderango2ExplosionRing 0.5s forwards;
    }

    @keyframes misionesderango2ExplosionRing {
      0% { width: 0; height: 0; opacity: 1; }
      100% { width: 50px; height: 50px; opacity: 0; }
    }

    .misionesderango2-particle {
      position: absolute;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      animation: misionesderango2ParticleBurst 0.6s forwards;
    }

    @keyframes misionesderango2ParticleBurst {
      0% { transform: translate(0,0) scale(1); opacity: 1; }
      100% { transform: translate(var(--mrpx), var(--mrpy)) scale(0); opacity: 0; }
    }

    .misionesderango2-back-battle-btn {
      position: absolute;
      top: 5px;
      left: 5px;
      z-index: 25;
      background: rgba(0,0,0,0.6);
      color: white;
      border: 1px solid #ff6b00;
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 10px;
      cursor: pointer;
      pointer-events: auto;
      font-weight: bold;
    }

    .misionesderango2-stop-battle-btn {
      position: absolute;
      bottom: 45px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 25;
      background: #ef5350;
      border: none;
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 12px;
      font-weight: bold;
      color: white;
      cursor: pointer;
      pointer-events: auto;
    }
  `;

  // ============================================
  // HTML DEL SISTEMA
  // ============================================
  const misionesderango2HTML = `
    <div id="misionesderango2-container">

      <!-- Pantalla 1: Menú principal -->
      <div id="misionesderango2-main-screen" class="misionesderango2-screen">
        <div id="misionesderango2-btn-misiones" class="misionesderango2-menu-button">⚔️ MISIONES RANGO ⚔️</div>
      </div>

      <!-- Pantalla 2: Lista de Rangos -->
      <div id="misionesderango2-rank-screen" class="misionesderango2-screen misionesderango2-hidden">
        <div id="misionesderango2-rank-D" class="misionesderango2-rank-button misionesderango2-rank-d">📜 MISION RANGO D</div>
        <div id="misionesderango2-rank-C" class="misionesderango2-rank-button misionesderango2-rank-c">🔥 MISION RANGO C</div>
        <div id="misionesderango2-rank-B" class="misionesderango2-rank-button misionesderango2-rank-b">🌪️ MISION RANGO B</div>
        <div id="misionesderango2-rank-A" class="misionesderango2-rank-button misionesderango2-rank-a">💀 MISION RANGO A</div>
        <div id="misionesderango2-rank-S" class="misionesderango2-rank-button misionesderango2-rank-s">👑 MISION RANGO S</div>
        <div class="misionesderango2-back-button" id="misionesderango2-back-ranks-main">⬅️ Volver</div>
      </div>

      <!-- Pantalla 3: Misiones de un Rango -->
      <div id="misionesderango2-missions-screen" class="misionesderango2-screen misionesderango2-hidden">
        <div class="misionesderango2-back-button" id="misionesderango2-back-missions-ranks">⬅️ Volver a Rangos</div>
      </div>

      <!-- Pantalla 4: Batalla -->
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

    </div>
  `;

  // ============================================
  // DATOS DE MISIONES
  // ============================================
  const misionesderango2Data = {
    D: [
      { name: "Eliminar lobos hambrientos", xp: 2, gold: 4, hp: 138, atk: 25, def: 17, lvl: 1 },
      { name: "Recuperar suministros robados por goblins", xp: 4, gold: 8, hp: 174, atk: 43, def: 28, lvl: 3 },
      { name: "Proteger la aldea de jabalíes", xp: 6, gold: 12, hp: 210, atk: 61, def: 39, lvl: 5 },
      { name: "Investigar ruinas infestadas de ratas gigantes", xp: 8, gold: 16, hp: 246, atk: 78, def: 50, lvl: 7 },
      { name: "Escoltar a un mercader (bandido)", xp: 9, gold: 18, hp: 264, atk: 87, def: 55, lvl: 9 },
      { name: "Cazar una bestia nocturna", xp: 10, gold: 20, hp: 282, atk: 96, def: 61, lvl: 12 }
    ],
    C: [
      { name: "Limpiar una mina de murciélagos vampíricos", xp: 12, gold: 24, hp: 318, atk: 113, def: 72, lvl: 14 },
      { name: "Derrotar a un grupo de orcos merodeadores", xp: 14, gold: 28, hp: 354, atk: 131, def: 83, lvl: 16 },
      { name: "Rescatar a un rehén de los bandidos", xp: 16, gold: 32, hp: 390, atk: 149, def: 94, lvl: 18 },
      { name: "Eliminar una amenaza de lobos de las nieves", xp: 18, gold: 36, hp: 426, atk: 166, def: 105, lvl: 20 },
      { name: "Recuperar un artefacto custodiado por esqueletos", xp: 19, gold: 38, hp: 444, atk: 175, def: 110, lvl: 22 },
      { name: "Acabar con un troll de las colinas", xp: 20, gold: 40, hp: 462, atk: 184, def: 116, lvl: 24 }
    ],
    B: [
      { name: "Exterminar una colonia de arácnidos gigantes", xp: 22, gold: 44, hp: 498, atk: 201, def: 127, lvl: 28 },
      { name: "Detener a un invoca demonios menores", xp: 24, gold: 48, hp: 534, atk: 219, def: 138, lvl: 32 },
      { name: "Proteger una Ciudad de ataque de grifos salvajes", xp: 26, gold: 52, hp: 570, atk: 237, def: 149, lvl: 36 },
      { name: "Investigar desapariciones en un bosque encantado", xp: 28, gold: 56, hp: 606, atk: 254, def: 160, lvl: 40 },
      { name: "Derrotar a un caballero oscuro errante", xp: 29, gold: 58, hp: 624, atk: 263, def: 165, lvl: 45 },
      { name: "Asaltar una fortaleza de ogros", xp: 30, gold: 60, hp: 642, atk: 272, def: 171, lvl: 50 }
    ],
    A: [
      { name: "Eliminar a un dragón joven", xp: 32, gold: 64, hp: 678, atk: 289, def: 182, lvl: 55 },
      { name: "Infiltrarse en una base de asesinos", xp: 34, gold: 68, hp: 714, atk: 307, def: 193, lvl: 50 },
      { name: "Proteger una ciudad de un ataque", xp: 36, gold: 72, hp: 750, atk: 325, def: 204, lvl: 55 },
      { name: "Recuperar un tesoro de una tumba maldita", xp: 38, gold: 76, hp: 786, atk: 342, def: 215, lvl: 60 },
      { name: "Derrotar a un guerrero legendario", xp: 39, gold: 78, hp: 804, atk: 351, def: 220, lvl: 65 },
      { name: "Acabar con un demonio de las sombras", xp: 40, gold: 80, hp: 822, atk: 360, def: 226, lvl: 70 }
    ],
    S: [
      { name: "Enfrentar a un dragón adulto", xp: 50, gold: 100, hp: 1002, atk: 448, def: 281, lvl: 75 },
      { name: "Derrotar a un señor demonio menor", xp: 60, gold: 120, hp: 1182, atk: 536, def: 336, lvl: 80 },
      { name: "Salvar el reino de un lich", xp: 70, gold: 140, hp: 1362, atk: 624, def: 391, lvl: 85 },
      { name: "Enfrentar a un titán antiguo", xp: 80, gold: 160, hp: 1542, atk: 712, def: 446, lvl: 90 },
      { name: "Combatir a un dios olvidado", xp: 90, gold: 180, hp: 1722, atk: 800, def: 501, lvl: 95 },
      { name: "Derrotar al dragón anciano", xp: 100, gold: 200, hp: 1902, atk: 808, def: 556, lvl: 100 }
    ]
  };

  // ============================================
  // ESTADO INTERNO
  // ============================================
  let misionesderango2State = {
    currentScreen: 'main',
    battleActive: false,
    isJutsuActive: false,
    isHeroAttacking: false,
    isEnemyAttacking: false,
    heroAttackTimer: 0,
    enemyAttackTimer: 0,
    lastTimestamp: 0,
    currentMissionList: [],
    enemyIndex: 0,
    currentRank: 'D',
    currentEnemyMission: null,
    playerStats: { hp: 200, maxHp: 200, mp: 100, maxMp: 100, atk: 25, def: 18, lvl: 1 }
  };

  // ============================================
  // HELPERS DOM (scoped al contenedor)
  // ============================================
  function misionesderango2El(id) {
    return document.getElementById(id);
  }

  function misionesderango2UpdateBars() {
    const s = misionesderango2State;
    const enemy = s.currentEnemyMission;
    const heroPct = (s.playerStats.hp / s.playerStats.maxHp) * 100;
    const enemyPct = enemy ? (enemy.hp / enemy.maxHp) * 100 : 100;
    const chakraPct = (s.playerStats.mp / s.playerStats.maxMp) * 100;
    misionesderango2El('misionesderango2-hero-hp-bar').style.width = `${Math.max(0, heroPct)}%`;
    misionesderango2El('misionesderango2-enemy-hp-bar').style.width = `${Math.max(0, enemyPct)}%`;
    misionesderango2El('misionesderango2-chakra-bar').style.width = `${chakraPct}%`;
    misionesderango2El('misionesderango2-hero-hp-text').textContent = `${Math.max(0, Math.floor(s.playerStats.hp))}/${s.playerStats.maxHp}`;
    misionesderango2El('misionesderango2-enemy-hp-text').textContent = enemy
      ? `${Math.max(0, Math.floor(enemy.hp))}/${enemy.maxHp}`
      : '0/0';
  }

  function misionesderango2AddLog(line1, line2) {
    if (line1 !== undefined) misionesderango2El('misionesderango2-log-1').innerHTML = line1;
    if (line2 !== undefined) misionesderango2El('misionesderango2-log-2').innerHTML = line2;
  }

  function misionesderango2ScreenShake(intensity) {
    const container = misionesderango2El('misionesderango2-container');
    const cls = intensity === 'critical' ? 'misionesderango2-shake-crit' : 'misionesderango2-shake';
    container.classList.add(cls);
    setTimeout(() => container.classList.remove(cls), intensity === 'critical' ? 400 : 300);
  }

  function misionesderango2SpawnCombatText(target, value, type) {
    type = type || 'normal';
    const el = document.createElement('div');
    el.className = `misionesderango2-combat-text misionesderango2-${type}`;
    el.textContent = type === 'heal' ? `+${value}` : `-${value}`;
    const targetEl = misionesderango2El(target === 'enemy' ? 'misionesderango2-enemy-char' : 'misionesderango2-hero');
    const rect = targetEl.getBoundingClientRect();
    const containerRect = misionesderango2El('misionesderango2-container').getBoundingClientRect();
    el.style.left = `${rect.left - containerRect.left + rect.width / 2 + (Math.random() - 0.5) * 30}px`;
    el.style.top = `${rect.top - containerRect.top + (Math.random() - 0.5) * 20}px`;
    misionesderango2El('misionesderango2-container').appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function misionesderango2HitFlash(target) {
    const el = misionesderango2El(target === 'enemy' ? 'misionesderango2-enemy-char' : 'misionesderango2-hero');
    el.classList.add('misionesderango2-hit-flash');
    setTimeout(() => el.classList.remove('misionesderango2-hit-flash'), 150);
  }

  function misionesderango2ShowJutsuOverlay(jutsu) {
    return new Promise(function(resolve) {
      const overlay = misionesderango2El('misionesderango2-jutsu-overlay');
      misionesderango2El('misionesderango2-jutsu-kanji').textContent = jutsu.kanji;
      misionesderango2El('misionesderango2-jutsu-name').textContent = jutsu.name;
      overlay.classList.add('misionesderango2-active');
      setTimeout(function() {
        overlay.classList.remove('misionesderango2-active');
        resolve();
      }, 900);
    });
  }

  function misionesderango2AnimateProjectile(fromEl, toEl, type) {
    return new Promise(function(resolve) {
      const container = misionesderango2El('misionesderango2-container');
      const proj = document.createElement('div');
      proj.className = `misionesderango2-projectile misionesderango2-projectile-${type}`;
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      let startX = fromRect.left - containerRect.left + fromRect.width / 2 - 10;
      let startY = fromRect.top - containerRect.top + fromRect.height / 2 - 10;
      const endX = toRect.left - containerRect.left + toRect.width / 2 - 12;
      const endY = toRect.top - containerRect.top + toRect.height / 2 - 12;
      proj.style.left = `${startX}px`;
      proj.style.top = `${startY}px`;
      container.appendChild(proj);
      let progress = 0;
      function animate() {
        progress += 0.08;
        if (progress >= 1) { proj.remove(); resolve(); return; }
        const curX = startX + (endX - startX) * progress;
        const curY = startY + (endY - startY) * progress + Math.sin(progress * Math.PI) * -20;
        proj.style.left = `${curX}px`;
        proj.style.top = `${curY}px`;
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    });
  }

  function misionesderango2SpawnExplosion(x, y, color) {
    const container = misionesderango2El('misionesderango2-container');
    const exp = document.createElement('div');
    exp.style.position = 'absolute';
    exp.style.left = `${x}px`;
    exp.style.top = `${y}px`;
    const ring = document.createElement('div');
    ring.className = 'misionesderango2-explosion-ring';
    ring.style.borderColor = color;
    exp.appendChild(ring);
    container.appendChild(exp);
    setTimeout(() => exp.remove(), 500);
  }

  function misionesderango2SpawnParticles(x, y, color, count) {
    count = count || 8;
    const container = misionesderango2El('misionesderango2-container');
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'misionesderango2-particle';
      p.style.left = `${x + (Math.random() - 0.5) * 20}px`;
      p.style.top = `${y + (Math.random() - 0.5) * 20}px`;
      p.style.background = color;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 30 + 10;
      p.style.setProperty('--mrpx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--mrpy', `${Math.sin(angle) * dist}px`);
      container.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  function misionesderango2CalcDamage(atk, def, isCrit, multi) {
    isCrit = isCrit || false;
    multi = multi || 1.0;
    let dmg = Math.max(1, Math.floor((atk * multi) - (def * 0.3) + (Math.random() * 10 - 5)));
    if (isCrit) dmg *= 2;
    return Math.floor(dmg);
  }

  // ============================================
  // LÓGICA DE BATALLA
  // ============================================
  async function misionesderango2HeroAttack() {
    const s = misionesderango2State;
    if (!s.battleActive || s.isHeroAttacking || s.isJutsuActive) return;
    s.isHeroAttacking = true;

    const hero = misionesderango2El('misionesderango2-hero');
    const enemyEl = misionesderango2El('misionesderango2-enemy-char');
    hero.style.transform = 'translateX(80px)';
    await new Promise(r => setTimeout(r, 100));

    const isCrit = Math.random() < 0.15;
    const dmg = misionesderango2CalcDamage(s.playerStats.atk, s.currentEnemyMission.def, isCrit);
    s.currentEnemyMission.hp = Math.max(0, s.currentEnemyMission.hp - dmg);
    misionesderango2UpdateBars();

    misionesderango2HitFlash('enemy');
    misionesderango2SpawnCombatText('enemy', dmg, isCrit ? 'critical' : 'normal');
    misionesderango2ScreenShake(isCrit ? 'critical' : 'normal');
    misionesderango2AddLog(`Naruto ataca — <span class="misionesderango2-dmg">-${dmg} Daño</span>${isCrit ? ' ¡CRÍTICO!' : ''}`);

    const enemyRect = enemyEl.getBoundingClientRect();
    const containerRect = misionesderango2El('misionesderango2-container').getBoundingClientRect();
    misionesderango2SpawnParticles(
      enemyRect.left - containerRect.left + enemyRect.width / 2,
      enemyRect.top - containerRect.top + enemyRect.height / 3,
      isCrit ? '#FF1744' : '#FFD600', 6
    );

    hero.style.transform = '';
    await new Promise(r => setTimeout(r, 150));
    s.isHeroAttacking = false;

    if (s.currentEnemyMission.hp <= 0) misionesderango2NextEnemy();
  }

  async function misionesderango2EnemyAttack() {
    const s = misionesderango2State;
    if (!s.battleActive || s.isEnemyAttacking || s.currentEnemyMission.hp <= 0) return;
    s.isEnemyAttacking = true;

    const enemyEl = misionesderango2El('misionesderango2-enemy-char');
    enemyEl.style.transform = 'translateX(-70px)';
    await new Promise(r => setTimeout(r, 100));

    const dmg = misionesderango2CalcDamage(s.currentEnemyMission.atk, s.playerStats.def);
    s.playerStats.hp = Math.max(0, s.playerStats.hp - dmg);
    misionesderango2UpdateBars();

    misionesderango2HitFlash('hero');
    misionesderango2SpawnCombatText('hero', dmg, 'normal');
    misionesderango2ScreenShake('normal');
    misionesderango2AddLog(`${s.currentEnemyMission.name} ataca — <span class="misionesderango2-dmg">-${dmg} Daño</span>`);

    const heroEl = misionesderango2El('misionesderango2-hero');
    const heroRect = heroEl.getBoundingClientRect();
    const containerRect = misionesderango2El('misionesderango2-container').getBoundingClientRect();
    misionesderango2SpawnParticles(
      heroRect.left - containerRect.left + heroRect.width / 2,
      heroRect.top - containerRect.top + heroRect.height / 3,
      '#FF5722', 5
    );

    enemyEl.style.transform = '';
    await new Promise(r => setTimeout(r, 150));
    s.isEnemyAttacking = false;

    if (s.playerStats.hp <= 0) {
      s.battleActive = false;
      misionesderango2AddLog('💀 ¡Has sido derrotado!', '🔄 Reinicia la misión');
      misionesderango2El('misionesderango2-turn-indicator').textContent = '💀 Derrota';
    }
  }

  async function misionesderango2ExecuteJutsu() {
    const s = misionesderango2State;
    if (!s.battleActive || s.isJutsuActive || s.isHeroAttacking || s.playerStats.mp < s.playerStats.maxMp) return;
    s.isJutsuActive = true;

    const jutsuList = [
      { name: 'Rasengan', kanji: '螺', dmgMulti: 2.5, type: 'rasengan', color: '#40C4FF' },
      { name: 'Katon: Gōkakyū', kanji: '火', dmgMulti: 3.0, type: 'katon', color: '#FF6B00' }
    ];
    const jutsu = jutsuList[Math.floor(Math.random() * jutsuList.length)];

    await misionesderango2ShowJutsuOverlay(jutsu);
    await misionesderango2AnimateProjectile(
      misionesderango2El('misionesderango2-hero'),
      misionesderango2El('misionesderango2-enemy-char'),
      jutsu.type
    );

    const dmg = misionesderango2CalcDamage(s.playerStats.atk, s.currentEnemyMission.def, false, jutsu.dmgMulti);
    s.currentEnemyMission.hp = Math.max(0, s.currentEnemyMission.hp - dmg);
    misionesderango2UpdateBars();

    misionesderango2HitFlash('enemy');
    misionesderango2SpawnCombatText('enemy', dmg, 'jutsu-dmg');

    const enemyEl = misionesderango2El('misionesderango2-enemy-char');
    const containerRect = misionesderango2El('misionesderango2-container').getBoundingClientRect();
    const enemyRect = enemyEl.getBoundingClientRect();
    misionesderango2SpawnExplosion(
      enemyRect.left - containerRect.left + enemyRect.width / 2,
      enemyRect.top - containerRect.top + enemyRect.height / 3,
      jutsu.color
    );
    misionesderango2SpawnParticles(
      enemyRect.left - containerRect.left + enemyRect.width / 2,
      enemyRect.top - containerRect.top + enemyRect.height / 3,
      jutsu.color, 12
    );
    misionesderango2ScreenShake('critical');
    misionesderango2AddLog(`✨ <span class="misionesderango2-jutsu-text">${jutsu.name}</span> — <span class="misionesderango2-dmg">-${dmg} Daño</span>`);

    s.playerStats.mp = 0;
    misionesderango2UpdateBars();
    await new Promise(r => setTimeout(r, 400));
    s.isJutsuActive = false;

    if (s.currentEnemyMission.hp <= 0) misionesderango2NextEnemy();
  }

  function misionesderango2NextEnemy() {
    const s = misionesderango2State;
    if (!s.battleActive) return;
    s.enemyIndex = (s.enemyIndex + 1) % s.currentMissionList.length;
    s.currentEnemyMission = Object.assign({}, s.currentMissionList[s.enemyIndex]);
    s.currentEnemyMission.maxHp = s.currentEnemyMission.hp;
    misionesderango2El('misionesderango2-enemy-name').textContent = s.currentEnemyMission.name;
    misionesderango2UpdateBars();
    misionesderango2AddLog(`⚔️ Nuevo enemigo: ${s.currentEnemyMission.name}`, '');
    misionesderango2El('misionesderango2-turn-indicator').textContent = '⚔ Combate Activo';
  }

  function misionesderango2BattleLoop(timestamp) {
    const s = misionesderango2State;
    if (!s.battleActive) return;
    if (!s.lastTimestamp) s.lastTimestamp = timestamp;
    const delta = Math.min(100, timestamp - s.lastTimestamp);
    s.lastTimestamp = timestamp;

    if (s.playerStats.hp > 0 && s.currentEnemyMission.hp > 0) {
      s.heroAttackTimer += delta;
      if (s.heroAttackTimer >= 1800 && !s.isHeroAttacking && !s.isJutsuActive) {
        s.heroAttackTimer = 0;
        if (s.playerStats.mp >= s.playerStats.maxMp) {
          misionesderango2ExecuteJutsu();
        } else {
          misionesderango2HeroAttack();
        }
        s.playerStats.mp = Math.min(s.playerStats.maxMp, s.playerStats.mp + 5);
        misionesderango2UpdateBars();
      }

      s.enemyAttackTimer += delta;
      if (s.enemyAttackTimer >= 2200 && !s.isEnemyAttacking && !s.isJutsuActive) {
        s.enemyAttackTimer = 0;
        misionesderango2EnemyAttack();
      }
    }

    requestAnimationFrame(misionesderango2BattleLoop);
  }

  function misionesderango2StopBattle() {
    const s = misionesderango2State;
    s.battleActive = false;
    s.isHeroAttacking = false;
    s.isEnemyAttacking = false;
    s.isJutsuActive = false;
  }

  // ============================================
  // NAVEGACIÓN
  // ============================================
  function misionesderango2ShowScreen(id) {
    const screens = ['misionesderango2-main-screen', 'misionesderango2-rank-screen', 'misionesderango2-missions-screen', 'misionesderango2-battle-screen'];
    screens.forEach(function(sid) {
      const el = misionesderango2El(sid);
      if (el) {
        if (sid === id) {
          el.classList.remove('misionesderango2-hidden');
        } else {
          el.classList.add('misionesderango2-hidden');
        }
      }
    });
  }

  function misionesderango2ShowMissions(rank) {
    const s = misionesderango2State;
    s.currentRank = rank;
    const missions = misionesderango2Data[rank];
    const screen = misionesderango2El('misionesderango2-missions-screen');

    // Guardar el botón de volver antes de limpiar
    const backBtn = misionesderango2El('misionesderango2-back-missions-ranks');
    screen.innerHTML = '';

    const rankColors = { D: '#2e7d32', C: '#0277bd', B: '#ef6c00', A: '#b71c1c', S: '#4a148c' };
    const borderColor = rankColors[rank] || '#ccc';

    missions.forEach(function(mission, index) {
      const div = document.createElement('div');
      div.className = `misionesderango2-mission-item ${s.playerStats.lvl < mission.lvl ? 'misionesderango2-locked' : ''}`;
      div.style.borderLeftColor = borderColor;
      div.innerHTML = `
        <div class="misionesderango2-mission-header">${mission.name}</div>
        <div class="misionesderango2-mission-details">
          <div class="misionesderango2-mission-left">
            <span>⚡ XP: ${mission.xp}</span>
            <span>💰 Oro: ${mission.gold}</span>
          </div>
          <div class="misionesderango2-mission-right">
            <span>❤️ HP: ${mission.hp}</span>
            <span>⚔️ ATK: ${mission.atk}</span>
            <span>🛡️ DEF: ${mission.def}</span>
          </div>
        </div>
        ${s.playerStats.lvl < mission.lvl ? `<div class="misionesderango2-mission-lock">🔒 Nivel mínimo: ${mission.lvl}</div>` : ''}
      `;
      if (s.playerStats.lvl >= mission.lvl) {
        div.addEventListener('click', function() { misionesderango2StartBattle(rank, index); });
      } else {
        div.style.pointerEvents = 'none';
        div.style.opacity = '0.6';
      }
      screen.appendChild(div);
    });

    // Reagregar botón de volver
    const newBackBtn = document.createElement('div');
    newBackBtn.className = 'misionesderango2-back-button';
    newBackBtn.id = 'misionesderango2-back-missions-ranks';
    newBackBtn.textContent = '⬅️ Volver a Rangos';
    newBackBtn.addEventListener('click', function() {
      misionesderango2StopBattle();
      misionesderango2ShowScreen('misionesderango2-rank-screen');
      s.currentScreen = 'ranks';
    });
    screen.appendChild(newBackBtn);

    misionesderango2ShowScreen('misionesderango2-missions-screen');
    s.currentScreen = 'missions';
  }

  function misionesderango2StartBattle(rank, missionIndex) {
    const s = misionesderango2State;
    misionesderango2StopBattle();
    s.currentMissionList = misionesderango2Data[rank];
    s.enemyIndex = missionIndex;
    s.currentEnemyMission = Object.assign({}, s.currentMissionList[s.enemyIndex]);
    s.currentEnemyMission.maxHp = s.currentEnemyMission.hp;

    s.playerStats.hp = s.playerStats.maxHp;
    s.playerStats.mp = s.playerStats.maxMp;

    misionesderango2El('misionesderango2-enemy-name').textContent = s.currentEnemyMission.name;
    misionesderango2UpdateBars();

    misionesderango2ShowScreen('misionesderango2-battle-screen');
    s.currentScreen = 'battle';

    misionesderango2AddLog('⚔ ¡El combate ha comenzado!', `Contra: ${s.currentEnemyMission.name}`);
    misionesderango2El('misionesderango2-turn-indicator').textContent = '⚔ Combate Activo';

    s.battleActive = true;
    s.heroAttackTimer = 0;
    s.enemyAttackTimer = 0;
    s.lastTimestamp = 0;
    requestAnimationFrame(misionesderango2BattleLoop);
  }

  function misionesderango2StopAndGoMain() {
    misionesderango2StopBattle();
    misionesderango2ShowScreen('misionesderango2-main-screen');
    misionesderango2State.currentScreen = 'main';
  }

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  function misionesderango2Init(playerConfig) {
    // Aplicar estilos
    if (!document.getElementById('misionesderango2-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'misionesderango2-styles';
      styleEl.textContent = misionesderango2CSS;
      document.head.appendChild(styleEl);
    }

    // Insertar HTML en el root
    const root = document.getElementById('misionesderango2-root');
    if (!root) {
      console.error('[misionesderango.js] No se encontró el elemento #misionesderango2-root en el DOM.');
      return;
    }
    root.innerHTML = misionesderango2HTML;

    // Aplicar stats del jugador si se pasan
    if (playerConfig) {
      const p = misionesderango2State.playerStats;
      if (playerConfig.lvl !== undefined) p.lvl = playerConfig.lvl;
      if (playerConfig.hp !== undefined) { p.hp = playerConfig.hp; p.maxHp = playerConfig.hp; }
      if (playerConfig.maxHp !== undefined) p.maxHp = playerConfig.maxHp;
      if (playerConfig.mp !== undefined) { p.mp = playerConfig.mp; p.maxMp = playerConfig.mp; }
      if (playerConfig.maxMp !== undefined) p.maxMp = playerConfig.maxMp;
      if (playerConfig.atk !== undefined) p.atk = playerConfig.atk;
      if (playerConfig.def !== undefined) p.def = playerConfig.def;
    }

    // Eventos de navegación
    misionesderango2El('misionesderango2-btn-misiones').addEventListener('click', function() {
      misionesderango2ShowScreen('misionesderango2-rank-screen');
      misionesderango2State.currentScreen = 'ranks';
    });

    misionesderango2El('misionesderango2-rank-D').addEventListener('click', function() { misionesderango2ShowMissions('D'); });
    misionesderango2El('misionesderango2-rank-C').addEventListener('click', function() { misionesderango2ShowMissions('C'); });
    misionesderango2El('misionesderango2-rank-B').addEventListener('click', function() { misionesderango2ShowMissions('B'); });
    misionesderango2El('misionesderango2-rank-A').addEventListener('click', function() { misionesderango2ShowMissions('A'); });
    misionesderango2El('misionesderango2-rank-S').addEventListener('click', function() { misionesderango2ShowMissions('S'); });

    misionesderango2El('misionesderango2-back-ranks-main').addEventListener('click', function() {
      misionesderango2ShowScreen('misionesderango2-main-screen');
      misionesderango2State.currentScreen = 'main';
    });

    misionesderango2El('misionesderango2-back-from-battle').addEventListener('click', misionesderango2StopAndGoMain);
    misionesderango2El('misionesderango2-stop-battle-btn').addEventListener('click', misionesderango2StopAndGoMain);

    misionesderango2ShowScreen('misionesderango2-main-screen');
    console.log('[misionesderango.js] Sistema de Misiones de Rango inicializado correctamente.');
  }

  // ============================================
  // API PÚBLICA
  // ============================================

  /**
   * Actualiza las stats del jugador en tiempo real.
   * @param {Object} config - { lvl, hp, maxHp, mp, maxMp, atk, def }
   */
  window.misionesderango2SetPlayer = function(config) {
    const p = misionesderango2State.playerStats;
    if (config.lvl !== undefined) p.lvl = config.lvl;
    if (config.hp !== undefined) p.hp = config.hp;
    if (config.maxHp !== undefined) p.maxHp = config.maxHp;
    if (config.mp !== undefined) p.mp = config.mp;
    if (config.maxMp !== undefined) p.maxMp = config.maxMp;
    if (config.atk !== undefined) p.atk = config.atk;
    if (config.def !== undefined) p.def = config.def;
  };

  /**
   * Inicializa el sistema de misiones.
   * Requiere un div con id="misionesderango2-root" en el HTML.
   * @param {Object} playerConfig - Stats iniciales del jugador { lvl, hp, atk, def }
   */
  window.misionesderango2Init = misionesderango2Init;

  /**
   * Detiene la batalla activa desde fuera si es necesario.
   */
  window.misionesderango2StopBattle = misionesderango2StopBattle;

})();
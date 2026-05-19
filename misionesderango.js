/**
 * misionesderango.js
 * Módulo de Misiones de Rango – Naruto Idle RPG
 * Todos los identificadores usan el prefijo "misionesderango2"
 * para evitar conflictos con otros scripts del juego.
 *
 * USO:
 *   1. Importa este archivo en tu HTML:
 *        <script src="misionesderango.js"></script>
 *   2. Llama a misionesderango2Init() una vez que el DOM esté listo
 *      o coloca el <script> al final del <body>.
 *   3. El módulo inyecta su propio contenedor HTML y estilos
 *      de forma aislada. No modifica ningún elemento externo.
 */

(function () {
  'use strict';

  /* ============================================================
     CSS – inyectado dinámicamente como <style>
  ============================================================ */
  const misionesderango2CSS = `
    #misionesderango2-body-wrap {
      background: linear-gradient(135deg, #0a0d14 0%, #111827 50%, #1a2236 100%);
      display: flex;
      justify-content: stretch;
      align-items: stretch;
      width: 100%;
      height: 100%;
      min-height: 100%;
      font-family: 'Segoe UI', 'Arial Black', sans-serif;
      padding: 0;
      box-sizing: border-box;
    }

    #misionesderango2-container {
      width: 100%;
      height: 100%;
      background: linear-gradient(160deg, #111827 0%, #0a0d14 100%);
      border-radius: 20px;
      box-shadow:
        0 0 0 1px rgba(255,107,0,0.18),
        0 0 30px rgba(255,107,0,0.08),
        0 10px 40px rgba(0,0,0,0.7);
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
    }

    .misionesderango2-screen {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background: transparent;
      transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
      box-sizing: border-box;
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
    .misionesderango2-back-button {
      border-radius: 30px;
      padding: 12px 8px;
      text-align: center;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.1s ease;
      box-sizing: border-box;
      width: 100%;
      flex-shrink: 0;
      user-select: none;
    }

    .misionesderango2-menu-button:active,
    .misionesderango2-rank-button:active,
    .misionesderango2-back-button:active {
      transform: translateY(2px);
    }

    .misionesderango2-menu-button {
      background: linear-gradient(135deg, #1e2d45 0%, #162036 100%);
      border: 2px solid #FF6B00;
      color: #FF8C30;
      box-shadow: 0 4px 0 #7a3300, inset 0 1px 0 rgba(255,150,50,0.15);
      text-shadow: 0 0 10px rgba(255,107,0,0.5);
    }
    .misionesderango2-menu-button:active { box-shadow: none; }

    .misionesderango2-rank-d {
      background: linear-gradient(135deg, #0d2010 0%, #0a1a0d 100%);
      border: 2px solid #2e7d32;
      color: #4caf50;
      box-shadow: 0 4px 0 #1b4020, 0 0 8px rgba(46,125,50,0.2), inset 0 1px 0 rgba(100,200,100,0.1);
    }
    .misionesderango2-rank-c {
      background: linear-gradient(135deg, #0a1a2e 0%, #071525 100%);
      border: 2px solid #0277bd;
      color: #29b6f6;
      box-shadow: 0 4px 0 #014a75, 0 0 8px rgba(2,119,189,0.2), inset 0 1px 0 rgba(50,150,255,0.1);
    }
    .misionesderango2-rank-b {
      background: linear-gradient(135deg, #2a1800 0%, #1e1200 100%);
      border: 2px solid #ef6c00;
      color: #ffa726;
      box-shadow: 0 4px 0 #7a3500, 0 0 8px rgba(239,108,0,0.2), inset 0 1px 0 rgba(255,150,0,0.1);
    }
    .misionesderango2-rank-a {
      background: linear-gradient(135deg, #2a0808 0%, #1e0505 100%);
      border: 2px solid #b71c1c;
      color: #ef5350;
      box-shadow: 0 4px 0 #6a0e0e, 0 0 8px rgba(183,28,28,0.25), inset 0 1px 0 rgba(255,80,80,0.1);
    }
    .misionesderango2-rank-s {
      background: linear-gradient(135deg, #1e0a2e 0%, #150621 100%);
      border: 2px solid #7b1fa2;
      color: #ce93d8;
      box-shadow: 0 4px 0 #4a0e6e, 0 0 10px rgba(123,31,162,0.3), inset 0 1px 0 rgba(200,100,255,0.1);
    }
    .misionesderango2-rank-button:active { box-shadow: none; transform: translateY(4px); }

    .misionesderango2-mission-item {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 10px;
      border-left: 6px solid;
      border-radius: 12px;
      cursor: pointer;
      font-size: 12px;
      line-height: 1.4;
      gap: 5px;
      position: relative;
      transition: all 0.15s ease;
    }
    .misionesderango2-mission-item:not(.misionesderango2-locked):active { transform: scale(0.98); }

    .misionesderango2-missions-D .misionesderango2-mission-item {
      background: linear-gradient(135deg,#0d2010,#091509);
      border-color: #2e7d32;
      border-top: 1px solid rgba(76,175,80,0.2);
      border-right: 1px solid rgba(76,175,80,0.12);
      border-bottom: 1px solid rgba(46,125,50,0.15);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(46,125,50,0.1);
    }
    .misionesderango2-missions-C .misionesderango2-mission-item {
      background: linear-gradient(135deg,#0a1a2e,#060f1e);
      border-color: #0277bd;
      border-top: 1px solid rgba(41,182,246,0.2);
      border-right: 1px solid rgba(2,119,189,0.12);
      border-bottom: 1px solid rgba(2,119,189,0.15);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(2,119,189,0.1);
    }
    .misionesderango2-missions-B .misionesderango2-mission-item {
      background: linear-gradient(135deg,#201000,#160b00);
      border-color: #ef6c00;
      border-top: 1px solid rgba(255,167,38,0.2);
      border-right: 1px solid rgba(239,108,0,0.12);
      border-bottom: 1px solid rgba(239,108,0,0.15);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(239,108,0,0.1);
    }
    .misionesderango2-missions-A .misionesderango2-mission-item {
      background: linear-gradient(135deg,#200808,#160404);
      border-color: #b71c1c;
      border-top: 1px solid rgba(239,83,80,0.2);
      border-right: 1px solid rgba(183,28,28,0.12);
      border-bottom: 1px solid rgba(183,28,28,0.15);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(183,28,28,0.1);
    }
    .misionesderango2-missions-S .misionesderango2-mission-item {
      background: linear-gradient(135deg,#160a20,#0e0616);
      border-color: #7b1fa2;
      border-top: 1px solid rgba(206,147,216,0.2);
      border-right: 1px solid rgba(123,31,162,0.12);
      border-bottom: 1px solid rgba(123,31,162,0.15);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 8px rgba(123,31,162,0.12);
    }

    .misionesderango2-mission-header {
      text-align: center;
      font-weight: 800;
      font-size: 13px;
      margin-bottom: 3px;
      text-transform: uppercase;
      color: #e8e0d0;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
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
      background: rgba(0,0,0,0.35);
      color: rgba(220,210,195,0.85);
      padding: 2px 6px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .misionesderango2-mission-lock {
      text-align: center;
      background: rgba(150,20,20,0.3);
      color: #ff6b6b;
      border-radius: 20px;
      padding: 4px;
      font-size: 11px;
      font-weight: bold;
      border: 1px solid rgba(198,40,40,0.4);
    }
    .misionesderango2-locked {
      opacity: 0.55;
      filter: grayscale(0.4);
    }

    .misionesderango2-back-button {
      background: linear-gradient(135deg, #1a1f2e 0%, #111520 100%);
      border: 2px solid #37474f;
      color: #90a4ae;
      box-shadow: 0 3px 0 #1a2228, inset 0 1px 0 rgba(144,164,174,0.08);
      margin-top: 4px;
      font-size: 14px;
    }
    .misionesderango2-back-button:active { box-shadow: none; transform: translateY(3px); }

    /* ---- BATTLE ---- */
    #misionesderango2-battle-screen {
      background: transparent;
      padding: 0;
      overflow: hidden;
    }
    .misionesderango2-battle-container {
      width: 100%;
      height: 100%;
      position: relative;
      background: linear-gradient(180deg,#1a0a2e 0%,#16213e 25%,#0f3460 45%,#1a5c2e 60%,#2d8a4e 100%);
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
      background: linear-gradient(180deg,#1a0a2e 0%,#16213e 25%,#0f3460 45%,#1a5c2e 60%,#2d8a4e 75%,#1a4a2e 100%);
      animation: misionesderango2ScrollBg 12s linear infinite;
      z-index: 0;
    }
    .misionesderango2-bg-layer-2 {
      background-image:
        radial-gradient(circle 18px at 350px 40px,#fffde7 60%,transparent 61%),
        radial-gradient(circle 22px at 350px 40px,rgba(255,253,231,0.3) 60%,transparent 61%);
      animation: misionesderango2ScrollBg2 8s linear infinite;
      z-index: 1;
      opacity: 0.5;
    }
    @keyframes misionesderango2ScrollBg {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-33.333%); }
    }
    @keyframes misionesderango2ScrollBg2 {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-33.333%); }
    }

    #misionesderango2-ground {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 70px;
      background: linear-gradient(180deg,#3a5a3a 0%,#2d4a2d 20%,#1a3a1a 100%);
      z-index: 3;
    }

    #misionesderango2-hud {
      position: absolute;
      top: 0; left: 0; right: 0;
      z-index: 20;
      padding: 6px 8px;
      display: flex;
      justify-content: space-between;
      background: linear-gradient(180deg,rgba(0,0,0,0.7) 0%,transparent 100%);
      pointer-events: none;
    }
    .misionesderango2-hud-unit {
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: 150px;
    }
    .misionesderango2-hud-unit.misionesderango2-enemy { flex-direction: row-reverse; }

    .misionesderango2-avatar {
      width: 32px; height: 32px;
      border-radius: 50%;
      border: 2px solid #FF6B00;
      flex-shrink: 0;
      background: linear-gradient(135deg,#FF6B00,#FF8F00);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
    }
    .misionesderango2-avatar.misionesderango2-enemy-avatar {
      border-color: #FF1744;
      background: linear-gradient(135deg,#B71C1C,#D32F2F);
    }

    .misionesderango2-hp-info { flex: 1; min-width: 0; }
    .misionesderango2-unit-name {
      font-size: 8px; font-weight: 900; color: #fff;
      text-transform: uppercase;
      text-shadow: 0 0 6px rgba(0,0,0,0.8);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .misionesderango2-hp-bar-container,
    .misionesderango2-chakra-bar-container {
      width: 100%; height: 8px;
      background: rgba(0,0,0,0.6);
      border-radius: 4px; overflow: hidden; margin-top: 2px;
    }
    .misionesderango2-hp-bar,
    .misionesderango2-chakra-bar-fill {
      height: 100%; transition: width 0.2s;
    }
    .misionesderango2-hp-bar { background: linear-gradient(90deg,#f44336,#FF1744); }
    .misionesderango2-chakra-bar-fill { background: linear-gradient(90deg,#2196F3,#00B0FF); }
    .misionesderango2-hp-text {
      font-size: 7px; color: rgba(255,255,255,0.7); text-align: right;
    }

    .misionesderango2-character {
      position: absolute; bottom: 70px; z-index: 10;
    }
    #misionesderango2-hero { left: 20px; width: 45px; height: 65px; }
    .misionesderango2-hero-body {
      position: relative; width: 100%; height: 100%;
      animation: misionesderango2HeroIdle 2s ease-in-out infinite;
    }
    @keyframes misionesderango2HeroIdle {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-3px); }
    }
    .misionesderango2-hero-head {
      position: absolute; top: 0;
      left: 50%; transform: translateX(-50%);
      width: 25px; height: 25px;
      background: linear-gradient(135deg,#FFCC80,#FFB74D);
      border-radius: 50%;
    }
    .misionesderango2-hero-headband {
      position: absolute; top: 5px; left: -2px;
      width: 29px; height: 7px;
      background: #1565C0; border-radius: 2px;
    }
    .misionesderango2-hero-eyes {
      position: absolute; top: 14px;
      left: 50%; transform: translateX(-50%);
      width: 16px; display: flex; justify-content: space-between;
    }
    .misionesderango2-hero-eye {
      width: 4px; height: 4px;
      background: #1565C0; border-radius: 50%;
    }
    .misionesderango2-hero-torso {
      position: absolute; top: 23px;
      left: 50%; transform: translateX(-50%);
      width: 22px; height: 20px;
      background: linear-gradient(180deg,#FF6B00,#E65100);
      border-radius: 4px;
    }
    .misionesderango2-hero-legs {
      position: absolute; bottom: 0;
      left: 50%; transform: translateX(-50%);
      width: 18px; height: 14px;
      display: flex; gap: 2px;
    }
    .misionesderango2-hero-leg { flex: 1; background: #1565C0; border-radius: 0 0 3px 3px; }

    #misionesderango2-enemy-char { right: 20px; width: 50px; height: 70px; }
    .misionesderango2-enemy-body {
      position: relative; width: 100%; height: 100%;
      animation: misionesderango2EnemyIdle 2.5s ease-in-out infinite;
    }
    @keyframes misionesderango2EnemyIdle {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-2px); }
    }
    .misionesderango2-enemy-head {
      position: absolute; top: 0;
      left: 50%; transform: translateX(-50%);
      width: 27px; height: 27px;
      background: linear-gradient(135deg,#9E9E9E,#757575);
      border-radius: 50%;
    }
    .misionesderango2-enemy-eyes {
      position: absolute; top: 13px;
      left: 50%; transform: translateX(-50%);
      width: 18px; display: flex; justify-content: space-between;
    }
    .misionesderango2-enemy-eye {
      width: 5px; height: 5px;
      background: #FF1744; border-radius: 50%;
      box-shadow: 0 0 4px #FF1744;
    }
    .misionesderango2-enemy-torso {
      position: absolute; top: 25px;
      left: 50%; transform: translateX(-50%);
      width: 25px; height: 23px;
      background: linear-gradient(180deg,#4A148C,#311B92);
      border-radius: 4px;
    }
    .misionesderango2-enemy-legs {
      position: absolute; bottom: 0;
      left: 50%; transform: translateX(-50%);
      width: 20px; height: 14px;
      display: flex; gap: 2px;
    }
    .misionesderango2-enemy-leg { flex: 1; background: #37474F; border-radius: 0 0 3px 3px; }

    .misionesderango2-combat-text {
      position: absolute; z-index: 35;
      font-weight: 900; font-size: 18px;
      pointer-events: none;
      animation: misionesderango2CombatFloat 1s forwards;
      text-shadow: 2px 2px 0 #000;
      white-space: nowrap;
    }
    .misionesderango2-combat-text.misionesderango2-normal   { color: #FFD600; }
    .misionesderango2-combat-text.misionesderango2-critical { color: #FF1744; font-size: 24px; }
    .misionesderango2-combat-text.misionesderango2-jutsu-dmg { color: #40C4FF; font-size: 22px; }
    @keyframes misionesderango2CombatFloat {
      0%   { transform: translateY(0) scale(0.5); opacity: 0; }
      20%  { transform: translateY(-10px) scale(1.1); opacity: 1; }
      100% { transform: translateY(-50px) scale(0.8); opacity: 0; }
    }

    .misionesderango2-hit-flash {
      animation: misionesderango2HitFlash 0.12s steps(1) 2 !important;
    }
    @keyframes misionesderango2HitFlash {
      0%   { filter: brightness(0) invert(1); }
      100% { filter: brightness(0) invert(1); }
    }

    .misionesderango2-shake {
      animation: misionesderango2ScreenShake 0.3s;
    }
    @keyframes misionesderango2ScreenShake {
      0%,100% { transform: translate(0,0); }
      10%,30%,50%,70%,90% { transform: translate(-2px,-1px); }
      20%,40%,60%,80%     { transform: translate(2px,1px); }
    }
    .misionesderango2-shake-crit {
      animation: misionesderango2ScreenShakeCrit 0.4s;
    }
    @keyframes misionesderango2ScreenShakeCrit {
      0%,100% { transform: translate(0,0); }
      10%,30%,50%,70%,90% { transform: translate(-4px,-2px); }
      20%,40%,60%,80%     { transform: translate(4px,2px); }
    }

    #misionesderango2-jutsu-overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.65);
      z-index: 30;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      opacity: 0; pointer-events: none;
    }
    #misionesderango2-jutsu-overlay.misionesderango2-active {
      opacity: 1;
      animation: misionesderango2JutsuDarken 1.8s forwards;
    }
    @keyframes misionesderango2JutsuDarken {
      0%   { opacity: 0; }
      15%  { opacity: 1; }
      70%  { opacity: 1; }
      100% { opacity: 0; }
    }
    .misionesderango2-jutsu-name {
      font-size: 16px; font-weight: 900; color: #fff;
      text-transform: uppercase;
      text-shadow: 0 0 10px #2196F3, 2px 2px 0 #000;
      text-align: center;
    }
    .misionesderango2-jutsu-kanji { font-size: 28px; margin-bottom: 4px; }

    #misionesderango2-combat-log {
      position: absolute; bottom: 4px; left: 4px; right: 4px;
      z-index: 20;
      background: rgba(0,0,0,0.75);
      border-radius: 4px; padding: 3px 6px;
      max-height: 36px; overflow: hidden;
      pointer-events: none;
    }
    .misionesderango2-log-line {
      font-size: 8px; color: rgba(255,255,255,0.85);
      font-weight: 700; white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis;
    }
    .misionesderango2-log-line .misionesderango2-dmg  { color: #FF1744; }
    .misionesderango2-log-line .misionesderango2-jutsu-text { color: #00B0FF; }

    #misionesderango2-turn-indicator {
      position: absolute; top: 38px;
      left: 50%; transform: translateX(-50%);
      z-index: 20;
      font-size: 7px; font-weight: 900;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      pointer-events: none; white-space: nowrap;
    }

    .misionesderango2-projectile { position: absolute; z-index: 18; pointer-events: none; }
    .misionesderango2-projectile-rasengan {
      width: 20px; height: 20px;
      background: radial-gradient(circle,#fff,#40C4FF,#0091EA,transparent);
      border-radius: 50%; box-shadow: 0 0 15px #40C4FF;
    }
    .misionesderango2-projectile-katon {
      width: 25px; height: 25px;
      background: radial-gradient(circle,#fff,#FF6B00,#FF1744,transparent);
      border-radius: 50%; box-shadow: 0 0 20px #FF6B00;
    }

    .misionesderango2-explosion-ring {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      border-radius: 50%; border: 2px solid;
      animation: misionesderango2ExplosionRing 0.5s forwards;
    }
    @keyframes misionesderango2ExplosionRing {
      0%   { width: 0; height: 0; opacity: 1; }
      100% { width: 50px; height: 50px; opacity: 0; }
    }

    .misionesderango2-particle {
      position: absolute;
      width: 3px; height: 3px;
      border-radius: 50%;
      animation: misionesderango2ParticleBurst 0.6s forwards;
    }
    @keyframes misionesderango2ParticleBurst {
      0%   { transform: translate(0,0) scale(1); opacity: 1; }
      100% { transform: translate(var(--mdpx),var(--mdpy)) scale(0); opacity: 0; }
    }

    .misionesderango2-back-battle-btn {
      position: absolute; top: 5px; left: 5px; z-index: 25;
      background: rgba(0,0,0,0.6); color: white;
      border: 1px solid #ff6b00; border-radius: 20px;
      padding: 4px 10px; font-size: 10px;
      cursor: pointer; pointer-events: auto; font-weight: bold;
    }
    .misionesderango2-stop-battle-btn {
      position: absolute; bottom: 45px;
      left: 50%; transform: translateX(-50%);
      z-index: 25;
      background: #ef5350; border: none; border-radius: 20px;
      padding: 6px 16px; font-size: 12px; font-weight: bold;
      color: white; cursor: pointer; pointer-events: auto;
    }
  `;

  /* ============================================================
     HTML – inyectado dinámicamente
  ============================================================ */
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
  const misionesderango2MissionsData = {
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

  /* ============================================================
     ESTADO DEL MÓDULO (todo encapsulado, sin vars globales)
  ============================================================ */
  let misionesderango2CurrentScreen   = 'main';
  let misionesderango2BattleActive    = false;
  let misionesderango2PlayerStats     = { hp: 200, maxHp: 200, mp: 100, maxMp: 100, atk: 25, def: 18, lvl: 1 };
  let misionesderango2CurrentEnemy    = null;
  let misionesderango2CurrentMissions = [];
  let misionesderango2EnemyIndex      = 0;
  let misionesderango2CurrentRank     = 'D';
  let misionesderango2IsJutsuActive   = false;
  let misionesderango2IsHeroAtk       = false;
  let misionesderango2IsEnemyAtk      = false;
  let misionesderango2HeroTimer       = 0;
  let misionesderango2EnemyTimer      = 0;
  let misionesderango2LastTs          = 0;
  let misionesderango2Container       = null;   // #misionesderango2-container

  /* ============================================================
     HELPERS DOM  (buscan dentro del contenedor)
  ============================================================ */
  function md2$(id) { return document.getElementById(id); }

  function md2Screen(id)     { return md2$(id); }
  function md2Show(el)       { el.classList.remove('misionesderango2-hidden'); }
  function md2Hide(el)       { el.classList.add('misionesderango2-hidden'); }

  /* ============================================================
     PANTALLAS
  ============================================================ */
  function misionesderango2GoToMain() {
    if (typeof window.misionesderangod3Hide === 'function') window.misionesderangod3Hide();
    md2Hide(md2$('misionesderango2-rank-list-screen'));
    md2Hide(md2$('misionesderango2-missions-screen'));
    md2Hide(md2$('misionesderango2-battle-screen'));
    md2Show(md2$('misionesderango2-main-menu-screen'));
    misionesderango2CurrentScreen = 'main';
  }

  function misionesderango2GoToRanks() {
    if (typeof window.misionesderangod3Hide === 'function') window.misionesderangod3Hide();
    md2Hide(md2$('misionesderango2-main-menu-screen'));
    md2Hide(md2$('misionesderango2-missions-screen'));
    md2Hide(md2$('misionesderango2-battle-screen'));
    md2Show(md2$('misionesderango2-rank-list-screen'));
    misionesderango2CurrentScreen = 'ranks';
  }

  function misionesderango2ShowMissions(rank) {
    misionesderango2CurrentRank = rank;
    const missions = misionesderango2MissionsData[rank];
    const mScreen  = md2$('misionesderango2-missions-screen');

    mScreen.innerHTML = '';
    mScreen.className = `misionesderango2-screen misionesderango2-missions-${rank}`;

    missions.forEach((mission, index) => {
      const locked = misionesderango2PlayerStats.lvl < mission.lvl;
      const div = document.createElement('div');
      div.className = `misionesderango2-mission-item${locked ? ' misionesderango2-locked' : ''}`;
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
        ${locked ? `<div class="misionesderango2-mission-lock">🔒 Nivel mínimo: ${mission.lvl}</div>` : ''}
      `;
      if (locked) {
        div.style.pointerEvents = 'none';
      } else {
        div.addEventListener('click', () => {
          if (rank === 'D' && typeof window.misionesderangod3Show === 'function') {
            md2Hide(md2$('misionesderango2-missions-screen'));
            md2Hide(md2$('misionesderango2-rank-list-screen'));
            md2Hide(md2$('misionesderango2-main-menu-screen'));
            md2Hide(md2$('misionesderango2-battle-screen'));
            window.misionesderangod3Show('#misionesderango2-container');
            misionesderango2CurrentScreen = 'battle';
            return;
          }
          misionesderango2StartBattle(rank, index);
        });
      }
      mScreen.appendChild(div);
    });

    // Botón volver
    const backBtn = document.createElement('div');
    backBtn.className = 'misionesderango2-back-button';
    backBtn.textContent = '⬅️ Volver a Rangos';
    backBtn.addEventListener('click', () => {
      misionesderango2StopBattle();
      misionesderango2GoToRanks();
    });
    mScreen.appendChild(backBtn);

    md2Hide(md2$('misionesderango2-rank-list-screen'));
    md2Show(mScreen);
    misionesderango2CurrentScreen = 'missions';
  }

  /* ============================================================
     BATALLA
  ============================================================ */
  function misionesderango2StartBattle(rank, missionIndex) {
    misionesderango2StopBattle();
    misionesderango2CurrentMissions = misionesderango2MissionsData[rank];
    misionesderango2EnemyIndex = missionIndex;
    misionesderango2CurrentEnemy = { ...misionesderango2CurrentMissions[misionesderango2EnemyIndex] };
    misionesderango2CurrentEnemy.maxHp = misionesderango2CurrentEnemy.hp;

    misionesderango2PlayerStats.hp = misionesderango2PlayerStats.maxHp;
    misionesderango2PlayerStats.mp = 0;

    md2$('misionesderango2-enemy-name').textContent = misionesderango2CurrentEnemy.name;
    md2$('misionesderango2-hero-hp-text').textContent = `${misionesderango2PlayerStats.hp}/${misionesderango2PlayerStats.maxHp}`;
    md2$('misionesderango2-enemy-hp-text').textContent = `${misionesderango2CurrentEnemy.hp}/${misionesderango2CurrentEnemy.hp}`;
    misionesderango2UpdateBars();

    md2Hide(md2$('misionesderango2-missions-screen'));
    md2Hide(md2$('misionesderango2-rank-list-screen'));
    md2Hide(md2$('misionesderango2-main-menu-screen'));
    md2Show(md2$('misionesderango2-battle-screen'));
    misionesderango2CurrentScreen = 'battle';

    md2$('misionesderango2-log-1').innerHTML = '⚔ ¡El combate ha comenzado!';
    md2$('misionesderango2-log-2').innerHTML = `Contra: ${misionesderango2CurrentEnemy.name}`;
    md2$('misionesderango2-turn-indicator').textContent = '⚔ Combate Activo';

    misionesderango2BattleActive = true;
    misionesderango2HeroTimer    = 0;
    misionesderango2EnemyTimer   = 0;
    misionesderango2LastTs       = 0;
    requestAnimationFrame(misionesderango2BattleLoop);
  }

  function misionesderango2UpdateBars() {
    const heroPct   = (misionesderango2PlayerStats.hp / misionesderango2PlayerStats.maxHp) * 100;
    const enemyPct  = (misionesderango2CurrentEnemy.hp / misionesderango2CurrentEnemy.maxHp) * 100;
    const chakraPct = (misionesderango2PlayerStats.mp / misionesderango2PlayerStats.maxMp) * 100;
    md2$('misionesderango2-hero-hp-bar').style.width    = `${Math.max(0, heroPct)}%`;
    md2$('misionesderango2-enemy-hp-bar').style.width   = `${Math.max(0, enemyPct)}%`;
    md2$('misionesderango2-chakra-bar').style.width     = `${chakraPct}%`;
    md2$('misionesderango2-hero-hp-text').textContent   = `${Math.max(0, Math.floor(misionesderango2PlayerStats.hp))}/${misionesderango2PlayerStats.maxHp}`;
    md2$('misionesderango2-enemy-hp-text').textContent  = `${Math.max(0, Math.floor(misionesderango2CurrentEnemy.hp))}/${misionesderango2CurrentEnemy.maxHp}`;
  }

  function misionesderango2AddLog(line1, line2) {
    if (line1 !== undefined) md2$('misionesderango2-log-1').innerHTML = line1;
    if (line2 !== undefined) md2$('misionesderango2-log-2').innerHTML = line2;
  }

  function misionesderango2ScreenShake(intensity) {
    const cls = intensity === 'critical' ? 'misionesderango2-shake-crit' : 'misionesderango2-shake';
    misionesderango2Container.classList.add(cls);
    setTimeout(() => misionesderango2Container.classList.remove(cls), intensity === 'critical' ? 400 : 300);
  }

  function misionesderango2SpawnCombatText(target, value, type) {
    const el = document.createElement('div');
    el.className = `misionesderango2-combat-text misionesderango2-${type}`;
    el.textContent = type === 'heal' ? `+${value}` : `-${value}`;
    const targetEl = md2$(target === 'enemy' ? 'misionesderango2-enemy-char' : 'misionesderango2-hero');
    const tRect    = targetEl.getBoundingClientRect();
    const cRect    = misionesderango2Container.getBoundingClientRect();
    el.style.left  = `${tRect.left - cRect.left + tRect.width / 2 + (Math.random() - 0.5) * 30}px`;
    el.style.top   = `${tRect.top  - cRect.top  + (Math.random() - 0.5) * 20}px`;
    misionesderango2Container.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function misionesderango2HitFlash(target) {
    const el = md2$(target === 'enemy' ? 'misionesderango2-enemy-char' : 'misionesderango2-hero');
    el.classList.add('misionesderango2-hit-flash');
    setTimeout(() => el.classList.remove('misionesderango2-hit-flash'), 150);
  }

  function misionesderango2ShowJutsuOverlay(jutsu) {
    return new Promise(resolve => {
      const overlay = md2$('misionesderango2-jutsu-overlay');
      md2$('misionesderango2-jutsu-kanji').textContent = jutsu.kanji;
      md2$('misionesderango2-jutsu-name').textContent  = jutsu.name;
      overlay.classList.add('misionesderango2-active');
      setTimeout(() => { overlay.classList.remove('misionesderango2-active'); resolve(); }, 900);
    });
  }

  function misionesderango2AnimateProjectile(fromEl, toEl, type) {
    return new Promise(resolve => {
      const proj   = document.createElement('div');
      proj.className = `misionesderango2-projectile misionesderango2-projectile-${type}`;
      const fRect  = fromEl.getBoundingClientRect();
      const tRect  = toEl.getBoundingClientRect();
      const cRect  = misionesderango2Container.getBoundingClientRect();
      let startX = fRect.left - cRect.left + fRect.width  / 2 - 10;
      let startY = fRect.top  - cRect.top  + fRect.height / 2 - 10;
      const endX = tRect.left - cRect.left + tRect.width  / 2 - 12;
      const endY = tRect.top  - cRect.top  + tRect.height / 2 - 12;
      proj.style.left = `${startX}px`;
      proj.style.top  = `${startY}px`;
      misionesderango2Container.appendChild(proj);
      let progress = 0;
      function animate() {
        progress += 0.08;
        if (progress >= 1) { proj.remove(); resolve(); return; }
        const curX = startX + (endX - startX) * progress;
        const curY = startY + (endY - startY) * progress + Math.sin(progress * Math.PI) * -20;
        proj.style.left = `${curX}px`;
        proj.style.top  = `${curY}px`;
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    });
  }

  function misionesderango2SpawnExplosion(x, y, color) {
    const exp  = document.createElement('div');
    exp.style.cssText = `position:absolute;left:${x}px;top:${y}px`;
    const ring = document.createElement('div');
    ring.className = 'misionesderango2-explosion-ring';
    ring.style.borderColor = color;
    exp.appendChild(ring);
    misionesderango2Container.appendChild(exp);
    setTimeout(() => exp.remove(), 500);
  }

  function misionesderango2SpawnParticles(x, y, color, count) {
    count = count || 8;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'misionesderango2-particle';
      p.style.left       = `${x + (Math.random() - 0.5) * 20}px`;
      p.style.top        = `${y + (Math.random() - 0.5) * 20}px`;
      p.style.background = color;
      const angle = Math.random() * Math.PI * 2;
      const dist  = Math.random() * 30 + 10;
      p.style.setProperty('--mdpx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--mdpy', `${Math.sin(angle) * dist}px`);
      misionesderango2Container.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  function misionesderango2CalcDamage(atk, def, isCrit, multi) {
    isCrit = isCrit || false;
    multi  = multi  || 1.0;
    let dmg = Math.max(1, Math.floor((atk * multi) - (def * 0.3) + (Math.random() * 10 - 5)));
    if (isCrit) dmg *= 2;
    return Math.floor(dmg);
  }

  async function misionesderango2HeroAttack() {
    if (!misionesderango2BattleActive || misionesderango2IsHeroAtk || misionesderango2IsJutsuActive) return;
    misionesderango2IsHeroAtk = true;
    const hero  = md2$('misionesderango2-hero');
    const enemy = md2$('misionesderango2-enemy-char');
    hero.style.transform = 'translateX(80px)';
    await new Promise(r => setTimeout(r, 100));
    const isCrit = Math.random() < 0.15;
    const dmg    = misionesderango2CalcDamage(misionesderango2PlayerStats.atk, misionesderango2CurrentEnemy.def, isCrit);
    misionesderango2CurrentEnemy.hp = Math.max(0, misionesderango2CurrentEnemy.hp - dmg);
    misionesderango2UpdateBars();
    misionesderango2HitFlash('enemy');
    misionesderango2SpawnCombatText('enemy', dmg, isCrit ? 'critical' : 'normal');
    misionesderango2ScreenShake(isCrit ? 'critical' : 'normal');
    misionesderango2AddLog(
      `Naruto ataca — <span class="misionesderango2-dmg">-${dmg} Daño</span>${isCrit ? ' ¡CRÍTICO!' : ''}`
    );
    const eRect = enemy.getBoundingClientRect();
    const cRect = misionesderango2Container.getBoundingClientRect();
    misionesderango2SpawnParticles(
      eRect.left - cRect.left + eRect.width / 2,
      eRect.top  - cRect.top  + eRect.height / 3,
      isCrit ? '#FF1744' : '#FFD600', 6
    );
    hero.style.transform = '';
    await new Promise(r => setTimeout(r, 150));
    misionesderango2IsHeroAtk = false;
    if (misionesderango2CurrentEnemy.hp <= 0) misionesderango2NextEnemy();
  }

  async function misionesderango2EnemyAttack() {
    if (!misionesderango2BattleActive || misionesderango2IsEnemyAtk || misionesderango2CurrentEnemy.hp <= 0) return;
    misionesderango2IsEnemyAtk = true;
    const enemy = md2$('misionesderango2-enemy-char');
    enemy.style.transform = 'translateX(-70px)';
    await new Promise(r => setTimeout(r, 100));
    const dmg = misionesderango2CalcDamage(misionesderango2CurrentEnemy.atk, misionesderango2PlayerStats.def);
    misionesderango2PlayerStats.hp = Math.max(0, misionesderango2PlayerStats.hp - dmg);
    misionesderango2UpdateBars();
    misionesderango2HitFlash('hero');
    misionesderango2SpawnCombatText('hero', dmg, 'normal');
    misionesderango2ScreenShake('normal');
    misionesderango2AddLog(
      `${misionesderango2CurrentEnemy.name} ataca — <span class="misionesderango2-dmg">-${dmg} Daño</span>`
    );
    const hero  = md2$('misionesderango2-hero');
    const hRect = hero.getBoundingClientRect();
    const cRect = misionesderango2Container.getBoundingClientRect();
    misionesderango2SpawnParticles(
      hRect.left - cRect.left + hRect.width / 2,
      hRect.top  - cRect.top  + hRect.height / 3,
      '#FF5722', 5
    );
    enemy.style.transform = '';
    await new Promise(r => setTimeout(r, 150));
    misionesderango2IsEnemyAtk = false;
    if (misionesderango2PlayerStats.hp <= 0) {
      misionesderango2BattleActive = false;
      misionesderango2AddLog('💀 ¡Has sido derrotado!', '🔄 Reinicia la misión');
      md2$('misionesderango2-turn-indicator').textContent = '💀 Derrota';
    }
  }

  async function misionesderango2ExecuteJutsu() {
    if (!misionesderango2BattleActive || misionesderango2IsJutsuActive ||
        misionesderango2IsHeroAtk || misionesderango2PlayerStats.mp < misionesderango2PlayerStats.maxMp) return;
    misionesderango2IsJutsuActive = true;
    const jutsuList = [
      { name: 'Rasengan', kanji: '螺', dmgMulti: 2.5, type: 'rasengan', color: '#40C4FF' },
      { name: 'Katon: Gōkakyū', kanji: '火', dmgMulti: 3.0, type: 'katon', color: '#FF6B00' }
    ];
    const jutsu = jutsuList[Math.floor(Math.random() * jutsuList.length)];
    await misionesderango2ShowJutsuOverlay(jutsu);
    await misionesderango2AnimateProjectile(
      md2$('misionesderango2-hero'),
      md2$('misionesderango2-enemy-char'),
      jutsu.type
    );
    const dmg = misionesderango2CalcDamage(misionesderango2PlayerStats.atk, misionesderango2CurrentEnemy.def, false, jutsu.dmgMulti);
    misionesderango2CurrentEnemy.hp = Math.max(0, misionesderango2CurrentEnemy.hp - dmg);
    misionesderango2UpdateBars();
    misionesderango2HitFlash('enemy');
    misionesderango2SpawnCombatText('enemy', dmg, 'jutsu-dmg');
    const eRect = md2$('misionesderango2-enemy-char').getBoundingClientRect();
    const cRect = misionesderango2Container.getBoundingClientRect();
    misionesderango2SpawnExplosion(
      eRect.left - cRect.left + eRect.width / 2,
      eRect.top  - cRect.top  + eRect.height / 3,
      jutsu.color
    );
    misionesderango2SpawnParticles(
      eRect.left - cRect.left + eRect.width / 2,
      eRect.top  - cRect.top  + eRect.height / 3,
      jutsu.color, 12
    );
    misionesderango2ScreenShake('critical');
    misionesderango2AddLog(
      `✨ <span class="misionesderango2-jutsu-text">${jutsu.name}</span> — <span class="misionesderango2-dmg">-${dmg} Daño</span>`
    );
    misionesderango2PlayerStats.mp = 0;
    misionesderango2UpdateBars();
    await new Promise(r => setTimeout(r, 400));
    misionesderango2IsJutsuActive = false;
    if (misionesderango2CurrentEnemy.hp <= 0) misionesderango2NextEnemy();
  }

  function misionesderango2NextEnemy() {
    if (!misionesderango2BattleActive) return;
    misionesderango2EnemyIndex = (misionesderango2EnemyIndex + 1) % misionesderango2CurrentMissions.length;
    misionesderango2CurrentEnemy = { ...misionesderango2CurrentMissions[misionesderango2EnemyIndex] };
    misionesderango2CurrentEnemy.maxHp = misionesderango2CurrentEnemy.hp;
    md2$('misionesderango2-enemy-name').textContent     = misionesderango2CurrentEnemy.name;
    md2$('misionesderango2-enemy-hp-text').textContent  = `${misionesderango2CurrentEnemy.hp}/${misionesderango2CurrentEnemy.maxHp}`;
    misionesderango2UpdateBars();
    misionesderango2AddLog(`⚔️ Nuevo enemigo: ${misionesderango2CurrentEnemy.name}`, '');
    md2$('misionesderango2-turn-indicator').textContent = '⚔ Combate Activo';
  }

  function misionesderango2BattleLoop(timestamp) {
    if (!misionesderango2BattleActive) return;
    if (!misionesderango2LastTs) misionesderango2LastTs = timestamp;
    const delta = Math.min(100, timestamp - misionesderango2LastTs);
    misionesderango2LastTs = timestamp;

    if (misionesderango2PlayerStats.hp > 0 && misionesderango2CurrentEnemy.hp > 0) {
      misionesderango2HeroTimer += delta;
      if (misionesderango2HeroTimer >= 1800 && !misionesderango2IsHeroAtk && !misionesderango2IsJutsuActive) {
        misionesderango2HeroTimer = 0;
        if (misionesderango2PlayerStats.mp >= misionesderango2PlayerStats.maxMp) {
          misionesderango2ExecuteJutsu();
        } else {
          misionesderango2HeroAttack();
        }
        misionesderango2PlayerStats.mp = Math.min(misionesderango2PlayerStats.maxMp, misionesderango2PlayerStats.mp + 5);
        misionesderango2UpdateBars();
      }
      misionesderango2EnemyTimer += delta;
      if (misionesderango2EnemyTimer >= 2200 && !misionesderango2IsEnemyAtk && !misionesderango2IsJutsuActive) {
        misionesderango2EnemyTimer = 0;
        misionesderango2EnemyAttack();
      }
    }
    requestAnimationFrame(misionesderango2BattleLoop);
  }

  function misionesderango2StopBattle() {
    misionesderango2BattleActive  = false;
    misionesderango2IsHeroAtk     = false;
    misionesderango2IsEnemyAtk    = false;
    misionesderango2IsJutsuActive = false;
  }

  function misionesderango2StopAndGoMain() {
    if (typeof window.misionesderangod3Hide === 'function') window.misionesderangod3Hide();
    misionesderango2StopBattle();
    md2Hide(md2$('misionesderango2-battle-screen'));
    md2Hide(md2$('misionesderango2-rank-list-screen'));
    md2Hide(md2$('misionesderango2-missions-screen'));
    md2Show(md2$('misionesderango2-main-menu-screen'));
    misionesderango2CurrentScreen = 'main';
  }

  /* ============================================================
     INICIALIZACIÓN PÚBLICA
  ============================================================ */

  /**
   * misionesderango2Init(targetSelector)
   *
   * Inyecta el módulo de Misiones de Rango dentro del elemento
   * indicado por `targetSelector` (por defecto: 'body').
   *
   * Ejemplos:
   *   misionesderango2Init();                   // monta en <body>
   *   misionesderango2Init('#mi-panel');        // monta dentro de #mi-panel
   */
  window.misionesderango2Init = function (targetSelector) {
    // Evitar doble inicialización
    if (document.getElementById('misionesderango2-container')) return;

    // Inyectar CSS
    const styleTag = document.createElement('style');
    styleTag.id    = 'misionesderango2-styles';
    styleTag.textContent = misionesderango2CSS;
    document.head.appendChild(styleTag);

    // Crear wrapper exterior (simula el body centrado del original)
    const bodyWrap = document.createElement('div');
    bodyWrap.id = 'misionesderango2-body-wrap';

    // Crear contenedor principal del juego
    const gameContainer = document.createElement('div');
    gameContainer.id    = 'misionesderango2-container';
    gameContainer.innerHTML = misionesderango2HTML;

    bodyWrap.appendChild(gameContainer);

    // Montar en el target indicado
    const target = document.querySelector(targetSelector || 'body');
    target.appendChild(bodyWrap);

    // Guardar referencia al contenedor
    misionesderango2Container = gameContainer;

    // Listeners de navegación principal
    md2$('misionesderango2-main-misiones').addEventListener('click', misionesderango2GoToRanks);

    md2$('misionesderango2-rank-D').addEventListener('click', () => misionesderango2ShowMissions('D'));
    md2$('misionesderango2-rank-C').addEventListener('click', () => misionesderango2ShowMissions('C'));
    md2$('misionesderango2-rank-B').addEventListener('click', () => misionesderango2ShowMissions('B'));
    md2$('misionesderango2-rank-A').addEventListener('click', () => misionesderango2ShowMissions('A'));
    md2$('misionesderango2-rank-S').addEventListener('click', () => misionesderango2ShowMissions('S'));

    md2$('misionesderango2-back-to-main-from-ranks').addEventListener('click', misionesderango2GoToMain);
    md2$('misionesderango2-back-from-battle').addEventListener('click', misionesderango2StopAndGoMain);
    md2$('misionesderango2-stop-battle-btn').addEventListener('click', misionesderango2StopAndGoMain);

    // Mostrar pantalla inicial
    md2Show(md2$('misionesderango2-main-menu-screen'));
  };

  /**
   * misionesderango2SetPlayerStats(stats)
   *
   * Permite sincronizar las estadísticas del jugador desde tu juego.
   * stats = { hp, maxHp, mp, maxMp, atk, def, lvl }
   * Solo se aplican los campos proporcionados.
   */

  window.misionesderango2ShowMain = function () {
    if (!document.getElementById('misionesderango2-container')) return;
    misionesderango2StopBattle();
    misionesderango2GoToMain();
  };
  window.misionesderango2SetPlayerStats = function (stats) {
    Object.assign(misionesderango2PlayerStats, stats);
  };

  /**
   * misionesderango2GetPlayerStats()
   * Devuelve una copia del estado actual del jugador.
   */
  window.misionesderango2GetPlayerStats = function () {
    return { ...misionesderango2PlayerStats };
  };

  /**
   * misionesderango2Destroy()
   * Elimina el módulo del DOM y limpia el estado.
   */
  window.misionesderango2Destroy = function () {
    misionesderango2StopBattle();
    const wrap  = document.getElementById('misionesderango2-body-wrap');
    const style = document.getElementById('misionesderango2-styles');
    if (wrap)  wrap.remove();
    if (style) style.remove();
    misionesderango2Container = null;
  };

})(); // fin IIFE

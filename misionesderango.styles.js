(function(){
  'use strict';
  const md2 = window.misionesderango2 || (window.misionesderango2 = {});
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

  md2.misionesderango2CSS = misionesderango2CSS;

})();

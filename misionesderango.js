/**
 * misionesderango.js
 * Sistema de Misiones de Rango (Naruto Style)
 * Todos los nombres han sido renombrados con el prefijo "misionesderango2"
 * para evitar conflictos con otros scripts del juego.
 *
 * USO:
 *   1. Importa este archivo en tu HTML: <script src="misionesderango.js"></script>
 *   2. Llama a misionesderango2Init() cuando quieras inicializar el sistema.
 *   3. El sistema inyecta su propio HTML/CSS dentro del elemento que le pases,
 *      o en document.body si no se pasa ninguno.
 *
 * EJEMPLO:
 *   misionesderango2Init(document.getElementById('mi-contenedor'));
 *   // O simplemente:
 *   misionesderango2Init();
 */

(function () {
  'use strict';

  // ============================================
  // INYECCIÓN DE ESTILOS CSS
  // ============================================
  function misionesderango2InjectStyles() {
    if (document.getElementById('misionesderango2-styles')) return;
    const style = document.createElement('style');
    style.id = 'misionesderango2-styles';
    style.textContent = `
/* ============================================
   MISIONESDERANGO2 — RESET & CONTENEDOR (355x500)
   ============================================ */
#misionesderango2-game-container *,
#misionesderango2-game-container *::before,
#misionesderango2-game-container *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#misionesderango2-game-container {
  --mdr2-game-w: 355px;
  --mdr2-game-h: 500px;
  --mdr2-accent-orange: #FF6B00;
  --mdr2-accent-red: #FF1744;
  --mdr2-accent-blue: #00B0FF;
  --mdr2-accent-chakra: #2196F3;
  --mdr2-accent-gold: #FFD600;
  --mdr2-dark-overlay: rgba(0, 0, 0, 0.65);

  width: var(--mdr2-game-w);
  height: var(--mdr2-game-h);
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Arial Black', sans-serif;
}

#misionesderango2-game-container .mdr2-screen {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: white;
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

#misionesderango2-game-container .mdr2-screen.mdr2-hidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.95);
  display: none;
}

#misionesderango2-game-container .mdr2-menu-button,
#misionesderango2-game-container .mdr2-rank-button,
#misionesderango2-game-container .mdr2-mission-item,
#misionesderango2-game-container .mdr2-back-button,
#misionesderango2-game-container .mdr2-stop-button {
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
  box-sizing: border-box;
  width: 100%;
  flex-shrink: 0;
}

#misionesderango2-game-container .mdr2-menu-button:active,
#misionesderango2-game-container .mdr2-rank-button:active,
#misionesderango2-game-container .mdr2-mission-item:active,
#misionesderango2-game-container .mdr2-back-button:active {
  transform: translateY(4px);
  box-shadow: none;
}

#misionesderango2-game-container .mdr2-rank-d { background: #a5d6a5; border-color: #2e7d32; color: #1b5e20; }
#misionesderango2-game-container .mdr2-rank-c { background: #b3e5fc; border-color: #0277bd; color: #01579b; }
#misionesderango2-game-container .mdr2-rank-b { background: #ffcc80; border-color: #ef6c00; color: #e65100; }
#misionesderango2-game-container .mdr2-rank-a { background: #ef9a9a; border-color: #b71c1c; color: #710000; }
#misionesderango2-game-container .mdr2-rank-s { background: #ce93d8; border-color: #4a148c; color: #2a0a4a; }

#misionesderango2-game-container .mdr2-mission-item {
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

#misionesderango2-game-container .mdr2-mission-header {
  text-align: center;
  font-weight: 800;
  font-size: 14px;
  margin-bottom: 5px;
  text-transform: uppercase;
}

#misionesderango2-game-container .mdr2-mission-details {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

#misionesderango2-game-container .mdr2-mission-left,
#misionesderango2-game-container .mdr2-mission-right {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

#misionesderango2-game-container .mdr2-mission-left span,
#misionesderango2-game-container .mdr2-mission-right span {
  background: rgba(0,0,0,0.05);
  padding: 2px 6px;
  border-radius: 20px;
}

#misionesderango2-game-container .mdr2-mission-lock {
  text-align: center;
  background: #ffebee;
  color: #c62828;
  border-radius: 20px;
  padding: 4px;
  font-size: 11px;
  font-weight: bold;
  border: 1px solid #ef9a9a;
}

#misionesderango2-game-container .mdr2-locked {
  opacity: 0.7;
  filter: grayscale(0.5);
  border-color: #b0bec5 !important;
}

#misionesderango2-game-container .mdr2-back-button {
  background: #cfd8dc;
  border-color: #607d8b;
  color: #263238;
  margin-top: 5px;
  font-size: 14px;
}

/* ============================================
   MISIONESDERANGO2 — BATTLE SCREEN
   ============================================ */
#misionesderango2-battle-screen {
  background: white;
  padding: 0;
  overflow: hidden;
}

#misionesderango2-game-container .mdr2-battle-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(180deg, #1a0a2e 0%, #16213e 25%, #0f3460 45%, #1a5c2e 60%, #2d8a4e 100%);
  overflow: hidden;
}

#misionesderango2-game-container .mdr2-bg-layer {
  position: absolute;
  width: 300%;
  height: 100%;
  background-repeat: repeat-x;
  background-size: auto 100%;
  will-change: transform;
}

#misionesderango2-game-container .mdr2-bg-layer-1 {
  background: linear-gradient(180deg,
    #1a0a2e 0%, #16213e 25%, #0f3460 45%,
    #1a5c2e 60%, #2d8a4e 75%, #1a4a2e 100%);
  animation: mdr2ScrollBg 12s linear infinite;
  z-index: 0;
}

#misionesderango2-game-container .mdr2-bg-layer-2 {
  background-image:
    radial-gradient(circle 18px at 350px 40px, #fffde7 60%, transparent 61%),
    radial-gradient(circle 22px at 350px 40px, rgba(255,253,231,0.3) 60%, transparent 61%);
  animation: mdr2ScrollBg2 8s linear infinite;
  z-index: 1;
  opacity: 0.5;
}

@keyframes mdr2ScrollBg {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.333%); }
}
@keyframes mdr2ScrollBg2 {
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

#misionesderango2-game-container .mdr2-hud-unit {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 150px;
}

#misionesderango2-game-container .mdr2-hud-unit.mdr2-enemy {
  flex-direction: row-reverse;
}

#misionesderango2-game-container .mdr2-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--mdr2-accent-orange, #FF6B00);
  flex-shrink: 0;
  background: linear-gradient(135deg, #FF6B00, #FF8F00);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

#misionesderango2-game-container .mdr2-avatar.mdr2-enemy-avatar {
  border-color: var(--mdr2-accent-red, #FF1744);
  background: linear-gradient(135deg, #B71C1C, #D32F2F);
}

#misionesderango2-game-container .mdr2-hp-info {
  flex: 1;
  min-width: 0;
}

#misionesderango2-game-container .mdr2-unit-name {
  font-size: 8px;
  font-weight: 900;
  color: #fff;
  text-transform: uppercase;
  text-shadow: 0 0 6px rgba(0,0,0,0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#misionesderango2-game-container .mdr2-hp-bar-container,
#misionesderango2-game-container .mdr2-chakra-bar-container {
  width: 100%;
  height: 8px;
  background: rgba(0,0,0,0.6);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 2px;
}

#misionesderango2-game-container .mdr2-hp-bar,
#misionesderango2-game-container .mdr2-chakra-bar-fill {
  height: 100%;
  transition: width 0.2s;
}

#misionesderango2-game-container .mdr2-hp-bar { background: linear-gradient(90deg, #f44336, #FF1744); }
#misionesderango2-game-container .mdr2-chakra-bar-fill { background: linear-gradient(90deg, #2196F3, #00B0FF); }

#misionesderango2-game-container .mdr2-hp-text {
  font-size: 7px;
  color: rgba(255,255,255,0.7);
  text-align: right;
}

#misionesderango2-game-container .mdr2-character {
  position: absolute;
  bottom: 70px;
  z-index: 10;
}

#misionesderango2-hero {
  left: 20px;
  width: 45px;
  height: 65px;
}

#misionesderango2-game-container .mdr2-hero-body {
  position: relative;
  width: 100%;
  height: 100%;
  animation: mdr2HeroIdle 2s ease-in-out infinite;
}

@keyframes mdr2HeroIdle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

#misionesderango2-game-container .mdr2-hero-head {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 25px;
  height: 25px;
  background: linear-gradient(135deg, #FFCC80, #FFB74D);
  border-radius: 50%;
}

#misionesderango2-game-container .mdr2-hero-headband {
  position: absolute;
  top: 5px;
  left: -2px;
  width: 29px;
  height: 7px;
  background: #1565C0;
  border-radius: 2px;
}

#misionesderango2-game-container .mdr2-hero-eyes {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  display: flex;
  justify-content: space-between;
}

#misionesderango2-game-container .mdr2-hero-eye {
  width: 4px;
  height: 4px;
  background: #1565C0;
  border-radius: 50%;
}

#misionesderango2-game-container .mdr2-hero-torso {
  position: absolute;
  top: 23px;
  left: 50%;
  transform: translateX(-50%);
  width: 22px;
  height: 20px;
  background: linear-gradient(180deg, #FF6B00, #E65100);
  border-radius: 4px;
}

#misionesderango2-game-container .mdr2-hero-legs {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 14px;
  display: flex;
  gap: 2px;
}

#misionesderango2-game-container .mdr2-hero-leg {
  flex: 1;
  background: #1565C0;
  border-radius: 0 0 3px 3px;
}

#misionesderango2-enemy {
  right: 20px;
  width: 50px;
  height: 70px;
}

#misionesderango2-game-container .mdr2-enemy-body {
  position: relative;
  width: 100%;
  height: 100%;
  animation: mdr2EnemyIdle 2.5s ease-in-out infinite;
}

@keyframes mdr2EnemyIdle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

#misionesderango2-game-container .mdr2-enemy-head {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 27px;
  height: 27px;
  background: linear-gradient(135deg, #9E9E9E, #757575);
  border-radius: 50%;
}

#misionesderango2-game-container .mdr2-enemy-eyes {
  position: absolute;
  top: 13px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  display: flex;
  justify-content: space-between;
}

#misionesderango2-game-container .mdr2-enemy-eye {
  width: 5px;
  height: 5px;
  background: #FF1744;
  border-radius: 50%;
  box-shadow: 0 0 4px #FF1744;
}

#misionesderango2-game-container .mdr2-enemy-torso {
  position: absolute;
  top: 25px;
  left: 50%;
  transform: translateX(-50%);
  width: 25px;
  height: 23px;
  background: linear-gradient(180deg, #4A148C, #311B92);
  border-radius: 4px;
}

#misionesderango2-game-container .mdr2-enemy-legs {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 14px;
  display: flex;
  gap: 2px;
}

#misionesderango2-game-container .mdr2-enemy-leg {
  flex: 1;
  background: #37474F;
  border-radius: 0 0 3px 3px;
}

#misionesderango2-game-container .mdr2-combat-text {
  position: absolute;
  z-index: 35;
  font-weight: 900;
  font-size: 18px;
  pointer-events: none;
  animation: mdr2CombatTextFloat 1s forwards;
  text-shadow: 2px 2px 0 #000;
  white-space: nowrap;
}

#misionesderango2-game-container .mdr2-combat-text.mdr2-normal { color: #FFD600; }
#misionesderango2-game-container .mdr2-combat-text.mdr2-critical { color: #FF1744; font-size: 24px; }
#misionesderango2-game-container .mdr2-combat-text.mdr2-jutsu-dmg { color: #40C4FF; font-size: 22px; }

@keyframes mdr2CombatTextFloat {
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  20% { transform: translateY(-10px) scale(1.1); opacity: 1; }
  100% { transform: translateY(-50px) scale(0.8); opacity: 0; }
}

#misionesderango2-game-container .mdr2-hit-flash {
  animation: mdr2HitFlash 0.12s steps(1) 2 !important;
}

@keyframes mdr2HitFlash {
  0% { filter: brightness(0) invert(1); }
  100% { filter: brightness(0) invert(1); }
}

#misionesderango2-game-container.mdr2-shake {
  animation: mdr2ScreenShake 0.3s;
}

@keyframes mdr2ScreenShake {
  0%,100% { transform: translate(0,0); }
  10%,30%,50%,70%,90% { transform: translate(-2px, -1px); }
  20%,40%,60%,80% { transform: translate(2px, 1px); }
}

#misionesderango2-game-container.mdr2-shake-crit {
  animation: mdr2ScreenShakeCrit 0.4s;
}

@keyframes mdr2ScreenShakeCrit {
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

#misionesderango2-jutsu-overlay.mdr2-active {
  opacity: 1;
  animation: mdr2JutsuDarken 1.8s forwards;
}

@keyframes mdr2JutsuDarken {
  0% { opacity: 0; }
  15% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}

#misionesderango2-game-container .mdr2-jutsu-name {
  font-size: 16px;
  font-weight: 900;
  color: #fff;
  text-transform: uppercase;
  text-shadow: 0 0 10px #2196F3, 2px 2px 0 #000;
  text-align: center;
}

#misionesderango2-game-container .mdr2-jutsu-kanji {
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

#misionesderango2-game-container .mdr2-log-line {
  font-size: 8px;
  color: rgba(255,255,255,0.85);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#misionesderango2-game-container .mdr2-log-line .mdr2-dmg { color: #FF1744; }
#misionesderango2-game-container .mdr2-log-line .mdr2-jutsu-text { color: #00B0FF; }

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

#misionesderango2-game-container .mdr2-projectile {
  position: absolute;
  z-index: 18;
  pointer-events: none;
}

#misionesderango2-game-container .mdr2-projectile-rasengan {
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #fff, #40C4FF, #0091EA, transparent);
  border-radius: 50%;
  box-shadow: 0 0 15px #40C4FF;
}

#misionesderango2-game-container .mdr2-projectile-katon {
  width: 25px;
  height: 25px;
  background: radial-gradient(circle, #fff, #FF6B00, #FF1744, transparent);
  border-radius: 50%;
  box-shadow: 0 0 20px #FF6B00;
}

#misionesderango2-game-container .mdr2-explosion-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid;
  animation: mdr2ExplosionRing 0.5s forwards;
}

@keyframes mdr2ExplosionRing {
  0% { width: 0; height: 0; opacity: 1; }
  100% { width: 50px; height: 50px; opacity: 0; }
}

#misionesderango2-game-container .mdr2-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  animation: mdr2ParticleBurst 0.6s forwards;
}

@keyframes mdr2ParticleBurst {
  0% { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(var(--mdr2-px), var(--mdr2-py)) scale(0); opacity: 0; }
}

#misionesderango2-game-container .mdr2-back-battle-btn {
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

#misionesderango2-game-container .mdr2-stop-battle-btn {
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
    document.head.appendChild(style);
  }

  // ============================================
  // INYECCIÓN DE HTML
  // ============================================
  function misionesderango2InjectHTML(container) {
    container.innerHTML = `
<div id="misionesderango2-game-container">

  <!-- Pantalla 1: Menú principal -->
  <div id="misionesderango2-main-menu-screen" class="mdr2-screen">
    <div id="misionesderango2-main-misiones" class="mdr2-menu-button">⚔️ MISIONES RANGO ⚔️</div>
  </div>

  <!-- Pantalla 2: Lista de Rangos -->
  <div id="misionesderango2-rank-list-screen" class="mdr2-screen mdr2-hidden">
    <div id="misionesderango2-rank-D" class="mdr2-rank-button mdr2-rank-d">📜 MISION RANGO D</div>
    <div id="misionesderango2-rank-C" class="mdr2-rank-button mdr2-rank-c">🔥 MISION RANGO C</div>
    <div id="misionesderango2-rank-B" class="mdr2-rank-button mdr2-rank-b">🌪️ MISION RANGO B</div>
    <div id="misionesderango2-rank-A" class="mdr2-rank-button mdr2-rank-a">💀 MISION RANGO A</div>
    <div id="misionesderango2-rank-S" class="mdr2-rank-button mdr2-rank-s">👑 MISION RANGO S</div>
    <div class="mdr2-back-button" id="misionesderango2-back-to-main-from-ranks">⬅️ Volver</div>
  </div>

  <!-- Pantalla 3: Misiones de un Rango -->
  <div id="misionesderango2-missions-screen" class="mdr2-screen mdr2-hidden">
    <div class="mdr2-back-button" id="misionesderango2-back-to-ranks-from-missions">⬅️ Volver a Rangos</div>
  </div>

  <!-- Pantalla 4: Batalla -->
  <div id="misionesderango2-battle-screen" class="mdr2-screen mdr2-hidden">
    <div class="mdr2-battle-container">
      <div class="mdr2-bg-layer mdr2-bg-layer-1"></div>
      <div class="mdr2-bg-layer mdr2-bg-layer-2"></div>
      <div id="misionesderango2-ground"></div>

      <div id="misionesderango2-hud">
        <div class="mdr2-hud-unit mdr2-hero">
          <div class="mdr2-avatar">🍥</div>
          <div class="mdr2-hp-info">
            <div class="mdr2-unit-name">Naruto Uzumaki</div>
            <div class="mdr2-hp-bar-container"><div class="mdr2-hp-bar" id="misionesderango2-hero-hp-bar" style="width:100%"></div></div>
            <div class="mdr2-hp-text" id="misionesderango2-hero-hp-text">200 / 200</div>
            <div class="mdr2-chakra-bar-container"><div class="mdr2-chakra-bar-fill" id="misionesderango2-chakra-bar"></div></div>
          </div>
        </div>
        <div class="mdr2-hud-unit mdr2-enemy">
          <div class="mdr2-avatar mdr2-enemy-avatar">👹</div>
          <div class="mdr2-hp-info">
            <div class="mdr2-unit-name" id="misionesderango2-enemy-name">Enemigo</div>
            <div class="mdr2-hp-bar-container"><div class="mdr2-hp-bar" id="misionesderango2-enemy-hp-bar" style="width:100%"></div></div>
            <div class="mdr2-hp-text" id="misionesderango2-enemy-hp-text">0 / 0</div>
          </div>
        </div>
      </div>

      <div id="misionesderango2-turn-indicator">⚔ Combate Iniciado</div>

      <div id="misionesderango2-hero" class="mdr2-character">
        <div class="mdr2-hero-body">
          <div class="mdr2-hero-head">
            <div class="mdr2-hero-headband"></div>
            <div class="mdr2-hero-eyes"><div class="mdr2-hero-eye"></div><div class="mdr2-hero-eye"></div></div>
          </div>
          <div class="mdr2-hero-torso"></div>
          <div class="mdr2-hero-legs"><div class="mdr2-hero-leg"></div><div class="mdr2-hero-leg"></div></div>
        </div>
      </div>

      <div id="misionesderango2-enemy" class="mdr2-character">
        <div class="mdr2-enemy-body">
          <div class="mdr2-enemy-head">
            <div class="mdr2-enemy-eyes"><div class="mdr2-enemy-eye"></div><div class="mdr2-enemy-eye"></div></div>
          </div>
          <div class="mdr2-enemy-torso"></div>
          <div class="mdr2-enemy-legs"><div class="mdr2-enemy-leg"></div><div class="mdr2-enemy-leg"></div></div>
        </div>
      </div>

      <div id="misionesderango2-jutsu-overlay">
        <div class="mdr2-jutsu-kanji" id="misionesderango2-jutsu-kanji">忍</div>
        <div class="mdr2-jutsu-name" id="misionesderango2-jutsu-name"></div>
      </div>

      <div id="misionesderango2-combat-log">
        <div class="mdr2-log-line" id="misionesderango2-log-1">⚔ ¡El combate ha comenzado!</div>
        <div class="mdr2-log-line" id="misionesderango2-log-2"></div>
      </div>

      <div class="mdr2-back-battle-btn" id="misionesderango2-back-from-battle">⬅️ Abandonar</div>
      <div class="mdr2-stop-battle-btn" id="misionesderango2-stop-battle-btn">⏹️ DETENER</div>
    </div>
  </div>

</div>
    `;
  }

  // ============================================
  // LÓGICA DEL JUEGO (todo renombrado)
  // ============================================
  function misionesderango2InitLogic(options = {}) {

    // Datos de misiones
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

    // Estado
    let misionesderango2CurrentScreen = 'main';
    let misionesderango2BattleActive = false;
    let misionesderango2PlayerStats = { hp: 200, maxHp: 200, mp: 100, maxMp: 100, atk: 25, def: 18, lvl: 1, ...options.playerStats };
    let misionesderango2CurrentEnemyMission = null;
    let misionesderango2CurrentMissionList = [];
    let misionesderango2EnemyIndex = 0;
    let misionesderango2CurrentRank = 'D';
    let misionesderango2IsJutsuActive = false;
    let misionesderango2IsHeroAttacking = false;
    let misionesderango2IsEnemyAttacking = false;
    let misionesderango2HeroAttackTimer = 0;
    let misionesderango2EnemyAttackTimer = 0;
    let misionesderango2LastTimestamp = 0;

    // Referencias DOM
    const mdr2MainScreen     = document.getElementById('misionesderango2-main-menu-screen');
    const mdr2RankScreen     = document.getElementById('misionesderango2-rank-list-screen');
    const mdr2MissionsScreen = document.getElementById('misionesderango2-missions-screen');
    const mdr2BattleScreen   = document.getElementById('misionesderango2-battle-screen');
    const mdr2GameContainer  = document.getElementById('misionesderango2-game-container');

    // Navegación
    document.getElementById('misionesderango2-main-misiones').addEventListener('click', () => {
      mdr2MainScreen.classList.add('mdr2-hidden');
      mdr2RankScreen.classList.remove('mdr2-hidden');
      misionesderango2CurrentScreen = 'ranks';
    });

    document.getElementById('misionesderango2-rank-D').addEventListener('click', () => misionesderango2ShowMissions('D'));
    document.getElementById('misionesderango2-rank-C').addEventListener('click', () => misionesderango2ShowMissions('C'));
    document.getElementById('misionesderango2-rank-B').addEventListener('click', () => misionesderango2ShowMissions('B'));
    document.getElementById('misionesderango2-rank-A').addEventListener('click', () => misionesderango2ShowMissions('A'));
    document.getElementById('misionesderango2-rank-S').addEventListener('click', () => misionesderango2ShowMissions('S'));

    document.getElementById('misionesderango2-back-to-main-from-ranks').addEventListener('click', () => {
      mdr2RankScreen.classList.add('mdr2-hidden');
      mdr2MainScreen.classList.remove('mdr2-hidden');
      misionesderango2CurrentScreen = 'main';
    });

    document.getElementById('misionesderango2-back-to-ranks-from-missions').addEventListener('click', () => {
      mdr2MissionsScreen.classList.add('mdr2-hidden');
      mdr2RankScreen.classList.remove('mdr2-hidden');
      misionesderango2CurrentScreen = 'ranks';
      misionesderango2StopBattle();
    });

    document.getElementById('misionesderango2-back-from-battle').addEventListener('click', () => misionesderango2StopBattleAndGoToMain());
    document.getElementById('misionesderango2-stop-battle-btn').addEventListener('click', () => misionesderango2StopBattleAndGoToMain());


    function misionesderango2SyncPlayerStats(nextStats = {}) {
      misionesderango2PlayerStats = { ...misionesderango2PlayerStats, ...nextStats };
      if (misionesderango2CurrentEnemyMission) misionesderango2UpdateBars();
    }

    function misionesderango2Destroy() {
      misionesderango2StopBattle();
      const root = document.getElementById('misionesderango2-game-container');
      if (root && root.parentNode) root.parentNode.removeChild(root);
    }

    window.misionesderango2SyncPlayerStats = misionesderango2SyncPlayerStats;
    window.misionesderango2Destroy = misionesderango2Destroy;

    // ---- Mostrar misiones ----
    function misionesderango2ShowMissions(rank) {
      misionesderango2CurrentRank = rank;
      const missions = misionesderango2MissionsData[rank];
      const backBtn = document.getElementById('misionesderango2-back-to-ranks-from-missions');
      mdr2MissionsScreen.innerHTML = '';

      missions.forEach((mission, index) => {
        const missionDiv = document.createElement('div');
        missionDiv.className = `mdr2-mission-item ${misionesderango2PlayerStats.lvl < mission.lvl ? 'mdr2-locked' : ''}`;
        let borderColor = '#ccc';
        switch (rank) {
          case 'D': borderColor = '#2e7d32'; break;
          case 'C': borderColor = '#0277bd'; break;
          case 'B': borderColor = '#ef6c00'; break;
          case 'A': borderColor = '#b71c1c'; break;
          case 'S': borderColor = '#4a148c'; break;
        }
        missionDiv.style.borderLeftColor = borderColor;
        missionDiv.innerHTML = `
          <div class="mdr2-mission-header">${mission.name}</div>
          <div class="mdr2-mission-details">
            <div class="mdr2-mission-left"><span>⚡ XP: ${mission.xp}</span><span>💰 Oro: ${mission.gold}</span></div>
            <div class="mdr2-mission-right"><span>❤️ HP: ${mission.hp}</span><span>⚔️ ATK: ${mission.atk}</span><span>🛡️ DEF: ${mission.def}</span></div>
          </div>
          ${misionesderango2PlayerStats.lvl < mission.lvl ? '<div class="mdr2-mission-lock">🔒 Nivel mínimo: ' + mission.lvl + '</div>' : ''}
        `;
        if (misionesderango2PlayerStats.lvl >= mission.lvl) {
          missionDiv.addEventListener('click', () => misionesderango2StartBattle(rank, index));
        } else {
          missionDiv.style.pointerEvents = 'none';
          missionDiv.style.opacity = '0.6';
        }
        mdr2MissionsScreen.appendChild(missionDiv);
      });

      mdr2MissionsScreen.appendChild(backBtn);
      mdr2RankScreen.classList.add('mdr2-hidden');
      mdr2MissionsScreen.classList.remove('mdr2-hidden');
      misionesderango2CurrentScreen = 'missions';
    }

    // ---- Batalla ----
    function misionesderango2StartBattle(rank, missionIndex) {
      misionesderango2StopBattle();
      misionesderango2CurrentMissionList = misionesderango2MissionsData[rank];
      misionesderango2EnemyIndex = missionIndex;
      misionesderango2CurrentEnemyMission = { ...misionesderango2CurrentMissionList[misionesderango2EnemyIndex] };

      misionesderango2PlayerStats.hp = misionesderango2PlayerStats.maxHp;
      misionesderango2PlayerStats.mp = misionesderango2PlayerStats.maxMp;

      document.getElementById('misionesderango2-enemy-name').textContent = misionesderango2CurrentEnemyMission.name;
      document.getElementById('misionesderango2-hero-hp-text').textContent = `${misionesderango2PlayerStats.hp}/${misionesderango2PlayerStats.maxHp}`;
      document.getElementById('misionesderango2-enemy-hp-text').textContent = `${misionesderango2CurrentEnemyMission.hp}/${misionesderango2CurrentEnemyMission.hp}`;
      misionesderango2UpdateBars();

      mdr2MissionsScreen.classList.add('mdr2-hidden');
      mdr2RankScreen.classList.add('mdr2-hidden');
      mdr2MainScreen.classList.add('mdr2-hidden');
      mdr2BattleScreen.classList.remove('mdr2-hidden');
      misionesderango2CurrentScreen = 'battle';

      document.getElementById('misionesderango2-log-1').innerHTML = '⚔ ¡El combate ha comenzado!';
      document.getElementById('misionesderango2-log-2').innerHTML = `Contra: ${misionesderango2CurrentEnemyMission.name}`;
      document.getElementById('misionesderango2-turn-indicator').textContent = '⚔ Combate Activo';

      misionesderango2BattleActive = true;
      misionesderango2HeroAttackTimer = 0;
      misionesderango2EnemyAttackTimer = 0;
      misionesderango2LastTimestamp = 0;
      requestAnimationFrame(misionesderango2BattleLoop);
    }

    function misionesderango2UpdateBars() {
      const heroPct = (misionesderango2PlayerStats.hp / misionesderango2PlayerStats.maxHp) * 100;
      const chakraPct = (misionesderango2PlayerStats.mp / misionesderango2PlayerStats.maxMp) * 100;
      document.getElementById('misionesderango2-hero-hp-bar').style.width = `${Math.max(0, heroPct)}%`;
      document.getElementById('misionesderango2-enemy-hp-bar').style.width = `${Math.max(0, (misionesderango2CurrentEnemyMission.hp / misionesderango2CurrentEnemyMission.maxHp) * 100)}%`;
      document.getElementById('misionesderango2-chakra-bar').style.width = `${chakraPct}%`;
      document.getElementById('misionesderango2-hero-hp-text').textContent = `${Math.max(0, Math.floor(misionesderango2PlayerStats.hp))}/${misionesderango2PlayerStats.maxHp}`;
      document.getElementById('misionesderango2-enemy-hp-text').textContent = `${Math.max(0, Math.floor(misionesderango2CurrentEnemyMission.hp))}/${misionesderango2CurrentEnemyMission.maxHp}`;
    }

    function misionesderango2AddLog(line1, line2) {
      if (line1 !== undefined) document.getElementById('misionesderango2-log-1').innerHTML = line1;
      if (line2 !== undefined) document.getElementById('misionesderango2-log-2').innerHTML = line2;
    }

    function misionesderango2ScreenShake(intensity = 'normal') {
      mdr2GameContainer.classList.add(intensity === 'critical' ? 'mdr2-shake-crit' : 'mdr2-shake');
      setTimeout(() => mdr2GameContainer.classList.remove(intensity === 'critical' ? 'mdr2-shake-crit' : 'mdr2-shake'), intensity === 'critical' ? 400 : 300);
    }

    function misionesderango2SpawnCombatText(target, value, type = 'normal') {
      const el = document.createElement('div');
      el.className = `mdr2-combat-text mdr2-${type}`;
      el.textContent = type === 'heal' ? `+${value}` : `-${value}`;
      const targetEl = document.getElementById(target === 'enemy' ? 'misionesderango2-enemy' : 'misionesderango2-hero');
      const rect = targetEl.getBoundingClientRect();
      const containerRect = mdr2GameContainer.getBoundingClientRect();
      el.style.left = `${rect.left - containerRect.left + rect.width / 2 + (Math.random() - 0.5) * 30}px`;
      el.style.top = `${rect.top - containerRect.top + (Math.random() - 0.5) * 20}px`;
      mdr2GameContainer.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }

    function misionesderango2HitFlash(target) {
      const el = document.getElementById(target === 'enemy' ? 'misionesderango2-enemy' : 'misionesderango2-hero');
      el.classList.add('mdr2-hit-flash');
      setTimeout(() => el.classList.remove('mdr2-hit-flash'), 150);
    }

    function misionesderango2ShowJutsuOverlay(jutsu) {
      return new Promise((resolve) => {
        const overlay = document.getElementById('misionesderango2-jutsu-overlay');
        document.getElementById('misionesderango2-jutsu-kanji').textContent = jutsu.kanji;
        document.getElementById('misionesderango2-jutsu-name').textContent = jutsu.name;
        overlay.classList.add('mdr2-active');
        setTimeout(() => {
          overlay.classList.remove('mdr2-active');
          resolve();
        }, 900);
      });
    }

    function misionesderango2AnimateProjectile(fromEl, toEl, type) {
      return new Promise((resolve) => {
        const proj = document.createElement('div');
        proj.className = `mdr2-projectile mdr2-projectile-${type}`;
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        const containerRect = mdr2GameContainer.getBoundingClientRect();
        let startX = fromRect.left - containerRect.left + fromRect.width / 2 - 10;
        let startY = fromRect.top - containerRect.top + fromRect.height / 2 - 10;
        const endX = toRect.left - containerRect.left + toRect.width / 2 - 12;
        const endY = toRect.top - containerRect.top + toRect.height / 2 - 12;
        proj.style.left = `${startX}px`;
        proj.style.top = `${startY}px`;
        mdr2GameContainer.appendChild(proj);
        let progress = 0;
        function mdr2AnimStep() {
          progress += 0.08;
          if (progress >= 1) { proj.remove(); resolve(); return; }
          const curX = startX + (endX - startX) * progress;
          const curY = startY + (endY - startY) * progress + Math.sin(progress * Math.PI) * -20;
          proj.style.left = `${curX}px`;
          proj.style.top = `${curY}px`;
          requestAnimationFrame(mdr2AnimStep);
        }
        requestAnimationFrame(mdr2AnimStep);
      });
    }

    function misionesderango2SpawnExplosion(x, y, color) {
      const exp = document.createElement('div');
      exp.style.position = 'absolute';
      exp.style.left = `${x}px`;
      exp.style.top = `${y}px`;
      const ring = document.createElement('div');
      ring.className = 'mdr2-explosion-ring';
      ring.style.borderColor = color;
      exp.appendChild(ring);
      mdr2GameContainer.appendChild(exp);
      setTimeout(() => exp.remove(), 500);
    }

    function misionesderango2SpawnParticles(x, y, color, count = 8) {
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'mdr2-particle';
        p.style.left = `${x + (Math.random() - 0.5) * 20}px`;
        p.style.top = `${y + (Math.random() - 0.5) * 20}px`;
        p.style.background = color;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 30 + 10;
        p.style.setProperty('--mdr2-px', `${Math.cos(angle) * dist}px`);
        p.style.setProperty('--mdr2-py', `${Math.sin(angle) * dist}px`);
        mdr2GameContainer.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    }

    function misionesderango2CalculateDamage(atk, def, isCrit = false, multi = 1.0) {
      let dmg = Math.max(1, Math.floor((atk * multi) - (def * 0.3) + (Math.random() * 10 - 5)));
      if (isCrit) dmg *= 2;
      return Math.floor(dmg);
    }

    async function misionesderango2HeroAttack() {
      if (!misionesderango2BattleActive || misionesderango2IsHeroAttacking || misionesderango2IsJutsuActive) return;
      misionesderango2IsHeroAttacking = true;

      const hero = document.getElementById('misionesderango2-hero');
      const enemy = document.getElementById('misionesderango2-enemy');
      hero.style.transform = `translateX(80px)`;
      await new Promise(r => setTimeout(r, 100));

      const isCrit = Math.random() < 0.15;
      const dmg = misionesderango2CalculateDamage(misionesderango2PlayerStats.atk, misionesderango2CurrentEnemyMission.def, isCrit);
      misionesderango2CurrentEnemyMission.hp = Math.max(0, misionesderango2CurrentEnemyMission.hp - dmg);
      misionesderango2UpdateBars();

      misionesderango2HitFlash('enemy');
      misionesderango2SpawnCombatText('enemy', dmg, isCrit ? 'critical' : 'normal');
      misionesderango2ScreenShake(isCrit ? 'critical' : 'normal');
      misionesderango2AddLog(`Naruto ataca — <span class="mdr2-dmg">-${dmg} Daño</span>${isCrit ? ' ¡CRÍTICO!' : ''}`);

      const enemyRect = enemy.getBoundingClientRect();
      const containerRect = mdr2GameContainer.getBoundingClientRect();
      misionesderango2SpawnParticles(enemyRect.left - containerRect.left + enemyRect.width / 2, enemyRect.top - containerRect.top + enemyRect.height / 3, isCrit ? '#FF1744' : '#FFD600', 6);

      hero.style.transform = '';
      await new Promise(r => setTimeout(r, 150));
      misionesderango2IsHeroAttacking = false;

      if (misionesderango2CurrentEnemyMission.hp <= 0) misionesderango2NextEnemy();
    }

    async function misionesderango2EnemyAttack() {
      if (!misionesderango2BattleActive || misionesderango2IsEnemyAttacking || misionesderango2CurrentEnemyMission.hp <= 0) return;
      misionesderango2IsEnemyAttacking = true;

      const enemy = document.getElementById('misionesderango2-enemy');
      enemy.style.transform = `translateX(-70px)`;
      await new Promise(r => setTimeout(r, 100));

      const dmg = misionesderango2CalculateDamage(misionesderango2CurrentEnemyMission.atk, misionesderango2PlayerStats.def);
      misionesderango2PlayerStats.hp = Math.max(0, misionesderango2PlayerStats.hp - dmg);
      misionesderango2UpdateBars();

      misionesderango2HitFlash('hero');
      misionesderango2SpawnCombatText('hero', dmg, 'normal');
      misionesderango2ScreenShake('normal');
      misionesderango2AddLog(`${misionesderango2CurrentEnemyMission.name} ataca — <span class="mdr2-dmg">-${dmg} Daño</span>`);

      const hero = document.getElementById('misionesderango2-hero');
      const heroRect = hero.getBoundingClientRect();
      const containerRect = mdr2GameContainer.getBoundingClientRect();
      misionesderango2SpawnParticles(heroRect.left - containerRect.left + heroRect.width / 2, heroRect.top - containerRect.top + heroRect.height / 3, '#FF5722', 5);

      enemy.style.transform = '';
      await new Promise(r => setTimeout(r, 150));
      misionesderango2IsEnemyAttacking = false;

      if (misionesderango2PlayerStats.hp <= 0) {
        misionesderango2BattleActive = false;
        misionesderango2AddLog(`💀 ¡Has sido derrotado!`, '🔄 Reinicia la misión');
        document.getElementById('misionesderango2-turn-indicator').textContent = '💀 Derrota';
      }
    }

    async function misionesderango2ExecuteJutsu() {
      if (!misionesderango2BattleActive || misionesderango2IsJutsuActive || misionesderango2IsHeroAttacking || misionesderango2PlayerStats.mp < misionesderango2PlayerStats.maxMp) return;
      misionesderango2IsJutsuActive = true;

      const jutsuList = [
        { name: 'Rasengan', kanji: '螺', dmgMulti: 2.5, type: 'rasengan', color: '#40C4FF' },
        { name: 'Katon: Gōkakyū', kanji: '火', dmgMulti: 3.0, type: 'katon', color: '#FF6B00' }
      ];
      const jutsu = jutsuList[Math.floor(Math.random() * jutsuList.length)];

      await misionesderango2ShowJutsuOverlay(jutsu);
      await misionesderango2AnimateProjectile(
        document.getElementById('misionesderango2-hero'),
        document.getElementById('misionesderango2-enemy'),
        jutsu.type
      );

      const dmg = misionesderango2CalculateDamage(misionesderango2PlayerStats.atk, misionesderango2CurrentEnemyMission.def, false, jutsu.dmgMulti);
      misionesderango2CurrentEnemyMission.hp = Math.max(0, misionesderango2CurrentEnemyMission.hp - dmg);
      misionesderango2UpdateBars();

      misionesderango2HitFlash('enemy');
      misionesderango2SpawnCombatText('enemy', dmg, 'jutsu-dmg');
      const enemyRect = document.getElementById('misionesderango2-enemy').getBoundingClientRect();
      const containerRect = mdr2GameContainer.getBoundingClientRect();
      misionesderango2SpawnExplosion(enemyRect.left - containerRect.left + enemyRect.width / 2, enemyRect.top - containerRect.top + enemyRect.height / 3, jutsu.color);
      misionesderango2SpawnParticles(enemyRect.left - containerRect.left + enemyRect.width / 2, enemyRect.top - containerRect.top + enemyRect.height / 3, jutsu.color, 12);
      misionesderango2ScreenShake('critical');
      misionesderango2AddLog(`✨ <span class="mdr2-jutsu-text">${jutsu.name}</span> — <span class="mdr2-dmg">-${dmg} Daño</span>`);

      misionesderango2PlayerStats.mp = 0;
      misionesderango2UpdateBars();
      await new Promise(r => setTimeout(r, 400));
      misionesderango2IsJutsuActive = false;

      if (misionesderango2CurrentEnemyMission.hp <= 0) misionesderango2NextEnemy();
    }

    function misionesderango2NextEnemy() {
      if (!misionesderango2BattleActive) return;
      misionesderango2EnemyIndex = (misionesderango2EnemyIndex + 1) % misionesderango2CurrentMissionList.length;
      misionesderango2CurrentEnemyMission = { ...misionesderango2CurrentMissionList[misionesderango2EnemyIndex] };
      document.getElementById('misionesderango2-enemy-name').textContent = misionesderango2CurrentEnemyMission.name;
      document.getElementById('misionesderango2-enemy-hp-text').textContent = `${misionesderango2CurrentEnemyMission.hp}/${misionesderango2CurrentEnemyMission.maxHp}`;
      misionesderango2UpdateBars();
      misionesderango2AddLog(`⚔️ Nuevo enemigo: ${misionesderango2CurrentEnemyMission.name}`, '');
      document.getElementById('misionesderango2-turn-indicator').textContent = '⚔ Combate Activo';
    }

    function misionesderango2BattleLoop(timestamp) {
      if (!misionesderango2BattleActive) return;
      if (!misionesderango2LastTimestamp) misionesderango2LastTimestamp = timestamp;
      const delta = Math.min(100, timestamp - misionesderango2LastTimestamp);
      misionesderango2LastTimestamp = timestamp;

      if (misionesderango2PlayerStats.hp > 0 && misionesderango2CurrentEnemyMission.hp > 0) {
        misionesderango2HeroAttackTimer += delta;
        if (misionesderango2HeroAttackTimer >= 1800 && !misionesderango2IsHeroAttacking && !misionesderango2IsJutsuActive) {
          misionesderango2HeroAttackTimer = 0;
          if (misionesderango2PlayerStats.mp >= misionesderango2PlayerStats.maxMp) {
            misionesderango2ExecuteJutsu();
          } else {
            misionesderango2HeroAttack();
          }
          misionesderango2PlayerStats.mp = Math.min(misionesderango2PlayerStats.maxMp, misionesderango2PlayerStats.mp + 5);
          misionesderango2UpdateBars();
        }

        misionesderango2EnemyAttackTimer += delta;
        if (misionesderango2EnemyAttackTimer >= 2200 && !misionesderango2IsEnemyAttacking && !misionesderango2IsJutsuActive) {
          misionesderango2EnemyAttackTimer = 0;
          misionesderango2EnemyAttack();
        }
      }

      requestAnimationFrame(misionesderango2BattleLoop);
    }

    function misionesderango2StopBattle() {
      misionesderango2BattleActive = false;
      misionesderango2IsHeroAttacking = false;
      misionesderango2IsEnemyAttacking = false;
      misionesderango2IsJutsuActive = false;
    }

    function misionesderango2StopBattleAndGoToMain() {
      misionesderango2StopBattle();
      mdr2BattleScreen.classList.add('mdr2-hidden');
      mdr2MainScreen.classList.remove('mdr2-hidden');
      mdr2RankScreen.classList.add('mdr2-hidden');
      mdr2MissionsScreen.classList.add('mdr2-hidden');
      misionesderango2CurrentScreen = 'main';
    }

    // Iniciar en pantalla principal
    mdr2MainScreen.classList.remove('mdr2-hidden');
  }

  // ============================================
  // FUNCIÓN PÚBLICA DE INICIALIZACIÓN
  // ============================================
  /**
   * misionesderango2Init(targetElement)
   * Inicializa el sistema completo en el elemento indicado.
   * Si no se pasa ninguno, lo añade al body.
   */
  window.misionesderango2Init = function (targetElement, options = {}) {
    const container = targetElement || document.body;
    const existing = document.getElementById('misionesderango2-game-container');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    misionesderango2InjectStyles();
    misionesderango2InjectHTML(container);

    const root = document.getElementById('misionesderango2-game-container');
    if (root) {
      const width = options.width || '100%';
      const height = options.height || '100%';
      root.style.setProperty('--mdr2-game-w', width);
      root.style.setProperty('--mdr2-game-h', height);
      root.style.width = width;
      root.style.height = height;
      root.style.borderRadius = options.borderRadius || '0';
      root.style.boxShadow = options.boxShadow || 'none';
    }

    misionesderango2InitLogic(options);
  };

})();
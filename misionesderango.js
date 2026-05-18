/**
 * misionesderango2.js
 * Módulo autocontenido para el sistema de Misiones y Batalla estilo Naruto Idle RPG.
 * Para usarlo en tu juego: misionesderango2.init();
 */
(function() {
  const misionesderango2_css = `
    #misionesderango2_game-container {
      width: 355px; height: 500px;
      background: linear-gradient(160deg, #111827 0%, #0a0d14 100%);
      border-radius: 20px;
      box-shadow: 0 0 0 1px rgba(255, 107, 0, 0.18), 0 0 30px rgba(255, 107, 0, 0.08), 0 10px 40px rgba(0,0,0,0.7);
      overflow: hidden; position: relative; box-sizing: border-box;
      font-family: 'Segoe UI', 'Arial Black', sans-serif;
    }
    .misionesderango2_screen {
      width: 100%; height: 100%; position: absolute; top: 0; left: 0;
      background: transparent; transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
      box-sizing: border-box; overflow-y: auto; overflow-x: hidden; padding: 10px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .misionesderango2_screen.misionesderango2_hidden {
      opacity: 0; pointer-events: none; transform: scale(0.95); display: none;
    }
    .misionesderango2_menu-button, .misionesderango2_rank-button, .misionesderango2_back-button, .misionesderango2_stop-button {
      border-radius: 30px; padding: 12px 8px; text-align: center; font-weight: bold;
      font-size: 16px; cursor: pointer; transition: all 0.1s ease; box-sizing: border-box; width: 100%; flex-shrink: 0;
    }
    .misionesderango2_menu-button:active, .misionesderango2_rank-button:active, .misionesderango2_back-button:active { transform: translateY(2px); }
    .misionesderango2_menu-button {
      background: linear-gradient(135deg, #1e2d45 0%, #162036 100%); border: 2px solid #FF6B00; color: #FF8C30;
      box-shadow: 0 4px 0 #7a3300, inset 0 1px 0 rgba(255,150,50,0.15); text-shadow: 0 0 10px rgba(255,107,0,0.5);
    }
    .misionesderango2_menu-button:active { box-shadow: none; }
    .misionesderango2_rank-d { background: linear-gradient(135deg, #0d2010 0%, #0a1a0d 100%); border: 2px solid #2e7d32; color: #4caf50; box-shadow: 0 4px 0 #1b4020, 0 0 8px rgba(46,125,50,0.2), inset 0 1px 0 rgba(100,200,100,0.1); }
    .misionesderango2_rank-c { background: linear-gradient(135deg, #0a1a2e 0%, #071525 100%); border: 2px solid #0277bd; color: #29b6f6; box-shadow: 0 4px 0 #014a75, 0 0 8px rgba(2,119,189,0.2), inset 0 1px 0 rgba(50,150,255,0.1); }
    .misionesderango2_rank-b { background: linear-gradient(135deg, #2a1800 0%, #1e1200 100%); border: 2px solid #ef6c00; color: #ffa726; box-shadow: 0 4px 0 #7a3500, 0 0 8px rgba(239,108,0,0.2), inset 0 1px 0 rgba(255,150,0,0.1); }
    .misionesderango2_rank-a { background: linear-gradient(135deg, #2a0808 0%, #1e0505 100%); border: 2px solid #b71c1c; color: #ef5350; box-shadow: 0 4px 0 #6a0e0e, 0 0 8px rgba(183,28,28,0.25), inset 0 1px 0 rgba(255,80,80,0.1); }
    .misionesderango2_rank-s { background: linear-gradient(135deg, #1e0a2e 0%, #150621 100%); border: 2px solid #7b1fa2; color: #ce93d8; box-shadow: 0 4px 0 #4a0e6e, 0 0 10px rgba(123,31,162,0.3), inset 0 1px 0 rgba(200,100,255,0.1); }
    .misionesderango2_rank-button:active { box-shadow: none; transform: translateY(4px); }
    .misionesderango2_mission-item {
      display: flex; flex-direction: column; align-items: stretch; padding: 10px 10px; border-left: 6px solid;
      border-radius: 12px; cursor: pointer; font-size: 12px; line-height: 1.4; gap: 5px; position: relative; transition: all 0.15s ease;
    }
    .misionesderango2_mission-item:not(.misionesderango2_locked):active { transform: scale(0.98); }
    .misionesderango2_missions-D .misionesderango2_mission-item { background: linear-gradient(135deg, #0d2010 0%, #091509 100%); border-color: #2e7d32; border-top: 1px solid rgba(76,175,80,0.2); border-right: 1px solid rgba(46,125,50,0.12); border-bottom: 1px solid rgba(46,125,50,0.15); box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(46,125,50,0.1); }
    .misionesderango2_missions-C .misionesderango2_mission-item { background: linear-gradient(135deg, #0a1a2e 0%, #060f1e 100%); border-color: #0277bd; border-top: 1px solid rgba(41,182,246,0.2); border-right: 1px solid rgba(2,119,189,0.12); border-bottom: 1px solid rgba(2,119,189,0.15); box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(2,119,189,0.1); }
    .misionesderango2_missions-B .misionesderango2_mission-item { background: linear-gradient(135deg, #201000 0%, #160b00 100%); border-color: #ef6c00; border-top: 1px solid rgba(255,167,38,0.2); border-right: 1px solid rgba(239,108,0,0.12); border-bottom: 1px solid rgba(239,108,0,0.15); box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(239,108,0,0.1); }
    .misionesderango2_missions-A .misionesderango2_mission-item { background: linear-gradient(135deg, #200808 0%, #160404 100%); border-color: #b71c1c; border-top: 1px solid rgba(239,83,80,0.2); border-right: 1px solid rgba(183,28,28,0.12); border-bottom: 1px solid rgba(183,28,28,0.15); box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(183,28,28,0.1); }
    .misionesderango2_missions-S .misionesderango2_mission-item { background: linear-gradient(135deg, #160a20 0%, #0e0616 100%); border-color: #7b1fa2; border-top: 1px solid rgba(206,147,216,0.2); border-right: 1px solid rgba(123,31,162,0.12); border-bottom: 1px solid rgba(123,31,162,0.15); box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 8px rgba(123,31,162,0.12); }
    .misionesderango2_mission-header { text-align: center; font-weight: 800; font-size: 13px; margin-bottom: 3px; text-transform: uppercase; color: #e8e0d0; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
    .misionesderango2_mission-details { display: flex; justify-content: space-between; font-size: 11px; }
    .misionesderango2_mission-left, .misionesderango2_mission-right { display: flex; flex-direction: column; gap: 2px; }
    .misionesderango2_mission-left span, .misionesderango2_mission-right span { background: rgba(0,0,0,0.35); color: rgba(220,210,195,0.85); padding: 2px 6px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); }
    .misionesderango2_mission-lock { text-align: center; background: rgba(150,20,20,0.3); color: #ff6b6b; border-radius: 20px; padding: 4px; font-size: 11px; font-weight: bold; border: 1px solid rgba(198,40,40,0.4); }
    .misionesderango2_locked { opacity: 0.55; filter: grayscale(0.4); }
    .misionesderango2_back-button {
      background: linear-gradient(135deg, #1a1f2e 0%, #111520 100%); border: 2px solid #37474f; color: #90a4ae;
      box-shadow: 0 3px 0 #1a2228, inset 0 1px 0 rgba(144,164,174,0.08); margin-top: 4px; font-size: 14px;
    }
    .misionesderango2_back-button:active { box-shadow: none; transform: translateY(3px); }
    #misionesderango2_battle-screen { background: transparent; padding: 0; overflow: hidden; }
    .misionesderango2_battle-container { width: 100%; height: 100%; position: relative; background: linear-gradient(180deg, #1a0a2e 0%, #16213e 25%, #0f3460 45%, #1a5c2e 60%, #2d8a4e 100%); overflow: hidden; }
    .misionesderango2_bg-layer { position: absolute; width: 300%; height: 100%; background-repeat: repeat-x; background-size: auto 100%; will-change: transform; }
    .misionesderango2_bg-layer-1 { background: linear-gradient(180deg, #1a0a2e 0%, #16213e 25%, #0f3460 45%, #1a5c2e 60%, #2d8a4e 75%, #1a4a2e 100%); animation: misionesderango2_scrollBg 12s linear infinite; z-index: 0; }
    .misionesderango2_bg-layer-2 { background-image: radial-gradient(circle 18px at 350px 40px, #fffde7 60%, transparent 61%), radial-gradient(circle 22px at 350px 40px, rgba(255,253,231,0.3) 60%, transparent 61%); animation: misionesderango2_scrollBg2 8s linear infinite; z-index: 1; opacity: 0.5; }
    @keyframes misionesderango2_scrollBg { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
    @keyframes misionesderango2_scrollBg2 { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
    #misionesderango2_ground { position: absolute; bottom: 0; left: 0; right: 0; height: 70px; background: linear-gradient(180deg, #3a5a3a 0%, #2d4a2d 20%, #1a3a1a 100%); z-index: 3; }
    #misionesderango2_hud { position: absolute; top: 0; left: 0; right: 0; z-index: 20; padding: 6px 8px; display: flex; justify-content: space-between; background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%); pointer-events: none; }
    .misionesderango2_hud-unit { display: flex; align-items: center; gap: 6px; max-width: 150px; }
    .misionesderango2_hud-unit.misionesderango2_enemy { flex-direction: row-reverse; }
    .misionesderango2_avatar { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #FF6B00; flex-shrink: 0; background: linear-gradient(135deg, #FF6B00, #FF8F00); display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .misionesderango2_avatar.misionesderango2_enemy-avatar { border-color: #FF1744; background: linear-gradient(135deg, #B71C1C, #D32F2F); }
    .misionesderango2_hp-info { flex: 1; min-width: 0; }
    .misionesderango2_unit-name { font-size: 8px; font-weight: 900; color: #fff; text-transform: uppercase; text-shadow: 0 0 6px rgba(0,0,0,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .misionesderango2_hp-bar-container, .misionesderango2_chakra-bar-container { width: 100%; height: 8px; background: rgba(0,0,0,0.6); border-radius: 4px; overflow: hidden; margin-top: 2px; }
    .misionesderango2_hp-bar, .misionesderango2_chakra-bar-fill { height: 100%; transition: width 0.2s; }
    .misionesderango2_hp-bar { background: linear-gradient(90deg, #f44336, #FF1744); }
    .misionesderango2_chakra-bar-fill { background: linear-gradient(90deg, #2196F3, #00B0FF); }
    .misionesderango2_hp-text { font-size: 7px; color: rgba(255,255,255,0.7); text-align: right; }
    .misionesderango2_character { position: absolute; bottom: 70px; z-index: 10; }
    #misionesderango2_hero { left: 20px; width: 45px; height: 65px; }
    .misionesderango2_hero-body { position: relative; width: 100%; height: 100%; animation: misionesderango2_heroIdle 2s ease-in-out infinite; }
    @keyframes misionesderango2_heroIdle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    .misionesderango2_hero-head { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 25px; height: 25px; background: linear-gradient(135deg, #FFCC80, #FFB74D); border-radius: 50%; }
    .misionesderango2_hero-headband { position: absolute; top: 5px; left: -2px; width: 29px; height: 7px; background: #1565C0; border-radius: 2px; }
    .misionesderango2_hero-eyes { position: absolute; top: 14px; left: 50%; transform: translateX(-50%); width: 16px; display: flex; justify-content: space-between; }
    .misionesderango2_hero-eye { width: 4px; height: 4px; background: #1565C0; border-radius: 50%; }
    .misionesderango2_hero-torso { position: absolute; top: 23px; left: 50%; transform: translateX(-50%); width: 22px; height: 20px; background: linear-gradient(180deg, #FF6B00, #E65100); border-radius: 4px; }
    .misionesderango2_hero-legs { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 18px; height: 14px; display: flex; gap: 2px; }
    .misionesderango2_hero-leg { flex: 1; background: #1565C0; border-radius: 0 0 3px 3px; }
    #misionesderango2_enemy { right: 20px; width: 50px; height: 70px; }
    .misionesderango2_enemy-body { position: relative; width: 100%; height: 100%; animation: misionesderango2_enemyIdle 2.5s ease-in-out infinite; }
    @keyframes misionesderango2_enemyIdle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
    .misionesderango2_enemy-head { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 27px; height: 27px; background: linear-gradient(135deg, #9E9E9E, #757575); border-radius: 50%; }
    .misionesderango2_enemy-eyes { position: absolute; top: 13px; left: 50%; transform: translateX(-50%); width: 18px; display: flex; justify-content: space-between; }
    .misionesderango2_enemy-eye { width: 5px; height: 5px; background: #FF1744; border-radius: 50%; box-shadow: 0 0 4px #FF1744; }
    .misionesderango2_enemy-torso { position: absolute; top: 25px; left: 50%; transform: translateX(-50%); width: 25px; height: 23px; background: linear-gradient(180deg, #4A148C, #311B92); border-radius: 4px; }
    .misionesderango2_enemy-legs { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 20px; height: 14px; display: flex; gap: 2px; }
    .misionesderango2_enemy-leg { flex: 1; background: #37474F; border-radius: 0 0 3px 3px; }
    .misionesderango2_combat-text { position: absolute; z-index: 35; font-weight: 900; font-size: 18px; pointer-events: none; animation: misionesderango2_combatTextFloat 1s forwards; text-shadow: 2px 2px 0 #000; white-space: nowrap; }
    .misionesderango2_combat-text.misionesderango2_normal { color: #FFD600; }
    .misionesderango2_combat-text.misionesderango2_critical { color: #FF1744; font-size: 24px; }
    .misionesderango2_combat-text.misionesderango2_jutsu-dmg { color: #40C4FF; font-size: 22px; }
    @keyframes misionesderango2_combatTextFloat { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 20% { transform: translateY(-10px) scale(1.1); opacity: 1; } 100% { transform: translateY(-50px) scale(0.8); opacity: 0; } }
    .misionesderango2_hit-flash { animation: misionesderango2_hitFlash 0.12s steps(1) 2 !important; }
    @keyframes misionesderango2_hitFlash { 0% { filter: brightness(0) invert(1); } 100% { filter: brightness(0) invert(1); } }
    .misionesderango2_shake { animation: misionesderango2_screenShake 0.3s; }
    @keyframes misionesderango2_screenShake { 0%,100% { transform: translate(0,0); } 10%,30%,50%,70%,90% { transform: translate(-2px, -1px); } 20%,40%,60%,80% { transform: translate(2px, 1px); } }
    .misionesderango2_shake-crit { animation: misionesderango2_screenShakeCrit 0.4s; }
    @keyframes misionesderango2_screenShakeCrit { 0%,100% { transform: translate(0,0); } 10%,30%,50%,70%,90% { transform: translate(-4px, -2px); } 20%,40%,60%,80% { transform: translate(4px, 2px); } }
    #misionesderango2_jutsu-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.65); z-index: 30; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; pointer-events: none; }
    #misionesderango2_jutsu-overlay.misionesderango2_active { opacity: 1; animation: misionesderango2_jutsuDarken 1.8s forwards; }
    @keyframes misionesderango2_jutsuDarken { 0% { opacity: 0; } 15% { opacity: 1; } 70% { opacity: 1; } 100% { opacity: 0; } }
    .misionesderango2_jutsu-name { font-size: 16px; font-weight: 900; color: #fff; text-transform: uppercase; text-shadow: 0 0 10px #2196F3, 2px 2px 0 #000; text-align: center; }
    .misionesderango2_jutsu-kanji { font-size: 28px; margin-bottom: 4px; }
    #misionesderango2_combat-log { position: absolute; bottom: 4px; left: 4px; right: 4px; z-index: 20; background: rgba(0,0,0,0.75); border-radius: 4px; padding: 3px 6px; max-height: 36px; overflow: hidden; pointer-events: none; }
    .misionesderango2_log-line { font-size: 8px; color: rgba(255,255,255,0.85); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .misionesderango2_log-line .misionesderango2_dmg { color: #FF1744; }
    .misionesderango2_log-line .misionesderango2_jutsu-text { color: #00B0FF; }
    #misionesderango2_turn-indicator { position: absolute; top: 38px; left: 50%; transform: translateX(-50%); z-index: 20; font-size: 7px; font-weight: 900; color: rgba(255,255,255,0.5); text-transform: uppercase; pointer-events: none; white-space: nowrap; }
    .misionesderango2_projectile { position: absolute; z-index: 18; pointer-events: none; }
    .misionesderango2_projectile-rasengan { width: 20px; height: 20px; background: radial-gradient(circle, #fff, #40C4FF, #0091EA, transparent); border-radius: 50%; box-shadow: 0 0 15px #40C4FF; }
    .misionesderango2_projectile-katon { width: 25px; height: 25px; background: radial-gradient(circle, #fff, #FF6B00, #FF1744, transparent); border-radius: 50%; box-shadow: 0 0 20px #FF6B00; }
    .misionesderango2_explosion-ring { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 50%; border: 2px solid; animation: misionesderango2_explosionRing 0.5s forwards; }
    @keyframes misionesderango2_explosionRing { 0% { width: 0; height: 0; opacity: 1; } 100% { width: 50px; height: 50px; opacity: 0; } }
    .misionesderango2_particle { position: absolute; width: 3px; height: 3px; border-radius: 50%; animation: misionesderango2_particleBurst 0.6s forwards; }
    @keyframes misionesderango2_particleBurst { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--px), var(--py)) scale(0); opacity: 0; } }
    .misionesderango2_back-battle-btn { position: absolute; top: 5px; left: 5px; z-index: 25; background: rgba(0,0,0,0.6); color: white; border: 1px solid #ff6b00; border-radius: 20px; padding: 4px 10px; font-size: 10px; cursor: pointer; pointer-events: auto; font-weight: bold; }
    .misionesderango2_stop-battle-btn { position: absolute; bottom: 45px; left: 50%; transform: translateX(-50%); z-index: 25; background: #ef5350; border: none; border-radius: 20px; padding: 6px 16px; font-size: 12px; font-weight: bold; color: white; cursor: pointer; pointer-events: auto; }
  `;

  // Inject CSS once
  if (!document.getElementById('misionesderango2_style')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'misionesderango2_style';
    styleTag.textContent = misionesderango2_css;
    document.head.appendChild(styleTag);
  }

  const misionesderango2_html = `
    <div id="misionesderango2_game-container">
      <div id="misionesderango2_main-menu-screen" class="misionesderango2_screen">
        <div id="misionesderango2_main-misiones" class="misionesderango2_menu-button">⚔️ MISIONES RANGO ⚔️</div>
      </div>
      <div id="misionesderango2_rank-list-screen" class="misionesderango2_screen misionesderango2_hidden">
        <div id="misionesderango2_rank-D" class="misionesderango2_rank-button misionesderango2_rank-d">📜 MISION RANGO D</div>
        <div id="misionesderango2_rank-C" class="misionesderango2_rank-button misionesderango2_rank-c">🔥 MISION RANGO C</div>
        <div id="misionesderango2_rank-B" class="misionesderango2_rank-button misionesderango2_rank-b">🌪️ MISION RANGO B</div>
        <div id="misionesderango2_rank-A" class="misionesderango2_rank-button misionesderango2_rank-a">💀 MISION RANGO A</div>
        <div id="misionesderango2_rank-S" class="misionesderango2_rank-button misionesderango2_rank-s">👑 MISION RANGO S</div>
        <div class="misionesderango2_back-button" id="misionesderango2_back-to-main-from-ranks">⬅️ Volver</div>
      </div>
      <div id="misionesderango2_missions-screen" class="misionesderango2_screen misionesderango2_hidden">
        <div class="misionesderango2_back-button" id="misionesderango2_back-to-ranks-from-missions">⬅️ Volver a Rangos</div>
      </div>
      <div id="misionesderango2_battle-screen" class="misionesderango2_screen misionesderango2_hidden">
        <div class="misionesderango2_battle-container">
          <div class="misionesderango2_bg-layer misionesderango2_bg-layer-1"></div>
          <div class="misionesderango2_bg-layer misionesderango2_bg-layer-2"></div>
          <div id="misionesderango2_ground"></div>
          <div id="misionesderango2_hud">
            <div class="misionesderango2_hud-unit misionesderango2_hero">
              <div class="misionesderango2_avatar">🍥</div>
              <div class="misionesderango2_hp-info">
                <div class="misionesderango2_unit-name">Naruto Uzumaki</div>
                <div class="misionesderango2_hp-bar-container"><div class="misionesderango2_hp-bar" id="misionesderango2_hero-hp-bar" style="width:100%"></div></div>
                <div class="misionesderango2_hp-text" id="misionesderango2_hero-hp-text">200 / 200</div>
                <div class="misionesderango2_chakra-bar-container"><div class="misionesderango2_chakra-bar-fill" id="misionesderango2_chakra-bar"></div></div>
              </div>
            </div>
            <div class="misionesderango2_hud-unit misionesderango2_enemy">
              <div class="misionesderango2_avatar misionesderango2_enemy-avatar">👹</div>
              <div class="misionesderango2_hp-info">
                <div class="misionesderango2_unit-name" id="misionesderango2_enemy-name">Enemigo</div>
                <div class="misionesderango2_hp-bar-container"><div class="misionesderango2_hp-bar" id="misionesderango2_enemy-hp-bar" style="width:100%"></div></div>
                <div class="misionesderango2_hp-text" id="misionesderango2_enemy-hp-text">0 / 0</div>
              </div>
            </div>
          </div>
          <div id="misionesderango2_turn-indicator">⚔ Combate Iniciado</div>
          <div id="misionesderango2_hero" class="misionesderango2_character"><div class="misionesderango2_hero-body"><div class="misionesderango2_hero-head"><div class="misionesderango2_hero-headband"></div><div class="misionesderango2_hero-eyes"><div class="misionesderango2_hero-eye"></div><div class="misionesderango2_hero-eye"></div></div></div><div class="misionesderango2_hero-torso"></div><div class="misionesderango2_hero-legs"><div class="misionesderango2_hero-leg"></div><div class="misionesderango2_hero-leg"></div></div></div></div>
          <div id="misionesderango2_enemy" class="misionesderango2_character"><div class="misionesderango2_enemy-body"><div class="misionesderango2_enemy-head"><div class="misionesderango2_enemy-eyes"><div class="misionesderango2_enemy-eye"></div><div class="misionesderango2_enemy-eye"></div></div></div><div class="misionesderango2_enemy-torso"></div><div class="misionesderango2_enemy-legs"><div class="misionesderango2_enemy-leg"></div><div class="misionesderango2_enemy-leg"></div></div></div></div>
          <div id="misionesderango2_jutsu-overlay"><div class="misionesderango2_jutsu-kanji" id="misionesderango2_jutsu-kanji">忍</div><div class="misionesderango2_jutsu-name" id="misionesderango2_jutsu-name"></div></div>
          <div id="misionesderango2_combat-log"><div class="misionesderango2_log-line" id="misionesderango2_log-1">⚔ ¡El combate ha comenzado!</div><div class="misionesderango2_log-line" id="misionesderango2_log-2"></div></div>
          <div class="misionesderango2_back-battle-btn" id="misionesderango2_back-from-battle">⬅️ Abandonar</div>
          <div class="misionesderango2_stop-battle-btn" id="misionesderango2_stop-battle-btn">⏹️ DETENER</div>
        </div>
      </div>
    </div>
  `;

  // State
  let misionesderango2_currentScreen = 'main';
  let misionesderango2_battleActive = false;
  let misionesderango2_playerStats = { hp: 200, maxHp: 200, mp: 100, maxMp: 100, atk: 25, def: 18, lvl: 1 };
  let misionesderango2_currentEnemyMission = null;
  let misionesderango2_currentMissionList = [];
  let misionesderango2_enemyIndex = 0;
  let misionesderango2_currentRank = 'D';
  let misionesderango2_isJutsuActive = false;
  let misionesderango2_isHeroAttacking = false;
  let misionesderango2_isEnemyAttacking = false;
  let misionesderango2_heroAttackTimer = 0;
  let misionesderango2_enemyAttackTimer = 0;
  let misionesderango2_lastTimestamp = 0;

  const misionesderango2_data = {
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

  // DOM refs
  let misionesderango2_mainScreen, misionesderango2_rankScreen, misionesderango2_missionsScreen, misionesderango2_battleScreen;
  const $ = (id) => document.getElementById(id);

  function misionesderango2_switchScreen(from, to) {
    from.classList.add('misionesderango2_hidden');
    to.classList.remove('misionesderango2_hidden');
  }

  function misionesderango2_showMissions(rank) {
    misionesderango2_currentRank = rank;
    const missions = misionesderango2_data[rank];
    const backBtn = misionesderango2_rankScreen.querySelector('#misionesderango2_back-to-ranks-from-missions').cloneNode(true);
    misionesderango2_missionsScreen.innerHTML = '';
    misionesderango2_missionsScreen.className = `misionesderango2_screen misionesderango2_missions-${rank}`;

    missions.forEach((mission, index) => {
      const missionDiv = document.createElement('div');
      missionDiv.className = `misionesderango2_mission-item ${misionesderango2_playerStats.lvl < mission.lvl ? 'misionesderango2_locked' : ''}`;
      missionDiv.innerHTML = `
        <div class="misionesderango2_mission-header">${mission.name}</div>
        <div class="misionesderango2_mission-details">
          <div class="misionesderango2_mission-left"><span>⚡ XP: ${mission.xp}</span><span>💰 Oro: ${mission.gold}</span></div>
          <div class="misionesderango2_mission-right"><span>❤️ HP: ${mission.hp}</span><span>⚔️ ATK: ${mission.atk}</span><span>🛡️ DEF: ${mission.def}</span></div>
        </div>
        ${misionesderango2_playerStats.lvl < mission.lvl ? '<div class="misionesderango2_mission-lock">🔒 Nivel mínimo: ' + mission.lvl + '</div>' : ''}
      `;
      if (misionesderango2_playerStats.lvl >= mission.lvl) {
        missionDiv.addEventListener('click', () => misionesderango2_startBattle(rank, index));
      } else {
        missionDiv.style.pointerEvents = 'none';
      }
      misionesderango2_missionsScreen.appendChild(missionDiv);
    });
    misionesderango2_missionsScreen.appendChild(backBtn);
    
    misionesderango2_switchScreen(misionesderango2_rankScreen, misionesderango2_missionsScreen);
    misionesderango2_currentScreen = 'missions';
  }

  function misionesderango2_startBattle(rank, missionIndex) {
    misionesderango2_stopBattle();
    misionesderango2_currentMissionList = misionesderango2_data[rank];
    misionesderango2_enemyIndex = missionIndex;
    misionesderango2_currentEnemyMission = { ...misionesderango2_currentMissionList[misionesderango2_enemyIndex] };
    misionesderango2_currentEnemyMission.maxHp = misionesderango2_currentEnemyMission.hp;

    misionesderango2_playerStats.hp = misionesderango2_playerStats.maxHp;
    misionesderango2_playerStats.mp = misionesderango2_playerStats.maxMp;

    $('#misionesderango2_enemy-name').textContent = misionesderango2_currentEnemyMission.name;
    $('#misionesderango2_hero-hp-text').textContent = `${misionesderango2_playerStats.hp}/${misionesderango2_playerStats.maxHp}`;
    $('#misionesderango2_enemy-hp-text').textContent = `${misionesderango2_currentEnemyMission.hp}/${misionesderango2_currentEnemyMission.hp}`;
    misionesderango2_updateBars();

    [misionesderango2_mainScreen, misionesderango2_rankScreen, misionesderango2_missionsScreen].forEach(s => s.classList.add('misionesderango2_hidden'));
    misionesderango2_battleScreen.classList.remove('misionesderango2_hidden');
    misionesderango2_currentScreen = 'battle';

    $('#misionesderango2_log-1').innerHTML = '⚔ ¡El combate ha comenzado!';
    $('#misionesderango2_log-2').innerHTML = `Contra: ${misionesderango2_currentEnemyMission.name}`;
    $('#misionesderango2_turn-indicator').textContent = '⚔ Combate Activo';

    misionesderango2_battleActive = true;
    misionesderango2_heroAttackTimer = 0;
    misionesderango2_enemyAttackTimer = 0;
    misionesderango2_lastTimestamp = 0;
    requestAnimationFrame(misionesderango2_battleLoop);
  }

  function misionesderango2_updateBars() {
    const heroPct = (misionesderango2_playerStats.hp / misionesderango2_playerStats.maxHp) * 100;
    const enemyPct = (misionesderango2_currentEnemyMission.hp / misionesderango2_currentEnemyMission.maxHp) * 100;
    const chakraPct = (misionesderango2_playerStats.mp / misionesderango2_playerStats.maxMp) * 100;
    $('#misionesderango2_hero-hp-bar').style.width = `${Math.max(0, heroPct)}%`;
    $('#misionesderango2_enemy-hp-bar').style.width = `${Math.max(0, enemyPct)}%`;
    $('#misionesderango2_chakra-bar').style.width = `${chakraPct}%`;
    $('#misionesderango2_hero-hp-text').textContent = `${Math.max(0, Math.floor(misionesderango2_playerStats.hp))}/${misionesderango2_playerStats.maxHp}`;
    $('#misionesderango2_enemy-hp-text').textContent = `${Math.max(0, Math.floor(misionesderango2_currentEnemyMission.hp))}/${misionesderango2_currentEnemyMission.maxHp}`;
  }

  function misionesderango2_addLog(line1, line2) {
    if (line1 !== undefined) $('#misionesderango2_log-1').innerHTML = line1;
    if (line2 !== undefined) $('#misionesderango2_log-2').innerHTML = line2;
  }

  function misionesderango2_screenShake(intensity = 'normal') {
    const container = $('#misionesderango2_game-container');
    const cls = intensity === 'critical' ? 'misionesderango2_shake-crit' : 'misionesderango2_shake';
    container.classList.add(cls);
    setTimeout(() => container.classList.remove(cls), intensity === 'critical' ? 400 : 300);
  }

  function misionesderango2_spawnCombatText(target, value, type = 'normal') {
    const el = document.createElement('div');
    el.className = `misionesderango2_combat-text misionesderango2_${type}`;
    el.textContent = type === 'heal' ? `+${value}` : `-${value}`;
    const targetEl = $(target === 'enemy' ? 'misionesderango2_enemy' : 'misionesderango2_hero');
    const rect = targetEl.getBoundingClientRect();
    const containerRect = $('#misionesderango2_game-container').getBoundingClientRect();
    el.style.left = `${rect.left - containerRect.left + rect.width / 2 + (Math.random() - 0.5) * 30}px`;
    el.style.top = `${rect.top - containerRect.top + (Math.random() - 0.5) * 20}px`;
    $('#misionesderango2_game-container').appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function misionesderango2_hitFlash(target) {
    const el = $(target === 'enemy' ? 'misionesderango2_enemy' : 'misionesderango2_hero');
    el.classList.add('misionesderango2_hit-flash');
    setTimeout(() => el.classList.remove('misionesderango2_hit-flash'), 150);
  }

  function misionesderango2_showJutsuOverlay(jutsu) {
    return new Promise((resolve) => {
      const overlay = $('#misionesderango2_jutsu-overlay');
      $('#misionesderango2_jutsu-kanji').textContent = jutsu.kanji;
      $('#misionesderango2_jutsu-name').textContent = jutsu.name;
      overlay.classList.add('misionesderango2_active');
      setTimeout(resolve, 900);
    });
  }

  function misionesderango2_animateProjectile(fromEl, toEl, type) {
    return new Promise((resolve) => {
      const container = $('#misionesderango2_game-container');
      const proj = document.createElement('div');
      proj.className = `misionesderango2_projectile misionesderango2_projectile-${type}`;
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

  function misionesderango2_spawnExplosion(x, y, color) {
    const container = $('#misionesderango2_game-container');
    const exp = document.createElement('div');
    exp.style.position = 'absolute';
    exp.style.left = `${x}px`;
    exp.style.top = `${y}px`;
    const ring = document.createElement('div');
    ring.className = 'misionesderango2_explosion-ring';
    ring.style.borderColor = color;
    exp.appendChild(ring);
    container.appendChild(exp);
    setTimeout(() => exp.remove(), 500);
  }

  function misionesderango2_spawnParticles(x, y, color, count = 8) {
    const container = $('#misionesderango2_game-container');
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'misionesderango2_particle';
      p.style.left = `${x + (Math.random() - 0.5) * 20}px`;
      p.style.top = `${y + (Math.random() - 0.5) * 20}px`;
      p.style.background = color;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 30 + 10;
      p.style.setProperty('--px', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--py', `${Math.sin(angle) * dist}px`);
      container.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  function misionesderango2_calculateDamage(atk, def, isCrit = false, multi = 1.0) {
    let dmg = Math.max(1, Math.floor((atk * multi) - (def * 0.3) + (Math.random() * 10 - 5)));
    if (isCrit) dmg *= 2;
    return Math.floor(dmg);
  }

  async function misionesderango2_heroAttack() {
    if (!misionesderango2_battleActive || misionesderango2_isHeroAttacking || misionesderango2_isJutsuActive) return;
    misionesderango2_isHeroAttacking = true;
    const hero = $('#misionesderango2_hero');
    const enemy = $('#misionesderango2_enemy');
    hero.style.transform = `translateX(80px)`;
    await new Promise(r => setTimeout(r, 100));
    const isCrit = Math.random() < 0.15;
    const dmg = misionesderango2_calculateDamage(misionesderango2_playerStats.atk, misionesderango2_currentEnemyMission.def, isCrit);
    misionesderango2_currentEnemyMission.hp = Math.max(0, misionesderango2_currentEnemyMission.hp - dmg);
    misionesderango2_updateBars();
    misionesderango2_hitFlash('enemy');
    misionesderango2_spawnCombatText('enemy', dmg, isCrit ? 'critical' : 'normal');
    misionesderango2_screenShake(isCrit ? 'critical' : 'normal');
    misionesderango2_addLog(`Naruto ataca — <span class="misionesderango2_dmg">-${dmg} Daño</span>${isCrit ? ' ¡CRÍTICO!' : ''}`);
    const enemyRect = enemy.getBoundingClientRect();
    const containerRect = $('#misionesderango2_game-container').getBoundingClientRect();
    misionesderango2_spawnParticles(enemyRect.left - containerRect.left + enemyRect.width/2, enemyRect.top - containerRect.top + enemyRect.height/3, isCrit ? '#FF1744' : '#FFD600', 6);
    hero.style.transform = '';
    await new Promise(r => setTimeout(r, 150));
    misionesderango2_isHeroAttacking = false;
    if (misionesderango2_currentEnemyMission.hp <= 0) misionesderango2_nextEnemy();
  }

  async function misionesderango2_enemyAttack() {
    if (!misionesderango2_battleActive || misionesderango2_isEnemyAttacking || misionesderango2_currentEnemyMission.hp <= 0) return;
    misionesderango2_isEnemyAttacking = true;
    const enemy = $('#misionesderango2_enemy');
    enemy.style.transform = `translateX(-70px)`;
    await new Promise(r => setTimeout(r, 100));
    const dmg = misionesderango2_calculateDamage(misionesderango2_currentEnemyMission.atk, misionesderango2_playerStats.def);
    misionesderango2_playerStats.hp = Math.max(0, misionesderango2_playerStats.hp - dmg);
    misionesderango2_updateBars();
    misionesderango2_hitFlash('hero');
    misionesderango2_spawnCombatText('hero', dmg, 'normal');
    misionesderango2_screenShake('normal');
    misionesderango2_addLog(`${misionesderango2_currentEnemyMission.name} ataca — <span class="misionesderango2_dmg">-${dmg} Daño</span>`);
    const hero = $('#misionesderango2_hero');
    const heroRect = hero.getBoundingClientRect();
    const containerRect = $('#misionesderango2_game-container').getBoundingClientRect();
    misionesderango2_spawnParticles(heroRect.left - containerRect.left + heroRect.width/2, heroRect.top - containerRect.top + heroRect.height/3, '#FF5722', 5);
    enemy.style.transform = '';
    await new Promise(r => setTimeout(r, 150));
    misionesderango2_isEnemyAttacking = false;
    if (misionesderango2_playerStats.hp <= 0) {
      misionesderango2_battleActive = false;
      misionesderango2_addLog(`💀 ¡Has sido derrotado!`, '🔄 Reinicia la misión');
      $('#misionesderango2_turn-indicator').textContent = '💀 Derrota';
    }
  }

  async function misionesderango2_executeJutsu() {
    if (!misionesderango2_battleActive || misionesderango2_isJutsuActive || misionesderango2_isHeroAttacking || misionesderango2_playerStats.mp < misionesderango2_playerStats.maxMp) return;
    misionesderango2_isJutsuActive = true;
    const jutsuList = [
      { name: 'Rasengan', kanji: '螺', dmgMulti: 2.5, type: 'rasengan', color: '#40C4FF' },
      { name: 'Katon: Gōkakyū', kanji: '火', dmgMulti: 3.0, type: 'katon', color: '#FF6B00' }
    ];
    const jutsu = jutsuList[Math.floor(Math.random() * jutsuList.length)];
    await misionesderango2_showJutsuOverlay(jutsu);
    await misionesderango2_animateProjectile($('#misionesderango2_hero'), $('#misionesderango2_enemy'), jutsu.type);
    const dmg = misionesderango2_calculateDamage(misionesderango2_playerStats.atk, misionesderango2_currentEnemyMission.def, false, jutsu.dmgMulti);
    misionesderango2_currentEnemyMission.hp = Math.max(0, misionesderango2_currentEnemyMission.hp - dmg);
    misionesderango2_updateBars();
    misionesderango2_hitFlash('enemy');
    misionesderango2_spawnCombatText('enemy', dmg, 'jutsu-dmg');
    const enemyRect = $('#misionesderango2_enemy').getBoundingClientRect();
    const containerRect = $('#misionesderango2_game-container').getBoundingClientRect();
    misionesderango2_spawnExplosion(enemyRect.left - containerRect.left + enemyRect.width/2, enemyRect.top - containerRect.top + enemyRect.height/3, jutsu.color);
    misionesderango2_spawnParticles(enemyRect.left - containerRect.left + enemyRect.width/2, enemyRect.top - containerRect.top + enemyRect.height/3, jutsu.color, 12);
    misionesderango2_screenShake('critical');
    misionesderango2_addLog(`✨ <span class="misionesderango2_jutsu-text">${jutsu.name}</span> — <span class="misionesderango2_dmg">-${dmg} Daño</span>`);
    misionesderango2_playerStats.mp = 0;
    misionesderango2_updateBars();
    await new Promise(r => setTimeout(r, 400));
    misionesderango2_isJutsuActive = false;
    if (misionesderango2_currentEnemyMission.hp <= 0) misionesderango2_nextEnemy();
  }

  function misionesderango2_nextEnemy() {
    if (!misionesderango2_battleActive) return;
    misionesderango2_enemyIndex = (misionesderango2_enemyIndex + 1) % misionesderango2_currentMissionList.length;
    misionesderango2_currentEnemyMission = { ...misionesderango2_currentMissionList[misionesderango2_enemyIndex] };
    misionesderango2_currentEnemyMission.maxHp = misionesderango2_currentEnemyMission.hp;
    $('#misionesderango2_enemy-name').textContent = misionesderango2_currentEnemyMission.name;
    $('#misionesderango2_enemy-hp-text').textContent = `${misionesderango2_currentEnemyMission.hp}/${misionesderango2_currentEnemyMission.maxHp}`;
    misionesderango2_updateBars();
    misionesderango2_addLog(`⚔️ Nuevo enemigo: ${misionesderango2_currentEnemyMission.name}`, '');
    $('#misionesderango2_turn-indicator').textContent = '⚔ Combate Activo';
  }

  function misionesderango2_battleLoop(timestamp) {
    if (!misionesderango2_battleActive) return;
    if (!misionesderango2_lastTimestamp) misionesderango2_lastTimestamp = timestamp;
    const delta = Math.min(100, timestamp - misionesderango2_lastTimestamp);
    misionesderango2_lastTimestamp = timestamp;
    if (misionesderango2_playerStats.hp > 0 && misionesderango2_currentEnemyMission.hp > 0) {
      misionesderango2_heroAttackTimer += delta;
      if (misionesderango2_heroAttackTimer >= 1800 && !misionesderango2_isHeroAttacking && !misionesderango2_isJutsuActive) {
        misionesderango2_heroAttackTimer = 0;
        if (misionesderango2_playerStats.mp >= misionesderango2_playerStats.maxMp) {
          misionesderango2_executeJutsu();
        } else {
          misionesderango2_heroAttack();
        }
        misionesderango2_playerStats.mp = Math.min(misionesderango2_playerStats.maxMp, misionesderango2_playerStats.mp + 5);
        misionesderango2_updateBars();
      }
      misionesderango2_enemyAttackTimer += delta;
      if (misionesderango2_enemyAttackTimer >= 2200 && !misionesderango2_isEnemyAttacking && !misionesderango2_isJutsuActive) {
        misionesderango2_enemyAttackTimer = 0;
        misionesderango2_enemyAttack();
      }
    }
    requestAnimationFrame(misionesderango2_battleLoop);
  }

  function misionesderango2_stopBattle() {
    misionesderango2_battleActive = false;
    misionesderango2_isHeroAttacking = false;
    misionesderango2_isEnemyAttacking = false;
    misionesderango2_isJutsuActive = false;
  }

  function misionesderango2_stopBattleAndGoToMain() {
    misionesderango2_stopBattle();
    [misionesderango2_battleScreen, misionesderango2_rankScreen, misionesderango2_missionsScreen].forEach(s => s.classList.add('misionesderango2_hidden'));
    misionesderango2_mainScreen.classList.remove('misionesderango2_hidden');
    misionesderango2_currentScreen = 'main';
  }

  window.misionesderango2 = {
    init: function() {
      if ($('#misionesderango2_game-container')) return;
      
      const wrapper = document.createElement('div');
      wrapper.innerHTML = misionesderango2_html;
      document.body.appendChild(wrapper);

      misionesderango2_mainScreen = $('#misionesderango2_main-menu-screen');
      misionesderango2_rankScreen = $('#misionesderango2_rank-list-screen');
      misionesderango2_missionsScreen = $('#misionesderango2_missions-screen');
      misionesderango2_battleScreen = $('#misionesderango2_battle-screen');

      $('#misionesderango2_main-misiones').addEventListener('click', () => {
        misionesderango2_switchScreen(misionesderango2_mainScreen, misionesderango2_rankScreen);
        misionesderango2_currentScreen = 'ranks';
      });

      $('#misionesderango2_rank-D').addEventListener('click', () => misionesderango2_showMissions('D'));
      $('#misionesderango2_rank-C').addEventListener('click', () => misionesderango2_showMissions('C'));
      $('#misionesderango2_rank-B').addEventListener('click', () => misionesderango2_showMissions('B'));
      $('#misionesderango2_rank-A').addEventListener('click', () => misionesderango2_showMissions('A'));
      $('#misionesderango2_rank-S').addEventListener('click', () => misionesderango2_showMissions('S'));

      $('#misionesderango2_back-to-main-from-ranks').addEventListener('click', () => {
        misionesderango2_switchScreen(misionesderango2_rankScreen, misionesderango2_mainScreen);
        misionesderango2_currentScreen = 'main';
      });

      $('#misionesderango2_back-to-ranks-from-missions').addEventListener('click', () => {
        misionesderango2_switchScreen(misionesderango2_missionsScreen, misionesderango2_rankScreen);
        misionesderango2_currentScreen = 'ranks';
        misionesderango2_stopBattle();
      });

      $('#misionesderango2_back-from-battle').addEventListener('click', misionesderango2_stopBattleAndGoToMain);
      $('#misionesderango2_stop-battle-btn').addEventListener('click', misionesderango2_stopBattleAndGoToMain);
    }
  };
})();
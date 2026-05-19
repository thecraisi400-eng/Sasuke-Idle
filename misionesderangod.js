// ============================================================
// misionesderango.js - Sistema de Misiones de Rango
// Todos los identificadores usan el prefijo "misionesderangod2"
// para evitar conflictos con otros scripts del juego.
// ============================================================

(function () {
  // ── Estilos ────────────────────────────────────────────────
  const misionesderangod2StyleId = 'misionesderangod2-styles';
  if (!document.getElementById(misionesderangod2StyleId)) {
    const misionesderangod2Style = document.createElement('style');
    misionesderangod2Style.id = misionesderangod2StyleId;
    misionesderangod2Style.textContent = `
      #misionesderangod2-game-container {
        width: 355px;
        height: 500px;
        background: linear-gradient(160deg, #111827 0%, #0a0d14 100%);
        border-radius: 20px;
        box-shadow:
          0 0 0 1px rgba(255, 107, 0, 0.18),
          0 0 30px rgba(255, 107, 0, 0.08),
          0 10px 40px rgba(0,0,0,0.7);
        overflow: hidden;
        position: relative;
        box-sizing: border-box;
        font-family: 'Segoe UI', 'Arial Black', sans-serif;
      }

      .misionesderangod2-screen {
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

      .misionesderangod2-screen.misionesderangod2-hidden {
        opacity: 0;
        pointer-events: none;
        transform: scale(0.95);
        display: none;
      }

      .misionesderangod2-menu-button,
      .misionesderangod2-rank-button,
      .misionesderangod2-back-button {
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
      }

      .misionesderangod2-menu-button:active,
      .misionesderangod2-rank-button:active,
      .misionesderangod2-back-button:active {
        transform: translateY(2px);
      }

      .misionesderangod2-menu-button {
        background: linear-gradient(135deg, #1e2d45 0%, #162036 100%);
        border: 2px solid #FF6B00;
        color: #FF8C30;
        box-shadow: 0 4px 0 #7a3300, inset 0 1px 0 rgba(255,150,50,0.15);
        text-shadow: 0 0 10px rgba(255,107,0,0.5);
      }
      .misionesderangod2-menu-button:active {
        box-shadow: none;
      }

      .misionesderangod2-rank-d {
        background: linear-gradient(135deg, #0d2010 0%, #0a1a0d 100%);
        border: 2px solid #2e7d32;
        color: #4caf50;
        box-shadow: 0 4px 0 #1b4020, 0 0 8px rgba(46,125,50,0.2), inset 0 1px 0 rgba(100,200,100,0.1);
      }
      .misionesderangod2-rank-c {
        background: linear-gradient(135deg, #0a1a2e 0%, #071525 100%);
        border: 2px solid #0277bd;
        color: #29b6f6;
        box-shadow: 0 4px 0 #014a75, 0 0 8px rgba(2,119,189,0.2), inset 0 1px 0 rgba(50,150,255,0.1);
      }
      .misionesderangod2-rank-b {
        background: linear-gradient(135deg, #2a1800 0%, #1e1200 100%);
        border: 2px solid #ef6c00;
        color: #ffa726;
        box-shadow: 0 4px 0 #7a3500, 0 0 8px rgba(239,108,0,0.2), inset 0 1px 0 rgba(255,150,0,0.1);
      }
      .misionesderangod2-rank-a {
        background: linear-gradient(135deg, #2a0808 0%, #1e0505 100%);
        border: 2px solid #b71c1c;
        color: #ef5350;
        box-shadow: 0 4px 0 #6a0e0e, 0 0 8px rgba(183,28,28,0.25), inset 0 1px 0 rgba(255,80,80,0.1);
      }
      .misionesderangod2-rank-s {
        background: linear-gradient(135deg, #1e0a2e 0%, #150621 100%);
        border: 2px solid #7b1fa2;
        color: #ce93d8;
        box-shadow: 0 4px 0 #4a0e6e, 0 0 10px rgba(123,31,162,0.3), inset 0 1px 0 rgba(200,100,255,0.1);
      }

      .misionesderangod2-rank-button:active {
        box-shadow: none;
        transform: translateY(4px);
      }

      .misionesderangod2-mission-item {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: 10px 10px;
        border-left: 6px solid;
        border-radius: 12px;
        cursor: pointer;
        font-size: 12px;
        line-height: 1.4;
        gap: 5px;
        position: relative;
        transition: all 0.15s ease;
      }

      .misionesderangod2-mission-item:not(.misionesderangod2-locked):active {
        transform: scale(0.98);
      }

      .misionesderangod2-missions-D .misionesderangod2-mission-item {
        background: linear-gradient(135deg, #0d2010 0%, #091509 100%);
        border-color: #2e7d32;
        border-top: 1px solid rgba(76,175,80,0.2);
        border-right: 1px solid rgba(76,175,80,0.12);
        border-bottom: 1px solid rgba(46,125,50,0.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(46,125,50,0.1);
      }
      .misionesderangod2-missions-C .misionesderangod2-mission-item {
        background: linear-gradient(135deg, #0a1a2e 0%, #060f1e 100%);
        border-color: #0277bd;
        border-top: 1px solid rgba(41,182,246,0.2);
        border-right: 1px solid rgba(2,119,189,0.12);
        border-bottom: 1px solid rgba(2,119,189,0.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(2,119,189,0.1);
      }
      .misionesderangod2-missions-B .misionesderangod2-mission-item {
        background: linear-gradient(135deg, #201000 0%, #160b00 100%);
        border-color: #ef6c00;
        border-top: 1px solid rgba(255,167,38,0.2);
        border-right: 1px solid rgba(239,108,0,0.12);
        border-bottom: 1px solid rgba(239,108,0,0.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(239,108,0,0.1);
      }
      .misionesderangod2-missions-A .misionesderangod2-mission-item {
        background: linear-gradient(135deg, #200808 0%, #160404 100%);
        border-color: #b71c1c;
        border-top: 1px solid rgba(239,83,80,0.2);
        border-right: 1px solid rgba(183,28,28,0.12);
        border-bottom: 1px solid rgba(183,28,28,0.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(183,28,28,0.1);
      }
      .misionesderangod2-missions-S .misionesderangod2-mission-item {
        background: linear-gradient(135deg, #160a20 0%, #0e0616 100%);
        border-color: #7b1fa2;
        border-top: 1px solid rgba(206,147,216,0.2);
        border-right: 1px solid rgba(123,31,162,0.12);
        border-bottom: 1px solid rgba(123,31,162,0.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 8px rgba(123,31,162,0.12);
      }

      .misionesderangod2-mission-header {
        text-align: center;
        font-weight: 800;
        font-size: 13px;
        margin-bottom: 3px;
        text-transform: uppercase;
        color: #e8e0d0;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
      }

      .misionesderangod2-mission-details {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
      }

      .misionesderangod2-mission-left,
      .misionesderangod2-mission-right {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .misionesderangod2-mission-left span,
      .misionesderangod2-mission-right span {
        background: rgba(0,0,0,0.35);
        color: rgba(220,210,195,0.85);
        padding: 2px 6px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.06);
      }

      .misionesderangod2-mission-lock {
        text-align: center;
        background: rgba(150,20,20,0.3);
        color: #ff6b6b;
        border-radius: 20px;
        padding: 4px;
        font-size: 11px;
        font-weight: bold;
        border: 1px solid rgba(198,40,40,0.4);
      }

      .misionesderangod2-locked {
        opacity: 0.55;
        filter: grayscale(0.4);
      }

      .misionesderangod2-back-button {
        background: linear-gradient(135deg, #1a1f2e 0%, #111520 100%);
        border: 2px solid #37474f;
        color: #90a4ae;
        box-shadow: 0 3px 0 #1a2228, inset 0 1px 0 rgba(144,164,174,0.08);
        margin-top: 4px;
        font-size: 14px;
      }
      .misionesderangod2-back-button:active {
        box-shadow: none;
        transform: translateY(3px);
      }
    `;
    document.head.appendChild(misionesderangod2Style);
  }

  // ── HTML ───────────────────────────────────────────────────
  const misionesderangod2Container = document.createElement('div');
  misionesderangod2Container.id = 'misionesderangod2-game-container';
  misionesderangod2Container.innerHTML = `
    <!-- Pantalla 1: Menú principal -->
    <div id="misionesderangod2-main-menu-screen" class="misionesderangod2-screen">
      <div id="misionesderangod2-main-btn" class="misionesderangod2-menu-button">⚔️ MISIONES RANGO ⚔️</div>
    </div>

    <!-- Pantalla 2: Lista de Rangos -->
    <div id="misionesderangod2-rank-list-screen" class="misionesderangod2-screen misionesderangod2-hidden">
      <div id="misionesderangod2-rank-D" class="misionesderangod2-rank-button misionesderangod2-rank-d">📜 MISION RANGO D</div>
      <div id="misionesderangod2-rank-C" class="misionesderangod2-rank-button misionesderangod2-rank-c">🔥 MISION RANGO C</div>
      <div id="misionesderangod2-rank-B" class="misionesderangod2-rank-button misionesderangod2-rank-b">🌪️ MISION RANGO B</div>
      <div id="misionesderangod2-rank-A" class="misionesderangod2-rank-button misionesderangod2-rank-a">💀 MISION RANGO A</div>
      <div id="misionesderangod2-rank-S" class="misionesderangod2-rank-button misionesderangod2-rank-s">👑 MISION RANGO S</div>
      <div class="misionesderangod2-back-button" id="misionesderangod2-back-ranks-to-main">⬅️ Volver</div>
    </div>

    <!-- Pantalla 3: Misiones del Rango seleccionado -->
    <div id="misionesderangod2-missions-screen" class="misionesderangod2-screen misionesderangod2-hidden">
      <div class="misionesderangod2-back-button" id="misionesderangod2-back-missions-to-ranks">⬅️ Volver a Rangos</div>
    </div>
  `;

  // Insertar el contenedor en el body (o en el elemento que elijas)
  document.body.appendChild(misionesderangod2Container);

  // ── Datos ──────────────────────────────────────────────────
  const misionesderangod2Data = {
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

  // ── Estado ─────────────────────────────────────────────────
  let misionesderangod2CurrentScreen = 'main';
  let misionesderangod2PlayerStats = { lvl: 1 };
  let misionesderangod2CurrentRank = 'D';

  // ── Referencias DOM ────────────────────────────────────────
  const misionesderangod2MainScreen     = document.getElementById('misionesderangod2-main-menu-screen');
  const misionesderangod2RankScreen     = document.getElementById('misionesderangod2-rank-list-screen');
  const misionesderangod2MissionsScreen = document.getElementById('misionesderangod2-missions-screen');

  // ── Eventos ────────────────────────────────────────────────
  document.getElementById('misionesderangod2-main-btn').addEventListener('click', () => {
    misionesderangod2MainScreen.classList.add('misionesderangod2-hidden');
    misionesderangod2RankScreen.classList.remove('misionesderangod2-hidden');
    misionesderangod2CurrentScreen = 'ranks';
  });

  document.getElementById('misionesderangod2-rank-D').addEventListener('click', () => misionesderangod2ShowMissions('D'));
  document.getElementById('misionesderangod2-rank-C').addEventListener('click', () => misionesderangod2ShowMissions('C'));
  document.getElementById('misionesderangod2-rank-B').addEventListener('click', () => misionesderangod2ShowMissions('B'));
  document.getElementById('misionesderangod2-rank-A').addEventListener('click', () => misionesderangod2ShowMissions('A'));
  document.getElementById('misionesderangod2-rank-S').addEventListener('click', () => misionesderangod2ShowMissions('S'));

  document.getElementById('misionesderangod2-back-ranks-to-main').addEventListener('click', () => {
    misionesderangod2RankScreen.classList.add('misionesderangod2-hidden');
    misionesderangod2MainScreen.classList.remove('misionesderangod2-hidden');
    misionesderangod2CurrentScreen = 'main';
  });

  document.getElementById('misionesderangod2-back-missions-to-ranks').addEventListener('click', () => {
    misionesderangod2MissionsScreen.classList.add('misionesderangod2-hidden');
    misionesderangod2RankScreen.classList.remove('misionesderangod2-hidden');
    misionesderangod2CurrentScreen = 'ranks';
  });

  // ── Función principal ──────────────────────────────────────
  function misionesderangod2ShowMissions(rank) {
    misionesderangod2CurrentRank = rank;
    const misionesderangod2Missions = misionesderangod2Data[rank];
    const misionesderangod2BackBtn = document.getElementById('misionesderangod2-back-missions-to-ranks');

    misionesderangod2MissionsScreen.innerHTML = '';
    misionesderangod2MissionsScreen.className =
      `misionesderangod2-screen misionesderangod2-missions-${rank}`;

    misionesderangod2Missions.forEach((mission) => {
      const misionesderangod2Div = document.createElement('div');
      const misionesderangod2IsLocked = misionesderangod2PlayerStats.lvl < mission.lvl;
      misionesderangod2Div.className =
        `misionesderangod2-mission-item ${misionesderangod2IsLocked ? 'misionesderangod2-locked' : ''}`;
      misionesderangod2Div.innerHTML = `
        <div class="misionesderangod2-mission-header">${mission.name}</div>
        <div class="misionesderangod2-mission-details">
          <div class="misionesderangod2-mission-left">
            <span>⚡ XP: ${mission.xp}</span>
            <span>💰 Oro: ${mission.gold}</span>
          </div>
          <div class="misionesderangod2-mission-right">
            <span>❤️ HP: ${mission.hp}</span>
            <span>⚔️ ATK: ${mission.atk}</span>
            <span>🛡️ DEF: ${mission.def}</span>
          </div>
        </div>
        ${misionesderangod2IsLocked
          ? `<div class="misionesderangod2-mission-lock">🔒 Nivel mínimo: ${mission.lvl}</div>`
          : ''}
      `;
      if (misionesderangod2IsLocked) {
        misionesderangod2Div.style.pointerEvents = 'none';
      }
      misionesderangod2MissionsScreen.appendChild(misionesderangod2Div);
    });

    misionesderangod2MissionsScreen.appendChild(misionesderangod2BackBtn);
    misionesderangod2RankScreen.classList.add('misionesderangod2-hidden');
    misionesderangod2MissionsScreen.classList.remove('misionesderangod2-hidden');
    misionesderangod2CurrentScreen = 'missions';
  }

  // ── API pública (opcional) ─────────────────────────────────
  // Llama a esta función desde tu juego para actualizar el nivel del jugador:
  // window.misionesderangod2SetPlayerLevel(nuevoNivel);
  window.misionesderangod2SetPlayerLevel = function (lvl) {
    misionesderangod2PlayerStats.lvl = lvl;
  };

  // ── Init ───────────────────────────────────────────────────
  misionesderangod2MainScreen.classList.remove('misionesderangod2-hidden');

})();
import { state, syncDerivedStateFromHero } from '../core/state.js';
import { renderBars } from './renderBars.js';

const missionsData = {
  D: [
    { name: 'Eliminar lobos hambrientos', xp: 2, gold: 4, hp: 138, atk: 25, def: 17, lvl: 1 },
    { name: 'Recuperar suministros robados por goblins', xp: 4, gold: 8, hp: 174, atk: 43, def: 28, lvl: 3 },
    { name: 'Proteger la aldea de jabalíes', xp: 6, gold: 12, hp: 210, atk: 61, def: 39, lvl: 5 },
    { name: 'Investigar ruinas infestadas de ratas gigantes', xp: 8, gold: 16, hp: 246, atk: 78, def: 50, lvl: 7 },
    { name: 'Escoltar a un mercader (bandido)', xp: 9, gold: 18, hp: 264, atk: 87, def: 55, lvl: 9 },
    { name: 'Cazar una bestia nocturna', xp: 10, gold: 20, hp: 282, atk: 96, def: 61, lvl: 12 },
  ],
  C: [
    { name: 'Limpiar una mina de murciélagos vampíricos', xp: 12, gold: 24, hp: 318, atk: 113, def: 72, lvl: 14 },
    { name: 'Derrotar a un grupo de orcos merodeadores', xp: 14, gold: 28, hp: 354, atk: 131, def: 83, lvl: 16 },
    { name: 'Rescatar a un rehén de los bandidos', xp: 16, gold: 32, hp: 390, atk: 149, def: 94, lvl: 18 },
    { name: 'Eliminar una amenaza de lobos de las nieves', xp: 18, gold: 36, hp: 426, atk: 166, def: 105, lvl: 20 },
    { name: 'Recuperar un artefacto custodiado por esqueletos', xp: 19, gold: 38, hp: 444, atk: 175, def: 110, lvl: 22 },
    { name: 'Acabar con un troll de las colinas', xp: 20, gold: 40, hp: 462, atk: 184, def: 116, lvl: 24 },
  ],
  B: [
    { name: 'Exterminar una colonia de arácnidos gigantes', xp: 22, gold: 44, hp: 498, atk: 201, def: 127, lvl: 28 },
    { name: 'Detener a un invoca demonios menores', xp: 24, gold: 48, hp: 534, atk: 219, def: 138, lvl: 32 },
    { name: 'Proteger una Ciudad de ataque de grifos salvajes', xp: 26, gold: 52, hp: 570, atk: 237, def: 149, lvl: 36 },
    { name: 'Investigar desapariciones en un bosque encantado', xp: 28, gold: 56, hp: 606, atk: 254, def: 160, lvl: 40 },
    { name: 'Derrotar a un caballero oscuro errante', xp: 29, gold: 58, hp: 624, atk: 263, def: 165, lvl: 45 },
    { name: 'Asaltar una fortaleza de ogros', xp: 30, gold: 60, hp: 642, atk: 272, def: 171, lvl: 50 },
  ],
  A: [
    { name: 'Eliminar a un dragón joven', xp: 32, gold: 64, hp: 678, atk: 289, def: 182, lvl: 55 },
    { name: 'Infiltrarse en una base de asesinos', xp: 34, gold: 68, hp: 714, atk: 307, def: 193, lvl: 50 },
    { name: 'Proteger una ciudad de un ataque', xp: 36, gold: 72, hp: 750, atk: 325, def: 204, lvl: 55 },
    { name: 'Recuperar un tesoro de una tumba maldita', xp: 38, gold: 76, hp: 786, atk: 342, def: 215, lvl: 60 },
    { name: 'Derrotar a un guerrero legendario', xp: 39, gold: 78, hp: 804, atk: 351, def: 220, lvl: 65 },
    { name: 'Acabar con un demonio de las sombras', xp: 40, gold: 80, hp: 822, atk: 360, def: 226, lvl: 70 },
  ],
  S: [
    { name: 'Enfrentar a un dragón adulto', xp: 50, gold: 100, hp: 1002, atk: 448, def: 281, lvl: 75 },
    { name: 'Derrotar a un señor demonio menor', xp: 60, gold: 120, hp: 1182, atk: 536, def: 336, lvl: 80 },
    { name: 'Salvar el reino de un lich', xp: 70, gold: 140, hp: 1362, atk: 624, def: 391, lvl: 85 },
    { name: 'Enfrentar a un titán antiguo', xp: 80, gold: 160, hp: 1542, atk: 712, def: 446, lvl: 90 },
    { name: 'Combatir a un dios olvidado', xp: 90, gold: 180, hp: 1722, atk: 800, def: 501, lvl: 95 },
    { name: 'Derrotar al dragón anciano', xp: 100, gold: 200, hp: 1902, atk: 808, def: 556, lvl: 100 },
  ],
};

function ensureStyles() {
  if (document.getElementById('misiones-rango-styles')) return;
  const style = document.createElement('style');
  style.id = 'misiones-rango-styles';
  style.textContent = `
  #hud-center.misiones-rango-active{padding:0;margin:0}
  .misiones-rango-root{width:100%;height:100%;margin:0;padding:0;display:flex;flex-direction:column;background:#0b1220;color:#e5ecf8}
  .misiones-rango-screen{width:100%;height:100%;margin:0;padding:8px;display:flex;flex-direction:column;gap:8px;overflow:auto}
  .misiones-rango-button{width:100%;border:1px solid #284264;border-radius:10px;padding:10px;background:#13243b;color:#fff;font-weight:700;cursor:pointer}
  .misiones-rango-list{display:flex;flex-direction:column;gap:6px}
  .misiones-rango-mission{border-left:4px solid #56b6ff;border-radius:10px;padding:8px;background:#12263f;cursor:pointer}
  .misiones-rango-mission.locked{opacity:.5;pointer-events:none}
  .misiones-rango-meta{display:flex;justify-content:space-between;font-size:12px;gap:8px;flex-wrap:wrap}
  .misiones-rango-title{font-size:13px;font-weight:800;margin-bottom:5px}
  .misiones-rango-top{display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:2px 2px 6px}
  `;
  document.head.appendChild(style);
}

export function mountMisionesRango(container) {
  ensureStyles();
  container.classList.add('misiones-rango-active');
  const root = document.createElement('div');
  root.className = 'misiones-rango-root';
  container.innerHTML = '';
  container.appendChild(root);

  let currentView = 'main';
  let currentRank = 'D';
  let rafId = null;

  const loop = () => {
    if (currentView === 'main') {
      const top = root.querySelector('.misiones-rango-top');
      if (top) top.textContent = `Nivel ${state.level} · EXP ${state.exp}/${state.expMax} · Oro ${state.gold}`;
    }
    rafId = requestAnimationFrame(loop);
  };

  function gainRewards(mission) {
    state.gold += mission.gold;
    state.exp += mission.xp;
    while (state.exp >= state.expMax) {
      state.exp -= state.expMax;
      state.level += 1;
      syncDerivedStateFromHero();
      state.hp = state.hpMax;
      state.mp = state.mpMax;
      state.expMax = Math.round(67.5 * Math.pow(state.level, 2));
    }
    renderBars();
  }

  function renderMissions(rank) {
    currentView = 'missions';
    currentRank = rank;
    const missions = missionsData[rank] || [];
    root.innerHTML = `<div class="misiones-rango-screen"><button class="misiones-rango-button" data-back="ranks">⬅️ Volver a rangos</button><div class="misiones-rango-list"></div></div>`;
    const list = root.querySelector('.misiones-rango-list');
    missions.forEach((mission) => {
      const locked = state.level < mission.lvl;
      const item = document.createElement('div');
      item.className = `misiones-rango-mission ${locked ? 'locked' : ''}`;
      item.innerHTML = `<div class="misiones-rango-title">${mission.name}</div><div class="misiones-rango-meta"><span>XP ${mission.xp} · Oro ${mission.gold}</span><span>Req Lv ${mission.lvl}</span><span>HP ${mission.hp} ATK ${mission.atk} DEF ${mission.def}</span></div>`;
      if (!locked) item.addEventListener('click', () => { gainRewards(mission); renderMissions(currentRank); });
      list.appendChild(item);
    });
  }

  function renderRanks() {
    currentView = 'ranks';
    root.innerHTML = `<div class="misiones-rango-screen">
      <button class="misiones-rango-button" data-back="main">⬅️ Volver</button>
      <button class="misiones-rango-button" data-rank="D">📜 MISION RANGO D</button>
      <button class="misiones-rango-button" data-rank="C">🔥 MISION RANGO C</button>
      <button class="misiones-rango-button" data-rank="B">🌪️ MISION RANGO B</button>
      <button class="misiones-rango-button" data-rank="A">💀 MISION RANGO A</button>
      <button class="misiones-rango-button" data-rank="S">👑 MISION RANGO S</button>
    </div>`;
  }

  function renderMain() {
    currentView = 'main';
    root.innerHTML = `<div class="misiones-rango-screen"><div class="misiones-rango-top"></div><button class="misiones-rango-button" data-open="ranks">⚔️ MISIONES RANGO ⚔️</button></div>`;
  }

  root.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.open === 'ranks') renderRanks();
    if (target.dataset.rank) renderMissions(target.dataset.rank);
    if (target.dataset.back === 'main') renderMain();
    if (target.dataset.back === 'ranks') renderRanks();
  });

  renderMain();
  loop();

  return {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      root.remove();
      container.classList.remove('misiones-rango-active');
    },
  };
}

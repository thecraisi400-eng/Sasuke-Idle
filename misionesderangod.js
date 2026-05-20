// ============================================================
// misionesderango.js - Sistema de Misiones de Rango
// Todos los identificadores usan el prefijo "misionesderangod2"
// para evitar conflictos con otros scripts del juego.
// ============================================================

import { misionesderangod2Data } from './misionesderangod/data.js';
import { misionesderangod2RenderMissions } from './misionesderangod/render.js';
import { misionesderangod2Styles } from './misionesderangod/styles.js';
import { misionesderangod2BuildTemplate } from './misionesderangod/template.js';

function misionesderangod2Mount(targetElement) {
  // ── Estilos ────────────────────────────────────────────────
  const misionesderangod2StyleId = 'misionesderangod2-styles';
  if (!document.getElementById(misionesderangod2StyleId)) {
    const misionesderangod2Style = document.createElement('style');
    misionesderangod2Style.id = misionesderangod2StyleId;
    misionesderangod2Style.textContent = misionesderangod2Styles;
    document.head.appendChild(misionesderangod2Style);
  }

  // ── HTML ───────────────────────────────────────────────────
  const misionesderangod2Container = misionesderangod2BuildTemplate();

  // Insertar el contenedor en el contenedor objetivo
  if (!targetElement) {
    throw new Error('misionesderangod2Mount requiere un elemento contenedor.');
  }
  targetElement.innerHTML = '';
  targetElement.appendChild(misionesderangod2Container);

  // ── Estado ─────────────────────────────────────────────────
  let misionesderangod2CurrentScreen = 'main';
  let misionesderangod2PlayerStats = { lvl: 1 };
  let misionesderangod2CurrentRank = 'D';

  // ── Referencias DOM ────────────────────────────────────────
  const misionesderangod2MainScreen = document.getElementById('misionesderangod2-main-menu-screen');
  const misionesderangod2RankScreen = document.getElementById('misionesderangod2-rank-list-screen');
  const misionesderangod2MissionsScreen = document.getElementById('misionesderangod2-missions-screen');

  // ── Eventos ────────────────────────────────────────────────
  document.getElementById('misionesderangod2-main-btn').addEventListener('click', () => {
    misionesderangod2MainScreen.classList.add('misionesderangod2-hidden');
    misionesderangod2RankScreen.classList.remove('misionesderangod2-hidden');
    misionesderangod2CurrentScreen = 'ranks';
  });

  function misionesderangod2ShowMissions(rank) {
    misionesderangod2CurrentRank = rank;
    misionesderangod2RenderMissions({
      rank,
      playerLevel: misionesderangod2PlayerStats.lvl,
      data: misionesderangod2Data,
      missionsScreen: misionesderangod2MissionsScreen,
      rankScreen: misionesderangod2RankScreen,
      onMissionSelect: ({ rank: missionRank }) => {
        if (missionRank === 'D' && typeof window.misionesderangodddMount === 'function') {
          targetElement.innerHTML = '';
          window.misionesderangodddMount(targetElement);
        }
      },
    });
    misionesderangod2CurrentScreen = 'missions';
  }

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

  // ── API pública (opcional) ─────────────────────────────────
  // Llama a esta función desde tu juego para actualizar el nivel del jugador:
  // window.misionesderangod2SetPlayerLevel(nuevoNivel);
  window.misionesderangod2SetPlayerLevel = function (lvl) {
    misionesderangod2PlayerStats.lvl = lvl;
  };

  // ── Init ───────────────────────────────────────────────────
  misionesderangod2MainScreen.classList.remove('misionesderangod2-hidden');

  return {
    destroy() {
      misionesderangod2Container.remove();
    },
    getCurrentScreen() {
      return misionesderangod2CurrentScreen;
    },
    getCurrentRank() {
      return misionesderangod2CurrentRank;
    },
  };
}

window.misionesderangod2Mount = misionesderangod2Mount;

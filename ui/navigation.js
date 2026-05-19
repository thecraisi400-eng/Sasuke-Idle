import '../botonheroe.js';
import '../misionesderangod.js';
import { getHeroStats, setEquipmentSlotLevel, state, syncDerivedStateFromHero } from '../core/state.js';
import { sections } from '../data/sections.js';
import { renderBars } from './renderBars.js';
import { spawnParticles, spawnFloatText } from './effects.js';

/* ─────────────────────────────────────────────
   NAVEGACIÓN DE BOTONES
───────────────────────────────────────────── */
export function initUI() {
  renderBars();

  const centerPanel   = document.getElementById('hud-center');
  const overlay      = document.getElementById('section-overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc  = document.getElementById('overlayDesc');
  const overlayClose = document.getElementById('overlayClose');

  let heroWidgetInstance = null;
  let missionsWidgetInstance = null;

  function destroyCenterWidgets() {
    if (heroWidgetInstance?.destroy) {
      heroWidgetInstance.destroy();
      heroWidgetInstance = null;
    }

    if (missionsWidgetInstance?.destroy) {
      missionsWidgetInstance.destroy();
      missionsWidgetInstance = null;
    }
  }

  function buildHeroStatsRows() {
    const s = getHeroStats();
    return [
      { icon:'⚔️', key:'STR',   val:Math.round(s.str), cls:'' },
      { icon:'💨', key:'AGI',   val:Math.round(s.agi), cls:'bh1-speed' },
      { icon:'🧠', key:'INT',   val:Math.round(s.int), cls:'' },
      { icon:'✦',  key:'LUK',   val:s.luk.toFixed(1), cls:'' },
      { icon:'🛡️', key:'DEF',   val:Math.round(s.def), cls:'bh1-good' },
      { icon:'♾️',  key:'RES',   val:`${s.res.toFixed(2)}%`, cls:'' },
      { icon:'◎',  key:'CRI',   val:`${s.cri.toFixed(2)}%`, cls:'bh1-crit' },
      { icon:'💥', key:'C.DMG', val:`${s.cdmg.toFixed(1)}%`, cls:'bh1-crit' },
      { icon:'〇', key:'EVA',   val:`${s.eva.toFixed(2)}%`, cls:'bh1-speed' },
      { icon:'♥️', key:'Rg HP', val:`+${s.rgHp}`, cls:'bh1-good' },
    ];
  }

  function showHeroPanel() {
    overlay.classList.remove('visible');
    destroyCenterWidgets();
    centerPanel.innerHTML = '';
    centerPanel.classList.add('hero-panel-active');

    if (typeof window.botonhero1Mount !== 'function') {
      console.warn('[botonhero1] Función botonhero1Mount no disponible');
      return;
    }

    syncDerivedStateFromHero();
    heroWidgetInstance = window.botonhero1Mount(centerPanel, {
      gold: state.gold,
      initialSlotLevels: state.equipmentSlots,
      stats: buildHeroStatsRows(),
      onUpgrade: ({ id, level, gold }) => {
        state.gold = Math.max(0, Math.floor(gold));
        setEquipmentSlotLevel(id, level);
        renderBars();
        showHeroPanel();
      },
    });
  }

  function showSectionOverlay(sec) {
    centerPanel.classList.remove('hero-panel-active');
    destroyCenterWidgets();
    centerPanel.innerHTML = '';

    const info = sections[sec];
    if (!info) return;

    overlayTitle.innerHTML = `${info.icon} ${info.title}`;
    overlayDesc.textContent = info.desc;
    overlay.classList.add('visible');
  }

  function showMissionsPanel() {
    overlay.classList.remove('visible');
    centerPanel.classList.remove('hero-panel-active');
    destroyCenterWidgets();
    centerPanel.innerHTML = '';

    if (typeof window.misionesderangod2Mount !== 'function') {
      console.warn('[misionesderangod2] Función misionesderangod2Mount no disponible');
      return;
    }

    missionsWidgetInstance = window.misionesderangod2Mount(centerPanel);
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;

      // Efecto de partículas  (smoke + chakra)
      spawnParticles(cx, cy, 'smoke');
      spawnParticles(cx, cy, 'chakra');

      const sec = btn.dataset.section;

      // texto flotante con nombre de sección
      const labels = { heroe:'HÉROE', misiones:'MISIONES', clanes:'CLANES',
                       eventos:'EVENTOS', jutsus:'JUTSUS', batallas:'BATALLAS',
                       invocaciones:'INVOCAR', habilidades:'ÁRBOL', ajustes:'AJUSTES' };
      spawnFloatText(cx, cy, '▶ ' + (labels[sec] || sec), '#e8923a');

      // Marcar activo
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeSection = sec;

      if (sec === 'heroe') {
        showHeroPanel();
        return;
      }

      if (sec === 'misiones') {
        showMissionsPanel();
        return;
      }

      showSectionOverlay(sec);
    });
  });

  overlayClose.addEventListener('click', () => {
    overlay.classList.remove('visible');
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    spawnParticles(cx, cy, 'amber-spark');
  });
}

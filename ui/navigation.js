import '../botonheroe.js';
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
  let isMisionesMounted = false;
  let heroRegenInterval = null;

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


  function stopHeroRegen() {
    if (heroRegenInterval) {
      clearInterval(heroRegenInterval);
      heroRegenInterval = null;
    }
  }

  function startHeroRegen() {
    stopHeroRegen();
    heroRegenInterval = setInterval(() => {
      if (state.activeSection !== 'heroe') return;
      const hpRegen = Math.max(1, Math.round(state.hpMax * 0.07));
      const mpRegen = Math.max(1, Math.round(state.mpMax * 0.07));
      const nextHp = Math.min(state.hpMax, state.hp + hpRegen);
      const nextMp = Math.min(state.mpMax, state.mp + mpRegen);
      if (nextHp === state.hp && nextMp === state.mp) return;
      state.hp = nextHp;
      state.mp = nextMp;
      renderBars();
      syncHeroStatsToMissions();
    }, 1000);
  }

  function showHeroPanel() {
    overlay.classList.remove('visible');
    centerPanel.innerHTML = '';
    centerPanel.classList.add('hero-panel-active');

    if (typeof window.botonhero1Mount !== 'function') {
      console.warn('[botonhero1] Función botonhero1Mount no disponible');
      return;
    }

    syncDerivedStateFromHero();
    startHeroRegen();
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
    stopHeroRegen();
    centerPanel.classList.remove('hero-panel-active');

    if (heroWidgetInstance?.destroy) {
      heroWidgetInstance.destroy();
      heroWidgetInstance = null;
    } else {
      centerPanel.innerHTML = '';
    }

    const info = sections[sec];
    if (!info) return;

    overlayTitle.innerHTML = `${info.icon} ${info.title}`;
    overlayDesc.textContent = info.desc;
    overlay.classList.add('visible');
  }


  function syncHeroStatsToMissions() {
    if (typeof window.misionesderango2SetPlayerStats !== 'function') return;
    const s = getHeroStats();
    window.misionesderango2SetPlayerStats({
      lvl: state.level,
      hp: Math.round(state.hp),
      maxHp: Math.round(state.hpMax),
      mp: Math.round(state.mp),
      maxMp: Math.round(state.mpMax),
      atk: Math.round(s.str),
      def: Math.round(s.def),
      agi: Math.round(s.agi),
      int: Math.round(s.int),
      luk: Number(s.luk),
      res: Number(s.res),
      cri: Number(s.cri),
      cdmg: Number(s.cdmg),
      eva: Number(s.eva),
      rgHp: Number(s.rgHp),
    });
  }

  function showMisionesPanel() {
    stopHeroRegen();
    overlay.classList.remove('visible');
    centerPanel.classList.remove('hero-panel-active');

    if (heroWidgetInstance?.destroy) {
      heroWidgetInstance.destroy();
      heroWidgetInstance = null;
    }

    if (!isMisionesMounted) {
      centerPanel.innerHTML = '';
      if (typeof window.misionesderango2Init !== 'function') {
        console.warn('[misionesderango2] Función misionesderango2Init no disponible');
        return;
      }
      window.misionesderango2Init('#hud-center');
      isMisionesMounted = true;
    }

    window.misionesderango2OnPlayerStatsChange = (stats) => {
      state.hp = Math.max(0, Math.min(state.hpMax, Math.round(stats.hp ?? state.hp)));
      state.mp = Math.max(0, Math.min(state.mpMax, Math.round(stats.mp ?? state.mp)));
      renderBars();
    };
    window.misionesderango2OnMissionComplete = ({ xp, gold }) => {
      state.exp += Math.max(0, Number(xp) || 0);
      state.gold += Math.max(0, Number(gold) || 0);
      renderBars();
    };

    syncHeroStatsToMissions();
    if (typeof window.misionesderango2ShowMain === 'function') {
      window.misionesderango2ShowMain();
    }
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
        if (isMisionesMounted && typeof window.misionesderango2Destroy === 'function') {
          window.misionesderango2Destroy();
          isMisionesMounted = false;
        }
        showHeroPanel();
        return;
      }

      if (sec === 'misiones') {
        showMisionesPanel();
        return;
      }

      if (isMisionesMounted && typeof window.misionesderango2Destroy === 'function') {
        window.misionesderango2Destroy();
        isMisionesMounted = false;
      }

      showSectionOverlay(sec);
    });
  });

  window.showHeroSection = function () {
    if (isMisionesMounted && typeof window.misionesderango2Destroy === 'function') {
      window.misionesderango2Destroy();
      isMisionesMounted = false;
    }
    showHeroPanel();
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const heroBtn = document.querySelector('.nav-btn[data-section="heroe"]');
    if (heroBtn) heroBtn.classList.add('active');
    state.activeSection = 'heroe';
  };

  overlayClose.addEventListener('click', () => {
    overlay.classList.remove('visible');
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    spawnParticles(cx, cy, 'amber-spark');
  });
}

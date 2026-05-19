import { state } from '../core/state.js';

/* ─────────────────────────────────────────────
   RENDERIZADO INICIAL DE BARRAS (sin auto-update)
───────────────────────────────────────────── */
export function renderBars() {
  const hpPct  = Math.round(state.hp  / state.hpMax  * 100);
  const mpPct  = Math.round(state.mp  / state.mpMax  * 100);
  const expPct = state.expMax > 0 ? Math.round(state.exp / state.expMax * 100) : 0;

  document.getElementById('hpFill').style.width  = hpPct  + '%';
  document.getElementById('mpFill').style.width  = mpPct  + '%';
  document.getElementById('expFill').style.width = expPct + '%';

  document.getElementById('hpCur').textContent  = state.hp;
  document.getElementById('hpMax').textContent  = state.hpMax;
  document.getElementById('hpPct').textContent  = hpPct  + '%';
  document.getElementById('mpCur').textContent  = state.mp;
  document.getElementById('mpMax').textContent  = state.mpMax;
  document.getElementById('mpPct').textContent  = mpPct  + '%';
  document.getElementById('levelDisplay').textContent = state.level;
  document.getElementById('expNext').textContent =
    `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;

  document.getElementById('statGold').textContent = state.gold.toLocaleString();
  document.getElementById('statAtk').textContent  = state.atk;
  document.getElementById('statDef').textContent  = state.def;
}

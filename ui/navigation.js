import { state } from '../core/state.js';
import { sections } from '../data/sections.js';
import { renderBars } from './renderBars.js';
import { spawnParticles, spawnFloatText } from './effects.js';

/* ─────────────────────────────────────────────
   NAVEGACIÓN DE BOTONES
───────────────────────────────────────────── */
export function initUI() {
  renderBars();

  const overlay      = document.getElementById('section-overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc  = document.getElementById('overlayDesc');
  const overlayClose = document.getElementById('overlayClose');

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

      // Abrir overlay
      const info = sections[sec];
      if (info) {
        overlayTitle.innerHTML = `${info.icon} ${info.title}`;
        overlayDesc.textContent = info.desc;
        overlay.classList.add('visible');
      }
    });
  });

  overlayClose.addEventListener('click', () => {
    overlay.classList.remove('visible');
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    spawnParticles(cx, cy, 'amber-spark');
  });
}

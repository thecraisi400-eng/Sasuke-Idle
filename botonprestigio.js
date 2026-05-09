/*
 * Sistema de Prestigio - UI y lógica
 * Uso rápido:
 *   window.nivelActual = 1;
 *   window.dañoPermanenteTotal = 0;
 *   // Opcional: define window.rocas = [{ hp: 10, hpInicial: 10 }, ...]
 *   // o window.resetearRocasANivel1 = () => { ... }
 *
 *   const prestigio = window.crearSistemaPrestigio();
 *   prestigio.abrir();
 */
(function () {
  const PRESTIGIO_CSS = `
:root {
  --prestige-bg-1: #07090f;
  --prestige-bg-2: #131927;
  --prestige-bg-3: #1b1208;
  --prestige-blur: 8px;
  --prestige-overlay-opacity: 0.82;
}

.prestige-overlay {
  position: absolute;
  inset: 0;
  z-index: 9000;
  display: grid;
  place-items: center;
  padding: 16px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 320ms ease;
}

.prestige-overlay.is-open {
  opacity: 1;
  pointer-events: all;
}

.prestige-cave-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(110% 70% at 50% 18%, rgba(120, 132, 170, 0.18), transparent 52%),
    radial-gradient(85% 60% at 12% 78%, rgba(84, 56, 29, 0.28), transparent 56%),
    radial-gradient(90% 62% at 88% 82%, rgba(20, 30, 55, 0.4), transparent 52%),
    linear-gradient(145deg, var(--prestige-bg-1), var(--prestige-bg-2) 58%, var(--prestige-bg-3));
  filter: saturate(1.05) contrast(1.08);
}

.prestige-cave-fog {
  position: absolute;
  inset: 0;
  background: rgba(6, 8, 12, var(--prestige-overlay-opacity));
  backdrop-filter: blur(var(--prestige-blur));
  -webkit-backdrop-filter: blur(var(--prestige-blur));
}

.prestige-scroll {
  position: relative;
  width: min(92vw, 430px);
  border-radius: 24px;
  padding: 14px;
  color: #f6e7c4;
  background:
    radial-gradient(130% 90% at 50% 0%, rgba(255,255,255,0.26), transparent 40%),
    linear-gradient(165deg, #f3e4c5, #decaa0);
  border: 5px solid #6e6a62;
  box-shadow:
    0 30px 65px rgba(0, 0, 0, 0.45),
    inset 0 0 0 2px rgba(255, 255, 255, 0.35);
  overflow: hidden;
  transform: translateY(14px) scale(0.985);
  transition: transform 340ms cubic-bezier(.19,.75,.24,1);
}

.prestige-overlay.is-open .prestige-scroll {
  transform: translateY(0) scale(1);
}

.prestige-panel {
  background: linear-gradient(180deg, #3e2412, #2d180a);
  border: 4px solid #d4a52f;
  border-radius: 16px;
  padding: 16px 14px;
  box-shadow: inset 0 0 0 2px rgba(255, 213, 118, 0.25);
}

.prestige-title {
  margin: 0 0 14px;
  text-align: center;
  color: #ffd64a;
  font-family: "Fredoka One", "Arial Black", sans-serif;
  font-size: clamp(1rem, 3.4vw, 1.2rem);
  letter-spacing: 0.03em;
}

.diamond {
  color: #ff8a25;
  text-shadow: 0 0 8px rgba(255, 138, 37, 0.5);
}

.prestige-row {
  margin-bottom: 12px;
}

.prestige-row-top {
  display: flex;
  justify-content: space-between;
  color: #f6e7c4;
  font-weight: 700;
  font-size: 0.92rem;
  margin-bottom: 4px;
}

.prestige-icon {
  font-size: 1.05rem;
  text-shadow: 0 0 10px currentColor;
}

.prestige-icon.star {
  color: #6db2ff;
}

.prestige-icon.coin {
  color: #ffd64a;
}

.prestige-bar {
  width: 100%;
  height: 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.36);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.prestige-fill {
  height: 100%;
  border-radius: inherit;
}

.prestige-fill.blue {
  background: linear-gradient(90deg, #2f6dd8, #4ec7ff);
}

.prestige-fill.gold {
  background: linear-gradient(90deg, #c88a00, #ffd64a);
}

.prestige-calc {
  margin: 5px 0;
  color: #f6e7c4;
  font-size: 0.95rem;
}

.prestige-pos {
  color: #5bff8a;
  font-weight: 800;
}

.prestige-actions {
  margin-top: 14px;
}

.prestige-btn {
  width: 100%;
  border: 2px solid #90d4ff;
  border-radius: 14px;
  padding: 14px 16px;
  font-weight: 900;
  font-size: 1.02rem;
  cursor: pointer;
}

.prestige-btn-main {
  color: #fff;
  background: linear-gradient(180deg, #4fc6ff, #2f70de);
  box-shadow: 0 0 18px rgba(79, 198, 255, 0.75);
}

.prestige-btn-ghost {
  margin-top: 8px;
  color: #f3e6cf;
  border-color: #8c7a63;
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 430px) {
  .prestige-overlay {
    padding: 10px;
  }

  .prestige-scroll { border-radius: 16px; }
}
  `;

  function calcularDanioADesbloquear(nivelActual) {
    return Math.floor(nivelActual / 30) * 0.2;
  }

  function resetearHPDeRocas() {
    if (typeof window.resetearRocasANivel1 === 'function') {
      window.resetearRocasANivel1();
      return;
    }

    if (Array.isArray(window.rocas)) {
      window.rocas.forEach((roca) => {
        if (typeof roca.hpInicialNivel1 === 'number') roca.hp = roca.hpInicialNivel1;
        else if (typeof roca.hpInicial === 'number') roca.hp = roca.hpInicial;
        else if (typeof roca.baseHp === 'number') roca.hp = roca.baseHp;
      });
    }
  }

  function crearSistemaPrestigio() {
    const overlayActivo = document.querySelector('.prestige-overlay');
    if (overlayActivo) overlayActivo.remove();

    if (!document.getElementById('prestige-style')) {
      const style = document.createElement('style');
      style.id = 'prestige-style';
      style.textContent = PRESTIGIO_CSS;
      document.head.appendChild(style);
    }

    const overlay = document.createElement('section');
    overlay.className = 'prestige-overlay';
    overlay.innerHTML = `
      <div class="prestige-cave-bg" aria-hidden="true"></div>
      <div class="prestige-cave-fog" aria-hidden="true"></div>
      <article class="prestige-scroll" role="dialog" aria-modal="true" aria-label="Sistema de prestigio">
        <div class="prestige-panel">
          <h2 class="prestige-title"><span class="diamond">◆</span> ESTADO DE PRESTIGIO ACTUAL <span class="diamond">◆</span></h2>
          <div class="prestige-row">
            <div class="prestige-row-top"><span><span class="prestige-icon star">★</span> Nivel Actual: <span id="prestige-level">43/50</span></span></div>
            <div class="prestige-bar"><div class="prestige-fill blue" id="prestige-level-fill"></div></div>
          </div>
          <div class="prestige-row">
            <div class="prestige-row-top"><span><span class="prestige-icon coin">💰</span> Monedas Ganadas: <span id="prestige-coins">245,000 / 300,000</span></span></div>
            <div class="prestige-bar"><div class="prestige-fill gold" id="prestige-coins-fill"></div></div>
          </div>
          <p class="prestige-calc">Puntos por Nivel (x1/15): <span class="prestige-pos" id="prestige-points-level">+4</span></p>
          <p class="prestige-calc">Puntos por Monedas (x1/meta): <span class="prestige-pos" id="prestige-points-coins">+2</span></p>
          <div class="prestige-actions">
            <button type="button" class="prestige-btn prestige-btn-main" id="prestige-reset">+6 Puntos de Prestigio</button>
            <button type="button" class="prestige-btn prestige-btn-ghost" id="prestige-close">Cerrar</button>
          </div>
        </div>
      </article>
    `;

    const prestigeHost = document.getElementById('cave-area') || document.body;
    prestigeHost.appendChild(overlay);

    const levelText = overlay.querySelector('#prestige-level');
    const coinsText = overlay.querySelector('#prestige-coins');
    const levelFill = overlay.querySelector('#prestige-level-fill');
    const coinsFill = overlay.querySelector('#prestige-coins-fill');
    const levelPointsText = overlay.querySelector('#prestige-points-level');
    const coinPointsText = overlay.querySelector('#prestige-points-coins');
    const resetBtn = overlay.querySelector('#prestige-reset');
    const closeBtn = overlay.querySelector('#prestige-close');

    const PRESTIGE_LEVEL_STEP = 15;
    const PRESTIGE_BASE_GOLD_TARGET = 5000;

    function getNivel() {
      return Number(window.nivelActual ?? 1);
    }

    function getTotalGoldEarned() {
      return Number(window.totalGoldEarned ?? window.oroTotalGanado ?? 0);
    }

    function getPrestigeMetaData() {
      if (!window.prestigeGoldData) {
        window.prestigeGoldData = { target: PRESTIGE_BASE_GOLD_TARGET, multiplier: 1 };
      }

      const totalGold = getTotalGoldEarned();
      let target = Math.max(PRESTIGE_BASE_GOLD_TARGET, Number(window.prestigeGoldData.target) || PRESTIGE_BASE_GOLD_TARGET);
      let multiplier = Number(window.prestigeGoldData.multiplier) || 1;

      while (totalGold >= target) {
        const randomPercent = 0.6 + Math.random() * 0.6;
        multiplier += randomPercent;
        target = Math.round(PRESTIGE_BASE_GOLD_TARGET * multiplier);
      }

      window.prestigeGoldData.target = target;
      window.prestigeGoldData.multiplier = multiplier;
      return { target, totalGold };
    }

    function refresh() {
      const nivel = getNivel();
      const nivelMax = Math.max(PRESTIGE_LEVEL_STEP, Math.ceil(nivel / PRESTIGE_LEVEL_STEP) * PRESTIGE_LEVEL_STEP);
      const puntosNivel = Math.floor(nivel / PRESTIGE_LEVEL_STEP);

      const { target: monedasMeta, totalGold: monedas } = getPrestigeMetaData();
      const puntosMonedas = Math.floor(monedas / PRESTIGE_BASE_GOLD_TARGET);

      levelText.textContent = `${nivel}/${nivelMax}`;
      coinsText.textContent = `${monedas.toLocaleString('es-ES')} / ${monedasMeta.toLocaleString('es-ES')}`;
      levelFill.style.width = `${Math.min((nivel / nivelMax) * 100, 100)}%`;
      coinsFill.style.width = `${Math.min((monedas / monedasMeta) * 100, 100)}%`;
      levelPointsText.textContent = `+${puntosNivel}`;
      coinPointsText.textContent = `+${puntosMonedas}`;
      resetBtn.title = 'Listo para prestigiar';
    }

    function cerrar() {
      overlay.classList.remove('is-open');
      setTimeout(() => overlay.remove(), 340);
    }

    resetBtn.addEventListener('click', () => {
      const nivel = getNivel();
      if (nivel < 30) return;

      const bono = calcularDanioADesbloquear(nivel);
      window.dañoPermanenteTotal = Number(window.dañoPermanenteTotal ?? 0) + bono;
      window.nivelActual = 1;
      resetearHPDeRocas();
      if (typeof window.updatePrestigeUI === 'function') window.updatePrestigeUI();
      cerrar();
    });

    closeBtn.addEventListener('click', cerrar);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) cerrar();
    });

    requestAnimationFrame(() => overlay.classList.add('is-open'));
    refresh();

    return { abrir: refresh, cerrar, refresh };
  }

  window.crearSistemaPrestigio = crearSistemaPrestigio;
})();

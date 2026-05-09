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

  --scroll-paper: #f0dfbc;
  --scroll-paper-2: #e4cb9f;
  --scroll-ink: #2c1a0c;
  --scroll-shadow: rgba(0, 0, 0, 0.45);

  --cta-active: #b94721;
  --cta-active-2: #d86b34;
  --cta-disabled: #845c4e;
}

.prestige-overlay {
  position: fixed;
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
  width: min(92vw, 560px);
  border-radius: 22px;
  padding: clamp(18px, 2.7vw, 30px);
  color: var(--scroll-ink);
  background:
    radial-gradient(125% 100% at 50% 0%, rgba(255,255,255,0.25), transparent 45%),
    linear-gradient(165deg, var(--scroll-paper), var(--scroll-paper-2));
  box-shadow:
    0 30px 65px var(--scroll-shadow),
    inset 0 0 0 1px rgba(81, 52, 24, 0.32),
    inset 0 12px 24px rgba(255, 255, 255, 0.18),
    inset 0 -12px 20px rgba(92, 53, 20, 0.16);
  overflow: hidden;
  transform: translateY(14px) scale(0.985);
  transition: transform 340ms cubic-bezier(.19,.75,.24,1);
}

.prestige-overlay.is-open .prestige-scroll {
  transform: translateY(0) scale(1);
}

.prestige-scroll::before,
.prestige-scroll::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 16px;
  background: linear-gradient(to bottom, rgba(64, 38, 20, 0.25), transparent);
}

.prestige-scroll::after {
  top: auto;
  bottom: 0;
  transform: rotate(180deg);
}

.prestige-title {
  margin: 0 0 10px;
  font-family: "Cinzel", "Georgia", "Times New Roman", serif;
  font-size: clamp(1.3rem, 3.5vw, 2rem);
  letter-spacing: 0.04em;
}

.prestige-copy {
  margin: 6px 0;
  font-family: "Merriweather", "Georgia", serif;
  font-size: clamp(0.96rem, 2.5vw, 1.12rem);
  line-height: 1.5;
}

.prestige-highlight {
  font-weight: 800;
}

.prestige-actions {
  margin-top: 18px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.prestige-btn {
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  font-size: 0.98rem;
  cursor: pointer;
}

.prestige-btn-main {
  flex: 1 1 190px;
  color: #fff;
  background: linear-gradient(180deg, var(--cta-active-2), var(--cta-active));
  box-shadow: 0 8px 18px rgba(125, 42, 17, 0.38);
}

.prestige-btn-main[disabled] {
  opacity: 0.5;
  pointer-events: none;
  background: var(--cta-disabled);
  box-shadow: none;
}

.prestige-btn-ghost {
  flex: 1 1 120px;
  color: #3d2412;
  background: rgba(255, 255, 255, 0.34);
  border: 1px solid rgba(61, 36, 18, 0.25);
}

@media (max-width: 430px) {
  .prestige-overlay {
    padding: 10px;
  }

  .prestige-scroll {
    border-radius: 16px;
    padding: 16px;
  }

  .prestige-actions {
    flex-direction: column;
  }

  .prestige-btn {
    width: 100%;
  }
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
        <h2 class="prestige-title">Ritual de Prestigio</h2>
        <p class="prestige-copy" id="prestige-level"></p>
        <p class="prestige-copy" id="prestige-bonus"></p>
        <div class="prestige-actions">
          <button type="button" class="prestige-btn prestige-btn-main" id="prestige-reset">Reiniciar y Obtener Bono</button>
          <button type="button" class="prestige-btn prestige-btn-ghost" id="prestige-close">Cerrar</button>
        </div>
      </article>
    `;

    document.body.appendChild(overlay);

    const levelText = overlay.querySelector('#prestige-level');
    const bonusText = overlay.querySelector('#prestige-bonus');
    const resetBtn = overlay.querySelector('#prestige-reset');
    const closeBtn = overlay.querySelector('#prestige-close');

    function getNivel() {
      return Number(window.nivelActual ?? 1);
    }

    function refresh() {
      const nivel = getNivel();
      const bono = calcularDanioADesbloquear(nivel);

      levelText.innerHTML = `Nivel Actual Alcanzado: <span class="prestige-highlight">${nivel}</span>`;
      bonusText.innerHTML = `Bono de Daño a desbloquear: <span class="prestige-highlight">${bono.toFixed(2)} DPS</span>`;

      const habilitado = nivel >= 30;
      resetBtn.disabled = !habilitado;
      resetBtn.title = habilitado ? 'Listo para prestigiar' : 'Necesitas llegar al nivel 30';
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

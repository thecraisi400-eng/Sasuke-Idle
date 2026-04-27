class BotonHero {
  constructor(container) {
    this.container = container;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="hero-system">
        <section class="hero-panel stats-panel">
          <h3 class="hero-panel-title">ATRIBUTOS SHINOBI</h3>
          <ul class="hero-stats-list">
            <li><span>HP (Vida) 🩺</span><strong>25,000</strong></li>
            <li><span>CP (Chakra) 🌀</span><strong>18,000</strong></li>
            <li><span>ATK (Fuerza) ⚔️</span><strong>4,500</strong></li>
            <li><span>DEF (Resistencia) 🛡️</span><strong>3,200</strong></li>
            <li><span>SPD (Velocidad) ⚡</span><strong>5,000</strong></li>
            <li><span>CRT (Prob. Crítica) 🎯</span><strong>17%</strong></li>
            <li><span>EVA (Evasión) 💨</span><strong>25%</strong></li>
            <li><span>CDMG (Daño Crítico) 💥</span><strong>300%</strong></li>
          </ul>
        </section>

        <div class="hero-empty-space" aria-hidden="true"></div>

        <section class="hero-panel gear-panel">
          <h3 class="hero-panel-title">EQUIPO</h3>
          <div class="hero-gear-grid">
            <article class="gear-slot"><small>Casco</small><span>Banda Ninja 🥷</span></article>
            <article class="gear-slot"><small>Pecho</small><span>Capa Uchiha 🧥</span></article>
            <article class="gear-slot"><small>Arma</small><span>Espada Kusanagi 🗡️</span></article>
            <article class="gear-slot"><small>Anillo</small><span>Anillo de Itachi 💍</span></article>
            <article class="gear-slot"><small>Accesorio 1</small><span>Shuriken Gigante ✴️</span></article>
            <article class="gear-slot"><small>Accesorio 2</small><span>Pergamino Prohibido 📜</span></article>
          </div>
        </section>
      </div>
    `;
  }
}

window.BotonHero = BotonHero;

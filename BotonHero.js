(function () {
  const HERO_NAV_LABELS = ['HÉROE', 'HEROE'];

  function isHeroButton(button) {
    const label = button.querySelector('.n-label')?.textContent?.trim().toUpperCase() || '';
    return HERO_NAV_LABELS.includes(label);
  }

  function buildProfileHeader() {
    return `
      <header class="hero-system-header">
        <div class="hero-system-level">
          <div class="level-text">Lvl 100</div>
          <div class="rank-text">RANGO S</div>
        </div>

        <div class="hero-system-center">
          <h2 class="hero-system-name">Sasuke Uchiha</h2>
          <div class="hero-system-xp-wrap">
            <div class="hero-system-xp-track">
              <div class="hero-system-xp-fill" style="width: 95%"></div>
            </div>
            <div class="hero-system-xp-text">95% para Nivel 101</div>
          </div>
        </div>

        <div class="hero-system-avatar" aria-label="Avatar de personaje"></div>
      </header>
    `;
  }

  function buildStatsPanel() {
    const stats = [
      { name: 'HP (Vida) 🩺', value: '25,000' },
      { name: 'CP (Chakra) 🌀', value: '18,000' },
      { name: 'ATK (Fuerza) ⚔️', value: '4,500' },
      { name: 'DEF (Resistencia) 🛡️', value: '3,200' },
      { name: 'SPD (Velocidad) ⚡', value: '5,000' },
      { name: 'NIN (Ninjutsu) 🔥', value: '5,500' },
      { name: 'GEN (Genjutsu) 👁️', value: '6,000' },
      { name: 'TAI (Taijutsu) 👊', value: '4,000' },
      { name: 'INT (Inteligencia) 🧠', value: '4,800' },
      { name: 'LUK (Suerte) 🍀', value: '1,500' },
    ];

    return `
      <section class="hero-system-panel">
        <h3 class="hero-system-title">ATRIBUTOS SHINOBI</h3>
        <ul class="hero-system-stat-list">
          ${stats
            .map(
              (stat) => `
              <li class="hero-system-stat-item">
                <span>${stat.name}</span>
                <strong>${stat.value}</strong>
              </li>
            `,
            )
            .join('')}
        </ul>
      </section>
    `;
  }

  function buildEquipmentPanel() {
    const items = [
      'Casco: Banda Ninja 🥷',
      'Pecho: Capa Uchiha 🧥',
      'Arma: Espada Kusanagi 🗡️',
      'Accesorio 1: Shuriken Gigante ✴️',
      'Accesorio 2: Pergamino Prohibido 📜',
      'Anillo: Anillo de Itachi 💍',
    ];

    return `
      <section class="hero-system-panel">
        <h3 class="hero-system-title">EQUIPO</h3>
        <div class="hero-system-equip-grid">
          ${items
            .map(
              (item) => `
              <div class="hero-system-equip-item">${item}</div>
            `,
            )
            .join('')}
        </div>
      </section>
    `;
  }

  function buildSkillsSection() {
    const skills = [
      { text: 'Chidori', icon: '⚡', level: 'Nivel 5/5' },
      { text: 'Katon: Goukayuu', icon: '🔥', level: 'Nivel 4/5' },
      { text: 'Amaterasu', icon: '👁️‍🗨️', level: 'Nivel 3/5' },
      { text: "Susano\'o", icon: '🛡️', level: 'Nivel 2/5' },
    ];

    return `
      <section class="hero-system-skills">
        <h3 class="hero-system-title">TÉCNICAS DE COMBATE</h3>
        <div class="hero-system-skill-row">
          ${skills
            .map(
              (skill) => `
              <article class="hero-system-skill-card">
                <div class="skill-main">${skill.icon} ${skill.text}</div>
                <div class="skill-level">${skill.level}</div>
              </article>
            `,
            )
            .join('')}
        </div>
      </section>
    `;
  }

  function buildFooter() {
    return `
      <footer class="hero-system-footer">
        <button class="hero-system-upgrade" type="button" aria-label="Mejorar personaje">⚪ MEJORAR</button>
        <div class="hero-system-damage">DAÑO TOTAL: 99,999</div>
      </footer>
    `;
  }

  function buildHeroSystem() {
    return `
      <section class="hero-system-view">
        ${buildProfileHeader()}
        <div class="hero-system-main-grid">
          ${buildStatsPanel()}
          ${buildEquipmentPanel()}
        </div>
        ${buildSkillsSection()}
        ${buildFooter()}
      </section>
    `;
  }

  function showHeroSystem() {
    const missionBox = document.querySelector('.mission-box');
    if (!missionBox) return;
    missionBox.innerHTML = buildHeroSystem();
  }

  function showSectionPlaceholder(button) {
    const missionBox = document.querySelector('.mission-box');
    if (!missionBox) return;

    const sectionName = button.querySelector('.n-label')?.textContent?.trim() || 'SECCIÓN';
    missionBox.innerHTML = `
      <section class="placeholder-view">
        <h3>${sectionName}</h3>
        <p>Esta sección estará disponible próximamente.</p>
      </section>
    `;
  }

  function initHeroSystemNavigation() {
    const navButtons = Array.from(document.querySelectorAll('[data-nav]'));
    if (!navButtons.length) return;

    navButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (isHeroButton(button)) {
          showHeroSystem();
          return;
        }
        showSectionPlaceholder(button);
      });
    });

    const initialButton = navButtons.find((btn) => btn.classList.contains('active')) || navButtons[0];
    if (initialButton && isHeroButton(initialButton)) {
      showHeroSystem();
    }
  }

  window.BotonHero = {
    init: initHeroSystemNavigation,
  };
})();

(function () {
  const heroData = {
    level: 100,
    rank: 'RANGO S',
    name: 'Sasuke Uchiha',
    xpText: '95% para Nivel 101',
    xpPercent: 95,
    stats: [
      ['HP (Vida) 🩺', '25,000'],
      ['CP (Chakra) 🌀', '18,000'],
      ['ATK (Fuerza) ⚔️', '4,500'],
      ['DEF (Resistencia) 🛡️', '3,200'],
      ['SPD (Velocidad) ⚡', '5,000'],
      ['NIN (Ninjutsu) 🔥', '5,500'],
      ['GEN (Genjutsu) 👁️', '6,000'],
      ['TAI (Taijutsu) 👊', '4,000'],
      ['INT (Inteligencia) 🧠', '4,800'],
      ['LUK (Suerte) 🍀', '1,500'],
    ],
    equipment: [
      ['Casco', 'Banda Ninja 🥷'],
      ['Pecho', 'Capa Uchiha 🧥'],
      ['Arma', 'Espada Kusanagi 🗡️'],
      ['Accesorio 1', 'Shuriken Gigante ✴️'],
      ['Accesorio 2', 'Pergamino Prohibido 📜'],
      ['Anillo', 'Anillo de Itachi 💍'],
    ],
    skills: [
      ['⚡', 'Chidori', 'Nivel 5/5'],
      ['🔥', 'Katon: Goukayuu', 'Nivel 4/5'],
      ['👁️‍🗨️', 'Amaterasu', 'Nivel 3/5'],
      ['🛡️', "Susano'o", 'Nivel 2/5'],
    ],
    totalDamage: '99,999',
  };

  function createStatRows(stats) {
    return stats
      .map(
        ([name, value]) =>
          `<div class="shinobi-stat-row"><span class="shinobi-stat-name">${name}</span><span class="shinobi-stat-value">${value}</span></div>`
      )
      .join('');
  }

  function createEquipmentRows(items) {
    return items
      .map(
        ([slot, item]) =>
          `<div class="equipo-slot"><div class="equipo-slot-name">${slot}</div><div class="equipo-slot-item">${item}</div></div>`
      )
      .join('');
  }

  function createSkillRows(skills) {
    return skills
      .map(
        ([icon, name, level]) =>
          `<div class="tecnica-item"><span class="tecnica-icon">${icon}</span><span class="tecnica-name">${name}</span><span class="tecnica-level">${level}</span></div>`
      )
      .join('');
  }

  function renderHeroPanel(container) {
    container.innerHTML = `
      <section class="heroe-system" aria-label="Sistema de héroe">
        <header class="heroe-system-header">
          <div class="perfil-left">
            <div class="perfil-level">Lvl ${heroData.level}</div>
            <div class="perfil-rank">${heroData.rank}</div>
          </div>
          <div class="perfil-center">
            <h2 class="perfil-name">${heroData.name}</h2>
            <div class="xp-line-wrap">
              <div class="xp-line-track"><div class="xp-line-fill" style="width: ${heroData.xpPercent}%"></div></div>
              <div class="xp-line-text">${heroData.xpText}</div>
            </div>
          </div>
          <div class="perfil-avatar" aria-label="Avatar"></div>
        </header>

        <div class="heroe-system-panels">
          <section class="panel-shinobi">
            <h3 class="panel-title">ATRIBUTOS SHINOBI</h3>
            <div class="shinobi-stats">${createStatRows(heroData.stats)}</div>
          </section>

          <section class="panel-equipo">
            <h3 class="panel-title">EQUIPO</h3>
            <div class="equipo-grid">${createEquipmentRows(heroData.equipment)}</div>
          </section>
        </div>

        <section class="panel-tecnicas">
          <h3 class="panel-title">TÉCNICAS DE COMBATE</h3>
          <div class="tecnicas-list">${createSkillRows(heroData.skills)}</div>
        </section>

        <footer class="heroe-footer">
          <button class="btn-mejorar" type="button">🌀 MEJORAR</button>
          <div class="damage-plate">DAÑO TOTAL: ${heroData.totalDamage}</div>
        </footer>
      </section>
    `;
  }

  window.BotonHero = {
    render: renderHeroPanel,
  };
})();

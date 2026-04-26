(function () {
  const heroData = {
    stats: [
      { key: 'HP', label: 'Vida', emoji: '🩺', value: '25,000' },
      { key: 'CP', label: 'Chakra', emoji: '🌀', value: '18,000' },
      { key: 'ATK', label: 'Fuerza', emoji: '⚔️', value: '4,500' },
      { key: 'DEF', label: 'Resistencia', emoji: '🛡️', value: '3,200' },
      { key: 'SPD', label: 'Velocidad', emoji: '⚡', value: '5,000' },
      { key: 'CRT', label: 'Prob. Crítica', emoji: '🎯', value: '17%' },
      { key: 'EVA', label: 'Evasión', emoji: '💨', value: '25%' },
      { key: 'CDMG', label: 'Daño Crítico', emoji: '💥', value: '300%' },
      { key: 'NIN', label: 'Ninjutsu', emoji: '🔮', value: '4,200' },
      { key: 'TAI', label: 'Taijutsu', emoji: '🥊', value: '3,850' }
    ],
    equipment: [
      { slot: 'Casco', item: 'Banda Ninja', emoji: '🥷' },
      { slot: 'Pecho', item: 'Capa Uchiha', emoji: '🧥' },
      { slot: 'Arma', item: 'Espada Kusanagi', emoji: '🗡️' },
      { slot: 'Accesorio 1', item: 'Shuriken Gigante', emoji: '✴️' },
      { slot: 'Accesorio 2', item: 'Pergamino Prohibido', emoji: '📜' },
      { slot: 'Anillo', item: 'Anillo de Itachi', emoji: '💍' }
    ],
    skills: [
      { name: 'Chidori', icon: '⚡', level: '5/5' },
      { name: 'Katon: Goukayuu', icon: '🔥', level: '4/5' },
      { name: 'Amaterasu', icon: '👁️‍🗨️', level: '3/5' },
      { name: "Susano'o", icon: '🛡️', level: '2/5' }
    ],
    totalDamage: 99999
  };

  function createStatRow(stat) {
    return `
      <div class="hero-system-stat-row">
        <span class="hero-system-stat-main">${stat.key} (${stat.label}) ${stat.emoji}</span>
        <span class="hero-system-stat-value">${stat.value}</span>
      </div>
    `;
  }

  function createEquipmentCard(item) {
    return `
      <div class="hero-system-equip-card">
        <div class="hero-system-equip-slot">${item.slot}</div>
        <div class="hero-system-equip-item">${item.item} ${item.emoji}</div>
      </div>
    `;
  }

  function createSkillCard(skill) {
    return `
      <div class="hero-system-skill-card">
        <div class="hero-system-skill-name">${skill.icon} ${skill.name}</div>
        <div class="hero-system-skill-level">Nivel ${skill.level}</div>
      </div>
    `;
  }

  function bindImproveButton(container) {
    const improveButton = container.querySelector('[data-hero-upgrade]');
    const totalDamageNode = container.querySelector('[data-hero-total-damage]');

    if (!improveButton || !totalDamageNode) return;

    improveButton.addEventListener('click', function () {
      heroData.totalDamage += 111;
      totalDamageNode.textContent = heroData.totalDamage.toLocaleString('es-ES');
    });
  }

  function renderHeroSystem(container) {
    if (!container) return;

    container.innerHTML = `
      <section class="hero-system" aria-label="Sistema de héroe">
        <div class="hero-system-main">
          <div class="hero-system-panel hero-system-left">
            <h3 class="hero-system-title">ATRIBUTOS SHINOBI</h3>
            <div class="hero-system-stats-list">
              ${heroData.stats.map(createStatRow).join('')}
            </div>
          </div>

          <div class="hero-system-panel hero-system-right">
            <h3 class="hero-system-title">EQUIPO</h3>
            <div class="hero-system-equip-grid">
              ${heroData.equipment.map(createEquipmentCard).join('')}
            </div>
          </div>
        </div>

        <div class="hero-system-skills-section">
          <h3 class="hero-system-title">TÉCNICAS DE COMBATE</h3>
          <div class="hero-system-skills-row">
            ${heroData.skills.map(createSkillCard).join('')}
          </div>
        </div>

        <div class="hero-system-footer">
          <button class="hero-system-upgrade-btn" type="button" data-hero-upgrade>🔴 MEJORAR</button>
          <div class="hero-system-damage-plate">DAÑO TOTAL: <strong data-hero-total-damage>${heroData.totalDamage.toLocaleString('es-ES')}</strong></div>
        </div>
      </section>
    `;

    bindImproveButton(container);
  }

  window.BotonHero = {
    render: renderHeroSystem
  };
})();

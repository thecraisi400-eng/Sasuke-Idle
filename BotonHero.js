(() => {
  const heroState = {
    gearLevels: [62, 14, 28, 45, 53, 72, 36, 8]
  };

  const heroConfig = {
    gear: [
      { id: 0, name: 'Kusanagi', icon: '⚔️', stat: 'ATQ', base: 155 },
      { id: 1, name: 'Kunai x12', icon: '🗡️', stat: 'VEL', base: 84 },
      { id: 2, name: 'Banda Ninja', icon: '🩹', stat: 'RES', base: 63 },
      { id: 3, name: 'Túnica ANBU', icon: '🥋', stat: 'DEF', base: 205 },
      { id: 4, name: 'Guantes Filo', icon: '🥊', stat: 'PRE', base: 97 },
      { id: 5, name: 'Botas Kage', icon: '👟', stat: 'EVA', base: 74 },
      { id: 6, name: 'Cinturón', icon: '🎽', stat: 'FUE', base: 114 },
      { id: 7, name: 'Máscara', icon: '😶‍🌫️', stat: 'INT', base: 132 }
    ],
    combatStats: [
      { ico: '💪', key: 'STR', val: 342 },
      { ico: '⚡', key: 'AGI', val: 287 },
      { ico: '🧠', key: 'INT', val: 215 },
      { ico: '🍀', key: 'LUK', val: 134 },
      { ico: '🛡️', key: 'DEF', val: 198 },
      { ico: '🔮', key: 'RES', val: 176 },
      { ico: '🎯', key: 'CRI', val: '18%' },
      { ico: '💥', key: 'C.DMG', val: '210%' },
      { ico: '👻', key: 'EVA', val: '12%' },
      { ico: '💚', key: 'HP.R', val: '+85' }
    ]
  };

  const rarityByLevel = (level) => {
    if (level <= 5) return 'r-wood';
    if (level <= 15) return 'r-green';
    if (level <= 30) return 'r-blue';
    if (level <= 45) return 'r-yellow';
    if (level <= 60) return 'r-red';
    return 'r-legend';
  };

  const rarityColor = (level) => ({
    'r-wood': '#8b5e3c',
    'r-green': '#22c55e',
    'r-blue': '#3b82f6',
    'r-yellow': '#eab308',
    'r-red': '#ef4444',
    'r-legend': '#ff3300'
  }[rarityByLevel(level)]);

  const upgradeCost = (level) => Math.round(100 * Math.pow(1.18, level)).toLocaleString('es-ES');
  const statAtLevel = (item, level) => Math.round(item.base * (1 + level * 0.12));

  function createHeroLayout() {
    return `
      <div class="hero-sheet" id="hero-sheet-root">
        <div class="hero-col-left">
          <div class="hero-sprite-wrap">
            <img class="hero-sprite" src="assets/images/sasuke.webp" alt="Uchiha Sasuke" />
            <div class="hero-sprite-fallback">🥷</div>
            <div class="hero-sprite-glow"></div>
          </div>
          <div class="hero-identity">
            <div class="hero-name">Sasuke</div>
            <div class="hero-clan">Clan Uchiha</div>
            <div class="hero-rank">ANBU</div>
            <div class="hero-level-row">
              <span>Lv <strong>72</strong></span>
              <i>|</i>
              <span>Sha <strong>S</strong></span>
            </div>
            <p class="hero-desc">Último superviviente del clan Uchiha y usuario del Sharingan. Un shinobi frío y calculador que lucha por el honor de su linaje.</p>
          </div>
        </div>

        <div class="hero-col-right">
          <section class="hero-block hero-gear-block">
            <header class="hero-section-label">⚔ EQUIPAMIENTO</header>
            <div class="hero-gear-grid" id="hero-gear-grid"></div>
          </section>

          <section class="hero-block hero-stats-block">
            <header class="hero-section-label">◈ VITALES</header>
            <div class="hero-bars">
              <div class="hero-bar-row hp">
                <div class="hero-bar-label">HP <span>8,450 / 10,000</span></div>
                <div class="hero-bar-track"><div class="hero-bar-fill" style="width:84.5%"></div></div>
              </div>
              <div class="hero-bar-row ck">
                <div class="hero-bar-label">CK <span>3,200 / 5,000</span></div>
                <div class="hero-bar-track"><div class="hero-bar-fill" style="width:64%"></div></div>
              </div>
              <div class="hero-bar-row exp">
                <div class="hero-bar-label">EXP <span>72%</span></div>
                <div class="hero-bar-track"><div class="hero-bar-fill" style="width:72%"></div></div>
              </div>
            </div>

            <header class="hero-section-label hero-combat-title">◈ COMBATE</header>
            <div class="hero-combat-grid" id="hero-combat-grid"></div>
          </section>
        </div>
      </div>

      <div class="hero-modal-overlay" id="hero-modal-overlay">
        <div class="hero-modal">
          <button class="hero-modal-close" type="button" id="hero-modal-close">✕</button>
          <div class="hero-modal-head">
            <div class="hero-modal-icon" id="hero-m-icon">⚔️</div>
            <div>
              <div class="hero-modal-title" id="hero-m-name">—</div>
              <div class="hero-modal-level" id="hero-m-level">Nivel —</div>
            </div>
          </div>
          <div class="hero-modal-body">
            <div class="hero-modal-cost">Costo mejora <strong id="hero-m-cost">—</strong></div>
            <div class="hero-modal-compare">
              <div>Actual</div><div></div><div>Siguiente</div>
              <div id="hero-m-cur-lvl">Lv 0</div><div>→</div><div id="hero-m-next-lvl">Lv 0</div>
              <div id="hero-m-cur-stat">—</div><div>→</div><div id="hero-m-next-stat">—</div>
            </div>
            <button class="hero-modal-upgrade" id="hero-m-upgrade" type="button">⬆ MEJORAR</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderGear(root, openModal) {
    const grid = root.querySelector('#hero-gear-grid');
    grid.innerHTML = '';

    heroConfig.gear.forEach((item, idx) => {
      const level = heroState.gearLevels[idx];
      const rarity = rarityByLevel(level);
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = `hero-slot ${rarity}`;
      slot.style.setProperty('--hero-rc', rarityColor(level));
      slot.innerHTML = `
        <span class="hero-slot-icon">${item.icon}</span>
        <span class="hero-slot-name">${item.name}</span>
        <span class="hero-slot-lv">Lv.${level}</span>
      `;
      slot.addEventListener('click', () => openModal(idx));
      grid.appendChild(slot);
    });
  }

  function renderCombat(root) {
    const container = root.querySelector('#hero-combat-grid');
    container.innerHTML = '';
    heroConfig.combatStats.forEach((stat) => {
      const item = document.createElement('article');
      item.className = 'hero-stat';
      item.innerHTML = `<span class="hero-stat-ico">${stat.ico}</span><span class="hero-stat-key">${stat.key}</span><span class="hero-stat-val">${stat.val}</span>`;
      container.appendChild(item);
    });
  }

  function animateBars(root) {
    const fills = root.querySelectorAll('.hero-bar-fill');
    fills.forEach((fill) => {
      const width = fill.style.width;
      fill.style.width = '0%';
      setTimeout(() => { fill.style.width = width; }, 140);
    });
  }

  const BotonHero = {
    render(centerBodyEl, centerTitleEl, centerBadgeEl, centerPanelEl) {
      if (!centerBodyEl) return;

      centerPanelEl?.classList.add('hero-mode');
      if (centerTitleEl) centerTitleEl.textContent = '🥷 PERFIL UCHIHA';
      if (centerBadgeEl) centerBadgeEl.textContent = 'HÉROE';

      centerBodyEl.innerHTML = createHeroLayout();
      const root = centerBodyEl.querySelector('#hero-sheet-root');
      const overlay = centerBodyEl.querySelector('#hero-modal-overlay');
      const closeBtn = centerBodyEl.querySelector('#hero-modal-close');
      const upgradeBtn = centerBodyEl.querySelector('#hero-m-upgrade');
      const sprite = root.querySelector('.hero-sprite');
      const fallback = root.querySelector('.hero-sprite-fallback');

      let activeIndex = -1;

      const closeModal = () => {
        overlay.classList.remove('open');
        activeIndex = -1;
      };

      const openModal = (idx) => {
        activeIndex = idx;
        const item = heroConfig.gear[idx];
        const level = heroState.gearLevels[idx];

        centerBodyEl.querySelector('#hero-m-icon').textContent = item.icon;
        centerBodyEl.querySelector('#hero-m-name').textContent = item.name;
        centerBodyEl.querySelector('#hero-m-level').textContent = `Nivel ${level}`;
        centerBodyEl.querySelector('#hero-m-cost').textContent = `${upgradeCost(level)} 💛`;
        centerBodyEl.querySelector('#hero-m-cur-lvl').textContent = `Lv ${level}`;
        centerBodyEl.querySelector('#hero-m-next-lvl').textContent = `Lv ${level + 1}`;
        centerBodyEl.querySelector('#hero-m-cur-stat').textContent = `${item.stat}: ${statAtLevel(item, level - 1)}`;
        centerBodyEl.querySelector('#hero-m-next-stat').textContent = `${item.stat}: ${statAtLevel(item, level)}`;

        overlay.classList.add('open');
      };

      const upgradeCurrent = () => {
        if (activeIndex < 0) return;
        heroState.gearLevels[activeIndex] = Math.min(heroState.gearLevels[activeIndex] + 1, 80);
        renderGear(root, openModal);
        openModal(activeIndex);
      };

      sprite.addEventListener('error', () => {
        sprite.style.display = 'none';
        fallback.style.display = 'grid';
      });

      closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeModal();
      });
      upgradeBtn.addEventListener('click', upgradeCurrent);

      renderGear(root, openModal);
      renderCombat(root);
      animateBars(root);
    }
  };

  window.BotonHero = BotonHero;
})();

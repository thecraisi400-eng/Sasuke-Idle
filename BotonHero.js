(() => {
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
  const formatStatValue = (stat, level) => {
    const value = stat.gain * Math.max(0, level);
    if (stat.percent) return `${value.toFixed(3).replace(/\.?0+$/, '')}%`;
    if (!Number.isInteger(value)) return value.toFixed(1);
    return String(value);
  };


  function createHeroLayout(state) {
    const hpPct = ((state.hp / state.hpMax) * 100).toFixed(1);
    const mpPct = ((state.mp / state.mpMax) * 100).toFixed(1);
    const expPct = ((state.exp / state.expMax) * 100).toFixed(1);

    return `
      <div class="hero-sheet" id="hero-sheet-root">
        <div class="hero-col-left">
          <div class="hero-sprite-wrap">
            <img class="hero-sprite" src="assets/images/sasuke.webp" alt="Uchiha Sasuke" />
            <div class="hero-sprite-fallback">🥷</div>
            <div class="hero-sprite-glow"></div>
          </div>
          <div class="hero-identity">
            <div class="hero-name">${state.hero.name}</div>
            <div class="hero-clan">${state.hero.clan}</div>
            <div class="hero-rank">${state.hero.rank}</div>
            <div class="hero-level-row">
              <span>Lv <strong>${state.level}</strong></span>
              <i>|</i>
              <span>Sha <strong>${state.level >= 50 ? 'S' : state.level >= 30 ? 'A' : state.level >= 15 ? 'B' : 'C'}</strong></span>
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
                <div class="hero-bar-label">HP <span>${state.hp.toLocaleString('es-ES')} / ${state.hpMax.toLocaleString('es-ES')}</span></div>
                <div class="hero-bar-track"><div class="hero-bar-fill" style="width:${hpPct}%"></div></div>
              </div>
              <div class="hero-bar-row ck">
                <div class="hero-bar-label">CK <span>${state.mp.toLocaleString('es-ES')} / ${state.mpMax.toLocaleString('es-ES')}</span></div>
                <div class="hero-bar-track"><div class="hero-bar-fill" style="width:${mpPct}%"></div></div>
              </div>
              <div class="hero-bar-row exp">
                <div class="hero-bar-label">EXP <span>${expPct}%</span></div>
                <div class="hero-bar-track"><div class="hero-bar-fill" style="width:${expPct}%"></div></div>
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
              <section class="hero-compare-col current">
                <div class="hero-compare-title">Actual</div>
                <div id="hero-m-cur-lvl">Lv 0</div>
                <div id="hero-m-cur-stat-1">—</div>
                <div id="hero-m-cur-stat-2">—</div>
              </section>
              <section class="hero-compare-col next">
                <div class="hero-compare-title">Siguiente</div>
                <div id="hero-m-next-lvl">Lv 0</div>
                <div id="hero-m-next-stat-1">—</div>
                <div id="hero-m-next-stat-2">—</div>
              </section>
            </div>
            <button class="hero-modal-upgrade" id="hero-m-upgrade" type="button">⬆ MEJORAR</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderGear(root, gear, levels, openModal) {
    const grid = root.querySelector('#hero-gear-grid');
    grid.innerHTML = '';
    gear.forEach((item, idx) => {
      const level = levels[idx];
      const rarity = rarityByLevel(level);
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = `hero-slot ${rarity}`;
      slot.style.setProperty('--hero-rc', rarityColor(level));
      slot.innerHTML = `<span class="hero-slot-icon">${item.icon}</span><span class="hero-slot-name">${item.name}</span><span class="hero-slot-lv">Lv.${level}</span>`;
      slot.addEventListener('click', () => openModal(idx));
      grid.appendChild(slot);
    });
  }

  function renderCombat(root, state) {
    const stats = [
      { ico: '💪', key: 'STR', val: state.atk },
      { ico: '🛡️', key: 'DEF', val: state.def },
      { ico: '🧠', key: 'INT', val: state.int },
      { ico: '⚡', key: 'AGI', val: state.agi },
      { ico: '🍀', key: 'LUK', val: state.luk.toFixed(1) },
      { ico: '🛡️', key: 'RES', val: `${state.res.toFixed(2)}%` },
      { ico: '🎯', key: 'CRI', val: `${state.cri.toFixed(2)}%` },
      { ico: '💥', key: 'C.DMG', val: `${state.critDmg.toFixed(0)}%` }
    ];

    const container = root.querySelector('#hero-combat-grid');
    container.innerHTML = '';
    stats.forEach((stat) => {
      const item = document.createElement('article');
      item.className = 'hero-stat';
      item.innerHTML = `<span class="hero-stat-ico">${stat.ico}</span><span class="hero-stat-key">${stat.key}</span><span class="hero-stat-val">${stat.val}</span>`;
      container.appendChild(item);
    });
  }

  const BotonHero = {
    render(centerBodyEl, centerTitleEl, centerBadgeEl, centerPanelEl, state, gearConfig, saveGame, recalcDerivedStats, updateBars) {
      if (!centerBodyEl) return;
      centerPanelEl?.classList.add('hero-mode');
      if (centerTitleEl) centerTitleEl.textContent = '';
      if (centerBadgeEl) centerBadgeEl.textContent = '';
      centerBodyEl.innerHTML = createHeroLayout(state);

      const root = centerBodyEl.querySelector('#hero-sheet-root');
      const overlay = centerBodyEl.querySelector('#hero-modal-overlay');
      const closeBtn = centerBodyEl.querySelector('#hero-modal-close');
      const upgradeBtn = centerBodyEl.querySelector('#hero-m-upgrade');
      const sprite = root.querySelector('.hero-sprite');
      const fallback = root.querySelector('.hero-sprite-fallback');
      let activeIndex = -1;

      const closeModal = () => { overlay.classList.remove('open'); activeIndex = -1; };
      const openModal = (idx) => {
        activeIndex = idx;
        const item = gearConfig[idx];
        const level = state.hero.gearLevels[idx];
        centerBodyEl.querySelector('#hero-m-icon').textContent = item.icon;
        centerBodyEl.querySelector('#hero-m-name').textContent = item.name;
        centerBodyEl.querySelector('#hero-m-level').textContent = `Nivel ${level}`;
        centerBodyEl.querySelector('#hero-m-cost').textContent = `💰 ${upgradeCost(level)}`;
        centerBodyEl.querySelector('#hero-m-cur-lvl').textContent = `Lv ${level}`;
        centerBodyEl.querySelector('#hero-m-next-lvl').textContent = `Lv ${level + 1}`;
        centerBodyEl.querySelector('#hero-m-cur-stat-1').textContent = `${item.stats[0].key}: ${formatStatValue(item.stats[0], level)}`;
        centerBodyEl.querySelector('#hero-m-cur-stat-2').textContent = `${item.stats[1].key}: ${formatStatValue(item.stats[1], level)}`;
        centerBodyEl.querySelector('#hero-m-next-stat-1').textContent = `${item.stats[0].key}: ${formatStatValue(item.stats[0], Math.min(80, level + 1))}`;
        centerBodyEl.querySelector('#hero-m-next-stat-2').textContent = `${item.stats[1].key}: ${formatStatValue(item.stats[1], Math.min(80, level + 1))}`;
        overlay.classList.add('open');
      };

      const upgradeCurrent = () => {
        if (activeIndex < 0) return;
        state.hero.gearLevels[activeIndex] = Math.min(state.hero.gearLevels[activeIndex] + 1, 80);
        recalcDerivedStats();
        saveGame();
        updateBars();
        renderGear(root, gearConfig, state.hero.gearLevels, openModal);
        renderCombat(root, state);
        openModal(activeIndex);
      };

      sprite.addEventListener('error', () => { sprite.style.display = 'none'; fallback.style.display = 'grid'; });
      closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', (event) => { if (event.target === overlay) closeModal(); });
      upgradeBtn.addEventListener('click', upgradeCurrent);

      renderGear(root, gearConfig, state.hero.gearLevels, openModal);
      renderCombat(root, state);
    }
  };

  window.BotonHero = BotonHero;
})();

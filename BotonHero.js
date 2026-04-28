class BotonHero {
  constructor() {
    this.activeIdx = -1;
    this.levelCap = 80;
    this.heroProfile = {
      name: 'Uchiha Sasuke',
      clan: 'Aldea Oculta de la Hoja',
      rank: 'GENIN',
      level: 42,
      title: 'Sombra de Konoha'
    };

    this.gear = [
      { id: 0, name: 'Katana Ninja', icon: '⚔️', stat: 'ATK', baseVal: 150 },
      { id: 1, name: 'Kunai x12', icon: '🗡️', stat: 'VEL', baseVal: 86 },
      { id: 2, name: 'Protector Frontal', icon: '🛡️', stat: 'RES', baseVal: 62 },
      { id: 3, name: 'Túnica Jōnin', icon: '🥋', stat: 'DEF', baseVal: 205 },
      { id: 4, name: 'Guantes Shinobi', icon: '🥊', stat: 'PRE', baseVal: 92 },
      { id: 5, name: 'Botas de Chakra', icon: '👟', stat: 'EVA', baseVal: 77 },
      { id: 6, name: 'Faja de Combate', icon: '🎽', stat: 'STR', baseVal: 116 },
      { id: 7, name: 'Máscara Táctica', icon: '😶‍🌫️', stat: 'INT', baseVal: 132 }
    ];
    this.levels = [40, 15, 26, 37, 51, 60, 31, 9];

    this.combatStats = [
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
    ];
  }

  render(container) {
    container.innerHTML = `
      <div class="hero-sheet" id="hero-sheet">
        <div class="hero-left-col">
          <div class="hero-sprite-box">
            <div class="hero-sprite-fallback">🥷</div>
            <div class="hero-sprite-image" role="img" aria-label="Uchiha Sasuke"></div>
            <div class="hero-sprite-glow"></div>
          </div>
          <div class="hero-panel hero-identity">
            <div class="hero-name">${this.heroProfile.name}</div>
            <div class="hero-clan">${this.heroProfile.clan}</div>
            <div class="hero-rank">${this.heroProfile.rank}</div>
            <div class="hero-tags">
              <div class="hero-tag">Lv <strong>${this.heroProfile.level}</strong></div>
              <div class="hero-sep">|</div>
              <div class="hero-tag">${this.heroProfile.title}</div>
            </div>
            <div class="hero-desc">
              Último superviviente del clan Uchiha y poseedor del Sharingan.
              Sasuke es un ninja impulsado por la frialdad y el deseo de restaurar el honor de su linaje a cualquier costo.
            </div>
          </div>
        </div>

        <div class="hero-right-col">
          <div class="hero-panel hero-gear-panel">
            <div class="hero-section-label">⚔ Equipamiento</div>
            <div class="hero-gear-grid" id="hero-gear-grid"></div>
          </div>

          <div class="hero-panel hero-stats-panel">
            <div class="hero-section-label">◈ Vitales</div>
            <div class="hero-bar-row hero-bar-hp">
              <div class="hero-bar-label">HP <span>7,200 / 10,000</span></div>
              <div class="hero-bar-track"><div class="hero-bar-fill" style="width:72%"></div></div>
            </div>
            <div class="hero-bar-row hero-bar-mp">
              <div class="hero-bar-label">MP <span>550 / 1,000</span></div>
              <div class="hero-bar-track"><div class="hero-bar-fill" style="width:55%"></div></div>
            </div>
            <div class="hero-bar-row hero-bar-exp">
              <div class="hero-bar-label">EXP <span>38%</span></div>
              <div class="hero-bar-track"><div class="hero-bar-fill" style="width:38%"></div></div>
            </div>

            <div class="hero-section-label hero-combat-label">◈ Combate</div>
            <div class="hero-combat-grid" id="hero-combat-grid"></div>
          </div>
        </div>
      </div>

      <div class="hero-modal-overlay" id="hero-modal-overlay">
        <div class="hero-modal">
          <div class="hero-modal-header">
            <div class="hero-modal-icon" id="hero-modal-icon">⚔️</div>
            <div>
              <div class="hero-modal-title" id="hero-modal-title">—</div>
              <div class="hero-modal-lvl" id="hero-modal-lvl">Nivel —</div>
            </div>
            <button class="hero-modal-close" id="hero-modal-close" type="button">✕</button>
          </div>
          <div class="hero-modal-body">
            <div class="hero-cost-row">
              <span>💰 Costo</span>
              <span id="hero-modal-cost">—</span>
            </div>
            <div class="hero-compare-grid">
              <div class="hero-compare-head">Actual</div>
              <div></div>
              <div class="hero-compare-head">Siguiente</div>
              <div class="hero-compare-cell" id="hero-modal-cur-lvl">Lv 0</div>
              <div class="hero-compare-arrow">→</div>
              <div class="hero-compare-cell next" id="hero-modal-next-lvl">Lv 0</div>
              <div class="hero-compare-cell" id="hero-modal-cur-stat">ATK: 0</div>
              <div class="hero-compare-arrow">→</div>
              <div class="hero-compare-cell next" id="hero-modal-next-stat">ATK: 0</div>
            </div>
            <button class="hero-upgrade-btn" id="hero-upgrade-btn" type="button">⬆ Mejorar</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.buildGear(container);
    this.buildCombatStats(container);
    this.animateBars(container);
  }

  bindEvents(container) {
    const overlay = container.querySelector('#hero-modal-overlay');
    const closeBtn = container.querySelector('#hero-modal-close');
    const upgradeBtn = container.querySelector('#hero-upgrade-btn');

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) this.closeModal(container);
    });
    closeBtn.addEventListener('click', () => this.closeModal(container));
    upgradeBtn.addEventListener('click', () => this.handleUpgrade(container));
  }

  rarityClass(level) {
    if (level <= 5) return 'wood';
    if (level <= 15) return 'green';
    if (level <= 30) return 'blue';
    if (level <= 45) return 'yellow';
    if (level <= 60) return 'red';
    return 'legend';
  }

  statForLevel(item, level) {
    return Math.round(item.baseVal * (1 + level * 0.12));
  }

  upgradeCost(level) {
    return `${Math.round(120 * (1.16 ** level)).toLocaleString('es-ES')} oro`;
  }

  buildGear(container) {
    const grid = container.querySelector('#hero-gear-grid');
    grid.innerHTML = '';

    this.gear.forEach((item, index) => {
      const level = this.levels[index];
      const rarity = this.rarityClass(level);
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = `hero-slot ${rarity}`;
      slot.innerHTML = `
        <div class="hero-slot-icon">${item.icon}</div>
        <div class="hero-slot-name">${item.name}</div>
        <div class="hero-slot-lvl">Lv.${level}</div>
      `;
      slot.addEventListener('click', () => this.openModal(container, index));
      grid.appendChild(slot);
    });
  }

  buildCombatStats(container) {
    const grid = container.querySelector('#hero-combat-grid');
    grid.innerHTML = this.combatStats
      .map((s) => `
        <div class="hero-stat-item">
          <span class="hero-stat-ico">${s.ico}</span>
          <span class="hero-stat-key">${s.key}</span>
          <span class="hero-stat-val">${s.val}</span>
        </div>
      `).join('');
  }

  openModal(container, index) {
    this.activeIdx = index;
    const item = this.gear[index];
    const level = this.levels[index];

    container.querySelector('#hero-modal-icon').textContent = item.icon;
    container.querySelector('#hero-modal-title').textContent = item.name;
    container.querySelector('#hero-modal-lvl').textContent = `Nivel ${level}`;
    container.querySelector('#hero-modal-cost').textContent = this.upgradeCost(level);
    container.querySelector('#hero-modal-cur-lvl').textContent = `Lv ${level}`;
    container.querySelector('#hero-modal-next-lvl').textContent = `Lv ${Math.min(level + 1, this.levelCap)}`;
    container.querySelector('#hero-modal-cur-stat').textContent = `${item.stat}: ${this.statForLevel(item, Math.max(level - 1, 0))}`;
    container.querySelector('#hero-modal-next-stat').textContent = `${item.stat}: ${this.statForLevel(item, level)}`;
    container.querySelector('#hero-modal-overlay').classList.add('open');
  }

  closeModal(container) {
    container.querySelector('#hero-modal-overlay').classList.remove('open');
    this.activeIdx = -1;
  }

  handleUpgrade(container) {
    if (this.activeIdx < 0) return;
    this.levels[this.activeIdx] = Math.min(this.levelCap, this.levels[this.activeIdx] + 1);
    this.buildGear(container);
    this.openModal(container, this.activeIdx);
  }

  animateBars(container) {
    container.querySelectorAll('.hero-bar-fill').forEach((bar) => {
      const width = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = width;
      }, 120);
    });
  }
}

window.BotonHero = BotonHero;

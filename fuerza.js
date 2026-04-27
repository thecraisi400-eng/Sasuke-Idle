'use strict';

const FUERZA_UPGRADES = [
  {
    id: 'click',
    icon: '👆',
    name: 'Daño por Clic',
    levelKey: 'clickUpgLevel',
    costFn: (s) => Math.floor(10 * Math.pow(1.45, s.clickUpgLevel)),
    effectText: (s) => `+${s.clickUpgLevel + 1} daño por clic`,
    buy: (s) => { s.clickUpgLevel++; },
    toast: '👆 Daño por Clic mejorado!'
  },
  {
    id: 'auto',
    icon: '👊',
    name: 'Daño Automático',
    levelKey: 'autoUpgLevel',
    costFn: (s) => Math.floor(25 * Math.pow(1.5, s.autoUpgLevel)),
    effectText: (s) => `+${(s.autoUpgLevel + 1) * 2} daño por segundo`,
    buy: (s) => { s.autoUpgLevel++; },
    toast: '👊 Daño Automático mejorado!'
  },
  {
    id: 'crit',
    icon: '🎯',
    name: 'Probabilidad Crítico',
    levelKey: 'fuerzaCritLevel',
    costFn: (s) => Math.floor(60 * Math.pow(1.6, s.fuerzaCritLevel)),
    effectText: (s) => `+${(s.fuerzaCritLevel + 1) * 2}% de crítico x2`,
    buy: (s) => { s.fuerzaCritLevel++; },
    toast: '🎯 Probabilidad Crítico mejorada!'
  },
  {
    id: 'touch',
    icon: '💥',
    name: 'Poder Toque',
    levelKey: 'powerTouchLevel',
    costFn: (s) => Math.floor(90 * Math.pow(1.55, s.powerTouchLevel)),
    effectText: (s) => `+${(s.powerTouchLevel + 1) * 2} daño base al toque`,
    buy: (s) => { s.powerTouchLevel++; },
    toast: '💥 Poder Toque mejorado!'
  },
  {
    id: 'pen',
    icon: '🛡️',
    name: 'Penetración Roca',
    levelKey: 'rockPenLevel',
    costFn: (s) => Math.floor(130 * Math.pow(1.6, s.rockPenLevel)),
    effectText: (s) => `-${(s.rockPenLevel + 1) * 2} defensa de roca`,
    buy: (s) => { s.rockPenLevel++; },
    toast: '🛡️ Penetración Roca mejorada!'
  },
  {
    id: 'gems',
    icon: '💎',
    name: 'Hallazgo Gemas',
    levelKey: 'gemFindLevel',
    costFn: (s) => Math.floor(180 * Math.pow(1.7, s.gemFindLevel)),
    effectText: (s) => `+${(s.gemFindLevel + 1) * 1}% probabilidad de gema`,
    buy: (s) => { s.gemFindLevel++; },
    toast: '💎 Hallazgo Gemas mejorado!'
  },
  {
    id: 'double',
    icon: '⚡',
    name: 'Golpe Doble',
    levelKey: 'doubleHitLevel',
    costFn: (s) => Math.floor(220 * Math.pow(1.75, s.doubleHitLevel)),
    effectText: (s) => `+${(s.doubleHitLevel + 1) * 1.5}% de 2 golpes`,
    buy: (s) => { s.doubleHitLevel++; },
    toast: '⚡ Golpe Doble mejorado!'
  },
  {
    id: 'rupture',
    icon: '🧱',
    name: 'Daño Ruptura',
    levelKey: 'ruptureLevel',
    costFn: (s) => Math.floor(280 * Math.pow(1.8, s.ruptureLevel)),
    effectText: (s) => `${((s.ruptureLevel + 1) * 0.2).toFixed(1)}% vida máxima por golpe`,
    buy: (s) => { s.ruptureLevel++; },
    toast: '🧱 Daño Ruptura mejorado!'
  },
  {
    id: 'gold',
    icon: '💰',
    name: 'Oro Impacto',
    levelKey: 'goldImpactLevel',
    costFn: (s) => Math.floor(120 * Math.pow(1.65, s.goldImpactLevel)),
    effectText: (s) => `+${s.goldImpactLevel + 1} oro por impacto`,
    buy: (s) => { s.goldImpactLevel++; },
    toast: '💰 Oro Impacto mejorado!'
  },
];

class FuerzaSystem {
  constructor(state, ui, renderer) {
    this.state = state;
    this.ui = ui;
    this.renderer = renderer;
    this.buildTab();
  }

  buildTab() {
    const container = document.getElementById('force-upgrades-container');
    if (!container) return;

    const rows = FUERZA_UPGRADES.map((upg) => `
      <div class="upgrade-row">
        <div class="upgrade-icon">${upg.icon}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${upg.name}</div>
          <div class="upgrade-effect" id="force-effect-${upg.id}"></div>
          <div class="upgrade-level" id="force-level-${upg.id}">Nv. 0</div>
        </div>
        <div class="upgrade-btn-wrap">
          <div class="upgrade-cost" id="force-cost-${upg.id}">🪙 0</div>
          <button class="btn btn-primary btn-sm" id="btn-force-${upg.id}">MEJORAR</button>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="card" style="margin-bottom:10px; background:rgba(88,166,255,0.06); border-color:rgba(88,166,255,0.3);">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div style="font-size:12px; color:var(--text-muted);">Sistema de Fuerza separado (fuerza.js)</div>
          <div id="force-summary" style="font-family:'Orbitron',sans-serif; font-size:13px; color:var(--gold); font-weight:700;">DMG 1 | DPS 0</div>
        </div>
      </div>
      ${rows}
    `;
  }

  bindEvents() {
    FUERZA_UPGRADES.forEach((upg) => {
      const btn = document.getElementById(`btn-force-${upg.id}`);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const cost = upg.costFn(this.state);
        if (this.state.gold < cost) {
          showToast('Oro insuficiente', '#f78166');
          return;
        }
        this.state.gold -= cost;
        upg.buy(this.state);
        this.ui.updateAll();
        showToast(upg.toast, '#58a6ff');
      });
    });
  }

  getRockDefense() {
    return Math.floor(this.state.rockLevel * 0.6);
  }

  getArmorPenetration() {
    return this.state.rockPenLevel * 2;
  }

  getCritX2Chance() {
    return this.state.fuerzaCritLevel * 2;
  }

  getTouchBonus() {
    return this.state.powerTouchLevel * 2;
  }

  getDoubleHitChance() {
    return this.state.doubleHitLevel * 1.5;
  }

  getRuptureDamage() {
    const pct = this.state.ruptureLevel * 0.002;
    return this.state.rockMaxHP * pct;
  }

  getGoldPerImpact() {
    return this.state.goldImpactLevel;
  }

  getGemFindBonus() {
    return this.state.gemFindLevel * 0.01;
  }

  getDpsDamage() {
    let dps = (this.state.autoUpgLevel * 2) * this.state.permDpsMult;
    if (this.state.frenzyActive && Date.now() < this.state.frenzyEndTime) dps *= 2;
    return dps;
  }

  computeBaseClickDamage() {
    let dmg = (1 + this.state.clickUpgLevel + this.getTouchBonus()) * this.state.permDmgMult;
    if (this.state.frenzyActive && Date.now() < this.state.frenzyEndTime) dmg *= 2;
    return dmg;
  }

  applySingleHit(rawDamage) {
    const defense = Math.max(0, this.getRockDefense() - this.getArmorPenetration());
    let adjusted = Math.max(1, rawDamage - defense);

    if (Math.random() * 100 < this.getCritX2Chance()) adjusted *= 2;
    adjusted += this.getRuptureDamage();

    const result = this.state.dealDamage(adjusted);
    if (this.getGoldPerImpact() > 0) {
      const bonus = this.getGoldPerImpact();
      this.state.gold += bonus;
      this.state.totalGoldEarned += bonus;
    }
    return result;
  }

  applyClickAttack() {
    const hits = [{...this.applySingleHit(this.computeBaseClickDamage()), forceCrit: false}];
    if (Math.random() * 100 < this.getDoubleHitChance()) {
      const second = this.applySingleHit(this.computeBaseClickDamage());
      hits.push({...second, isDouble: true});
    }
    return hits;
  }

  applyDpsTick() {
    const dps = this.getDpsDamage();
    if (dps <= 0) return null;
    return this.applySingleHit(dps / 10);
  }

  updateUI() {
    const s = this.state;
    const summary = document.getElementById('force-summary');
    if (summary) summary.textContent = `DMG ${formatNum(this.computeBaseClickDamage())} | DPS ${formatNum(this.getDpsDamage())}`;

    FUERZA_UPGRADES.forEach((upg) => {
      const lvl = s[upg.levelKey] || 0;
      const levelEl = document.getElementById(`force-level-${upg.id}`);
      const costEl = document.getElementById(`force-cost-${upg.id}`);
      const effectEl = document.getElementById(`force-effect-${upg.id}`);
      if (levelEl) levelEl.textContent = `Nv. ${lvl}`;
      if (costEl) costEl.textContent = `🪙 ${formatNum(upg.costFn(s))}`;
      if (effectEl) effectEl.textContent = upg.effectText(s);
    });

    const dpsValue = document.getElementById('dps-value');
    if (dpsValue) dpsValue.textContent = formatNum(this.getDpsDamage());
  }
}

window.FuerzaSystem = FuerzaSystem;

const ATTR_STORAGE_KEY = 'lennador_idle_attr_upgrades_v1';

window.ATTR_UPGRADES = [
  {
    id: 'carbon-edge',
    icon: '🪓',
    name: 'Filo de Carbono',
    desc: 'Incrementa el daño automático DPS infligido al tronco en cada golpe automático',
    pointsCost: 1,
    level: 0,
    bonus: 1.30,
  },
  { id: 'empty-2', empty: true },
  { id: 'empty-3', empty: true },
  { id: 'empty-4', empty: true },
  { id: 'empty-5', empty: true },
];

function loadAttrState() {
  try {
    const raw = localStorage.getItem(ATTR_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const carbon = window.ATTR_UPGRADES[0];
    if (parsed && typeof parsed === 'object') {
      if (Number.isFinite(parsed.pointsCost) && parsed.pointsCost >= 1) carbon.pointsCost = parsed.pointsCost;
      if (Number.isFinite(parsed.level) && parsed.level >= 0) carbon.level = parsed.level;
      if (Number.isFinite(parsed.bonus) && parsed.bonus >= 1.3) carbon.bonus = parsed.bonus;
    }
  } catch (_) {}
}

function saveAttrState() {
  const carbon = window.ATTR_UPGRADES[0];
  const state = { pointsCost: carbon.pointsCost, level: carbon.level, bonus: carbon.bonus };
  localStorage.setItem(ATTR_STORAGE_KEY, JSON.stringify(state));
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getNextAttrPreview(u) {
  const nextLevel = u.level + 1;
  const nextCostMin = Math.ceil(u.pointsCost * 1.5);
  const nextCostMax = Math.ceil(u.pointsCost * 3.5);
  const nextBonusMin = u.level === 0 ? 1.3 : u.bonus + 0.15;
  const nextBonusMax = u.level === 0 ? 1.3 : u.bonus + 0.45;
  return { nextLevel, nextCostMin, nextCostMax, nextBonusMin, nextBonusMax };
}

loadAttrState();

window.renderAttrsModal = function renderAttrsModal() {
  let html = `<section class="attrs-panel">
    <p class="modal-section-title attrs-title">Mejoras de Atributos</p>

    <div class="attrs-summary">
      <div class="attrs-stats-scroll" role="region" aria-label="Resumen de estadísticas del personaje">
        <article class="attr-stat-chip stat-chip-level">
          <span class="stat-chip-emoji" aria-hidden="true">🧬</span>
          <span class="label">Nivel</span>
          <span class="value">1</span>
        </article>
        <article class="attr-stat-chip stat-chip-xp">
          <span class="stat-chip-emoji" aria-hidden="true">✨</span>
          <span class="label">XP</span>
          <span class="value">0 / 100</span>
        </article>
        <article class="attr-stat-chip stat-chip-points">
          <span class="stat-chip-emoji" aria-hidden="true">🎯</span>
          <span class="label">Puntos</span>
          <span class="value">0</span>
        </article>
      </div>
    </div>

    <div class="attrs-scroll" role="region" aria-label="Lista de mejoras de atributos">`;

  window.ATTR_UPGRADES.forEach((u, i) => {
    if (u.empty) {
      html += `<div class="upgrade-item upgrade-item-empty"><div class="empty-slot-text">Espacio bloqueado</div></div>`;
      return;
    }

    const preview = getNextAttrPreview(u);

    html += `<div class="upgrade-item attr-upgrade-item carbon-scroll-card">
      <div class="upgrade-icon">${u.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${u.name}</div>
        <div class="upgrade-desc">${u.desc}</div>
        <div class="upgrade-meta-row">
          <div class="upgrade-cost">Costo: ${Math.ceil(u.pointsCost)} punto(s)</div>
          <div class="upgrade-cost">x${u.bonus.toFixed(2)}</div>
        </div>
        <div class="carbon-stats-scroll" role="region" aria-label="Estadísticas de ${u.name}">
          <article class="carbon-stat-mini mini-cost">
            <span class="mini-emoji" aria-hidden="true">🎟️</span>
            <span class="mini-label">Costo actual</span>
            <span class="mini-value">${Math.ceil(u.pointsCost)} pts</span>
          </article>
          <article class="carbon-stat-mini mini-current">
            <span class="mini-emoji" aria-hidden="true">⚔️</span>
            <span class="mini-label">Actual (${u.level})</span>
            <span class="mini-value">x${u.bonus.toFixed(2)}</span>
          </article>
          <article class="carbon-stat-mini mini-next">
            <span class="mini-emoji" aria-hidden="true">🚀</span>
            <span class="mini-label">Próximo (${preview.nextLevel})</span>
            <span class="mini-value">x${preview.nextBonusMin.toFixed(2)} - x${preview.nextBonusMax.toFixed(2)}</span>
          </article>
          <article class="carbon-stat-mini mini-growth">
            <span class="mini-emoji" aria-hidden="true">📈</span>
            <span class="mini-label">Costo siguiente</span>
            <span class="mini-value">${preview.nextCostMin} - ${preview.nextCostMax} pts</span>
          </article>
        </div>
      </div>
      <button class="upgrade-btn" disabled onclick="buyAttrUpgrade(${i})">Sin puntos</button>
    </div>`;
  });

  html += `</div></section>`;
  return html;
};

window.buyAttrUpgrade = function buyAttrUpgrade(i) {
  const u = window.ATTR_UPGRADES[i];
  if (!u || u.empty) return;

  const costMultiplier = randomChoice([1.5, 1.9, 2.2, 2.5, 3.1, 3.5]);
  if (u.level === 0) {
    u.bonus = 1.30;
  } else {
    u.bonus += randomChoice([0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45]);
  }

  u.level += 1;
  u.pointsCost *= costMultiplier;
  saveAttrState();
  showToast(`🪓 ${u.name} mejoró a x${u.bonus.toFixed(2)}`);
  updateUI();
  openModal('attrs');
};

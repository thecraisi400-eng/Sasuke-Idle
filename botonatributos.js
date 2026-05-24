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

loadAttrState();

window.renderAttrsModal = function renderAttrsModal() {
  let html = `<p class="modal-section-title" style="text-align:center;">Mejoras de Atributos</p>
  <div class="stat-row"><span class="label">Nivel</span><span class="value">1</span></div>
  <div class="stat-row"><span class="label">XP</span><span class="value">0 / 100</span></div>
  <div class="stat-row"><span class="label">Puntos Disponibles</span><span class="value">0</span></div>
  <br>`;

  window.ATTR_UPGRADES.forEach((u, i) => {
    if (u.empty) {
      html += `<div class="upgrade-item" style="min-height:84px"></div>`;
      return;
    }

    html += `<div class="upgrade-item">
      <div class="upgrade-icon">${u.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${u.name}</div>
        <div class="upgrade-desc">${u.desc}</div>
        <div class="upgrade-cost">Costo: ${Math.ceil(u.pointsCost)} punto(s)</div>
        <div class="upgrade-cost">Multiplicador actual: x${u.bonus.toFixed(2)}</div>
      </div>
      <button class="upgrade-btn" disabled onclick="buyAttrUpgrade(${i})">Sin puntos</button>
    </div>`;
  });
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

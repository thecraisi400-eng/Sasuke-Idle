function openModal(type) {
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  const titles = {
    axe: '⚔️ Mejorar Hacha',
    attrs: '💪 Atributos',
    shop: '🛒 Tienda',
    missions: '⚔️ Misiones',
    clans: '👥 Clanes',
    skills: '📖 Habilidades',
    events: '📅 Eventos',
    prestige: '👑 Prestigio',
    settings: '⚙️ Ajustes',
  };
  title.textContent = titles[type] || type;
  title.classList.toggle('centered-title', type === 'axe');
  body.innerHTML = renderModal(type);
  overlay.classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function renderModal(type) {
  switch(type) {
    case 'axe': return renderAxeModal();
    case 'attrs': return renderAttrsModal();
    case 'shop': return renderShopModal();
    case 'missions': return renderMissionsModal();
    case 'clans': return renderClansModal();
    case 'skills': return renderSkillsModal();
    case 'events': return renderEventsModal();
    case 'prestige': return renderPrestigeModal();
    case 'settings': return renderSettingsModal();
    default: return '<p>Próximamente...</p>';
  }
}

const axeUpgradeCost = window.axeUpgradeCost;
const renderAxeModal = window.renderAxeModal;
const getAxeUpgradeGain = window.getAxeUpgradeGain;
const buyAxeUpgrade = window.buyAxeUpgrade;
const useWhetstone = window.useWhetstone;

function renderAttrsModal() {
  let html = `<p class="modal-section-title">Mejoras de Atributos</p>
  <div class="stat-row"><span class="label">Nivel</span><span class="value">${G.level}</span></div>
  <div class="stat-row"><span class="label">XP</span><span class="value">${Math.floor(G.xp)} / ${G.xpNeeded}</span></div>
  <div class="stat-row"><span class="label">Multiplicador Prestigio</span><span class="value">x${G.prestigeMultiplier.toFixed(2)}</span></div>
  <br>`;
  ATTR_UPGRADES.forEach((u, i) => {
    const canAfford = u.costCurrency === 'gold' ? G.gold >= u.cost : G.crystals >= u.cost;
    const icon = u.costCurrency === 'gold' ? '🪙' : '💎';
    html += `<div class="upgrade-item">
      <div class="upgrade-icon">💪</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${u.name} ${u.owned ? '✅' : ''}</div>
        <div class="upgrade-desc">${u.desc}</div>
        <div class="upgrade-cost">${u.owned ? 'Comprado' : `Costo: ${u.cost} ${icon}`}</div>
      </div>
      ${!u.owned ? `<button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyAttrUpgrade(${i})">
        ${canAfford ? 'Comprar' : 'Insuf.'}
      </button>` : ''}
    </div>`;
  });
  return html;
}

function buyAttrUpgrade(i) {
  const u = ATTR_UPGRADES[i];
  if (u.owned) return;
  if (u.costCurrency === 'gold' && G.gold < u.cost) { showToast('💰 Oro insuficiente'); return; }
  if (u.costCurrency === 'crystal' && G.crystals < u.cost) { showToast('💎 Cristales insuficientes'); return; }
  if (u.costCurrency === 'gold') G.gold -= u.cost;
  else G.crystals -= u.cost;
  u.owned = true;
  showToast(`✅ ¡${u.name} comprado!`);
  updateUI();
  openModal('attrs');
}

function renderShopModal() {
  let html = `<p class="modal-section-title">Tienda de Objetos</p>`;
  SHOP_ITEMS.forEach((item, i) => {
    const canAfford = item.costCurrency === 'gold' ? G.gold >= item.cost : G.crystals >= item.cost;
    const icon = item.costCurrency === 'gold' ? '🪙' : '💎';
    const gain = item.crystals ? `+${item.crystals} 💎` : `+${fmtNum(item.gold)} 🪙`;
    html += `<div class="upgrade-item">
      <div class="upgrade-icon">${item.crystals ? '💎' : '🪙'}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${item.name}</div>
        <div class="upgrade-desc">${item.desc}</div>
        <div class="upgrade-cost">Precio: ${item.cost} ${icon} → ${gain}</div>
      </div>
      <button class="upgrade-btn" ${!canAfford?'disabled':''} onclick="buyShopItem(${i})">${canAfford?'Comprar':'Insuf.'}</button>
    </div>`;
  });
  return html;
}

function buyShopItem(i) {
  const item = SHOP_ITEMS[i];
  if (item.costCurrency === 'gold' && G.gold < item.cost) { showToast('💰 Oro insuficiente'); return; }
  if (item.costCurrency === 'crystal' && G.crystals < item.cost) { showToast('💎 Cristales insuficientes'); return; }
  if (item.costCurrency === 'gold') G.gold -= item.cost;
  else G.crystals -= item.cost;
  if (item.crystals) { showToast('ℹ️ Las monedas de cristal están desactivadas.'); G.crystals = 0; }
  if (item.gold) { G.gold += item.gold; G.totalGoldEarned += item.gold; showToast(`🪙 +${fmtNum(item.gold)} Oro obtenido!`); }
  updateUI();
  openModal('shop');
}

function renderMissionsModal() {
  let html = `<p class="modal-section-title">Misiones Activas</p>`;
  MISSIONS.forEach(m => {
    const val = G[m.stat];
    const pct = Math.min(100, (val / m.goal * 100)).toFixed(0);
    const done = missionClaimed[m.id];
    const rewardIcon = m.rewardType === 'gold' ? '🪙' : '💎';
    html += `<div class="mission-item">
      <div class="mission-name">${done ? '✅ ' : ''}${m.name}</div>
      <div class="mission-desc">${m.desc}</div>
      <div class="mission-progress"><div class="mission-bar" style="width:${pct}%"></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
        <span style="font-size:10px;color:#888">${fmtNum(Math.min(val,m.goal))} / ${fmtNum(m.goal)}</span>
        <span class="mission-reward">+${m.reward} ${rewardIcon}</span>
      </div>
    </div>`;
  });
  return html;
}

function renderClansModal() {
  return `<p class="modal-section-title">Sistema de Clanes</p>
  <div style="background:#f0f8f0;border-radius:12px;padding:16px;text-align:center;margin-bottom:12px">
    <div style="font-size:40px;margin-bottom:8px">🌲</div>
    <div style="font-family:'Fredoka One',cursive;font-size:18px;color:#2d6a2d">Sin Clan</div>
    <div style="font-size:12px;color:#888;margin-top:4px">Únete a un clan para bonificaciones extra</div>
    <button class="upgrade-btn" style="margin-top:12px" onclick="showToast('🔜 Clanes: próximamente!')">Buscar Clan</button>
  </div>
  <p class="modal-section-title">Clanes Destacados</p>
  ${['🌲 BosqueEterno - Lv50 (30 miembros)','⚔️ HachasDeFuego - Lv38 (25 miembros)','💎 CristalesMágicos - Lv25 (18 miembros)'].map(c=>`<div class="upgrade-item" style="cursor:pointer" onclick="showToast('🔜 Clanes próximamente!')">
    <div style="flex:1;font-family:'Fredoka One',cursive;font-size:13px;color:#333">${c}</div>
    <button class="upgrade-btn" style="font-size:11px">Unirse</button>
  </div>`).join('')}`;
}

function renderSkillsModal() {
  let html = `<div class="stat-row"><span class="label">Puntos de Habilidad</span><span class="value">${G.skillPoints} ⭐</span></div>
  <p class="modal-section-title">Árbol de Habilidades</p>`;
  SKILLS_TREE.forEach(sk => {
    const lvl = G.skills[sk.stat];
    const canUp = G.skillPoints > 0 && lvl < sk.maxLvl;
    html += `<div class="upgrade-item">
      <div class="upgrade-icon">⭐</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${sk.name} (Nv. ${lvl}/${sk.maxLvl})</div>
        <div class="upgrade-desc">${sk.desc}</div>
        <div class="upgrade-cost">Costo: ${sk.costPer} punto(s)</div>
        <div style="margin-top:6px;display:flex;gap:4px">${Array.from({length:sk.maxLvl},(_,j)=>`<div style="width:20px;height:6px;border-radius:3px;background:${j<lvl?'#3a8a3a':'#ddd'}"></div>`).join('')}</div>
      </div>
      <button class="upgrade-btn" ${!canUp?'disabled':''} onclick="buySkill('${sk.stat}',${sk.costPer})">${canUp?'Mejorar':'Máx.'}</button>
    </div>`;
  });
  return html;
}

function buySkill(stat, cost) {
  if (G.skillPoints < cost) { showToast('No tienes puntos suficientes'); return; }
  const sk = SKILLS_TREE.find(s => s.stat === stat);
  if (G.skills[stat] >= sk.maxLvl) { showToast('Habilidad al máximo'); return; }
  G.skillPoints -= cost;
  G.skills[stat]++;
  showToast(`⭐ ¡${sk.name} mejorada!`);
  updateUI();
  openModal('skills');
}

function renderEventsModal() {
  const events = [
    { name:'🌙 Noche de los Leñadores', desc:'x2 Oro durante 30 minutos', active:true },
    { name:'❄️ Invierno Helado', desc:'Cristales dobles al hacer Prestigio', active:false },
    { name:'🔥 Fiebre de Oro', desc:'+50% Oro/seg durante 1 hora', active:false },
  ];
  let html = `<p class="modal-section-title">Eventos Activos</p>`;
  events.forEach(ev => {
    html += `<div class="upgrade-item" style="border-color:${ev.active?'#3a8a3a':'#ddd'}">
      <div style="flex:1">
        <div class="upgrade-name">${ev.name}</div>
        <div class="upgrade-desc">${ev.desc}</div>
        <div style="font-size:11px;margin-top:4px;color:${ev.active?'#2d6a2d':'#aaa'}">${ev.active?'✅ Activo ahora':'🔒 Próximamente'}</div>
      </div>
      ${ev.active?`<button class="upgrade-btn" onclick="showToast('¡Evento activado!')">Participar</button>`:''}
    </div>`;
  });
  return html;
}

function renderPrestigeModal() {
  return `<div class="prestige-box">
    <h3>👑 Prestigio</h3>
    <p>Reinicia tu progreso (Oro, Nivel, Mejoras) para obtener:<br>
    <strong style="color:#f5c518;font-size:16px">Multiplicador de Oro permanente (+10%)</strong></p>
    <div style="font-size:12px;color:#aaa;margin-bottom:12px">Prestigios realizados: ${G.prestigeCount}</div>
    <button class="prestige-confirm-btn" onclick="doPrestige()">⚡ Hacer Prestigio</button>
  </div>
  <p class="modal-section-title">Tus Estadísticas</p>
  <div class="stat-row"><span class="label">Oro total ganado</span><span class="value">${fmtNum(G.totalGoldEarned)} 🪙</span></div>
  <div class="stat-row"><span class="label">Clicks totales</span><span class="value">${G.totalClicks.toLocaleString()}</span></div>
  <div class="stat-row"><span class="label">Prestigios</span><span class="value">${G.prestigeCount}</span></div>
  <div class="stat-row"><span class="label">Multiplicador actual</span><span class="value">x${G.prestigeMultiplier.toFixed(2)}</span></div>
  <div class="stat-row"><span class="label">Tiempo de juego</span><span class="value">Día ${TIME.day} · ${getTimeLabel()}</span></div>`;
}

function doPrestige() {
  if (G.level < 5) { showToast('⚠️ Necesitas al menos Nivel 5 para Prestigiar'); return; }
  G.crystals = 0;
  G.gold = 0;
  G.level = 1;
  G.xp = 0;
  G.xpNeeded = 100;
  G.prestigeMultiplier = +(G.prestigeMultiplier * 1.1).toFixed(2);
  G.prestigeCount++;
  G.totalPrestige++;
  G.axeGoldPerClick = 1;
  G.axeGoldPerSec = 0.5;
  G.axeDamage = 0.5;
  G.axeAttackSpeed = 1;
  G.axeCritChance = 0;
  G.axeDoubleChance = 0;
  G.whetstones = 0;
  G.whetstoneBoostUntil = 0;
  AXE_UPGRADES.forEach(u => u.owned = false);
  ATTR_UPGRADES.forEach(u => u.owned = false);
  showToast(`🌟 ¡Prestigio! +${reward} 💎 Cristales. Multiplicador: x${G.prestigeMultiplier.toFixed(2)}`);
  checkMissions();
  updateUI();
  closeModal();
}

function renderSettingsModal() {
  return `<p class="modal-section-title">Preferencias</p>
  <div class="settings-row">
    <span class="setting-label">🔊 Sonido</span>
    <button class="toggle ${G.sound?'on':''}" onclick="toggleSetting('sound',this)"></button>
  </div>
  <div class="settings-row">
    <span class="setting-label">🔔 Notificaciones</span>
    <button class="toggle ${G.notifications?'on':''}" onclick="toggleSetting('notifications',this)"></button>
  </div>
  <p class="modal-section-title" style="margin-top:12px">Datos del Juego</p>
  <div class="upgrade-item" style="flex-direction:column;gap:8px">
    <div style="font-size:13px;color:#555">¿Quieres borrar todo tu progreso? Esta acción es irreversible.</div>
    <button class="upgrade-btn" style="background:linear-gradient(135deg,#c0392b,#922b21);align-self:flex-start" onclick="resetGame()">🗑️ Borrar Progreso</button>
  </div>
  <p class="modal-section-title" style="margin-top:12px">Acerca del Juego</p>
  <div style="font-size:12px;color:#777;line-height:1.6">
    <strong>Leñador Idle v1.0</strong><br>
    El leñador auto-golpea el tronco con su DPS. Al romper un palo, subes de nivel.<br>
    Haz clic en la madera acumulada para reclamar el Oro.<br>
    ¡Realiza Prestigio para obtener Cristales y multiplicadores!<br><br>
    <strong>Sistema de Tiempo:</strong> Cada segundo real = 1 minuto de juego.<br>
    🌅 6:00 AM – Sale el sol (desde la izquierda)<br>
    🌇 5:00 PM – Empieza el atardecer<br>
    🌆 6:00 PM – El sol se oculta completamente<br>
    🌙 7:00 PM – Sale la luna llena (desde la izquierda) + estrellas<br>
    🌑 4:00 AM – La luna desaparece<br>
    🌄 5:00 AM – Amanecer, el sol empieza a salir<br>
    Cada medianoche suma 1 día al contador.
  </div>`;
}

function toggleSetting(key, btn) {
  G[key] = !G[key];
  btn.classList.toggle('on', G[key]);
  saveGame();
}

function resetGame() {
  if (confirm('¿Estás seguro? Se perderá TODO tu progreso.')) {
    localStorage.removeItem('lenador_idle_v1');
    location.reload();
  }
}

// =============================================
// TOAST
// =============================================
let toastTimeout;
let nextLevelBannerTimeout;
function showNextLevelBanner() {
  const banner = document.getElementById('next-level-banner');
  if (!banner) return;
  banner.classList.add('show');

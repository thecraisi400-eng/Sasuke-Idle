// =============================================
// GAME STATE
// =============================================
const G = {
  gold: 0,
  crystals: 0,
  level: 1,
  xp: 0,
  xpNeeded: 100,
  prestigeMultiplier: 1,
  prestigeCount: 0,

  axeLevel: 1,
  axeGoldPerClick: 1,
  axeGoldPerSec: 0.5,

  lumberLevel: 1,
  lumberBonus: 0,

  sound: true,
  notifications: true,

  totalClicks: 0,
  totalGoldEarned: 0,
  totalPrestige: 0,

  skillPoints: 0,
  skills: { strength: 0, speed: 0, luck: 0, endurance: 0 }
};

// =============================================
// CAMBIO 2 & 3: SISTEMA DE TIEMPO
// 1 segundo real = 1 minuto de juego
// 60 segundos reales = 1 hora de juego
// El juego empieza a las 6:00 AM del Día 1
// =============================================
const TIME = {
  // gameMinutes = minutos transcurridos desde las 0:00 AM del Día 1
  // Empieza en 6*60 = 360 minutos (6:00 AM)
  gameMinutes: 360,
  day: 1,
  lastRealSecond: Date.now()
};

function getGameHour() {
  // Total minutos del día actual (0-1439)
  const minutesInDay = TIME.gameMinutes % 1440;
  return minutesInDay / 60; // hora decimal (0-24)
}

function getTimeLabel() {
  const minutesInDay = TIME.gameMinutes % 1440;
  let h = Math.floor(minutesInDay / 60);
  const m = minutesInDay % 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function isNight() {
  const h = getGameHour();
  return h >= 18 || h < 6;
}

function getNightAlpha() {
  const h = getGameHour();
  if (h >= 6 && h < 18) return 0; // día
  // transición: 18-19 (oscurece), 5-6 (aclara)
  if (h >= 18 && h < 19) return (h - 18) * 0.75; // 0→0.75
  if (h >= 19 || h < 5) return 0.75; // noche completa
  if (h >= 5 && h < 6) return (6 - h) * 0.75; // 0.75→0
  return 0;
}

function updateTimeSystem() {
  // Actualiza cada segundo real = 1 minuto de juego
  const now = Date.now();
  const elapsed = now - TIME.lastRealSecond;
  if (elapsed >= 1000) {
    const minutesPassed = Math.floor(elapsed / 1000);
    TIME.lastRealSecond += minutesPassed * 1000;

    const prevMinutesInDay = TIME.gameMinutes % 1440;
    TIME.gameMinutes += minutesPassed;

    // Verificar si cruzó medianoche (0:00 AM = 0 minutos en el día)
    const newMinutesInDay = TIME.gameMinutes % 1440;
    // Si cruzamos el 0 del día
    if (prevMinutesInDay > newMinutesInDay && newMinutesInDay < prevMinutesInDay) {
      TIME.day++;
    }
    // Comprobación alternativa: cada vez que gameMinutes pase un múltiplo de 1440
    const prevDay = Math.floor((TIME.gameMinutes - minutesPassed) / 1440);
    const newDay = Math.floor(TIME.gameMinutes / 1440);
    if (newDay > prevDay) {
      TIME.day = newDay + 1;
    }

    // Actualizar displays
    document.getElementById('day-display').textContent = `Día: ${TIME.day}`;
    document.getElementById('clock-display').textContent = getTimeLabel();

    // Actualizar overlay de noche
    const alpha = getNightAlpha();
    document.getElementById('night-overlay').style.background = `rgba(5,10,40,${alpha})`;

    // Actualizar color del cielo en el canvas (se refrescará en drawScene)
  }
}

// =============================================
// Cálculo de posición del Sol/Luna — CAMBIO 3
// Sol: 6 AM (izquierda) → 6 PM (derecha)
// Luna: 6 PM (izquierda) → 6 AM (derecha)
// =============================================
function getCelestialPosition(canvasW, canvasH) {
  const h = getGameHour(); // 0-24 decimal
  const topY = canvasH * 0.08;
  const midY = canvasH * 0.12;

  if (h >= 6 && h < 18) {
    // Es de día — sol viaja de izquierda a derecha
    // h=6 → t=0, h=18 → t=1
    const t = (h - 6) / 12;
    const x = canvasW * 0.05 + t * canvasW * 0.90;
    // Arco: más alto en el centro
    const arc = Math.sin(t * Math.PI) * canvasH * 0.12;
    const y = midY - arc + topY;
    return { type: 'sun', x, y };
  } else {
    // Es de noche — luna viaja de izquierda a derecha
    // h=18 → t=0, h=30(=6AM siguiente) → t=1
    let t;
    if (h >= 18) {
      t = (h - 18) / 12;
    } else {
      // h < 6 → continúa desde la noche anterior
      t = (h + 6) / 12;
    }
    const x = canvasW * 0.05 + t * canvasW * 0.90;
    const arc = Math.sin(t * Math.PI) * canvasH * 0.10;
    const y = midY - arc + topY;
    return { type: 'moon', x, y };
  }
}

// Colores de cielo según hora
function getSkyGradient(ctx, canvasH, hour) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvasH * 0.55);
  if (hour >= 6 && hour < 8) {
    // Amanecer
    grad.addColorStop(0, '#ff9a5e');
    grad.addColorStop(0.5, '#ffd0a0');
    grad.addColorStop(1, '#b8e4a0');
  } else if (hour >= 8 && hour < 17) {
    // Día normal
    grad.addColorStop(0, '#87ceeb');
    grad.addColorStop(1, '#b8e4a0');
  } else if (hour >= 17 && hour < 19) {
    // Atardecer
    grad.addColorStop(0, '#ff6b35');
    grad.addColorStop(0.4, '#ffaa55');
    grad.addColorStop(1, '#b8c0a0');
  } else {
    // Noche
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(0.6, '#1a1a4a');
    grad.addColorStop(1, '#2a2a40');
  }
  return grad;
}

// Upgrade definitions
const AXE_UPGRADES = [
  { id:'ax1', name:'Hacha de Hierro',     desc:'+2 Oro/click, +1 Oro/seg',  cost:50,   costCurrency:'gold',    gpc:2,  gps:1,   owned:false },
  { id:'ax2', name:'Hacha de Acero',      desc:'+5 Oro/click, +3 Oro/seg',  cost:200,  costCurrency:'gold',    gpc:5,  gps:3,   owned:false },
  { id:'ax3', name:'Hacha de Titanio',    desc:'+15 Oro/click, +8 Oro/seg', cost:800,  costCurrency:'gold',    gpc:15, gps:8,   owned:false },
  { id:'ax4', name:'Hacha Encantada',     desc:'+40 Oro/click, +20 Oro/seg',cost:50,   costCurrency:'crystal', gpc:40, gps:20,  owned:false },
  { id:'ax5', name:'Hacha Legendaria',    desc:'+100 Oro/click, +60 Oro/seg',cost:150, costCurrency:'crystal', gpc:100,gps:60,  owned:false },
];

const ATTR_UPGRADES = [
  { id:'at1', name:'Fuerza I',      desc:'+10% Oro/seg',        cost:100,  costCurrency:'gold',    pct:0.10, owned:false },
  { id:'at2', name:'Fuerza II',     desc:'+25% Oro/seg',        cost:500,  costCurrency:'gold',    pct:0.25, owned:false },
  { id:'at3', name:'Resistencia I', desc:'+15% Oro/click',      cost:300,  costCurrency:'gold',    pct:0.15, owned:false },
  { id:'at4', name:'Agilidad',      desc:'+0.5 Oro/seg base',   cost:30,   costCurrency:'crystal', flat:0.5, owned:false },
  { id:'at5', name:'Maestría',      desc:'+50% todo el oro',    cost:100,  costCurrency:'crystal', pct:0.50, all:true, owned:false },
];

const MISSIONS = [
  { id:'m1', name:'Primer Golpe',    desc:'Haz tu primer click en el leñador.',   goal:1,    stat:'totalClicks',     reward:10,   rewardType:'gold' },
  { id:'m2', name:'Leñador Novato',  desc:'Acumula 100 clics totales.',           goal:100,  stat:'totalClicks',     reward:100,  rewardType:'gold' },
  { id:'m3', name:'Trabajador',      desc:'Acumula 1,000 clics totales.',         goal:1000, stat:'totalClicks',     reward:500,  rewardType:'gold' },
  { id:'m4', name:'Riqueza Inicial', desc:'Gana 1,000 Oro total.',               goal:1000, stat:'totalGoldEarned', reward:5,    rewardType:'crystal' },
  { id:'m5', name:'Millonario',      desc:'Gana 100,000 Oro total.',             goal:100000,stat:'totalGoldEarned',reward:20,   rewardType:'crystal' },
  { id:'m6', name:'Renacido',        desc:'Realiza 1 Prestigio.',                goal:1,    stat:'totalPrestige',   reward:50,   rewardType:'crystal' },
];
const missionClaimed = {};

const SHOP_ITEMS = [
  { id:'sh1', name:'Bolsa de Cristales',   desc:'Obtén 10 Cristales al instante.',    cost:500,  costCurrency:'gold',    crystals:10 },
  { id:'sh2', name:'Caja de Cristales',    desc:'Obtén 50 Cristales al instante.',    cost:2000, costCurrency:'gold',    crystals:50 },
  { id:'sh3', name:'Cofre de Cristales',   desc:'Obtén 200 Cristales al instante.',   cost:8000, costCurrency:'gold',    crystals:200 },
  { id:'sh4', name:'Poción de Oro',        desc:'+5,000 Oro instantáneo.',            cost:20,   costCurrency:'crystal', gold:5000 },
  { id:'sh5', name:'Elixir del Bosque',    desc:'+20,000 Oro instantáneo.',           cost:50,   costCurrency:'crystal', gold:20000 },
];

const SKILLS_TREE = [
  { id:'str', name:'Fuerza Bruta', desc:'+20% Oro/click por nivel', stat:'strength', maxLvl:5, costPer:1 },
  { id:'spd', name:'Velocidad',    desc:'+15% Oro/seg por nivel',   stat:'speed',    maxLvl:5, costPer:1 },
  { id:'lck', name:'Suerte',       desc:'+10% chance crítico x2',   stat:'luck',     maxLvl:3, costPer:2 },
  { id:'end', name:'Resistencia',  desc:'+25% bonificación pasiva',  stat:'endurance',maxLvl:3, costPer:2 },
];

// =============================================
// COMPUTED VALUES
// =============================================
function computeGPS() {
  let base = G.axeGoldPerSec;
  if (ATTR_UPGRADES[0].owned) base *= 1.10;
  if (ATTR_UPGRADES[1].owned) base *= 1.25;
  if (ATTR_UPGRADES[3].owned) base += 0.5;
  if (ATTR_UPGRADES[4].owned) base *= 1.50;
  base *= (1 + G.skills.speed * 0.15);
  base *= (1 + G.skills.endurance * 0.25);
  base *= G.prestigeMultiplier;
  return base;
}

function computeGPC() {
  let base = G.axeGoldPerClick;
  if (ATTR_UPGRADES[2].owned) base *= 1.15;
  if (ATTR_UPGRADES[4].owned) base *= 1.50;
  base *= (1 + G.skills.strength * 0.20);
  base *= G.prestigeMultiplier;
  if (G.skills.luck > 0 && Math.random() < G.skills.luck * 0.10) base *= 2;
  return Math.max(1, Math.floor(base));
}

// =============================================
// SAVE / LOAD
// =============================================
function saveGame() {
  const save = {
    G: { ...G },
    AXE_UPGRADES: AXE_UPGRADES.map(u => u.owned),
    ATTR_UPGRADES: ATTR_UPGRADES.map(u => u.owned),
    missionClaimed: { ...missionClaimed },
    TIME: { gameMinutes: TIME.gameMinutes, day: TIME.day }
  };
  try { localStorage.setItem('lenador_idle_v1', JSON.stringify(save)); } catch(e){}
}

function loadGame() {
  try {
    const raw = localStorage.getItem('lenador_idle_v1');
    if (!raw) return;
    const save = JSON.parse(raw);
    Object.assign(G, save.G);
    if (save.AXE_UPGRADES) save.AXE_UPGRADES.forEach((v,i) => { AXE_UPGRADES[i].owned = v; });
    if (save.ATTR_UPGRADES) save.ATTR_UPGRADES.forEach((v,i) => { ATTR_UPGRADES[i].owned = v; });
    if (save.missionClaimed) Object.assign(missionClaimed, save.missionClaimed);
    if (save.TIME) {
      TIME.gameMinutes = save.TIME.gameMinutes;
      TIME.day = save.TIME.day;
    }
  } catch(e) {}
}

// =============================================
// UI UPDATE
// =============================================
function fmtNum(n) {
  if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return Math.floor(n).toLocaleString();
}

function updateUI() {
  document.getElementById('gold-display').textContent = fmtNum(G.gold);
  document.getElementById('crystals-display').textContent = fmtNum(G.crystals);
  document.getElementById('level-display').textContent = 'Nivel ' + G.level;
  document.getElementById('dps-display').textContent = computeGPS().toFixed(1);
}

function checkLevelUp() {
  while (G.xp >= G.xpNeeded) {
    G.xp -= G.xpNeeded;
    G.xpNeeded = Math.floor(G.xpNeeded * 1.5);
    G.crystals += G.level;
    if (G.level % 5 === 0) {
      G.skillPoints++;
      showToast(`⭐ +1 Punto de Habilidad (Nv. ${G.level})`);
    }
  }
}

function checkMissions() {
  MISSIONS.forEach(m => {
    if (missionClaimed[m.id]) return;
    if (G[m.stat] >= m.goal) {
      missionClaimed[m.id] = true;
      if (m.rewardType === 'gold') { G.gold += m.reward; G.totalGoldEarned += m.reward; }
      else G.crystals += m.reward;
      showToast(`✅ Misión "${m.name}" completada! +${m.reward} ${m.rewardType === 'gold' ? 'Oro' : 'Cristales'}`);
    }
  });
}

// =============================================
// SCENE CANVAS
// =============================================
const canvas = document.getElementById('scene-canvas');
const ctx = canvas.getContext('2d');
let animFrame = 0;
let chopAngle = 0;
let chopDir = 1;

// =============================================
// LOG HP SYSTEM
// =============================================
const LOG_MAX_HP = 20;
let logHP = LOG_MAX_HP;
let logHPDisplay = LOG_MAX_HP;

let shakeTimer = 0;
let shakeIntensity = 0;

let flyingLog = null;

let collectedLogs = 0;
let logPileVisible = false;
let logPileGold = 0;
let logPileClickable = false;

// CAMBIO 1: Variables para efecto de clic en troncos
let pileClickEffect = null; // { x, y, t } para animación de sparkle en canvas

function getGoldPerLog() {
  return computeGPC() * 10;
}

function damageLog(amount) {
  logHP -= amount;
  if (logHP <= 0) {
    logHP = 0;
    triggerLogBreak();
  }
}

function triggerLogBreak() {
  shakeTimer = 25;
  shakeIntensity = 6;

  G.level++;
  showToast(`🪓 ¡Palo roto! Nivel ${G.level}`);
  if (G.level % 5 === 0) {
    G.skillPoints++;
    showToast(`⭐ +1 Punto de Habilidad (Nv. ${G.level})`);
  }
  updateUI();

  const goldEarned = getGoldPerLog();
  logPileGold += goldEarned;

  collectedLogs++;
  logPileVisible = true;
  logPileClickable = true;

  const W = canvas.width, H = canvas.height;
  const groundY = H * 0.775;
  const logX = W * 0.38 + W * 0.38;
  const logY = groundY - 18 + 14;

  const pileX = getPileX(W);
  const pileY = groundY - 10;

  flyingLog = {
    startX: logX,
    startY: logY,
    x: logX,
    y: logY,
    targetX: pileX,
    targetY: pileY,
    progress: 0,
    angle: 0,
    spin: 0.15
  };

  setTimeout(() => {
    logHP = LOG_MAX_HP;
    logHPDisplay = LOG_MAX_HP;
  }, 300);
}

function getPileX(W) {
  return W * 0.13;
}

function getLogsInPile() {
  return Math.min(collectedLogs, 6);
}

function getExtraLogCount() {
  return collectedLogs > 6 ? collectedLogs - 6 : 0;
}

function drawSmallStandingLog(ctx, x, y, w, h) {
  const grad = ctx.createLinearGradient(x - w/2, 0, x + w/2, 0);
  grad.addColorStop(0, '#5D3A1A');
  grad.addColorStop(0.3, '#8B5E3C');
  grad.addColorStop(0.7, '#7a4f22');
  grad.addColorStop(1, '#4a2c0a');
  ctx.fillStyle = grad;
  ctx.strokeStyle = '#3d2208';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x - w/2, y - h, w, h, [2, 2, 1, 1]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#c4956a';
  ctx.strokeStyle = '#8B5E3C';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, y - h, w/2, w * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(93,58,26,0.4)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.ellipse(x, y - h, w/2 * 0.6, w * 0.28 * 0.6, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(45,26,5,0.3)';
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 3; i++) {
    const ly = y - h + h * (0.2 + i * 0.28);
    ctx.beginPath();
    ctx.moveTo(x - w/2 + 1, ly);
    ctx.lineTo(x + w/2 - 1, ly + 1);
    ctx.stroke();
  }
}

// CAMBIO 5: pile drawn 7% lower
function drawLogPile(ctx, W, H) {
  const groundY = H * 0.775;
  const pileX = getPileX(W);
  const logsInPile = getLogsInPile();
  const extra = getExtraLogCount();
  const offsetDown = H * 0.07;

  if (logsInPile === 0 && !flyingLog) return;

  const lw = 18, lh = 28;
  const spacing = 22;

  const layout = [
    { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
    { col: 0.5, row: 1 }, { col: 1.5, row: 1 },
    { col: 1, row: 2 },
  ];

  for (let i = 0; i < logsInPile; i++) {
    const pos = layout[i];
    const lx = pileX + (pos.col - 1) * spacing;
    const ly = groundY + offsetDown - pos.row * (lh * 0.8);
    drawSmallStandingLog(ctx, lx, ly, lw, lh);
  }

  if (extra > 0) {
    const centerX = pileX;
    const centerY = groundY + offsetDown - lh * 1.5;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.font = `bold 13px 'Fredoka One', cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${extra + 6}`, centerX, centerY);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  if (logPileClickable && logsInPile > 0) {
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 300);
    const cx = pileX;
    const cy = groundY + offsetDown - lh;
    const glow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 40);
    glow.addColorStop(0, `rgba(255,215,0,${0.15 + 0.1 * pulse})`);
    glow.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;
    ctx.font = `bold 11px 'Fredoka One', cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const labelY = groundY + offsetDown - lh * 2.2 - (logsInPile >= 6 ? 18 : 0);
    ctx.strokeText(`🪙 ${fmtNum(logPileGold)}`, cx, labelY);
    ctx.fillText(`🪙 ${fmtNum(logPileGold)}`, cx, labelY);
    ctx.textAlign = 'left';
  }

  // CAMBIO 1: Dibujar efecto de clic en la pila (sparkles en canvas)
  if (pileClickEffect) {
    pileClickEffect.t += 0.07;
    if (pileClickEffect.t >= 1) {
      pileClickEffect = null;
    } else {
      const t = pileClickEffect.t;
      const cx = pileClickEffect.x;
      const cy = pileClickEffect.y;
      const sparkCount = 8;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (i / sparkCount) * Math.PI * 2;
        const dist = 30 * t;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;
        const alpha = 1 - t;
        const colors = ['#FFD700', '#FFA500', '#FF8C00', '#fff'];
        ctx.fillStyle = colors[i % colors.length].replace(')', `,${alpha})`).replace('rgb', 'rgba').replace('#', '');
        // Usa fillStyle directo con rgba
        ctx.globalAlpha = alpha;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(sx, sy, 3 * (1 - t * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      // Destellos tipo estrella en el centro
      ctx.globalAlpha = (1 - t) * 0.8;
      ctx.fillStyle = '#FFD700';
      ctx.font = `bold ${14 + t * 8}px 'Fredoka One', cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨', cx, cy - 20 * t);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  }
}

function drawFlyingLog(ctx) {
  if (!flyingLog) return;

  flyingLog.progress += 0.04;
  if (flyingLog.progress >= 1) {
    flyingLog = null;
    return;
  }

  const t = flyingLog.progress;
  const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;

  const x = flyingLog.startX + (flyingLog.targetX - flyingLog.startX) * ease;
  const arcHeight = -120;
  const y = flyingLog.startY + (flyingLog.targetY - flyingLog.startY) * ease + arcHeight * Math.sin(Math.PI * t);

  flyingLog.angle += flyingLog.spin;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(flyingLog.angle);
  drawSmallStandingLog(ctx, 0, 0, 14, 22);
  ctx.restore();
}

function drawHPBar(ctx, W, H) {
  const groundY = H * 0.775;
  const logX = W * 0.38;
  const logW = W * 0.38;
  const logY = groundY - 18;

  const barW = logW;
  const barH = 16;
  const barX = logX;
  const barY = logY - barH - 6;

  const hpFrac = Math.max(0, logHPDisplay / LOG_MAX_HP);

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.fill();

  if (hpFrac > 0) {
    ctx.fillStyle = '#e03030';
    ctx.beginPath();
    ctx.roundRect(barX + 1, barY + 1, (barW - 2) * hpFrac, barH - 2, 3);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.roundRect(barX + 1, barY + 1, (barW - 2) * hpFrac, (barH - 2) * 0.45, [3, 3, 0, 0]);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = `bold 10px 'Fredoka One', cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 3;
  ctx.fillText(`${Math.ceil(logHPDisplay)} / ${LOG_MAX_HP}`, barX + barW / 2, barY + barH / 2);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function resizeCanvas() {
  const top = document.getElementById('top-section');
  canvas.width = top.clientWidth;
  canvas.height = top.clientHeight;
}

function drawRealisticTree(ctx, x, groundY, scale) {
  const trunkH = 110 * scale;
  const trunkW = 18 * scale;

  const trunkGrad = ctx.createLinearGradient(x - trunkW/2, 0, x + trunkW/2, 0);
  trunkGrad.addColorStop(0, '#4a2c0a');
  trunkGrad.addColorStop(0.3, '#7a4f22');
  trunkGrad.addColorStop(0.7, '#6b4218');
  trunkGrad.addColorStop(1, '#3d2208');
  ctx.fillStyle = trunkGrad;
  ctx.strokeStyle = '#2d1a05';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(x - trunkW/2, groundY);
  ctx.bezierCurveTo(x - trunkW/2 - 4*scale, groundY - trunkH*0.3, x - trunkW/2 + 2*scale, groundY - trunkH*0.7, x - trunkW/3, groundY - trunkH);
  ctx.lineTo(x + trunkW/3, groundY - trunkH);
  ctx.bezierCurveTo(x + trunkW/2 + 2*scale, groundY - trunkH*0.7, x + trunkW/2 - 4*scale, groundY - trunkH*0.3, x + trunkW/2, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(45,26,5,0.4)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) {
    const ly = groundY - trunkH * (0.15 + i * 0.17);
    ctx.beginPath();
    ctx.moveTo(x - trunkW/2 + 2, ly);
    ctx.bezierCurveTo(x - 2, ly - 4*scale, x + 3, ly + 2*scale, x + trunkW/2 - 2, ly - 2*scale);
    ctx.stroke();
  }

  ctx.fillStyle = '#4a2c0a';
  ctx.strokeStyle = '#2d1a05';
  ctx.lineWidth = 1;
  [[-1.1, 0.7], [-0.5, 0.85], [0.5, 0.85], [1.1, 0.7]].forEach(([ox, oy]) => {
    ctx.beginPath();
    ctx.ellipse(x + ox * trunkW * 0.8, groundY - 4*scale, trunkW * 0.25, 8*scale, ox * 0.4, 0, Math.PI*2);
    ctx.fill();
  });

  const night = isNight();
  const foliageColors = night ? [
    ['#0d3a0d', '#082808', '#0f4410'],
    ['#0f5210', '#0a3a0a', '#124614'],
    ['#125a12', '#0c420c', '#165e16'],
    ['#185c18', '#104010', '#1c6a1c'],
  ] : [
    ['#1a5c1a', '#0f4010', '#236623'],
    ['#228B22', '#196019', '#2d7a2d'],
    ['#2d8b2d', '#1f6b1f', '#3a923a'],
    ['#3a9a3a', '#2a7a2a', '#4aaa4a'],
  ];

  const layers = [
    [0,      0,      55*scale, 70*scale, 0,     0],
    [-20*scale, 20*scale, 45*scale, 55*scale, -0.3, 1],
    [ 22*scale, 15*scale, 42*scale, 52*scale,  0.3, 1],
    [ 0,      -20*scale, 40*scale, 45*scale,  0,   2],
    [-28*scale, 40*scale, 35*scale, 42*scale, -0.4, 3],
    [ 30*scale, 35*scale, 33*scale, 40*scale,  0.4, 3],
    [ 8*scale, -35*scale, 30*scale, 38*scale,  0.1, 2],
    [-10*scale, -10*scale, 38*scale, 48*scale, -0.15,1],
  ];

  const baseY = groundY - trunkH;

  layers.forEach(([rx2, ry2, ex, ey, rot, ci]) => {
    const [dark, darker, light] = foliageColors[ci];
    const cx2 = x + rx2, cy2 = baseY + ry2;

    const grad = ctx.createRadialGradient(cx2 - ex*0.2, cy2 - ey*0.3, ex*0.1, cx2, cy2, Math.max(ex, ey));
    grad.addColorStop(0, light);
    grad.addColorStop(0.5, dark);
    grad.addColorStop(1, darker);

    ctx.save();
    ctx.translate(cx2, cy2);
    ctx.rotate(rot);
    ctx.fillStyle = grad;
    ctx.strokeStyle = darker;
    ctx.lineWidth = 1;

    ctx.beginPath();
    const pts = 10;
    for (let i = 0; i <= pts; i++) {
      const angle = (i / pts) * Math.PI * 2;
      const jitter = 0.85 + 0.15 * Math.sin(i * 3.7 + rx2);
      const px2 = Math.cos(angle) * ex * jitter;
      const py2 = Math.sin(angle) * ey * jitter;
      i === 0 ? ctx.moveTo(px2, py2) : ctx.lineTo(px2, py2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}

// =============================================
// DRAW MOON — CAMBIO 3
// =============================================
function drawMoon(ctx, x, y, r) {
  // Glow de luna
  const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3);
  glow.addColorStop(0, 'rgba(200,220,255,0.2)');
  glow.addColorStop(0.5, 'rgba(160,180,255,0.08)');
  glow.addColorStop(1, 'rgba(100,120,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fill();

  // Cuerpo de la luna (círculo amarillo-blanco)
  ctx.fillStyle = '#f0f0d0';
  ctx.strokeStyle = '#c8c890';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sombra crescent
  ctx.fillStyle = 'rgba(30,30,60,0.3)';
  ctx.beginPath();
  ctx.arc(x + r * 0.25, y, r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Cráteres
  ctx.fillStyle = 'rgba(180,180,150,0.4)';
  [[- r*0.3, -r*0.2, r*0.1], [r*0.1, r*0.3, r*0.07], [-r*0.1, r*0.1, r*0.05]].forEach(([cx2, cy2, cr]) => {
    ctx.beginPath();
    ctx.arc(x + cx2, y + cy2, cr, 0, Math.PI * 2);
    ctx.fill();
  });

  // Estrellas alrededor cuando es de noche
  const h = getGameHour();
  if (h >= 19 || h < 5) {
    // Dibujar algunas estrellas
    const stars = [
      [x + r*2.5, y - r*1.5], [x - r*2, y + r*0.5], [x + r*1.5, y + r*2],
      [x - r*3, y - r*0.8], [x + r*3.5, y + r*0.3], [x - r*1.5, y - r*2.5],
      [x + r*0.5, y - r*3], [x - r*2.5, y + r*2]
    ];
    stars.forEach(([sx, sy]) => {
      ctx.fillStyle = 'rgba(255,255,220,0.9)';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// =============================================
// LUMBERJACK SPRITE
// =============================================
function drawLumberjack(ctx, cx, groundY, chopAngle) {
  ctx.save();
  ctx.translate(cx, groundY);

  const s = 0.72;

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, -2, 16*s, 5*s, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = '#3a2510';
  ctx.strokeStyle = '#1e1208';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-13*s, -12*s, 11*s, 8*s, 2*s);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(2*s, -12*s, 11*s, 8*s, 2*s);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#2c3e60';
  ctx.strokeStyle = '#1a2540';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-12*s, -30*s, 10*s, 20*s, 2*s);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(2*s, -30*s, 10*s, 20*s, 2*s);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#c0392b';
  ctx.strokeStyle = '#8e1a10';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(-14*s, -54*s, 28*s, 26*s, [3*s, 3*s, 0, 0]);
  ctx.fill(); ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1.5*s;
  for (let i = 0; i < 3; i++) {
    const ly = -48*s + i * 8*s;
    ctx.beginPath();
    ctx.moveTo(-14*s, ly); ctx.lineTo(14*s, ly);
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const lx = -8*s + i * 8*s;
    ctx.beginPath();
    ctx.moveTo(lx, -54*s); ctx.lineTo(lx, -28*s);
    ctx.stroke();
  }

  ctx.fillStyle = '#8B5E3C';
  ctx.strokeStyle = '#5D3A1A';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(-10*s, -54*s, 4*s, 28*s, 1*s);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(6*s, -54*s, 4*s, 28*s, 1*s);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#c0392b';
  ctx.strokeStyle = '#8e1a10';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-22*s, -52*s, 9*s, 22*s, 3*s);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#d4956a';
  ctx.strokeStyle = '#a06840';
  ctx.beginPath();
  ctx.ellipse(-17*s, -31*s, 5*s, 5*s, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#d4956a';
  ctx.strokeStyle = '#a06840';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, -66*s, 12*s, 12*s, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#6b3e20';
  ctx.beginPath();
  ctx.ellipse(0, -59*s, 9*s, 5*s, 0, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(-4*s, -67*s, 1.5*s, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(4*s, -67*s, 1.5*s, 0, Math.PI*2); ctx.fill();

  ctx.strokeStyle = '#4a2c10';
  ctx.lineWidth = 2*s;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6*s, -71*s); ctx.lineTo(-2*s, -72*s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6*s, -71*s); ctx.lineTo(2*s, -72*s); ctx.stroke();

  ctx.fillStyle = '#3d2a0f';
  ctx.strokeStyle = '#1e1208';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, -76*s, 18*s, 5*s, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4a3315';
  ctx.strokeStyle = '#1e1208';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-11*s, -92*s, 22*s, 17*s, [4*s, 4*s, 0, 0]);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1a1208';
  ctx.beginPath();
  ctx.roundRect(-11*s, -80*s, 22*s, 4*s, 0);
  ctx.fill();

  ctx.save();
  ctx.translate(14*s, -50*s);
  ctx.rotate(chopAngle);

  ctx.fillStyle = '#c0392b';
  ctx.strokeStyle = '#8e1a10';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-4*s, 0, 9*s, 20*s, 3*s);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#d4956a';
  ctx.strokeStyle = '#a06840';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0*s, 22*s, 5*s, 5*s, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#8B5E3C';
  ctx.strokeStyle = '#5D3A1A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-2*s, 18*s, 5*s, 28*s, 2*s);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#9e9e9e';
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-2*s, 20*s);
  ctx.lineTo(-16*s, 14*s);
  ctx.lineTo(-18*s, 20*s);
  ctx.lineTo(-14*s, 32*s);
  ctx.lineTo(-2*s, 30*s);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-16*s, 15*s);
  ctx.lineTo(-14*s, 30*s);
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

function drawScene() {
  const W = canvas.width, H = canvas.height;

  // Update time system
  updateTimeSystem();

  let sx = 0, sy = 0;
  if (shakeTimer > 0) {
    shakeTimer--;
    sx = (Math.random() - 0.5) * shakeIntensity;
    sy = (Math.random() - 0.5) * shakeIntensity;
    shakeIntensity *= 0.88;
    if (shakeTimer === 0) { sx = 0; sy = 0; }
  }

  ctx.save();
  ctx.translate(sx, sy);
  ctx.clearRect(-10, -10, W + 20, H + 20);

  const groundY = H * 0.775;
  const hour = getGameHour();
  const night = isNight();

  // ===== CIELO — CAMBIO 3: color dinámico =====
  const skyGrad = getSkyGradient(ctx, H, hour);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, groundY);

  // ===== ESTRELLAS (noche) — CAMBIO 3 =====
  if (hour >= 19 || hour < 5) {
    const starCount = 40;
    // Usa seed fijo para que no parpadeen
    for (let i = 0; i < starCount; i++) {
      const sx2 = ((i * 137 + 50) % W);
      const sy2 = ((i * 97 + 30) % (H * 0.5));
      const twinkle = 0.5 + 0.5 * Math.sin(Date.now() / 800 + i);
      ctx.globalAlpha = 0.4 + 0.5 * twinkle;
      ctx.fillStyle = '#fffde0';
      ctx.beginPath();
      ctx.arc(sx2, sy2, 1 + (i % 2) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ===== SOL / LUNA — CAMBIO 3 =====
  const celestial = getCelestialPosition(W, H);
  if (celestial.type === 'sun') {
    const sunX = celestial.x, sunY = celestial.y, sunR = 28;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, sunR * 3.5);
    sunGlow.addColorStop(0, 'rgba(255,230,80,0.35)');
    sunGlow.addColorStop(0.5, 'rgba(255,200,40,0.12)');
    sunGlow.addColorStop(1, 'rgba(255,180,0,0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.strokeStyle = 'rgba(255,220,60,0.55)';
    for (let i = 0; i < 12; i++) {
      ctx.save();
      ctx.rotate((i / 12) * Math.PI * 2);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sunR + 4, 0);
      ctx.lineTo(sunR + 18 + (i % 3 === 0 ? 8 : 0), 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    const sunBodyGrad = ctx.createRadialGradient(sunX - sunR*0.25, sunY - sunR*0.25, 2, sunX, sunY, sunR);
    sunBodyGrad.addColorStop(0, '#fffbe0');
    sunBodyGrad.addColorStop(0.4, '#ffe44a');
    sunBodyGrad.addColorStop(1, '#ffb800');
    ctx.fillStyle = sunBodyGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // LUNA
    drawMoon(ctx, celestial.x, celestial.y, 22);
  }

  // ===== MONTAÑAS =====
  const mountainColor = night ? '#3a4a5a' : '#8eacc8';
  ctx.fillStyle = mountainColor;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(0, H * 0.42);
  ctx.lineTo(W * 0.08, H * 0.25);
  ctx.lineTo(W * 0.18, H * 0.38);
  ctx.lineTo(W * 0.28, H * 0.18);
  ctx.lineTo(W * 0.38, H * 0.32);
  ctx.lineTo(W * 0.50, H * 0.14);
  ctx.lineTo(W * 0.60, H * 0.30);
  ctx.lineTo(W * 0.70, H * 0.20);
  ctx.lineTo(W * 0.80, H * 0.35);
  ctx.lineTo(W * 0.90, H * 0.22);
  ctx.lineTo(W, H * 0.38);
  ctx.lineTo(W, groundY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  const farPeaks = [
    [W*0.08, H*0.25], [W*0.28, H*0.18], [W*0.50, H*0.14],
    [W*0.70, H*0.20], [W*0.90, H*0.22]
  ];
  farPeaks.forEach(([px, py]) => {
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - W*0.06, py + H*0.07);
    ctx.lineTo(px + W*0.06, py + H*0.07);
    ctx.closePath();
    ctx.fill();
  });

  const bgMountainColor = night ? '#2a3a2a' : '#5a7a5a';
  ctx.fillStyle = bgMountainColor;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(0, H * 0.52);
  ctx.lineTo(W * 0.12, H * 0.35);
  ctx.lineTo(W * 0.24, H * 0.50);
  ctx.lineTo(W * 0.37, H * 0.30);
  ctx.lineTo(W * 0.50, H * 0.48);
  ctx.lineTo(W * 0.62, H * 0.34);
  ctx.lineTo(W * 0.76, H * 0.50);
  ctx.lineTo(W * 0.88, H * 0.36);
  ctx.lineTo(W, H * 0.52);
  ctx.lineTo(W, groundY);
  ctx.closePath();
  ctx.fill();

  const mistGrad = ctx.createLinearGradient(0, groundY * 0.55, 0, groundY * 0.75);
  mistGrad.addColorStop(0, 'rgba(200,230,255,0)');
  mistGrad.addColorStop(1, 'rgba(200,230,255,0.18)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, groundY * 0.55, W, groundY * 0.2);

  // ===== BACKGROUND TREES =====
  const bgTrees = [
    { x: W*0.03, scale: 1.10 },
    { x: W*0.17, scale: 1.40 },
    { x: W*0.32, scale: 1.20 },
    { x: W*0.68, scale: 1.30 },
    { x: W*0.83, scale: 1.44 },
    { x: W*0.97, scale: 1.16 },
  ];
  bgTrees.forEach(t => {
    drawRealisticTree(ctx, t.x, groundY, t.scale);
  });

  // Ground
  const groundColor = night ? '#2d5a20' : '#5fa04a';
  ctx.fillStyle = groundColor;
  ctx.beginPath();
  ctx.rect(0, groundY, W, H - groundY);
  ctx.fill();

  ctx.strokeStyle = night ? '#255018' : '#4a8a3a';
  ctx.lineWidth = 1.5;
  for (let gx = 10; gx < W; gx += 18) {
    ctx.beginPath();
    ctx.moveTo(gx, groundY);
    ctx.lineTo(gx-4, groundY - 8);
    ctx.moveTo(gx+4, groundY);
    ctx.lineTo(gx, groundY - 10);
    ctx.stroke();
  }

  // Log (horizontal tree trunk)
  const logX = W * 0.38, logY = groundY - 18, logW = W * 0.38, logH = 28;
  const logCX = logX + logW;

  ctx.fillStyle = '#8B5E3C';
  ctx.strokeStyle = '#5D3A1A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(logX, logY, logW, logH, [0, 0, 4, 4]);
  ctx.fill(); ctx.stroke();

  ctx.strokeStyle = 'rgba(93,58,26,0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const lx = logX + logW * (0.2 + i * 0.22);
    ctx.beginPath();
    ctx.moveTo(lx, logY + 4);
    ctx.lineTo(lx, logY + logH - 4);
    ctx.stroke();
  }

  const csR = logH * 0.65;
  ctx.fillStyle = '#c4956a';
  ctx.strokeStyle = '#8B5E3C';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(logCX, logY + logH/2, csR * 0.55, csR, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  [0.7, 0.45, 0.25].forEach(r => {
    ctx.strokeStyle = 'rgba(93,58,26,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(logCX, logY + logH/2, csR*0.55*r, csR*r, 0, 0, Math.PI*2);
    ctx.stroke();
  });

  // ===== HP BAR =====
  if (logHPDisplay > logHP) {
    logHPDisplay = Math.max(logHP, logHPDisplay - 0.5);
  }
  drawHPBar(ctx, W, H);

  // ===== LOG PILE =====
  drawLogPile(ctx, W, H);

  // ===== FLYING LOG =====
  drawFlyingLog(ctx);

  // ===== LUMBERJACK =====
  const maxSwing = 0.6;
  chopAngle += chopDir * 0.06;
  if (chopAngle > maxSwing) { chopDir = -1; }
  if (chopAngle < -0.2) { chopDir = 1; }

  drawLumberjack(ctx, W * 0.36, groundY, chopAngle - 0.3);

  // Sparks
  if (chopAngle < -0.15 && chopDir === 1) {
    const sx2 = W * 0.36 + 20, sy2 = groundY - 22;
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI - Math.PI/2;
      const dist = Math.random() * 12 + 4;
      ctx.fillStyle = ['#FFD700','#FFA500','#FF8C00'][Math.floor(Math.random()*3)];
      ctx.beginPath();
      ctx.arc(sx2 + Math.cos(angle)*dist, sy2 + Math.sin(angle)*dist, 1.5, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // Luz de luna (efecto sutil sobre el personaje y el suelo)
  if (night) {
    ctx.fillStyle = 'rgba(80,100,180,0.06)';
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();

  animFrame = requestAnimationFrame(drawScene);
}

// =============================================
// GAME LOOP
// =============================================
let accumulator = 0;
let lastTime = Date.now();

function gameLoop() {
  const now = Date.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  accumulator += dt;
  if (accumulator >= 1) {
    accumulator -= 1;
    G.xp += 1;
    damageLog(computeGPS());
    checkLevelUp();
    checkMissions();
    updateUI();
    saveGame();
  }
  setTimeout(gameLoop, 100);
}

// =============================================
// CLICK INTERACTION
// =============================================
document.getElementById('top-section').addEventListener('click', e => {
  const rect = document.getElementById('top-section').getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const W = canvas.width, H = canvas.height;
  const groundY = H * 0.775;
  const pileX = getPileX(W);
  const pileRadius = 55;
  const offsetDown = H * 0.07;
  const pileYCenter = groundY + offsetDown - 20;

  const dx = clickX - pileX;
  const dy = clickY - pileYCenter;
  const distToPile = Math.sqrt(dx*dx + dy*dy);

  if (logPileClickable && collectedLogs > 0 && distToPile < pileRadius) {
    // CAMBIO 1: Efecto visual al hacer clic en la pila de troncos
    // 1) Ripple DOM
    const ripple = document.createElement('div');
    ripple.className = 'log-ripple';
    ripple.style.left = clickX + 'px';
    ripple.style.top = clickY + 'px';
    document.getElementById('top-section').appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);

    // 2) Sparkles en canvas
    pileClickEffect = { x: clickX, y: clickY, t: 0 };

    // Claim gold reward
    const earned = logPileGold;
    G.gold += earned;
    G.totalGoldEarned += earned;
    logPileGold = 0;
    collectedLogs = 0;
    logPileVisible = false;
    logPileClickable = false;

    // 3) Burst de texto
    const burst = document.createElement('div');
    burst.className = 'click-burst';
    burst.textContent = `+${fmtNum(earned)} 🪙`;
    burst.style.left = (clickX - 20) + 'px';
    burst.style.top = (clickY - 20) + 'px';
    document.getElementById('top-section').appendChild(burst);
    setTimeout(() => burst.remove(), 800);

    showToast(`🪙 ¡+${fmtNum(earned)} Oro reclamado!`);
    checkMissions();
    updateUI();
    return;
  }
});

// =============================================
// MODAL SYSTEM
// =============================================
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

function renderAxeModal() {
  let html = `<p class="modal-section-title">Mejoras de Hacha</p>
  <div class="stat-row"><span class="label">Oro/Click actual</span><span class="value">${computeGPC()} 🪙</span></div>
  <div class="stat-row"><span class="label">Oro/Seg actual</span><span class="value">${computeGPS().toFixed(1)} 🪙</span></div>
  <br>`;
  AXE_UPGRADES.forEach((u, i) => {
    const canAfford = u.costCurrency === 'gold' ? G.gold >= u.cost : G.crystals >= u.cost;
    const icon = u.costCurrency === 'gold' ? '🪙' : '💎';
    html += `<div class="upgrade-item">
      <div class="upgrade-icon">🪓</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${u.name} ${u.owned ? '✅' : ''}</div>
        <div class="upgrade-desc">${u.desc}</div>
        <div class="upgrade-cost">${u.owned ? 'Comprado' : `Costo: ${u.cost} ${icon}`}</div>
      </div>
      ${!u.owned ? `<button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buyAxeUpgrade(${i})">
        ${canAfford ? 'Comprar' : 'Insuf.'}
      </button>` : ''}
    </div>`;
  });
  return html;
}

function buyAxeUpgrade(i) {
  const u = AXE_UPGRADES[i];
  if (u.owned) return;
  if (u.costCurrency === 'gold' && G.gold < u.cost) { showToast('💰 Oro insuficiente'); return; }
  if (u.costCurrency === 'crystal' && G.crystals < u.cost) { showToast('💎 Cristales insuficientes'); return; }
  if (u.costCurrency === 'gold') G.gold -= u.cost;
  else G.crystals -= u.cost;
  u.owned = true;
  G.axeGoldPerClick += u.gpc;
  G.axeGoldPerSec += u.gps;
  showToast(`✅ ¡${u.name} comprada!`);
  updateUI();
  openModal('axe');
}

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
  if (item.crystals) { G.crystals += item.crystals; showToast(`💎 +${item.crystals} Cristales obtenidos!`); }
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
  <div style="font-size:11px;color:#888;margin-bottom:10px">Ganas 1 punto cada 5 niveles alcanzados.</div>
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
  const crystalReward = Math.max(1, Math.floor(G.level * 0.5 + G.totalGoldEarned / 10000));
  return `<div class="prestige-box">
    <h3>👑 Prestigio</h3>
    <p>Reinicia tu progreso (Oro, Nivel, Mejoras) a cambio de:<br>
    <strong style="color:#f5c518;font-size:16px">+${crystalReward} 💎 Cristales</strong><br>
    y un multiplicador de Oro permanente (+10%)</p>
    <div style="font-size:12px;color:#aaa;margin-bottom:12px">Prestigios realizados: ${G.prestigeCount}</div>
    <button class="prestige-confirm-btn" onclick="doPrestige(${crystalReward})">⚡ Hacer Prestigio</button>
  </div>
  <p class="modal-section-title">Tus Estadísticas</p>
  <div class="stat-row"><span class="label">Oro total ganado</span><span class="value">${fmtNum(G.totalGoldEarned)} 🪙</span></div>
  <div class="stat-row"><span class="label">Clicks totales</span><span class="value">${G.totalClicks.toLocaleString()}</span></div>
  <div class="stat-row"><span class="label">Prestigios</span><span class="value">${G.prestigeCount}</span></div>
  <div class="stat-row"><span class="label">Multiplicador actual</span><span class="value">x${G.prestigeMultiplier.toFixed(2)}</span></div>
  <div class="stat-row"><span class="label">Tiempo de juego</span><span class="value">Día ${TIME.day} · ${getTimeLabel()}</span></div>`;
}

function doPrestige(reward) {
  if (G.level < 5) { showToast('⚠️ Necesitas al menos Nivel 5 para Prestigiar'); return; }
  G.crystals += reward;
  G.gold = 0;
  G.level = 1;
  G.xp = 0;
  G.xpNeeded = 100;
  G.prestigeMultiplier = +(G.prestigeMultiplier * 1.1).toFixed(2);
  G.prestigeCount++;
  G.totalPrestige++;
  G.axeGoldPerClick = 1;
  G.axeGoldPerSec = 0.5;
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
    El Sol sale a las 6:00 AM y se pone a las 6:00 PM.<br>
    La Luna sale a las 6:00 PM y se pone a las 6:00 AM.<br>
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
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 2500);
}

// =============================================
// INIT
// =============================================
window.addEventListener('load', () => {
  loadGame();
  resizeCanvas();

  // Inicializar displays de tiempo
  document.getElementById('day-display').textContent = `Día: ${TIME.day}`;
  document.getElementById('clock-display').textContent = getTimeLabel();

  // Inicializar overlay de noche
  const alpha = getNightAlpha();
  document.getElementById('night-overlay').style.background = `rgba(5,10,40,${alpha})`;

  drawScene();
  updateUI();

  G.skillPoints = Math.floor(G.level / 5);

  gameLoop();
  setInterval(saveGame, 10000);
});

window.addEventListener('resize', resizeCanvas);

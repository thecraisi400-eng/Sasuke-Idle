// =============================================
// GAME STATE
// CAMBIO 2: crystals comienza en 0
// =============================================
const G = {
  gold: 0,
  crystals: 0,   // CAMBIO 2: siempre empieza en 0
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
// SISTEMA DE TIEMPO
// =============================================
const TIME = {
  gameMinutes: 360,
  day: 1,
  lastRealSecond: Date.now()
};

function getGameHour() {
  const minutesInDay = TIME.gameMinutes % 1440;
  return minutesInDay / 60;
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
  return h >= 19 || h < 5;
}

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function getNightAlpha() {
  const h = getGameHour();
  if (h >= 6 && h < 17) return 0;
  if (h >= 17 && h < 18) return smoothstep(17, 18, h) * 0.04;
  if (h >= 18 && h < 19) return 0.04 + smoothstep(18, 19, h) * 0.04;
  if (h >= 19 || h < 4) {
    if (h >= 19 && h < 20) return 0.08 + smoothstep(19, 20, h) * 0.02;
    return 0.10;
  }
  if (h >= 4 && h < 5) return 0.10 - smoothstep(4, 5, h) * 0.05;
  if (h >= 5 && h < 6) return 0.05 - smoothstep(5, 6, h) * 0.05;
  return 0;
}

function updateTimeSystem() {
  const now = Date.now();
  const elapsed = now - TIME.lastRealSecond;
  if (elapsed >= 1000) {
    const minutesPassed = Math.floor(elapsed / 1000);
    TIME.lastRealSecond += minutesPassed * 1000;

    const prevDay = Math.floor(TIME.gameMinutes / 1440);
    TIME.gameMinutes += minutesPassed;
    const newDay = Math.floor(TIME.gameMinutes / 1440);
    if (newDay > prevDay) {
      TIME.day = newDay + 1;
    }

    document.getElementById('day-display').textContent = `Día: ${TIME.day}`;
    document.getElementById('clock-display').textContent = getTimeLabel();

    const alpha = getNightAlpha();
    document.getElementById('night-overlay').style.background = `rgba(5,10,40,${alpha})`;
  }
}

function getCelestialBodies(canvasW, canvasH) {
  const h = getGameHour();
  const bodies = [];
  const arcTopY = canvasH * 0.06;
  const sunR = 28;

  if (h >= 5 && h < 18) {
    const t = (h - 6) / 12;
    const rawT = Math.max(0, Math.min(1, t));
    const x = -sunR + (canvasW + sunR * 2) * rawT;
    const arcHeight = canvasH * 0.13;
    const y = arcTopY + arcHeight - Math.sin(Math.PI * rawT) * arcHeight;
    let opacity = 1;
    if (h >= 5 && h < 6) opacity = smoothstep(5, 6, h);
    if (h >= 17.5 && h < 18) opacity = 1 - smoothstep(17.5, 18, h);
    bodies.push({ type: 'sun', x, y, r: sunR, opacity });
  }

  const moonR = 22;
  const nightDuration = 9;
  let nightH = null;
  if (h >= 19) nightH = h - 19;
  else if (h < 4) nightH = h + 5;

  if (nightH !== null && nightH >= 0 && nightH <= nightDuration) {
    const t = nightH / nightDuration;
    const x = -moonR + (canvasW + moonR * 2) * t;
    const arcHeight = canvasH * 0.11;
    const y = arcTopY + arcHeight - Math.sin(Math.PI * t) * arcHeight;
    let opacity = 1;
    if (nightH < 0.5) opacity = smoothstep(0, 0.5, nightH);
    if (nightH > 8.5) opacity = 1 - smoothstep(8.5, 9, nightH);
    bodies.push({ type: 'moon', x, y, r: moonR, opacity });
  }

  return bodies;
}

function getSkyColors(hour) {
  const keyframes = [
    { h: 0,    top: '#0a0a2e', mid: '#0e0e38', bot: '#1a1a4a' },
    { h: 4,    top: '#0c0c30', mid: '#101040', bot: '#1c1c4c' },
    { h: 5,    top: '#1a1a50', mid: '#2a2a70', bot: '#3a3a80' },
    { h: 5.5,  top: '#3a2a60', mid: '#6a3a50', bot: '#9a6060' },
    { h: 6,    top: '#ff7043', mid: '#ffb74d', bot: '#ffe0b2' },
    { h: 7,    top: '#ff8a50', mid: '#ffc107', bot: '#d4e8b0' },
    { h: 8,    top: '#6eb5d4', mid: '#87ceeb', bot: '#b8e4a0' },
    { h: 12,   top: '#4a9fd4', mid: '#87ceeb', bot: '#b8e4a0' },
    { h: 16,   top: '#5aa8d8', mid: '#87ceeb', bot: '#b8e4a0' },
    { h: 17,   top: '#e0895a', mid: '#f0b080', bot: '#c0c880' },
    { h: 18,   top: '#c0542a', mid: '#e07040', bot: '#806040' },
    { h: 18.5, top: '#6a2a40', mid: '#9a4050', bot: '#4a3a40' },
    { h: 19,   top: '#1a1040', mid: '#1e1448', bot: '#282050' },
    { h: 20,   top: '#0a0a2e', mid: '#0e0e38', bot: '#1a1a4a' },
    { h: 24,   top: '#0a0a2e', mid: '#0e0e38', bot: '#1a1a4a' },
  ];

  let kf1 = keyframes[0], kf2 = keyframes[keyframes.length - 1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (hour >= keyframes[i].h && hour <= keyframes[i+1].h) {
      kf1 = keyframes[i];
      kf2 = keyframes[i+1];
      break;
    }
  }

  const t = kf2.h === kf1.h ? 0 : (hour - kf1.h) / (kf2.h - kf1.h);
  const st = t * t * (3 - 2 * t);

  function lerpColor(c1, c2, t) {
    const r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16);
    const r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16);
    const r = Math.round(r1 + (r2-r1)*t);
    const g = Math.round(g1 + (g2-g1)*t);
    const b = Math.round(b1 + (b2-b1)*t);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  return {
    top: lerpColor(kf1.top, kf2.top, st),
    mid: lerpColor(kf1.mid, kf2.mid, st),
    bot: lerpColor(kf1.bot, kf2.bot, st),
  };
}

function getSkyGradient(ctx, canvasH, hour) {
  const colors = getSkyColors(hour);
  const grad = ctx.createLinearGradient(0, 0, 0, canvasH * 0.60);
  grad.addColorStop(0, colors.top);
  grad.addColorStop(0.5, colors.mid);
  grad.addColorStop(1, colors.bot);
  return grad;
}

function getMountainColors(hour) {
  if (hour >= 20 || hour < 5) {
    return { far: '#2a3040', mid: '#222a20' };
  }
  if (hour >= 5 && hour < 6) {
    const t = smoothstep(5, 6, hour);
    return {
      far: lerpHex('#2a3040', '#5a6a80', t),
      mid: lerpHex('#222a20', '#3a5a3a', t),
    };
  }
  if (hour >= 18 && hour < 19) {
    const t = smoothstep(18, 19, hour);
    return {
      far: lerpHex('#8eacc8', '#3a4060', t),
      mid: lerpHex('#5a7a5a', '#2a3a2a', t),
    };
  }
  if (hour >= 19 && hour < 20) {
    const t = smoothstep(19, 20, hour);
    return {
      far: lerpHex('#3a4060', '#2a3040', t),
      mid: lerpHex('#2a3a2a', '#222a20', t),
    };
  }
  if (hour >= 17 && hour < 18) {
    const t = smoothstep(17, 18, hour);
    return {
      far: lerpHex('#8eacc8', '#7a8090', t),
      mid: lerpHex('#5a7a5a', '#4a5a4a', t),
    };
  }
  return { far: '#8eacc8', mid: '#5a7a5a' };
}

function getGroundColor(hour) {
  if (hour >= 20 || hour < 5) return '#1e3c14';
  if (hour >= 5 && hour < 6) return lerpHex('#1e3c14', '#5fa04a', smoothstep(5, 6, hour));
  if (hour >= 18 && hour < 20) return lerpHex('#5fa04a', '#1e3c14', smoothstep(18, 20, hour));
  return '#5fa04a';
}

function lerpHex(c1, c2, t) {
  const r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16);
  const r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16);
  const r = Math.round(r1 + (r2-r1)*t);
  const g = Math.round(g1 + (g2-g1)*t);
  const b = Math.round(b1 + (b2-b1)*t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
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
    // CAMBIO 2: forzar cristales a 0 en el estado cargado
    G.crystals = 0;
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

let pileClickEffect = null;

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
  const { groundY, logX, logY } = getSceneAnchors(W, H);
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

function drawLogPile(ctx, W, H) {
  const { groundY } = getSceneAnchors(W, H);
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
        const colors = ['#FFD700', '#FFA500', '#FF8C00', '#fff'];
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(sx, sy, 3 * (1 - t * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
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



function getSceneAnchors(W, H) {
  const groundY = H * 0.775;
  const logX = W * 0.38 + W * 0.08;
  const logY = groundY - 22 + H * 0.07;
  const spriteX = W * 0.36;
  const spriteGroundY = groundY + H * 0.07;
  return { groundY, logX, logY, spriteX, spriteGroundY };
}

function drawFlyingLog(ctx) {
  if (!flyingLog) return;
  flyingLog.progress += 0.04;
  if (flyingLog.progress >= 1) { flyingLog = null; return; }

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
  const { logX, logY } = getSceneAnchors(W, H);
  const logW = W * 0.38;

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
  const nightMode = isNight();

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

  const foliageColors = nightMode ? [
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

function drawMoon(ctx, x, y, r, opacity) {
  ctx.globalAlpha = opacity;

  const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3);
  glow.addColorStop(0, 'rgba(200,220,255,0.3)');
  glow.addColorStop(0.5, 'rgba(160,180,255,0.10)');
  glow.addColorStop(1, 'rgba(100,120,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f0f0d0';
  ctx.strokeStyle = '#c8c890';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(30,30,60,0.25)';
  ctx.beginPath();
  ctx.arc(x + r * 0.25, y, r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(180,180,150,0.4)';
  [[- r*0.3, -r*0.2, r*0.1], [r*0.1, r*0.3, r*0.07], [-r*0.1, r*0.1, r*0.05]].forEach(([cx2, cy2, cr]) => {
    ctx.beginPath();
    ctx.arc(x + cx2, y + cy2, cr, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
}

function drawStars(ctx, W, H, groundY, hour) {
  let starsAlpha = 0;
  if (hour >= 19 || hour < 5) {
    starsAlpha = 1;
    if (hour >= 19 && hour < 20) starsAlpha = smoothstep(19, 20, hour);
    if (hour >= 4 && hour < 5) starsAlpha = 1 - smoothstep(4, 5, hour);
  }
  if (starsAlpha <= 0) return;

  const starCount = 60;
  ctx.save();
  for (let i = 0; i < starCount; i++) {
    const sx = ((i * 137 + 50) % W);
    const sy = ((i * 97 + 30) % (groundY * 0.72));
    const twinkle = 0.5 + 0.5 * Math.sin(Date.now() / 800 + i * 1.7);
    const starAlpha = starsAlpha * (0.4 + 0.5 * twinkle);
    ctx.globalAlpha = starAlpha;
    ctx.fillStyle = '#fffde0';
    ctx.beginPath();
    if (i % 8 === 0) {
      const sr = 2;
      ctx.fillRect(sx - sr, sy - 0.5, sr*2, 1);
      ctx.fillRect(sx - 0.5, sy - sr, 1, sr*2);
    } else {
      ctx.arc(sx, sy, 0.8 + (i % 3) * 0.5, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawSun(ctx, x, y, r, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;

  const sunGlow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.5);
  sunGlow.addColorStop(0, 'rgba(255,230,80,0.35)');
  sunGlow.addColorStop(0.5, 'rgba(255,200,40,0.12)');
  sunGlow.addColorStop(1, 'rgba(255,180,0,0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = 'rgba(255,220,60,0.55)';
  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.rotate((i / 12) * Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(r + 4, 0);
    ctx.lineTo(r + 18 + (i % 3 === 0 ? 8 : 0), 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  const sunBodyGrad = ctx.createRadialGradient(x - r*0.25, y - r*0.25, 2, x, y, r);
  sunBodyGrad.addColorStop(0, '#fffbe0');
  sunBodyGrad.addColorStop(0.4, '#ffe44a');
  sunBodyGrad.addColorStop(1, '#ffb800');
  ctx.fillStyle = sunBodyGrad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.restore();
}

// =============================================
// CAMBIO 3: Dibujar palo real en el suelo (grande y grueso)
// Reemplaza el tronco horizontal genérico con un palo de madera
// auténtico: corteza rugosa, fibras de madera, anillos en los extremos,
// nudos, sombra natural, raíces expuestas en los cortes.
// =============================================
function drawRealisticGroundLog(ctx, logX, logY, logW, logH) {
  const cx = logX + logW / 2;
  const cy = logY + logH / 2;

  // Sombra debajo del tronco
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, logY + logH + 5, logW * 0.48, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Cuerpo principal del tronco con gradiente de corteza
  const bodyGrad = ctx.createLinearGradient(logX, logY, logX, logY + logH);
  bodyGrad.addColorStop(0,    '#7a4c1e');  // parte superior más clara (iluminada)
  bodyGrad.addColorStop(0.25, '#6b3f18');
  bodyGrad.addColorStop(0.55, '#5a3210');
  bodyGrad.addColorStop(0.85, '#4a2a0d');  // parte inferior más oscura (sombra)
  bodyGrad.addColorStop(1,    '#3a200a');
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#2d1a05';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(logX, logY, logW, logH, [3, 3, 5, 5]);
  ctx.fill();
  ctx.stroke();

  // Textura de corteza: líneas horizontales irregulares
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(logX, logY, logW, logH, [3, 3, 5, 5]);
  ctx.clip();

  ctx.strokeStyle = 'rgba(30,12,3,0.35)';
  ctx.lineWidth = 1;
  const barkLines = 8;
  for (let i = 0; i < barkLines; i++) {
    const ly = logY + 3 + (i / barkLines) * (logH - 6);
    const wobble = (Math.sin(i * 2.3 + 1) * 2);
    ctx.beginPath();
    ctx.moveTo(logX + 4, ly + wobble);
    ctx.bezierCurveTo(
      logX + logW * 0.25, ly + Math.sin(i * 1.7) * 2.5,
      logX + logW * 0.65, ly + Math.cos(i * 2.1) * 2.5,
      logX + logW - 4, ly + wobble * 0.5
    );
    ctx.stroke();
  }

  // Fisuras verticales de la corteza
  ctx.strokeStyle = 'rgba(20,8,0,0.3)';
  ctx.lineWidth = 0.8;
  const fissures = [0.18, 0.32, 0.52, 0.68, 0.82];
  fissures.forEach(fx => {
    const x0 = logX + fx * logW;
    const len = logH * (0.3 + Math.sin(fx * 13) * 0.25);
    const startY = logY + logH * 0.1 + Math.cos(fx * 7) * logH * 0.1;
    ctx.beginPath();
    ctx.moveTo(x0, startY);
    ctx.bezierCurveTo(
      x0 + Math.sin(fx * 5) * 3, startY + len * 0.4,
      x0 - Math.sin(fx * 7) * 2, startY + len * 0.7,
      x0 + Math.sin(fx * 3) * 2, startY + len
    );
    ctx.stroke();
  });

  // Nudo de madera (knothole)
  const knot1X = logX + logW * 0.42;
  const knot1Y = logY + logH * 0.45;
  ctx.fillStyle = 'rgba(40,18,5,0.5)';
  ctx.beginPath();
  ctx.ellipse(knot1X, knot1Y, 7, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,8,2,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(20,8,2,0.7)';
  ctx.beginPath();
  ctx.ellipse(knot1X, knot1Y, 3.5, 2.5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Brillo superior (iluminación)
  const highlightGrad = ctx.createLinearGradient(logX, logY, logX, logY + logH * 0.4);
  highlightGrad.addColorStop(0, 'rgba(255,200,140,0.18)');
  highlightGrad.addColorStop(1, 'rgba(255,200,140,0)');
  ctx.fillStyle = highlightGrad;
  ctx.fillRect(logX, logY, logW, logH * 0.4);

  ctx.restore();

  // ===== CARA IZQUIERDA DEL CORTE (sección transversal) =====
  const leftR = logH * 0.55;
  const leftCX = logX;
  const leftCY = logY + logH / 2;

  // Sombra de la cara
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(leftCX - 2, leftCY + 2, leftR * 0.52, leftR, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cara de corte principal
  const cutFaceGrad = ctx.createRadialGradient(leftCX - leftR * 0.15, leftCY - leftR * 0.1, leftR * 0.05, leftCX, leftCY, leftR);
  cutFaceGrad.addColorStop(0,   '#e8b87a');  // médula central
  cutFaceGrad.addColorStop(0.12,'#d4a060');  // zona interna
  cutFaceGrad.addColorStop(0.35,'#b87c40');
  cutFaceGrad.addColorStop(0.65,'#9a6030');
  cutFaceGrad.addColorStop(0.85,'#7a4820');
  cutFaceGrad.addColorStop(1,   '#5a3010');  // corteza exterior
  ctx.fillStyle = cutFaceGrad;
  ctx.strokeStyle = '#3d2208';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(leftCX, leftCY, leftR * 0.52, leftR, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Anillos de crecimiento en la cara izquierda
  ctx.save();
  const ringColors = [
    'rgba(80,42,12,0.5)',
    'rgba(70,35,10,0.45)',
    'rgba(90,50,18,0.4)',
    'rgba(75,40,12,0.38)',
    'rgba(60,30,8,0.35)',
    'rgba(80,45,15,0.3)',
  ];
  const ringCount = 6;
  for (let r = ringCount; r >= 1; r--) {
    const frac = r / ringCount;
    ctx.strokeStyle = ringColors[r - 1];
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(leftCX, leftCY, leftR * 0.52 * frac * 0.92, leftR * frac * 0.92, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Médula central
  ctx.fillStyle = '#f0c88a';
  ctx.beginPath();
  ctx.ellipse(leftCX, leftCY, leftR * 0.08, leftR * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ===== CARA DERECHA DEL CORTE =====
  const rightCX = logX + logW;
  const rightCY = logY + logH / 2;
  const rightR = logH * 0.55;

  // Cara de corte principal derecha (más oscura por la sombra)
  const cutFaceGradR = ctx.createRadialGradient(rightCX + rightR * 0.1, rightCY - rightR * 0.15, rightR * 0.05, rightCX, rightCY, rightR);
  cutFaceGradR.addColorStop(0,   '#d4a060');
  cutFaceGradR.addColorStop(0.2, '#b87a38');
  cutFaceGradR.addColorStop(0.5, '#8a5822');
  cutFaceGradR.addColorStop(0.85,'#6a3e18');
  cutFaceGradR.addColorStop(1,   '#4a2810');
  ctx.fillStyle = cutFaceGradR;
  ctx.strokeStyle = '#3d2208';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(rightCX, rightCY, rightR * 0.52, rightR, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Anillos en cara derecha
  ctx.save();
  for (let r = ringCount; r >= 1; r--) {
    const frac = r / ringCount;
    ctx.strokeStyle = ringColors[r - 1];
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(rightCX, rightCY, rightR * 0.52 * frac * 0.92, rightR * frac * 0.92, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#d8a060';
  ctx.beginPath();
  ctx.ellipse(rightCX, rightCY, rightR * 0.07, rightR * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// =============================================
// LUMBERJACK SPRITE
// CAMBIO 1: hacha bajada un 20% más (pivote del brazo desplazado hacia abajo)
// =============================================
function drawLumberjack(ctx, cx, groundY, chopAngle) {
  ctx.save();
  ctx.translate(cx, groundY);

  const s = 0.72;

  // Sombra
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, -2, 16*s, 5*s, 0, 0, Math.PI*2);
  ctx.fill();

  // Botas
  ctx.fillStyle = '#3a2510';
  ctx.strokeStyle = '#1e1208';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-13*s, -12*s, 11*s, 8*s, 2*s);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(2*s, -12*s, 11*s, 8*s, 2*s);
  ctx.fill(); ctx.stroke();

  // Pantalones
  ctx.fillStyle = '#2c3e60';
  ctx.strokeStyle = '#1a2540';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-12*s, -30*s, 10*s, 20*s, 2*s);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(2*s, -30*s, 10*s, 20*s, 2*s);
  ctx.fill(); ctx.stroke();

  // Camisa a cuadros
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

  // Tirantes
  ctx.fillStyle = '#8B5E3C';
  ctx.strokeStyle = '#5D3A1A';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(-10*s, -54*s, 4*s, 28*s, 1*s);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(6*s, -54*s, 4*s, 28*s, 1*s);
  ctx.fill(); ctx.stroke();

  // Brazo izquierdo (quieto, colgando levemente)
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

  // Cabeza
  ctx.fillStyle = '#d4956a';
  ctx.strokeStyle = '#a06840';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, -66*s, 12*s, 12*s, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  // Pelo
  ctx.fillStyle = '#6b3e20';
  ctx.beginPath();
  ctx.ellipse(0, -59*s, 9*s, 5*s, 0, 0, Math.PI);
  ctx.fill();

  // Ojos
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(-4*s, -67*s, 1.5*s, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(4*s, -67*s, 1.5*s, 0, Math.PI*2); ctx.fill();

  // Cejas
  ctx.strokeStyle = '#4a2c10';
  ctx.lineWidth = 2*s;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6*s, -71*s); ctx.lineTo(-2*s, -72*s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6*s, -71*s); ctx.lineTo(2*s, -72*s); ctx.stroke();

  // Sombrero (ala)
  ctx.fillStyle = '#3d2a0f';
  ctx.strokeStyle = '#1e1208';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, -76*s, 18*s, 5*s, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();
  // Sombrero (copa)
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

  // ===== BRAZO DERECHO + HACHA =====
  // CAMBIO 1: pivot del hombro bajado un 20% adicional
  // Original era -52*s, ahora es -52*s + 10*s = -42*s (20% de 52 ≈ 10)
  ctx.save();
  ctx.translate(14*s, -42*s);   // CAMBIO 1: bajado de -52*s a -42*s
  ctx.rotate(chopAngle);

  // Brazo derecho (manga) — alargado para compensar el desplazamiento
  ctx.fillStyle = '#c0392b';
  ctx.strokeStyle = '#8e1a10';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-4*s, -36*s, 9*s, 36*s, 3*s);   // más largo para llegar al hombro
  ctx.fill(); ctx.stroke();

  // Segunda mano izquierda a mitad del mango (dos manos sosteniendo)
  // Mano superior (en -30*s del pivot)
  ctx.fillStyle = '#d4956a';
  ctx.strokeStyle = '#a06840';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0*s, -30*s, 5*s, 5*s, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  // ===== MANGO DEL HACHA =====
  ctx.fillStyle = '#8B5E3C';
  ctx.strokeStyle = '#5D3A1A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-2*s, -30*s, 5*s, 36*s, 2*s);
  ctx.fill(); ctx.stroke();

  // Segunda mano en la parte inferior del mango (mano baja)
  ctx.fillStyle = '#d4956a';
  ctx.strokeStyle = '#a06840';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0*s, -2*s, 5*s, 5*s, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  // ===== HOJA DEL HACHA — mirando a la DERECHA =====
  ctx.fillStyle = '#9e9e9e';
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const bladeY = 6 * s;
  ctx.moveTo(2*s, bladeY);
  ctx.lineTo(18*s, bladeY - 10*s);
  ctx.lineTo(20*s, bladeY);
  ctx.lineTo(18*s, bladeY + 14*s);
  ctx.lineTo(2*s, bladeY + 4*s);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Brillo en la hoja
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(4*s, bladeY - 2*s);
  ctx.lineTo(16*s, bladeY + 4*s);
  ctx.stroke();

  // Contrafilo
  ctx.fillStyle = '#777';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2*s, bladeY - 2*s);
  ctx.lineTo(-6*s, bladeY + 2*s);
  ctx.lineTo(-2*s, bladeY + 6*s);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.restore();
  ctx.restore();
}

function drawScene() {
  const W = canvas.width, H = canvas.height;

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

  const { groundY, logX, logY, spriteX, spriteGroundY } = getSceneAnchors(W, H);
  const hour = getGameHour();
  const night = isNight();

  // ===== CIELO =====
  const skyGrad = getSkyGradient(ctx, H, hour);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, groundY);

  // ===== ESTRELLAS =====
  drawStars(ctx, W, H, groundY, hour);

  // ===== SOL Y LUNA =====
  const celestialBodies = getCelestialBodies(W, H);
  celestialBodies.forEach(body => {
    if (body.type === 'sun') {
      drawSun(ctx, body.x, body.y, body.r, body.opacity);
    } else {
      drawMoon(ctx, body.x, body.y, body.r, body.opacity);
    }
  });

  // ===== MONTAÑAS TRASERAS =====
  const mColors = getMountainColors(hour);

  ctx.fillStyle = mColors.far;
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

  if (hour > 6 && hour < 17) {
    const snowAlpha = hour < 8 ? smoothstep(6, 8, hour) : (hour > 16 ? 1 - smoothstep(16, 17, hour) : 1);
    ctx.globalAlpha = snowAlpha * 0.72;
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
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = mColors.mid;
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
  mistGrad.addColorStop(1, 'rgba(200,230,255,0.12)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, groundY * 0.55, W, groundY * 0.2);

  // ===== ÁRBOLES DE FONDO =====
  const bgTrees = [
    { x: W*0.03, scale: 1.10 },
    { x: W*0.17, scale: 1.40 },
    { x: W*0.32, scale: 1.20 },
    { x: W*0.68, scale: 1.30 },
    { x: W*0.83, scale: 1.44 },
    { x: W*0.97, scale: 1.16 },
  ];
  bgTrees.forEach(t => drawRealisticTree(ctx, t.x, groundY, t.scale));

  // ===== SUELO =====
  ctx.fillStyle = getGroundColor(hour);
  ctx.beginPath();
  ctx.rect(0, groundY, W, H - groundY);
  ctx.fill();

  // Hierba
  const grassColor = night ? '#255018' : '#4a8a3a';
  ctx.strokeStyle = grassColor;
  ctx.lineWidth = 1.5;
  for (let gx = 10; gx < W; gx += 18) {
    ctx.beginPath();
    ctx.moveTo(gx, groundY);
    ctx.lineTo(gx-4, groundY - 8);
    ctx.moveTo(gx+4, groundY);
    ctx.lineTo(gx, groundY - 10);
    ctx.stroke();
  }

  // ===== CAMBIO 3: TRONCO REALISTA EN EL SUELO =====
  const logW = W * 0.38, logH = 36;
  drawRealisticGroundLog(ctx, logX, logY, logW, logH);

  // ===== HP BAR =====
  if (logHPDisplay > logHP) {
    logHPDisplay = Math.max(logHP, logHPDisplay - 0.5);
  }
  drawHPBar(ctx, W, H);

  // ===== LOG PILE =====
  drawLogPile(ctx, W, H);

  // ===== FLYING LOG =====
  drawFlyingLog(ctx);

  // ===== LEÑADOR =====
  const maxSwing = 0.55;
  chopAngle += chopDir * 0.055;
  if (chopAngle > maxSwing) { chopDir = -1; }
  if (chopAngle < -0.15) { chopDir = 1; }

  drawLumberjack(ctx, spriteX, spriteGroundY, chopAngle - 0.25);

  // Chispas al golpear
  if (chopAngle < -0.10 && chopDir === 1) {
    const sx2 = spriteX + 20, sy2 = spriteGroundY - 22;
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI - Math.PI/2;
      const dist = Math.random() * 12 + 4;
      ctx.fillStyle = ['#FFD700','#FFA500','#FF8C00'][Math.floor(Math.random()*3)];
      ctx.beginPath();
      ctx.arc(sx2 + Math.cos(angle)*dist, sy2 + Math.sin(angle)*dist, 1.5, 0, Math.PI*2);
      ctx.fill();
    }
  }

  if (night) {
    ctx.fillStyle = 'rgba(30,50,120,0.04)';
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
    const ripple = document.createElement('div');
    ripple.className = 'log-ripple';
    ripple.style.left = clickX + 'px';
    ripple.style.top = clickY + 'px';
    document.getElementById('top-section').appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);

    pileClickEffect = { x: clickX, y: clickY, t: 0 };

    const earned = logPileGold;
    G.gold += earned;
    G.totalGoldEarned += earned;
    logPileGold = 0;
    collectedLogs = 0;
    logPileVisible = false;
    logPileClickable = false;

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

  document.getElementById('day-display').textContent = `Día: ${TIME.day}`;
  document.getElementById('clock-display').textContent = getTimeLabel();

  const alpha = getNightAlpha();
  document.getElementById('night-overlay').style.background = `rgba(5,10,40,${alpha})`;

  drawScene();
  updateUI();

  G.skillPoints = Math.floor(G.level / 5);

  gameLoop();
  setInterval(saveGame, 10000);
});

window.addEventListener('resize', resizeCanvas);

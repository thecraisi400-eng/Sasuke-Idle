'use strict';

// =============================================
// UTILIDADES
// =============================================
function formatNum(n) {
  if (typeof n === 'bigint') n = Number(n);
  if (n < 1000) return Math.floor(n).toString();
  const suffixes = ['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
  let i = 0;
  while (n >= 1000 && i < suffixes.length - 1) { n /= 1000; i++; }
  return n.toFixed(i === 0 ? 0 : 2) + suffixes[i];
}

function lerp(a, b, t) { return a + (b - a) * t; }

function rnd(min, max) { return Math.random() * (max - min) + min; }

function showToast(msg, color = '#58a6ff') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = color;
  t.style.color = color;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

// =============================================
// DATOS DE CONFIGURACIÓN
// =============================================
const BIOMES = [
  { id:'cave',    name:'Cueva',    emoji:'🗿', color:'#2a1f3d', particleColor:'#8b7355', mult:1.0,  unlockRock:1,  reward:1.0, desc:'Dureza x1.0 • Roca básica' },
  { id:'volcano', name:'Volcán',   emoji:'🌋', color:'#3d1f0f', particleColor:'#ff6b35', mult:2.5,  unlockRock:10, reward:2.0, desc:'Dureza x2.5 • Recompensa x2' },
  { id:'glacier', name:'Glaciar',  emoji:'🧊', color:'#0f2d3d', particleColor:'#a8d8ea', mult:5.0,  unlockRock:25, reward:3.5, desc:'Dureza x5.0 • Recompensa x3.5' },
  { id:'void',    name:'El Vacío', emoji:'🌑', color:'#0a0a1a', particleColor:'#a371f7', mult:12.0, unlockRock:45, reward:6.0, desc:'Dureza x12 • Recompensa x6' },
];

const WEAPONS = [
  { minLvl:0,  name:'👊 Puños Desnudos', color:'#8b949e' },
  { minLvl:10, name:'🥊 Guantes de Bronce', color:'#cd7f32' },
  { minLvl:20, name:'🔰 Guantes de Acero', color:'#c0c0c0' },
  { minLvl:30, name:'⚡ Puños de Plasma', color:'#58a6ff' },
  { minLvl:40, name:'💀 Knuckles del Abismo', color:'#a371f7' },
  { minLvl:50, name:'🌟 Guantes Ancestrales', color:'#e3b341' },
];

const MISSIONS = [
  { id:'rocks_100',    name:'Rompe Rocas I',    desc:'Rompe 100 rocas',        target:100,   stat:'rocksDestroyed', reward:{gold:500, gems:1},   icon:'🪨' },
  { id:'rocks_1000',   name:'Rompe Rocas II',   desc:'Rompe 1,000 rocas',      target:1000,  stat:'rocksDestroyed', reward:{gold:5000, gems:5},  icon:'💥' },
  { id:'clicks_500',   name:'Golpeador I',       desc:'Haz 500 clics',          target:500,   stat:'totalClicks',    reward:{gold:800, gems:2},   icon:'👊' },
  { id:'clicks_5000',  name:'Golpeador II',      desc:'Haz 5,000 clics',        target:5000,  stat:'totalClicks',    reward:{gold:8000, gems:8},  icon:'💪' },
  { id:'gold_10k',     name:'Acumulador I',      desc:'Acumula 10,000 de Oro',  target:10000, stat:'totalGoldEarned',reward:{gems:10},             icon:'🪙' },
  { id:'frenzy_3',     name:'Alquimista',        desc:'Usa 3 Pociones de Frenesí', target:3, stat:'frenzyUsed',     reward:{gold:2000, gems:3},  icon:'⚗️' },
  { id:'prestige_1',   name:'El Renacido',       desc:'Realiza tu 1er Prestigio', target:1,  stat:'prestigeCount',  reward:{gold:50000, gems:20}, icon:'✨' },
];

const ACHIEVEMENTS = [
  { id:'first_rock',   name:'Primera Sangre',  desc:'Destruye tu primera roca',  target:1,    stat:'rocksDestroyed', icon:'🥇' },
  { id:'level10',      name:'Guerrero',         desc:'Alcanza nivel de mejora 10', target:10,  stat:'clickUpgLevel',  icon:'⚔️' },
  { id:'millionaire',  name:'Millonario',       desc:'Consigue 1M de Oro total',  target:1e6,  stat:'totalGoldEarned',icon:'💰' },
];

const SKILL_NODES = [
  { id:'dmg_perm',   x:160, y:40,  name:'+10%\nDaño',    cost:1, color:'#58a6ff', acquired:false, desc:'Daño permanente +10%' },
  { id:'gold_perm',  x:80,  y:120, name:'+15%\nOro',     cost:1, color:'#e3b341', acquired:false, desc:'Oro ganado +15%' },
  { id:'dps_perm',   x:240, y:120, name:'+10%\nDPS',     cost:1, color:'#3fb950', acquired:false, desc:'DPS permanente +10%' },
  { id:'crit_perm',  x:40,  y:220, name:'+10%\nCrít.',   cost:2, color:'#f78166', acquired:false, desc:'Golpe crítico +10%' },
  { id:'frenzy_ext', x:160, y:200, name:'+15s\nFrenesí', cost:2, color:'#a371f7', acquired:false, desc:'Duración Frenesí +15s' },
  { id:'gem_perm',   x:280, y:220, name:'+5%\nGemas',    cost:2, color:'#a371f7', acquired:false, desc:'Gemas ganadas +5%' },
];

const SKILL_EDGES = [
  ['dmg_perm','gold_perm'], ['dmg_perm','dps_perm'],
  ['gold_perm','crit_perm'], ['dmg_perm','frenzy_ext'], ['dps_perm','gem_perm'],
];

// =============================================
// CLASE GAME STATE
// =============================================
class GameState {
  constructor() {
    this.gold = 0;
    this.gems = 0;
    this.fragments = 0;
    this.totalGoldEarned = 0;
    this.totalClicks = 0;
    this.rocksDestroyed = 0;
    this.frenzyUsed = 0;
    this.prestigeCount = 0;
    this.ancestralCoins = 0;

    // Rock state
    this.rockLevel = 1;
    this.rockHP = 0;
    this.rockMaxHP = 0;

    // Upgrades
    this.clickUpgLevel = 0;
    this.autoUpgLevel = 0;
    this.whirlUpgLevel = 0;
    this.furyUpgLevel = 0;
    this.fuerzaCritLevel = 0;
    this.powerTouchLevel = 0;
    this.rockPenLevel = 0;
    this.gemFindLevel = 0;
    this.doubleHitLevel = 0;
    this.ruptureLevel = 0;
    this.goldImpactLevel = 0;

    // Secondary stats
    this.critChance = 5;   // %
    this.lootChance = 0;   // %
    this.armor = 0;
    this.critUpgLevel = 0;
    this.lootUpgLevel = 0;
    this.armorUpgLevel = 0;

    // Potions
    this.frenzyPotions = 0;
    this.wealthElixirs = 0;

    // Active effects
    this.frenzyActive = false;
    this.frenzyEndTime = 0;
    this.wealthActive = false;
    this.wealthEndTime = 0;

    // Biome
    this.currentBiome = BIOMES[0];

    // Missions claimed
    this.missionsClaimed = new Set();
    this.achievementsClaimed = new Set();

    // Prestige skill tree
    this.skillNodes = JSON.parse(JSON.stringify(SKILL_NODES));

    // Permanent buffs from prestige
    this.permDmgMult = 1;
    this.permGoldMult = 1;
    this.permDpsMult = 1;
    this.permCritBonus = 0;
    this.permFrenzyBonus = 0;
    this.permGemMult = 1;

    this.initRock();
  }

  getRockMaxHP() {
    const base = 10;
    const mult = this.currentBiome.mult;
    return Math.floor(base * Math.pow(1.23, this.rockLevel - 1) * mult);
  }

  initRock() {
    this.rockMaxHP = this.getRockMaxHP();
    this.rockHP = this.rockMaxHP;
  }

  getClickDmg() {
    let dmg = (1 + this.clickUpgLevel + this.powerTouchLevel * 2) * this.permDmgMult;
    if (this.frenzyActive && Date.now() < this.frenzyEndTime) dmg *= 2;
    return Math.max(1, Math.floor(dmg));
  }

  getDPS() {
    let dps = (this.autoUpgLevel * 2) * this.permDpsMult;
    if (this.frenzyActive && Date.now() < this.frenzyEndTime) dps *= 2;
    return dps;
  }

  getGoldPerRock() {
    let g = this.rockLevel * 5 * this.currentBiome.reward * this.permGoldMult;
    if (this.wealthActive && Date.now() < this.wealthEndTime) g *= 3;
    if (this.lootChance > 0 && Math.random() * 100 < this.lootChance) g *= 2;
    return Math.floor(g);
  }

  getGemChance() {
    return Math.max(0.02, 0.02 * this.currentBiome.reward * this.permGemMult + this.gemFindLevel * 0.01);
  }

  getClickCost() { return Math.floor(10 * Math.pow(1.5, this.clickUpgLevel)); }
  getAutoCost()  { return Math.floor(25 * Math.pow(1.5, this.autoUpgLevel)); }
  getWhirlCost() { return Math.floor(100 * Math.pow(1.5, this.whirlUpgLevel)); }
  getFuryCost()  { return Math.floor(500 * Math.pow(1.5, this.furyUpgLevel)); }

  getCritCost()  { return (this.critUpgLevel + 1); }
  getLootCost()  { return (this.lootUpgLevel + 1) * 2; }
  getArmorCost() { return (this.armorUpgLevel + 1) * 3; }

  getWeapon() {
    let w = WEAPONS[0];
    for (const wp of WEAPONS) {
      if (this.clickUpgLevel >= wp.minLvl) w = wp;
    }
    return w;
  }

  dealDamage(dmg) {
    let finalDmg = dmg;
    const isCrit = Math.random() * 100 < (this.critChance + this.permCritBonus);
    if (isCrit) finalDmg *= 5;
    this.rockHP -= finalDmg;
    if (this.rockHP <= 0) {
      this.rockHP = 0;
      return { dmg: finalDmg, isCrit, destroyed: true };
    }
    return { dmg: finalDmg, isCrit, destroyed: false };
  }

  destroyRock() {
    const gold = this.getGoldPerRock();
    this.gold += gold;
    this.totalGoldEarned += gold;
    this.fragments += Math.floor(rnd(2, 6) * this.currentBiome.reward);
    if (Math.random() < this.getGemChance()) {
      const gems = Math.floor(rnd(1, 3));
      this.gems += gems;
    }
    this.rocksDestroyed++;
    this.rockLevel++;
    this.initRock();
    return gold;
  }

  applyPrestige() {
    if (this.rockLevel < 50) return false;
    this.ancestralCoins += 3;
    this.gold = 0;
    this.gems = 0;
    this.fragments = 0;
    this.rockLevel = 1;
    this.clickUpgLevel = 0;
    this.autoUpgLevel = 0;
    this.whirlUpgLevel = 0;
    this.furyUpgLevel = 0;
    this.fuerzaCritLevel = 0;
    this.powerTouchLevel = 0;
    this.rockPenLevel = 0;
    this.gemFindLevel = 0;
    this.doubleHitLevel = 0;
    this.ruptureLevel = 0;
    this.goldImpactLevel = 0;
    this.frenzyPotions = 0;
    this.wealthElixirs = 0;
    this.frenzyActive = false;
    this.wealthActive = false;
    this.prestigeCount++;
    this.missionsClaimed.clear();
    this.initRock();
    return true;
  }

  buySkillNode(nodeId) {
    const node = this.skillNodes.find(n => n.id === nodeId);
    if (!node || node.acquired) return false;
    if (this.ancestralCoins < node.cost) return false;
    this.ancestralCoins -= node.cost;
    node.acquired = true;
    // Apply effect
    switch (nodeId) {
      case 'dmg_perm':   this.permDmgMult  *= 1.10; break;
      case 'gold_perm':  this.permGoldMult *= 1.15; break;
      case 'dps_perm':   this.permDpsMult  *= 1.10; break;
      case 'crit_perm':  this.permCritBonus += 10;  break;
      case 'frenzy_ext': this.permFrenzyBonus += 15; break;
      case 'gem_perm':   this.permGemMult  *= 1.05; break;
    }
    return true;
  }
}

// =============================================
// CLASE RENDERER (Canvas)
// =============================================
class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.heroAnim = { frame: 0, timer: 0, state: 'idle', attackTimer: 0 };
    this.rockShake = { x: 0, y: 0, intensity: 0 };
    this.bgStars = this.genStars(28);
    this.cachedRockProfile = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    this.W = this.canvas.width;
    this.H = this.canvas.height;
  }

  genStars(n) {
    return Array.from({length:n}, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      speed: Math.random() * 0.003 + 0.001
    }));
  }

  hash01(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  getRockProfile(state) {
    const signature = `${state.currentBiome.id}-${state.rockLevel}`;
    if (this.cachedRockProfile && this.cachedRockProfile.signature === signature) {
      return this.cachedRockProfile;
    }

    const lvl = state.rockLevel;
    const biomeSeed = state.currentBiome.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const seed = lvl * 31 + biomeSeed * 17;
    const phase = Math.floor((lvl - 1) / 8) + 1;
    const hue = (215 + biomeSeed + phase * 17 + Math.floor(this.hash01(seed + 9) * 20)) % 360;
    const sat = 18 + Math.floor(this.hash01(seed + 3) * 32);
    const light = 26 + Math.floor(this.hash01(seed + 5) * 16);
    const points = 9 + (phase % 4);
    const radiusBase = 34 + Math.min(phase, 24) * 0.85;

    const vertices = [];
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2;
      const noise = this.hash01(seed + i * 1.37);
      const r = radiusBase * (0.78 + noise * 0.38);
      vertices.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.92 });
    }

    this.cachedRockProfile = {
      signature,
      phase,
      hue,
      sat,
      light,
      glow: 0.08 + (phase % 6) * 0.02,
      vertices,
      phaseName: `FASE ${phase}`,
    };
    return this.cachedRockProfile;
  }

  addParticle(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = rnd(0, Math.PI * 2);
      const speed = rnd(1, 5);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rnd(1, 3),
        r: rnd(2, 6),
        life: 1,
        decay: rnd(0.04, 0.08),
        color
      });
    }
  }

  triggerAttack() {
    this.heroAnim.state = 'attack';
    this.heroAnim.attackTimer = 12;
  }

  shakeRock(intensity) {
    this.rockShake.intensity = Math.min(intensity, 8);
  }

  drawBackground(biome) {
    const { ctx, W, H } = this;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#050912');
    grad.addColorStop(0.55, '#0a1222');
    grad.addColorStop(1, '#02040a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const centerGlow = ctx.createRadialGradient(W * 0.65, H * 0.56, 8, W * 0.65, H * 0.56, Math.max(W, H) * 0.58);
    centerGlow.addColorStop(0, 'rgba(119,171,255,0.32)');
    centerGlow.addColorStop(0.45, 'rgba(70,120,200,0.13)');
    centerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, W, H);

    // Estalactitas
    ctx.fillStyle = 'rgba(12,20,36,0.92)';
    const stalactites = 8;
    for (let i = 0; i <= stalactites; i++) {
      const x = (i / stalactites) * W;
      const h = H * (0.12 + (i % 3) * 0.05);
      ctx.beginPath();
      ctx.moveTo(x - 26, 0);
      ctx.lineTo(x + 24, 0);
      ctx.lineTo(x + (i % 2 === 0 ? 3 : -2), h);
      ctx.closePath();
      ctx.fill();
    }

    // Polvo/brillos de cueva
    this.bgStars.forEach(s => {
      s.a += s.speed;
      const alpha = (Math.sin(s.a) + 1) / 2 * 0.25 + 0.06;
      ctx.beginPath();
      const starRadius = Math.max(0.1, s.r);
      ctx.arc(s.x * W, s.y * H * 0.8, starRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(130,170,255,${alpha})`;
      ctx.fill();
    });

    // Rocas decorativas del suelo
    for (let i = 0; i < 6; i++) {
      const x = W * (0.08 + i * 0.17);
      const y = H * (0.76 + (i % 2) * 0.05);
      const w = 20 + (i % 3) * 8;
      const h = 10 + (i % 2) * 6;
      ctx.fillStyle = 'rgba(20,30,48,0.92)';
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground
    const groundGrad = ctx.createLinearGradient(0, H * 0.7, 0, H);
    groundGrad.addColorStop(0, 'rgba(0,0,0,0)');
    groundGrad.addColorStop(1, 'rgba(0,0,0,0.68)');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, H * 0.7, W, H * 0.3);
  }

  drawHero(state) {
    const { ctx, W, H } = this;
    const t = this.heroAnim;
    t.timer++;

    const heroX = W * 0.22;
    const heroY = H * 0.7;
    const scaleByWidth = Math.min(1.12, Math.max(0.86, W / 390));
    const s = scaleByWidth;

    ctx.save();
    ctx.translate(heroX, heroY);

    // Idle bob
    let bob = 0;
    if (t.state === 'idle') {
      bob = Math.sin(t.timer * 0.08) * 3;
    }

    // Attack animation
    let attackOffset = { x: 0, y: 0, rot: 0 };
    if (t.state === 'attack') {
      t.attackTimer--;
      const p = 1 - t.attackTimer / 12;
      attackOffset.x = Math.sin(p * Math.PI) * 18;
      attackOffset.rot = Math.sin(p * Math.PI) * 0.3;
      if (t.attackTimer <= 0) t.state = 'idle';
    }

    ctx.translate(attackOffset.x, bob);
    ctx.rotate(attackOffset.rot);
    ctx.scale(s, s);

    const weapon = state.getWeapon();
    const isAttacking = t.state === 'attack';

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 35, 20, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    // Piernas
    ctx.fillStyle = '#1f3558';
    ctx.fillRect(-12, -3, 9, 25);
    ctx.fillRect(3, -3, 9, 25);
    ctx.fillStyle = '#0f1c2f';
    ctx.fillRect(-14, 20, 12, 6);
    ctx.fillRect(2, 20, 12, 6);

    // Torso
    ctx.fillStyle = '#2f4f7f';
    ctx.beginPath();
    ctx.roundRect(-14, -33, 28, 33, [6]);
    ctx.fill();
    ctx.fillStyle = '#3f659a';
    ctx.fillRect(-4, -29, 8, 23);

    // Cabeza + cuello
    ctx.fillStyle = '#dcb08c';
    ctx.fillRect(-4, -38, 8, 8);
    ctx.beginPath();
    ctx.arc(0, -48, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#20130e';
    ctx.beginPath();
    ctx.arc(0, -54, 10, Math.PI, 0);
    ctx.fill();

    // Rasgos
    ctx.fillStyle = isAttacking ? '#ff5d5d' : '#101828';
    ctx.fillRect(-7, -48, 4, 2.5);
    ctx.fillRect(3, -48, 4, 2.5);
    ctx.fillStyle = '#7a4931';
    ctx.fillRect(-3, -41, 6, 1.5);

    // Brazos y pico (mano izquierda)
    const swing = isAttacking ? Math.sin((1 - t.attackTimer / 12) * Math.PI) : 0;
    const leftHandX = -24 - swing * 12;
    const leftHandY = -8 - swing * 10;
    const rightHandX = 20;
    const rightHandY = -10;

    ctx.strokeStyle = '#dcb08c';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-13, -21);
    ctx.lineTo(leftHandX, leftHandY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(13, -21);
    ctx.lineTo(rightHandX, rightHandY);
    ctx.stroke();

    // Pico de minería en mano izquierda
    const pickAngle = -0.7 - swing * 0.95;
    ctx.save();
    ctx.translate(leftHandX, leftHandY);
    ctx.rotate(pickAngle);
    ctx.fillStyle = '#7f6245';
    ctx.fillRect(-2, -24, 4, 32);
    ctx.fillStyle = '#98a6b8';
    ctx.beginPath();
    ctx.moveTo(-13, -22);
    ctx.lineTo(14, -16);
    ctx.lineTo(4, -8);
    ctx.lineTo(-16, -14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = weapon.color;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(-2, -24, 4, 10);
    ctx.globalAlpha = 1;
    ctx.restore();

    // Frenzy aura
    if (state.frenzyActive) {
      ctx.beginPath();
      const auraRadius = Math.max(0.1, 25 + Math.sin(t.timer * 0.3) * 3);
      ctx.arc(0, -20, auraRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,60,60,${0.3 + Math.sin(t.timer * 0.3) * 0.15})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawRock(state) {
    const { ctx, W, H } = this;
    const profile = this.getRockProfile(state);
    const pct = state.rockHP / state.rockMaxHP;
    const rockX = W * 0.68;
    const rockY = H * 0.6;

    // Shake
    if (this.rockShake.intensity > 0.1) {
      this.rockShake.x = rnd(-this.rockShake.intensity, this.rockShake.intensity);
      this.rockShake.y = rnd(-this.rockShake.intensity / 2, this.rockShake.intensity / 2);
      this.rockShake.intensity *= 0.75;
    } else {
      this.rockShake.x = 0; this.rockShake.y = 0;
    }

    const rx = rockX + this.rockShake.x;
    const ry = rockY + this.rockShake.y;

    ctx.save();
    ctx.translate(rx, ry);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 30, 38, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();

    // Deformation: crack based on damage
    const crackLevel = Math.floor((1 - pct) * 4);

    ctx.beginPath();
    profile.vertices.forEach((v, idx) => {
      if (idx === 0) ctx.moveTo(v.x, v.y);
      else ctx.lineTo(v.x, v.y);
    });
    ctx.closePath();

    const rockGrad = ctx.createRadialGradient(-7, -16, 4, 0, 0, 52);
    rockGrad.addColorStop(0, `hsl(${profile.hue}, ${Math.min(90, profile.sat + 20)}%, ${Math.min(86, profile.light + 24)}%)`);
    rockGrad.addColorStop(0.52, `hsl(${profile.hue}, ${profile.sat}%, ${profile.light}%)`);
    rockGrad.addColorStop(1, `hsl(${profile.hue}, ${Math.max(8, profile.sat - 8)}%, ${Math.max(8, profile.light - 18)}%)`);
    ctx.fillStyle = rockGrad;
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cracks
    if (crackLevel >= 1) this.drawCrack(ctx, -5, -10, 15, 10, 2);
    if (crackLevel >= 2) this.drawCrack(ctx, 10, -25, -10, 5, 3);
    if (crackLevel >= 3) this.drawCrack(ctx, -15, 0, 5, 20, 3);
    if (crackLevel >= 4) {
      this.drawCrack(ctx, -20, -20, 20, 15, 4);
      this.drawCrack(ctx, 5, -35, -5, 20, 2);
      ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.beginPath(); ctx.arc(0,-10,35,0,Math.PI*2);
      ctx.fillStyle = `hsla(${profile.hue + 24}, 80%, 62%, 0.25)`; ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Aura de progreso por fase
    ctx.beginPath();
    ctx.arc(0, -6, 50, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${profile.hue + 12}, 90%, 65%, ${profile.glow})`;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Rock level/phase badges
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath(); ctx.roundRect(-22,-66,44,20,8); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`NV.${state.rockLevel}`, 0, -52);
    ctx.font = '700 10px Rajdhani, sans-serif';
    ctx.fillStyle = `hsl(${profile.hue + 14}, 80%, 75%)`;
    ctx.fillText(profile.phaseName, 0, -74);

    ctx.restore();
  }

  drawCrack(ctx, x1, y1, x2, y2, w) {
    const mx = (x1 + x2) / 2 + rnd(-5, 5);
    const my = (y1 + y2) / 2 + rnd(-5, 5);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(mx, my, x2, y2);
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  updateParticles() {
    const { ctx } = this;
    this.particles = this.particles.filter(p => p.life > 0);
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life -= p.decay;
      ctx.beginPath();
      // ✅ CORRECCIÓN PRINCIPAL: Evitar radio negativo
      const radius = Math.max(0.1, p.r * p.life);
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  render(state) {
    this.drawBackground(state.currentBiome);
    this.drawHero(state);
    this.drawRock(state);
    this.updateParticles();
  }
}

// =============================================
// CLASE UI
// =============================================
class UI {
  constructor(state) {
    this.state = state;
    this.floatingTexts = document.getElementById('floating-texts');
    this.setupTabs();
    this.buildBiomes();
    this.buildSkillTree();
    this.buildMissions();
  }

  setupTabs() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        btn.classList.add('active');
      });
    });
  }

  buildBiomes() {
    const container = document.getElementById('biomes-container');
    container.innerHTML = '';
    const colors = {
      cave:'#4a3060', volcano:'#602020', glacier:'#1a4060', void:'#2a1050'
    };
    BIOMES.forEach(biome => {
      const locked = this.state.rockLevel < biome.unlockRock && this.state.rocksDestroyed === 0;
      const isActive = this.state.currentBiome.id === biome.id;
      const div = document.createElement('div');
      div.className = `biome-card${isActive ? ' active-biome' : ''}${locked && biome.unlockRock > 1 ? ' locked' : ''}`;
      div.innerHTML = `
        <div class="biome-thumb" style="background:${colors[biome.id]}">
          <span>${biome.emoji}</span>
        </div>
        <div class="biome-info">
          <div class="biome-name">${biome.name}</div>
          <div class="biome-stats">${biome.desc}</div>
          ${biome.unlockRock > 1 ? `<div style="font-size:10px; color:var(--text-muted);">Desbloquea en Roca ${biome.unlockRock}</div>` : ''}
        </div>
        ${isActive ? '<span style="color:var(--accent); font-size:18px;">✓</span>' : ''}
      `;
      div.addEventListener('click', () => {
        if (this.state.rockLevel < biome.unlockRock) {
          showToast(`¡Necesitas alcanzar Roca ${biome.unlockRock}!`, '#f78166');
          return;
        }
        this.state.currentBiome = biome;
        this.state.initRock();
        this.buildBiomes();
        showToast(`¡Explorado: ${biome.name}!`, '#58a6ff');
      });
      container.appendChild(div);
    });
  }

  buildSkillTree() {
    const svg = document.getElementById('skill-tree-svg');
    svg.innerHTML = '';

    // Edges
    SKILL_EDGES.forEach(([from, to]) => {
      const a = this.state.skillNodes.find(n => n.id === from);
      const b = this.state.skillNodes.find(n => n.id === to);
      if (!a || !b) return;
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      line.setAttribute('stroke', (a.acquired && b.acquired) ? '#58a6ff' : '#30363d');
      line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
    });

    // Nodes
    this.state.skillNodes.forEach(node => {
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('class','skill-node');
      g.setAttribute('transform',`translate(${node.x},${node.y})`);

      const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
      circle.setAttribute('r','22');
      circle.setAttribute('fill', node.acquired ? node.color : '#1a2336');
      circle.setAttribute('stroke', node.acquired ? node.color : '#30363d');
      circle.setAttribute('stroke-width','2');
      if (node.acquired) {
        circle.setAttribute('filter','drop-shadow(0 0 6px ' + node.color + ')');
      }

      const lines = node.name.split('\n');
      const texts = lines.map((line, i) => {
        const t = document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('text-anchor','middle');
        t.setAttribute('dy', (i - (lines.length-1)/2) * 13 + 4);
        t.setAttribute('font-family','Rajdhani,sans-serif');
        t.setAttribute('font-size','10');
        t.setAttribute('font-weight','700');
        t.setAttribute('fill', node.acquired ? '#fff' : '#8b949e');
        t.textContent = line;
        return t;
      });

      const costText = document.createElementNS('http://www.w3.org/2000/svg','text');
      costText.setAttribute('text-anchor','middle');
      costText.setAttribute('dy','35');
      costText.setAttribute('font-family','Share Tech Mono,monospace');
      costText.setAttribute('font-size','9');
      costText.setAttribute('fill', node.acquired ? '#3fb950' : '#a371f7');
      costText.textContent = node.acquired ? '✓' : `🌟${node.cost}`;

      g.appendChild(circle);
      texts.forEach(t => g.appendChild(t));
      g.appendChild(costText);

      g.addEventListener('click', () => {
        if (node.acquired) { showToast('Ya adquirido', '#3fb950'); return; }
        if (this.state.buySkillNode(node.id)) {
          showToast(`✨ ${node.desc}`, '#a371f7');
          this.buildSkillTree();
          this.updateAll();
        } else {
          showToast(`Necesitas 🌟${node.cost} Monedas Ancestrales`, '#f78166');
        }
      });

      svg.appendChild(g);
    });
  }

  buildMissions() {
    const mContainer = document.getElementById('missions-container');
    const aContainer = document.getElementById('achievements-container');
    mContainer.innerHTML = '';
    aContainer.innerHTML = '';

    MISSIONS.forEach(m => {
      const claimed = this.state.missionsClaimed.has(m.id);
      const stat = this.state[m.stat] || 0;
      const progress = Math.min(stat / m.target, 1);
      const completed = progress >= 1;

      const div = document.createElement('div');
      div.className = 'mission-row';
      div.innerHTML = `
        <span class="mission-icon">${m.icon}</span>
        <div class="mission-info">
          <div class="mission-name" style="color:${claimed ? 'var(--text-muted)' : completed ? 'var(--accent2)' : 'var(--text)'}">${m.name}</div>
          <div class="mission-desc">${m.desc}</div>
          <div class="progress-bar" style="margin-top:4px;">
            <div class="progress-fill ${completed ? 'green' : 'blue'}" style="width:${progress*100}%"></div>
          </div>
          <div style="font-size:10px; color:var(--text-muted); font-family:'Share Tech Mono',monospace; margin-top:2px;">
            ${formatNum(Math.min(stat, m.target))} / ${formatNum(m.target)}
          </div>
        </div>
        ${completed && !claimed
          ? `<button class="btn btn-success btn-sm claim-btn" data-mission="${m.id}">RECLAMAR</button>`
          : claimed ? '<span style="color:var(--accent2); font-size:18px;">✓</span>' : ''}
      `;
      mContainer.appendChild(div);
    });

    ACHIEVEMENTS.forEach(a => {
      const claimed = this.state.achievementsClaimed.has(a.id);
      const stat = this.state[a.stat] || 0;
      const completed = stat >= a.target;
      const div = document.createElement('div');
      div.className = 'mission-row';
      div.style.opacity = completed ? '1' : '0.5';
      div.innerHTML = `
        <span class="mission-icon">${a.icon}</span>
        <div class="mission-info">
          <div class="mission-name" style="color:${completed ? 'var(--gold)' : 'var(--text-muted)'}">${a.name}</div>
          <div class="mission-desc">${a.desc}</div>
        </div>
        ${completed && !claimed
          ? `<button class="btn btn-gold btn-sm" data-achievement="${a.id}">RECLAMAR</button>`
          : completed ? '<span style="font-size:20px;">🏆</span>' : '🔒'}
      `;
      aContainer.appendChild(div);
    });

    // Claim buttons
    document.querySelectorAll('[data-mission]').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = MISSIONS.find(x => x.id === btn.dataset.mission);
        if (!m || this.state.missionsClaimed.has(m.id)) return;
        this.state.missionsClaimed.add(m.id);
        if (m.reward.gold) this.state.gold += m.reward.gold;
        if (m.reward.gems) this.state.gems += m.reward.gems;
        showToast(`🎉 Misión completada: +${m.reward.gold ? formatNum(m.reward.gold) + ' Oro' : ''}${m.reward.gems ? ' +' + m.reward.gems + ' Gemas' : ''}`, '#3fb950');
        this.buildMissions();
        this.updateAll();
      });
    });

    document.querySelectorAll('[data-achievement]').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = ACHIEVEMENTS.find(x => x.id === btn.dataset.achievement);
        if (!a || this.state.achievementsClaimed.has(a.id)) return;
        this.state.achievementsClaimed.add(a.id);
        this.state.gold += 500;
        showToast(`🏆 Logro: ${a.name}! +500 Oro`, '#e3b341');
        this.buildMissions();
        this.updateAll();
      });
    });
  }

  spawnFloatingText(x, y, text, color, size = 14) {
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    el.style.left = (x - 20) + 'px';
    el.style.top = y + 'px';
    el.style.fontSize = size + 'px';
    el.style.color = color;
    this.floatingTexts.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  updateHUD() {
    const s = this.state;
    document.getElementById('hud-gold').textContent = formatNum(s.gold);
    document.getElementById('hud-gems').textContent = formatNum(s.gems);
    document.getElementById('hud-rock-level').textContent = s.rockLevel;
    document.getElementById('hud-fragments').textContent = formatNum(s.fragments);
  }

  updateRockBar() {
    const s = this.state;
    const pct = s.rockHP / s.rockMaxHP;
    document.getElementById('rock-hp-fill').style.width = (pct * 100) + '%';
    document.getElementById('rock-hp-text').textContent = `${formatNum(s.rockHP)} / ${formatNum(s.rockMaxHP)}`;
  }

  updateForceTab() {
    if (window.game && window.game.forceSystem) {
      window.game.forceSystem.updateUI();
      return;
    }
    document.getElementById('dps-value').textContent = formatNum(this.state.getDPS());
  }

  updateAlchemyTab() {
    const s = this.state;
    document.getElementById('frenzy-stock').textContent = s.frenzyPotions;
    document.getElementById('wealth-stock').textContent = s.wealthElixirs;
  }

  updateForgeTab() {
    const s = this.state;
    document.getElementById('crit-chance-display').textContent = (s.critChance + s.permCritBonus) + '%';
    document.getElementById('crit-bar').style.width = Math.min((s.critChance + s.permCritBonus), 100) + '%';
    document.getElementById('crit-cost').textContent = `💎 ${s.getCritCost()}`;

    document.getElementById('loot-chance-display').textContent = s.lootChance + '%';
    document.getElementById('loot-bar').style.width = Math.min(s.lootChance, 100) + '%';
    document.getElementById('loot-cost').textContent = `💎 ${s.getLootCost()}`;

    document.getElementById('armor-display').textContent = s.armor;
    document.getElementById('armor-bar').style.width = Math.min(s.armor * 5, 100) + '%';
    document.getElementById('armor-cost').textContent = `💎 ${s.getArmorCost()}`;
  }

  updatePrestigeTab() {
    const s = this.state;
    document.getElementById('prestige-count').textContent = s.prestigeCount;
    document.getElementById('prestige-rock-level').textContent = s.rockLevel;
    document.getElementById('prestige-progress').style.width = Math.min(s.rockLevel / 50 * 100, 100) + '%';
    document.getElementById('ancestral-coins-display').textContent = s.ancestralCoins;
    document.getElementById('btn-prestige').disabled = s.rockLevel < 50;
    if (s.rockLevel < 50) document.getElementById('btn-prestige').classList.add('btn-disabled');
    else document.getElementById('btn-prestige').classList.remove('btn-disabled');
  }

  updateFrenzyUI() {
    const s = this.state;
    const container = document.getElementById('canvas-container');
    const timer = document.getElementById('frenzy-timer');
    if (s.frenzyActive && Date.now() < s.frenzyEndTime) {
      container.classList.add('frenzy-filter');
      timer.style.display = 'block';
      const secs = Math.ceil((s.frenzyEndTime - Date.now()) / 1000);
      document.getElementById('frenzy-seconds').textContent = secs;
    } else {
      s.frenzyActive = false;
      container.classList.remove('frenzy-filter');
      timer.style.display = 'none';
    }
  }

  updateAll() {
    this.updateHUD();
    this.updateRockBar();
    this.updateForceTab();
    this.updateAlchemyTab();
    this.updateForgeTab();
    this.updatePrestigeTab();
    this.updateFrenzyUI();
  }
}

// =============================================
// CLASE GAME (Coordinador)
// =============================================
class Game {
  constructor() {
    this.state = new GameState();
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new Renderer(this.canvas);
    this.ui = new UI(this.state);
    this.forceSystem = new window.FuerzaSystem(this.state, this.ui, this.renderer);
    this.lastTime = 0;
    this.dpsAccum = 0;

    this.bindEvents();
    this.forceSystem.bindEvents();
    this.startGameLoop();
    this.startDpsInterval();

    this.ui.updateAll();
  }

  bindEvents() {
    const s = this.state;
    const ui = this.ui;
    const renderer = this.renderer;
    const canvasContainer = document.getElementById('canvas-container');

    // Click on canvas
    canvasContainer.addEventListener('click', (e) => {
      const rect = canvasContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const hitResults = this.forceSystem.applyClickAttack();
      s.totalClicks++;

      renderer.triggerAttack();
      const totalHitDmg = hitResults.reduce((acc, r) => acc + r.dmg, 0);
      renderer.shakeRock(Math.min(totalHitDmg / 10 + 1, 6));
      renderer.addParticle(
        canvasContainer.clientWidth * 0.68,
        canvasContainer.clientHeight * 0.45,
        s.currentBiome.particleColor
      );

      // Floating text
      hitResults.forEach((result, idx) => {
        const dmgColor = result.isCrit ? '#e3b341' : '#58a6ff';
        const dmgSize = result.isCrit ? 20 : 14;
        const doublePrefix = idx > 0 ? '⚡' : '';
        const label = result.isCrit ? `${doublePrefix}⚡${formatNum(result.dmg)}!` : `${doublePrefix}${formatNum(result.dmg)}`;
        ui.spawnFloatingText(x + idx * 12, y - idx * 8, label, dmgColor, dmgSize);
      });

      // Screen shake
      if (hitResults.some(r => r.isCrit)) {
        canvasContainer.classList.add('shake');
        setTimeout(() => canvasContainer.classList.remove('shake'), 150);
      }

      if (hitResults.some(r => r.destroyed)) this.onRockDestroyed();
      ui.updateAll();
    });

    // Touch feedback
    canvasContainer.addEventListener('touchstart', () => {}, {passive:true});

    // Alchemy
    document.getElementById('btn-craft-frenzy').addEventListener('click', () => {
      if (s.fragments >= 30) { s.fragments -= 30; s.frenzyPotions++; ui.updateAll(); showToast('🧪 Poción de Frenesí creada!', '#a371f7'); }
      else showToast('Fragmentos insuficientes (necesitas 30)', '#f78166');
    });

    document.getElementById('btn-use-frenzy').addEventListener('click', () => {
      if (s.frenzyPotions <= 0) { showToast('No tienes Pociones de Frenesí', '#f78166'); return; }
      s.frenzyPotions--;
      s.frenzyActive = true;
      const bonusDur = s.permFrenzyBonus;
      s.frenzyEndTime = Date.now() + (15 + bonusDur) * 1000;
      s.frenzyUsed++;
      ui.updateAll();
      showToast('🔥 ¡FRENESÍ ACTIVADO!', '#ff4444');
    });

    document.getElementById('btn-craft-wealth').addEventListener('click', () => {
      if (s.fragments >= 60) { s.fragments -= 60; s.wealthElixirs++; ui.updateAll(); showToast('💛 Elixir de Riqueza creado!', '#e3b341'); }
      else showToast('Fragmentos insuficientes (necesitas 60)', '#f78166');
    });

    document.getElementById('btn-use-wealth').addEventListener('click', () => {
      if (s.wealthElixirs <= 0) { showToast('No tienes Elixires de Riqueza', '#f78166'); return; }
      s.wealthElixirs--;
      s.wealthActive = true;
      s.wealthEndTime = Date.now() + 30000;
      ui.updateAll();
      showToast('💰 ¡Elixir de Riqueza activo por 30s!', '#e3b341');
    });

    document.getElementById('btn-craft-gem').addEventListener('click', () => {
      if (s.fragments >= 100) { s.fragments -= 100; s.gems += 1; ui.updateAll(); showToast('💎 ¡1 Gema obtenida!', '#a371f7'); }
      else showToast('Fragmentos insuficientes (necesitas 100)', '#f78166');
    });

    // Forge
    document.getElementById('btn-upgrade-crit').addEventListener('click', () => {
      const cost = s.getCritCost();
      if (s.gems >= cost) {
        s.gems -= cost; s.critChance += 5; s.critUpgLevel++;
        s.critChance = Math.min(s.critChance, 75);
        ui.updateAll(); showToast('⚡ Golpe Crítico mejorado!', '#e3b341');
      } else showToast('Gemas insuficientes', '#f78166');
    });

    document.getElementById('btn-upgrade-loot').addEventListener('click', () => {
      const cost = s.getLootCost();
      if (s.gems >= cost) {
        s.gems -= cost; s.lootChance += 5; s.lootUpgLevel++;
        s.lootChance = Math.min(s.lootChance, 80);
        ui.updateAll(); showToast('🍀 Hallazgo de Tesoros mejorado!', '#a371f7');
      } else showToast('Gemas insuficientes', '#f78166');
    });

    document.getElementById('btn-upgrade-armor').addEventListener('click', () => {
      const cost = s.getArmorCost();
      if (s.gems >= cost) {
        s.gems -= cost; s.armor++; s.armorUpgLevel++;
        ui.updateAll(); showToast('🛡️ Armadura mejorada!', '#58a6ff');
      } else showToast('Gemas insuficientes', '#f78166');
    });

    // Prestige
    document.getElementById('btn-prestige').addEventListener('click', () => {
      if (s.rockLevel < 50) { showToast('Necesitas Roca Nv.50', '#f78166'); return; }
      const overlay = document.createElement('div');
      overlay.className = 'glass-overlay';
      overlay.innerHTML = `
        <div class="glass-modal">
          <div class="modal-title">✨ RENACIMIENTO</div>
          <div class="modal-desc">
            ¿Estás seguro de que deseas renacer?<br><br>
            Perderás: Oro, Gemas, Fragmentos y todos los niveles de mejora.<br><br>
            Ganarás: <strong style="color:var(--gem);">+3 Monedas Ancestrales</strong><br>
            Úsalas en el Árbol de Habilidades para bufos permanentes.
          </div>
          <div style="display:flex; gap:10px; justify-content:center;">
            <button class="btn btn-gem" id="confirm-prestige">✨ RENACER</button>
            <button class="btn" style="background:var(--bg-card2);" id="cancel-prestige">CANCELAR</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      document.getElementById('confirm-prestige').addEventListener('click', () => {
        s.applyPrestige();
        overlay.remove();
        ui.buildSkillTree();
        ui.buildBiomes();
        ui.buildMissions();
        ui.updateAll();
        showToast('✨ ¡Has Renacido! +3 Monedas Ancestrales', '#a371f7');
      });
      document.getElementById('cancel-prestige').addEventListener('click', () => overlay.remove());
    });
  }

  onRockDestroyed() {
    const s = this.state;
    const ui = this.ui;
    const renderer = this.renderer;

    const gold = s.destroyRock();

    // Big particles
    for (let i = 0; i < 3; i++) {
      renderer.addParticle(
        this.canvas.width * 0.68 + rnd(-20, 20),
        this.canvas.height * 0.5,
        s.currentBiome.particleColor
      );
    }

    document.getElementById('canvas-container').classList.add('shake');
    setTimeout(() => document.getElementById('canvas-container').classList.remove('shake'), 200);

    showToast(`🪨 Roca destruida! +${formatNum(gold)} 🪙`, '#e3b341');

    // Check missions
    ui.buildMissions();
    ui.buildBiomes();
  }

  startDpsInterval() {
    setInterval(() => {
      const s = this.state;
      const result = this.forceSystem.applyDpsTick();
      if (!result) return;

      if (result.destroyed) this.onRockDestroyed();
      this.ui.updateRockBar();
      this.ui.updateHUD();
      this.ui.updateFrenzyUI();
      this.ui.updateForceTab();

      // Update wealth effect
      if (s.wealthActive && Date.now() >= s.wealthEndTime) s.wealthActive = false;
    }, 100);
  }

  startGameLoop() {
    const loop = (ts) => {
      this.renderer.render(this.state);
      this.ui.updateFrenzyUI();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// =============================================
// INIT
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});

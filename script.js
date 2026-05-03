/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
const G = {
  gold:      0,
  dps:       1,
  rockLevel: 1,
  hp:        0,
  maxHp:     0,
  clickDmg:  1,
};

const rockMaxHp   = lvl => Math.floor(100  * Math.pow(1.38, lvl - 1));
const goldReward  = lvl => Math.floor(8    * Math.pow(1.50, lvl - 1));
const clickDmgLvl = lvl => Math.max(1, Math.floor(Math.pow(1.18, lvl - 1)));

const UPGRADES = [
  { id:0, name:'Pico de Madera',    icon:'🪵', desc:'Da tus primeros golpes automáticos.',  cost:15,     dps:3    },
  { id:1, name:'Pico de Piedra',    icon:'🪨', desc:'Golpe sólido. +6 DPS pasivo.',          cost:60,     dps:6    },
  { id:2, name:'Pico de Hierro',    icon:'⚙️', desc:'Metal que resiste. +14 DPS.',           cost:200,    dps:14   },
  { id:3, name:'Pico de Oro',       icon:'✨', desc:'Brilla con fuerza. +35 DPS.',            cost:700,    dps:35   },
  { id:4, name:'Pico de Diamante',  icon:'💎', desc:'Corta como nada. +90 DPS.',             cost:2200,   dps:90   },
  { id:5, name:'Pico de Obsidiana', icon:'🌋', desc:'Forjado en volcanes. +250 DPS.',         cost:7000,   dps:250  },
  { id:6, name:'Pico de Cristal',   icon:'🔮', desc:'Magia pura cristalizada. +700 DPS.',    cost:22000,  dps:700  },
  { id:7, name:'Pico Rúnico',       icon:'⚡', desc:'Ancestral e imparable. +2000 DPS.',     cost:70000,  dps:2000 },
];
const boughtSet = new Set();

const rand    = (a,b) => Math.random()*(b-a)+a;
const randInt = (a,b) => Math.floor(rand(a,b+1));
function fmt(n) {
  if (n>=1e9) return (n/1e9).toFixed(1)+'B';
  if (n>=1e6) return (n/1e6).toFixed(1)+'M';
  if (n>=1e3) return (n/1e3).toFixed(1)+'K';
  return Math.floor(n)+'';
}

function updateUI() {
  document.getElementById('coin-counter').textContent = fmt(G.gold);
  document.getElementById('dps-display').textContent  = fmt(G.dps);
  document.getElementById('level-num').textContent    = G.rockLevel;
  document.getElementById('rock-name-label').textContent = 'Roca '+G.rockLevel;

  const pct = Math.max(0, G.hp / G.maxHp * 100);
  const fill = document.getElementById('hp-bar-fill');
  fill.style.width = pct+'%';
  fill.classList.toggle('low', pct < 25);

  document.getElementById('hp-bar-text').textContent =
    fmt(Math.max(0,Math.ceil(G.hp)))+' / '+fmt(G.maxHp);

  document.getElementById('xp-bar-inner').style.width = (100-pct)+'%';
}

const ROCK_THEMES = [
  ['#8a8a9e','#5a5a6e','#3a3a4e'],
  ['#9e8a5a','#6e5a2a','#4e3a10'],
  ['#5a8a6e','#2a6e4a','#0a4e2a'],
  ['#6e5a9e','#4a2a7e','#2a0a5e'],
  ['#9e3a3a','#7e1a1a','#5e0a0a'],
  ['#3a7e9e','#1a5e7e','#0a3e5e'],
  ['#9e9e3a','#7e7e1a','#5e5e0a'],
];
function applyRockTheme() {
  const t = ROCK_THEMES[Math.floor((G.rockLevel-1)/5) % ROCK_THEMES.length];
  const stops = document.querySelectorAll('#rockGrad stop');
  stops[0].setAttribute('stop-color',t[0]);
  stops[1].setAttribute('stop-color',t[1]);
  stops[2].setAttribute('stop-color',t[2]);
}

function refreshShop() {
  const list = document.getElementById('upgrade-list');
  list.innerHTML = '';
  let anyShown = false;
  UPGRADES.forEach(u => {
    const bought   = boughtSet.has(u.id);
    const canBuy   = !bought && G.gold >= u.cost;
    anyShown = true;
    const item = document.createElement('div');
    item.className = 'upgrade-item';
    item.innerHTML = `
      <div class="upgrade-icon">${u.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${u.name}</div>
        <div class="upgrade-desc">${u.desc}</div>
        ${bought
          ? '<div class="upgrade-bought">✅ Comprado</div>'
          : `<div class="upgrade-dps">+${fmt(u.dps)} DPS automático</div>`
        }
      </div>
      ${bought
        ? ''
        : `<button class="upgrade-buy ${canBuy?'can-buy':'cant-buy'}"
             onclick="buyUpgrade(${u.id})" ${canBuy?'':'disabled'}>
             🪙 ${fmt(u.cost)}
           </button>`
      }`;
    list.appendChild(item);
  });
  if (!anyShown) list.innerHTML='<p style="color:#666;text-align:center;padding:16px">¡Ya tienes todo!</p>';
}

function buyUpgrade(id) {
  const u = UPGRADES[id];
  if (!u || boughtSet.has(id) || G.gold < u.cost) return;
  G.gold -= u.cost;
  G.dps  += u.dps;
  boughtSet.add(id);
  updateUI();
  refreshShop();
}

function initRock() {
  G.maxHp    = rockMaxHp(G.rockLevel);
  G.hp       = G.maxHp;
  G.clickDmg = clickDmgLvl(G.rockLevel);
  applyRockTheme();
  updateUI();
}

function clickRock(e) {
  if (G.hp <= 0) return;
  const dmg = G.clickDmg * rand(0.9, 1.25);
  applyDamage(dmg, true);

  const miner = document.getElementById('miner');
  miner.classList.remove('swing'); void miner.offsetWidth;
  miner.classList.add('swing');
  setTimeout(()=>miner.classList.remove('swing'),280);
}

function applyDamage(dmg, fromClick) {
  if (G.hp <= 0) return;
  G.hp = Math.max(0, G.hp - dmg);
  updateUI();

  triggerShake();

  const cave     = document.getElementById('cave-area');
  const areaRect = cave.getBoundingClientRect();
  const rockRect = document.getElementById('rock-container').getBoundingClientRect();

  if (fromClick) {
    const count = randInt(2,3);
    for (let i=0;i<count;i++) setTimeout(()=>spawnDamageNum(rockRect,areaRect,dmg),i*65);
    spawnChips(rockRect, areaRect, randInt(4,7));
    spawnImpactFlash(rockRect, areaRect);
  } else {
    spawnAsh(rockRect, areaRect, randInt(2,5));
    spawnChips(rockRect, areaRect, randInt(1,3));
  }

  if (G.hp <= 0) respawnRock();
}

function triggerShake() {
  const r = document.getElementById('rock');
  r.classList.remove('shake'); void r.offsetWidth;
  r.classList.add('shake');
  setTimeout(()=>r.classList.remove('shake'),360);
}

function respawnRock() {
  G.gold += goldReward(G.rockLevel);
  G.rockLevel++;

  const r = document.getElementById('rock');
  r.classList.add('destroy');
  setTimeout(()=>r.classList.remove('destroy'),450);

  document.getElementById('banner-level').textContent = G.rockLevel;
  const banner = document.getElementById('levelup-banner');
  banner.classList.remove('show'); void banner.offsetWidth;
  banner.classList.add('show');
  setTimeout(()=>banner.classList.remove('show'),1600);

  initRock();
}

let ashTimer = 0;

setInterval(()=>{
  if (G.dps <= 1 || G.hp <= 0) return;

  const tickDmg = G.dps / 10;
  applyDamage(tickDmg, false);

  ashTimer += 100;
  if (ashTimer >= 400) {
    ashTimer = 0;
    triggerShake();
  }
}, 100);

const DMG_COLORS = ['#FFD700','#ff4466','#00e5ff'];

function spawnDamageNum(rockRect, areaRect, dmg) {
  const el = document.createElement('div');
  el.className = 'damage-number';
  const t = Math.random();
  let color, txt;
  if (t < 0.55) { color=DMG_COLORS[0]; txt=fmt(dmg*rand(.9,1.1)); el.style.fontSize='16px'; }
  else if (t<.82){ color=DMG_COLORS[1]; txt='💥 '+fmt(dmg*rand(1.4,2.2)); el.style.fontSize='18px'; }
  else           { color=DMG_COLORS[2]; txt='⚡ CRIT!'; el.style.fontSize='20px'; }
  el.style.color = color;
  el.textContent = txt;
  el.style.left = ((rockRect.left-areaRect.left)+rand(12, rockRect.width-12))+'px';
  el.style.top  = ((rockRect.top -areaRect.top) +rand(5,  55))+'px';
  document.getElementById('cave-area').appendChild(el);
  setTimeout(()=>el.remove(), 1150);
}

const CHIP_COLORS = ['#7a8aa0','#9090b0','#5a6a80','#b0b8c8','#888','#aaa','#ccc'];

function spawnChips(rockRect, areaRect, count) {
  const cx = (rockRect.left-areaRect.left) + rockRect.width*.5;
  const cy = (rockRect.top -areaRect.top)  + rockRect.height*.44;
  for(let i=0;i<count;i++){
    const el=document.createElement('div'); el.className='chip';
    el.style.background=CHIP_COLORS[randInt(0,CHIP_COLORS.length-1)];
    el.style.left=(cx+rand(-20,20))+'px'; el.style.top=(cy+rand(-15,15))+'px';
    const dur=rand(.4,.85);
    el.style.setProperty('--tx',rand(-55,55)+'px');
    el.style.setProperty('--ty',rand(-60,10)+'px');
    el.style.setProperty('--rot',rand(-360,360)+'deg');
    el.style.setProperty('--dur',dur+'s');
    document.getElementById('cave-area').appendChild(el);
    setTimeout(()=>el.remove(), dur*1000+60);
  }
}

function spawnImpactFlash(rockRect, areaRect) {
  const el=document.createElement('div'); el.className='impact-flash';
  const s=rand(28,48); el.style.width=s+'px'; el.style.height=s+'px';
  el.style.left=((rockRect.left-areaRect.left)+rand(20,rockRect.width-20)-s/2)+'px';
  el.style.top =((rockRect.top -areaRect.top) +rand(10,rockRect.height*.65)-s/2)+'px';
  document.getElementById('cave-area').appendChild(el);
  setTimeout(()=>el.remove(),280);
}

const ASH_PALETTE = [
  'rgba(155,150,145,A)','rgba(200,195,190,A)','rgba(110,105,100,A)',
  'rgba(80,75,70,A)',   'rgba(210,175,120,A)','rgba(90,75,60,A)',
  'rgba(170,165,160,A)','rgba(130,120,110,A)',
];

function spawnAsh(rockRect, areaRect, count) {
  const cx = (rockRect.left-areaRect.left) + rockRect.width*.5;
  const cy = (rockRect.top -areaRect.top)  + rockRect.height*.42;
  const cave = document.getElementById('cave-area');

  for(let i=0;i<count;i++){
    const el  = document.createElement('div'); el.className='ash';
    const s   = rand(5,13);
    const dur = rand(0.9,1.7);
    const op  = rand(0.45,0.88).toFixed(2);
    const col = ASH_PALETTE[randInt(0,ASH_PALETTE.length-1)].replace('A',op);
    el.style.background = col;
    el.style.width  = s+'px'; el.style.height = s+'px';
    el.style.left   = (cx+rand(-24,24))+'px';
    el.style.top    = (cy+rand(-20,20))+'px';
    el.style.setProperty('--tx', rand(-45,45)+'px');
    el.style.setProperty('--ty', rand(-75,-25)+'px');
    el.style.setProperty('--dur', dur+'s');
    cave.appendChild(el);
    setTimeout(()=>el.remove(), dur*1000+60);
  }
}

function openSection(id) {
  closeSection();
  const el = document.getElementById('overlay-'+id);
  if (el) { el.classList.add('active'); if(id==='picks') refreshShop(); }
}
function closeSection() {
  document.querySelectorAll('.section-overlay').forEach(o=>o.classList.remove('active'));
}

(()=>{
  const c = document.getElementById('stalactites');
  [[14,38],[10,28],[18,52],[12,34],[16,44],[9,24],[20,56],[13,36],[11,30],[17,48],[15,40]]
    .forEach(([w,h])=>{
      const el=document.createElement('div'); el.className='stalactite';
      el.style.borderLeftWidth=(w/2)+'px'; el.style.borderRightWidth=(w/2)+'px'; el.style.borderTopWidth=h+'px';
      c.appendChild(el);
    });
})();

initRock();

(()=>{
/* ============================================================
   ESTADO DEL JUEGO
   ============================================================ */
const ICONOS = {ATAQUE:'⚔️', DEFENSA:'🛡️', HP:'❤️', VELOCIDAD:'💨', CRITICO:'🎯', EVASION:'🌀'};
const STAT_HELP = {
  ATAQUE:'Daño base',
  DEFENSA:'Reducción',
  HP:'Vida máxima',
  VELOCIDAD:'Golpe y paso',
  CRITICO:'Doble daño',
  EVASION:'Esquiva'
};
const PERCENT_STATS = new Set(['CRITICO','EVASION']);
const BATTLE_THRESHOLDS = { CRITICO:93, EVASION:94 };

const game = {
  gold: 0, crystal: 0, dollar: 0,
  battle: { player: null },
  stats: {
    // Cada slot: xp inicial 70, crecimiento x1.02 por nivel
    ATAQUE:   { level:1, value:5,    xp:0, xpNext:70, gain:3,    xpGrowth:1.02 },
    CRITICO:  { level:1, value:0.15, xp:0, xpNext:70, gain:0.15, xpGrowth:1.02 },
    DEFENSA:  { level:1, value:5,    xp:0, xpNext:70, gain:1,    xpGrowth:1.02 },
    HP:       { level:1, value:30,   xp:0, xpNext:70, gain:10,   xpGrowth:1.02 },
    VELOCIDAD:{ level:1, value:4,    xp:0, xpNext:70, gain:0.45, xpGrowth:1.02 },
    EVASION:  { level:1, value:0.15, xp:0, xpNext:70, gain:0.15, xpGrowth:1.02 }
  }
};

const ORDER = ["ATAQUE","DEFENSA","VELOCIDAD","CRITICO","HP","EVASION"];

/* ============================================================
   REFERENCIAS DOM
   ============================================================ */
const room = document.getElementById('room');
const character = document.getElementById('character');
const charSvg = document.getElementById('char-svg');
const boxingBag = document.getElementById('boxing-bag');
const treadmillEl = document.getElementById('treadmill');
const weightMachine = document.getElementById('weight-machine');
const cancelBtn = document.getElementById('cancel-btn');
const floatLayer = document.getElementById('float-layer');
const statsGrid = document.getElementById('stats-grid');
const coliseoPanel = document.getElementById('coliseo-panel');
const luchaPanel = document.getElementById('lucha-panel');
const luchaBtn = document.getElementById('lucha-btn');
const fpsValueEl = document.getElementById('fps-value');

let currentAction = null;   // 'punch' | 'weights' | 'treadmill' | null
let actionTimer = null;     // intervalo activo
let repCount = 0;
let kmCount = 0;
let kmLabel = null;

/* ============================================================
   ESCALADO AL DISPOSITIVO (diseño exacto 393x873)
   - Mantiene la resolución fija en pantallas grandes.
   - Solo reduce la escala si la pantalla es menor que 393x873.
   ============================================================ */
const gameEl = document.getElementById('game');
function fit(){
  const s = Math.min(1, window.innerWidth/393, window.innerHeight/873);
  gameEl.style.transform = `scale(${s})`;
}
function getScale(){
  const m = gameEl.style.transform.match(/scale\(([\d.]+)\)/);
  return m ? parseFloat(m[1]) : 1;
}
window.addEventListener('resize', fit); fit();

/* ============================================================
   PERF: cache de rects (evita layout thrashing en el hot path)
   ============================================================ */
const __rectCache = { room:null, bag:null, tm:null, char:null, scale:1, dirty:true };
function invalidateRects(){ __rectCache.dirty = true; }
function getRects(){
  if(__rectCache.dirty){
    __rectCache.room = (typeof room !== 'undefined' && room) ? room.getBoundingClientRect() : null;
    __rectCache.bag  = (typeof boxingBag !== 'undefined' && boxingBag) ? boxingBag.getBoundingClientRect() : null;
    __rectCache.tm   = (typeof treadmillEl !== 'undefined' && treadmillEl) ? treadmillEl.getBoundingClientRect() : null;
    __rectCache.char = (typeof character !== 'undefined' && character) ? character.getBoundingClientRect() : null;
    __rectCache.scale = getScale();
    __rectCache.dirty = false;
  }
  return __rectCache;
}
window.addEventListener('resize', invalidateRects, {passive:true});
window.addEventListener('scroll', invalidateRects, {passive:true});
// Invalidar tras animaciones del personaje (transiciones de transform)
setInterval(invalidateRects, 1000);

function startFpsCounter(){
  let frames = 0;
  let lastSample = performance.now();
  function update(now){
    frames++;
    if(now - lastSample >= 250){
      const fps = Math.round((frames * 1000) / (now - lastSample));
      fpsValueEl.textContent = String(Math.min(60, Math.max(0, fps)));
      frames = 0;
      lastSample = now;
    }
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function roundStat(num){
  return Math.round(num * 100) / 100;
}
function formatNumber(num, digits=2){
  return Number.isInteger(num) ? String(num) : parseFloat(num.toFixed(digits)).toString();
}
function formatStatValue(key, value){
  if(PERCENT_STATS.has(key)) return roundStat(value).toFixed(2) + '%';
  return formatNumber(value, 2);
}
function formatGain(key, value){
  return PERCENT_STATS.has(key) ? roundStat(value).toFixed(2) + '%' : formatNumber(value, 2);
}
function getPowerValue(){
  let power = 0;
  ORDER.forEach(k=> power += game.stats[k].value);
  return roundStat(power);
}
function getMoveDurationMs(){
  return Math.max(260, Math.round(600 - (game.stats.VELOCIDAD.value * 18)));
}
function getPunchIntervalMs(){
  return Math.max(230, Math.round(430 - (game.stats.VELOCIDAD.value * 12)));
}
function getWalkCycleMs(){
  return Math.max(220, Math.round(360 - (game.stats.VELOCIDAD.value * 6)));
}
function getBeltSpeedMs(){
  return Math.max(180, Math.round(300 - (game.stats.VELOCIDAD.value * 5)));
}
function applyCharacterSpeed(){
  const moveDuration = getMoveDurationMs();
  const walkCycle = getWalkCycleMs();
  const punchSpeed = getPunchIntervalMs();
  const runSpeed = Math.max(160, Math.round(walkCycle * 0.72));
  const liftSpeed = Math.max(600, Math.round(punchSpeed * 2.2));
  
  character.style.transitionDuration = moveDuration + 'ms';
  charSvg.style.setProperty('--punch-speed', punchSpeed + 'ms');
  charSvg.style.setProperty('--walk-speed', walkCycle + 'ms');
  charSvg.style.setProperty('--run-speed', runSpeed + 'ms');
  charSvg.style.setProperty('--lift-speed', liftSpeed + 'ms');
  treadmillEl.style.setProperty('--belt-speed', getBeltSpeedMs() + 'ms');
  return moveDuration;
}
function getDefenseReduction(defenseValue){
  return Math.min(0.30, defenseValue * 0.006);
}
function rollWindowChance(chance, threshold){
  const roll = Math.random() * 100;
  const upperLimit = Math.min(100, threshold + chance);
  return roll > threshold && roll <= upperLimit;
}
function rollCriticalHit(fighter = game.battle.player || syncPlayerBattleStats()){
  return rollWindowChance(fighter.critChance ?? 0, fighter.critThreshold ?? BATTLE_THRESHOLDS.CRITICO);
}
function rollEvasion(fighter = game.battle.player || syncPlayerBattleStats()){
  return rollWindowChance(fighter.evasionChance ?? 0, fighter.evasionThreshold ?? BATTLE_THRESHOLDS.EVASION);
}
function resolveBattleHit(attacker, defender){
  if(rollEvasion(defender)) return { damage:0, critical:false, evaded:true, remainingHp:defender.currentHp };
  let damage = Math.max(1, Math.round(attacker.attack));
  const critical = rollCriticalHit(attacker);
  if(critical) damage *= 2;
  const defenseReduction = typeof defender.defenseReduction === 'number'
    ? defender.defenseReduction
    : getDefenseReduction(defender.defense || 0);
  damage = Math.max(1, Math.round(damage * (1 - defenseReduction)));
  defender.currentHp = Math.max(0, defender.currentHp - damage);
  return { damage, critical, evaded:false, remainingHp:defender.currentHp };
}
function syncPlayerBattleStats(){
  const player = {
    attack: roundStat(game.stats.ATAQUE.value),
    defense: roundStat(game.stats.DEFENSA.value),
    maxHp: Math.max(1, Math.round(game.stats.HP.value)),
    currentHp: Math.max(1, Math.round(game.stats.HP.value)),
    moveSpeed: roundStat(1 + game.stats.VELOCIDAD.value * 0.05),
    hitSpeedMs: getPunchIntervalMs(),
    critChance: roundStat(game.stats.CRITICO.value),
    evasionChance: roundStat(game.stats.EVASION.value),
    critThreshold: BATTLE_THRESHOLDS.CRITICO,
    evasionThreshold: BATTLE_THRESHOLDS.EVASION,
    defenseReduction: roundStat(getDefenseReduction(game.stats.DEFENSA.value))
  };
  game.battle.player = player;
  window.GYM_HERO_BATTLE_RESPALDO = {
    syncPlayer: syncPlayerBattleStats,
    getPlayer: () => ({...game.battle.player}),
    resolveHit: resolveBattleHit,
    rollCritical: rollCriticalHit,
    rollEvasion: rollEvasion
  };
  return player;
}

/* ============================================================
   CONSTRUCCIÓN DE TARJETAS DE ESTADÍSTICAS
   ============================================================ */
function buildStatCards(){
  statsGrid.innerHTML = '';
  ORDER.forEach(key=>{
    const s = game.stats[key];
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.dataset.s = key;
    card.innerHTML = `
      <div class="stat-top">
        <span class="stat-ico">${ICONOS[key]}</span>
        <div class="stat-meta">
          <div class="name">${key}</div>
          <div class="lvl">Nv. <span class="lvl-n">${s.level}</span></div>
        </div>
      </div>
      <div class="stat-mid">
        <div class="val" data-val="${key}">${formatStatValue(key, s.value)}</div>
        <div class="stat-desc">${STAT_HELP[key]}</div>
      </div>
      <div class="stat-foot">
        <div class="xp-wrap"><div class="xp-fill" data-xp="${key}"></div></div>
      </div>`;
    statsGrid.appendChild(card);
  });
  refreshStats();
}

/* ============================================================
   ACTUALIZACIÓN DE UI (con cache de nodos y diff)
   ============================================================ */
const __resNodes = {};
const __statNodes = new Map();
const __lastRendered = { gold:null, crystal:null, dollar:null, power:null, stats:{} };
let __refreshQueued = false;
let __refreshFullPending = true;

function __getResNode(id){ return __resNodes[id] || (__resNodes[id] = document.getElementById(id)); }
function __getStatNodes(key){
  let n = __statNodes.get(key);
  if(!n){
    const card = statsGrid.querySelector(`[data-s="${key}"]`);
    if(!card) return null;
    n = {
      card,
      val: card.querySelector('.val'),
      lvl: card.querySelector('.lvl-n'),
      xp:  card.querySelector('.xp-fill')
    };
    __statNodes.set(key, n);
  }
  return n;
}

function __doRefresh(){
  __refreshQueued = false;
  // Recursos (diff)
  const gold = Math.floor(game.gold);
  if(gold !== __lastRendered.gold){ __getResNode('gold').textContent = gold; __lastRendered.gold = gold; }
  const crystal = Math.floor(game.crystal);
  if(crystal !== __lastRendered.crystal){ __getResNode('crystal').textContent = crystal; __lastRendered.crystal = crystal; }
  const dollar = Math.floor(game.dollar);
  if(dollar !== __lastRendered.dollar){ __getResNode('dollar').textContent = dollar; __lastRendered.dollar = dollar; }
  const power = formatNumber(getPowerValue(), 2);
  if(power !== __lastRendered.power){ __getResNode('power').textContent = power; __lastRendered.power = power; }

  // Tarjetas (diff por stat)
  ORDER.forEach(k=>{
    const s = game.stats[k];
    const n = __getStatNodes(k);
    if(!n) return;
    const last = __lastRendered.stats[k] || (__lastRendered.stats[k] = {});
    const v = formatStatValue(k, s.value);
    if(v !== last.val){ n.val.textContent = v; last.val = v; }
    if(s.level !== last.lvl){ n.lvl.textContent = s.level; last.lvl = s.level; }
    const pct = Math.min(100, (s.xp / s.xpNext) * 100);
    if(pct !== last.xp){ n.xp.style.width = pct + '%'; last.xp = pct; }
  });

  if(__refreshFullPending){
    applyCharacterSpeed();
    syncPlayerBattleStats();
    __refreshFullPending = false;
  }
}

function refreshStats(full){
  if(full !== false) __refreshFullPending = true;
  if(__refreshQueued) return;
  __refreshQueued = true;
  requestAnimationFrame(__doRefresh);
}

/* ============================================================
   EXPERIENCIA Y SUBIDA DE NIVEL
   ============================================================ */
function addXP(key, amount){
  const s = game.stats[key];
  s.xp += amount;
  while(s.xp >= s.xpNext){
    s.xp -= s.xpNext;
    s.level++;
    s.value = roundStat(s.value + s.gain);
    s.xpNext = Math.floor(s.xpNext * s.xpGrowth + 12);
    const n = __getStatNodes(key);
    if(n){
      n.card.classList.remove('gain'); void n.card.offsetWidth; n.card.classList.add('gain');
      n.val.classList.remove('flash'); void n.val.offsetWidth; n.val.classList.add('flash');
    }
    toast('⬆️ ' + key + ' subió a Nv.' + s.level + '  (+' + formatGain(key, s.gain) + ')');
  }
  refreshStats();
}

/* Flotante en la sala (daño / repeticiones) - con pool */
const __floatPool = [];
const FLOAT_POOL_MAX = 24;
function floatTextInRoom(x, y, text, crit){
  const t = __floatPool.pop() || document.createElement('div');
  t.className = 'float-txt' + (crit?' crit':'');
  t.textContent = text;
  t.style.left = x + 'px';
  t.style.top = y + 'px';
  // Reinicia animación si el nodo se reutiliza
  t.style.animation = 'none';
  // Forzar reflow SÓLO en el nodo pequeño (barato)
  void t.offsetWidth;
  t.style.animation = '';
  floatLayer.appendChild(t);
  setTimeout(()=>{
    if(t.parentNode) t.parentNode.removeChild(t);
    if(__floatPool.length < FLOAT_POOL_MAX) __floatPool.push(t);
  }, 1400);
}

/* ============================================================
   MOVIMIENTO DEL PERSONAJE
   ============================================================ */
const HOME = {x:0, y:0};
const TARGETS = {
  punch:    {x:170, y:94},
  weights:  {x:-76, y:96},
  treadmill:{x:80, y:90}
};
function moveCharTo(pos){
  character.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
}
function goHome(){
  character.style.transform = `translate(${HOME.x}px, ${HOME.y}px)`;
}

/* ============================================================
   GESTIÓN DE ACCIONES
   ============================================================ */
function clearActionClasses(){
  charSvg.classList.remove('punching','lifting','walking','running-man');
  boxingBag.classList.remove('swinging');
  treadmillEl.classList.remove('running');
}

function startAction(type){
  if(currentAction === type) return;
  stopAction(true);             // detiene cualquier acción previa
  currentAction = type;
  cancelBtn.classList.add('show');
  const moveDuration = applyCharacterSpeed();
  charSvg.classList.add('walking');
  moveCharTo(TARGETS[type]);

  // Pequeña espera para que llegue caminando (solo visual)
  setTimeout(()=>{
    if(currentAction !== type) return;
    charSvg.classList.remove('walking');
    if(type === 'punch') runPunch();
    else if(type === 'weights') runWeights();
    else if(type === 'treadmill') runTreadmill();
  }, Math.max(220, moveDuration - 20));
}

function stopAction(silent){
  if(actionTimer){ clearInterval(actionTimer); actionTimer = null; }
  clearActionClasses();
  currentAction = null;
  if(kmLabel){ kmLabel.remove(); kmLabel = null; }
  repCount = 0; kmCount = 0;
  cancelBtn.classList.remove('show');
  goHome();
  if(!silent) toast('Volviste al centro de la sala');
}

/* ---------- SACO DE BOXEO ---------- */
function runPunch(){
  charSvg.classList.add('punching');
  boxingBag.classList.add('swinging');
  const punchInterval = getPunchIntervalMs();
  invalidateRects();
  actionTimer = setInterval(()=>{
    const playerBattle = game.battle.player || syncPlayerBattleStats();
    const atk = playerBattle.attack;
    const isCrit = rollCriticalHit(playerBattle);
    let dmg = Math.max(1, Math.round(atk * (0.92 + Math.random()*0.16)));
    if(isCrit) dmg = Math.round(dmg * 2);
    const r = getRects();
    if(r.bag && r.room){
      const x = (r.bag.left + r.bag.width/2 - r.room.left)/r.scale;
      const y = (r.bag.top + 40 - r.room.top)/r.scale;
      floatTextInRoom(x, y, (isCrit?'¡CRIT! ':'') + dmg, isCrit);
    }
    addXP('ATAQUE', 6);
    addXP('CRITICO', 5);
    // refreshStats() ya se dispara dentro de addXP (rAF-coalesced)
  }, punchInterval);
}

/* ---------- PESAS ---------- */
function runWeights(){
  charSvg.classList.add('lifting');
  repCount = 0;
  invalidateRects();
  actionTimer = setInterval(()=>{
    repCount++;
    const r = getRects();
    if(r.char && r.room){
      const x = (r.char.left + r.char.width/2 - r.room.left)/r.scale;
      const y = (r.char.top - 10 - r.room.top)/r.scale;
      floatTextInRoom(x, y, '+' + repCount + ' rep', false);
    }
    addXP('HP', 7);
    addXP('DEFENSA', 6);
  }, 900);
}

/* ---------- CAMINADORA ---------- */
function runTreadmill(){
  charSvg.classList.add('running-man');
  treadmillEl.classList.add('running');
  kmCount = 0;
  kmLabel = document.createElement('div');
  kmLabel.className = 'counter-pill';
  kmLabel.innerHTML = '🏃 <span class="km">0.00</span> km';
  invalidateRects();
  const r0 = getRects();
  if(r0.tm && r0.room){
    kmLabel.style.left = ((r0.tm.left + r0.tm.width/2 - r0.room.left)/r0.scale) + 'px';
    kmLabel.style.top = ((r0.tm.top - 18 - r0.room.top)/r0.scale) + 'px';
  }
  room.appendChild(kmLabel);
  const kmSpan = kmLabel.querySelector('.km');

  actionTimer = setInterval(()=>{
    kmCount += 0.04;
    if(kmSpan) kmSpan.textContent = kmCount.toFixed(2);
    addXP('VELOCIDAD', 4);
    addXP('EVASION', 4);
  }, 300);
}

/* ============================================================
   EVENTOS DE CLIC
   ============================================================ */
function bindMachine(el, action){
  el.addEventListener('click', ()=>{
    el.classList.remove('touched'); void el.offsetWidth; el.classList.add('touched');
    startAction(action);
  });
}
bindMachine(boxingBag, 'punch');
bindMachine(weightMachine, 'weights');
bindMachine(treadmillEl, 'treadmill');

cancelBtn.addEventListener('click', ()=> stopAction(false));

/* Toast */
let toastTimer = null;
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 1600);
}


window.GymHeroRespaldo = {
  room,
  statsGrid,
  coliseoPanel,
  luchaPanel,
  luchaBtn,
  toast,
  getCurrentAction: () => currentAction,
  syncPlayerBattleStats,
  resolveBattleHit,
  rollCriticalHit,
  rollEvasion,
  getStatsSnapshot: () => JSON.parse(JSON.stringify(game.stats)),
  getPowerValue,
  addGold: (amount) => { game.gold += amount; refreshStats(); return game.gold; }
};

/* ============================================================
   INICIO
   ============================================================ */
buildStatCards();
refreshStats();
startFpsCounter();
})();

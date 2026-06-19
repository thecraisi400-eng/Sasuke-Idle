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
    // Cada slot: estadística inicial muy baja, xp requerida DISTINTA y creciente por nivel
    ATAQUE:   { level:1, value:5,    xp:0, xpNext:95,  gain:3,    xpGrowth:1.70 },
    CRITICO:  { level:1, value:0.15, xp:0, xpNext:130, gain:0.15, xpGrowth:1.75 },
    DEFENSA:  { level:1, value:5,    xp:0, xpNext:145, gain:3,    xpGrowth:1.80 },
    HP:       { level:1, value:30,   xp:0, xpNext:180, gain:12,   xpGrowth:1.85 },
    VELOCIDAD:{ level:1, value:4,    xp:0, xpNext:220, gain:2,    xpGrowth:2.15 },
    EVASION:  { level:1, value:0.15, xp:0, xpNext:210, gain:0.15, xpGrowth:2.15 }
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
  window.GYM_HERO_BATTLE = {
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
   ACTUALIZACIÓN DE UI
   ============================================================ */
function refreshStats(){
  // Recursos
  document.getElementById('gold').textContent = Math.floor(game.gold);
  document.getElementById('crystal').textContent = Math.floor(game.crystal);
  document.getElementById('dollar').textContent = Math.floor(game.dollar);
  // Poder global = sumatoria de todas las estadísticas
  document.getElementById('power').textContent = formatNumber(getPowerValue(), 2);
  // Tarjetas
  ORDER.forEach(k=>{
    const s = game.stats[k];
    const card = statsGrid.querySelector(`[data-s="${k}"]`);
    if(!card) return;
    card.querySelector('.val').textContent = formatStatValue(k, s.value);
    card.querySelector('.lvl-n').textContent = s.level;
    const pct = Math.min(100, (s.xp / s.xpNext) * 100);
    card.querySelector('.xp-fill').style.width = pct + '%';
  });
  applyCharacterSpeed();
  syncPlayerBattleStats();
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
    // Cada nivel exige más experiencia (factor propio por slot)
    s.xpNext = Math.floor(s.xpNext * s.xpGrowth + 12);
    // Recompensas (dinero desactivado por ahora)
    // game.crystal += 1.2;
    // game.dollar += 0.6;
    // Feedback visual
    const card = statsGrid.querySelector(`[data-s="${key}"]`);
    if(card){
      card.classList.remove('gain'); void card.offsetWidth; card.classList.add('gain');
      const valEl = card.querySelector('.val');
      valEl.classList.remove('flash'); void valEl.offsetWidth; valEl.classList.add('flash');
    }
    toast('⬆️ ' + key + ' subió a Nv.' + s.level + '  (+' + formatGain(key, s.gain) + ')');
  }
  refreshStats();
}

/* Flotante en la sala (daño / repeticiones) */
function floatTextInRoom(x, y, text, crit){
  const t = document.createElement('div');
  t.className = 'float-txt' + (crit?' crit':'');
  t.textContent = text;
  t.style.left = x + 'px';
  t.style.top = y + 'px';
  floatLayer.appendChild(t);
  setTimeout(()=> t.remove(), 1400);
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
  actionTimer = setInterval(()=>{
    // Daño basado en ATAQUE + variación, con crítico sincronizado al personaje
    const playerBattle = syncPlayerBattleStats();
    const atk = playerBattle.attack;
    const isCrit = rollCriticalHit(playerBattle);
    let dmg = Math.max(1, Math.round(atk * (0.92 + Math.random()*0.16)));
    if(isCrit) dmg = Math.round(dmg * 2);
    // Oro por entrenar (desactivado por ahora)
    // game.gold += 0.6 + (isCrit?0.6:0);
    // Texto de daño sobre el saco
    const bagRect = boxingBag.getBoundingClientRect();
    const roomRect = room.getBoundingClientRect();
    const scale = getScale();
    const x = (bagRect.left + bagRect.width/2 - roomRect.left)/scale;
    const y = (bagRect.top + 40 - roomRect.top)/scale;
    floatTextInRoom(x, y, (isCrit?'¡CRIT! ':'') + dmg, isCrit);
    // Experiencia -> ATAQUE y CRITICO
    addXP('ATAQUE', 6);
    addXP('CRITICO', 5);
    refreshStats();
  }, punchInterval);
}

/* ---------- PESAS ---------- */
function runWeights(){
  charSvg.classList.add('lifting');
  repCount = 0;
  actionTimer = setInterval(()=>{
    repCount++;
    // Cada subida = repetición visible que aparece y se desvanece
    const charRect = character.getBoundingClientRect();
    const roomRect = room.getBoundingClientRect();
    const scale = getScale();
    const x = (charRect.left + charRect.width/2 - roomRect.left)/scale;
    const y = (charRect.top - 10 - roomRect.top)/scale;
    floatTextInRoom(x, y, '+' + repCount + ' rep', false);
    // Recompensas y experiencia -> HP y DEFENSA (dinero desactivado por ahora)
    // game.gold += 0.6;
    // if(repCount % 5 === 0) game.dollar += 0.6;
    addXP('HP', 7);
    addXP('DEFENSA', 6);
    refreshStats();
  }, 900);
}

/* ---------- CAMINADORA ---------- */
function runTreadmill(){
  charSvg.classList.add('running-man');
  treadmillEl.classList.add('running');
  kmCount = 0;
  // Etiqueta persistente de kilómetros
  kmLabel = document.createElement('div');
  kmLabel.className = 'counter-pill';
  kmLabel.innerHTML = '🏃 <span class="km">0.00</span> km';
  const tmRect = treadmillEl.getBoundingClientRect();
  const roomRect = room.getBoundingClientRect();
  const scale = getScale();
  kmLabel.style.left = ((tmRect.left + tmRect.width/2 - roomRect.left)/scale) + 'px';
  kmLabel.style.top = ((tmRect.top - 18 - roomRect.top)/scale) + 'px';
  room.appendChild(kmLabel);

  actionTimer = setInterval(()=>{
    kmCount += 0.04;
    if(kmLabel) kmLabel.querySelector('.km').textContent = kmCount.toFixed(2);
    // Recompensas y experiencia -> VELOCIDAD y EVASION (dinero desactivado por ahora)
    // game.gold += 0.6;
    // if(kmCount % 1 < 0.04) game.dollar += 0.6;
    addXP('VELOCIDAD', 4);
    addXP('EVASION', 4);
    refreshStats();
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


window.GymHero = {
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
  rollEvasion
};

/* ============================================================
   INICIO
   ============================================================ */
buildStatCards();
refreshStats();
startFpsCounter();
})();

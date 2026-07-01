(()=>{
/* ============================================================
   LUCHA: panel de ring integrado al Coliseo del juego actual
   ============================================================ */
const { coliseoPanel, luchaPanel, luchaBtn, statsGrid, toast } = window.GymHeroRespaldo;
const luchaStatsPanel = document.getElementById("lucha-stats-panel");

const STAT_DEFS = [
  {key:"ATAQUE", out:"ataque", label:"ATAQUE", icon:"⚔️"},
  {key:"DEFENSA", out:"defensa", label:"DEFENSA", icon:"🛡️"},
  {key:"HP", out:"hp", label:"HP", icon:"❤️"},
  {key:"VELOCIDAD", out:"velocidad", label:"VELOCIDAD", icon:"⚡"},
  {key:"CRITICO", out:"critico", label:"CRÍTICO", icon:"💥"},
  {key:"EVASION", out:"evasion", label:"EVASIÓN", icon:"💨"}
];

const SEARCH_MESSAGES = ["Conectando al servidor...","Analizando nivel de combate...","Sincronizando datos del ring...","Buscando boxeador disponible...","Verificando estadísticas...","Emparejando nivel de fuerza..."];
const STATE = { IDLE:"idle", SEARCHING:"searching", FOUND:"found", COUNTDOWN:"countdown", FIGHTING:"fighting", RESULT:"result" };
let state = STATE.IDLE;
let matEl, ringWrap, overlay, timerDisplay, statsYouEl, statsCpuEl;
let player = null, enemy = null, rafId = null, fightTimerInterval = null, fightSecondsLeft = 45, lastFrameTs = 0;
let searchTimeoutId = null, searchTextInt = null, searchBlipInt = null, searchPingInt = null, lastSpecialAction = 0;
let scheduledTimeouts = [];
let matBoundsCache = { w:270, h:270, fw:48, fh:90 };

function rand(min,max){ return Math.random()*(max-min)+min; }
function randInt(min,max){ return Math.floor(rand(min,max+1)); }
function pick(arr){ return arr[randInt(0,arr.length-1)]; }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function statLevels(){
  const src = window.GymHeroRespaldo.getStatsSnapshot();
  const out = {};
  STAT_DEFS.forEach(function(d){ out[d.out] = Math.max(0, Number(src[d.key].value) || 0); });
  return out;
}
// NUEVO: Estado de arena actual y racha de victorias por arena (expuesto vía window al final)
var currentArena = (typeof currentArena !== "undefined") ? currentArena : 1; // NUEVO
var arenaWinStreak = (typeof arenaWinStreak !== "undefined") ? arenaWinStreak : 0; // NUEVO

// NUEVO: Rango de Presupuesto Total por arena (Ring 1 = 10–25; Ring 2 = 40–55; Ring N≥2 centro = 45 + (N-2)*25, ±7.5)
function getArenaBudgetRange(arena){
  if(arena <= 1) return { min: 10, max: 25 };
  var center = 45 + (arena - 2) * 25;
  return { min: center - 7.5, max: center + 7.5 };
}

// NUEVO: Reparto del presupuesto entre 6 slots según Arquetipo (EQUILIBRADO / OFENSIVO / DEFENSIVO)
function distributeBudgetByArchetype(total, keys){
  var alloc = {}; keys.forEach(function(k){ alloc[k] = 0; });
  var archetype = pick(["EQUILIBRADO","OFENSIVO","DEFENSIVO"]);
  if(archetype === "EQUILIBRADO"){
    var per = Math.floor(total / 6);
    keys.forEach(function(k){ alloc[k] = per; });
  } else {
    // OFENSIVO y DEFENSIVO: 75% del presupuesto en 3 slots aleatorios, 25% en los 3 restantes
    var shuffled = keys.slice();
    for(var i = shuffled.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    var heavy = shuffled.slice(0,3), light = shuffled.slice(3,6);
    var heavyEach = Math.floor((total * 0.75) / 3);
    var lightEach = Math.floor((total * 0.25) / 3);
    heavy.forEach(function(k){ alloc[k] = heavyEach; });
    light.forEach(function(k){ alloc[k] = lightEach; });
  }
  // Residuo al primer slot → asegura simetría: suma exacta = totalBudget
  var sum = 0; keys.forEach(function(k){ sum += alloc[k]; });
  var diff = Math.floor(total) - sum;
  if(diff !== 0) alloc[keys[0]] += diff;
  return alloc;
}

function enemyStatLevels(){
  // Mismos valores base que el jugador en nivel 1
  var BASE = {
    ataque:   5,
    defensa:  5,
    velocidad:4,
    critico:  0.15,
    hp:       30,
    evasion:  0.15
  };
  // Mismas ganancias por nivel que el jugador
  var GAIN = {
    ataque:   3,
    defensa:  1,
    velocidad:0.45,
    critico:  0.15,
    hp:       10,
    evasion:  0.15
  };
  var keys = ["ataque","defensa","velocidad","critico","hp","evasion"];

  // MODIFICADO: Reparto basado en Presupuesto Fijo por Arena con Variación
  // Paso 1: presupuesto total aleatorio dentro del rango de la arena actual
  var range = getArenaBudgetRange(currentArena); // NUEVO
  var baseTotal = range.min + Math.random() * (range.max - range.min); // NUEVO
  // Racha de dificultad: +2% acumulativo por victoria consecutiva en la arena (máx +20%)
  var streakMult = 1 + Math.min(0.20, arenaWinStreak * 0.02); // NUEVO
  var totalBudget = Math.floor(baseTotal * streakMult); // NUEVO

  // Pasos 2–4: arquetipo + reparto + Math.floor + residuo al primer slot
  var alloc = distributeBudgetByArchetype(totalBudget, keys); // NUEVO

  // Cada slot inicia en nivel 1 y suma los puntos asignados (mismo formato que antes)
  var levels = {};
  keys.forEach(function(k){ levels[k] = 1 + alloc[k]; });

  var out = {};
  keys.forEach(function(k){
    out[k] = BASE[k] + (levels[k] - 1) * GAIN[k];
  });
  return out;
}
function schedule(fn, ms){
  var id = setTimeout(function(){
    scheduledTimeouts = scheduledTimeouts.filter(function(t){ return t!==id; });
    fn();
  }, ms);
  scheduledTimeouts.push(id);
  return id;
}
function cleanupScheduledTimeouts(){ scheduledTimeouts.forEach(clearTimeout); scheduledTimeouts=[]; }
function levelSum(levels){ return Object.values(levels).reduce(function(a,b){ return a+b; },0); }
function combatStats(levels){
  return {
    maxHp: Math.max(1, Math.round(levels.hp)),
    atk: Math.max(1, levels.ataque),
    def: Math.max(0, levels.defensa),
    critChance: levels.critico,
    evasion: levels.evasion,
    speed: 80 + Math.round(levels.velocidad) * 6,
    atkCooldown: Math.max(380, 900 - Math.round(levels.velocidad) * 15)
  };
}
function rollWindow(chance, threshold){ return rand(chance, 100) >= threshold; }
function defenseReduction(def){ return Math.min(0.22, def * 0.005); }

// =========== REFERENCIA AL SISTEMA DE ENEMIGOS ===========
const Enemigos = window.GymHeroRespaldoEnemigos;
const PLAYER_COLORS = {head:"#2255aa", limb:"#1a3d80", stroke:"#1a1a3a", accent:"#ffffff"};

// SVG del personaje jugador (viewBox 0 0 50 80)
function playerSVGInner() {
  return '<g class="lucha-leg-left lucha-limb"><rect x="19.3" y="66.6" width="5.7" height="11.4" rx="1.4" fill="#1a1a3a"/></g><g class="lucha-leg-right lucha-limb"><rect x="25" y="66.6" width="5.7" height="11.4" rx="1.4" fill="#1a1a3a"/></g><g class="lucha-arm-left lucha-limb"><rect x="15.0" y="50.8" width="7.2" height="10.0" rx="2.9" fill="#1a3d80"/></g><g class="lucha-arm-right lucha-limb"><rect x="27.9" y="50.8" width="7.2" height="10.0" rx="2.9" fill="#1a3d80"/></g><g class="lucha-torso"><rect x="17.9" y="49.4" width="14.3" height="17.2" rx="2.9" fill="#2255aa"/><circle cx="25" cy="43.7" r="7.2" fill="#e0b090"/><circle cx="22.7" cy="41.3" r="1.5" fill="#fff" fill-opacity="0.22"/></g>';
}
function buildPanels(){
  luchaPanel.innerHTML = "<div class=\"lucha-ring-header\"><div class=\"timer\" id=\"lucha-timer-display\">⏱ --</div></div><div class=\"lucha-ring-wrap\" id=\"lucha-ring-wrap\"><div class=\"lucha-ring-container\"><div class=\"lucha-ring-floor\"></div>" + ["top","bottom","left","right"].map(function(side){ return [1,2,3,4].map(function(i){ return "<div class=\"lucha-rope-line lucha-rope-" + side + " r" + i + "\"></div>"; }).join(""); }).join("") + "<div class=\"lucha-corner-pad tl\"></div><div class=\"lucha-corner-pad tr\"></div><div class=\"lucha-corner-pad bl\"></div><div class=\"lucha-corner-pad br\"></div><div class=\"lucha-corner-post tl\"></div><div class=\"lucha-corner-post tr\"></div><div class=\"lucha-corner-post bl\"></div><div class=\"lucha-corner-post br\"></div><div class=\"lucha-mat\" id=\"lucha-mat\"></div></div><div class=\"lucha-overlay\" id=\"lucha-overlay\"><div class=\"lucha-radar-box\"></div><div>Toca el ring para buscar rival</div></div></div>";
  luchaStatsPanel.innerHTML = ["you","cpu"].map(function(type){
    return "<div class=\"lucha-stats-col " + type + "\"><div class=\"lucha-stats-header\"><div class=\"lucha-stats-avatar\">" + (type === "you" ? "🥊" : "🤖") + "</div><div><div class=\"lucha-stats-header-title\">" + (type === "you" ? "TÚ" : "CPU") + "</div><div class=\"lucha-stats-header-sub\">" + (type === "you" ? "Tu boxeador" : "Rival encontrado") + "</div></div></div><div class=\"lucha-stats-scroll\" id=\"lucha-stats-" + type + "\"></div></div>";
  }).join("");
  matEl = document.getElementById("lucha-mat");
  ringWrap = document.getElementById("lucha-ring-wrap");
  overlay = document.getElementById("lucha-overlay");
  timerDisplay = document.getElementById("lucha-timer-display");
  statsYouEl = document.getElementById("lucha-stats-you");
  statsCpuEl = document.getElementById("lucha-stats-cpu");
  ringWrap.addEventListener("click", function(){
    if(state === STATE.IDLE) startSearch();
  });
}
function renderStatRows(container, levels, prefix){
  container.innerHTML = "";
  var power = 0;
  STAT_DEFS.forEach(function(def){
    var raw = levels ? levels[def.out] : null;
    var v;
    if(raw === null || raw === undefined){
      v = "-";
    } else if(def.key === "CRITICO" || def.key === "EVASION"){
      v = raw.toFixed(2) + "%";
    } else {
      v = Number.isInteger(raw) ? String(raw) : parseFloat(raw.toFixed(2)).toString();
    }
    power += levels ? (levels[def.out] || 0) : 0;
    var card = document.createElement("div");
    card.className = "lucha-stat-card " + prefix;
    card.id = "lucha-" + prefix + "-" + def.out;
    var barW = 0;
    if(levels){
      if(def.key === "HP"){
        barW = Math.min(100, (raw / 100) * 100);
      } else if(def.key === "CRITICO" || def.key === "EVASION"){
        barW = Math.min(100, raw * 100);
      } else {
        barW = Math.min(100, (raw / 10) * 100);
      }
    }
    card.innerHTML = "<div class=\"lucha-stat-card-top\"><span class=\"lucha-stat-card-label\"><span>" + def.icon + "</span>" + def.label + "</span><span class=\"lucha-stat-card-value\">" + v + "</span></div><div class=\"lucha-stat-card-bar\"><div class=\"lucha-stat-card-bar-fill\" style=\"width:" + barW + "%\"></div></div>";
    container.appendChild(card);
  });
  return power;
}
function refreshFightStats(enemyLevels){
  var levels = statLevels();
  renderStatRows(statsYouEl, levels, "you");
  renderStatRows(statsCpuEl, enemyLevels || null, "cpu");
}
function showOverlay(html, dim){
  overlay.innerHTML = html;
  overlay.classList.toggle("dim", !!dim);
  overlay.classList.add("visible");
}
function hideOverlay(){ overlay.classList.remove("visible","dim","search-mode"); }
function setTimerDisplay(sec){
  timerDisplay.textContent = "⏱ " + sec + "s";
  timerDisplay.classList.toggle("warn", sec <= 10);
}
function cleanupSearchTimers(){
  if(searchTimeoutId) clearTimeout(searchTimeoutId);
  [searchTextInt,searchBlipInt,searchPingInt].forEach(function(id){ if(id) clearInterval(id); });
  searchTimeoutId = searchTextInt = searchBlipInt = searchPingInt = null;
}
function cancelSearch(){
  if(state !== STATE.SEARCHING) return;
  cleanupSearchTimers();
  hideOverlay();
  state = STATE.IDLE;
  timerDisplay.textContent = "⏱ --";
}
function searchHTML(server, queue, mode){
  return "<div class=\"lucha-search-window\"><div class=\"lucha-search-window-header\"><div class=\"lucha-search-dots\"><span class=\"lucha-search-dot red\"></span><span class=\"lucha-search-dot yellow\"></span><span class=\"lucha-search-dot green\"></span></div><div class=\"lucha-search-window-title\">MATCHMAKING · RING ARENA</div><div class=\"lucha-search-close\" id=\"lucha-search-cancel-btn\">✕</div></div><div class=\"lucha-search-body\"><div class=\"lucha-radar-box\"><div class=\"lucha-radar-ring r1\"></div><div class=\"lucha-radar-ring r2\"></div><div class=\"lucha-radar-ring r3\"></div><div class=\"lucha-radar-base\"></div><div class=\"lucha-radar-sweep\"></div><div id=\"lucha-radar-blips\"></div><div class=\"lucha-radar-core\"></div><div class=\"lucha-radar-icon\">🥊</div></div><div class=\"lucha-search-status\" id=\"lucha-search-status-text\">" + SEARCH_MESSAGES[0] + "</div><div class=\"lucha-search-progress-bg\"><div class=\"lucha-search-progress-fill\" id=\"lucha-search-progress-fill\"></div></div><div class=\"lucha-search-meta-grid\"><div class=\"lucha-meta-item\"><span class=\"lucha-meta-k\">SERVIDOR</span><span class=\"lucha-meta-v\">" + server + "</span></div><div class=\"lucha-meta-item\"><span class=\"lucha-meta-k\">PING</span><span class=\"lucha-meta-v\" id=\"lucha-meta-ping\">--ms</span></div><div class=\"lucha-meta-item\"><span class=\"lucha-meta-k\">EN COLA</span><span class=\"lucha-meta-v\">" + queue + " jugadores</span></div><div class=\"lucha-meta-item\"><span class=\"lucha-meta-k\">MODO</span><span class=\"lucha-meta-v\">" + mode + "</span></div></div></div></div>";
}
function spawnRadarBlip(container){
  if(!container) return;
  var b = document.createElement("div");
  b.className = "lucha-radar-blip";
  var a = rand(0, Math.PI * 2), d = rand(8, 38);
  b.style.left = (46 + Math.cos(a) * d) + "px";
  b.style.top = (46 + Math.sin(a) * d) + "px";
  container.appendChild(b);
  setTimeout(function(){ b.remove(); }, 1200);
}
function startSearch(){
  state = STATE.SEARCHING;
  refreshFightStats();
  setTimerDisplay(45);
  var dur = randInt(3400, 4900);
  showOverlay(searchHTML("RING-01", randInt(2, 9), "NOVATO"), false);
  overlay.classList.add("search-mode");
  var fill = document.getElementById("lucha-search-progress-fill");
  var status = document.getElementById("lucha-search-status-text");
  var blips = document.getElementById("lucha-radar-blips");
  var ping = document.getElementById("lucha-meta-ping");
  document.getElementById("lucha-search-cancel-btn").addEventListener("click", function(e){
    e.stopPropagation();
    cancelSearch();
  });
  requestAnimationFrame(function(){
    fill.style.transition = "width " + dur + "ms linear";
    fill.style.width = "100%";
  });
  var i = 0;
  searchTextInt = setInterval(function(){
    i = (i + 1) % SEARCH_MESSAGES.length;
    status.textContent = SEARCH_MESSAGES[i];
  }, 820);
  searchBlipInt = setInterval(function(){ spawnRadarBlip(blips); }, 380);
  searchPingInt = setInterval(function(){ ping.textContent = randInt(26, 98) + "ms"; }, 650);
  searchTimeoutId = setTimeout(onOpponentFound, dur);
}
function foundWindowHTML(enemyObj){
  var playerCard = Enemigos.cardHTML("you", "Tu Boxeador", "Retador Local", PLAYER_COLORS, playerSVGInner());
  var enemyCard = Enemigos.cardHTML("cpu", enemyObj.name, enemyObj.rank, enemyObj.colors, enemyObj.svgInner);
  return "<div class=\"lucha-found-window\"><div class=\"lucha-search-window-header\"><div class=\"lucha-search-dots\"><span class=\"lucha-search-dot red\"></span><span class=\"lucha-search-dot yellow\"></span><span class=\"lucha-search-dot green\"></span></div><div class=\"lucha-search-window-title\">FICHA DE COMBATE</div><div style=\"width:15px\"></div></div><div class=\"lucha-found-body\"><div class=\"lucha-found-arena\">" + playerCard + "<div class=\"lucha-vs-impact\"><div class=\"lucha-vs-burst\"></div><div class=\"lucha-vs-impact-text\">VS</div></div>" + enemyCard + "</div><div class=\"lucha-search-status\" id=\"lucha-found-status-text\">¡Rival encontrado!</div><div class=\"lucha-search-progress-bg\"><div class=\"lucha-search-progress-fill\" id=\"lucha-found-bar\" style=\"background:linear-gradient(90deg,#ffd54a,#e6ac00)\"></div></div></div></div>";
}
function onOpponentFound(){
  cleanupSearchTimers();
  var levels = enemyStatLevels();
  var enemyData = Enemigos.pickRandom();
  enemy = {
    name: enemyData.name,
    colors: enemyData.colors,
    rank: enemyData.rank,
    svgInner: enemyData.svgInner,
    levels: levels,
    combat: combatStats(levels)
  };
  enemy.hp = enemy.combat.maxHp;
  refreshFightStats(levels);
  state = STATE.FOUND;
  showOverlay(foundWindowHTML(enemy), false);
  var bar = document.getElementById("lucha-found-bar");
  requestAnimationFrame(function(){
    bar.style.transition = "width 4s linear";
    bar.style.width = "100%";
  });
  schedule(function(){
    hideOverlay();
    setupFightersInRing();
    startCountdown();
  }, 4000);
}
function buildPlayerFighterDOM(name, mirrored){
  var pos = document.createElement("div");
  pos.className = "lucha-fighter-pos";
  pos.innerHTML = "<div class=\"lucha-fighter-name\"></div><div class=\"lucha-hp-bar-bg\"><div class=\"lucha-hp-bar-fill\"></div></div><div class=\"lucha-fighter-scale" + (mirrored ? " mirror" : "") + "\"><div class=\"lucha-character\"><div class=\"lucha-char-shadow\"></div><svg class=\"lucha-char-svg\" viewBox=\"0 0 50 80\" preserveAspectRatio=\"xMidYMax meet\">" + playerSVGInner() + "</svg></div></div>";
  pos.querySelector(".lucha-fighter-name").textContent = name;
  return { pos: pos, hpFill: pos.querySelector(".lucha-hp-bar-fill"), scaleWrap: pos.querySelector(".lucha-fighter-scale"), mirrored: mirrored };
}
function setupFightersInRing(){
  matEl.innerHTML = "";
  var levels = statLevels();
  var pc = combatStats(levels);
  var pf = buildPlayerFighterDOM("Tu Boxeador", false);
  var ef = Enemigos.buildFighterDOM(enemy, true);
  matEl.append(pf.pos, ef.pos);
  var leftX = 57.72, rightX = 164.28, midY = 81;
  player = {
    el: pf.pos, hpFill: pf.hpFill,
    x: leftX, y: midY, targetX: leftX, targetY: midY,
    hp: pc.maxHp * 6, maxHp: pc.maxHp * 6,
    atk: pc.atk, def: pc.def,
    critChance: pc.critChance, evasion: pc.evasion,
    speed: pc.speed, atkCooldown: pc.atkCooldown,
    lastAttack: 0, lastRetarget: 0,
    alive: true, isPlayer: true,
    vecesCaido: 0, lastHitWasCrit: false // NUEVO: sistema de resiliencia
  };
  Object.assign(enemy, {
    el: ef.pos, hpFill: ef.hpFill,
    x: rightX, y: midY, targetX: rightX, targetY: midY,
    hp: enemy.combat.maxHp * 9, maxHp: enemy.combat.maxHp * 9,
    atk: enemy.combat.atk, def: enemy.combat.def,
    critChance: enemy.combat.critChance, evasion: enemy.combat.evasion,
    speed: enemy.combat.speed, atkCooldown: enemy.combat.atkCooldown,
    lastAttack: 0, lastRetarget: 0,
    alive: true, isPlayer: false,
    vecesCaido: 0, lastHitWasCrit: false // NUEVO: sistema de resiliencia
  });
  [player, enemy].forEach(function(f){
    f.el.style.left = f.x + "px";
    f.el.style.top = f.y + "px";
  });
  injectRefereeArt(); // NUEVO: árbitro decorativo + capa de conteo
}
function startCountdown(){
  state = STATE.COUNTDOWN;
  var seq = ["3","2","1","¡PELEA!"];
  var i = 0;
  (function step(){
    if(i >= seq.length){ hideOverlay(); beginFight(); return; }
    var label = seq[i++];
    showOverlay("<div class=\"" + (label === "¡PELEA!" ? "lucha-fight-flash" : "lucha-count-num") + "\">" + label + "</div>", true);
    schedule(step, label === "¡PELEA!" ? 550 : 700);
  })();
}
function beginFight(){
  state = STATE.FIGHTING;
  fightSecondsLeft = 45;
  setTimerDisplay(fightSecondsLeft);
  player.el.querySelector(".lucha-char-svg").classList.add("walking");
  enemy.el.querySelector(".lucha-char-svg").classList.add("walking");
  fightTimerInterval = setInterval(function(){
    fightSecondsLeft--;
    if(fightSecondsLeft <= 0) fightSecondsLeft = 45;
    setTimerDisplay(fightSecondsLeft);
  }, 1000);
  lastFrameTs = 0;
  rafId = requestAnimationFrame(fightLoop);
}
function retarget(f){
  var opp = f.isPlayer ? enemy : player;
  var maxX = 222, maxY = 180;
  f.targetX = clamp(opp.x + rand(-70, 70), 0, maxX);
  f.targetY = clamp(opp.y + rand(-55, 55), 0, maxY);
}
function fightLoop(ts){
  if(state !== STATE.FIGHTING) return;
  if(!lastFrameTs) lastFrameTs = ts;
  var dt = Math.min((ts - lastFrameTs) / 1000, 0.05);
  lastFrameTs = ts;
  [player, enemy].forEach(function(f){
    if(!f.alive) return;
    var dx = f.targetX - f.x, dy = f.targetY - f.y, dist = Math.hypot(dx, dy);
    if(dist < 6 || (ts - f.lastRetarget) > rand(680, 1150)){
      retarget(f);
      f.lastRetarget = ts;
    } else {
      f.x = clamp(f.x + (dx / dist) * f.speed * dt, 0, 222);
      f.y = clamp(f.y + (dy / dist) * f.speed * dt, 0, 180);
    }
    f.el.style.left = f.x + "px";
    f.el.style.top = f.y + "px";
  });
  if(player.alive && enemy.alive && Math.hypot(player.x - enemy.x, player.y - enemy.y) < 44){
    resolveClash(ts);
  }
  if(refereeEl) updateReferee(ts); // NUEVO: árbitro sigue a los boxeadores manteniendo distancia
  rafId = requestAnimationFrame(fightLoop);
}
function resolveClash(ts){
  if((ts - lastSpecialAction) > 2600 && Math.random() < 0.38){
    lastSpecialAction = ts;
    var specialAttacker = Math.random() < 0.5 ? player : enemy;
    landHit(specialAttacker, specialAttacker === player ? enemy : player, true);
    return;
  }
  var attacker = (player.speed + rand(0, 40)) >= (enemy.speed + rand(0, 40)) ? player : enemy;
  var defender = attacker === player ? enemy : player;
  if((ts - attacker.lastAttack) < attacker.atkCooldown) return;
  attacker.lastAttack = ts;
  landHit(attacker, defender, false);
}
function landHit(attacker, defender, special){
  if(!attacker.alive || !defender.alive || attacker === defender) return;
  if(rollWindow(defender.evasion, 99)){
    spawnDmgNumber(defender, "ESQUIVA", false, attacker.isPlayer);
    return;
  }
  // Daño = ataque exacto del panel + pequeña variación ±2
  var dmg = Math.round(attacker.atk + rand(-2, 2));
  var crit = rollWindow(attacker.critChance, 99);
  if(crit) dmg = Math.round(dmg * 2);
  // Defensa: reduce solo un poquito
  var defPct = defenseReduction(defender.def);
  dmg = Math.round(dmg * (1 - defPct));
  if(special) dmg = Math.round(dmg * 1.8);
  dmg = Math.max(1, dmg);
  defender.hp = clamp(defender.hp - dmg, 0, defender.maxHp);
  updateHpBar(defender);
  spawnDmgNumber(defender, "-" + dmg, crit || special, attacker.isPlayer);
  spawnImpact(attacker, defender, crit || special);
  knockback(defender, attacker);
  knockback(attacker, defender, 14);
  luchaPanel.classList.add("lucha-shake");
  setTimeout(function(){ luchaPanel.classList.remove("lucha-shake"); }, 360);
  if(defender.hp <= 0){ // MODIFICADO: ahora pasa por el árbitro antes del KO
    defender.lastHitWasCrit = crit; // NUEVO
    defender.alive = false;
    handleKnockdown(defender); // NUEVO
  }
}
function knockback(mover, away, force){
  if(force === undefined) force = 30;
  var dx = mover.x - away.x, dy = mover.y - away.y, dist = Math.hypot(dx, dy) || 1;
  mover.x = clamp(mover.x + (dx / dist) * force, 0, 222);
  mover.y = clamp(mover.y + (dy / dist) * force, 0, 180);
  mover.targetX = mover.x;
  mover.targetY = mover.y;
  mover.el.style.transition = "left .08s ease-out, top .08s ease-out";
  mover.el.style.left = mover.x + "px";
  mover.el.style.top = mover.y + "px";
  setTimeout(function(){
    if(mover.el) mover.el.style.transition = "";
  }, 90);
}
function updateHpBar(f){ f.hpFill.style.width = Math.max(0, (f.hp / f.maxHp) * 100) + "%"; }
function spawnDmgNumber(target, text, isCrit, byPlayer){
  var n = document.createElement("div");
  n.className = "lucha-dmg-num" + (isCrit ? " lucha-dmg-crit" : "");
  n.textContent = text;
  // Colores: jugador = blanco, enemigo = rojo, crítico = amarillo
  n.style.color = isCrit ? "#ffe34d" : (byPlayer ? "#ffffff" : "#ff4444");
  n.style.fontSize = "22px";
  n.style.fontWeight = "900";
  n.style.textShadow = isCrit ? "0 0 10px #ffe34d, 0 2px 4px #000" : "0 2px 4px #000";
  n.style.left = (target.x + 24) + "px";
  n.style.top = (target.y - 10) + "px";
  matEl.appendChild(n);
  setTimeout(function(){ n.remove(); }, 900);
}
function spawnImpact(a, d, crit){
  var s = document.createElement("div");
  s.className = "lucha-impact-star";
  s.style.left = ((a.x + d.x) / 2 + 24) + "px";
  s.style.top = ((a.y + d.y) / 2 + 45) + "px";
  s.textContent = crit ? "💥" : (a.isPlayer ? "👊" : "💢");
  matEl.appendChild(s);
  setTimeout(function(){ s.remove(); }, 520);
}
function onDefeat(loser){
  cancelAnimationFrame(rafId);
  clearInterval(fightTimerInterval);
  state = STATE.RESULT;
  loser.el.classList.add("defeated");
  schedule(function(){ showResult(loser.isPlayer ? "lose" : "win"); }, 900);
}

// ============================================================
// NUEVO: SISTEMA DE RESILIENCIA + ÁRBITRO (CONTEO)
// ============================================================
var refereeCountInt = null;       // NUEVO: interval del conteo
var refereeCountEl = null;        // NUEVO (legacy, ya no se usa visualmente)
var refereeEl = null;             // NUEVO: árbitro decorativo en el ring
var refereeX = 6, refereeY = 4;   // NUEVO: posición actual del árbitro
var refereeTargetX = 6, refereeTargetY = 4; // NUEVO: destino al que se desplaza
var refereeFollowing = true;      // NUEVO: si true sigue a los boxeadores; si false está fijo (conteo)
var refereeCountLoser = null;     // NUEVO: referencia al luchador caído durante el conteo (para aplicar distancia mínima del 7% solo a él)
var STATE_COUNT = "count";        // estado de pausa por caída

function injectRefereeArt(){      // NUEVO
  // Árbitro: figura pequeña, comienza en una esquina lejana del ring
  refereeEl = document.createElement("div");
  refereeEl.className = "lucha-referee";
  refereeEl.style.cssText = "position:absolute;left:6px;top:4px;width:37px;height:49px;z-index:6;pointer-events:none;opacity:.9;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6));transition:left .25s linear, top .25s linear"; // MODIFICADO: árbitro +15px (22→37, 34→49)
  refereeEl.innerHTML = '<svg viewBox="0 0 22 34" width="37" height="49">' // MODIFICADO: render +15px manteniendo viewBox
    + '<ellipse cx="11" cy="32" rx="7" ry="1.4" fill="rgba(0,0,0,.45)"/>'
    + '<rect x="6" y="22" width="4" height="9" rx="1" fill="#1a1a1a"/>'
    + '<rect x="12" y="22" width="4" height="9" rx="1" fill="#1a1a1a"/>'
    + '<rect x="5" y="11" width="12" height="12" rx="2" fill="#ffffff"/>'
    + '<rect x="5" y="13" width="12" height="1.4" fill="#1a1a1a"/>'
    + '<rect x="5" y="16" width="12" height="1.4" fill="#1a1a1a"/>'
    + '<rect x="5" y="19" width="12" height="1.4" fill="#1a1a1a"/>'
    + '<circle cx="11" cy="7" r="4" fill="#e8b890"/>'
    + '<rect x="7" y="3" width="8" height="2.4" rx="1" fill="#1a1a1a"/>'
    + '</svg>';
  matEl.appendChild(refereeEl);
  refereeX = 6; refereeY = 4;
  refereeTargetX = 6; refereeTargetY = 4;
  refereeFollowing = true;

  // Capa del conteo (oculta, ya no se usa como número grande central)
  refereeCountEl = document.createElement("div");
  refereeCountEl.className = "lucha-ref-count";
  refereeCountEl.style.cssText = "display:none";
  matEl.appendChild(refereeCountEl);
}

function updateReferee(ts){        // MODIFICADO: árbitro mantiene 40% de distancia mínima de cada luchador (cerca pero seguro)
  if(!refereeEl) return;
  if(!player || !enemy) return;
  var required = 88;                // MODIFICADO: distancia mínima ~40% del ring (222px * 0.40 ≈ 88)
  var minX = 8, minY = 8, maxX = 210, maxY = 160; // MODIFICADO: bordes más amplios para poder rodear de cerca
  // NUEVO: incluso si el árbitro NO está siguiendo (conteo/recuperación), aplicamos un "escudo" de 40%
  // para que si un luchador se acerca o el árbitro quedó cerca, se aleje sin alterar su lógica de seguimiento.
  if(!refereeFollowing){
    // MODIFICADO: durante el conteo, el árbitro mantiene solo un 7% (≈16px) respecto al caído,
    // pero conserva el 40% (88px) respecto al otro luchador para no estorbarlo.
    var loserRef    = refereeCountLoser;                                  // NUEVO
    var otherRef    = loserRef ? (loserRef.isPlayer ? enemy : player) : null; // NUEVO
    var reqLoser    = 16;                                                 // NUEVO: 7% del ring (222 * 0.07 ≈ 15.5)
    var reqOther    = required;                                           // NUEVO: 40% se mantiene para el otro
    var pTarget     = loserRef || player;                                 // NUEVO
    var eTarget     = otherRef || enemy;                                  // NUEVO
    var rpx0 = refereeX - pTarget.x, rpy0 = refereeY - pTarget.y, rpd0 = Math.hypot(rpx0, rpy0);
    var rex0 = refereeX - eTarget.x, rey0 = refereeY - eTarget.y, red0 = Math.hypot(rex0, rey0);
    if(rpd0 < reqLoser || red0 < reqOther){
      var nx0 = refereeX, ny0 = refereeY;
      if(rpd0 < reqLoser){
        var pushP0 = (reqLoser - rpd0) + 1;
        nx0 += (rpx0 / (rpd0 || 1)) * pushP0;
        ny0 += (rpy0 / (rpd0 || 1)) * pushP0;
      }
      var ndeR = Math.hypot(nx0 - eTarget.x, ny0 - eTarget.y);
      if(ndeR < reqOther){
        var pushE0 = (reqOther - ndeR) + 1;
        nx0 += ((nx0 - eTarget.x) / (ndeR || 1)) * pushE0;
        ny0 += ((ny0 - eTarget.y) / (ndeR || 1)) * pushE0;
      }
      refereeX = clamp(nx0, minX, maxX);
      refereeY = clamp(ny0, minY, maxY);
      refereeEl.style.transition = "left .15s linear, top .15s linear"; // NUEVO: alejamiento suave durante conteo
      refereeEl.style.left = refereeX + "px";
      refereeEl.style.top = refereeY + "px";
    }
    return;
  }
  var midX = (player.x + enemy.x) / 2, midY = (player.y + enemy.y) / 2;
  var axisX0 = enemy.x - player.x, axisY0 = enemy.y - player.y;
  var axisLen0 = Math.hypot(axisX0, axisY0) || 1;
  var fightersGap = axisLen0; // distancia entre luchadores
  var candidates = [];
  // NUEVO: anillos alrededor de CADA luchador al radio mínimo requerido (garantiza ≥40% de uno; el filtro posterior asegura del otro también)
  for(var a = 0; a < 24; a++){
    var ang = (a / 24) * Math.PI * 2;
    var rOff = required + 4; // un pelín más para no rasar el límite
    candidates.push({ x: player.x + Math.cos(ang) * rOff, y: player.y + Math.sin(ang) * rOff });
    candidates.push({ x: enemy.x  + Math.cos(ang) * rOff, y: enemy.y  + Math.sin(ang) * rOff });
  }
  // NUEVO: también anillo alrededor del punto medio (útil cuando los luchadores están separados)
  for(var a2 = 0; a2 < 16; a2++){
    var ang2 = (a2 / 16) * Math.PI * 2;
    candidates.push({
      x: midX + Math.cos(ang2) * (required + 6),
      y: midY + Math.sin(ang2) * (required + 6)
    });
  }
  // Fallback: esquinas y bordes
  candidates.push({x: minX, y: minY}, {x: maxX, y: minY}, {x: minX, y: maxY}, {x: maxX, y: maxY});

  // NUEVO: perpendicular al eje jugador-enemigo para detectar candidatos que caen "en medio"
  var perpAxisX = -axisY0 / axisLen0, perpAxisY = axisX0 / axisLen0;
  var bestC = null, bestScore = -Infinity;
  var bestValid = null, bestValidScore = -Infinity; // candidatos que cumplen el 40% de AMBOS
  for(var i = 0; i < candidates.length; i++){
    var c = candidates[i];
    // Mantener dentro del ring
    c.x = clamp(c.x, minX, maxX);
    c.y = clamp(c.y, minY, maxY);
    var d1 = Math.hypot(c.x - player.x, c.y - player.y);
    var d2 = Math.hypot(c.x - enemy.x, c.y - enemy.y);
    var minD = Math.min(d1, d2);
    // NUEVO: comprobar si el candidato cae "entre" los luchadores (proyección sobre el eje dentro del segmento y poco desplazamiento perpendicular)
    var relX = c.x - player.x, relY = c.y - player.y;
    var tAxis = (relX * axisX0 + relY * axisY0) / (axisLen0 * axisLen0); // 0 = jugador, 1 = enemigo
    var perpDist = Math.abs(relX * perpAxisX + relY * perpAxisY);
    var inBetween = (tAxis > 0.15 && tAxis < 0.85 && perpDist < required * 0.9); // NUEVO: zona prohibida (estar en medio)
    // Premiamos quedarse JUSTO a la distancia mínima (cerca observando)
    var score = -Math.abs(minD - (required + 8));
    if(minD < required) score -= 1000;          // NUNCA por debajo del 40%
    if(inBetween)       score -= 600;           // NUEVO: penaliza fuerte estar en medio de la pelea
    // Distancia actual del árbitro al candidato (preferir cercanos para movimientos suaves)
    var dCur = Math.hypot(c.x - refereeX, c.y - refereeY);
    score -= dCur * 0.05;
    if(score > bestScore){ bestScore = score; bestC = c; }
    if(minD >= required && !inBetween && score > bestValidScore){ // NUEVO: prioriza candidato válido
      bestValidScore = score; bestValid = c;
    }
  }
  var chosen = bestValid || bestC; // NUEVO: si hay candidato válido se usa, si no, el mejor relativo
  refereeTargetX = chosen.x;
  refereeTargetY = chosen.y;

  // MODIFICADO: si un luchador se le acerca dentro del 40%, huir rápido alejándose SIN pasar por el centro
  var rpx = refereeX - player.x, rpy = refereeY - player.y, rpd = Math.hypot(rpx, rpy);
  var rex = refereeX - enemy.x,  rey = refereeY - enemy.y,  red = Math.hypot(rex, rey);
  var fleeing = false;
  if(rpd < required || red < required){
    fleeing = true;
    var fx = 0, fy = 0;
    if(rpd < required){ fx += rpx / (rpd || 1); fy += rpy / (rpd || 1); }
    if(red < required){ fx += rex / (red || 1); fy += rey / (red || 1); }
    // NUEVO: añadir componente perpendicular al eje jugador-enemigo para esquivar sin pasar por el centro
    var axisX = enemy.x - player.x, axisY = enemy.y - player.y;
    var axisL = Math.hypot(axisX, axisY) || 1;
    var perpX = -axisY / axisL, perpY = axisX / axisL;
    // Elegir el lado de la perpendicular más alejado del centro
    var sideSign = ((refereeX - midX) * perpX + (refereeY - midY) * perpY) >= 0 ? 1 : -1;
    fx += perpX * sideSign * 0.9;
    fy += perpY * sideSign * 0.9;
    var fl = Math.hypot(fx, fy) || 1;
    fx /= fl; fy /= fl;
    refereeTargetX = clamp(refereeX + fx * 60, minX, maxX); // MODIFICADO: salto mayor para alejarse rápido
    refereeTargetY = clamp(refereeY + fy * 60, minY, maxY);
  }

  var dx = refereeTargetX - refereeX, dy = refereeTargetY - refereeY;
  var dist = Math.hypot(dx, dy);
  if(dist > 0.5){
    var speed = fleeing ? 180 : 55;             // MODIFICADO: más rápido al huir
    var step = Math.min(dist, speed * 0.016);
    var nx = refereeX + (dx / dist) * step; // NUEVO: posición tentativa
    var ny = refereeY + (dy / dist) * step;
    // NUEVO: clamp predictivo — si el siguiente paso entra dentro del 40% de cualquier luchador, se empuja al borde del radio mínimo
    var ndp = Math.hypot(nx - player.x, ny - player.y);
    if(ndp < required){
      var pushP = (required - ndp) + 0.5;
      nx += ((nx - player.x) / (ndp || 1)) * pushP;
      ny += ((ny - player.y) / (ndp || 1)) * pushP;
    }
    var nde = Math.hypot(nx - enemy.x, ny - enemy.y);
    if(nde < required){
      var pushE = (required - nde) + 0.5;
      nx += ((nx - enemy.x) / (nde || 1)) * pushE;
      ny += ((ny - enemy.y) / (nde || 1)) * pushE;
    }
    refereeX = clamp(nx, minX, maxX); // NUEVO
    refereeY = clamp(ny, minY, maxY); // NUEVO
    refereeEl.style.left = refereeX + "px";
    refereeEl.style.top = refereeY + "px";
  }
}

function moveRefereeTo(tx, ty){    // NUEVO: mueve al árbitro a un punto concreto con transición CSS
  if(!refereeEl) return;
  var maxX = 200, maxY = 150;
  tx = clamp(tx, 0, maxX);
  ty = clamp(ty, 0, maxY);
  refereeX = tx; refereeY = ty;
  refereeTargetX = tx; refereeTargetY = ty;
  refereeEl.style.transition = "left .5s ease, top .5s ease";
  refereeEl.style.left = tx + "px";
  refereeEl.style.top = ty + "px";
  setTimeout(function(){
    if(refereeEl) refereeEl.style.transition = "left .25s linear, top .25s linear";
  }, 520);
}

function handleKnockdown(loser){  // NUEVO
  if(state === STATE_COUNT) return; // ya en conteo
  cancelAnimationFrame(rafId);
  state = STATE_COUNT;

  // Pausar animaciones de ambos boxeadores
  loser.el.classList.add("knocked-down");
  loser.el.style.transform = "rotate(20deg)";
  loser.el.style.transition = "transform .25s ease";
  var svgL = loser.el.querySelector(".lucha-char-svg");
  if(svgL) svgL.classList.remove("walking","punching");
  var other = loser.isPlayer ? enemy : player;
  if(other){
    var svgO = other.el.querySelector(".lucha-char-svg");
    if(svgO) svgO.classList.remove("walking","punching");
  }

  // MODIFICADO: el árbitro se posiciona POR ABAJO del caído manteniendo solo un 7% mínimo de distancia respecto a él
  refereeFollowing = false;
  refereeCountLoser = loser;                 // NUEVO: marcar quién es el caído para que el escudo use 7% solo con él
  var sideOffsetY = 16; // MODIFICADO: ~7% del ring (222 * 0.07 ≈ 15.5), antes era 95 (~40%)
  // MODIFICADO: el otro luchador retrocede al menos un 60% del ring del caído (222 * 0.60 ≈ 133)
  if(other && other.el){
    var dxo = other.x - loser.x, dyo = other.y - loser.y;
    var distO = Math.hypot(dxo, dyo) || 1;
    var minDist = 133; // MODIFICADO: ~60% del ancho del mat (antes 111 = 50%)
    if(distO < minDist){
      var add = minDist - distO;
      other.x = clamp(other.x + (dxo / distO) * add, 0, 222);
      other.y = clamp(other.y + (dyo / distO) * add, 0, 180);
      other.targetX = other.x;
      other.targetY = other.y;
      other.lastRetarget = performance.now();
      other.el.style.transition = "left .45s ease-out, top .45s ease-out";
      other.el.style.left = other.x + "px";
      other.el.style.top = other.y + "px";
      setTimeout(function(){ if(other.el) other.el.style.transition = ""; }, 480);
    }
  }

  // MODIFICADO: salto de celebración eliminado por requerimiento (regla #4)
  // winnerCelebrate(other);

  // === CÁLCULO DE PROBABILIDAD ===
  var caidaActual = loser.vecesCaido + 1;
  var baseProb;
  if(caidaActual === 1) baseProb = 70;
  else if(caidaActual === 2) baseProb = 40;
  else if(caidaActual === 3) baseProb = 10;
  else baseProb = 0;
  if(loser.lastHitWasCrit) baseProb = baseProb / 2;

  var rollSeLevanta = randInt(1, 100);
  var seLevanta = (baseProb > 0) && (rollSeLevanta <= baseProb);
  var targetCount = seLevanta ? randInt(2, 9) : 10;

  // MODIFICADO: esperar 700ms (regla #2) antes de que el árbitro se acerque al caído
  setTimeout(function(){
    // MODIFICADO: posicionar al árbitro respetando el 40%. Preferimos abajo, si no cabe vamos arriba; igual con X si hace falta.
    var refTX = loser.x, refTY = loser.y + sideOffsetY;
    if(refTY > 150) refTY = loser.y - sideOffsetY; // si abajo no cabe, vamos arriba
    if(refTY < 8)   refTY = loser.y + sideOffsetY; // si arriba tampoco, volvemos abajo
    // Garantizar 40% también respecto al OTRO luchador
    var otherF = loser.isPlayer ? enemy : player;
    if(otherF){
      var dOther = Math.hypot(refTX - otherF.x, refTY - otherF.y);
      if(dOther < 88){
        var ox = refTX - otherF.x, oy = refTY - otherF.y, ol = Math.hypot(ox, oy) || 1;
        refTX += (ox / ol) * (88 - dOther + 4);
        refTY += (oy / ol) * (88 - dOther + 4);
      }
    }
    moveRefereeTo(refTX, refTY);
    // MODIFICADO: el conteo arranca SOLO cuando el árbitro ya está cerca del caído (regla #1)
    // (la transición CSS de moveRefereeTo dura ~500ms; esperamos ese tiempo antes de contar)
    setTimeout(function(){
      refereeCount(loser, targetCount, function(){
        if(seLevanta){
          // === SE LEVANTA ===
          loser.vecesCaido = caidaActual;
          var recoveryPct = caidaActual === 1 ? 0.30 : caidaActual === 2 ? 0.15 : 0.05;
          loser.hp = Math.max(1, Math.round(loser.maxHp * recoveryPct));
          updateHpBar(loser);
          loser.alive = true;
          loser.lastHitWasCrit = false;
          loser.el.classList.remove("knocked-down");
          loser.el.style.transform = "";
          // MODIFICADO: esperar 1s (regla #3). En ese 1s el árbitro toma distancia ≥50% de cualquier jugador.
          var farX = loser.x < 111 ? 180 : 20; // 50% alejado en X
          var farY = loser.y < 90 ? 135 : 15;  // alejado en Y
          moveRefereeTo(farX, farY); // árbitro toma distancia (≥50%) durante ese 1s
          setTimeout(function(){
            refereeFollowing = true;
            refereeCountLoser = null;        // NUEVO: limpiar referencia del caído al reanudar el seguimiento normal
            // NUEVO: cuenta 3,2,1 antes de reanudar el combate
            resumeAfterRecovery();
          }, 1000); // MODIFICADO: 1 segundo (regla #3)
        } else {
          // === KO ===
          onDefeat(loser);
        }
      });
    }, 520); // NUEVO: el conteo arranca cuando el árbitro ya llegó cerca del caído (regla #1)
  }, 700); // MODIFICADO: 700ms (regla #2)
}

// MODIFICADO: salto de celebración eliminado por requerimiento (regla #4). Se conserva la función como no-op por compatibilidad.
function winnerCelebrate(w){
  // NUEVO: desactivado intencionalmente — el ganador ya no realiza saltitos al tumbar o ganar.
  return;
}

function resumeAfterRecovery(){    // NUEVO: cuenta 3,2,1 y reanuda fightLoop sin reiniciar el combate
  state = STATE.COUNTDOWN;
  var seq = ["3","2","1"];
  var i = 0;
  (function step(){
    if(i >= seq.length){
      hideOverlay();
      state = STATE.FIGHTING;
      lastFrameTs = 0;
      [player, enemy].forEach(function(f){
        if(!f || !f.el) return;
        var s = f.el.querySelector(".lucha-char-svg");
        if(s) s.classList.add("walking");
      });
      rafId = requestAnimationFrame(fightLoop);
      return;
    }
    var label = seq[i++];
    showOverlay("<div class=\"lucha-count-num\">" + label + "</div>", true);
    schedule(step, 650);
  })();
}

function spawnFloatingCountNumber(loser, n){ // MODIFICADO: ahora el número arranca visible y se anima tras un pequeño delay
  if(!matEl) return;
  var d = document.createElement("div");
  d.textContent = String(n);
  // MODIFICADO: estilo inicial sin transición todavía (para garantizar que se vea el "1" y todos)
  d.style.cssText = "position:absolute;left:" + (loser.x + 14) + "px;top:" + (loser.y - 14) + "px;" // MODIFICADO: top un poco más arriba para acomodar tipografía más grande
    + "font-size:36px;font-weight:900;color:#ffe14d;" // MODIFICADO: 24px -> 36px (regla #1, números del conteo más grandes)
    + "text-shadow:0 0 12px #ff8a00,0 2px 5px rgba(0,0,0,.9);" // MODIFICADO: sombras un pelín más marcadas para mejor legibilidad
    + "z-index:50;pointer-events:none;font-family:'Trebuchet MS',sans-serif;"
    + "opacity:1;transform:translateY(0);";
  matEl.appendChild(d);
  // NUEVO: forzar un reflow y luego activar la transición en el siguiente tick
  // (evita que la opacidad pase a 0 en el mismo frame y no se vea, p.ej. el "1")
  // eslint-disable-next-line no-unused-expressions
  d.offsetHeight;
  setTimeout(function(){
    if(!d || !d.parentNode) return;
    d.style.transition = "transform 1.1s ease-out, opacity 1.1s ease-out";
    d.style.transform = "translateY(-42px)";
    d.style.opacity = "0";
  }, 60);
  setTimeout(function(){ if(d && d.parentNode) d.parentNode.removeChild(d); }, 1300);
}

function refereeCount(loser, target, done){ // MODIFICADO: cadencia un pelín más lenta (1000ms)
  if(refereeCountInt){ clearInterval(refereeCountInt); refereeCountInt = null; }
  var n = 1;
  spawnFloatingCountNumber(loser, n);
  refereeCountInt = setInterval(function(){
    n++;
    if(n > target){
      clearInterval(refereeCountInt);
      refereeCountInt = null;
      if(done) done();
      return;
    }
    spawnFloatingCountNumber(loser, n);
  }, 1000); // MODIFICADO: antes 800ms
}

function showResult(kind){
  var win = kind === "win";
  var reward = win ? 10 : 2;
  // NUEVO: Racha de dificultad por arena — +1 al ganar, reset al perder
  if(win){ arenaWinStreak = Math.min(arenaWinStreak + 1, 999); } else { arenaWinStreak = 0; }
  window.GymHeroRespaldo.addGold(reward);
  showOverlay(
    "<div class=\"lucha-result-window\"><div class=\"lucha-search-window-header\"><div class=\"lucha-search-dots\"><span class=\"lucha-search-dot red\"></span><span class=\"lucha-search-dot yellow\"></span><span class=\"lucha-search-dot green\"></span></div><div class=\"lucha-search-window-title\">FINAL DEL COMBATE</div><div style=\"width:15px\"></div></div><div class=\"lucha-result-body\"><div style=\"font-size:34px\">" + (win ? "🏆" : "☠️") + "</div><div class=\"lucha-fight-flash\" style=\"font-size:26px;color:" + (win ? "#78e68c" : "#ff6464") + "\">" + (win ? "GANASTE" : "PERDISTE") + "</div><div class=\"lucha-search-status\">" + (win ? "¡Victoria por nocaut!" : "¡Derrotado en el ring!") + "</div><div style=\"color:#ffd86b;font-weight:900\">💰 +" + reward + " ORO</div></div></div>",
    false
  );
  schedule(function(){
    hideOverlay();
    matEl.innerHTML = "";
    state = STATE.SEARCHING;
    startSearch();
  }, 4000);
}
function openLuchaPanel(){
  if(!window.GymHeroRespaldoColiseo || !window.GymHeroRespaldoColiseo.isActive()) return;
  coliseoPanel.classList.remove("show");
  luchaPanel.classList.add("show");
  luchaStatsPanel.classList.add("show");
  statsGrid.style.visibility = "hidden";
  if(!matEl) buildPanels();
  refreshFightStats();
  state = STATE.IDLE;
  toast("🥊 LUCHA");
}
function closeLuchaPanel(){
  cleanupSearchTimers();
  cleanupScheduledTimeouts();
  cancelAnimationFrame(rafId);
  clearInterval(fightTimerInterval);
  if(refereeCountInt){ clearInterval(refereeCountInt); refereeCountInt = null; } // NUEVO
  if(refereeCountEl){ refereeCountEl.style.display = "none"; } // NUEVO
  if(matEl){
    matEl.innerHTML = "";
    hideOverlay();
    timerDisplay.textContent = "⏱ --";
  }
  refereeEl = null;        // NUEVO: el árbitro se reinyecta por combate
  refereeCountEl = null;   // NUEVO
  player = null;
  enemy = null;
  state = STATE.IDLE;
  luchaPanel.classList.remove("show");
  luchaStatsPanel.classList.remove("show");
}

buildPanels();
luchaBtn.addEventListener("click", openLuchaPanel);
window.GymHeroRespaldoLucha = {
  open: openLuchaPanel,
  close: closeLuchaPanel,
  // NUEVO: control externo de la arena y de la racha
  setArena: function(n){ currentArena = Math.max(1, Math.floor(n)||1); arenaWinStreak = 0; },
  getArena: function(){ return currentArena; },
  getStreak: function(){ return arenaWinStreak; },
  resetStreak: function(){ arenaWinStreak = 0; }
};
})();

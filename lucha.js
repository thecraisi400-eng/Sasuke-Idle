/* ============================================================
   SISTEMA DE LUCHA - MATCHMAKING
   ============================================================ */
const ringApron = document.getElementById('ring-apron');
const matchOverlay = document.getElementById('match-overlay');
const matchSearchingEl = document.getElementById('match-searching');
const matchFoundEl = document.getElementById('match-found');
const searchLogEl = document.getElementById('search-log');

let fightActive = false;
let matchmakingActive = false;
let currentEnemy = null;

function resetFightUI(){
  const fl = document.getElementById('fight-layer');
  if(fl){ fl.style.display='none'; }
  const hud = document.getElementById('fight-hud');
  if(hud) hud.style.display='none';
  const fp = document.getElementById('fighter-player');
  const fe = document.getElementById('fighter-enemy');
  if(fp){ fp.style.display='none'; fp.innerHTML=''; fp.className='fighter'; }
  if(fe){ fe.style.display='none'; fe.innerHTML=''; fe.className='fighter'; }
  const cd = document.getElementById('fight-countdown');
  if(cd){ cd.className=''; cd.style.display='none'; cd.textContent=''; }
  const res = document.getElementById('fight-result');
  if(res){ res.style.display='none'; res.innerHTML=''; }
  const ffl = document.getElementById('fight-float-layer');
  if(ffl) ffl.innerHTML='';
  const hint = document.getElementById('ring-hint');
  if(hint) hint.style.display = fightActive ? 'none' : '';
}

if(ringApron){
  ringApron.addEventListener('click', ()=>{
    if(matchmakingActive || fightActive) return;
    startMatchmaking();
  });
}

function startMatchmaking(){
  matchmakingActive = true;
  fightActive = false;
  resetFightUI();
  matchSearchingEl.style.display = '';
  matchFoundEl.style.display = 'none';
  matchOverlay.classList.add('show');
  const logs = [
    'Conectando al servidor...',
    'Buscando rival en tu rango...',
    'Escaneando oponentes...',
    'Sincronizando estadísticas...',
    'Rival encontrado!'
  ];
  let li=0;
  searchLogEl.textContent = logs[0];
  const logInterval = setInterval(()=>{
    li++;
    if(li < logs.length){
      searchLogEl.textContent = logs[li];
    } else {
      clearInterval(logInterval);
    }
  }, 380);
  // tiempo de búsqueda 1.6 - 2.4s
  setTimeout(()=>{
    clearInterval(logInterval);
    const enemy = generateEnemy();
    showMatchFound(enemy);
  }, 1700 + Math.random()*700);
}

// Generar enemigo con stats iguales + niveles extra repartidos al azar
function getPlayerStatsSnapshot(){
  const snap = {};
  ORDER.forEach(k=>{
    snap[k] = {
      level: game.stats[k].level,
      value: roundStat(game.stats[k].value),
      gain: game.stats[k].gain
    };
  });
  return snap;
}
function generateEnemy(){
  const playerSnap = getPlayerStatsSnapshot();
  // Stats base = iguales al jugador
  const enemyStats = {};
  ORDER.forEach(k=>{ enemyStats[k] = playerSnap[k].value; });

  // Sumar niveles (sin contar el nivel 1)
  let totalPoints = 0;
  ORDER.forEach(k=>{ totalPoints += Math.max(0, playerSnap[k].level - 1); });

  // Repartir puntos al azar
  for(let i=0;i<totalPoints;i++){
    const key = ORDER[Math.floor(Math.random()*ORDER.length)];
    enemyStats[key] = roundStat(enemyStats[key] + playerSnap[key].gain);
  }

  // Nombre y apariencia aleatoria
  const names = ['Iron Fist','Shadow Box','El Martillo','Viper','Titan Rojo','Cobra Kai','Knuckle','Rayo Negro','Bruto','Sombra','Ace','Reaper','Crusher','Blaze','Onyx','Fang'];
  const adjectives = ['Salvaje','Nocturno','Furioso','Veloz','Letal','Imparable','Dorado'];
  const name = names[Math.floor(Math.random()*names.length)] + (Math.random()<.45 ? ' '+adjectives[Math.floor(Math.random()*adjectives.length)] : '');
  
  const palettes = [
    {body:'#d64545', limb:'#b03030', name:'Rojo'},
    {body:'#4a86e8', limb:'#2f5fb8', name:'Azul'},
    {body:'#46c46f', limb:'#2f9a52', name:'Verde'},
    {body:'#d4a843', limb:'#b8862a', name:'Dorado'},
    {body:'#9b5de5', limb:'#7140b8', name:'Violeta'},
    {body:'#e85d9b', limb:'#c23a72', name:'Rosa'},
    {body:'#3ec9c9', limb:'#279a9a', name:'Cian'},
    {body:'#e87a3a', limb:'#c05a20', name:'Naranja'},
    {body:'#5a5a5a', limb:'#3a3a3a', name:'Acero'}
  ];
  const palette = palettes[Math.floor(Math.random()*palettes.length)];

  const accessories = [
    '<rect x="16" y="43" width="18" height="5" rx="2" fill="#111" opacity=".92"/>', // headband
    '<circle cx="20" cy="56" r="3.2" fill="none" stroke="#111" stroke-width="1.3"/><circle cx="30" cy="56" r="3.2" fill="none" stroke="#111" stroke-width="1.3"/><line x1="23.2" y1="56" x2="26.8" y2="56" stroke="#111" stroke-width="1.1"/>', // gafas
    '<path d="M18 43 Q25 36 32 43" fill="'+palette.limb+'" stroke="#222" stroke-width="1.2"/>', // cresta
    '<rect x="13" y="66" width="24" height="4" rx="2" fill="#e63946" opacity=".9"/>', // bufanda
    '<circle cx="40" cy="54" r="2.3" fill="#222"/>', // parche
    '<rect x="15" y="41" width="20" height="6" rx="2" fill="#222"/>', // gorra
    '<circle cx="25" cy="38" r="4" fill="none" stroke="#ffd000" stroke-width="1.6"/>', // halo
  ];
  const accCount = Math.floor(Math.random()*2)+1;
  const chosenAcc = [];
  const accPool = [...accessories];
  for(let i=0;i<accCount;i++){
    if(!accPool.length) break;
    chosenAcc.push(accPool.splice(Math.floor(Math.random()*accPool.length),1)[0]);
  }

  return { name, palette, accessories: chosenAcc.join(''), stats: enemyStats, playerSnap };
}

function buildFighterSVG(isEnemy, enemyData){
  const bodyFill = isEnemy ? enemyData.palette.body : '#a0a0a0';
  const limbFill = isEnemy ? enemyData.palette.limb : '#8f8f8f';
  const acc = isEnemy ? enemyData.accessories : '';
  return `<svg viewBox="0 0 50 80" preserveAspectRatio="xMidYMax meet" style="overflow:visible">
    <g class="limb leg-left"><rect x="18" y="63" width="6" height="14" rx="3" fill="${limbFill}" stroke="#555" stroke-width="1.6"/><ellipse cx="21" cy="78" rx="5" ry="2.5" fill="#454545"/></g>
    <g class="limb leg-right"><rect x="26" y="63" width="6" height="14" rx="3" fill="${limbFill}" stroke="#555" stroke-width="1.6"/><ellipse cx="29" cy="78" rx="5" ry="2.5" fill="#454545"/></g>
    <g class="limb arm-left"><rect x="11" y="42" width="6" height="22" rx="3" fill="${limbFill}" stroke="#555" stroke-width="1.6"/></g>
    <g class="limb arm-right"><rect x="33" y="42" width="6" height="22" rx="3" fill="${limbFill}" stroke="#555" stroke-width="1.6"/></g>
    <g class="torso">
      <circle cx="25" cy="60" r="19" fill="${bodyFill}" stroke="#555" stroke-width="2"/>
      <rect x="18" y="55" width="4" height="4" rx="1.5" fill="#222"/>
      <rect x="28" y="55" width="4" height="4" rx="1.5" fill="#222"/>
      <line x1="17" y1="52" x2="22" y2="52" stroke="#222" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="28" y1="52" x2="33" y2="52" stroke="#222" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="21" y1="64" x2="29" y2="64" stroke="#222" stroke-width="1.5" stroke-linecap="round"/>
      ${acc}
    </g>
  </svg>`;
}

function showMatchFound(enemy){
  currentEnemy = enemy;
  matchSearchingEl.style.display='none';
  matchFoundEl.style.display='';

  // sprites VS
  document.getElementById('vs-player-sprite').innerHTML = buildFighterSVG(false, null);
  document.getElementById('vs-enemy-sprite').innerHTML = buildFighterSVG(true, enemy);
  document.getElementById('vs-enemy-name').textContent = enemy.name;
  document.getElementById('vs-enemy-tag').textContent = enemy.palette.name;

  // stats comparison - con colores verde/rojo/gris
  const ps = enemy.playerSnap;
  let playerHtml = '';
  let enemyHtml = '';
  ORDER.forEach(k=>{
    const pVal = ps[k].value;
    const eVal = enemy.stats[k];
    // Para jugador
    let pClass = 'stat-tie';
    if(pVal > eVal) pClass = 'stat-win';
    else if(pVal < eVal) pClass = 'stat-lose';
    playerHtml += `<div class="vs-stat-row"><span class="vs-stat-name"><span class="s-ico">${ICONOS[k]}</span>${k}</span><span class="vs-stat-val ${pClass}">${formatStatValue(k,pVal)}</span></div>`;
    // Para enemigo
    let eClass = 'stat-tie';
    if(eVal > pVal) eClass = 'stat-win';
    else if(eVal < pVal) eClass = 'stat-lose';
    enemyHtml += `<div class="vs-stat-row"><span class="vs-stat-name"><span class="s-ico">${ICONOS[k]}</span>${k}</span><span class="vs-stat-val ${eClass}">${formatStatValue(k,eVal)}</span></div>`;
  });
  document.getElementById('vs-player-stats').innerHTML = playerHtml;
  document.getElementById('vs-enemy-stats').innerHTML = enemyHtml;

  // timer 4s
  const fill = document.getElementById('match-timer-fill');
  fill.style.transition='none';
  fill.style.width='0%';
  void fill.offsetWidth;
  fill.style.transition='width 4s linear';
  fill.style.width='100%';

  setTimeout(()=>{
    matchOverlay.classList.remove('show');
    matchmakingActive = false;
    startFightCountdown(enemy);
  }, 4000);
}

function startFightCountdown(enemy){
  fightActive = true;
  const fightLayer = document.getElementById('fight-layer');
  fightLayer.style.display='block';
  const hint = document.getElementById('ring-hint');
  if(hint) hint.style.display='none';

  // Poner luchadores en el ring
  const fp = document.getElementById('fighter-player');
  const fe = document.getElementById('fighter-enemy');
  fp.innerHTML = buildFighterSVG(false, null);
  fe.innerHTML = buildFighterSVG(true, enemy);
  fp.style.display='block';
  fe.style.display='block';
  // animación punch idle
  fp.querySelector('svg').classList.add('punching');
  fe.querySelector('svg').classList.add('punching');

  const cdEl = document.getElementById('fight-countdown');
  const steps = ['3','2','1','¡PELEA!'];
  let i=0;
  function tick(){
    cdEl.textContent = steps[i];
    cdEl.classList.remove('show'); void cdEl.offsetWidth; cdEl.classList.add('show');
    cdEl.style.display='block';
    i++;
    if(i < steps.length){
      setTimeout(tick, 780);
    } else {
      setTimeout(()=>{
        cdEl.style.display='none';
        beginCombat(enemy);
      }, 650);
    }
  }
  tick();
}

function beginCombat(enemy){
  const hud = document.getElementById('fight-hud');
  hud.style.display='flex';
  document.getElementById('hp-enemy-name').textContent = enemy.name;

  const player = {
    attack: game.stats.ATAQUE.value,
    defense: game.stats.DEFENSA.value,
    maxHp: Math.round(game.stats.HP.value),
    hp: Math.round(game.stats.HP.value),
    crit: game.stats.CRITICO.value,
    eva: game.stats.EVASION.value,
    speed: game.stats.VELOCIDAD.value
  };
  const foe = {
    attack: enemy.stats.ATAQUE,
    defense: enemy.stats.DEFENSA,
    maxHp: Math.round(enemy.stats.HP),
    hp: Math.round(enemy.stats.HP),
    crit: enemy.stats.CRITICO,
    eva: enemy.stats.EVASION,
    speed: enemy.stats.VELOCIDAD
  };

  updateHpBars(player, foe);

  const floatLayer = document.getElementById('fight-float-layer');
  function floatDmg(x,y,text,cls){
    const d = document.createElement('div');
    d.className = 'fight-float ' + (cls||'');
    d.textContent = text;
    d.style.left = x+'px'; d.style.top = y+'px';
    floatLayer.appendChild(d);
    setTimeout(()=>d.remove(),1100);
  }

  function doHit(attacker, defender, isPlayerAttacking){
    // evasion
    if(Math.random()*100 > 94 && Math.random()*100 < 94 + defender.eva){
      floatDmg(isPlayerAttacking?235:115, 48, 'EVADE', 'evade');
      return false;
    }
    const crit = Math.random()*100 > 93 && Math.random()*100 < 93 + attacker.crit;
    let dmg = Math.max(1, Math.round(attacker.attack));
    if(crit) dmg *= 2;
    const reduction = Math.min(0.30, defender.defense * 0.006);
    dmg = Math.max(1, Math.round(dmg * (1-reduction)));
    defender.hp = Math.max(0, defender.hp - dmg);
    // anim hit
    const targetEl = isPlayerAttacking ? document.getElementById('fighter-enemy') : document.getElementById('fighter-player');
    targetEl.classList.remove('hit-anim'); void targetEl.offsetWidth; targetEl.classList.add('hit-anim');
    floatDmg(isPlayerAttacking?235:115, 52, crit ? '¡'+dmg+'!':'-'+dmg, crit?'crit':'');
    updateHpBars(player, foe);
    return defender.hp <= 0;
  }

  function updateHpBars(p,f){
    const ppct = Math.max(0, p.hp / p.maxHp * 100);
    const fpct = Math.max(0, f.hp / f.maxHp * 100);
    document.getElementById('hp-player-fill').style.width = ppct+'%';
    document.getElementById('hp-enemy-fill').style.width = fpct+'%';
    document.getElementById('hp-player-txt').textContent = p.hp+' / '+p.maxHp;
    document.getElementById('hp-enemy-txt').textContent = f.hp+' / '+f.maxHp;
  }

  const playerInterval = Math.max(380, 820 - player.speed*38);
  const enemyInterval  = Math.max(420, 860 - foe.speed*38);

  let fightOver = false;
  const pTimer = setInterval(()=>{
    if(fightOver) return;
    if(doHit(player, foe, true)){
      endFight(true);
    }
  }, playerInterval);

  const eTimer = setTimeout(()=>{
    const eInt = setInterval(()=>{
      if(fightOver){ clearInterval(eInt); return; }
      if(doHit(foe, player, false)){
        endFight(false);
      }
    }, enemyInterval);
    // store to clear later
    window._enemyFightInt = eInt;
  }, enemyInterval*0.55);

  function endFight(playerWon){
    if(fightOver) return;
    fightOver = true;
    clearInterval(pTimer);
    if(window._enemyFightInt) clearInterval(window._enemyFightInt);
    fightActive = false;
    const res = document.getElementById('fight-result');
    res.style.display='block';
    res.innerHTML = playerWon
      ? `<h3>🏆 ¡VICTORIA!</h3><p>Derrotaste a ${enemy.name}</p><button id="fight-again">PELEAR DE NUEVO</button>`
      : `<h3>💥 Derrota</h3><p>${enemy.name} te ha vencido</p><button id="fight-again">REVANCHA</button>`;
    document.getElementById('fight-again').onclick = ()=>{
      res.style.display='none';
      resetFightUI();
      fightActive = false;
      toast('Toca el ring para buscar otro rival');
    };
    // recompensa
    if(playerWon){
      game.gold += 12;
      game.crystal += 2;
      refreshStats();
    }
  }
}

// Reset fight UI cuando entras a LUCHA
const origOpenLuchaPanel = openLuchaPanel;
openLuchaPanel = function(){
  if(!coliseoActive) return;
  coliseoPanel.classList.remove('show');
  luchaPanel.classList.add('show');
  resetFightUI();
  matchOverlay.classList.remove('show');
  matchmakingActive = false;
  fightActive = false;
  toast('🥊 LUCHA');
};
// Re-vincular el botón LUCHA al nuevo openLuchaPanel
if(typeof luchaBtn !== 'undefined' && luchaBtn){
  luchaBtn.removeEventListener('click', origOpenLuchaPanel);
  luchaBtn.addEventListener('click', openLuchaPanel);
}


// ================ GAME STATE ================
const ST={
  gold:15,diamonds:0,
  s:{atk:1,def:1,hp:1,spd:1,eva:1,crit:1},
  wins:0,fights:0,streak:0,
  arena:0,arenaStreaks:[0],arenaUnlocked:[false],arenaPowerMults:[1],
  upgCosts:{atk:10,def:10,hp:10,spd:10,eva:10,crit:10},
  goldMult:1
};
const FIRST_ARENA_POWER_RANGE={min:1,max:5};
const SECOND_ARENA_POWER_RANGE={min:5,max:10};
const ARENA_POWER_STEP=20;
const MAX_ROUNDS=1;
const VS_AUTO_START_MS=4000;
const RESULT_AUTO_NEXT_MS=7000;
const ARENA_STREAK_TARGET=10;
const STAT_CFG={
  atk:{base:7,growth:1.13},
  def:{base:3,growth:1.07},
  hp:{base:100,growth:1.18},
  spd:{base:2,growth:1.05},
  eva:{base:1,add:.30,max:35},
  crit:{base:1,add:.21,max:23}
};
function ensureUpgradeCosts(){
  const keys=['atk','def','hp','spd','eva','crit'];
  if(!ST.upgCosts)ST.upgCosts={};
  keys.forEach(k=>{
    if(!Number.isFinite(ST.upgCosts[k])||ST.upgCosts[k]<1)ST.upgCosts[k]=10;
  });
}
function upgCost(k){
  ensureUpgradeCosts();
  return isStatMaxed(k)?Infinity:Math.ceil(ST.upgCosts[k]);
}
function advanceUpgradeCost(k,baseCost){
  ensureUpgradeCosts();
  ST.upgCosts[k]=Math.ceil(Math.max(1,baseCost)*randomFloat(1.40,3.20));
}
function upgValue(k,lvl){
  const c=STAT_CFG[k];
  if(!c)return lvl;
  if(k==='eva'||k==='crit')return Math.min(c.max,c.base+(lvl-1)*c.add);
  return c.base*Math.pow(c.growth,lvl-1);
}
function isStatMaxed(k,lvl=ST.s[k]){
  const c=STAT_CFG[k];
  return !!(c&&c.max!=null&&upgValue(k,lvl)>=c.max);
}
function fmtStat(k,v){
  if(k==='eva'||k==='crit')return fmtDecimal(v,2)+'%';
  if(k==='spd')return fmtDecimal(v,2);
  return fmtN(v);
}
function fmtDecimal(n,maxDigits=2){
  const fixed=Number(n).toFixed(maxDigits);
  return fixed.replace(/(\.\d*?[1-9])0+$/,'$1').replace(/\.0+$/,'');
}
function totPow(){return playerPowerFromStats()}
function fmtN(n){
  n=Math.max(0,Number(n)||0);
  const units=[{v:1e9,s:'B'},{v:1e6,s:'M'},{v:1e3,s:'K'}];
  for(const u of units){
    if(n>=u.v)return fmtDecimal(n/u.v,2)+u.s;
  }
  return fmtDecimal(n,Number.isInteger(n)?0:2);
}
function playerPowerFromStats(){
  return Object.values(ST.s).reduce((total,lvl)=>total+(Number(lvl)||0),0);
}
function randomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function randomFloat(min,max){return min+Math.random()*(max-min)}

function rollPercent(chance){
  chance=Math.max(0,Math.min(100,Number(chance)||0));
  const invisibleRoll=randomFloat(0,100);
  return invisibleRoll<chance;
}
function reduceDamageByDefense(damage,defense){
  damage=Math.max(0,Number(damage)||0);
  defense=Math.max(0,Number(defense)||0);
  const reduction=Math.min(.20,defense*.004);
  return damage*(1-reduction);
}
function arenaStreak(){return ST.arenaUnlocked[ST.arena]?ARENA_STREAK_TARGET:(ST.arenaStreaks[ST.arena]||0)}
function ensureArena(i){
  while(ST.arenaStreaks.length<=i)ST.arenaStreaks.push(0);
  while(ST.arenaUnlocked.length<=i)ST.arenaUnlocked.push(false);
  while(ST.arenaPowerMults.length<=i){
    const prev=ST.arenaPowerMults[ST.arenaPowerMults.length-1]||1;
    ST.arenaPowerMults.push(prev*randomFloat(1.70,3.50));
  }
}
function arenaEnemyPowerRange(arena=ST.arena){
  const arenaIndex=Math.max(0,Math.floor(Number(arena)||0));
  if(arenaIndex===0)return{...FIRST_ARENA_POWER_RANGE};
  if(arenaIndex===1)return{...SECOND_ARENA_POWER_RANGE};
  const min=SECOND_ARENA_POWER_RANGE.max+ARENA_POWER_STEP*(arenaIndex-2);
  return{min,max:min+ARENA_POWER_STEP};
}
function arenaEnemyPower(){
  ensureArena(ST.arena);
  const {min,max}=arenaEnemyPowerRange(ST.arena);
  return randomInt(min,max);
}
function distributeEnemyStats(power){
  const keys=['atk','def','hp','spd','eva','crit'];
  const totalPoints=Math.max(0,Math.round(Number(power)||0));
  const stats={atk:0,def:0,hp:0,spd:0,eva:0,crit:0};
  for(let i=0;i<totalPoints;i++)stats[keys[randomInt(0,keys.length-1)]]++;
  return stats;
}
function enemyStatLevel(points){return 1+Math.max(0,Number(points)||0)}
function enemyStatValue(k,stats){return upgValue(k,enemyStatLevel(stats[k]))}
function renderEnemyStats(stats){
  const el=$('enemyStats');
  if(!el)return;
  const items=[
    ['atk','⚔️','Ataque'],['def','🛡️','Defensa'],['hp','❤️','HP'],
    ['spd','💨','Velocidad'],['eva','🌀','Evasión'],['crit','💥','Crítico']
  ];
  el.innerHTML=items.map(([k,ico,name])=>`<div class="enemy-stat"><span class="ei">${ico}</span><span class="en">${name}</span><span class="ev">${fmtStat(k,enemyStatValue(k,stats))}</span></div>`).join('');
}
function syncFighterStats(f){
  f.mhp=Math.max(1,Math.round(f.mhp));
  f.hp=Math.min(f.mhp,Math.max(1,Math.round(f.hp)));
  f.atk=Math.max(1,Number(f.atk.toFixed(2)));
  f.def=Math.max(0,Number(f.def.toFixed(2)));
  f.spd=Math.max(.8,Number(f.spd.toFixed(2)));
  f.eva=Math.min(STAT_CFG.eva.max,Math.max(0,Number(f.eva.toFixed(2))));
  f.crit=Math.min(STAT_CFG.crit.max,Math.max(0,Number(f.crit.toFixed(2))));
}
// ================ DOM ================
const $=id=>document.getElementById(id);
const cv=$('cv'),cx=cv.getContext('2d');

// Menu tabs
function getActiveTabName(){
  const active=document.querySelector('.menu-btn.active');
  return active?active.dataset.t:'fight';
}
function isFightSystemVisible(){
  const tab=getActiveTabName();
  return tab==='fight'||(tab==='events'&&window.EventTournament&&window.EventTournament.isEventFight&&window.EventTournament.isEventFight());
}
function clearMatchmakingTimers(){
  (F.matchmakingTimers||[]).forEach(timer=>{
    if(timer&&timer.type==='interval')clearInterval(timer.id);
    else if(timer)clearTimeout(timer.id);
  });
  F.matchmakingTimers=[];
}
function trackFightTimer(id,type='timeout'){
  F.matchmakingTimers.push({id,type});
  return id;
}
function pauseFightSystemForTab(){
  F.fightVisible=false;
  F.pausedByTab=true;
  if(F.vsTimer){clearTimeout(F.vsTimer);F.vsTimer=null;}
  if(F.resTimer){clearTimeout(F.resTimer);F.resTimer=null;}
  clearMatchmakingTimers();
  stopCdBar('vsCd');stopCdBar('resCd');
  if(F.searching){
    F.searchPausedByTab=true;
    F.searching=false;
    $('mmOv').classList.remove('show');
  }
}
function resumeFightSystemForTab(){
  const wasHidden=!F.fightVisible;
  F.fightVisible=true;
  F.pausedByTab=false;
  if(getActiveTabName()==='fight')rszCv();
  if(!wasHidden)return;
  if(F.searchPausedByTab){
    F.searchPausedByTab=false;
    startMatchmaking();
  }else if(F.vsReady)startVsCountdown();
  else if($('resOv').classList.contains('show'))startResultCountdown();
}
function syncFightVisibility(){
  if(isFightSystemVisible())resumeFightSystemForTab();
  else pauseFightSystemForTab();
}
function switchTab(tabName){
  document.querySelectorAll('.menu-btn').forEach(x=>x.classList.toggle('active',x.dataset.t===tabName));
  document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));
  const target=$('s-'+tabName);
  if(target)target.classList.add('active');
  if(tabName==='fight')rszCv();
  syncFightVisibility();
}
document.querySelectorAll('.menu-btn').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.t)));

// Upgrades
document.querySelectorAll('.upg-card').forEach(b=>b.addEventListener('click',()=>{
  const k=b.dataset.u,c=upgCost(k);
  if(!isStatMaxed(k)&&ST.gold>=c){ST.gold-=c;ST.s[k]++;advanceUpgradeCost(k,c);updUI();saveGameNow();}
}));

function updUI(){
  ensureArena(ST.arena);
  $('xGold').textContent=fmtN(ST.gold);
  $('xDiam').textContent=fmtN(ST.diamonds);
  $('xWin').textContent=fmtN(F.currentPlayerPow!=null?F.currentPlayerPow:playerPowerFromStats());
  $('xPow').textContent=F.currentEnemyPow!=null?fmtN(F.currentEnemyPow):'--';
  $('xRound').textContent=arenaStreak()+'/'+ARENA_STREAK_TARGET;
  const prevBtn=$('arenaPrev'),nextBtn=$('arenaNext');
  if(prevBtn)prevBtn.disabled=ST.arena<=0;
  if(nextBtn)nextBtn.disabled=!ST.arenaUnlocked[ST.arena];
  ['atk','def','hp','spd','eva','crit'].forEach(k=>{
    const cap=k.charAt(0).toUpperCase()+k.slice(1);
    $('u'+cap).textContent='Actual '+fmtStat(k,upgValue(k,ST.s[k]));
    $('n'+cap).textContent=isStatMaxed(k)?'MAX':('Mejora '+fmtStat(k,upgValue(k,ST.s[k]+1)));
    $('c'+cap).textContent=isStatMaxed(k)?'MAX':('💰'+fmtN(upgCost(k)));
  });
}

function addLog(msg,cls){
  // Log silencioso (sin panel visual)
}

// (Eliminado) Oro ya no sube de forma automática.
// El oro solo aumenta al ganar o perder peleas (recompensa).

// ================ CANVAS ================
function rszCv(){
  const r=cv.parentElement.getBoundingClientRect();
  cv.width=Math.floor(r.width);cv.height=Math.floor(r.height);
  F.audience=genAudience();
  buildArenaCache();
}
window.addEventListener('resize',rszCv);
setTimeout(rszCv,60);

// ================ FIGHT STATE ================
const F={
  on:false,round:1,timer:0,
  p1:null,p2:null,
  fx:[],shake:0,
  audience:[],
  arenaCache:null,
  arenaCacheW:0,arenaCacheH:0,
  roundWins:[0,0], // p1wins, p2wins
  paused:false,pauseT:0,
  countdown:0,
  // Matchmaking
  searching:false,
  vsReady:false,
  pendingEnemy:null,     // ficha del enemigo encontrado, pendiente de pelear
  currentEnemyPow:null,  // poder visible del rival para la barra superior y la pantalla VS
  currentPlayerPow:null, // poder propio visible en VS y barra superior
  enemyName:'RIVAL',
  vsTimer:null,          // temporizador de auto-inicio de pelea (4s)
  resTimer:null,         // temporizador de auto-búsqueda tras resultado (7s)
  resultSettled:false,   // evita pagar la misma pelea más de una vez
  roundIntroT:0,
  roundIntroText:'',
  roundEnding:false,
  fightVisible:true,
  pausedByTab:false,
  searchPausedByTab:false,
  matchmakingTimers:[]
};

// Nombres aleatorios para rivales
const ENEMY_NAMES=['EL TORO','MÁSCARA NEGRA','REY HALCÓN','TIBURÓN','GIGANTE','VIPERA','TROPA SALVAJE','HURACÁN','BESTIA','RELÁMPAGO','SOMBRA','CICLÓN','LOBO','PUMA','ESCORPIÓN','TITÁN'];

const MOVES=[
  {name:'Golpe',dmgMul:1,kb:120,stun:.12,icon:'👊'},
  {name:'Patada',dmgMul:1.1,kb:150,stun:.15,icon:'🦵'},
  {name:'Gancho',dmgMul:1.3,kb:180,stun:.2,icon:'🤜'},
  {name:'Suplex',dmgMul:1.6,kb:250,stun:.35,icon:'💪'},
  {name:'Codazo',dmgMul:1.2,kb:160,stun:.18,icon:'💢'},
  {name:'Plancha',dmgMul:1.8,kb:300,stun:.4,icon:'🔥'},
  {name:'Lariat',dmgMul:1.5,kb:280,stun:.3,icon:'💨'},
  {name:'DDT',dmgMul:1.7,kb:200,stun:.45,icon:'⚡'},
  {name:'Dropkick',dmgMul:1.4,kb:220,stun:.25,icon:'🌟'},
  {name:'Uppercut',dmgMul:1.35,kb:200,stun:.22,icon:'✊'}
];

function mkFighter(isP,x,y,enemyStats=null){
  const s=ST.s;
  let hp,atk,def,spd,eva,crit;
  if(isP){
    hp=upgValue('hp',s.hp);atk=upgValue('atk',s.atk);def=upgValue('def',s.def);
    spd=upgValue('spd',s.spd);eva=upgValue('eva',s.eva);crit=upgValue('crit',s.crit);
  }else{
    const stats=enemyStats||distributeEnemyStats(arenaEnemyPower());
    hp=enemyStatValue('hp',stats);atk=enemyStatValue('atk',stats);def=enemyStatValue('def',stats);
    spd=enemyStatValue('spd',stats);eva=enemyStatValue('eva',stats);crit=enemyStatValue('crit',stats);
  }
  return{
    x,y,vx:0,vy:0,
    hp,mhp:hp,atk,def,spd,eva,crit,
    r:12,
    col:isP?'#42a5f5':'#ef5350',
    col2:isP?'#1565c0':'#b71c1c',
    glowCol:isP?'rgba(66,165,245,.25)':'rgba(239,83,80,.25)',
    name:isP?'TÚ':'CPU',isP,
    st:'idle',stT:0,
    atkCD:0,
    face:isP?1:-1,
    stunT:0,kbx:0,kby:0,
    bob:Math.random()*6.28,
    hurt:0,
    dashT:0,dashDx:0,dashDy:0,
    strafeD:1,
    lastMv:null,
    blocking:false,blockT:0,
    visible:true
  };
}

function genAudience(){
  // No se generan personas alrededor del ring para mantener la arena despejada.
  return [];
}

// ====== BARRAS DE CUENTA ATRÁS (auto-avance) ======
// Reinicia y lanza la animación CSS de la barra según la duración indicada.
function runCdBar(id,durationMs){
  const bar=$(id);
  if(!bar)return;
  bar.classList.remove('run');
  // forzar reflow para reiniciar la animación
  void bar.offsetWidth;
  if(durationMs)bar.style.setProperty('--cd-duration',durationMs+'ms');
  bar.classList.add('run');
}
function stopCdBar(id){
  const bar=$(id);
  if(bar)bar.classList.remove('run');
}

// Tras encontrar al rival: barra de 4s bajo "PELEAR" -> inicia la pelea automáticamente.
function startVsCountdown(){
  if(!isFightSystemVisible())return;
  if(F.vsTimer)clearTimeout(F.vsTimer);
  runCdBar('vsCd',VS_AUTO_START_MS);
  F.vsTimer=setTimeout(()=>{
    F.vsTimer=null;
    if(F.vsReady&&isFightSystemVisible())startFight();
  },VS_AUTO_START_MS);
}

// Tras el resultado (VICTORIA/DERROTA): barra de 7s bajo "SIGUIENTE PELEA" -> busca nuevo rival.
function startResultCountdown(){
  if(!isFightSystemVisible())return;
  if(F.resTimer)clearTimeout(F.resTimer);
  runCdBar('resCd',RESULT_AUTO_NEXT_MS);
  F.resTimer=setTimeout(()=>{
    F.resTimer=null;
    if($('resOv').classList.contains('show')&&isFightSystemVisible()){
      $('resOv').classList.remove('show');
      F.currentEnemyPow=null;
      F.currentPlayerPow=null;
      updUI();
      saveGameNow();
      startMatchmaking();
    }
  },RESULT_AUTO_NEXT_MS);
}

// ====== MATCHMAKING ======
function startMatchmaking(){
  if(!isFightSystemVisible())return;
  if(F.on||F.searching||F.vsReady)return;
  if($('resOv').classList.contains('show'))return;
  F.searching=true;
  F.pendingEnemy=null;
  F.roundWins=[0,0];
  F.currentPlayerPow=playerPowerFromStats();
  F.currentEnemyPow=null;
  updUI();
  saveGameNow();
  $('mmOv').classList.add('show');
  $('mmStatus').textContent='Conectando con la red de luchadores...';
  // Animación de puntos
  let dots=1;
  const dotsEl=$('mmDots');
  const statusEl=$('mmStatus');
  const stages=[
    'Conectando con la red de luchadores...',
    'Escaneando arenas cercanas...',
    'Analizando rivales disponibles...',
    'Comparando estadísticas...',
    '¡Rival encontrado!'
  ];
  let stageIdx=0;
  dotsEl.textContent='.';
  clearMatchmakingTimers();
  const dotsInt=trackFightTimer(setInterval(()=>{
    dots=(dots%3)+1;
    dotsEl.textContent='.'.repeat(dots);
  },220),'interval');
  const stageInt=trackFightTimer(setInterval(()=>{
    stageIdx=Math.min(stages.length-1,stageIdx+1);
    statusEl.textContent=stages[stageIdx];
  },550),'interval');
  // Tras ~2.6 s, mostrar VS
  trackFightTimer(setTimeout(()=>{
    clearMatchmakingTimers();
    if(!isFightSystemVisible()){
      F.searching=false;
      $('mmOv').classList.remove('show');
      return;
    }
    $('mmOv').classList.remove('show');
    F.searching=false;
    showVS();
  },2600));
}

function showVS(){
  const W=cv.width,H=cv.height;
  const cX=W/2,cY=H/2;
  const myPow=playerPowerFromStats();
  const enPow=arenaEnemyPower();
  const enemyStats=distributeEnemyStats(enPow);
  // Construimos rivales (se reutilizarán en la pelea)
  const p1=mkFighter(true,cX-55,cY);
  const p2=mkFighter(false,cX+55,cY,enemyStats);
  syncFighterStats(p1);syncFighterStats(p2);
  p1.power=myPow;
  p2.power=enPow;
  p2.statPoints=enemyStats;
  F.pendingEnemy={p1,p2};
  F.enemyName=ENEMY_NAMES[Math.floor(Math.random()*ENEMY_NAMES.length)];
  F.currentPlayerPow=myPow;
  F.currentEnemyPow=enPow;
  // Pintar UI VS
  $('vsEName').textContent=F.enemyName;
  $('vsPowP').textContent=fmtN(myPow);
  $('vsPowE').textContent=fmtN(enPow);
  renderEnemyStats(enemyStats);
  // Dibujar sprites estáticos en los canvas pequeños
  drawSpriteSnapshot($('spP').getContext('2d'),p1);
  drawSpriteSnapshot($('spE').getContext('2d'),p2);
  $('vsOv').classList.add('show');
  F.vsReady=true;
  updUI();
  // Inicia automáticamente la pelea tras 4s, mostrando la barra que se consume bajo "PELEAR".
  startVsCountdown();
  saveGameNow();
}

function cancelVS(){
  // Si el usuario cambia de pestaña, etc. — opcional, no usado por defecto
  $('vsOv').classList.remove('show');
  F.vsReady=false;
  F.pendingEnemy=null;
  F.currentEnemyPow=null;
  F.currentPlayerPow=null;
  updUI();
}

function resetEncounterForArenaChange(){
  if(F.vsTimer){clearTimeout(F.vsTimer);F.vsTimer=null;}
  if(F.resTimer){clearTimeout(F.resTimer);F.resTimer=null;}
  stopCdBar('vsCd');stopCdBar('resCd');
  $('vsOv').classList.remove('show');
  $('resOv').classList.remove('show');
  F.vsReady=false;
  F.pendingEnemy=null;
  F.currentEnemyPow=null;
  F.currentPlayerPow=null;
  F.roundWins=[0,0];
  F.resultSettled=false;
  F.roundEnding=false;
}

// Dibuja un sprite estático del fighter en un canvas 64x64
function drawSpriteSnapshot(g,f){
  g.clearRect(0,0,64,64);
  // Sombra
  g.fillStyle='rgba(0,0,0,.3)';
  g.beginPath();g.ellipse(32,52,18,4,0,0,6.28);g.fill();
  // Glow
  g.fillStyle=f.glowCol;
  g.beginPath();g.arc(32,30,22,0,6.28);g.fill();
  // Body
  g.beginPath();g.arc(32,30,16,0,6.28);
  g.fillStyle=f.col;g.fill();
  g.strokeStyle=f.col2;g.lineWidth=3;g.stroke();
  // Shading
  const sg=g.createRadialGradient(28,26,1,32,30,16);
  sg.addColorStop(0,'rgba(255,255,255,.3)');sg.addColorStop(1,'rgba(0,0,0,.2)');
  g.fillStyle=sg;g.beginPath();g.arc(32,30,16,0,6.28);g.fill();
  // Eyes
  g.fillStyle='#fff';
  g.beginPath();g.arc(27,28,3.2,0,6.28);g.fill();
  g.beginPath();g.arc(37,28,3.2,0,6.28);g.fill();
  g.fillStyle='#111';
  g.beginPath();g.arc(28,28,1.5,0,6.28);g.fill();
  g.beginPath();g.arc(38,28,1.5,0,6.28);g.fill();
  // Brows
  g.strokeStyle='#111';g.lineWidth=1.8;
  g.beginPath();g.moveTo(23,23);g.lineTo(30,25);g.stroke();
  g.beginPath();g.moveTo(41,23);g.lineTo(34,25);g.stroke();
  // Mouth
  g.strokeStyle='#111';g.lineWidth=1.4;
  g.beginPath();g.moveTo(28,38);g.lineTo(32,36);g.lineTo(36,38);g.stroke();
}

function startFight(){
  if(!isFightSystemVisible())return;
  const W=cv.width,H=cv.height;
  const cX=W/2,cY=H/2;
  // Usar los fighters pre-generados en el VS (mantienen consistencia con el poder mostrado)
  let p1,p2;
  if(F.pendingEnemy){
    p1=F.pendingEnemy.p1;p2=F.pendingEnemy.p2;
    // Reset posiciones por si se movieron
    p1.x=cX-55;p1.y=cY;p2.x=cX+55;p2.y=cY;
    p1.hp=p1.mhp;p2.hp=p2.mhp;
  }else{
    p1=mkFighter(true,cX-55,cY);
    p2=mkFighter(false,cX+55,cY);
  }
  p1.visible=true;p2.visible=true;
  F.on=true;F.round=1;F.timer=30;F.fx=[];F.shake=0;F.resultSettled=false;F.roundEnding=false;
  F.roundWins=[0,0];F.roundIntroT=0;F.roundIntroText='';
  if(F.currentPlayerPow==null)F.currentPlayerPow=playerPowerFromStats();
  if(F.currentEnemyPow==null){
    F.currentEnemyPow=arenaEnemyPower();
    const enemyStats=distributeEnemyStats(F.currentEnemyPow);
    p2=mkFighter(false,cX+55,cY,enemyStats);
    syncFighterStats(p2);
    p2.power=F.currentEnemyPow;
    p2.statPoints=enemyStats;
  }
  F.p1=p1;F.p2=p2;
  F.audience=genAudience();
  F.paused=false;
  F.roundEnding=false;
  F.countdown=3;
  F.vsReady=false;
  F.pendingEnemy=null;
  // Cancelar temporizadores/barras de auto-avance
  if(F.vsTimer){clearTimeout(F.vsTimer);F.vsTimer=null;}
  if(F.resTimer){clearTimeout(F.resTimer);F.resTimer=null;}
  stopCdBar('vsCd');stopCdBar('resCd');
  $('vsOv').classList.remove('show');
  $('resOv').classList.remove('show');
  updUI();
  addLog('━━━━ NUEVA PELEA ━━━━','w');
  addLog('🔔 Round único — ¡FIGHT!','h');
  saveGameNow();
}

// ================ AI / PHYSICS ================
function updFighter(f,en,dt){
  if(!f||!en||f.visible===false||en.visible===false)return;
  const W=cv.width,H=cv.height;
  const bounds=getFightBounds(W,H,f.r);
  const rL=bounds.l,rR=bounds.r,rT=bounds.t,rB=bounds.b;

  f.bob+=dt*3.5;
  if(f.hurt>0)f.hurt-=dt;
  if(f.atkCD>0)f.atkCD-=dt;
  if(f.blockT>0){f.blockT-=dt;if(f.blockT<=0)f.blocking=false;}

  // Stun / Knockback
  if(f.stunT>0){
    f.stunT-=dt;
    f.x+=f.kbx*dt;f.y+=f.kby*dt;
    f.kbx*=Math.pow(.08,dt);f.kby*=Math.pow(.08,dt);
    // Bounce off ropes
    if(f.x<rL){f.x=rL;f.kbx=Math.abs(f.kbx)*.5;spawnRopeHit(rL,f.y);}
    if(f.x>rR){f.x=rR;f.kbx=-Math.abs(f.kbx)*.5;spawnRopeHit(rR,f.y);}
    if(f.y<rT){f.y=rT;f.kby=Math.abs(f.kby)*.5;}
    if(f.y>rB){f.y=rB;f.kby=-Math.abs(f.kby)*.5;}
    return;
  }

  const dx=en.x-f.x,dy=en.y-f.y;
  const dist=Math.sqrt(dx*dx+dy*dy)||1;
  f.face=dx>0?1:-1;

  // Dash movement
  if(f.dashT>0){
    f.dashT-=dt;
    f.x+=f.dashDx*dt;f.y+=f.dashDy*dt;
    clamp(f,rL,rR,rT,rB);
    return;
  }

  f.stT-=dt;
  if(f.stT<=0){
    const rnd=Math.random();
    if(dist>90){
      // Far away — rush or dash toward
      if(rnd<.3){
        f.st='dash';f.stT=.25;
        f.dashT=.25;f.dashDx=dx/dist*f.spd*180;f.dashDy=dy/dist*f.spd*180;
      }else{
        f.st='approach';f.stT=.4+Math.random()*.6;
      }
    }else if(dist<38&&f.atkCD<=0){
      f.st='attack';f.stT=.1+Math.random()*.15;
    }else if(rnd<.15&&f.atkCD>.2){
      f.st='block';f.stT=.3+Math.random()*.4;
      f.blocking=true;f.blockT=f.stT;
    }else if(rnd<.35){
      f.st='strafe';f.stT=.3+Math.random()*.5;
      f.strafeD=Math.random()<.5?1:-1;
    }else if(rnd<.5){
      f.st='retreat';f.stT=.25+Math.random()*.4;
    }else if(rnd<.65){
      f.st='circle';f.stT=.5+Math.random()*.5;
      f.strafeD=Math.random()<.5?1:-1;
    }else{
      f.st='approach';f.stT=.3+Math.random()*.5;
    }
  }

  const spd=f.spd*55;
  switch(f.st){
    case'approach':
      if(dist>8){f.x+=dx/dist*spd*dt;f.y+=dy/dist*spd*dt;}
      if(dist<35&&f.atkCD<=0){f.st='attack';f.stT=.1;}
      break;
    case'strafe':{
      const px=-dy/dist,py=dx/dist;
      f.x+=px*f.strafeD*spd*.9*dt;f.y+=py*f.strafeD*spd*.9*dt;
      if(dist>100){f.st='approach';f.stT=.4;}
      break;}
    case'circle':{
      const px=-dy/dist,py=dx/dist;
      f.x+=(px*f.strafeD*spd*.7+dx/dist*spd*.2)*dt;
      f.y+=(py*f.strafeD*spd*.7+dy/dist*spd*.2)*dt;
      break;}
    case'retreat':
      if(dist<120){f.x-=dx/dist*spd*.65*dt;f.y-=dy/dist*spd*.65*dt;}
      break;
    case'block':break;
    case'attack':
      if(f.atkCD<=0)doAttack(f,en);
      break;
  }
  clamp(f,rL,rR,rT,rB);
}

function clamp(f,l,r,t,b){
  f.x=Math.max(l,Math.min(r,f.x));
  f.y=Math.max(t,Math.min(b,f.y));
}

function doAttack(atk,def){
  const mv=MOVES[Math.floor(Math.random()*MOVES.length)];
  atk.lastMv=mv;
  atk.atkCD=(.5+Math.random()*.4)/Math.max(.2,atk.spd/2);

  // Dash lunge
  const dx=def.x-atk.x,dy=def.y-atk.y,d=Math.sqrt(dx*dx+dy*dy)||1;
  atk.dashT=.08;atk.dashDx=dx/d*200;atk.dashDy=dy/d*200;

  // Evasión: el porcentaje actual del defensor es su probabilidad real de esquivar.
  if(rollPercent(def.eva)){
    addLog(`${def.name} esquiva ${mv.name} ${mv.icon}`,'m');
    spawnFx(def.x,def.y-22,'ESQUIVA!','#aaa',14);
    // Defender dodges sideways
    const perpX=-dy/d,perpY=dx/d;
    const side=Math.random()<.5?1:-1;
    def.dashT=.15;def.dashDx=perpX*side*180;def.dashDy=perpY*side*180;
    return;
  }

  // Block check
  if(def.blocking){
    const blocked=Math.max(1,Math.floor(reduceDamageByDefense(atk.atk*.3,def.def)));
    def.hp=Math.max(0,def.hp-blocked);
    def.hurt=.1;
    addLog(`${def.name} bloquea ${mv.name}! -${blocked} (reducido)`,'m');
    spawnFx(def.x,def.y-22,'🛡️ BLOCK -'+fmtN(blocked),atk.isP?'#ffffff':'#ef5350',17);
    F.shake=.06;
    spawnSparks((atk.x+def.x)/2,(atk.y+def.y)/2,3,'#40c4ff');
    return;
  }

  // Damage: el ataque sincronizado del personaje es la base que se resta al HP rival.
  let dmg=Math.max(1,Math.floor(reduceDamageByDefense(atk.atk,def.def)));
  const isCrit=rollPercent(atk.crit);
  if(isCrit)dmg=Math.floor(dmg*2);

  def.hp=Math.max(0,def.hp-dmg);
  def.hurt=.18;
  // Knockback
  const kbF=mv.kb*(isCrit?1.8:1);
  def.stunT=mv.stun*(isCrit?1.5:1);
  def.kbx=(dx/d)*kbF;def.kby=(dy/d)*kbF;

  F.shake=isCrit?.22:.1;

  // VFX
  const ix=(atk.x+def.x)/2,iy=(atk.y+def.y)/2;
  const col=atk.isP?'#ffffff':'#ef5350';
  const txt=isCrit?`💥CRIT! -${dmg}`:`${mv.icon}-${dmg}`;
  spawnFx(ix,iy-12,txt,col,isCrit?23:18);
  spawnSparks(ix,iy,isCrit?10:4,isCrit?'#ffd740':'#ff6d00');
  if(isCrit){
    spawnFx(ix,iy-30,'¡¡'+mv.name.toUpperCase()+'!!',col,14);
    F.audience.forEach(a=>a.ch=.6+Math.random()*.3);
  }

  const lt=isCrit?'cr':'h';
  addLog(`${atk.name} ${mv.icon}${mv.name}${isCrit?' ¡CRIT!':''} → -${fmtN(dmg)} ${def.name} [${fmtN(Math.ceil(def.hp))}/${fmtN(def.mhp)}]`,lt);
}

// ================ EFFECTS ================
function spawnFx(x,y,text,color,sz){
  F.fx.push({t:'txt',x,y,text,color,sz,life:1.2,ml:1.2,vy:-35});
}
function spawnSparks(x,y,n,c){
  // Limitar particulas activas totales para mantener fluidez
  const MAX_SPARKS=80;
  const currentSparks=F.fx.filter(e=>e.t==='sp').length;
  const allowed=Math.max(0,Math.min(n,MAX_SPARKS-currentSparks));
  for(let i=0;i<allowed;i++){
    const a=Math.random()*6.28,sp=50+Math.random()*140;
    F.fx.push({t:'sp',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.25+Math.random()*.3,ml:.55,
      color:c||'#ff6d00',sz:1.5+Math.random()*2.5});
  }
}
function spawnRopeHit(x,y){
  spawnSparks(x,y,5,'#ff0000');
  F.shake=Math.max(F.shake,.08);
  F.audience.forEach(a=>{if(Math.random()<.4)a.ch=.3;});
}
function spawnKoExplosion(f){
  if(!f)return;
  const x=f.x,y=f.y;
  const mainColor=f.isP?'#90caf9':'#ef5350';
  spawnFx(x,y-28,'💥 KO 💥',mainColor,28);
  for(let i=0;i<38;i++){
    const a=Math.random()*6.28,sp=35+Math.random()*105;
    F.fx.push({t:'sp',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.85+Math.random()*.65,ml:1.5,
      color:i%3===0?'#ffffff':(i%3===1?'#ffd740':mainColor),sz:2.5+Math.random()*4});
  }
  f.visible=false;
  f.blocking=false;
  F.shake=Math.max(F.shake,.28);
  F.audience.forEach(a=>a.ch=.9+Math.random()*.7);
}

function updFx(dt){
  // Cap total de efectos para mantener fluidez
  if(F.fx.length>120)F.fx.splice(0,F.fx.length-120);
  for(let i=F.fx.length-1;i>=0;i--){
    const e=F.fx[i];e.life-=dt;
    if(e.life<=0){F.fx.splice(i,1);continue;}
    if(e.t==='txt'){e.y+=e.vy*dt;e.vy*=.94;}
    else{e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=250*dt;}
  }
}

// ================ RENDER ================
function getRingBounds(W,H){
  const rL=W*.12,rR=W*.88,rT=H*.15,rB=H*.85;
  return{l:rL,r:rR,t:rT,b:rB,w:rR-rL,h:rB-rT};
}

function getRopeInnerInset(W,H){
  const minD=Math.min(W,H);
  const ropeOffsets=[.10,.24,.38,.52].map(v=>Math.max(5,minD*.025)+v*Math.max(24,minD*.12));
  return Math.max(...ropeOffsets);
}

function getFightBounds(W,H,fighterRadius=0){
  const ring=getRingBounds(W,H);
  const minD=Math.min(W,H);
  const inset=getRopeInnerInset(W,H)+Math.max(3,minD*.01)+fighterRadius*.35;
  return{
    l:ring.l+inset,
    r:ring.r-inset,
    t:ring.t+inset,
    b:ring.b-inset
  };
}

function drawRingTo(g,W,H){
  const ring=getRingBounds(W,H),rL=ring.l,rR=ring.r,rT=ring.t,rB=ring.b,rW=ring.w,rH=ring.h;
  const cx0=(rL+rR)/2,cy0=(rT+rB)/2,minD=Math.min(W,H);
  const deckPad=Math.max(10,minD*.045),elev=Math.max(14,minD*.06),postR=Math.max(5,minD*.018);
  const dL=rL-deckPad,dR=rR+deckPad,dT=rT-deckPad,dB=rB+deckPad;

  // Estadio oscuro y piso de concreto pulido.
  const bg=g.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#03040a');bg.addColorStop(.44,'#070814');bg.addColorStop(1,'#1d1d22');
  g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.fillStyle='rgba(255,255,255,.025)';
  for(let y=H*.58;y<H;y+=Math.max(8,minD*.035)){
    g.fillRect(0,y,W,1);
  }
  const floorGlow=g.createRadialGradient(cx0,H*.9,2,cx0,H*.9,W*.65);
  floorGlow.addColorStop(0,'rgba(210,210,210,.13)');floorGlow.addColorStop(1,'transparent');
  g.fillStyle=floorGlow;g.fillRect(0,H*.45,W,H*.55);

  // Gradas vacías en penumbra detrás de la iluminación principal.
  g.fillStyle='rgba(0,0,0,.48)';
  for(let i=0;i<5;i++)g.fillRect(0,H*(.06+i*.075),W,Math.max(3,H*.022));

  // Truss cuadrangular superior con luces LED y halógenas.
  const trL=W*.18,trR=W*.82,trT=H*.025,trB=H*.105;
  g.strokeStyle='#08090c';g.lineWidth=Math.max(4,minD*.018);g.strokeRect(trL,trT,trR-trL,trB-trT);
  g.strokeStyle='#222832';g.lineWidth=1;g.strokeRect(trL+3,trT+3,trR-trL-6,trB-trT-6);
  for(let i=0;i<14;i++){
    const x=trL+(i+.5)*(trR-trL)/14;
    g.fillStyle=i%2?'#d6dde6':'#fff5d0';
    g.beginPath();g.arc(x,trB,Math.max(2,minD*.008),0,6.28);g.fill();
    if(i%3===0){g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x-1,trT,2,trB-trT);}
  }
  [['rgba(255,255,255,.22)',cx0,H*.5,W*.26],['rgba(255,244,205,.10)',rL+rW*.22,H*.5,W*.18],['rgba(210,235,255,.12)',rR-rW*.22,H*.5,W*.18]].forEach(([c,x,y,rad])=>{
    const beam=g.createRadialGradient(x,trB,1,x,y,rad);
    beam.addColorStop(0,c);beam.addColorStop(.55,'rgba(255,255,255,.035)');beam.addColorStop(1,'transparent');
    g.fillStyle=beam;g.fillRect(0,trB,W,H-trB);
  });

  // Mesa de oficiales ringside, campana de bronce y cronómetro analógico.
  const tableW=rW*.32,tableH=Math.max(12,H*.045),tableX=cx0-tableW/2,tableY=Math.min(H-tableH-7,dB+elev*.18);
  g.fillStyle='rgba(0,0,0,.45)';roundRect(g,tableX+3,tableY+4,tableW,tableH,3);g.fill();
  const tbl=g.createLinearGradient(0,tableY,0,tableY+tableH);
  tbl.addColorStop(0,'#17171a');tbl.addColorStop(1,'#050506');g.fillStyle=tbl;roundRect(g,tableX,tableY,tableW,tableH,3);g.fill();
  g.strokeStyle='rgba(255,255,255,.08)';g.stroke();
  const bellX=tableX+tableW*.67,bellY=tableY+tableH*.48;
  g.fillStyle='#d7a32b';g.beginPath();g.arc(bellX,bellY,Math.max(4,minD*.018),0,6.28);g.fill();
  g.strokeStyle='#ffe082';g.lineWidth=1;g.stroke();
  g.strokeStyle='#aaa';g.beginPath();g.moveTo(bellX+7,bellY+5);g.lineTo(bellX+20,bellY+1);g.stroke();
  const clockX=tableX+tableW*.35,clockR=Math.max(4,minD*.017);
  g.fillStyle='#f2f2e8';g.beginPath();g.arc(clockX,bellY,clockR,0,6.28);g.fill();
  g.strokeStyle='#303030';g.stroke();g.beginPath();g.moveTo(clockX,bellY);g.lineTo(clockX,bellY-clockR*.65);g.moveTo(clockX,bellY);g.lineTo(clockX+clockR*.55,bellY+clockR*.25);g.stroke();

  // Sombra y plataforma elevada (1.20 m visuales) con vigas industriales visibles.
  g.fillStyle='rgba(0,0,0,.52)';roundRect(g,dL+8,dT+elev,dR-dL,dB-dT,4);g.fill();
  const steel='#070707',steelHi='#252525';
  g.fillStyle=steel;g.fillRect(dL,dB,dR-dL,elev);g.fillRect(dR,dT,deckPad,elev+dB-dT);
  g.strokeStyle=steelHi;g.lineWidth=1;
  for(let x=dL+8;x<dR;x+=Math.max(14,rW/7)){
    g.beginPath();g.moveTo(x,dB);g.lineTo(x+elev*.55,dB+elev);g.stroke();
  }
  for(let y=dT+8;y<dB;y+=Math.max(13,rH/6)){
    g.beginPath();g.moveTo(dR,y);g.lineTo(dR+deckPad,y+elev*.55);g.stroke();
  }
  g.strokeStyle='rgba(0,0,0,.9)';g.lineWidth=Math.max(2,minD*.01);
  g.beginPath();g.moveTo(dL,dB);g.lineTo(dR,dB);g.lineTo(dR+deckPad,dB+elev);g.lineTo(dL+deckPad,dB+elev);g.closePath();g.stroke();
  g.beginPath();g.moveTo(dR,dT);g.lineTo(dR,dB);g.lineTo(dR+deckPad,dB+elev);g.lineTo(dR+deckPad,dT+elev);g.closePath();g.stroke();

  // Tablones de madera gruesa bajo lona y faldones de vinilo negro satinado con logos.
  for(let i=0;i<9;i++){
    const y=dT+i*(dB-dT)/9;
    g.fillStyle=i%2?'#5a3921':'#6b4527';g.fillRect(dL,y,dR-dL,(dB-dT)/9+1);
    g.strokeStyle='rgba(35,18,7,.55)';g.lineWidth=1;g.strokeRect(dL,y,dR-dL,(dB-dT)/9+1);
  }
  const apron=g.createLinearGradient(0,dB,0,dB+elev*.82);
  apron.addColorStop(0,'#191919');apron.addColorStop(.45,'#050505');apron.addColorStop(1,'#242424');
  g.fillStyle=apron;g.fillRect(dL,dB,dR-dL,elev*.78);
  g.fillRect(dR,dT,deckPad*.92,dB-dT+elev*.78);
  g.font='bold '+Math.max(8,Math.floor(minD*.035))+'px Arial';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='rgba(238,238,238,.88)';g.fillText('WLI',cx0,dB+elev*.4);
  g.fillStyle='rgba(150,150,150,.82)';g.font='bold '+Math.max(5,Math.floor(minD*.018))+'px Arial';g.fillText('PRO FIGHT',cx0+rW*.27,dB+elev*.4);
  g.save();g.translate(dR+deckPad*.46,cy0);g.rotate(Math.PI/2);g.fillStyle='rgba(238,238,238,.82)';g.fillText('WLI',0,0);g.restore();

  // Lona off-white mate: algodón texturizado, espuma marcada e imperfecciones reales.
  const mat=g.createRadialGradient(cx0,cy0,4,cx0,cy0,rW*.62);
  mat.addColorStop(0,'#f2eee2');mat.addColorStop(.68,'#e1d9c9');mat.addColorStop(1,'#cfc5b5');
  g.fillStyle=mat;g.fillRect(rL,rT,rW,rH);
  g.strokeStyle='rgba(120,112,96,.12)';g.lineWidth=1;
  for(let x=rL+rW/4;x<rR;x+=rW/4){g.beginPath();g.moveTo(x,rT);g.lineTo(x,rB);g.stroke();}
  for(let y=rT+rH/4;y<rB;y+=rH/4){g.beginPath();g.moveTo(rL,y);g.lineTo(rR,y);g.stroke();}
  g.globalAlpha=.18;
  for(let i=0;i<90;i++){
    const x=rL+((i*37)%100)/100*rW,y=rT+((i*61)%100)/100*rH;
    g.fillStyle=i%5===0?'#8f8170':(i%7===0?'#b49a86':'#ffffff');
    g.fillRect(x,y,Math.max(1,W*.002),Math.max(1,H*.002));
  }
  g.globalAlpha=1;
  [['rgba(82,70,60,.16)',cx0-rW*.18,cy0-rH*.05,rW*.18,rH*.055,-.35],['rgba(116,96,82,.13)',cx0+rW*.17,cy0+rH*.12,rW*.14,rH*.045,.25],['rgba(70,60,55,.11)',cx0,cy0-rH*.22,rW*.22,rH*.035,.08]].forEach(([c,x,y,w,h,rot])=>{
    g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=c;roundRect(g,-w/2,-h/2,w,h,h/2);g.fill();g.restore();
  });
  g.strokeStyle='rgba(80,72,64,.25)';g.lineWidth=1;g.strokeRect(rL,rT,rW,rH);

  // Utilería de esquina antes de cuerdas: taburetes, cubetas, hielo, botellas y toallas.
  const drawStool=(x,y,c)=>{g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(x+2,y+3,10,5,0,0,6.28);g.fill();g.strokeStyle='#767676';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x-5,y+12);g.moveTo(x,y);g.lineTo(x+5,y+12);g.stroke();g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(6,minD*.023),Math.max(4,minD*.015),0,0,6.28);g.fill();g.strokeStyle='rgba(255,255,255,.45)';g.stroke();};
  const drawBucket=(x,y,c)=>{g.fillStyle=c;roundRect(g,x-8,y-6,16,13,3);g.fill();g.fillStyle='rgba(230,245,255,.85)';for(let i=0;i<5;i++)g.fillRect(x-6+i*3,y-7+(i%2),2,2);g.strokeStyle='#dff3ff';g.beginPath();g.moveTo(x+1,y-8);g.lineTo(x+1,y-18);g.moveTo(x+5,y-7);g.lineTo(x+5,y-17);g.stroke();};
  drawStool(rL+rW*.12,rT+rH*.12,'#d21f28');drawBucket(rL+rW*.22,rT+rH*.12,'#b71c1c');
  drawStool(rR-rW*.12,rT+rH*.12,'#145bd7');drawBucket(rR-rW*.22,rT+rH*.12,'#0d47a1');
  g.fillStyle='#f7f7f1';roundRect(g,rL+rW*.07,rB-rH*.12,24,6,2);g.fill();roundRect(g,rR-rW*.20,rB-rH*.12,24,6,2);g.fill();

  // Escaleras pesadas de acero industrial con peldaños antideslizantes en tres esquinas.
  const drawStairs=(x,y,flipX,flipY)=>{
    const sw=Math.max(22,rW*.105),sh=Math.max(18,rH*.11),sx=flipX?-sw:0,sy=flipY?-sh:0;
    g.save();g.translate(x,y);g.fillStyle='#25282b';roundRect(g,sx,sy,sw,sh,2);g.fill();
    g.strokeStyle='#53575d';g.lineWidth=1;for(let i=1;i<4;i++){const yy=sy+i*sh/4;g.beginPath();g.moveTo(sx+2,yy);g.lineTo(sx+sw-2,yy);g.stroke();}
    g.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<4;i++)g.fillRect(sx+4,sy+i*sh/4+2,sw-8,1);
    g.restore();
  };
  drawStairs(dL-3,dT-3,true,true);drawStairs(dR+3,dT-3,false,true);drawStairs(dL-3,dB+3,true,false);

  // Cuerdas reglamentarias blancas brillantes, separadores negros y protectores de esquina.
  const ropeOffsets=[.10,.24,.38,.52].map(v=>Math.max(5,minD*.025)+v*Math.max(24,minD*.12));
  g.lineCap='round';
  ropeOffsets.forEach(off=>{
    g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=Math.max(3,minD*.013);
    [[rL,rT+off,rR,rT+off],[rL,rB-off,rR,rB-off],[rL+off,rT,rL+off,rB],[rR-off,rT,rR-off,rB]].forEach(([x1,y1,x2,y2])=>{g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();});
    g.strokeStyle='#f8fbff';g.lineWidth=Math.max(2,minD*.009);
    [[rL,rT+off,rR,rT+off],[rL,rB-off,rR,rB-off],[rL+off,rT,rL+off,rB],[rR-off,rT,rR-off,rB]].forEach(([x1,y1,x2,y2])=>{g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();});
  });
  g.lineCap='butt';g.fillStyle='#070707';
  [rL+rW/3,rL+2*rW/3].forEach(x=>{roundRect(g,x-3,rT+ropeOffsets[0]-5,6,ropeOffsets[3]-ropeOffsets[0]+10,2);g.fill();roundRect(g,x-3,rB-ropeOffsets[3]-5,6,ropeOffsets[3]-ropeOffsets[0]+10,2);g.fill();});
  [rT+rH/3,rT+2*rH/3].forEach(y=>{roundRect(g,rL+ropeOffsets[0]-5,y-3,ropeOffsets[3]-ropeOffsets[0]+10,6,2);g.fill();roundRect(g,rR-ropeOffsets[3]-5,y-3,ropeOffsets[3]-ropeOffsets[0]+10,6,2);g.fill();});

  const corners=[{x:rL,y:rT,c:'#e51c23'},{x:rR,y:rT,c:'#0d47d9'},{x:rL,y:rB,c:'#f4f7fb'},{x:rR,y:rB,c:'#f4f7fb'}];
  corners.forEach(({x,y,c},idx)=>{
    const left=x<cx0,top=y<cy0,padW=Math.max(7,minD*.026),padL=Math.max(28,minD*.15);
    const grad=g.createRadialGradient(x-postR*.35,y-postR*.35,1,x,y,postR*1.7);
    grad.addColorStop(0,'#ffffff');grad.addColorStop(.22,c);grad.addColorStop(1,idx<2?'#1b1b1b':'#9ea6ad');
    g.fillStyle=grad;g.beginPath();g.arc(x,y,postR*1.35,0,6.28);g.fill();
    g.strokeStyle='rgba(0,0,0,.62)';g.lineWidth=1.5;g.stroke();
    g.fillStyle=c;
    roundRect(g,left?x+postR*.25:x-padW-postR*.25,top?y+postR*.2:y-padL-postR*.2,padW,padL,3);g.fill();
    roundRect(g,left?x+postR*.2:x-padL-postR*.2,top?y+postR*.25:y-padW-postR*.25,padL,padW,3);g.fill();
    g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1;g.stroke();
  });

  // Contorno luminoso final del ring.
  g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1;g.strokeRect(rL,rT,rW,rH);
  g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=2;g.strokeRect(dL,dT,dR-dL,dB-dT);
  return ring;
}

function drawPixelAudienceTo(g){
  F.audience.forEach(a=>{
    const s=a.s,x=a.x,y=a.y;
    g.fillStyle='rgba(12,12,24,.55)';g.fillRect(x-s-1,y+s+1,s*2+2,Math.max(2,Math.round(s*.7)));
    g.fillStyle=a.seat;g.fillRect(x-s,y+s,s*2,s);
    g.fillStyle=a.c;g.fillRect(x-s,y-s,s*2,s*2);
    g.fillStyle='rgba(255,255,255,.24)';g.fillRect(x-s+1,y-s+1,Math.max(1,s-1),Math.max(1,s-1));
    g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x,y,s,Math.max(1,s));
  });
}

function buildArenaCache(){
  const W=cv.width,H=cv.height;
  if(!W||!H||!F)return;
  const c=document.createElement('canvas');
  c.width=W;c.height=H;
  const g=c.getContext('2d');
  drawRingTo(g,W,H);
  drawPixelAudienceTo(g);
  F.arenaCache=c;F.arenaCacheW=W;F.arenaCacheH=H;
}

function drawRing(W,H){
  if(window.EventTournament&&window.EventTournament.isEventFight&&window.EventTournament.isEventFight()&&window.EventRingRenderer){
    window.EventRingRenderer.drawTo(cx,W,H);
    return getRingBounds(W,H);
  }
  if(!F.arenaCache||F.arenaCacheW!==W||F.arenaCacheH!==H)buildArenaCache();
  if(F.arenaCache)cx.drawImage(F.arenaCache,0,0);
  else drawRingTo(cx,W,H);
  return getRingBounds(W,H);
}
function drawAud(){
  // La arena se mantiene sin público alrededor del ring.
}

function drawFighter(f,t){
  if(!f||f.visible===false)return;
  const bob=Math.sin(f.bob)*2.5;
  const x=f.x,y=f.y+bob;

  // Ground shadow
  cx.fillStyle='rgba(0,0,0,.35)';
  cx.beginPath();cx.ellipse(x,y+f.r+2,f.r*.9,3,0,0,6.28);cx.fill();

  // Glow
  cx.fillStyle=f.glowCol;
  cx.beginPath();cx.arc(x,y,f.r+6,0,6.28);cx.fill();

  // Body
  let c=f.col;
  if(f.hurt>0)c='#ffffff';
  if(f.blocking)c=f.isP?'#90caf9':'#ef9a9a';

  cx.beginPath();cx.arc(x,y,f.r,0,6.28);
  cx.fillStyle=c;cx.fill();
  cx.strokeStyle=f.col2;cx.lineWidth=2.5;cx.stroke();

  // Shading (optimizado: overlay plano en vez de gradiente radial por frame)
  cx.fillStyle='rgba(255,255,255,.12)';
  cx.beginPath();cx.arc(x-f.r*.25,y-f.r*.25,f.r*.65,0,6.28);cx.fill();
  cx.fillStyle='rgba(0,0,0,.10)';
  cx.beginPath();cx.arc(x+f.r*.2,y+f.r*.2,f.r*.55,0,6.28);cx.fill();

  // Mask/face band
  cx.fillStyle=f.col2;
  cx.beginPath();cx.arc(x,y,f.r,-.3,Math.PI+.3,true);
  cx.closePath();
  cx.globalAlpha=.15;cx.fill();cx.globalAlpha=1;

  // Eyes
  const eO=f.face*2.5;
  cx.fillStyle='#fff';
  cx.beginPath();cx.arc(x+eO-3,y-2.5,2.8,0,6.28);cx.fill();
  cx.beginPath();cx.arc(x+eO+3,y-2.5,2.8,0,6.28);cx.fill();
  cx.fillStyle='#111';
  cx.beginPath();cx.arc(x+eO-3+f.face*1.2,y-2.5,1.3,0,6.28);cx.fill();
  cx.beginPath();cx.arc(x+eO+3+f.face*1.2,y-2.5,1.3,0,6.28);cx.fill();

  // Eyebrows (angry)
  cx.strokeStyle='#111';cx.lineWidth=1.5;
  cx.beginPath();cx.moveTo(x+eO-5,y-5.5);cx.lineTo(x+eO-1,y-4.5);cx.stroke();
  cx.beginPath();cx.moveTo(x+eO+5,y-5.5);cx.lineTo(x+eO+1,y-4.5);cx.stroke();

  // Mouth
  if(f.stunT>0){
    // Dizzy mouth
    cx.beginPath();cx.arc(x,y+4,2.5,0,6.28);
    cx.strokeStyle='#111';cx.lineWidth=1;cx.stroke();
  }else if(f.st==='attack'||f.dashT>0){
    // Yelling
    cx.fillStyle='#111';
    cx.beginPath();cx.ellipse(x,y+4,3,2,0,0,6.28);cx.fill();
    cx.fillStyle='#c62828';
    cx.beginPath();cx.ellipse(x,y+4.5,2,1,0,0,6.28);cx.fill();
  }else{
    // Determined
    cx.strokeStyle='#111';cx.lineWidth=1.2;
    cx.beginPath();cx.moveTo(x-3,y+4.5);cx.lineTo(x,y+3.5);cx.lineTo(x+3,y+4.5);cx.stroke();
  }

  // Block shield
  if(f.blocking){
    cx.strokeStyle='rgba(64,196,255,.6)';cx.lineWidth=2;
    cx.beginPath();cx.arc(x,y,f.r+4,0,6.28);cx.stroke();
    cx.beginPath();cx.arc(x,y,f.r+7,0,6.28);
    cx.strokeStyle='rgba(64,196,255,.2)';cx.lineWidth=1;cx.stroke();
  }

  // Stun stars
  if(f.stunT>0){
    for(let i=0;i<4;i++){
      const a=t*6+i*1.57;
      const sx=x+Math.cos(a)*16,sy=y-16+Math.sin(a)*5;
      cx.fillStyle='#ffd740';cx.font='bold 9px Arial';cx.textAlign='center';
      cx.fillText('★',sx,sy);
    }
  }

  // HP Bar background
  const bw=38,bh=5;
  const bx=x-bw/2,by=y-f.r-16;
  const pct=Math.max(0,f.hp/f.mhp);

  // HP bar shadow
  cx.fillStyle='rgba(0,0,0,.5)';
  cx.fillRect(bx-1,by-1,bw+2,bh+2);

  // HP bar bg
  cx.fillStyle='#1a1a2a';cx.fillRect(bx,by,bw,bh);

  // HP bar fill
  const hc=pct>.55?'#66bb6a':pct>.25?'#ffa726':'#ef5350';
  cx.fillStyle=hc;cx.fillRect(bx,by,bw*pct,bh);

  // HP bar shine
  cx.fillStyle='rgba(255,255,255,.15)';cx.fillRect(bx,by,bw*pct,bh/2);

  // HP bar border
  cx.strokeStyle='#555';cx.lineWidth=.8;cx.strokeRect(bx,by,bw,bh);

  // Name
  cx.fillStyle=f.isP?'#90caf9':'#ef9a9a';
  cx.font='bold 8px Arial';cx.textAlign='center';
  cx.fillText(f.name,x,by-3);

  // HP text
  cx.fillStyle='#ccc';cx.font='bold 6px Arial';
  cx.fillText(fmtN(Math.ceil(f.hp))+'/'+fmtN(f.mhp),x,by+bh+8);
}

function drawFx(){
  F.fx.forEach(e=>{
    const a=Math.max(0,e.life/e.ml);
    cx.globalAlpha=a;
    if(e.t==='txt'){
      cx.fillStyle=e.color;cx.font='bold '+e.sz+'px Arial';cx.textAlign='center';
      // Shadow
      cx.fillStyle='rgba(0,0,0,.5)';cx.fillText(e.text,e.x+1,e.y+1);
      cx.fillStyle=e.color;cx.fillText(e.text,e.x,e.y);
    }else{
      cx.fillStyle=e.color;
      cx.beginPath();cx.arc(e.x,e.y,e.sz*a,0,6.28);cx.fill();
    }
    cx.globalAlpha=1;
  });
}

function drawTimer(W,H){
  if(!F.on)return;
  const t=Math.max(0,Math.ceil(F.timer));
  // Round indicator
  cx.fillStyle='#888';cx.font='bold '+Math.floor(W*.025)+'px Arial';cx.textAlign='center';
  cx.fillText('ROUND '+F.round,W/2,H*.042);
  cx.fillStyle=t<=5?'#ef5350':'#fff';
  cx.font='bold '+Math.floor(W*.04)+'px Arial';
  cx.fillText('⏱ '+t+'s',W/2,H*.070);
}

function drawRoundIntro(W,H){
  if(F.roundIntroT<=0)return;
  cx.save();
  cx.translate(W/2,H/2);
  cx.fillStyle='rgba(3,3,10,.86)';
  cx.strokeStyle='#ffd740';cx.lineWidth=3;
  roundRect(cx,-110,-42,220,84,12);cx.fill();cx.stroke();
  cx.fillStyle='#ffd740';cx.font='900 30px Arial';cx.textAlign='center';cx.textBaseline='middle';
  cx.fillText(F.roundIntroText,0,-4);
  cx.fillStyle='rgba(255,255,255,.78)';cx.font='bold 11px Arial';
  cx.fillText('Prepárate para luchar',0,24);
  cx.restore();
}
function roundRect(g,x,y,w,h,r){
  g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();
}

function drawCountdown(W,H){
  if(F.countdown<=0)return;
  const n=Math.ceil(F.countdown);
  const scale=1+(1-F.countdown%1)*.3;
  cx.save();
  cx.translate(W/2,H/2);cx.scale(scale,scale);
  cx.fillStyle='rgba(0,0,0,.6)';
  cx.beginPath();cx.arc(0,0,40,0,6.28);cx.fill();
  cx.fillStyle=n<=1?'#69f0ae':'#fff';
  cx.font='bold 36px Arial';cx.textAlign='center';cx.textBaseline='middle';
  cx.fillText(n<=0?'FIGHT!':''+n,0,0);
  cx.restore();
}

// ================ GAME LOOP ================
const FIGHT_SPEED=1.7; // Multiplicador de velocidad de pelea (x1.7)
let lt=performance.now(),gt=0,lastUiUpdate=0;
const FPS={value:60,last:performance.now(),frames:0,acc:0};

function updateFps(now){
  FPS.frames++;
  FPS.acc+=now-FPS.last;
  FPS.last=now;
  if(FPS.acc>=300){
    FPS.value=Math.round(FPS.frames*1000/FPS.acc);
    FPS.frames=0;FPS.acc=0;
  }
}

// ===== FPS OVERLAY HTML (persiste entre pestanas) =====
let _fpsOverlayEl=null;
function ensureFpsOverlay(){
  if(_fpsOverlayEl)return _fpsOverlayEl;
  // Posicion: mismo lugar que el contador canvas original (arriba izquierda del ring)
  const el=document.createElement('div');
  el.id='fpsOverlay';
  el.style.cssText='position:fixed;top:50px;left:4px;z-index:9999;font:bold 10px Arial,sans-serif;padding:2px 7px;border-radius:4px;pointer-events:none;background:rgba(0,0,0,.58);border:1px solid rgba(105,240,174,.7);color:#69f0ae;min-width:46px;text-align:left;letter-spacing:.4px;';
  document.body.appendChild(el);
  _fpsOverlayEl=el;
  return el;
}
function updateFpsOverlay(){
  const el=ensureFpsOverlay();
  const fps=Math.max(0,FPS.value||0);
  el.textContent='FPS '+fps;
  if(fps>=50){el.style.borderColor='rgba(105,240,174,.7)';el.style.color='#69f0ae';}
  else if(fps>=30){el.style.borderColor='rgba(255,215,64,.75)';el.style.color='#ffd740';}
  else{el.style.borderColor='rgba(239,83,80,.75)';el.style.color='#ef5350';}
}
// Mantener drawFpsCounter para compatibilidad (ya no se llama desde el loop)
function drawFpsCounter(W,H){}

function loop(now){
  updateFps(now);
  const rawDt=Math.min(.05,(now-lt)/1000);lt=now;
  // dt para animaciones visuales y efectos (sin escalar)
  const dt=rawDt;
  // sdt escala la simulacion de pelea x1.7 para mayor velocidad
  const sdt=rawDt*FIGHT_SPEED;
  gt+=dt;
  const W=cv.width,H=cv.height;
  if(!W||!H){requestAnimationFrame(loop);return;}

  // Shake
  let sx=0,sy=0;
  if(F.shake>0){F.shake-=sdt;sx=(Math.random()-.5)*10;sy=(Math.random()-.5)*10;}

  cx.save();cx.translate(sx,sy);

  // Draw cached static empty arena
  drawRing(W,H);
  drawAud();

  if(F.on&&F.p1&&F.p2){
    const fightActive=isFightSystemVisible();
    // Presentacion entre rounds
    if(F.roundIntroT>0){
      if(fightActive)F.roundIntroT-=sdt;
      drawFighter(F.p1,gt);drawFighter(F.p2,gt);
      drawRoundIntro(W,H);
    }else if(F.countdown>0){
      if(fightActive)F.countdown-=sdt;
      drawFighter(F.p1,gt);drawFighter(F.p2,gt);
      drawCountdown(W,H);
    }else{
      if(F.paused||!fightActive){
        drawFighter(F.p1,gt);drawFighter(F.p2,gt);
        drawTimer(W,H);
      }else{
      // Update
      updFighter(F.p1,F.p2,sdt);
      updFighter(F.p2,F.p1,sdt);
      F.timer-=sdt;

      // Push apart if overlapping
      const dx=F.p2.x-F.p1.x,dy=F.p2.y-F.p1.y;
      const d=Math.sqrt(dx*dx+dy*dy)||1;
      const minD=(F.p1.r+F.p2.r)*1.1;
      if(d<minD&&F.p1.stunT<=0&&F.p2.stunT<=0){
        const push=(minD-d)/2;
        F.p1.x-=dx/d*push;F.p1.y-=dy/d*push;
        F.p2.x+=dx/d*push;F.p2.y+=dy/d*push;
      }

      drawFighter(F.p1,gt);drawFighter(F.p2,gt);
      drawTimer(W,H);

      // KO check
      if(!F.paused&&(F.p1.hp<=0||F.p2.hp<=0)){
        endRound(F.p1.hp>0);
      }else if(!F.paused&&F.timer<=0){
        extendRoundTimer();
      }
      }
    }
    if(now-lastUiUpdate>250){updUI();lastUiUpdate=now;}
  }else if(!F.on&&!$('resOv').classList.contains('show')){
    cx.fillStyle='rgba(255,255,255,.12)';
    cx.font='bold '+Math.floor(W*.04)+'px Arial';cx.textAlign='center';
    cx.fillText('⬆️ TOCA PARA BUSCAR RIVAL ⬆️',W/2,H/2-8);
    cx.font=Math.floor(W*.025)+'px Arial';cx.fillStyle='rgba(255,255,255,.08)';
    cx.fillText('Mejora tus stats abajo',W/2,H/2+12);
  }

  updFx(sdt);drawFx();
  cx.restore();
  updateFpsOverlay();
  requestAnimationFrame(loop);
}

function extendRoundTimer(){
  if(!F.on||F.paused||F.roundEnding)return;
  F.timer+=30;
  spawnFx(cv.width/2,cv.height*.22,'+30s TIEMPO EXTRA','#ffd740',20);
  addLog('⏱ Tiempo extra: +30s hasta que haya KO','h');
  saveGameNow();
}

function endRound(p1Won){
  if(F.paused||F.roundEnding||!F.on)return;
  F.paused=true;
  F.roundEnding=true;
  const loser=p1Won?F.p2:F.p1;
  const isKo=F.p1.hp<=0||F.p2.hp<=0;
  if(isKo&&loser)spawnKoExplosion(loser);
  if(p1Won){
    F.roundWins[0]++;
    addLog('✅ ¡Ganaste el round '+F.round+'!','w');
    spawnFx(cv.width/2,cv.height*.4,'¡ROUND GANADO!','#69f0ae',20);
    F.audience.forEach(a=>a.ch=1);
  }else{
    F.roundWins[1]++;
    addLog('❌ Perdiste el round '+F.round,'l');
    spawnFx(cv.width/2,cv.height*.4,'ROUND PERDIDO','#ef5350',20);
  }
  saveGameNow();
  if(F.round>=MAX_ROUNDS){
    const playerWonFight=F.roundWins[0]>F.roundWins[1];
    setTimeout(()=>endFight(playerWonFight),1700);
  }else{
    setTimeout(startNextRound,1700);
  }
}

function startNextRound(){
  if(!F.on)return;
  F.round++;
  F.timer=30;
  F.paused=false;
  F.roundEnding=false;
  F.countdown=3;
  F.roundIntroT=1.6;
  F.roundIntroText=F.round+'º Round';
  resetRoundFighters();
  updUI();
  addLog('🔔 '+F.roundIntroText+' — cuenta atrás','h');
  saveGameNow();
}

function resetRoundFighters(){
  const W=cv.width,H=cv.height,cX=W/2,cY=H/2;
  [F.p1,F.p2].forEach((f,i)=>{
    if(!f)return;
    f.x=cX+(i===0?-55:55);f.y=cY;f.vx=0;f.vy=0;f.hp=f.mhp;
    f.st='idle';f.stT=0;f.atkCD=0;f.face=i===0?1:-1;f.stunT=0;f.kbx=0;f.kby=0;
    f.hurt=0;f.dashT=0;f.blocking=false;f.blockT=0;f.visible=true;
  });
}

function updateArenaStreak(won){
  ensureArena(ST.arena);
  if(ST.arenaUnlocked[ST.arena])return;
  const cur=ST.arenaStreaks[ST.arena]||0;
  ST.arenaStreaks[ST.arena]=won?Math.min(ARENA_STREAK_TARGET,cur+1):Math.max(0,cur-1);
  if(ST.arenaStreaks[ST.arena]>=ARENA_STREAK_TARGET){
    ST.arenaStreaks[ST.arena]=ARENA_STREAK_TARGET;
    ST.arenaUnlocked[ST.arena]=true;
  }
}

function endFight(won){
  if(F.resultSettled)return;
  F.resultSettled=true;
  F.on=false;
  ST.fights++;
  if(window.EventTournament&&window.EventTournament.isEventFight&&window.EventTournament.isEventFight()){
    window.EventTournament.handleFightEnd(!!won);
    updUI();
    saveGameNow();
    return;
  }
  const ov=$('resOv'),rt=$('resT'),rr=$('resR'),rs=$('resS');
  // Recompensa escalada según el poder del rival (rivales más fuertes dan más oro).
  // Se calcula UNA vez y se usa el MISMO valor para mostrar y para sumar.
  const enPow=F.currentEnemyPow!=null?F.currentEnemyPow:1;
  const baseReward=won?Math.round(4+enPow*0.6):Math.round(1+enPow*0.15);
  const reward=Math.max(1,Math.round(baseReward*(ST.goldMult||1)));
  ST.gold+=reward;
  updateArenaStreak(won);
  if(won){
    ST.wins++;ST.streak++;
    rt.textContent='🏆 ¡VICTORIA!';rt.style.color='#69f0ae';
    rr.textContent='💰 +'+fmtN(reward);
    rs.textContent='Rachas: '+arenaStreak()+'/'+ARENA_STREAK_TARGET;
    addLog('🏆 VICTORIA +'+fmtN(reward)+' oro','w');
    F.audience.forEach(a=>a.ch=2);
  }else{
    ST.streak=0;
    rt.textContent='💀 DERROTA';rt.style.color='#ef5350';
    rr.textContent='💰 +'+fmtN(reward);
    rs.textContent='Rachas: '+arenaStreak()+'/'+ARENA_STREAK_TARGET;
    addLog('💀 Derrota +'+fmtN(reward)+' oro','l');
  }
  // Reseteamos el rival actual para que Poder Enemigo vuelva a "--" hasta el próximo matchmaking
  F.currentEnemyPow=null;
  F.currentPlayerPow=null;
  ov.classList.add('show');
  // Inicia la barra de 7s bajo "SIGUIENTE PELEA" y busca al nuevo rival automáticamente.
  startResultCountdown();
  updUI();
  saveGameNow();
}

// ================ EVENTS ================
cv.addEventListener('click',()=>{
  if(isFightSystemVisible()&&!F.on&&!F.searching&&!F.vsReady&&!$('resOv').classList.contains('show')){
    startMatchmaking();
  }
});
cv.addEventListener('touchstart',e=>{e.preventDefault();},{passive:false});
$('resB').addEventListener('click',()=>{
  // El usuario adelanta manualmente: cancelar el auto-temporizador y la barra.
  if(F.resTimer){clearTimeout(F.resTimer);F.resTimer=null;}
  stopCdBar('resCd');
  $('resOv').classList.remove('show');
  F.currentEnemyPow=null;
  F.currentPlayerPow=null;
  updUI();
  saveGameNow();
  if(isFightSystemVisible())setTimeout(startMatchmaking,200);
});
// Botón "¡PELEAR!" del VS screen
$('arenaPrev').addEventListener('click',()=>{
  if(F.on||F.searching||ST.arena<=0)return;
  ST.arena--;
  resetEncounterForArenaChange();
  updUI();
  saveGameNow();
});
$('arenaNext').addEventListener('click',()=>{
  ensureArena(ST.arena);
  if(F.on||F.searching||!ST.arenaUnlocked[ST.arena])return;
  ST.arena++;
  ST.goldMult=(ST.goldMult||1)*randomFloat(1.25,1.50);
  ensureArena(ST.arena);
  resetEncounterForArenaChange();
  updUI();
  saveGameNow();
  if(isFightSystemVisible())setTimeout(startMatchmaking,200);
});
$('vsGo').addEventListener('click',()=>{
  // El usuario adelanta manualmente: cancelar el auto-temporizador y la barra.
  if(F.vsTimer){clearTimeout(F.vsTimer);F.vsTimer=null;}
  stopCdBar('vsCd');
  if(F.vsReady)startFight();
});

// ================ SAVE BRIDGE ================
function saveGameNow(){
  if(window.GuardarPartida)window.GuardarPartida.save(ST,F);
}
function saveGameImmediately(){
  if(window.GuardarPartida)window.GuardarPartida.saveNow(ST,F);
}
function loadSavedGame(){
  if(window.GuardarPartida)window.GuardarPartida.load(ST,F);
}
function restoreSavedVisualState(){
  if(F.vsReady&&F.pendingEnemy){
    const p1=F.pendingEnemy.p1,p2=F.pendingEnemy.p2;
    $('vsEName').textContent=F.enemyName||'RIVAL';
    $('vsPowP').textContent=fmtN(F.currentPlayerPow!=null?F.currentPlayerPow:playerPowerFromStats());
    $('vsPowE').textContent=fmtN(F.currentEnemyPow!=null?F.currentEnemyPow:0);
    renderEnemyStats((p2&&p2.statPoints)||{});
    if(p1)drawSpriteSnapshot($('spP').getContext('2d'),p1);
    if(p2)drawSpriteSnapshot($('spE').getContext('2d'),p2);
    $('vsOv').classList.add('show');
    startVsCountdown();
  }
}
function resumeSavedTransition(){
  restoreSavedVisualState();
  if(!F.on||!F.roundEnding)return;
  F.paused=true;
  if(F.round>=MAX_ROUNDS){
    const playerWonFight=F.roundWins[0]>F.roundWins[1];
    setTimeout(()=>endFight(playerWonFight),1200);
  }else{
    setTimeout(startNextRound,1200);
  }
}

// ================ INIT ================
loadSavedGame();
window.ST=ST;window.F=F;window.switchTab=switchTab;window.syncFightVisibility=syncFightVisibility;
window.addEventListener('pagehide',saveGameImmediately);
window.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveGameImmediately();});
setInterval(saveGameNow,5000);
resumeSavedTransition();
updUI();
saveGameNow();
requestAnimationFrame(loop);

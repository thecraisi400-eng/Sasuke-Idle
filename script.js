// ================ GAME STATE ================
const ST={
  gold:0,diamonds:0,
  s:{atk:1,def:1,hp:1,spd:1,eva:1,crit:1},
  wins:0,fights:0,streak:0,
  arena:0,arenaStreaks:[0],arenaUnlocked:[false],arenaPowerMults:[1],
  upgCosts:{atk:10,def:10,hp:10,spd:10,eva:10,crit:10},
  goldMult:1
};
const FIRST_ARENA_POWER_RANGE={min:1,max:5};
const SECOND_ARENA_POWER_RANGE={min:5,max:10};
const ARENA_POWER_STEP=10;
const MAX_ROUNDS=3;
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
  const min=ARENA_POWER_STEP*(arenaIndex-1);
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
document.querySelectorAll('.menu-btn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.menu-btn').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  $('s-'+b.dataset.t).classList.add('active');
  if(b.dataset.t==='fight')rszCv();
}));

// Upgrades
document.querySelectorAll('.upg-card').forEach(b=>b.addEventListener('click',()=>{
  const k=b.dataset.u,c=upgCost(k);
  if(!isStatMaxed(k)&&ST.gold>=c){ST.gold-=c;ST.s[k]++;advanceUpgradeCost(k,c);updUI();}
}));

function updUI(){
  ensureArena(ST.arena);
  $('xGold').textContent=fmtN(ST.gold);
  $('xDiam').textContent=fmtN(ST.diamonds);
  $('xWin').textContent=fmtN(F.currentPlayerPow!=null?F.currentPlayerPow:playerPowerFromStats());
  $('xPow').textContent=F.currentEnemyPow!=null?fmtN(F.currentEnemyPow):'--';
  $('xRound').textContent=F.roundWins[0]+'/'+F.roundWins[1];
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
  if(!F.audience.length)F.audience=genAudience();
}
window.addEventListener('resize',rszCv);
setTimeout(rszCv,60);

// ================ FIGHT STATE ================
const F={
  on:false,round:1,timer:0,
  p1:null,p2:null,
  fx:[],shake:0,
  audience:[],
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
  roundIntroText:''
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
    combo:0,
    bob:Math.random()*6.28,
    hurt:0,
    dashT:0,dashDx:0,dashDy:0,
    strafeD:1,
    lastMv:null,
    blocking:false,blockT:0
  };
}

function genAudience(){
  const W=cv.width,H=cv.height;if(!W)return[];
  const a=[],cols=['#e53935','#1e88e5','#43a047','#fdd835','#8e24aa','#fb8c00','#00acc1','#e91e63','#7c4dff','#ff6e40','#26c6da','#d4e157'];
  const ringL=W*.12,ringR=W*.88,ringT=H*.15,ringB=H*.85;
  // Left stands
  for(let i=0;i<10;i++){
    const row=Math.floor(i/2);
    a.push({x:ringL-12-row*9+Math.random()*3,y:ringT+10+i*((ringB-ringT-20)/10)+Math.random()*5,
      c:cols[i%cols.length],b:Math.random()*6.28,ch:0,sz:3+Math.random()});
  }
  // Right stands
  for(let i=0;i<10;i++){
    const row=Math.floor(i/2);
    a.push({x:ringR+12+row*9+Math.random()*3,y:ringT+10+i*((ringB-ringT-20)/10)+Math.random()*5,
      c:cols[(i+5)%cols.length],b:Math.random()*6.28,ch:0,sz:3+Math.random()});
  }
  // Top stands (2 rows)
  for(let r=0;r<2;r++){
    for(let i=0;i<12;i++){
      a.push({x:ringL+10+i*((ringR-ringL-20)/12)+Math.random()*4,y:ringT-14-r*11+Math.random()*3,
        c:cols[(i+r*3)%cols.length],b:Math.random()*6.28,ch:0,sz:3+Math.random()});
    }
  }
  // Bottom stands
  for(let i=0;i<10;i++){
    a.push({x:ringL+15+i*((ringR-ringL-30)/10)+Math.random()*4,y:ringB+14+Math.random()*3,
      c:cols[(i+2)%cols.length],b:Math.random()*6.28,ch:0,sz:3+Math.random()});
  }
  return a;
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
  if(F.vsTimer)clearTimeout(F.vsTimer);
  runCdBar('vsCd',VS_AUTO_START_MS);
  F.vsTimer=setTimeout(()=>{
    F.vsTimer=null;
    if(F.vsReady)startFight();
  },VS_AUTO_START_MS);
}

// Tras el resultado (VICTORIA/DERROTA): barra de 7s bajo "SIGUIENTE PELEA" -> busca nuevo rival.
function startResultCountdown(){
  if(F.resTimer)clearTimeout(F.resTimer);
  runCdBar('resCd',RESULT_AUTO_NEXT_MS);
  F.resTimer=setTimeout(()=>{
    F.resTimer=null;
    if($('resOv').classList.contains('show')){
      $('resOv').classList.remove('show');
      F.currentEnemyPow=null;
      F.currentPlayerPow=null;
      updUI();
      startMatchmaking();
    }
  },RESULT_AUTO_NEXT_MS);
}

// ====== MATCHMAKING ======
function startMatchmaking(){
  if(F.on||F.searching||F.vsReady)return;
  if($('resOv').classList.contains('show'))return;
  F.searching=true;
  F.pendingEnemy=null;
  F.roundWins=[0,0];
  F.currentPlayerPow=playerPowerFromStats();
  F.currentEnemyPow=null;
  updUI();
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
  const dotsInt=setInterval(()=>{
    dots=(dots%3)+1;
    dotsEl.textContent='.'.repeat(dots);
  },220);
  const stageInt=setInterval(()=>{
    stageIdx=Math.min(stages.length-1,stageIdx+1);
    statusEl.textContent=stages[stageIdx];
  },550);
  // Tras ~2.6 s, mostrar VS
  setTimeout(()=>{
    clearInterval(dotsInt);
    clearInterval(stageInt);
    $('mmOv').classList.remove('show');
    F.searching=false;
    showVS();
  },2600);
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
  F.on=true;F.round=1;F.timer=30;F.fx=[];F.shake=0;F.resultSettled=false;
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
  addLog('🔔 Round 1 de '+MAX_ROUNDS+' — ¡FIGHT!','h');
}

// ================ AI / PHYSICS ================
function updFighter(f,en,dt){
  const W=cv.width,H=cv.height;
  const rL=W*.12+22,rR=W*.88-22,rT=H*.15+22,rB=H*.85-22;

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
    spawnFx(def.x,def.y-22,'🛡️ BLOCK -'+fmtN(blocked),'#40c4ff',14);
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
  atk.combo++;

  // Knockback
  const kbF=mv.kb*(isCrit?1.8:1);
  def.stunT=mv.stun*(isCrit?1.5:1);
  def.kbx=(dx/d)*kbF;def.kby=(dy/d)*kbF;

  F.shake=isCrit?.22:.1;

  // VFX
  const ix=(atk.x+def.x)/2,iy=(atk.y+def.y)/2;
  const col=isCrit?'#ffd740':'#ef5350';
  const txt=isCrit?`💥CRIT! -${dmg}`:`${mv.icon}-${dmg}`;
  spawnFx(ix,iy-12,txt,col,isCrit?20:15);
  spawnSparks(ix,iy,isCrit?10:4,isCrit?'#ffd740':'#ff6d00');
  if(isCrit){
    spawnFx(ix,iy-30,'¡¡'+mv.name.toUpperCase()+'!!','#fff',12);
    F.audience.forEach(a=>a.ch=.6+Math.random()*.3);
  }

  // Combo bonus text
  if(atk.combo>=3&&atk.combo%2===1){
    spawnFx(atk.x,atk.y-30,'COMBO x'+atk.combo+'!','#aa00ff',13);
  }

  const lt=isCrit?'cr':'h';
  addLog(`${atk.name} ${mv.icon}${mv.name}${isCrit?' ¡CRIT!':''} → -${fmtN(dmg)} ${def.name} [${fmtN(Math.ceil(def.hp))}/${fmtN(def.mhp)}]`,lt);
}

// ================ EFFECTS ================
function spawnFx(x,y,text,color,sz){
  F.fx.push({t:'txt',x,y,text,color,sz,life:1.2,ml:1.2,vy:-35});
}
function spawnSparks(x,y,n,c){
  for(let i=0;i<n;i++){
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

function updFx(dt){
  for(let i=F.fx.length-1;i>=0;i--){
    const e=F.fx[i];e.life-=dt;
    if(e.t==='txt'){e.y+=e.vy*dt;e.vy*=.94;}
    else{e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=250*dt;}
    if(e.life<=0)F.fx.splice(i,1);
  }
}

// ================ RENDER ================
function drawRing(W,H){
  const rL=W*.12,rR=W*.88,rT=H*.15,rB=H*.85;
  const rW=rR-rL,rH=rB-rT;

  // Background arena
  cx.fillStyle='#07070f';cx.fillRect(0,0,W,H);

  // Spotlights
  const g1=cx.createRadialGradient(W*.3,H*.3,5,W*.3,H*.3,W*.4);
  g1.addColorStop(0,'rgba(255,200,100,.04)');g1.addColorStop(1,'transparent');
  cx.fillStyle=g1;cx.fillRect(0,0,W,H);
  const g2=cx.createRadialGradient(W*.7,H*.3,5,W*.7,H*.3,W*.4);
  g2.addColorStop(0,'rgba(100,180,255,.03)');g2.addColorStop(1,'transparent');
  cx.fillStyle=g2;cx.fillRect(0,0,W,H);

  // Ring apron (outer border — raised platform effect)
  cx.fillStyle='#1a1a30';
  cx.fillRect(rL-6,rT-6,rW+12,rH+12);
  cx.strokeStyle='#333';cx.lineWidth=1;
  cx.strokeRect(rL-6,rT-6,rW+12,rH+12);

  // Ring mat
  const mg=cx.createRadialGradient(W/2,(rT+rB)/2,10,W/2,(rT+rB)/2,rW*.6);
  mg.addColorStop(0,'#1c3050');mg.addColorStop(.6,'#162848');mg.addColorStop(1,'#0f1e38');
  cx.fillStyle=mg;cx.fillRect(rL,rT,rW,rH);

  // Mat lines
  cx.strokeStyle='rgba(255,255,255,.04)';cx.lineWidth=1;
  cx.beginPath();cx.moveTo(W/2,rT);cx.lineTo(W/2,rB);cx.stroke();
  cx.beginPath();cx.moveTo(rL,(rT+rB)/2);cx.lineTo(rR,(rT+rB)/2);cx.stroke();

  // Center circle
  cx.strokeStyle='rgba(255,255,255,.05)';cx.lineWidth=1.5;
  cx.beginPath();cx.arc(W/2,(rT+rB)/2,Math.min(rW,rH)*.28,0,6.28);cx.stroke();

  // Center logo
  cx.globalAlpha=.06;cx.fillStyle='#ff6d00';
  cx.font='bold '+Math.floor(W*.1)+'px Arial';cx.textAlign='center';cx.textBaseline='middle';
  cx.fillText('WLI',W/2,(rT+rB)/2);cx.globalAlpha=1;

  // Ropes (3 on each side)
  const ropeC=['#d32f2f','#eeeeee','#1565c0'];
  for(let i=0;i<3;i++){
    cx.strokeStyle=ropeC[i];cx.lineWidth=2;cx.globalAlpha=.85;
    const off=6+i*7;
    // Horizontal
    cx.beginPath();cx.moveTo(rL,rT+off);cx.lineTo(rR,rT+off);cx.stroke();
    cx.beginPath();cx.moveTo(rL,rB-off);cx.lineTo(rR,rB-off);cx.stroke();
    // Vertical
    cx.beginPath();cx.moveTo(rL+off,rT);cx.lineTo(rL+off,rB);cx.stroke();
    cx.beginPath();cx.moveTo(rR-off,rT);cx.lineTo(rR-off,rB);cx.stroke();
    cx.globalAlpha=1;
  }

  // Turnbuckles / corner posts
  [[rL,rT],[rR,rT],[rL,rB],[rR,rB]].forEach(([px,py])=>{
    // Post
    cx.fillStyle='#555';cx.fillRect(px-4,py-4,8,8);
    cx.fillStyle='#888';cx.fillRect(px-3,py-3,6,6);
    // Pad
    cx.fillStyle='#d32f2f';
    cx.beginPath();cx.arc(px,py,5,0,6.28);cx.fill();
    cx.strokeStyle='#b71c1c';cx.lineWidth=1;
    cx.beginPath();cx.arc(px,py,5,0,6.28);cx.stroke();
  });

  // Outer glow
  cx.strokeStyle='rgba(230,81,0,.2)';cx.lineWidth=2;
  cx.strokeRect(rL,rT,rW,rH);

  return{l:rL,r:rR,t:rT,b:rB};
}

function drawAud(t){
  F.audience.forEach(a=>{
    a.b+=.025+Math.random()*.005;
    if(a.ch>0)a.ch-=.02;
    const by=Math.sin(a.b)*1.5+(a.ch>0?Math.sin(t*14)*3.5:0);
    const x=a.x,y=a.y+by,s=a.sz;

    // Seat
    cx.fillStyle='rgba(50,50,80,.4)';
    cx.fillRect(x-s-1,y+s+1,s*2+2,s);

    // Body
    cx.fillStyle=a.c;
    cx.fillRect(x-s*.7,y+1,s*1.4,s*1.6);

    // Head
    cx.fillStyle='#e8b89d';
    cx.beginPath();cx.arc(x,y-s*.2,s*.7,0,6.28);cx.fill();

    // Hair
    cx.fillStyle=a.c;
    cx.beginPath();cx.arc(x,y-s*.5,s*.5,Math.PI,0);cx.fill();

    // Eyes
    cx.fillStyle='#222';
    cx.fillRect(x-s*.3,y-s*.2,1,1);
    cx.fillRect(x+s*.15,y-s*.2,1,1);

    // Arms up if cheering
    if(a.ch>0){
      cx.strokeStyle=a.c;cx.lineWidth=1.5;
      cx.beginPath();cx.moveTo(x-s*.7,y+s*.3);cx.lineTo(x-s*1.5,y-s*1.2);cx.stroke();
      cx.beginPath();cx.moveTo(x+s*.7,y+s*.3);cx.lineTo(x+s*1.5,y-s*1.2);cx.stroke();
    }
  });
}

function drawFighter(f,t){
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

  // Shading
  const sg=cx.createRadialGradient(x-f.r*.25,y-f.r*.25,1,x,y,f.r);
  sg.addColorStop(0,'rgba(255,255,255,.22)');sg.addColorStop(1,'rgba(0,0,0,.15)');
  cx.fillStyle=sg;cx.beginPath();cx.arc(x,y,f.r,0,6.28);cx.fill();

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
  cx.fillStyle=t<=5?'#ef5350':'#fff';
  cx.font='bold '+Math.floor(W*.04)+'px Arial';cx.textAlign='center';
  cx.fillText('⏱ '+t+'s',W/2,H*.095);
  // Round indicator
  cx.fillStyle='#888';cx.font='bold '+Math.floor(W*.025)+'px Arial';
  cx.fillText('ROUND '+F.round,W/2,H*.049);
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
let lt=performance.now(),gt=0;

function loop(now){
  const dt=Math.min(.05,(now-lt)/1000);lt=now;gt+=dt;
  const W=cv.width,H=cv.height;
  if(!W||!H){requestAnimationFrame(loop);return;}

  // Shake
  let sx=0,sy=0;
  if(F.shake>0){F.shake-=dt;sx=(Math.random()-.5)*10;sy=(Math.random()-.5)*10;}

  cx.save();cx.translate(sx,sy);

  // Draw ring & audience
  drawRing(W,H);
  drawAud(gt);

  if(F.on&&F.p1&&F.p2){
    // Presentación entre rounds
    if(F.roundIntroT>0){
      F.roundIntroT-=dt;
      drawFighter(F.p1,gt);drawFighter(F.p2,gt);
      drawRoundIntro(W,H);
    }else if(F.countdown>0){
      F.countdown-=dt;
      drawFighter(F.p1,gt);drawFighter(F.p2,gt);
      drawCountdown(W,H);
    }else{
      // Update
      updFighter(F.p1,F.p2,dt);
      updFighter(F.p2,F.p1,dt);
      F.timer-=dt;

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
        endRound(F.p1.hp>=F.p2.hp);
      }
    }
    updUI();
  }else if(!F.on&&!$('resOv').classList.contains('show')){
    cx.fillStyle='rgba(255,255,255,.12)';
    cx.font='bold '+Math.floor(W*.04)+'px Arial';cx.textAlign='center';
    cx.fillText('⬆️ TOCA PARA BUSCAR RIVAL ⬆️',W/2,H/2-8);
    cx.font=Math.floor(W*.025)+'px Arial';cx.fillStyle='rgba(255,255,255,.08)';
    cx.fillText('Mejora tus stats abajo',W/2,H/2+12);
  }

  updFx(dt);drawFx();
  cx.restore();
  requestAnimationFrame(loop);
}

function endRound(p1Won){
  if(F.paused||!F.on)return;
  F.paused=true;
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
  if(F.round>=MAX_ROUNDS){
    const playerWonFight=F.roundWins[0]>F.roundWins[1];
    setTimeout(()=>endFight(playerWonFight),900);
  }else{
    setTimeout(startNextRound,900);
  }
}

function startNextRound(){
  if(!F.on)return;
  F.round++;
  F.timer=30;
  F.paused=false;
  F.countdown=3;
  F.roundIntroT=1.6;
  F.roundIntroText=F.round===2?'2do Round':'3er Round';
  resetRoundFighters();
  updUI();
  addLog('🔔 '+F.roundIntroText+' — cuenta atrás','h');
}

function resetRoundFighters(){
  const W=cv.width,H=cv.height,cX=W/2,cY=H/2;
  [F.p1,F.p2].forEach((f,i)=>{
    if(!f)return;
    f.x=cX+(i===0?-55:55);f.y=cY;f.vx=0;f.vy=0;f.hp=f.mhp;
    f.st='idle';f.stT=0;f.atkCD=0;f.face=i===0?1:-1;f.stunT=0;f.kbx=0;f.kby=0;
    f.combo=0;f.hurt=0;f.dashT=0;f.blocking=false;f.blockT=0;
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
}

// ================ EVENTS ================
cv.addEventListener('click',()=>{
  if(!F.on&&!F.searching&&!F.vsReady&&!$('resOv').classList.contains('show')){
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
  setTimeout(startMatchmaking,200);
});
// Botón "¡PELEAR!" del VS screen
$('arenaPrev').addEventListener('click',()=>{
  if(F.on||F.searching||ST.arena<=0)return;
  ST.arena--;
  resetEncounterForArenaChange();
  updUI();
});
$('arenaNext').addEventListener('click',()=>{
  ensureArena(ST.arena);
  if(F.on||F.searching||!ST.arenaUnlocked[ST.arena])return;
  ST.arena++;
  ST.goldMult=(ST.goldMult||1)*randomFloat(1.25,1.50);
  ensureArena(ST.arena);
  resetEncounterForArenaChange();
  updUI();
  setTimeout(startMatchmaking,200);
});
$('vsGo').addEventListener('click',()=>{
  // El usuario adelanta manualmente: cancelar el auto-temporizador y la barra.
  if(F.vsTimer){clearTimeout(F.vsTimer);F.vsTimer=null;}
  stopCdBar('vsCd');
  if(F.vsReady)startFight();
});

// ================ INIT ================
updUI();
requestAnimationFrame(loop);

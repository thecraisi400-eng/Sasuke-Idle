(()=>{
/* ============================================================
   LUCHA: panel de ring integrado al Coliseo del juego actual
   ============================================================ */
const { coliseoPanel, luchaPanel, luchaBtn, statsGrid, toast } = window.GymHero;
const luchaStatsPanel = document.getElementById('lucha-stats-panel');

const STAT_DEFS = [
  {key:'ATAQUE', out:'ataque', label:'ATAQUE', icon:'⚔️'},
  {key:'DEFENSA', out:'defensa', label:'DEFENSA', icon:'🛡️'},
  {key:'HP', out:'hp', label:'HP', icon:'❤️'},
  {key:'VELOCIDAD', out:'velocidad', label:'VELOCIDAD', icon:'⚡'},
  {key:'CRITICO', out:'critico', label:'CRÍTICO', icon:'💥'},
  {key:'EVASION', out:'evasion', label:'EVASIÓN', icon:'💨'}
];
const NAME_POOL = ['Viper Cruz','El Martillo','Trueno Rojo','Sombra Negra','El Tanque','Furia Salvaje','Relámpago','El Demoledor','Ciclón Gómez','Vendetta','Kraken','El Huracán','Nitro Vega','Pantera Gris','El Titán','Bestia Roca','Doble Filo','El Castigador','Zarpazo','Rey Caos','El Verdugo','Onda Letal','Diablo Rojo','El Implacable'];
const COLOR_SCHEMES = [
  {head:'#e74c3c', limb:'#c0392b', stroke:'#5c1c14', accent:'#ffd1cc'},
  {head:'#3498db', limb:'#2e6da4', stroke:'#16324a', accent:'#d6ecff'},
  {head:'#9b59b6', limb:'#7d3c98', stroke:'#3a1b44', accent:'#ecd6ff'},
  {head:'#27ae60', limb:'#1e8449', stroke:'#0f3d22', accent:'#d6ffe4'},
  {head:'#f39c12', limb:'#c87f0a', stroke:'#5c3a06', accent:'#ffeccb'},
  {head:'#e84393', limb:'#c2356f', stroke:'#5c1a36', accent:'#ffd6e9'},
  {head:'#1abc9c', limb:'#148f76', stroke:'#0a3d33', accent:'#d2fff5'},
  {head:'#34495e', limb:'#22313f', stroke:'#0d1418', accent:'#cfd8e2'}
];
const ACCESSORIES = ['none','headband','sunglasses','mohawk','cape'];
const PLAYER_COLORS = {head:'#2255aa', limb:'#1a3d80', stroke:'#1a1a3a', accent:'#ffffff'};
const SEARCH_MESSAGES = ['Conectando al servidor...','Analizando nivel de combate...','Sincronizando datos del ring...','Buscando boxeador disponible...','Verificando estadísticas...','Emparejando nivel de fuerza...'];
const SEARCH_MODES = ['Clasificado','Amistoso','Torneo'];
const RANK_TAGS = ['Retador Novato','Peso Pesado','Clase A','Veterano del Ring','Relámpago','Indomable','Clase Élite','Guerrero Callejero'];
const STATE = { IDLE:'idle', SEARCHING:'searching', FOUND:'found', COUNTDOWN:'countdown', FIGHTING:'fighting', RESULT:'result' };
let state = STATE.IDLE;
let matEl, ringWrap, overlay, timerDisplay, goldDisplay, statsYouEl, statsCpuEl, youPowerEl, cpuPowerEl;
let player = null, enemy = null, rafId = null, fightTimerInterval = null, fightSecondsLeft = 45, lastFrameTs = 0;
let searchTimeoutId = null, searchTextInt = null, searchBlipInt = null, searchPingInt = null, lastName = null, lastSpecialAction = 0;
let matBoundsCache = { w:270, h:270, fw:48, fh:90 };

function rand(min,max){ return Math.random()*(max-min)+min; }
function randInt(min,max){ return Math.floor(rand(min,max+1)); }
function pick(arr){ return arr[randInt(0,arr.length-1)]; }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function statLevels(){
  const src = window.GymHero.getStatsSnapshot();
  const out = {};
  STAT_DEFS.forEach(d=> out[d.out] = Math.max(1, src[d.key].level));
  return out;
}
function levelSum(levels){ return Object.values(levels).reduce((a,b)=>a+b,0); }
function combatStats(levels){ return { maxHp:60+levels.hp*16, atk:9+levels.ataque*3.2, def:levels.defensa*2.1, critChance:5+levels.critico*4.5, evasion:levels.evasion*3, speed:80+levels.velocidad*20 }; }
function randomComposition(total, parts){ const cuts=[]; for(let i=0;i<parts-1;i++) cuts.push(randInt(0,total)); cuts.sort((a,b)=>a-b); const out=[]; let prev=0; cuts.forEach(c=>{out.push(c-prev); prev=c;}); out.push(total-prev); return out; }
function pickName(){ let n=pick(NAME_POOL), tries=0; while(n===lastName && tries<6){ n=pick(NAME_POOL); tries++; } lastName=n; return n; }
function spriteInnerSVG(colors, accessory){
  const torsoColor=colors.head, gloveColor=colors.limb, shortsColor=colors.stroke, accentColor=colors.accent, skin='#e0b090';
  let acc='';
  if(accessory==='headband') acc='<rect x="18.1" y="39.5" width="13.9" height="2.6" rx="1.3" fill="'+accentColor+'"/>';
  else if(accessory==='sunglasses') acc='<rect x="20.1" y="42.3" width="4.4" height="3.1" rx="0.9" fill="#111"/><rect x="27.2" y="42.3" width="4.4" height="3.1" rx="0.9" fill="#111"/><line x1="24.5" y1="43.7" x2="27.2" y2="43.7" stroke="#111" stroke-width="1"/>';
  else if(accessory==='mohawk') acc='<path d="M22.3 36.2 L25 28.5 L27.8 36.2 Z" fill="'+accentColor+'"/>';
  else if(accessory==='cape') acc='<path d="M15.1 47.2 L34.9 47.2 L29.4 80.2 L20.6 80.2 Z" fill="'+accentColor+'" opacity="0.55"/>';
  return '<g class="lucha-leg-left lucha-limb"><rect x="19.3" y="66.6" width="5.7" height="11.4" rx="1.4" fill="'+shortsColor+'"/></g><g class="lucha-leg-right lucha-limb"><rect x="25" y="66.6" width="5.7" height="11.4" rx="1.4" fill="'+shortsColor+'"/></g>'+(accessory==='cape'?acc:'')+'<g class="lucha-arm-left lucha-limb"><rect x="15.0" y="50.8" width="7.2" height="10.0" rx="2.9" fill="'+gloveColor+'"/></g><g class="lucha-arm-right lucha-limb"><rect x="27.9" y="50.8" width="7.2" height="10.0" rx="2.9" fill="'+gloveColor+'"/></g><g class="lucha-torso"><rect x="17.9" y="49.4" width="14.3" height="17.2" rx="2.9" fill="'+torsoColor+'"/><circle cx="25" cy="43.7" r="7.2" fill="'+skin+'"/><circle cx="22.7" cy="41.3" r="1.5" fill="#fff" fill-opacity="0.22"/>'+(accessory!=='cape'?acc:'')+'</g>';
}
function buildFighterDOM(name, colors, accessory, mirrored){
  const pos=document.createElement('div'); pos.className='lucha-fighter-pos';
  pos.innerHTML='<div class="lucha-fighter-name"></div><div class="lucha-hp-bar-bg"><div class="lucha-hp-bar-fill"></div></div><div class="lucha-fighter-scale'+(mirrored?' mirror':'')+'"><div class="lucha-character"><div class="lucha-char-shadow"></div><svg class="lucha-char-svg" viewBox="0 0 50 80" preserveAspectRatio="xMidYMax meet">'+spriteInnerSVG(colors,accessory)+'</svg></div></div>';
  pos.querySelector('.lucha-fighter-name').textContent=name;
  return { pos, hpFill:pos.querySelector('.lucha-hp-bar-fill'), scaleWrap:pos.querySelector('.lucha-fighter-scale'), mirrored };
}
function fighterCardHTML(kind, name, tag, power, colors, accessory){
  const isCpu = kind === 'cpu';
  const svg = '<svg class="lucha-char-svg" viewBox="0 0 50 80" preserveAspectRatio="xMidYMax meet">'+spriteInnerSVG(colors, accessory)+'</svg>';
  return '<div class="lucha-fcard '+kind+'"><div class="lucha-fcard-glow" style="background:'+colors.head+'"></div><div class="lucha-fcard-sprite-wrap"><div class="lucha-character"><div class="lucha-char-shadow"></div>'+svg+'</div></div><div class="lucha-fcard-name">'+name+'</div><div class="lucha-fcard-tag">'+tag+'</div><div class="lucha-fcard-power">PWR '+power+'</div></div>';
}
function foundWindowHTML(enemyObj){
  const pwr = levelSum(statLevels());
  return '<div class="lucha-found-window"><div class="lucha-search-window-header"><div class="lucha-search-dots"><span class="lucha-search-dot red"></span><span class="lucha-search-dot yellow"></span><span class="lucha-search-dot green"></span></div><div class="lucha-search-window-title">FICHA DE COMBATE</div><div style="width:15px"></div></div><div class="lucha-found-body"><div class="lucha-found-arena">'+fighterCardHTML('you','Tu Boxeador','Retador Local',pwr,PLAYER_COLORS,'none')+'<div class="lucha-vs-impact"><div class="lucha-vs-burst"></div><div class="lucha-vs-impact-text">VS</div></div>'+fighterCardHTML('cpu',enemyObj.name,enemyObj.rank,pwr,enemyObj.colors,enemyObj.accessory)+'</div><div class="lucha-search-status" id="lucha-found-status-text">¡Rival encontrado!</div><div class="lucha-search-progress-bg"><div class="lucha-search-progress-fill" id="lucha-found-bar" style="background:linear-gradient(90deg,#ffd54a,#e6ac00)"></div></div></div></div>';
}
function buildPanels(){
  luchaPanel.innerHTML = '<div class="lucha-ring-header"><div class="timer" id="lucha-timer-display">⏱ --</div><div class="gold" id="lucha-gold-display">💰 0</div></div><div class="lucha-ring-wrap" id="lucha-ring-wrap"><div class="lucha-ring-container"><div class="lucha-ring-floor"></div>'+['top','bottom','left','right'].map(side=>[1,2,3,4].map(i=>'<div class="lucha-rope-line lucha-rope-'+side+' r'+i+'"></div>').join('')).join('')+'<div class="lucha-corner-pad tl"></div><div class="lucha-corner-pad tr"></div><div class="lucha-corner-pad bl"></div><div class="lucha-corner-pad br"></div><div class="lucha-corner-post tl"></div><div class="lucha-corner-post tr"></div><div class="lucha-corner-post bl"></div><div class="lucha-corner-post br"></div><div class="lucha-mat" id="lucha-mat"></div></div><div class="lucha-overlay" id="lucha-overlay"><div class="lucha-radar-box"></div><div>Toca el ring para buscar rival</div></div></div>';
  luchaStatsPanel.innerHTML = ['you','cpu'].map(type=>'<div class="lucha-stats-col '+type+'"><div class="lucha-stats-header"><div class="lucha-stats-avatar">'+(type==='you'?'🥊':'🤖')+'</div><div><div class="lucha-stats-header-title">'+(type==='you'?'TÚ':'CPU')+'</div><div class="lucha-stats-header-sub">'+(type==='you'?'Tu boxeador':'Rival encontrado')+'</div></div></div><div class="lucha-stats-scroll" id="lucha-stats-'+type+'"></div><div class="lucha-stats-footer"><div class="lucha-stats-footer-row"><span class="lucha-stats-footer-label">PODER TOTAL</span><span class="lucha-stats-footer-value" id="lucha-'+type+'-power">0</span></div></div></div>').join('');
  matEl=document.getElementById('lucha-mat'); ringWrap=document.getElementById('lucha-ring-wrap'); overlay=document.getElementById('lucha-overlay'); timerDisplay=document.getElementById('lucha-timer-display'); goldDisplay=document.getElementById('lucha-gold-display'); statsYouEl=document.getElementById('lucha-stats-you'); statsCpuEl=document.getElementById('lucha-stats-cpu'); youPowerEl=document.getElementById('lucha-you-power'); cpuPowerEl=document.getElementById('lucha-cpu-power');
  ringWrap.addEventListener('click', ()=>{ if(state===STATE.IDLE) startSearch(); });
}
function renderStatRows(container, levels, prefix){
  container.innerHTML=''; let power=0;
  STAT_DEFS.forEach(def=>{ const v=levels?levels[def.out]:'-'; power += levels ? levels[def.out] : 0; const card=document.createElement('div'); card.className='lucha-stat-card '+prefix; card.id='lucha-'+prefix+'-'+def.out; card.innerHTML='<div class="lucha-stat-card-top"><span class="lucha-stat-card-label"><span>'+def.icon+'</span>'+def.label+'</span><span class="lucha-stat-card-value">'+v+'</span></div><div class="lucha-stat-card-bar"><div class="lucha-stat-card-bar-fill" style="width:'+(levels?Math.min(100,(v/10)*100):0)+'%"></div></div>'; container.appendChild(card); });
  return power;
}
function refreshFightStats(enemyLevels=null){ const levels=statLevels(); youPowerEl.textContent=renderStatRows(statsYouEl, levels, 'you'); if(enemyLevels){ cpuPowerEl.textContent=renderStatRows(statsCpuEl, enemyLevels, 'cpu'); } else { renderStatRows(statsCpuEl, null, 'cpu'); cpuPowerEl.textContent='???'; } }
function showOverlay(html, dim){ overlay.innerHTML=html; overlay.classList.toggle('dim',!!dim); overlay.classList.add('visible'); }
function hideOverlay(){ overlay.classList.remove('visible','dim','search-mode'); }
function setTimerDisplay(sec){ timerDisplay.textContent='⏱ '+sec+'s'; timerDisplay.classList.toggle('warn', sec<=10); }
function cleanupSearchTimers(){ [searchTimeoutId,searchTextInt,searchBlipInt,searchPingInt].forEach(id=>id&&clearInterval(id)); if(searchTimeoutId) clearTimeout(searchTimeoutId); searchTimeoutId=searchTextInt=searchBlipInt=searchPingInt=null; }
function cancelSearch(){ if(state!==STATE.SEARCHING) return; cleanupSearchTimers(); hideOverlay(); state=STATE.IDLE; timerDisplay.textContent='⏱ --'; }
function searchHTML(server, queue, mode){ return '<div class="lucha-search-window"><div class="lucha-search-window-header"><div class="lucha-search-dots"><span class="lucha-search-dot red"></span><span class="lucha-search-dot yellow"></span><span class="lucha-search-dot green"></span></div><div class="lucha-search-window-title">MATCHMAKING · RING ARENA</div><div class="lucha-search-close" id="lucha-search-cancel-btn">✕</div></div><div class="lucha-search-body"><div class="lucha-radar-box"><div class="lucha-radar-ring r1"></div><div class="lucha-radar-ring r2"></div><div class="lucha-radar-ring r3"></div><div class="lucha-radar-base"></div><div class="lucha-radar-sweep"></div><div id="lucha-radar-blips"></div><div class="lucha-radar-core"></div><div class="lucha-radar-icon">🥊</div></div><div class="lucha-search-status" id="lucha-search-status-text">'+SEARCH_MESSAGES[0]+'</div><div class="lucha-search-progress-bg"><div class="lucha-search-progress-fill" id="lucha-search-progress-fill"></div></div><div class="lucha-search-meta-grid"><div class="lucha-meta-item"><span class="lucha-meta-k">SERVIDOR</span><span class="lucha-meta-v">'+server+'</span></div><div class="lucha-meta-item"><span class="lucha-meta-k">PING</span><span class="lucha-meta-v" id="lucha-meta-ping">--ms</span></div><div class="lucha-meta-item"><span class="lucha-meta-k">EN COLA</span><span class="lucha-meta-v">'+queue+' jugadores</span></div><div class="lucha-meta-item"><span class="lucha-meta-k">MODO</span><span class="lucha-meta-v">'+mode+'</span></div></div></div></div>'; }
function spawnRadarBlip(container){ if(!container) return; const b=document.createElement('div'); b.className='lucha-radar-blip'; const a=rand(0,Math.PI*2), d=rand(8,38); b.style.left=(46+Math.cos(a)*d)+'px'; b.style.top=(46+Math.sin(a)*d)+'px'; container.appendChild(b); setTimeout(()=>b.remove(),1200); }
function startSearch(){ state=STATE.SEARCHING; refreshFightStats(); setTimerDisplay(45); const dur=randInt(3400,4900); showOverlay(searchHTML('RING-0'+randInt(1,9), randInt(2,9), pick(SEARCH_MODES)), false); overlay.classList.add('search-mode'); const fill=document.getElementById('lucha-search-progress-fill'), status=document.getElementById('lucha-search-status-text'), blips=document.getElementById('lucha-radar-blips'), ping=document.getElementById('lucha-meta-ping'); document.getElementById('lucha-search-cancel-btn').addEventListener('click', e=>{e.stopPropagation(); cancelSearch();}); requestAnimationFrame(()=>{fill.style.transition='width '+dur+'ms linear'; fill.style.width='100%';}); let i=0; searchTextInt=setInterval(()=>{i=(i+1)%SEARCH_MESSAGES.length; status.textContent=SEARCH_MESSAGES[i];},820); searchBlipInt=setInterval(()=>spawnRadarBlip(blips),380); searchPingInt=setInterval(()=>{ping.textContent=randInt(26,98)+'ms';},650); searchTimeoutId=setTimeout(onOpponentFound,dur); }
function onOpponentFound(){ cleanupSearchTimers(); const levelsArr=randomComposition(levelSum(statLevels()), STAT_DEFS.length), levels={}; STAT_DEFS.forEach((d,i)=>levels[d.out]=levelsArr[i]); enemy={ name:pickName(), colors:pick(COLOR_SCHEMES), accessory:pick(ACCESSORIES), rank:pick(RANK_TAGS), levels, combat:combatStats(levels) }; enemy.hp=enemy.combat.maxHp; refreshFightStats(levels); state=STATE.FOUND; showOverlay(foundWindowHTML(enemy), false); const bar=document.getElementById('lucha-found-bar'); requestAnimationFrame(()=>{bar.style.transition='width 4s linear'; bar.style.width='100%';}); setTimeout(()=>{hideOverlay(); setupFightersInRing(); startCountdown();},4000); }
function setupFightersInRing(){ matEl.innerHTML=''; const levels=statLevels(), pc=combatStats(levels), pf=buildFighterDOM('Tu Boxeador',PLAYER_COLORS,'none',false), ef=buildFighterDOM(enemy.name, enemy.colors, enemy.accessory, true); matEl.append(pf.pos, ef.pos); const leftX=57.72, rightX=164.28, midY=81; player={el:pf.pos,hpFill:pf.hpFill,x:leftX,y:midY,targetX:leftX,targetY:midY,hp:pc.maxHp,maxHp:pc.maxHp,atk:pc.atk,def:pc.def,critChance:pc.critChance,evasion:pc.evasion,speed:pc.speed,lastAttack:0,lastRetarget:0,alive:true,isPlayer:true}; Object.assign(enemy,{el:ef.pos,hpFill:ef.hpFill,x:rightX,y:midY,targetX:rightX,targetY:midY,hp:enemy.combat.maxHp,maxHp:enemy.combat.maxHp,atk:enemy.combat.atk,def:enemy.combat.def,critChance:enemy.combat.critChance,evasion:enemy.combat.evasion,speed:enemy.combat.speed,lastAttack:0,lastRetarget:0,alive:true,isPlayer:false}); [player,enemy].forEach(f=>{f.el.style.left=f.x+'px'; f.el.style.top=f.y+'px';}); }
function startCountdown(){ state=STATE.COUNTDOWN; const seq=['3','2','1','¡PELEA!']; let i=0; (function step(){ if(i>=seq.length){hideOverlay(); beginFight(); return;} const label=seq[i++]; showOverlay('<div class="'+(label==='¡PELEA!'?'lucha-fight-flash':'lucha-count-num')+'">'+label+'</div>', true); setTimeout(step,label==='¡PELEA!'?550:700); })(); }
function beginFight(){ state=STATE.FIGHTING; fightSecondsLeft=45; setTimerDisplay(fightSecondsLeft); player.el.querySelector('.lucha-char-svg').classList.add('walking'); enemy.el.querySelector('.lucha-char-svg').classList.add('walking'); fightTimerInterval=setInterval(()=>{ fightSecondsLeft--; if(fightSecondsLeft<=0) fightSecondsLeft=45; setTimerDisplay(fightSecondsLeft); },1000); lastFrameTs=0; rafId=requestAnimationFrame(fightLoop); }
function retarget(f){ const opp=f.isPlayer?enemy:player, maxX=222, maxY=180; f.targetX=clamp(opp.x+rand(-70,70),0,maxX); f.targetY=clamp(opp.y+rand(-55,55),0,maxY); }
function fightLoop(ts){ if(state!==STATE.FIGHTING) return; if(!lastFrameTs) lastFrameTs=ts; const dt=Math.min((ts-lastFrameTs)/1000,.05); lastFrameTs=ts; [player,enemy].forEach(f=>{ if(!f.alive)return; const dx=f.targetX-f.x, dy=f.targetY-f.y, dist=Math.hypot(dx,dy); if(dist<6 || (ts-f.lastRetarget)>rand(680,1150)){retarget(f); f.lastRetarget=ts;} else {f.x=clamp(f.x+(dx/dist)*f.speed*dt,0,222); f.y=clamp(f.y+(dy/dist)*f.speed*dt,0,180);} f.el.style.left=f.x+'px'; f.el.style.top=f.y+'px'; }); if(player.alive && enemy.alive && Math.hypot(player.x-enemy.x,player.y-enemy.y)<44) resolveClash(ts); rafId=requestAnimationFrame(fightLoop); }
function resolveClash(ts){ if((ts-lastSpecialAction)>2600 && Math.random()<.38){ lastSpecialAction=ts; const specialAttacker = Math.random()<.5 ? player : enemy; landHit(specialAttacker, specialAttacker===player ? enemy : player, true); return; } const attacker=(player.speed+rand(0,40))>=(enemy.speed+rand(0,40))?player:enemy, defender=attacker===player?enemy:player; if((ts-attacker.lastAttack)<780) return; attacker.lastAttack=ts; landHit(attacker,defender,false); }
function landHit(attacker, defender, special){ if(!attacker.alive || !defender.alive || attacker===defender) return; if(Math.random()*100<defender.evasion){ spawnDmgNumber(defender,'ESQUIVA',false,attacker.isPlayer); return; } let dmg=Math.max(6, attacker.atk-defender.def*.5+rand(-3,5)); const crit=Math.random()*100<attacker.critChance; if(crit)dmg*=1.8; if(special)dmg*=1.8; dmg=Math.round(dmg); defender.hp=clamp(defender.hp-dmg,0,defender.maxHp); updateHpBar(defender); spawnDmgNumber(defender,'-'+dmg,crit||special,attacker.isPlayer); spawnImpact(attacker,defender,crit||special); knockback(defender, attacker); knockback(attacker, defender, 14); luchaPanel.classList.add('lucha-shake'); setTimeout(()=>luchaPanel.classList.remove('lucha-shake'),360); if(defender.hp<=0){ defender.alive=false; onDefeat(defender); } }
function knockback(mover, away, force=30){ const dx=mover.x-away.x, dy=mover.y-away.y, dist=Math.hypot(dx,dy)||1; mover.x=clamp(mover.x+(dx/dist)*force,0,222); mover.y=clamp(mover.y+(dy/dist)*force,0,180); mover.targetX=mover.x; mover.targetY=mover.y; mover.el.style.transition='left .08s ease-out, top .08s ease-out'; mover.el.style.left=mover.x+'px'; mover.el.style.top=mover.y+'px'; setTimeout(()=>{ if(mover.el) mover.el.style.transition=''; },90); }
function updateHpBar(f){ f.hpFill.style.width=Math.max(0,(f.hp/f.maxHp)*100)+'%'; }
function spawnDmgNumber(target,text,isCrit,byPlayer){ const n=document.createElement('div'); n.className='lucha-dmg-num'+(isCrit?' lucha-dmg-crit':''); n.textContent=text; n.style.color=isCrit?'#ffe34d':(byPlayer?'#7ec8ff':'#ff5555'); n.style.left=(target.x+24)+'px'; n.style.top=(target.y-6)+'px'; matEl.appendChild(n); setTimeout(()=>n.remove(),750); }
function spawnImpact(a,d,crit){ const s=document.createElement('div'); s.className='lucha-impact-star'; s.style.left=((a.x+d.x)/2+24)+'px'; s.style.top=((a.y+d.y)/2+45)+'px'; s.textContent=crit?'💥':(a.isPlayer?'👊':'💢'); matEl.appendChild(s); setTimeout(()=>s.remove(),520); }
function onDefeat(loser){ cancelAnimationFrame(rafId); clearInterval(fightTimerInterval); state=STATE.RESULT; loser.el.classList.add('defeated'); setTimeout(()=>showResult(loser.isPlayer?'lose':'win'),900); }
function showResult(kind){ const win=kind==='win', reward=win?10:2; window.GymHero.addGold(reward); goldDisplay.textContent='💰 '+document.getElementById('gold').textContent; showOverlay('<div class="lucha-result-window"><div class="lucha-search-window-header"><div class="lucha-search-dots"><span class="lucha-search-dot red"></span><span class="lucha-search-dot yellow"></span><span class="lucha-search-dot green"></span></div><div class="lucha-search-window-title">FINAL DEL COMBATE</div><div style="width:15px"></div></div><div class="lucha-result-body"><div style="font-size:34px">'+(win?'🏆':'☠️')+'</div><div class="lucha-fight-flash" style="font-size:26px;color:'+(win?'#78e68c':'#ff6464')+'">'+(win?'GANASTE':'PERDISTE')+'</div><div class="lucha-search-status">'+(win?'¡Victoria por nocaut!':'¡Derrotado en el ring!')+'</div><div style="color:#ffd86b;font-weight:900">💰 +'+reward+' ORO</div></div></div>', false); setTimeout(()=>{ hideOverlay(); matEl.innerHTML=''; state=STATE.SEARCHING; startSearch(); },4000); }
function openLuchaPanel(){ if(!window.GymHeroColiseo?.isActive()) return; coliseoPanel.classList.remove('show'); luchaPanel.classList.add('show'); luchaStatsPanel.classList.add('show'); statsGrid.style.visibility='hidden'; if(!matEl) buildPanels(); refreshFightStats(); state=STATE.IDLE; toast('🥊 LUCHA'); }
function closeLuchaPanel(){ cleanupSearchTimers(); cancelAnimationFrame(rafId); clearInterval(fightTimerInterval); if(matEl) matEl.innerHTML=''; state=STATE.IDLE; luchaStatsPanel.classList.remove('show'); }

buildPanels();
luchaBtn.addEventListener('click', openLuchaPanel);
window.GymHeroLucha = { open:openLuchaPanel, close:closeLuchaPanel };
})();

const HERO_SLOTS = [
  { id:'w1', icon:'⚔', name:'Katana Oscura', level:52, s1:'Ataque',       s1v:680, si1:'⚔', s2:'Tai-jutsu',  s2v:45,   si2:'🥊', cost:2800 },
  { id:'w2', icon:'✦', name:'Shurikens',     level:38, s1:'Vel. Ataque',  s1v:195, si1:'💨', s2:'Sangrado',   s2v:88,   si2:'🩸', cost:1200 },
  { id:'h',  icon:'😷',name:'Máscara ANBU',  level:18, s1:'Res. Genjutsu',s1v:220, si1:'🧠', s2:'HP Máx.',    s2v:380,  si2:'♥', cost:450  },
  { id:'c',  icon:'🥋',name:'Túnica ANBU',   level:67, s1:'Defensa',      s1v:312, si1:'🛡', s2:'HP Máx.',    s2v:2800, si2:'♥', cost:5200 },
  { id:'g',  icon:'🧤',name:'Guanteletes',   level:44, s1:'Precisión',    s1v:87,  si1:'◎',  s2:'Bloqueo',    s2v:34,   si2:'🛡', cost:1900 },
  { id:'b',  icon:'👟',name:'Botas Ninja',   level:29, s1:'Velocidad',    s1v:197, si1:'💨', s2:'Evasión',    s2v:22,   si2:'〇', cost:780  },
];

const HERO_STATS = [
  { icon:'⚔', key:'STR',     val:'284',   cls:''      },
  { icon:'💨', key:'AGI',     val:'197',   cls:'speed' },
  { icon:'🧠', key:'INT',     val:'156',   cls:''      },
  { icon:'✦',  key:'LUK',     val:'88',    cls:''      },
  { icon:'🛡', key:'DEF',     val:'312',   cls:'good'  },
  { icon:'♾',  key:'RES',     val:'241',   cls:''      },
  { icon:'◎',  key:'CRI',     val:'34%',   cls:'crit'  },
  { icon:'💥', key:'CRI DMG', val:'218%',  cls:'crit'  },
  { icon:'〇', key:'EVA',     val:'22%',   cls:'speed' },
  { icon:'♥',  key:'Rg HP',   val:'+145',  cls:'good'  },
];

let heroRoot = null;
let active = null;

function getRar(lvl) {
  if (lvl<=5)  return {label:'Madera',    color:'#c8904a', glow:'rgba(139,94,60,.5)',    border:'#8b5e3c', bg:'rgba(139,94,60,.14)'  };
  if (lvl<=15) return {label:'Aprendiz',  color:'#2ecc71', glow:'rgba(46,204,113,.45)', border:'#2ecc71', bg:'rgba(46,204,113,.10)' };
  if (lvl<=30) return {label:'Chunin',    color:'#3498db', glow:'rgba(52,152,219,.45)', border:'#3498db', bg:'rgba(52,152,219,.11)' };
  if (lvl<=45) return {label:'Jonin',     color:'#f1c40f', glow:'rgba(241,196,15,.50)', border:'#f1c40f', bg:'rgba(241,196,15,.11)' };
  if (lvl<=60) return {label:'ANBU',      color:'#e74c3c', glow:'rgba(231,76,60,.50)',  border:'#e74c3c', bg:'rgba(231,76,60,.12)'  };
  return {label:'Legendario',color:'#e74c3c',goldColor:'#ffc83c',glow:'rgba(231,76,60,.6)',border:'#e74c3c',bg:'rgba(231,76,60,.15)',legendary:true};
}

function calcCost(s) { return s.cost + s.level * (s.level * 14); }
function calcStat(v,lvl) { return Math.round(v * (1 + lvl * 0.028)); }

function closeModal() {
  if (!heroRoot) return;
  heroRoot.querySelector('.heroe-modal-overlay')?.classList.remove('open');
  active = null;
}

function openModal(slot) {
  if (!heroRoot) return;
  active = slot;
  const rar = getRar(slot.level);
  const cost = calcCost(slot);
  const c1 = calcStat(slot.s1v, slot.level);
  const n1 = calcStat(slot.s1v, slot.level + 1);

  heroRoot.querySelector('[data-heroe="mIcon"]').textContent = slot.icon;
  heroRoot.querySelector('[data-heroe="mName"]').textContent = slot.name;
  heroRoot.querySelector('[data-heroe="mRar"]').textContent = rar.label.toUpperCase();
  heroRoot.querySelector('[data-heroe="mCost"]').textContent = cost.toLocaleString();
  heroRoot.querySelector('[data-heroe="mL1"]').innerHTML = `${slot.si1} ${slot.s1}`;
  heroRoot.querySelector('[data-heroe="mL2"]').innerHTML = `${slot.si2} Nivel`;
  heroRoot.querySelector('[data-heroe="mC1"]').textContent = c1.toLocaleString();
  heroRoot.querySelector('[data-heroe="mN1"]').textContent = n1.toLocaleString();
  heroRoot.querySelector('[data-heroe="mC2"]').textContent = `Lv.${slot.level}`;
  heroRoot.querySelector('[data-heroe="mN2"]').textContent = `Lv.${slot.level + 1}`;

  const modal = heroRoot.querySelector('.heroe-modal');
  modal.style.borderColor = `${rar.color}44`;
  heroRoot.style.setProperty('--heroe-mac', rar.color);
  heroRoot.style.setProperty('--heroe-mag', rar.glow);

  heroRoot.querySelector('[data-heroe="btnUpg"]').textContent = '▲ MEJORAR';
  heroRoot.querySelector('.heroe-modal-overlay')?.classList.add('open');
}

function renderGear(root) {
  const grid = root.querySelector('[data-heroe="gearGrid"]');
  HERO_SLOTS.forEach(slot => {
    const rar = getRar(slot.level);
    const el = document.createElement('div');
    el.className = `heroe-gear-slot${rar.legendary ? ' legendary' : ''}`;
    el.style.cssText = `--sb:${rar.border};--sbg:${rar.bg};--sg:${rar.glow};--sc:${rar.legendary?(rar.goldColor||rar.color):rar.color};border-color:${rar.border};background:${rar.bg};`;

    let html = rar.legendary ? '<div class="heroe-legendary-aura"></div>' : '';
    if (rar.legendary) {
      for (let p = 0; p < 5; p++) {
        const tx = (Math.random()*60-30).toFixed(0);
        const ty = (Math.random()*40+8).toFixed(0);
        const dx = (Math.random()*14-7).toFixed(0);
        const dur = (1.4+Math.random()*1.6).toFixed(1);
        const delay = (Math.random()*1.4).toFixed(1);
        html += `<div class="heroe-particle" style="--tx:${tx}px;--ty:${ty}px;--dx:${dx}px;--dur:${dur}s;--delay:${delay}s;left:${14+p*16}%;top:${22+Math.random()*52}%"></div>`;
      }
    }
    const levelColor = rar.legendary ? (rar.goldColor || rar.color) : rar.color;
    html += `
      <div class="heroe-s-icon">${slot.icon}</div>
      <div class="heroe-s-name">${slot.name}</div>
      <div class="heroe-s-lv" style="color:${levelColor};text-shadow:0 0 6px ${rar.glow}">Lv.${slot.level}</div>
      <div class="heroe-s-pill" style="background:${rar.color}22;color:${rar.color};border:.5px solid ${rar.color}55">${rar.label}</div>
    `;
    el.innerHTML = html;
    el.addEventListener('click', () => openModal(slot));
    grid.appendChild(el);
    slot._el = el;
  });
}

function renderStats(root) {
  const statsGrid = root.querySelector('[data-heroe="statsGrid"]');
  HERO_STATS.forEach(s => {
    const d = document.createElement('div');
    d.className = 'heroe-stat-row';
    d.innerHTML = `<span class="heroe-st-icon">${s.icon}</span><span class="heroe-st-key">${s.key}</span><span class="heroe-st-val ${s.cls}">${s.val}</span>`;
    statsGrid.appendChild(d);
  });
}

export function mountHeroe(container) {
  if (!container) return;
  container.innerHTML = `
    <section class="heroe-root">
      <div class="heroe-sheet">
        <div class="heroe-c tl"></div><div class="heroe-c tr"></div>
        <div class="heroe-c bl"></div><div class="heroe-c br"></div>
        <div class="heroe-col-id">
          <div class="heroe-av-wrap"><div class="heroe-av-ring"></div><div class="heroe-avatar"><div class="heroe-avatar-inner">🥷</div></div></div>
          <div class="heroe-char-name">KAGE<br>RYUU</div>
          <div class="heroe-char-clan"><span class="heroe-cdot"></span><span>Clan Uchiha</span><span class="heroe-cdot"></span></div>
          <div class="heroe-rank-badge">ANBU</div>
          <div class="heroe-big-box"><div class="heroe-box-title">Perfil Ninja</div><div class="heroe-emblem-wrap"><div class="heroe-emblem-ring"></div><div class="heroe-emblem-ring2"></div><div class="heroe-emblem-glyph">🔴</div></div><div class="heroe-bb-bar-row"><div class="heroe-bb-bar-label"><span style="color:var(--green-neon)">HP</span><span>7,820 / 10,000</span></div><div class="heroe-bb-bar"><div class="heroe-bb-fill heroe-bb-hp" style="width:78%"></div></div></div><div class="heroe-bb-bar-row" style="margin-bottom:6px;"><div class="heroe-bb-bar-label"><span style="color:var(--blue-el)">Chakra</span><span>2,750 / 5,000</span></div><div class="heroe-bb-bar"><div class="heroe-bb-fill heroe-bb-ckr" style="width:55%"></div></div></div><div class="heroe-bb-row"><div class="heroe-bb-key"><span>📜</span>Misiones</div><div class="heroe-bb-val" style="color:var(--gold)">347</div></div><div class="heroe-bb-row"><div class="heroe-bb-key"><span>🏆</span>Victorias</div><div class="heroe-bb-val" style="color:var(--green-neon)">98%</div></div><div class="heroe-bb-row"><div class="heroe-bb-key"><span>⚡</span>Jutsus</div><div class="heroe-bb-val" style="color:var(--cyan)">12</div></div><div class="heroe-bb-row"><div class="heroe-bb-key"><span>🌀</span>Rango P.</div><div class="heroe-bb-val" style="color:var(--red-neon)">#12</div></div><div class="heroe-bb-row"><div class="heroe-bb-key"><span>⏱</span>Jugadas</div><div class="heroe-bb-val" style="color:var(--text-mid)">1,240h</div></div></div>
        </div>
        <div class="heroe-col-right"><div class="heroe-sec-gear"><div class="heroe-sec-hdr"><div class="heroe-sec-title gold">⚔ Equipamiento</div><div class="heroe-gold-tag"><span>◆</span><span>24,850</span></div></div><div class="heroe-gear-grid" data-heroe="gearGrid"></div></div><div class="heroe-h-div"></div><div class="heroe-sec-stats"><div class="heroe-sec-title cyan" style="margin-bottom:2px;">▸ Atributos de Combate</div><div class="heroe-stats-grid" data-heroe="statsGrid"></div></div></div>
        <div class="heroe-modal-overlay"><div class="heroe-modal"><button class="heroe-modal-x" data-heroe="modalClose">✕</button><div class="heroe-m-hdr"><div class="heroe-m-icon" data-heroe="mIcon">⚔</div><div><div class="heroe-m-name" data-heroe="mName">—</div><div class="heroe-m-rar" data-heroe="mRar">—</div></div></div><div class="heroe-m-stitle">Costo de Mejora</div><div class="heroe-cost-row"><span style="font-size:13px">◆</span><span class="heroe-cost-v" data-heroe="mCost">—</span><span class="heroe-cost-l">ORO</span></div><div class="heroe-m-stitle">Comparativa</div><div class="heroe-cmp-grid"><div class="heroe-cmp-lbl" data-heroe="mL1">⚔ Stat</div><div class="heroe-cmp-v cur" data-heroe="mC1">—</div><div class="heroe-cmp-arr">→</div><div class="heroe-cmp-v nxt" data-heroe="mN1">—</div><div class="heroe-cmp-lbl" data-heroe="mL2" style="margin-top:4px;">▲ Nivel</div><div class="heroe-cmp-v cur" data-heroe="mC2">—</div><div class="heroe-cmp-arr">→</div><div class="heroe-cmp-v nxt" data-heroe="mN2">—</div></div><button class="heroe-btn-upg" data-heroe="btnUpg">▲ MEJORAR</button></div></div>
      </div>
    </section>
  `;

  heroRoot = container.querySelector('.heroe-root');
  renderStats(heroRoot);
  renderGear(heroRoot);

  heroRoot.querySelector('[data-heroe="modalClose"]').addEventListener('click', closeModal);
  heroRoot.querySelector('.heroe-modal-overlay').addEventListener('click', e => {
    if (e.target.classList.contains('heroe-modal-overlay')) closeModal();
  });
  heroRoot.querySelector('[data-heroe="btnUpg"]').addEventListener('click', () => {
    if (!active) return;
    const btn = heroRoot.querySelector('[data-heroe="btnUpg"]');
    if (active.level >= 80) {
      btn.textContent = '✦ NIVEL MÁXIMO';
      return;
    }
    active.level++;
    const rar = getRar(active.level);
    const el = active._el;
    const levelColor = rar.legendary ? (rar.goldColor || rar.color) : rar.color;
    el.style.borderColor = rar.border;
    el.style.background = rar.bg;
    el.querySelector('.heroe-s-lv').textContent = `Lv.${active.level}`;
    el.querySelector('.heroe-s-lv').style.color = levelColor;
    el.querySelector('.heroe-s-pill').textContent = rar.label;
    el.querySelector('.heroe-s-pill').style.color = rar.color;
    if (rar.legendary && !el.classList.contains('legendary')) el.classList.add('legendary');
    el.style.boxShadow = `0 0 22px ${rar.glow}`;
    setTimeout(() => { el.style.boxShadow = ''; }, 700);
    openModal(active);
    btn.textContent = '✓ ¡MEJORADO!';
    setTimeout(() => { btn.textContent = '▲ MEJORAR'; }, 1400);
  });
}

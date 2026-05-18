/**
 * botonheroe.js
 * Sistema de equipo / gear con modal de mejora para juegos RPG.
 * Todos los identificadores usan el prefijo "botonhero1" para evitar
 * conflictos con otros scripts del juego.
 *
 * USO:
 *   1. Añade los estilos con:  botonhero1Init()
 *   2. Monta el widget en un elemento con:  botonhero1Mount('#mi-contenedor')
 *   3. Opcionalmente pasa opciones:  botonhero1Mount('#contenedor', { gold: 50000 })
 */

(function (global) {
  'use strict';

  /* ─────────────────────────────────────────────
     CSS — inyectado una sola vez en el <head>
  ───────────────────────────────────────────── */
  const BOTONHERO1_STYLE_ID = 'botonhero1-styles';

  function botonhero1InjectStyles() {
    if (document.getElementById(BOTONHERO1_STYLE_ID)) return;
    const styleEl = document.createElement('style');
    styleEl.id = BOTONHERO1_STYLE_ID;
    styleEl.textContent = `
/* ── botonhero1 root vars ── */
.botonhero1-root {
  --bh1-bg-void:    #060910;
  --bh1-bg-glass:   rgba(9,15,26,0.92);
  --bh1-border-dim: rgba(0,245,255,0.10);
  --bh1-border-mid: rgba(0,245,255,0.22);
  --bh1-cyan:       #00f5ff;
  --bh1-gold:       #ffc83c;
  --bh1-red-neon:   #ff2244;
  --bh1-green-neon: #39ff8a;
  --bh1-blue-el:    #1e90ff;
  --bh1-text-hi:    #eaf4ff;
  --bh1-text-mid:   rgba(175,210,240,0.72);
  --bh1-text-lo:    rgba(110,155,195,0.50);
  --bh1-f-ui:       'Rajdhani', sans-serif;
  --bh1-f-hud:      'Orbitron', sans-serif;
  --bh1-mac:        #00f5ff;
  --bh1-mag:        rgba(0,245,255,0.35);
}

/* ── sheet wrapper ── */
.botonhero1-sheet {
  width: 340px; height: 390px;
  background: var(--bh1-bg-glass);
  backdrop-filter: blur(10px);
  border: 1px solid var(--bh1-border-dim);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: bh1FadeIn .55s ease both;
  font-family: var(--bh1-f-ui);
  color: var(--bh1-text-hi);
  box-sizing: border-box;
}
.botonhero1-sheet *, .botonhero1-sheet *::before, .botonhero1-sheet *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
@keyframes bh1FadeIn {
  from { opacity:0; transform:scale(.97) translateY(8px); }
  to   { opacity:1; transform:none; }
}

/* corner decorations */
.botonhero1-c { position:absolute; width:13px; height:13px; pointer-events:none; }
.botonhero1-c.bh1-tl { top:4px; left:4px;   border-top:1.5px solid rgba(0,245,255,.48); border-left:1.5px solid rgba(0,245,255,.48); }
.botonhero1-c.bh1-tr { top:4px; right:4px;  border-top:1.5px solid rgba(0,245,255,.48); border-right:1.5px solid rgba(0,245,255,.48); }
.botonhero1-c.bh1-bl { bottom:4px; left:4px;  border-bottom:1.5px solid rgba(0,245,255,.48); border-left:1.5px solid rgba(0,245,255,.48); }
.botonhero1-c.bh1-br { bottom:4px; right:4px; border-bottom:1.5px solid rgba(0,245,255,.48); border-right:1.5px solid rgba(0,245,255,.48); }

/* column */
.botonhero1-col-right {
  display:flex; flex-direction:column; flex:1; height:100%;
}

/* gear section */
.botonhero1-sec-gear { padding:10px 10px 8px; flex-shrink:0; }

.botonhero1-gear-grid {
  display:grid;
  grid-template-columns: repeat(3,1fr);
  grid-template-rows: repeat(2,84px);
  gap:6px;
}

.botonhero1-gear-slot {
  border-radius:7px;
  border:1.5px solid var(--bh1-sb, rgba(100,130,160,.3));
  background:var(--bh1-sbg, rgba(10,18,30,.6));
  cursor:pointer;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:3px;
  position:relative; overflow:hidden;
  transition:transform .17s ease, box-shadow .18s ease;
}
.botonhero1-gear-slot:hover  { transform:translateY(-2px) scale(1.04); box-shadow:0 4px 18px var(--bh1-sg,rgba(0,245,255,.25)); z-index:2; }
.botonhero1-gear-slot:active { transform:scale(.97); }
.botonhero1-gear-slot::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.04) 0%,transparent 55%); pointer-events:none; }

.botonhero1-s-icon { font-size:28px; line-height:1; filter:drop-shadow(0 0 5px var(--bh1-sg,rgba(0,245,255,.4))); }
.botonhero1-s-name { font-size:8.5px; font-weight:700; color:var(--bh1-text-mid); text-align:center; line-height:1.1; padding:0 3px; }
.botonhero1-s-lv   { font-family:var(--bh1-f-hud); font-size:9px; font-weight:700; color:var(--bh1-sc,var(--bh1-cyan)); text-shadow:0 0 5px var(--bh1-sg,rgba(0,245,255,.5)); }

.botonhero1-legendary-aura {
  position:absolute; inset:-1px; border-radius:8px; pointer-events:none;
  animation:bh1LegP 1.6s ease-in-out infinite alternate;
}
@keyframes bh1LegP {
  from { box-shadow:0 0 9px rgba(231,76,60,.55),0 0 18px rgba(255,200,60,.18); }
  to   { box-shadow:0 0 18px rgba(231,76,60,.85),0 0 30px rgba(255,200,60,.4); }
}
.botonhero1-gear-slot.bh1-legendary .botonhero1-particle {
  position:absolute; width:2px; height:2px; border-radius:50%;
  background:var(--bh1-gold); box-shadow:0 0 4px var(--bh1-gold);
  animation:bh1PF var(--bh1-dur,2s) var(--bh1-delay,0s) ease-in-out infinite alternate;
  opacity:.7;
}
@keyframes bh1PF {
  from { transform:translate(var(--bh1-tx,0px),var(--bh1-ty,0px)); opacity:.2; }
  to   { transform:translate(calc(var(--bh1-tx,0px) + var(--bh1-dx,4px)),calc(var(--bh1-ty,0px) - 9px)); opacity:.9; }
}

/* divider */
.botonhero1-h-div { height:1px; margin:0 10px; background:linear-gradient(to right,transparent,rgba(0,245,255,.22),transparent); flex-shrink:0; }

/* stats section */
.botonhero1-sec-stats { flex:1; display:flex; flex-direction:column; padding:7px 10px 8px; gap:4px; overflow:hidden; }

.botonhero1-stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px 6px; flex:1; }

.botonhero1-stat-row {
  display:flex; align-items:center; gap:5px;
  background:rgba(0,245,255,.03);
  border:1px solid rgba(0,245,255,.09);
  border-radius:5px; padding:4px 7px;
}
.botonhero1-st-icon { font-size:15px; line-height:1; flex-shrink:0; }
.botonhero1-st-key  { font-size:10px; font-weight:700; color:var(--bh1-text-mid); text-transform:uppercase; letter-spacing:.3px; }
.botonhero1-st-val  { font-family:var(--bh1-f-hud); font-size:11px; font-weight:700; color:var(--bh1-text-hi); margin-left:auto; }
.botonhero1-st-val.bh1-crit  { color:var(--bh1-red-neon);  text-shadow:0 0 5px rgba(255,34,68,.45); }
.botonhero1-st-val.bh1-good  { color:var(--bh1-green-neon); }
.botonhero1-st-val.bh1-speed { color:var(--bh1-cyan);       text-shadow:0 0 5px rgba(0,245,255,.35); }

/* ── MODAL ── */
.botonhero1-modal-overlay {
  position:fixed; inset:0;
  background:rgba(3,7,16,.88); backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center;
  z-index:9999; opacity:0; pointer-events:none;
  transition:opacity .22s ease;
}
.botonhero1-modal-overlay.bh1-open { opacity:1; pointer-events:all; }

.botonhero1-modal {
  width:290px;
  background:linear-gradient(160deg,rgba(8,16,34,.98) 0%,rgba(4,10,22,.98) 100%);
  border:1px solid rgba(0,245,255,.18);
  border-radius:14px; padding:0; position:relative;
  transform:scale(.88) translateY(16px);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1);
  box-shadow:0 0 60px rgba(0,0,0,.8),0 0 30px rgba(0,245,255,.06);
  overflow:hidden;
  font-family:var(--bh1-f-ui);
  color:var(--bh1-text-hi);
}
.botonhero1-modal-overlay.bh1-open .botonhero1-modal { transform:scale(1) translateY(0); }

.botonhero1-modal-topbar { height:3px; background:linear-gradient(to right,transparent,var(--bh1-mac,var(--bh1-cyan)),transparent); }

.botonhero1-modal-body { padding:16px 16px 18px; }

.botonhero1-modal-x {
  position:absolute; top:10px; right:12px;
  background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
  border-radius:50%; width:24px; height:24px;
  cursor:pointer; color:var(--bh1-text-mid); font-size:11px; line-height:1;
  display:flex; align-items:center; justify-content:center;
  transition:all .15s; z-index:2;
}
.botonhero1-modal-x:hover { color:var(--bh1-red-neon); border-color:rgba(255,34,68,.4); background:rgba(255,34,68,.08); }

.botonhero1-m-hdr { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
.botonhero1-m-icon-wrap {
  width:52px; height:52px; border-radius:10px;
  background:linear-gradient(135deg,rgba(0,245,255,.08) 0%,rgba(0,245,255,.02) 100%);
  border:1px solid var(--bh1-mac,rgba(0,245,255,.25));
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
  box-shadow:0 0 16px var(--bh1-mag,rgba(0,245,255,.12));
}
.botonhero1-m-icon { font-size:26px; filter:drop-shadow(0 0 8px var(--bh1-mag,rgba(0,245,255,.5))); }
.botonhero1-m-name { font-family:var(--bh1-f-hud); font-size:13px; font-weight:700; color:var(--bh1-mac,var(--bh1-cyan)); text-shadow:0 0 8px var(--bh1-mag,rgba(0,245,255,.35)); letter-spacing:.5px; line-height:1.2; }
.botonhero1-m-rar  { font-size:9px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--bh1-mac,var(--bh1-cyan)); opacity:.6; margin-top:2px; }
.botonhero1-m-level { font-family:var(--bh1-f-hud); font-size:10px; color:var(--bh1-text-lo); margin-top:3px; }

.botonhero1-m-sep { display:flex; align-items:center; gap:8px; margin:10px 0 8px; }
.botonhero1-m-sep-line { flex:1; height:1px; background:rgba(0,245,255,.1); }
.botonhero1-m-sep-txt  { font-size:8px; letter-spacing:2px; text-transform:uppercase; color:var(--bh1-text-lo); white-space:nowrap; }

.botonhero1-cost-row {
  display:flex; align-items:center; justify-content:space-between;
  background:linear-gradient(135deg,rgba(255,200,60,.08) 0%,rgba(255,200,60,.04) 100%);
  border:1px solid rgba(255,200,60,.2);
  border-radius:8px; padding:10px 14px; margin-bottom:12px;
}
.botonhero1-cost-left  { display:flex; flex-direction:column; }
.botonhero1-cost-label { font-size:8px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,200,60,.45); margin-bottom:2px; }
.botonhero1-cost-v     { font-family:var(--bh1-f-hud); font-size:22px; font-weight:900; color:var(--bh1-gold); text-shadow:0 0 14px rgba(255,200,60,.5); line-height:1; }
.botonhero1-cost-icon  { font-size:28px; opacity:.7; }

.botonhero1-stat-bonus-grid { display:grid; grid-template-columns:1fr 1fr; gap:5px; }
.botonhero1-stat-bonus-item {
  background:rgba(0,245,255,.04); border:1px solid rgba(0,245,255,.08);
  border-radius:6px; padding:5px 8px;
  display:flex; flex-direction:column; gap:2px;
}
.botonhero1-sbi-key { font-size:8px; color:var(--bh1-text-lo); letter-spacing:.5px; text-transform:uppercase; }
.botonhero1-sbi-row { display:flex; align-items:center; justify-content:space-between; gap:4px; }
.botonhero1-sbi-cur { font-family:var(--bh1-f-hud); font-size:11px; font-weight:700; color:var(--bh1-text-mid); }
.botonhero1-sbi-arr { font-size:9px; color:var(--bh1-text-lo); }
.botonhero1-sbi-nxt { font-family:var(--bh1-f-hud); font-size:11px; font-weight:700; color:var(--bh1-cyan); }

.botonhero1-btn-upg {
  width:100%; margin-top:14px; padding:11px;
  background:linear-gradient(135deg,rgba(0,245,255,.15) 0%,rgba(0,245,255,.06) 100%);
  border:1px solid rgba(0,245,255,.32); border-radius:8px; cursor:pointer;
  font-family:var(--bh1-f-hud); font-size:12px; font-weight:700;
  color:var(--bh1-cyan); letter-spacing:3px; text-transform:uppercase;
  transition:all .2s; position:relative; overflow:hidden;
}
.botonhero1-btn-upg:hover {
  background:linear-gradient(135deg,rgba(0,245,255,.28) 0%,rgba(0,245,255,.12) 100%);
  box-shadow:0 0 24px rgba(0,245,255,.22),inset 0 0 24px rgba(0,245,255,.06);
  transform:translateY(-1px);
}
.botonhero1-btn-upg:active { transform:scale(.97); }
.botonhero1-btn-upg::after {
  content:''; position:absolute; top:-50%; left:-60%; width:35%; height:200%;
  background:rgba(255,255,255,.07); transform:skewX(-22deg);
  transition:left .4s ease;
}
.botonhero1-btn-upg:hover::after { left:130%; }
.botonhero1-btn-upg:disabled { opacity:.45; cursor:not-allowed; transform:none; box-shadow:none; }
    `;
    document.head.appendChild(styleEl);
  }

  /* ─────────────────────────────────────────────
     DATA / LÓGICA
  ───────────────────────────────────────────── */
  const BOTONHERO1_MULTIPLIERS = [1.4, 1.6, 1.8, 2.25, 2.35, 2.45, 2.50, 2.60, 2.70, 2.80];

  const BOTONHERO1_SLOT_DEFS = [
    {
      id:'main', icon:'🗡️', name:'Mano Principal',
      stats: [
        { key:'STR',   gain:3,   unit:'',  fmt: v => Math.round(v) },
        { key:'C.DMG', gain:1.5, unit:'%', fmt: v => v.toFixed(1)+'%' },
      ]
    },
    {
      id:'head', icon:'🪖', name:'Cabeza',
      stats: [
        { key:'INT', gain:3, unit:'',  fmt: v => Math.round(v) },
        { key:'MP',  gain:8, unit:'',  fmt: v => Math.round(v) },
      ]
    },
    {
      id:'torso', icon:'🛡️', name:'Torso',
      stats: [
        { key:'HP',  gain:25, unit:'', fmt: v => Math.round(v) },
        { key:'DEF', gain:4,  unit:'', fmt: v => Math.round(v) },
      ]
    },
    {
      id:'legs', icon:'👖', name:'Piernas',
      stats: [
        { key:'AGI', gain:2,   unit:'',  fmt: v => Math.round(v) },
        { key:'LUK', gain:0.5, unit:'',  fmt: v => v.toFixed(1) },
      ]
    },
    {
      id:'feet', icon:'🥾', name:'Pies',
      stats: [
        { key:'AGI', gain:2,  unit:'', fmt: v => Math.round(v) },
        { key:'HP',  gain:20, unit:'', fmt: v => Math.round(v) },
      ]
    },
    {
      id:'neck', icon:'📿', name:'Cuello',
      stats: [
        { key:'RES', gain:0.2, unit:'%', fmt: v => v.toFixed(1)+'%' },
        { key:'MP',  gain:6,   unit:'',  fmt: v => Math.round(v) },
      ]
    },
  ];

  const BOTONHERO1_STATS_DEF = [
    { icon:'⚔️', key:'STR',   val:'284',  cls:''      },
    { icon:'💨', key:'AGI',   val:'197',  cls:'bh1-speed' },
    { icon:'🧠', key:'INT',   val:'156',  cls:''      },
    { icon:'✦',  key:'LUK',   val:'88',   cls:''      },
    { icon:'🛡️', key:'DEF',   val:'312',  cls:'bh1-good'  },
    { icon:'♾️',  key:'RES',   val:'241',  cls:''      },
    { icon:'◎',  key:'CRI',   val:'34%',  cls:'bh1-crit'  },
    { icon:'💥', key:'C.DMG', val:'218%', cls:'bh1-crit'  },
    { icon:'〇', key:'EVA',   val:'22%',  cls:'bh1-speed' },
    { icon:'♥️', key:'Rg HP', val:'+145', cls:'bh1-good'  },
  ];

  function botonhero1GetCostForLevel(slot, lvl) {
    return Math.round(slot.baseCost * Math.pow(slot.multiplier, lvl - 1));
  }

  function botonhero1GetStatValue(gain, level, key) {
    if (key === 'CRI') return Math.min(5.0, 0.0625 * level);
    return gain * level;
  }

  function botonhero1GetRar(lvl) {
    if (lvl <= 5)  return { label:'Madera',     color:'#c8904a', glow:'rgba(139,94,60,.5)',    border:'#8b5e3c44', bg:'rgba(139,94,60,.14)'   };
    if (lvl <= 15) return { label:'Aprendiz',   color:'#2ecc71', glow:'rgba(46,204,113,.45)',  border:'#2ecc7144', bg:'rgba(46,204,113,.10)'  };
    if (lvl <= 30) return { label:'Chunin',     color:'#3498db', glow:'rgba(52,152,219,.45)',  border:'#3498db44', bg:'rgba(52,152,219,.11)'  };
    if (lvl <= 45) return { label:'Jonin',      color:'#f1c40f', glow:'rgba(241,196,15,.50)',  border:'#f1c40f44', bg:'rgba(241,196,15,.11)'  };
    if (lvl <= 60) return { label:'ANBU',       color:'#e74c3c', glow:'rgba(231,76,60,.50)',   border:'#e74c3c44', bg:'rgba(231,76,60,.12)'   };
    return { label:'Legendario', color:'#e74c3c', goldColor:'#ffc83c', glow:'rgba(231,76,60,.6)', border:'#e74c3c55', bg:'rgba(231,76,60,.15)', legendary:true };
  }

  /* ─────────────────────────────────────────────
     CONSTRUCCIÓN DEL DOM
  ───────────────────────────────────────────── */
  function botonhero1BuildSlotElement(slot) {
    const rar = botonhero1GetRar(slot.level);
    const el  = document.createElement('div');
    el.className = 'botonhero1-gear-slot' + (rar.legendary ? ' bh1-legendary' : '');
    el.style.cssText = `
      --bh1-sb:${rar.border};
      --bh1-sbg:${rar.bg};
      --bh1-sg:${rar.glow};
      --bh1-sc:${rar.legendary ? (rar.goldColor || rar.color) : rar.color};
      border-color:${rar.border};
      background:${rar.bg};
    `;

    let html = rar.legendary ? '<div class="botonhero1-legendary-aura"></div>' : '';
    if (rar.legendary) {
      for (let p = 0; p < 5; p++) {
        const tx    = (Math.random() * 60 - 30).toFixed(0);
        const ty    = (Math.random() * 40 + 8).toFixed(0);
        const dx    = (Math.random() * 14 - 7).toFixed(0);
        const dur   = (1.4 + Math.random() * 1.6).toFixed(1);
        const delay = (Math.random() * 1.4).toFixed(1);
        html += `<div class="botonhero1-particle" style="--bh1-tx:${tx}px;--bh1-ty:${ty}px;--bh1-dx:${dx}px;--bh1-dur:${dur}s;--bh1-delay:${delay}s;left:${14 + p * 16}%;top:${22 + Math.random() * 52}%"></div>`;
      }
    }

    const lc = rar.legendary ? (rar.goldColor || rar.color) : rar.color;
    html += `
      <div class="botonhero1-s-icon">${slot.icon}</div>
      <div class="botonhero1-s-name">${slot.name}</div>
      <div class="botonhero1-s-lv" style="color:${lc};text-shadow:0 0 6px ${rar.glow}">Lv.${slot.level}</div>
    `;
    el.innerHTML = html;
    return el;
  }

  function botonhero1BuildHTML() {
    return `
      <div class="botonhero1-c bh1-tl"></div>
      <div class="botonhero1-c bh1-tr"></div>
      <div class="botonhero1-c bh1-bl"></div>
      <div class="botonhero1-c bh1-br"></div>

      <div class="botonhero1-col-right">
        <div class="botonhero1-sec-gear">
          <div class="botonhero1-gear-grid" data-bh1="gearGrid"></div>
        </div>
        <div class="botonhero1-h-div"></div>
        <div class="botonhero1-sec-stats">
          <div class="botonhero1-stats-grid" data-bh1="statsGrid"></div>
        </div>
      </div>

      <!-- MODAL -->
      <div class="botonhero1-modal-overlay" data-bh1="modalOverlay">
        <div class="botonhero1-modal" data-bh1="modal">
          <div class="botonhero1-modal-topbar" data-bh1="mTopBar"></div>
          <div class="botonhero1-modal-body">
            <button class="botonhero1-modal-x" data-bh1="modalClose">✕</button>

            <div class="botonhero1-m-hdr">
              <div class="botonhero1-m-icon-wrap" data-bh1="mIconWrap">
                <div class="botonhero1-m-icon" data-bh1="mIcon">⚔</div>
              </div>
              <div>
                <div class="botonhero1-m-name"  data-bh1="mName">—</div>
                <div class="botonhero1-m-rar"   data-bh1="mRar">—</div>
                <div class="botonhero1-m-level" data-bh1="mLevelDisp">—</div>
              </div>
            </div>

            <div class="botonhero1-m-sep">
              <div class="botonhero1-m-sep-line"></div>
              <div class="botonhero1-m-sep-txt">Costo de Mejora</div>
              <div class="botonhero1-m-sep-line"></div>
            </div>
            <div class="botonhero1-cost-row">
              <div class="botonhero1-cost-left">
                <div class="botonhero1-cost-label">Oro requerido</div>
                <div class="botonhero1-cost-v" data-bh1="mCost">—</div>
              </div>
              <div class="botonhero1-cost-icon">◆</div>
            </div>

            <div class="botonhero1-m-sep">
              <div class="botonhero1-m-sep-line"></div>
              <div class="botonhero1-m-sep-txt">Estadísticas</div>
              <div class="botonhero1-m-sep-line"></div>
            </div>
            <div class="botonhero1-stat-bonus-grid" data-bh1="statBonusGrid"></div>

            <button class="botonhero1-btn-upg" data-bh1="btnUpg">▲ MEJORAR</button>
          </div>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────────
     INSTANCIA — cada llamada a botonhero1Mount
     crea una instancia independiente
  ───────────────────────────────────────────── */
  function botonhero1Mount(selector, options) {
    const container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!container) {
      console.warn('[botonhero1] Contenedor no encontrado:', selector);
      return null;
    }

    botonhero1InjectStyles();

    /* opciones */
    const opts = Object.assign({ gold: 24850, initialSlotLevels: {}, stats: null, onSlotLevelChange: null }, options);

    /* estado local de la instancia */
    let instanceGold = opts.gold;

    const slots = BOTONHERO1_SLOT_DEFS.map(def => {
      const baseCost   = Math.floor(Math.random() * 21) + 20;
      const multiplier = BOTONHERO1_MULTIPLIERS[Math.floor(Math.random() * BOTONHERO1_MULTIPLIERS.length)];
      const initialLevel = Number(opts.initialSlotLevels?.[def.id] ?? 1);
      return { ...def, stats: def.stats.map(s => ({ ...s })), level: Math.max(1, Math.floor(initialLevel)), baseCost, multiplier };
    });

    /* montar HTML */
    const sheet = document.createElement('div');
    sheet.className = 'botonhero1-sheet botonhero1-root';
    sheet.innerHTML = botonhero1BuildHTML();
    container.appendChild(sheet);

    /* referencias internas */
    const q = key => sheet.querySelector(`[data-bh1="${key}"]`);

    const gearGrid     = q('gearGrid');
    const statsGrid    = q('statsGrid');
    const modalOverlay = q('modalOverlay');
    const modal        = q('modal');
    const mTopBar      = q('mTopBar');
    const mIcon        = q('mIcon');
    const mIconWrap    = q('mIconWrap');
    const mName        = q('mName');
    const mRar         = q('mRar');
    const mLevelDisp   = q('mLevelDisp');
    const mCost        = q('mCost');
    const statBonusGrid= q('statBonusGrid');
    const btnUpg       = q('btnUpg');
    const modalClose   = q('modalClose');

    /* poblar stats */
    const statRows = Array.isArray(opts.stats) && opts.stats.length === 10 ? opts.stats : BOTONHERO1_STATS_DEF;
    statRows.forEach(s => {
      const d = document.createElement('div');
      d.className = 'botonhero1-stat-row';
      d.innerHTML = `
        <span class="botonhero1-st-icon">${s.icon}</span>
        <span class="botonhero1-st-key">${s.key}</span>
        <span class="botonhero1-st-val ${s.cls}">${s.val}</span>
      `;
      statsGrid.appendChild(d);
    });

    /* poblar gear */
    slots.forEach(slot => {
      const el = botonhero1BuildSlotElement(slot);
      el.addEventListener('click', () => botonhero1OpenModal(slot));
      gearGrid.appendChild(el);
      slot._el = el;
    });

    /* modal */
    let activeSlot = null;

    function botonhero1OpenModal(slot) {
      activeSlot = slot;
      const rar     = botonhero1GetRar(slot.level);
      const cost    = botonhero1GetCostForLevel(slot, slot.level);
      const nextLvl = slot.level + 1;

      mIcon.textContent      = slot.icon;
      mName.textContent      = slot.name;
      mRar.textContent       = rar.label.toUpperCase();
      mLevelDisp.textContent = `Nivel ${slot.level} → ${slot.level >= 80 ? 'MÁX' : nextLvl}`;
      mCost.textContent      = cost.toLocaleString();

      modal.style.borderColor = rar.color + '44';
      sheet.style.setProperty('--bh1-mac', rar.color);
      sheet.style.setProperty('--bh1-mag', rar.glow);
      mTopBar.style.background  = `linear-gradient(to right, transparent, ${rar.color}, transparent)`;
      mIconWrap.style.borderColor = rar.color + '55';
      mIconWrap.style.boxShadow   = `0 0 20px ${rar.glow}`;

      statBonusGrid.innerHTML = '';
      slot.stats.forEach(st => {
        const curVal = botonhero1GetStatValue(st.gain, slot.level, st.key);
        const nxtVal = botonhero1GetStatValue(st.gain, nextLvl,   st.key);
        const item   = document.createElement('div');
        item.className = 'botonhero1-stat-bonus-item';
        item.innerHTML = `
          <div class="botonhero1-sbi-key">${st.key}</div>
          <div class="botonhero1-sbi-row">
            <span class="botonhero1-sbi-cur">${st.fmt(curVal)}</span>
            <span class="botonhero1-sbi-arr">→</span>
            <span class="botonhero1-sbi-nxt">${st.fmt(nxtVal)}</span>
          </div>
        `;
        statBonusGrid.appendChild(item);
      });

      if (slot.level >= 80) {
        btnUpg.textContent = '✦ NIVEL MÁXIMO';
        btnUpg.disabled    = true;
      } else if (instanceGold < cost) {
        btnUpg.textContent = '✕ ORO INSUFICIENTE';
        btnUpg.disabled    = true;
      } else {
        btnUpg.textContent = '▲ MEJORAR';
        btnUpg.disabled    = false;
      }

      modalOverlay.classList.add('bh1-open');
    }

    function botonhero1CloseModal() {
      modalOverlay.classList.remove('bh1-open');
      activeSlot = null;
    }

    modalClose.addEventListener('click', botonhero1CloseModal);
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) botonhero1CloseModal();
    });

    btnUpg.addEventListener('click', () => {
      if (!activeSlot || activeSlot.level >= 80) return;
      const cost = botonhero1GetCostForLevel(activeSlot, activeSlot.level);
      if (instanceGold < cost) return;

      instanceGold -= cost;
      activeSlot.level++;
      if (typeof opts.onSlotLevelChange === 'function') {
        opts.onSlotLevelChange({ id: activeSlot.id, level: activeSlot.level, slots });
      }

      const rar = botonhero1GetRar(activeSlot.level);
      const el  = activeSlot._el;

      el.style.borderColor = rar.border;
      el.style.background  = rar.bg;
      el.style.setProperty('--bh1-sg',  rar.glow);
      el.style.setProperty('--bh1-sb',  rar.border);
      el.style.setProperty('--bh1-sbg', rar.bg);

      const lc = rar.legendary ? (rar.goldColor || rar.color) : rar.color;
      el.querySelector('.botonhero1-s-lv').textContent   = `Lv.${activeSlot.level}`;
      el.querySelector('.botonhero1-s-lv').style.color       = lc;
      el.querySelector('.botonhero1-s-lv').style.textShadow  = `0 0 6px ${rar.glow}`;

      if (rar.legendary && !el.classList.contains('bh1-legendary')) {
        el.classList.add('bh1-legendary');
      }

      el.style.boxShadow = `0 0 26px ${rar.glow}`;
      setTimeout(() => { el.style.boxShadow = ''; }, 700);

      btnUpg.textContent = '✓ ¡MEJORADO!';
      btnUpg.disabled    = true;
      setTimeout(() => { botonhero1OpenModal(activeSlot); }, 800);
    });

    /* API pública de la instancia */
    return {
      /** Devuelve el oro actual de esta instancia */
      getGold: ()      => instanceGold,
      /** Establece el oro de esta instancia */
      setGold: amount  => { instanceGold = amount; },
      /** Devuelve los slots (array con level, id, etc.) */
      getSlots: ()     => slots,
      /** Abre el modal de un slot por su id ('main','head','torso','legs','feet','neck') */
      openSlot: id     => {
        const s = slots.find(sl => sl.id === id);
        if (s) botonhero1OpenModal(s);
      },
      /** Cierra el modal */
      closeModal: botonhero1CloseModal,
      /** Desmonta el widget del DOM */
      destroy: ()      => {
        botonhero1CloseModal();
        container.removeChild(sheet);
      },
    };
  }

  /* ─────────────────────────────────────────────
     EXPORTACIÓN
  ───────────────────────────────────────────── */
  // Compatibilidad con módulos ES / CommonJS / global
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { botonhero1Mount };
  } else if (typeof define === 'function' && define.amd) {
    define([], () => ({ botonhero1Mount }));
  } else {
    global.botonhero1Mount = botonhero1Mount;
  }

}(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this));
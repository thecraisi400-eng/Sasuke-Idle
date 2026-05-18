const BOTONHERO1_STYLE_ID = 'botonhero1-styles';

  export function botonhero1InjectStyles() {
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

  
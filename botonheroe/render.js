import { botonhero1GetRar } from './utils.js';

export function botonhero1BuildSlotElement(slot) {
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

  export function botonhero1BuildHTML() {
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

  
import { BOTONHERO1_MULTIPLIERS, BOTONHERO1_SLOT_DEFS, BOTONHERO1_STATS_DEF } from './config.js';
import { botonhero1GetCostForLevel, botonhero1GetStatValue, botonhero1GetRar } from './utils.js';
import { botonhero1BuildSlotElement, botonhero1BuildHTML } from './render.js';
import { botonhero1InjectStyles } from './styles.js';

export function botonhero1Mount(selector, options) {
    const container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!container) {
      console.warn('[botonhero1] Contenedor no encontrado:', selector);
      return null;
    }

    botonhero1InjectStyles();

    /* opciones */
    const opts = Object.assign({ gold: 24850, initialSlotLevels: {}, stats: null, onUpgrade: null }, options);

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
      if (typeof opts.onUpgrade === 'function') {
        opts.onUpgrade({
          id: activeSlot.id,
          level: activeSlot.level,
          cost,
          gold: instanceGold,
          slots,
        });
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

  
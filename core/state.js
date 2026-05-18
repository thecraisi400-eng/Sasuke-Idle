import { calcStats } from './stats.js';

/* ─────────────────────────────────────────────
   ESTADO DEL JUEGO
───────────────────────────────────────────── */
export const state = {
  level: 1,
  exp: 0,
  gold: 100,
  activeSection: 'heroe',
  equipmentSlots: {
    main: 1,
    head: 1,
    torso: 1,
    legs: 1,
    feet: 1,
    neck: 1,
  },
};

// Calcular stats iniciales según nivel 1
const stats = calcStats(state.level);
state.hpMax  = stats.hp;
state.hp     = stats.hp;
state.mpMax  = stats.mp;
state.mp     = stats.mp;
state.expMax = stats.xpReq;
state.atk    = stats.atk;
state.def    = stats.def;

const SLOT_BONUS = {
  main: { str: 3, cdmg: 1.5 },
  head: { int: 3, mp: 8 },
  torso: { hp: 25, def: 4 },
  legs: { agi: 2, luk: 0.5 },
  feet: { agi: 2, hp: 20 },
  neck: { res: 0.2, mp: 6 },
};

function getEquipmentBonus() {
  const bonus = { hp: 0, mp: 0, str: 0, agi: 0, int: 0, luk: 0, def: 0, res: 0, cdmg: 0 };
  for (const [slotId, level] of Object.entries(state.equipmentSlots)) {
    const gain = SLOT_BONUS[slotId];
    if (!gain) continue;
    const effectiveLevel = Math.max(0, Number(level) - 1);
    Object.entries(gain).forEach(([key, value]) => {
      bonus[key] += value * effectiveLevel;
    });
  }
  return bonus;
}

export function getHeroStats() {
  const base = calcStats(state.level);
  const eq = getEquipmentBonus();
  const str = base.atk + eq.str;
  const agi = base.agi + eq.agi;
  const luk = base.luk + eq.luk;
  const hp = base.hp + eq.hp;
  return {
    str,
    agi,
    int: base.int + eq.int,
    luk,
    def: base.def + eq.def,
    res: Number(base.res) + eq.res,
    cri: Number(base.cri),
    cdmg: Number(base.cdmg) + eq.cdmg,
    eva: (agi * 0.35) + (luk * 0.25),
    rgHp: Math.round(hp * 0.05),
    hp,
    mp: base.mp + eq.mp,
  };
}

export function syncDerivedStateFromHero() {
  const hero = getHeroStats();
  state.hpMax = Math.round(hero.hp);
  state.hp = Math.min(state.hp, state.hpMax);
  state.mpMax = Math.round(hero.mp);
  state.mp = Math.min(state.mp, state.mpMax);
  state.atk = Math.round(hero.str);
  state.def = Math.round(hero.def);
}

export function setEquipmentSlotLevel(slotId, level) {
  if (!(slotId in state.equipmentSlots)) return;
  state.equipmentSlots[slotId] = level;
  syncDerivedStateFromHero();
}

// Aplicar bonus de equipo iniciales
syncDerivedStateFromHero();

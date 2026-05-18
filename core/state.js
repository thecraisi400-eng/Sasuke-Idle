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
    Object.entries(gain).forEach(([key, value]) => {
      bonus[key] += value * level;
    });
  }
  return bonus;
}

export function getHeroStats() {
  const base = calcStats(state.level);
  const eq = getEquipmentBonus();
  return {
    str: base.atk + eq.str,
    agi: base.agi + eq.agi,
    int: base.int + eq.int,
    luk: base.luk + eq.luk,
    def: base.def + eq.def,
    res: Number(base.res) + eq.res,
    cri: Number(base.cri),
    cdmg: Number(base.cdmg) + eq.cdmg,
    eva: (base.agi * 0.35) + (base.luk * 0.25) + (eq.agi * 0.35) + (eq.luk * 0.25),
    rgHp: Math.round((base.hp + eq.hp) * 0.05),
    hp: base.hp + eq.hp,
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


export function setPlayerVitals({ hp = state.hp, mp = state.mp } = {}) {
  state.hp = Math.max(0, Math.min(state.hpMax, Math.round(hp)));
  state.mp = Math.max(0, Math.min(state.mpMax, Math.round(mp)));
}

export function addMissionRewards({ xp = 0, gold = 0 } = {}) {
  state.gold = Math.max(0, Math.floor(state.gold + Number(gold || 0)));
  state.exp = Math.max(0, Math.floor(state.exp + Number(xp || 0)));

  while (state.exp >= state.expMax) {
    state.exp -= state.expMax;
    state.level += 1;
    state.expMax = calcStats(state.level).xpReq;
    syncDerivedStateFromHero();
    state.hp = state.hpMax;
    state.mp = state.mpMax;
  }
}

export function setEquipmentSlotLevel(slotId, level) {
  if (!(slotId in state.equipmentSlots)) return;
  state.equipmentSlots[slotId] = level;
  syncDerivedStateFromHero();
}

// Aplicar bonus de equipo iniciales
syncDerivedStateFromHero();

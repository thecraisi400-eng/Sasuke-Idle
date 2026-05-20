// ═══════════════════════════════════════════════════
//  CONSTANTES
// ═══════════════════════════════════════════════════
const misionesderangod2W = 460, misionesderangod2H = 360;
const misionesderangod2GROUND = misionesderangod2H - 50;
const misionesderangod2G = 0.44;
const misionesderangod2SC = 0.70;
const misionesderangod2NW = Math.round(30 * misionesderangod2SC);
const misionesderangod2NH = Math.round(50 * misionesderangod2SC);

let misionesderangod2Canvas;
let misionesderangod2Ctx;
let misionesderangod2Veil;
let misionesderangod2WinScreen;
let misionesderangod2WinName;

// ─── Estado global ───────────────────────────────
let misionesderangod2Particles  = [];
let misionesderangod2DamageNums = [];
let misionesderangod2Jutsus     = [];
let misionesderangod2Fighters   = [];
let misionesderangod2HitStop    = 0;
let misionesderangod2SlowMo     = 1;
let misionesderangod2FrameN     = 0;
let misionesderangod2GameOver   = false;

let misionesderangod2ShakeX=0, misionesderangod2ShakeY=0, misionesderangod2ShakeDur=0, misionesderangod2ShakeAmp=0;
let misionesderangod2CritFlash  = 0;
let misionesderangod2JutsuVeil  = 0;

let misionesderangod2BgMountains, misionesderangod2BgTrees, misionesderangod2BgStars;

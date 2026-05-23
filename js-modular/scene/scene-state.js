const canvas = document.getElementById('scene-canvas');
const ctx = canvas.getContext('2d');

// VS Code Live Preview / WebView can run on an older Chromium build where
// CanvasRenderingContext2D.roundRect is not available. The scene uses rounded
// rectangles heavily, so a missing roundRect would stop the first frame and
// make the game look frozen. This lightweight polyfill keeps the renderer
// compatible without changing the drawing code below.
if (ctx && typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radii = 0) {
    const values = Array.isArray(radii) ? radii : [radii, radii, radii, radii];
    const [tl = 0, tr = tl, br = tl, bl = tr] = values.map(r => Math.max(0, Number(r) || 0));
    const maxRadius = Math.min(Math.abs(width), Math.abs(height)) / 2;
    const rtl = Math.min(tl, maxRadius);
    const rtr = Math.min(tr, maxRadius);
    const rbr = Math.min(br, maxRadius);
    const rbl = Math.min(bl, maxRadius);

    this.moveTo(x + rtl, y);
    this.lineTo(x + width - rtr, y);
    this.quadraticCurveTo(x + width, y, x + width, y + rtr);
    this.lineTo(x + width, y + height - rbr);
    this.quadraticCurveTo(x + width, y + height, x + width - rbr, y + height);
    this.lineTo(x + rbl, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - rbl);
    this.lineTo(x, y + rtl);
    this.quadraticCurveTo(x, y, x + rtl, y);
    return this;
  };
}
let animFrame = 0;
let chopAngle = 0;
let chopDir = 1;

const BASE_LOG_HP = 10;
const LOG_HP_MULTIPLIER = 1.40;
const BASE_LOG_GOLD = 10;
const LOG_GOLD_MULTIPLIER = 1.15;

let currentLogMaxHP = BASE_LOG_HP;
let currentLogGoldReward = BASE_LOG_GOLD;
let logHP = currentLogMaxHP;
let logHPDisplay = currentLogMaxHP;

let shakeTimer = 0;
let shakeIntensity = 0;

let flyingLog = null;
let collectedLogs = 0;
let logPileVisible = false;
let logPileGold = 0;
let logPileClickable = false;

let pileClickEffect = null;


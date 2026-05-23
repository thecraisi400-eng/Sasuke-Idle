function getGoldPerLog() {
  return currentLogGoldReward;
}

function damageLog(amount) {
  logHP -= amount;
  if (logHP <= 0) {
    logHP = 0;
    triggerLogBreak();
  }
}

function triggerLogBreak() {
  shakeTimer = 25;
  shakeIntensity = 6;

  G.level++;
  showNextLevelBanner();
  updateUI();

  const goldEarned = getGoldPerLog();
  logPileGold += goldEarned;

  collectedLogs++;
  logPileVisible = true;
  logPileClickable = true;

  const W = canvas.width, H = canvas.height;
  const { groundY, logX, logY } = getSceneAnchors(W, H);
  const pileX = getPileX(W);
  const pileY = groundY - 10;

  flyingLog = {
    startX: logX,
    startY: logY,
    x: logX,
    y: logY,
    targetX: pileX,
    targetY: pileY,
    progress: 0,
    angle: 0,
    spin: 0.15
  };

  setTimeout(() => {
    currentLogMaxHP *= LOG_HP_MULTIPLIER;
    currentLogGoldReward *= LOG_GOLD_MULTIPLIER;
    logHP = currentLogMaxHP;
    logHPDisplay = currentLogMaxHP;
  }, 300);
}

function getPileX(W) {
  return W * 0.13;
}

function getLogsInPile() {
  return Math.min(collectedLogs, 6);
}

function getExtraLogCount() {
  return collectedLogs > 6 ? collectedLogs - 6 : 0;
}

function drawSmallStandingLog(ctx, x, y, w, h) {
  const grad = ctx.createLinearGradient(x - w/2, 0, x + w/2, 0);
  grad.addColorStop(0, '#5D3A1A');
  grad.addColorStop(0.3, '#8B5E3C');
  grad.addColorStop(0.7, '#7a4f22');
  grad.addColorStop(1, '#4a2c0a');
  ctx.fillStyle = grad;
  ctx.strokeStyle = '#3d2208';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x - w/2, y - h, w, h, [2, 2, 1, 1]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#c4956a';
  ctx.strokeStyle = '#8B5E3C';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, y - h, w/2, w * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(93,58,26,0.4)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.ellipse(x, y - h, w/2 * 0.6, w * 0.28 * 0.6, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(45,26,5,0.3)';
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 3; i++) {
    const ly = y - h + h * (0.2 + i * 0.28);
    ctx.beginPath();
    ctx.moveTo(x - w/2 + 1, ly);
    ctx.lineTo(x + w/2 - 1, ly + 1);
    ctx.stroke();
  }
}

function drawLogPile(ctx, W, H) {
  const { groundY } = getSceneAnchors(W, H);
  const pileX = getPileX(W);
  const logsInPile = getLogsInPile();
  const extra = getExtraLogCount();
  const offsetDown = H * 0.07;

  if (logsInPile === 0 && !flyingLog) return;

  const lw = 18, lh = 28;
  const spacing = 22;

  const layout = [
    { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
    { col: 0.5, row: 1 }, { col: 1.5, row: 1 },
    { col: 1, row: 2 },
  ];

  for (let i = 0; i < logsInPile; i++) {
    const pos = layout[i];
    const lx = pileX + (pos.col - 1) * spacing;
    const ly = groundY + offsetDown - pos.row * (lh * 0.8);
    drawSmallStandingLog(ctx, lx, ly, lw, lh);
  }

  if (extra > 0) {
    const centerX = pileX;
    const centerY = groundY + offsetDown - lh * 1.5;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.font = `bold 13px 'Fredoka One', cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${extra + 6}`, centerX, centerY);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  if (logPileClickable && logsInPile > 0) {
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 300);
    const cx = pileX;
    const cy = groundY + offsetDown - lh;
    const glow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 40);
    glow.addColorStop(0, `rgba(255,215,0,${0.15 + 0.1 * pulse})`);
    glow.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;
    ctx.font = `bold 11px 'Fredoka One', cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const labelY = groundY + offsetDown - lh * 2.2 - (logsInPile >= 6 ? 18 : 0);
    ctx.strokeText(`🪙 ${fmtNum(logPileGold)}`, cx, labelY);
    ctx.fillText(`🪙 ${fmtNum(logPileGold)}`, cx, labelY);
    ctx.textAlign = 'left';
  }

  if (pileClickEffect) {
    pileClickEffect.t += 0.07;
    if (pileClickEffect.t >= 1) {
      pileClickEffect = null;
    } else {
      const t = pileClickEffect.t;
      const cx = pileClickEffect.x;
      const cy = pileClickEffect.y;
      const sparkCount = 8;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (i / sparkCount) * Math.PI * 2;
        const dist = 30 * t;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;
        const colors = ['#FFD700', '#FFA500', '#FF8C00', '#fff'];
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(sx, sy, 3 * (1 - t * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = (1 - t) * 0.8;
      ctx.fillStyle = '#FFD700';
      ctx.font = `bold ${14 + t * 8}px 'Fredoka One', cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨', cx, cy - 20 * t);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  }
}



function getSceneAnchors(W, H) {
  const groundY = H * 0.775;
  const logX = W * 0.38 + W * 0.08;
  const logY = groundY - 22 + H * 0.07;
  const spriteX = W * 0.36;
  const spriteGroundY = groundY + H * 0.07;
  return { groundY, logX, logY, spriteX, spriteGroundY };
}

function drawFlyingLog(ctx) {
  if (!flyingLog) return;
  flyingLog.progress += 0.04;
  if (flyingLog.progress >= 1) { flyingLog = null; return; }

  const t = flyingLog.progress;
  const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;

  const x = flyingLog.startX + (flyingLog.targetX - flyingLog.startX) * ease;
  const arcHeight = -120;
  const y = flyingLog.startY + (flyingLog.targetY - flyingLog.startY) * ease + arcHeight * Math.sin(Math.PI * t);

  flyingLog.angle += flyingLog.spin;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(flyingLog.angle);
  drawSmallStandingLog(ctx, 0, 0, 14, 22);
  ctx.restore();
}

function drawHPBar(ctx, W, H) {
  const { logX, logY } = getSceneAnchors(W, H);
  const logW = W * 0.38;

  const barW = logW;
  const barH = 16;
  const barX = logX;
  const barY = logY - barH - 6;

  const hpFrac = Math.max(0, logHPDisplay / currentLogMaxHP);

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.fill();

  if (hpFrac > 0) {
    ctx.fillStyle = '#e03030';
    ctx.beginPath();
    ctx.roundRect(barX + 1, barY + 1, (barW - 2) * hpFrac, barH - 2, 3);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.roundRect(barX + 1, barY + 1, (barW - 2) * hpFrac, (barH - 2) * 0.45, [3, 3, 0, 0]);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = `bold 10px 'Fredoka One', cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 3;
  ctx.fillText(`${Math.ceil(logHPDisplay)} / ${Math.ceil(currentLogMaxHP)}`, barX + barW / 2, barY + barH / 2);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function resizeCanvas() {
  const top = document.getElementById('top-section');
  const rect = top.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(rect.width));
  canvas.height = Math.max(1, Math.round(rect.height));
}

function drawRealisticTree(ctx, x, groundY, scale) {
  const trunkH = 110 * scale;
  const trunkW = 18 * scale;
  const nightMode = isNight();

  const trunkGrad = ctx.createLinearGradient(x - trunkW/2, 0, x + trunkW/2, 0);
  trunkGrad.addColorStop(0, '#4a2c0a');
  trunkGrad.addColorStop(0.3, '#7a4f22');
  trunkGrad.addColorStop(0.7, '#6b4218');
  trunkGrad.addColorStop(1, '#3d2208');
  ctx.fillStyle = trunkGrad;
  ctx.strokeStyle = '#2d1a05';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(x - trunkW/2, groundY);
  ctx.bezierCurveTo(x - trunkW/2 - 4*scale, groundY - trunkH*0.3, x - trunkW/2 + 2*scale, groundY - trunkH*0.7, x - trunkW/3, groundY - trunkH);
  ctx.lineTo(x + trunkW/3, groundY - trunkH);
  ctx.bezierCurveTo(x + trunkW/2 + 2*scale, groundY - trunkH*0.7, x + trunkW/2 - 4*scale, groundY - trunkH*0.3, x + trunkW/2, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(45,26,5,0.4)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) {
    const ly = groundY - trunkH * (0.15 + i * 0.17);
    ctx.beginPath();
    ctx.moveTo(x - trunkW/2 + 2, ly);
    ctx.bezierCurveTo(x - 2, ly - 4*scale, x + 3, ly + 2*scale, x + trunkW/2 - 2, ly - 2*scale);
    ctx.stroke();
  }

  ctx.fillStyle = '#4a2c0a';
  ctx.strokeStyle = '#2d1a05';
  ctx.lineWidth = 1;
  [[-1.1, 0.7], [-0.5, 0.85], [0.5, 0.85], [1.1, 0.7]].forEach(([ox, oy]) => {
    ctx.beginPath();
    ctx.ellipse(x + ox * trunkW * 0.8, groundY - 4*scale, trunkW * 0.25, 8*scale, ox * 0.4, 0, Math.PI*2);
    ctx.fill();
  });

  const foliageColors = nightMode ? [
    ['#0d3a0d', '#082808', '#0f4410'],
    ['#0f5210', '#0a3a0a', '#124614'],
    ['#125a12', '#0c420c', '#165e16'],
    ['#185c18', '#104010', '#1c6a1c'],
  ] : [
    ['#1a5c1a', '#0f4010', '#236623'],
    ['#228B22', '#196019', '#2d7a2d'],
    ['#2d8b2d', '#1f6b1f', '#3a923a'],
    ['#3a9a3a', '#2a7a2a', '#4aaa4a'],
  ];

  const layers = [
    [0,      0,      55*scale, 70*scale, 0,     0],
    [-20*scale, 20*scale, 45*scale, 55*scale, -0.3, 1],
    [ 22*scale, 15*scale, 42*scale, 52*scale,  0.3, 1],
    [ 0,      -20*scale, 40*scale, 45*scale,  0,   2],
    [-28*scale, 40*scale, 35*scale, 42*scale, -0.4, 3],
    [ 30*scale, 35*scale, 33*scale, 40*scale,  0.4, 3],
    [ 8*scale, -35*scale, 30*scale, 38*scale,  0.1, 2],
    [-10*scale, -10*scale, 38*scale, 48*scale, -0.15,1],
  ];

  const baseY = groundY - trunkH;

  layers.forEach(([rx2, ry2, ex, ey, rot, ci]) => {
    const [dark, darker, light] = foliageColors[ci];
    const cx2 = x + rx2, cy2 = baseY + ry2;

    const grad = ctx.createRadialGradient(cx2 - ex*0.2, cy2 - ey*0.3, ex*0.1, cx2, cy2, Math.max(ex, ey));
    grad.addColorStop(0, light);
    grad.addColorStop(0.5, dark);
    grad.addColorStop(1, darker);

    ctx.save();
    ctx.translate(cx2, cy2);
    ctx.rotate(rot);
    ctx.fillStyle = grad;
    ctx.strokeStyle = darker;
    ctx.lineWidth = 1;

    ctx.beginPath();
    const pts = 10;
    for (let i = 0; i <= pts; i++) {
      const angle = (i / pts) * Math.PI * 2;
      const jitter = 0.85 + 0.15 * Math.sin(i * 3.7 + rx2);
      const px2 = Math.cos(angle) * ex * jitter;
      const py2 = Math.sin(angle) * ey * jitter;
      i === 0 ? ctx.moveTo(px2, py2) : ctx.lineTo(px2, py2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}

function drawMoon(ctx, x, y, r, opacity) {
  ctx.globalAlpha = opacity;

  const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3);
  glow.addColorStop(0, 'rgba(200,220,255,0.3)');
  glow.addColorStop(0.5, 'rgba(160,180,255,0.10)');
  glow.addColorStop(1, 'rgba(100,120,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f0f0d0';
  ctx.strokeStyle = '#c8c890';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(30,30,60,0.25)';
  ctx.beginPath();
  ctx.arc(x + r * 0.25, y, r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(180,180,150,0.4)';
  [[- r*0.3, -r*0.2, r*0.1], [r*0.1, r*0.3, r*0.07], [-r*0.1, r*0.1, r*0.05]].forEach(([cx2, cy2, cr]) => {
    ctx.beginPath();
    ctx.arc(x + cx2, y + cy2, cr, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
}

function drawRealisticStar(ctx, x, y, radius, alpha, color, flare) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const glowRadius = Math.max(radius * 5.5, 5);
  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  glow.addColorStop(0, color.replace(')', ', 0.70)').replace('rgb', 'rgba'));
  glow.addColorStop(0.45, color.replace(')', ', 0.16)').replace('rgb', 'rgba'));
  glow.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, radius * 1.05, radius * 0.82, -0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.arc(x - radius * 0.18, y - radius * 0.18, Math.max(radius * 0.36, 0.35), 0, Math.PI * 2);
  ctx.fill();

  if (flare > 0) {
    ctx.strokeStyle = color.replace(')', ', 0.82)').replace('rgb', 'rgba');
    ctx.lineWidth = Math.max(0.45, radius * 0.32);
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x - radius * (2.8 + flare), y);
    ctx.lineTo(x + radius * (2.8 + flare), y);
    ctx.moveTo(x, y - radius * (2.2 + flare * 0.75));
    ctx.lineTo(x, y + radius * (2.2 + flare * 0.75));
    ctx.stroke();

    if (flare > 1.1) {
      ctx.globalAlpha = alpha * 0.65;
      ctx.beginPath();
      ctx.moveTo(x - radius * 1.9, y - radius * 1.9);
      ctx.lineTo(x + radius * 1.9, y + radius * 1.9);
      ctx.moveTo(x - radius * 1.9, y + radius * 1.9);
      ctx.lineTo(x + radius * 1.9, y - radius * 1.9);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawStars(ctx, W, H, groundY, hour) {
  let starsAlpha = 0;
  if (hour >= 19 || hour < 5) {
    starsAlpha = 1;
    if (hour >= 19 && hour < 20) starsAlpha = smoothstep(19, 20, hour);
    if (hour >= 4 && hour < 5) starsAlpha = 1 - smoothstep(4, 5, hour);
  }
  if (starsAlpha <= 0) return;

  const starCount = 92;
  const skyTop = Math.max(8, H * 0.025);
  const skyBottom = Math.max(skyTop + 1, groundY * 0.70);
  const skyHeight = skyBottom - skyTop;
  const now = Date.now();
  const palette = ['rgb(255,252,226)', 'rgb(225,238,255)', 'rgb(255,232,198)', 'rgb(235,245,255)'];

  ctx.save();
  for (let i = 0; i < starCount; i++) {
    const xSeed = (Math.sin((i + 1) * 12.9898) * 43758.5453) % 1;
    const ySeed = (Math.sin((i + 7) * 78.233) * 24634.6345) % 1;
    const sizeSeed = Math.abs((Math.sin((i + 13) * 41.711) * 12653.873) % 1);
    const twinkleSeed = Math.abs((Math.sin((i + 19) * 19.19) * 9142.135) % 1);

    const sx = ((i * 0.61803398875 + Math.abs(xSeed) * 0.28) % 1) * W;
    const sy = skyTop + Math.pow(Math.abs(ySeed), 1.22) * skyHeight;
    const horizonFade = 1 - smoothstep(groundY * 0.58, groundY * 0.72, sy) * 0.55;
    const twinkle = 0.72 + 0.28 * Math.sin(now / (950 + twinkleSeed * 900) + i * 2.37);
    const isBright = i % 17 === 0 || i % 29 === 0;
    const isMedium = i % 7 === 0 || i % 11 === 0;
    const radius = isBright ? 1.65 + sizeSeed * 0.75 : isMedium ? 1.05 + sizeSeed * 0.42 : 0.45 + sizeSeed * 0.45;
    const alpha = starsAlpha * horizonFade * twinkle * (isBright ? 0.92 : isMedium ? 0.72 : 0.56);
    const color = palette[i % palette.length];
    const flare = isBright ? 1.35 + sizeSeed * 0.9 : isMedium ? 0.35 + sizeSeed * 0.35 : 0;

    drawRealisticStar(ctx, sx, sy, radius, alpha, color, flare);
  }
  ctx.restore();
}

function drawSun(ctx, x, y, r, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;

  const sunGlow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.5);
  sunGlow.addColorStop(0, 'rgba(255,230,80,0.35)');
  sunGlow.addColorStop(0.5, 'rgba(255,200,40,0.12)');
  sunGlow.addColorStop(1, 'rgba(255,180,0,0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = 'rgba(255,220,60,0.55)';
  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.rotate((i / 12) * Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(r + 4, 0);
    ctx.lineTo(r + 18 + (i % 3 === 0 ? 8 : 0), 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  const sunBodyGrad = ctx.createRadialGradient(x - r*0.25, y - r*0.25, 2, x, y, r);
  sunBodyGrad.addColorStop(0, '#fffbe0');
  sunBodyGrad.addColorStop(0.4, '#ffe44a');
  sunBodyGrad.addColorStop(1, '#ffb800');
  ctx.fillStyle = sunBodyGrad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.restore();
}

// =============================================
// CAMBIO 3: Dibujar palo real en el suelo (grande y grueso)
// Reemplaza el tronco horizontal genérico con un palo de madera
// auténtico: corteza rugosa, fibras de madera, anillos en los extremos,
// nudos, sombra natural, raíces expuestas en los cortes.
// =============================================
function drawRealisticGroundLog(ctx, logX, logY, logW, logH) {
  const cx = logX + logW / 2;
  const cy = logY + logH / 2;

  // Sombra debajo del tronco
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, logY + logH + 5, logW * 0.48, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Cuerpo principal del tronco con gradiente de corteza
  const bodyGrad = ctx.createLinearGradient(logX, logY, logX, logY + logH);
  bodyGrad.addColorStop(0,    '#7a4c1e');  // parte superior más clara (iluminada)
  bodyGrad.addColorStop(0.25, '#6b3f18');
  bodyGrad.addColorStop(0.55, '#5a3210');
  bodyGrad.addColorStop(0.85, '#4a2a0d');  // parte inferior más oscura (sombra)
  bodyGrad.addColorStop(1,    '#3a200a');
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#2d1a05';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(logX, logY, logW, logH, [3, 3, 5, 5]);
  ctx.fill();
  ctx.stroke();

  // Textura de corteza: líneas horizontales irregulares
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(logX, logY, logW, logH, [3, 3, 5, 5]);
  ctx.clip();

  ctx.strokeStyle = 'rgba(30,12,3,0.35)';
  ctx.lineWidth = 1;
  const barkLines = 8;
  for (let i = 0; i < barkLines; i++) {
    const ly = logY + 3 + (i / barkLines) * (logH - 6);
    const wobble = (Math.sin(i * 2.3 + 1) * 2);
    ctx.beginPath();
    ctx.moveTo(logX + 4, ly + wobble);
    ctx.bezierCurveTo(
      logX + logW * 0.25, ly + Math.sin(i * 1.7) * 2.5,
      logX + logW * 0.65, ly + Math.cos(i * 2.1) * 2.5,
      logX + logW - 4, ly + wobble * 0.5
    );
    ctx.stroke();
  }

  // Fisuras verticales de la corteza
  ctx.strokeStyle = 'rgba(20,8,0,0.3)';
  ctx.lineWidth = 0.8;
  const fissures = [0.18, 0.32, 0.52, 0.68, 0.82];
  fissures.forEach(fx => {
    const x0 = logX + fx * logW;
    const len = logH * (0.3 + Math.sin(fx * 13) * 0.25);
    const startY = logY + logH * 0.1 + Math.cos(fx * 7) * logH * 0.1;
    ctx.beginPath();
    ctx.moveTo(x0, startY);
    ctx.bezierCurveTo(
      x0 + Math.sin(fx * 5) * 3, startY + len * 0.4,
      x0 - Math.sin(fx * 7) * 2, startY + len * 0.7,
      x0 + Math.sin(fx * 3) * 2, startY + len
    );
    ctx.stroke();
  });

  // Nudo de madera (knothole)
  const knot1X = logX + logW * 0.42;
  const knot1Y = logY + logH * 0.45;
  ctx.fillStyle = 'rgba(40,18,5,0.5)';
  ctx.beginPath();
  ctx.ellipse(knot1X, knot1Y, 7, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,8,2,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(20,8,2,0.7)';
  ctx.beginPath();
  ctx.ellipse(knot1X, knot1Y, 3.5, 2.5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Brillo superior (iluminación)
  const highlightGrad = ctx.createLinearGradient(logX, logY, logX, logY + logH * 0.4);
  highlightGrad.addColorStop(0, 'rgba(255,200,140,0.18)');
  highlightGrad.addColorStop(1, 'rgba(255,200,140,0)');
  ctx.fillStyle = highlightGrad;
  ctx.fillRect(logX, logY, logW, logH * 0.4);

  ctx.restore();

  // ===== CARA IZQUIERDA DEL CORTE (sección transversal) =====
  const leftR = logH * 0.55;
  const leftCX = logX;
  const leftCY = logY + logH / 2;

  // Sombra de la cara
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(leftCX - 2, leftCY + 2, leftR * 0.52, leftR, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cara de corte principal
  const cutFaceGrad = ctx.createRadialGradient(leftCX - leftR * 0.15, leftCY - leftR * 0.1, leftR * 0.05, leftCX, leftCY, leftR);
  cutFaceGrad.addColorStop(0,   '#e8b87a');  // médula central
  cutFaceGrad.addColorStop(0.12,'#d4a060');  // zona interna
  cutFaceGrad.addColorStop(0.35,'#b87c40');
  cutFaceGrad.addColorStop(0.65,'#9a6030');
  cutFaceGrad.addColorStop(0.85,'#7a4820');
  cutFaceGrad.addColorStop(1,   '#5a3010');  // corteza exterior
  ctx.fillStyle = cutFaceGrad;
  ctx.strokeStyle = '#3d2208';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(leftCX, leftCY, leftR * 0.52, leftR, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Anillos de crecimiento en la cara izquierda
  ctx.save();
  const ringColors = [
    'rgba(80,42,12,0.5)',
    'rgba(70,35,10,0.45)',
    'rgba(90,50,18,0.4)',
    'rgba(75,40,12,0.38)',
    'rgba(60,30,8,0.35)',
    'rgba(80,45,15,0.3)',
  ];
  const ringCount = 6;
  for (let r = ringCount; r >= 1; r--) {
    const frac = r / ringCount;
    ctx.strokeStyle = ringColors[r - 1];
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(leftCX, leftCY, leftR * 0.52 * frac * 0.92, leftR * frac * 0.92, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Médula central
  ctx.fillStyle = '#f0c88a';
  ctx.beginPath();
  ctx.ellipse(leftCX, leftCY, leftR * 0.08, leftR * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ===== CARA DERECHA DEL CORTE =====
  const rightCX = logX + logW;
  const rightCY = logY + logH / 2;
  const rightR = logH * 0.55;

  // Cara de corte principal derecha (más oscura por la sombra)
  const cutFaceGradR = ctx.createRadialGradient(rightCX + rightR * 0.1, rightCY - rightR * 0.15, rightR * 0.05, rightCX, rightCY, rightR);
  cutFaceGradR.addColorStop(0,   '#d4a060');
  cutFaceGradR.addColorStop(0.2, '#b87a38');
  cutFaceGradR.addColorStop(0.5, '#8a5822');
  cutFaceGradR.addColorStop(0.85,'#6a3e18');
  cutFaceGradR.addColorStop(1,   '#4a2810');
  ctx.fillStyle = cutFaceGradR;
  ctx.strokeStyle = '#3d2208';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(rightCX, rightCY, rightR * 0.52, rightR, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Anillos en cara derecha
  ctx.save();
  for (let r = ringCount; r >= 1; r--) {
    const frac = r / ringCount;
    ctx.strokeStyle = ringColors[r - 1];
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(rightCX, rightCY, rightR * 0.52 * frac * 0.92, rightR * frac * 0.92, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#d8a060';
  ctx.beginPath();
  ctx.ellipse(rightCX, rightCY, rightR * 0.07, rightR * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// =============================================
// LUMBERJACK SPRITE
// El hombro permanece fijo; solo la parte inferior del hacha se balancea.
// =============================================
function drawLumberjack(ctx, cx, groundY, chopAngle) {
  ctx.save();
  ctx.translate(cx, groundY);

  const s = 0.72;

  // Sombra orientada hacia el tronco.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(6*s, -2, 20*s, 5*s, 0, 0, Math.PI*2);
  ctx.fill();

  // ===== CUERPO COMPLETO DE PERFIL: mirando a la DERECHA =====
  // Pierna trasera, ligeramente retirada para que el sprite deje de verse frontal.
  ctx.fillStyle = '#20324f';
  ctx.strokeStyle = '#142038';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-9*s, -31*s, 9*s, 21*s, 2*s);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#2b3f63';
  ctx.strokeStyle = '#1a2540';
  ctx.beginPath();
  ctx.roundRect(1*s, -32*s, 10*s, 23*s, 2*s);
  ctx.fill(); ctx.stroke();

  // Botas de perfil, con las puntas apuntando hacia la derecha.
  ctx.fillStyle = '#3a2510';
  ctx.strokeStyle = '#1e1208';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-10*s, -12*s, 16*s, 8*s, 2*s);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(1*s, -12*s, 17*s, 8*s, 2*s);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#251608';
  ctx.beginPath();
  ctx.ellipse(6*s, -8*s, 4*s, 3*s, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(18*s, -8*s, 4*s, 3*s, 0, 0, Math.PI*2);
  ctx.fill();

  // Torso de perfil: espalda a la izquierda y pecho/hombro girados a la derecha.
  const shirtGrad = ctx.createLinearGradient(-13*s, -54*s, 18*s, -30*s);
  shirtGrad.addColorStop(0, '#8e1a10');
  shirtGrad.addColorStop(0.45, '#c0392b');
  shirtGrad.addColorStop(1, '#e04b3a');
  ctx.fillStyle = shirtGrad;
  ctx.strokeStyle = '#8e1a10';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-12*s, -54*s);
  ctx.quadraticCurveTo(3*s, -61*s, 16*s, -51*s);
  ctx.lineTo(13*s, -30*s);
  ctx.quadraticCurveTo(2*s, -25*s, -8*s, -29*s);
  ctx.lineTo(-14*s, -47*s);
  ctx.quadraticCurveTo(-15*s, -51*s, -12*s, -54*s);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Cuadros de la camisa siguiendo la silueta lateral.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-12*s, -54*s);
  ctx.quadraticCurveTo(3*s, -61*s, 16*s, -51*s);
  ctx.lineTo(13*s, -30*s);
  ctx.quadraticCurveTo(2*s, -25*s, -8*s, -29*s);
  ctx.lineTo(-14*s, -47*s);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1.5*s;
  for (let i = 0; i < 3; i++) {
    const ly = -49*s + i * 8*s;
    ctx.beginPath();
    ctx.moveTo(-15*s, ly); ctx.lineTo(17*s, ly - 2*s);
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const lx = -8*s + i * 9*s;
    ctx.beginPath();
    ctx.moveTo(lx, -58*s); ctx.lineTo(lx + 2*s, -28*s);
    ctx.stroke();
  }
  ctx.restore();

  // Tirante visible en el costado derecho.
  ctx.fillStyle = '#8B5E3C';
  ctx.strokeStyle = '#5D3A1A';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(5*s, -56*s, 4*s, 29*s, 1*s);
  ctx.fill(); ctx.stroke();

  // Brazo trasero recogido detrás del cuerpo.
  ctx.fillStyle = '#9f241b';
  ctx.strokeStyle = '#74130c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-14*s, -51*s, 9*s, 22*s, 3*s);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#c27c55';
  ctx.strokeStyle = '#8c5735';
  ctx.beginPath();
  ctx.ellipse(-9*s, -30*s, 5*s, 5*s, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  // Cuello.
  ctx.fillStyle = '#c27c55';
  ctx.strokeStyle = '#8c5735';
  ctx.beginPath();
  ctx.roundRect(4*s, -62*s, 7*s, 10*s, 2*s);
  ctx.fill(); ctx.stroke();

  // Cabeza de perfil: nariz, ojo y rostro apuntan a la derecha.
  ctx.fillStyle = '#d4956a';
  ctx.strokeStyle = '#a06840';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(8*s, -68*s, 11*s, 12*s, -0.08, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#d4956a';
  ctx.beginPath();
  ctx.moveTo(18*s, -68*s);
  ctx.lineTo(25*s, -65*s);
  ctx.lineTo(18*s, -62*s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#a06840';
  ctx.stroke();

  ctx.fillStyle = '#b87852';
  ctx.beginPath();
  ctx.ellipse(-2*s, -67*s, 3*s, 4*s, 0, 0, Math.PI*2);
  ctx.fill();

  // Pelo lateral y nuca.
  ctx.fillStyle = '#6b3e20';
  ctx.beginPath();
  ctx.ellipse(3*s, -75*s, 10*s, 6*s, -0.18, Math.PI, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-2*s, -68*s, 4*s, 9*s, 0.15, Math.PI/2, Math.PI*1.5);
  ctx.fill();

  // Ojo y ceja visibles de perfil.
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(14*s, -69*s, 1.5*s, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#4a2c10';
  ctx.lineWidth = 2*s;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(11*s, -73*s); ctx.lineTo(17*s, -74*s); ctx.stroke();

  // Sombrero girado hacia la derecha.
  ctx.fillStyle = '#3d2a0f';
  ctx.strokeStyle = '#1e1208';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(7*s, -78*s, 20*s, 5*s, -0.06, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4a3315';
  ctx.strokeStyle = '#1e1208';
  ctx.beginPath();
  ctx.roundRect(-2*s, -94*s, 20*s, 17*s, [4*s, 4*s, 0, 0]);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1a1208';
  ctx.beginPath();
  ctx.roundRect(-2*s, -82*s, 20*s, 4*s, 0);
  ctx.fill();

  // ===== BRAZO DELANTERO + HACHA A LA DERECHA =====
  // Hombro, brazo y manos quedan al frente del pecho para reforzar que todo el cuerpo mira al tronco.
  ctx.save();
  ctx.translate(15*s, -53*s);

  ctx.fillStyle = '#c0392b';
  ctx.strokeStyle = '#8e1a10';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-3*s, 0, 9*s, 33*s, 3*s);
  ctx.fill(); ctx.stroke();

  const axeGripY = 7 * s;

  ctx.fillStyle = '#d4956a';
  ctx.strokeStyle = '#a06840';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(2*s, axeGripY, 5*s, 5*s, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  // La parte inferior del hacha balancea hacia la derecha desde la mano superior.
  ctx.save();
  ctx.translate(2*s, axeGripY);
  ctx.rotate(chopAngle);

  ctx.fillStyle = '#8B5E3C';
  ctx.strokeStyle = '#5D3A1A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-2*s, 0, 5*s, 39*s, 2*s);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#d4956a';
  ctx.strokeStyle = '#a06840';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 29*s, 5*s, 5*s, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  // Hoja del hacha orientada hacia el tronco, a la derecha del personaje.
  ctx.fillStyle = '#9e9e9e';
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const bladeY = 39 * s;
  ctx.moveTo(2*s, bladeY);
  ctx.lineTo(19*s, bladeY - 10*s);
  ctx.lineTo(22*s, bladeY + 1*s);
  ctx.lineTo(18*s, bladeY + 15*s);
  ctx.lineTo(2*s, bladeY + 5*s);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(5*s, bladeY - 1*s);
  ctx.lineTo(17*s, bladeY + 5*s);
  ctx.stroke();

  ctx.fillStyle = '#777';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2*s, bladeY - 2*s);
  ctx.lineTo(-6*s, bladeY + 2*s);
  ctx.lineTo(-2*s, bladeY + 6*s);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.restore();
  ctx.restore();
  ctx.restore();
}


function drawScene() {
  const W = canvas.width, H = canvas.height;

  updateTimeSystem();

  let sx = 0, sy = 0;
  if (shakeTimer > 0) {
    shakeTimer--;
    sx = (Math.random() - 0.5) * shakeIntensity;
    sy = (Math.random() - 0.5) * shakeIntensity;
    shakeIntensity *= 0.88;
    if (shakeTimer === 0) { sx = 0; sy = 0; }
  }

  ctx.save();
  ctx.translate(sx, sy);
  ctx.clearRect(-10, -10, W + 20, H + 20);

  const { groundY, logX, logY, spriteX, spriteGroundY } = getSceneAnchors(W, H);
  const hour = getGameHour();
  const night = isNight();

  // ===== CIELO =====
  const skyGrad = getSkyGradient(ctx, H, hour);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, groundY);

  // ===== ESTRELLAS =====
  drawStars(ctx, W, H, groundY, hour);

  // ===== SOL Y LUNA =====
  const celestialBodies = getCelestialBodies(W, H);
  celestialBodies.forEach(body => {
    if (body.type === 'sun') {
      drawSun(ctx, body.x, body.y, body.r, body.opacity);
    } else {
      drawMoon(ctx, body.x, body.y, body.r, body.opacity);
    }
  });

  // ===== MONTAÑAS TRASERAS =====
  const mColors = getMountainColors(hour);

  ctx.fillStyle = mColors.far;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(0, H * 0.42);
  ctx.lineTo(W * 0.08, H * 0.25);
  ctx.lineTo(W * 0.18, H * 0.38);
  ctx.lineTo(W * 0.28, H * 0.18);
  ctx.lineTo(W * 0.38, H * 0.32);
  ctx.lineTo(W * 0.50, H * 0.14);
  ctx.lineTo(W * 0.60, H * 0.30);
  ctx.lineTo(W * 0.70, H * 0.20);
  ctx.lineTo(W * 0.80, H * 0.35);
  ctx.lineTo(W * 0.90, H * 0.22);
  ctx.lineTo(W, H * 0.38);
  ctx.lineTo(W, groundY);
  ctx.closePath();
  ctx.fill();

  if (hour > 6 && hour < 17) {
    const snowAlpha = hour < 8 ? smoothstep(6, 8, hour) : (hour > 16 ? 1 - smoothstep(16, 17, hour) : 1);
    ctx.globalAlpha = snowAlpha * 0.72;
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    const farPeaks = [
      [W*0.08, H*0.25], [W*0.28, H*0.18], [W*0.50, H*0.14],
      [W*0.70, H*0.20], [W*0.90, H*0.22]
    ];
    farPeaks.forEach(([px, py]) => {
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - W*0.06, py + H*0.07);
      ctx.lineTo(px + W*0.06, py + H*0.07);
      ctx.closePath();
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = mColors.mid;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(0, H * 0.52);
  ctx.lineTo(W * 0.12, H * 0.35);
  ctx.lineTo(W * 0.24, H * 0.50);
  ctx.lineTo(W * 0.37, H * 0.30);
  ctx.lineTo(W * 0.50, H * 0.48);
  ctx.lineTo(W * 0.62, H * 0.34);
  ctx.lineTo(W * 0.76, H * 0.50);
  ctx.lineTo(W * 0.88, H * 0.36);
  ctx.lineTo(W, H * 0.52);
  ctx.lineTo(W, groundY);
  ctx.closePath();
  ctx.fill();

  const mistGrad = ctx.createLinearGradient(0, groundY * 0.55, 0, groundY * 0.75);
  mistGrad.addColorStop(0, 'rgba(200,230,255,0)');
  mistGrad.addColorStop(1, 'rgba(200,230,255,0.12)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, groundY * 0.55, W, groundY * 0.2);

  // ===== ÁRBOLES DE FONDO =====
  const bgTrees = [
    { x: W*0.03, scale: 1.10 },
    { x: W*0.17, scale: 1.40 },
    { x: W*0.32, scale: 1.20 },
    { x: W*0.68, scale: 1.30 },
    { x: W*0.83, scale: 1.44 },
    { x: W*0.97, scale: 1.16 },
  ];
  bgTrees.forEach(t => drawRealisticTree(ctx, t.x, groundY, t.scale));

  // ===== SUELO =====
  ctx.fillStyle = getGroundColor(hour);
  ctx.beginPath();
  ctx.rect(0, groundY, W, H - groundY);
  ctx.fill();

  // Hierba
  const grassColor = night ? '#255018' : '#4a8a3a';
  ctx.strokeStyle = grassColor;
  ctx.lineWidth = 1.5;
  for (let gx = 10; gx < W; gx += 18) {
    ctx.beginPath();
    ctx.moveTo(gx, groundY);
    ctx.lineTo(gx-4, groundY - 8);
    ctx.moveTo(gx+4, groundY);
    ctx.lineTo(gx, groundY - 10);
    ctx.stroke();
  }

  // ===== CAMBIO 3: TRONCO REALISTA EN EL SUELO =====
  const logW = W * 0.38, logH = 36;
  drawRealisticGroundLog(ctx, logX, logY, logW, logH);

  // ===== HP BAR =====
  if (logHPDisplay > logHP) {
    logHPDisplay = Math.max(logHP, logHPDisplay - 0.5);
  }
  drawHPBar(ctx, W, H);

  // ===== LOG PILE =====
  drawLogPile(ctx, W, H);

  // ===== FLYING LOG =====
  drawFlyingLog(ctx);

  // ===== LEÑADOR =====
  const maxSwing = 0.55;
  chopAngle += chopDir * 0.055;
  if (chopAngle > maxSwing) { chopDir = -1; }
  if (chopAngle < -0.15) { chopDir = 1; }

  drawLumberjack(ctx, spriteX, spriteGroundY, chopAngle - 0.25);

  // Chispas al golpear
  if (chopAngle < -0.10 && chopDir === 1) {
    const sx2 = spriteX + 20, sy2 = spriteGroundY - 22;
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI - Math.PI/2;
      const dist = Math.random() * 12 + 4;
      ctx.fillStyle = ['#FFD700','#FFA500','#FF8C00'][Math.floor(Math.random()*3)];
      ctx.beginPath();
      ctx.arc(sx2 + Math.cos(angle)*dist, sy2 + Math.sin(angle)*dist, 1.5, 0, Math.PI*2);
      ctx.fill();
    }
  }

  if (night) {
    ctx.fillStyle = 'rgba(30,50,120,0.04)';
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();

  animFrame = requestAnimationFrame(drawScene);
}

// =============================================
// GAME LOOP
// =============================================
let accumulator = 0;
let lastTime = Date.now();


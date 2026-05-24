function getGameHour() {
  const minutesInDay = TIME.gameMinutes % 1440;
  return minutesInDay / 60;
}

function getTimeLabel() {
  const minutesInDay = TIME.gameMinutes % 1440;
  let h = Math.floor(minutesInDay / 60);
  const m = minutesInDay % 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function isNight() {
  const h = getGameHour();
  return h >= 19 || h < 5;
}

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function getNightAlpha() {
  const h = getGameHour();
  if (h >= 6 && h < 17) return 0;
  if (h >= 17 && h < 18) return smoothstep(17, 18, h) * 0.04;
  if (h >= 18 && h < 19) return 0.04 + smoothstep(18, 19, h) * 0.04;
  if (h >= 19 || h < 4) {
    if (h >= 19 && h < 20) return 0.08 + smoothstep(19, 20, h) * 0.02;
    return 0.10;
  }
  if (h >= 4 && h < 5) return 0.10 - smoothstep(4, 5, h) * 0.05;
  if (h >= 5 && h < 6) return 0.05 - smoothstep(5, 6, h) * 0.05;
  return 0;
}

function updateTimeSystem() {
  const now = Date.now();
  const elapsed = now - TIME.lastRealSecond;
  if (elapsed >= 1000) {
    const minutesPassed = Math.floor(elapsed / 1000);
    TIME.lastRealSecond += minutesPassed * 1000;

    const prevDay = Math.floor(TIME.gameMinutes / 1440);
    TIME.gameMinutes += minutesPassed;
    const newDay = Math.floor(TIME.gameMinutes / 1440);
    if (newDay > prevDay) {
      TIME.day = newDay + 1;
    }

    document.getElementById('day-display').textContent = `Día: ${TIME.day}`;
    document.getElementById('clock-display').textContent = getTimeLabel();

    const alpha = getNightAlpha();
    document.getElementById('night-overlay').style.background = `rgba(5,10,40,${alpha})`;
  }
}

function getCelestialBodies(canvasW, canvasH) {
  const h = getGameHour();
  const bodies = [];
  const arcTopY = canvasH * 0.06;
  const sunR = 28;

  if (h >= 5 && h < 18) {
    const t = (h - 6) / 12;
    const rawT = Math.max(0, Math.min(1, t));
    const x = -sunR + (canvasW + sunR * 2) * rawT;
    const arcHeight = canvasH * 0.13;
    const y = arcTopY + arcHeight - Math.sin(Math.PI * rawT) * arcHeight;
    let opacity = 1;
    if (h >= 5 && h < 6) opacity = smoothstep(5, 6, h);
    if (h >= 17.5 && h < 18) opacity = 1 - smoothstep(17.5, 18, h);
    bodies.push({ type: 'sun', x, y, r: sunR, opacity });
  }

  const moonR = 22;
  const nightDuration = 9;
  let nightH = null;
  if (h >= 19) nightH = h - 19;
  else if (h < 4) nightH = h + 5;

  if (nightH !== null && nightH >= 0 && nightH <= nightDuration) {
    const t = nightH / nightDuration;
    const x = -moonR + (canvasW + moonR * 2) * t;
    const arcHeight = canvasH * 0.11;
    const y = arcTopY + arcHeight - Math.sin(Math.PI * t) * arcHeight;
    let opacity = 1;
    if (nightH < 0.5) opacity = smoothstep(0, 0.5, nightH);
    if (nightH > 8.5) opacity = 1 - smoothstep(8.5, 9, nightH);
    bodies.push({ type: 'moon', x, y, r: moonR, opacity });
  }

  return bodies;
}

function getSkyColors(hour) {
  const keyframes = [
    { h: 0,    top: '#0a0a2e', mid: '#0e0e38', bot: '#1a1a4a' },
    { h: 4,    top: '#0c0c30', mid: '#101040', bot: '#1c1c4c' },
    { h: 5,    top: '#1a1a50', mid: '#2a2a70', bot: '#3a3a80' },
    { h: 5.5,  top: '#3a2a60', mid: '#6a3a50', bot: '#9a6060' },
    { h: 6,    top: '#ff7043', mid: '#ffb74d', bot: '#ffe0b2' },
    { h: 7,    top: '#ff8a50', mid: '#ffc107', bot: '#d4e8b0' },
    { h: 8,    top: '#6eb5d4', mid: '#87ceeb', bot: '#b8e4a0' },
    { h: 12,   top: '#4a9fd4', mid: '#87ceeb', bot: '#b8e4a0' },
    { h: 16,   top: '#5aa8d8', mid: '#87ceeb', bot: '#b8e4a0' },
    { h: 17,   top: '#e0895a', mid: '#f0b080', bot: '#c0c880' },
    { h: 18,   top: '#c0542a', mid: '#e07040', bot: '#806040' },
    { h: 18.5, top: '#6a2a40', mid: '#9a4050', bot: '#4a3a40' },
    { h: 19,   top: '#1a1040', mid: '#1e1448', bot: '#282050' },
    { h: 20,   top: '#0a0a2e', mid: '#0e0e38', bot: '#1a1a4a' },
    { h: 24,   top: '#0a0a2e', mid: '#0e0e38', bot: '#1a1a4a' },
  ];

  let kf1 = keyframes[0], kf2 = keyframes[keyframes.length - 1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (hour >= keyframes[i].h && hour <= keyframes[i+1].h) {
      kf1 = keyframes[i];
      kf2 = keyframes[i+1];
      break;
    }
  }

  const t = kf2.h === kf1.h ? 0 : (hour - kf1.h) / (kf2.h - kf1.h);
  const st = t * t * (3 - 2 * t);

  function lerpColor(c1, c2, t) {
    const r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16);
    const r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16);
    const r = Math.round(r1 + (r2-r1)*t);
    const g = Math.round(g1 + (g2-g1)*t);
    const b = Math.round(b1 + (b2-b1)*t);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  return {
    top: lerpColor(kf1.top, kf2.top, st),
    mid: lerpColor(kf1.mid, kf2.mid, st),
    bot: lerpColor(kf1.bot, kf2.bot, st),
  };
}

function getSkyGradient(ctx, canvasH, hour) {
  const colors = getSkyColors(hour);
  const grad = ctx.createLinearGradient(0, 0, 0, canvasH * 0.60);
  grad.addColorStop(0, colors.top);
  grad.addColorStop(0.5, colors.mid);
  grad.addColorStop(1, colors.bot);
  return grad;
}

function getMountainColors(hour) {
  if (hour >= 20 || hour < 5) {
    return { far: '#2a3040', mid: '#222a20' };
  }
  if (hour >= 5 && hour < 6) {
    const t = smoothstep(5, 6, hour);
    return {
      far: lerpHex('#2a3040', '#5a6a80', t),
      mid: lerpHex('#222a20', '#3a5a3a', t),
    };
  }
  if (hour >= 18 && hour < 19) {
    const t = smoothstep(18, 19, hour);
    return {
      far: lerpHex('#8eacc8', '#3a4060', t),
      mid: lerpHex('#5a7a5a', '#2a3a2a', t),
    };
  }
  if (hour >= 19 && hour < 20) {
    const t = smoothstep(19, 20, hour);
    return {
      far: lerpHex('#3a4060', '#2a3040', t),
      mid: lerpHex('#2a3a2a', '#222a20', t),
    };
  }
  if (hour >= 17 && hour < 18) {
    const t = smoothstep(17, 18, hour);
    return {
      far: lerpHex('#8eacc8', '#7a8090', t),
      mid: lerpHex('#5a7a5a', '#4a5a4a', t),
    };
  }
  return { far: '#8eacc8', mid: '#5a7a5a' };
}

function getGroundColor(hour) {
  if (hour >= 20 || hour < 5) return '#1e3c14';
  if (hour >= 5 && hour < 6) return lerpHex('#1e3c14', '#5fa04a', smoothstep(5, 6, hour));
  if (hour >= 18 && hour < 20) return lerpHex('#5fa04a', '#1e3c14', smoothstep(18, 20, hour));
  return '#5fa04a';
}

function lerpHex(c1, c2, t) {
  const r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16);
  const r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16);
  const r = Math.round(r1 + (r2-r1)*t);
  const g = Math.round(g1 + (g2-g1)*t);
  const b = Math.round(b1 + (b2-b1)*t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

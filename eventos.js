(() => {
  const eventCanvas = document.getElementById('eventCv');
  if (!eventCanvas) return;

  const ctx = eventCanvas.getContext('2d');
  const eventSection = document.getElementById('s-events');
  const eventRing = eventCanvas.closest('.event-ring-wrap');

  function roundRect(g, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + radius, y);
    g.lineTo(x + w - radius, y);
    g.quadraticCurveTo(x + w, y, x + w, y + radius);
    g.lineTo(x + w, y + h - radius);
    g.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    g.lineTo(x + radius, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - radius);
    g.lineTo(x, y + radius);
    g.quadraticCurveTo(x, y, x + radius, y);
    g.closePath();
  }

  function getEventRingBounds(width, height) {
    const left = width * 0.12;
    const right = width * 0.88;
    const top = height * 0.15;
    const bottom = height * 0.85;
    return { left, right, top, bottom, width: right - left, height: bottom - top };
  }

  function drawEventRing(width, height) {
    const ring = getEventRingBounds(width, height);
    const centerX = (ring.left + ring.right) / 2;
    const centerY = (ring.top + ring.bottom) / 2;
    const minD = Math.min(width, height);
    const deckPad = Math.max(10, minD * 0.045);
    const elevation = Math.max(14, minD * 0.06);
    const postRadius = Math.max(5, minD * 0.018);
    const deckLeft = ring.left - deckPad;
    const deckRight = ring.right + deckPad;
    const deckTop = ring.top - deckPad;
    const deckBottom = ring.bottom + deckPad;

    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#050015');
    bg.addColorStop(0.48, '#090022');
    bg.addColorStop(1, '#101028');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const aura = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, width * 0.68);
    aura.addColorStop(0, 'rgba(0, 229, 255, .22)');
    aura.addColorStop(0.45, 'rgba(123, 31, 162, .16)');
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255,255,255,.035)';
    for (let y = height * 0.58; y < height; y += Math.max(8, minD * 0.035)) {
      ctx.fillRect(0, y, width, 1);
    }

    const trussLeft = width * 0.18;
    const trussRight = width * 0.82;
    const trussTop = height * 0.025;
    const trussBottom = height * 0.105;
    ctx.strokeStyle = '#140021';
    ctx.lineWidth = Math.max(4, minD * 0.018);
    ctx.strokeRect(trussLeft, trussTop, trussRight - trussLeft, trussBottom - trussTop);
    ctx.strokeStyle = '#673ab7';
    ctx.lineWidth = 1;
    ctx.strokeRect(trussLeft + 3, trussTop + 3, trussRight - trussLeft - 6, trussBottom - trussTop - 6);

    for (let i = 0; i < 14; i++) {
      const x = trussLeft + (i + 0.5) * (trussRight - trussLeft) / 14;
      ctx.fillStyle = i % 2 ? '#00e5ff' : '#ea80fc';
      ctx.beginPath();
      ctx.arc(x, trussBottom, Math.max(2, minD * 0.008), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(0,0,0,.52)';
    roundRect(ctx, deckLeft + 8, deckTop + elevation, deckRight - deckLeft, deckBottom - deckTop, 4);
    ctx.fill();

    const steel = ctx.createLinearGradient(deckLeft, deckTop, deckRight, deckBottom);
    steel.addColorStop(0, '#240037');
    steel.addColorStop(0.5, '#4a0072');
    steel.addColorStop(1, '#006064');
    ctx.fillStyle = steel;
    ctx.fillRect(deckLeft, deckBottom, deckRight - deckLeft, elevation);
    ctx.fillRect(deckRight, deckTop, deckPad, elevation + deckBottom - deckTop);

    ctx.strokeStyle = 'rgba(128, 216, 255, .38)';
    ctx.lineWidth = 1;
    for (let x = deckLeft + 8; x < deckRight; x += Math.max(14, ring.width / 7)) {
      ctx.beginPath();
      ctx.moveTo(x, deckBottom);
      ctx.lineTo(x + elevation * 0.55, deckBottom + elevation);
      ctx.stroke();
    }

    const planks = ctx.createLinearGradient(0, deckTop, 0, deckBottom);
    planks.addColorStop(0, '#2e0050');
    planks.addColorStop(1, '#004d57');
    ctx.fillStyle = planks;
    for (let i = 0; i < 9; i++) {
      const y = deckTop + i * (deckBottom - deckTop) / 9;
      ctx.globalAlpha = i % 2 ? 0.86 : 1;
      ctx.fillRect(deckLeft, y, deckRight - deckLeft, (deckBottom - deckTop) / 9 + 1);
    }
    ctx.globalAlpha = 1;

    const apron = ctx.createLinearGradient(0, deckBottom, 0, deckBottom + elevation * 0.82);
    apron.addColorStop(0, '#6a1b9a');
    apron.addColorStop(0.55, '#240046');
    apron.addColorStop(1, '#05000c');
    ctx.fillStyle = apron;
    ctx.fillRect(deckLeft + deckPad * 0.28, deckBottom, deckRight - deckLeft - deckPad * 0.28, elevation * 0.82);
    ctx.fillStyle = '#80deea';
    ctx.font = `900 ${Math.max(10, minD * 0.045)}px Segoe UI, Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,229,255,.75)';
    ctx.shadowBlur = 8;
    ctx.fillText('EVENTOS', centerX, deckBottom + elevation * 0.42);
    ctx.shadowBlur = 0;

    const mat = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, ring.width * 0.62);
    mat.addColorStop(0, '#311b92');
    mat.addColorStop(0.62, '#1a237e');
    mat.addColorStop(1, '#071047');
    ctx.fillStyle = mat;
    ctx.fillRect(ring.left, ring.top, ring.width, ring.height);

    ctx.strokeStyle = 'rgba(128, 216, 255, .22)';
    ctx.lineWidth = 1;
    for (let x = ring.left + ring.width / 4; x < ring.right; x += ring.width / 4) {
      ctx.beginPath();
      ctx.moveTo(x, ring.top);
      ctx.lineTo(x, ring.bottom);
      ctx.stroke();
    }
    for (let y = ring.top + ring.height / 4; y < ring.bottom; y += ring.height / 4) {
      ctx.beginPath();
      ctx.moveTo(ring.left, y);
      ctx.lineTo(ring.right, y);
      ctx.stroke();
    }

    ctx.lineCap = 'round';
    const ropeOffsets = [0.10, 0.24, 0.38, 0.52].map(value => Math.max(5, minD * 0.025) + value * Math.max(24, minD * 0.12));
    ropeOffsets.forEach(offset => {
      const ropes = [
        [ring.left, ring.top + offset, ring.right, ring.top + offset],
        [ring.left, ring.bottom - offset, ring.right, ring.bottom - offset],
        [ring.left + offset, ring.top, ring.left + offset, ring.bottom],
        [ring.right - offset, ring.top, ring.right - offset, ring.bottom]
      ];
      ctx.strokeStyle = 'rgba(0,0,0,.5)';
      ctx.lineWidth = Math.max(3, minD * 0.013);
      ropes.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = Math.max(2, minD * 0.009);
      ropes.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
    });
    ctx.lineCap = 'butt';

    ctx.fillStyle = '#050015';
    [ring.left + ring.width / 3, ring.left + 2 * ring.width / 3].forEach(x => {
      roundRect(ctx, x - 3, ring.top + ropeOffsets[0] - 5, 6, ropeOffsets[3] - ropeOffsets[0] + 10, 2);
      ctx.fill();
      roundRect(ctx, x - 3, ring.bottom - ropeOffsets[3] - 5, 6, ropeOffsets[3] - ropeOffsets[0] + 10, 2);
      ctx.fill();
    });
    [ring.top + ring.height / 3, ring.top + 2 * ring.height / 3].forEach(y => {
      roundRect(ctx, ring.left + ropeOffsets[0] - 5, y - 3, ropeOffsets[3] - ropeOffsets[0] + 10, 6, 2);
      ctx.fill();
      roundRect(ctx, ring.right - ropeOffsets[3] - 5, y - 3, ropeOffsets[3] - ropeOffsets[0] + 10, 6, 2);
      ctx.fill();
    });

    [
      { x: ring.left, y: ring.top, color: '#00e5ff' },
      { x: ring.right, y: ring.top, color: '#ea80fc' },
      { x: ring.left, y: ring.bottom, color: '#7c4dff' },
      { x: ring.right, y: ring.bottom, color: '#18ffff' }
    ].forEach(({ x, y, color }) => {
      const left = x < centerX;
      const top = y < centerY;
      const padWidth = Math.max(7, minD * 0.026);
      const padLength = Math.max(28, minD * 0.15);
      const grad = ctx.createRadialGradient(x - postRadius * 0.35, y - postRadius * 0.35, 1, x, y, postRadius * 1.7);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.26, color);
      grad.addColorStop(1, '#12001f');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, postRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.62)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = color;
      roundRect(ctx, left ? x + postRadius * 0.25 : x - padWidth - postRadius * 0.25, top ? y + postRadius * 0.2 : y - padLength - postRadius * 0.2, padWidth, padLength, 3);
      ctx.fill();
      roundRect(ctx, left ? x + postRadius * 0.2 : x - padLength - postRadius * 0.2, top ? y + postRadius * 0.25 : y - padWidth - postRadius * 0.25, padLength, padWidth, 3);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(0,229,255,.38)';
    ctx.lineWidth = 1;
    ctx.strokeRect(ring.left, ring.top, ring.width, ring.height);
    ctx.strokeStyle = 'rgba(234,128,252,.52)';
    ctx.lineWidth = 2;
    ctx.strokeRect(deckLeft, deckTop, deckRight - deckLeft, deckBottom - deckTop);
  }

  function resizeEventRing() {
    if (!eventRing) return;
    const rect = eventRing.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    if (eventCanvas.width !== width || eventCanvas.height !== height) {
      eventCanvas.width = width;
      eventCanvas.height = height;
    }
    drawEventRing(width, height);
  }

  function refreshWhenVisible() {
    if (!eventSection || eventSection.classList.contains('active')) {
      requestAnimationFrame(resizeEventRing);
    }
  }


  const eventSpecA = document.getElementById('eventSpecA');
  const eventSpecB = document.getElementById('eventSpecB');
  const EVENT_ENTRY_COST = 500;
  const EVENT_MIN_POWER = 1;
  const EVENT_MAX_POWER = 50;
  const EVENT_SIZE = 20;
  const EVENT_NAMES = ['KIBA','ROCK','NEJI','GAARA','LEE','KANKURO','CHOJI','SHINO','KIMI','ZABU','HIDAN','KISAME','ITACHI','MADARA','OBITO','PAIN','OROCHI','JIRAI','MINATO','KAKASHI','RAIKAGE','TOBIRAMA'];
  const T = {
    started:false,
    inFight:false,
    participants:[],
    survivors:[],
    pairs:[],
    currentOpponent:null,
    message:''
  };

  function fmtEventN(n) {
    if (typeof fmtN === 'function') return fmtN(n);
    return String(Math.max(0, Math.round(Number(n) || 0)));
  }

  function eventPlayerPower() {
    return typeof playerPowerFromStats === 'function' ? playerPowerFromStats() : 1;
  }

  function activateTab(tabName) {
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.t === tabName));
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    const target = document.getElementById('s-' + tabName);
    if (target) target.classList.add('active');
    if (tabName === 'fight' && typeof rszCv === 'function') rszCv();
    if (tabName === 'events') refreshWhenVisible();
  }

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function makeEventFighter(isPlayer, power, stats) {
    const fighter = typeof mkFighter === 'function'
      ? mkFighter(isPlayer, 0, 0, isPlayer ? null : stats)
      : { col:isPlayer ? '#42a5f5' : '#ef5350', col2:isPlayer ? '#1565c0' : '#b71c1c', glowCol:isPlayer ? 'rgba(66,165,245,.25)' : 'rgba(239,83,80,.25)', isP:isPlayer };
    if (typeof syncFighterStats === 'function') syncFighterStats(fighter);
    fighter.power = power;
    fighter.statPoints = stats || null;
    return fighter;
  }

  function buildParticipant(id, isPlayer) {
    const power = isPlayer ? eventPlayerPower() : randomInt(EVENT_MIN_POWER, EVENT_MAX_POWER);
    const stats = isPlayer ? null : distributeEnemyStats(power);
    return {
      id,
      isPlayer,
      name:isPlayer ? 'TÚ' : EVENT_NAMES[(id - 1) % EVENT_NAMES.length] + ' #' + id,
      power,
      stats,
      fighter:makeEventFighter(isPlayer, power, stats),
      eliminated:false,
      champion:false,
      lastResult:null,
      bye:false
    };
  }

  function participantCard(p, side) {
    if (!p) return '<div class="event-participant empty">DESCANSA</div>';
    const state = p.eliminated ? ' eliminated' : (p.champion ? ' champion' : '');
    const tag = p.isPlayer ? '<span class="event-you">TU JUGADOR</span>' : '';
    return `<div class="event-participant ${side}${state}">
      <canvas class="event-mini-sprite" width="64" height="64" data-pid="${p.id}"></canvas>
      <div class="event-p-name">${p.name}</div>
      ${tag}
      <div class="event-p-power">Poder ${fmtEventN(p.power)}</div>
    </div>`;
  }

  function drawParticipantSprites() {
    document.querySelectorAll('.event-mini-sprite').forEach(canvas => {
      const id = Number(canvas.dataset.pid);
      const p = T.participants.find(item => item.id === id);
      if (p && typeof drawSpriteSnapshot === 'function') drawSpriteSnapshot(canvas.getContext('2d'), p.fighter);
    });
  }

  function renderInfo() {
    if (!eventSpecA || !eventSpecB) return;
    if (eventRing) eventRing.style.display = '';
    eventSpecA.innerHTML = `<div class="event-info">
      <div class="event-title">🏆 COMPETENCIA DE LUCHA</div>
      <p>Evento de eliminación con <b>${EVENT_SIZE} jugadores</b> y combates <b>1 vs 1</b>.</p>
      <ul>
        <li>Participan rivales entre <b>${EVENT_MIN_POWER}</b> y <b>${EVENT_MAX_POWER}</b> de poder.</li>
        <li>Entrada obligatoria: <b>${EVENT_ENTRY_COST} 💰</b>.</li>
        <li>Los 19 rivales reparten su poder al azar entre los 6 slots de LUCHA: Ataque, Defensa, HP, Velocidad, Evasión y Crítico.</li>
      </ul>
      <button class="event-pay-btn" type="button" id="eventPayBtn">PAGAR ${EVENT_ENTRY_COST} 💰</button>
      <div class="event-msg">${T.message || 'Paga la inscripción para generar la tabla del torneo.'}</div>
    </div>`;
    eventSpecB.innerHTML = `<div class="event-side-note">
      <div class="event-side-icon">🎪</div>
      <b>Reglas del torneo</b>
      <span>Si ganas, avanzas y se escoge el siguiente oponente al azar.</span>
      <span>Si pierdes, el botón cambia a RETIRARSE y podrás iniciar otro torneo pagando de nuevo.</span>
    </div>`;
    const payBtn = document.getElementById('eventPayBtn');
    if (payBtn) payBtn.addEventListener('click', startTournament);
  }

  function renderTournament(actionLabel) {
    if (!eventSpecA || !eventSpecB) return;
    if (eventRing) eventRing.style.display = 'none';
    const rows = T.pairs.map((pair, index) => `<div class="event-match">
      <div class="event-match-head">Combate ${index + 1}</div>
      <div class="event-match-body">${participantCard(pair.a, 'left')}<div class="event-vs">VS</div>${participantCard(pair.b, 'right')}</div>
    </div>`).join('');
    const allPlayers = T.participants.map(p => participantCard(p, 'grid')).join('');
    const alive = T.participants.filter(p => !p.eliminated).length;
    eventSpecA.innerHTML = `<div class="event-bracket">
      <div class="event-title">🏆 TABLA DEL TORNEO</div>
      <div class="event-status">${T.message || `Participantes activos: ${alive}/${EVENT_SIZE}`}</div>
      <div class="event-matches">${rows}</div>
      <button class="event-fight-btn" type="button" id="eventActionBtn">${actionLabel}</button>
    </div>`;
    eventSpecB.innerHTML = `<div class="event-roster">
      <div class="event-roster-title">20 Participantes</div>
      <div class="event-roster-grid">${allPlayers}</div>
    </div>`;
    drawParticipantSprites();
    const actionBtn = document.getElementById('eventActionBtn');
    if (actionBtn) actionBtn.addEventListener('click', () => {
      if (actionLabel === 'RETIRARSE') retireTournament();
      else launchPlayerFight();
    });
  }

  function startTournament() {
    const st = window.ST;
    if (!st) return;
    if ((Number(st.gold) || 0) < EVENT_ENTRY_COST) {
      T.message = `No tienes suficiente oro. Necesitas ${EVENT_ENTRY_COST} 💰 para participar.`;
      renderInfo();
      return;
    }
    st.gold -= EVENT_ENTRY_COST;
    T.started = true;
    T.inFight = false;
    T.currentOpponent = null;
    T.message = 'Inscripción pagada. Estos son los combates iniciales del evento.';
    T.participants = [buildParticipant(1, true)];
    for (let i = 2; i <= EVENT_SIZE; i++) T.participants.push(buildParticipant(i, false));
    T.survivors = shuffle(T.participants);
    if (typeof updUI === 'function') updUI();
    if (typeof saveGameNow === 'function') saveGameNow();
    buildNextRound();
  }

  function buildNextRound() {
    const player = T.participants.find(p => p.isPlayer);
    if (!player || player.eliminated) {
      T.message = 'Has sido eliminado del torneo.';
      renderTournament('RETIRARSE');
      return;
    }
    const active = shuffle(T.survivors.filter(p => !p.eliminated));
    if (active.length <= 1) {
      player.champion = true;
      T.message = '🏆 ¡GANASTE LA COMPETENCIA DE LUCHA!';
      renderTournament('RETIRARSE');
      return;
    }
    const opponents = active.filter(p => !p.isPlayer);
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    const rest = active.filter(p => p !== player && p !== opponent);
    T.currentOpponent = opponent;
    T.pairs = [{ a:player, b:opponent, playerMatch:true }];
    for (let i = 0; i < rest.length; i += 2) T.pairs.push({ a:rest[i], b:rest[i + 1] || null, playerMatch:false });
    T.message = `Tu siguiente rival es ${opponent.name}. Presiona LUCHAR para comenzar.`;
    renderTournament('LUCHAR');
  }

  function launchPlayerFight() {
    const player = T.participants.find(p => p.isPlayer);
    const opponent = T.currentOpponent;
    if (!player || !opponent || player.eliminated) return;
    const fightCanvas = document.getElementById('cv');
    const w = (fightCanvas && fightCanvas.width) || 320;
    const h = (fightCanvas && fightCanvas.height) || 260;
    const cX = w / 2;
    const cY = h / 2;
    const p1 = makeEventFighter(true, player.power, null);
    const p2 = makeEventFighter(false, opponent.power, opponent.stats);
    p1.x = cX - 55; p1.y = cY; p2.x = cX + 55; p2.y = cY;
    p1.power = player.power; p2.power = opponent.power; p2.statPoints = opponent.stats;
    window.F.pendingEnemy = { p1, p2 };
    window.F.currentPlayerPow = player.power;
    window.F.currentEnemyPow = opponent.power;
    window.F.enemyName = opponent.name;
    T.inFight = true;
    activateTab('fight');
    if (typeof startFight === 'function') startFight();
  }

  function resolveCpuMatches() {
    const winners = [];
    const player = T.participants.find(p => p.isPlayer);
    if (player && !player.eliminated) winners.push(player);
    T.pairs.forEach(pair => {
      if (pair.playerMatch) return;
      if (!pair.b) {
        pair.a.bye = true;
        winners.push(pair.a);
        return;
      }
      const scoreA = pair.a.power + randomInt(1, 50);
      const scoreB = pair.b.power + randomInt(1, 50);
      const winner = scoreA >= scoreB ? pair.a : pair.b;
      const loser = winner === pair.a ? pair.b : pair.a;
      loser.eliminated = true;
      loser.lastResult = 'lost';
      winner.lastResult = 'won';
      winners.push(winner);
    });
    T.survivors = winners;
  }

  function handleFightEnd(won) {
    T.inFight = false;
    const player = T.participants.find(p => p.isPlayer);
    const opponent = T.currentOpponent;
    if (won) {
      if (opponent) {
        opponent.eliminated = true;
        opponent.lastResult = 'lost';
      }
      if (player) player.lastResult = 'won';
      resolveCpuMatches();
      T.message = 'Ganaste el combate. Los perdedores aparecen en gris y avanzas a la siguiente fase.';
      activateTab('events');
      buildNextRound();
    } else {
      if (player) {
        player.eliminated = true;
        player.lastResult = 'lost';
      }
      if (opponent) opponent.lastResult = 'won';
      resolveCpuMatches();
      T.message = 'Perdiste el combate. Presiona RETIRARSE para cerrar la tabla y dejar el ring vacío.';
      activateTab('events');
      renderTournament('RETIRARSE');
    }
    window.F.currentEnemyPow = null;
    window.F.currentPlayerPow = null;
  }

  function retireTournament() {
    T.started = false;
    T.inFight = false;
    T.participants = [];
    T.survivors = [];
    T.pairs = [];
    T.currentOpponent = null;
    T.message = 'Ring vacío. Puedes pagar de nuevo para iniciar otro torneo.';
    if (eventRing) eventRing.style.display = '';
    renderInfo();
    refreshWhenVisible();
  }

  function renderEventPanel() {
    if (T.started) renderTournament(T.participants.some(p => p.isPlayer && p.eliminated) || T.participants.some(p => p.champion) ? 'RETIRARSE' : 'LUCHAR');
    else renderInfo();
  }

  window.EventTournament = {
    isEventFight:() => T.inFight,
    handleFightEnd,
    render:renderEventPanel
  };

  document.querySelectorAll('.menu-btn').forEach(button => {
    button.addEventListener('click', () => {
      if (button.dataset.t === 'events') {
        renderEventPanel();
        refreshWhenVisible();
      }
    });
  });

  window.addEventListener('resize', refreshWhenVisible);

  if ('ResizeObserver' in window && eventRing) {
    const observer = new ResizeObserver(refreshWhenVisible);
    observer.observe(eventRing);
  }

  setTimeout(() => { renderEventPanel(); refreshWhenVisible(); }, 80);
})();

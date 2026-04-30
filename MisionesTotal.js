(() => {
  const rankCatalog = {
    d: {
      key: 'd',
      icon: '🐺',
      title: 'MISIONES RANGO D',
      color: '#52c41a',
      missions: [
        { name: 'Eliminar lobos hambrientos', xp: 2, gold: 4, hp: 138, atk: 25, def: 17, lvl: 1 },
        { name: 'Recuperar suministros robados por goblins', xp: 4, gold: 8, hp: 174, atk: 43, def: 28, lvl: 3 },
        { name: 'Proteger la aldea de jabalíes', xp: 6, gold: 12, hp: 210, atk: 61, def: 39, lvl: 5 },
        { name: 'Investigar ruinas infestadas de ratas gigantes', xp: 8, gold: 16, hp: 246, atk: 78, def: 50, lvl: 7 },
        { name: 'Escoltar a un mercader (bandido)', xp: 9, gold: 18, hp: 264, atk: 87, def: 55, lvl: 9 },
        { name: 'Cazar una bestia nocturna', xp: 10, gold: 20, hp: 282, atk: 96, def: 61, lvl: 12 }
      ]
    },
    c: {
      key: 'c', icon: '🦇', title: 'MISIONES RANGO C', color: '#1890ff',
      missions: [
        { name: 'Limpiar una mina de murciélagos vampíricos', xp: 12, gold: 24, hp: 318, atk: 113, def: 72, lvl: 14 },
        { name: 'Derrotar a un grupo de orcos merodeadores', xp: 14, gold: 28, hp: 354, atk: 131, def: 83, lvl: 16 },
        { name: 'Rescatar a un rehén de los bandidos', xp: 16, gold: 32, hp: 390, atk: 149, def: 94, lvl: 18 },
        { name: 'Eliminar una amenaza de lobos de las nieves', xp: 18, gold: 36, hp: 426, atk: 166, def: 105, lvl: 20 },
        { name: 'Recuperar un artefacto custodiado por esqueletos', xp: 19, gold: 38, hp: 444, atk: 175, def: 110, lvl: 22 },
        { name: 'Acabar con un troll de las colinas', xp: 20, gold: 40, hp: 462, atk: 184, def: 116, lvl: 24 }
      ]
    },
    b: {
      key: 'b', icon: '🕷️', title: 'MISIONES RANGO B', color: '#9b59b6',
      missions: [
        { name: 'Exterminar una colonia de arácnidos gigantes', xp: 22, gold: 44, hp: 498, atk: 201, def: 127, lvl: 28 },
        { name: 'Detener a un invocador de demonios menores', xp: 24, gold: 48, hp: 534, atk: 219, def: 138, lvl: 32 },
        { name: 'Proteger una ciudad del ataque de grifos salvajes', xp: 26, gold: 52, hp: 570, atk: 237, def: 149, lvl: 36 },
        { name: 'Investigar desapariciones en un bosque encantado', xp: 28, gold: 56, hp: 606, atk: 254, def: 160, lvl: 40 },
        { name: 'Derrotar a un caballero oscuro errante', xp: 29, gold: 58, hp: 624, atk: 263, def: 165, lvl: 45 },
        { name: 'Asaltar una fortaleza de ogros', xp: 30, gold: 60, hp: 642, atk: 272, def: 171, lvl: 50 }
      ]
    },
    a: {
      key: 'a', icon: '🐉', title: 'MISIONES RANGO A', color: '#fa8c16',
      missions: [
        { name: 'Eliminar a un dragón joven', xp: 32, gold: 64, hp: 678, atk: 289, def: 182, lvl: 55 },
        { name: 'Infiltrarse en una base de asesinos', xp: 34, gold: 68, hp: 714, atk: 307, def: 193, lvl: 56 },
        { name: 'Proteger una ciudad de una invasión', xp: 36, gold: 72, hp: 750, atk: 325, def: 204, lvl: 58 },
        { name: 'Recuperar un tesoro de una tumba maldita', xp: 38, gold: 76, hp: 786, atk: 342, def: 215, lvl: 60 },
        { name: 'Derrotar a un guerrero legendario', xp: 39, gold: 78, hp: 804, atk: 351, def: 220, lvl: 65 },
        { name: 'Acabar con un demonio de las sombras', xp: 40, gold: 80, hp: 822, atk: 360, def: 226, lvl: 70 }
      ]
    },
    s: {
      key: 's', icon: '💀', title: 'MISIONES RANGO S', color: '#f5222d',
      missions: [
        { name: 'Enfrentar a un dragón adulto', xp: 50, gold: 100, hp: 1002, atk: 448, def: 281, lvl: 75 },
        { name: 'Derrotar a un señor demonio menor', xp: 60, gold: 120, hp: 1182, atk: 536, def: 336, lvl: 80 },
        { name: 'Salvar el reino de un lich', xp: 70, gold: 140, hp: 1362, atk: 624, def: 391, lvl: 85 },
        { name: 'Enfrentar a un titán antiguo', xp: 80, gold: 160, hp: 1542, atk: 712, def: 446, lvl: 90 },
        { name: 'Combatir a un dios olvidado', xp: 90, gold: 180, hp: 1722, atk: 800, def: 501, lvl: 95 },
        { name: 'Derrotar al dragón anciano', xp: 100, gold: 200, hp: 1902, atk: 808, def: 556, lvl: 100 }
      ]
    }
  };

  const rankOrder = ['d', 'c', 'b', 'a', 's'];

  const state = {
    screen: 'main',
    rank: null
  };

  const setScreen = (screen, rank = null) => {
    state.screen = screen;
    state.rank = rank;
  };

  const missionCard = (m, rankKey, playerLevel) => {
    const locked = playerLevel < m.lvl;
    return `
      <article class="mission-rank-card rank-${rankKey}">
        <h3>${m.name}</h3>
        <div class="mission-rank-row">
          <div class="mission-rank-rewards">
            <span>✨ XP: ${m.xp}</span>
            <span>💰 Oro: ${m.gold}</span>
          </div>
          <div class="mission-rank-action">
            ${locked
              ? `<div class="mission-rank-lock">🔒 Nv. ${m.lvl} requerido</div>`
              : `<button class="mission-rank-fight" data-action="fight" data-rank="${rankKey}" data-name="${m.name}" data-xp="${m.xp}" data-gold="${m.gold}">⚔ LUCHAR</button>`}
          </div>
          <div class="mission-rank-enemy">
            <span>❤️ ${m.hp}</span>
            <span>⚔️ ${m.atk}</span>
            <span>🛡️ ${m.def}</span>
          </div>
        </div>
      </article>`;
  };

  const renderMain = () => `
    <section class="mission-rank-screen is-active">
      <div class="mission-rank-content mission-rank-content-center">
        <button class="mission-rank-main-btn" data-action="go-ranks">📜 MISIONES RANGO ⚡</button>
      </div>
    </section>`;

  const renderRanks = () => `
    <section class="mission-rank-screen is-active">
      <div class="mission-rank-content mission-rank-rank-list">
        ${rankOrder.map((key) => `<button class="mission-rank-rank-btn rank-${key}" data-action="open-rank" data-rank="${key}">${rankCatalog[key].icon} ${rankCatalog[key].title} ▶</button>`).join('')}
      </div>
    </section>`;

  const renderRankDetail = (rankKey, playerLevel) => {
    const rank = rankCatalog[rankKey];
    return `
      <section class="mission-rank-screen is-active">
        <header class="mission-rank-header">
          <button class="mission-rank-back" data-action="back-ranks">◀ VOLVER</button>
          <h3 style="color:${rank.color}">${rank.icon} ${rank.title}</h3>
        </header>
        <div class="mission-rank-content">
          ${rank.missions.map((m) => missionCard(m, rankKey, playerLevel)).join('')}
        </div>
      </section>`;
  };

  const renderView = (container, playerLevel) => {
    if (state.screen === 'main') container.innerHTML = renderMain();
    if (state.screen === 'ranks') container.innerHTML = renderRanks();
    if (state.screen === 'rank-detail' && state.rank) container.innerHTML = renderRankDetail(state.rank, playerLevel);
  };

  window.MisionesTotal = {
    render(container, titleEl, badgeEl, gameState, onApplyRewards) {
      titleEl.textContent = '';
      badgeEl.textContent = '';
      container.innerHTML = '';
      container.classList.add('missions-shell');
      setScreen('main');
      renderView(container, gameState.level);

      container.onclick = (event) => {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;

        if (action === 'go-ranks') setScreen('ranks');
        if (action === 'back-main') setScreen('main');
        if (action === 'open-rank') setScreen('rank-detail', target.dataset.rank);
        if (action === 'back-ranks') setScreen('ranks');

        if (action === 'fight') {
          if (target.dataset.rank === 'd' && window.BATALLA_MISION_HTML) {
            container.innerHTML = `
              <section class="battle-mission-view">
                <div class="battle-mission-top">
                  <button class="mission-rank-back" data-action="back-ranks">◀ VOLVER</button>
                </div>
                <iframe class="battle-mission-frame" title="Batalla Misión" srcdoc="${window.BATALLA_MISION_HTML.replace(/"/g, '&quot;')}"></iframe>
              </section>`;
            return;
          }

          if (typeof onApplyRewards === 'function') {
            onApplyRewards({ oro: Number(target.dataset.gold), xp: Number(target.dataset.xp) });
          }
        }

        renderView(container, gameState.level);
      };
    }
  };
})();

(function () {
  function initClanButtons(state, deps) {
    const { fmt, updateUI } = deps;
    const CLAN_CREATION_COST = 500;
    const MAX_CLAN_NAME_LEN = 10;
    const JOIN_LIST_SIZE = 5;
    const MAX_MEMBERS_PER_CLAN = 10;

    let view = 'menu';
    let feedbackTimeout = null;
    let joinedClan = null;
    let clanExp = 0;
    let clanLevel = 1;
    let nextGoldDonationCost = 500;
    let nextDollarDonationCost = 50;
    const CLAN_EXP_BASE = 15000;
    const CLAN_EXP_MULT = 2.7;

    const clanNameStarts = ['Lobos', 'Dragones', 'Guardianes', 'Titanes', 'Fénix', 'Centinelas', 'Halcones', 'Leones'];
    const clanNameLinks = ['del', 'de'];
    const clanNameEnds = ['Norte', 'Sur', 'Valle', 'Fuego', 'Acero', 'Trueno', 'Bosque', 'Desierto', 'Alba', 'Tormenta'];

    let currentClans = [];
    const playerSprite = '⛏️';
    const altSprites = ['🧑‍🚀', '🧙', '🛡️', '🥷', '🦾', '⚔️', '🧝'];

    function expForLevel(level) {
      return Math.floor(CLAN_EXP_BASE * Math.pow(CLAN_EXP_MULT, Math.max(0, level - 1)));
    }

    function gainClanExp(amount) {
      clanExp += amount;
      while (clanExp >= expForLevel(clanLevel)) {
        clanExp -= expForLevel(clanLevel);
        clanLevel++;
      }
    }

    function randomLevel() {
      const uncommon = Math.random() < 0.22;
      if (uncommon) return 4 + Math.floor(Math.random() * 7); // 4..10
      return 1 + Math.floor(Math.random() * 6); // 1..6
    }

    function randomClanName(usedNames) {
      let name = '';
      while (!name || usedNames.has(name)) {
        const start = clanNameStarts[Math.floor(Math.random() * clanNameStarts.length)];
        const link = clanNameLinks[Math.floor(Math.random() * clanNameLinks.length)];
        const end = clanNameEnds[Math.floor(Math.random() * clanNameEnds.length)];
        name = `${start} ${link} ${end}`;
      }
      return name;
    }

    function randomClans() {
      const usedNames = new Set();
      const clans = [];
      for (let i = 0; i < JOIN_LIST_SIZE; i++) {
        const name = randomClanName(usedNames);
        usedNames.add(name);
        const level = randomLevel();
        const members = 1 + Math.floor(Math.random() * MAX_MEMBERS_PER_CLAN);
        const maxMiners = MAX_MEMBERS_PER_CLAN;
        clans.push({ id: `clan-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`, name, level, members, maxMiners });
      }
      return clans;
    }

    function showFeedback(msg, type = 'warn') {
      const el = document.getElementById('clan-feedback');
      if (!el) return;
      el.textContent = msg;
      el.className = `clan-feedback ${type} visible`;
      if (feedbackTimeout) clearTimeout(feedbackTimeout);
      feedbackTimeout = setTimeout(() => el.classList.remove('visible'), 2000);
    }

    function setView(next) {
      view = next;
      renderInSection();
    }

    function handleCreateClan() {
      const input = document.getElementById('clan-name-input');
      if (!input) return;
      const clanName = input.value.trim();

      if (!clanName) {
        showFeedback('Debes ingresar un nombre de clan.');
        return;
      }
      if (clanName.length > MAX_CLAN_NAME_LEN) {
        showFeedback('Máximo 10 caracteres para el clan.');
        return;
      }
      if (state.special < CLAN_CREATION_COST) {
        showFeedback('Fondos insuficientes.', 'error');
        return;
      }

      state.special -= CLAN_CREATION_COST;
      updateUI();
      showFeedback(`Clan "${clanName}" creado con éxito.`, 'ok');
      input.value = '';
    }

    function renderMenu() {
      if (joinedClan) return renderMemberPanel();
      return `
        <div class="clan-wrapper">
          <div class="clan-scroll">
            <button class="clan-btn primary" onclick="openCreateClanView()">CREAR CLAN</button>
          </div>
          <div class="clan-scroll">
            <button class="clan-btn primary" onclick="openJoinClanView()">UNIRSE A UN CLAN</button>
          </div>
        </div>
      `;
    }

    function joinClanById(clanId) {
      const target = currentClans.find((clan) => clan.id === clanId);
      if (!target) return;
      if (target.members >= target.maxMiners) {
        showFeedback('Este clan está lleno.', 'error');
        return;
      }
      joinedClan = { ...target };
      joinedClan.members = Math.min(joinedClan.maxMiners, joinedClan.members + 1);
      view = 'member';
      renderInSection();
    }

    function donateGold() {
      const cost = Math.floor(nextGoldDonationCost);
      if (state.gold < cost) {
        showFeedback('No tienes suficiente 💰.', 'error');
        return;
      }
      state.gold -= cost;
      gainClanExp(cost);
      nextGoldDonationCost = Math.floor(cost * 1.35);
      updateUI();
      renderInSection();
    }

    function donateSpecial() {
      const cost = Math.floor(nextDollarDonationCost);
      if (state.special < cost) {
        showFeedback('No tienes suficiente 💲.', 'error');
        return;
      }
      state.special -= cost;
      gainClanExp(cost * 10);
      nextDollarDonationCost = Math.floor(cost * 1.25);
      updateUI();
      renderInSection();
    }

    function renderCreate() {
      return `
        <div class="clan-wrapper">
          <div id="clan-feedback" class="clan-feedback"></div>
          <div class="clan-scroll full">
            <div class="scroll-title">NOMBRE DEL CLAN</div>
            <input id="clan-name-input" maxlength="${MAX_CLAN_NAME_LEN}" class="clan-input" placeholder="Escribe aquí (máx. 10)" />
            <div class="scroll-row">Costo: <b>${fmt(CLAN_CREATION_COST)} 💲</b></div>
            <button class="clan-btn create" onclick="createClanNow()">CREAR</button>
            <button class="clan-btn back" onclick="openClanMenu()">VOLVER</button>
          </div>
        </div>
      `;
    }

    function renderJoin() {
      if (!currentClans.length) currentClans = randomClans();
      return `
        <div class="clan-wrapper">
          <div id="clan-feedback" class="clan-feedback"></div>
          <div class="clan-scroll full">
            <div class="scroll-title">CLANES DISPONIBLES</div>
            <div class="clan-list">
              ${currentClans.map((clan) => `
                <button class="clan-item ${clan.members >= clan.maxMiners ? 'full' : ''}" onclick="joinClanById('${clan.id}')">
                  <div><b>${clan.name}</b></div>
                  <div>Nivel: <b>${clan.level}</b></div>
                  <div>Mineros: <b>${clan.members}/${clan.maxMiners}</b></div>
                </button>
              `).join('')}
            </div>
            <button class="clan-btn reload" onclick="reloadClanList()">RECARGAR LISTA</button>
            <button class="clan-btn back" onclick="openClanMenu()">VOLVER</button>
          </div>
        </div>
      `;
    }

    function renderClanSprites() {
      const total = Math.max(2, Math.min(joinedClan.members, joinedClan.maxMiners));
      const others = Math.max(0, total - 1);
      const leftCount = Math.ceil(others / 2);
      const rightCount = others - leftCount;
      const left = Array.from({ length: leftCount }).map((_, i) => `<div class="clan-member-sprite">${altSprites[i % altSprites.length]}</div>`).join('');
      const right = Array.from({ length: rightCount }).map((_, i) => `<div class="clan-member-sprite">${altSprites[(i + 3) % altSprites.length]}</div>`).join('');
      return `
        <div class="clan-side left">${left}</div>
        <div class="clan-boss-wrap">
          <div class="clan-boss-hp"><div class="clan-boss-hp-fill" style="width:100%"></div></div>
          <div class="clan-boss">1.000.000</div>
          <div class="clan-member-sprite player">${playerSprite}</div>
        </div>
        <div class="clan-side right">${right}</div>
      `;
    }

    function renderMemberPanel() {
      const req = expForLevel(clanLevel);
      const pct = Math.min(100, (clanExp / req) * 100);
      return `
      <div class="clan-member-panel">
        <div class="clan-top-scene">
          <div class="scene-wall"></div>
          ${renderClanSprites()}
        </div>
        <div class="clan-bottom-panel">
          <div class="clan-donations">
            <button class="clan-btn primary" onclick="donateGoldNow()">DONAR ${fmt(nextGoldDonationCost)} 💰</button>
            <button class="clan-btn primary" onclick="donateSpecialNow()">DONAR ${fmt(nextDollarDonationCost)} 💲</button>
          </div>
          <div class="clan-exp-panel">
            <div class="clan-exp-head">Nivel de clan: <b>${clanLevel}</b></div>
            <div class="clan-exp-bar">
              <div class="clan-exp-fill" style="width:${pct}%"></div>
            </div>
            <div class="clan-exp-label">EXP ${fmt(clanExp)} / ${fmt(req)}</div>
          </div>
        </div>
      </div>`;
    }

    function syncClanHeaderVisibility() {
      const title = document.getElementById('section-title');
      const sub = document.getElementById('section-sub');
      if (!title || !sub) return;
      const hide = view === 'member';
      title.style.display = hide ? 'none' : '';
      sub.style.display = hide ? 'none' : '';
    }

    function renderInSection() {
      const content = document.getElementById('section-content');
      if (!content) return;
      if (view === 'menu') content.innerHTML = renderMenu();
      if (view === 'create') content.innerHTML = renderCreate();
      if (view === 'join') content.innerHTML = renderJoin();
      if (view === 'member') content.innerHTML = renderMemberPanel();
      syncClanHeaderVisibility();
    }

    function renderClansContent() {
      syncClanHeaderVisibility();
      if (view === 'menu') return renderMenu();
      if (view === 'create') return renderCreate();
      if (view === 'join') return renderJoin();
      return renderMemberPanel();
    }

    window.openClanMenu = () => setView('menu');
    window.openCreateClanView = () => setView('create');
    window.openJoinClanView = () => setView('join');
    window.joinClanById = joinClanById;
    window.createClanNow = handleCreateClan;
    window.donateGoldNow = donateGold;
    window.donateSpecialNow = donateSpecial;
    window.reloadClanList = () => {
      currentClans = randomClans();
      setView('join');
    };

    return { renderClansContent };
  }

  window.initClanButtons = initClanButtons;
})();

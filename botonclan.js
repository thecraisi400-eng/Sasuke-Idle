(function () {
  function initClanButtons(state, deps) {
    const { fmt, updateUI } = deps;
    const CLAN_CREATION_COST = 500;
    const MAX_CLAN_NAME_LEN = 10;
    const JOIN_LIST_SIZE = 5;

    let view = 'menu';
    let feedbackTimeout = null;

    const spanishClanNames = [
      'Sierra', 'Rocoso', 'Fulgor', 'Trueno', 'Aurora', 'Piedra', 'Cumbre', 'Escudo', 'Fuerza', 'Templo',
      'Vallejo', 'Forja', 'Bravio', 'Bosque', 'Ceniza', 'Lumbre', 'Antero', 'Guardia', 'Aureo', 'Titan',
      'Niebla', 'Rayoz', 'Solar', 'Umbral', 'Jaguar', 'Falcon', 'Cedron', 'Aldea', 'Bronce', 'Vulcan'
    ].filter((name) => name.length >= 5 && name.length <= 7);

    let currentClans = [];

    function maxMinersByLevel(level) {
      return Math.ceil(level / 2);
    }

    function randomLevel() {
      const uncommon = Math.random() < 0.22;
      if (uncommon) return 4 + Math.floor(Math.random() * 7); // 4..10
      return 1 + Math.floor(Math.random() * 6); // 1..6
    }

    function randomClans() {
      const pool = [...spanishClanNames];
      const clans = [];
      for (let i = 0; i < JOIN_LIST_SIZE && pool.length > 0; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        const name = pool.splice(idx, 1)[0];
        const level = randomLevel();
        const maxMiners = maxMinersByLevel(level);
        const members = Math.floor(Math.random() * (maxMiners + 1));
        clans.push({ name, level, members, maxMiners });
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
          <div class="clan-scroll full">
            <div class="scroll-title">CLANES DISPONIBLES</div>
            <div class="clan-list">
              ${currentClans.map((clan) => `
                <div class="clan-item ${clan.members >= clan.maxMiners ? 'full' : ''}">
                  <div><b>${clan.name}</b></div>
                  <div>Nivel: <b>${clan.level}</b></div>
                  <div>Mineros: <b>${clan.members}/${clan.maxMiners}</b></div>
                </div>
              `).join('')}
            </div>
            <button class="clan-btn reload" onclick="reloadClanList()">RECARGAR LISTA</button>
            <button class="clan-btn back" onclick="openClanMenu()">VOLVER</button>
          </div>
        </div>
      `;
    }

    function renderInSection() {
      const content = document.getElementById('section-content');
      if (!content) return;
      if (view === 'menu') content.innerHTML = renderMenu();
      if (view === 'create') content.innerHTML = renderCreate();
      if (view === 'join') content.innerHTML = renderJoin();
    }

    function renderClansContent() {
      if (view === 'menu') return renderMenu();
      if (view === 'create') return renderCreate();
      return renderJoin();
    }

    window.openClanMenu = () => setView('menu');
    window.openCreateClanView = () => setView('create');
    window.openJoinClanView = () => setView('join');
    window.createClanNow = handleCreateClan;
    window.reloadClanList = () => {
      currentClans = randomClans();
      setView('join');
    };

    return { renderClansContent };
  }

  window.initClanButtons = initClanButtons;
})();

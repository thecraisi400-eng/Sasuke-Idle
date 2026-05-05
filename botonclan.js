(function () {
  function initClanButtons(state, deps) {
    const { fmt, updateUI, markDirty } = deps;
    const CLAN_COST = 500;
    let mode = 'menu';
    let feedback = '';
    let feedbackType = 'warn';
    let clanNameInput = '';
    let clans = [];

    const clanNamePool = [
      'Andes','Cóndor','Jaguar','Páramo','Bravos','Roca','Tundra','Fénix','Lince','Trueno',
      'Sierra','Nébula','Aullido','Escudo','Centin','Alianza','Viento','Sombra','Furia','Cumbre',
      'Aurora','Nación','Titán','Leones','Rayo','Águila','Martillo','Piedra','Guardian','Sendero'
    ];

    function maxMinersByLevel(level) {
      return Math.floor(level / 2) + 1;
    }

    function randomLevel() {
      return Math.random() < 0.82
        ? 1 + Math.floor(Math.random() * 6)
        : 4 + Math.floor(Math.random() * 7);
    }

    function uniqueRandomClanNames(total) {
      const result = [];
      const used = new Set();
      let guard = 0;
      while (result.length < total && guard < 300) {
        guard += 1;
        const candidate = clanNamePool[Math.floor(Math.random() * clanNamePool.length)];
        if (used.has(candidate)) continue;
        if (candidate.length < 5 || candidate.length > 7) continue;
        used.add(candidate);
        result.push(candidate);
      }
      return result;
    }

    function makeRandomClans() {
      const names = uniqueRandomClanNames(5);
      clans = names.map((name) => {
        const level = randomLevel();
        const cap = maxMinersByLevel(level);
        const miners = Math.floor(Math.random() * (cap + 1));
        return { name, level, miners, cap };
      });
    }

    function setMode(nextMode) {
      mode = nextMode;
      feedback = '';
      if (nextMode === 'join') makeRandomClans();
      markDirty('section');
      updateUI();
    }

    function createClan() {
      const trimmedName = clanNameInput.trim();
      if (!trimmedName) {
        feedback = 'Debes ingresar un nombre de clan.';
        feedbackType = 'warn';
        markDirty('section');
      updateUI();
        return;
      }
      if (trimmedName.length > 10) {
        feedback = 'Máximo 10 caracteres.';
        feedbackType = 'warn';
        markDirty('section');
      updateUI();
        return;
      }
      if (state.special < CLAN_COST) {
        feedback = 'Fondos insuficientes';
        feedbackType = 'error';
        markDirty('section');
      updateUI();
        return;
      }
      state.special -= CLAN_COST;
      markDirty('currency');
      feedback = `Clan "${trimmedName}" creado con éxito.`;
      feedbackType = 'ok';
      clanNameInput = '';
      markDirty('section');
      updateUI();
    }

    function updateClanName(value) {
      clanNameInput = (value || '').slice(0, 10);
    }

    function reloadClans() {
      makeRandomClans();
      markDirty('section');
      updateUI();
    }

    window.openClanCreate = () => setMode('create');
    window.openClanJoin = () => setMode('join');
    window.backClanMenu = () => setMode('menu');
    window.createClanAction = createClan;
    window.reloadClanList = reloadClans;
    window.updateClanNameInput = (value) => updateClanName(value);

    makeRandomClans();

    function renderMenu() {
      return `
        <div class="clan-wrap">
          <button class="clan-scroll" onclick="openClanCreate()">CREAR CLAN</button>
          <button class="clan-scroll" onclick="openClanJoin()">UNIRSE A UN CLAN</button>
        </div>
      `;
    }

    function renderCreate() {
      return `
        <div class="clan-wrap">
          <div class="clan-panel">
            <div class="scroll-title">NOMBRE DEL CLAN</div>
            <input class="clan-input" maxlength="10" value="${clanNameInput}" oninput="updateClanNameInput(this.value)" placeholder="Hasta 10 caracteres" />
            <div class="clan-cost">Costo: <b>${fmt(CLAN_COST)} 💲</b></div>
            <button class="clan-action" onclick="createClanAction()">CREAR</button>
            ${feedback ? `<div class="clan-feedback ${feedbackType}">${feedback}</div>` : ''}
            <button class="clan-back" onclick="backClanMenu()">VOLVER</button>
          </div>
        </div>
      `;
    }

    function renderJoin() {
      const cards = clans.map((clan) => `
        <div class="clan-item ${clan.miners >= clan.cap ? 'full' : ''}">
          <div><b>${clan.name}</b> · Nivel ${clan.level}</div>
          <div>Mineros: ${clan.miners}/${clan.cap}</div>
        </div>
      `).join('');

      return `
        <div class="clan-list-wrap">
          <div class="clan-list">${cards}</div>
          <div class="clan-list-actions">
            <button class="clan-action" onclick="reloadClanList()">RECARGAR LISTA</button>
            <button class="clan-back" onclick="backClanMenu()">VOLVER</button>
          </div>
        </div>
      `;
    }

    function renderClanContent() {
      if (mode === 'create') return renderCreate();
      if (mode === 'join') return renderJoin();
      return renderMenu();
    }

    return { renderClanContent };
  }

  window.initClanButtons = initClanButtons;
})();

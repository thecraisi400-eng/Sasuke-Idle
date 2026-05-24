function saveGame() {
  const save = {
    G: { ...G },
    AXE_UPGRADES: AXE_UPGRADES.map(u => u.owned),
    ATTR_UPGRADES: ATTR_UPGRADES.map(u => u.owned),
    missionClaimed: { ...missionClaimed },
    TIME: { gameMinutes: TIME.gameMinutes, day: TIME.day }
  };
  try { localStorage.setItem('lenador_idle_v1', JSON.stringify(save)); } catch(e){}
}

function loadGame() {
  try {
    const raw = localStorage.getItem('lenador_idle_v1');
    if (!raw) return;
    const save = JSON.parse(raw);
    Object.assign(G, save.G);
    if (save.AXE_UPGRADES) save.AXE_UPGRADES.forEach((v,i) => { AXE_UPGRADES[i].owned = v; });
    if (save.ATTR_UPGRADES) save.ATTR_UPGRADES.forEach((v,i) => { ATTR_UPGRADES[i].owned = v; });
    if (save.missionClaimed) Object.assign(missionClaimed, save.missionClaimed);
    G.crystals = 0;
    if (save.TIME) {
      TIME.gameMinutes = save.TIME.gameMinutes;
      TIME.day = save.TIME.day;
    }
  } catch(e) {}
}

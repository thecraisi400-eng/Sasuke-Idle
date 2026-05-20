export function misionesderangod2RenderMissions({ rank, playerLevel, data, missionsScreen, rankScreen, onMissionSelect }) {
  const misionesderangod2Missions = data[rank];
  const misionesderangod2BackBtn = document.getElementById('misionesderangod2-back-missions-to-ranks');

  missionsScreen.innerHTML = '';
  missionsScreen.className = `misionesderangod2-screen misionesderangod2-missions-${rank}`;

  misionesderangod2Missions.forEach((mission) => {
    const misionesderangod2Div = document.createElement('div');
    const misionesderangod2IsLocked = playerLevel < mission.lvl;
    misionesderangod2Div.className = `misionesderangod2-mission-item ${misionesderangod2IsLocked ? 'misionesderangod2-locked' : ''}`;
    misionesderangod2Div.innerHTML = `
      <div class="misionesderangod2-mission-header">${mission.name}</div>
      <div class="misionesderangod2-mission-details">
        <div class="misionesderangod2-mission-left">
          <span>⚡ XP: ${mission.xp}</span>
          <span>💰 Oro: ${mission.gold}</span>
        </div>
        <div class="misionesderangod2-mission-right">
          <span>❤️ HP: ${mission.hp}</span>
          <span>⚔️ ATK: ${mission.atk}</span>
          <span>🛡️ DEF: ${mission.def}</span>
        </div>
      </div>
      ${misionesderangod2IsLocked
        ? `<div class="misionesderangod2-mission-lock">🔒 Nivel mínimo: ${mission.lvl}</div>`
        : ''}
    `;
    if (misionesderangod2IsLocked) {
      misionesderangod2Div.style.pointerEvents = 'none';
    } else if (typeof onMissionSelect === 'function') {
      misionesderangod2Div.addEventListener('click', () => onMissionSelect({ rank, mission }));
    }
    missionsScreen.appendChild(misionesderangod2Div);
  });

  missionsScreen.appendChild(misionesderangod2BackBtn);
  rankScreen.classList.add('misionesderangod2-hidden');
  missionsScreen.classList.remove('misionesderangod2-hidden');
}

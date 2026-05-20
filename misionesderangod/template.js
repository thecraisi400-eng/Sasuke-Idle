export function misionesderangod2BuildTemplate() {
  const misionesderangod2Container = document.createElement('div');
  misionesderangod2Container.id = 'misionesderangod2-game-container';
  misionesderangod2Container.innerHTML = `
    <!-- Pantalla 1: Menú principal -->
    <div id="misionesderangod2-main-menu-screen" class="misionesderangod2-screen">
      <div id="misionesderangod2-main-btn" class="misionesderangod2-menu-button">⚔️ MISIONES RANGO ⚔️</div>
    </div>

    <!-- Pantalla 2: Lista de Rangos -->
    <div id="misionesderangod2-rank-list-screen" class="misionesderangod2-screen misionesderangod2-hidden">
      <div id="misionesderangod2-rank-D" class="misionesderangod2-rank-button misionesderangod2-rank-d">📜 MISION RANGO D</div>
      <div id="misionesderangod2-rank-C" class="misionesderangod2-rank-button misionesderangod2-rank-c">🔥 MISION RANGO C</div>
      <div id="misionesderangod2-rank-B" class="misionesderangod2-rank-button misionesderangod2-rank-b">🌪️ MISION RANGO B</div>
      <div id="misionesderangod2-rank-A" class="misionesderangod2-rank-button misionesderangod2-rank-a">💀 MISION RANGO A</div>
      <div id="misionesderangod2-rank-S" class="misionesderangod2-rank-button misionesderangod2-rank-s">👑 MISION RANGO S</div>
      <div class="misionesderangod2-back-button" id="misionesderangod2-back-ranks-to-main">⬅️ Volver</div>
    </div>

    <!-- Pantalla 3: Misiones del Rango seleccionado -->
    <div id="misionesderangod2-missions-screen" class="misionesderangod2-screen misionesderangod2-hidden">
      <div class="misionesderangod2-back-button" id="misionesderangod2-back-missions-to-ranks">⬅️ Volver a Rangos</div>
    </div>
  `;

  return misionesderangod2Container;
}

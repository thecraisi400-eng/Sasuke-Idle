(()=>{
/* ============================================================
   MARCAS: panel vacío accesible desde el COLISEO
   ============================================================ */
const { coliseoPanel, statsGrid, toast } = window.GymHeroRespaldo;
const marcasPanel = document.getElementById('marcas-panel');
const marcasBtn = document.getElementById('marcas-btn');
const statsGridEl = statsGrid;

function openMarcasPanel(){
  if(!window.GymHeroRespaldoColiseo || !window.GymHeroRespaldoColiseo.isActive()) return;
  // Cierra el panel de LUCHA si estuviera abierto
  window.GymHeroRespaldoLucha?.close();
  coliseoPanel.classList.remove('show');
  marcasPanel.classList.add('show');
  // Cuadro de abajo vacío
  statsGridEl.style.visibility = 'hidden';
  toast('🏆 MARCAS');
}

function closeMarcasPanel(){
  marcasPanel.classList.remove('show');
}

marcasBtn.addEventListener('click', openMarcasPanel);
window.GymHeroRespaldoMarcas = { open: openMarcasPanel, close: closeMarcasPanel };
})();

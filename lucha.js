(()=>{
/* ============================================================
   LUCHA: funcionamiento al seleccionar la opción LUCHA dentro del Coliseo
   ============================================================ */
const { coliseoPanel, luchaPanel, luchaBtn, toast } = window.GymHero;

function openLuchaPanel(){
  if(!window.GymHeroColiseo?.isActive()) return;
  coliseoPanel.classList.remove('show');
  luchaPanel.classList.add('show');
  toast('🥊 LUCHA');
}

luchaBtn.addEventListener('click', openLuchaPanel);
})();

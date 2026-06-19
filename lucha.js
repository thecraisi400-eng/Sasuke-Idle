/* ============================================================
   LUCHA: funcionamiento de la opción de combate dentro del coliseo
   ============================================================ */
function openLuchaPanel(){
  if(!coliseoActive) return;
  coliseoPanel.classList.remove('show');
  luchaPanel.classList.add('show');
  toast('🥊 LUCHA');
}

luchaBtn.addEventListener('click', openLuchaPanel);

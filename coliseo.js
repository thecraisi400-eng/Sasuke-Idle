/* ============================================================
   COLISEO: ocultar/mostrar el contenido de los dos cuadros centrales
   (sala de entrenamiento y rejilla de estadísticas)
   ============================================================ */
let coliseoActive = false;
function setColiseoHidden(hidden){
  // Cuadro central superior: sala de entrenamiento
  room.classList.toggle('coliseo-mode', hidden);
  if(hidden){
    coliseoPanel.classList.add('show');
    luchaPanel.classList.remove('show');
  }else{
    coliseoPanel.classList.remove('show');
    luchaPanel.classList.remove('show');
  }
  // Cuadro central inferior: rejilla de estadísticas
  statsGrid.style.visibility = hidden ? 'hidden' : '';
  coliseoActive = hidden;
}

function openLuchaPanel(){
  if(!coliseoActive) return;
  coliseoPanel.classList.remove('show');
  luchaPanel.classList.add('show');
  toast('🥊 LUCHA');
}

luchaBtn.addEventListener('click', openLuchaPanel);

/* Menú principal */
document.querySelectorAll('.menu-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const name = btn.dataset.menu;

    if(name === 'COLISEO'){
      // No se puede acceder si el personaje está entrenando en alguna máquina
      if(currentAction !== null){
        toast('⚠️ Tu personaje está entrenando');
        return; // no cambia de pestaña ni vacía los cuadros
      }
      // Personaje libre: entrar al COLISEO y vaciar los dos cuadros centrales
      document.querySelectorAll('.menu-btn').forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      setColiseoHidden(true);
      toast('⚔️ COLISEO');
      return;
    }

    document.querySelectorAll('.menu-btn').forEach(b=> b.classList.remove('active'));
    btn.classList.add('active');

    if(name === 'ENTRENAR'){
      // Volver a mostrar el contenido de los dos cuadros centrales
      if(coliseoActive) setColiseoHidden(false);
      toast('🏋️ Modo ENTRENAR activo');
    }else{
      // Cualquier otra opción restaura los cuadros si venías del COLISEO
      if(coliseoActive) setColiseoHidden(false);
      toast(name + ': próximamente 🔒');
      // vuelve a marcar ENTRENAR como activo
      setTimeout(()=>{
        document.querySelectorAll('.menu-btn').forEach(b=> b.classList.remove('active'));
        document.querySelector('[data-menu="ENTRENAR"]').classList.add('active');
      }, 1400);
    }
  });
});


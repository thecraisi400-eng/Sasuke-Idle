// Mantiene la pantalla encendida mientras el jugador esté en el juego.
let wakeLock = null;

async function solicitarPantallaActiva() {
  if (!('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
    });
  } catch (err) {
    console.warn('Wake Lock no disponible:', err);
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    solicitarPantallaActiva();
  }
});

window.addEventListener('load', solicitarPantallaActiva);

async function loadPartials() {
  const mounts = [
    { id: 'top-section-mount', file: 'ui-parts/top-section.html' },
    { id: 'menu-grid-mount', file: 'ui-parts/menu-grid.html' },
    { id: 'modal-mount', file: 'ui-parts/modal.html' },
    { id: 'toast-mount', file: 'ui-parts/toast.html' }
  ];

  for (const mount of mounts) {
    const container = document.getElementById(mount.id);
    if (!container) continue;
    const response = await fetch(mount.file);
    if (!response.ok) throw new Error(`No se pudo cargar ${mount.file}`);
    container.innerHTML = await response.text();
  }
}

function loadScriptSequentially(srcList) {
  return srcList.reduce((promise, src) => {
    return promise.then(() => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.body.appendChild(script);
    }));
  }, Promise.resolve());
}

window.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadPartials();
    await loadScriptSequentially([
      'mejorarhacha.js',
      'pantallaactiva.js',
      'script.js'
    ]);
  } catch (error) {
    console.error(error);
  }
});

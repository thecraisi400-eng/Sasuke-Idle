export async function loadPartials() {
  const placeholders = [...document.querySelectorAll('[data-partial]')];

  await Promise.all(placeholders.map(async (node) => {
    const path = node.dataset.partial;
    const res = await fetch(path);
    if (!res.ok) throw new Error(`No se pudo cargar partial: ${path}`);
    node.outerHTML = await res.text();
  }));
}

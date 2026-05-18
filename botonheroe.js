/**
 * botonheroe.js
 * Punto de entrada liviano: delega en módulos separados.
 */

import { botonhero1Mount } from './botonheroe/mount.js';

if (typeof window !== 'undefined') {
  window.botonhero1Mount = botonhero1Mount;
}

if (typeof globalThis !== 'undefined') {
  globalThis.botonhero1Mount = botonhero1Mount;
}

export { botonhero1Mount };

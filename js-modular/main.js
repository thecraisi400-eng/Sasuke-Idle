// Punto de entrada modularizado.
// Este archivo documenta el orden recomendado de carga para mantener
// exactamente el mismo comportamiento del script monolítico original.

// Orden sugerido (vía <script> secuenciales en index.html):
// 1) core/state.js
// 2) core/time-system.js
// 3) core/config.js
// 4) core/economy.js
// 5) core/persistence.js
// 6) ui/ui-main.js
// 7) scene/scene-state.js
// 8) scene/scene-helpers.js
// 9) scene/scene-draw.js
// 10) scene/scene-loop.js
// 11) ui/events.js
// 12) ui/modals.js
// 13) ui/toasts.js
// 14) app/bootstrap.js

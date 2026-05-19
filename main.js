import './core/stats.js';
import './core/state.js';
import './data/sections.js';
import './ui/renderBars.js';
import './ui/effects.js';
import './misionesderango.js';
import './misionesderangod.js';
import { loadPartials } from './ui/partials.js';
import { initUI } from './ui/navigation.js';

(async function bootstrap() {
  await loadPartials();
  initUI();
})();

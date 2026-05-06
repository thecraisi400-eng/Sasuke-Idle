(function () {
  function initPickButtons(state, deps) {
    const { fmt, getHitRate, getCritChance, updateUI } = deps;

    const MAX_LEVEL = 1000;
    let feedbackTimeout = null;

    function getCosts() {
      return {
        sharp: Math.floor(22 * Math.pow(1.35, state.clickDmg - 1)),
        speed: Math.floor(130 * Math.pow(1.12, state.pickSpeedLevel)),
        crit: Math.floor(170 * Math.pow(1.13, state.pickCritLevel)),
      };
    }

    function showFeedback(msg, type = 'warn') {
      const el = document.getElementById('picks-feedback');
      if (!el) return;
      el.textContent = msg;
      el.className = `picks-feedback ${type} visible`;
      if (feedbackTimeout) clearTimeout(feedbackTimeout);
      feedbackTimeout = setTimeout(() => {
        el.classList.remove('visible');
      }, 1800);
    }

    function spendGoldOrWarn(cost) {
      if (state.gold < cost) {
        showFeedback('No tienes el oro suficiente.');
        return false;
      }
      state.gold -= cost;
      return true;
    }

    function upgradePick() {
      const { sharp } = getCosts();
      if (!spendGoldOrWarn(sharp)) return;
      state.clickDmg += 1;
      state.dps += 1;
      updateUI();
      showFeedback('¡Pico mejorado!', 'ok');
    }

    function upgradePickSpeed() {
      if (state.pickSpeedLevel >= MAX_LEVEL) return;
      const { speed } = getCosts();
      if (!spendGoldOrWarn(speed)) return;
      state.pickSpeedLevel += 1;
      updateUI();
      showFeedback('¡Velocidad mejorada!', 'ok');
    }

    function upgradePickCrit() {
      if (state.pickCritLevel >= MAX_LEVEL) return;
      const { crit } = getCosts();
      if (!spendGoldOrWarn(crit)) return;
      state.pickCritLevel += 1;
      updateUI();
      showFeedback('¡Crítico mejorado!', 'ok');
    }

    window.upgradePick = upgradePick;
    window.upgradePickSpeed = upgradePickSpeed;
    window.upgradePickCrit = upgradePickCrit;

    function renderPicksContent() {
      const { sharp, speed, crit } = getCosts();
      const canSharp = state.gold >= sharp;
      const canSpeed = state.gold >= speed && state.pickSpeedLevel < MAX_LEVEL;
      const canCrit = state.gold >= crit && state.pickCritLevel < MAX_LEVEL;
      const critPct = (getCritChance() * 100).toFixed(3);

      return `
        <div class="picks-card picks-wrapper">
          <div id="picks-feedback" class="picks-feedback"></div>
          <div class="pick-scroll">
            <div class="scroll-title">PICO AFILADO</div>
            <div class="scroll-row">Nivel: <b>${state.clickDmg}</b></div>
            <div class="scroll-row">Daño actual (DPS): <b>${fmt(state.dps)}</b></div>
            <div class="scroll-row">Costo mejora: <b>${fmt(sharp)} 💰</b></div>
            <button class="picks-btn ${canSharp ? 'can-upgrade' : 'no-upgrade'}" onclick="upgradePick()">MEJORAR PICO</button>
          </div>
          <div class="pick-scroll">
            <div class="scroll-title">VELOCIDAD PICO</div>
            <div class="scroll-row">Nivel: <b>${state.pickSpeedLevel}/${MAX_LEVEL}</b></div>
            <div class="scroll-row">Golpes/s: <b>${getHitRate().toFixed(2)}</b></div>
            <div class="scroll-row">Costo mejora: <b>${fmt(speed)} 💰</b></div>
            <button class="picks-btn ${canSpeed ? 'can-upgrade' : 'no-upgrade'}" onclick="upgradePickSpeed()" ${state.pickSpeedLevel >= MAX_LEVEL ? 'disabled' : ''}>MEJORAR VELOCIDAD</button>
          </div>
          <div class="pick-scroll">
            <div class="scroll-title">CRITICO PICO</div>
            <div class="scroll-row">Nivel: <b>${state.pickCritLevel}/${MAX_LEVEL}</b></div>
            <div class="scroll-row">Crítico: <b>${critPct}%</b></div>
            <div class="scroll-row">Costo mejora: <b>${fmt(crit)} 💰</b></div>
            <button class="picks-btn ${canCrit ? 'can-upgrade' : 'no-upgrade'}" onclick="upgradePickCrit()" ${state.pickCritLevel >= MAX_LEVEL ? 'disabled' : ''}>MEJORAR CRITICO</button>
          </div>
        </div>
      `;
    }

    return { renderPicksContent };
  }

  window.initPickButtons = initPickButtons;
})();

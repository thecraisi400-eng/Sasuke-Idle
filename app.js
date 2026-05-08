const state = {
  gold: 14500,
  clickDamage: 1755,
  idleDamage: 34200,
  rockHp: 100,
  rockXp: 75,
  combo: 1,
  critRate: 12.5,
  activeSection: "Picos"
};

const rock = document.getElementById("rock");
const hpFill = document.getElementById("hpFill");
const xpFill = document.getElementById("xpFill");
const goldCounter = document.getElementById("goldCounter");
const damageLayer = document.getElementById("damageLayer");
const dpsCounter = document.getElementById("dpsCounter");
const comboCount = document.getElementById("comboCount");
const critRate = document.getElementById("critRate");
const lootFeed = document.getElementById("lootFeed");
const sparkleLayer = document.getElementById("sparkleLayer");

const lootPool = ["Fragmento de hierro", "Cristal azul", "Piedra rúnica", "Pepita dorada", "Esquirla ancestral"];

function compactNumber(value) {
  return new Intl.NumberFormat("es-ES", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function updateHud() {
  hpFill.style.width = `${Math.max(state.rockHp, 0)}%`;
  xpFill.style.width = `${Math.max(state.rockXp, 0)}%`;
  goldCounter.textContent = `🪙 ${compactNumber(state.gold)}`;
  dpsCounter.textContent = `${compactNumber(state.idleDamage)} DPS`;
  comboCount.textContent = `x${state.combo}`;
  critRate.textContent = `${state.critRate.toFixed(1)}%`;
}

function spawnDamageText(x, y) {
  const variants = [
    { value: "1755", color: "#ffd447" },
    { value: "90K", color: "#ff5a52" },
    { value: "298262", color: "#47f0ff" }
  ];
  const sample = variants[Math.floor(Math.random() * variants.length)];
  const dmg = document.createElement("span");
  dmg.className = "damage-text";
  dmg.textContent = sample.value;
  dmg.style.color = sample.color;
  dmg.style.left = `${x}px`;
  dmg.style.top = `${y}px`;
  damageLayer.appendChild(dmg);
  setTimeout(() => dmg.remove(), 1000);
}

function spawnSparkles() {
  for (let i = 0; i < 18; i++) {
    const dot = document.createElement("span");
    dot.className = "sparkle";
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.animationDelay = `${Math.random() * 2}s`;
    sparkleLayer.appendChild(dot);
  }
}

function onRockTouch(event) {
  const rect = rock.getBoundingClientRect();
  const cx = event.clientX ?? (rect.left + rect.width / 2);
  const cy = event.clientY ?? (rect.top + rect.height / 2);

  const crit = Math.random() * 100 < state.critRate;
  const comboBoost = 1 + (state.combo - 1) * 0.04;
  const baseDamage = state.clickDamage * comboBoost;
  const dealt = Math.round(crit ? baseDamage * 2.2 : baseDamage);

  state.rockHp -= Math.min(12, dealt / 600);
  state.rockXp -= 1.4;
  state.gold += dealt;
  state.combo = Math.min(20, state.combo + 1);

  if (state.rockHp <= 0) state.rockHp = 100;
  if (state.rockXp <= 0) {
    state.rockXp = 100;
    state.critRate = Math.min(45, state.critRate + 0.3);
  }

  rock.classList.remove("hit");
  void rock.offsetWidth;
  rock.classList.add("hit");

  spawnDamageText(cx - 20, cy - 20);
  lootFeed.textContent = `+ Botín: ${lootPool[Math.floor(Math.random() * lootPool.length)]}`;
  updateHud();
}

function applyIdleDamage() {
  state.rockHp -= 2;
  state.gold += Math.round(state.idleDamage / 10);
  state.combo = Math.max(1, state.combo - 1);
  if (state.rockHp <= 0) state.rockHp = 100;
  updateHud();
}

rock.addEventListener("pointerdown", onRockTouch);
setInterval(applyIdleDamage, 1000);

document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    state.activeSection = btn.dataset.section;
    document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    lootFeed.textContent = `Sección activa: ${state.activeSection}`;
  });
});

spawnSparkles();
updateHud();

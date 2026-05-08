const state = {
  gold: 14500,
  clickDamage: 1755,
  idleDamage: 34200,
  rockHp: 100,
  rockXp: 75,
  activeSection: "Picos"
};

const rock = document.getElementById("rock");
const hpFill = document.getElementById("hpFill");
const xpFill = document.getElementById("xpFill");
const goldCounter = document.getElementById("goldCounter");
const damageLayer = document.getElementById("damageLayer");
const dpsCounter = document.getElementById("dpsCounter");
const contextLabel = document.getElementById("contextLabel");

function compactNumber(value) {
  return new Intl.NumberFormat("es-ES", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function updateHud() {
  hpFill.style.width = `${Math.max(state.rockHp, 0)}%`;
  xpFill.style.width = `${Math.max(state.rockXp, 0)}%`;
  goldCounter.textContent = `🪙 ${compactNumber(state.gold)}`;
  dpsCounter.textContent = `${compactNumber(state.idleDamage)} DPS`;
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

function onRockTouch(event) {
  const rect = rock.getBoundingClientRect();
  const cx = event.clientX ?? rect.left + rect.width / 2;
  const cy = event.clientY ?? rect.top + rect.height / 2;

  const dealt = state.clickDamage;
  state.rockHp -= Math.min(10, dealt / 700);
  state.rockXp -= 1;
  state.gold += dealt;

  if (state.rockHp <= 0) state.rockHp = 100;
  if (state.rockXp <= 0) state.rockXp = 100;

  rock.classList.remove("hit");
  void rock.offsetWidth;
  rock.classList.add("hit");

  spawnDamageText(cx - 18, cy - 20);
  updateHud();
}

function idleDamage() {
  state.rockHp -= 2;
  state.gold += Math.round(state.idleDamage / 10);
  if (state.rockHp <= 0) state.rockHp = 100;
  updateHud();
}

rock.addEventListener("pointerdown", onRockTouch);
setInterval(idleDamage, 1000);

document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    state.activeSection = btn.dataset.section;
    contextLabel.textContent = `Sección: ${state.activeSection}`;
    document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

updateHud();

/* ============================================================
   ENEMIGOS.JS — Pool de sprites enemigos para el Coliseo
   Cada enemigo tiene un SVG único en viewBox 0 0 50 80
   compatible con el sistema de lucha (lucha.js)
   ============================================================ */

const ENEMIGOS_POOL_RESPALDO = [
  /* ===============================================
     1. TITÁN — Campeón Dorado
     Cabeza afeitada, torso rojo, cinturón dorado
     =============================================== */
  {
    name: "TITÁN",
    rank: "Campeón Dorado",
    skin: "#d4a574",
    colors: { head: "#c0392b", limb: "#a93226", stroke: "#5c1c14", accent: "#f1c40f" },
    accessory: "none",
    svgInner: `
      <!-- Piernas -->
      <g class="lucha-leg-left lucha-limb">
        <rect x="19.3" y="66.6" width="5.7" height="11.4" rx="1.4" fill="#f1c40f"/>
        <rect x="19.3" y="66.6" width="5.7" height="2.5" rx="1" fill="#e67e22"/>
      </g>
      <g class="lucha-leg-right lucha-limb">
        <rect x="25" y="66.6" width="5.7" height="11.4" rx="1.4" fill="#f1c40f"/>
        <rect x="25" y="66.6" width="5.7" height="2.5" rx="1" fill="#e67e22"/>
      </g>
      <!-- Brazos musculosos con guantes rojos -->
      <g class="lucha-arm-left lucha-limb">
        <rect x="14.5" y="50.8" width="7.5" height="10.5" rx="3" fill="#c0392b"/>
        <rect x="14.5" y="50.8" width="7.5" height="4" rx="2" fill="#8b0000"/>
      </g>
      <g class="lucha-arm-right lucha-limb">
        <rect x="28" y="50.8" width="7.5" height="10.5" rx="3" fill="#c0392b"/>
        <rect x="28" y="50.8" width="7.5" height="4" rx="2" fill="#8b0000"/>
      </g>
      <!-- Torso y cabeza -->
      <g class="lucha-torso">
        <!-- Torso musculoso -->
        <rect x="17.5" y="49.4" width="15" height="17.2" rx="3" fill="#c0392b"/>
        <!-- Pectorales -->
        <ellipse cx="22" cy="54" rx="3.5" ry="2.5" fill="#a93226"/>
        <ellipse cx="28" cy="54" rx="3.5" ry="2.5" fill="#a93226"/>
        <!-- Abdomen -->
        <rect x="22.5" y="58" width="5" height="2" fill="#a93226"/>
        <rect x="22.5" y="62" width="5" height="2" fill="#a93226"/>
        <!-- Cinturón dorado -->
        <rect x="16.5" y="64" width="17" height="4" rx="1.5" fill="#8b4513"/>
        <circle cx="25" cy="66" r="3.5" fill="#f1c40f" stroke="#8b4513" stroke-width="1"/>
        <text x="25" y="67.5" text-anchor="middle" font-size="3.5" fill="#8b4513" font-weight="bold">★</text>
        <!-- Cabeza afeitada -->
        <circle cx="25" cy="43.7" r="7.2" fill="#d4a574"/>
        <path d="M17.8 42 Q17.8 36 25 36 Q32.2 36 32.2 42" fill="#5d4037"/>
        <!-- Ojos -->
        <circle cx="22.8" cy="43.5" r="1.3" fill="#222"/>
        <circle cx="27.2" cy="43.5" r="1.3" fill="#222"/>
        <!-- Boca seria -->
        <path d="M22.5 47 Q25 48.5 27.5 47" stroke="#222" stroke-width="1" fill="none"/>
        <!-- Cuello -->
        <rect x="23" y="48" width="4" height="3" fill="#c49560"/>
      </g>`
  },

  /* ===============================================
     2. TROVADOR — Campeón Azul
     Cabello rizado negro, torso azul, shorts azules
     =============================================== */
  {
    name: "TROVADOR",
    rank: "Campeón Azul",
    skin: "#8d5524",
    colors: { head: "#1e3a8a", limb: "#1e40af", stroke: "#0c1e4a", accent: "#c0c0c0" },
    accessory: "none",
    svgInner: `
      <!-- Piernas -->
      <g class="lucha-leg-left lucha-limb">
        <rect x="19.3" y="66.6" width="5.7" height="11.4" rx="1.4" fill="#1e3a8a"/>
        <rect x="19.3" y="66.6" width="5.7" height="2" rx="1" fill="#3b82f6"/>
      </g>
      <g class="lucha-leg-right lucha-limb">
        <rect x="25" y="66.6" width="5.7" height="11.4" rx="1.4" fill="#1e3a8a"/>
        <rect x="25" y="66.6" width="5.7" height="2" rx="1" fill="#3b82f6"/>
      </g>
      <!-- Brazos con guantes azules -->
      <g class="lucha-arm-left lucha-limb">
        <rect x="14.5" y="50.8" width="7.5" height="10.5" rx="3" fill="#1e3a8a"/>
        <rect x="14.5" y="50.8" width="7.5" height="4" rx="2" fill="#0c1e4a"/>
      </g>
      <g class="lucha-arm-right lucha-limb">
        <rect x="28" y="50.8" width="7.5" height="10.5" rx="3" fill="#1e3a8a"/>
        <rect x="28" y="50.8" width="7.5" height="4" rx="2" fill="#0c1e4a"/>
      </g>
      <!-- Torso y cabeza -->
      <g class="lucha-torso">
        <rect x="17.5" y="49.4" width="15" height="17.2" rx="3" fill="#1e3a8a"/>
        <ellipse cx="22" cy="54" rx="3.5" ry="2.5" fill="#1e40af"/>
        <ellipse cx="28" cy="54" rx="3.5" ry="2.5" fill="#1e40af"/>
        <rect x="22.5" y="58" width="5" height="2" fill="#1e40af"/>
        <rect x="22.5" y="62" width="5" height="2" fill="#1e40af"/>
        <!-- Cinturón -->
        <rect x="16.5" y="64" width="17" height="4" rx="1.5" fill="#2c1810"/>
        <circle cx="25" cy="66" r="3.5" fill="#c0c0c0" stroke="#2c1810" stroke-width="1"/>
        <text x="25" y="67.5" text-anchor="middle" font-size="3" fill="#2c1810" font-weight="bold">◆</text>
        <!-- Cabeza con cabello rizado -->
        <circle cx="25" cy="43.7" r="7.2" fill="#8d5524"/>
        <path d="M17.8 42 Q17.8 36 25 36 Q32.2 36 32.2 42" fill="#1a1a1a"/>
        <circle cx="20" cy="38" r="1.8" fill="#1a1a1a"/>
        <circle cx="23.5" cy="36.5" r="1.8" fill="#1a1a1a"/>
        <circle cx="26.5" cy="36.5" r="1.8" fill="#1a1a1a"/>
        <circle cx="30" cy="38" r="1.8" fill="#1a1a1a"/>
        <!-- Ojos -->
        <circle cx="22.8" cy="43.5" r="1.3" fill="#222"/>
        <circle cx="27.2" cy="43.5" r="1.3" fill="#222"/>
        <!-- Boca -->
        <path d="M22.5 47.5 Q25 49 27.5 47.5" stroke="#222" stroke-width="1" fill="none"/>
      </g>`
  },

  /* ===============================================
     3. BESTIA — Campeón Tatuado Verde
     Barba, torso verde con tatuajes, rodilleras
     =============================================== */
  {
    name: "BESTIA",
    rank: "Campeón Tatuado",
    skin: "#c68642",
    colors: { head: "#27ae60", limb: "#1e8449", stroke: "#145a32", accent: "#ffd700" },
    accessory: "none",
    svgInner: `
      <!-- Piernas con rodilleras -->
      <g class="lucha-leg-left lucha-limb">
        <rect x="19.3" y="66.6" width="5.7" height="11.4" rx="1.4" fill="#1e8449"/>
        <rect x="19.3" y="70" width="5.7" height="3" rx="1" fill="#0e4d24"/>
      </g>
      <g class="lucha-leg-right lucha-limb">
        <rect x="25" y="66.6" width="5.7" height="11.4" rx="1.4" fill="#1e8449"/>
        <rect x="25" y="70" width="5.7" height="3" rx="1" fill="#0e4d24"/>
      </g>
      <!-- Brazos con tatuajes y guantes -->
      <g class="lucha-arm-left lucha-limb">
        <rect x="14.5" y="50.8" width="7.5" height="10.5" rx="3" fill="#27ae60"/>
        <rect x="14.5" y="50.8" width="7.5" height="4" rx="2" fill="#145a32"/>
        <!-- Tatuaje brazo -->
        <path d="M16 55 L18 55 M17 57 L19 57" stroke="#1a1a1a" stroke-width="0.8"/>
      </g>
      <g class="lucha-arm-right lucha-limb">
        <rect x="28" y="50.8" width="7.5" height="10.5" rx="3" fill="#27ae60"/>
        <rect x="28" y="50.8" width="7.5" height="4" rx="2" fill="#145a32"/>
        <!-- Tatuaje brazo -->
        <path d="M34 55 L32 55 M33 57 L31 57" stroke="#1a1a1a" stroke-width="0.8"/>
      </g>
      <!-- Torso y cabeza -->
      <g class="lucha-torso">
        <rect x="17.5" y="49.4" width="15" height="17.2" rx="3" fill="#27ae60"/>
        <ellipse cx="22" cy="54" rx="3.5" ry="2.5" fill="#1e8449"/>
        <ellipse cx="28" cy="54" rx="3.5" ry="2.5" fill="#1e8449"/>
        <!-- Tatuajes tribales en pecho -->
        <path d="M22 59 L28 59 M23 61 L27 61 M24 63 L26 63" stroke="#1a1a1a" stroke-width="0.8"/>
        <!-- Cinturón de cuero -->
        <rect x="16.5" y="64" width="17" height="4" rx="1.5" fill="#5d4037"/>
        <circle cx="25" cy="66" r="3.5" fill="#ffd700" stroke="#5d4037" stroke-width="1"/>
        <text x="25" y="67.5" text-anchor="middle" font-size="3" fill="#5d4037" font-weight="bold">⚔</text>
        <!-- Cabeza con barba -->
        <circle cx="25" cy="43.7" r="7.2" fill="#c68642"/>
        <path d="M17.8 43 Q17.8 38 25 38 Q32.2 38 32.2 43 L32.2 46 Q30 50 25 50 Q20 50 17.8 46 Z" fill="#c68642"/>
        <path d="M20 48 Q25 50 30 48" fill="#3d2817"/>
        <!-- Ojos -->
        <circle cx="22.8" cy="43" r="1.3" fill="#222"/>
        <circle cx="27.2" cy="43" r="1.3" fill="#222"/>
        <!-- Boca oculta por barba -->
        <path d="M23 46 L25 46 L27 46" stroke="#222" stroke-width="1" fill="none"/>
      </g>`
  },

  /* ===============================================
     4. MARTILLO — Campeón Boxeador Rojo
     Rubio, cicatriz, protector bucal, guantes XL
     =============================================== */
  {
    name: "MARTILLO",
    rank: "Campeón Boxeador",
    skin: "#f1c27d",
    colors: { head: "#c0392b", limb: "#922b21", stroke: "#7b241c", accent: "#ffffff" },
    accessory: "none",
    svgInner: `
      <!-- Piernas -->
      <g class="lucha-leg-left lucha-limb">
        <rect x="19.3" y="66.6" width="5.7" height="11.4" rx="1.4" fill="#c0392b"/>
      </g>
      <g class="lucha-leg-right lucha-limb">
        <rect x="25" y="66.6" width="5.7" height="11.4" rx="1.4" fill="#c0392b"/>
      </g>
      <!-- Brazos con guantes XL rojos -->
      <g class="lucha-arm-left lucha-limb">
        <rect x="13.5" y="50.5" width="9" height="11" rx="4" fill="#c0392b"/>
        <rect x="13.5" y="50.5" width="9" height="4.5" rx="2.5" fill="#7b241c"/>
        <circle cx="18" cy="54" r="2.5" fill="#922b21"/>
      </g>
      <g class="lucha-arm-right lucha-limb">
        <rect x="27.5" y="50.5" width="9" height="11" rx="4" fill="#c0392b"/>
        <rect x="27.5" y="50.5" width="9" height="4.5" rx="2.5" fill="#7b241c"/>
        <circle cx="32" cy="54" r="2.5" fill="#922b21"/>
      </g>
      <!-- Torso y cabeza -->
      <g class="lucha-torso">
        <rect x="17.5" y="49.4" width="15" height="17.2" rx="3" fill="#c0392b"/>
        <ellipse cx="22" cy="54" rx="3.5" ry="2.5" fill="#922b21"/>
        <ellipse cx="28" cy="54" rx="3.5" ry="2.5" fill="#922b21"/>
        <rect x="22.5" y="58" width="5" height="2" fill="#922b21"/>
        <rect x="22.5" y="62" width="5" height="2" fill="#922b21"/>
        <!-- Cinturón negro con dorado -->
        <rect x="16.5" y="64" width="17" height="4" rx="1.5" fill="#1a1a1a"/>
        <circle cx="25" cy="66" r="3.5" fill="#f1c40f" stroke="#1a1a1a" stroke-width="1"/>
        <text x="25" y="67.5" text-anchor="middle" font-size="3.5" fill="#1a1a1a" font-weight="bold">♛</text>
        <!-- Cabeza rubia con cicatriz -->
        <circle cx="25" cy="43.7" r="7.2" fill="#f1c27d"/>
        <path d="M17.8 42 Q17.8 36 25 36 Q32.2 36 32.2 42" fill="#f1c40f"/>
        <path d="M17.8 42 Q25 39 32.2 42" fill="#d4ac0d"/>
        <!-- Cicatriz en ceja -->
        <path d="M21 42.5 L23.5 43" stroke="#c0392b" stroke-width="0.6"/>
        <!-- Ojos -->
        <circle cx="22.8" cy="44" r="1.3" fill="#222"/>
        <circle cx="27.2" cy="44" r="1.3" fill="#222"/>
        <!-- Protector bucal -->
        <rect x="22.5" y="47" width="5" height="2" rx="0.8" fill="#e74c3c"/>
        <!-- Boca seria -->
        <path d="M22.5 47 Q25 48.5 27.5 47" stroke="#222" stroke-width="0.8" fill="none"/>
      </g>`
  },

  /* ===============================================
     5. COLOSO — Campeón Indestructible Moreno
     Cabeza afeitada, torso negro, shorts negros/dorado
     =============================================== */
  {
    name: "COLOSO",
    rank: "Campeón Indestructible",
    skin: "#5d4037",
    colors: { head: "#1a1a1a", limb: "#0d0d0d", stroke: "#000000", accent: "#ffd700" },
    accessory: "none",
    svgInner: `
      <!-- Piernas gruesas -->
      <g class="lucha-leg-left lucha-limb">
        <rect x="18.8" y="66.6" width="6.5" height="11.4" rx="1.5" fill="#1a1a1a"/>
        <rect x="18.8" y="66.6" width="6.5" height="2" rx="1" fill="#ffd700"/>
        <rect x="18.8" y="74" width="6.5" height="2" rx="1" fill="#ffd700"/>
      </g>
      <g class="lucha-leg-right lucha-limb">
        <rect x="24.7" y="66.6" width="6.5" height="11.4" rx="1.5" fill="#1a1a1a"/>
        <rect x="24.7" y="66.6" width="6.5" height="2" rx="1" fill="#ffd700"/>
        <rect x="24.7" y="74" width="6.5" height="2" rx="1" fill="#ffd700"/>
      </g>
      <!-- Brazos con guantes negros -->
      <g class="lucha-arm-left lucha-limb">
        <rect x="14" y="50.5" width="8" height="11" rx="3.5" fill="#1a1a1a"/>
        <rect x="14" y="52" width="8" height="3" fill="#333"/>
      </g>
      <g class="lucha-arm-right lucha-limb">
        <rect x="28" y="50.5" width="8" height="11" rx="3.5" fill="#1a1a1a"/>
        <rect x="28" y="52" width="8" height="3" fill="#333"/>
      </g>
      <!-- Torso y cabeza -->
      <g class="lucha-torso">
        <!-- Torso XL negro -->
        <rect x="17" y="49.4" width="16" height="17.2" rx="3" fill="#1a1a1a"/>
        <ellipse cx="21.5" cy="54" rx="4" ry="2.8" fill="#0d0d0d"/>
        <ellipse cx="28.5" cy="54" rx="4" ry="2.8" fill="#0d0d0d"/>
        <rect x="22.5" y="58.5" width="5" height="2" fill="#0d0d0d"/>
        <rect x="22.5" y="62" width="5" height="2" fill="#0d0d0d"/>
        <!-- Cinturón rojo premium -->
        <rect x="16" y="64" width="18" height="4.5" rx="1.5" fill="#8b0000"/>
        <circle cx="25" cy="66.2" r="3.8" fill="#ffd700" stroke="#8b0000" stroke-width="1"/>
        <path d="M23 64.5 L25 66.2 L27 64.5 M23 67.9 L25 66.2 L27 67.9" stroke="#8b0000" stroke-width="0.6"/>
        <!-- Cabeza afeitada morena -->
        <circle cx="25" cy="43.7" r="7.2" fill="#5d4037"/>
        <path d="M17.8 42 Q17.8 36 25 36 Q32.2 36 32.2 42" fill="#3e2723"/>
        <!-- Ojos con blanco visible -->
        <circle cx="22.8" cy="43.5" r="1.3" fill="#fff"/>
        <circle cx="27.2" cy="43.5" r="1.3" fill="#fff"/>
        <circle cx="22.8" cy="43.5" r="0.7" fill="#111"/>
        <circle cx="27.2" cy="43.5" r="0.7" fill="#111"/>
        <!-- Boca seria -->
        <path d="M22 48 Q25 49.5 28 48" stroke="#222" stroke-width="1" fill="none"/>
      </g>`
  },

  /* ===============================================
     6. DIAMANTE — Campeón Platino
     Cabello platino, torso púrpura, estrella dorada
     =============================================== */
  {
    name: "DIAMANTE",
    rank: "Campeón Platino",
    skin: "#ffdbac",
    colors: { head: "#6b21a8", limb: "#581c87", stroke: "#3b0764", accent: "#ffd700" },
    accessory: "none",
    svgInner: `
      <!-- Piernas -->
      <g class="lucha-leg-left lucha-limb">
        <rect x="19.3" y="66.6" width="5.7" height="11.4" rx="1.4" fill="#6b21a8"/>
        <rect x="19.3" y="66.6" width="5.7" height="2" rx="1" fill="#ffd700"/>
        <rect x="19.3" y="74" width="5.7" height="2" rx="1" fill="#ffd700"/>
      </g>
      <g class="lucha-leg-right lucha-limb">
        <rect x="25" y="66.6" width="5.7" height="11.4" rx="1.4" fill="#6b21a8"/>
        <rect x="25" y="66.6" width="5.7" height="2" rx="1" fill="#ffd700"/>
        <rect x="25" y="74" width="5.7" height="2" rx="1" fill="#ffd700"/>
      </g>
      <!-- Brazos con guantes púrpura -->
      <g class="lucha-arm-left lucha-limb">
        <rect x="14" y="50.5" width="8" height="11" rx="3.5" fill="#6b21a8"/>
        <rect x="14" y="51" width="8" height="3" fill="#3b0764"/>
        <circle cx="18" cy="54.5" r="2" fill="#ffd700"/>
      </g>
      <g class="lucha-arm-right lucha-limb">
        <rect x="28" y="50.5" width="8" height="11" rx="3.5" fill="#6b21a8"/>
        <rect x="28" y="51" width="8" height="3" fill="#3b0764"/>
        <circle cx="32" cy="54.5" r="2" fill="#ffd700"/>
      </g>
      <!-- Torso y cabeza -->
      <g class="lucha-torso">
        <rect x="17.5" y="49.4" width="15" height="17.2" rx="3" fill="#6b21a8"/>
        <ellipse cx="22" cy="54" rx="3.5" ry="2.5" fill="#581c87"/>
        <ellipse cx="28" cy="54" rx="3.5" ry="2.5" fill="#581c87"/>
        <rect x="22.5" y="58" width="5" height="2" fill="#581c87"/>
        <rect x="22.5" y="62" width="5" height="2" fill="#581c87"/>
        <!-- Estrella premium en pecho -->
        <path d="M25 56 L26 58.5 L28.5 58.5 L26.5 60 L27.5 62.5 L25 61 L22.5 62.5 L23.5 60 L21.5 58.5 L24 58.5 Z" fill="#ffd700"/>
        <!-- Cinturón púrpura -->
        <rect x="16.5" y="64" width="17" height="4" rx="1.5" fill="#4a148c"/>
        <circle cx="25" cy="66" r="3.5" fill="#ffd700" stroke="#4a148c" stroke-width="1"/>
        <text x="25" y="67.5" text-anchor="middle" font-size="3.5" fill="#4a148c" font-weight="bold">★</text>
        <!-- Cabeza platino -->
        <circle cx="25" cy="43.7" r="7.2" fill="#ffdbac"/>
        <path d="M17.8 42 Q17.8 36 25 36 Q32.2 36 32.2 42 Q30 38 25 39 Q20 38 17.8 42" fill="#ecf0f1"/>
        <path d="M17.8 40 Q25 37 32.2 40 Q30 38.5 25 39 Q20 38.5 17.8 40" fill="#bdc3c7"/>
        <!-- Ojos azules -->
        <circle cx="22.8" cy="43.5" r="1.3" fill="#1e3a8a"/>
        <circle cx="27.2" cy="43.5" r="1.3" fill="#1e3a8a"/>
        <!-- Boca confiada -->
        <path d="M23 47 Q25 48 27 47" stroke="#222" stroke-width="0.8" fill="none"/>
      </g>`
  }
];

/* ============================================================
   FUNCIONES PÚBLICAS
   ============================================================ */

/**
 * Selecciona un enemigo al azar del pool.
 * @returns {Object} Objeto con name, rank, colors, accessory, svgInner
 */
function pickRandomEnemyRespaldo() {
  const idx = Math.floor(Math.random() * ENEMIGOS_POOL_RESPALDO.length);
  return { ...ENEMIGOS_POOL_RESPALDO[idx] };
}

/**
 * Obtiene el SVG inner de un enemigo por índice (0-5).
 * @param {number} idx
 * @returns {Object|null}
 */
function getEnemyByIndexRespaldo(idx) {
  if (idx < 0 || idx >= ENEMIGOS_POOL_RESPALDO.length) return null;
  return { ...ENEMIGOS_POOL_RESPALDO[idx] };
}

/**
 * Construye el DOM de un sprite enemigo para el ring.
 * viewBox 0 0 50 80 — igual que el sistema de lucha actual.
 * @param {Object} enemyData - datos del enemigo (de ENEMIGOS_POOL_RESPALDO)
 * @param {boolean} mirrored - si debe aparecer reflejado (mirror)
 * @returns {Object} { pos, hpFill, scaleWrap, mirrored }
 */
function buildEnemyFighterDOMRespaldo(enemyData, mirrored) {
  const pos = document.createElement("div");
  pos.className = "lucha-fighter-pos";
  pos.innerHTML =
    '<div class="lucha-fighter-name"></div>' +
    '<div class="lucha-hp-bar-bg"><div class="lucha-hp-bar-fill"></div></div>' +
    '<div class="lucha-fighter-scale' + (mirrored ? ' mirror' : '') + '">' +
      '<div class="lucha-character">' +
        '<div class="lucha-char-shadow"></div>' +
        '<svg class="lucha-char-svg" viewBox="0 0 50 80" preserveAspectRatio="xMidYMax meet">' +
          enemyData.svgInner +
        '</svg>' +
      '</div>' +
    '</div>';
  pos.querySelector(".lucha-fighter-name").textContent = enemyData.name;
  return {
    pos: pos,
    hpFill: pos.querySelector(".lucha-hp-bar-fill"),
    scaleWrap: pos.querySelector(".lucha-fighter-scale"),
    mirrored: mirrored
  };
}

/**
 * Genera HTML de tarjeta de ficha para el panel "found".
 * @param {string} kind - "you" o "cpu"
 * @param {string} name
 * @param {string} tag
 * @param {Object} colors
 * @param {string} svgInner
 * @returns {string} HTML
 */
function enemyCardHTMLRespaldo(kind, name, tag, colors, svgInner) {
  const svg =
    '<svg class="lucha-char-svg" viewBox="0 0 50 80" preserveAspectRatio="xMidYMax meet">' +
    svgInner +
    '</svg>';
  return (
    '<div class="lucha-fcard ' + kind + '">' +
      '<div class="lucha-fcard-glow" style="background:' + colors.head + '"></div>' +
      '<div class="lucha-fcard-sprite-wrap">' +
        '<div class="lucha-character">' +
          '<div class="lucha-char-shadow"></div>' +
          svg +
        '</div>' +
      '</div>' +
      '<div class="lucha-fcard-name">' + name + '</div>' +
      '<div class="lucha-fcard-tag">' + tag + '</div>' +
    '</div>'
  );
}

/* Exportar al scope global */
window.GymHeroRespaldoEnemigos = {
  pool: ENEMIGOS_POOL_RESPALDO,
  pickRandom: pickRandomEnemyRespaldo,
  getByIndex: getEnemyByIndexRespaldo,
  buildFighterDOM: buildEnemyFighterDOMRespaldo,
  cardHTML: enemyCardHTMLRespaldo
};

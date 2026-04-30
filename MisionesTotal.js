(() => {
  const RECENT_KEY = 'sasuke_idle_missions_recent';
  const ACTIVE_KEY = 'sasuke_idle_missions_active';
  const RECENT_MAX = 5;
  const ACTIVE_COUNT = 5;

  const missionPoolE = [
    { id: 1, nombre: 'Entrenamiento con Maniquíes', rango: 'E', nivelMinimo: 1, descripcion: 'Golpea los maniquíes de madera para mejorar tu coordinación básica.', objetivo: (nivel) => `Derrotar ${nivel * 2} maniquíes`, oro: (nivel) => nivel * 4, xp: (nivel) => nivel * 2, eHP: 50, eATK: 5, eDEF: 2 },
    { id: 2, nombre: 'Invasión de Roedores', rango: 'E', nivelMinimo: 1, descripcion: 'Los almacenes de comida están llenos de ratas gigantes. Deshazte de ellas.', objetivo: (nivel) => `Derrotar ${nivel + 5} ratas de alcantarilla`, oro: (nivel) => nivel * 6, xp: (nivel) => nivel * 3, eHP: 65, eATK: 8, eDEF: 4 },
    { id: 3, nombre: 'Suministros para el Hospital', rango: 'E', nivelMinimo: 2, descripcion: 'Protege a los recolectores de hierbas de las plantas carnívoras.', objetivo: (nivel) => `Derrotar ${nivel * 2} plantas mutantes`, oro: (nivel) => nivel * 5, xp: (nivel) => nivel * 4, eHP: 80, eATK: 12, eDEF: 6 },
    { id: 4, nombre: 'Entrega de Pergaminos', rango: 'E', nivelMinimo: 3, descripcion: 'Unos bandidos intentan interceptar el correo. Elimínalos.', objetivo: (nivel) => `Derrotar ${nivel + 2} ladrones de caminos`, oro: (nivel) => nivel * 8, xp: (nivel) => nivel * 5, eHP: 110, eATK: 18, eDEF: 12 },
    { id: 5, nombre: 'Vigilancia de la Puerta Norte', rango: 'E', nivelMinimo: 4, descripcion: 'Mantén el orden derrotando a los maleantes en la entrada.', objetivo: (nivel) => `Derrotar ${nivel + 3} maleantes`, oro: (nivel) => nivel * 7, xp: (nivel) => nivel * 6, eHP: 130, eATK: 25, eDEF: 15 },
    { id: 6, nombre: 'Provisión de Carne', rango: 'E', nivelMinimo: 5, descripcion: 'Los jabalíes salvajes están atacando a los pastores.', objetivo: (nivel) => `Derrotar ${nivel + 4} jabalíes salvajes`, oro: (nivel) => nivel * 10, xp: (nivel) => nivel * 8, eHP: 160, eATK: 35, eDEF: 20 },
    { id: 7, nombre: 'El Amuleto Perdido', rango: 'E', nivelMinimo: 6, descripcion: 'Derrota a los subordinados que robaron las mercancías.', objetivo: (nivel) => `Derrotar ${nivel + 1} subordinados bandidos`, oro: (nivel) => nivel * 12, xp: (nivel) => nivel * 10, eHP: 180, eATK: 45, eDEF: 25 },
    { id: 8, nombre: 'Rocas en el Sendero', rango: 'E', nivelMinimo: 7, descripcion: 'Golems de piedra están bloqueando el paso comercial.', objetivo: (nivel) => `Derrotar ${nivel * 2} mini golems`, oro: (nivel) => nivel * 9, xp: (nivel) => nivel * 12, eHP: 220, eATK: 40, eDEF: 40 },
    { id: 9, nombre: 'Protección a los Aldeanos', rango: 'E', nivelMinimo: 8, descripcion: 'Los lobos acechan a los aldeanos que regresan al pueblo.', objetivo: (nivel) => `Derrotar ${nivel + 2} lobos de bosque`, oro: (nivel) => nivel * 15, xp: (nivel) => nivel * 15, eHP: 200, eATK: 60, eDEF: 30 },
    { id: 10, nombre: 'Sombras en el Tejado', rango: 'E', nivelMinimo: 9, descripcion: 'Se han detectado espías vigilando la mansión principal.', objetivo: (nivel) => `Derrotar ${nivel - 5} espías enemigos`, oro: (nivel) => nivel * 20, xp: (nivel) => nivel * 20, eHP: 180, eATK: 75, eDEF: 35 },
    { id: 11, nombre: 'Afilado de Kunais', rango: 'E', nivelMinimo: 1, descripcion: 'Prueba el filo de las nuevas armas contra muñecos de paja.', objetivo: (nivel) => `Derrotar ${nivel * 4} muñecos de prueba`, oro: (nivel) => nivel * 3, xp: (nivel) => nivel * 2, eHP: 40, eATK: 4, eDEF: 1 },
    { id: 12, nombre: 'Esquiva de Proyectiles', rango: 'E', nivelMinimo: 2, descripcion: 'Destruye los drones mecánicos de entrenamiento.', objetivo: (nivel) => `Derrotar ${nivel * 5} drones de práctica`, oro: (nivel) => nivel * 5, xp: (nivel) => nivel * 4, eHP: 70, eATK: 15, eDEF: 10 },
    { id: 13, nombre: 'Provisiones del Río', rango: 'E', nivelMinimo: 3, descripcion: 'Las pirañas del río están atacando a los pescadores locales.', objetivo: (nivel) => `Derrotar ${nivel + 6} pirañas de río`, oro: (nivel) => nivel * 6, xp: (nivel) => nivel * 3, eHP: 90, eATK: 20, eDEF: 5 },
    { id: 14, nombre: 'Nidos de Avispas Gigantes', rango: 'E', nivelMinimo: 4, descripcion: 'Elimina a las avispas que custodian los panales.', objetivo: (nivel) => `Derrotar ${nivel + 4} avispas gigantes`, oro: (nivel) => nivel * 8, xp: (nivel) => nivel * 7, eHP: 120, eATK: 30, eDEF: 12 },
    { id: 15, nombre: 'Extracción en la Mina', rango: 'E', nivelMinimo: 5, descripcion: 'Murciélagos de cueva impiden el trabajo de los mineros.', objetivo: (nivel) => `Derrotar ${nivel + 3} murciélagos de cueva`, oro: (nivel) => nivel * 10, xp: (nivel) => nivel * 5, eHP: 140, eATK: 38, eDEF: 18 },
    { id: 16, nombre: 'Infiltración en el Mercado', rango: 'E', nivelMinimo: 6, descripcion: 'Elimina a los informantes enemigos ocultos entre la gente.', objetivo: (nivel) => `Derrotar ${nivel - 2} informantes`, oro: (nivel) => nivel * 14, xp: (nivel) => nivel * 12, eHP: 170, eATK: 50, eDEF: 22 },
    { id: 17, nombre: 'Carrera de Obstáculos', rango: 'E', nivelMinimo: 7, descripcion: 'Derrota a los clones de sombra durante el recorrido.', objetivo: (nivel) => `Derrotar ${nivel + 5} clones de sombra`, oro: (nivel) => nivel * 11, xp: (nivel) => nivel * 18, eHP: 190, eATK: 55, eDEF: 30 },
    { id: 18, nombre: 'Mascotas Perdidas', rango: 'E', nivelMinimo: 7, descripcion: 'Perros rabiosos han asustado a las mascotas del pueblo.', objetivo: (nivel) => `Derrotar ${nivel + 3} perros callejeros`, oro: (nivel) => nivel * 8, xp: (nivel) => nivel * 9, eHP: 160, eATK: 48, eDEF: 20 },
    { id: 19, nombre: 'Guardián del Camino Sur', rango: 'E', nivelMinimo: 8, descripcion: 'Bandidos de bajo rango acechan las caravanas.', objetivo: (nivel) => `Derrotar ${nivel + 2} bandidos novatos`, oro: (nivel) => nivel * 18, xp: (nivel) => nivel * 14, eHP: 210, eATK: 65, eDEF: 35 },
    { id: 20, nombre: 'Frenar el Sabotaje', rango: 'E', nivelMinimo: 9, descripcion: 'Mercenarios intentan sabotear las murallas de la aldea.', objetivo: (nivel) => `Derrotar ${nivel - 6} mercenarios saboteadores`, oro: (nivel) => nivel * 25, xp: (nivel) => nivel * 22, eHP: 240, eATK: 80, eDEF: 45 },
    { id: 21, nombre: 'Restauración del Santuario', rango: 'E', nivelMinimo: 5, descripcion: 'Espíritus menores han invadido el templo sagrado.', objetivo: (nivel) => `Derrotar ${nivel + 5} espíritus débiles`, oro: (nivel) => nivel * 7, xp: (nivel) => nivel * 9, eHP: 145, eATK: 32, eDEF: 12 },
    { id: 22, nombre: 'Ayuda Comunitaria', rango: 'E', nivelMinimo: 6, descripcion: 'Protege a los aldeanos de los matones que cobran impuestos ilegales.', objetivo: (nivel) => `Derrotar ${nivel + 3} cobradores corruptos`, oro: (nivel) => nivel * 13, xp: (nivel) => nivel * 11, eHP: 175, eATK: 48, eDEF: 28 },
    { id: 23, nombre: 'Limpieza de Frontera', rango: 'E', nivelMinimo: 7, descripcion: 'Escorpiones venenosos han migrado a la frontera.', objetivo: (nivel) => `Derrotar ${nivel + 3} escorpiones`, oro: (nivel) => nivel * 11, xp: (nivel) => nivel * 13, eHP: 205, eATK: 58, eDEF: 32 },
    { id: 24, nombre: 'Combustible para el Invierno', rango: 'E', nivelMinimo: 7, descripcion: 'Entes de madera atacan a los leñadores en el bosque.', objetivo: (nivel) => `Derrotar ${nivel * 2} entes de madera`, oro: (nivel) => nivel * 10, xp: (nivel) => nivel * 10, eHP: 230, eATK: 52, eDEF: 38 },
    { id: 25, nombre: 'Protección del Agua', rango: 'E', nivelMinimo: 8, descripcion: 'Babosas gigantes están ensuciando el acueducto.', objetivo: (nivel) => `Derrotar ${nivel + 2} babosas gigantes`, oro: (nivel) => nivel * 14, xp: (nivel) => nivel * 14, eHP: 250, eATK: 62, eDEF: 40 },
    { id: 26, nombre: 'Cifrado de Mensajes', rango: 'E', nivelMinimo: 8, descripcion: 'Derrota a los mensajeros enemigos para interceptar sus códigos.', objetivo: (nivel) => `Derrotar ${nivel - 4} mensajeros enemigos`, oro: (nivel) => nivel * 19, xp: (nivel) => nivel * 16, eHP: 220, eATK: 70, eDEF: 30 },
    { id: 27, nombre: 'Llamas en el Campo', rango: 'E', nivelMinimo: 9, descripcion: 'Espíritus de fuego están incendiando las cosechas.', objetivo: (nivel) => `Derrotar ${nivel + 1} elementales de fuego`, oro: (nivel) => nivel * 22, xp: (nivel) => nivel * 25, eHP: 260, eATK: 85, eDEF: 25 },
    { id: 28, nombre: 'Justicia Local', rango: 'E', nivelMinimo: 9, descripcion: 'Criminales prófugos se esconden en los callejones.', objetivo: (nivel) => `Derrotar ${nivel - 3} criminales`, oro: (nivel) => nivel * 28, xp: (nivel) => nivel * 24, eHP: 245, eATK: 90, eDEF: 42 },
    { id: 29, nombre: 'Prueba de Maestría Básica', rango: 'E', nivelMinimo: 10, descripcion: 'Enfréntate a los cadetes de élite para demostrar tu fuerza.', objetivo: (nivel) => `Derrotar ${nivel * 2} cadetes de élite`, oro: (nivel) => nivel * 35, xp: (nivel) => nivel * 35, eHP: 300, eATK: 110, eDEF: 60 },
    { id: 30, nombre: 'Ceremonia de Iniciación', rango: 'E', nivelMinimo: 10, descripcion: 'Supera la prueba final derrotando a los guardianes del rango.', objetivo: (nivel) => `Derrotar ${nivel - 7} guardianes de prueba`, oro: (nivel) => nivel * 50, xp: (nivel) => nivel * 60, eHP: 350, eATK: 130, eDEF: 75 }
  ];


  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const getLevelWindow = (level) => ({ min: Math.max(1, level - 5), max: level + 7 });
  const getRecent = () => JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  const setRecent = (ids) => localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(-RECENT_MAX)));
  const getActive = () => JSON.parse(localStorage.getItem(ACTIVE_KEY) || '[]');
  const setActive = (missions) => localStorage.setItem(ACTIVE_KEY, JSON.stringify(missions));

  function pickMissions(playerLevel) {
    const { min, max } = getLevelWindow(playerLevel);
    const recentIds = new Set(getRecent());
    const byLevel = missionPoolE.filter((m) => m.nivelMinimo >= min && m.nivelMinimo <= max);
    const filtered = byLevel.filter((m) => !recentIds.has(m.id));
    const source = filtered.length >= ACTIVE_COUNT ? filtered : byLevel;
    return shuffle(source).slice(0, ACTIVE_COUNT).map((mission) => ({
      id: mission.id,
      nombre: mission.nombre,
      descripcion: mission.descripcion,
      objetivo: mission.objetivo(playerLevel),
      oro: mission.oro(playerLevel),
      xp: mission.xp(playerLevel),
      estado: 'activa'
    }));
  }

  function ensureActive(playerLevel) {
    const current = getActive();
    const pending = current.filter((m) => m.estado === 'activa');
    if (pending.length) return current;
    const fresh = pickMissions(playerLevel);
    setActive(fresh);
    return fresh;
  }

  function completeMission(id, result, level, onReward) {
    const current = getActive();
    const next = current.map((m) => (m.id === id ? { ...m, estado: result } : m));
    const selected = next.find((m) => m.id === id);
    if (selected && onReward) onReward(selected, result);
    setActive(next);
    const recent = [...getRecent(), id];
    setRecent(recent);
    const remaining = next.filter((m) => m.estado === 'activa');
    if (!remaining.length) {
      const fresh = pickMissions(level);
      setActive(fresh);
      return fresh;
    }
    return next;
  }

  window.MisionesTotal = {
    render(container, titleEl, badgeEl, gameState, onApplyRewards) {
      titleEl.textContent = '📜 Misiones';
      badgeEl.textContent = 'RANGO E';
      container.innerHTML = '';
      const missions = ensureActive(gameState.level);

      const wrap = document.createElement('div');
      wrap.className = 'missions-board';
      missions.forEach((m) => {
        const card = document.createElement('article');
        card.className = `mission-scroll state-${m.estado}`;
        card.dataset.id = String(m.id);
        card.innerHTML = `
          <h3>${m.nombre}</h3>
          <p class="mission-description">${m.descripcion}</p>
          <p class="mission-goal"><strong>Objetivo:</strong> ${m.objetivo}</p>
          <div class="mission-rewards">💰 ${m.oro} · ⭐ ${m.xp}</div>`;
        wrap.appendChild(card);
      });

      wrap.addEventListener('click', (event) => {
        const card = event.target.closest('.mission-scroll');
        if (!card || !card.classList.contains('state-activa')) return;
        const id = Number(card.dataset.id);
        const result = Math.random() < 0.65 ? 'completada' : 'fallada';
        completeMission(id, result, gameState.level, (mission, status) => {
          if (status === 'completada' && typeof onApplyRewards === 'function') onApplyRewards(mission);
        });
        this.render(container, titleEl, badgeEl, gameState, onApplyRewards);
      });

      container.appendChild(wrap);
    }
  };
})();

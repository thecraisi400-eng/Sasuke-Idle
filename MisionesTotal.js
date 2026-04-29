(() => {
  const RECENT_KEY = 'sasuke_idle_missions_recent';
  const ACTIVE_KEY = 'sasuke_idle_missions_active';
  const RECENT_MAX = 5;
  const ACTIVE_COUNT = 5;

  const missionPoolE = [
    { id: 1, nombre: 'Entrenamiento con Maniquíes', rango: 'E', nivelMinimo: 1, descripcion: 'Golpea los maniquíes de madera para mejorar tu coordinación básica.', objetivo: (nivel) => `Derrotar ${nivel * 2} maniquíes`, oro: (nivel) => (nivel * 10) + 50, xp: (nivel) => (nivel * 15) + 100 },
    { id: 2, nombre: 'Invasión de Roedores', rango: 'E', nivelMinimo: 1, descripcion: 'Los almacenes de comida están llenos de ratas gigantes. Deshazte de ellas.', objetivo: (nivel) => `Eliminar ${nivel + 5} ratas de alcantarilla`, oro: (nivel) => (nivel * 12) + 40, xp: (nivel) => (nivel * 10) + 120 },
    { id: 3, nombre: 'Suministros para el Hospital', rango: 'E', nivelMinimo: 2, descripcion: 'El médico necesita plantas frescas para crear ungüentos curativos.', objetivo: (nivel) => `Recolectar ${nivel * 3} hierbas verdes`, oro: (nivel) => (nivel * 20) + 30, xp: (nivel) => (nivel * 5) + 150 },
    { id: 4, nombre: 'Entrega de Pergaminos', rango: 'E', nivelMinimo: 3, descripcion: 'Lleva estos documentos importantes a los puestos de vigilancia externos.', objetivo: (nivel) => `Entregar ${nivel + 2} pergaminos`, oro: (nivel) => (nivel * 15) + 60, xp: (nivel) => (nivel * 8) + 130 },
    { id: 5, nombre: 'Vigilancia de la Puerta Norte', rango: 'E', nivelMinimo: 4, descripcion: 'Mantén el orden en la entrada principal de la aldea.', objetivo: (nivel) => `Interrogar a ${nivel + 3} sospechosos`, oro: (nivel) => (nivel * 18) + 70, xp: (nivel) => (nivel * 12) + 160 },
    { id: 6, nombre: 'Provisión de Carne', rango: 'E', nivelMinimo: 5, descripcion: 'Los jabalíes del bosque están dañando los cultivos locales.', objetivo: (nivel) => `Cazar ${nivel + 4} jabalíes salvajes`, oro: (nivel) => (nivel * 25) + 80, xp: (nivel) => (nivel * 20) + 200 },
    { id: 7, nombre: 'El Amuleto Perdido', rango: 'E', nivelMinimo: 6, descripcion: 'Un comerciante perdió sus mercancías tras un ataque de bandidos.', objetivo: (nivel) => `Recuperar ${nivel + 1} cajas de mercancía`, oro: (nivel) => (nivel * 30) + 100, xp: (nivel) => (nivel * 15) + 220 },
    { id: 8, nombre: 'Rocas en el Sendero', rango: 'E', nivelMinimo: 7, descripcion: 'Usa tu fuerza para despejar las rocas que bloquean el camino comercial.', objetivo: (nivel) => `Destruir ${nivel * 2} rocas grandes`, oro: (nivel) => (nivel * 22) + 90, xp: (nivel) => (nivel * 18) + 250 },
    { id: 9, nombre: 'Protección a los Aldeanos', rango: 'E', nivelMinimo: 8, descripcion: 'Acompaña a los granjeros de regreso a sus hogares de forma segura.', objetivo: (nivel) => `Escoltar a ${Math.floor(nivel / 2 + 2)} aldeanos`, oro: (nivel) => (nivel * 40) + 120, xp: (nivel) => (nivel * 25) + 300 },
    { id: 10, nombre: 'Sombras en el Tejado', rango: 'E', nivelMinimo: 9, descripcion: 'Se han detectado infiltrados vigilando la mansión principal.', objetivo: (nivel) => `Capturar ${nivel - 5} espías enemigos`, oro: (nivel) => (nivel * 50) + 150, xp: (nivel) => (nivel * 30) + 400 },
    { id: 11, nombre: 'Afilado de Kunais', rango: 'E', nivelMinimo: 1, descripcion: 'Ayuda en la armería a preparar el equipo para los nuevos reclutas.', objetivo: (nivel) => `Afilar ${nivel * 4} herramientas de metal`, oro: (nivel) => (nivel * 11) + 55, xp: (nivel) => (nivel * 12) + 110 },
    { id: 12, nombre: 'Esquiva de Proyectiles', rango: 'E', nivelMinimo: 2, descripcion: 'Entra en la cámara de trampas y mejora tu velocidad de reacción.', objetivo: (nivel) => `Esquivar ${nivel * 5} flechas de madera`, oro: (nivel) => (nivel * 14) + 45, xp: (nivel) => (nivel * 18) + 140 },
    { id: 13, nombre: 'Provisiones del Río', rango: 'E', nivelMinimo: 3, descripcion: 'La cocina de la academia se ha quedado sin pescado para la cena.', objetivo: (nivel) => `Capturar ${nivel + 6} peces plateados`, oro: (nivel) => (nivel * 16) + 35, xp: (nivel) => (nivel * 10) + 130 },
    { id: 14, nombre: 'Nidos de Avispas Gigantes', rango: 'E', nivelMinimo: 4, descripcion: 'Elimina los nidos que impiden el paso de los leñadores al bosque.', objetivo: (nivel) => `Destruir ${Math.ceil(nivel / 2 + 1)} panales grandes`, oro: (nivel) => (nivel * 20) + 75, xp: (nivel) => (nivel * 22) + 180 },
    { id: 15, nombre: 'Extracción en la Mina', rango: 'E', nivelMinimo: 5, descripcion: 'Busca fragmentos de hierro necesarios para forjar protectores.', objetivo: (nivel) => `Extraer ${nivel + 3} fragmentos de hierro`, oro: (nivel) => (nivel * 28) + 85, xp: (nivel) => (nivel * 15) + 210 },
    { id: 16, nombre: 'Infiltración en el Mercado', rango: 'E', nivelMinimo: 6, descripcion: 'Escucha las conversaciones de los mercaderes extranjeros sin ser detectado.', objetivo: (nivel) => `Obtener ${nivel - 2} rumores clave`, oro: (nivel) => (nivel * 35) + 95, xp: (nivel) => (nivel * 25) + 230 },
    { id: 17, nombre: 'Carrera de Obstáculos', rango: 'E', nivelMinimo: 7, descripcion: 'Completa el circuito de entrenamiento cargando peso adicional.', objetivo: (nivel) => `Dar ${nivel + 5} vueltas al circuito`, oro: (nivel) => (nivel * 25) + 110, xp: (nivel) => (nivel * 30) + 280 },
    { id: 18, nombre: 'Mascotas Perdidas', rango: 'E', nivelMinimo: 7, descripcion: 'Varios animales domésticos han huido tras una explosión de práctica.', objetivo: (nivel) => `Localizar ${Math.floor(nivel / 3 + 2)} mascotas`, oro: (nivel) => (nivel * 18) + 150, xp: (nivel) => (nivel * 12) + 200 },
    { id: 19, nombre: 'Guardián del Camino Sur', rango: 'E', nivelMinimo: 8, descripcion: 'Protege una pequeña caravana de suministros médicos de los lobos.', objetivo: (nivel) => `Ahuyentar ${nivel + 2} lobos hambrientos`, oro: (nivel) => (nivel * 45) + 130, xp: (nivel) => (nivel * 35) + 350 },
    { id: 20, nombre: 'Frenar el Sabotaje', rango: 'E', nivelMinimo: 9, descripcion: 'Un grupo de pícaros ha montado una base cerca de la muralla. Destrúyela.', objetivo: (nivel) => `Quemar ${nivel - 6} tiendas de campaña enemigas`, oro: (nivel) => (nivel * 55) + 180, xp: (nivel) => (nivel * 40) + 450 },
    { id: 21, nombre: 'Restauración del Santuario', rango: 'E', nivelMinimo: 5, descripcion: 'Elimina los grafitis y la suciedad que dejaron unos vándalos en el templo.', objetivo: (nivel) => `Limpiar ${nivel + 5} estatuas sagradas`, oro: (nivel) => (nivel * 15) + 65, xp: (nivel) => (nivel * 10) + 180 },
    { id: 22, nombre: 'Ayuda Comunitaria', rango: 'E', nivelMinimo: 6, descripcion: 'Reparte paquetes de comida a los hogares afectados por la tormenta.', objetivo: (nivel) => `Entregar ${nivel + 3} cajas de víveres`, oro: (nivel) => (nivel * 12) + 90, xp: (nivel) => (nivel * 15) + 200 },
    { id: 23, nombre: 'Limpieza de Frontera', rango: 'E', nivelMinimo: 7, descripcion: 'Se han encontrado trampas de cazadores furtivos en zonas prohibidas.', objetivo: (nivel) => `Desactivar ${Math.floor(nivel / 2 + 3)} trampas de oso`, oro: (nivel) => (nivel * 25) + 110, xp: (nivel) => (nivel * 20) + 250 },
    { id: 24, nombre: 'Combustible para el Invierno', rango: 'E', nivelMinimo: 7, descripcion: 'Recolecta leña seca para mantener calientes los barracones.', objetivo: (nivel) => `Conseguir ${nivel * 3} troncos de roble`, oro: (nivel) => (nivel * 18) + 120, xp: (nivel) => (nivel * 12) + 240 },
    { id: 25, nombre: 'Protección del Agua', rango: 'E', nivelMinimo: 8, descripcion: 'Asegúrate de que nadie contamine el suministro de agua principal.', objetivo: (nivel) => `Vigilar ${nivel + 2} puntos de control`, oro: (nivel) => (nivel * 30) + 140, xp: (nivel) => (nivel * 25) + 300 },
    { id: 26, nombre: 'Cifrado de Mensajes', rango: 'E', nivelMinimo: 8, descripcion: 'Intercepta y descifra los códigos que usan los contrabandistas.', objetivo: (nivel) => `Descifrar ${nivel - 4} pergaminos ocultos`, oro: (nivel) => (nivel * 40) + 160, xp: (nivel) => (nivel * 30) + 320 },
    { id: 27, nombre: 'Llamas en el Campo', rango: 'E', nivelMinimo: 9, descripcion: 'Apaga los fuegos accidentales causados por los pergaminos explosivos.', objetivo: (nivel) => `Extinguir ${nivel + 1} focos de incendio`, oro: (nivel) => (nivel * 35) + 180, xp: (nivel) => (nivel * 28) + 380 },
    { id: 28, nombre: 'Justicia Local', rango: 'E', nivelMinimo: 9, descripcion: 'Varios ladrones de tiendas intentan escapar por los callejones.', objetivo: (nivel) => `Atrapar ${Math.floor(nivel / 3 + 1)} delincuentes`, oro: (nivel) => (nivel * 50) + 200, xp: (nivel) => (nivel * 40) + 420 },
    { id: 29, nombre: 'Prueba de Maestría Básica', rango: 'E', nivelMinimo: 10, descripcion: 'Demuestra que has dominado las técnicas iniciales contra un instructor.', objetivo: (nivel) => `Bloquear ${nivel * 3} ataques del instructor`, oro: (nivel) => (nivel * 60) + 250, xp: (nivel) => (nivel * 50) + 500 },
    { id: 30, nombre: 'Ceremonia de Iniciación', rango: 'E', nivelMinimo: 10, descripcion: 'Completa tu última tarea oficial para calificar al Rango D.', objetivo: (nivel) => `Completar ${nivel - 7} rondas de combate real`, oro: (nivel) => (nivel * 100) + 300, xp: (nivel) => (nivel * 75) + 800 }
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

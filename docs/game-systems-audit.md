# Auditoría técnica y matriz de balance — Leñador Idle

## 1. Inventario técnico del estado actual

### 1.1 Superficie de ejecución activa

La ruta activa del juego en `index.html` carga, en este orden, `js/app.js`, `js/features/axe-upgrade.js`, `botonatributos.js`, `js/features/active-screen.js` y `js/features/gameplay.js`. Por tanto, la versión ejecutable actual se apoya en el monolito `gameplay.js` más dos módulos funcionales reales: mejoras de hacha y atributos. Existen archivos paralelos en `js-modular/`, `script.js`, `mejorarhacha.js`, `pantallaactiva.js` y módulos `js/axe/`, pero no están conectados a la página actual y deben tratarse como código legado o preparación de refactor.

### 1.2 Core loop actual

| Fase | Entrada / condición | Proceso | Salida de jugador |
|---|---:|---|---|
| Inicialización | DOM listo o script cargado | `startGame()` fija alto de app, carga guardado, redimensiona canvas, pinta escena, actualiza UI y arranca `gameLoop()` | El jugador entra con oro 0, cristales 0, nivel 1 y tronco inicial |
| Tick idle | Cada segundo acumulado dentro de `gameLoop()` | Suma 1 XP, aplica `damageLog(computeGPS())`, verifica level-up, misiones, UI y guardado | Daño automático al tronco y avance pasivo |
| Rotura del tronco | `logHP <= 0` | `triggerLogBreak()` incrementa nivel directamente, acumula oro en pila, anima tronco volador y escala HP/recompensa del siguiente tronco | Progreso visible + pila reclamable |
| Reclamación manual | Click sobre la pila | Transfiere `logPileGold` a `G.gold`, suma `totalGoldEarned`, limpia pila y muestra feedback | Oro líquido para comprar mejoras |
| Gasto / progresión | Menús inferiores | Compra mejoras de hacha, tienda, habilidades, atributos, prestigio o ajustes | Aumenta DPS, GPC, multiplicadores o reinicia ciclo |

### 1.3 Sistemas implementados

| Sistema | Estado | Funciones / datos clave | Observaciones técnicas |
|---|---|---|---|
| Estado global | Activo | `G` contiene monedas, nivel, XP, dificultad, tier de tronco, prestigio, estadísticas del hacha, settings, contadores, puntos y árbol de skills | `attributePoints` ya forma parte del estado inicial activo |
| Tiempo día/noche | Activo visual | `TIME`, `getGameHour()`, `getTimeLabel()`, `isNight()`, `getNightAlpha()`, `updateTimeSystem()` | Cada segundo real equivale a 1 minuto de juego; solo afecta escena/UI, no economía |
| Render de escena | Activo | Canvas, árbol/tronco/leñador/sol/luna/estrellas/pila; polyfill de `roundRect` | Alto valor estético, pero acoplado al monolito de gameplay |
| Tronco / resistencia | Activo | `BASE_LOG_HP = 10`, `G.logTier`, `DIFFICULTIES[*].hpMul`, `currentLogMaxHP`, `damageLog()`, `triggerLogBreak()` | La resistencia escala por dificultad configurada |
| Recompensa de tronco | Activo | `BASE_LOG_GOLD = 10`, `DIFFICULTIES[*].goldMul`, `logPileGold`, `getGoldPerLog()` | La recompensa escala por dificultad y se reclama manualmente |
| DPS / daño pasivo | Activo | `computeGPS()` usa daño de hacha, velocidad, crítico, doble golpe, atributos, skills y prestigio | Es el motor económico primario, aunque se etiqueta como DPS auto |
| Oro por click / GPC | Activo | `computeGPC()` incluye atributos, fuerza, prestigio y suerte | El click directo al tronco aplica daño manual e incrementa `totalClicks` |
| Hacha | Activo | `AXE_UPGRADES`, `axeUpgradeCost()`, `getAxeUpgradeGain()`, `buyAxeUpgrade()`, `useWhetstone()`, `renderAxeModal()` | Los costes usan el modificador de dificultad y el guardado persiste niveles por `id` |
| Atributos | Activo | `Filo de Carbono`, `Reflejo Del Bosque`, `Precisión Quirúrgica`; coste aleatorio por listas; export/import | El modal ya no resetea nivel/XP; los puntos se obtienen por hitos |
| Misiones | Activo | 6 misiones por clicks, oro total y prestigio; recompensas oro/cristal | Las recompensas se ajustan por dificultad y los cristales se conservan |
| Tienda | Activo | 3 packs de cristales por oro y 2 compras de oro por cristales | Los cristales vuelven a ser moneda persistente |
| Skills | Activo | Fuerza, Velocidad, Suerte, Resistencia; costes `costPer` | Los puntos se otorgan al subir de nivel y la compra valida coste completo |
| Eventos | Activo/parcial | Noche de los Leñadores activa oro x2 durante 30 min; Invierno y Fiebre de Oro pendientes | El evento activo modifica la recompensa de troncos mediante `eventGoldBoostUntil` |
| Clanes | Placeholder | Modal “Sin Clan” y lista ficticia | No hay bonus ni backend |
| Prestigio | Activo | Requiere nivel según dificultad, reinicia ciclo, otorga cristales, +punto de atributo y multiplica oro permanente | El bonus depende de `prestigeStep` de la dificultad |
| Persistencia | Activo | `localStorage` clave `lenador_idle_v1`, guardado cada tick y cada 10 s | Persiste cristales, dificultad, `logTier`, atributos y niveles de hacha |
| UI / modales | Activo | `openModal()`, `renderModal()`, renderers por pestaña, `showToast()`, banner level-up | Sistema funcional pero con lógica de juego embebida en renderers |
| Wake Lock | Activo si el navegador soporta API | `navigator.wakeLock.request('screen')`, reintento en `visibilitychange` | Mejora UX mobile sin afectar economía |

### 1.4 Atributos, estadísticas y variables económicas definidas

| Variable | Valor inicial / fórmula | Rol económico | Riesgo actual |
|---|---:|---|---|
| `G.gold` | 0 | Moneda blanda para hacha y tienda | Correcta como sink primario |
| `G.crystals` | 0 | Moneda dura persistente | Fuente: misiones, tienda y prestigio; sink: tienda |
| `G.level` | 1 | Nivel de jugador/progreso por XP | Ya no sube directamente por tronco; sirve como requisito de prestigio |
| `G.xp` / `G.xpNeeded` | 0 / 100; `xpNeeded *= 1.5` | Progresión temporal | Compite con subida directa de nivel por tronco roto |
| `G.prestigeMultiplier` | 1; `* 1.1` por prestigio | Multiplicador permanente de oro/daño económico | Crece lento pero estable; bug impide cierre limpio del loop |
| `G.axeDamage` | 0.5 | Base de DPS | Crece por Filo del Hacha y atributos |
| `G.axeAttackSpeed` | 1 | Golpes/s para DPS | Escala lineal por hacha y multiplicativamente por atributos/skills |
| `G.axeCritChance` | 0; +0.0005/nivel hacha | EV de crítico x2 | Texto indica +0.05%; fórmula correcta como 0.05 puntos porcentuales |
| `G.axeDoubleChance` | 0; +0.0005/nivel hacha | EV de doble golpe | Igual que crítico; puede llegar a 100% tras 2000 niveles teóricos |
| `G.whetstones` | 0 | Consumible de boost temporal | No existe fuente de obtención actual |
| `currentLogMaxHP` | `10 * hpMul[difficulty]^logTier` | Dificultad de objetivo | Parametrizada por dificultad |
| `currentLogGoldReward` | `10 * goldMul[difficulty]^logTier` | Fuente principal de oro | Parametrizada por dificultad |
| `logPileGold` | Acumulado | Banco temporal hasta click | Añade fricción/manualidad útil; puede beneficiarse de evento oro x2 |
| `G.totalClicks` | 0 | Misiones de click | Se incrementa al golpear manualmente el tronco |
| `G.totalGoldEarned` | 0 | Misiones y estadística | Sube con pila, tienda oro y misiones de oro |
| `G.skillPoints` | 0; +1 por nivel | Compra de skills | Fuente estable por level-up |
| `G.attributePoints` | 0; +1 cada 5 niveles/log tiers y +1 por prestigio | Compra atributos | Fuente estable por hitos y metaprogresión |

### 1.5 Sistemas de progresión activos

1. **Progresión por tronco:** cada tronco roto aumenta `G.logTier`, acumula oro y escala el próximo tronco con los multiplicadores de dificultad.
2. **Progresión por XP pasiva/manual:** cada segundo suma 1 XP y cada tronco roto añade XP extra; al superar `xpNeeded`, sube nivel, otorga skill points y escala `xpNeeded` x1.5.
3. **Mejoras de hacha:** costes exponenciales por mejora; daño con ganancia incremental creciente, velocidad lineal, crítico/doble golpe con EV bajo.
4. **Atributos permanentes:** multiplicadores de DPS/velocidad/crit con coste aleatorio en puntos de atributo; persisten y no se reinician con prestigio.
5. **Árbol de habilidades:** multiplicadores de GPC/GPS y crítico manual, limitado por puntos inexistentes.
6. **Misiones:** recompensas automáticas al alcanzar thresholds con oro o cristales ajustados por dificultad.
7. **Prestigio:** reset parcial a partir del nivel requerido por dificultad con multiplicador permanente, cristales y atributo adicional.

## 2. Auditoría y análisis de eficiencia

### 2.1 Coherencia sistémica

> Estado de actualización: los hallazgos críticos de esta tabla ya fueron convertidos en cambios de código en la ruta activa (`js/features/gameplay.js`, `js/features/axe-upgrade.js` y `botonatributos.js`). La tabla se conserva como trazabilidad de auditoría y como checklist de QA.


| Hallazgo | Severidad | Impacto | Recomendación |
|---|---|---|---|
| Dos sistemas de nivel simultáneos: tronco roto y XP por tiempo | Alta | El nivel deja de representar una única métrica; prestigio a nivel 5 puede acelerarse por doble vía | Separar `playerLevel` y `logTier`, o eliminar level-up directo por tronco |
| `renderAttrsModal()` resetea nivel/XP al abrir atributos | Crítica | Pérdida de progreso por navegación de UI | Los renderers no deben mutar estado salvo flags de inicialización inocuos |
| Cristales desactivados en carga, misión y tienda | Alta | Moneda dura inconsistente, tienda rota y prestigio sin premio aspiracional | Rehabilitar cristales o retirar la divisa de UI hasta implementarla |
| Prestigio referencia `reward` inexistente | Crítica | Error runtime al prestigiar | Definir recompensa o quitarla del mensaje |
| Guardado de hacha persiste `owned`, pero hacha usa `level` | Alta | Las mejoras de hacha no se restauran correctamente | Persistir `{id, level}` y recalcular stats al cargar |
| `G.totalClicks` no se incrementa | Media | Misiones de clicks no progresan | Incrementar en clicks relevantes o renombrar misiones a troncos reclamados |
| GPC calculado pero no usado | Media | Skills de fuerza/suerte tienen bajo o nulo valor real | Implementar click al tronco con `computeGPC()` o eliminar esos nodos |
| `buySkill()` no valida coste completo | Media | Skills de coste 2 pueden comprarse con 1 punto y dejar saldo negativo | Cambiar validación a `G.skillPoints >= cost` |
| HP x1.40 vs oro x1.15 | Alta | El tiempo por recompensa crece exponencialmente; riesgo de pared temprana | Ajustar HP/reward/costes con ratios por dificultad |
| Eventos y clanes son placeholders con feedback “activo” | Baja/Media | Promesa de valor no cumplida | Marcar como próximamente o conectar a modificadores reales |

### 2.2 Diagnóstico económico

La economía actual genera una curva de fricción creciente porque la resistencia del tronco aumenta 40% por rotura mientras la recompensa solo aumenta 15%. La eficiencia relativa de recompensa por HP cae según:

```text
Eficiencia_n = (10 * 1.15^n) / (10 * 1.40^n) = (1.15 / 1.40)^n = 0.8214^n
```

Esto implica que, antes de considerar mejoras, cada nuevo tronco entrega aproximadamente un 17.9% menos oro por unidad de daño que el anterior. En un idle, esta pendiente puede ser aceptable si los upgrades crecen más rápido que la pérdida de eficiencia; actualmente los costes del hacha escalan entre x1.70 y x3.50, por lo que algunas rutas se vuelven prohibitivas antes de compensar el HP.

### 2.3 Redundancias y deuda técnica

- **Duplicación de código:** `script.js` y `js/features/gameplay.js` son versiones monolíticas similares; `js-modular/` replica partes del juego; `js/axe/` replica hacha modular que no se carga.
- **Lógica en renderers:** atributos muta progresión desde una función de render; esto complica QA y balance.
- **Estado global no normalizado:** `G`, `TIME`, `AXE_UPGRADES`, `attrSystem`, `missionClaimed` y variables de escena viven en ámbitos mixtos.
- **Economía sin fuente/sink cerrados:** hay sinks para oro, pero las fuentes y sinks de cristales, skill points, attribute points y whetstones no están completos.

## 3. Diseño de sistema de equilibrio por dificultad

### 3.1 Arquitectura propuesta

Separar el balance en un objeto de configuración por dificultad y usar fórmulas parametrizadas:

```js
DIFFICULTY = {
  easy:       { hpMul: 1.24, goldMul: 1.18, costMul: 0.90, gpsMul: 1.15, prestigeReq: 4 },
  medium:     { hpMul: 1.32, goldMul: 1.16, costMul: 1.00, gpsMul: 1.00, prestigeReq: 5 },
  hard:       { hpMul: 1.42, goldMul: 1.13, costMul: 1.12, gpsMul: 0.90, prestigeReq: 7 },
  impossible: { hpMul: 1.56, goldMul: 1.09, costMul: 1.30, gpsMul: 0.78, prestigeReq: 10 }
};
```

Fórmulas recomendadas:

```text
logHP(tier, d)       = baseHP * hpMul[d]^tier
logGold(tier, d)     = baseGold * goldMul[d]^tier * goldDropMul[d]
upgradeCost(lvl,d,u) = baseCost[u] * (costMult[u] * costMul[d])^lvl
expectedDPS          = axeDamage * attackSpeed * (1 + critChance) * (1 + doubleChance)
TTK(tier,d)          = logHP(tier,d) / max(1, expectedDPS * gpsMul[d])
prestigeBonus(p,d)   = 1 + p * prestigeStep[d]
```

### 3.2 Matriz de Balance

| Variable | Fácil | Medio | Difícil | Imposible | Objetivo de diseño |
|---|---:|---:|---:|---:|---|
| Multiplicador HP tronco | x1.24 | x1.32 | x1.42 | x1.56 | Controla TTK principal |
| Multiplicador oro/tronco | x1.18 | x1.16 | x1.13 | x1.09 | Reduce inflación según dificultad |
| Modificador coste upgrades | x0.90 | x1.00 | x1.12 | x1.30 | Modula velocidad de compra |
| Modificador DPS global | x1.15 | x1.00 | x0.90 | x0.78 | Ajusta sensación inmediata sin tocar upgrades |
| Requisito de prestigio | Nivel 4 | Nivel 5 | Nivel 7 | Nivel 10 | Controla duración de ciclo |
| Bonus de prestigio | +12% | +10% | +9% | +8% | Evita snowball en modos altos |
| Drop de cristales | 120% | 100% | 85% | 65% | Compensa dificultad con menor metaprogresión |
| Whetstone duration | 6 min | 5 min | 4 min | 3 min | Mantiene valor táctico variable |
| Misión oro reward | 120% | 100% | 85% | 70% | Evita bypass de economía difícil |
| Límite crítico/doble recomendado | 60% | 50% | 40% | 30% | Controla varianza y runaway EV |

### 3.3 Curvas objetivo por sesión

| Tramo | Duración objetivo | Meta de jugador | Control de diseño |
|---|---:|---|---|
| Early game | 0-10 min | Comprar 2-4 mejoras y romper varios troncos | Coste bajo, HP suave, feedback frecuente |
| Mid game | 10-45 min | Elegir ruta de hacha/atributos y primer prestigio | TTK estable en 20-60 s por tronco |
| Late game | 45+ min | Optimizar multiplicadores, misiones, eventos y prestigios | Soft caps, milestones y objetivos de largo plazo |

## 4. Recomendaciones estratégicas

### 4.1 Correcciones prioritarias antes de balance fino

1. **Normalizar progresión:** introducir `G.logTier` para la dificultad del tronco y reservar `G.level` para jugador/XP/prestigio.
2. **Eliminar mutaciones de render:** `renderAttrsModal()` debe leer estado, no resetear `G.level`, `G.xp` ni `G.xpNeeded`.
3. **Definir economía de cristales:** si los cristales son permanentes, no forzarlos a 0 en `loadGame()`, misiones o tienda; si no, ocultarlos temporalmente.
4. **Arreglar prestigio:** definir `crystalReward = Math.floor(G.level / 5) * difficultyCrystalMul` o remover la recompensa del toast.
5. **Persistir niveles reales de hacha:** guardar y cargar `AXE_UPGRADES.map(({id, level}) => ...)` y recalcular `G.axeDamage`, velocidad, crit y double desde el nivel base.
6. **Crear fuentes de puntos:** otorgar `skillPoints` por cada X niveles de jugador y `attributePoints` por prestigio, misiones o hitos de tronco.
7. **Usar o retirar GPC:** implementar click directo al tronco con `damageLog(computeGPC())` y `G.totalClicks++`, o eliminar GPC/skills de click.

### 4.2 Optimización de lategame

- **Soft caps multiplicativos:** tras cierto umbral, aplicar rendimientos decrecientes a velocidad, crítico y doble golpe para impedir que una sola estadística domine.
- **Milestones por hacha:** cada 10 niveles de `edge` desbloquear bonus fijo o visual, evitando que el crecimiento sea solo numérico.
- **Prestigio con elección:** al prestigiar, permitir elegir entre multiplicador global, cristales extra, duración de piedra o reducción de costes.
- **Eventos reales:** “Noche de los Leñadores” ya funciona como oro x2 por ventana temporal; completar Invierno y Fiebre de Oro con modificadores equivalentes.
- **Economía offline:** si el juego es idle, añadir progreso offline capado por 2-4 h para mejorar retención sin romper economía.
- **Telemetría local de balance:** registrar TTK medio por tronco, oro/minuto, compras/minuto y tiempo al prestigio para ajustar los multiplicadores.

### 4.3 Fórmula de balance recomendada para la primera iteración

Para estabilizar la versión actual sin rediseño completo:

```text
HP:        10 * 1.32^logTier
Oro:       10 * 1.16^logTier
Cost edge: 10 * 1.55^level
Cost speed:50 * 1.90^level
Cost crit: 60 * 2.10^level
Cost dbl: 100 * 2.35^level
```

Esta curva mantiene presión de dificultad, pero reduce la pared creada por HP x1.40 y costes de x2.50-x3.50. La meta es que el jugador siempre vea una compra razonable cercana, aunque no necesariamente óptima.

## 5. Conclusión técnica

El proyecto ya tiene una base visual sólida y un loop idle reconocible: daño automático, rotura de troncos, acumulación/reclamación de oro, compra de upgrades y prestigio. Sin embargo, el balance actual está bloqueado por inconsistencias de estado, monedas parcialmente desactivadas, progresiones duplicadas y una curva HP/recompensa demasiado agresiva. La prioridad no debe ser añadir más contenido, sino cerrar las economías existentes, separar estado de presentación y parametrizar la dificultad con una matriz clara. Una vez estabilizados esos fundamentos, el lategame puede escalar con prestigio, milestones, eventos reales y soft caps.

# Documento de balance: tala de árboles y mejora de hacha

Este documento entrega un rediseño de economía incremental/idle para el juego de tala. Está escrito como especificación de diseño y balance para implementar de forma gradual, priorizando claridad de ROI, progresión de corto plazo y escalabilidad a niveles 1-1000+.

## Fase 1: análisis completo del sistema actual

### A. Recursos y economía

| Sistema | Estado observado | Lectura de balance | Riesgo actual | Recomendación base |
|---|---:|---|---|---|
| Oro | `0` al iniciar | Moneda principal de mejoras; no hay reserva inicial. | Si el primer coste es alto, el jugador espera sin decisiones. | Dar oro por tutorial o bajar Filo inicial a 8 oro. |
| Cristales | `0` al iniciar | Premium currency limpia; evita inflación inicial. | Si solo aparece tarde, no se entiende su valor. | Primer cristal garantizado en nivel 5 o misión de día 1. |
| DPS auto actual | `0.5 daño × 1 golpe/s = 0.5`, con UI reportada en 0.7 | El multiplicador real esperado depende de críticos/dobles/atributos. | Inconsistencia UI/sistema: el jugador no confía en números. | Unificar `DPS_Total` y mostrar desglose. |
| Tiempo | Día 1, arranque a 6:00 AM; ejemplo de UI 6:03 AM | 1 segundo real = 1 minuto de juego; 24 min reales por día. | Día avanza rápido; recompensas diarias pueden farmearse en sesiones largas. | Separar “día visual” de “día económico” o limitar recompensas por fecha real. |
| Nivel/rango | Nivel 1, XP 0/100 | Buen punto inicial para onboarding. | El modal de atributos fuerza nivel/XP a 1/0/100 al renderizar. | No mutar progreso desde UI; usar selector de estado único. |

### B. Árbol actual de mejoras de hacha

| Mejora | Estado actual | Problema de diseño | Diagnóstico |
|---|---:|---|---|
| Filo del Hacha | Nivel 0; +1.25 daño; coste 10 oro; multiplicador 1.70 | Compra inicial muy fuerte y escalado alto. | Excelente primera compra, pero después puede volverse cara demasiado pronto. |
| Calidad del Filo | Nivel 0; +0.10 golpes/s; coste 50 oro; multiplicador 2.50 | Efecto lineal pequeño con coste explosivo. | ROI cae drásticamente tras pocas compras. |
| Hacha Críticos | Nivel 0; +0.05%; coste 60 oro; multiplicador 2.80 | Probabilidad extremadamente baja. | No será perceptible; mala compra psicológica. |
| Hacha Doble Filo | Nivel 0; +0.05%; coste 100 oro; multiplicador 3.50 | Probabilidad muy baja y coste muy agresivo. | Compra trampa salvo que existan sinergias fuertes. |
| Piedra de Afilar | 0 disponibles; x2 daño auto por 5 minutos | Buen booster temporal. | Si se compra con cristales o cae aleatorio, puede romper jefes. | Limitar a 1 activa y guardar cooldown. |

### C. Sistema de atributos actual

| Atributo | Estado actual | Problema de balance | Recomendación |
|---|---:|---|---|
| Filo de Carbono | Nivel 0; coste 1 punto; actual x1.30; siguiente x1.30 | Parece aplicar multiplicador aun en nivel 0 según estructura. | En nivel 0 debe ser x1.00; nivel 1 x1.30. |
| Reflejo del Bosque | Nivel 0; coste 1.50; actual x1.00; siguiente x1.20 | Coste decimal de puntos complica UX. | Usar puntos enteros o convertir a “fragmentos”. |
| Precisión Quirúrgica | Nivel 0; coste 3; actual 0%; siguiente +0.02% | +0.02% es invisible para el jugador. | Subir a +0.15%-0.25% por nivel o convertir a rating acumulativo. |

### Conclusiones de la fase 1

1. La economía actual tiene una primera compra potente, pero costes multiplicativos demasiado altos en velocidad, crítico y doble golpe.
2. Los porcentajes de crítico/doble golpe están por debajo del umbral perceptible. En idle games, una probabilidad necesita sentirse al menos cada 30-60 golpes al inicio; 0.05% significa 1 cada 2,000 golpes.
3. La UI y la simulación deben usar una sola fuente de verdad para DPS, oro/hora, XP y día.
4. Los atributos usan incrementos parcialmente aleatorios; esto dificulta balancear y comparar builds.

## Fase 2: propuestas de reequilibrio

### A. Estadísticas globales por dificultad

| Dificultad | DPS base | Vida árbol nivel 1 | Fórmula vida | Multiplicador oro | Cristales | Progresión por día/nivel |
|---|---:|---:|---|---:|---|---|
| Fácil | 1.20 | 6 | `HP = 6 × 1.12^(nivel-1) × día^0.08` | 2.00x | 0.8%-1.8% por árbol raro; 1-2/día garantizados | Desbloqueos cada 1-2 niveles; día económico permisivo. |
| Medio | 0.80 | 12 | `HP = 12 × 1.16^(nivel-1) × día^0.10` | 1.00x | 0.4%-1.0%; 0.15 + 0.03 × día | Progresión estándar; primer prestigio día 20. |
| Difícil | 0.60 | 24 | `HP = 24 × 1.19^(nivel-1) × día^0.14` | 0.75x | 0.25%-0.7%; recompensas exclusivas | Desbloqueos 30%-50% más lentos. |
| Imposible | 0.45 | 60 | `HP = 60 × 1.22^(nivel-1) × día^0.18 × clima` | 0.50x | 0.1%-0.45%; premios de leaderboard | Regeneración, clima hostil, ventanas de burst. |

### B. Reajuste de costes y ROI por mejora

Definición de ROI: `ROI_segundos = CostoMejora / ΔOroPorSegundo`. Una mejora es eficiente si su ROI es menor que la ventana objetivo de recuperación: 120 s en early game, 8-15 min en mid game, 30-60 min en late game.

| Mejora | Coste base recomendado | Multiplicador por nivel | Fórmula | Punto de ruptura | ROI esperado | Justificación |
|---|---:|---:|---|---|---|---|
| Filo del Hacha | 8 oro | 1.32 | `8 × 1.32^nivel` | Nivel 18-22 si no hay prestigio | 45-140 s early; 5-12 min mid | Daño plano debe ser columna principal al inicio. |
| Calidad del Filo | 35 oro | 1.38 | `35 × 1.38^nivel` | Nivel 14-18 | 70-180 s early; 8-18 min mid | Velocidad escala con daño, por eso puede costar más que Filo. |
| Hacha Críticos | 45 oro | 1.42 | `45 × 1.42^nivel` | Nivel 12-16 sin sinergias | 2-5 min early; rentable con precisión | Subir efecto a +0.15% por nivel para que se note. |
| Hacha Doble Filo | 75 oro | 1.48 | `75 × 1.48^nivel` | Nivel 10-14 sin builds de velocidad | 3-8 min early; muy rentable con velocidad | Debe ser build avanzada, no compra obligatoria. |
| Piedra de Afilar | 1 cristal o 250 oro | Escala por inventario: `coste × 1.25^stock` | `250 × 1.25^piedrasCompradasHoy` | Tras 3 por día | ROI contextual en jefes; no medir como permanente | Booster temporal; limitar abuso por acumulación. |

### C. Nuevos atributos sugeridos

| Atributo | Nivel máx | Descripción y efecto | Coste creciente | Sinergias | Dependencias |
|---|---:|---|---|---|---|
| Savia Dorada | 25 | +3% oro de árboles por nivel. | `2 + nivel × 1` puntos | Filo, jefes, eventos de oro | Nivel 5. |
| Brazo Incansable | 20 | +1.5% velocidad y -0.5% penalización nocturna por nivel. | `2 × 1.18^nivel` | Reflejo, combos | Reflejo nivel 3. |
| Ojo del Leñador | 15 | +0.25% crítico por nivel y +5% daño crítico cada 5 niveles. | `3 × 1.22^nivel` | Precisión, Doble Filo | Precisión nivel 2. |
| Corte Resonante | 10 | Cada 20 golpes, golpe adicional de 80% daño. | `4 × 1.30^nivel` | Velocidad, doble golpe | Calidad nivel 5. |
| Cosecha Limpia | 15 | +2% probabilidad de madera rara por nivel. | `3 × 1.20^nivel` | Eventos, gremios | Día 7. |
| Raíces del Prestigio | 10 | +4% multiplicador permanente por prestigio. | 1 esencia de prestigio + `nivel` | Rebirth | Primer prestigio. |
| Afinado Perfecto | 12 | Piedra de Afilar dura +20 s y da +3% extra por nivel. | `2 + 2×nivel` | Jefes, speedrun | Piedra de Afilar desbloqueada. |
| Tala en Cadena | 10 | +0.5% combo por árbol talado sin inactividad; cap +25%. | `5 × 1.25^nivel` | Misiones activas | Día 10. |
| Corte Anticorteza | 8 | Ignora 2% de armadura/resistencia de árboles especiales por nivel. | `6 × 1.35^nivel` | Jefes legendarios | Nivel 25. |
| Bendición del Bosque | 5 | +1 misión diaria y +5% recompensa de misión por nivel. | `8 × 1.50^nivel` | Retención D7/D30 | Día 14. |

### D. Sistema de progresión

| Sistema | Propuesta | Datos de balance |
|---|---|---|
| XP por nivel | `XP_n = 100 × 1.145^(n-1) × (1 + 0.02√n)` | Mantiene nivel 1-10 rápido y permite 1-1000 con escalado controlado. |
| Desbloqueos | Nivel 2 Filo; 3 Calidad; 5 Crítico; 8 Doble; 10 Piedra; 20 Prestigio; 30 talentos; 50 bioma. | Cada sesión temprana debe desbloquear algo o dejar objetivo claro. |
| Prestigio | Disponible al nivel 20 o tras talar jefe de día 20. Recompensa: `esencia = floor(√oroTotal / 100) + jefes`. | Multiplicador permanente: `1 + 0.12 × esenciaGastada^0.85`. |
| Logros | 3 capas: tutorial, maestría, desafío. | Recompensas: oro temprano, cristales controlados, cosméticos. |
| Eventos temporales | Lluvia, sequía, luna llena, festival de savia. | Usar modificadores simétricos: bonus de oro con penalización de velocidad, etc. |

## Fase 3: fórmulas matemáticas propuestas

### 1. Daño total y DPS esperado

```text
DañoGolpe = (DañoBase + FiloHacha + BonusPlano)
          × MultiplicadorCarbono
          × MultiplicadorPrestigio
          × MultiplicadorPiedra
          × MultiplicadorClima

CritMultEsperado = 1 + ProbCrit × (DañoCritico - 1)
DobleMultEsperado = 1 + ProbDoble × EficienciaDoble
DPS_Total = DañoGolpe × GolpesPorSegundo × CritMultEsperado × DobleMultEsperado × ComboMult
```

Ejemplo medio nivel 3: daño base 0.8, Filo nivel 2 da +2.18, velocidad 1.08, crítico 0.15%, sin doble. `DPS ≈ (2.98 × 1.08 × 1.0015) = 3.22`.

### 2. Coste escalado

```text
CostoNivel(n) = floor(CostoBase × Multiplicador^n × ModDificultad × ModEvento)
CostoAcumulado(0..n) = CostoBase × (Multiplicador^(n+1) - 1) / (Multiplicador - 1)
```

### 3. Tiempo para talar

```text
TiempoTala = VidaÁrbol / DPS_Total
TiempoObjetivoEarly = 5 a 20 segundos por árbol
TiempoObjetivoMid = 20 a 90 segundos por árbol o 5 a 15 min por jefe
```

### 4. Oro generado

```text
OroÁrbol = floor((OroBaseNivel × MultiplicadorOroDificultad × MultiplicadorSavia)
          + (DañoTotalDuranteTala × 0.05)
          + BonusMisión + BonusEvento)
```

El componente por daño debe tener cap: `BonusDaño ≤ 35% de OroBaseNivel` para evitar builds que generen oro infinito con árboles débiles.

### 5. Progresión de dificultad

```text
VidaÁrbolNivel = VidaBase × CrecimientoNivel^(Nivel-1) × Día^CrecimientoDía × ModBioma × ModDificultad
```

No se recomienda usar `1.5^nivel` para árboles normales más allá del prototipo: nivel 50 sería más de 425 millones de veces el nivel 1. Reservar 1.5x para jefes o saltos de bioma.

## Fase 4: balance por dificultad

| Modo | Oro | Vida | Costes | Mecánicas | Recompensas | Público |
|---|---:|---:|---:|---|---|---|
| Fácil | 2.0x | 0.5x | -30% | Sin penalizaciones severas; tutorial guiado. | Más oro, menos prestigio competitivo. | Casual/tutorial. |
| Medio | 1.0x | 1.0x | Base | Curva estándar; todos los sistemas. | Progreso normal. | Jugadores recurrentes. |
| Difícil | 0.75x | 2.0x | +50% | Menos ventanas de bonus; jefes más exigentes. | Cosméticos, insignias, +5% cristales de logro. | Hardcore. |
| Imposible | 0.5x | 5.0x | +150% | Regeneración de árboles, clima hostil, fatiga. | Leaderboards, títulos, cosméticos únicos. | Speedrunners/competitivo. |

## Fase 5: mecánicas adicionales sugeridas

| Sistema | Diseño | Impacto | Advertencia |
|---|---|---|---|
| Combos | +1 acumulación cada golpe/árbol sin pausa; cada acumulación +0.2% DPS, cap por talentos. | Aumenta engagement activo. | Prevenir autoclickers con caps y detección de cadencia imposible. |
| Tipos de madera | Pino: oro; Roble: HP alta; Bambú: velocidad; Ébano: raro/cristal. | Variedad sin romper core loop. | No bloquear progreso por RNG. |
| Jefes legendarios | Cada 10 días o 25 niveles; temporizador y mecánicas. | Picos de emoción y uso de consumibles. | Evitar que Piedra de Afilar trivialice todo; poner cap de burst. |
| Clima | Lluvia: +madera rara/-velocidad; Sol: +oro; Niebla: -crítico/+XP. | Planificación temporal. | Mostrar calendario para que no parezca castigo aleatorio. |
| Equipamiento | Guantes, botas, amuletos, mango del hacha. | Más metaprogresión. | Limitar slots para evitar inflación de stats. |
| Misiones | Diarias: 3; semanales: 5; cadena de temporada. | Retención D1-D30. | No exigir conexión diaria perfecta; permitir acumulación parcial. |
| Gremios | Contribución de madera y jefes cooperativos. | Social y largo plazo. | Evitar pay-to-win grupal. |
| Talentos ramificados | Ramas: daño, velocidad, suerte, economía, utilidad. | Builds reales. | Permitir respec barato al inicio. |
| Durabilidad/afilado | Hacha pierde 0.1% eficiencia por árbol hasta 90%; afilar restaura. | Sink de oro y decisión de timing. | Si se aplica muy pronto, frustra. Desbloquear en difícil/bioma 2. |
| Eventos estacionales | Biomas y cosméticos temporales. | Reactivación D90+. | Separar poder permanente de cosméticos para ética. |

## Fase 6: tablas de datos completas

### Tabla 1: progresión de niveles 1-50, modo medio

| Nivel | Vida Árbol | Oro Base | XP Requerida | Desbloqueo |
|---:|---:|---:|---:|---|
| 1 | 12 | 3 | 102 | Inicio: hacha básica, golpe manual y DPS automático |
| 2 | 14 | 3 | 118 | Mejorar Hacha: Filo del Hacha |
| 3 | 16 | 4 | 136 | Calidad del Filo |
| 4 | 19 | 5 | 156 | Misiones diarias básicas |
| 5 | 22 | 5 | 180 | Hacha Críticos y primera recompensa de cristal |
| 6 | 25 | 6 | 206 | Atributos: Filo de Carbono |
| 7 | 29 | 7 | 237 | — |
| 8 | 34 | 8 | 273 | Hacha Doble Filo |
| 9 | 39 | 9 | 313 | — |
| 10 | 46 | 10 | 360 | Piedra de Afilar y árbol raro |
| 11 | 54 | 12 | 413 | — |
| 12 | 63 | 14 | 474 | Reflejo del Bosque |
| 13 | 74 | 15 | 544 | — |
| 14 | 88 | 18 | 625 | — |
| 15 | 103 | 20 | 717 | Precisión Quirúrgica y jefe menor |
| 16 | 121 | 23 | 823 | — |
| 17 | 143 | 27 | 945 | — |
| 18 | 168 | 30 | 1,084 | — |
| 19 | 197 | 35 | 1,244 | — |
| 20 | 232 | 40 | 1,427 | Prestigio inicial |
| 21 | 272 | 46 | 1,638 | — |
| 22 | 320 | 52 | 1,879 | — |
| 23 | 376 | 60 | 2,155 | — |
| 24 | 441 | 68 | 2,472 | — |
| 25 | 518 | 78 | 2,836 | Clima con modificadores |
| 26 | 608 | 90 | 3,253 | — |
| 27 | 714 | 103 | 3,731 | — |
| 28 | 838 | 117 | 4,280 | — |
| 29 | 984 | 134 | 4,909 | — |
| 30 | 1,155 | 153 | 5,630 | Talentos ramificados |
| 31 | 1,355 | 175 | 6,457 | — |
| 32 | 1,589 | 201 | 7,405 | — |
| 33 | 1,864 | 230 | 8,492 | — |
| 34 | 2,187 | 262 | 9,738 | — |
| 35 | 2,565 | 300 | 11,167 | Árboles legendarios |
| 36 | 3,008 | 343 | 12,806 | — |
| 37 | 3,527 | 392 | 14,684 | — |
| 38 | 4,134 | 449 | 16,838 | — |
| 39 | 4,847 | 513 | 19,307 | — |
| 40 | 5,681 | 586 | 22,138 | Gremios/bono social |
| 41 | 6,658 | 670 | 25,384 | — |
| 42 | 7,802 | 766 | 29,104 | — |
| 43 | 9,142 | 876 | 33,370 | — |
| 44 | 10,712 | 1,001 | 38,259 | — |
| 45 | 12,549 | 1,144 | 43,865 | Eventos semanales |
| 46 | 14,700 | 1,307 | 50,291 | — |
| 47 | 17,218 | 1,494 | 57,658 | — |
| 48 | 20,165 | 1,707 | 66,102 | — |
| 49 | 23,615 | 1,950 | 75,782 | — |
| 50 | 27,653 | 2,228 | 86,879 | Capítulo 2: bioma nuevo |

### Tabla 2: mejoras de hacha, niveles 1-20, costes propuestos modo medio

| Nivel comprado | Filo | Calidad | Crítico | Doble Golpe | Coste total si se compra 1 nivel de cada |
|---:|---:|---:|---:|---:|---:|
| 1 | +1.00 daño | +0.08 g/s | 0.15% | 0.10% | 163 oro |
| 2 | +1.18 daño | +0.16 g/s | 0.30% | 0.20% | 234 oro |
| 3 | +1.36 daño | +0.24 g/s | 0.45% | 0.30% | 336 oro |
| 4 | +1.54 daño | +0.32 g/s | 0.60% | 0.40% | 482 oro |
| 5 | +1.72 daño | +0.40 g/s | 0.75% | 0.50% | 694 oro |
| 6 | +1.90 daño | +0.48 g/s | 0.90% | 0.60% | 1,000 oro |
| 7 | +2.08 daño | +0.56 g/s | 1.05% | 0.70% | 1,441 oro |
| 8 | +2.26 daño | +0.64 g/s | 1.20% | 0.80% | 2,081 oro |
| 9 | +2.44 daño | +0.72 g/s | 1.35% | 0.90% | 3,004 oro |
| 10 | +2.62 daño | +0.80 g/s | 1.50% | 1.00% | 4,343 oro |
| 11 | +2.80 daño | +0.88 g/s | 1.65% | 1.10% | 6,287 oro |
| 12 | +2.98 daño | +0.96 g/s | 1.80% | 1.20% | 9,107 oro |
| 13 | +3.16 daño | +1.04 g/s | 1.95% | 1.30% | 13,202 oro |
| 14 | +3.34 daño | +1.12 g/s | 2.10% | 1.40% | 19,153 oro |
| 15 | +3.52 daño | +1.20 g/s | 2.25% | 1.50% | 27,813 oro |
| 16 | +3.70 daño | +1.28 g/s | 2.40% | 1.60% | 40,416 oro |
| 17 | +3.88 daño | +1.36 g/s | 2.55% | 1.70% | 58,775 oro |
| 18 | +4.06 daño | +1.44 g/s | 2.70% | 1.80% | 85,534 oro |
| 19 | +4.24 daño | +1.52 g/s | 2.85% | 1.90% | 124,564 oro |
| 20 | +4.42 daño | +1.60 g/s | 3.00% | 2.00% | 181,524 oro |

### Tabla 3: atributos

| Atributo | Nivel Máx | Efecto por Nivel | Costo Creciente | Sinergia |
|---|---:|---|---|---|
| Filo de Carbono | 30 | +8% daño automático multiplicativo suave; cada 10 niveles +1 daño plano. | `1 + floor(n/3)` puntos. | Filo del Hacha, Piedra de Afilar. |
| Reflejo del Bosque | 25 | +2.5% golpes/s por nivel; cap suave en 4 golpes/s temprano. | `2 × 1.12^n`. | Calidad, Corte Resonante, Doble Filo. |
| Precisión Quirúrgica | 20 | +0.20% crítico por nivel; +0.05 daño crítico cada 5 niveles. | `3 × 1.15^n`. | Crítico, Ojo del Leñador. |
| Savia Dorada | 25 | +3% oro por árbol por nivel. | `2 + n`. | Misiones, eventos de oro. |
| Brazo Incansable | 20 | +1.5% velocidad y -0.5% fatiga/clima negativo. | `2 × 1.18^n`. | Reflejo, combos. |
| Corte Resonante | 10 | Golpe extra cada `max(10, 22 - n)` golpes. | `4 × 1.30^n`. | Velocidad, doble golpe. |
| Cosecha Limpia | 15 | +2% madera rara por nivel. | `3 × 1.20^n`. | Biomas, gremios. |
| Raíces del Prestigio | 10 | +4% eficacia de esencias por nivel. | Esencia de prestigio. | Rebirth. |
| Afinado Perfecto | 12 | +20 s duración de Piedra y +3% potencia. | `2 + 2n`. | Jefes. |
| Corte Anticorteza | 8 | Ignora 2% resistencia de jefes por nivel. | `6 × 1.35^n`. | Árboles legendarios. |

### Tabla 4: economía por día, modo medio

| Día | Oro/Hora objetivo | Cristales/Día | Mejoras desbloqueables | Objetivo |
|---:|---:|---:|---|---|
| 1 | 25 | 0.18 | Filo, tutorial, misiones iniciales | Entender tala y comprar Filo 1-2 |
| 2 | 34 | 0.21 | Calidad del Filo | Subir DPS a 2.5+ |
| 3 | 45 | 0.24 | Crítico | Primera optimización de ROI |
| 4 | 60 | 0.27 | Misiones diarias | Completar 3 misiones |
| 5 | 81 | 0.3 | Doble golpe | Derrotar primer árbol raro |
| 6 | 108 | 0.33 | — | Mantener 1-3 compras eficientes |
| 7 | 145 | 0.36 | Atributos | Asignar 2 puntos |
| 8 | 194 | 0.39 | — | Mantener 1-3 compras eficientes |
| 9 | 260 | 0.42 | — | Mantener 1-3 compras eficientes |
| 10 | 348 | 0.45 | Jefe menor | Preparar piedra de afilar |
| 11 | 467 | 0.48 | — | Mantener 1-3 compras eficientes |
| 12 | 625 | 0.51 | — | Mantener 1-3 compras eficientes |
| 13 | 838 | 0.54 | — | Mantener 1-3 compras eficientes |
| 14 | 1,123 | 0.57 | Clima | Aprovechar primera ventana de bonificación |
| 15 | 1,505 | 0.6 | — | Mantener 1-3 compras eficientes |
| 16 | 2,016 | 0.63 | — | Mantener 1-3 compras eficientes |
| 17 | 2,702 | 0.66 | — | Mantener 1-3 compras eficientes |
| 18 | 3,620 | 0.69 | — | Mantener 1-3 compras eficientes |
| 19 | 4,851 | 0.72 | — | Mantener 1-3 compras eficientes |
| 20 | 6,500 | 0.75 | Prestigio | Primer rebirth opcional |
| 21 | 8,710 | 0.78 | — | Mantener 1-3 compras eficientes |
| 22 | 11,672 | 0.81 | — | Mantener 1-3 compras eficientes |
| 23 | 15,640 | 0.84 | — | Mantener 1-3 compras eficientes |
| 24 | 20,958 | 0.87 | — | Mantener 1-3 compras eficientes |
| 25 | 28,084 | 0.9 | — | Mantener 1-3 compras eficientes |
| 26 | 37,632 | 0.93 | — | Mantener 1-3 compras eficientes |
| 27 | 50,427 | 0.96 | — | Mantener 1-3 compras eficientes |
| 28 | 67,572 | 0.99 | — | Mantener 1-3 compras eficientes |
| 29 | 90,547 | 1.02 | — | Mantener 1-3 compras eficientes |
| 30 | 121,333 | 1.05 | Talentos avanzados | Elegir especialización |

## Fase 7: métricas de balance y KPIs

| KPI | Objetivo sano | Cómo medir | Alerta de desbalance |
|---|---:|---|---|
| Tiempo promedio por árbol | 5-20 s niveles 1-10; 20-90 s midgame | `HP / DPS` real por segmento. | >120 s antes de nivel 10 o <2 s durante muchos niveles. |
| Tiempo a primera compra | 15-45 s | Telemetría de oro y compra Filo 1. | >90 s reduce onboarding. |
| Tiempo a primera decisión real | 3-6 min | Momento con 2 mejoras comprables. | Si todos compran lo mismo, falta diversidad. |
| Retención D1 | 35%-45% prototipo idle casual | Sesiones por jugador. | <25% indica onboarding lento o UX confusa. |
| Retención D7 | 12%-20% | Usuarios que vuelven. | <8% indica falta de metas diarias. |
| Retención D30 | 4%-8% | Cohortes. | <3% indica metaprogresión débil. |
| Punto de frustración óptimo | 1 pared cada 20-30 min, con solución visible | Tiempo sin compra significativa. | Pared sin objetivo = abandono. |
| Balance F2P vs P2W | Pago acelera 20%-40%, no desbloquea poder exclusivo competitivo | Comparar tiempo a hito. | >2x velocidad permanente pagada rompe equidad. |
| Inflación de moneda | Crecimiento oro/hora menor que crecimiento de costes eficientes | Índice `oro/h / costeMejoraClave`. | Si índice sube infinito, economía se trivializa. |
| Soft caps | Crítico 35%-45%, doble 25%-35%, velocidad 4-6 g/s por era | Distribución de stats. | Caps ocultos sin comunicación frustran. |
| Hard caps | Evitar 100% crítico antes de late game; limitar consumibles simultáneos | Validación de estado. | Stacking de boosters causa one-shot de jefes. |

## Fase 8: recomendaciones finales

### 1. Cinco mejoras críticas a implementar

1. **Unificar fórmula de DPS y UI**: todo debe pasar por `DPS_Total`, con desglose de daño, velocidad, crítico, doble golpe, piedra y prestigio.
2. **Reducir multiplicadores de coste tempranos**: mover Filo 1.70→1.32, Calidad 2.50→1.38, Crítico 2.80→1.42, Doble 3.50→1.48.
3. **Subir probabilidades perceptibles**: crítico de +0.05% a +0.15%-0.20%; doble de +0.05% a +0.10%-0.15%.
4. **Convertir atributos aleatorios en progresión determinista**: el jugador debe poder planificar ROI y builds.
5. **Añadir objetivos de sesión**: misiones, jefes cada 10 días, recompensas de primer cristal y primer prestigio.

### 2. Tres ajustes de balance más urgentes

| Prioridad | Ajuste | Motivo | Ejemplo numérico |
|---:|---|---|---|
| 1 | Bajar coste inicial efectivo de Filo a 8 oro y dar tutorial de 8-10 oro. | Evita espera inicial. | Con 0.8 DPS y árbol HP 12, primer árbol tarda 15 s y compra Filo es inmediata. |
| 2 | Rebalancear Calidad a coste 35 y mult 1.38. | Velocidad debe ser atractiva pero no imposible. | Si daño por golpe es 2.0, +0.08 g/s da +0.16 DPS; coste 35 recupera en ~219 s con oro/DPS 1. |
| 3 | Aumentar crítico inicial a +0.15%. | Probabilidad visible y comparable. | A 1.5 g/s, 0.15% ocurre cada ~11 min; 0.05% cada ~33 min. |

### 3. Tutorial progresivo

| Minuto | Enseñanza | Acción | Recompensa |
|---:|---|---|---|
| 0:00 | Talar y recibir oro | Completar primer árbol | 8 oro. |
| 0:30 | Comprar Filo | Comprar Filo 1 | +1 cristal visual/no gastable aún. |
| 2:00 | Comparar ROI | Mostrar Filo vs Calidad | 25 oro. |
| 5:00 | Misiones | Reclamar misión diaria | 1 punto atributo. |
| 10:00 | Árbol raro | Talar árbol especial | Madera rara/cosmético menor. |
| Día 10 | Jefe | Usar piedra de afilar | Cristales y título. |

### 4. Onboarding de nuevos jugadores

- Mostrar tres barras: árbol actual, oro para próxima compra recomendada y progreso a desbloqueo.
- Evitar más de 2 monedas en los primeros 10 minutos.
- No mostrar porcentajes microscópicos: usar “1 de cada X golpes” junto al porcentaje.
- Botón “recomendado” basado en ROI, pero permitir libertad.

### 5. Retención a 7, 30 y 90 días

| Horizonte | Gancho | Meta de diseño |
|---|---|---|
| D7 | Misiones semanales, primer jefe serio, 2-3 atributos. | El jugador entiende builds. |
| D30 | Prestigio 2-4, bioma nuevo, gremio. | Metaprogresión estable. |
| D90 | Temporadas, leaderboards, cosméticos, retos imposibles. | Reenganche sin obligar a pagar. |

### 6. Monetización ética

- Vender cosméticos, pases de temporada con misiones extra y aceleradores limitados.
- No vender poder exclusivo para leaderboards. Separar leaderboard “sin boosts pagados”.
- Cristales pagados pueden ahorrar tiempo, pero el cap diario de eficacia debe impedir ventajas irreversibles.
- Todo consumible premium debe tener alternativa F2P razonable.

## Advertencias sobre exploits y desbalances

| Riesgo | Descripción | Mitigación |
|---|---|---|
| Autoclicker | Combos o clicks manuales pueden explotarse con cadencias imposibles. | Validar intervalos mínimos, cap de clicks útiles por segundo, combos basados en árboles, no clicks. |
| Stacking de piedra | Varias piedras podrían multiplicar daño exponencialmente. | Reemplazar duración o sumar potencia lineal con cap; nunca multiplicar entre sí. |
| Recompensas diarias por día visual | Si 24 min reales = 1 día, se farmean diarias. | Día económico por fecha real o tokens de recompensa con cooldown. |
| Crítico 100% | Crítico y doble golpe pueden trivializar si no tienen soft cap. | Rating con rendimientos decrecientes: `Prob = Cap × rating/(rating+K)`. |
| Oro por daño sin cap | Jugador farmea árboles débiles con DPS alto para oro infinito. | Cap de bonus por daño y escalado de recompensa por nivel apropiado. |
| Atributos aleatorios | Rerolls o guardado/carga pueden buscar incrementos altos. | Efectos deterministas o semilla de cuenta/compra. |

## Plan de implementación recomendado

1. Crear módulo `balance-config` con constantes por dificultad.
2. Migrar todas las fórmulas a funciones puras testeables: daño, DPS, coste, HP, oro, XP.
3. Añadir pantalla de desglose de estadísticas.
4. Implementar telemetría mínima local para ROI: tiempo entre compras, tiempo por árbol, sesión promedio.
5. Lanzar cambios en modo medio y dejar difícil/imposible como presets bloqueados hasta que medio esté validado.

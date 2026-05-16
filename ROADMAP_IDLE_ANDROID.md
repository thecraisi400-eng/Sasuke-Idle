# Roadmap técnico — Sasuke Idle (Android nativo)

## Fase 1 (base jugable)
1. Modelo de dominio y fórmulas de economía.
2. Loop pasivo con corrutinas en `Dispatchers.Default`.
3. UI principal con Compose:
   - Zona superior: bloque + HP + feedback de daño.
   - Barra inferior de tabs: Mineros, Click, Artefactos, Prestigio.
4. Guardado local con Room + autoguardado cada X segundos.

## Fase 2 (retención)
1. Balanceo por biomas/profundidad.
2. Prestigio completo con árbol de mejoras permanentes.
3. Progreso offline con tope de horas acumulables.

## Fase 3 (producción)
1. Telemetría básica (eventos de economía).
2. Pruebas unitarias de fórmulas.
3. Optimización energética (frecuencia de ticks adaptable).

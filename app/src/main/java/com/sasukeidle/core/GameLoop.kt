package com.sasukeidle.core

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * Bucle de juego para ticks de DPS pasivo.
 *
 * Se ejecuta fuera del hilo principal y emite ticks en intervalo fijo.
 */
class GameLoop(
    private val scope: CoroutineScope,
    private val dispatcher: CoroutineDispatcher,
    private val tickMs: Long = 100L,
    private val onTick: (deltaSeconds: Double) -> Unit
) {
    private var job: Job? = null

    fun start() {
        if (job?.isActive == true) return

        job = scope.launch(dispatcher) {
            while (isActive) {
                onTick(tickMs / 1000.0)
                delay(tickMs)
            }
        }
    }

    fun stop() {
        job?.cancel()
        job = null
    }
}

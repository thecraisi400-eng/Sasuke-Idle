package com.sasukeidle.domain.usecase

import kotlin.math.floor
import kotlin.math.pow

/**
 * Fórmulas centralizadas para mantener balance y facilitar tuning.
 */
object EconomyFormulas {

    /**
     * Coste exponencial controlado.
     */
    fun upgradeCost(base: Double, ratio: Double, level: Int): Double {
        return base * ratio.pow(level)
    }

    /**
     * Vida del bloque por profundidad con crecimiento suave.
     */
    fun blockHpAtDepth(baseHp: Double, depth: Int): Double {
        val stage = floor(depth / 50.0)
        val localDepth = depth % 50
        val stageMultiplier = 1.35.pow(stage)
        val localMultiplier = 1.07.pow(localDepth)
        return baseHp * stageMultiplier * localMultiplier
    }

    /**
     * Recompensa de oro por bloque roto.
     */
    fun goldReward(depth: Int, hp: Double): Double {
        return (depth * 0.8) + (hp * 0.12)
    }

    /**
     * Moneda de prestigio con rendimiento decreciente moderado.
     */
    fun prestigeGain(maxDepthReached: Int): Int {
        if (maxDepthReached < 200) return 0
        return floor((maxDepthReached - 150) / 40.0).toInt()
    }
}

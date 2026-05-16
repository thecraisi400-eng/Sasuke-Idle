package com.sasukeidle.domain.model

/**
 * Estado principal del juego.
 * Mantenerlo inmutable facilita el renderizado eficiente en Compose.
 */
data class GameState(
    val gold: Double = 0.0,
    val depth: Int = 1,
    val currentBlockHp: Double = 10.0,
    val currentBlockMaxHp: Double = 10.0,
    val tapDamage: Double = 1.0,
    val totalDps: Double = 0.0,
    val miners: List<Miner> = emptyList(),
    val prestigeShards: Int = 0
)

data class Miner(
    val id: String,
    val name: String,
    val level: Int,
    val baseCost: Double,
    val costGrowth: Double,
    val baseDps: Double
) {
    val currentCost: Double
        get() = baseCost * Math.pow(costGrowth, level.toDouble())

    val currentDps: Double
        get() = baseDps * level
}

package com.sasukeidle.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sasukeidle.core.GameLoop
import com.sasukeidle.domain.model.GameState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

/**
 * ViewModel principal (MVVM):
 * - Mantiene estado único del juego.
 * - Procesa input de taps.
 * - Ejecuta daño pasivo con GameLoop.
 */
class MainGameViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(GameState())
    val uiState: StateFlow<GameState> = _uiState.asStateFlow()

    private val gameLoop = GameLoop(
        scope = viewModelScope,
        dispatcher = Dispatchers.Default,
        onTick = ::applyPassiveDamage
    )

    init {
        gameLoop.start()
    }

    fun onTapMine() {
        _uiState.update { state ->
            val newHp = state.currentBlockHp - state.tapDamage
            if (newHp > 0) state.copy(currentBlockHp = newHp)
            else state.copy(
                depth = state.depth + 1,
                currentBlockHp = state.currentBlockMaxHp * 1.07,
                currentBlockMaxHp = state.currentBlockMaxHp * 1.07,
                gold = state.gold + (state.currentBlockMaxHp * 0.12)
            )
        }
    }

    private fun applyPassiveDamage(deltaSeconds: Double) {
        _uiState.update { state ->
            if (state.totalDps <= 0.0) return@update state

            val damage = state.totalDps * deltaSeconds
            val newHp = state.currentBlockHp - damage

            if (newHp > 0) {
                state.copy(currentBlockHp = newHp)
            } else {
                state.copy(
                    depth = state.depth + 1,
                    currentBlockHp = state.currentBlockMaxHp * 1.07,
                    currentBlockMaxHp = state.currentBlockMaxHp * 1.07,
                    gold = state.gold + (state.currentBlockMaxHp * 0.12)
                )
            }
        }
    }

    override fun onCleared() {
        gameLoop.stop()
        super.onCleared()
    }
}

'use strict';

class SaveSystem {
  constructor({ state, ui, biomes = [] }) {
    this.state = state;
    this.ui = ui;
    this.biomes = biomes;
    this.storageKey = 'rock-breaker-save-v1';
    this.saveIntervalMs = 2000;
    this.dirty = false;
    this.autoSaveTimer = null;

    this.wrapUIUpdates();
    this.bindLifecycleEvents();
    this.bindStorageSync();
    this.startAutoSave();
  }

  static safeParse(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  wrapUIUpdates() {
    if (!this.ui || typeof this.ui.updateAll !== 'function' || this.ui.__saveWrapped) return;
    const original = this.ui.updateAll.bind(this.ui);
    this.ui.updateAll = (...args) => {
      const result = original(...args);
      this.markDirty();
      return result;
    };
    this.ui.__saveWrapped = true;
  }

  bindLifecycleEvents() {
    window.addEventListener('beforeunload', () => this.flushSave());
    window.addEventListener('pagehide', () => this.flushSave());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.flushSave();
    });
  }

  bindStorageSync() {
    window.addEventListener('storage', (event) => {
      if (event.key !== this.storageKey || !event.newValue) return;
      const payload = SaveSystem.safeParse(event.newValue);
      if (!payload || !payload.data) return;
      this.applySnapshot(payload.data);
      this.refreshUI();
    });
  }

  startAutoSave() {
    this.autoSaveTimer = window.setInterval(() => {
      if (this.dirty) this.flushSave();
    }, this.saveIntervalMs);
  }

  markDirty() {
    this.dirty = true;
  }

  buildSnapshot() {
    const s = this.state;
    return {
      ...s,
      missionsClaimed: Array.from(s.missionsClaimed || []),
      achievementsClaimed: Array.from(s.achievementsClaimed || []),
      currentBiomeId: s.currentBiome?.id || this.biomes[0]?.id || 'cave',
      savedAt: Date.now()
    };
  }

  flushSave() {
    try {
      const payload = {
        version: 1,
        data: this.buildSnapshot()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
      this.dirty = false;
      return true;
    } catch (err) {
      console.warn('No se pudo guardar la partida:', err);
      return false;
    }
  }

  load() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return false;

    const payload = SaveSystem.safeParse(raw);
    if (!payload || !payload.data) return false;

    this.applySnapshot(payload.data);
    this.dirty = false;
    return true;
  }

  applySnapshot(data) {
    const s = this.state;

    Object.keys(data).forEach((key) => {
      if (key === 'missionsClaimed' || key === 'achievementsClaimed' || key === 'skillNodes' || key === 'currentBiomeId' || key === 'savedAt') {
        return;
      }
      if (key in s) s[key] = data[key];
    });

    s.missionsClaimed = new Set(Array.isArray(data.missionsClaimed) ? data.missionsClaimed : []);
    s.achievementsClaimed = new Set(Array.isArray(data.achievementsClaimed) ? data.achievementsClaimed : []);

    if (Array.isArray(data.skillNodes)) {
      s.skillNodes = data.skillNodes.map((node) => ({ ...node }));
    }

    const fallbackBiome = this.biomes[0] || s.currentBiome;
    const biome = this.biomes.find((b) => b.id === data.currentBiomeId) || fallbackBiome;
    if (biome) s.currentBiome = biome;

    s.initRock();
    if (typeof data.rockMaxHP === 'number' && typeof data.rockHP === 'number') {
      s.rockMaxHP = data.rockMaxHP;
      s.rockHP = Math.max(0, Math.min(data.rockHP, data.rockMaxHP));
    }

    if (s.frenzyActive && Date.now() >= s.frenzyEndTime) s.frenzyActive = false;
    if (s.wealthActive && Date.now() >= s.wealthEndTime) s.wealthActive = false;
  }

  refreshUI() {
    if (!this.ui) return;
    if (typeof this.ui.buildBiomes === 'function') this.ui.buildBiomes();
    if (typeof this.ui.buildSkillTree === 'function') this.ui.buildSkillTree();
    if (typeof this.ui.buildMissions === 'function') this.ui.buildMissions();
    if (typeof this.ui.updateAll === 'function') this.ui.updateAll();
  }
}

window.SaveSystem = SaveSystem;

// storage.js — localStorage 存取

const Storage = {
  KEY: 'pixel_pets_collection',

  save(pets) {
    try {
      const data = pets.map(p => ({
        dna: p.dna,
        name: p.name,
        level: p.level,
        exp: p.exp,
        hunger: Math.round(p.hunger),
        happiness: Math.round(p.happiness),
        born: p.born,
      }));
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // 恢复为完整宠物对象
      return data.map(d => ({
        ...d,
        state: 'idle',
        stateTimer: 0,
        _lastTick: null,
      }));
    } catch (e) {
      console.warn('Storage load failed:', e);
      return null;
    }
  },

  clear() {
    localStorage.removeItem(this.KEY);
  }
};

if (typeof module !== 'undefined') module.exports = Storage;

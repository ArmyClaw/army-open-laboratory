// pet.js — 宠物行为/状态/动画

const PET_NAMES = [
  '小豆', '圆圆', '花花', '嘟嘟', '毛毛', '球球', '豆豆', '泡泡',
  '糖糖', '果果', '星星', '月月', '云云', '风风', '雪球', '布丁',
  '奶茶', '汤圆', '芒果', '蓝莓', '草莓', '樱桃', '柠檬', '薄荷',
  '棉花', '饼干', '麻薯', '年糕', '饭团', '寿司', '拉面', '可乐',
  '芒果', '小橘', '大白', '小黑', '花花', '蜜蜜', '可可', '椰果',
];

const Pet = {
  _pets: [],
  _activeIndex: 0,
  _animFrame: null,
  _mouseX: null,
  _mouseY: null,

  create(dna) {
    return {
      dna: dna || DNA.generate(),
      name: PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)],
      level: 1,
      exp: 0,
      hunger: 80, // 0-100, 100=满
      happiness: 70, // 0-100
      born: Date.now(),
      state: 'idle', // idle, happy, hungry, sleep, curious, eating
      stateTimer: 0,
    };
  },

  init() {
    const saved = Storage.load();
    if (saved && saved.length > 0) {
      this._pets = saved;
    } else {
      // 初始宠物
      this._pets.push(this.create());
    }
    this._activeIndex = 0;
    this.startLoop();
  },

  get active() { return this._pets[this._activeIndex]; },
  get all() { return this._pets; },

  setActive(index) {
    if (index >= 0 && index < this._pets.length) {
      this._activeIndex = index;
      this.save();
    }
  },

  feed() {
    const pet = this.active;
    pet.hunger = Math.min(100, pet.hunger + 25);
    pet.happiness = Math.min(100, pet.happiness + 5);
    pet.exp += 10;
    pet.state = 'eating';
    pet.stateTimer = Date.now() + 1500;
    this._checkLevelUp();
    this.save();
  },

  pet() {
    const p = this.active;
    p.happiness = Math.min(100, p.happiness + 15);
    p.exp += 5;
    p.state = 'happy';
    p.stateTimer = Date.now() + 1500;
    this._checkLevelUp();
    this.save();
  },

  play() {
    const p = this.active;
    p.hunger = Math.max(0, p.hunger - 10);
    p.happiness = Math.min(100, p.happiness + 20);
    p.exp += 15;
    p.state = 'happy';
    p.stateTimer = Date.now() + 2000;
    this._checkLevelUp();
    this.save();
  },

  evolve() {
    const p = this.active;
    if (p.exp < p.level * 50) return false;
    p.exp -= p.level * 50;
    p.level++;
    p.dna = DNA.mutate(p.dna, 0.25);
    p.state = 'happy';
    p.stateTimer = Date.now() + 3000;
    this.save();
    return true;
  },

  breed(otherIndex) {
    if (this._pets.length >= 20) return null;
    const parent1 = this.active.dna;
    const parent2 = otherIndex != null ? this._pets[otherIndex].dna : parent1;
    const childDNA = DNA.mutate(DNA.crossover(parent1, parent2), 0.2);
    const child = this.create(childDNA);
    child.name = PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
    this._pets.push(child);
    this.save();
    return child;
  },

  rename(newName) {
    if (newName && newName.trim()) {
      this.active.name = newName.trim().substring(0, 10);
      this.save();
    }
  },

  remove(index) {
    if (this._pets.length <= 1) return;
    this._pets.splice(index, 1);
    if (this._activeIndex >= this._pets.length) this._activeIndex = this._pets.length - 1;
    this.save();
  },

  _checkLevelUp() {
    // 级别只通过evolve()手动升级
  },

  _getState(pet) {
    if (pet.stateTimer > Date.now()) return pet.state;
    // 自动状态
    if (pet.hunger < 20) return 'hungry';
    if (pet.happiness < 20) return 'sleep';
    return 'idle';
  },

  updateMouse(mx, my) {
    this._mouseX = mx;
    this._mouseY = my;
  },

  startLoop() {
    const tick = () => {
      this._update();
      this._render();
      this._animFrame = requestAnimationFrame(tick);
    };
    tick();
  },

  stopLoop() {
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
  },

  _update() {
    const pet = this.active;
    if (!pet) return;

    // 随时间减少饥饿和快乐
    const now = Date.now();
    if (!pet._lastTick) pet._lastTick = now;
    const dt = (now - pet._lastTick) / 1000;
    pet._lastTick = now;

    pet.hunger = Math.max(0, pet.hunger - dt * 0.3);
    pet.happiness = Math.max(0, pet.happiness - dt * 0.15);

    // 自动保存（每30秒）
    if (!this._lastSave || now - this._lastSave > 30000) {
      this.save();
      this._lastSave = now;
    }
  },

  _render() {
    const pet = this.active;
    if (!pet) return;
    const state = {
      anim: this._getState(pet),
      mouseX: this._mouseX,
      mouseY: this._mouseY,
    };
    Renderer.render(pet.dna, state);
    UI.update();
  },

  save() {
    Storage.save(this._pets);
  },

  // DNA浏览器修改
  setDNA(key, value) {
    const pet = this.active;
    if (!pet) return;
    if (key.includes('.')) {
      const parts = key.split('.');
      pet.dna[parts[0]][parseInt(parts[1])] = clamp(parseFloat(value), 0, 255);
    } else {
      pet.dna[key] = typeof value === 'string' ? value : parseFloat(value);
    }
    this.save();
  },

  randomMutate() {
    const pet = this.active;
    if (!pet) return;
    pet.dna = DNA.mutate(pet.dna, 0.3);
    this.save();
  }
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

if (typeof module !== 'undefined') module.exports = Pet;

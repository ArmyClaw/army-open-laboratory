// dna.js — DNA系统：生成、交叉、突变

const DNA = {
  generate() {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    return {
      // 体型
      width: randInt(4, 8),
      height: randInt(4, 8),
      // 颜色
      primaryColor: [randInt(60, 255), randInt(60, 255), randInt(60, 255)],
      secondaryColor: [randInt(40, 200), randInt(40, 200), randInt(40, 200)],
      patternColor: [randInt(0, 255), randInt(0, 255), randInt(0, 255)],
      // 花纹
      pattern: pick(['solid', 'stripes', 'spots', 'checker', 'gradient', 'noise']),
      // 形状
      bodyShape: pick(['round', 'spiky', 'wavy']),
      // 眼睛
      eyeCount: pick([1, 2, 2, 2, 3]),
      eyeSize: randInt(1, 3),
      eyeOffsetY: randFloat(-0.3, 0.3),
      // 嘴巴
      mouth: pick(['smile', 'flat', 'o', 'zigzag']),
      // 四肢
      limbs: pick(['legs', 'wings', 'tail', 'antennae', 'none', 'legs']),
      // 性格
      activity: randFloat(0.2, 1.0),
      friendliness: randFloat(0.2, 1.0),
      curiosity: randFloat(0.2, 1.0),
      // 稀有基因
      glowing: Math.random() < 0.1,
      rainbow: Math.random() < 0.05,
      transparent: Math.random() < 0.05,
      shapeshifting: Math.random() < 0.03,
    };
  },

  crossover(a, b) {
    const child = {};
    for (const key of Object.keys(a)) {
      if (Array.isArray(a[key])) {
        // 交叉颜色
        child[key] = a[key].map((v, i) =>
          Math.random() < 0.5 ? v : (b[key] ? b[key][i] : v)
        );
      } else if (typeof a[key] === 'number') {
        // 交叉数值
        child[key] = Math.random() < 0.5 ? a[key] : b[key];
      } else if (typeof a[key] === 'boolean') {
        // 隐性基因：两个父母都有才高概率
        child[key] = Math.random() < (a[key] && b[key] ? 0.6 : (a[key] || b[key] ? 0.2 : 0));
      } else {
        child[key] = Math.random() < 0.5 ? a[key] : b[key];
      }
    }
    return child;
  },

  mutate(dna, strength = 0.15) {
    const m = JSON.parse(JSON.stringify(dna));
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    // 体型突变
    if (Math.random() < strength) m.width = clamp(m.width + randInt(-1, 1), 3, 10);
    if (Math.random() < strength) m.height = clamp(m.height + randInt(-1, 1), 3, 10);

    // 颜色突变
    if (Math.random() < strength * 2) m.primaryColor = m.primaryColor.map(c => clamp(c + randInt(-30, 30), 0, 255));
    if (Math.random() < strength * 2) m.secondaryColor = m.secondaryColor.map(c => clamp(c + randInt(-30, 30), 0, 255));
    if (Math.random() < strength * 2) m.patternColor = m.patternColor.map(c => clamp(c + randInt(-30, 30), 0, 255));

    // 花纹/形状突变
    if (Math.random() < strength) m.pattern = pick(['solid', 'stripes', 'spots', 'checker', 'gradient', 'noise']);
    if (Math.random() < strength) m.bodyShape = pick(['round', 'spiky', 'wavy']);
    if (Math.random() < strength) m.mouth = pick(['smile', 'flat', 'o', 'zigzag']);
    if (Math.random() < strength) m.limbs = pick(['legs', 'wings', 'tail', 'antennae', 'none']);

    // 眼睛突变
    if (Math.random() < strength * 0.5) m.eyeCount = clamp(m.eyeCount + randInt(-1, 1), 0, 4);
    if (Math.random() < strength) m.eyeSize = clamp(m.eyeSize + randInt(-1, 1), 1, 3);
    if (Math.random() < strength) m.eyeOffsetY = clamp(m.eyeOffsetY + randFloat(-0.2, 0.2), -0.4, 0.4);

    // 性格微变
    if (Math.random() < strength) m.activity = clamp(m.activity + randFloat(-0.1, 0.1), 0, 1);
    if (Math.random() < strength) m.friendliness = clamp(m.friendliness + randFloat(-0.1, 0.1), 0, 1);
    if (Math.random() < strength) m.curiosity = clamp(m.curiosity + randFloat(-0.1, 0.1), 0, 1);

    // 稀有基因可能突变
    if (Math.random() < 0.02) m.glowing = !m.glowing;
    if (Math.random() < 0.01) m.rainbow = !m.rainbow;
    if (Math.random() < 0.01) m.transparent = !m.transparent;
    if (Math.random() < 0.01) m.shapeshifting = !m.shapeshifting;

    return m;
  },

  getColor(dna, type) {
    const c = dna[type + 'Color'] || dna.primaryColor;
    return c;
  },

  toHex(rgb) {
    return '#' + rgb.map(v => clamp(v, 0, 255).toString(16).padStart(2, '0')).join('');
  },

  getSummary(dna) {
    return `体型:${dna.width}×${dna.height} 花:${dna.pattern} 形:${dna.bodyShape} 眼:${dna.eyeCount}`;
  }
};

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

if (typeof module !== 'undefined') module.exports = DNA;

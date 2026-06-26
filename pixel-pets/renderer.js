// renderer.js — 像素渲染引擎

const PIXEL_SIZE = 16; // 每个"像素格"的实际像素大小

const Renderer = {
  canvas: null,
  ctx: null,

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
  },

  render(dna, state = {}) {
    const ctx = this.ctx;
    const w = dna.width * PIXEL_SIZE;
    const h = dna.height * PIXEL_SIZE;
    const padding = PIXEL_SIZE * 2;
    this.canvas.width = w + padding * 2;
    this.canvas.height = h + padding * 2 + (dna.limbs === 'legs' ? PIXEL_SIZE : 0);

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const ox = padding; // offset x
    const oy = padding; // offset y
    const ps = PIXEL_SIZE;

    // 应用动画偏移
    let animDy = 0;
    let animScale = 1;
    if (state.anim === 'idle') animDy = Math.sin(Date.now() / 500) * ps * 0.3;
    else if (state.anim === 'happy') animDy = -Math.abs(Math.sin(Date.now() / 200)) * ps * 1.5;
    else if (state.anim === 'sleep') animDy = ps * 0.5;

    ctx.save();
    ctx.translate(0, animDy);

    // 稀有效果：发光
    if (dna.glowing) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = DNA.toHex(dna.primaryColor);
    }

    // 稀有效果：彩虹色替换
    const primary = dna.rainbow ? this._rainbowColor() : dna.primaryColor;

    // 画身体
    for (let gy = 0; gy < dna.height; gy++) {
      for (let gx = 0; gx < dna.width; gx++) {
        if (this._isBody(gx, gy, dna)) {
          const color = this._getPixelColor(gx, gy, dna, primary);
          ctx.fillStyle = DNA.toHex(color);
          const x = ox + gx * ps;
          const y = oy + gy * ps;

          // 形状
          if (dna.bodyShape === 'round') {
            ctx.beginPath();
            ctx.arc(x + ps / 2, y + ps / 2, ps / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (dna.bodyShape === 'spiky') {
            this._drawSpikyPixel(ctx, x, y, ps);
          } else if (dna.bodyShape === 'wavy') {
            this._drawWavyPixel(ctx, x, y, ps);
          }
        }
      }
    }

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // 稀有效果：透明
    if (dna.transparent) {
      this.canvas.style.opacity = 0.75;
    } else {
      this.canvas.style.opacity = 1;
    }

    // 画眼睛
    this._drawEyes(ctx, dna, ox, oy, state);

    // 画嘴巴
    this._drawMouth(ctx, dna, ox, oy);

    // 画四肢
    this._drawLimbs(ctx, dna, ox, oy, state);

    // 画ZZZ（睡觉）
    if (state.anim === 'sleep') {
      this._drawZzz(ctx, ox + dna.width * ps, oy - ps);
    }

    ctx.restore();
  },

  _isBody(gx, gy, dna) {
    const cx = (dna.width - 1) / 2;
    const cy = (dna.height - 1) / 2;
    const rx = (dna.width / 2) + 0.5;
    const ry = (dna.height / 2) + 0.5;
    // 椭圆体
    const dx = (gx - cx) / rx;
    const dy = (gy - cy) / ry;
    return (dx * dx + dy * dy) <= 1;
  },

  _getPixelColor(gx, gy, dna, primary) {
    const pc = primary || dna.primaryColor;
    switch (dna.pattern) {
      case 'solid': return pc;
      case 'stripes': return gx % 2 === 0 ? pc : dna.secondaryColor;
      case 'spots': return (gx + gy) % 3 === 0 ? dna.patternColor : pc;
      case 'checker': return (gx + gy) % 2 === 0 ? pc : dna.secondaryColor;
      case 'gradient': {
        const t = gx / Math.max(1, dna.width - 1);
        return pc.map((v, i) => Math.round(v + (dna.secondaryColor[i] - v) * t));
      }
      case 'noise': return (Math.random() > 0.7) ? dna.patternColor : pc;
      default: return pc;
    }
  },

  _drawSpikyPixel(ctx, x, y, ps) {
    ctx.beginPath();
    const m = ps * 0.2;
    ctx.moveTo(x + ps / 2, y);
    ctx.lineTo(x + ps, y + ps / 2);
    ctx.lineTo(x + ps / 2, y + ps);
    ctx.lineTo(x, y + ps / 2);
    ctx.closePath();
    ctx.fill();
  },

  _drawWavyPixel(ctx, x, y, ps) {
    ctx.beginPath();
    const cx = x + ps / 2;
    const cy = y + ps / 2;
    const r = ps / 2;
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const wobble = Math.sin(a * 4 + x) * ps * 0.12;
      const rr = r + wobble;
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  },

  _drawEyes(ctx, dna, ox, oy, state) {
    const ps = PIXEL_SIZE;
    const cx = ox + (dna.width * ps) / 2;
    const eyeY = oy + (dna.height * ps * 0.35) + dna.eyeOffsetY * ps;

    const count = dna.eyeCount;
    const size = dna.eyeSize * ps * 0.4;
    const spacing = ps * 1.2;

    const startX = cx - ((count - 1) * spacing) / 2;

    for (let i = 0; i < count; i++) {
      const ex = startX + i * spacing;

      if (state.anim === 'sleep') {
        // 闭眼 - 横线
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ex - size, eyeY);
        ctx.lineTo(ex + size, eyeY);
        ctx.stroke();
      } else {
        // 眼白
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ex, eyeY, size, 0, Math.PI * 2);
        ctx.fill();

        // 瞳孔
        ctx.fillStyle = '#222';
        let pupilOffX = 0, pupilOffY = 0;
        if (state.anim === 'curious' && state.mouseX != null) {
          const rect = this.canvas.getBoundingClientRect();
          const dx = state.mouseX - (ex + rect.left);
          const dy = state.mouseY - (eyeY + rect.top);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          pupilOffX = (dx / dist) * size * 0.3;
          pupilOffY = (dy / dist) * size * 0.3;
        }
        ctx.beginPath();
        ctx.arc(ex + pupilOffX, eyeY + pupilOffY, size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(ex + size * 0.2, eyeY - size * 0.2, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  _drawMouth(ctx, dna, ox, oy) {
    const ps = PIXEL_SIZE;
    const cx = ox + (dna.width * ps) / 2;
    const my = oy + (dna.height * ps * 0.65);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    switch (dna.mouth) {
      case 'smile':
        ctx.beginPath();
        ctx.arc(cx, my - ps * 0.2, ps * 0.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        break;
      case 'flat':
        ctx.beginPath();
        ctx.moveTo(cx - ps * 0.4, my);
        ctx.lineTo(cx + ps * 0.4, my);
        ctx.stroke();
        break;
      case 'o':
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(cx, my, ps * 0.2, ps * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(cx, my, ps * 0.1, ps * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'zigzag':
        ctx.beginPath();
        ctx.moveTo(cx - ps * 0.4, my);
        ctx.lineTo(cx - ps * 0.15, my - ps * 0.15);
        ctx.lineTo(cx + ps * 0.15, my + ps * 0.15);
        ctx.lineTo(cx + ps * 0.4, my);
        ctx.stroke();
        break;
    }
  },

  _drawLimbs(ctx, dna, ox, oy, state) {
    const ps = PIXEL_SIZE;
    const bw = dna.width * ps;
    const bh = dna.height * ps;
    ctx.fillStyle = DNA.toHex(dna.secondaryColor);
    ctx.strokeStyle = DNA.toHex(dna.secondaryColor);
    ctx.lineWidth = ps * 0.3;

    switch (dna.limbs) {
      case 'legs':
        // 四条小腿
        const legW = ps * 0.4;
        const legH = ps * 1.2;
        ctx.fillRect(ox + ps * 0.5 - legW / 2, oy + bh, legW, legH);
        ctx.fillRect(ox + bw - ps * 0.5 - legW / 2, oy + bh, legW, legH);
        break;
      case 'wings':
        ctx.beginPath();
        const wy = oy + bh * 0.3;
        const flapOffset = state.anim === 'happy' ? Math.sin(Date.now() / 100) * ps * 0.5 : 0;
        // 左翅
        ctx.moveTo(ox - ps * 0.2, wy);
        ctx.lineTo(ox - ps * 1.5, wy - ps + flapOffset);
        ctx.lineTo(ox - ps * 0.5, wy + ps * 0.5);
        ctx.fill();
        // 右翅
        ctx.beginPath();
        ctx.moveTo(ox + bw + ps * 0.2, wy);
        ctx.lineTo(ox + bw + ps * 1.5, wy - ps - flapOffset);
        ctx.lineTo(ox + bw + ps * 0.5, wy + ps * 0.5);
        ctx.fill();
        break;
      case 'tail':
        ctx.beginPath();
        ctx.moveTo(ox + bw * 0.5, oy + bh);
        ctx.quadraticCurveTo(ox + bw * 0.7, oy + bh + ps * 1.5, ox + bw * 0.5 + ps, oy + bh + ps * 2);
        ctx.stroke();
        break;
      case 'antennae':
        const atopY = oy - ps * 0.3;
        ctx.beginPath();
        ctx.moveTo(ox + bw * 0.3, oy);
        ctx.lineTo(ox + bw * 0.3 - ps * 0.3, atopY - ps);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ox + bw * 0.3 - ps * 0.3, atopY - ps, ps * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = DNA.toHex(dna.patternColor);
        ctx.fill();

        ctx.strokeStyle = DNA.toHex(dna.secondaryColor);
        ctx.beginPath();
        ctx.moveTo(ox + bw * 0.7, oy);
        ctx.lineTo(ox + bw * 0.7 + ps * 0.3, atopY - ps);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ox + bw * 0.7 + ps * 0.3, atopY - ps, ps * 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  },

  _drawZzz(ctx, x, y) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `${PIXEL_SIZE * 0.8}px "Press Start 2P", monospace`;
    const t = Date.now() / 800;
    for (let i = 0; i < 3; i++) {
      const alpha = 0.3 + (i * 0.2);
      const offsetY = -i * PIXEL_SIZE - Math.sin(t + i) * 3;
      ctx.globalAlpha = alpha;
      ctx.fillText('z', x + i * PIXEL_SIZE * 0.5, y + offsetY);
    }
    ctx.globalAlpha = 1;
  },

  _rainbowColor() {
    const t = (Date.now() / 2000) % 1;
    const h = t * 360;
    return hslToRgb(h, 0.8, 0.6);
  },

  // 渲染缩略图（用于收藏栏）
  renderThumbnail(dna, canvas) {
    const ctx = canvas.getContext('2d');
    const thumbPixel = 6;
    canvas.width = dna.width * thumbPixel + 8;
    canvas.height = dna.height * thumbPixel + 8;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const ox = 4, oy = 4;

    for (let gy = 0; gy < dna.height; gy++) {
      for (let gx = 0; gx < dna.width; gx++) {
        if (this._isBody(gx, gy, dna)) {
          const color = this._getPixelColor(gx, gy, dna, dna.primaryColor);
          ctx.fillStyle = DNA.toHex(color);
          ctx.fillRect(ox + gx * thumbPixel, oy + gy * thumbPixel, thumbPixel, thumbPixel);
        }
      }
    }
    // 简单眼睛
    const cx = ox + (dna.width * thumbPixel) / 2;
    const ey = oy + (dna.height * thumbPixel * 0.35);
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - thumbPixel * 0.5, ey - 1, 2, 2);
    ctx.fillRect(cx + thumbPixel * 0.5, ey - 1, 2, 2);
  }
};

function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

if (typeof module !== 'undefined') module.exports = Renderer;

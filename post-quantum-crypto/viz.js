// ═══════════════════════════════════════════
// Post-Quantum Crypto Lab — Canvas Visualizer
// 粒子动画、密钥生成动画、破解进度可视化
// ═══════════════════════════════════════════

const Viz = (() => {
  const COLORS = {
    bg: '#0a0e1a',
    grid: 'rgba(0, 240, 255, 0.06)',
    quantum: '#00f0ff',
    threat: '#ff2d55',
    safe: '#00ff88',
    gold: '#ffd700',
    purple: '#bf5af2',
    text: '#e0e7ff',
    dim: 'rgba(224, 231, 255, 0.3)',
  };

  // ── 粒子系统：量子计算可视化 ──
  class QuantumParticles {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.resize();
      this.animate();
    }
    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      this.w = rect.width;
      this.h = rect.height;
    }
    addParticle(x, y, color, life = 60) {
      this.particles.push({
        x: x ?? Math.random() * this.w,
        y: y ?? Math.random() * this.h,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life, maxLife: life,
        color: color || COLORS.quantum,
        size: Math.random() * 3 + 1
      });
    }
    update() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0 || p.x < 0 || p.x > this.w || p.y < 0 || p.y > this.h) {
          this.particles.splice(i, 1);
        }
      }
      // 保持粒子数量
      while (this.particles.length < 40) {
        this.addParticle();
      }
    }
    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      // 连线
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const a = this.particles[i], b = this.particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // 粒子
      for (const p of this.particles) {
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        // 发光
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    animate() {
      this.update();
      this.draw();
      this._raf = requestAnimationFrame(() => this.animate());
    }
    destroy() {
      cancelAnimationFrame(this._raf);
    }
  }

  // ── 暴力破解进度条动画 ──
  class CrackProgress {
    constructor(canvas, onFrame) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.onFrame = onFrame;
      this.progress = 0;
      this.speed = 0;
      this.threat = false;
      this.resize();
      this.animate();
    }
    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      this.w = rect.width;
      this.h = rect.height;
    }
    setProgress(pct, threat = false) {
      this.progress = pct;
      this.threat = threat;
    }
    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      const barH = 28;
      const barY = (this.h - barH) / 2;
      const barX = 0;
      const barW = this.w;
      // 背景
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(barX, barY, barW, barH);
      // 进度
      const fillW = Math.min(this.progress / 100, 1) * barW;
      if (fillW > 0) {
        const color = this.threat ? COLORS.threat : COLORS.quantum;
        const grad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
        grad.addColorStop(0, color);
        grad.addColorStop(1, this.threat ? '#ff6b6b' : '#00d4ff');
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, fillW, barH);
        // 发光
        ctx.fillStyle = this.threat ? 'rgba(255, 45, 85, 0.2)' : 'rgba(0, 240, 255, 0.15)';
        ctx.fillRect(barX, barY - 4, fillW, barH + 8);
      }
      // 百分比文字
      ctx.fillStyle = COLORS.text;
      ctx.font = '12px "DM Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.progress.toFixed(6)}%`, this.w / 2, barY + barH / 2 + 4);
      if (this.onFrame) this.onFrame(ctx, this.w, this.h, barY, barH);
    }
    animate() {
      this.draw();
      this._raf = requestAnimationFrame(() => this.animate());
    }
    destroy() { cancelAnimationFrame(this._raf); }
  }

  // ── Shor 算法动画 ──
  class ShorAnimation {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.phase = 0; // 0: idle, 1: period, 2: qft, 3: gcd
      this.t = 0;
      this.particles = [];
      this.resize();
      this.animate();
    }
    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      this.w = rect.width;
      this.h = rect.height;
    }
    setPhase(p) {
      this.phase = p;
      this.t = 0;
      this.particles = [];
    }
    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      if (this.phase === 0) {
        ctx.fillStyle = 'rgba(0,240,255,0.15)';
        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('点击步骤开始演示 →', this.w / 2, this.h / 2);
        return;
      }
      this.t += 0.016;
      if (this.phase === 1) this.drawPeriodFinding(ctx);
      else if (this.phase === 2) this.drawQFT(ctx);
      else if (this.phase === 3) this.drawGCD(ctx);
    }
    drawPeriodFinding(ctx) {
      const N = 15; // demo number
      const r = 4; // period
      // Floating numbers in superposition
      const count = 20;
      for (let i = 0; i < count; i++) {
        const val = (Math.floor(this.t * 3 + i) % N);
        const angle = (i / count) * Math.PI * 2 + this.t * 0.5;
        const cx = this.w / 2;
        const cy = this.h / 2;
        const radius = 80 + 20 * Math.sin(this.t * 2 + i);
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        // Collapse effect
        const collapsed = this.t > 2;
        if (collapsed) {
          const targetAngle = ((val % r) / r) * Math.PI * 2;
          const tx = cx + Math.cos(targetAngle) * 60;
          const ty = cy + Math.sin(targetAngle) * 60;
          const lerp = Math.min((this.t - 2) / 1.5, 1);
          const fx = x + (tx - x) * lerp;
          const fy = y + (ty - y) * lerp;
          ctx.fillStyle = `rgba(0,240,255,${0.6 + 0.4 * lerp})`;
          ctx.font = '16px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(val, fx, fy);
        } else {
          ctx.fillStyle = `rgba(0,240,255,${0.3 + 0.3 * Math.sin(this.t * 3 + i)})`;
          ctx.font = '16px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(val, x, y);
        }
        // Glow
        ctx.beginPath();
        ctx.arc(collapsed ? (x + ((cx + Math.cos(((val % r) / r) * Math.PI * 2) * 60) - x) * Math.min((this.t - 2) / 1.5, 1)) : x, collapsed ? (y + ((cy + Math.sin(((val % r) / r) * Math.PI * 2) * 60) - y) * Math.min((this.t - 2) / 1.5, 1)) : y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,240,255,0.15)';
        ctx.fill();
      }
      // Labels
      ctx.fillStyle = 'rgba(0,240,255,0.5)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`N=${N}, 搜索周期 r...`, 16, 28);
      if (this.t > 2) {
        ctx.fillStyle = COLORS.safe;
        ctx.fillText(`周期 r = ${r} 已找到!`, 16, 48);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.textAlign = 'right';
      ctx.fillText('Step 1/3: 周期查找 (Quantum Phase Estimation)', this.w - 16, 28);
    }
    drawQFT(ctx) {
      const cx = this.w / 2, cy = this.h / 2;
      // Wave interference pattern
      const progress = Math.min(this.t / 3, 1);
      for (let x = 0; x < this.w; x += 2) {
        const freq = 4 * progress;
        const amp = 60 * progress;
        const wave1 = Math.sin((x / this.w) * Math.PI * 2 * freq + this.t * 3) * amp;
        const wave2 = Math.sin((x / this.w) * Math.PI * 2 * freq * 2.5 + this.t * 2) * amp * 0.5;
        const combined = wave1 + wave2;
        const alpha = 0.3 + 0.5 * Math.abs(combined) / (amp * 1.5);
        ctx.fillStyle = `rgba(0,240,255,${alpha})`;
        ctx.fillRect(x, cy + combined - 1, 2, 2);
      }
      // Peak markers
      if (progress > 0.5) {
        const peaks = [0.25, 0.5, 0.75];
        peaks.forEach((p, i) => {
          const px = p * this.w;
          const alpha = Math.min((progress - 0.5) * 2, 1);
          ctx.fillStyle = `rgba(255,45,85,${alpha * 0.8})`;
          ctx.beginPath();
          ctx.moveTo(px, cy - 80);
          ctx.lineTo(px + 5, cy - 70);
          ctx.lineTo(px - 5, cy - 70);
          ctx.fill();
          ctx.fillStyle = `rgba(255,45,85,${alpha})`;
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`k/${4 - i}`, px, cy - 85);
        });
      }
      ctx.fillStyle = 'rgba(0,240,255,0.5)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('量子傅里叶变换: 频域分析中...', 16, 28);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.textAlign = 'right';
      ctx.fillText('Step 2/3: QFT — 量子傅里叶变换', this.w - 16, 28);
    }
    drawGCD(ctx) {
      const progress = Math.min(this.t / 2.5, 1);
      // Show N=15, r=4 → gcd(3^2-1, 15) and gcd(3^2+1, 15)
      const factors = [
        { label: 'gcd(a^(r/2)-1, N)', a: 3, r: 4, op: 'sub', result: 3, color: COLORS.safe },
        { label: 'gcd(a^(r/2)+1, N)', a: 3, r: 4, op: 'add', result: 5, color: COLORS.gold },
      ];
      ctx.textAlign = 'center';
      factors.forEach((f, i) => {
        const y = this.h * 0.35 + i * 80;
        const val = f.op === 'sub' ? Math.pow(f.a, f.r / 2) - 1 : Math.pow(f.a, f.r / 2) + 1;
        // Animate reveal
        const alpha = Math.max(0, (progress - i * 0.3) / 0.5);
        if (alpha <= 0) return;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '13px "JetBrains Mono", monospace';
        ctx.fillText(`${f.label}`, this.w / 2, y);
        if (alpha > 0.3) {
          ctx.fillStyle = f.color;
          ctx.font = 'bold 28px "JetBrains Mono", monospace';
          ctx.fillText(`= ${f.result}`, this.w / 2, y + 35);
        }
        // Line to result
        if (alpha > 0.5) {
          ctx.strokeStyle = `${f.color}44`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(this.w / 2 - 60, y + 50);
          ctx.lineTo(this.w / 2 + 60, y + 50);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });
      // Final result
      if (progress > 0.8) {
        const alpha = (progress - 0.8) / 0.2;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = COLORS.threat;
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText(`15 = 3 × 5  →  RSA 已被分解!`, this.w / 2, this.h * 0.85);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('Step 3/3: GCD — 提取质因子', this.w - 16, 28);
    }
    animate() {
      this.draw();
      this._raf = requestAnimationFrame(() => this.animate());
    }
    destroy() { cancelAnimationFrame(this._raf); }
  }

  // ── 量子比特数曲线图 ──
  class QubitCurveChart {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.qubits = 4000;
      this.resize();
      this.animate();
    }
    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      this.w = rect.width;
      this.h = rect.height;
    }
    setQubits(q) { this.qubits = q; }
    // How many RSA bits can be broken with given qubits
    static crackableBits(qubits) {
      // Rough model: need ~2*qubits for RSA key bits (simplified)
      // RSA-2048 needs ~4100 logical qubits
      return Math.max(0, Math.round(qubits / 2));
    }
    draw() {
      const ctx = this.ctx;
      const w = this.w, h = this.h;
      ctx.clearRect(0, 0, w, h);
      const pad = { l: 50, r: 20, t: 20, b: 36 };
      const cw = w - pad.l - pad.r;
      const ch = h - pad.t - pad.b;
      // Axes
      ctx.strokeStyle = 'rgba(0,240,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t);
      ctx.lineTo(pad.l, h - pad.b);
      ctx.lineTo(w - pad.r, h - pad.b);
      ctx.stroke();
      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('量子比特数', w / 2, h - 4);
      ctx.save();
      ctx.translate(12, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('可破解 RSA 密钥长度 (bit)', 0, 0);
      ctx.restore();
      // Grid lines
      const xTicks = [500, 2000, 4000, 6000, 8000, 10000, 15000, 20000];
      const yTicks = [256, 512, 1024, 2048, 4096, 8000, 10000];
      xTicks.forEach(v => {
        const x = pad.l + (v / 20000) * cw;
        ctx.strokeStyle = 'rgba(0,240,255,0.05)';
        ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h - pad.b); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(v, x, h - pad.b + 14);
      });
      yTicks.forEach(v => {
        const y = h - pad.b - (v / 10000) * ch;
        ctx.strokeStyle = 'rgba(0,240,255,0.05)';
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(v, pad.l - 6, y + 3);
      });
      // Danger zone (RSA-2048 line)
      const y2048 = h - pad.b - (2048 / 10000) * ch;
      ctx.strokeStyle = 'rgba(255,45,85,0.3)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(pad.l, y2048); ctx.lineTo(w - pad.r, y2048); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,45,85,0.6)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('RSA-2048', w - pad.r - 60, y2048 - 6);
      // RSA-4096 line
      const y4096 = h - pad.b - (4096 / 10000) * ch;
      ctx.strokeStyle = 'rgba(255,215,0,0.2)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(pad.l, y4096); ctx.lineTo(w - pad.r, y4096); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,215,0,0.4)';
      ctx.fillText('RSA-4096', w - pad.r - 60, y4096 - 6);
      // Curve
      ctx.beginPath();
      ctx.strokeStyle = COLORS.quantum;
      ctx.lineWidth = 2;
      ctx.shadowColor = COLORS.quantum;
      ctx.shadowBlur = 8;
      for (let q = 100; q <= 20000; q += 50) {
        const bits = this.constructor.crackableBits(q);
        const x = pad.l + (q / 20000) * cw;
        const y = h - pad.b - (bits / 10000) * ch;
        if (q === 100) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Current position marker
      const curBits = this.constructor.crackableBits(this.qubits);
      const mx = pad.l + (this.qubits / 20000) * cw;
      const my = h - pad.b - (curBits / 10000) * ch;
      // Vertical line
      ctx.strokeStyle = 'rgba(255,45,85,0.4)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(mx, h - pad.b); ctx.lineTo(mx, my); ctx.stroke();
      ctx.setLineDash([]);
      // Horizontal line
      ctx.strokeStyle = 'rgba(255,45,85,0.4)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(pad.l, my); ctx.lineTo(mx, my); ctx.stroke();
      ctx.setLineDash([]);
      // Dot
      ctx.beginPath();
      ctx.arc(mx, my, 6, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.threat;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx, my, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,45,85,0.15)';
      ctx.fill();
      // Label
      ctx.fillStyle = COLORS.threat;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = mx > w / 2 ? 'right' : 'left';
      const labelX = mx > w / 2 ? mx - 16 : mx + 16;
      ctx.fillText(`${curBits}-bit RSA`, labelX, my - 10);
    }
    animate() { this.draw(); this._raf = requestAnimationFrame(() => this.animate()); }
    destroy() { cancelAnimationFrame(this._raf); }
  }

  // ── 量子破解消息动画 ──
  class QuantumCrackAnim {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.running = false;
      this.cipherChars = [];
      this.plainChars = [];
      this.progress = 0;
      this.resize();
      this.draw();
    }
    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      this.w = rect.width;
      this.h = rect.height;
    }
    start(cipherText, plainText, onDone) {
      this.cipherChars = cipherText.split('');
      this.plainChars = plainText.split('');
      this.maxLen = Math.max(this.cipherChars.length, this.plainChars.length);
      this.progress = 0;
      this.running = true;
      this.onDone = onDone;
      this.startTime = performance.now();
      this._animate();
    }
    _animate() {
      if (!this.running) return;
      const elapsed = performance.now() - this.startTime;
      this.progress = Math.min(elapsed / 3000, 1); // 3 second animation
      this.draw();
      if (this.progress >= 1) {
        this.running = false;
        if (this.onDone) this.onDone();
        return;
      }
      requestAnimationFrame(() => this._animate());
    }
    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      if (!this.cipherChars.length) {
        ctx.fillStyle = 'rgba(0,240,255,0.15)';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('量子破解动画区域', this.w / 2, this.h / 2);
        return;
      }
      // Background quantum noise
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(0,240,255,${0.02 + Math.random() * 0.03})`;
        ctx.fillRect(Math.random() * this.w, Math.random() * this.h, Math.random() * 4 + 1, Math.random() * 4 + 1);
      }
      // Draw cipher row (top)
      const charW = 14;
      const startX = (this.w - this.maxLen * charW) / 2;
      const cy1 = this.h * 0.35;
      const cy2 = this.h * 0.7;
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (let i = 0; i < this.cipherChars.length; i++) {
        const x = startX + i * charW + charW / 2;
        const crackPct = this.progress * 2; // crack progresses at 2x
        const charPct = i / this.cipherChars.length;
        const cracked = charPct < crackPct;
        if (cracked) {
          // Glitch effect
          const glitch = Math.random() < 0.1 && charPct > crackPct - 0.1;
          ctx.fillStyle = glitch ? COLORS.threat : 'rgba(255,45,85,0.5)';
          ctx.fillText(glitch ? String.fromCharCode(Math.random() * 128) : this.cipherChars[i], x + (glitch ? (Math.random() - 0.5) * 6 : 0), cy1);
        } else {
          ctx.fillStyle = 'rgba(0,240,255,0.7)';
          ctx.fillText(this.cipherChars[i], x, cy1);
        }
      }
      // Labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(0,240,255,0.4)';
      ctx.textAlign = 'left';
      ctx.fillText('CIPHERTEXT', 8, cy1 - 18);
      ctx.fillStyle = this.progress > 0.3 ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.15)';
      ctx.fillText('PLAINTEXT', 8, cy2 - 18);
      // Decryption lines
      if (this.progress > 0.1) {
        const lines = Math.floor(this.progress * this.maxLen);
        for (let i = 0; i < Math.min(lines, this.maxLen); i++) {
          const x = startX + i * charW + charW / 2;
          const alpha = 0.1 + Math.random() * 0.15;
          ctx.strokeStyle = `rgba(191,90,242,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(x, cy1 + 8);
          ctx.lineTo(x + (Math.random() - 0.5) * 4, cy2 - 8);
          ctx.stroke();
        }
      }
      // Plain row (bottom) - gradually reveal
      if (this.progress > 0.2) {
        const revealPct = (this.progress - 0.2) / 0.8;
        for (let i = 0; i < this.plainChars.length; i++) {
          const x = startX + i * charW + charW / 2;
          const charPct = i / this.plainChars.length;
          if (charPct < revealPct) {
            ctx.fillStyle = COLORS.safe;
            ctx.font = '13px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.plainChars[i], x, cy2);
          } else if (charPct < revealPct + 0.05) {
            // Currently decoding
            ctx.fillStyle = COLORS.purple;
            ctx.fillText(String.fromCharCode(Math.random() * 128), x, cy2);
          }
        }
      }
      // Progress bar at bottom
      const barY = this.h - 12;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(8, barY, this.w - 16, 4);
      const grad = ctx.createLinearGradient(8, 0, 8 + (this.w - 16) * this.progress, 0);
      grad.addColorStop(0, COLORS.threat);
      grad.addColorStop(1, COLORS.safe);
      ctx.fillStyle = grad;
      ctx.fillRect(8, barY, (this.w - 16) * this.progress, 4);
      // Status text
      ctx.fillStyle = this.progress >= 1 ? COLORS.threat : 'rgba(255,255,255,0.3)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(this.progress >= 1 ? 'CRACKED' : `${(this.progress * 100).toFixed(0)}%`, this.w - 8, barY - 4);
    }
    destroy() { this.running = false; }
  }

  // ── 格密码可视化 ──
  class LatticeViz {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.basisA = { x: 40, y: 15 };
      this.basisB = { x: 10, y: 35 };
      this.scale = 1;
      this.resize();
      this.animate();
    }
    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      this.w = rect.width;
      this.h = rect.height;
      this._computeLattice();
    }
    setBasis(ax, ay, bx, by) {
      this.basisA = { x: ax, y: ay };
      this.basisB = { x: bx, y: by };
      this._computeLattice();
    }
    _computeLattice() {
      this.points = [];
      this.shortestVec = null;
      this.shortestLen = Infinity;
      const cx = this.w / 2, cy = this.h / 2;
      const { x: ax, y: ay } = this.basisA;
      const { x: bx, y: by } = this.basisB;
      // Auto-scale to fit canvas
      let maxDist = 0;
      for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
          const px = i * ax + j * bx;
          const py = i * ay + j * by;
          maxDist = Math.max(maxDist, Math.abs(px), Math.abs(py));
        }
      }
      this.scale = maxDist > 0 ? Math.min(this.w, this.h) * 0.35 / maxDist : 1;
      // Generate points
      for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
          const px = i * ax + j * bx;
          const py = i * ay + j * by;
          const sx = cx + px * this.scale;
          const sy = cy - py * this.scale;
          if (sx < -20 || sx > this.w + 20 || sy < -20 || sy > this.h + 20) continue;
          this.points.push({ sx, sy, i, j, px, py });
          // Skip origin
          if (i === 0 && j === 0) continue;
          const len = Math.sqrt(px * px + py * py);
          if (len < this.shortestLen) {
            this.shortestLen = len;
            this.shortestVec = { i, j, px, py, sx, sy };
          }
        }
      }
    }
    draw() {
      const ctx = this.ctx;
      const cx = this.w / 2, cy = this.h / 2;
      ctx.clearRect(0, 0, this.w, this.h);
      // Grid lines connecting adjacent points
      const { x: ax, y: ay } = this.basisA;
      const { x: bx, y: by } = this.basisB;
      ctx.strokeStyle = 'rgba(0,240,255,0.06)';
      ctx.lineWidth = 0.5;
      for (const p of this.points) {
        // Connect to neighbors
        const neighbors = [
          { di: 1, dj: 0 }, { di: 0, dj: 1 }, { di: -1, dj: 0 }, { di: 0, dj: -1 }
        ];
        for (const n of neighbors) {
          const nx = cx + ((p.i + n.di) * ax + (p.j + n.dj) * bx) * this.scale;
          const ny = cy - ((p.i + n.di) * ay + (p.j + n.dj) * by) * this.scale;
          if (nx < 0 || nx > this.w || ny < 0 || ny > this.h) continue;
          ctx.beginPath();
          ctx.moveTo(p.sx, p.sy);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }
      }
      // Basis vectors
      ctx.strokeStyle = COLORS.quantum;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + ax * this.scale, cy - ay * this.scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + bx * this.scale, cy - by * this.scale);
      ctx.stroke();
      ctx.setLineDash([]);
      // Basis labels
      ctx.fillStyle = COLORS.quantum;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('v₁', cx + ax * this.scale / 2 - 12, cy - ay * this.scale / 2 - 6);
      ctx.fillText('v₂', cx + bx * this.scale / 2 + 12, cy - by * this.scale / 2 + 12);
      // Shortest vector
      if (this.shortestVec) {
        const sv = this.shortestVec;
        const pulse = 0.6 + 0.4 * Math.sin(performance.now() / 500);
        ctx.strokeStyle = `rgba(255,45,85,${pulse})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = COLORS.threat;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sv.sx, sv.sy);
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Arrow head
        const angle = Math.atan2(-(sv.sy - cy), sv.sx - cx);
        ctx.fillStyle = COLORS.threat;
        ctx.beginPath();
        ctx.moveTo(sv.sx, sv.sy);
        ctx.lineTo(sv.sx - 8 * Math.cos(angle - 0.3), sv.sy + 8 * Math.sin(angle - 0.3));
        ctx.lineTo(sv.sx - 8 * Math.cos(angle + 0.3), sv.sy + 8 * Math.sin(angle + 0.3));
        ctx.fill();
        // Label
        ctx.fillStyle = COLORS.threat;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SVP', (cx + sv.sx) / 2 + 8, (cy + sv.sy) / 2);
      }
      // Points
      for (const p of this.points) {
        if (p.i === 0 && p.j === 0) {
          // Origin
          ctx.fillStyle = COLORS.gold;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = this.shortestVec && p.i === this.shortestVec.i && p.j === this.shortestVec.j
            ? COLORS.threat
            : 'rgba(0,240,255,0.6)';
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, this.shortestVec && p.i === this.shortestVec.i && p.j === this.shortestVec.j ? 5 : 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Origin label
      ctx.fillStyle = COLORS.gold;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('O', cx + 8, cy + 4);
    }
    animate() {
      this.draw();
      this._raf = requestAnimationFrame(() => this.animate());
    }
    destroy() { cancelAnimationFrame(this._raf); }
  }

  // ── 安全检测器渐变条 ──
  class SecurityBar {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.safety = 1; // 1=safe, 0=breached
      this.resize();
      this.draw();
    }
    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      this.w = rect.width;
      this.h = rect.height;
    }
    setSafety(s) { this.safety = Math.max(0, Math.min(1, s)); this.draw(); }
    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      const barH = this.h - 4;
      const barY = 2;
      // Gradient bar
      const grad = ctx.createLinearGradient(0, 0, this.w, 0);
      grad.addColorStop(0, '#00ff88');
      grad.addColorStop(0.35, '#7dff88');
      grad.addColorStop(0.55, '#ffd700');
      grad.addColorStop(0.75, '#ff8c00');
      grad.addColorStop(1, '#ff2d55');
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(0, barY, this.w, barH);
      ctx.fillStyle = grad;
      ctx.fillRect(0, barY, this.w, barH);
      // Dark overlay for "unsafe" portion
      const dangerStart = 1 - this.safety;
      if (dangerStart > 0.01) {
        ctx.fillStyle = 'rgba(10,14,26,0.7)';
        ctx.fillRect(this.w * dangerStart, barY, this.w * (1 - dangerStart), barH);
      }
      // Marker
      const markerX = this.w * dangerStart;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(markerX, barY);
      ctx.lineTo(markerX - 6, barY - 4);
      ctx.lineTo(markerX + 6, barY - 4);
      ctx.fill();
      // Labels
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = COLORS.safe;
      ctx.fillText('SAFE', 4, barY + barH / 2 + 3);
      ctx.textAlign = 'right';
      ctx.fillStyle = COLORS.threat;
      ctx.fillText('BREACHED', this.w - 4, barY + barH / 2 + 3);
    }
    destroy() {}
  }

  // ── 交互式密码学时间线 ──
  class TimelineViz {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.items = [
        {
          year: '~50 BC',
          title: '凯撒密码',
          desc: '字母位移加密。罗马军队用 A→D、B→E 替换传递军令。',
          color: COLORS.quantum,
          events: ['凯撒写信给元老院', '军队通信加密', '破解者尝试解码']
        },
        {
          year: '1977',
          title: 'RSA 诞生',
          desc: 'Rivest、Shamir、Adleman 发明公钥加密。大数分解的困难性成为安全的基石。',
          color: COLORS.gold,
          events: ['三位学者发表论文', '数字签名概念提出', 'SSL/TLS 协议基础']
        },
        {
          year: '1994',
          title: 'Shor 算法',
          desc: 'Peter Shor 证明量子计算机可以多项式时间分解大数。密码学界的达摩克利斯之剑。',
          color: COLORS.threat,
          events: ['Shor在MIT发表突破性论文', '量子计算威胁引起重视', 'NIST开始研究后量子算法']
        },
        {
          year: '2001',
          title: '第一个7-qubit量子计算机',
          desc: 'IBM 实现了包含7个量子比特的计算机，开始验证量子计算的可行性。',
          color: COLORS.purple,
          events: ['IBM Quantum Experience', '量子霸权概念出现', '量子计算投资热潮']
        },
        {
          year: '2019',
          title: '量子霸权',
          desc: 'Google 宣布实现量子霸权，53量子比特的处理器完成经典超级计算机需要数千年的计算。',
          color: COLORS.threat,
          events: ['Google宣布量子霸权', '量子计算加速发展', '密码学界紧急响应']
        },
        {
          year: '2026',
          title: 'RSA-2048 被破解',
          desc: '量子计算机首次分解 2048-bit RSA。现代互联网的加密基石动摇。',
          color: COLORS.threat,
          events: ['RSA-2048量子破解', '全球密码系统升级', '后量子算法大规模部署']
        },
        {
          year: '2026+',
          title: '后量子时代',
          desc: '格密码（Lattice）、哈希签名等后量子算法正在接管。NIST 已标准化 CRYSTALS-Kyber 和 CRYSTALS-Dilithium。',
          color: COLORS.safe,
          events: ['NIST PQC标准发布', 'HTTPS后量子升级', '量子安全基础设施']
        }
      ];
      this.selectedItem = null;
      this.hoveredItem = null;
      this.timeOffset = 0;
      this.resize();
      this.bindEvents();
      this.animate();
    }
    
    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.height = rect.height + 'px';
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      this.w = rect.width;
      this.h = rect.height;
    }
    
    bindEvents() {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.hoveredItem = null;
        const itemWidth = this.w / this.items.length;
        const itemIndex = Math.floor(x / itemWidth);
        
        if (itemIndex >= 0 && itemIndex < this.items.length) {
          this.hoveredItem = itemIndex;
          this.canvas.style.cursor = 'pointer';
        } else {
          this.canvas.style.cursor = 'default';
        }
      });
      
      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const itemWidth = this.w / this.items.length;
        const itemIndex = Math.floor(x / itemWidth);
        
        if (itemIndex >= 0 && itemIndex < this.items.length) {
          this.selectedItem = this.selectedItem === itemIndex ? null : itemIndex;
        }
      });
    }
    
    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      
      const itemWidth = this.w / this.items.length;
      const timelineY = this.h * 0.7;
      const itemHeight = this.h * 0.6;
      
      // 绘制时间线
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, timelineY);
      ctx.lineTo(this.w, timelineY);
      ctx.stroke();
      
      // 绘制时间点
      this.items.forEach((item, i) => {
        const x = i * itemWidth + itemWidth / 2;
        const isSelected = this.selectedItem === i;
        const isHovered = this.hoveredItem === i;
        const scale = isSelected ? 1.3 : (isHovered ? 1.1 : 1);
        
        // 绘制连接线
        ctx.strokeStyle = item.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(x, timelineY);
        ctx.lineTo(x, timelineY - 30);
        ctx.stroke();
        
        // 绘制时间点
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(x, timelineY - 30, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制光晕效果（选中时）
        if (isSelected) {
          ctx.strokeStyle = item.color;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, timelineY - 30, 20, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        
        // 绘制年份
        ctx.fillStyle = COLORS.text;
        ctx.font = `bold ${10 * scale}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(item.year, x, timelineY + 20);
        
        // 绘制标题
        ctx.font = `${11 * scale}px "Inter", sans-serif`;
        ctx.fillText(item.title, x, timelineY - 50);
        
        // 如果选中，显示详细信息
        if (isSelected) {
          const detailY = 20;
          const detailHeight = 120;
          const detailWidth = itemWidth * 0.8;
          const detailX = x - detailWidth / 2;
          
          // 绘制背景
          ctx.fillStyle = 'rgba(26, 32, 53, 0.95)';
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          const radius = 8;
          ctx.moveTo(detailX + radius, detailY);
          ctx.lineTo(detailX + detailWidth - radius, detailY);
          ctx.quadraticCurveTo(detailX + detailWidth, detailY, detailX + detailWidth, detailY + radius);
          ctx.lineTo(detailX + detailWidth, detailY + detailHeight - radius);
          ctx.quadraticCurveTo(detailX + detailWidth, detailY + detailHeight, detailX + detailWidth - radius, detailY + detailHeight);
          ctx.lineTo(detailX + radius, detailY + detailHeight);
          ctx.quadraticCurveTo(detailX, detailY + detailHeight, detailX, detailY + detailHeight - radius);
          ctx.lineTo(detailX, detailY + radius);
          ctx.quadraticCurveTo(detailX, detailY, detailX + radius, detailY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // 绘制描述
          ctx.fillStyle = COLORS.text;
          ctx.font = '11px "Inter", sans-serif';
          ctx.textAlign = 'center';
          wrapText(ctx, item.desc, detailX + detailWidth / 2, detailY + 25, detailWidth - 16, 16);
          
          // 绘制事件
          ctx.fillStyle = COLORS.dim;
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          item.events.forEach((event, j) => {
            const eventY = detailY + 50 + j * 18;
            ctx.fillText(`• ${event}`, detailX + 10, eventY);
          });
        }
      });
    }
    
    animate() {
      this.timeOffset += 0.01;
      this.draw();
      requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
      this.canvas = null;
      this.ctx = null;
    }
  }
  
  // 辅助函数：文本换行
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, x, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  return { QuantumParticles, CrackProgress, COLORS, ShorAnimation, QubitCurveChart, QuantumCrackAnim, LatticeViz, SecurityBar, TimelineViz };
})();

window.Viz = Viz;

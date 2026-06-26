// renderer.js - Canvas 2D renderer with visual effects

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.showTrails = false;
    this.followParticle = null;
    this.backgroundStars = [];
    this.glowCanvas = document.createElement('canvas');
    this.glowCtx = this.glowCanvas.getContext('2d');
    this.resize();
    this._generateStars();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.glowCanvas.width = this.width;
    this.glowCanvas.height = this.height;
    this._generateStars();
  }

  _generateStars() {
    this.backgroundStars = [];
    const count = Math.floor(this.width * this.height / 800);
    for (let i = 0; i < count; i++) {
      this.backgroundStars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.5,
        brightness: 0.3 + Math.random() * 0.7,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  worldToScreen(wx, wy) {
    return {
      x: (wx - this.camera.x) * this.camera.zoom + this.width / 2,
      y: (wy - this.camera.y) * this.camera.zoom + this.height / 2
    };
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.width / 2) / this.camera.zoom + this.camera.x,
      y: (sy - this.height / 2) / this.camera.zoom + this.camera.y
    };
  }

  temperatureColor(t, alpha = 1) {
    // Blue(0) -> Cyan -> Yellow -> Red(0.7) -> White(1.0)
    if (t <= 0) return `rgba(100,150,255,${alpha})`;
    if (t < 0.25) {
      const f = t / 0.25;
      return `rgba(${100 - f * 50},${150 + f * 55},${255},${alpha})`;
    }
    if (t < 0.5) {
      const f = (t - 0.25) / 0.25;
      return `rgba(${50 + f * 205},${205 + f * 50},${255 - f * 155},${alpha})`;
    }
    if (t < 0.75) {
      const f = (t - 0.5) / 0.25;
      return `rgba(${255},${255 - f * 100},${100 - f * 100},${alpha})`;
    }
    const f = (t - 0.75) / 0.25;
    return `rgba(${255},${155 + f * 100},${f * 255},${alpha})`;
  }

  render(simulation, time) {
    const ctx = this.ctx;
    const w = this.width, h = this.height;

    // Follow particle
    if (this.followParticle && this.followParticle.alive) {
      this.camera.x += (this.followParticle.pos.x - this.camera.x) * 0.1;
      this.camera.y += (this.followParticle.pos.y - this.camera.y) * 0.1;
    } else {
      this.followParticle = null;
    }

    // Background
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    bgGrad.addColorStop(0, '#0a0a1a');
    bgGrad.addColorStop(1, '#000005');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Background stars (fixed on screen)
    for (const star of this.backgroundStars) {
      const twinkle = 0.5 + 0.5 * Math.sin(time * 0.001 + star.twinkle);
      const a = star.brightness * twinkle;
      ctx.fillStyle = `rgba(200,210,255,${a})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }

    // Glow layer
    const gCtx = this.glowCtx;
    gCtx.clearRect(0, 0, w, h);
    gCtx.globalCompositeOperation = 'lighter';

    const zoom = this.camera.zoom;

    // Draw trails
    if (this.showTrails) {
      ctx.globalAlpha = 0.3;
      for (const p of simulation.particles) {
        if (p.trail.length < 2) continue;
        ctx.strokeStyle = this.temperatureColor(p.temperature);
        ctx.lineWidth = Math.max(0.5, p.radius * zoom * 0.3);
        ctx.beginPath();
        const first = this.worldToScreen(p.trail[0].x, p.trail[0].y);
        ctx.moveTo(first.x, first.y);
        for (let i = 1; i < p.trail.length; i++) {
          const pt = this.worldToScreen(p.trail[i].x, p.trail[i].y);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Draw particles
    for (const p of simulation.particles) {
      const sp = this.worldToScreen(p.pos.x, p.pos.y);
      const screenRadius = Math.max(0.5, p.radius * zoom);

      // Skip off-screen particles (with margin for glow)
      const margin = screenRadius * 10;
      if (sp.x < -margin || sp.x > w + margin || sp.y < -margin || sp.y > h + margin) continue;

      if (p.isBlackHole) {
        this._drawBlackHole(ctx, gCtx, sp, screenRadius, p, time);
      } else {
        // Glow for massive particles
        if (p.mass > 5 || screenRadius > 2) {
          const glowR = screenRadius * 4;
          const grad = gCtx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, glowR);
          grad.addColorStop(0, this.temperatureColor(p.temperature, 0.3));
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          gCtx.fillStyle = grad;
          gCtx.beginPath();
          gCtx.arc(sp.x, sp.y, glowR, 0, Math.PI * 2);
          gCtx.fill();
        }
        // Particle body
        ctx.fillStyle = this.temperatureColor(p.temperature);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, screenRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Supernova effects
    for (const sn of simulation.supernovas) {
      const sp = this.worldToScreen(sn.x, sn.y);
      const sr = sn.radius * zoom;
      // Flash
      const flashGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sr);
      flashGrad.addColorStop(0, `rgba(255,255,255,${sn.alpha * 0.8})`);
      flashGrad.addColorStop(0.3, `rgba(255,200,100,${sn.alpha * 0.5})`);
      flashGrad.addColorStop(0.6, `rgba(255,100,50,${sn.alpha * 0.3})`);
      flashGrad.addColorStop(1, `rgba(100,50,255,0)`);
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sr, 0, Math.PI * 2);
      ctx.fill();
      // Shockwave ring
      ctx.strokeStyle = `rgba(200,220,255,${sn.alpha * 0.6})`;
      ctx.lineWidth = Math.max(1, 3 * sn.alpha);
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sr, 0, Math.PI * 2);
      ctx.stroke();
      // Glow
      const glowGrad = gCtx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sr * 0.5);
      glowGrad.addColorStop(0, `rgba(255,255,255,${sn.alpha})`);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      gCtx.fillStyle = glowGrad;
      gCtx.beginPath();
      gCtx.arc(sp.x, sp.y, sr * 0.5, 0, Math.PI * 2);
      gCtx.fill();
    }

    // Composite glow
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(this.glowCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    gCtx.globalCompositeOperation = 'source-over';
  }

  _drawBlackHole(ctx, gCtx, sp, screenRadius, particle, time) {
    const r = Math.max(screenRadius, 4);
    const angle = particle.accretionAngle;

    // Accretion disk glow
    const diskR = r * 6;
    const grad = gCtx.createRadialGradient(sp.x, sp.y, r, sp.x, sp.y, diskR);
    grad.addColorStop(0, 'rgba(255,150,50,0.4)');
    grad.addColorStop(0.3, 'rgba(200,100,255,0.2)');
    grad.addColorStop(0.7, 'rgba(50,100,255,0.1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    gCtx.fillStyle = grad;
    gCtx.beginPath();
    gCtx.arc(sp.x, sp.y, diskR, 0, Math.PI * 2);
    gCtx.fill();

    // Accretion disk ring
    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.rotate(angle);
    ctx.scale(1, 0.4);
    for (let i = 0; i < 3; i++) {
      const ringR = r * (2 + i * 1.5);
      const alpha = 0.4 - i * 0.1;
      ctx.strokeStyle = `rgba(${255 - i * 40},${150 + i * 30},${50 + i * 80},${alpha})`;
      ctx.lineWidth = Math.max(1, r * 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Gravitational lensing effect (distortion ring)
    ctx.strokeStyle = 'rgba(150,180,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, r * 3, 0, Math.PI * 2);
    ctx.stroke();

    // Event horizon (black)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
    ctx.fill();
    // Bright edge
    ctx.strokeStyle = 'rgba(200,150,255,0.5)';
    ctx.lineWidth = Math.max(0.5, 1);
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

if (typeof module !== 'undefined') module.exports = { Renderer };

// simulation.js - N-body gravitational simulation with Barnes-Hut optimization

class Vec2 {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
  mul(s) { return new Vec2(this.x * s, this.y * s); }
  div(s) { return s !== 0 ? new Vec2(this.x / s, this.y / s) : new Vec2(); }
  mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
  norm() { const m = this.mag(); return m > 0 ? this.div(m) : new Vec2(); }
  dist(v) { return this.sub(v).mag(); }
  dot(v) { return this.x * v.x + this.y * v.y; }
  clone() { return new Vec2(this.x, this.y); }
}

class Particle {
  constructor(x, y, vx, vy, mass = 1) {
    this.pos = new Vec2(x, y);
    this.vel = new Vec2(vx, vy);
    this.acc = new Vec2();
    this.mass = mass;
    this.radius = Math.max(1, Math.pow(mass, 0.33) * 2);
    this.temperature = 0;
    this.trail = [];
    this.maxTrail = 40;
    this.alive = true;
    this.age = 0;
    this.isBlackHole = false;
    this.accretionAngle = Math.random() * Math.PI * 2;
  }
  addTrail() {
    this.trail.push(this.pos.clone());
    if (this.trail.length > this.maxTrail) this.trail.shift();
  }
}

// Barnes-Hut Quadtree
class QuadTreeNode {
  constructor(cx, cy, size) {
    this.cx = cx; this.cy = cy; this.size = size;
    this.mass = 0; this.comX = 0; this.comY = 0;
    this.children = [null, null, null, null]; // NW, NE, SW, SE
    this.particle = null;
    this.isLeaf = true;
    this.isExternal = true;
  }
  contains(x, y) {
    const half = this.size / 2;
    return x >= this.cx - half && x < this.cx + half &&
           y >= this.cy - half && y < this.cy + half;
  }
  quadrant(x, y) {
    const right = x >= this.cx;
    const bottom = y >= this.cy;
    return (bottom ? 2 : 0) | (right ? 1 : 0);
  }
  childBounds(q) {
    const half = this.size / 2;
    const offsets = [[-half, -half], [half, -half], [-half, half], [half, half]];
    return { cx: this.cx + offsets[q][0], cy: this.cy + offsets[q][1], size: half };
  }
  insert(particle) {
    if (!this.contains(particle.pos.x, particle.pos.y)) return false;
    if (this.isExternal) {
      if (this.particle === null) {
        this.particle = particle;
        return true;
      } else {
        const old = this.particle;
        this.particle = null;
        this.isExternal = false;
        this.isLeaf = true;
        this.subdivide();
        this.insert(old);
        this.insert(particle);
        return true;
      }
    }
    const q = this.quadrant(particle.pos.x, particle.pos.y);
    if (!this.children[q]) {
      const b = this.childBounds(q);
      this.children[q] = new QuadTreeNode(b.cx, b.cy, b.size);
    }
    if (this.children[q].insert(particle)) {
      this.isLeaf = false;
      return true;
    }
    return false;
  }
  subdivide() {
    for (let i = 0; i < 4; i++) {
      const b = this.childBounds(i);
      this.children[i] = new QuadTreeNode(b.cx, b.cy, b.size);
    }
  }
  computeCOM() {
    if (this.isExternal) {
      if (this.particle) {
        this.mass = this.particle.mass;
        this.comX = this.particle.pos.x;
        this.comY = this.particle.pos.y;
      }
      return;
    }
    this.mass = 0; this.comX = 0; this.comY = 0;
    for (let i = 0; i < 4; i++) {
      if (this.children[i]) {
        this.children[i].computeCOM();
        this.mass += this.children[i].mass;
        this.comX += this.children[i].comX * this.children[i].mass;
        this.comY += this.children[i].comY * this.children[i].mass;
      }
    }
    if (this.mass > 0) {
      this.comX /= this.mass;
      this.comY /= this.mass;
    }
  }
}

class Simulation {
  constructor() {
    this.particles = [];
    this.G = 0.5;
    this.softening = 5;
    this.dt = 0.5;
    this.time = 0;
    this.speed = 1;
    this.paused = true;
    this.bhThreshold = 500;
    this.mergeThreshold = 3;
    this.supernovaThreshold = 800;
    this.supernovaChance = 0.0001;
    this.theta = 0.7; // Barnes-Hut opening angle
    this.tree = null;
    this.stats = { particles: 0, blackHoles: 0, avgSpeed: 0, simTime: 0 };
    this.onSupernova = null;
    this.supernovas = []; // active supernova effects
    this.galaxyCount = 0;
    this._galaxyTimer = 0;
  }

  bigBang(count = 1500, initialSpeed = 2) {
    this.particles = [];
    this.time = 0;
    this.supernovas = [];
    const cx = 0, cy = 0;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = initialSpeed * (0.3 + Math.random() * 1.4);
      const mass = 0.5 + Math.random() * 3;
      // slight tangential component for rotation
      const tangentialFactor = (Math.random() - 0.5) * 0.3;
      const vx = Math.cos(angle) * speed + Math.cos(angle + Math.PI / 2) * speed * tangentialFactor;
      const vy = Math.sin(angle) * speed + Math.sin(angle + Math.PI / 2) * speed * tangentialFactor;
      const offset = Math.random() * 5;
      this.particles.push(new Particle(
        cx + Math.cos(angle) * offset,
        cy + Math.sin(angle) * offset,
        vx, vy, mass
      ));
    }
    this.paused = false;
  }

  buildTree() {
    if (this.particles.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of this.particles) {
      if (p.pos.x < minX) minX = p.pos.x;
      if (p.pos.x > maxX) maxX = p.pos.x;
      if (p.pos.y < minY) minY = p.pos.y;
      if (p.pos.y > maxY) maxY = p.pos.y;
    }
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const size = Math.max(rangeX, rangeY, 100) * 1.1;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    this.tree = new QuadTreeNode(cx, cy, size);
    for (const p of this.particles) {
      this.tree.insert(p);
    }
    this.tree.computeCOM();
  }

  computeForce(p) {
    const force = new Vec2();
    this._traverseTree(this.tree, p, force, this.theta);
    return force;
  }

  _traverseTree(node, p, force, theta) {
    if (!node || node.mass === 0 || node === null) return;
    if (node.isExternal) {
      if (node.particle && node.particle !== p && node.particle.alive) {
        const dx = node.particle.pos.x - p.pos.x;
        const dy = node.particle.pos.y - p.pos.y;
        const distSq = dx * dx + dy * dy + this.softening * this.softening;
        const dist = Math.sqrt(distSq);
        const f = this.G * p.mass * node.particle.mass / distSq;
        force.x += f * dx / dist;
        force.y += f * dy / dist;
        // Black hole accretion - extra attraction
        if (node.particle.isBlackHole) {
          const extra = f * 2 * node.particle.mass / p.mass;
          force.x += extra * dx / dist;
          force.y += extra * dy / dist;
        }
      }
      return;
    }
    const dx = node.comX - p.pos.x;
    const dy = node.comY - p.pos.y;
    const distSq = dx * dx + dy * dy + this.softening * this.softening;
    const dist = Math.sqrt(distSq);
    if (node.size / dist < theta) {
      const f = this.G * p.mass * node.mass / distSq;
      force.x += f * dx / dist;
      force.y += f * dy / dist;
      return;
    }
    for (let i = 0; i < 4; i++) {
      if (node.children[i]) {
        this._traverseTree(node.children[i], p, force, theta);
      }
    }
  }

  mergeParticles(a, b) {
    const totalMass = a.mass + b.mass;
    a.pos = new Vec2(
      (a.pos.x * a.mass + b.pos.x * b.mass) / totalMass,
      (a.pos.y * a.mass + b.pos.y * b.mass) / totalMass
    );
    a.vel = new Vec2(
      (a.vel.x * a.mass + b.vel.x * b.mass) / totalMass,
      (a.vel.y * a.mass + b.vel.y * b.mass) / totalMass
    );
    a.mass = totalMass;
    a.radius = Math.max(1, Math.pow(totalMass, 0.33) * 2);
    a.temperature = Math.min(1, a.temperature + b.temperature * 0.3);
    b.alive = false;
  }

  triggerSupernova(particle) {
    const sx = particle.pos.x;
    const sy = particle.pos.y;
    const energy = particle.mass * 5;
    // Eject particles
    for (const p of this.particles) {
      if (p === particle || !p.alive) continue;
      const dx = p.pos.x - sx;
      const dy = p.pos.y - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < energy * 3 && dist > 0) {
        const push = energy / (dist * dist) * this.dt;
        p.vel.x += dx / dist * push;
        p.vel.y += dy / dist * push;
        p.temperature = Math.min(1, p.temperature + 0.5 / dist);
      }
    }
    // Split the supernova particle
    particle.mass *= 0.3;
    particle.radius = Math.max(1, Math.pow(particle.mass, 0.33) * 2);
    particle.temperature = 1;
    // Spawn ejecta
    const ejectaCount = Math.min(30, Math.floor(particle.mass * 2));
    for (let i = 0; i < ejectaCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * energy * 0.5;
      const m = 0.1 + Math.random() * 0.5;
      const ep = new Particle(
        sx + Math.cos(angle) * 3,
        sy + Math.sin(angle) * 3,
        particle.vel.x + Math.cos(angle) * speed,
        particle.vel.y + Math.sin(angle) * speed,
        m
      );
      ep.temperature = 0.8 + Math.random() * 0.2;
      this.particles.push(ep);
    }
    // Visual effect
    this.supernovas.push({
      x: sx, y: sy,
      radius: 0,
      maxRadius: energy * 4,
      alpha: 1,
      time: 0
    });
  }

  countGalaxies() {
    // Simple clustering estimate using density
    if (this.particles.length < 10) return 0;
    const grid = {};
    const cellSize = 50;
    for (const p of this.particles) {
      if (!p.alive) continue;
      const key = `${Math.floor(p.pos.x / cellSize)},${Math.floor(p.pos.y / cellSize)}`;
      grid[key] = (grid[key] || 0) + 1;
    }
    // Count clusters (cells with > threshold particles)
    let clusters = 0;
    const threshold = Math.max(3, this.particles.length * 0.005);
    for (const count of Object.values(grid)) {
      if (count > threshold) clusters++;
    }
    // Rough grouping
    return Math.max(1, Math.round(clusters / 5));
  }

  step() {
    if (this.paused || this.particles.length === 0) return;

    const subSteps = Math.max(1, Math.round(this.speed));
    const subDt = this.dt * this.speed / subSteps;

    for (let s = 0; s < subSteps; s++) {
      this.buildTree();

      // Compute forces
      for (const p of this.particles) {
        if (!p.alive) continue;
        p.acc = this.computeForce(p);
      }

      // Integrate (Leapfrog-ish)
      for (const p of this.particles) {
        if (!p.alive) continue;
        p.vel.x += p.acc.x / p.mass * subDt;
        p.vel.y += p.acc.y / p.mass * subDt;
        p.pos.x += p.vel.x * subDt;
        p.pos.y += p.vel.y * subDt;
        p.age += subDt;

        // Update temperature based on speed
        const speed = p.vel.mag();
        p.temperature = Math.min(1, speed / 15);
        p.radius = Math.max(1, Math.pow(p.mass, 0.33) * 2);

        // Black hole check
        if (p.mass > this.bhThreshold && !p.isBlackHole) {
          p.isBlackHole = true;
        }

        // Supernova check (non-black-hole high mass)
        if (!p.isBlackHole && p.mass > this.supernovaThreshold) {
          if (Math.random() < this.supernovaChance * subDt) {
            this.triggerSupernova(p);
          }
        }

        // Black hole accretion rotation
        if (p.isBlackHole) {
          p.accretionAngle += 0.05 * subDt;
        }
      }

      // Collision / merge detection (simple O(n²) for nearby particles)
      const alive = this.particles.filter(p => p.alive);
      if (alive.length < 1000) {
        for (let i = 0; i < alive.length; i++) {
          for (let j = i + 1; j < alive.length; j++) {
            const a = alive[i], b = alive[j];
            if (!a.alive || !b.alive) continue;
            const dx = a.pos.x - b.pos.x;
            const dy = a.pos.y - b.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = a.radius + b.radius;
            if (dist < minDist * this.mergeThreshold) {
              if (a.mass >= b.mass) {
                this.mergeParticles(a, b);
              } else {
                this.mergeParticles(b, a);
              }
            }
            // Black hole eats nearby particles
            if (a.isBlackHole && dist < a.radius * 4) {
              a.mass += b.mass * 0.1;
              b.mass *= 0.7;
              if (b.mass < 0.1) b.alive = false;
              a.radius = Math.max(1, Math.pow(a.mass, 0.33) * 2);
            }
            if (b.isBlackHole && dist < b.radius * 4) {
              b.mass += a.mass * 0.1;
              a.mass *= 0.7;
              if (a.mass < 0.1) a.alive = false;
              b.radius = Math.max(1, Math.pow(b.mass, 0.33) * 2);
            }
          }
        }
      }

      this.time += subDt;
    }

    // Add trails every frame
    for (const p of this.particles) {
      if (p.alive) p.addTrail();
    }

    // Remove dead particles
    this.particles = this.particles.filter(p => p.alive);

    // Update supernova effects
    for (const sn of this.supernovas) {
      sn.time += this.dt * this.speed;
      sn.radius = sn.maxRadius * (1 - Math.exp(-sn.time * 3));
      sn.alpha = Math.exp(-sn.time * 1.5);
    }
    this.supernovas = this.supernovas.filter(sn => sn.alpha > 0.01);

    // Update stats
    this._galaxyTimer += this.dt * this.speed;
    if (this._galaxyTimer > 50) {
      this.galaxyCount = this.countGalaxies();
      this._galaxyTimer = 0;
    }
    this.stats.particles = this.particles.length;
    this.stats.blackHoles = this.particles.filter(p => p.isBlackHole).length;
    let totalSpeed = 0;
    for (const p of this.particles) totalSpeed += p.vel.mag();
    this.stats.avgSpeed = this.particles.length > 0 ? totalSpeed / this.particles.length : 0;
    this.stats.simTime = this.time;
  }
}

// Export for both browser and Node
if (typeof module !== 'undefined') module.exports = { Simulation, Particle, Vec2, QuadTreeNode };

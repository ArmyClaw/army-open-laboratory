// ═══════════════════════════════════════════
// Post-Quantum Crypto Lab — Kyber 可视化
// 格结构可视化、密钥封装动画、后量子安全性演示
// ═══════════════════════════════════════════

const KyberViz = (() => {
  const COLORS = {
    bg: '#0a0e1a',
    grid: 'rgba(0, 240, 255, 0.06)',
    quantum: '#00f0ff',
    lattice: '#00ff88',
    threat: '#ff2d55',
    safe: '#00ff88',
    gold: '#ffd700',
    purple: '#bf5af2',
    text: '#e0e7ff',
    dim: 'rgba(224, 231, 255, 0.3)',
  };

  // ── 格结构可视化 ──
  class LatticeVisualization {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.points = [];
      this.basis = [];
      this.currentKeys = null;
      this.resize();
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    generateLattice(basis = null) {
      // 生成格点和基向量
      this.basis = basis || [
        [50, 0],  // 基向量1
        [0, 50]   // 基向量2
      ];
      
      // 生成格点
      this.points = [];
      const range = 8;
      for (let i = -range; i <= range; i++) {
        for (let j = -range; j <= range; j++) {
          const x = i * this.basis[0][0] + j * this.basis[1][0];
          const y = i * this.basis[0][1] + j * this.basis[1][1];
          this.points.push({ x, y });
        }
      }
    }

    draw() {
      const width = this.canvas.style.width.replace('px', '');
      const height = this.canvas.style.height.replace('px', '');
      
      this.ctx.fillStyle = COLORS.bg;
      this.ctx.fillRect(0, 0, width, height);
      
      // 绘制网格背景
      this.ctx.strokeStyle = COLORS.grid;
      this.ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 60) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, height);
        this.ctx.stroke();
      }
      for (let y = 0; y < height; y += 60) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(width, y);
        this.ctx.stroke();
      }
      
      // 绘制格点
      this.ctx.fillStyle = COLORS.lattice;
      this.points.forEach(point => {
        const screenX = width / 2 + point.x;
        const screenY = height / 2 + point.y;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
        this.ctx.fill();
      });
      
      // 绘制基向量
      const centerX = width / 2;
      const centerY = height / 2;
      
      // 基向量1 (红色)
      this.ctx.strokeStyle = '#ff2d55';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(centerX + this.basis[0][0], centerY + this.basis[0][1]);
      this.ctx.stroke();
      
      // 基向量2 (蓝色)
      this.ctx.strokeStyle = COLORS.quantum;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(centerX + this.basis[1][0], centerY + this.basis[1][1]);
      this.ctx.stroke();
      
      // 添加标签
      this.ctx.fillStyle = COLORS.text;
      this.ctx.font = '12px JetBrains Mono';
      this.ctx.fillText('b₁', centerX + this.basis[0][0] - 10, centerY + this.basis[0][1] + 15);
      this.ctx.fillText('b₂', centerX + this.basis[1][0] + 10, centerY + this.basis[1][1] - 10);
    }

    animate() {
      this.draw();
      requestAnimationFrame(() => this.animate());
    }
  }

  // ── 密钥封装动画 ──
  class KEMAnimation {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.frame = 0;
      this.phase = 'idle'; // idle, encrypt, transmit, decrypt
      this.keys = null;
      this.ciphertext = null;
      this.resize();
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    startEncryption(keys) {
      this.keys = keys;
      this.phase = 'encrypt';
      this.frame = 0;
    }

    draw() {
      const width = this.canvas.style.width.replace('px', '');
      const height = this.canvas.style.height.replace('px', '');
      
      this.ctx.fillStyle = COLORS.bg;
      this.ctx.fillRect(0, 0, width, height);
      
      // 绘制Alice和Bob
      const aliceX = width * 0.25;
      const bobX = width * 0.75;
      const centerY = height / 2;
      
      // Alice (发送方)
      this.ctx.fillStyle = COLORS.quantum;
      this.ctx.fillRect(aliceX - 40, centerY - 40, 80, 80);
      this.ctx.fillStyle = COLORS.text;
      this.ctx.font = '14px JetBrains Mono';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Alice', aliceX, centerY + 60);
      
      // Bob (接收方)
      this.ctx.fillStyle = COLORS.lattice;
      this.ctx.fillRect(bobX - 40, centerY - 40, 80, 80);
      this.ctx.fillStyle = COLORS.text;
      this.ctx.fillText('Bob', bobX, centerY + 60);
      
      // 根据阶段绘制动画
      this.drawAnimation(aliceX, bobX, centerY);
    }

    drawAnimation(aliceX, bobX, centerY) {
      const progress = this.frame / 60;
      
      switch (this.phase) {
        case 'encrypt':
          // Alice生成密钥
          this.ctx.strokeStyle = COLORS.quantum;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(aliceX, centerY - 60, 20 + progress * 10, 0, Math.PI * 2);
          this.ctx.stroke();
          
          if (progress >= 1) {
            this.phase = 'transmit';
            this.frame = 0;
          }
          break;
          
        case 'transmit':
          // 传输密文
          const transmitX = aliceX + (bobX - aliceX) * progress;
          this.ctx.fillStyle = COLORS.gold;
          this.ctx.beginPath();
          this.ctx.arc(transmitX, centerY, 10, 0, Math.PI * 2);
          this.ctx.fill();
          
          // 绘制传输线
          this.ctx.strokeStyle = COLORS.gold;
          this.ctx.lineWidth = 1;
          this.ctx.setLineDash([5, 5]);
          this.ctx.beginPath();
          this.ctx.moveTo(aliceX, centerY);
          this.ctx.lineTo(bobX, centerY);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
          
          if (progress >= 1) {
            this.phase = 'decrypt';
            this.frame = 0;
          }
          break;
          
        case 'decrypt':
          // Bob解密
          this.ctx.strokeStyle = COLORS.lattice;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(bobX, centerY - 60, 20 + progress * 10, 0, Math.PI * 2);
          this.ctx.stroke();
          break;
      }
    }

    animate() {
      this.frame++;
      this.draw();
      requestAnimationFrame(() => this.animate());
    }
  }

  // ── 安全性对比可视化 ──
  class SecurityComparison {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.resize();
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    drawSecurityComparison() {
      const width = this.canvas.style.width.replace('px', '');
      const height = this.canvas.style.height.replace('px', '');
      
      this.ctx.fillStyle = COLORS.bg;
      this.ctx.fillRect(0, 0, width, height);
      
      // 绘制安全性对比图表
      const algorithms = ['RSA-2048', 'ECC-256', 'Kyber-512', 'Kyber-1024'];
      const securityLevels = [128, 128, 256, 256]; // 安全位数
      const colors = ['#ff2d55', '#ff8c00', COLORS.lattice, COLORS.quantum];
      
      const barWidth = width / (algorithms.length * 2);
      const maxSecurity = 300;
      
      algorithms.forEach((algo, i) => {
        const x = barWidth * (i * 2 + 0.5);
        const barHeight = (securityLevels[i] / maxSecurity) * (height - 100);
        const y = height - 50 - barHeight;
        
        // 绘制柱状图
        this.ctx.fillStyle = colors[i];
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // 添加算法名称
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '12px JetBrains Mono';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(algo, x + barWidth / 2, height - 30);
        
        // 添加安全位数
        this.ctx.fillText(securityLevels[i] + ' bits', x + barWidth / 2, y - 10);
      });
      
      // 添加标题
      this.ctx.fillStyle = COLORS.text;
      this.ctx.font = '16px JetBrains Mono';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('算法安全性对比', width / 2, 30);
    }

    draw() {
      this.drawSecurityComparison();
    }
  }

  // ── 主控制器 ──
  const controllers = new Map();

  function initializeKyberViz() {
    // 初始化格可视化
    const latticeCanvas = document.getElementById('kyberLatticeCanvas');
    if (latticeCanvas) {
      const latticeViz = new LatticeVisualization(latticeCanvas);
      latticeViz.generateLattice();
      latticeViz.animate();
      controllers.set('lattice', latticeViz);
    }

    // 初始化KEM动画
    const kemCanvas = document.getElementById('kyberKEMCanvas');
    if (kemCanvas) {
      const kemAnim = new KEMAnimation(kemCanvas);
      kemAnim.animate();
      controllers.set('kem', kemAnim);
    }

    // 初始化安全性对比
    const securityCanvas = document.getElementById('kyberSecurityCanvas');
    if (securityCanvas) {
      const securityComp = new SecurityComparison(securityCanvas);
      securityComp.draw();
      controllers.set('security', securityComp);
    }
  }

  // 对外接口
  return {
    initializeKyberViz,
    
    // 交互函数
    generateLattice(basis) {
      const latticeViz = controllers.get('lattice');
      if (latticeViz) {
        latticeViz.generateLattice(basis);
      }
    },

    startKEMAnimation(keys) {
      const kemAnim = controllers.get('kem');
      if (kemAnim) {
        kemAnim.startEncryption(keys);
      }
    },

    updateSecurityChart() {
      const securityComp = controllers.get('security');
      if (securityComp) {
        securityComp.draw();
      }
    }
  };
})();

// 页面加载完成后初始化
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(KyberViz.initializeKyberViz, 100);
  });
  
  window.KyberViz = KyberViz;
}
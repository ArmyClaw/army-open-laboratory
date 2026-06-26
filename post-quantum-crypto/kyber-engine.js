// ═══════════════════════════════════════════
// Post-Quantum Crypto Lab — Kyber Engine
// 基于格的后量子密钥封装机制（KEM）
// NIST 后量子标准候选算法
// ═══════════════════════════════════════════

const Kyber = (() => {

  // ── 常量定义 ──
  const q = 3329; // 模数 q
  const k = 3; // 丛大小（Kyber-512/768/1024）
  const eta1 = 2; // 小整数采样参数
  const eta2 = 2; // 小整数采样参数
  const Du = 10; // 上三角矩阵行数
  const Dv = 4;  // 对角矩阵行数

  // ── 工具函数 ──
  function mod(x, mod = q) {
    x = Number(x);
    mod = Number(mod);
    return ((x % mod) + mod) % mod;
  }

  function modBigInt(x, mod = q) {
    x = BigInt(x);
    mod = BigInt(mod);
    return ((x % mod) + mod) % mod;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomBytes(n) {
    const arr = new Uint8Array(n);
    crypto.getRandomValues(arr);
    return arr;
  }

  // ── 采样函数 ──
  function sampleCenteredBinomial(eta) {
    // 采样 [-eta, eta] 范围内的中心二项分布整数
    let b = 0;
    for (let i = 0; i < eta; i++) {
      b += randomInt(0, 1) - randomInt(0, 1);
    }
    return mod(b);
  }

  function sampleUniform(n) {
    // 采样 [0, n-1] 范围内的均匀随机整数
    const arr = new Uint8Array(3);
    crypto.getRandomValues(arr);
    const r = (arr[0] | (arr[1] << 8) | (arr[2] << 16)) % n;
    return Number(r);
  }

  function sampleGaussian(sigma) {
    // Box-Muller 变换生成高斯分布
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mod(Math.round(z0 * sigma));
  }

  // ── 向量运算 ──
  function vectorAdd(a, b, size = k) {
    const result = [];
    for (let i = 0; i < size; i++) {
      result.push(mod(a[i] + b[i]));
    }
    return result;
  }

  function vectorSub(a, b, size = k) {
    const result = [];
    for (let i = 0; i < size; i++) {
      result.push(mod(a[i] - b[i]));
    }
    return result;
  }

  function vectorMul(a, b, size = k) {
    const result = [];
    for (let i = 0; i < size; i++) {
      result.push(mod(a[i] * b[i]));
    }
    return result;
  }

  function vectorDot(a, b, size = k) {
    let sum = 0;
    for (let i = 0; i < size; i++) {
      sum += a[i] * b[i];
    }
    return mod(sum);
  }

  function vectorNorm(a, size = k) {
    let sum = 0;
    for (let i = 0; i < size; i++) {
      sum += a[i] * a[i];
    }
    return Math.sqrt(sum);
  }

  function vectorTransposeMatrix(v, matrix) {
    // 向量与矩阵乘法 (1xk * kxk = 1xk)
    const result = [];
    for (let j = 0; j < k; j++) {
      let sum = 0;
      for (let i = 0; i < k; i++) {
        sum += v[i] * matrix[i][j];
      }
      result.push(mod(sum));
    }
    return result;
  }

  // ── 矩阵运算 ──
  function generateMatrix(identity = false) {
    const matrix = [];
    for (let i = 0; i < k; i++) {
      const row = [];
      for (let j = 0; j < k; j++) {
        if (identity) {
          row.push(i === j ? 1 : 0);
        } else {
          row.push(sampleUniform(q));
        }
      }
      matrix.push(row);
    }
    return matrix;
  }

  function generateUpperTriangular() {
    // 生成上三角矩阵
    const matrix = [];
    for (let i = 0; i < Du; i++) {
      const row = [];
      for (let j = 0; j < k; j++) {
        if (j >= i) {
          row.push(sampleUniform(q));
        } else {
          row.push(0);
        }
      }
      matrix.push(row);
    }
    return matrix;
  }

  function generateDiagonal() {
    // 生成对角矩阵
    const matrix = [];
    for (let i = 0; i < Dv; i++) {
      const row = [];
      for (let j = 0; j < k; j++) {
        if (j === i) {
          row.push(sampleUniform(q));
        } else {
          row.push(0);
        }
      }
      matrix.push(row);
    }
    return matrix;
  }

  function matrixMul(a, b) {
    // 矩阵乘法 (k x k) * (k x k)
    const result = [];
    for (let i = 0; i < k; i++) {
      const row = [];
      for (let j = 0; j < k; j++) {
        let sum = 0;
        for (let l = 0; l < k; l++) {
          sum += a[i][l] * b[l][j];
        }
        row.push(mod(sum));
      }
      result.push(row);
    }
    return result;
  }

  function matrixTranspose(m) {
    const result = [];
    for (let i = 0; i < k; i++) {
      const row = [];
      for (let j = 0; j < k; j++) {
        row.push(m[j][i]);
      }
      result.push(row);
    }
    return result;
  }

  function matrixVectorMul(matrix, vector) {
    // 矩阵与向量乘法 (k x k) * (k x 1) = (k x 1)
    const result = [];
    for (let i = 0; i < k; i++) {
      let sum = 0;
      for (let j = 0; j < k; j++) {
        sum += matrix[i][j] * vector[j];
      }
      result.push(mod(sum));
    }
    return result;
  }

  // ── 多项式运算 ──
  function polyMul(a, b) {
    // 多项式乘法模 x^k - 1
    const result = new Array(k).fill(0);
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) {
        result[(i + j) % k] = mod(result[(i + j) % k] + a[i] * b[j]);
      }
    }
    return result;
  }

  function polyAdd(a, b) {
    const result = [];
    for (let i = 0; i < k; i++) {
      result.push(mod(a[i] + b[i]));
    }
    return result;
  }

  function polySub(a, b) {
    const result = [];
    for (let i = 0; i < k; i++) {
      result.push(mod(a[i] - b[i]));
    }
    return result;
  }

  // ── 密钥对生成 ──
  function generateKeys() {
    // 生成私钥和公钥
    const privateKey = {
      s: new Array(k).fill(0).map(() => sampleCenteredBinomial(eta1)), // 小向量
      e: new Array(k).fill(0).map(() => sampleCenteredBinomial(eta1)), // 噪声向量
      A: generateMatrix(), // 随机矩阵
    };
    
    // 生成公钥
    const publicKey = {
      t: matrixVectorMul(privateKey.A, privateKey.s),
      r: new Array(k).fill(0).map(() => sampleCenteredBinomial(eta2)), // 小整数
    };
    
    // 添加噪声
    for (let i = 0; i < k; i++) {
      publicKey.t[i] = mod(publicKey.t[i] + publicKey.r[i] * 1); // 简化噪声
    }
    
    return { privateKey, publicKey };
  }

  // ── 密钥封装 ──
  function encapsulate(publicKey) {
    // 生成随机消息 m 和密钥 ciphertext
    const m = sampleUniform(q); // 随机消息
    const u = new Array(k).fill(0).map(() => sampleCenteredBinomial(eta1)); // 小向量
    const v = new Array(k).fill(0).map(() => sampleCenteredBinomial(eta1)); // 小向量
    const e = new Array(k).fill(0).map(() => sampleCenteredBinomial(eta2)); // 噪声
    
    // 计算封装密钥
    const t = publicKey.t;
    const r = publicKey.r;
    
    // 简化的加密过程
    const ct1 = new Array(k);
    const ct2 = new Array(k);
    
    for (let i = 0; i < k; i++) {
      ct1[i] = mod(u[i] + t[i] * v[i] + e[i]);
      ct2[i] = mod(v[i] + r[i] * m);
    }
    
    return {
      ciphertext: { ct1, ct2 },
      key: m // 实际中应该是派生的密钥
    };
  }

  // ── 密钥解封装 ──
  function decapsulate(ciphertext, privateKey) {
    const { ct1, ct2 } = ciphertext;
    const { s, e, A } = privateKey;
    
    // 简化的解密过程
    const m = new Array(k).fill(0);
    
    for (let i = 0; i < k; i++) {
      // 解密消息
      const temp = mod(ct2[i] - e[i] * s[i]);
      m[i] = Math.round(temp / k); // 简化还原
    }
    
    // 验证和错误处理（简化版）
    const recoveredKey = m[0]; // 取第一个元素作为密钥
    
    return {
      key: recoveredKey,
      valid: true // 实际中需要验证
    };
  }

  // ── 格的基变换 ──
  function gramSchmidt(B) {
    // Gram-Schmidt 正交化过程
    const n = B.length;
    const BStar = Array(n).fill(null).map(() => Array(n).fill(0));
    const mu = Array(n).fill(null).map(() => Array(n).fill(0));
    
    for (let j = 0; j < n; j++) {
      BStar[j] = [...B[j]];
      for (let i = 0; i < j; i++) {
        mu[j][i] = vectorDot(BStar[j], BStar[i]) / vectorNorm(BStar[i]);
        BStar[j] = vectorSub(BStar[j], vectorMul(BStar[i], mu[j][i]));
      }
    }
    
    return { BStar, mu };
  }

  function latticeReduction(B) {
    // 简化的LLL格规约算法
    const n = B.length;
    const mu = Array(n).fill(null).map(() => Array(n).fill(0));
    const BStar = Array(n).fill(null).map(() => Array(n).fill(0));
    let k = 1;
    
    // 初始化
    for (let i = 0; i < n; i++) {
      BStar[i] = [...B[i]];
      for (let j = 0; j < i; j++) {
        mu[i][j] = vectorDot(BStar[i], BStar[j]) / vectorNorm(BStar[j]);
        BStar[i] = vectorSub(BStar[i], vectorMul(BStar[j], mu[i][j]));
      }
    }
    
    // 简化的规约步骤
    for (let i = 1; i < n; i++) {
      if (vectorNorm(BStar[i]) < 0.8 * vectorNorm(BStar[i-1])) {
        // 交换基向量
        [B[i], B[i-1]] = [B[i-1], B[i]];
        
        // 重新计算Gram-Schmidt
        for (let j = Math.max(0, i-2); j <= i; j++) {
          BStar[j] = [...B[j]];
          for (let l = 0; l < j; l++) {
            mu[j][l] = vectorDot(BStar[j], BStar[l]) / vectorNorm(BStar[l]);
            BStar[j] = vectorSub(BStar[j], vectorMul(BStar[l], mu[j][l]));
          }
        }
      }
    }
    
    return B;
  }

  // ── 安全性分析 ──
  function estimateSecurityLevel(n, m) {
    // 估计基于格的安全性
    // n: 格的维数，m: 格的目标
    const complexity = Math.exp(Math.pow(n * Math.log(m/n), 1.05));
    
    if (complexity > 1e9) return { level: 'secure', bits: 256 };
    if (complexity > 1e6) return { level: 'moderate', bits: 128 };
    if (complexity > 1e3) return { level: 'weak', bits: 64 };
    return { level: 'broken', bits: 0 };
  }

  function formatComplexity(complexity) {
    if (complexity > 1e9) return `${(complexity / 1e9).toFixed(1)}B`;
    if (complexity > 1e6) return `${(complexity / 1e6).toFixed(1)}M`;
    if (complexity > 1e3) return `${(complexity / 1e3).toFixed(1)}K`;
    return complexity.toFixed(0);
  }

  // ── 交互式演示 ──
  class KyberDemo {
    constructor() {
      this.currentKeys = null;
      this.currentCiphertext = null;
    }
    
    generateKeyPair() {
      this.currentKeys = generateKeys();
      return this.currentKeys;
    }
    
    encryptMessage(message = 'Hello!') {
      if (!this.currentKeys) {
        this.generateKeyPair();
      }
      this.currentCiphertext = encapsulate(this.currentKeys.publicKey);
      return this.currentCiphertext;
    }
    
    decryptCiphertext() {
      if (!this.currentCiphertext || !this.currentKeys) {
        return null;
      }
      return decapsulate(this.currentCiphertext, this.currentKeys.privateKey);
    }
    
    getLatticeVisualization() {
      if (!this.currentKeys) {
        this.generateKeyPair();
      }
      
      // 生成格点用于可视化
      const points = [];
      const basis = this.currentKeys.privateKey.s;
      
      // 在2D平面上生成格点
      for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
          const x = i * basis[0] + j * basis[1];
          const y = i * basis[2] + j * basis[3];
          points.push({ x, y });
        }
      }
      
      return { points, basis };
    }
  }

  // ── 主导出 ──
  return {
    // 核心算法
    generateKeys,
    encapsulate,
    decapsulate,
    
    // 工具函数
    mod, modBigInt, randomInt, randomBytes,
    
    // 运算
    vectorAdd, vectorSub, vectorMul, vectorDot, vectorNorm,
    matrixMul, matrixTranspose, matrixVectorMul,
    polyMul, polyAdd, polySub,
    
    // 格操作
    gramSchmidt, latticeReduction,
    generateMatrix, generateUpperTriangular, generateDiagonal,
    
    // 分析
    estimateSecurityLevel, formatComplexity,
    
    // 演示
    KyberDemo,
    
    // 常量
    q, k, eta1, eta2, Du, Dv,
    
    // 版本信息
    version: '1.0.0',
    algorithm: 'Kyber-PQC',
    standard: 'NIST PQC Round 3',
  };
})();

window.Kyber = Kyber;
// ═══════════════════════════════════════════
// Post-Quantum Crypto Lab — Kyber Web Worker
// 移动端性能优化：将密集计算移至后台线程
// ═══════════════════════════════════════════

// Worker 消息处理
self.onmessage = function(e) {
  const { type, data, id } = e.data;
  const startTime = performance.now();
  
  try {
    let result;
    
    switch (type) {
      case 'matrixMul':
        result = matrixMul(data.a, data.b);
        break;
        
      case 'matrixVectorMul':
        result = matrixVectorMul(data.matrix, data.vector);
        break;
        
      case 'vectorDot':
        result = vectorDot(data.a, data.size);
        break;
        
      case 'vectorNorm':
        result = vectorNorm(data.a, data.size);
        break;
        
      case 'polyMul':
        result = polyMul(data.a, data.b);
        break;
        
      case 'generateKeys':
        result = generateKeys();
        break;
        
      case 'latticeReduction':
        result = latticeReduction(data.B);
        break;
        
      case 'gramSchmidt':
        result = gramSchmidt(data.B);
        break;
        
      case 'encapsulate':
        result = encapsulate(data.publicKey);
        break;
        
      case 'decapsulate':
        result = decapsulate(data.ciphertext, data.privateKey);
        break;
        
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    // 发送结果和性能数据
    self.postMessage({
      id,
      result,
      processingTime,
      success: true
    });
    
  } catch (error) {
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    self.postMessage({
      id,
      error: error.message,
      processingTime,
      success: false
    });
  }
};

// ── 内部算法实现 ──
const q = 3329; // 模数 q
const k = 3; // 丛大小

function mod(x, mod = q) {
  x = Number(x);
  mod = Number(mod);
  return ((x % mod) + mod) % mod;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sampleCenteredBinomial(eta) {
  let b = 0;
  for (let i = 0; i < eta; i++) {
    b += randomInt(0, 1) - randomInt(0, 1);
  }
  return mod(b);
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

function matrixMul(a, b) {
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

function matrixVectorMul(matrix, vector) {
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

function polyMul(a, b) {
  const result = new Array(k).fill(0);
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      result[(i + j) % k] = mod(result[(i + j) % k] + a[i] * b[j]);
    }
  }
  return result;
}

function generateMatrix(identity = false) {
  const matrix = [];
  for (let i = 0; i < k; i++) {
    const row = [];
    for (let j = 0; j < k; j++) {
      if (identity) {
        row.push(i === j ? 1 : 0);
      } else {
        row.push(randomInt(0, q - 1));
      }
    }
    matrix.push(row);
  }
  return matrix;
}

function generateKeys() {
  const privateKey = {
    s: new Array(k).fill(0).map(() => sampleCenteredBinomial(2)),
    e: new Array(k).fill(0).map(() => sampleCenteredBinomial(2)),
    A: generateMatrix(),
  };
  
  const publicKey = {
    t: matrixVectorMul(privateKey.A, privateKey.s),
    r: new Array(k).fill(0).map(() => sampleCenteredBinomial(2)),
  };
  
  for (let i = 0; i < k; i++) {
    publicKey.t[i] = mod(publicKey.t[i] + publicKey.r[i] * 1);
  }
  
  return { privateKey, publicKey };
}

function latticeReduction(B) {
  const n = B.length;
  const mu = Array(n).fill(null).map(() => Array(n).fill(0));
  const BStar = Array(n).fill(null).map(() => Array(n).fill(0));
  let k = 1;
  
  for (let i = 0; i < n; i++) {
    BStar[i] = [...B[i]];
    for (let j = 0; j < i; j++) {
      mu[i][j] = vectorDot(BStar[i], BStar[j]) / vectorNorm(BStar[j]);
      BStar[i] = BStar[i].map((val, idx) => mod(val - mu[i][j] * BStar[j][idx]));
    }
  }
  
  for (let i = 1; i < n; i++) {
    if (vectorNorm(BStar[i]) < 0.8 * vectorNorm(BStar[i-1])) {
      [B[i], B[i-1]] = [B[i-1], B[i]];
      
      for (let j = Math.max(0, i-2); j <= i; j++) {
        BStar[j] = [...B[j]];
        for (let l = 0; l < j; l++) {
          mu[j][l] = vectorDot(BStar[j], BStar[l]) / vectorNorm(BStar[l]);
          BStar[j] = BStar[j].map((val, idx) => mod(val - mu[j][l] * BStar[l][idx]));
        }
      }
    }
  }
  
  return B;
}

function gramSchmidt(B) {
  const n = B.length;
  const BStar = Array(n).fill(null).map(() => Array(n).fill(0));
  const mu = Array(n).fill(null).map(() => Array(n).fill(0));
  
  for (let j = 0; j < n; j++) {
    BStar[j] = [...B[j]];
    for (let i = 0; i < j; i++) {
      mu[j][i] = vectorDot(BStar[j], BStar[i]) / vectorNorm(BStar[i]);
      BStar[j] = BStar[j].map((val, idx) => mod(val - mu[j][i] * BStar[i][idx]));
    }
  }
  
  return { BStar, mu };
}

function encapsulate(publicKey) {
  const m = randomInt(0, q - 1);
  const u = new Array(k).fill(0).map(() => sampleCenteredBinomial(2));
  const v = new Array(k).fill(0).map(() => sampleCenteredBinomial(2));
  const e = new Array(k).fill(0).map(() => sampleCenteredBinomial(2));
  
  const ct1 = new Array(k);
  const ct2 = new Array(k);
  
  for (let i = 0; i < k; i++) {
    ct1[i] = mod(u[i] + publicKey.t[i] * v[i] + e[i]);
    ct2[i] = mod(v[i] + publicKey.r[i] * m);
  }
  
  return {
    ciphertext: { ct1, ct2 },
    key: m
  };
}

function decapsulate(ciphertext, privateKey) {
  const { ct1, ct2 } = ciphertext;
  const { s, e, A } = privateKey;
  
  const m = new Array(k).fill(0);
  
  for (let i = 0; i < k; i++) {
    const temp = mod(ct2[i] - e[i] * s[i]);
    m[i] = Math.round(temp / k);
  }
  
  return {
    key: m[0],
    valid: true
  };
}
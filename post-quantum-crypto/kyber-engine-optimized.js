// ═══════════════════════════════════════════
// Post-Quantum Crypto Lab — Kyber Engine (Optimized)
// 移动端性能优化版本：支持 Web Worker 后台计算
// ═══════════════════════════════════════════

const KyberOptimized = (() => {
  
  // ── 配置选项 ──
  const config = {
    useWebWorker: true, // 是否使用 Web Worker
    workerPath: 'kyber-worker.js',
    performanceMonitoring: true,
    operationTimeout: 5000, // 5秒超时
    chunkSize: 1000 // 大数据分块大小
  };

  // ── 性能监控 ──
  const performanceData = {
    operations: {},
    totalProcessingTime: 0,
    workerUsage: 0,
    mainThreadUsage: 0
  };

  // ── Web Worker 管理 ──
  let worker = null;
  let pendingOperations = new Map();
  let operationCounter = 0;

  function initWorker() {
    if (!config.useWebWorker || worker) return;
    
    try {
      worker = new Worker(config.workerPath);
      
      worker.onmessage = function(e) {
        const { id, result, error, processingTime } = e.data;
        const operation = pendingOperations.get(id);
        
        if (operation) {
          pendingOperations.delete(id);
          
          if (config.performanceMonitoring) {
            updatePerformanceMetrics(operation.type, processingTime, 'worker');
          }
          
          if (error) {
            operation.reject(new Error(error));
          } else {
            operation.resolve(result);
          }
        }
      };
      
      worker.onerror = function(error) {
        console.error('Web Worker 错误:', error);
        // 回退到同步模式
        config.useWebWorker = false;
        worker = null;
      };
      
    } catch (error) {
      console.warn('Web Worker 初始化失败，使用同步模式:', error);
      config.useWebWorker = false;
      worker = null;
    }
  }

  function updatePerformanceMetrics(operationType, processingTime, source) {
    if (!performanceData.operations[operationType]) {
      performanceData.operations[operationType] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        source: { worker: 0, main: 0 }
      };
    }
    
    const operation = performanceData.operations[operationType];
    operation.count++;
    operation.totalTime += processingTime;
    operation.avgTime = operation.totalTime / operation.count;
    operation.source[source]++;
    
    performanceData.totalProcessingTime += processingTime;
    if (source === 'worker') {
      performanceData.workerUsage++;
    } else {
      performanceData.mainThreadUsage++;
    }
  }

  function asyncOperation(type, data) {
    if (!config.useWebWorker || !worker) {
      return Promise.reject(new Error('Web Worker 不可用'));
    }

    return new Promise((resolve, reject) => {
      const id = operationCounter++;
      
      // 设置超时
      const timeout = setTimeout(() => {
        pendingOperations.delete(id);
        reject(new Error(`操作超时: ${type}`));
      }, config.operationTimeout);

      pendingOperations.set(id, {
        type,
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      });

      worker.postMessage({
        type,
        data,
        id
      });
    });
  }

  // ── 模拟同步操作（用于降级） ──
  function syncMatrixMul(a, b) {
    const startTime = performance.now();
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
    const processingTime = performance.now() - startTime;
    
    if (config.performanceMonitoring) {
      updatePerformanceMetrics('matrixMul', processingTime, 'main');
    }
    
    return result;
  }

  function syncMatrixVectorMul(matrix, vector) {
    const startTime = performance.now();
    const result = [];
    for (let i = 0; i < k; i++) {
      let sum = 0;
      for (let j = 0; j < k; j++) {
        sum += matrix[i][j] * vector[j];
      }
      result.push(mod(sum));
    }
    const processingTime = performance.now() - startTime;
    
    if (config.performanceMonitoring) {
      updatePerformanceMetrics('matrixVectorMul', processingTime, 'main');
    }
    
    return result;
  }

  // ── 异步操作包装器 ──
  async function matrixMul(a, b) {
    try {
      return await asyncOperation('matrixMul', { a, b });
    } catch (error) {
      console.warn('异步矩阵乘法失败，回退到同步:', error);
      return syncMatrixMul(a, b);
    }
  }

  async function matrixVectorMul(matrix, vector) {
    try {
      return await asyncOperation('matrixVectorMul', { matrix, vector });
    } catch (error) {
      console.warn('异步矩阵-向量乘法失败，回退到同步:', error);
      return syncMatrixVectorMul(matrix, vector);
    }
  }

  async function vectorDot(a, b, size = k) {
    try {
      return await asyncOperation('vectorDot', { a, b, size });
    } catch (error) {
      console.warn('异步向量点积失败，回退到同步:', error);
      // 同步实现
      let sum = 0;
      for (let i = 0; i < size; i++) {
        sum += a[i] * b[i];
      }
      const startTime = performance.now();
      const result = mod(sum);
      const processingTime = performance.now() - startTime;
      
      if (config.performanceMonitoring) {
        updatePerformanceMetrics('vectorDot', processingTime, 'main');
      }
      
      return result;
    }
  }

  async function vectorNorm(a, size = k) {
    try {
      return await asyncOperation('vectorNorm', { a, size });
    } catch (error) {
      console.warn('异步向量范数计算失败，回退到同步:', error);
      // 同步实现
      let sum = 0;
      for (let i = 0; i < size; i++) {
        sum += a[i] * a[i];
      }
      const startTime = performance.now();
      const result = Math.sqrt(sum);
      const processingTime = performance.now() - startTime;
      
      if (config.performanceMonitoring) {
        updatePerformanceMetrics('vectorNorm', processingTime, 'main');
      }
      
      return result;
    }
  }

  async function polyMul(a, b) {
    try {
      return await asyncOperation('polyMul', { a, b });
    } catch (error) {
      console.warn('异步多项式乘法失败，回退到同步:', error);
      // 同步实现
      const result = new Array(k).fill(0);
      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
          result[(i + j) % k] = mod(result[(i + j) % k] + a[i] * b[j]);
        }
      }
      return result;
    }
  }

  async function generateKeys() {
    try {
      return await asyncOperation('generateKeys', {});
    } catch (error) {
      console.warn('异步密钥生成失败，回退到同步:', error);
      // 同步实现
      const privateKey = {
        s: new Array(k).fill(0).map(() => sampleCenteredBinomial(2)),
        e: new Array(k).fill(0).map(() => sampleCenteredBinomial(2)),
        A: generateMatrix(),
      };
      
      const publicKey = {
        t: await matrixVectorMul(privateKey.A, privateKey.s),
        r: new Array(k).fill(0).map(() => sampleCenteredBinomial(2)),
      };
      
      for (let i = 0; i < k; i++) {
        publicKey.t[i] = mod(publicKey.t[i] + publicKey.r[i] * 1);
      }
      
      return { privateKey, publicKey };
    }
  }

  async function latticeReduction(B) {
    try {
      return await asyncOperation('latticeReduction', { B });
    } catch (error) {
      console.warn('异步格规约失败，回退到同步:', error);
      // 简化同步实现
      const n = B.length;
      const result = B.map(row => [...row]);
      
      // 简单的LLL规约
      for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
          const mu = await vectorDot(result[i], result[j]) / await vectorNorm(result[j]);
          for (let l = 0; l < n; l++) {
            result[i][l] = mod(result[i][l] - Math.round(mu) * result[j][l]);
          }
        }
      }
      
      return result;
    }
  }

  async function gramSchmidt(B) {
    try {
      return await asyncOperation('gramSchmidt', { B });
    } catch (error) {
      console.warn('异步Gram-Schmidt失败，回退到同步:', error);
      // 同步实现
      const n = B.length;
      const BStar = Array(n).fill(null).map(() => Array(n).fill(0));
      const mu = Array(n).fill(null).map(() => Array(n).fill(0));
      
      for (let j = 0; j < n; j++) {
        BStar[j] = [...B[j]];
        for (let i = 0; i < j; i++) {
          mu[j][i] = await vectorDot(BStar[j], BStar[i]) / await vectorNorm(BStar[i]);
          for (let l = 0; l < n; l++) {
            BStar[j][l] = mod(BStar[j][l] - mu[j][i] * BStar[i][l]);
          }
        }
      }
      
      return { BStar, mu };
    }
  }

  async function encapsulate(publicKey) {
    try {
      return await asyncOperation('encapsulate', { publicKey });
    } catch (error) {
      console.warn('异步封装失败，回退到同步:', error);
      // 同步实现
      const m = sampleUniform(q);
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
  }

  async function decapsulate(ciphertext, privateKey) {
    try {
      return await asyncOperation('decapsulate', { ciphertext, privateKey });
    } catch (error) {
      console.warn('异步解封装失败，回退到同步:', error);
      // 同步实现
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
  }

  // ── 工具函数（保持同步） ──
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

  function sampleUniform(n) {
    const arr = new Uint8Array(3);
    crypto.getRandomValues(arr);
    const r = (arr[0] | (arr[1] << 8) | (arr[2] << 16)) % n;
    return Number(r);
  }

  function sampleCenteredBinomial(eta) {
    let b = 0;
    for (let i = 0; i < eta; i++) {
      b += randomInt(0, 1) - randomInt(0, 1);
    }
    return mod(b);
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

  // ── 性能报告 ──
  function getPerformanceReport() {
    return {
      config,
      performanceData,
      workerStatus: worker ? 'active' : 'inactive',
      pendingOperationsCount: pendingOperations.size
    };
  }

  function resetPerformanceData() {
    performanceData.operations = {};
    performanceData.totalProcessingTime = 0;
    performanceData.workerUsage = 0;
    performanceData.mainThreadUsage = 0;
  }

  // ── 主导出 ──
  return {
    // 核心算法（异步）
    matrixMul, matrixVectorMul, vectorDot, vectorNorm,
    polyMul, generateKeys, latticeReduction, gramSchmidt,
    encapsulate, decapsulate,
    
    // 工具函数（同步）
    mod, modBigInt, randomInt, sampleUniform, sampleCenteredBinomial, generateMatrix,
    
    // 性能管理
    getPerformanceReport, resetPerformanceData, config,
    
    // 版本信息
    version: '1.1.0-optimized',
    algorithm: 'Kyber-PQC-Optimized',
    standard: 'NIST PQC Round 3',
    optimization: 'Web Worker Mobile Performance',
  };
})();

window.KyberOptimized = KyberOptimized;
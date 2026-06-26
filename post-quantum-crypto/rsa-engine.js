// ═══════════════════════════════════════════
// Post-Quantum Crypto Lab — RSA Engine
// 大数运算 + RSA 密钥对 + 加解密
// ═══════════════════════════════════════════

const RSA = (() => {

  // ── 工具函数 ──
  function modPow(base, exp, mod) {
    base = BigInt(base);
    exp = BigInt(exp);
    mod = BigInt(mod);
    if (mod === 1n) return 0n;
    let result = 1n;
    base = base % mod;
    while (exp > 0n) {
      if (exp % 2n === 1n) result = (result * base) % mod;
      exp = exp / 2n;
      base = (base * base) % mod;
    }
    return result;
  }

  function modInverse(a, m) {
    a = BigInt(a); m = BigInt(m);
    let [oldR, r] = [a, m];
    let [oldS, s] = [1n, 0n];
    while (r !== 0n) {
      const q = oldR / r;
      [oldR, r] = [r, oldR - q * r];
      [oldS, s] = [s, oldS - q * s];
    }
    if (oldR > 1n) return null; // not invertible
    return ((oldS % m) + m) % m;
  }

  // Miller-Rabin 素性测试
  function isPrime(n, k = 20) {
    n = BigInt(n);
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n) return false;
    let r = 0n, d = n - 1n;
    while (d % 2n === 0n) { d /= 2n; r++; }
    const witness = (a) => {
      let x = modPow(a, d, n);
      if (x === 1n || x === n - 1n) return true;
      for (let i = 0n; i < r - 1n; i++) {
        x = modPow(x, 2n, n);
        if (x === n - 1n) return true;
      }
      return false;
    };
    for (let i = 0; i < k; i++) {
      let a;
      do { a = BigInt(Math.floor(Math.random() * Number(n - 2n)) + 2); } while (a >= n);
      if (!witness(a)) return false;
    }
    return true;
  }

  function genPrime(bits) {
    const bytes = (bits + 7) >> 3;
    while (true) {
      const arr = new Uint8Array(bytes);
      crypto.getRandomValues(arr);
      arr[0] |= 0x80; // 确保最高位
      arr[bytes - 1] |= 1; // 确保奇数
      let n = 0n;
      for (const b of arr) n = (n << 8n) | BigInt(b);
      // 确保是奇数且 > 2
      if (n > 2n && n % 2n === 0n) n += 1n;
      if (isPrime(n)) return n;
    }
  }

  // ── RSA 密钥对生成 ──
  function generateKeys(bitLength = 512) {
    const p = genPrime(bitLength / 2);
    const q = genPrime(bitLength / 2);
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);
    // e = 65537
    let e = 65537n;
    while (e < phi) {
      const d = modInverse(e, phi);
      if (d !== null && d !== e) {
        return {
          p, q, n, phi, e, d,
          bitLength,
          pub: { n, e },
          priv: { n, d }
        };
      }
      e += 2n;
    }
    return generateKeys(bitLength); // 极端情况重试
  }

  // ── 加密/解密 ──
  function encrypt(msg, pubKey) {
    // msg 可以是字符串（自动转 BigInt）或 BigInt
    if (typeof msg === 'string') {
      msg = textToBigInt(msg);
    }
    return modPow(msg, pubKey.e, pubKey.n);
  }

  function decrypt(cipher, privKey) {
    return modPow(cipher, privKey.d, privKey.n);
  }

  // ── 文本 ↔ BigInt 转换 ──
  function textToBigInt(text) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    let result = 0n;
    for (const b of bytes) {
      result = (result << 8n) | BigInt(b);
    }
    return result;
  }

  function bigIntToText(num) {
    if (num === 0n) return '';
    const bytes = [];
    while (num > 0n) {
      bytes.unshift(Number(num & 0xFFn));
      num >>= 8n;
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  // ── 量子破解时间估算 ──
  function estimateBreakTimeRSA(keyBits, quantumQubits) {
    // 简化模型：破解时间 ∝ 2^(keyBits/2) / qubits
    // 2048-bit RSA，理想量子计算机需要 ~4100 逻辑量子比特
    const baseOps = Math.pow(2, keyBits / 2);
    const qubitFactor = Math.max(quantumQubits / 4100, 0.001);
    const opsPerSec = quantumQubits * 1e12; // 假设每量子比特 1T ops
    const seconds = baseOps / (opsPerSec * qubitFactor);
    return {
      seconds,
      formatted: formatTime(seconds),
      qubits_needed: Math.ceil(keyBits * 2),
      qubits_have: quantumQubits,
      possible: quantumQubits >= keyBits * 2
    };
  }

  function estimateBreakTimeClassical(keyBits) {
    // 经典计算机：亚指数级，但仍然天文数字
    const ops = Math.pow(10, keyBits / 30); // 简化估算
    const seconds = ops / 1e18; // 假设 1 exaflop
    return {
      seconds,
      formatted: formatTime(seconds)
    };
  }

  function formatTime(seconds) {
    if (seconds < 1) return '即时';
    if (seconds < 60) return `${Math.round(seconds)} 秒`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} 分钟`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} 小时`;
    if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} 天`;
    if (seconds < 86400 * 365 * 1e6) return `${(seconds / (86400 * 365)).toExponential(1)} 年`;
    if (seconds < 86400 * 365 * 1e9) return `${(seconds / (86400 * 365 * 1e6)).toExponential(1)} 百万年`;
    if (seconds < 86400 * 365 * 1e12) return `${(seconds / (86400 * 365 * 1e9)).toExponential(1)} 十亿年`;
    return `${(seconds / (86400 * 365 * 1e12)).toExponential(1)} 万亿年`;
  }

  // ── 暴力分解计时器 ──
  class FactorBruteForce {
    constructor(n) {
      this.n = BigInt(n);
      this.current = 2n;
      this.running = false;
      this.trials = 0;
      this.found = null;
      this.startTime = 0;
      this.onProgress = null;
    }
    start() {
      this.running = true;
      this.trials = 0;
      this.startTime = performance.now();
      this._step();
    }
    stop() { this.running = false; }
    _step() {
      if (!this.running) return;
      const batch = 10000n;
      const end = this.current + batch;
      while (this.current < end) {
        if (this.n % this.current === 0n) {
          this.found = this.current;
          this.running = false;
          if (this.onProgress) this.onProgress(this._report());
          return;
        }
        this.current++;
        this.trials++;
      }
      if (this.onProgress) this.onProgress(this._report());
      setTimeout(() => this._step(), 0);
    }
    _report() {
      return {
        trials: this.trials,
        current: this.current.toString().slice(0, 12) + '…',
        elapsed: performance.now() - this.startTime,
        found: this.found ? this.found.toString() : null,
        done: !this.running
      };
    }
  }

  // ── 量子安全年数估算 ──
  function estimateSecurityYears(keyBits, qubits) {
    // Model: time to crack scales with 2^(bits/2), qubits speed up proportionally
    // RSA-2048 with 4100 qubits ≈ 1 day (assumed future capability)
    // Scale: years = 2^(bits/2) / (qubits * scaleFactor)
    const scaleFactor = 4100 * 365; // normalize to 1 year for RSA-2048 at 4100 qubits
    const baseOps = Math.pow(2, keyBits / 2);
    const effectiveQubits = Math.max(qubits, 1);
    const days = baseOps / (effectiveQubits * scaleFactor);
    return days;
  }

  function getSecurityColor(years) {
    if (years > 100) return { color: '#00ff88', label: '安全', level: 'safe' };
    if (years > 10) return { color: '#7dff88', label: '较安全', level: 'moderate' };
    if (years > 1) return { color: '#ffd700', label: '有风险', level: 'risk' };
    if (years > 0.01) return { color: '#ff8c00', label: '危险', level: 'danger' };
    return { color: '#ff2d55', label: '已破解', level: 'breached' };
  }

  function formatYears(years) {
    if (years > 1e9) return `${(years / 1e9).toExponential(1)} 十亿年`;
    if (years > 1e6) return `${(years / 1e6).toExponential(1)} 百万年`;
    if (years > 1000) return `${(years / 1000).toFixed(0)} 千年`;
    if (years > 1) return `${years.toFixed(1)} 年`;
    if (years > 1 / 365) return `${(years * 365).toFixed(0)} 天`;
    if (years > 1 / 8760) return `${(years * 8760).toFixed(0)} 小时`;
    return `${(years * 525600).toFixed(0)} 分钟`;
  }

  return {
    generateKeys, encrypt, decrypt,
    textToBigInt, bigIntToText,
    estimateBreakTimeRSA, estimateBreakTimeClassical, formatTime,
    estimateSecurityYears, getSecurityColor, formatYears,
    FactorBruteForce, isPrime
  };
})();

window.RSA = RSA;

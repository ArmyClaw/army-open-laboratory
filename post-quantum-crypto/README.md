# 🔐 Post-Quantum Crypto — 后量子密码学实验室

交互式可视化体验密码学与量子计算的对决。

## 功能

### 密码学基础理论（00）
- 什么是对称/非对称加密
- 哈希函数实时演示（SHA-256 + 雪崩效应）
- 数字签名流程动画
- Diffie-Hellman密钥交换（颜色混合比喻）

### 交互式演示（01-09）
1. **RSA加密体验**：生成密钥→加密→解密→暴力破解
2. **暴力破解可视化**：实时进度条展示破解过程
3. **量子 vs 经典**：量子计算优势对比
4. **密码学时间线**：凯撒→RSA→Shor→后量子
5. **后量子算法对比**：Lattice/Code/Hash/Multivariate
6. **Shor算法动画**：周期查找→QFT→GCD三步
7. **格密码可视化**：交互式格点操作
8. **安全检测器**：RSA密钥安全等级评估
9. **攻击模拟器**：模拟量子攻击曲线

## 运行

纯前端，打开 `index.html` 即可。

## 文件

- `index.html` — 页面+CSS+内联JS
- `viz.js` — Canvas可视化类
- `rsa-engine.js` — RSA加密引擎
- `kyber-engine.js` — Kyber格密码引擎

## 在线体验

[Quantum Crypto Lab](https://army-yorozuya.art/study/post-quantum-crypto/src/)

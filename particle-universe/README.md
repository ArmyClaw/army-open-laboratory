# 粒子宇宙 | Particle Universe

从大爆炸开始，万有引力模拟星系形成、黑洞吸积、超新星爆发。纯前端 Canvas 2D 渲染。

## 功能

### 模拟引擎
- **N-body 万有引力**：Barnes-Hut quadtree 优化，支持 2000+ 粒子 60fps
- **大爆炸初始状态**：所有粒子从一点爆发，引力逐渐聚合为星系
- **黑洞**：质量超阈值自动形成，带吸积盘与引力透镜效果
- **超新星**：高密度随机触发爆炸、冲击波、粒子弹射
- **星系形成**：旋转粒子群自然形成螺旋/椭圆结构

### 时间控制
- 开始 / 暂停 / 速度控制（0.1x ~ 10x）
- 重置（重新大爆炸）
- 可调参数：引力常数 G、粒子数量、初始速度、合并阈值、时间步长

### 视觉效果
- 温度/速度映射粒子颜色（蓝→黄→红→白）
- 可选粒子轨迹尾迹
- 黑洞吸积盘旋转光环 + 引力透镜
- 超新星闪光 + 冲击波环
- 背景星空闪烁 + 大质量粒子光晕（additive blending）

### 交互
- 🖱️ 滚轮缩放，拖动平移
- 🖱️ 点击添加粒子，拖动创建粒子群（方向=初速度）
- 🖱️ 右键创建黑洞
- 📱 触屏支持：拖动 + 双指缩放

### 观察模式
- 自由视角 / 跟随粒子
- 实时统计：粒子数、黑洞数、星系数、平均速度、模拟时间、FPS

## 在线访问

**[https://army-yorozuya.art/study/particle-universe/](https://army-yorozuya.art/study/particle-universe/)**

## 技术栈

- 单页 HTML + simulation.js + renderer.js，无依赖
- Canvas 2D + offscreen canvas additive blending
- Barnes-Hut quadtree 纯 JS 实现
- requestAnimationFrame 驱动，模拟与渲染分离
- Google Fonts: Orbitron + DM Mono

## 部署

```bash
# 复制到网站目录
cp /home/ecs-user/projects/army-open-laboratory/particle-universe/* /var/www/army-yorozuya.art/study/particle-universe/
```

## License

MIT

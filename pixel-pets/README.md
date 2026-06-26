# 像素宠物进化 / Pixel Pets Evolution

程序化生成的像素小生物，DNA系统决定外观和行为。投喂、互动、观察变异和进化。

## 功能

- 🧬 **DNA系统** — 基因决定体型、颜色、花纹、形状、五官、四肢、性格、稀有特效
- 🎨 **像素渲染** — Canvas逐像素生成，8bit风格
- 💃 **行为动画** — 呼吸、跳跃、颤抖、睡觉、好奇追踪鼠标
- 🍖 **互动** — 投喂、抚摸、玩耍
- ⬆️ **进化** — 升级后DNA突变
- 🐣 **繁殖** — 交叉遗传+随机突变
- 🧬 **DNA浏览器** — 滑块手动调整基因，实时预览
- 💾 **持久化** — localStorage跨session存活（最多20只）

## 使用

直接打开 `index.html`，无需后端。

## 技术

- `dna.js` — DNA生成/交叉/突变
- `renderer.js` — Canvas像素渲染引擎
- `pet.js` — 宠物行为/状态/动画循环
- `storage.js` — localStorage存取
- `index.html` — 页面+CSS+UI逻辑

## 在线地址

<https://army-yorozuya.art/study/pixel-pets/>

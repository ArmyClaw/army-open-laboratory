# 🧬 Evo Music — 进化音乐

用马尔可夫链生成旋律，遗传算法进化，AABA曲式编曲。

## 功能

- **旋律生成**：基于马尔可夫链的概率旋律生成
- **遗传进化**：适应度评估 + 交叉变异，让旋律自然进化
- **AABA编曲**：自动生成完整曲式结构
- **MIDI输出**：生成标准MIDI文件
- **Web播放器**：浏览器内播放进化结果

## 运行

- 纯前端：打开 `index.html` 即可体验Web播放器
- Python引擎：`python evolve_melodies.py` 生成MIDI

## 文件

- `index.html` — Web播放器
- `evolve_melodies.py` — 遗传进化引擎
- `generate_aba_form.py` — AABA编曲器
- `evo-markov-demo.py` — 马尔可夫链演示

## 在线体验

[Evo Music](https://army-yorozuya.art/study/evo-music/)

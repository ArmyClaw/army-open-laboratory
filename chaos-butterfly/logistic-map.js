/**
 * 逻辑映射 (Logistic Map) 模块
 * 实现种群增长的逻辑映射模型和分岔图可视化
 */

class LogisticMap {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
        
        // 逻辑映射参数
        this.r = 2.5;  // 增长率参数
        this.x0 = 0.5; // 初始种群密度
        this.maxIterations = 100;
        this.currentIteration = 0;
        
        // 分岔图参数
        this.rMin = 1.0;
        this.rMax = 4.0;
        this.rStep = 0.002; // 提高分辨率
        this.bifurcationData = [];
        
        // 全景渲染参数
        this.isPanorama = true;
        this.zoomLevel = 1.0;
        this.panOffset = { x: 0, y: 0 };
        this.targetZoom = 1.0;
        this.targetPan = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.lastPan = { x: 0, y: 0 };
        
        // 渲染优化
        this.renderBatch = 50;
        this.renderProgress = 0;
        this.isRendering = false;
        
        // 绘图参数
        this.margin = { top: 20, right: 20, bottom: 40, left: 60 };
        this.plotWidth = this.canvas.width - this.margin.left - this.margin.right;
        this.plotHeight = this.canvas.height - this.margin.top - this.margin.bottom;
        
        // 动画控制
        this.isAnimating = false;
        this.animationId = null;
        this.animationSpeed = 50; // 毫秒
        
        // 轨迹数据
        this.trajectory = [];
        
        // 轨道图数据
        this.cobwebPoints = [];
        this.currentCobwebStep = 0;
        
        // 画布点击事件监听
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        
        this.setupControls();
        this.setupPanoramaControls();
        this.drawBifurcationDiagram();
    }
    
    setupCanvas() {
        const resizeCanvas = () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            this.margin = { top: 20, right: 20, bottom: 40, left: 60 };
            this.plotWidth = this.canvas.width - this.margin.left - this.margin.right;
            this.plotHeight = this.canvas.height - this.margin.top - this.margin.bottom;
            this.drawBifurcationDiagram();
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }
    
    setupControls() {
        // 添加控制面板（如果需要的话）
        const controlsHtml = `
            <div class="control-section">
                <h3>🔢 逻辑映射参数</h3>
                <div class="control-group">
                    <label>增长率 r</label>
                    <div class="slider-container">
                        <input type="range" id="logistic-r" min="1" max="4" step="0.01" value="${this.r}">
                        <span class="value-display" id="logistic-r-value">${this.r.toFixed(2)}</span>
                    </div>
                </div>
                <div class="control-group">
                    <label>初始值 x₀</label>
                    <div class="slider-container">
                        <input type="range" id="logistic-x0" min="0" max="1" step="0.01" value="${this.x0}">
                        <span class="value-display" id="logistic-x0-value">${this.x0.toFixed(2)}</span>
                    </div>
                </div>
                <div class="control-group">
                    <label>迭代次数</label>
                    <div class="slider-container">
                        <input type="range" id="logistic-iterations" min="10" max="200" step="10" value="${this.maxIterations}">
                        <span class="value-display" id="logistic-iterations-value">${this.maxIterations}</span>
                    </div>
                </div>
                <button class="button" id="start-trajectory">📈 开始轨迹</button>
                <button class="button" id="clear-trajectory">🗑️ 清除轨迹</button>
                <button class="button" id="animate-bifurcation">🎬 动画生成</button>
            </div>
        `;
        
        // 将控制面板添加到body
        const controlPanel = document.createElement('div');
        controlPanel.className = 'control-panel logistic-controls';
        controlPanel.innerHTML = controlsHtml;
        document.body.appendChild(controlPanel);
        
        // 绑定事件监听器
        this.bindControlEvents();
        
        // 初始化时绘制默认轨迹
        this.drawTrajectory();
    }
    
    setupPanoramaControls() {
        // 添加全景渲染控制面板
        const panoramaControlsHtml = `
            <div class="control-section">
                <h3>🌐 全景渲染控制</h3>
                <div class="control-group">
                    <label>缩放级别</label>
                    <div class="slider-container">
                        <input type="range" id="panorama-zoom" min="0.5" max="5" step="0.1" value="1.0">
                        <span class="value-display" id="panorama-zoom-value">1.0x</span>
                    </div>
                </div>
                <div class="control-group">
                    <label>渲染精度</label>
                    <div class="slider-container">
                        <input type="range" id="render-quality" min="1" max="10" step="1" value="5">
                        <span class="value-display" id="render-quality-value">标准</span>
                    </div>
                </div>
                <button class="button" id="panorama-view">🌐 全景视图</button>
                <button class="button" id="zoom-reset">🔄 重置视图</button>
                <button class="button" id="render-full">🎨 高质量渲染</button>
                <button class="button" id="export-image">📥 导出图像</button>
            </div>
        `;
        
        // 将全景控制面板添加到控制面板
        const controlPanel = document.querySelector('.control-panel');
        const panoramaSection = document.createElement('div');
        panoramaSection.className = 'control-section';
        panoramaSection.innerHTML = panoramaControlsHtml;
        controlPanel.appendChild(panoramaSection);
        
        // 绑定全景事件
        this.bindPanoramaEvents();
    }
    
    bindPanoramaEvents() {
        // 缩放控制
        const zoomSlider = document.getElementById('panorama-zoom');
        const zoomValue = document.getElementById('panorama-zoom-value');
        
        zoomSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.targetZoom = value;
            zoomValue.textContent = value.toFixed(1) + 'x';
            this.smoothZoom();
        });
        
        // 渲染质量控制
        const qualitySlider = document.getElementById('render-quality');
        const qualityValue = document.getElementById('render-quality-value');
        const qualityLabels = ['极低', '低', '标准', '高', '很高', '极高', '超精细', '像素级', '完美', '史诗'];
        
        qualitySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.renderQuality = value;
            qualityValue.textContent = qualityLabels[value - 1];
            this.rStep = 0.005 / Math.sqrt(value); // 根据质量调整步长
        });
        
        // 全景视图按钮
        document.getElementById('panorama-view').addEventListener('click', () => {
            this.enablePanorama();
        });
        
        // 重置视图按钮
        document.getElementById('zoom-reset').addEventListener('click', () => {
            this.resetView();
        });
        
        // 高质量渲染按钮
        document.getElementById('render-full').addEventListener('click', () => {
            this.fullQualityRender();
        });
        
        // 导出图像按钮
        document.getElementById('export-image').addEventListener('click', () => {
            this.exportAsImage();
        });
    }
    
    bindControlEvents() {
        // r参数滑块 - 实时迭代动画
        const rSlider = document.getElementById('logistic-r');
        const rValue = document.getElementById('logistic-r-value');
        let rAnimationTimeout;
        
        rSlider.addEventListener('input', (e) => {
            this.r = parseFloat(e.target.value);
            rValue.textContent = this.r.toFixed(2);
            
            // 清除之前的超时
            if (rAnimationTimeout) {
                clearTimeout(rAnimationTimeout);
            }
            
            // 延迟执行动画，避免过于频繁的重绘
            rAnimationTimeout = setTimeout(() => {
                this.realTimeTrajectoryAnimation();
            }, 100);
        });
        
        // x0参数滑块 - 实时轨迹更新
        const x0Slider = document.getElementById('logistic-x0');
        const x0Value = document.getElementById('logistic-x0-value');
        let x0AnimationTimeout;
        
        x0Slider.addEventListener('input', (e) => {
            this.x0 = parseFloat(e.target.value);
            x0Value.textContent = this.x0.toFixed(2);
            
            // 清除之前的超时
            if (x0AnimationTimeout) {
                clearTimeout(x0AnimationTimeout);
            }
            
            // 延迟执行动画，避免过于频繁的重绘
            x0AnimationTimeout = setTimeout(() => {
                if (currentTab === 'trajectory') {
                    this.realTimeTrajectoryAnimation();
                }
            }, 100);
        });
        
        // 迭代次数滑块 - 实时更新
        const iterSlider = document.getElementById('logistic-iterations');
        const iterValue = document.getElementById('logistic-iterations-value');
        let iterAnimationTimeout;
        
        iterSlider.addEventListener('input', (e) => {
            this.maxIterations = parseInt(e.target.value);
            iterValue.textContent = this.maxIterations;
            
            // 清除之前的超时
            if (iterAnimationTimeout) {
                clearTimeout(iterAnimationTimeout);
            }
            
            // 延迟执行动画，避免过于频繁的重绘
            iterAnimationTimeout = setTimeout(() => {
                if (currentTab === 'trajectory') {
                    this.realTimeTrajectoryAnimation();
                }
            }, 100);
        });
        
        // 开始轨迹按钮
        document.getElementById('start-trajectory').addEventListener('click', () => {
            this.startTrajectory();
        });
        
        // 清除轨迹按钮
        document.getElementById('clear-trajectory').addEventListener('click', () => {
            this.clearTrajectory();
        });
        
        // 动画生成按钮
        document.getElementById('animate-bifurcation').addEventListener('click', () => {
            this.animateBifurcation();
        });
    }
    
    // 逻辑映射函数
    logisticFunction(x, r) {
        return r * x * (1 - x);
    }
    
    // 计算逻辑映射迭代
    calculateTrajectory() {
        this.trajectory = [];
        let x = this.x0;
        
        // 忽略前50次迭代（暂态过程）
        for (let i = 0; i < 50; i++) {
            x = this.logisticFunction(x, this.r);
        }
        
        // 记录后50次迭代（稳态）
        for (let i = 0; i < Math.min(50, this.maxIterations); i++) {
            this.trajectory.push(x);
            x = this.logisticFunction(x, this.r);
        }
    }
    
    // 计算分岔图数据
    calculateBifurcationData() {
        this.bifurcationData = [];
        
        for (let r = this.rMin; r <= this.rMax; r += this.rStep) {
            const dataForR = [];
            let x = 0.5; // 初始值
            
            // 忽略暂态过程
            for (let i = 0; i < 100; i++) {
                x = this.logisticFunction(x, r);
            }
            
            // 记录稳态值
            for (let i = 0; i < 50; i++) {
                dataForR.push(x);
                x = this.logisticFunction(x, r);
            }
            
            this.bifurcationData.push({
                r: r,
                values: dataForR
            });
        }
    }
    
    // 重置轨迹
    resetTrajectory() {
        this.trajectory = [];
        this.currentIteration = 0;
    }
    
    // 开始轨迹动画
    startTrajectory() {
        this.calculateTrajectory();
        this.currentIteration = 0;
        this.animateTrajectory();
    }
    
    // 清除轨迹
    clearTrajectory() {
        this.resetTrajectory();
        this.drawTrajectory();
    }
    
    // 轨迹动画
    animateTrajectory() {
        if (this.currentIteration < this.trajectory.length) {
            this.drawTrajectory(this.currentIteration);
            this.currentIteration++;
            setTimeout(() => this.animateTrajectory(), this.animationSpeed);
        }
    }
    
    // 实时迭代动画 - 响应r值变化
    realTimeTrajectoryAnimation() {
        // 重新计算轨迹
        this.calculateTrajectory();
        
        // 显示更新提示
        this.showUpdateIndicator();
        
        // 如果当前在分岔图标签页，更新分岔图
        if (currentTab === 'bifurcation') {
            this.drawBifurcationDiagram();
        } else {
            // 否则展示实时轨迹动画
            this.currentIteration = 0;
            this.animateTrajectory();
        }
    }
    
    // 显示更新指示器
    showUpdateIndicator() {
        // 在画布上显示更新动画
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FF6B35';
        this.ctx.font = 'bold 16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('参数更新中...', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.restore();
        
        // 300ms后清除指示器
        setTimeout(() => {
            if (currentTab === 'bifurcation') {
                this.drawBifurcationDiagram();
            } else {
                this.drawTrajectory();
            }
        }, 300);
    }
    
    // 绘制轨迹图
    drawTrajectory(maxPoints = null) {
        // 清空画布
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const pointsToShow = maxPoints || this.trajectory.length;
        const points = this.trajectory.slice(0, pointsToShow);
        
        if (points.length === 0) return;
        
        // 绘制坐标轴
        this.drawAxes('迭代次数', '种群密度');
        
        // 绘制轨迹
        this.ctx.strokeStyle = '#FF6B35';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let i = 0; i < points.length; i++) {
            const x = this.margin.left + (i / Math.max(points.length, this.maxIterations)) * this.plotWidth;
            const y = this.margin.top + this.plotHeight - points[i] * this.plotHeight;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
        
        // 绘制轨迹点
        this.ctx.fillStyle = '#FF6B35';
        for (let i = 0; i < points.length; i += Math.max(1, Math.floor(points.length / 20))) {
            const x = this.margin.left + (i / Math.max(points.length, this.maxIterations)) * this.plotWidth;
            const y = this.margin.top + this.plotHeight - points[i] * this.plotHeight;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        
        // 显示信息
        this.drawTrajectoryInfo();
    }
    
    // 绘制轨道图(Cobweb Diagram)
    drawCobwebDiagram(maxSteps = null) {
        // 清空画布
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制坐标轴
        this.drawAxes('xₙ', 'xₙ₊₁');
        
        // 计算函数数据点用于绘制曲线
        const functionPoints = [];
        for (let x = 0; x <= 1; x += 0.01) {
            const y = this.logisticFunction(x, this.r);
            functionPoints.push({ x, y });
        }
        
        // 绘制函数曲线 y = f(x)
        this.ctx.strokeStyle = '#4D96FF';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        functionPoints.forEach((point, i) => {
            const x = this.margin.left + point.x * this.plotWidth;
            const y = this.margin.top + this.plotHeight - point.y * this.plotHeight;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.stroke();
        
        // 绘制对角线 y = x
        this.ctx.strokeStyle = '#FFD93D';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        
        // 对角线从(0,0)到(1,1)
        this.ctx.moveTo(this.margin.left, this.margin.top + this.plotHeight);
        this.ctx.lineTo(this.margin.left + this.plotWidth, this.margin.top);
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 计算轨道图点
        this.calculateCobwebPoints();
        
        // 确定显示的步数
        const stepsToShow = maxSteps || this.cobwebPoints.length;
        const pointsToShow = this.cobwebPoints.slice(0, stepsToShow);
        
        // 绘制轨道线
        if (pointsToShow.length > 1) {
            this.ctx.strokeStyle = '#FF6B35';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            for (let i = 0; i < pointsToShow.length - 1; i++) {
                const current = pointsToShow[i];
                const next = pointsToShow[i + 1];
                
                // 水平线从当前点到函数曲线
                this.ctx.moveTo(current.x, current.y);
                this.ctx.lineTo(current.x, next.y);
                
                // 垂直线到下一个点（如果在对角线上）
                if (next.isOnDiagonal) {
                    this.ctx.lineTo(next.x, next.y);
                }
            }
            
            this.ctx.stroke();
        }
        
        // 绘制轨道点
        pointsToShow.forEach((point, i) => {
            this.ctx.fillStyle = i === 0 ? '#6BCF7F' : '#FF6B35';
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // 为初始点添加标签
            if (i === 0) {
                this.ctx.fillStyle = '#6BCF7F';
                this.ctx.font = 'bold 12px sans-serif';
                this.ctx.fillText('x₀', point.x - 10, point.y - 10);
            }
        });
        
        // 显示轨道图信息
        this.drawCobwebInfo();
    }
    
    // 计算轨道图的点
    calculateCobwebPoints() {
        this.cobwebPoints = [];
        let x = this.x0;
        
        // 添加初始点
        const startX = this.margin.left + x * this.plotWidth;
        const startY = this.margin.top + this.plotHeight - x * this.plotHeight;
        this.cobwebPoints.push({ x: startX, y: startY, isOnDiagonal: true, value: x, step: 0 });
        
        // 计算迭代路径
        for (let step = 1; step <= Math.min(10, this.maxIterations); step++) {
            // 应用逻辑映射函数
            const nextX = this.logisticFunction(x, this.r);
            
            // 函数曲线上的点
            const functionX = this.margin.left + x * this.plotWidth;
            const functionY = this.margin.top + this.plotHeight - nextX * this.plotHeight;
            
            // 对角线上的点
            const diagonalX = this.margin.left + nextX * this.plotWidth;
            const diagonalY = this.margin.top + this.plotHeight - nextX * this.plotHeight;
            
            this.cobwebPoints.push({ 
                x: functionX, 
                y: functionY, 
                isOnDiagonal: false, 
                value: nextX, 
                step: step 
            });
            this.cobwebPoints.push({ 
                x: diagonalX, 
                y: diagonalY, 
                isOnDiagonal: true, 
                value: nextX, 
                step: step 
            });
            
            x = nextX;
        }
    }
    
    // 处理画布点击事件
    handleCanvasClick(event) {
        if (currentTab !== 'bifurcation') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // 检查点击是否在绘图区域内
        if (clickX >= this.margin.left && clickX <= this.margin.left + this.plotWidth &&
            clickY >= this.margin.top && clickY <= this.margin.top + this.plotHeight) {
            
            // 计算点击的r值
            const clickedR = this.rMin + ((clickX - this.margin.left) / this.plotWidth) * (this.rMax - this.rMin);
            
            // 更新参数
            this.r = Math.round(clickedR * 100) / 100; // 保留两位小数
            
            // 更新UI控件
            document.getElementById('logistic-r').value = this.r;
            document.getElementById('logistic-r-value').textContent = this.r.toFixed(2);
            
            // 显示点击反馈
            this.showClickFeedback(clickX, clickY, clickedR);
            
            // 延迟后跳转到轨道图
            setTimeout(() => {
                this.switchToCobwebView();
            }, 1000);
        }
    }
    
    // 显示点击反馈
    showClickFeedback(clickX, clickY, rValue) {
        // 保存当前状态
        this.ctx.save();
        
        // 绘制点击位置的圆圈
        this.ctx.strokeStyle = '#FFD93D';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([3, 3]);
        this.ctx.beginPath();
        this.ctx.arc(clickX, clickY, 20, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 显示r值标签
        this.ctx.fillStyle = '#FFD93D';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`r = ${rValue.toFixed(2)}`, clickX, clickY - 30);
        
        // 显示提示文本
        this.ctx.fillStyle = '#6BCF7F';
        this.ctx.font = '12px sans-serif';
        this.ctx.fillText('→ 切换到轨道图', clickX, clickY + 35);
        
        // 恢复状态
        this.ctx.restore();
        
        // 1秒后重绘
        setTimeout(() => {
            this.drawBifurcationDiagram();
        }, 1000);
    }
    
    // 切换到轨道图视图
    switchToCobwebView() {
        // 更新标签页
        setCurrentTab('cobweb');
        
        // 更新UI标签页状态
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // 添加轨道图标签页
        const tabsContainer = document.querySelector('.tab-container');
        if (!document.querySelector('.tab[data-cobweb="true"]')) {
            const cobwebTab = document.createElement('button');
            cobwebTab.className = 'tab active';
            cobwebTab.setAttribute('data-cobweb', 'true');
            cobwebTab.textContent = '🕸️ 轨道图';
            cobwebTab.onclick = () => {
                document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                cobwebTab.classList.add('active');
                document.getElementById('cobweb-tab').classList.add('active');
                currentTab = 'cobweb';
                this.drawCobwebDiagram();
            };
            tabsContainer.appendChild(cobwebTab);
        }
        
        // 添加轨道图内容区域
        if (!document.getElementById('cobweb-tab')) {
            const cobwebTabContent = document.createElement('div');
            cobwebTabContent.id = 'cobweb-tab';
            cobwebTabContent.className = 'tab-content active';
            
            cobwebTabContent.innerHTML = `
                <div class="canvas-container">
                    <h2>🕸️ 轨道图 (Cobweb Diagram)</h2>
                    <canvas id="cobwebCanvas" class="cobweb-canvas"></canvas>
                    <div class="legend">
                        <div class="legend-item">
                            <span class="legend-color" style="background: #4D96FF;"></span> 函数曲线
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background: #FFD93D;"></span> 对角线 y=x
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background: #FF6B35;"></span> 迭代路径
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background: #6BCF7F;"></span> 初始值
                        </div>
                    </div>
                </div>
            `;
            
            document.querySelector('.main-content').insertBefore(
                cobwebTabContent, 
                document.querySelector('.control-panel')
            );
        }
        
        // 初始化轨道图画布
        const cobwebCanvas = document.getElementById('cobwebCanvas');
        if (cobwebCanvas) {
            cobwebCanvas.width = cobwebCanvas.offsetWidth;
            cobwebCanvas.height = cobwebCanvas.offsetHeight;
            
            // 使用当前画布引用绘制轨道图
            const originalCanvas = this.canvas;
            this.canvas = cobwebCanvas;
            this.drawCobwebDiagram();
            this.canvas = originalCanvas;
        }
    }
    
    // 绘制轨道图信息
    drawCobwebInfo() {
        const info = [
            `参数: r = ${this.r.toFixed(2)}, x₀ = ${this.x0.toFixed(2)}`,
            `迭代步数: ${Math.min(10, this.maxIterations)}`,
            `稳态值: ${this.trajectory.length > 0 ? this.trajectory[this.trajectory.length - 1].toFixed(4) : '计算中...'}`,
            `状态: ${this.getCurrentStateDescription()}`
        ];
        
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
        this.ctx.fillRect(10, 10, 250, 100);
        
        this.ctx.fillStyle = '#FF6B35';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.fillText('🕸️ 轨道图信息', 20, 30);
        
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = '11px sans-serif';
        info.forEach((text, index) => {
            this.ctx.fillText(text, 20, 50 + index * 15);
        });
    }
    
    // 获取当前状态描述
    getCurrentStateDescription() {
        const r = this.r;
        if (r < 1) return '灭绝';
        if (r < 3) return '稳定收敛';
        if (r < 1 + Math.sqrt(6)) return '周期倍增';
        return '混沌状态';
    }
    
    // 绘制分岔图
    drawBifurcationDiagram() {
        this.calculateBifurcationData();
        
        // 清空画布
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制坐标轴
        this.drawAxes('增长率 r', '种群密度 x');
        
        // 绘制分岔图
        this.bifurcationData.forEach(point => {
            const x = this.margin.left + ((point.r - this.rMin) / (this.rMax - this.rMin)) * this.plotWidth;
            
            point.values.forEach(value => {
                const y = this.margin.top + this.plotHeight - value * this.plotHeight;
                
                // 根据r值设置颜色
                let color = '#FF6B35';
                if (point.r > 3) color = '#4D96FF';
                if (point.r > 3.45) color = '#6BCF7F';
                if (point.r > 3.54) color = '#FFD93D';
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x - 1, y - 1, 2, 2);
            });
        });
        
        // 绘制关键点标记
        this.drawCriticalPoints();
        
        // 显示信息
        this.drawBifurcationInfo();
    }
    
    // 绘制坐标轴
    drawAxes(xLabel, yLabel) {
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 1;
        
        // X轴
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin.left, this.margin.top + this.plotHeight);
        this.ctx.lineTo(this.margin.left + this.plotWidth, this.margin.top + this.plotHeight);
        this.ctx.stroke();
        
        // Y轴
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin.left, this.margin.top);
        this.ctx.lineTo(this.margin.left, this.margin.top + this.plotHeight);
        this.ctx.stroke();
        
        // 标签
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = '14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(xLabel, this.margin.left + this.plotWidth / 2, this.canvas.height - 10);
        
        this.ctx.save();
        this.ctx.translate(15, this.margin.top + this.plotHeight / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText(yLabel, 0, 0);
        this.ctx.restore();
        
        // 刻度
        this.ctx.fillStyle = '#999';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        
        // X轴刻度
        for (let r = this.rMin; r <= this.rMax; r += 0.5) {
            const x = this.margin.left + ((r - this.rMin) / (this.rMax - this.rMin)) * this.plotWidth;
            this.ctx.fillText(r.toFixed(1), x, this.margin.top + this.plotHeight + 15);
        }
        
        // Y轴刻度
        this.ctx.textAlign = 'right';
        for (let y = 0; y <= 1; y += 0.2) {
            const yPos = this.margin.top + this.plotHeight - y * this.plotHeight;
            this.ctx.fillText(y.toFixed(1), this.margin.left - 10, yPos + 3);
        }
    }
    
    // 绘制临界点
    drawCriticalPoints() {
        this.ctx.fillStyle = '#FF1744';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        
        // r = 3 (分岔点)
        const bifurcationX = this.margin.left + ((3 - this.rMin) / (this.rMax - this.rMin)) * this.plotWidth;
        this.ctx.fillText('r=3 (分岔)', bifurcationX, this.margin.top + this.plotHeight + 35);
        
        // r = 1+√6 ≈ 3.45 (混沌边界)
        const chaosX = this.margin.left + ((3.45 - this.rMin) / (this.rMax - this.rMin)) * this.plotWidth;
        this.ctx.fillText('r≈3.45 (混沌边界)', chaosX, this.margin.top + this.plotHeight + 50);
    }
    
    // 绘制轨迹信息
    drawTrajectoryInfo() {
        const info = [
            `r = ${this.r.toFixed(2)}`,
            `x₀ = ${this.x0.toFixed(2)}`,
            `迭代次数: ${this.trajectory.length}`,
            `稳态值: ${this.trajectory.length > 0 ? this.trajectory[this.trajectory.length - 1].toFixed(4) : 'N/A'}`
        ];
        
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
        this.ctx.fillRect(10, 10, 200, 100);
        
        this.ctx.fillStyle = '#FF6B35';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.fillText('轨迹信息', 20, 30);
        
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = '11px sans-serif';
        info.forEach((text, index) => {
            this.ctx.fillText(text, 20, 50 + index * 15);
        });
    }
    
    // 绘制分岔图信息
    drawBifurcationInfo() {
        const info = [
            `r范围: ${this.rMin.toFixed(1)} - ${this.rMax.toFixed(1)}`,
            `步长: ${this.rStep}`,
            `数据点: ${this.bifurcationData.length}`,
            `现象: 周期倍增 → 混沌`
        ];
        
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
        this.ctx.fillRect(10, 10, 220, 100);
        
        this.ctx.fillStyle = '#FF6B35';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.fillText('分岔图信息', 20, 30);
        
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = '11px sans-serif';
        info.forEach((text, index) => {
            this.ctx.fillText(text, 20, 50 + index * 15);
        });
    }
    
    // 动画生成分岔图
    animateBifurcation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.bifurcationData = [];
        this.currentR = this.rMin;
        
        const animateStep = () => {
            if (this.currentR <= this.rMax) {
                // 计算当前r值的数据
                const dataForR = [];
                let x = 0.5;
                
                // 忽略暂态
                for (let i = 0; i < 100; i++) {
                    x = this.logisticFunction(x, this.currentR);
                }
                
                // 记录稳态
                for (let i = 0; i < 50; i++) {
                    dataForR.push(x);
                    x = this.logisticFunction(x, this.currentR);
                }
                
                this.bifurcationData.push({
                    r: this.currentR,
                    values: dataForR
                });
                
                // 重绘
                this.drawBifurcationDiagram();
                
                // 继续动画
                this.currentR += this.rStep * 10; // 加快动画速度
                setTimeout(() => animateStep(), 50);
            } else {
                this.isAnimating = false;
            }
        };
        
        animateStep();
    }
    
    // 全景渲染方法
    enablePanorama() {
        this.isPanorama = true;
        this.zoomLevel = 1.5;
        this.targetZoom = 1.5;
        this.panOffset = { x: -50, y: -30 };
        this.targetPan = { x: -50, y: -30 };
        this.smoothZoom();
    }
    
    resetView() {
        this.targetZoom = 1.0;
        this.targetPan = { x: 0, y: 0 };
        this.zoomLevel = 1.0;
        this.panOffset = { x: 0, y: 0 };
        
        // 更新UI
        document.getElementById('panorama-zoom').value = 1.0;
        document.getElementById('panorama-zoom-value').textContent = '1.0x';
        
        this.smoothZoom();
    }
    
    smoothZoom() {
        const animateZoom = () => {
            const zoomDiff = this.targetZoom - this.zoomLevel;
            const panDiffX = this.targetPan.x - this.panOffset.x;
            const panDiffY = this.targetPan.y - this.panOffset.y;
            
            // 平滑插值
            this.zoomLevel += zoomDiff * 0.1;
            this.panOffset.x += panDiffX * 0.1;
            this.panOffset.y += panDiffY * 0.1;
            
            // 重绘
            this.drawBifurcationDiagram();
            
            // 继续动画直到收敛
            if (Math.abs(zoomDiff) > 0.01 || Math.abs(panDiffX) > 0.5 || Math.abs(panDiffY) > 0.5) {
                requestAnimationFrame(animateZoom);
            }
        };
        
        animateZoom();
    }
    
    // 高质量渲染
    fullQualityRender() {
        if (this.isRendering) return;
        
        this.isRendering = true;
        this.renderProgress = 0;
        const originalStep = this.rStep;
        this.rStep = 0.0005; // 最高精度
        
        // 显示渲染进度
        this.showRenderProgress();
        
        // 清空现有数据
        this.bifurcationData = [];
        
        // 分批渲染以避免阻塞
        this.batchRender(() => {
            // 恢复原始步长
            this.rStep = originalStep;
            this.isRendering = false;
            this.hideRenderProgress();
        });
    }
    
    batchRender(callback) {
        const batchSize = 50;
        let r = this.rMin;
        
        const renderBatch = () => {
            for (let i = 0; i < batchSize && r <= this.rMax; i++) {
                const dataForR = [];
                let x = 0.5;
                
                // 忽略暂态
                for (let j = 0; j < 200; j++) {
                    x = this.logisticFunction(x, r);
                }
                
                // 记录稳态
                for (let j = 0; j < 100; j++) {
                    dataForR.push(x);
                    x = this.logisticFunction(x, r);
                }
                
                this.bifurcationData.push({
                    r: r,
                    values: dataForR
                });
                
                r += this.rStep;
            }
            
            // 更新进度
            this.renderProgress = ((r - this.rMin) / (this.rMax - this.rMin)) * 100;
            this.updateRenderProgress();
            
            // 继续渲染或完成
            if (r <= this.rMax) {
                setTimeout(renderBatch, 10); // 小延迟避免阻塞
            } else {
                this.drawBifurcationDiagram();
                if (callback) callback();
            }
        };
        
        renderBatch();
    }
    
    showRenderProgress() {
        // 创建进度条
        const progressContainer = document.createElement('div');
        progressContainer.id = 'render-progress';
        progressContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(26, 26, 46, 0.95);
            border: 2px solid #FF6B35;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            z-index: 1000;
            min-width: 300px;
        `;
        
        progressContainer.innerHTML = `
            <h3 style="color: #FF6B35; margin-bottom: 15px;">🎨 高质量渲染中...</h3>
            <div style="background: #333; border-radius: 5px; height: 20px; overflow: hidden; margin-bottom: 10px;">
                <div id="progress-bar" style="background: linear-gradient(45deg, #FF6B35, #F7931E); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
            </div>
            <p id="progress-text" style="color: #ccc; font-size: 14px;">进度: 0%</p>
        `;
        
        document.body.appendChild(progressContainer);
    }
    
    updateRenderProgress() {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        if (progressBar && progressText) {
            progressBar.style.width = this.renderProgress + '%';
            progressText.textContent = `进度: ${Math.round(this.renderProgress)}%`;
        }
    }
    
    hideRenderProgress() {
        const progressContainer = document.getElementById('render-progress');
        if (progressContainer) {
            document.body.removeChild(progressContainer);
        }
    }
    
    exportAsImage() {
        // 创建高质量的画布
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        
        // 设置高分辨率
        const scale = 2; // 2倍分辨率
        exportCanvas.width = this.canvas.width * scale;
        exportCanvas.height = this.canvas.height * scale;
        
        // 缩放上下文
        exportCtx.scale(scale, scale);
        
        // 设置白色背景
        exportCtx.fillStyle = '#ffffff';
        exportCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 临时设置导出上下文
        const originalCtx = this.ctx;
        this.ctx = exportCtx;
        
        // 在临时上下文中绘制
        this.drawBifurcationDiagram();
        
        // 恢复原始上下文
        this.ctx = originalCtx;
        
        // 导出图像
        const link = document.createElement('a');
        link.download = `bifurcation-diagram-${Date.now()}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
    }
    
    // 修改分岔图绘制方法以支持全景
    drawBifurcationDiagram() {
        this.calculateBifurcationData();
        
        // 清空画布
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 保存当前状态
        this.ctx.save();
        
        // 应用缩放和平移
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(this.zoomLevel, this.zoomLevel);
        this.ctx.translate(this.panOffset.x - centerX, this.panOffset.y - centerY);
        
        // 计算绘图区域（考虑缩放）
        const effectivePlotWidth = this.plotWidth / this.zoomLevel;
        const effectivePlotHeight = this.plotHeight / this.zoomLevel;
        const effectiveMargin = {
            top: this.margin.top / this.zoomLevel,
            right: this.margin.right / this.zoomLevel,
            bottom: this.margin.bottom / this.zoomLevel,
            left: this.margin.left / this.zoomLevel
        };
        
        // 绘制分岔图
        this.bifurcationData.forEach(point => {
            const x = effectiveMargin.left + ((point.r - this.rMin) / (this.rMax - this.rMin)) * effectivePlotWidth;
            
            point.values.forEach(value => {
                const y = effectiveMargin.top + effectivePlotHeight - value * effectivePlotHeight;
                
                // 根据r值和缩放级别设置颜色和大小
                let color = '#FF6B35';
                let size = Math.max(1, 2 / this.zoomLevel); // 根据缩放调整点的大小
                
                if (point.r > 3) {
                    color = '#4D96FF';
                    if (point.r > 3.45) color = '#6BCF7F';
                    if (point.r > 3.54) color = '#FFD93D';
                }
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x - size/2, y - size/2, size, size);
            });
        });
        
        // 恢复状态
        this.ctx.restore();
        
        // 绘制信息面板（不受缩放影响）
        this.drawPanoramaInfo();
    }
    
    drawPanoramaInfo() {
        const info = [
            `全景模式: ${this.isPanorama ? '开启' : '关闭'}`,
            `缩放级别: ${this.zoomLevel.toFixed(2)}x`,
            `平移: (${this.panOffset.x.toFixed(0)}, ${this.panOffset.y.toFixed(0)})`,
            `r范围: ${this.rMin.toFixed(1)} - ${this.rMax.toFixed(1)}`,
            `数据点: ${this.bifurcationData.length}`,
            `现象: 周期倍增 → 混沌`
        ];
        
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
        this.ctx.fillRect(10, 10, 250, 120);
        
        this.ctx.fillStyle = '#FF6B35';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.fillText('🌐 全景信息', 20, 30);
        
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = '11px sans-serif';
        info.forEach((text, index) => {
            this.ctx.fillText(text, 20, 50 + index * 15);
        });
    }
    
    // 获取当前参数
    getParameters() {
        return {
            r: this.r,
            x0: this.x0,
            maxIterations: this.maxIterations,
            trajectory: this.trajectory,
            bifurcationData: this.bifurcationData
        };
    }
}

// 全局变量
let logisticMap = null;
let currentTab = 'bifurcation';

// 初始化函数
function initializeLogisticMap(canvasId = 'logisticCanvas') {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        logisticMap = new LogisticMap(canvas);
        return logisticMap;
    }
    return null;
}

// 设置当前标签页
function setCurrentTab(tab) {
    currentTab = tab;
}

// 验证逻辑映射功能
function verifyLogisticMapImplementation() {
    try {
        if (!logisticMap) {
            console.warn('LogisticMap未初始化');
            return false;
        }
        
        // 验证基本功能
        const params = logisticMap.getParameters();
        const trajectory = logisticMap.calculateTrajectory();
        const bifurcationData = logisticMap.calculateBifurcationData();
        
        // 检查结果
        const validation = {
            parametersValid: params.r >= 1 && params.r <= 4 && params.x0 >= 0 && params.x0 <= 1,
            trajectoryValid: Array.isArray(trajectory) && trajectory.length > 0,
            bifurcationDataValid: Array.isArray(bifurcationData) && bifurcationData.length > 0,
            logisticFunctionValid: typeof logisticMap.logisticFunction === 'function'
        };
        
        return Object.values(validation).every(v => v);
    } catch (error) {
        console.error('验证失败:', error);
        return false;
    }
}

// 导出模块
window.LogisticMap = LogisticMap;
window.initializeLogisticMap = initializeLogisticMap;
window.verifyLogisticMapImplementation = verifyLogisticMapImplementation;
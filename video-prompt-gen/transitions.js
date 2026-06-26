// Video Prompt Generator - 转场生成器
// 自动生成镜头间的转场提示词

const transitions = [
    {
        type: "Cut",
        name: "切镜",
        description: "瞬间切换到下一个镜头，最常用的转场方式",
        scenarios: ["快速剪辑", "节奏紧凑", "叙事推进"],
        visualEffect: "instant change",
        适用场景: ["对话", "动作", "快速节奏"],
        duration: "0s",
        emotionalImpact: "直接, 高效"
    },
    {
        type: "Fade",
        name: "淡入淡出",
        description: "画面逐渐变黑或变亮，时间过渡自然",
        scenarios: ["时间流逝", "情绪变化", "章节转换"],
        visualEffect: "smooth color transition",
        适用场景: ["开场", "结尾", "回忆"],
        duration: "1-3秒",
        emotionalImpact: "柔和, 怀旧"
    },
    {
        type: "Cross Dissolve",
        name: "叠化",
        description: "前后镜头重叠淡入淡出，创造梦幻效果",
        scenarios: ["梦境", "记忆", "抽象连接"],
        visualEffect: "image overlap transition",
        适用场景: ["回忆", "幻想", "诗意表达"],
        duration: "2-4秒",
        emotionalImpact: "梦幻, 流畅"
    },
    {
        type: "Wipe",
        name: "划变",
        description: "新画面从一侧推走旧画面",
        scenarios: ["空间转换", "方向指示", "节奏变化"],
        visualEffect: "directional movement",
        适用场景: ["旅行", "时间跳跃", "场景转换"],
        duration: "1-2秒",
        emotionalImpact: "动态, 明确"
    },
    {
        type: "Dolly Zoom",
        name: "推拉变焦",
        description: "相机移动与变焦同步，创造透视变形效果",
        scenarios: ["心理冲击", "视觉惊奇", "情感爆发"],
        visualEffect: "perspective distortion",
        适用场景: ["关键时刻", "戏剧效果", "冲击力"],
        duration: "2-3秒",
        emotionalImpact: "震撼, 不稳定"
    },
    {
        type: "Match Cut",
        name: "匹配剪辑",
        description: "根据构图、形状或动作进行无缝转场",
        scenarios: ["连贯性", "艺术性", "视觉韵律"],
        visualEffect: "visual continuity",
        适用场景: ["动作连贯", "构图相似", "概念转换"],
        duration: "0s",
        emotionalImpact: "巧妙, 流畅"
    },
    {
        type: "Jump Cut",
        name: "跳切",
        description: "打破连续性的跳跃剪辑，创造时间压缩感",
        scenarios: ["时间流逝", "节奏加速", "现代感"],
        visualEffect: "time compression",
        适用场景: ["蒙太奇", "快节奏", "都市生活"],
        duration: "0s",
        emotionalImpact: "现代, 不安"
    },
    {
        type: "Spin Transition",
        name: "旋转转场",
        description: "画面旋转进入下一个镜头",
        scenarios: ["场景转换", "喜剧效果", "动感"],
        visualEffect: "circular rotation",
        适用场景: ["喜剧", "动感", "年轻化"],
        duration: "1-2秒",
        emotionalImpact: "活泼, 趣味"
    },
    {
        type: "Zoom Transition",
        name: "缩放转场",
        description: "通过缩放效果进行转场",
        scenarios: ["细节展开", "整体展示", "焦点变化"],
        visualEffect: "zoom in/out",
        适用场景: ["特写", "强调细节", "视角转换"],
        duration: "1-3秒",
        emotionalImpact: "聚焦, 重要"
    },
    {
        type: "Morph Transition",
        name: "变形转场",
        description: "前后画面形状自然变形转换",
        scenarios: ["抽象连接", "概念转换", "超现实"],
        visualEffect: "shape transformation",
        适用场景: ["奇幻", "科幻", "艺术表达"],
        duration: "2-4秒",
        emotionalImpact: "魔幻, 创新"
    },
    {
        type: "Glitch Transition",
        name: "故障转场",
        description: "数字故障效果，营造科技感和不稳定感",
        scenarios: ["科技场景", "心理状态", "现代感"],
        visualEffect: "digital distortion",
        适用场景: ["科技", "惊悚", "赛博朋克"],
        duration: "0.5-1秒",
        emotionalImpact: "紧张, 未来感"
    },
    {
        type: "Lens Flare",
        name: "镜头光晕",
        description: "通过强光效果进行转场",
        scenarios: ["意识转换", "幻觉", "超现实"],
        visualEffect: "light burst",
        适用场景: ["梦幻", "超现实", "重要转折"],
        duration: "1-2秒",
        emotionalImpact: "明亮, 神圣"
    }
];

// 智能转场推荐算法
function recommendTransition(fromShot, toShot) {
    const recommendations = [];
    
    // 基于景别的转场推荐
    if (fromShot.camera.shotSize === "Extreme Long Shot" && toShot.camera.shotSize === "Close Up") {
        recommendations.push({
            transition: transitions.find(t => t.type === "Zoom Transition"),
            reason: "从大远景到特写，使用缩放转场强调细节"
        });
    }
    
    // 基于运动速度的转场推荐
    if (fromShot.camera.speed === "Ultra Slow" && toShot.camera.speed === "Fast") {
        recommendations.push({
            transition: transitions.find(t => t.type === "Jump Cut"),
            reason: "从慢动作到快动作，使用跳切制造节奏变化"
        });
    }
    
    // 基于情绪的转场推荐
    if (fromShot.content.mood === "Calm, Peaceful" && toShot.content.mood === "Intense, Tense") {
        recommendations.push({
            transition: transitions.find(t => t.type === "Fade"),
            reason: "从平静到紧张，使用淡入淡出过渡情绪变化"
        });
    }
    
    // 基于类型的转场推荐
    if (fromShot.content.subject === toShot.content.subject) {
        recommendations.push({
            transition: transitions.find(t => t.type === "Match Cut"),
            reason: "同一主体，使用匹配剪辑保持连贯性"
        });
    }
    
    // 默认推荐
    if (recommendations.length === 0) {
        recommendations.push({
            transition: transitions.find(t => t.type === "Cut"),
            reason: "最常用的切镜转场，适合大多数场景"
        });
    }
    
    return recommendations;
}

// 生成转场提示词
function generateTransitionPrompt(transition, fromShot, toShot) {
    const prompt = `转场效果: ${transition.name}
转场类型: ${transition.type}
转场描述: ${transition.description}
转场时长: ${transition.duration}
视觉效果: ${transition.visualEffect}
情绪影响: ${transition.emotionalImpact}

从前镜头: ${fromShot.title} (${fromShot.camera.shotSize})
到后镜头: ${toShot.title} (${toShot.camera.shotSize})

AI提示词: ${transition.name} transition from ${fromShot.camera.shotSize} to ${toShot.camera.shotSize}, ${transition.description}`;
    
    return prompt;
}

// 根据转场类型获取AI提示词
function getTransitionAIPrompt(transition, fromShot, toShot) {
    let aiPrompt = `${transition.name} transition`;
    
    if (fromShot && toShot) {
        aiPrompt += ` from ${fromShot.camera.shotSize} to ${toShot.camera.shotSize}`;
    }
    
    aiPrompt += `, ${transition.description}`;
    
    // 根据转场类型添加具体的技术参数
    switch (transition.type) {
        case "Fade":
            aiPrompt += ", gradual fade through black or white";
            break;
        case "Cross Dissolve":
            aiPrompt += ", overlapping dissolve between scenes";
            break;
        case "Wipe":
            aiPrompt += ", directional screen wipe effect";
            break;
        case "Zoom Transition":
            aiPrompt += ", smooth zoom transition effect";
            break;
        case "Glitch Transition":
            aiPrompt += ", digital glitch and distortion effect";
            break;
        case "Spin Transition":
            aiPrompt += ", spinning rotation transition";
            break;
    }
    
    return aiPrompt;
}

// 导出功能
window.TransitionGenerator = {
    transitions,
    recommendTransition,
    generateTransitionPrompt,
    getTransitionAIPrompt
};
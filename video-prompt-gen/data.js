// Video Prompt Generator - 参数数据结构
const videoParams = {
    
    // 相机运动参数
    cameraMovement: [
        {
            type: "Push",
            name: "推",
            description: "相机向被摄主体方向移动",
            scenario: "强调主体，营造紧张感",
            value: "push shot"
        },
        {
            type: "Pull",
            name: "拉",
            description: "相机远离被摄主体",
            scenario: "展现环境，营造距离感",
            value: "pull shot"
        },
        {
            type: "Pan",
            name: "摇",
            description: "相机水平转动",
            scenario: "展现场景横向范围",
            value: "pan shot"
        },
        {
            type: "Tilt",
            name: "移",
            description: "相机垂直转动",
            scenario: "展示垂直空间关系",
            value: "tilt shot"
        },
        {
            type: "Dolly",
            name: "跟",
            description: "相机沿轨道平移",
            scenario: "平稳跟随主体运动",
            value: "dolly shot"
        },
        {
            type: "Zoom",
            name: "变焦",
            description: "镜头焦距变化，位置不变",
            scenario: "改变画面构图，强调细节",
            value: "zoom shot"
        },
        {
            type: "Track",
            name: "跟拍",
            description: "相机跟随主体移动",
            scenario: "动态视角，沉浸感强",
            value: "tracking shot"
        },
        {
            type: "Crane",
            name: "升降",
            description: "相机垂直升降",
            scenario: "改变视角高度，展示层次",
            value: "crane shot"
        },
        {
            type: "Orbit",
            name: "环绕",
            description: "围绕主体旋转360度",
            scenario: "展现主体全方位",
            value: "orbit shot"
        },
        {
            type: "Handheld",
            name: "手持",
            description: "手持设备拍摄",
            scenario: "真实感，纪录片风格",
            value: "handheld shot"
        }
    ],
    
    // 镜头角度参数
    cameraAngle: [
        {
            type: "Eye Level",
            name: "平角",
            effect: "与眼睛同高",
            psychological: "真实，平等感",
            value: "eye level angle"
        },
        {
            type: "Low Angle",
            name: "仰角",
            effect: "从下方拍摄",
            psychological: "权威，高大，力量",
            value: "low angle"
        },
        {
            type: "High Angle",
            name: "俯角",
            effect: "从上方拍摄",
            psychological: "弱小，压抑，俯视",
            value: "high angle"
        },
        {
            type: "Dutch Angle",
            name: "斜角",
            effect: "倾斜拍摄",
            psychological: "紧张，混乱，不安",
            value: "dutch angle"
        },
        {
            type: "Over the Shoulder",
            name: "过肩",
            effect: "从角色肩后拍摄",
            psychological: "亲密，对话关系",
            value: "over the shoulder"
        },
        {
            type: "Bird's Eye",
            name: "鸟瞰",
            effect: "从正上方拍摄",
            psychological: "宏观，上帝视角",
            value: "bird's eye"
        },
        {
            type: "Worm's Eye",
            name: "仰视",
            effect: "从正下方拍摄",
            psychological: "敬畏，高大",
            value: "worm's eye"
        }
    ],
    
    // 景别参数
    shotSize: [
        {
            type: "Extreme Long Shot",
            name: "大远景",
            ratio: "1:20",
            scenario: "展示环境，营造氛围",
            value: "extreme long shot"
        },
        {
            type: "Long Shot",
            name: "远景",
            ratio: "1:6",
            scenario: "展示主体与环境关系",
            value: "long shot"
        },
        {
            type: "Medium Long Shot",
            name: "中远景",
            ratio: "1:3",
            scenario: "腰部以上，展现环境细节",
            value: "medium long shot"
        },
        {
            type: "Medium Shot",
            name: "中景",
            ratio: "1:2",
            scenario: "腰部到胸部，对话场景",
            value: "medium shot"
        },
        {
            type: "Medium Close Up",
            name: "中近景",
            ratio: "1:1",
            scenario: "胸部以上，情感表达",
            value: "medium close up"
        },
        {
            type: "Close Up",
            name: "近景",
            ratio: "1:1",
            scenario: "头部，面部表情",
            value: "close up"
        },
        {
            type: "Extreme Close Up",
            name: "大特写",
            ratio: "1:1",
            scenario: "眼睛，细节，强调",
            value: "extreme close up"
        }
    ],
    
    // 运动速度参数
    movementSpeed: [
        {
            type: "Slow Motion",
            name: "慢动作",
            framerate: "24-30fps",
            emotional: "优雅，浪漫，史诗感",
            value: "slow motion"
        },
        {
            type: "Normal",
            name: "正常",
            framerate: "30-60fps",
            emotional: "自然，日常，真实",
            value: "normal"
        },
        {
            type: "Fast Motion",
            name: "快动作",
            framerate: "60-120fps",
            emotional: "紧张，兴奋，活力",
            value: "fast motion"
        },
        {
            type: "Time Lapse",
            name: "延时",
            framerate: "1-2fps",
            emotional: "变化，时光流逝，壮观",
            value: "time lapse"
        }
    ],
    
    // 预设模板
    templates: [
        {
            name: "电影风格",
            style: "cinematic",
            description: "专业的电影拍摄风格，注重构图和光影",
            parameters: {
                cameraMovement: "Dolly",
                cameraAngle: "Eye Level",
                shotSize: "Medium Shot",
                movementSpeed: "Normal"
            }
        },
        {
            name: "纪录片风格",
            style: "documentary",
            description: "真实自然的纪录片拍摄风格",
            parameters: {
                cameraMovement: "Handheld",
                cameraAngle: "Eye Level",
                shotSize: "Long Shot",
                movementSpeed: "Normal"
            }
        },
        {
            name: "音乐视频",
            style: "music video",
            description: "动感强烈的音乐视频风格",
            parameters: {
                cameraMovement: "Track",
                cameraAngle: "Dynamic",
                shotSize: "Medium Close Up",
                movementSpeed: "Fast Motion"
            }
        },
        {
            name: "广告风格",
            style: "commercial",
            description: "精美的广告拍摄风格",
            parameters: {
                cameraMovement: "Dolly",
                cameraAngle: "Low Angle",
                shotSize: "Medium Close Up",
                movementSpeed: "Slow Motion"
            }
        }
    ],
    
    // Phase 2: 风格预设系统
    stylePresets: [
        {
            id: "cyberpunk",
            name: "赛博朋克",
            category: "科幻",
            description: "高科技低生活的未来都市风格，霓虹灯、雨夜、机械义体",
            keyElements: ["neon lights", "rain", "cybernetics", "future city", "digital glitch"],
            colorScheme: "dark blues, purples, neon pinks and greens",
            lighting: "dramatic backlighting, neon glow",
            mood: "dystopian, technological, mysterious",
            cameraStyle: "Dynamic camera movements, Dutch angles, extreme close ups",
            typicalShots: ["low angle shots", "extreme close ups", "tracking shots"],
            examples: "Blade Runner 2049, Ghost in the Shell, Cyberpunk 2077"
        },
        {
            id: "noir",
            name: "黑色电影",
            category: "经典",
            description: "经典的黑白侦探片风格，阴影、雨伞、硬汉侦探",
            keyElements: ["black and white", "shadows", "rain", "detective", "crime"],
            colorScheme: "high contrast black and white, limited grays",
            lighting: "hard shadows, rim lighting, chiaroscuro",
            mood: "mysterious, tense, fatalistic",
            cameraStyle: "low angles, Dutch angles, chiaroscuro lighting",
            typicalShots: ["low angle shots", "shadow patterns", "close ups on faces"],
            examples: "The Maltese Falcon, Double Indemnity, Chinatown"
        },
        {
            id: "documentary",
            name: "纪录片",
            category: "纪实",
            description: "真实自然的纪录片拍摄风格，手持镜头，自然光",
            keyElements: ["handheld", "natural light", "interview", "real people", "authentic"],
            colorScheme: "natural colors, slight desaturation",
            lighting: "available light, naturalistic",
            mood: "realistic, authentic, engaging",
            cameraStyle: "handheld camera, intimate, observational",
            typicalShots: ["long shots", "medium shots", "reaction shots"],
            examples: "Planet Earth, The Act of Killing, Hoop Dreams"
        },
        {
            id: "vintage",
            name: "复古",
            category: "怀旧",
            description: "老电影风格，胶片颗粒，暖色调，经典构图",
            keyElements: ["film grain", "warm tones", "vintage camera", "soft focus", "golden hour"],
            colorScheme: "warm yellows, browns, sepia tones",
            lighting: "soft natural light, golden hour",
            mood: "nostalgic, romantic, timeless",
            cameraStyle: "classical composition, steady camera, soft focus",
            typicalShots: ["wide establishing shots", "symmetrical compositions", "long takes"],
            examples: "The Grand Budapest Hotel, Amélie, Midnight in Paris"
        },
        {
            id: "horror",
            name: "恐怖",
            category: "惊悚",
            description: "恐怖片风格，对比强烈的光影，快速剪辑，紧张氛围",
            keyElements: ["jump scares", "dark shadows", "quick cuts", "close ups", "tense music"],
            colorScheme: "deep blacks, blood reds, cold blues",
            lighting: "extreme contrast, sudden darkness",
            mood: "terrifying, suspenseful, intense",
            cameraStyle: "shaky camera, quick movements, point of view shots",
            typicalShots: ["POV shots", "extreme close ups", "dark silhouette"],
            examples: "Get Out, Hereditary, The Conjuring"
        },
        {
            id: "anime",
            name: "动漫",
            category: "动画",
            description: "日式动漫风格，夸张表情，动态线条，鲜艳色彩",
            keyElements: ["exaggerated expressions", "dynamic lines", "bright colors", "chibi elements", "speed lines"],
            colorScheme: "vibrant, saturated colors, cel-shaded",
            lighting: "flat lighting, cel shading, dramatic highlights",
            mood: "expressive, energetic, emotional",
            cameraStyle: "dynamic angles, extreme close ups, expressive compositions",
            typicalShots: ["extreme close ups", "speed lines", "dramatic angles"],
            examples: "Your Name, Akira, Demon Slayer"
        },
        {
            id: "western",
            name: "西部",
            category: "经典",
            description: "西部片风格，广袤沙漠，金色阳光，经典枪战",
            keyElements: ["desert", "cowboy", "horse", "saloon", "sunset"],
            colorScheme: "earthy tones, golden yellows, dusty browns",
            lighting: "harsh sunlight, long shadows, golden hour",
            mood: "epic, adventurous, tense",
            cameraStyle: "wide landscapes, low angles, establishing shots",
            typicalShots: ["wide landscapes", "low angle shots", "quick draws"],
            examples: "Once Upon a Time in the West, The Good, the Bad and the Ugly"
        },
        {
            id: "sci-fi",
            name: "科幻",
            category: "未来",
            description: "科幻大片风格，未来科技，太空场景，视觉效果",
            keyElements: ["futuristic", "spaceship", "alien", "technology", "digital effects"],
            colorScheme: "cool blues, silvers, neon accents",
            lighting: "clean, futuristic, high-tech",
            mood: "awe-inspiring, technological, futuristic",
            cameraStyle: "smooth movements, wide establishing shots, tracking shots",
            typicalShots: ["wide space shots", "tracking shots", "futuristic landscapes"],
            examples: "2001: A Space Odyssey, Interstellar, Blade Runner"
        }
    ]
};

// 当前选择的参数
let currentSelection = {
    cameraMovement: null,
    cameraAngle: null,
    shotSize: null,
    movementSpeed: null,
    template: null,
    // Phase 2: 风格选择
    filmGenre: null,
    lightingStyle: null,
    colorGrade: null,
    filmTexture: null,
    // Phase 2: 风格预设
    stylePreset: null
};

// 平台映射配置
const platformMapping = {
    'sora': {
        name: 'Sora 2 (OpenAI)',
        maxTokens: 400,
        promptTemplate: (shot) => {
            const cameraInfo = `camera ${shot.camera.movement}, ${shot.camera.angle}, ${shot.camera.shotSize}`;
            const contentInfo = `${shot.content.subject}, ${shot.content.mood}, ${shot.content.atmosphere}`;
            return `${shot.title}: ${cameraInfo}, ${contentInfo}, ${shot.style || 'realistic'}`;
        },
        description: '支持15-25秒视频，物理引擎优秀，适合自然场景'
    },
    'kling': {
        name: 'Kling 3.0',
        maxTokens: 300,
        promptTemplate: (shot) => {
            const cameraInfo = `${shot.camera.movement} camera, ${shot.camera.angle} angle`;
            const timeControl = `${shot.duration} seconds`;
            return `Scene: ${shot.title}, ${cameraInfo}, ${timeControl}, ${shot.style || 'high quality'}`;
        },
        description: '支持4K视频，角色一致性优秀，按秒计费'
    },
    'runway': {
        name: 'Runway Gen-4',
        maxTokens: 350,
        promptTemplate: (shot) => {
            const cameraInfo = `Camera: ${shot.camera.movement} with ${shot.camera.angle} angle`;
            const style = shot.style || 'cinematic';
            return `${shot.title}: ${cameraInfo}, Style: ${style}, Duration: ${shot.duration}s`;
        },
        description: '支持多种视频风格，专业编辑工具，实时预览'
    },
    'veo': {
        name: 'Google Veo 3.1',
        maxTokens: 450,
        promptTemplate: (shot) => {
            const cameraInfo = `${shot.camera.movement}, ${shot.camera.shotSize} shot`;
            const content = `${shot.content.subject} in ${shot.content.atmosphere}`;
            return `${shot.title}: ${content}, ${cameraInfo}, ${shot.style || 'realistic'}`;
        },
        description: 'Google新一代视频生成器，理解能力强，高质量输出'
    },
    'pika': {
        name: 'Pika Labs 1.0',
        maxTokens: 300,
        promptTemplate: (shot) => {
            const cameraInfo = `${shot.camera.movement} ${shot.camera.angle} ${shot.camera.shotSize}`;
            return `${shot.title}: ${cameraInfo}, ${shot.content.subject}, ${shot.style || 'anime'}`;
        },
        description: '专业动画风格支持，快速生成，多镜头同步'
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { videoParams, platformMapping };
}
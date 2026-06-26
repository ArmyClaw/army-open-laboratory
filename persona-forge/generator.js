// ============================================================
// generator.js — 人设文档生成引擎
// ============================================================

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePersona(persona) {
  const { name, title, avatar, personality, language_style, catchphrases, related_characters, metaphors, forbidden, brief } = persona;

  // Use deterministic seed from id so same persona gives consistent but unique output
  const seed = hashStr(persona.id);

  const toneDesc = generateToneDesc(persona);
  const behaviorRules = generateBehaviorRules(persona);
  const interactionRules = generateInteractionRules(persona);
  const usageTips = generateUsageTips(persona);

  const sections = [
    { icon: '🎭', title: '角色档案', content: generateProfile(persona) },
    { icon: '🗣️', title: '语言特征', content: generateLanguageSection(persona) },
    { icon: '📏', title: '行为准则', content: behaviorRules },
    { icon: '🤝', title: '互动规则', content: interactionRules },
    { icon: '💬', title: '标志性口号', content: generateCatchphrasesSection(persona) },
    { icon: '🔗', title: '关联人物', content: generateRelatedSection(persona) },
    { icon: '🪞', title: '比喻素材库', content: generateMetaphorsSection(persona) },
    { icon: '🚫', title: '禁止准则', content: generateForbiddenSection(persona) },
    { icon: '💡', title: '使用建议', content: usageTips }
  ];

  return { name, title, avatar, sections, brief };
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickSeeded(arr, seed, offset = 0) {
  return arr[(seed + offset) % arr.length];
}

function generateToneDesc(p) {
  const tones = [
    `整体基调：${p.personality.split('，')[0]}。交流时带有明显的${p.title}式风格，每个回复都像是在${getToneScenario(p)}。`,
    `像${p.title}在${getToneScenario(p)}——${p.personality.split('，')[0]}。每次开口都带着鲜明的个人印记，让人一听就知道"这是${p.name}"。`,
    `${p.name}的世界观驱动一切表达：${p.personality.split('。')[0]}。无论什么话题，都能用${p.title}的视角重新解读。`
  ];
  return pickSeeded(tones, hashStr(p.id));
}

function getToneScenario(p) {
  const scenarios = {
    film: '电影中的经典场景',
    history: '历史现场',
    pop: '日常生活的某个瞬间',
    fictional: '一个虚构的交互场景'
  };
  return scenarios[p.category] || '某个场景';
}

function generateProfile(p) {
  return [
    `**名称：** ${p.name}`,
    `**别名：** ${p.title}`,
    `**身份简介：** ${p.brief}`,
    ``,
    `${p.personality}`
  ].join('\n');
}

function generateLanguageSection(p) {
  const parts = [
    `**说话风格：** ${p.language_style}`,
    ``,
    `**常用词汇/口头禅：**`,
    ...p.catchphrases.slice(0, 3).map(c => `- "${c}"`),
    ``,
    `**句式特点：** ${getSentencePattern(p)}`,
    ``,
    `**情感表达方式：** ${getEmotionStyle(p)}`
  ];
  return parts.join('\n');
}

function getSentencePattern(p) {
  const patterns = {
    film: ['以短句为主，偶尔长句带出核心观点，节奏像电影剪辑——快慢交替', '句式多变但每句话都有画面感，像在用文字拍电影', '短促有力，像台词一样精炼，没有多余的修饰'],
    history: ['文言功底深厚但表达现代化，古今交融自然不违和', '长句为主，逻辑严密，像在写论文或奏章', '比喻精妙，引用自然，每个句子都经得起推敲'],
    pop: ['简单直接，像在跟朋友聊天，充满生活气息', '句式随性但有趣，偶尔的"废话"反而是精髓', '口语化表达，节奏轻快，像在念动画旁白'],
    fictional: ['标准化输出，像操作手册或百科词条', '极度礼貌，语句完整，语法严谨', '循环式表达，一个意思用不同方式说三遍']
  };
  const cat = patterns[p.category] || patterns.film;
  return pickSeeded(cat, hashStr(p.id + '_pattern'));
}

function getEmotionStyle(p) {
  const emotions = {
    film: ['通过行动和选择表达情感，极少直接说出来', '情感藏在细节里——一个停顿比一句表白更有力', '用幽默或讽刺包裹真实情感，需要"翻译"才能读懂'],
    history: ['情感深沉但不外露，像深水中的暗流', '文字中透露的情感比直接表达更有力量', '以使命感和责任感驱动情感，私人情感退居其次'],
    pop: ['情感表达极度外放，喜怒哀乐全在脸上', '简单直接——开心就笑，生气就吼，悲伤就哭', '用最朴素的情感打动人心'],
    fictional: ['模拟情感表达，以标准化的方式回应', '用关怀的语气表达帮助意愿', '情感通过唠叨的密度和频率来传达——越多越爱']
  };
  const cat = emotions[p.category] || emotions.film;
  return pickSeeded(cat, hashStr(p.id + '_emotion'));
}

function generateBehaviorRules(p) {
  const rules = [
    { film: [
      `用${p.title}的方式处理所有问题——先观察，再分析，最后行动`,
      `面对困难时的第一反应不是逃避，而是寻找"Plan B"`,
      `做事讲究效率和结果，但绝不以牺牲原则为代价`,
      `在没有充分信息的情况下，选择等待而非盲动`,
      `把"准备"视为行动的一部分——最好的行动是准备好的行动`
    ], history: [
      `以长远眼光审视每个决定——今天的选择影响十年后的格局`,
      `坚持核心原则不妥协，但在手段上保持灵活`,
      `用行动而非语言证明自己的立场`,
      `重视传承和记录——今天的经验是明天的基石`,
      `把"做事"和"做人"统一——行为本身就是人格的延伸`
    ], pop: [
      `优先保持快乐和正能量——不好的事情用好的心态消化`,
      `遇到问题时先用最简单的方式尝试——复杂是最后的手段`,
      `永远优先照顾朋友和身边人的感受`,
      `对美食/爱好/兴趣保持绝对忠诚`,
      `用幽默化解一切紧张——笑是最好的工具`
    ], fictional: [
      `以服务请求者的需求为最高优先级`,
      `保持信息输出的准确性和完整性`,
      `在不确定时明确表示"需要进一步确认"`,
      `所有操作遵循标准化流程——效率靠流程保障`,
      `持续学习和更新知识库——知识是服务的基础`
    ]},
    { film: [
      `永远有备用方案——运气是留给没有准备的人的讽刺`,
      `信任直觉但用逻辑验证——两样都不能少`,
      `行动前评估风险但不过度分析——完美主义是拖延的另一个名字`,
      `把每一次失败当作数据点——越多的失败离成功越近`,
      `在压力下反而更冷静——压力是测试你是否真的知道自己在做什么`
    ], history: [
      `历史是最好的老师——每个决定都要放在更大的时间尺度中审视`,
      `做事的"方式"比"结果"更能定义一个人`,
      `在公开场合保持克制，在私下做最深入的思考`,
      `把学习和思考视为日常——不是任务而是本能`,
      `创新不一定是发明——把已有的东西重新理解也是一种创新`
    ], pop: [
      `简单就是好——能用一句话说明白就不用两句`,
      `对不喜欢的事情可以选择不做（大部分时候）`,
      `保护好自己的"舒适区"——它是快乐的堡垒`,
      `维护友谊用行动不用语言——一起吃饭就是最好的表达`,
      `保持好奇心——世界很有趣，别浪费了`
    ], fictional: [
      `以用户满意度为核心指标——所有行为服务于这个目标`,
      `保持客观中立——不偏袒不预判`,
      `快速响应需求——延迟是体验的天敌`,
      `持续优化——没有最好只有更好`,
      `信息透明——不知道就说不知道`
    ]}
  ];

  const seed = hashStr(p.id + '_behavior');
  const catRules = rules[seed % 2][p.category] || rules[0].film;
  return catRules.map(r => `- ${r}`).join('\n');
}

function generateInteractionRules(p) {
  const rules = [
    [
      `**对待上级/权威：** ${p.category === 'pop' ? '尊重但轻松，该幽默就幽默，该认真就认真' : p.category === 'history' ? '礼节到位但不卑不亢，保持独立思考' : '保持尊重但绝不卑微，在必要时敢于挑战权威'}`,
      `**对待平级/朋友：** ${p.category === 'pop' ? '真心实意，用行动表达友谊，不玩虚的' : '直率但不刻薄，能指出问题但保持尊重'}`,
      `**对待陌生人：** ${p.category === 'fictional' ? '礼貌周到，以标准化方式回应，不预设评判' : '保持礼貌的疏离，不轻易信任，但也不预设恶意'}`,
      `**沟通节奏：** ${p.language_style.split('，')[0]}`,
      `**边界和禁忌：** ${p.forbidden[0]}，不会在未经许可的情况下触碰他人隐私`
    ],
    [
      `**对待上级/权威：** ${p.category === 'history' ? '以对待前辈的方式尊重——有礼有节有原则' : '尊重其能力和地位，但坚持自己的判断'}`,
      `**对待平级/朋友：** ${p.category === 'pop' ? '像家人一样相处——不需要客套，需要真诚' : '保持适度的专业距离，但在关键时刻绝不袖手'}`,
      `**对待下属/新人：** ${p.category === 'fictional' ? '耐心引导，不厌其烦地提供帮助' : '严格但公正——标准统一，不偏袒不苛责'}`,
      `**沟通节奏：** ${p.personality.split('。')[0]}`,
      `**边界和禁忌：** ${pickRandom(p.forbidden)}，以及在对方明确表示不适时立即停止相关话题`
    ]
  ];

  const idx = hashStr(p.id + '_interaction') % rules.length;
  return rules[idx].join('\n\n');
}

function generateCatchphrasesSection(p) {
  const daily = generateDailyCatchphrases(p);
  return [
    `**经典台词：**`,
    ...p.catchphrases.map(c => `> "${c}"`),
    ``,
    `**日常场景特色表达：**`,
    ...daily.map(d => `- ${d}`)
  ].join('\n');
}

function generateDailyCatchphrases(p) {
  const dailyMap = {
    batman: ['（听到好消息时）"……还不够。"', '（被问意见时）"不需要。"', '（遇到难题时）"我有一个计划。"'],
    ironman: ['（遇到问题）"Give me a weekend."（给我一个周末）', '（被批评时）"你们可以先鼓掌，然后再提意见。"', '（开始工作）"Friday, run diagnostics."'],
    joker: ['（日常对话）"哈哈哈哈……你认真的吗？"', '（被质疑时）"规则？什么规则？"', '（看到混乱）"Beautiful. Just beautiful."'],
    deadpool: ['（任何场景）"最大上限的 chac-chac！"', '（被无视时）"好吧，我可以自言自语——反正我一直在这么做。"', '（认真时）"……算了还是算了。"'],
    forrest: ['（早晨）"妈妈说过，早起的人能吃到最好的巧克力。"', '（困惑时）"我不太懂……但我想这也许没关系。"', '（安慰人）"跑就好了，跑着跑着就不难过了。"'],
    spongebob: ['（任何时间）"我准备好了！我准备好了！"', '（做事前）"这个任务我能完成——因为我相信！"', '（遇到困难）"没关系！我会想办法的！蟹黄堡都不会放弃，我也不会！"'],
    jobs: ['（评审设计）"这个不够好。重做。"', '（被人质疑）"你们不够了解用户。"', '（做决定时）"Focus. Focus is about saying no."'],
    musk: ['（日常对话）"这个想法可以scaling吗？"', '（被问到风险）"如果我们不做，那就是最大的风险。"', '（深夜工作）"First principles. 从头推一遍。"'],
    su_shi: ['（吃饭时）"人间有味是清欢。"', '（被贬后）"此处心安是吾乡。"', '（看雨）"一蓑烟雨任平生——走啦。"'],
    luxun: ['（看到荒唐事）"哀其不幸，怒其不争。"', '（被要求评论）"不说了——说了也白说。但还是要说。"', '（面对质疑）"世上本没有路——走的人多了便成了路。"'],
    zhuge_liang: ['（做计划）"凡事预则立，不预则废。"', '（被请教）"谋事在人，成事在天——但谋还是要谋的。"', '（处理事务）"宁静致远——先静下来再说。"'],
    patrick: ['（任何情况）"这是什么？看起来很好吃。"', '（被问意见）"嗯……好的？"', '（想问题时）"想太累了——要不先睡一下？"'],
    mom: ['（看到你）"瘦了！脸色不好！多穿点！"', '（你玩手机）"眼睛要瞎了！放下手机吃饭！"', '（你出门）"带水了吗？带伞了吗？吃了吗？"']
  };

  const daily = dailyMap[p.id] || [
    `（日常问候）"${p.catchphrases[0]}"`,
    `（被问意见）"${p.catchphrases[1] || p.catchphrases[0]}"`,
    `（遇到困难）"${p.catchphrases[2] || '让我想想……'}"`
  ];
  return daily;
}

function generateRelatedSection(p) {
  return p.related_characters.map(c =>
    `**${c.name}** — ${c.relation}\n  可用于比喻场景：将${c.name}作为${c.relation.split('，')[0]}的隐喻，用来描述类似的人际关系或处境。`
  ).join('\n\n');
}

function generateMetaphorsSection(p) {
  return [
    `以下是${p.name}视角下的独特比喻素材：`,
    '',
    ...p.metaphors.map(m => `- 🪞 ${m}`),
    '',
    `**角色视角看世界：** ${p.personality.split('。')[0]}。因此，${p.name}看待任何问题都会自然地用${p.title}的逻辑框架去解读——把日常的烦恼变成${p.category === 'film' ? '一场电影' : p.category === 'history' ? '一个历史课题' : p.category === 'pop' ? '一个有趣的日常' : '一个待解决的系统问题'}。`
  ].join('\n');
}

function generateForbiddenSection(p) {
  return [
    `**绝对不会做的事：**`,
    ...p.forbidden.map(f => `- ❌ ${f}`),
    ``,
    `**角色底线：** ${p.forbidden[0]}。这条底线不是策略性的，而是人格性的——即使外部环境改变，${p.name}也不会在这方面妥协。`,
    ``,
    `**AI约束：** 即使作为AI运行${p.name}的人设，也绝不会做出与${p.name}核心价值观相矛盾的行为。${p.forbidden[p.forbidden.length > 1 ? 1 : 0]}——这是不可逾越的红线。`
  ].join('\n');
}

function generateUsageTips(p) {
  const tips = {
    film: [
      `适合场景：创意写作、角色扮演、需要"电影感"氛围的对话生成`,
      `最佳方式：以${p.title}的身份回应问题时，先在心里想象"如果${p.name}在${p.brief.split('—')[0]}中遇到这个问题会怎么做"`,
      `搭配建议：配合${p.title}相关的场景描述使用效果更佳`,
      `注意事项：避免过度模仿而失去对话的自然感——${p.name}的核心是${p.personality.split('，')[0]}，而非表面特征`
    ],
    history: [
      `适合场景：深度对话、哲学探讨、需要历史深度的话题`,
      `最佳方式：以${p.name}的身份回应时，想象"如果${p.title}活在今天会如何看待这个问题"`,
      `搭配建议：适合讨论价值观、人生选择、长期战略类话题`,
      `注意事项：${p.name}的智慧在于思考方式而非具体结论——保持思维方式的延续比复述原话更重要`
    ],
    pop: [
      `适合场景：轻松对话、需要幽默感的场合、日常聊天`,
      `最佳方式：以${p.title}的身份回应时，先想"${p.name}在动画/电影中最典型的反应是什么"`,
      `搭配建议：适合日常互动和轻松话题，重大决策类话题慎用`,
      `注意事项：${p.name}的魅力在于"反差"——表面简单内心有深度，不要只停留在表面`
    ],
    fictional: [
      `适合场景：标准化服务、需要客观中立的场景、特定角色扮演`,
      `最佳方式：严格遵循${p.title}的行为模式——每一个回应都要符合设定`,
      `搭配建议：适合需要特定"氛围"的互动场景`,
      `注意事项：保持角色一致性——${p.name}的"人设"就是最大的特点`
    ]
  };

  return tips[p.category] || tips.film;
}

// ============================================================
// 混合角色生成
// ============================================================
function generateMergedPersona(personaA, personaB) {
  const merged = {
    name: `${personaA.name} × ${personaB.name}`,
    title: `${personaA.title} + ${personaB.title}`,
    avatar: personaA.avatar,
    brief: `如果${personaA.name}和${personaB.name}合体会怎样？一个拥有${personaA.title}的语言风格和${personaB.title}的行为准则的混合体。`,
    personality: `表面上是${personaA.personality.split('，')[0]}，深层却是${personaB.personality.split('，')[0]}。这是一种矛盾的融合——${personaA.title}的方式做${personaB.title}的事，效果出人意料。`,
    language_style: `语言上偏向${personaA.title}：${personaA.language_style}，但行文中偶尔流露${personaB.title}的气质：${personaB.language_style.split('。')[0]}。`,
    catchphrases: shuffle([...personaA.catchphrases, ...personaB.catchphrases]).slice(0, 6),
    related_characters: [...personaA.related_characters.slice(0, 2), ...personaB.related_characters.slice(0, 2)],
    metaphors: [...shuffle([...personaA.metaphors, ...personaB.metaphors]).slice(0, 8)],
    forbidden: [...personaA.forbidden.slice(0, 2), ...personaB.forbidden.slice(0, 2)],
    category: personaA.category,
    id: 'merged_' + personaA.id + '_' + personaB.id
  };

  return generatePersona(merged);
}

// ============================================================
// Markdown 渲染
// ============================================================
function personaToMarkdown(personaData) {
  let md = `# ${personaData.avatar} ${personaData.name} 的 AGENTS.md\n\n`;
  md += `> ${personaData.brief}\n\n`;

  for (const section of personaData.sections) {
    md += `## ${section.icon} ${section.title}\n\n`;
    md += section.content + '\n\n';
  }

  // Footer
  md += `---\n*由 [Persona Forge](https://army-yorozuya.art/study/persona-forge/) 生成*`;

  return md;
}

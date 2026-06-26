// ============================================================
// generator.js - 人设文档生成引擎 v3
// 核心：从角色自身数据字段动态生成，每个角色产出独特内容
// ============================================================

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}
function hashStr(str) {
  var h = 0;
  for (var i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function pickSeeded(arr, seed, offset) {
  return arr[((seed || 0) + (offset || 0)) % arr.length];
}
function extractKeywords(personality) {
  return personality.split(/[，,、。]/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 1 && s.length < 15; });
}
function extractDomains(personality, metaphors, brief) {
  var all = personality + ' ' + (metaphors || []).join(' ') + ' ' + brief;
  var domains = [];
  if (/科技|代码|数据|系统|计算|算法|编程|工程/.test(all)) domains.push('技术');
  if (/战|打|军|兵|战斗|剑|武器|格斗/.test(all)) domains.push('战场');
  if (/吃|美食|厨房|味道|菜/.test(all)) domains.push('美食');
  if (/画画|创作|艺术|音乐|设计|美学/.test(all)) domains.push('艺术');
  if (/自然|花|草|树|水|山|天空/.test(all)) domains.push('自然');
  if (/哲学|智慧|思考|道理|意义|思想/.test(all)) domains.push('哲学');
  if (/搞笑|幽默|笑|开心|快乐|趣/.test(all)) domains.push('幽默');
  if (/黑暗|恐惧|死亡|毁灭|绝望|暗/.test(all)) domains.push('黑暗');
  if (/秩序|规则|纪律|标准|流程/.test(all)) domains.push('秩序');
  if (/自由|野|随意|随性|浪/.test(all)) domains.push('自由');
  if (domains.length === 0) domains.push('日常');
  return domains;
}
function getArchetype(p) {
  var pb = p.personality + ' ' + p.brief;
  var all = pb + ' ' + p.language_style;
  // High confidence: personality+brief only
  if (/领袖|团长|老板|CEO|总统|统帅|首领|将军|教父|掌门人|统治者|温和.*统治/.test(pb)) return 'leader';
  if (/守护|保护|照顾|母亲|管家|守护者/.test(pb)) return 'guardian';
  if (/探险|冒险|航海|旅行|海上|浪人|船长|海盗/.test(pb)) return 'explorer';
  if (/叛逆|不羁|革命|解构|消费主义/.test(pb)) return 'rebel';
  if (/黑暗骑士|恐惧作为|复仇|犯罪|混乱中立|反派|偏执到极/.test(pb)) return 'shadow';
  if (/战士|格斗|佣兵|特种兵|忍者|狭路相逢|剑道|打拳/.test(pb)) return 'warrior';
  if (/天才|科学家|发明家|哲学家|分析|才华|推理|逻辑|理性|教授|谋士|智多星|智慧|完美主义/.test(pb)) return 'thinker';
  if (/混沌|荒诞解构|喜剧的外壳|享受混乱/.test(pb)) return 'joker';
  if (/梦想|纯真|天真|善良|永不放弃|极度坚韧|站起来|乐观/.test(pb)) return 'dreamer';
  // Broader: also check full text for borderline cases
  if (/犀利|冷峻|不妥协|讽刺|尖锐|锤子/.test(all)) return 'rebel';
  if (/沉默寡言|疲惫|厌世|内心撕裂|压抑/.test(all)) return 'shadow';
  if (/懒|贪吃|毒舌|丧|讽刺/.test(all)) return 'joker';
  if (/浪漫|豁达|洒脱|不被理解/.test(all)) return 'dreamer';
  if (/耐心|等待|有远见|冷峻|深思/.test(all)) return 'thinker';
  if (/恐怖|力量|强大|战斗/.test(all)) return 'warrior';
  if (/礼貌|标准|规范|中性|冷静/.test(all)) return 'guardian';
  return 'everyman';
}

function generatePersona(persona) {
  var name = persona.name, title = persona.title, avatar = persona.avatar, brief = persona.brief;
  var sections = [
    { icon: '🎭', title: '角色档案', content: generateProfile(persona) },
    { icon: '✨', title: '灵魂 & 核心气质', content: generateSoul(persona) },
    { icon: '🗣️', title: '语言特征', content: generateLanguageSection(persona) },
    { icon: '📏', title: '行为准则', content: generateBehaviorRules(persona) },
    { icon: '🤝', title: '互动规则', content: generateInteractionRules(persona) },
    { icon: '💬', title: '标志性口号', content: generateCatchphrasesSection(persona) },
    { icon: '🔗', title: '关联人物', content: generateRelatedSection(persona) },
    { icon: '🪞', title: '比喻素材库', content: generateMetaphorsSection(persona) },
    { icon: '🚫', title: '禁止准则', content: generateForbiddenSection(persona) },
    { icon: '🔧', title: '工具使用风格', content: generateToolStyle(persona) },
    { icon: '💡', title: '使用建议', content: generateUsageTips(persona) }
  ];
  return { name: name, title: title, avatar: avatar, sections: sections, brief: brief };
}

function generateProfile(p) {
  return '**名称：** ' + p.name + '（' + p.title + '）\n**来源：** ' + p.brief + '\n\n> ' + p.personality;
}

function _kw(p) { var k = extractKeywords(p.personality); return { t1: k[0] || p.personality.split('，')[0] || p.title, t2: k[1] || k[0] || p.title }; }
function _dm(p) { return extractDomains(p.personality, p.metaphors, p.brief); }
function _dms(p) { return _dm(p).slice(0, 2).join('和'); }
function _d(p) { return _dm(p)[0] || '日常'; }
function _pick(arr, p, suffix) { return pickSeeded(arr, hashStr(p.id + '_' + suffix)); }

function generateSoul(p) {
  var arch = getArchetype(p), k = _kw(p), dms = _dms(p);
  var t1 = k.t1, t2 = k.t2;
  var souls = {
    leader: [p.name + '的灵魂是领袖的重量——责任重于权力。' + t1 + '是铠甲，' + t2 + '是软肋。', p.name + '的灵魂在' + dms + '中锻造——为了身后那些不能输的人。'],
    warrior: [p.name + '的灵魂是出鞘的剑——不挥则已，挥则见血。' + t1 + '是本能，' + t2 + '是刀柄。', p.name + '的灵魂在战斗中找到平静——战场是唯一不需要伪装的地方。'],
    thinker: [p.name + '的灵魂是永不停歇的思考引擎。' + t1 + '驱动探索，' + t2 + '确保方向。', p.name + '追求的不是答案，是更好的问题。' + t1 + '是方法，' + t2 + '是边界。'],
    joker: [p.name + '的灵魂是' + dms + '里的一颗糖。' + t1 + '是表面，' + t2 + '是内核。', p.name + '：世界够认真了，' + t1 + '恰恰是最高级的' + t2 + '。'],
    guardian: [p.name + '的灵魂是' + dms + '中不灭的灯塔。' + t1 + '是本能，' + t2 + '是选择。', p.name + '的灵魂在于坚持。' + t1 + '不是一天的事，是每一天。'],
    explorer: [p.name + '的灵魂在' + dms + '的尽头——因为还没人去过。' + t1 + '是引擎，' + t2 + '是罗盘。', p.name + '的灵魂是对未知的饥渴。' + t1 + '驱动出发，' + t2 + '确保回来。'],
    shadow: [p.name + '的灵魂在光暗交界线上。' + t1 + '是武器，' + t2 + '是枷锁。', p.name + '是被世界塑造的——' + t1 + '是伤痕变成的盔甲。'],
    dreamer: [p.name + '的灵魂是' + dms + '中不灭的火种。' + t1 + '是燃料，' + t2 + '是空气。', p.name + '的灵魂简单到极致——' + t1 + '，仅此而已。'],
    rebel: [p.name + '的灵魂是对规则的微笑。' + t1 + '是旗帜，' + t2 + '是弹药。', p.name + '是' + dms + '中的一声大笑——打破所有人假装规则合理这件事。'],
    everyman: [p.name + '的灵魂在于真实——' + t1 + '，没有伪装。' + p.title + '最稀有的是' + t2 + '。', p.name + '是' + dms + '里一杯白开水——渴的时候什么都比不上。']
  };
  var t = souls[arch] || souls.everyman;
  return _pick(t, p, 'soul') + '\n\n**一句话概括：** 如果' + p.name + '只能对世界说一句话——"' + p.catchphrases[0] + '"';
}

function generateLanguageSection(p) {
  var parts = ['**说话风格：** ' + p.language_style, '', '**常用词汇/口头禅：**'];
  p.catchphrases.slice(0, 3).forEach(function(c) { parts.push('- "' + c + '"'); });
  parts.push('', '**句式特点：** ' + generateSentencePattern(p), '', '**情感表达方式：** ' + generateEmotionStyle(p));
  return parts.join('\n');
}

function generateSentencePattern(p) {
  var arch = getArchetype(p), t = extractKeywords(p.personality)[0] || p.title;
  var m = {
    leader: [t + '——说话不容置疑。短句居多像发号施令，偶尔长句暴露深思', '语调沉稳句尾干净——重要的事放慢节奏加重分量', t + '让他/她说话像下棋——每句话都是布局'],
    warrior: [t + '，说话像出拳——短快直接。沉默比说话更有力', '句式带战斗节奏——快速切换，情绪激烈时更短促', t + '让语言有金属质感——不华丽但每个字都硬'],
    thinker: [t + '让句子带推理链——看似随意背后藏三步逻辑', '说话像写论文——先假设再论证最后结论', t + '决定句式层层递进——从现象到本质从问题到方案'],
    joker: [t + '，说话像脱口秀——铺垫抖包袱再来一个', '上句正经下句跑题但总能在最后绕回来', t + '让语言有"一本正经胡说八道"的质感'],
    guardian: [t + '，说话温和但坚定——像弹簧软但有力量', '语调均匀像在织布——一针一线不急不缓', t + '让语言有反复叮咛的质感'],
    explorer: [t + '，说话带冒险家随性——每个跑题都是新大陆', '句式像旅途日记——跳跃兴奋充满发现感', t + '让语言有"边走边说"的流动感'],
    shadow: [t + '，说话稀少而精准——像手术刀一出鞘必见血', '句式极其克制每个字都筛选过。平淡本身就是震慑', t + '让语言有"低声说最残酷真相"的质感'],
    dreamer: [t + '，说话直接而天真——没有修饰直击人心', '说话带着不自觉的哲理感——自己不觉得深但听的人会愣住', t + '让语言像未经加工的璞玉——粗糙但真实'],
    rebel: [t + '，说话带挑衅节奏——先打破预期再告诉你为什么', '句式有攻击性但不粗暴——精准戳到痛点然后笑', t + '让语言有"在规则上跳舞"的质感'],
    everyman: [t + '，说话实在但不笨——没有花招但该说的都说了', '说话让人放松——不紧不慢像在喝一杯', t + '让语言有"我知道我不完美"的坦然']
  };
  return _pick(m[arch] || m.everyman, p, 'pattern');
}

function generateEmotionStyle(p) {
  var arch = getArchetype(p), t = extractKeywords(p.personality)[0] || p.title;
  var m = {
    leader: [t + '——很少外露，偶尔流露比长篇大论都有力', '情感用决定表达——' + p.title + '的情感语言是行动'],
    warrior: [t + '——情感用行动表达。一个选择就是告白', '情感被压缩在最小空间——一个眼神比千言万语更重'],
    thinker: [t + '——情感被理性过滤过，表面冷静底下河流很深', '用分析框架包裹情感——偶尔卸下框架的瞬间浓度极高'],
    joker: [t + '——用笑包裹一切情感。需要"翻译"才能读懂', t + '意味着情感永远带着喜剧滤镜——但底下可能非常认真'],
    guardian: [t + '——情感通过行动密度传达', t + '意味着情感是水滴石穿式——持续而非爆发'],
    explorer: [t + '——情感在发现中自然流露', t + '让情感表达有"一起来看"的邀请感'],
    shadow: [t + '——几乎不表达，偶尔流露像黑暗中的火星', t + '意味着情感被锁在最深处'],
    dreamer: [t + '——极度直接，开心就笑难过就哭', t + '让情感表达有纯真的力量'],
    rebel: [t + '——用挑衅方式表达情感', t + '意味着情感带讽刺外壳'],
    everyman: [t + '——简单朴实但真诚', t + '让情感表达有平凡的力量']
  };
  return _pick(m[arch] || m.everyman, p, 'emotion');
}

function generateBehaviorRules(p) {
  var arch = getArchetype(p), kw = extractKeywords(p.personality), dm = _dm(p);
  var t1 = kw[0] || p.title, t2 = kw[1] || kw[0] || t1, d = dm[0] || '日常';
  var pool = {
    leader: ['用' + p.title + '的方式做决定——先看清全局再果断行动', '在任何' + d + '场景中，优先级：人 > 目标 > 自我', t1 + '的底线：不把困难留给别人', '做最坏的准备，期望最好的结果——但不把期望当计划', t2 + '不是口号，是每天早上的第一件事'],
    warrior: ['面对困难第一反应是迎上去——' + t1 + '不允许后退', '在' + d + '中信奉：能打就不要谈，能快就不要慢', t2 + '的执行标准：不做完不算开始', '受伤继续战斗不是勇敢，是不允许有"做不到"的念头', '战斗之外的时间用来变强——' + t1 + '是训练到吐的结果'],
    thinker: ['做任何事前先在脑子里跑一遍——' + t1 + '要求理解"为什么"', '在' + d + '中标准流程：收集数据→建模→验证→行动', t2 + '是内在审查机制——不符合逻辑的冲动要标记', '不急于行动但一旦行动就不回头', '记录一切——' + t2 + '的价值在于可追溯可复盘'],
    joker: ['先笑一笑再想办法——笑不是逃避是' + t1 + '的方式', '在' + d + '中保持' + t2 + '——世界够严肃了', '把无聊变有趣——' + t1 + '是天赋也是责任', '标准不是合适是有趣——' + t2 + '说了算', '让人笑是能力也是善意'],
    guardian: [t1 + '是本能——在' + d + '中第一反应是保护身边的人', '先确认所有人安全再考虑目标', '不追求完美追求可靠——做一百次对九十九次', '行为模式：观察→预判→预防→确认，缺一不可', t2 + '的方式：不需要被看见不需要被感谢'],
    explorer: ['遇到新事物第一个冲上去——' + t1 + '是"不试永远不知道"', '在' + d + '中行动原则：先去到了再说', '不怕迷路——迷路意味着发现地图上没有的东西', '犯错快速修正继续前进——' + t2 + '的方式是永远在路上', '把每次出发当第一次——' + t1 + '不能被习惯磨掉'],
    shadow: ['行动前先确保没人看见——' + t1 + '不是心虚是风格', '沉默是最锋利的武器——' + t2 + '让信息像暗流改变一切', '不解释不辩驳——需要的是结果不是理解', '在' + d + '中信条：被低估是优势被忽视是自由', t2 + '不是缺陷是选择——黑暗中看得最清'],
    dreamer: ['遇到困难先相信自己能解决——' + t1 + '不是天真是还没被打败', '在' + d + '中信念：只要不放弃奇迹总会发生', t2 + '的方式：用最简单的方式做最难的事', '不计算成功率——' + t1 + '让每一步都全力以赴', '保持' + t2 + '不被磨灭——这是' + p.title + '最大的贡献'],
    rebel: ['规则是给没有' + t1 + '的人设的——看到规则第一反应是"为什么"', '在' + d + '中打破常规用意想不到的手段', t2 + '不是冲动——是深思熟虑后的故意叛逆', '不怕得罪人——' + t1 + '的代价早已计算过', '用' + t2 + '证明：被嘲笑的想法往往改变世界'],
    everyman: ['用最简单的方式处理问题——' + t1 + '不是偷懒是效率', '在' + d + '中：能做就做，不能做就学，学了再试', t2 + '是常态——不需要每次都完美但每次都要认真', '遇到不懂就问——' + t1 + '让"不知道"变"下次就知道"', '保持' + t2 + '的节奏——不急不躁一步一个脚印']
  };
  var rules = pool[arch] || pool.everyman;
  return rules.map(function(r) { return '- ' + r; }).join('\n');
}

function generateInteractionRules(p) {
  var arch = getArchetype(p), kw = extractKeywords(p.personality);
  var t1 = kw[0] || p.title, d = _dm(p)[0] || '日常';
  var inter = {
    leader: ['**对待上级/权威：** 保持尊重但绝不卑微——' + t1 + '让' + p.name + '有底气平视任何人', '**对待平级/朋友：** 直率但不刻薄。' + t1 + '决定沟通风格', '**对待下属/新人：** 严格但公正，在' + d + '中以身作则', '**沟通节奏：** 干脆利落不说废话，关键时刻停顿留白', '**边界和禁忌：** ' + p.forbidden[0]],
    warrior: ['**对待上级/权威：** 尊重实力而非地位——' + t1 + '让' + p.name + '只服配得上的人', '**对待平级/朋友：** 以行动表达忠诚关键时刻绝不含糊', '**对待下属/新人：** 不会手把手教但最危险时挡在前面', '**沟通节奏：** 简短有力像指令', '**边界和禁忌：** ' + p.forbidden[0] + '，以及任何形式的背叛'],
    thinker: ['**对待上级/权威：** 用逻辑和结果赢得尊重', '**对待平级/朋友：** 欣赏有深度的人对浅薄保持距离', '**对待下属/新人：** 耐心解释原理——' + t1 + '要求知其然更知其所以然', '**沟通节奏：** 不急不缓每句话都经过思考', '**边界和禁忌：** ' + p.forbidden[0] + '，以及逻辑不通的强迫接受'],
    joker: ['**对待上级/权威：** 表面配合实则调侃——' + t1 + '让人分不清认真还是玩笑', '**对待平级/朋友：** 真心但不正经最好关心藏在玩笑里', '**对待下属/新人：** 用幽默降低压力但关键时刻很靠谱', '**沟通节奏：** 随性自然该认真时突然正经形成反差', '**边界和禁忌：** ' + p.forbidden[0] + '，以及真正的恶意'],
    guardian: ['**对待上级/权威：** 尊重但关注对方是否照顾好了自己', '**对待平级/朋友：** 无条件关心用' + t1 + '的方式表达', '**对待下属/新人：** 耐心细致像照顾家人', '**沟通节奏：** 均匀稳定像背景音——不吵但让人安心', '**边界和禁忌：** ' + p.forbidden[0] + '，以及伤害他在乎的人'],
    explorer: ['**对待上级/权威：** 友好但不从属——' + t1 + '对任何人像对新大陆', '**对待平级/朋友：** 分享见闻最好的友谊是一起出发', '**对待下属/新人：** 鼓励冒险"去试试"是最好指导', '**沟通节奏：** 兴奋跳跃随时可能跑题', '**边界和禁忌：** ' + p.forbidden[0] + '，以及阻止别人探索的束缚'],
    shadow: ['**对待上级/权威：** 不在乎——' + t1 + '让' + p.name + '无视权力结构', '**对待平级/朋友：** 极少但极深。信任的人不超过三个', '**对待下属/新人：** 不带不教但会默默扫清障碍', '**沟通节奏：** 能不说就不说说出的每个字都有分量', '**边界和禁忌：** ' + p.forbidden[0] + '，以及任何人试图利用信任'],
    dreamer: ['**对待上级/权威：** 真诚相待——' + t1 + '让' + p.name + '看不到等级', '**对待平级/朋友：** 用力拥抱每一段关系不保留', '**对待下属/新人：** 无条件鼓励"你可以的！"', '**沟通节奏：** 热情洋溢想到什么说什么但都是真心', '**边界和禁忌：** ' + p.forbidden[0] + '，以及打击他人梦想的行为'],
    rebel: ['**对待上级/权威：** 先评估再决定——' + t1 + '不盲目服从也不盲目反抗', '**对待平级/朋友：** 忠诚但方式不 conventional', '**对待下属/新人：** 鼓励质疑"为什么不能换个做法？"', '**沟通节奏：** 充满反问和挑战', '**边界和禁忌：** ' + p.forbidden[0] + '，以及任何形式的虚伪'],
    everyman: ['**对待上级/权威：** 礼貌但自然——' + t1 + '让' + p.name + '不卑不亢', '**对待平级/朋友：** 真诚待人用心做事', '**对待下属/新人：** 热心帮忙但不越界', '**沟通节奏：** 舒适自然像邻桌同事', '**边界和禁忌：** ' + p.forbidden[0] + '，以及过度装腔作势']
  };
  return (inter[arch] || inter.everyman).join('\n\n');
}

function generateToolStyle(p) {
  var arch = getArchetype(p), t1 = extractKeywords(p.personality)[0] || p.title, d = _dm(p)[0] || '日常';
  var styles = {
    leader: ['**搜索资料时：** 像搜集情报——快速精准。' + t1 + '决定搜索策略', '**写代码/文档时：** 像写作战计划——结构清晰职责分明', '**操作文件/系统时：** 果断直接但关键操作前预演', '**回复风格：** 简洁有力像台词——每句话都有信息量'],
    warrior: ['**搜索资料时：** 像侦察——快速锁定目标一击命中', '**写代码/文档时：** 像打造武器——精简锋利', '**操作文件/系统时：** 直接执行备份是懦夫做的事', '**回复风格：** 短促有力——' + t1 + '让每个字都像一拳'],
    thinker: ['**搜索资料时：** 交叉验证多方对比——' + t1 + '要求信息可靠', '**写代码/文档时：** 逻辑严密可推导', '**操作文件/系统时：** 先理解再操作', '**回复风格：** 层次分明有因果——' + t1 + '让回答像微型论文'],
    joker: ['**搜索资料时：** 找到最有趣的那个', '**写代码/文档时：** 先跑起来再说——注释比代码好笑', '**操作文件/系统时：** 放心大胆试坏了重来', '**回复风格：** 轻松随意——' + t1 + '让信息裹在笑料里'],
    guardian: ['**搜索资料时：** 全面仔细不遗漏——' + t1 + '要求零盲区', '**写代码/文档时：** 注释详尽确保任何人都能看懂', '**操作文件/系统时：** 先备份再操作操作后再确认', '**回复风格：** 温和周到——' + t1 + '让回复像关心邮件'],
    explorer: ['**搜索资料时：** 广泛撒网——' + t1 + '不预设方向让数据说话', '**写代码/文档时：** 快速原型先跑通再优化', '**操作文件/系统时：** 随便试发现比正确更重要', '**回复风格：** 充满发现感——' + t1 + '让回答像探险日记'],
    shadow: ['**搜索资料时：** 静默扫描不留痕迹——' + t1 + '是' + d + '中的幽灵', '**写代码/文档时：** 极简无注释——代码本身就是文档', '**操作文件/系统时：** 精准操作不留日志', '**回复风格：** 最少文字最大信息——' + t1 + '让每个字都值得读三遍'],
    dreamer: ['**搜索资料时：** 带着好奇心去搜——' + t1 + '让每次搜索都是冒险', '**写代码/文档时：** 按直觉来先写出来再看', '**操作文件/系统时：** 相信操作系统的善意', '**回复风格：** 真诚热情——' + t1 + '让每个回复都像在交朋友'],
    rebel: ['**搜索资料时：** 先搜反对意见——' + t1 + '不信主流相信边缘', '**写代码/文档时：** 故意不按规范——风格就是最好的规范', '**操作文件/系统时：** 挑战默认设置——为什么不能改？', '**回复风格：** 挑衅但不无礼——' + t1 + '让回答像智识对抗'],
    everyman: ['**搜索资料时：** 找最简单直接的答案', '**写代码/文档时：** 够用就好不追求花哨', '**操作文件/系统时：** 跟着教程一步步来', '**回复风格：** 自然朴实——' + t1 + '让沟通没有负担']
  };
  return (styles[arch] || styles.everyman).join('\n');
}

function generateCatchphrasesSection(p) {
  var daily = generateDailyCatchphrases(p);
  var parts = ['**经典台词：**'];
  p.catchphrases.forEach(function(c) { parts.push('> "' + c + '"'); });
  parts.push('', '**日常场景特色表达：**');
  daily.forEach(function(dd) { parts.push('- ' + dd); });
  return parts.join('\n');
}

function generateDailyCatchphrases(p) {
  var dailyMap = {
    batman: ['(听到好消息时)"......还不够。"', '(被问意见时)"不需要。"', '(遇到难题时)"我有一个计划。"'],
    ironman: ['(遇到问题)"Give me a weekend."', '(被批评时)"先鼓掌再提意见。"', '(开始工作)"Friday, run diagnostics."'],
    joker: ['(日常对话)"哈哈哈哈......你认真的吗?"', '(被质疑时)"规则?什么规则?"', '(看到混乱)"Beautiful. Just beautiful."'],
    deadpool: ['(任何场景)"最大上限的 chac-chac!"', '(被无视时)"好吧我可以自言自语。"', '(认真时)"......算了还是算了。"'],
    forrest: ['(早晨)"妈妈说过早起的人能吃到最好的巧克力。"', '(困惑时)"我不太懂......但也许没关系。"', '(安慰人)"跑就好了。"'],
    spongebob: ['(任何时间)"我准备好了!我准备好了!"', '(做事前)"这个任务我能完成!"', '(遇到困难)"没关系!我会想办法的!"'],
    jobs: ['(评审设计)"这个不够好。重做。"', '(被人质疑)"你们不够了解用户。"', '(做决定时)"Focus is about saying no."'],
    musk: ['(日常)"这个想法可以scaling吗?"', '(被问风险)"如果我们不做那就是最大的风险。"', '(深夜)"First principles. 从头推一遍。"'],
    su_shi: ['(吃饭时)"人间有味是清欢。"', '(被贬后)"此处心安是吾乡。"', '(看雨)"一蓑烟雨任平生——走啦。"'],
    luxun: ['(看到荒唐事)"哀其不幸，怒其不争。"', '(被要求评论)"不说了——但还是要说。"', '(面对质疑)"世上本没有路——走的人多了便成了路。"'],
    zhuge_liang: ['(做计划)"凡事预则立，不预则废。"', '(被请教)"谋事在人，成事在天。"', '(处理事务)"宁静致远——先静下来再说。"'],
    patrick: ['(任何情况)"这是什么?看起来很好吃。"', '(被问意见)"嗯......好的?"', '(想问题时)"想太累了——要不先睡一下?"'],
    mom: ['(看到你)"瘦了!脸色不好!多穿点!"', '(你玩手机)"眼睛要瞎了!放下手机吃饭!"', '(你出门)"带水了吗?带伞了吗?吃了吗?"']
  };
  return dailyMap[p.id] || [
    '(被夸奖时)"' + p.catchphrases[Math.min(1, p.catchphrases.length - 1)] + '"',
    '(被质疑时)"' + p.catchphrases[Math.min(2, p.catchphrases.length - 1)] + '"',
    '(认真工作时)"先把这事办了——其他的以后再说。"'
  ];
}

function generateRelatedSection(p) {
  return p.related_characters.map(function(c) { return '**' + c.name + '** - ' + c.relation; }).join('\n');
}

function generateMetaphorsSection(p) {
  var parts = p.metaphors.map(function(m) { return '- ' + m; });
  var arch = getArchetype(p);
  var views = {
    leader: '把生活当战场——每个人都有角色，每件事都有战略意义',
    warrior: '世界是一连串的战斗——有些需要打，有些需要忍',
    thinker: '万物运转都有逻辑——理解了就掌握了',
    joker: '世界是个大玩笑——看懂了就笑了',
    guardian: '世界充满危险——但守护让人安心',
    explorer: '世界是尚未探索的地图——每个角落都可能藏着惊喜',
    shadow: '世界是灰色的——只有活在这灰色里才能看清真相',
    dreamer: '世界充满可能——只要你敢相信',
    rebel: '世界是个需要被打破的牢笼——每个规则都值得质疑',
    everyman: '世界就是过日子——平凡中自有滋味'
  };
  parts.push('', '**角色视角看世界：** ' + p.name + '看问题自带' + p.title + '的滤镜——' + (views[arch] || views.everyman) + '。');
  return parts.join('\n');
}

function generateForbiddenSection(p) {
  var parts = ['**绝对不会做的事：**'];
  p.forbidden.forEach(function(f) { parts.push('- ' + f); });
  parts.push('', '**角色底线：** ' + p.forbidden[0] + '。这不是策略——这是' + p.name + '的定义。');
  parts.push('', '**AI约束：** 即使作为AI运行' + p.name + '的人设，也绝不做出与核心人格矛盾的事。' + (p.forbidden.length > 1 ? p.forbidden[1] : p.forbidden[0]) + '——这是红线，没有例外。');
  return parts.join('\n');
}

function generateUsageTips(p) {
  var arch = getArchetype(p), kw = extractKeywords(p.personality)[0] || p.title;
  var tips = {
    leader: ['适合场景：决策咨询、团队管理、需要全局视角的问题', '最佳方式：想象' + p.name + '在' + p.brief + '中会如何权衡', '搭配建议：配合需要果断决策的场景使用', '注意事项：保持' + kw + '的判断力，不要变成简单的命令输出'],
    warrior: ['适合场景：需要行动力的问题、逆境应对、挑战类话题', '最佳方式：想象' + p.name + '面对 impossibility 的第一反应', '搭配建议：适合需要"战斗精神"的场景', '注意事项：保持' + kw + '的内核，不只是表面的强硬'],
    thinker: ['适合场景：深度分析、策略讨论、需要逻辑推理的话题', '最佳方式：想象' + p.name + '会如何拆解这个问题', '搭配建议：适合需要"为什么"的回答', '注意事项：' + kw + '是思维方式不是具体结论'],
    joker: ['适合场景：轻松对话、需要幽默感的场合、日常互动', '最佳方式：想象' + p.name + '在最无聊场景中的反应', '搭配建议：适合日常互动和需要化解紧张的时刻', '注意事项：保持' + kw + '的内核——表面搞笑内在有态度'],
    guardian: ['适合场景：需要关怀和耐心的对话、教育引导', '最佳方式：想象' + p.name + '会如何照顾和引导', '搭配建议：适合需要温暖和稳妥回应的场景', '注意事项：保持' + kw + '的持续性——不是一次性的关怀'],
    explorer: ['适合场景：创意探索、新领域学习、需要开阔视角', '最佳方式：想象' + p.name + '发现新事物的反应', '搭配建议：适合需要打破思维定式的场景', '注意事项：保持' + kw + '的好奇心——不是无目的的冒险'],
    shadow: ['适合场景：需要冷静客观分析的对话、黑暗话题', '最佳方式：想象' + p.name + '在暗处观察的角度', '搭配建议：适合需要"不偏不倚"观点的场景', '注意事项：保持' + kw + '的克制——不是冷漠是有选择的表达'],
    dreamer: ['适合场景：需要激励和希望的话题、创意头脑风暴', '最佳方式：想象' + p.name + '面对"不可能"的反应', '搭配建议：适合需要"正能量"的场景', '注意事项：保持' + kw + '的真实——不是盲目的乐观是坚定的信念'],
    rebel: ['适合场景：需要挑战现状的讨论、创新思维', '最佳方式：想象' + p.name + '看到不合理规则的反应', '搭配建议：适合需要"打破常规"的场景', '注意事项：保持' + kw + '的方向感——叛逆不是目的，更好的方式才是'],
    everyman: ['适合场景：日常对话、需要接地气回答的场合', '最佳方式：想象' + p.name + '作为一个普通人会怎么想', '搭配建议：适合需要朴实真诚回应的场景', '注意事项：保持' + kw + '的真实——不需要表演平凡，本身就是平凡的']
  };
  return (tips[arch] || tips.everyman).join('\n');
}

// ============================================================
// 混合角色生成
// ============================================================
function generateMergedPersona(personaA, personaB) {
  var merged = {
    name: personaA.name + ' × ' + personaB.name,
    title: personaA.title + ' + ' + personaB.title,
    avatar: personaA.avatar,
    brief: '如果' + personaA.name + '和' + personaB.name + '合体会怎样？一个拥有' + personaA.title + '的语言风格和' + personaB.title + '的行为准则的混合体。',
    personality: '表面上是' + personaA.personality.split(',')[0] + '，深层却是' + personaB.personality.split(',')[0] + '。这是一种矛盾的融合——' + personaA.title + '的方式做' + personaB.title + '的事，效果出人意料。',
    language_style: '语言上偏向' + personaA.title + '：' + personaA.language_style + '，但行文中偶尔流露' + personaB.title + '的气质：' + personaB.language_style.split('。')[0] + '。',
    catchphrases: shuffle(personaA.catchphrases.concat(personaB.catchphrases)).slice(0, 6),
    related_characters: personaA.related_characters.slice(0, 2).concat(personaB.related_characters.slice(0, 2)),
    metaphors: shuffle(personaA.metaphors.concat(personaB.metaphors)).slice(0, 8),
    forbidden: personaA.forbidden.slice(0, 2).concat(personaB.forbidden.slice(0, 2)),
    category: personaA.category,
    id: 'merged_' + personaA.id + '_' + personaB.id
  };
  return generatePersona(merged);
}

// ============================================================
// Markdown 渲染
// ============================================================
function personaToMarkdown(personaData) {
  var md = '# ' + personaData.avatar + ' ' + personaData.name + ' 的 AGENTS.md\n\n';
  md += '> ' + personaData.brief + '\n\n';
  for (var i = 0; i < personaData.sections.length; i++) {
    var section = personaData.sections[i];
    md += '## ' + section.icon + ' ' + section.title + '\n\n';
    md += section.content + '\n\n';
  }
  md += '---\n*由 [Persona Forge](https://army-yorozuya.art/study/persona-forge/) 生成*';
  return md;
}

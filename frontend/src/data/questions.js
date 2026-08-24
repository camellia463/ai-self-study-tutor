// === 题库数据 — ability-diagnosis-v3 ===
// 所有题目预定义，正确答案已锁定。
// 知识题来源：真实高中真题，初中等难度。

const QUESTION_BANK = {

  // ========== Layer 1: 学科知识（12题，权重15%） ==========
  knowledge: [
    {
      id: "k-lang-01", dimension: "language", difficulty: "easy",
      question: "下列成语中，书写完全正确的一项是：",
      options: [
        "A. 匪夷所思  首当其冲",
        "B. 礼尚往来  径渭分明",
        "C. 变本加厉  始作俑者",
        "D. 精雕细刻  不刊之论"
      ],
      correctIndex: 2,
      source: "成都彭州中学高一语文分班考试真题"
    },
    {
      id: "k-lang-02", dimension: "language", difficulty: "easy",
      question: "「锲而不舍」中「锲」的正确读音是：",
      options: ["A. qiè", "B. qiē", "C. qì", "D. xuē"],
      correctIndex: 0,
      source: "厦门一中高一入学语文分班考试真题"
    },
    {
      id: "k-lang-03", dimension: "language", difficulty: "medium",
      question: "下列句子中，没有语病的一项是：",
      options: [
        "A. 通过这次学习，使我提高了认识",
        "B. 他的写作水平有了明显的提高",
        "C. 我们讨论并且听取了校长的报告",
        "D. 能否刻苦钻研是提高成绩的关键"
      ],
      correctIndex: 1,
      source: "高一语文基础知识综合测试"
    },
    {
      id: "k-lang-04", dimension: "language", difficulty: "medium",
      question: "「罄竹难书」中「罄」的含义是：",
      options: ["A. 用尽", "B. 敲打", "C. 悬挂", "D. 记录"],
      correctIndex: 0,
      source: "2025年高考成语辨析真题"
    },
    {
      id: "k-math-01", dimension: "math", difficulty: "easy",
      question: "计算 (-2)³ × (-1)² 的结果是：",
      options: ["A. -8", "B. 8", "C. -6", "D. 6"],
      correctIndex: 0,
      source: "高一数学运算能力入学测试卷"
    },
    {
      id: "k-math-02", dimension: "math", difficulty: "medium",
      question: "已知集合 A={x|x²-3x+2=0}，B={x|2x-3>0}，则 A∩B 等于：",
      options: ["A. {1}", "B. {2}", "C. {1,2}", "D. ∅"],
      correctIndex: 1,
      source: "2025年高一数学运算能力测试题"
    },
    {
      id: "k-math-03", dimension: "math", difficulty: "medium",
      question: "已知 sinα = 3/5，α∈(π/2, π)，则 cosα 的值为：",
      options: ["A. 4/5", "B. -4/5", "C. 3/4", "D. -3/4"],
      correctIndex: 1,
      source: "2025年高一数学三角函数测试题"
    },
    {
      id: "k-math-04", dimension: "math", difficulty: "hard",
      question: "若函数 f(x)=x²-2x+3 在 [0,3] 上的最大值为 M，最小值为 m，则 M-m 等于：",
      options: ["A. 1", "B. 2", "C. 3", "D. 4"],
      correctIndex: 3,
      source: "2025年高一数学函数综合测试"
    },
    {
      id: "k-gen-01", dimension: "general", difficulty: "easy",
      question: "光在真空中的传播速度约为：",
      options: ["A. 3×10⁶ m/s", "B. 3×10⁸ m/s", "C. 3×10¹⁰ m/s", "D. 3×10⁴ m/s"],
      correctIndex: 1,
      source: "高中物理常识"
    },
    {
      id: "k-gen-02", dimension: "general", difficulty: "easy",
      question: "中国历史上第一个统一的封建王朝是：",
      options: ["A. 夏朝", "B. 商朝", "C. 秦朝", "D. 汉朝"],
      correctIndex: 2,
      source: "高中历史常识"
    },
    {
      id: "k-gen-03", dimension: "general", difficulty: "medium",
      question: "DNA 的双螺旋结构是由谁发现的？",
      options: ["A. 达尔文和赫胥黎", "B. 沃森和克里克", "C. 孟德尔和摩尔根", "D. 巴斯德和科赫"],
      correctIndex: 1,
      source: "高中生物常识"
    },
    {
      id: "k-gen-04", dimension: "general", difficulty: "hard",
      question: "经济学中「边际效用递减」指的是：",
      options: [
        "A. 商品价格随需求增加而下降",
        "B. 每增加一单位消费，新增的满足感逐渐减少",
        "C. 生产规模扩大导致成本降低",
        "D. 市场占有率随时间逐渐下降"
      ],
      correctIndex: 1,
      source: "高中政治经济学常识"
    }
  ],

  // ========== Layer 2: 认知综合测评（7维27题，权重50%） ==========

  // 2.1 舒尔特方格（程序生成，此处仅定义规则）
  schulte: {
    size: 5,
    rounds: 2,
    scoring: {
      // 完成时间(秒) → 分数
      thresholds: [
        { maxSec: 30, score: 100 },
        { maxSec: 45, score: 80 },
        { maxSec: 60, score: 60 },
        { maxSec: 90, score: 40 },
        { maxSec: Infinity, score: 20 }
      ]
    }
  },

  // 2.2 矩阵推理（4题，SVG程序生成）
  matrix: [
    {
      id: "gf-01", dimension: "gf",
      ruleType: "dot_count", ruleDesc: "每行圆点数量递增：行=行号+1, 列=当前列号。缺失格在第3行第3列，应有6个点。",
      correctIndex: 2,
      params: {
        rows: 3, cols: 3,
        cellFn: "r + c + 1",
        missing: { row: 2, col: 2 },
        expectedDots: 6
      }
    },
    {
      id: "gf-02", dimension: "gf",
      ruleType: "arrow_rotate", ruleDesc: "箭头按列顺时针旋转：第1列↑→↗→→，第2列↑→↗→→，第3列↑→↗→?。缺失格应为→（右箭头）。",
      correctIndex: 4,
      params: {
        rows: 3, cols: 3,
        cellFn: "[↑,↗,→,↓,↙,←,↖][(r + c) % 6]",
        missing: { row: 2, col: 2 },
        expectedArrow: "→"
      }
    },
    {
      id: "gf-03", dimension: "gf",
      ruleType: "shape_morph", ruleDesc: "形状从圆形逐行变为方形，内部线条横竖交替。缺失格为方形+竖条纹。",
      correctIndex: 1,
      params: {
        rows: 3, cols: 3,
        cellFn: "function(r,c){ return { shape: ['circle','rounded','square'][r], lines: c%2===0 ? 'horizontal' : 'vertical' }; }",
        missing: { row: 2, col: 2 },
        expected: { shape: "square", lines: "vertical" }
      }
    },
    {
      id: "gf-04", dimension: "gf",
      ruleType: "overlay", ruleDesc: "左列+中列=右列（重叠消除），缺失格为左+中的XOR结果：左侧半圆。",
      correctIndex: 3,
      params: {
        rows: 3, cols: 3,
        cellFn: "function(r,c){ if(c<2) return r; else return 'xor('+r+','+(r)+')'; }",
        missing: { row: 2, col: 2 },
        expected: "left_half_circle"
      }
    }
  ],

  // 2.3 精灵记忆（4对教学 + 干扰题 + 立即回忆2 + 延迟回忆2）
  sprite: {
    teaching_pairs: [
      { id: "sp-01", name: "布利普", emoji: "🐉", keyword: "dragon" },
      { id: "sp-02", name: "泽菲拉", emoji: "🌸", keyword: "cherry" },
      { id: "sp-03", name: "克拉多", emoji: "🦊", keyword: "fox" },
      { id: "sp-04", name: "沃格雷", emoji: "⚡", keyword: "lightning" }
    ],
    // 确认阶段：展示图片→4选1名字
    confirm_tests: [
      { pair_id: "sp-01", options: ["布利普", "泽菲拉", "克拉多", "沃格雷"], correctIndex: 0 },
      { pair_id: "sp-02", options: ["布利普", "泽菲拉", "克拉多", "沃格雷"], correctIndex: 1 },
      { pair_id: "sp-03", options: ["布利普", "泽菲拉", "克拉多", "沃格雷"], correctIndex: 2 },
      { pair_id: "sp-04", options: ["布利普", "泽菲拉", "克拉多", "沃格雷"], correctIndex: 3 }
    ],
    // 干扰任务（算术题）
    distractors: [
      { question: "15 + 27 = ?", answer: "42" },
      { question: "63 - 29 = ?", answer: "34" },
      { question: "8 × 7 = ?", answer: "56" },
      { question: "144 ÷ 12 = ?", answer: "12" }
    ],
    // 立即回忆：教学后立即测2对
    immediate_test: [
      { pair_id: "sp-01", options: ["布利普", "泽菲拉", "克拉多", "沃格雷"], correctIndex: 0 },
      { pair_id: "sp-03", options: ["布利普", "泽菲拉", "克拉多", "沃格雷"], correctIndex: 2 }
    ],
    // 延迟回忆：间隔干扰后测另2对
    delayed_test: [
      { pair_id: "sp-02", options: ["布利普", "泽菲拉", "克拉多", "沃格雷"], correctIndex: 1 },
      { pair_id: "sp-04", options: ["布利普", "泽菲拉", "克拉多", "沃格雷"], correctIndex: 3 }
    ]
  },

  // 2.4 数字广度（4题：正序2+倒序2）
  digit_span: [
    { id: "gwm-01", type: "forward",  sequence: [3, 7, 2] },
    { id: "gwm-02", type: "forward",  sequence: [5, 1, 9, 4, 6] },
    { id: "gwm-03", type: "backward", sequence: [8, 3, 1, 7] },
    { id: "gwm-04", type: "backward", sequence: [2, 9, 4, 1, 6, 3] }
  ],

  // 2.5 符号匹配（4题，每轮40秒限时）
  symbol_match: [
    {
      id: "gs-01",
      key: { "●": "5", "▲": "3", "■": "8", "◆": "2" },
      sequence: ["●","▲","■","◆","●","◆","▲","■","◆","●","■","▲","●","◆","■","▲"]
    },
    {
      id: "gs-02",
      key: { "★": "7", "♥": "4", "♦": "9", "♠": "1" },
      sequence: ["★","♥","♦","♠","♥","★","♠","♦","★","♠","♥","♦","♠","★","♦","♥"]
    },
    {
      id: "gs-03",
      key: { "○": "6", "□": "3", "△": "9", "☆": "2" },
      sequence: ["○","△","□","☆","△","○","☆","□","○","☆","△","□","☆","○","□","△"]
    },
    {
      id: "gs-04",
      key: { "⬤": "0", "⬥": "4", "⬮": "7", "⬬": "1" },
      sequence: ["⬤","⬥","⬮","⬬","⬥","⬤","⬬","⬮","⬤","⬬","⬥","⬮","⬬","⬤","⬮","⬥"]
    }
  ],

  // 2.6 Stroop 颜色判断（3题，每题3秒限时）
  stroop: [
    {
      id: "cf-01",
      word: "红", inkColor: "#3B82F6", inkName: "蓝",
      options: ["红", "蓝", "绿", "黄"],
      correctIndex: 1
    },
    {
      id: "cf-02",
      word: "绿", inkColor: "#D63031", inkName: "红",
      options: ["红", "蓝", "绿", "黄"],
      correctIndex: 0
    },
    {
      id: "cf-03",
      word: "蓝", inkColor: "#2D8B5E", inkName: "绿",
      options: ["蓝", "绿", "红", "黄"],
      correctIndex: 1
    }
  ],

  // 2.7 类比推理（4题，难度递进）
  analogy: [
    {
      id: "an-01", difficulty: 1,
      stem: "医生 : 医院 :: 老师 : ?",
      options: ["学校", "学生", "教室", "课本"],
      correctIndex: 0,
      relation: "职业-工作场所"
    },
    {
      id: "an-02", difficulty: 2,
      stem: "笔 : 写字 :: 刀 : ?",
      options: ["锋利", "切菜", "厨房", "金属"],
      correctIndex: 1,
      relation: "工具-功能"
    },
    {
      id: "an-03", difficulty: 3,
      stem: "勤奋 : 成功 :: 懒惰 : ?",
      options: ["休息", "快乐", "失败", "安逸"],
      correctIndex: 2,
      relation: "因果反义类比"
    },
    {
      id: "an-04", difficulty: 4,
      stem: "氧气 : 燃烧 :: 催化剂 : ?",
      options: ["反应", "加速", "化学", "实验"],
      correctIndex: 1,
      relation: "必要条件-促进过程"
    }
  ],

  // ========== Layer 3: 性格问卷（20题，权重20%） ==========
  survey: {
    // 学习自主性 6题
    autonomy: [
      { id: "sv-au-01", statement: "没人要求的情况下，我会自己去找东西来学", reversed: false },
      { id: "sv-au-02", statement: "学新东西大多是因为自己感兴趣，而不是因为要考试", reversed: false },
      { id: "sv-au-03", statement: "我有明确的学习目标，知道自己为什么而学", reversed: false },
      { id: "sv-au-04", statement: "作业不检查我就不做，能拖就拖", reversed: true },
      { id: "sv-au-05", statement: "遇到感兴趣的话题，我会花大量课外时间去深入了解", reversed: false },
      { id: "sv-au-06", statement: "没有奖励或惩罚，我很难坚持学习一件事", reversed: true }
    ],
    // 元认知 4题
    metacognition: [
      { id: "sv-mc-01", statement: "我知道自己什么时候真的学懂了，什么时候只是假装会了", reversed: false },
      { id: "sv-mc-02", statement: "学习的时候，我会经常停下来想「这个方法对不对」", reversed: false },
      { id: "sv-mc-03", statement: "考试前我通常说不清楚自己哪些地方还没掌握", reversed: true },
      { id: "sv-mc-04", statement: "我能判断出一道题我做不出来是因为「不会」还是「粗心」", reversed: false }
    ],
    // 学校经历 5题
    school: [
      { id: "sv-sc-01", statement: "我在课堂上经常主动举手回答问题或参与讨论", reversed: false },
      { id: "sv-sc-02", statement: "我觉得学校教的东西大部分是有用的", reversed: false },
      { id: "sv-sc-03", statement: "我在学校有好朋友，课间有人一起玩", reversed: false },
      { id: "sv-sc-04", statement: "我经常因为学校的事感到压力很大", reversed: true },
      { id: "sv-sc-05", statement: "如果可以选，我宁愿在家自学也不想去学校", reversed: true }
    ],
    // 学习卡点 5题
    painPoints: [
      { id: "sv-pp-01", statement: "上课时老师讲的东西我经常听不懂", reversed: true },
      { id: "sv-pp-02", statement: "背过的东西很快就忘，感觉很挫败", reversed: true },
      { id: "sv-pp-03", statement: "题目稍微变一下形式我就不会做了", reversed: true },
      { id: "sv-pp-04", statement: "学习的时候很容易走神，注意力集中不了太久", reversed: true },
      { id: "sv-pp-05", statement: "我不是学不会，只是不想学", reversed: true }
    ]
  },

  // ========== Layer 4: 学科成绩自评（8科） ==========
  grades: {
    subjects: [
      { id: "语文", icon: "📖" },
      { id: "数学", icon: "📐" },
      { id: "英语", icon: "🌍" },
      { id: "物理", icon: "⚛️" },
      { id: "化学", icon: "🧪" },
      { id: "生物", icon: "🧬" },
      { id: "历史", icon: "📜" },
      { id: "地理", icon: "🌏" }
    ],
    levels: ["优秀", "良好", "中等", "较弱", "很差"],
    // 五级 → 分数映射
    levelScores: { "优秀": 100, "良好": 75, "中等": 50, "较弱": 25, "很差": 0 }
  },

  // ========== 角色卡配置 ==========
  roleCard: {
    tiers: [
      { min: 0,  max: 29, level: 1, title: "学徒", icon: "⚔️" },
      { min: 30, max: 44, level: 2, title: "初阶剑士", icon: "⚔️" },
      { min: 45, max: 59, level: 3, title: "中阶剑士", icon: "⚔️" },
      { min: 60, max: 74, level: 4, title: "高阶剑士", icon: "⚔️" },
      { min: 75, max: 89, level: 5, title: "剑豪", icon: "🗡️" },
      { min: 90, max: 100, level: 6, title: "剑圣", icon: "🏆" }
    ],
    talents: [
      { id: "focus", dim: "schulte", label: "定力特化", desc: "能长时间保持高度专注" },
      { id: "logic", dim: "matrix", label: "逻辑推理特化", desc: "天生善于发现规律、推理演绎" },
      { id: "memory", dim: "sprite", label: "记忆吸收特化", desc: "学新东西快，信息保持力强" },
      { id: "bandwidth", dim: "digit", label: "多任务处理特化", desc: "能同时处理多条信息" },
      { id: "speed", dim: "symbol", label: "快速反应特化", desc: "认知操作效率极高" },
      { id: "flexibility", dim: "stroop", label: "灵活应变特化", desc: "规则切换自如，适应力强" },
      { id: "transfer", dim: "analogy", label: "触类旁通特化", desc: "学一会三，举一反三能力强" }
    ],
    mindsets: [
      { id: "sunny", label: "向阳心法", desc: "乐观主动，学习是你自我驱动的探索。适合项目制学习。", conditions: { autonomy: "high", school: "positive" } },
      { id: "bamboo", label: "韧竹心法", desc: "遇难不退，靠坚持和韧性突破。你不需要天赋，你需要的是持续。", conditions: { painPoints: "low", autonomy: "mid" } },
      { id: "stillwater", label: "静水心法", desc: "深思熟虑，对自己学习状态有清晰觉察。你已经在正确的路上。", conditions: { metacognition: "high" } },
      { id: "wind", label: "疾风心法", desc: "冲劲强但容易三分钟热度。需要培养耐力，把爆发力转化为持续力。", conditions: { autonomy: "high", painPoints: "high" } },
      { id: "shadow", label: "暗影心法", desc: "学习动力不足。不需要自责——你需要的是先找到真正让你兴奋的东西。", conditions: { autonomy: "low", school: "negative" } }
    ]
  }
};

// 导出（兼容浏览器全局）
export default QUESTION_BANK;

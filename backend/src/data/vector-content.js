/**
 * E2 教学内容 · 空间向量与立体几何
 * 人教版选择性必修第一册 第一章
 *
 * 结构：每个知识点含
 * - concept: 概念讲解（最小感知）
 * - questions: 题目数组，每题含 options(4个)+hints(3层追问)+method(教法)
 * - methodSwitchTexts: 教法切换话术
 *
 * 错因树：每个错误选项有 hint 字段标注具体错因
 */

module.exports = {
  // ===== 子知识点1：空间向量及其线性运算 =====
  'math-g2-001': {
    knowledgePointId: 'math-g2-001',
    title: '空间向量及其线性运算',
    chapter: '空间向量与立体几何',
    concept: {
      intro: '空间向量是平面向量在三维空间的推广。和平面向量一样，空间向量有大小和方向，可以进行加减和数乘运算。',
      keyPoints: [
        '空间向量用有向线段表示，记作 a, b, c',
        '加减法：首尾相接法则（三角形法则）或平行四边形法则',
        '数乘：λa 表示与 a 同向(λ>0)或反向(λ<0)的向量，长度为|λ|·|a|',
        '共线定理：a ∥ b (b≠0) ⟺ 存在唯一实数 λ，使 a = λb',
        '共面定理：p 与不共线向量 a, b 共面 ⟺ p = xa + yb'
      ],
      svgAnimation: {
        type: 'vector_addition_3d',
        description: '展示三维空间中两个向量的加法：向量a从原点出发沿x轴，向量b从a终点出发沿y轴，和向量a+b从原点指向b终点'
      }
    },
    questions: [
      {
        id: 'q1',
        type: 'base',
        method: 'deduction',
        title: '基础题：向量加减运算',
        content: '已知空间向量 a = (1, 0, 0)，b = (0, 2, 0)，c = (0, 0, 3)。求 a + b - c = ？',
        options: [
          { label: 'A', text: '(1, 2, -3)', isCorrect: true, hint: null },
          { label: 'B', text: '(1, 2, 3)', isCorrect: false, hint: '减法变加法了：-c 的每个分量要取负，c=(0,0,3) 所以 -c=(0,0,-3)，你把 -c 算成了 +c' },
          { label: 'C', text: '(1, -2, 3)', isCorrect: false, hint: 'b的符号搞反了：a + b - c 中 b 是加，b=(0,2,0) 不用变号' },
          { label: 'D', text: '(-1, 2, -3)', isCorrect: false, hint: 'a的符号搞反了：a + b - c 中 a 是加，a=(1,0,0) 不用变号' }
        ],
        hints: [
          '指向概念：向量加减法是逐分量运算，a±b = (a₁±b₁, a₂±b₂, a₃±b₃)',
          '指向步骤：先算 a+b = (1+0, 0+2, 0+0) = (1,2,0)，再算 (1,2,0) - c = (1-0, 2-0, 0-3)',
          '示范留尾：(1,2,0) - (0,0,3) = (1, 2, __)，最后一步你自己填'
        ],
        answer: '(1, 2, -3)',
        explanation: 'a + b - c = (1+0-0, 0+2-0, 0+0-3) = (1, 2, -3)。逐分量加减即可。'
      },
      {
        id: 'q2',
        type: 'common',
        method: 'analogy',
        title: '常考题：共线条件',
        content: '已知 a = (1, 2, 3)，b = (2, 4, 6)。判断 a 与 b 是否共线？若共线，求 λ 使 a = λb。',
        options: [
          { label: 'A', text: '共线，λ = 1/2', isCorrect: true, hint: null },
          { label: 'B', text: '共线，λ = 2', isCorrect: false, hint: '方向反了：题目要求 a = λb，即 a 是 b 的λ倍。a=(1,2,3)，b=(2,4,6)，1/2=2/4=3/6=0.5，所以λ=0.5不是2。你算成了 b = λa' },
          { label: 'C', text: '不共线', isCorrect: false, hint: '检查对应分量比例：1/2 = 2/4 = 3/6 = 0.5，三个比值相等说明共线' },
          { label: 'D', text: '共线，λ = 1', isCorrect: false, hint: 'λ=1意味着a=b，但(1,2,3)≠(2,4,6)，再算算对应分量的比值' }
        ],
        hints: [
          '指向概念：共线定理 a ∥ b ⟺ a = λb，即对应分量成比例',
          '指向步骤：算 a₁/b₁ = 1/2，a₂/b₂ = 2/4 = 1/2，a₃/b₃ = 3/6 = 1/2，三个比值相等',
          '示范留尾：三个比值都是 1/2，所以 λ = __，a = __·b'
        ],
        answer: '共线，λ = 1/2',
        explanation: 'a₁/b₁ = 1/2 = a₂/b₂ = a₃/b₃，对应分量成比例，故共线。a = (1/2)·b，λ = 1/2。'
      },
      {
        id: 'q3',
        type: 'variation',
        method: 'chunking',
        title: '变式题：共面判断',
        content: '已知 a = (1,0,0)，b = (0,1,0)，p = (2,3,0)。判断 p 是否与 a, b 共面？若共面，求 x, y 使 p = xa + yb。',
        options: [
          { label: 'A', text: '共面，x=2, y=3', isCorrect: true, hint: null },
          { label: 'B', text: '共面，x=3, y=2', isCorrect: false, hint: 'x和y搞反了：p = xa + yb，a=(1,0,0)对应x，b=(0,1,0)对应y。p=(2,3,0)所以x=2(p的第一分量)，y=3(p的第二分量)' },
          { label: 'C', text: '不共面', isCorrect: false, hint: 'p的第三分量为0，和a、b一样都在z=0平面内，可以共面' },
          { label: 'D', text: '共面，x=2, y=2', isCorrect: false, hint: 'y算错了：b=(0,1,0)，yb的第二分量=y，p的第二分量=3，所以y=3不是2' }
        ],
        hints: [
          '指向概念：共面定理 p = xa + yb，即p可以写成a和b的线性组合',
          '指向步骤：p = xa + yb = (x·1, x·0, x·0) + (y·0, y·1, y·0) = (x, y, 0)，对比 p=(2,3,0)',
          '示范留尾：(x, y, 0) = (2, 3, 0)，所以 x=__，y=__'
        ],
        answer: '共面，x=2, y=3',
        explanation: 'p = 2a + 3b = 2(1,0,0) + 3(0,1,0) = (2,3,0) ✓。p的z分量为0，与a,b同在z=0平面内。'
      }
    ],
    methodSwitchTexts: {
      analogy: '演绎法没懂？我们换个类比：把向量想象成走路——a往东走1步，b往北走2步，c往上走3步。a+b-c就是东1北2然后往下退3。',
      chunking: '还是不太理解？我们拆开一步步算：先只看第一个数（x方向），再只看第二个数（y方向），最后看第三个数（z方向），每个方向独立算。',
      speedrun: '还不行？快速口诀：加减逐分量，共线看比值，共面找组合。记住这三句就够了。'
    }
  },

  // ===== 子知识点2：空间向量的数量积运算 =====
  'math-g2-002': {
    knowledgePointId: 'math-g2-002',
    title: '空间向量的数量积运算',
    chapter: '空间向量与立体几何',
    concept: {
      intro: '空间向量的数量积（点积）是一个标量（实数），用来衡量两个向量的"接近程度"。是空间几何中求夹角、判断垂直的核心工具。',
      keyPoints: [
        '定义：a·b = |a||b|cosθ（θ为a与b的夹角，0≤θ≤π）',
        '坐标公式：a·b = a₁b₁ + a₂b₂ + a₃b₃',
        '夹角公式：cosθ = (a·b) / (|a|·|b|)',
        '垂直判定：a ⊥ b ⟺ a·b = 0',
        '投影：a在b上的投影 = (a·b) / |b|',
        '|a|² = a·a（自身数量积等于模的平方）'
      ],
      svgAnimation: {
        type: 'dot_product_visual',
        description: '展示两个三维向量的夹角θ，随着θ变化（0°→90°→180°），数量积从正→0→负'
      }
    },
    questions: [
      {
        id: 'q1',
        type: 'base',
        method: 'deduction',
        title: '基础题：数量积坐标计算',
        content: '已知 a = (1, 2, 3)，b = (4, -1, 0)。求 a·b = ？',
        options: [
          { label: 'A', text: '2', isCorrect: true, hint: null },
          { label: 'B', text: '4', isCorrect: false, hint: '只算了第一个分量：1×4=4，但数量积是所有分量乘积之和，要加 2×(-1) 和 3×0' },
          { label: 'C', text: '0', isCorrect: false, hint: '漏了第一个分量：a·b = 1×4 + 2×(-1) + 3×0，你只算了后两项' },
          { label: 'D', text: '6', isCorrect: false, hint: '算成了向量加法：a·b是点积（对应分量相乘再求和），不是 a+b。1×4+2×(-1)+3×0 = 4-2+0 = 2' }
        ],
        hints: [
          '指向概念：数量积坐标公式 a·b = a₁b₁ + a₂b₂ + a₃b₃，对应分量相乘再求和',
          '指向步骤：a·b = 1×4 + 2×(-1) + 3×0 = 4 + (-2) + 0',
          '示范留尾：4 + (-2) + 0 = __，算出来'
        ],
        answer: 'a·b = 2',
        explanation: 'a·b = 1×4 + 2×(-1) + 3×0 = 4 - 2 + 0 = 2。数量积是标量，结果是单个数字。'
      },
      {
        id: 'q2',
        type: 'common',
        method: 'analogy',
        title: '常考题：用数量积求夹角',
        content: '已知 a = (1, 1, 0)，b = (0, 1, 1)。求 a 与 b 的夹角 θ。',
        options: [
          { label: 'A', text: 'θ = 60°', isCorrect: true, hint: null },
          { label: 'B', text: 'θ = 45°', isCorrect: false, hint: 'cosθ算错了：a·b = 0+1+0 = 1，|a|=√2，|b|=√2，cosθ = 1/(√2×√2) = 1/2，不是√2/2。你把|a|或|b|算错了' },
          { label: 'C', text: 'θ = 90°', isCorrect: false, hint: 'a·b≠0：a·b = 1×0 + 1×1 + 0×1 = 1，数量积不为0说明不垂直。θ≠90°' },
          { label: 'D', text: 'θ = 30°', isCorrect: false, hint: 'cosθ算反了：cosθ = (a·b)/(|a||b|) = 1/2，arccos(1/2) = 60°不是30°。30°对应cos=√3/2' }
        ],
        hints: [
          '指向概念：夹角公式 cosθ = (a·b) / (|a|·|b|)，先算数量积再算两个模',
          '指向步骤：①a·b = 0+1+0 = 1  ②|a| = √(1+1+0) = √2  ③|b| = √(0+1+1) = √2  ④cosθ = 1/(√2·√2) = 1/2',
          '示范留尾：cosθ = 1/2，查表得 θ = __°'
        ],
        answer: 'θ = 60°',
        explanation: 'a·b=1, |a|=√2, |b|=√2, cosθ = 1/(√2×√2) = 1/2, θ = 60°。'
      },
      {
        id: 'q3',
        type: 'variation',
        method: 'chunking',
        title: '变式题：用数量积判断垂直',
        content: '已知 a = (1, λ, -1)，b = (2, 1, λ)。当 λ 为何值时 a ⊥ b？',
        options: [
          { label: 'A', text: 'λ = 1', isCorrect: false, hint: '代入检查：λ=1时 a·b = 1×2 + 1×1 + (-1)×1 = 2+1-1 = 2≠0，不垂直' },
          { label: 'B', text: 'λ = -2', isCorrect: false, hint: '算错符号了：a·b = 2 + λ + (-λ) = 2，化简后λ消掉了，a·b恒等于2，不可能等于0' },
          { label: 'C', text: '不存在这样的λ', isCorrect: true, hint: null },
          { label: 'D', text: 'λ = 0', isCorrect: false, hint: '代入检查：λ=0时 a·b = 1×2 + 0×1 + (-1)×0 = 2≠0，不垂直' }
        ],
        hints: [
          '指向概念：垂直条件 a ⊥ b ⟺ a·b = 0',
          '指向步骤：a·b = 1×2 + λ×1 + (-1)×λ = 2 + λ - λ = 2，发现λ被消掉了',
          '示范留尾：a·b = 2 恒成立，不可能等于0，所以__'
        ],
        answer: '不存在这样的λ',
        explanation: 'a·b = 2 + λ - λ = 2（λ被消掉），恒等于2≠0，所以a与b不可能垂直。这是一道"不存在"的题，考察学生对消元的敏感度。'
      }
    ],
    methodSwitchTexts: {
      analogy: '演绎法没懂？换类比：数量积就像两个力的"合力效果"。同方向效果最大（cos0°=1），垂直无效（cos90°=0），反方向最负（cos180°=-1）。',
      chunking: '还是不懂？拆步骤：第一步算a·b（对应乘再求和），第二步算|a|和|b|（各分量平方和开根），第三步相除得cosθ，第四步查表得角度。',
      speedrun: '还不行？口诀：点积逐分量乘加，垂直等于零，夹角除以模乘。'
    }
  },

  // ===== 子知识点3-6：暂不实装完整内容，占位 =====
  'math-g2-003': {
    knowledgePointId: 'math-g2-003',
    title: '空间向量的坐标表示',
    chapter: '空间向量与立体几何',
    concept: { intro: '内容开发中', keyPoints: [], svgAnimation: null },
    questions: [],
    methodSwitchTexts: {},
    _placeholder: true
  },
  'math-g2-004': {
    knowledgePointId: 'math-g2-004',
    title: '用空间向量研究直线位置',
    chapter: '空间向量与立体几何',
    concept: { intro: '内容开发中', keyPoints: [], svgAnimation: null },
    questions: [],
    methodSwitchTexts: {},
    _placeholder: true
  },
  'math-g2-005': {
    knowledgePointId: 'math-g2-005',
    title: '用空间向量研究平面位置',
    chapter: '空间向量与立体几何',
    concept: { intro: '内容开发中', keyPoints: [], svgAnimation: null },
    questions: [],
    methodSwitchTexts: {},
    _placeholder: true
  },
  'math-g2-006': {
    knowledgePointId: 'math-g2-006',
    title: '空间向量求距离与角',
    chapter: '空间向量与立体几何',
    concept: { intro: '内容开发中', keyPoints: [], svgAnimation: null },
    questions: [],
    methodSwitchTexts: {},
    _placeholder: true
  }
};

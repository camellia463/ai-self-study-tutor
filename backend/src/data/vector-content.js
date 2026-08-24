/**
 * E2 教学内容 · 空间向量与立体几何（零基础深度版）
 *
 * 每个知识点含完整学习流：
 *   goal         —— 学完能做什么（零基础也能看懂的目标）
 *   prerequisites—— 前置知识回顾（帮零基础把高一的知识捡起来）
 *   concepts     —— 分层概念讲解（从生活类比 → 数学定义 → 怎么算）
 *   workedExample—— 例题精讲（跟着做，一步步带你算）
 *   questions    —— 练习题（错因标签 + 三层追问 + 教法切换）
 *
 * 内容铁律：每个概念讲清三件事——是什么 / 怎么做 / 怎么写。
 */

module.exports = {
  // ============================================================
  // 子知识点1：空间向量及其线性运算（零基础深度版）
  // ============================================================
  'math-g2-001': {
    knowledgePointId: 'math-g2-001',
    title: '空间向量及其线性运算',
    chapter: '空间向量与立体几何',
    goal: '学完这一节，你能：① 用坐标表示一个空间向量；② 熟练做空间向量的加减法和数乘；③ 判断两个向量是否共线、三个向量是否共面。',

    prerequisites: [
      {
        title: '先捡起来：什么是"向量"',
        content: '向量就是"既有大小、又有方向的量"。生活里到处都是：风（有大小有方向）、力（推你的力气有大有小有方向）、走路（往东走3步）。'
      },
      {
        title: '向量怎么写在纸上',
        content: '用一根带箭头的线段表示：箭头的方向 = 向量的方向，线段的长短 = 向量的大小。记作 a、b、c，或者用起点终点记作 AB（箭头从 A 指向 B）。'
      },
      {
        title: '平面向量会用坐标写',
        content: '高一学过：平面里的向量可以写成 (x, y)，比如 (3, 2) 表示"向右走3、向上走2"。这就是坐标表示法，是今天所有运算的基础。'
      }
    ],

    concepts: [
      {
        title: '① 从平面到空间：多了一根轴',
        content: '平面是二维的，只有 x 轴和 y 轴，向量写成 (x, y)。空间是三维的，多了一根竖着的 z 轴，向量就写成 (x, y, z)。',
        analogy: '想象你在一个房间的墙角：x 是往右走，y 是往前走，z 是往上跳。空间向量 (1, 2, 3) 就是"往右1步、往前2步、往上跳3步"。',
        formula: '空间向量坐标：(x, y, z)，三个数分别对应 x、y、z 三个方向',
        example: '(1, 0, 0) 表示只往 x 方向走 1 个单位；(0, 0, 5) 表示只往上走 5 个单位。'
      },
      {
        title: '② 空间向量怎么加减',
        content: '加减法特别简单：两个向量相加，就是把"相同位置"的数分别相加。相减同理，对应位置相减。',
        analogy: '还是走路：a = (1,2,3) 是"右1、前2、上3"，b = (0,2,0) 是"前2"。a + b 就是把两次走路合起来 = "右1、前4、上3"。',
        formula: 'a + b = (a₁+b₁, a₂+b₂, a₃+b₃)；a - b = (a₁-b₁, a₂-b₂, a₃-b₃)',
        example: 'a=(1,2,3), b=(4,-1,0)：a+b = (1+4, 2-1, 3+0) = (5, 1, 3)'
      },
      {
        title: '③ 数乘：把向量拉长、缩短、反向',
        content: '数乘就是"用同一个数去乘向量的每个分量"。λa 表示把 a 每个数都乘 λ。',
        analogy: 'λ=2 就是把向量拉长一倍（方向不变）；λ=-1 就是把向量调个头（反向）；λ=0.5 就是缩短一半。',
        formula: 'λa = (λ·a₁, λ·a₂, λ·a₃)',
        example: 'a=(1,2,3)，2a=(2,4,6)，-a=(-1,-2,-3)，0.5a=(0.5,1,1.5)'
      },
      {
        title: '④ 共线定理：两个向量方向相同或相反',
        content: '两个向量"共线"，意思是它们的方向相同或相反（在同一条直线上）。判断方法：看能不能用一个数 λ，让 a = λb。',
        formula: 'a ∥ b (b≠0) ⟺ 存在唯一实数 λ，使 a = λb，也就是对应分量成比例',
        example: 'a=(1,2,3), b=(2,4,6)：1/2 = 2/4 = 3/6 = 0.5，三个比值相等，所以 a = 0.5b，共线。'
      },
      {
        title: '⑤ 共面定理：三个向量在同一个平面里',
        content: '三个向量"共面"，意思是它们能躺进同一个平面。判断方法：看第三个向量能不能用前两个"拼"出来。',
        formula: 'p 与不共线的 a、b 共面 ⟺ 存在实数 x、y，使 p = xa + yb',
        example: 'a=(1,0,0), b=(0,1,0), p=(2,3,0)：p = 2a + 3b，所以 p 和 a、b 共面。'
      }
    ],

    workedExample: {
      title: '例题：空间向量的加减运算',
      question: '已知 a = (1, 0, 0)，b = (0, 2, 0)，c = (0, 0, 3)。求 a + b - c。',
      steps: [
        { text: '第一步：看清要算什么', detail: '要算 a + b - c，就是"a 加上 b，再减去 c"。' },
        { text: '第二步：先算 a + b', detail: '对应分量相加：a + b = (1+0, 0+2, 0+0) = (1, 2, 0)' },
        { text: '第三步：再减 c', detail: '减 c 就是加 -c。c=(0,0,3)，所以 -c=(0,0,-3)。(1,2,0) + (0,0,-3) = (1, 2, -3)' }
      ],
      answer: 'a + b - c = (1, 2, -3)',
      tip: '关键点：减法就是加相反向量。-c 的每个分量都要取负号，最容易错的就是这里。'
    },

    questions: [
      {
        id: 'q1',
        type: 'base',
        method: 'deduction',
        title: '基础题：向量加减运算',
        content: '已知空间向量 a = (2, 0, 0)，b = (0, 3, 0)，c = (0, 0, 4)。求 a + b - c = ？',
        options: [
          { label: 'A', text: '(2, 3, -4)', isCorrect: true, hint: null },
          { label: 'B', text: '(2, 3, 4)', isCorrect: false, hint: '减法变加法了：-c 的每个分量要取负，c=(0,0,4) 所以 -c=(0,0,-4)，你把 -c 算成了 +c' },
          { label: 'C', text: '(2, -3, 4)', isCorrect: false, hint: 'b 的符号搞反了：a + b - c 中 b 是加，b=(0,3,0) 不用变号' },
          { label: 'D', text: '(-2, 3, -4)', isCorrect: false, hint: 'a 的符号搞反了：a + b - c 中 a 是加，a=(2,0,0) 不用变号' }
        ],
        hints: [
          '指向概念：向量加减法是逐分量运算，a±b = (a₁±b₁, a₂±b₂, a₃±b₃)',
          '指向步骤：先算 a+b = (2+0, 0+3, 0+0) = (2,3,0)，再算 (2,3,0) - c = (2-0, 3-0, 0-4)',
          '示范留尾：(2,3,0) - (0,0,4) = (2, 3, __)，最后一位你自己填'
        ],
        answer: '(2, 3, -4)',
        explanation: 'a + b - c = (2+0-0, 0+3-0, 0+0-4) = (2, 3, -4)。逐分量加减即可，注意 -c 要变号。'
      },
      {
        id: 'q2',
        type: 'common',
        method: 'analogy',
        title: '常考题：共线条件',
        content: '已知 a = (1, 2, 3)，b = (2, 4, 6)。判断 a 与 b 是否共线？若共线，求 λ 使 a = λb。',
        options: [
          { label: 'A', text: '共线，λ = 1/2', isCorrect: true, hint: null },
          { label: 'B', text: '共线，λ = 2', isCorrect: false, hint: '方向反了：题目要 a = λb，即 a 是 b 的 λ 倍。1/2=2/4=3/6=0.5，所以 λ=0.5 不是 2。你算成了 b = λa' },
          { label: 'C', text: '不共线', isCorrect: false, hint: '检查对应分量比例：1/2 = 2/4 = 3/6 = 0.5，三个比值相等说明共线' },
          { label: 'D', text: '共线，λ = 1', isCorrect: false, hint: 'λ=1 意味着 a=b，但 (1,2,3)≠(2,4,6)，再算算对应分量的比值' }
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
        variationType: 'method',
        variationNote: '方法变式：从基础加减运算→共面判断+线性组合分解，同一知识点换解题方法',
        method: 'chunking',
        title: '变式题：共面判断（方法变式）',
        content: '已知 a = (1,0,0)，b = (0,1,0)，p = (2,3,0)。判断 p 是否与 a, b 共面？若共面，求 x, y 使 p = xa + yb。',
        options: [
          { label: 'A', text: '共面，x=2, y=3', isCorrect: true, hint: null },
          { label: 'B', text: '共面，x=3, y=2', isCorrect: false, hint: 'x 和 y 搞反了：p = xa + yb，a=(1,0,0) 对应 x，b=(0,1,0) 对应 y。p=(2,3,0) 所以 x=2，y=3' },
          { label: 'C', text: '不共面', isCorrect: false, hint: 'p 的第三分量为 0，和 a、b 一样都在 z=0 平面内，可以共面' },
          { label: 'D', text: '共面，x=2, y=2', isCorrect: false, hint: 'y 算错了：b=(0,1,0)，yb 的第二分量 = y，p 的第二分量 = 3，所以 y=3 不是 2' }
        ],
        hints: [
          '指向概念：共面定理 p = xa + yb，即 p 可以写成 a 和 b 的线性组合',
          '指向步骤：p = xa + yb = (x·1, x·0, x·0) + (y·0, y·1, y·0) = (x, y, 0)，对比 p=(2,3,0)',
          '示范留尾：(x, y, 0) = (2, 3, 0)，所以 x=__，y=__'
        ],
        answer: '共面，x=2, y=3',
        explanation: 'p = 2a + 3b = 2(1,0,0) + 3(0,1,0) = (2,3,0) ✓。p 的 z 分量为 0，与 a、b 同在 z=0 平面内。'
      }
    ],
    methodSwitchTexts: {
      analogy: '演绎法没懂？换个类比：把向量想象成走路——a 往东走1步，b 往北走2步，c 往上走3步。a+b-c 就是"东1、北2、然后往下退3"。',
      chunking: '还是不理解？拆开一步步算：先只看第一个数（x 方向），再只看第二个数（y 方向），最后看第三个数（z 方向），每个方向独立算。',
      speedrun: '还不行？快速口诀：加减逐分量，共线看比值，共面找组合。记住这三句就够了。'
    }
  },

  // ============================================================
  // 子知识点2：空间向量的数量积运算（深度版）
  // ============================================================
  'math-g2-002': {
    knowledgePointId: 'math-g2-002',
    title: '空间向量的数量积运算',
    chapter: '空间向量与立体几何',
    goal: '学完这一节，你能：① 用坐标算两个向量的数量积；② 用数量积求两个向量的夹角；③ 用数量积判断两个向量是否垂直。',

    prerequisites: [
      {
        title: '先捡起来：向量的"模"',
        content: '向量的模就是它的长度，记作 |a|。坐标 (x,y,z) 的模 = √(x² + y² + z²)。比如 (1,2,2) 的模 = √(1+4+4) = √9 = 3。'
      },
      {
        title: '先捡起来：两个向量夹个角',
        content: '两个向量从同一个起点出发，它们之间有个夹角，记作 θ，范围是 0° 到 180°。同方向 θ=0°，反方向 θ=180°，垂直 θ=90°。'
      }
    ],

    concepts: [
      {
        title: '① 数量积是什么：一个"数"，不是向量',
        content: '数量积（也叫点积）是两个向量算出来的一个"数字"。它衡量两个向量"有多接近"：方向越一致，值越大。',
        analogy: '两个力一起拉一个箱子：方向一致时合力最大，垂直时互不影响（值为0），反方向时互相抵消（值为负）。',
        formula: '坐标公式：a·b = a₁b₁ + a₂b₂ + a₃b₃（对应分量相乘再相加）',
        example: 'a=(1,2,3), b=(4,-1,0)：a·b = 1×4 + 2×(-1) + 3×0 = 4 - 2 + 0 = 2'
      },
      {
        title: '② 用数量积求夹角',
        content: '数量积有两个公式，联立就能求夹角：一个用坐标算，一个用模和夹角算。',
        formula: 'cosθ = (a·b) / (|a|·|b|)，其中 a·b 用坐标算，|a|、|b| 用模的公式算',
        example: 'a=(1,1,0), b=(0,1,1)：a·b=1，|a|=√2，|b|=√2，cosθ = 1/2，θ = 60°'
      },
      {
        title: '③ 用数量积判断垂直',
        content: '两个向量垂直，等价于它们的数量积等于 0。这是全章最重要、考得最多的结论。',
        formula: 'a ⊥ b ⟺ a·b = 0',
        example: 'a=(1,0,0), b=(0,1,0)：a·b = 0+0+0 = 0，所以 a 和 b 垂直。'
      }
    ],

    workedExample: {
      title: '例题：用数量积求夹角',
      question: '已知 a = (1, 1, 0)，b = (0, 1, 1)。求 a 与 b 的夹角 θ。',
      steps: [
        { text: '第一步：用坐标算数量积', detail: 'a·b = 1×0 + 1×1 + 0×1 = 0 + 1 + 0 = 1' },
        { text: '第二步：算两个模', detail: '|a| = √(1²+1²+0²) = √2；|b| = √(0²+1²+1²) = √2' },
        { text: '第三步：套夹角公式', detail: 'cosθ = (a·b)/(|a||b|) = 1/(√2×√2) = 1/2' },
        { text: '第四步：查表得角', detail: 'cosθ = 1/2，对应 θ = 60°（这是必须记住的特殊角）' }
      ],
      answer: 'θ = 60°',
      tip: '特殊角要背熟：cos60°=1/2，cos45°=√2/2，cos30°=√3/2，cos90°=0。'
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
          { label: 'B', text: '4', isCorrect: false, hint: '只算了第一个分量：1×4=4，但数量积是所有分量乘积之和，还要加 2×(-1) 和 3×0' },
          { label: 'C', text: '0', isCorrect: false, hint: '漏了第一个分量：a·b = 1×4 + 2×(-1) + 3×0，你只算了后两项' },
          { label: 'D', text: '6', isCorrect: false, hint: '算成了向量加法：a·b 是点积（对应分量相乘再求和），不是 a+b。1×4+2×(-1)+3×0 = 4-2+0 = 2' }
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
          { label: 'B', text: 'θ = 45°', isCorrect: false, hint: 'cosθ 算错了：a·b = 0+1+0 = 1，|a|=√2，|b|=√2，cosθ = 1/(√2×√2) = 1/2，不是 √2/2。你 |a| 或 |b| 算错了' },
          { label: 'C', text: 'θ = 90°', isCorrect: false, hint: 'a·b≠0：a·b = 1×0 + 1×1 + 0×1 = 1，数量积不为 0 说明不垂直，θ≠90°' },
          { label: 'D', text: 'θ = 30°', isCorrect: false, hint: 'cosθ 算反了：cosθ = (a·b)/(|a||b|) = 1/2，arccos(1/2) = 60° 不是 30°。30° 对应 cos = √3/2' }
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
        variationType: 'method',
        variationNote: '方法变式：从计算数量积→用数量积判断垂直条件(a·b=0)，同一公式换应用方向',
        method: 'chunking',
        title: '变式题：用数量积判断垂直（方法变式）',
        content: '已知 a = (1, λ, -1)，b = (2, 1, λ)。当 λ 为何值时 a ⊥ b？',
        options: [
          { label: 'A', text: 'λ = 1', isCorrect: false, hint: '代入检查：λ=1 时 a·b = 1×2 + 1×1 + (-1)×1 = 2+1-1 = 2≠0，不垂直' },
          { label: 'B', text: 'λ = -2', isCorrect: false, hint: '算错符号了：a·b = 2 + λ + (-λ) = 2，化简后 λ 消掉了，a·b 恒等于 2，不可能等于 0' },
          { label: 'C', text: '不存在这样的 λ', isCorrect: true, hint: null },
          { label: 'D', text: 'λ = 0', isCorrect: false, hint: '代入检查：λ=0 时 a·b = 1×2 + 0×1 + (-1)×0 = 2≠0，不垂直' }
        ],
        hints: [
          '指向概念：垂直条件 a ⊥ b ⟺ a·b = 0',
          '指向步骤：a·b = 1×2 + λ×1 + (-1)×λ = 2 + λ - λ = 2，发现 λ 被消掉了',
          '示范留尾：a·b = 2 恒成立，不可能等于 0，所以__'
        ],
        answer: '不存在这样的 λ',
        explanation: 'a·b = 2 + λ - λ = 2（λ 被消掉），恒等于 2≠0，所以 a 与 b 不可能垂直。这是一道"不存在"的题，考察对消元的敏感度。'
      }
    ],
    methodSwitchTexts: {
      analogy: '演绎法没懂？换类比：数量积就像两个力的"合力效果"。同方向效果最大（cos0°=1），垂直无效（cos90°=0），反方向最负（cos180°=-1）。',
      chunking: '还是不懂？拆步骤：第一步算 a·b（对应乘再求和），第二步算 |a| 和 |b|（各分量平方和开根），第三步相除得 cosθ，第四步查表得角度。',
      speedrun: '还不行？口诀：点积逐分量乘加，垂直等于零，夹角除以模乘。'
    }
  },

  // ============================================================
  // 子知识点3：空间向量的坐标表示（简版但可用）
  // ============================================================
  'math-g2-003': {
    knowledgePointId: 'math-g2-003',
    title: '空间向量的坐标表示',
    chapter: '空间向量与立体几何',
    goal: '学完这一节，你能：① 用起点终点坐标写出向量；② 用坐标求向量的模和两点距离。',
    prerequisites: [
      { title: '先捡起来', content: '空间向量坐标 (x,y,z) 你已经会了，这一节是学会"从两个点的坐标"直接写出向量。' }
    ],
    concepts: [
      {
        title: '① 从两点坐标写向量',
        content: '已知起点 A 和终点 B，向量 AB = B 的坐标 - A 的坐标（终点减起点）。',
        formula: 'AB = (x₂-x₁, y₂-y₁, z₂-z₁)',
        example: 'A(1,2,3), B(4,6,8)：AB = (4-1, 6-2, 8-3) = (3, 4, 5)'
      },
      {
        title: '② 用坐标求模（长度）',
        content: '向量的模就是它的长度，也是两点之间的距离。',
        formula: '|AB| = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]',
        example: 'AB=(3,4,5)：|AB| = √(9+16+25) = √50 = 5√2'
      }
    ],
    workedExample: {
      title: '例题：求两点距离',
      question: '已知 A(1,0,0)，B(0,2,2)。求 |AB|。',
      steps: [
        { text: '第一步：终点减起点', detail: 'AB = B - A = (0-1, 2-0, 2-0) = (-1, 2, 2)' },
        { text: '第二步：套模的公式', detail: '|AB| = √[(-1)² + 2² + 2²] = √(1+4+4) = √9' }
      ],
      answer: '|AB| = 3',
      tip: '求距离的本质就是先写向量，再求模。'
    },
    questions: [
      {
        id: 'q1', type: 'base', method: 'deduction', title: '基础题：两点写向量',
        content: '已知 A(1, 1, 1)，B(3, 2, 4)。求向量 AB。',
        options: [
          { label: 'A', text: '(2, 1, 3)', isCorrect: true, hint: null },
          { label: 'B', text: '(4, 3, 5)', isCorrect: false, hint: '把终点起点相加了。向量是"终点减起点"，不是相加' },
          { label: 'C', text: '(-2, -1, -3)', isCorrect: false, hint: '方向反了：AB = B - A，你算成了 A - B' },
          { label: 'D', text: '(2, 3, 3)', isCorrect: false, hint: 'y 分量算错了：3-1=2，不是 3-0=3。第二个分量是 y₂-y₁ = 2-1 = 1' }
        ],
        hints: [
          '指向概念：AB = 终点坐标 - 起点坐标',
          '指向步骤：AB = (3-1, 2-1, 4-1) = (2, 1, 3)',
          '示范留尾：AB = (3-1, 2-1, 4-1) = (__, __, __)'
        ],
        answer: '(2, 1, 3)',
        explanation: 'AB = B - A = (3-1, 2-1, 4-1) = (2, 1, 3)。'
      },
      {
        id: 'q2', type: 'common', method: 'analogy', title: '常考题：求模',
        content: '已知 AB = (2, 3, 6)。求 |AB|。',
        options: [
          { label: 'A', text: '7', isCorrect: true, hint: null },
          { label: 'B', text: '11', isCorrect: false, hint: '把分量直接相加了。模是"平方和再开根"，不是直接相加' },
          { label: 'C', text: '√61', isCorrect: false, hint: '算错平方了：2²+3²+6² = 4+9+36 = 49，√49 = 7' },
          { label: 'D', text: '√47', isCorrect: false, hint: '漏算或算错一个分量：2²+3²+6² = 49，不是 47' }
        ],
        hints: [
          '指向概念：模的公式 |a| = √(x² + y² + z²)',
          '指向步骤：|AB| = √(2² + 3² + 6²) = √(4 + 9 + 36) = √49',
          '示范留尾：√49 = __'
        ],
        answer: '|AB| = 7',
        explanation: '|AB| = √(4+9+36) = √49 = 7。'
      },
      {
        id: 'q3', type: 'variation', variationType: 'context', variationNote: '情境变式：从纯坐标计算→几何图形判断(三角形分类)，同一公式换应用场景', method: 'chunking', title: '变式题：三点距离（情境变式）',
        content: '已知 A(0,0,0)，B(1,2,2)，C(0,2,2)。判断三角形 ABC 是什么三角形。',
        options: [
          { label: 'A', text: '直角三角形（非等腰）', isCorrect: true, hint: null },
          { label: 'B', text: '等边三角形', isCorrect: false, hint: '三边长度不相等：|AB|=3，|BC|=1，|AC|=2√2，不是等边' },
          { label: 'C', text: '等腰三角形（非直角）', isCorrect: false, hint: '漏了直角：验证 |BC|² + |AC|² = 1+8 = 9 = |AB|²，是直角。且三边 3、1、2√2 互不相等，不是等腰' },
          { label: 'D', text: '等腰直角三角形', isCorrect: false, hint: '虽然直角，但三边 3、1、2√2 互不相等，没有两条边相等，不是等腰' }
        ],
        hints: [
          '指向概念：先算三边长度，再用勾股定理判断直角，最后看有无两边相等',
          '指向步骤：|AB|=3，|BC|=√(1+0+0)=1，|AC|=√(0+4+4)=2√2，发现 |BC|²+|AC|²=1+8=9=|AB|²',
          '示范留尾：|BC|²+|AC|²=|AB|²，说明是__三角形；三边 3、1、2√2 互不相等，所以__'
        ],
        answer: '直角三角形（非等腰）',
        explanation: 'AB=(1,2,2) |AB|=3；BC=(-1,0,0) |BC|=1；AC=(0,2,2) |AC|=2√2。1²+(2√2)²=1+8=9=3²，AB 是斜边，直角。三边 3、1、2√2 互不相等，非等腰。'
      }
    ],
    methodSwitchTexts: {
      analogy: '换类比：两点写向量就是"从 A 点走到 B 点，走了多少"，终点减起点。',
      chunking: '拆步骤：先终点减起点得向量，再平方和开根得长度。',
      speedrun: '口诀：终点减起点，平方和开根。'
    }
  },

  // ============================================================
  // 子知识点4-6：简版（完整可学，内容相对精简）
  // ============================================================
  'math-g2-004': {
    knowledgePointId: 'math-g2-004',
    title: '用空间向量研究直线位置',
    chapter: '空间向量与立体几何',
    goal: '学完这一节，你能：① 用方向向量表示直线；② 判断两条直线平行或垂直。',
    prerequisites: [
      { title: '先捡起来', content: '直线需要一个"方向向量"来描述它的朝向，就像空间向量 (x,y,z) 一样。' }
    ],
    concepts: [
      {
        title: '① 直线的方向向量',
        content: '一条直线的方向，可以用一个与它平行的向量来表示，这个向量叫"方向向量"。',
        formula: '直线 L 的方向向量 d = (a, b, c)，任何与 d 共线的向量都可作为 L 的方向向量',
        example: 'x 轴的方向向量可以是 (1,0,0)，也可以是 (2,0,0)'
      },
      {
        title: '② 两条直线平行 / 垂直',
        content: '两条直线平行，方向向量共线；垂直，方向向量数量积为 0。',
        formula: 'L₁∥L₂ ⟺ d₁∥d₂；L₁⊥L₂ ⟺ d₁·d₂ = 0',
        example: 'd₁=(1,2,3), d₂=(2,4,6) 共线，所以两直线平行'
      }
    ],
    workedExample: {
      title: '例题：判断两直线垂直',
      question: '直线 L₁ 方向向量 (1,1,0)，L₂ 方向向量 (1,-1,0)。判断是否垂直。',
      steps: [
        { text: '第一步：算方向向量数量积', detail: '(1,1,0)·(1,-1,0) = 1×1 + 1×(-1) + 0×0 = 0' },
        { text: '第二步：看结果', detail: '数量积为 0，所以两直线垂直' }
      ],
      answer: '垂直',
      tip: '判断直线垂直 = 判断方向向量垂直 = 数量积为 0。'
    },
    questions: [
      {
        id: 'q1', type: 'base', method: 'deduction', title: '基础题：判断垂直',
        content: '直线 L₁ 方向向量 (1,0,0)，L₂ 方向向量 (0,1,0)。判断是否垂直。',
        options: [
          { label: 'A', text: '垂直', isCorrect: true, hint: null },
          { label: 'B', text: '平行', isCorrect: false, hint: '平行要求方向向量共线，但 (1,0,0) 和 (0,1,0) 不成比例，不共线' },
          { label: 'C', text: '既不平行也不垂直', isCorrect: false, hint: '算数量积：(1,0,0)·(0,1,0) = 0，等于 0 就是垂直' }
        ],
        hints: [
          '指向概念：垂直 ⟺ 方向向量数量积为 0',
          '指向步骤：(1,0,0)·(0,1,0) = 1×0 + 0×1 + 0×0 = 0',
          '示范留尾：数量积 = 0，所以__'
        ],
        answer: '垂直',
        explanation: '(1,0,0)·(0,1,0) = 0，两方向向量垂直，所以两直线垂直。'
      },
      {
        id: 'q2', type: 'common', method: 'analogy', title: '常考题：判断平行',
        content: '直线 L₁ 方向向量 (1,2,3)，L₂ 方向向量 (-2,-4,-6)。判断位置关系。',
        options: [
          { label: 'A', text: '平行', isCorrect: true, hint: null },
          { label: 'B', text: '垂直', isCorrect: false, hint: '算数量积：(1,2,3)·(-2,-4,-6) = -2-8-18 = -28 ≠ 0，不垂直' },
          { label: 'C', text: '既不平行也不垂直', isCorrect: false, hint: '看共线：(-2,-4,-6) = -2×(1,2,3)，方向向量共线，所以平行' }
        ],
        hints: [
          '指向概念：平行 ⟺ 方向向量共线（成比例）',
          '指向步骤：-2/1 = -4/2 = -6/3 = -2，比值相等，共线',
          '示范留尾：比值都相等，所以两直线__'
        ],
        answer: '平行',
        explanation: '(-2,-4,-6) = -2×(1,2,3)，方向向量共线，两直线平行（方向相反）。'
      },
      {
        id: 'q3', type: 'variation', variationType: 'structure', variationNote: '结构变式：从直接计算→逆向求参数(解方程)，从"求值"变为"已知关系反求未知数"', method: 'chunking', title: '变式题：求参数（结构变式·线线垂直）',
        content: '直线 L₁ 方向向量 (1, 1, 1)，L₂ 方向向量 (2, λ, 2)。若 L₁ ⊥ L₂，求 λ。',
        options: [
          { label: 'A', text: 'λ = -4', isCorrect: true, hint: null },
          { label: 'B', text: 'λ = 4', isCorrect: false, hint: '符号错了：1×2 + 1×λ + 1×2 = 0，即 4+λ=0，λ=-4' },
          { label: 'C', text: 'λ = 0', isCorrect: false, hint: '代入：1×2 + 1×0 + 1×2 = 4 ≠ 0，不垂直' },
          { label: 'D', text: 'λ = -2', isCorrect: false, hint: '代入：1×2 + 1×(-2) + 1×2 = 2 ≠ 0，不垂直' }
        ],
        hints: [
          '指向概念：垂直 ⟺ 数量积 = 0',
          '指向步骤：(1,1,1)·(2,λ,2) = 2 + λ + 2 = 0',
          '示范留尾：2 + λ + 2 = 0，所以 λ = __'
        ],
        answer: 'λ = -4',
        explanation: '(1,1,1)·(2,λ,2) = 2 + λ + 2 = 0，λ = -4。'
      }
    ],
    methodSwitchTexts: {
      analogy: '直线方向就是它"朝哪指"，方向向量就是那个箭头。',
      chunking: '拆步骤：先写方向向量，再判断共线（平行）或数量积为0（垂直）。',
      speedrun: '口诀：平行看共线，垂直看零积。'
    }
  },

  'math-g2-005': {
    knowledgePointId: 'math-g2-005',
    title: '用空间向量研究平面位置',
    chapter: '空间向量与立体几何',
    goal: '学完这一节，你能：① 用法向量表示平面；② 判断直线与平面、平面与平面的关系。',
    prerequisites: [
      { title: '先捡起来', content: '平面需要一个"法向量"（垂直于平面的向量）来描述它的朝向。' }
    ],
    concepts: [
      {
        title: '① 平面的法向量',
        content: '垂直于平面的向量叫"法向量"，记作 n。一个平面的法向量能唯一确定这个平面的"朝向"。',
        formula: '平面 α 的法向量 n 满足：n 垂直于平面内任意向量',
        example: '水平面（xy 平面）的法向量是 (0,0,1)，指向正上方'
      },
      {
        title: '② 直线与平面的关系',
        content: '直线平行于平面，方向向量与法向量垂直（数量积为0）；直线垂直于平面，方向向量与法向量平行（共线）。',
        formula: 'L∥平面 ⟺ d·n = 0；L⊥平面 ⟺ d∥n',
        example: 'd=(1,0,0)，n=(0,0,1)：d·n = 0，所以直线平行于平面'
      },
      {
        title: '③ 平面与平面的关系',
        content: '两平面平行，法向量共线；两平面垂直，法向量数量积为 0。',
        formula: 'α∥β ⟺ n₁∥n₂；α⊥β ⟺ n₁·n₂ = 0',
        example: 'n₁=(0,0,1)，n₂=(0,0,2) 共线，两平面平行'
      }
    ],
    workedExample: {
      title: '例题：判断直线与平面平行',
      question: '直线 L 方向向量 d=(1,2,0)，平面法向量 n=(0,0,1)。判断 L 与平面的关系。',
      steps: [
        { text: '第一步：算 d·n', detail: 'd·n = 1×0 + 2×0 + 0×1 = 0' },
        { text: '第二步：看结果', detail: 'd·n = 0，方向向量与法向量垂直，所以直线平行于平面' }
      ],
      answer: '直线平行于平面',
      tip: '直线平行平面 ⟺ 方向向量垂直于法向量。'
    },
    questions: [
      {
        id: 'q1', type: 'base', method: 'deduction', title: '基础题：线面关系',
        content: '直线方向向量 d=(0,0,1)，平面法向量 n=(0,0,1)。判断线面关系。',
        options: [
          { label: 'A', text: '直线垂直于平面', isCorrect: true, hint: null },
          { label: 'B', text: '直线平行于平面', isCorrect: false, hint: '平行要求 d·n=0，但 d·n = 0×0+0×0+1×1 = 1 ≠ 0' },
          { label: 'C', text: '直线在平面内', isCorrect: false, hint: '直线在平面内也要求 d·n=0，这里 d·n=1≠0，不满足' }
        ],
        hints: [
          '指向概念：d∥n 时直线垂直于平面',
          '指向步骤：d=(0,0,1)，n=(0,0,1)，完全平行',
          '示范留尾：d 与 n 共线，所以直线__平面'
        ],
        answer: '直线垂直于平面',
        explanation: 'd=(0,0,1) 与 n=(0,0,1) 共线，方向向量与法向量平行，所以直线垂直于平面。'
      },
      {
        id: 'q2', type: 'common', method: 'analogy', title: '常考题：面面关系',
        content: '平面 α 法向量 n₁=(1,0,0)，平面 β 法向量 n₂=(0,1,0)。判断两平面关系。',
        options: [
          { label: 'A', text: '垂直', isCorrect: true, hint: null },
          { label: 'B', text: '平行', isCorrect: false, hint: '平行要求法向量共线，但 (1,0,0) 和 (0,1,0) 不成比例' },
          { label: 'C', text: '重合', isCorrect: false, hint: '重合也要求法向量共线，这里不共线，不重合' }
        ],
        hints: [
          '指向概念：面面垂直 ⟺ 法向量数量积为 0',
          '指向步骤：n₁·n₂ = 1×0 + 0×1 + 0×0 = 0',
          '示范留尾：法向量数量积 = 0，所以两平面__'
        ],
        answer: '垂直',
        explanation: 'n₁·n₂ = 0，法向量垂直，所以两平面垂直。'
      },
      {
        id: 'q3', type: 'variation', variationType: 'structure', variationNote: '结构变式：从判断线面关系→逆向求参数使平行成立，从"判定"变为"构造"', method: 'chunking', title: '变式题：求参数（结构变式·线面平行）',
        content: '直线方向向量 d=(1, 1, λ)，平面法向量 n=(2, 2, 2)。若直线平行于平面，求 λ。',
        options: [
          { label: 'A', text: 'λ = -2', isCorrect: true, hint: null },
          { label: 'B', text: 'λ = 2', isCorrect: false, hint: '代入：d·n = 1×2 + 1×2 + 2×2 = 8 ≠ 0，不平行' },
          { label: 'C', text: 'λ = 0', isCorrect: false, hint: '代入：d·n = 2 + 2 + 0 = 4 ≠ 0，不平行' },
          { label: 'D', text: 'λ = -1', isCorrect: false, hint: '代入：d·n = 2 + 2 - 2 = 2 ≠ 0，不平行' }
        ],
        hints: [
          '指向概念：直线平行平面 ⟺ d·n = 0',
          '指向步骤：d·n = 1×2 + 1×2 + λ×2 = 4 + 2λ = 0',
          '示范留尾：4 + 2λ = 0，所以 λ = __'
        ],
        answer: 'λ = -2',
        explanation: 'd·n = 2 + 2 + 2λ = 0，4 + 2λ = 0，λ = -2。'
      }
    ],
    methodSwitchTexts: {
      analogy: '法向量就是"插在平面上的一根垂直签子"，描述平面的朝向。',
      chunking: '拆步骤：先找法向量和方向向量，再判断共线或数量积。',
      speedrun: '口诀：线面平行看垂直，线面垂直看共线。'
    }
  },

  'math-g2-006': {
    knowledgePointId: 'math-g2-006',
    title: '空间向量求距离与角',
    chapter: '空间向量与立体几何',
    goal: '学完这一节，你能：① 用向量求点到平面的距离；② 求异面直线所成的角、线面角。',
    prerequisites: [
      { title: '先捡起来', content: '这一节是前几节的综合应用：法向量 + 数量积 + 模，一起用。' }
    ],
    concepts: [
      {
        title: '① 点到平面的距离',
        content: '点到平面的距离，等于"该点与平面上任一点的向量"在法向量上的投影长度。',
        formula: 'd = |AP·n| / |n|，其中 A 是平面内一点，n 是法向量',
        example: 'P(0,0,5)，平面 xy 的法向量 n=(0,0,1)，取 A=(0,0,0)：d = |(0,0,5)·(0,0,1)| / 1 = 5'
      },
      {
        title: '② 异面直线所成的角',
        content: '两条异面直线（不在同一平面）的夹角，等于它们方向向量夹角的余弦的绝对值。',
        formula: 'cosθ = |d₁·d₂| / (|d₁|·|d₂|)',
        example: 'd₁=(1,0,0), d₂=(0,1,0)：cosθ = 0，θ = 90°'
      },
      {
        title: '③ 直线与平面所成的角',
        content: '线面角是直线与它在平面内投影的夹角，等于 90° 减去方向向量与法向量的夹角。',
        formula: 'sinθ = |d·n| / (|d|·|n|)',
        example: 'd=(0,0,1), n=(0,0,1)：sinθ = 1，θ = 90°（直线垂直平面）'
      }
    ],
    workedExample: {
      title: '例题：求点到平面的距离',
      question: '求点 P(0,0,3) 到 xy 平面（法向量 n=(0,0,1)）的距离。',
      steps: [
        { text: '第一步：在平面内取一点', detail: '取原点 A(0,0,0)（它一定在 xy 平面内）' },
        { text: '第二步：写向量 AP', detail: 'AP = P - A = (0,0,3)' },
        { text: '第三步：套距离公式', detail: 'd = |AP·n| / |n| = |(0,0,3)·(0,0,1)| / 1 = 3' }
      ],
      answer: '距离 d = 3',
      tip: '求距离的关键：先在平面内取一点，再算向量在法向量上的投影。'
    },
    questions: [
      {
        id: 'q1', type: 'base', method: 'deduction', title: '基础题：求距离',
        content: '求点 P(0,0,4) 到 xy 平面（法向量 n=(0,0,1)）的距离。',
        options: [
          { label: 'A', text: '4', isCorrect: true, hint: null },
          { label: 'B', text: '0', isCorrect: false, hint: 'P 点 z=4，不在 xy 平面（z=0）上，距离不是 0' },
          { label: 'C', text: '√4 = 2', isCorrect: false, hint: '距离公式 d = |AP·n|/|n|，不是开根号' }
        ],
        hints: [
          '指向概念：d = |AP·n| / |n|',
          '指向步骤：取 A=(0,0,0)，AP=(0,0,4)，d = |(0,0,4)·(0,0,1)| / 1 = 4',
          '示范留尾：|(0,0,4)·(0,0,1)| = __'
        ],
        answer: '距离 = 4',
        explanation: 'd = |AP·n|/|n| = |(0,0,4)·(0,0,1)|/1 = 4。'
      },
      {
        id: 'q2', type: 'common', method: 'analogy', title: '常考题：异面直线夹角',
        content: '异面直线方向向量 d₁=(1,0,0)，d₂=(0,1,0)。求它们所成的角。',
        options: [
          { label: 'A', text: '90°', isCorrect: true, hint: null },
          { label: 'B', text: '0°', isCorrect: false, hint: '0° 意味着平行，但 d₁·d₂=0，不平行' },
          { label: 'C', text: '45°', isCorrect: false, hint: 'cosθ = |d₁·d₂|/(|d₁||d₂|) = 0/1 = 0，θ=90°，不是 45°' }
        ],
        hints: [
          '指向概念：cosθ = |d₁·d₂| / (|d₁|·|d₂|)',
          '指向步骤：d₁·d₂ = 0，|d₁|=1，|d₂|=1，cosθ = 0',
          '示范留尾：cosθ = 0，θ = __°'
        ],
        answer: '90°',
        explanation: 'cosθ = |d₁·d₂|/(|d₁||d₂|) = 0，θ = 90°。'
      },
      {
        id: 'q3', type: 'variation', variationType: 'method', variationNote: '方法变式：从计算夹角→应用线面角公式 sinθ=|d·n|/(|d||n|)，综合运用多个公式', method: 'chunking', title: '变式题：线面角（方法变式）',
        content: '直线方向向量 d=(1, 0, 0)，平面法向量 n=(1, 1, 0)。求直线与平面所成的角。',
        options: [
          { label: 'A', text: '45°', isCorrect: true, hint: null },
          { label: 'B', text: '90°', isCorrect: false, hint: '线面角用 sinθ = |d·n|/(|d||n|)，不是直接看 d·n。sinθ = 1/√2，θ=45°' },
          { label: 'C', text: '30°', isCorrect: false, hint: 'sinθ = |(1,0,0)·(1,1,0)|/(1·√2) = 1/√2，θ=45°，不是 30°' },
          { label: 'D', text: '0°', isCorrect: false, hint: '0° 意味着直线在平面内或平行，但 d·n = 1 ≠ 0，不满足' }
        ],
        hints: [
          '指向概念：线面角 sinθ = |d·n| / (|d|·|n|)',
          '指向步骤：d·n = 1，|d|=1，|n|=√2，sinθ = 1/√2',
          '示范留尾：sinθ = 1/√2，θ = __°'
        ],
        answer: '45°',
        explanation: 'sinθ = |d·n|/(|d||n|) = 1/√2，θ = 45°。'
      }
    ],
    methodSwitchTexts: {
      analogy: '距离就是"这个点在法向量方向上走了多远"。',
      chunking: '拆步骤：先找法向量，再写向量，最后套公式。',
      speedrun: '口诀：距离看投影，线面角用 sin，异面角用 cos。'
    }
  }
};

/**
 * 高一/高二/高三 数学知识点目录
 * 仅目录框架（名称+分值权重+先修关系），不含教学内容
 * has_content=1 的只有"空间向量与立体几何"相关知识点
 */

const KNOWLEDGE_POINTS = [
  // ===== 高一 必修第一册 =====
  { id: 'math-g1-001', name: '集合的概念与表示', grade: 'high1', chapter: '集合与常用逻辑用语', score_weight: 3, prerequisite: [], has_content: 1 },
  { id: 'math-g1-002', name: '集合间的基本关系', grade: 'high1', chapter: '集合与常用逻辑用语', score_weight: 3, prerequisite: ['math-g1-001'], has_content: 1 },
  { id: 'math-g1-003', name: '集合的基本运算', grade: 'high1', chapter: '集合与常用逻辑用语', score_weight: 4, prerequisite: ['math-g1-002'], has_content: 1 },
  { id: 'math-g1-004', name: '充分条件与必要条件', grade: 'high1', chapter: '集合与常用逻辑用语', score_weight: 3, prerequisite: ['math-g1-001'], has_content: 1 },
  { id: 'math-g1-005', name: '全称量词与存在量词', grade: 'high1', chapter: '集合与常用逻辑用语', score_weight: 2, prerequisite: ['math-g1-004'], has_content: 0 },
  { id: 'math-g1-006', name: '等式性质与不等式性质', grade: 'high1', chapter: '一元二次函数方程不等式', score_weight: 4, prerequisite: [], has_content: 1 },
  { id: 'math-g1-007', name: '基本不等式', grade: 'high1', chapter: '一元二次函数方程不等式', score_weight: 5, prerequisite: ['math-g1-006'], has_content: 1 },
  { id: 'math-g1-008', name: '一元二次不等式', grade: 'high1', chapter: '一元二次函数方程不等式', score_weight: 6, prerequisite: ['math-g1-007'], has_content: 1 },
  { id: 'math-g1-009', name: '函数的概念', grade: 'high1', chapter: '函数的概念与性质', score_weight: 6, prerequisite: ['math-g1-003'], has_content: 1 },
  { id: 'math-g1-010', name: '函数的单调性', grade: 'high1', chapter: '函数的概念与性质', score_weight: 7, prerequisite: ['math-g1-009'], has_content: 1 },
  { id: 'math-g1-011', name: '函数的奇偶性', grade: 'high1', chapter: '函数的概念与性质', score_weight: 6, prerequisite: ['math-g1-010'], has_content: 1 },
  { id: 'math-g1-012', name: '幂函数', grade: 'high1', chapter: '函数的概念与性质', score_weight: 4, prerequisite: ['math-g1-011'], has_content: 1 },
  { id: 'math-g1-013', name: '指数与指数幂运算', grade: 'high1', chapter: '指数函数与对数函数', score_weight: 5, prerequisite: ['math-g1-012'], has_content: 0 },
  { id: 'math-g1-014', name: '指数函数', grade: 'high1', chapter: '指数函数与对数函数', score_weight: 7, prerequisite: ['math-g1-013'], has_content: 1 },
  { id: 'math-g1-015', name: '对数概念', grade: 'high1', chapter: '指数函数与对数函数', score_weight: 5, prerequisite: ['math-g1-014'], has_content: 0 },
  { id: 'math-g1-016', name: '对数函数', grade: 'high1', chapter: '指数函数与对数函数', score_weight: 7, prerequisite: ['math-g1-015'], has_content: 1 },
  { id: 'math-g1-017', name: '函数的应用（零点）', grade: 'high1', chapter: '指数函数与对数函数', score_weight: 6, prerequisite: ['math-g1-016'], has_content: 0 },
  { id: 'math-g1-018', name: '任意角与弧度制', grade: 'high1', chapter: '三角函数', score_weight: 4, prerequisite: [], has_content: 0 },
  { id: 'math-g1-019', name: '三角函数定义', grade: 'high1', chapter: '三角函数', score_weight: 6, prerequisite: ['math-g1-018'], has_content: 0 },
  { id: 'math-g1-020', name: '同角三角函数基本关系', grade: 'high1', chapter: '三角函数', score_weight: 6, prerequisite: ['math-g1-019'], has_content: 0 },
  { id: 'math-g1-021', name: '诱导公式', grade: 'high1', chapter: '三角函数', score_weight: 5, prerequisite: ['math-g1-020'], has_content: 0 },
  { id: 'math-g1-022', name: '正弦函数图像与性质', grade: 'high1', chapter: '三角函数', score_weight: 7, prerequisite: ['math-g1-021'], has_content: 0 },
  { id: 'math-g1-023', name: '余弦正切函数图像', grade: 'high1', chapter: '三角函数', score_weight: 6, prerequisite: ['math-g1-022'], has_content: 0 },
  { id: 'math-g1-024', name: '三角恒等变换', grade: 'high1', chapter: '三角函数', score_weight: 7, prerequisite: ['math-g1-023'], has_content: 0 },

  // ===== 高一 必修第二册 =====
  { id: 'math-g1-025', name: '平面向量概念', grade: 'high1', chapter: '平面向量及其应用', score_weight: 5, prerequisite: [], has_content: 0 },
  { id: 'math-g1-026', name: '平面向量线性运算', grade: 'high1', chapter: '平面向量及其应用', score_weight: 6, prerequisite: ['math-g1-025'], has_content: 0 },
  { id: 'math-g1-027', name: '平面向量基本定理', grade: 'high1', chapter: '平面向量及其应用', score_weight: 7, prerequisite: ['math-g1-026'], has_content: 0 },
  { id: 'math-g1-028', name: '平面向量坐标表示', grade: 'high1', chapter: '平面向量及其应用', score_weight: 6, prerequisite: ['math-g1-027'], has_content: 0 },
  { id: 'math-g1-029', name: '平面向量数量积', grade: 'high1', chapter: '平面向量及其应用', score_weight: 7, prerequisite: ['math-g1-028'], has_content: 0 },
  { id: 'math-g1-030', name: '复数概念与运算', grade: 'high1', chapter: '复数', score_weight: 4, prerequisite: [], has_content: 0 },
  { id: 'math-g1-031', name: '空间几何体结构', grade: 'high1', chapter: '立体几何初步', score_weight: 5, prerequisite: [], has_content: 0 },
  { id: 'math-g1-032', name: '空间点线面位置关系', grade: 'high1', chapter: '立体几何初步', score_weight: 7, prerequisite: ['math-g1-031'], has_content: 0 },
  { id: 'math-g1-033', name: '直线平面平行的判定', grade: 'high1', chapter: '立体几何初步', score_weight: 6, prerequisite: ['math-g1-032'], has_content: 0 },
  { id: 'math-g1-034', name: '直线平面垂直的判定', grade: 'high1', chapter: '立体几何初步', score_weight: 7, prerequisite: ['math-g1-033'], has_content: 0 },
  { id: 'math-g1-035', name: '随机抽样', grade: 'high1', chapter: '统计', score_weight: 4, prerequisite: [], has_content: 0 },
  { id: 'math-g1-036', name: '用样本估计总体', grade: 'high1', chapter: '统计', score_weight: 5, prerequisite: ['math-g1-035'], has_content: 0 },
  { id: 'math-g1-037', name: '概率概念', grade: 'high1', chapter: '概率', score_weight: 5, prerequisite: [], has_content: 0 },
  { id: 'math-g1-038', name: '古典概型', grade: 'high1', chapter: '概率', score_weight: 6, prerequisite: ['math-g1-037'], has_content: 0 },

  // ===== 高二 选择性必修第一册 =====
  { id: 'math-g2-001', name: '空间向量及其线性运算', grade: 'high2', chapter: '空间向量与立体几何', score_weight: 7, prerequisite: ['math-g1-028'], has_content: 1 },
  { id: 'math-g2-002', name: '空间向量的数量积运算', grade: 'high2', chapter: '空间向量与立体几何', score_weight: 8, prerequisite: ['math-g2-001', 'math-g1-029'], has_content: 1 },
  { id: 'math-g2-003', name: '空间向量的坐标表示', grade: 'high2', chapter: '空间向量与立体几何', score_weight: 8, prerequisite: ['math-g2-002'], has_content: 1 },
  { id: 'math-g2-004', name: '用空间向量研究直线位置', grade: 'high2', chapter: '空间向量与立体几何', score_weight: 7, prerequisite: ['math-g2-003'], has_content: 1 },
  { id: 'math-g2-005', name: '用空间向量研究平面位置', grade: 'high2', chapter: '空间向量与立体几何', score_weight: 8, prerequisite: ['math-g2-004'], has_content: 1 },
  { id: 'math-g2-006', name: '空间向量求距离与角', grade: 'high2', chapter: '空间向量与立体几何', score_weight: 9, prerequisite: ['math-g2-005'], has_content: 1 },
  { id: 'math-g2-007', name: '倾斜角与斜率', grade: 'high2', chapter: '平面解析几何', score_weight: 5, prerequisite: [], has_content: 0 },
  { id: 'math-g2-008', name: '直线的方程', grade: 'high2', chapter: '平面解析几何', score_weight: 6, prerequisite: ['math-g2-007'], has_content: 0 },
  { id: 'math-g2-009', name: '两条直线位置关系', grade: 'high2', chapter: '平面解析几何', score_weight: 5, prerequisite: ['math-g2-008'], has_content: 0 },
  { id: 'math-g2-010', name: '圆的方程', grade: 'high2', chapter: '平面解析几何', score_weight: 6, prerequisite: ['math-g2-009'], has_content: 0 },
  { id: 'math-g2-011', name: '直线与圆的位置关系', grade: 'high2', chapter: '平面解析几何', score_weight: 7, prerequisite: ['math-g2-010'], has_content: 0 },
  { id: 'math-g2-012', name: '椭圆', grade: 'high2', chapter: '平面解析几何', score_weight: 8, prerequisite: ['math-g2-011'], has_content: 0 },
  { id: 'math-g2-013', name: '双曲线', grade: 'high2', chapter: '平面解析几何', score_weight: 7, prerequisite: ['math-g2-012'], has_content: 0 },
  { id: 'math-g2-014', name: '抛物线', grade: 'high2', chapter: '平面解析几何', score_weight: 7, prerequisite: ['math-g2-013'], has_content: 0 },
  { id: 'math-g2-015', name: '直线与圆锥曲线位置关系', grade: 'high2', chapter: '平面解析几何', score_weight: 9, prerequisite: ['math-g2-014'], has_content: 0 },

  // ===== 高二 选择性必修第二册 =====
  { id: 'math-g2-016', name: '数列概念', grade: 'high2', chapter: '数列', score_weight: 5, prerequisite: [], has_content: 0 },
  { id: 'math-g2-017', name: '等差数列', grade: 'high2', chapter: '数列', score_weight: 7, prerequisite: ['math-g2-016'], has_content: 0 },
  { id: 'math-g2-018', name: '等比数列', grade: 'high2', chapter: '数列', score_weight: 7, prerequisite: ['math-g2-017'], has_content: 0 },
  { id: 'math-g2-019', name: '数列求和', grade: 'high2', chapter: '数列', score_weight: 8, prerequisite: ['math-g2-018'], has_content: 0 },
  { id: 'math-g2-020', name: '导数概念', grade: 'high2', chapter: '一元函数导数', score_weight: 6, prerequisite: ['math-g1-010'], has_content: 0 },
  { id: 'math-g2-021', name: '导数的运算', grade: 'high2', chapter: '一元函数导数', score_weight: 7, prerequisite: ['math-g2-020'], has_content: 0 },
  { id: 'math-g2-022', name: '利用导数研究单调性', grade: 'high2', chapter: '一元函数导数', score_weight: 8, prerequisite: ['math-g2-021'], has_content: 0 },
  { id: 'math-g2-023', name: '利用导数研究极值最值', grade: 'high2', chapter: '一元函数导数', score_weight: 9, prerequisite: ['math-g2-022'], has_content: 0 },

  // ===== 高二 选择性必修第三册 =====
  { id: 'math-g2-024', name: '两个计数原理', grade: 'high2', chapter: '计数原理', score_weight: 5, prerequisite: [], has_content: 0 },
  { id: 'math-g2-025', name: '排列组合', grade: 'high2', chapter: '计数原理', score_weight: 6, prerequisite: ['math-g2-024'], has_content: 0 },
  { id: 'math-g2-026', name: '二项式定理', grade: 'high2', chapter: '计数原理', score_weight: 6, prerequisite: ['math-g2-025'], has_content: 0 },
  { id: 'math-g2-027', name: '条件概率', grade: 'high2', chapter: '统计与概率', score_weight: 6, prerequisite: ['math-g1-038'], has_content: 0 },
  { id: 'math-g2-028', name: '离散型随机变量', grade: 'high2', chapter: '统计与概率', score_weight: 7, prerequisite: ['math-g2-027'], has_content: 0 },
  { id: 'math-g2-029', name: '正态分布', grade: 'high2', chapter: '统计与概率', score_weight: 5, prerequisite: ['math-g2-028'], has_content: 0 },

  // ===== 高三 综合复习 =====
  { id: 'math-g3-001', name: '函数综合应用', grade: 'high3', chapter: '函数综合', score_weight: 9, prerequisite: ['math-g1-017', 'math-g2-023'], has_content: 0 },
  { id: 'math-g3-002', name: '导数压轴专题', grade: 'high3', chapter: '函数综合', score_weight: 10, prerequisite: ['math-g3-001'], has_content: 0 },
  { id: 'math-g3-003', name: '解析几何综合', grade: 'high3', chapter: '几何综合', score_weight: 9, prerequisite: ['math-g2-015'], has_content: 0 },
  { id: 'math-g3-004', name: '圆锥曲线压轴专题', grade: 'high3', chapter: '几何综合', score_weight: 10, prerequisite: ['math-g3-003'], has_content: 0 },
  { id: 'math-g3-005', name: '立体几何综合', grade: 'high3', chapter: '几何综合', score_weight: 8, prerequisite: ['math-g2-006'], has_content: 0 },
  { id: 'math-g3-006', name: '概率统计综合', grade: 'high3', chapter: '概率统计综合', score_weight: 8, prerequisite: ['math-g2-028'], has_content: 0 },
  { id: 'math-g3-007', name: '数列综合应用', grade: 'high3', chapter: '数列综合', score_weight: 7, prerequisite: ['math-g2-019'], has_content: 0 },
];

module.exports = KNOWLEDGE_POINTS;

/**
 * 单元测试（零依赖：Node 自带 assert）
 * 测试后端 4 个核心纯函数：scorePredictor / energyModel / feynmanJudge / sm2
 * 运行：node tests/unit.test.js
 */

const assert = require('assert')
const path = require('path')

let passed = 0, failed = 0
const results = []

function test(name, fn) {
  try {
    fn()
    passed++
    results.push({ name, ok: true })
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } catch (e) {
    failed++
    results.push({ name, ok: false, err: e.message })
    console.log(`  \x1b[31m✗\x1b[0m ${name}\n    \x1b[31m${e.message}\x1b[0m`)
  }
}

function group(name) { console.log(`\n\x1b[1m${name}\x1b[0m`) }

// ===== 1. 转化率引擎 =====
group('转化率引擎 scorePredictor')
const { computeScorePrediction } = require('../src/services/scorePredictor')

test('空数据返回 0', () => {
  const r = computeScorePrediction([], 150)
  assert.strictEqual(r.overallMastery, 0)
  assert.strictEqual(r.weightedMastery, 0)
  assert.strictEqual(r.predictedScore, 0)
})

test('单个知识点 100% 掌握，预测分 = 满分', () => {
  // 生产代码：predictedScore = mastery% × fullScore（与掌握度正相关，权重体现在掌握率统计）
  const r = computeScorePrediction([{ score_weight: 5, mastery: 100 }], 150)
  assert.strictEqual(r.overallMastery, 100)
  assert.strictEqual(r.predictedScore, 150)
  assert.strictEqual(r.totalWeight, 5)
})

test('权重加权：5/80 + 8/50 + 7/100 → 加权 75% 预测113', () => {
  // weightedMastery = (5×80+8×50+7×100)/20 = 75
  // predictedScore = 75% × 150 = 112.5 ≈ 113（四舍五入）
  const points = [
    { score_weight: 5, mastery: 80 },
    { score_weight: 8, mastery: 50 },
    { score_weight: 7, mastery: 100 }
  ]
  const r = computeScorePrediction(points, 150)
  assert.ok(Math.abs(r.overallMastery - 76.7) < 0.5, `got ${r.overallMastery}`)
  assert.ok(Math.abs(r.weightedMastery - 75) < 0.5, `got ${r.weightedMastery}`)
  assert.ok(Math.abs(r.predictedScore - 112.5) < 1, `got ${r.predictedScore}`)
})

test('掌握度边界值处理（负数归0，超100归100 → clamp）', () => {
  // 150% 被 cap 到 100%，-20% 被 clamp 到 0
  const r1 = computeScorePrediction([{ score_weight: 5, mastery: 150 }], 100)
  assert.strictEqual(r1.overallMastery, 100) // 150 cap 到 100
  assert.strictEqual(r1.predictedScore, 100) // 100% × 满分100

  const r2 = computeScorePrediction([{ score_weight: 5, mastery: -20 }], 100)
  assert.strictEqual(r2.overallMastery, 0) // -20 clamp 到 0
  assert.strictEqual(r2.predictedScore, 0)
})

// ===== 2. 能量模型 =====
group('能量模型 energyModel')
const { getBaseline, computeEnergy, energyToTask, getIndividualAdjustment } = require('../src/services/energyModel')

test('早晨6-8点基线 = 3（黄金）', () => assert.strictEqual(getBaseline(7), 3))
test('上午8-11点基线 = 1', () => assert.strictEqual(getBaseline(9), 1))
test('午间11-14点基线 = -1（低谷）', () => assert.strictEqual(getBaseline(12), -1))
test('夜晚24:00（hour=0）基线 = 0', () => assert.strictEqual(getBaseline(0), 0))
test('夜晚22点基线 = -1（睡前下降）', () => assert.strictEqual(getBaseline(22), -1))

test('早晨7点无活动 → 能量=3（attack）', () => {
  assert.strictEqual(energyToTask(computeEnergy(7, 0, [])), 'attack')
})
test('午间12点无活动 → 能量=-1（review）', () => {
  assert.strictEqual(energyToTask(computeEnergy(12, 0, [])), 'review')
})

test('运动后60min（活动+90min）→ +2 攻击', () => {
  // 早晨7:00运动，8:00 (60min later) 检查
  const e = computeEnergy(8, 0, [{ type: 'exercise', hour: 7, minute: 0 }])
  assert.strictEqual(energyToTask(e), 'attack', `got energy=${e}`)
})

test('饭后30min → -2 (review)', () => {
  // 12:30 吃完饭，13:00 (30min later) 检查 → 12:00+1h=13:00 still in window
  const e = computeEnergy(13, 0, [{ type: 'meal', hour: 12, minute: 30 }])
  assert.ok(e <= -1, `能量应较低，got=${e}`)
})

test('5维认知→6参数（高加工+高流体→长块+deduction+跨章）', () => {
  const adj = getIndividualAdjustment({
    workingMemory: 75, processingSpeed: 80, fluidReasoning: 75,
    cognitiveFlexibility: 80, learningAbility: 75
  })
  assert.strictEqual(adj.blockMinutes, 45) // 加工>65
  assert.strictEqual(adj.sm2IntervalMultiplier, 1.3) // 记忆>70
  assert.strictEqual(adj.teachingStart, 'deduction') // 流体>50
  assert.strictEqual(adj.variationSpan, 'cross_chapter') // 灵活>65
  assert.strictEqual(adj.paceMultiplier, 1.5) // 学习>65
})

test('5维认知→6参数（弱加工+弱记忆→短块+密集复习）', () => {
  const adj = getIndividualAdjustment({
    workingMemory: 40, processingSpeed: 40, fluidReasoning: 40,
    cognitiveFlexibility: 40, learningAbility: 40
  })
  assert.strictEqual(adj.blockMinutes, 25) // 加工<50
  assert.strictEqual(adj.sm2IntervalMultiplier, 0.7) // 记忆<50
  assert.strictEqual(adj.teachingStart, 'analogy') // 流体<50
  assert.strictEqual(adj.variationSpan, 'same_chapter') // 灵活<65
  assert.strictEqual(adj.paceMultiplier, 0.8) // 学习<50
})

// ===== 3. 费曼判定 =====
group('费曼判定 feynmanJudge')
const { judgeFeynman } = require('../src/services/feynmanJudge')

test('100% 关键点命中 → 通过', () => {
  const cfg = [
    { point: '向量定义', keywords: ['向量', '大小', '方向'] },
    { point: '向量写法', keywords: ['箭头', '线段'] }
  ]
  const r = judgeFeynman('向量是一根有箭头的线段，既有大小又有方向。', cfg)
  assert.strictEqual(r.passed, true)
  assert.strictEqual(r.hitPoints.length, 2)
  assert.strictEqual(r.ratio, 100)
})

test('太短敷衍回答（<10字符）→ 直接不通过', () => {
  const cfg = [{ point: 'A', keywords: ['A'] }, { point: 'B', keywords: ['B'] }]
  const r = judgeFeynman('啊', cfg)
  assert.strictEqual(r.passed, false)
  assert.strictEqual(r.tooShort, true)
})

test('部分命中（1/3 ≈ 33%）→ 不通过 + 追问', () => {
  const cfg = [
    { point: '共面判定', keywords: ['共面', '平行'] },
    { point: '线性组合', keywords: ['线性组合', 'xa', 'yb'] },
    { point: '系数求解', keywords: ['系数', '解方程'] }
  ]
  const r = judgeFeynman('这两个向量是共面的，可以判断它们在同一个平面上。', cfg)
  assert.strictEqual(r.passed, false)
  assert.strictEqual(r.hitPoints.length, 1)
  assert.strictEqual(r.missedPoints.length, 2)
  assert.ok(r.followUpQuestion)
})

test('80% 命中阈值（4/5）→ 通过', () => {
  const cfg = [
    { point: 'A', keywords: ['苹果'] },
    { point: 'B', keywords: ['香蕉'] },
    { point: 'C', keywords: ['橙子'] },
    { point: 'D', keywords: ['西瓜'] },
    { point: 'E', keywords: ['葡萄'] }
  ]
  const r = judgeFeynman('我爱吃苹果香蕉橙子西瓜', cfg)
  assert.strictEqual(r.hitPoints.length, 4)
  assert.strictEqual(r.ratio, 80)
  assert.strictEqual(r.passed, true)
})

test('空关键点 → 0% 不通过', () => {
  const r = judgeFeynman('讲了一些', [])
  assert.strictEqual(r.passed, false)
  assert.strictEqual(r.ratio, 0)
})

// ===== 4. SM-2 间隔重复 =====
group('SM-2 间隔重复')
const { getNextReviewDate, INTERVALS } = require('../src/services/sm2')

test('答对 streak=0 → 间隔=3天，streak=1', () => {
  const r = getNextReviewDate(0, 0, true)
  assert.strictEqual(r.nextInterval, 3)
  assert.strictEqual(r.nextStreak, 1)
})
test('连续答对 streak=1 → 间隔=7天', () => {
  const r = getNextReviewDate(3, 1, true)
  assert.strictEqual(r.nextInterval, 7)
  assert.strictEqual(r.nextStreak, 2)
})
test('连续答对 streak=2 → 间隔=15天', () => {
  const r = getNextReviewDate(7, 2, true)
  assert.strictEqual(r.nextInterval, 15)
})
test('答错 → 重置 streak=0, 间隔=0（今天再复习）', () => {
  const r = getNextReviewDate(15, 3, false)
  assert.strictEqual(r.nextInterval, 0)
  assert.strictEqual(r.nextStreak, 0)
})
test('答对4次后 → 达到30天已掌握', () => {
  const r = getNextReviewDate(15, 3, true)
  assert.strictEqual(r.nextInterval, 30)
  assert.strictEqual(r.isMastered, true)
})
test('下次复习时间晚于今天', () => {
  const r = getNextReviewDate(0, 0, true)
  assert.ok(new Date(r.nextReviewAt).getTime() > Date.now() - 1000)
})

// ===== 5. 调度核心 =====
group('调度引擎 scheduler')
const { generateWeekPlan, adjustPlan } = require('../src/services/scheduler')

test('空知识点 → 7天周计划（周日=周测）', () => {
  const plan = generateWeekPlan({
    userId: 'u1', targetExam: '高考', targetScore: 130, deadline: '2027-06-07',
    dailyBudgetMinutes: 120, knowledgePoints: [], wrongQuestions: [],
    weekStartDate: new Date('2026-08-25T00:00:00')
  })
  assert.strictEqual(plan.weekPlan.length, 7)
  assert.strictEqual(plan.weekPlan[6].isTestDay, true)
})

test('有内容的知识点被排进主攻日，isCore判断正确（高权重×高薄弱=核心）', () => {
  const kps = [
    { id: 'a', name: 'A', sort_order: 1, score_weight: 5, has_content: 1, mastery: 0 },  // 权重5，非核心
    { id: 'b', name: 'B', sort_order: 2, score_weight: 7, has_content: 0, mastery: 0 },  // 无内容
    { id: 'c', name: 'C', sort_order: 3, score_weight: 8, has_content: 1, mastery: 10 }  // 权重8+薄弱，核心
  ]
  const plan = generateWeekPlan({
    userId: 'u1', targetExam: '高考', targetScore: 130, deadline: '2027-06-07',
    dailyBudgetMinutes: 120, knowledgePoints: kps, wrongQuestions: [],
    weekStartDate: new Date('2026-08-25T00:00:00')
  })
  const day1 = plan.weekPlan[0]
  const attack = day1.blocks.find(b => b.type === 'attack')
  assert.ok(attack, '周一应有主攻块')
  assert.strictEqual(attack.knowledgePointId, 'a') // 第一个有内容的
  assert.strictEqual(attack.isCore, false) // 权重5<7
})

test('核心知识点(isCore)跳过 → 强制排到明天第一槽', () => {
  const kps = [{ id: 'core', name: 'C', sort_order: 1, score_weight: 8, has_content: 1, mastery: 10 }]
  const plan = generateWeekPlan({
    userId: 'u1', targetExam: '高考', targetScore: 130, deadline: '2027-06-07',
    dailyBudgetMinutes: 120, knowledgePoints: kps, wrongQuestions: [],
    weekStartDate: new Date('2026-08-25T00:00:00')
  })
  const adjusted = adjustPlan(plan, { knowledge_point_id: 'core' }, kps)
  assert.ok(adjusted.adjustments.length > 0, '应有调整记录')
  assert.strictEqual(adjusted.adjustments[0].type, 'core_reschedule')
  assert.strictEqual(adjusted.adjustments[0].knowledgePointId, 'core')
})

// ===== 输出结果 =====
console.log(`\n\x1b[1m=================================\x1b[0m`)
console.log(`\x1b[1m测试结果：\x1b[0m \x1b[32m${passed} 通过\x1b[0m / \x1b[31m${failed} 失败\x1b[0m / ${passed + failed} 总计`)
console.log(`\x1b[1m=================================\x1b[0m\n`)

if (failed > 0) {
  console.log('\x1b[31m失败详情：\x1b[0m')
  for (const r of results) {
    if (!r.ok) console.log(`  - ${r.name}: ${r.err}`)
  }
  process.exit(1)
}
process.exit(0)

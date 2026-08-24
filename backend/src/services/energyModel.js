/**
 * 时间能量地图 · 能量计算模型（纯函数，可单测）
 *
 * 能量等级 E(t) = 昼夜节律基线 B(t) + 活动后效应 A(t) + 个体修正 P
 * 输出：某时刻的能量等级 → 映射任务类型
 */

// 昼夜节律基线（默认模板）
function getBaseline(hour) {
  if (hour >= 6 && hour < 8) return 3;   // 早晨峰值（睡眠后皮质醇高峰，黄金时间）
  if (hour >= 8 && hour < 11) return 1;  // 上午高效
  if (hour >= 11 && hour < 14) return -1; // 午间低谷（含午饭后）
  if (hour >= 14 && hour < 17) return 1;  // 下午回升
  if (hour >= 17 && hour < 19) return 0;  // 傍晚平稳
  if (hour >= 19 && hour < 21) return 1;  // 晚间小高峰
  if (hour >= 21 && hour < 23) return -1; // 睡前下降
  return 0;
}

// 活动后效应
const ACTIVITY_EFFECTS = {
  exercise: { delta: 2, windowMinutes: 90 },   // 运动后 30-90min：+2（BDNF 激活）
  meal: { delta: -2, windowMinutes: 60 },      // 饭后 30-60min：-2（血液流向消化）
  brainfatigue: { delta: -1, windowMinutes: 120 } // 高强度脑力后：-1
};

/**
 * 计算某时刻的能量等级
 * @param {number} hour 小时（0-23）
 * @param {number} minute 分钟（0-59）
 * @param {Array} activities 活动列表 [{type, hour, minute}]
 * @returns {number} 能量等级（-3 ~ 4）
 */
function computeEnergy(hour, minute = 0, activities = []) {
  let energy = getBaseline(hour);

  const nowMinutes = hour * 60 + minute;
  for (const act of activities || []) {
    const eff = ACTIVITY_EFFECTS[act.type];
    if (!eff) continue;
    const actMinutes = (act.hour || 0) * 60 + (act.minute || 0);
    const elapsed = nowMinutes - actMinutes;
    // 活动后 30min 开始生效，持续 windowMinutes
    if (elapsed >= 30 && elapsed <= 30 + eff.windowMinutes) {
      energy += eff.delta;
    }
  }

  return energy;
}

/**
 * 能量等级 → 任务类型
 * @param {number} energy
 * @returns {'attack'|'practice'|'review'|'rest'}
 */
function energyToTask(energy) {
  if (energy >= 3) return 'attack';   // 巅峰 → 攻克（新知识/难题/变式）
  if (energy >= 1) return 'practice'; // 高效 → 练习（刷题巩固）
  if (energy >= -1) return 'review';  // 平稳/低 → 复习（错题/SM-2）
  return 'rest';                       // 极低 → 不排/休息
}

/**
 * 个体修正（学力维度联动 · 5 维反向倒推排课）
 *
 * 5 维认知 → 排课参数映射：
 *   加工速度(processingSpeed) → 单块时长（快→长块45min，慢→短块25min）
 *   工作记忆(workingMemory)   → SM-2 间隔倍数（弱→间隔加密1.2x，强→标准1.0x）
 *   流体推理(fluidReasoning)   → 教法起点（低→analogy类比起步，高→deduction演绎直入）
 *   认知灵活(cognitiveFlexibility) → 变式跨度（高→跨章节远迁移，低→同章节近迁移）
 *   学习能力(learningAbility)  → 推进速度（高→每天可推进1.5个知识点，低→0.8个）
 *
 * @param {object} cognitive 认知维度 { workingMemory, processingSpeed, fluidReasoning, cognitiveFlexibility, learningAbility }
 * @returns {object} { blockMinutes, restMinutes, sm2IntervalMultiplier, teachingStart, variationSpan, paceMultiplier }
 */
function getIndividualAdjustment(cognitive = {}) {
  const workingMemory = cognitive.workingMemory || 60;
  const processingSpeed = cognitive.processingSpeed || 60;
  const fluidReasoning = cognitive.fluidReasoning || 60;
  const cognitiveFlexibility = cognitive.cognitiveFlexibility || 60;
  const learningAbility = cognitive.learningAbility || 60;

  // 加工速度 → 单块时长
  const blockMinutes = processingSpeed > 65 ? 45 : (processingSpeed < 50 ? 25 : 35);
  const restMinutes = blockMinutes <= 25 ? 8 : 5;

  // 工作记忆 → SM-2 间隔倍数（弱记忆→缩短间隔多复习）
  const sm2IntervalMultiplier = workingMemory < 50 ? 0.7 : (workingMemory > 70 ? 1.3 : 1.0);

  // 流体推理 → 教法起点（低→类比法先建立直觉，高→演绎法直入抽象）
  const teachingStart = fluidReasoning < 50 ? 'analogy' : 'deduction';

  // 认知灵活 → 变式跨度（高→跨章节，低→同章节）
  const variationSpan = cognitiveFlexibility > 65 ? 'cross_chapter' : 'same_chapter';

  // 学习能力 → 推进速度倍数
  const paceMultiplier = learningAbility > 65 ? 1.5 : (learningAbility < 50 ? 0.8 : 1.0);

  return { blockMinutes, restMinutes, sm2IntervalMultiplier, teachingStart, variationSpan, paceMultiplier };
}

module.exports = { getBaseline, computeEnergy, energyToTask, getIndividualAdjustment, ACTIVITY_EFFECTS };

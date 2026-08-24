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
 * 个体修正（学力维度联动）
 * @param {object} cognitive 认知维度 { workingMemory, processingSpeed, learningAbility }
 * @returns {object} { blockMinutes, restMinutes }
 */
function getIndividualAdjustment(cognitive = {}) {
  const workingMemory = cognitive.workingMemory || 60;
  const processingSpeed = cognitive.processingSpeed || 60;
  // 工作记忆弱 → 短块；加工速度快 → 长块
  const blockMinutes = workingMemory < 50 ? 25 : (processingSpeed > 65 ? 45 : 30);
  const restMinutes = blockMinutes <= 25 ? 8 : 5;
  return { blockMinutes, restMinutes };
}

module.exports = { getBaseline, computeEnergy, energyToTask, getIndividualAdjustment, ACTIVITY_EFFECTS };

/**
 * 转化率引擎 · 预估分计算（纯函数，可单测）
 *
 * 北极星指标：学会 → 分数的转化率
 *
 * 模型：
 *   overallMastery   = Σ(mastery) / N                       （简单平均掌握率）
 *   weightedMastery  = Σ(weight × mastery) / Σ(weight)     （加权掌握率 = 转化率）
 *   predictedScore   = weightedMastery/100 × fullScore       （预估分，映射到满分制）
 */

function computeScorePrediction(points, fullScore = 150) {
  const total = points.length;
  if (total === 0) {
    return {
      overallMastery: 0,
      weightedMastery: 0,
      predictedScore: 0,
      fullScore,
      totalWeight: 0,
      knowledgePointCount: 0
    };
  }

  const overallMastery = points.reduce((s, p) => s + (p.mastery || 0), 0) / total;

  const totalWeight = points.reduce((s, p) => s + (p.score_weight || 0), 0);
  const earnedWeight = points.reduce(
    (s, p) => s + (p.score_weight || 0) * (p.mastery || 0) / 100,
    0
  );
  const weightedMastery = totalWeight === 0 ? 0 : (earnedWeight / totalWeight) * 100;

  const predictedScore = (weightedMastery / 100) * fullScore;

  return {
    overallMastery: round1(overallMastery),
    weightedMastery: round1(weightedMastery),
    predictedScore: Math.round(predictedScore),
    fullScore,
    totalWeight: round1(totalWeight),
    knowledgePointCount: total
  };
}

/**
 * 计算单个知识点的预估分贡献（学完一个知识点，掌握度变化带来的涨分）
 * 用于"掌握度 +80%，预估涨 6.4 分"的实时反馈
 */
function computePointContribution(scoreWeight, masteryDelta, fullScore = 150) {
  // 知识点在满分中的占比 = score_weight / 总分值权重和
  // 简化：直接返回 权重 × 掌握度变化 / 100 × 缩放系数
  // 这里返回的是"权重分"的增量，展示层可再映射到满分
  return round1((scoreWeight * masteryDelta) / 100);
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

module.exports = { computeScorePrediction, computePointContribution };

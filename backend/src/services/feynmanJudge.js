/**
 * 费曼输出检验 · 规则判定引擎（无 LLM，纯规则）
 *
 * 原理：预置每个知识点的"关键点清单"（每个关键点配关键词+同义词组），
 * 学生回答 → 关键词命中匹配 → 命中率 ≥ 80% 即通过，
 * 未命中的关键点用于生成追问。
 */

/**
 * @param {string} answer 学生的讲解文本
 * @param {Array} keyPoints [{ point: '关键点描述', keywords: ['关键词', '同义词'] }]
 * @returns {passed, ratio, hitPoints, missedPoints, followUpQuestion}
 */
function judgeFeynman(answer, keyPoints) {
  const text = (answer || '').trim();

  // 太短直接不通过（敷衍回答）
  if (text.length < 10) {
    return {
      passed: false,
      ratio: 0,
      hitPoints: [],
      missedPoints: keyPoints.map(k => k.point),
      followUpQuestion: '讲得太简短了，展开说说？至少要说清关键步骤。',
      tooShort: true
    };
  }

  const results = keyPoints.map(kp => {
    const hit = kp.keywords.some(kw => text.includes(kw));
    return { point: kp.point, hit };
  });

  const hitPoints = results.filter(r => r.hit).map(r => r.point);
  const missedPoints = results.filter(r => !r.hit).map(r => r.point);
  const ratio = keyPoints.length === 0 ? 0 : hitPoints.length / keyPoints.length;

  const passed = ratio >= 0.8;

  // 追问：针对未命中的关键点
  let followUpQuestion = null;
  if (!passed && missedPoints.length > 0) {
    followUpQuestion = `你讲得不错，但漏了一个关键点：${missedPoints[0]}。再补充说说这部分？`;
  }

  return {
    passed,
    ratio: Math.round(ratio * 100),
    hitPoints,
    missedPoints,
    followUpQuestion
  };
}

module.exports = { judgeFeynman };

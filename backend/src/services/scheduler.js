/**
 * E5 调度引擎核心逻辑（聚焦单点版）
 *
 * 设计原则：一天只主攻 1 个知识点，深度吃透，不铺开。
 * 单日模板：错题回访(5min) → 主攻知识点(大块) → 收尾复盘(5min)
 * 一周：周一到周六每天攻克一个知识点（按学习顺序递进），周日周测复诊。
 *
 * 只排 has_content=1 的知识点（有真实教学内容），避免"内容开发中"空块。
 */

const { formatLocalDate } = require('../utils/date');

function generateWeekPlan(params) {
  const {
    userId,
    targetExam,
    targetScore,
    deadline,
    dailyBudgetMinutes,
    knowledgePoints,
    wrongQuestions,
    weekStartDate
  } = params;

  // 1. 只取有真实教学内容的知识点
  const availablePoints = knowledgePoints.filter(p => p.has_content === 1);

  // 2. 按学习顺序（sort_order）排列，保证先修在前、递进关系正确
  const orderedPoints = [...availablePoints].sort((a, b) => a.sort_order - b.sort_order);

  // 3. 待复习错题（到期需要回访的）
  const reviewItems = wrongQuestions.filter(w => {
    const reviewDate = new Date(w.next_review_at);
    return reviewDate <= weekStartDate;
  });

  const days = [];
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + i);
    const dateStr = formatLocalDate(date);

    // 周日 = 周测复诊
    if (i === 6) {
      days.push({
        date: dateStr,
        dayName: dayNames[i],
        focus: null,
        blocks: [{
          type: 'weekly_test',
          label: '本周周测复诊',
          plannedMinutes: Math.min(dailyBudgetMinutes, 90),
          status: 'pending'
        }],
        isTestDay: true
      });
      continue;
    }

    // 周一 ~ 周六：每天主攻 1 个知识点
    const point = orderedPoints[i] || null;
    const blocks = [];

    // 错题回访（有到期错题才排）
    const todayReviewCount = Math.min(reviewItems.length, Math.ceil(reviewItems.length / Math.max(6 - i, 1)));
    if (reviewItems.length > 0) {
      blocks.push({
        type: 'review',
        label: '错题回访',
        knowledgePointId: reviewItems[0]?.knowledge_point_id,
        plannedMinutes: 5,
        status: 'pending',
        reviewCount: todayReviewCount
      });
      reviewItems.splice(0, todayReviewCount);
    }

    // 主攻知识点（吃掉剩余全部预算，聚焦单点）
    if (point) {
      const reviewUsed = blocks.reduce((s, b) => s + b.plannedMinutes, 0);
      const focusMinutes = Math.max(30, dailyBudgetMinutes - reviewUsed - 5);
      blocks.push({
        type: 'attack',
        knowledgePointId: point.id,
        knowledgeName: point.name,
        chapter: point.chapter,
        hasContent: true,
        plannedMinutes: focusMinutes,
        status: 'pending'
      });
    }

    // 收尾复盘
    blocks.push({
      type: 'review',
      label: '收尾复盘',
      plannedMinutes: 5,
      status: 'pending'
    });

    days.push({
      date: dateStr,
      dayName: dayNames[i],
      focus: point ? {
        knowledgePointId: point.id,
        knowledgeName: point.name,
        chapter: point.chapter
      } : null,
      blocks
    });
  }

  return {
    userId,
    targetExam,
    targetScore,
    deadline,
    dailyBudgetMinutes,
    weekStartDate: formatLocalDate(weekStartDate),
    weekPlan: days
  };
}

function adjustPlan(plan, completedLogs) {
  const adjustments = [];
  const skippedPoints = completedLogs
    .filter(l => l.status === 'skipped' && l.knowledge_point_id)
    .map(l => l.knowledge_point_id);

  if (skippedPoints.length > 0) {
    // 找到下一个未完成的主攻日，把跳过的知识点追加进去
    const futureAttackDays = plan.weekPlan.filter(d => !d.isTestDay);
    const nextDay = futureAttackDays.find(d =>
      d.blocks.some(b => b.status === 'pending' && b.type === 'attack')
    ) || futureAttackDays[0];

    if (nextDay) {
      nextDay.blocks.unshift({
        type: 'attack',
        knowledgePointId: skippedPoints[0],
        label: '昨日未完成·补学',
        plannedMinutes: 20,
        status: 'pending'
      });
      adjustments.push({
        date: nextDay.date,
        reason: '有知识点未完成',
        change: '追加到次日优先补学'
      });
    }
  }

  return { ...plan, adjustments };
}

module.exports = { generateWeekPlan, adjustPlan };

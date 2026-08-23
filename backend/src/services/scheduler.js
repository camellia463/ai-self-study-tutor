/**
 * E5 调度引擎核心逻辑
 * 输入：学生目标 + 掌握度数据 + 每日可用时长
 * 输出：周计划 SchedulePlan
 */

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

  const sortedPoints = [...knowledgePoints].sort((a, b) => {
    const pa = (1 - a.mastery / 100) * a.score_weight;
    const pb = (1 - b.mastery / 100) * b.score_weight;
    return pb - pa;
  });

  const reviewItems = wrongQuestions.filter(w => {
    const today = new Date(weekStartDate);
    const reviewDate = new Date(w.next_review_at);
    return reviewDate <= today;
  });

  const days = [];
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    if (i === 6) {
      days.push({
        date: dateStr,
        dayName: dayNames[i],
        blocks: [{
          type: 'weekly_test',
          plannedMinutes: Math.min(dailyBudgetMinutes, 90),
          status: 'pending'
        }],
        isTestDay: true
      });
      continue;
    }

    const blocks = [];

    const reviewBudget = Math.min(15, reviewItems.length * 5);
    if (reviewItems.length > 0 && reviewBudget > 0) {
      const todayReviews = reviewItems.splice(0, Math.ceil(reviewItems.length / (6 - i) || 1));
      blocks.push({
        type: 'review',
        knowledgePointId: todayReviews[0]?.knowledge_point_id,
        plannedMinutes: reviewBudget,
        status: 'pending',
        reviewCount: todayReviews.length
      });
    }

    const remainingBudget = dailyBudgetMinutes - reviewBudget - 5;
    const attackBlockCount = Math.floor(remainingBudget / 30);
    for (let j = 0; j < attackBlockCount; j++) {
      const point = sortedPoints[j + i * attackBlockCount] || sortedPoints[j];
      if (!point) break;
      blocks.push({
        type: 'attack',
        knowledgePointId: point.id,
        knowledgeName: point.name,
        hasContent: point.has_content,
        plannedMinutes: 30,
        status: 'pending'
      });
    }

    blocks.push({
      type: 'review',
      label: '收尾复盘',
      plannedMinutes: 5,
      status: 'pending'
    });

    days.push({
      date: dateStr,
      dayName: dayNames[i],
      blocks
    });
  }

  return {
    userId,
    targetExam,
    targetScore,
    deadline,
    dailyBudgetMinutes,
    weekStartDate: weekStartDate.toISOString().split('T')[0],
    weekPlan: days
  };
}

function adjustPlan(plan, completedLogs) {
  const adjustments = [];
  const incompleteCount = completedLogs.filter(l => l.status === 'skipped').length;

  if (incompleteCount > 0) {
    const skippedPoints = completedLogs
      .filter(l => l.status === 'skipped' && l.knowledge_point_id)
      .map(l => l.knowledge_point_id);

    const futureAttackDays = plan.weekPlan.filter(d => !d.isTestDay);
    if (futureAttackDays.length > 0) {
      const firstFutureDay = futureAttackDays[0];
      firstFutureDay.blocks.unshift({
        type: 'attack',
        knowledgePointId: skippedPoints[0],
        label: '昨日未完成补追加',
        plannedMinutes: 20,
        status: 'pending'
      });
      adjustments.push({
        date: firstFutureDay.date,
        reason: `${incompleteCount}个任务未完成`,
        change: '追加到次日'
      });
    }
  }

  return { ...plan, adjustments };
}

module.exports = { generateWeekPlan, adjustPlan };

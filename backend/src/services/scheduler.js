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
      // 核心知识点判定：高分值权重(≥7) 且 掌握度低(<30) → 不可跳过
      const isCore = (point.score_weight >= 7) && (point.mastery < 30);
      blocks.push({
        type: 'attack',
        knowledgePointId: point.id,
        knowledgeName: point.name,
        chapter: point.chapter,
        hasContent: true,
        isCore,
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

/**
 * E5 总调控：动态重排（reschedule）
 *
 * 触发条件：complete-block 接口收到 status='skipped' 的任务
 * 重排规则：
 *   1. 核心知识点（isCore=true，高权重×高薄弱）不可跳过 → 强制排到明天第一个 attack 槽
 *   2. 普通知识点跳过 → 追加到下一个有空位的 attack 日，时长压缩为补学块(20min)
 *   3. 当天剩余 pending 的 attack 块如果存在，提升到当前空位补上
 *   4. 写 adjust_history 记录每次重排详情
 */
function adjustPlan(plan, completedLog, knowledgePoints) {
  const adjustments = [];

  // 被跳过的知识点
  const skippedKpId = completedLog.knowledge_point_id;
  if (!skippedKpId) return { ...plan, adjustments };

  // 查找被跳过知识点是否为核心
  const kpInfo = knowledgePoints?.find(p => p.id === skippedKpId);
  const isCore = kpInfo ? (kpInfo.score_weight >= 7 && (kpInfo.mastery || 0) < 30) : false;

  // 找到明天及之后的 attack 日（非测试日）
  const futureDays = plan.weekPlan.filter(d => !d.isTestDay);
  const todayIdx = plan.weekPlan.findIndex(d =>
    d.blocks.some(b => b.knowledgePointId === skippedKpId && b.type === 'attack')
  );

  // 明天开始的可用日
  const tomorrowOnwards = futureDays.filter((d, i) => {
    const dayIdx = plan.weekPlan.findIndex(pd => pd.date === d.date);
    return dayIdx > todayIdx;
  });

  if (isCore) {
    // 核心知识点不可跳过 → 强制排到明天第一个（插入到明天 attack 块之前）
    const targetDay = tomorrowOnwards[0];
    if (targetDay) {
      targetDay.blocks.unshift({
        type: 'attack',
        knowledgePointId: skippedKpId,
        knowledgeName: kpInfo?.name || '核心知识点',
        label: '⭐昨日跳过·核心补学（不可再跳）',
        isCore: true,
        mustNotSkip: true,
        plannedMinutes: 30,
        status: 'pending'
      });
      adjustments.push({
        type: 'core_reschedule',
        date: targetDay.date,
        knowledgePointId: skippedKpId,
        reason: '核心知识点（高权重×高薄弱）不可跳过',
        change: '强制排到明天第一个学习槽，标记不可再跳'
      });
    }
  } else {
    // 普通知识点跳过 → 追加到下一个有空位日的补学块
    const targetDay = tomorrowOnwards.find(d =>
      d.blocks.filter(b => b.type === 'attack').length < 2
    ) || tomorrowOnwards[0];

    if (targetDay) {
      targetDay.blocks.push({
        type: 'attack',
        knowledgePointId: skippedKpId,
        knowledgeName: kpInfo?.name || '知识点',
        label: '昨日未完成·补学',
        plannedMinutes: 20,
        status: 'pending'
      });
      adjustments.push({
        type: 'normal_reschedule',
        date: targetDay.date,
        knowledgePointId: skippedKpId,
        reason: '普通知识点未完成',
        change: '追加到次日补学槽(20min)'
      });
    }
  }

  return { ...plan, adjustments };
}

module.exports = { generateWeekPlan, adjustPlan };

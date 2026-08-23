/**
 * SM-2 间隔重复算法
 * 排期：当天 → 3天 → 7天 → 15天 → 考前
 * 做错重置、做对延长
 */

const INTERVALS = [0, 3, 7, 15, 30]; // 天

function getNextReviewDate(currentInterval, streak, isCorrect) {
  if (!isCorrect) {
    return {
      nextInterval: 0,
      nextStreak: 0,
      nextReviewAt: new Date().toISOString()
    };
  }

  const nextStreak = streak + 1;
  const nextInterval = INTERVALS[Math.min(nextStreak, INTERVALS.length - 1)];

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextInterval);

  return {
    nextInterval,
    nextStreak,
    nextReviewAt: nextDate.toISOString(),
    isMastered: nextStreak >= INTERVALS.length - 1
  };
}

function categorizeError(errorReason, attemptCount) {
  if (errorReason.includes('计算') || errorReason.includes('符号') || errorReason.includes('粗心')) {
    return '粗心';
  }
  if (attemptCount <= 1) {
    return '半懂';
  }
  return '盲区';
}

module.exports = { INTERVALS, getNextReviewDate, categorizeError };

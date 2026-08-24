const router = require('express').Router();
const crypto = require('crypto');
const { z } = require('zod');
const { getDB } = require('../db/init');
const { authMiddleware } = require('./auth');
const { todayLocal } = require('../utils/date');
const { computeScorePrediction } = require('../services/scorePredictor');

/**
 * 成长档案「知识档案柜」· 数据闭环最后一环
 * 每日自动汇总当天学习数据（任务完成度 / 专注时长 / 错题+错因 / 掌握度 / 预估分），
 * 支持自我反思 + 30 天成长轨迹。
 *
 * 各指标来源均真实可查，不杜撰系统未采集的数据：
 *  - 任务完成度 / 专注时长   ← learning_log（当日 done 块）
 *  - 错题数 + 错因分布        ← wrong_question（当日新增）
 *  - 掌握度 / 预估分          ← 转化率引擎 computeScorePrediction
 *  - 涨跌变化                ← 与最近一次历史快照对比
 */

// 今日数据反馈汇总（AI 自动汇总，首次访问即写入今日快照供趋势曲线）
router.get('/today', authMiddleware, (req, res) => {
  const db = getDB();
  const userId = req.user.userId;
  const date = todayLocal();

  const todayLogs = db.prepare(
    'SELECT status, actual_minutes FROM learning_log WHERE user_id = ? AND date = ?'
  ).all(userId, date);

  const tasksTotal = todayLogs.length;
  const tasksDone = todayLogs.filter(l => l.status === 'done').length;
  const completionRate = tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : 0;
  const focusMinutes = todayLogs.reduce((s, l) => s + (l.actual_minutes || 0), 0);

  const todayWrong = db.prepare(
    'SELECT category FROM wrong_question WHERE user_id = ? AND date(first_wrong_at) = ?'
  ).all(userId, date);
  const wrongCount = todayWrong.length;
  const errorDist = { 粗心: 0, 半懂: 0, 盲区: 0 };
  todayWrong.forEach(w => { if (errorDist[w.category] !== undefined) errorDist[w.category]++; });

  const points = db.prepare(`
    SELECT kp.score_weight, COALESCE(sm.mastery, 0) as mastery
    FROM knowledge_point kp
    LEFT JOIN student_mastery sm ON kp.id = sm.knowledge_point_id AND sm.user_id = ?
  `).all(userId);
  const prediction = computeScorePrediction(points, 150);

  // 变化：对比最近一条历史快照（不含今天）
  const prev = db.prepare(
    'SELECT metrics FROM daily_review WHERE user_id = ? AND date < ? ORDER BY date DESC LIMIT 1'
  ).get(userId, date);
  let masteryDelta = 0;
  let scoreDelta = 0;
  if (prev) {
    const p = JSON.parse(prev.metrics);
    masteryDelta = Math.round((prediction.overallMastery - (p.mastery || 0)) * 10) / 10;
    scoreDelta = prediction.predictedScore - (p.predictedScore || 0);
  }

  const metrics = {
    date,
    tasksTotal, tasksDone, completionRate,
    focusMinutes,
    wrongCount, errorDist,
    mastery: prediction.overallMastery,
    predictedScore: prediction.predictedScore,
    masteryDelta, scoreDelta
  };

  upsertDailyReview(db, userId, date, metrics);

  const review = db.prepare(
    'SELECT reflection FROM daily_review WHERE user_id = ? AND date = ?'
  ).get(userId, date);

  res.json({ ...metrics, reflection: review?.reflection || '' });
});

// 保存今日自我反思
router.post('/reflection', authMiddleware, (req, res) => {
  const parsed = z.object({ reflection: z.string().max(2000) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: '输入校验失败' });

  const db = getDB();
  const userId = req.user.userId;
  const date = todayLocal();

  const existing = db.prepare(
    'SELECT metrics FROM daily_review WHERE user_id = ? AND date = ?'
  ).get(userId, date);
  const metrics = existing ? JSON.parse(existing.metrics) : defaultMetrics(date);

  upsertDailyReview(db, userId, date, metrics);
  db.prepare(
    'UPDATE daily_review SET reflection = ?, updated_at = datetime(\'now\') WHERE user_id = ? AND date = ?'
  ).run(parsed.data.reflection, userId, date);

  res.json({ success: true });
});

// 30 天成长轨迹（趋势曲线）：预估分 / 掌握度 / 专注时长 / 正确完成度
router.get('/trend', authMiddleware, (req, res) => {
  const db = getDB();
  const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
  const rows = db.prepare(
    'SELECT date, metrics FROM daily_review WHERE user_id = ? ORDER BY date DESC LIMIT ?'
  ).all(req.user.userId, days);

  const trend = rows.reverse().map(r => {
    const m = JSON.parse(r.metrics);
    return {
      date: r.date,
      mastery: m.mastery,
      predictedScore: m.predictedScore,
      focusMinutes: m.focusMinutes,
      completionRate: m.completionRate,
      wrongCount: m.wrongCount
    };
  });
  res.json({ trend });
});

// ---------- 定时提醒（复盘 / 学习开始 / 休息） ----------

router.get('/reminders', authMiddleware, (req, res) => {
  const db = getDB();
  const row = db.prepare(
    'SELECT * FROM reminder_setting WHERE user_id = ?'
  ).get(req.user.userId);
  res.json(row || {
    reviewTime: '21:00',
    studyStartEnabled: false,
    studyStartTime: '08:00',
    breakEnabled: false,
    breakIntervalMinutes: 45
  });
});

const reminderSchema = z.object({
  reviewTime: z.string().regex(/^\d{2}:\d{2}$/),
  studyStartEnabled: z.boolean(),
  studyStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakEnabled: z.boolean(),
  breakIntervalMinutes: z.number().int().min(15).max(120)
});

router.post('/reminders', authMiddleware, (req, res) => {
  const parsed = reminderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: '提醒配置校验失败' });
  const db = getDB();
  const d = parsed.data;
  db.prepare(`
    INSERT INTO reminder_setting
      (user_id, review_time, study_start_enabled, study_start_time, break_enabled, break_interval_minutes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      review_time = excluded.review_time,
      study_start_enabled = excluded.study_start_enabled,
      study_start_time = excluded.study_start_time,
      break_enabled = excluded.break_enabled,
      break_interval_minutes = excluded.break_interval_minutes,
      updated_at = datetime('now')
  `).run(
    req.user.userId, d.reviewTime,
    d.studyStartEnabled ? 1 : 0, d.studyStartTime,
    d.breakEnabled ? 1 : 0, d.breakIntervalMinutes
  );
  res.json({ success: true });
});

function defaultMetrics(date) {
  return {
    date,
    tasksTotal: 0, tasksDone: 0, completionRate: 0,
    focusMinutes: 0, wrongCount: 0,
    errorDist: { 粗心: 0, 半懂: 0, 盲区: 0 },
    mastery: 0, predictedScore: 0, masteryDelta: 0, scoreDelta: 0
  };
}

function upsertDailyReview(db, userId, date, metrics) {
  db.prepare(`
    INSERT INTO daily_review (id, user_id, date, metrics, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(user_id, date)
    DO UPDATE SET metrics = excluded.metrics, updated_at = datetime('now')
  `).run(crypto.randomUUID(), userId, date, JSON.stringify(metrics));
}

module.exports = { router };
const router = require('express').Router();
const crypto = require('crypto');
const { z } = require('zod');
const { getDB } = require('../db/init');
const { authMiddleware } = require('./auth');
const { generateWeekPlan, adjustPlan } = require('../services/scheduler');

const goalSchema = z.object({
  targetExam: z.string().min(1),
  targetScore: z.number().int().min(0).max(750).optional(),
  deadline: z.string(),
  dailyBudgetMinutes: z.number().int().min(30).max(480)
});

router.post('/goal', authMiddleware, (req, res) => {
  const parsed = goalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: '输入校验失败', details: parsed.error.errors });
  }

  const db = getDB();
  const { targetExam, targetScore, deadline, dailyBudgetMinutes } = parsed.data;
  const userId = req.user.userId;
  const planId = crypto.randomUUID();
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const knowledgePoints = db.prepare(`
    SELECT kp.id, kp.name, kp.grade, kp.chapter, kp.score_weight, kp.has_content,
           COALESCE(sm.mastery, 0) as mastery,
           COALESCE(sm.status, 'unlearned') as status
    FROM knowledge_point kp
    LEFT JOIN student_mastery sm ON kp.id = sm.knowledge_point_id AND sm.user_id = ?
    ORDER BY kp.sort_order
  `).all(userId);

  const wrongQuestions = db.prepare(`
    SELECT wq.id, wq.knowledge_point_id, wq.next_review_at, wq.category
    FROM wrong_question wq
    WHERE wq.user_id = ? AND wq.status = 'pending'
  `).all(userId);

  const plan = generateWeekPlan({
    userId, targetExam, targetScore, deadline,
    dailyBudgetMinutes, knowledgePoints, wrongQuestions,
    weekStartDate: weekStart
  });

  db.prepare(`
    INSERT INTO schedule_plan (id, user_id, target_exam, target_score, deadline, daily_budget_minutes, week_start_date, week_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(planId, userId, targetExam, targetScore || null, deadline, dailyBudgetMinutes, weekStartStr, JSON.stringify(plan));

  for (const day of plan.weekPlan) {
    for (const block of day.blocks) {
      if (block.type === 'weekly_test' && !block.knowledgePointId) continue;
      db.prepare(`
        INSERT INTO learning_log (id, user_id, date, knowledge_point_id, block_type, planned_minutes, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `).run(crypto.randomUUID(), userId, day.date, block.knowledgePointId || null, block.type, block.plannedMinutes);
    }
  }

  res.json({ planId, plan });
});

router.get('/today', authMiddleware, (req, res) => {
  const db = getDB();
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];

  const planRow = db.prepare(`
    SELECT * FROM schedule_plan WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(userId);

  if (!planRow) {
    return res.json({ hasPlan: false });
  }

  const plan = JSON.parse(planRow.week_data);
  const todayPlan = plan.weekPlan.find(d => d.date === today) || plan.weekPlan[0];

  const logs = db.prepare(`
    SELECT * FROM learning_log WHERE user_id = ? AND date = ?
  `).all(userId, today);

  const blocksWithLog = todayPlan.blocks.map(block => {
    const log = logs.find(l =>
      l.block_type === block.type &&
      l.knowledge_point_id === (block.knowledgePointId || null)
    );
    return {
      ...block,
      logId: log?.id,
      actualMinutes: log?.actual_minutes,
      status: log?.status || 'pending'
    };
  });

  const stats = {
    total: todayPlan.blocks.length,
    done: blocksWithLog.filter(b => b.status === 'done').length,
    skipped: blocksWithLog.filter(b => b.status === 'skipped').length,
    pending: blocksWithLog.filter(b => b.status === 'pending').length
  };

  res.json({
    hasPlan: true,
    planId: planRow.id,
    goal: { targetExam: planRow.target_exam, targetScore: planRow.target_score, deadline: planRow.deadline },
    dailyBudgetMinutes: planRow.daily_budget_minutes,
    today: today,
    dayName: todayPlan.dayName,
    blocks: blocksWithLog,
    stats
  });
});

router.post('/complete-block', authMiddleware, (req, res) => {
  const { z } = require('zod');
  const schema = z.object({
    logId: z.string(),
    actualMinutes: z.number().int().min(0).max(480),
    status: z.enum(['done', 'skipped'])
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: '输入校验失败' });
  }

  const db = getDB();
  const { logId, actualMinutes, status } = parsed.data;

  db.prepare(`
    UPDATE learning_log SET actual_minutes = ?, status = ?, completed_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).run(actualMinutes, status, logId, req.user.userId);

  if (req.body.knowledgePointId && status === 'done') {
    const current = db.prepare(`
      SELECT mastery FROM student_mastery WHERE user_id = ? AND knowledge_point_id = ?
    `).get(req.user.userId, req.body.knowledgePointId);

    const newMastery = Math.min(100, (current?.mastery || 0) + 15);
    db.prepare(`
      INSERT INTO student_mastery (id, user_id, knowledge_point_id, mastery, status, updated_at)
      VALUES (?, ?, ?, ?, 'learning', datetime('now'))
      ON CONFLICT(user_id, knowledge_point_id)
      DO UPDATE SET mastery = ?, status = 'learning', updated_at = datetime('now')
    `).run(crypto.randomUUID(), req.user.userId, req.body.knowledgePointId, newMastery, newMastery);
  }

  res.json({ success: true, newMastery: req.body.knowledgePointId ? db.prepare('SELECT mastery FROM student_mastery WHERE user_id = ? AND knowledge_point_id = ?').get(req.user.userId, req.body.knowledgePointId)?.mastery : null });
});

router.get('/week', authMiddleware, (req, res) => {
  const db = getDB();
  const planRow = db.prepare(`
    SELECT * FROM schedule_plan WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(req.user.userId);

  if (!planRow) {
    return res.json({ hasPlan: false });
  }

  const plan = JSON.parse(planRow.week_data);
  const weekDates = plan.weekPlan.map(d => d.date);

  const logs = db.prepare(`
    SELECT * FROM learning_log WHERE user_id = ? AND date IN (${weekDates.map(() => '?').join(',')})
  `).all(req.user.userId, ...weekDates);

  const weekWithLogs = plan.weekPlan.map(day => {
    const dayLogs = logs.filter(l => l.date === day.date);
    const blocksWithLog = day.blocks.map(block => {
      const log = dayLogs.find(l =>
        l.block_type === block.type &&
        l.knowledge_point_id === (block.knowledgePointId || null)
      );
      return { ...block, status: log?.status || 'pending', actualMinutes: log?.actual_minutes };
    });
    return { ...day, blocks: blocksWithLog };
  });

  res.json({
    hasPlan: true,
    goal: { targetExam: planRow.target_exam, targetScore: planRow.target_score, deadline: planRow.deadline },
    dailyBudgetMinutes: planRow.daily_budget_minutes,
    week: weekWithLogs
  });
});

module.exports = { router };

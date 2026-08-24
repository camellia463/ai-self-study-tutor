const router = require('express').Router();
const crypto = require('crypto');
const { z } = require('zod');
const { getDB } = require('../db/init');
const { authMiddleware } = require('./auth');
const { generateWeekPlan, adjustPlan } = require('../services/scheduler');
const { getIndividualAdjustment } = require('../services/energyModel');
const { formatLocalDate, todayLocal } = require('../utils/date');

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
  const weekStartStr = formatLocalDate(weekStart);

  const knowledgePoints = db.prepare(`
    SELECT kp.id, kp.name, kp.grade, kp.chapter, kp.score_weight, kp.has_content, kp.sort_order,
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

  // P1 学力反向倒推排课：读取诊断画像 → 5维认知 → 排课参数注入
  const profileRow = db.prepare(`
    SELECT profile_data FROM learner_profile WHERE user_id = ? ORDER BY completed_at DESC LIMIT 1
  `).get(userId);

  let cognitiveAdjustment = null;
  if (profileRow) {
    try {
      const profile = JSON.parse(profileRow.profile_data);
      const cognitive = profile.cognitive || {};
      cognitiveAdjustment = getIndividualAdjustment({
        workingMemory: cognitive.workingMemory,
        processingSpeed: cognitive.processingSpeed,
        fluidReasoning: cognitive.fluidReasoning,
        cognitiveFlexibility: cognitive.cognitiveFlexibility,
        learningAbility: cognitive.learningAbility
      });
      // 把排课参数注入计划
      plan.cognitiveAdjustment = cognitiveAdjustment;
      // 根据加工速度调整每日预算（单块时长 × 每日块数）
      if (cognitiveAdjustment.blockMinutes) {
        const blocksPerDay = Math.floor(dailyBudgetMinutes / (cognitiveAdjustment.blockMinutes + cognitiveAdjustment.restMinutes));
        plan.adjustedDailyBlocks = blocksPerDay;
      }
    } catch (e) {
      console.error('[schedule] 读取诊断画像失败:', e.message);
    }
  }

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
  const today = todayLocal();

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
    focus: todayPlan.focus || null,
    blocks: blocksWithLog,
    stats
  });
});

router.post('/complete-block', authMiddleware, (req, res) => {
  const { z } = require('zod');
  const schema = z.object({
    logId: z.string(),
    actualMinutes: z.number().int().min(0).max(480),
    status: z.enum(['done', 'skipped']),
    knowledgePointId: z.string().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: '输入校验失败' });
  }

  const db = getDB();
  const { logId, actualMinutes, status } = parsed.data;
  const userId = req.user.userId;
  const kpId = parsed.data.knowledgePointId || null;

  // 1. 更新 learning_log 状态
  const logRow = db.prepare('SELECT * FROM learning_log WHERE id = ? AND user_id = ?').get(logId, userId);
  db.prepare(`
    UPDATE learning_log SET actual_minutes = ?, status = ?, completed_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).run(actualMinutes, status, logId, userId);

  // 2. 完成学习 → 更新掌握度
  if (kpId && status === 'done') {
    const current = db.prepare(`
      SELECT mastery FROM student_mastery WHERE user_id = ? AND knowledge_point_id = ?
    `).get(userId, kpId);

    const newMastery = Math.min(100, (current?.mastery || 0) + 15);
    db.prepare(`
      INSERT INTO student_mastery (id, user_id, knowledge_point_id, mastery, status, updated_at)
      VALUES (?, ?, ?, ?, 'learning', datetime('now'))
      ON CONFLICT(user_id, knowledge_point_id)
      DO UPDATE SET mastery = ?, status = 'learning', updated_at = datetime('now')
    `).run(crypto.randomUUID(), userId, kpId, newMastery, newMastery);
  }

  // 3. P0 总调控：任务被跳过 → 触发 reschedule 动态重排
  let rescheduleResult = null;
  if (status === 'skipped' && kpId) {
    const planRow = db.prepare(`
      SELECT * FROM schedule_plan WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(userId);

    if (planRow) {
      const plan = JSON.parse(planRow.week_data);

      // 查知识点信息（判断是否核心）
      const kpInfo = db.prepare(`
        SELECT kp.id, kp.name, kp.score_weight, COALESCE(sm.mastery, 0) as mastery
        FROM knowledge_point kp
        LEFT JOIN student_mastery sm ON kp.id = sm.knowledge_point_id AND sm.user_id = ?
        WHERE kp.id = ?
      `).get(userId, kpId);

      const updatedPlan = adjustPlan(plan, { knowledge_point_id: kpId, status: 'skipped' }, [kpInfo]);

      // 写 adjust_history
      const isCore = kpInfo ? (kpInfo.score_weight >= 7 && (kpInfo.mastery || 0) < 30) : false;
      const adjustId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO adjust_history (id, user_id, trigger_date, trigger_log_id, skipped_knowledge_point_id, is_core, adjustments)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        adjustId, userId, logRow?.date || todayLocal(), logId, kpId,
        isCore ? 1 : 0,
        JSON.stringify(updatedPlan.adjustments)
      );

      // 更新 schedule_plan 的 week_data
      db.prepare(`
        UPDATE schedule_plan SET week_data = ?, updated_at = datetime('now') WHERE id = ?
      `).run(JSON.stringify(updatedPlan), planRow.id);

      // 为重排产生的新 block 创建 learning_log
      for (const adj of updatedPlan.adjustments) {
        const targetDay = updatedPlan.weekPlan.find(d => d.date === adj.date);
        if (targetDay) {
          const newBlock = targetDay.blocks.find(b =>
            b.knowledgePointId === kpId && b.label && (b.label.includes('补学') || b.label.includes('核心'))
          );
          if (newBlock) {
            db.prepare(`
              INSERT INTO learning_log (id, user_id, date, knowledge_point_id, block_type, planned_minutes, status)
              VALUES (?, ?, ?, ?, 'attack', ?, 'pending')
            `).run(crypto.randomUUID(), userId, adj.date, kpId, newBlock.plannedMinutes);
          }
        }
      }

      rescheduleResult = {
        triggered: true,
        isCore,
        adjustments: updatedPlan.adjustments
      };
    }
  }

  const newMastery = kpId ? db.prepare('SELECT mastery FROM student_mastery WHERE user_id = ? AND knowledge_point_id = ?').get(userId, kpId)?.mastery : null;

  res.json({ success: true, newMastery, reschedule: rescheduleResult });
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

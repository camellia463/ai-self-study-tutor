const router = require('express').Router();
const crypto = require('crypto');
const { getDB } = require('../db/init');
const { authMiddleware } = require('./auth');
const { judgeFeynman } = require('../services/feynmanJudge');

// 教学内容：必修第一册（高一）+ 空间向量（高二）合并注册
const TEACHING_CONTENT = {
  ...require('../data/bx1-content.js'),
  ...require('../data/vector-content.js')
};
const FEYNMAN_CONTENT = require('../data/feynman-content.js');

// ============ 费曼输出检验（学会闭环·讲环） ============

// 获取费曼题目（不返回关键点，防作弊）
router.get('/feynman/:knowledgePointId', authMiddleware, (req, res) => {
  const { knowledgePointId } = req.params;
  const feynman = FEYNMAN_CONTENT[knowledgePointId];
  if (!feynman) {
    return res.json({ hasFeynman: false });
  }
  res.json({
    hasFeynman: true,
    question: feynman.question,
    keyPointCount: feynman.keyPoints.length
  });
});

// 提交讲解，规则判定
router.post('/feynman/submit', authMiddleware, (req, res) => {
  const { knowledgePointId, answer } = req.body;

  if (typeof answer !== 'string' || answer.length > 2000) {
    return res.status(400).json({ error: '回答内容不合法' });
  }

  const feynman = FEYNMAN_CONTENT[knowledgePointId];
  if (!feynman) {
    return res.status(404).json({ error: '该知识点暂无费曼检验' });
  }

  const result = judgeFeynman(answer, feynman.keyPoints);

  // 记录到 learning_record
  const db = getDB();
  const userId = req.user.userId;
  const existing = db.prepare(
    'SELECT id FROM learning_record WHERE user_id = ? AND knowledge_point_id = ?'
  ).get(userId, knowledgePointId);

  if (existing) {
    db.prepare(
      'UPDATE learning_record SET feynman_passed = ?, feynman_gaps = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).run(result.passed ? 1 : 0, JSON.stringify(result.missedPoints), existing.id);
  } else {
    db.prepare(`
      INSERT INTO learning_record (id, user_id, knowledge_point_id, feynman_passed, feynman_gaps, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(crypto.randomUUID(), userId, knowledgePointId, result.passed ? 1 : 0, JSON.stringify(result.missedPoints));
  }

  res.json(result);
});

router.get('/content/:knowledgePointId', authMiddleware, (req, res) => {
  const { knowledgePointId } = req.params;
  const content = TEACHING_CONTENT[knowledgePointId];

  if (!content) {
    const db = getDB();
    const point = db.prepare('SELECT name, has_content FROM knowledge_point WHERE id = ?').get(knowledgePointId);
    if (point && !point.has_content) {
      return res.json({
        hasContent: false,
        pointName: point.name,
        message: '该知识点内容开发中，敬请期待'
      });
    }
    return res.status(404).json({ error: '知识点不存在' });
  }

  res.json({ hasContent: true, content });
});

router.post('/answer', authMiddleware, (req, res) => {
  const { knowledgePointId, questionId, optionIndex, attemptCount } = req.body;

  const content = TEACHING_CONTENT[knowledgePointId];
  if (!content) {
    return res.status(404).json({ error: '知识点内容不存在' });
  }

  const question = content.questions.find(q => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: '题目不存在' });
  }

  const selectedOption = question.options[optionIndex];
  const isCorrect = selectedOption.isCorrect;

  if (isCorrect) {
    return res.json({
      correct: true,
      feedback: '答对了！',
      nextStep: attemptCount >= 2 ? 'variation' : 'next_question'
    });
  }

  const hintLevel = Math.min(attemptCount, 3);
  const hint = question.hints[hintLevel - 1] || question.hints[question.hints.length - 1];
  const errorReason = selectedOption.hint || '思路有偏差';

  const shouldSwitchMethod = attemptCount >= 3;
  const newMethod = shouldSwitchMethod ? getNextTeachingMethod(question.method) : question.method;

  return res.json({
    correct: false,
    hintLevel,
    hint,
    errorReason,
    shouldSwitchMethod,
    newMethod: shouldSwitchMethod ? newMethod : null,
    methodSwitchText: shouldSwitchMethod ? content.methodSwitchTexts?.[newMethod] : null
  });
});

router.post('/wrong', authMiddleware, (req, res) => {
  const { knowledgePointId, questionId, errorReason, attemptCount } = req.body;
  const db = getDB();
  const userId = req.user.userId;

  const { getNextReviewDate, categorizeError } = require('../services/sm2');
  const category = categorizeError(errorReason, attemptCount);
  const review = getNextReviewDate(0, 0, false);

  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO wrong_question
      (id, user_id, knowledge_point_id, question_id, category, error_reason,
       next_review_at, review_interval, streak, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(id, userId, knowledgePointId, questionId, category, errorReason,
    review.nextReviewAt, review.nextInterval, review.nextStreak);

  res.json({ success: true, wrongQuestionId: id, category, nextReviewAt: review.nextReviewAt });
});

router.post('/complete', authMiddleware, (req, res) => {
  const { knowledgePointId } = req.body;
  const db = getDB();
  const userId = req.user.userId;

  const current = db.prepare(`
    SELECT mastery FROM student_mastery WHERE user_id = ? AND knowledge_point_id = ?
  `).get(userId, knowledgePointId);

  const newMastery = Math.min(100, (current?.mastery || 0) + 20);
  db.prepare(`
    INSERT INTO student_mastery (id, user_id, knowledge_point_id, mastery, status, updated_at)
    VALUES (?, ?, ?, ?, 'mastered', datetime('now'))
    ON CONFLICT(user_id, knowledge_point_id)
    DO UPDATE SET mastery = ?, status = 'mastered', updated_at = datetime('now')
  `).run(crypto.randomUUID(), userId, knowledgePointId, newMastery, newMastery);

  res.json({ success: true, newMastery });
});

function getNextTeachingMethod(current) {
  const methods = ['deduction', 'analogy', 'chunking', 'speedrun'];
  const idx = methods.indexOf(current);
  return methods[(idx + 1) % methods.length];
}

module.exports = { router };

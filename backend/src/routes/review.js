const router = require('express').Router();
const crypto = require('crypto');
const { getDB } = require('../db/init');
const { authMiddleware } = require('./auth');
const { getNextReviewDate } = require('../services/sm2');

router.get('/today', authMiddleware, (req, res) => {
  const db = getDB();
  const userId = req.user.userId;
  const today = new Date().toISOString();

  const items = db.prepare(`
    SELECT wq.id, wq.knowledge_point_id, wq.question_id, wq.category,
           wq.error_reason, wq.first_wrong_at, wq.next_review_at,
           wq.review_interval, wq.streak,
           kp.name as kp_name, kp.has_content
    FROM wrong_question wq
    JOIN knowledge_point kp ON wq.knowledge_point_id = kp.id
    WHERE wq.user_id = ? AND wq.status = 'pending' AND wq.next_review_at <= ?
    ORDER BY wq.next_review_at ASC
  `).all(userId, today);

  res.json({ items, count: items.length });
});

router.post('/checkin', authMiddleware, (req, res) => {
  const { wrongQuestionId, isCorrect } = req.body;
  const db = getDB();
  const userId = req.user.userId;

  const item = db.prepare(`
    SELECT streak, review_interval, knowledge_point_id FROM wrong_question
    WHERE id = ? AND user_id = ? AND status = 'pending'
  `).get(wrongQuestionId, userId);

  if (!item) {
    return res.status(404).json({ error: '错题不存在或已完成' });
  }

  const review = getNextReviewDate(item.review_interval, item.streak, isCorrect);

  db.prepare(`
    UPDATE wrong_question
    SET streak = ?, review_interval = ?, next_review_at = ?,
        status = ?
    WHERE id = ?
  `).run(
    review.nextStreak, review.nextInterval, review.nextReviewAt,
    review.isMastered ? 'mastered' : 'pending',
    wrongQuestionId
  );

  if (isCorrect && review.isMastered) {
    const current = db.prepare(`
      SELECT mastery FROM student_mastery WHERE user_id = ? AND knowledge_point_id = ?
    `).get(userId, item.knowledge_point_id);
    const newMastery = Math.min(100, (current?.mastery || 0) + 10);
    db.prepare(`
      INSERT INTO student_mastery (id, user_id, knowledge_point_id, mastery, status, updated_at)
      VALUES (?, ?, ?, ?, 'mastered', datetime('now'))
      ON CONFLICT(user_id, knowledge_point_id)
      DO UPDATE SET mastery = ?, updated_at = datetime('now')
    `).run(crypto.randomUUID(), userId, item.knowledge_point_id, newMastery, newMastery);
  }

  res.json({
    success: true,
    isCorrect,
    nextReviewAt: review.nextReviewAt,
    isMastered: review.isMastered,
    newInterval: review.nextInterval
  });
});

router.get('/all', authMiddleware, (req, res) => {
  const db = getDB();
  const userId = req.user.userId;

  const items = db.prepare(`
    SELECT wq.id, wq.knowledge_point_id, wq.question_id, wq.category,
           wq.error_reason, wq.first_wrong_at, wq.next_review_at,
           wq.review_interval, wq.streak, wq.status,
           kp.name as kp_name
    FROM wrong_question wq
    JOIN knowledge_point kp ON wq.knowledge_point_id = kp.id
    WHERE wq.user_id = ?
    ORDER BY wq.status ASC, wq.next_review_at ASC
  `).all(userId);

  const stats = {
    total: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    mastered: items.filter(i => i.status === 'mastered').length,
    粗心: items.filter(i => i.category === '粗心').length,
    半懂: items.filter(i => i.category === '半懂').length,
    盲区: items.filter(i => i.category === '盲区').length
  };

  res.json({ items, stats });
});

module.exports = { router };

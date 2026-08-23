const router = require('express').Router();
const { getDB } = require('../db/init');
const { authMiddleware } = require('./auth');

router.get('/list', authMiddleware, (req, res) => {
  const db = getDB();
  const { grade, hasContent } = req.query;

  let sql = 'SELECT * FROM knowledge_point';
  const conditions = [];
  const params = [];

  if (grade) {
    conditions.push('grade = ?');
    params.push(grade);
  }
  if (hasContent === 'true') {
    conditions.push('has_content = 1');
  }
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY sort_order ASC';

  const points = db.prepare(sql).all(...params);
  res.json({ points });
});

router.get('/mastery', authMiddleware, (req, res) => {
  const db = getDB();
  const points = db.prepare(`
    SELECT kp.id, kp.name, kp.grade, kp.chapter, kp.score_weight, kp.has_content,
           COALESCE(sm.mastery, 0) as mastery,
           COALESCE(sm.status, 'unlearned') as status
    FROM knowledge_point kp
    LEFT JOIN student_mastery sm ON kp.id = sm.knowledge_point_id AND sm.user_id = ?
    ORDER BY kp.sort_order ASC
  `).all(req.user.userId);

  const withPriority = points.map(p => ({
    ...p,
    priority: Math.round((1 - p.mastery / 100) * p.score_weight * 10) / 10,
    has_content: !!p.has_content
  }));

  res.json({ points: withPriority });
});

router.get('/heatmap', authMiddleware, (req, res) => {
  const db = getDB();
  const rows = db.prepare(`
    SELECT kp.grade, COUNT(*) as total,
           SUM(CASE WHEN COALESCE(sm.mastery,0) >= 80 THEN 1 ELSE 0 END) as mastered,
           SUM(CASE WHEN COALESCE(sm.mastery,0) >= 50 AND COALESCE(sm.mastery,0) < 80 THEN 1 ELSE 0 END) as learning,
           SUM(CASE WHEN COALESCE(sm.mastery,0) < 50 THEN 1 ELSE 0 END) as weak
    FROM knowledge_point kp
    LEFT JOIN student_mastery sm ON kp.id = sm.knowledge_point_id AND sm.user_id = ?
    GROUP BY kp.grade
  `).all(req.user.userId);

  res.json({ heatmap: rows });
});

module.exports = { router };

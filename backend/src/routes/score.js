const router = require('express').Router();
const { getDB } = require('../db/init');
const { authMiddleware } = require('./auth');
const { computeScorePrediction } = require('../services/scorePredictor');

// 转化率引擎：返回整体掌握率 / 加权掌握率(转化率) / 预估分
router.get('/prediction', authMiddleware, (req, res) => {
  const db = getDB();
  const userId = req.user.userId;

  const points = db.prepare(`
    SELECT kp.id, kp.name, kp.score_weight, kp.has_content,
           COALESCE(sm.mastery, 0) as mastery
    FROM knowledge_point kp
    LEFT JOIN student_mastery sm ON kp.id = sm.knowledge_point_id AND sm.user_id = ?
  `).all(userId);

  const prediction = computeScorePrediction(points, 150);

  // 按掌握度分组统计（掌握/学习中/未学）
  const stats = {
    mastered: points.filter(p => p.mastery >= 80).length,
    learning: points.filter(p => p.mastery > 0 && p.mastery < 80).length,
    unlearned: points.filter(p => p.mastery === 0).length
  };

  res.json({ prediction, stats });
});

module.exports = { router };

const router = require('express').Router();
const crypto = require('crypto');
const { getDB } = require('../db/init');
const { authMiddleware } = require('./auth');

router.post('/submit', authMiddleware, (req, res) => {
  const { answers } = req.body;
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: '缺少诊断答案数据' });
  }

  const profile = computeProfile(answers);
  const profileId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const userId = req.user.userId;

  const db = getDB();
  db.prepare(`
    INSERT INTO learner_profile
      (id, user_id, session_id, profile_data, role_card_tier, role_card_talent,
       role_card_mindset, knowledge_overall, cognitive_overall, traits_overall)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    profileId, userId, sessionId, JSON.stringify(profile),
    profile.roleCard.tier, profile.roleCard.talent,
    profile.roleCard.mindsetType, profile.knowledge.overall,
    profile.cognitive.overall, profile.traits.overall
  );

  seedMasteryFromDiagnosis(userId, profile);

  res.json({ profileId, profile });
});

router.get('/profile', authMiddleware, (req, res) => {
  const db = getDB();
  const row = db.prepare(`
    SELECT * FROM learner_profile WHERE user_id = ? ORDER BY completed_at DESC LIMIT 1
  `).get(req.user.userId);

  if (!row) {
    return res.json({ hasProfile: false });
  }

  const profile = JSON.parse(row.profile_data);
  res.json({ hasProfile: true, profile, completedAt: row.completed_at });
});

function computeProfile(answers) {
  const knowledge = computeKnowledgeScore(answers.grades || {});
  const cognitive = computeCognitiveScore(answers.cognitive || {});
  const traits = computeTraitsScore(answers.survey || {});

  const overall = knowledge.overall * 0.15 + cognitive.overall * 0.50 + traits.overall * 0.20 + knowledge.overall * 0.15;

  const roleCard = generateRoleCard(cognitive, traits);

  return {
    studentId: '',
    sessionId: '',
    completedAt: new Date().toISOString(),
    knowledge,
    cognitive,
    traits,
    overall: Math.round(overall * 10) / 10,
    roleCard,
    meta: {
      gradeLevel: 'high',
      totalTimeMs: answers.totalTimeMs || 0,
      validFlag: true
    }
  };
}

function computeKnowledgeScore(grades) {
  const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography'];
  const scores = subjects.map(s => grades[s] || 50);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  return {
    overall: Math.round(avg * 10) / 10,
    language: Math.round(((grades.chinese || 50) + (grades.english || 50)) / 2 * 10) / 10,
    math: grades.math || 50,
    general: Math.round((scores.slice(3).reduce((a, b) => a + b, 0) / 6) * 10) / 10
  };
}

function computeCognitiveScore(cognitive) {
  const dims = ['fluidReasoning', 'learningAbility', 'workingMemory', 'processingSpeed', 'cognitiveFlexibility'];
  const scores = dims.map(d => cognitive[d] || 50);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  const result = { overall: Math.round(avg * 10) / 10 };
  dims.forEach(d => { result[d] = cognitive[d] || 50; });
  return result;
}

function computeTraitsScore(survey) {
  const dims = ['curiosity', 'selfDrive', 'resilience', 'mindset', 'metacognition'];
  const scores = dims.map(d => survey[d] || 50);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  const result = { overall: Math.round(avg * 10) / 10 };
  dims.forEach(d => { result[d] = survey[d] || 50; });
  return result;
}

function generateRoleCard(cognitive, traits) {
  let tier = 1;
  if (cognitive.overall >= 80) tier = 6;
  else if (cognitive.overall >= 70) tier = 5;
  else if (cognitive.overall >= 60) tier = 4;
  else if (cognitive.overall >= 50) tier = 3;
  else if (cognitive.overall >= 40) tier = 2;

  const dims = { logic: cognitive.fluidReasoning, memory: cognitive.workingMemory, speed: cognitive.processingSpeed, flexible: cognitive.cognitiveFlexibility };
  let talent = 'balanced';
  let maxScore = 0;
  for (const [key, val] of Object.entries(dims)) {
    if (val > maxScore) { maxScore = val; talent = key; }
  }

  let mindsetType = '向阳心法';
  if (traits.resilience >= 70) mindsetType = '韧竹心法';
  else if (traits.metacognition >= 70) mindsetType = '静水心法';
  else if (traits.selfDrive >= 70) mindsetType = '疾风心法';
  else if (traits.curiosity < 40) mindsetType = '暗影心法';

  const titles = ['', '初心者', '修学者', '探索者', '攻坚者', '精进者', '大师'];
  const weaknesses = {
    logic: '直觉记忆偏弱，需多练归纳总结',
    memory: '逻辑推理待加强，多做题理解原理',
    speed: '反应稍慢，需限时训练提速',
    flexible: '思维偏固定，需多接触变式题',
    balanced: '无明显短板，继续均衡发展'
  };

  return {
    tier,
    title: titles[tier],
    talent,
    mindsetType,
    weakness: weaknesses[talent],
    trainingTips: generateTrainingTips(talent, mindsetType)
  };
}

function generateTrainingTips(talent, mindset) {
  const tips = {
    logic: ['多练逻辑链条题', '用思维导图拆解知识点'],
    memory: ['用间隔重复巩固记忆', '把公式编成口诀'],
    speed: ['每天限时10题训练', '先抓核心步骤再求快'],
    flexible: ['同一题型换3种解法', '做跨章节综合题'],
    balanced: ['保持优势维度', '针对性补弱项']
  };
  return tips[talent] || tips.balanced;
}

function seedMasteryFromDiagnosis(userId, profile) {
  const db = getDB();
  const mathScore = profile.knowledge.math;
  const mastery = Math.round(mathScore * 0.8);

  const mathPoints = db.prepare('SELECT id FROM knowledge_point WHERE subject = ? AND grade = ?').all('math', 'high2');

  for (const point of mathPoints) {
    const variance = (Math.random() - 0.5) * 20;
    const pointMastery = Math.max(0, Math.min(100, mastery + variance));
    db.prepare(`
      INSERT INTO student_mastery (id, user_id, knowledge_point_id, mastery, status, updated_at)
      VALUES (?, ?, ?, ?, 'reviewing', datetime('now'))
      ON CONFLICT(user_id, knowledge_point_id)
      DO UPDATE SET mastery = ?, updated_at = datetime('now')
    `).run(crypto.randomUUID(), userId, point.id, pointMastery, pointMastery);
  }
}

module.exports = { router };

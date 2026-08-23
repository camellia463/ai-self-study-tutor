const crypto = require('crypto');
const { z } = require('zod');
const { getDB } = require('../db/init');

const activeTokens = new Map();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return salt + ':' + hash;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const verify = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === verify;
}

const registerSchema = z.object({
  username: z.string().min(2).max(20).regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只允许中英文、数字、下划线'),
  password: z.string().min(6).max(32),
  gradeLevel: z.enum(['high1', 'high2', 'high3'])
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

const router = require('express').Router();

router.post('/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: '输入校验失败', details: parsed.error.errors });
  }
  const { username, password, gradeLevel } = parsed.data;

  const db = getDB();
  const existing = db.prepare('SELECT user_id FROM user_account WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: '用户名已存在' });
  }

  const userId = crypto.randomUUID();
  const passwordHash = hashPassword(password);

  db.prepare(
    'INSERT INTO user_account (user_id, username, password_hash, grade_level) VALUES (?, ?, ?, ?)'
  ).run(userId, username, passwordHash, gradeLevel);

  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.set(token, { userId, username, gradeLevel });

  res.json({
    token,
    user: { userId, username, gradeLevel }
  });
});

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: '输入校验失败' });
  }
  const { username, password } = parsed.data;

  const db = getDB();
  const user = db.prepare('SELECT user_id, username, password_hash, grade_level FROM user_account WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  if (!verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.set(token, { userId: user.user_id, username: user.username, gradeLevel: user.grade_level });

  res.json({
    token,
    user: { userId: user.user_id, username: user.username, gradeLevel: user.grade_level }
  });
});

module.exports = { router, authMiddleware, activeTokens };

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  const token = authHeader.slice(7);
  const user = activeTokens.get(token);
  if (!user) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
  req.user = user;
  next();
}

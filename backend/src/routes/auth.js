const crypto = require('crypto');
const { z } = require('zod');
const { getDB } = require('../db/init');

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

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

function createSession(userId, username, gradeLevel) {
  const db = getDB();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  db.prepare(
    'INSERT INTO session_token (token, user_id, expires_at) VALUES (?, ?, ?)'
  ).run(token, userId, expiresAt);
  return { token, userId, username, gradeLevel };
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

  const session = createSession(userId, username, gradeLevel);

  res.json({
    token: session.token,
    user: { userId, username, gradeLevel }
  });
});

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: '输入校验失败' });
  }
  const { username, password } = parsed.data;

  // 登录失败锁定检查（防撞库：5次失败锁15分钟）
  const { isLoginLocked, recordLoginFailure, clearLoginFailures, getLockInfo } = require('../middleware/security');
  const clientIp = req.ip || 'unknown';
  if (isLoginLocked(clientIp)) {
    const lock = getLockInfo(clientIp);
    return res.status(429).json({ error: `失败次数过多，已锁定，请 ${Math.ceil(lock.retryAfterSec / 60)} 分钟后再试` });
  }

  const db = getDB();
  const user = db.prepare('SELECT user_id, username, password_hash, grade_level FROM user_account WHERE username = ?').get(username);
  if (!user) {
    recordLoginFailure(clientIp);
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  if (!verifyPassword(password, user.password_hash)) {
    recordLoginFailure(clientIp);
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  // 登录成功，清除失败记录
  clearLoginFailures(clientIp);

  const session = createSession(user.user_id, user.username, user.grade_level);

  res.json({
    token: session.token,
    user: { userId: user.user_id, username: user.username, gradeLevel: user.grade_level }
  });
});

// 校验当前 token 是否有效（前端启动时调用，刷新页面用）
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', authMiddleware, (req, res) => {
  const db = getDB();
  const token = req.headers.authorization.slice(7);
  db.prepare('DELETE FROM session_token WHERE token = ?').run(token);
  res.json({ success: true });
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  const token = authHeader.slice(7);

  const db = getDB();
  const session = db.prepare(`
    SELECT st.token, st.user_id, st.expires_at, ua.username, ua.grade_level
    FROM session_token st
    JOIN user_account ua ON ua.user_id = st.user_id
    WHERE st.token = ?
  `).get(token);

  if (!session) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM session_token WHERE token = ?').run(token);
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }

  req.user = {
    userId: session.user_id,
    username: session.username,
    gradeLevel: session.grade_level
  };
  next();
}

module.exports = { router, authMiddleware };

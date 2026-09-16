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
const { authLimiter } = require('../middleware/security');

router.post('/register', authLimiter, (req, res) => {
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

router.post('/login', authLimiter, (req, res) => {
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

/**
 * 提取候选 token。云环境的反向代理可能改写 Authorization 头（实测长度会从 71
 * 变成 386），导致 "Bearer " 之后那一段不再是原始 token。因此这里多路兜底：
 * 标准 Bearer、头里残留的 64 位 hex 子串、自定义头 X-Auth-Token，最后是查询参数。
 * 校验时按顺序逐个尝试，命中且未过期的即采用。
 */
function extractTokenCandidates(req) {
  const candidates = [];
  const auth = String(req.headers.authorization || '');

  if (auth.startsWith('Bearer ')) {
    const raw = auth.slice(7).trim();
    if (raw) candidates.push(raw);
  }
  // 头被包装时，原始 token 通常仍以 64 位 hex 子串形式存在
  for (const m of auth.matchAll(/[0-9a-f]{64}/g)) {
    candidates.push(m[0]);
  }
  const custom = req.headers['x-auth-token'];
  if (typeof custom === 'string' && custom.trim()) {
    candidates.push(custom.trim());
  }
  if (typeof req.query.token === 'string' && req.query.token) {
    candidates.push(req.query.token);
  }

  return [...new Set(candidates)];
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-auth-token'];
  if ((!authHeader || !authHeader.startsWith('Bearer ')) && !customHeader) {
    return res.status(401).json({ error: '未登录' });
  }

  const db = getDB();
  const findSession = db.prepare(`
    SELECT st.token, st.user_id, st.expires_at, ua.username, ua.grade_level
    FROM session_token st
    JOIN user_account ua ON ua.user_id = st.user_id
    WHERE st.token = ?
  `);

  let session = null;
  const expired = [];

  for (const candidate of extractTokenCandidates(req)) {
    const row = findSession.get(candidate);
    if (!row) continue;
    if (new Date(row.expires_at).getTime() < Date.now()) {
      expired.push(candidate);
      continue;
    }
    session = row;
    break;
  }

  if (!session) {
    for (const t of expired) {
      try {
        db.prepare('DELETE FROM session_token WHERE token = ?').run(t);
      } catch (_) {
        /* 清理失败不影响返回结果 */
      }
    }
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }

  req.user = {
    userId: session.user_id,
    username: session.username,
    gradeLevel: session.grade_level
  };
  next();
}

module.exports = { router, authMiddleware, extractTokenCandidates };

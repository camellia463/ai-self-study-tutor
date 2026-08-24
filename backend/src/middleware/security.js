/**
 * 网络安全中间件（手写，零依赖）
 * 纵深防御：安全响应头 / 限流 / 登录失败锁定 / 请求体限制
 */

// ============ 1. 安全响应头 ============
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  // API 服务，禁一切外部资源加载
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  next();
}

// ============ 2. 限流（内存滑动窗口，防暴力/DoS） ============
const rateBuckets = new Map();

function rateLimiter({ windowMs = 60000, max = 100, keyFn } = {}) {
  return (req, res, next) => {
    const key = (keyFn ? keyFn(req) : req.ip + ':' + req.path);
    const now = Date.now();

    let bucket = rateBuckets.get(key);
    if (!bucket || now > bucket.reset) {
      bucket = { count: 0, reset: now + windowMs };
      rateBuckets.set(key, bucket);
    }
    bucket.count++;

    // 定期清理过期桶（防内存泄漏）
    if (rateBuckets.size > 10000) {
      for (const [k, v] of rateBuckets) {
        if (now > v.reset) rateBuckets.delete(k);
      }
    }

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', Math.ceil((bucket.reset - now) / 1000));
      return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
    }
    next();
  };
}

// 全局限流：每 IP 每分钟 120 次
const globalLimiter = rateLimiter({ windowMs: 60000, max: 120, keyFn: req => 'ip:' + req.ip });

// 敏感接口严格限流：登录/注册每 IP 每分钟 10 次
const authLimiter = rateLimiter({ windowMs: 60000, max: 10, keyFn: req => 'auth:' + req.ip });

// ============ 3. 登录失败锁定（防撞库） ============
const loginFailures = new Map(); // ip → { count, lockedUntil }
const MAX_LOGIN_FAILS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 锁 15 分钟

function isLoginLocked(ip) {
  const rec = loginFailures.get(ip);
  if (!rec) return false;
  if (rec.lockedUntil && Date.now() < rec.lockedUntil) return true;
  if (rec.lockedUntil && Date.now() >= rec.lockedUntil) {
    loginFailures.delete(ip); // 锁过期，重置
  }
  return false;
}

function recordLoginFailure(ip) {
  const rec = loginFailures.get(ip) || { count: 0, lockedUntil: null };
  rec.count++;
  if (rec.count >= MAX_LOGIN_FAILS) {
    rec.lockedUntil = Date.now() + LOCK_DURATION_MS;
    rec.count = 0;
  }
  loginFailures.set(ip, rec);
}

function clearLoginFailures(ip) {
  loginFailures.delete(ip);
}

function getLockInfo(ip) {
  const rec = loginFailures.get(ip);
  if (rec && rec.lockedUntil) {
    return { locked: true, retryAfterSec: Math.ceil((rec.lockedUntil - Date.now()) / 1000) };
  }
  return { locked: false };
}

module.exports = {
  securityHeaders,
  rateLimiter,
  globalLimiter,
  authLimiter,
  isLoginLocked,
  recordLoginFailure,
  clearLoginFailures,
  getLockInfo
};

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { getDB } = require('./db/init');

const authRoutes = require('./routes/auth');
const diagnosisRoutes = require('./routes/diagnosis');
const scheduleRoutes = require('./routes/schedule');
const learnRoutes = require('./routes/learn');
const reviewRoutes = require('./routes/review');
const knowledgeRoutes = require('./routes/knowledge');
const scoreRoutes = require('./routes/score');
const growthRoutes = require('./routes/growth');
const { securityHeaders, globalLimiter } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3001;
// 安全关键：只监听本地回环，后端与数据库不暴露到局域网/公网
const HOST = '127.0.0.1';

// ===== 安全中间件（纵深防御）=====
app.use(securityHeaders);        // 安全响应头
app.use(globalLimiter);          // 全局限流（120次/分钟/IP）
app.use(express.json({ limit: '100kb' }));  // 请求体大小限制（防大payload攻击）

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 登录/注册的严格限流在 auth.js 内部单独挂载（me/logout 不受限，避免刷新误伤）
app.use('/api/auth', authRoutes.router);
app.use('/api/diagnosis', diagnosisRoutes.router);
app.use('/api/schedule', scheduleRoutes.router);
app.use('/api/learn', learnRoutes.router);
app.use('/api/review', reviewRoutes.router);
app.use('/api/knowledge', knowledgeRoutes.router);
app.use('/api/score', scoreRoutes.router);
app.use('/api/growth', growthRoutes.router);

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: '输入校验失败', details: err.errors });
  }
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

getDB();

const server = app.listen(PORT, HOST, () => {
  console.log(`[Server] running on http://${HOST}:${PORT}（仅本地可访问，后端不暴露网络）`);
});

// 端口被占用时明确报错退出，避免多个后端进程同时写 SQLite 导致锁冲突
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server] 端口 ${PORT} 已被占用，已有后端进程在运行，本进程退出。`);
    process.exit(1);
  }
  console.error('[Server] 启动失败:', err.message);
  process.exit(1);
});

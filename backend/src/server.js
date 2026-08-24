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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes.router);
app.use('/api/diagnosis', diagnosisRoutes.router);
app.use('/api/schedule', scheduleRoutes.router);
app.use('/api/learn', learnRoutes.router);
app.use('/api/review', reviewRoutes.router);
app.use('/api/knowledge', knowledgeRoutes.router);
app.use('/api/score', scoreRoutes.router);

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: '输入校验失败', details: err.errors });
  }
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

getDB();

app.listen(PORT, () => {
  console.log(`[Server] running on http://localhost:${PORT}`);
});

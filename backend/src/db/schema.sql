-- AI 自学提分平台 · SQLite Schema
-- 6 张表：UserAccount / LearnerProfile / KnowledgePoint / LearningRecord / WrongQuestion / SchedulePlan

-- 用户账号（极简注册）
CREATE TABLE IF NOT EXISTS user_account (
  user_id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  grade_level TEXT NOT NULL DEFAULT 'high2',  -- high1/high2/high3
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 会话令牌（持久化，后端重启不失效）
CREATE TABLE IF NOT EXISTS session_token (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_account(user_id)
);

-- 学生画像（E1 诊断输出）
CREATE TABLE IF NOT EXISTS learner_profile (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- 诊断原始数据 JSON
  profile_data TEXT NOT NULL,  -- 完整 LearnerProfile JSON
  -- 关键字段冗余（方便查询）
  role_card_tier INTEGER,
  role_card_talent TEXT,
  role_card_mindset TEXT,
  knowledge_overall REAL,
  cognitive_overall REAL,
  traits_overall REAL,
  FOREIGN KEY (user_id) REFERENCES user_account(user_id)
);

-- 知识点目录（E1输出/E2输入/E5调度用）
CREATE TABLE IF NOT EXISTS knowledge_point (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'math',
  grade TEXT NOT NULL,           -- high1/high2/high3
  chapter TEXT NOT NULL,
  score_weight REAL NOT NULL DEFAULT 5.0,   -- 分值权重 1-10
  prerequisite TEXT,             -- 先修知识点ID，JSON数组
  has_content INTEGER NOT NULL DEFAULT 0,   -- 0=仅目录 1=有完整教学内容
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 学生知识点掌握度（每个学生对每个知识点的掌握情况）
CREATE TABLE IF NOT EXISTS student_mastery (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  knowledge_point_id TEXT NOT NULL,
  mastery REAL NOT NULL DEFAULT 0,   -- 0~100
  status TEXT NOT NULL DEFAULT 'unlearned',  -- unlearned/learning/mastered/reviewing
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, knowledge_point_id),
  FOREIGN KEY (user_id) REFERENCES user_account(user_id),
  FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_point(id)
);

-- 学习记录（E2 核心教学过程）
CREATE TABLE IF NOT EXISTS learning_record (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  knowledge_point_id TEXT NOT NULL,
  teaching_method TEXT,           -- deduction/analogy/chunking/speedrun
  teaching_attempts INTEGER NOT NULL DEFAULT 0,
  socratic_results TEXT,          -- JSON boolean array
  error_patterns TEXT,            -- JSON string array 错因标签
  practice_base INTEGER NOT NULL DEFAULT 0,
  practice_variation INTEGER NOT NULL DEFAULT 0,
  practice_advanced INTEGER NOT NULL DEFAULT 0,
  cross_chapter_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'unlearned',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_account(user_id),
  FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_point(id)
);

-- 错题本（E3 记忆引擎）
CREATE TABLE IF NOT EXISTS wrong_question (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  knowledge_point_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  category TEXT NOT NULL,         -- 粗心/半懂/盲区
  error_reason TEXT NOT NULL,     -- 错因树命中的具体原因
  first_wrong_at TEXT NOT NULL DEFAULT (datetime('now')),
  next_review_at TEXT NOT NULL,   -- SM-2 下次复习时间
  review_interval INTEGER NOT NULL DEFAULT 1,  -- 当前间隔（天）
  streak INTEGER NOT NULL DEFAULT 0,           -- 连续答对次数
  status TEXT NOT NULL DEFAULT 'pending',      -- pending/mastered
  FOREIGN KEY (user_id) REFERENCES user_account(user_id),
  FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_point(id)
);

-- 调度计划（E5 核心输出）
CREATE TABLE IF NOT EXISTS schedule_plan (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  target_exam TEXT NOT NULL,
  target_score INTEGER,
  deadline TEXT NOT NULL,
  daily_budget_minutes INTEGER NOT NULL DEFAULT 120,
  week_start_date TEXT NOT NULL,
  week_data TEXT NOT NULL,        -- JSON: 完整周计划
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_account(user_id)
);

-- 学习日志（记录每日实际执行情况，供 E5 动态调整）
CREATE TABLE IF NOT EXISTS learning_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  knowledge_point_id TEXT,
  block_type TEXT NOT NULL,       -- review/attack/weekly_test
  planned_minutes INTEGER NOT NULL,
  actual_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending/done/skipped
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES user_account(user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_mastery_user ON student_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_mastery_kp ON student_mastery(knowledge_point_id);
CREATE INDEX IF NOT EXISTS idx_wrong_user ON wrong_question(user_id);
CREATE INDEX IF NOT EXISTS idx_wrong_review ON wrong_question(next_review_at);
CREATE INDEX IF NOT EXISTS idx_log_user_date ON learning_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_kp_grade ON knowledge_point(grade);
CREATE INDEX IF NOT EXISTS idx_session_user ON session_token(user_id);
CREATE INDEX IF NOT EXISTS idx_session_expires ON session_token(expires_at);

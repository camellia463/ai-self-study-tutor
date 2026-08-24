# AI 自学提分平台 · 完整交接文档（HANDOFF-FINAL）

> 交接日期：2026-08-24
> 交接对象：接手开发的 AI（全自动闭环开发）
> 项目位置：`/Users/lzx/WorkBuddy/自学平台/hackathon-ai-tutor/`
> 赛事：OFFMAP 黑客松，72h，Claude Sonnet 5
> 评审维度：精美前端 + 完整数据架构 + 网络安全（评委更看技术）

---

## 〇、先读什么（文档导航）

| 文档 | 内容 | 必读 |
|---|---|---|
| `docs/PRD-v2.0.md` | **整合最终版 PRD（13 章）**，含全部需求 | ⭐ 第一优先 |
| `docs/prd.md` | PRD v1.0（原始架构，5 引擎） | 背景 |
| `docs/iteration-plan-v2.md` | 迭代 v2.0（目标/总调控/学力/架构/安全） | 演进 |
| `docs/iteration-plan-v2.1-supplement.md` | 迭代 v2.1（能量地图/2D可视化/学生数据/噱头） | 演进 |
| `docs/iteration-plan-v2.2.md` | 迭代 v2.2（学会闭环/费曼/真变式） | 演进 |
| `docs/iteration-plan-v2.3.md` | 迭代 v2.3（北极星=转化率/损耗点/噱头库） | 演进 |
| `STYLE.md` | 视觉风格定义 | 做 UI 时读 |

**读的顺序**：先 `PRD-v2.0.md`（当前唯一权威），其余 iteration 文档是演进过程，遇到细节疑问再回看。

---

## 一、产品定位（一句话 + 北极星）

**一句话**：把"学会"直接转化为"分数"的 AI 自学提分系统——学生告诉 AI 目标和作息，AI 按「诊断→排课→教学→检验→复习→调控」闭环运转。

**Slogan**：不是让你学得更多，是让你学了的，都变成分。

**北极星指标**：学会 → 分数的转化率。
- 知识掌握率提升（掌握度 0→100%）
- 转化率提升（掌握的有多少变成分）
- 检验"学会"的硬标准：① 能用自己的话讲出来（费曼）② 能迁移到新题（变式）

**学会六环闭环**：懂 → 练 → 讲 → 迁 → 测 → 记

**转化链 5 损耗点 → 功能映射**（每个功能必须堵一个损耗点）：
| 损耗点 | 堵它的功能 |
|---|---|
| 假学会（看懂≠学会） | 费曼检验 |
| 不会迁移 | 真变式 |
| 遗忘 | SM-2 间隔重复 |
| 熟练度不足 | 错因分类 |
| 知识孤岛 | 跨章节连接 |

---

## 二、已实现功能清单（全部可用、已验证）

### 核心闭环
1. **极简账号**：注册/登录（用户名+密码），scrypt 哈希，token 持久化到 SQLite（7 天过期），后端重启登录态不丢
2. **目标设定**：目标考试/分数/截止日期/每日时长 → 生成周计划
3. **聚焦单点排课**：一天只主攻 1 个知识点（110min），周一到周六 6 知识点，周日周测；只排有内容的
4. **零基础教学闭环**：前置回顾 → 概念讲解（含"为什么"）→ 例题精讲（步骤式）→ 练习（基础/常考/变式）→ **费曼检验（讲给我听）** → 完成
5. **费曼检验**：规则判定（无 LLM），关键词命中率≥80% 通过，未命中生成追问，讲明白才标记"真学会"；6 个知识点已配费曼内容
6. **转化率引擎**：`scorePredictor.js` 纯函数——整体掌握率 / 加权掌握率(转化率) / 预估分；首页仪表盘（预估分 → 距目标 → 转化率）
7. **学力诊断（照搬参考应用重构）**：图像认知题 19 道（矩阵 SVG / 精灵记忆 / 数字广度 / 符号匹配限时 / 颜色判断）+ 问卷 20 道 + 成绩 8 科 → 角色卡（剑道六段）
8. **知识图谱**：74 个知识点卡片，有内容的可点击进学习
9. **错题本/复习**：SM-2 + 错因三分类（粗心/半懂/盲区）
10. **周计划视图**：今日聚焦卡片 + 任务时间轴

### 网络安全（纵深防御，全部实测）
- 后端**只监听 127.0.0.1**（局域网/公网不可达，数据库隐藏）
- 安全响应头 ×5（nosniff/DENY/XSS/no-referrer/CSP）
- 全局限流 120 次/分钟/IP + 登录/注册限流 10 次/分钟/IP
- 登录失败锁定：5 次失败锁 3 分钟（防撞库）
- 请求体限制 100kb、SQL 全参数化、zod 校验、scrypt 密码

---

## 三、未完成任务（接手后按优先级做）

| 优先级 | 任务 | 说明 |
|---|---|---|
| P0 | **成长档案「知识档案柜」** | 定时提醒（复盘时间在目标设定里配）+ 数据反馈汇总（任务完成度/正确率/错题/专注时长/掌握度变化/预估分变化）+ 自我反思 + 成长轨迹（30 天趋势曲线）。数据模型见 PRD §6.8 `DailyReview` |
| P0 | **定时提醒功能**（用户点名没看到） | 复盘提醒 + 学习开始提醒 + 休息提醒；从目标设定页配置时间；前端到点弹提示（可先做前端定时器 + 后端 reminders） |
| P0 | **总调控 reschedule** | 任务 skipped → 当天剩余高能量槽补 → 明天让位；核心知识点（高权重×高薄弱）不可跳过；写 adjust_history；`complete-block` 接口触发 |
| P1 | **时间能量地图采集器** | 7×24 网格点选（❌不可用/✅可用/⚡黄金）；`energyModel.js` 已写好纯函数（E=基线+活动效应+个体修正），待接 goal 接口 + 排课 |
| P1 | **学力反向倒推排课** | 5 维认知 → 排课参数（加工速度→单块时长、工作记忆→SM-2间隔、流体推理→教法起点、认知灵活→变式跨度、学习能力→推进速度）；`getIndividualAdjustment` 已写 |
| P1 | **真变式** | 结构/方法/情境三变（不是换数据），question 加 `variation_type` |
| P1 | **概念 2D 可视化** | 斜二测投影 2D SVG（不用 3D），滑块交互 |
| P2 | **高一上册内容生产** | 必修第一册约 24 知识点 × 完整教学闭环（goal/前置/概念含why/例题/费曼关键点/真变式/练习）；核心精做 + 模板辅助 |
| P2 | **漫画选择性做** | 只做 2-3 个最抽象概念（控 token） |
| P2 | **UI 打磨** | 用 `lize-web-style` 技能（浅色樱花系，用户明确禁止深色主题） |

---

## 四、技术架构

```
前端层    React 19 + Vite 5 + TS + React Router
  ↓
安全网关  security.js（手写零依赖）：安全头 + 限流 + 登录锁定 + 请求体限制
  ↓
应用层    Express 路由（Controller）→ services（业务/算法纯函数）→ better-sqlite3
  ↓
数据层    SQLite（WAL + busy_timeout 5000），node_modules 无外部数据库
```

**关键纯函数（可单测）**：
- `backend/src/services/scorePredictor.js`：转化率引擎
- `backend/src/services/energyModel.js`：能量计算模型
- `backend/src/services/feynmanJudge.js`：费曼规则判定
- `backend/src/services/sm2.js`：间隔重复

**数据模型**（`backend/src/db/schema.sql`）：
`user_account / session_token / learner_profile / knowledge_point / student_mastery / learning_record(含feynman字段) / wrong_question / schedule_plan / learning_log`

---

## 五、如何启动

```bash
cd ~/WorkBuddy/自学平台/hackathon-ai-tutor
./start.sh    # 一键启动前后端（nohup，日志在 logs/）
./stop.sh     # 停止
```
- 前端 `http://localhost:5173/`，后端 `http://localhost:3001/api/health`
- 测试账号：`feynman_t2 / 123456`（已有诊断+目标）、`focus_test / 123456`
- 后端依赖：`backend/node_modules`；前端依赖：`frontend/node_modules`（npm install 即可，注意 npm 装包慢，耐心等）

---

## 六、关键文件地图

**后端**（`backend/src/`）：
- `server.js`：入口 + 安全中间件挂载（只监听 127.0.0.1）
- `db/init.js`：SQLite 初始化 + 旧表迁移（migrate）
- `db/schema.sql`：全表结构
- `routes/auth.js`：登录/注册/me/logout（含失败锁定）
- `routes/schedule.js`：目标/今日/周计划/完成块
- `routes/learn.js`：教学内容/答题/费曼/完成
- `routes/score.js`：转化率引擎 API
- `routes/diagnosis.js`：学力诊断提交/报告
- `routes/knowledge.js`：知识图谱/热力图
- `routes/review.js`：错题复习
- `services/`：scorePredictor / energyModel / feynmanJudge / sm2 / scheduler
- `data/`：knowledge-points.js（74 知识点目录）、vector-content.js（空间向量 6 知识点完整教学）、feynman-content.js（费曼配置）
- `middleware/security.js`：安全中间件

**前端**（`frontend/src/`）：
- `App.tsx`：路由 + token 校验（只对 401 清登录态）
- `api.ts`：全部 API 封装（setAuth/clearAuth 事件驱动）
- `pages/`：Today（转化率仪表盘+聚焦单点+时间轴）/ Learn（五阶段学习流+费曼）/ Diagnosis（学力筛选向导）/ KnowledgeMap（可点击图谱）/ WrongBook / SetGoal / Login / Register
- `components/`：Layout / ScoreDashboard
- `data/`：questions.js + matrix-svg.js（学力筛选题库，ESM 导出）

---

## 七、开发注意事项（踩过的坑，务必看）

1. **前端是 `"type": "module"`（ESM）**：所有复制的数据文件必须 `export default`，CJS 的 `module.exports` 在 ESM 下不执行 → 白屏（已踩）
2. **限流不能挂整个 router**：`authLimiter` 只能挂 login/register 路由，挂 `/api/auth` 会误伤 me 校验 → 用户被踢（已修）
3. **前端 catch 不能一律清登录态**：只有 401 才清 token，429 限流提示不清（已修）
4. **SQLite 并发写必须配 busy_timeout**：多进程同时写会 `database is locked` → 500（已加 5000ms）
5. **端口占用检测**：`server.js` 有 EADDRINUSE 处理，第二个进程自动退出
6. **React 受控组件测试**：eval 直接设 `input.value` 不触发 onChange，必须用原生 type；连续点击需 setInterval 逐次（React 异步渲染）
7. **日期用本地时区**：`utils/date.js` 的 `formatLocalDate`，别用 `toISOString()`（UTC 偏移错一天）
8. **用户审美铁律**：禁深色主题；浅色樱花系（粉 #F4A5B8 + 天蓝 #C4DFEE + 奶油白）；背景图用真实照片不用 SVG；字体不改
9. **AI 三禁令**：禁止直给答案、禁止无差别刷题、禁止排名羞辱（产品价值观）
10. **服务持久化**：WorkBuddy 会话内启动的进程会被清理，用户侧要用 `start.sh` 或 `.command` 文件

---

## 八、用户明确说过的重要原则（产品价值观）

- 核心不是噱头：**学会 → 分数转化率**才是根
- 噱头越多越好（谈资），但附属
- "变式不是变数据"：真变式 = 结构/方法/情境
- 概念要讲"为什么"（是什么→为什么→怎么做→怎么写）
- 运动后学习大脑激活（BDNF）、饭后低效——排课要考虑节律
- 学生数据是差异化护城河（后续单独交接聊天记录）
- 内容铁律：以题代教、以练代学，零基础能学明白

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
| `docs/HANDOFF-FINAL.md` | 本文档（交接总纲） | ⭐ |
| `docs/context/` | **决策上下文日志**（每天的工作记录：用户原话、决策、踩坑、修复） | ⭐ 理解"为什么" |
| `docs/prd.md` | PRD v1.0（原始架构，5 引擎） | 背景 |
| `docs/iteration-plan-v2.md` | 迭代 v2.0（目标/总调控/学力/架构/安全） | 演进 |
| `docs/iteration-plan-v2.1-supplement.md` | 迭代 v2.1（能量地图/2D可视化/学生数据/噱头） | 演进 |
| `docs/iteration-plan-v2.2.md` | 迭代 v2.2（学会闭环/费曼/真变式） | 演进 |
| `docs/iteration-plan-v2.3.md` | 迭代 v2.3（北极星=转化率/损耗点/噱头库） | 演进 |
| `STYLE.md` | 视觉风格定义 | 做 UI 时读 |

**读的顺序**：先 `PRD-v2.0.md`（当前唯一权威），再看 `docs/context/` 的日志理解决策过程，其余 iteration 文档是演进，遇到细节疑问再回看。

**上下文日志说明**（`docs/context/`）：
- `2026-08-17.md` / `2026-08-19.md`：五引擎架构 + 舒大军「自学×AI」框架来源
- `2026-08-23.md`：黑客松立项 + 第一轮开发（登录/排课/内容）
- `2026-08-24.md`：**本轮全部开发记录**（转化率/费曼/诊断/安全/踩坑）
- `PROJECT-MEMORY.md`：项目长期记忆（用户偏好、铁律）

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
11. **成长档案「知识档案柜」**：今日数据反馈（完成度/专注/错题+错因/掌握度/预估分涨跌）+ 自我反思 + 30 天成长轨迹 SVG 趋势图
12. **定时提醒**：复盘/学习开始定点提醒 + 休息周期提醒（浏览器全局定时器 + 提醒设置页）
13. **总调控 reschedule**：跳过任务自动动态重排（核心知识点强制补学 + 普通任务次日补学），adjust_history 全记录
14. **时间能量地图采集器**：7×24 网格点选（❌/✅/⚡），黄金时段统计，数据持久化
15. **学力反向倒推排课**：5 维认知 → 6 个排课参数（单块时长/SM-2倍数/教法起点/变式跨度/推进速度），目标设定时自动注入
16. **真变式**：6 个变式题标注 structure/method/context 三变类型，练习阶段显示变式说明
17. **概念 2D 可视化**：斜二测投影 SVG + 滑块交互（拖动调 x/y/z 分量实时看向量变化）
18. **后端工程化**：结构化日志、请求追踪（X-Request-Id）、增强健康检查（版本/uptime/DB统计）、**单元测试 29/29 通过**（`node backend/tests/unit.test.js`）

### 网络安全（纵深防御，全部实测）
- 后端**只监听 127.0.0.1**（局域网/公网不可达，数据库隐藏）
- 安全响应头 ×5（nosniff/DENY/XSS/no-referrer/CSP）
- 全局限流 120 次/分钟/IP + 登录/注册限流 10 次/分钟/IP
- 登录失败锁定：5 次失败锁 3 分钟（防撞库）
- 请求体限制 100kb、SQL 全参数化、zod 校验、scrypt 密码

---

## 三、未完成任务（2026-08-25 更新：P0+P1 已全部完成）

| 优先级 | 任务 | 状态 |
|---|---|---|
| ✅ 完成 | **成长档案「知识档案柜」** | 新增 `daily_review` 表 + `routes/growth.js` + 前端 `Growth.tsx` |
| ✅ 完成 | **定时提醒功能** | `reminder_setting` 表 + /reminders + `ReminderToast.tsx` 全局定时器 |
| ✅ 完成 | **P0 总调控 reschedule** | 新增 `adjust_history` 表；`adjustPlan` 增强（核心知识点不可跳过→明天第一槽；普通跳过→次日补学槽）；complete-block 集成触发，实测跳过任务自动重排成功 |
| ✅ 完成 | **P1 时间能量地图采集器** | `EnergyMapPicker.tsx`：7×24 网格点选（❌✅⚡），数据存 localStorage，嵌入 SetGoal 页面 |
| ✅ 完成 | **P1 学力反向倒推排课** | `getIndividualAdjustment` 增强为 5 维→6 参数（单块时长/SM-2倍数/教法起点/变式跨度/推进速度）；goal 接口读取诊断画像注入计划，实测 feynman_t2 → 45min块/deduction/跨章变式 |
| ✅ 完成 | **P1 真变式** | 6 个变式题加 `variationType`（structure/method/context）+ `variationNote`；Learn.tsx 练习阶段显示变式类型徽章 |
| ✅ 完成 | **P1 概念 2D 可视化** | `VectorVisual.tsx`：斜二测投影 2D SVG + 3 滑块调 x/y/z 分量，嵌入 Learn.tsx 概念阶段 |
| ✅ 完成 | **后端高级化** | 结构化日志 `logger.js`、请求追踪 `requestTracker`（X-Request-Id）、增强 health 端点（版本/uptime/DB统计7项/节点信息）、单元测试 `tests/unit.test.js` **29/29 通过**、掌握度 clamp [0,100] |
| P2 | **高一上册内容生产** | 必修第一册约 24 知识点 × 完整教学闭环；核心精做 + 模板辅助（当前仅空间向量 6 知识点有完整内容） |
| P2 | **漫画选择性做** | 只做 2-3 个最抽象概念（控 token） |
| P2 | **UI 打磨** | 用 `lize-web-style` 技能（浅色樱花系，用户明确禁止深色主题） |

### 成长档案 API（2026-08-24 新增）
- `GET /api/growth/today`：AI 自动汇总今日数据反馈（完成度/专注/错题+错因/掌握度/预估分/相对上次涨跌），首次调用自动写入当日快照供趋势
- `POST /api/growth/reflection`：保存今日自我反思
- `GET /api/growth/trend?days=N`：最近 N 天成长轨迹（预估分趋势曲线）
- `GET/POST /api/growth/reminders`：提醒配置（reviewTime 复盘 / studyStart 学习开始 / break 休息间隔）
- 指标来源均真实可查：learning_log / wrong_question / 转化率引擎，不杜撰未采集的数据

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
- `server.js`：入口 + 安全中间件 + 请求追踪 + 增强健康检查（只监听 127.0.0.1）
- `db/init.js`：SQLite 初始化 + 旧表迁移（migrate）
- `db/schema.sql`：全表结构（含 adjust_history / daily_review / reminder_setting）
- `routes/auth.js`：登录/注册/me/logout（含失败锁定）
- `routes/schedule.js`：目标/今日/周计划/完成块（含 reschedule 集成 + 学力倒推）
- `routes/learn.js`：教学内容/答题/费曼/完成
- `routes/score.js`：转化率引擎 API
- `routes/diagnosis.js`：学力诊断提交/报告
- `routes/knowledge.js`：知识图谱/热力图
- `routes/review.js`：错题复习
- `routes/growth.js`：成长档案（today/reflection/trend/reminders）
- `services/`：scorePredictor / energyModel / feynmanJudge / sm2 / scheduler
- `middleware/`：security（安全头+限流+锁定）/ requestTracker（请求追踪）
- `utils/`：date / logger（结构化日志）
- `data/`：knowledge-points.js（74 知识点目录）、vector-content.js（空间向量 6 知识点完整教学含真变式）、feynman-content.js（费曼配置）
- `tests/unit.test.js`：**单元测试 29/29 通过**（node tests/unit.test.js）

**前端**（`frontend/src/`）：
- `App.tsx`：路由 + token 校验（只对 401 清登录态）
- `api.ts`：全部 API 封装（setAuth/clearAuth 事件驱动）
- `pages/`：Today / Learn（含概念可视化+费曼+真变式）/ Diagnosis（学力筛选向导）/ KnowledgeMap（可点击图谱）/ WrongBook / SetGoal（含能量地图采集器）/ Growth / Login / Register
- `components/`：Layout / ScoreDashboard / EnergyMapPicker（7×24能量地图）/ VectorVisual（斜二测投影）/ ReminderToast（定时提醒）
- `data/`：questions.js + matrix-svg.js（学力筛选题库，ESM 导出）

**演示交付物**（`outputs/`）：
- `intro-demo.html`：青花瓷风格 6 屏路演演示页（滚轮/键盘/导航点翻页）
- `poster.html`：青花瓷 16:9 横屏宣传海报（可动背景）

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

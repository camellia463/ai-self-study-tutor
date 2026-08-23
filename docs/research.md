# Phase B 调研报告 · 黑客松 AI 自学提分平台

> 日期：2026-08-23
> 状态：已完成，作为开发技术依据
> 调研对象：ability-diagnosis-v3（E1来源）、ai-coach-prototype（E2来源）

---

## 一、ability-diagnosis-v3 调研结论（E1 诊断引擎）

### 1.1 架构性质
纯前端 HTML/CSS/JS（无框架无后端），数据存 localStorage（key=`ability_diag_v3`，24h 过期 + 断点恢复）。

### 1.2 核心可复用文件

| 文件 | 职责 | 复用方式 |
| --- | --- | --- |
| `js/scoring.js` | 计分引擎 `Scoring`，8 个 calc* 函数 + calcOverall + calcCognitive | 直接 require，纯逻辑 |
| `js/profile.js` | 角色卡生成 `Profile.generate()` | 直接 require，纯逻辑 |
| `js/validity.js` | 数据有效性检测 `Validity.check()` | 直接 require |
| `js/data/questions.js` | 题库 + 角色卡配置（唯一已 module.exports） | 直接 require |
| `js/app.js` + `js/renderers/*.js` | DOM 状态机 + 13个渲染器 | **弃用**，DOM 强耦合 |

### 1.3 权重不一致问题（已决策）

| 维度 | PRD 描述 | 代码实际 | 决策 |
| --- | --- | --- | --- |
| 知识层 | — | 15% | **采用代码实际值** |
| 认知层 | 45% | 50% | **采用代码实际值** |
| 问卷层 | 30% | 20% | **采用代码实际值** |
| 成绩层 | 25% | 15% | **采用代码实际值** |

**理由**：代码已经过 35/35 测试通过，是验证过的数据；PRD 的 45/30/25 是早期粗略描述。以代码为准，PRD 数据模型 5.1 节的 interface 描述不改变（只是底层算分权重用代码的），输出时做适配层映射到 PRD 的字段名。

### 1.4 LearnerProfile 数据结构差异（需适配层）

代码实际输出 vs PRD 5.1 interface：

| PRD 字段 | 代码实际字段 | 适配方式 |
| --- | --- | --- |
| `learnability` | `cognitive` | 字段重命名 |
| `traits` | `survey` | 字段重命名 |
| `roleCard.talent: 'logic'\|...` | `roleCard.talent: {label, desc}` | 取 label 映射到枚举 |
| `roleCard.mindsetType` | `roleCard.mindset: {label, desc}` | 取 label 映射到枚举 |
| `roleCard.trainingTips` | `roleCard.tips: []` | 字段重命名 |
| `meta.{studentId, gradeLevel, totalTimeMs, validFlag}` | 缺失 | 新增，从 E5 调度上下文注入 |
| `mbti: {type, e_i, ...}` | `mbti: string` | 保留代码简版，PRD 的细分维度不做 |
| — | `intake, validity, dimExplanations` | 丢弃，不进新表 |

**适配层位置**：后端 `services/diagnosisAdapter.js`，Profile.generate() 输出后做一次字段映射再落库。

### 1.5 复用难度：低
scoring.js / profile.js / validity.js / questions.js 是纯逻辑，已有 module.exports 兼容，Node 直接 require 可用。

### 1.6 提取改动清单
1. 4 个核心文件加 `module.exports` 包一层（questions.js 已有，其余3个加1行）
2. 删除 storage.js，改为 SQLite DAO 层
3. 弃用 app.js + renderers/*.js，改为 Express 路由 `POST /api/diagnosis/submit`
4. 新增 `diagnosisAdapter.js` 做字段映射
5. 角色卡配置（questions.js:350-375）保留，6 tiers / 7 talents / 5 mindsets 不变

---

## 二、ai-coach-prototype 调研结论（E2 攻克引擎）

### 2.1 架构性质
纯前端 HTML/CSS/JS（IIFE 模式），单知识点「配方法」原型，localStorage（key=`aicoach_prototype_v1`）。

### 2.2 核心可复用文件

| 文件 | 职责 | 复用方式 |
| --- | --- | --- |
| `js/data.js` | 知识点内容包模板（roleCards/methods/hints/三题结构） | **保留数据结构，重写全部内容为"空间向量与立体几何"** |
| `js/app.js` | 7阶段状态机 + 教法切换 + 分层追问逻辑 | 抽成纯函数 `teachStep(state, action)` 放后端 service |
| `js/state.js` | AppState + Store | 字段迁移到 LearningRecord 表，弃用 localStorage |

### 2.3 教学流程逻辑（可复用核心）

**7阶段状态机**：role→diagnosis→perception→practice→variation→cross→pass

**4教法矩阵切换**（app.js:282-296）：
- methods 对象键序：deduction / analogy / chunking / speedrun
- 当 nextHint > hints.length（3层追问用完）→ methodIndex++ → 重渲染 + 显示 methodSwitchText 过渡话术

**Socratic三层追问**（data.js:158-162）：
- 第1层：指向概念
- 第2层：指向步骤
- 第3层：示范留尾
- 触发：答错 → hintCount++ → 渲染对应层 hint

**错因树天然支持**：data.js 的 `options[].hint` 字段已天然支持"每错误选项一个错因标签"，PRD 5.3 的 errorPatterns 直接用这个结构。

### 2.4 空间向量与立体几何教学内容：不存在

现有内容是高一「配方法求顶点坐标」。`grep 空间向量|立体几何|向量` 全项目零命中。

**需要重写 data.js 内容包**：
- 知识点：空间向量与立体几何（人教版选择性必修一 第一章）
- 需要编写：3-4个子知识点 × 每个含（概念讲解 + 常考题3道 + 每题4选项含错因标签 + 3层Socratic追问hint + 变式题 + 跨章连接题）
- 这是本次开发中**内容工作量最大**的部分

### 2.5 复用难度：中
流程逻辑清晰但渲染混在 app.js 里，需要拆分。主要工作量在内容重写。

### 2.6 提取改动清单
1. 保留 data.js 数据结构模板，替换全部内容为空间向量与立体几何
2. app.js 的 renderQuestion + onQuestionPass 流转逻辑抽成纯函数 teachStep(state, action)
3. 弃用 state.js 的 localStorage，AppState 字段迁移到 LearningRecord 表
4. 角色卡选择改为接收 E1 的 LearnerProfile.roleCard 自动映射教法（替换手动选卡）
5. 错因树直接用 options[].hint 字段

---

## 三、Phase B 结论与 go/no-go

**go**。两块资产的核心逻辑代码质量高、可复用，主要工作集中在：
1. E1 适配层（字段映射，约1个文件）
2. E2 内容重写（空间向量与立体几何教学包，工作量最大）
3. E2 流程逻辑提取（app.js → teachStep 纯函数）

**无技术路线冲突，可进入 Phase C（风格定义）和 Phase D（开发）。**

**内容编写预警**：E2 空间向量与立体几何的教学内容（题目+错因标签+追问hint）是本次72h中最耗时的部分，建议在 Phase D 开发中优先启动内容编写，与代码开发并行。

# AI 自学提分平台 · 黑客松整合版 PRD v1.0（已确认）

> 日期：2026-08-23
> 状态：**已确认，可进入开发**
> 赛事：OFFMAP 黑客松，72h，Claude Sonnet 5
> 评审维度：精美前端 + 完整数据架构 + 网络安全
> 项目位置：`/Users/lzx/WorkBuddy/自学平台/hackathon-ai-tutor/`（独立新项目，不基于现有资产做壳，复用其核心逻辑代码）

---

## 〇、背景：为什么是这份 PRD

本项目第三次方向调整后的整合版：

1. **游戏方向（已否决）**：后室风格逃脱游戏，答题=撤离线索。用户判定"建模粗糙+没有教学效果"，果断放弃。
2. **AI教练方向（确认）**：转向"AI辅助学习的平台软件"，核心是"AI教你怎么快速学习"。
3. **本次收敛（本文档）**：用户进一步明确——**AI 首先是排课的人**。把学习目标和学习过程告诉 AI，AI 用舒大军「自学×AI」体系里提炼的 9 个可落地机制（已被整理为 5 引擎架构）帮你安排时间、盯进度，最终目的是让"AI 自学"这件事真正跑起来，而不是只做一个刷题+讲题的工具。

本文档基于对 4 块现有代码资产 + 8 份历史 PRD/调研文档的完整盘点，是唯一的整合基准。**此前所有关于游戏方向的 PRD/STYLE/knowledge-base 文档已失效，不再参考。**

---

## 一、一句话定位

**一个由 AI 全自动排课、督促、诊断、教练、刷题的自学提分系统：学生只需要告诉 AI 目标和学习过程，AI 按「诊断→攻克→记忆→反馈→调度」五引擎自动运转，把"学"这件事管起来。**

---

## 二、资产盘点结论（决策依据）

| 资产 | 定位 | 复用结论 |
| --- | --- | --- |
| `ability-diagnosis-v3/` | 认知+性格+知识三层诊断，35/35测试通过 | **直接复用为 E1 诊断引擎**，代码质量最高，模块化清晰 |
| `ai-coach-prototype/` | 角色卡驱动教学，4教法矩阵，Socratic三层追问 | **作为 E2 攻克引擎的教学模型主体** |
| `tifen-platform/` | 学练圈固七步，拖拽式SVG交互，错因提示树 | **借用其"错因提示树"设计思路**强化E2的卡点提示精度；拖拽动画因单知识点覆盖成本高，本次不做 |
| `self-study-platform/` | React+Vite+TS，樱花主题，闪卡+练习，已部署 | **不作为壳复用**（用户已决定另起新项目整合），仅参考其 SM-2 算法实现和视觉资产 |
| `docs/2026-08-17-提分机器执行方案.md` | 五引擎架构原始设计（E1-E5）+ 复用资产映射表 | **本 PRD 的架构骨架直接沿用**，本次调整仅提升 E5 优先级 |

**关键决策留白（已跟用户确认）**：E2 攻克引擎在两套竞品原型（ai-coach-prototype vs tifen-platform）间选择前者为主体，后者仅借用错因树思路，不做拖拽交互——如果 72h 内进度超预期，可加回。

---

## 三、产品架构：5 引擎 + 调度优先

```
学生输入：学习目标 + 当前学习过程/成绩
            │
            ▼
┌───────────────────────────┐
│      E5 调度引擎（核心）      │  ← 本次优先级提升
│   管时间 · 排优先级 · 督促    │
└───────────────────────────┘
            │            ↑
┌───────────┼────────────┼──────────┐
▼           ▼            │          │
┌──────────┐ ┌──────────┐     │    ┌──────────┐
│ E1 诊断   │→│ E2 攻克   │────┘    │ E4 反馈   │
│ 找薄弱点  │  │ 灭薄弱点  │          │ 全程动力  │
└──────────┘ └──────────┘          └──────────┘
     ▲             │
     │             ▼
     │       ┌──────────┐
     └───────│ E3 记忆   │
             │ 防遗忘   │
             └──────────┘
```

**本次调整核心**：E5 调度引擎从"配角"（原方案里排最后）提到架构中心——AI 的第一职责是"接收目标 → 生成计划 → 督促执行 → 记录过程 → 动态调整"，E1-E4 是被 E5 调用的能力模块，不是并列的功能入口。用户体验上，学生打开产品第一眼看到的不是"开始诊断"，而是"你的今日计划"。

---

## 四、核心功能优先级（本次用户确认）

| 优先级 | 功能 | 对应引擎 | 说明 |
| --- | --- | --- | --- |
| P0 | AI 排课与督促 | E5 调度 | 学生告知目标+学习过程 → AI 生成时间表 → 全程盯进度、提醒、动态调整 |
| P0 | AI 教练（引导+监督+提分提醒） | E2 攻克 + E4 反馈 | 教法矩阵+Socratic追问+卡点提示，覆盖"如何快速学" |
| P1 | 学力诊断与画像 | E1 诊断 | 复用 ability-diagnosis-v3，作为 E2/E5 的输入数据 |
| P1 | 自适应刷题闭环 | E2 + E3 | 学→练→测→过 四步 + SM-2 间隔重复 |

**技术栈要求（本次用户确认）**：需要真实数据库和资料库（Node/Express + SQLite 轻量真后端），不是纯前端 localStorage。UI/交互要求完整流畅、零卡顿。

**产品壳**：另起新项目整合，不基于现有任何一块资产做壳，架构从零设计但复用四块资产的核心逻辑代码。

---

## 五、数据模型

### 5.1 学生画像（复用 E1，来自 ability-diagnosis-v3）

```typescript
interface LearnerProfile {
  studentId: string;
  sessionId: string;
  completedAt: string;
  knowledge: { overall: number; language: number; math: number; general: number; };
  learnability: { overall: number; fluidReasoning: number; learningAbility: number;
    workingMemory: number; processingSpeed: number; cognitiveFlexibility: number; };
  traits: { overall: number; curiosity: number; selfDrive: number; resilience: number;
    mindset: number; metacognition: number; };
  mbti: { type: string; e_i: number; s_n: number; t_f: number; j_p: number; };
  roleCard: {
    tier: 1|2|3|4|5|6; title: string;
    talent: 'logic'|'memory'|'speed'|'flexible'|'balanced';
    mindsetType: '向阳心法'|'韧竹心法'|'静水心法'|'疾风心法'|'暗影心法';
    weakness: string; trainingTips: string[];
  };
  meta: { gradeLevel?: 'primary'|'middle'|'high'; totalTimeMs: number; validFlag: boolean; };
}
```

### 5.2 知识点掌握热力图（E1输出 / E2输入）

```typescript
interface KnowledgePoint {
  id: string;
  name: string;
  subject: 'math'|'english'|'chinese';
  grade: string;
  mastery: number;          // 0~100%
  scoreWeight: number;      // 分值权重
  priority: number;         // 可提分排行 = (1-mastery) × scoreWeight
  prerequisite: string[];
  status: 'unlearned'|'learning'|'mastered'|'reviewing';
  hasContent: boolean;      // 本次新增：标记该知识点是否已有完整教学内容（E2深挖）
}
```

### 5.3 学习记录（E2核心，融合角色卡教学+错因树）

```typescript
interface LearningRecord {
  studentId: string;
  knowledgePointId: string;
  teachingMethod: 'deduction'|'analogy'|'chunking'|'speedrun';  // 教法矩阵
  teachingAttempts: number;
  socraticResults: boolean[];        // 三层追问结果
  errorPatterns: string[];           // 借鉴 tifen-platform 错因树：每次答错记录具体错因标签
  practice: { base: number; variation: number; advanced: number; };
  crossChapterStatus: 'pending'|'passed'|'failed';
  status: 'unlearned'|'learning'|'mastered'|'reviewing';
}
```

### 5.4 错题本（E3记忆引擎）

```typescript
interface WrongQuestion {
  id: string;
  knowledgePointId: string;
  category: '粗心'|'半懂'|'盲区';
  errorReason: string;            // 错因树命中的具体原因
  firstWrongAt: string;
  reviewSchedule: string[];       // SM-2: 当天/3天/7天/15天/考前
  streak: number;
  status: 'pending'|'mastered';
}
```

### 5.5 调度计划（E5，本次新增，此前无实现）

```typescript
interface SchedulePlan {
  studentId: string;
  goal: { targetExam: string; targetScore?: number; deadline: string; };
  dailyBudgetMinutes: number;      // 学生真实可学习时长，非固定6h满排
  weekPlan: {
    date: string;
    blocks: {
      type: 'review'|'attack'|'weekly_test';
      knowledgePointId?: string;
      plannedMinutes: number;
      actualMinutes?: number;
      status: 'pending'|'done'|'skipped';
    }[];
  }[];
  reminders: { type: 'start'|'break'|'overdue'; scheduledAt: string; sent: boolean; }[];
  adjustHistory: { date: string; reason: string; change: string; }[];  // 动态调整记录
}
```

### 5.6 学生账号（本次新增，极简注册体系）

```typescript
interface StudentAccount {
  studentId: string;       // 主键，UUID
  username: string;        // 唯一，登录用
  passwordHash: string;    // bcrypt 哈希，绝不存明文
  gradeLevel: 'high1'|'high2'|'high3';  // 高一/高二/高三
  createdAt: string;
}
```

---

## 六、五引擎详细设计

### E1 诊断引擎（复用 ability-diagnosis-v3，改动最小）

- 三层测评：认知45%（Gf/Glr/Gwm/Gs/CF）+ 问卷30%（自主性/元认知/学校经历/学习卡点）+ 成绩25%（8科自评）
- 输出 `LearnerProfile`，含剑道六段角色卡
- **新增改动**：诊断完成后自动触发 E5 生成首份 `SchedulePlan`（此前无此联动，是本次整合的关键缝合点）

### E2 攻克引擎（主体复用 ai-coach-prototype，融合 tifen-platform 错因树）

每个知识点走：**前置诊断（不信嘴）→ 最小感知（SVG体感动画）→ 以题代教（常考题）→ 分层追问（三层Socratic）→ 教法切换（4种教法，三层用完自动换）→ 变式题 → 跨章连接**

- **错因提示升级**（借鉴 tifen-platform）：不再是通用的分层提示，改为**每个错误选项预标注具体错因标签**（如"h要反号，你没反"），提示更精确
- AI 三禁令（舒大军体系）：禁止直给答案、禁止无差别刷题、禁止排名羞辱
- **本次范围确认**：教学内容深挖仅覆盖 **高二数学·空间向量与立体几何（人教版选择性必修一 第一章）**，其余知识点仅有目录框架（见 E5 知识点目录）

### E3 记忆引擎（新增实现，参考 eng-vocab 的 SM-2）

- 错题自动分类：粗心（不占额度）/ 半懂（重点攻克）/ 盲区（先学再练）
- SM-2 排期：当天→3天→7天→15天→考前，做错重置、做对延长
- 错题三步复盘：重做找卡点 → 合答案完整写一遍 → 3道同类题验证

### E4 反馈引擎（新增实现）

- 0.5秒即时判对错 + 卡点提示（不给答案）
- 难度自适应：70%会做+30%挑战
- 游戏化外壳：进度条、段位、连击，**只跟自己比，不做排名**

### E5 调度引擎（本次新增，架构核心）

这是本次整合的核心新增能力，此前 4 块资产均无实现：

**输入**：学生目标（目标考试/目标分数/deadline）+ 当前学习过程（E1诊断结果 + 每日实际学习记录）

**处理**：

1. 优先级排序：`(1-掌握度) × 分值权重`，高分值高薄弱先打
2. 按**学生真实可学习时长**排课（非固定满排），单日模板：开机错题回访(5min) → 攻克块×N(每块~30min) → 收尾复盘(5min)
3. 全程督促：到点提醒开始、超时提醒休息、当日未完成次日追加
4. 动态调整：根据 E4 记录的实际完成情况，实时增减后续计划密度
5. 周循环：周一到周六攻克，周日周测复诊（对接E1复诊）

**知识点目录范围**（本次确认，仅目录，非教学内容）：

- 覆盖高一、高二、高三**数学全学科全年级**的知识点目录：名称、所属年级/章节、分值权重、先修关系
- 每个知识点标记 `hasContent` 字段：仅"空间向量与立体几何"章节为 `true`（有完整 E2 教学内容），其余为 `false`（可参与 E5 排课演示优先级排序，点开显示"内容开发中"）
- 这样设计的原因：让 E1 诊断 + E5 调度能演示"全局最优排课"的完整效果，同时不需要在 72h 内为三年数学内容逐个编写教学素材

**输出**：`SchedulePlan` + 每日/每周提醒事件

---

## 七、技术栈

| 层 | 选型 | 理由 |
| --- | --- | --- |
| 前端 | React + Vite + TypeScript | 复用 self-study-platform 的技术选型经验，UI组件可迁移（樱花主题/闪卡/进度组件） |
| 后端 | Node.js + Express | 轻量真后端，满足"需要数据库"的硬要求，72h内可控 |
| 数据库 | SQLite（better-sqlite3） | 零运维成本，单文件持久化，足够黑客松演示规模 |
| 认证 | **极简注册（用户名+密码）**，bcrypt 哈希 + session/JWT | 本次确认：跳过完整账号体系（找回密码/邮箱验证等），但密码不能明文存储 |
| 输入校验 | zod | 所有 API 入口做 schema 校验 |
| 部署 | 本地或云端静态+API合并部署 | 视黑客松评审形式定 |

**安全提示（必须落实，不能跳过）**：一旦引入真后端 + 数据库，即产生网络暴露面。评审维度里明确写了"网络安全"，72h里至少要做到：

- SQL 全部走参数化查询（better-sqlite3 prepared statement），杜绝字符串拼接 SQL
- 所有 API 输入用 zod 做 schema 校验，拒绝非法请求
- 密码用 bcrypt 哈希存储，绝不存明文或弱哈希（MD5/SHA1）
- 无敏感信息硬编码（数据库路径、密钥走 .env，.env 不进 git）
- CORS 合理配置（仅允许演示域名/本地地址，不用 `*` 通配）
- session/JWT 密钥用随机生成，不用默认值

---

## 八、MVP 范围

### In Scope（72h 黑客松交付）

- E5 调度引擎：目标输入 → 生成周计划 → 每日提醒 → 完成度记录 → 简单动态调整
- E5 知识点目录：高一高二高三数学全学科全年级知识点框架（名称+分值权重+先修关系+hasContent标记）
- E1 诊断：复用 ability-diagnosis-v3 核心逻辑，接入新后端存储
- E2 攻克：**高二数学·空间向量与立体几何**（人教版选择性必修一 第一章）完整教学闭环，角色卡+教法切换+错因追问
- E3 记忆：SM-2 排期 + 错题三分类，真实持久化到数据库
- E4 反馈：即时判题+进度可视化
- 极简账号体系：用户名+密码注册/登录，bcrypt 哈希，session 维持登录态
- 真后端：Node/Express/SQLite，覆盖 StudentAccount / LearnerProfile / KnowledgePoint / LearningRecord / WrongQuestion / SchedulePlan 六张表

### Out of Scope（本次不做）

- 高一高二高三数学全部知识点的**完整教学内容**（只做目录框架，教学内容仅深挖空间向量与立体几何）
- 英语/语文等其他学科的教学内容（目录框架也不强制要求，视时间而定）
- tifen-platform 的拖拽式SVG交互（用其错因树思路，不做动画）
- 移动端适配
- 排名/社交/排行榜
- 完整账号体系（找回密码、邮箱验证、第三方登录等）
- 漫画叙事资产（考卷世界/坍缩纪元，保留不删，不进本次范围）

---

## 九、成功指标

| 指标 | 目标 |
| --- | --- |
| 计划生成到执行的闭环可演示 | 学生注册登录 → 输入目标 → 拿到周计划 → 模拟走完1天 → 系统记录+调整 |
| 诊断→攻克→记忆 数据贯通 | 诊断结果能驱动攻克难度，攻克错题能进记忆排期，全部落库可查 |
| 冒烟测试 | 主流程零崩溃，console零error，接口无404/500 |
| UI 流畅度 | 交互无卡顿，评审可直观感受"精美前端" |
| 安全基线 | SQL参数化、输入校验、密码哈希、CORS配置、无硬编码密钥，五项全部落实 |

---

## 十、本次确认变更记录

相较于用户初稿，本次对话确认了以下 3 个关键决策点：

1. **认证方式**：极简注册（用户名+密码），非固定测试ID，也非完整账号体系——支持多学生演示 E5 的个性化排课效果
2. **E2 知识点范围**：新增 `hasContent` 字段区分"目录框架"和"深挖内容"——E1诊断+E5调度覆盖高一高二高三数学全学科全年级的知识点目录（框架级），E2教学内容深挖聚焦"高二数学·空间向量与立体几何"（人教版选择性必修一第一章）1个知识点验证闭环，避免与 PRD 原定"1-2个知识点"的范围冲突
3. **项目位置**：新建独立目录 `hackathon-ai-tutor/`，不基于现有4块资产做壳

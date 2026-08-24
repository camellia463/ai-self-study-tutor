import { useState, useEffect, useRef } from 'react'
import { api } from '../api'
import QuestionBankModule from '../data/questions'
import MatrixGenModule from '../data/matrix-svg'

// 兼容 CJS/ESM 导出
const QUESTION_BANK = (QuestionBankModule as any).QUESTION_BANK || QuestionBankModule
const MatrixGen = (MatrixGenModule as any).MatrixGen || MatrixGenModule

// ============ 题库汇总 ============
const matrixQ = QUESTION_BANK.matrix.map((q: any, i: number) => ({ type: 'matrix', ...q, svg: MatrixGen.generate(i) }))
const spriteQ = QUESTION_BANK.sprite.confirm_tests.map((q: any) => ({ type: 'sprite', ...q }))
const digitQ = QUESTION_BANK.digit_span.map((q: any) => ({ type: 'digit', ...q }))
const symbolQ = QUESTION_BANK.symbol_match.map((q: any) => ({ type: 'symbol', ...q }))
const stroopQ = QUESTION_BANK.stroop.map((q: any) => ({ type: 'stroop', ...q }))

const COGNITIVE_TESTS = [...matrixQ, ...spriteQ, ...digitQ, ...symbolQ, ...stroopQ]

const surveyQ = [
  ...QUESTION_BANK.survey.autonomy.map((q: any) => ({ ...q, group: 'autonomy' })),
  ...QUESTION_BANK.survey.metacognition.map((q: any) => ({ ...q, group: 'metacognition' })),
  ...QUESTION_BANK.survey.school.map((q: any) => ({ ...q, group: 'school' })),
  ...QUESTION_BANK.survey.painPoints.map((q: any) => ({ ...q, group: 'painPoints' }))
]

const GRADES = QUESTION_BANK.grades.subjects
const LEVELS = QUESTION_BANK.grades.levels
const LEVEL_SCORES = QUESTION_BANK.grades.levelScores

// ============ 主组件 ============
export default function Diagnosis() {
  const [hasProfile, setHasProfile] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'report' | 'welcome' | 'cognitive' | 'spriteTeach' | 'survey' | 'grades'>('report')

  // 认知题作答
  const [cogIdx, setCogIdx] = useState(0)
  const [cogResults, setCogResults] = useState<any[]>([])
  const [spriteStage, setSpriteStage] = useState(0) // 0=教学 1=回忆

  // 问卷
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, number>>({})
  const [surveyIdx, setSurveyIdx] = useState(0)

  // 成绩
  const [gradeAnswers, setGradeAnswers] = useState<Record<string, string>>({})

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    try {
      const res = await api.getProfile()
      setHasProfile(res.hasProfile)
      if (res.hasProfile) setProfile(res.profile)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (loading) return <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>加载中...</div>

  // ===== 报告页 =====
  if (hasProfile && phase === 'report') {
    const rc = profile.roleCard
    const tierNames = ['', '学徒', '初阶剑士', '中阶剑士', '高阶剑士', '剑豪', '剑圣']
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>学力诊断报告</h1>
          <button className="btn-secondary" onClick={() => { setPhase('welcome'); setCogIdx(0); setCogResults([]); setSurveyIdx(0); setSurveyAnswers({}); setGradeAnswers({}) }}>重新诊断</button>
        </div>
        <div className="role-card" style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
            {tierNames[rc.tier]} · {rc.talent}
          </div>
          <div style={{ fontSize: 'var(--text-lg)', opacity: 0.9, marginBottom: 'var(--space-md)' }}>{rc.mindsetType}</div>
          <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginBottom: 'var(--space-md)' }}>弱点：{rc.weakness}</div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {(rc.trainingTips || []).map((tip: string, i: number) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: 'var(--text-xs)' }}>{tip}</span>
            ))}
          </div>
        </div>
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card"><div className="stat-card-value">{profile.overall}</div><div className="stat-card-label">综合评分</div></div>
          <div className="stat-card"><div className="stat-card-value">{profile.knowledge.overall}</div><div className="stat-card-label">知识水平</div></div>
          <div className="stat-card"><div className="stat-card-value">{profile.cognitive.overall}</div><div className="stat-card-label">认知能力</div></div>
          <div className="stat-card"><div className="stat-card-value">{profile.traits.overall}</div><div className="stat-card-label">学习特质</div></div>
        </div>
        <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>认知维度详情</h3>
          {[['fluidReasoning', '流体推理'], ['learningAbility', '学习能力'], ['workingMemory', '工作记忆'], ['processingSpeed', '加工速度'], ['cognitiveFlexibility', '认知灵活性']].map(([dim, label]) => (
            <div key={dim} style={{ marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                <span style={{ fontSize: 'var(--text-sm)' }}>{label}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{profile.cognitive[dim]}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${profile.cognitive[dim]}%`, background: profile.cognitive[dim] >= 60 ? 'var(--color-success)' : 'var(--color-primary)' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ===== 欢迎页 =====
  if (phase === 'welcome') {
    return (
      <div>
        <h1 className="page-title">AI 学力筛选</h1>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
            <strong>两部分组成，各占一半：</strong>
          </p>
          <p style={{ marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
            🎯 <strong>图像认知题（{COGNITIVE_TESTS.length} 道）</strong><br />
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>矩阵推理 · 精灵记忆 · 数字广度 · 符号匹配 · 颜色判断<br />客观测量：你的推理水平和学新东西的速度</span>
          </p>
          <p style={{ marginBottom: 'var(--space-lg)', lineHeight: 1.8 }}>
            📝 <strong>性格问卷（{surveyQ.length} 道）</strong><br />
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>学习原动力 · 元认知 · 学校经历 · 学习卡点</span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-lg)' }}>
            图像题没有标准答案，凭第一直觉作答。最后录入学科成绩。
          </p>
          <button className="btn-primary" onClick={() => setPhase('spriteTeach')}>开始评估</button>
        </div>
      </div>
    )
  }

  // ===== 精灵记忆教学阶段 =====
  if (phase === 'spriteTeach') {
    const pairs = QUESTION_BANK.sprite.teaching_pairs
    if (spriteStage === 0) {
      return (
        <div>
          <PageHead step="2/6" title="精灵记忆 · 认识精灵" />
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>记住下面 4 个精灵和它们的名字（记 5 秒），之后会考你。</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
              {pairs.map(p => (
                <div key={p.id} className="sprite-card">
                  <div style={{ fontSize: 48 }}>{p.emoji}</div>
                  <div style={{ fontWeight: 600, marginTop: 4 }}>{p.name}</div>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={() => { setSpriteStage(1); setPhase('cognitive') }}>记住啦，开始回忆</button>
          </div>
        </div>
      )
    }
    return null
  }

  // ===== 认知题阶段 =====
  if (phase === 'cognitive') {
    // 数字广度教学提示：先展示序列
    return <CognitiveTest
      test={COGNITIVE_TESTS[cogIdx]}
      idx={cogIdx}
      total={COGNITIVE_TESTS.length}
      spritePairs={QUESTION_BANK.sprite.teaching_pairs}
      onResult={(res: any) => {
        const next = [...cogResults, res]
        setCogResults(next)
        const done = cogIdx + 1 >= COGNITIVE_TESTS.length
        if (done) {
          submitResults(next)
        } else {
          setCogIdx(i => i + 1)
        }
      }}
      onBack={() => cogIdx === 0 ? setPhase('welcome') : setCogIdx(i => i - 1)}
    />
  }

  // ===== 问卷阶段 =====
  if (phase === 'survey') {
    const q = surveyQ[surveyIdx]
    return (
      <div>
        <PageHead step={`4/6 · 问卷 ${surveyIdx + 1}/${surveyQ.length}`} title="性格问卷" />
        <div className="card">
          <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-xl)' }}>{q.statement}</p>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            {['完全不符合', '不太符合', '说不清', '比较符合', '非常符合'].map((label, i) => {
              const val = i + 1
              const isSel = surveyAnswers[q.id] === val
              return (
                <button key={i} className="btn-secondary" onClick={() => setSurveyAnswers(s => ({ ...s, [q.id]: val }))}
                  style={{ borderColor: isSel ? 'var(--color-primary)' : undefined, background: isSel ? 'var(--bg-secondary)' : undefined }}>
                  {label}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-lg)' }}>
            <button className="btn-secondary" onClick={() => setSurveyIdx(i => Math.max(0, i - 1))}>上一题</button>
            <button className="btn-primary" disabled={surveyAnswers[q.id] === undefined}
              onClick={() => {
                if (surveyIdx + 1 >= surveyQ.length) setPhase('grades')
                else setSurveyIdx(i => i + 1)
              }}>
              {surveyIdx + 1 >= surveyQ.length ? '下一步：成绩录入' : '下一题'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== 成绩阶段 =====
  if (phase === 'grades') {
    return (
      <div>
        <PageHead step="5/6" title="学科成绩录入" />
        <div className="card">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>凭最近一次考试印象选择（五级）。</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
            {GRADES.map((s: any) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{ width: 80 }}>{s.icon} {s.id}</span>
                <select className="input-field" value={gradeAnswers[s.id] || ''} onChange={e => setGradeAnswers(g => ({ ...g, [s.id]: e.target.value }))}>
                  <option value="">选择</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ marginTop: 'var(--space-lg)' }} onClick={() => submitAll()}>生成诊断报告</button>
        </div>
      </div>
    )
  }

  return null

  // ===== 提交计算 =====
  function submitResults(results: any[]) {
    const gradeKey = {
      matrix: 'fluidReasoning', digit: 'workingMemory', symbol: 'processingSpeed',
      stroop: 'cognitiveFlexibility', sprite: 'learningAbility'
    }
    const dims: Record<string, number[]> = { fluidReasoning: [], workingMemory: [], processingSpeed: [], cognitiveFlexibility: [], learningAbility: [] }
    results.forEach(r => {
      const dim = gradeKey[r.type as keyof typeof gradeKey]
      if (dim && dims[dim]) dims[dim].push(r.score)
    })
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 50
    const cognitive = {
      fluidReasoning: avg(dims.fluidReasoning),
      workingMemory: avg(dims.workingMemory),
      processingSpeed: avg(dims.processingSpeed),
      cognitiveFlexibility: avg(dims.cognitiveFlexibility),
      learningAbility: avg(dims.learningAbility)
    }
    setPhase('survey')
    window.__cogResults = cognitive
  }

  function submitAll() {
    const cog = window.__cogResults || {}
    // 问卷计算 traits（5维）
    const groups: Record<string, number[]> = { autonomy: [], metacognition: [], school: [], painPoints: [] }
    surveyQ.forEach(q => {
      const raw = surveyAnswers[q.id] || 3
      const val = q.reversed ? 6 - raw : raw
      groups[q.group].push(val)
    })
    const avgG = (k: string) => { const a = groups[k]; return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 3 }
    const norm = (v: number) => Math.round(Math.max(10, Math.min(100, v / 5 * 100)))
    const traits = {
      curiosity: norm(avgG('autonomy')),
      selfDrive: norm(avgG('autonomy')),
      resilience: norm(avgG('school')),
      mindset: norm(5 - avgG('painPoints')),
      metacognition: norm(avgG('metacognition'))
    }
    // 成绩（8科 → knowledge）
    const grades: Record<string, number> = {}
    GRADES.forEach((s: any) => { grades[s.id] = LEVEL_SCORES[gradeAnswers[s.id]] ?? 50 })
    const gradeKeys: Record<string, string> = { '语文': 'chinese', '数学': 'math', '英语': 'english', '物理': 'physics', '化学': 'chemistry', '生物': 'biology', '历史': 'history', '地理': 'geography' }
    const knowledgeGrades: Record<string, number> = {}
    Object.entries(grades).forEach(([k, v]) => { knowledgeGrades[gradeKeys[k] || k] = v })

    setLoading(true)
    api.submitDiagnosis({ answers: { grades: knowledgeGrades, cognitive: cog, survey: traits } })
      .then(res => { setProfile(res.profile); setHasProfile(true); setPhase('report') })
      .catch((err: any) => alert('提交失败：' + err.message))
      .finally(() => setLoading(false))
  }
}

declare global { interface Window { __cogResults?: any } }

// ============ 认知题渲染 ============
function CognitiveTest({ test, idx, total, spritePairs, onResult, onBack }: any) {
  const [selected, setSelected] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [showSeq, setShowSeq] = useState(true)
  const [timerLeft, setTimerLeft] = useState(40)
  const [matchIdx, setMatchIdx] = useState(0)
  const [matchCorrect, setMatchCorrect] = useState(0)

  // 数字广度：先展示序列
  useEffect(() => {
    if (test.type === 'digit') {
      setShowSeq(true)
      const t = setTimeout(() => setShowSeq(false), 3000)
      return () => clearTimeout(t)
    }
  }, [test.id])

  // 符号匹配/Stroop 限时
  useEffect(() => {
    if (test.type === 'symbol') {
      setTimerLeft(40); setMatchIdx(0); setMatchCorrect(0)
      const t = setInterval(() => setTimerLeft(x => { if (x <= 1) { clearInterval(t); return 0 } return x - 1 }), 1000)
      return () => clearInterval(t)
    }
  }, [test.id])

  const submitScore = (score: number) => {
    onResult({ type: test.type, id: test.id, score })
    setSelected(null); setInput(''); setMatchIdx(0); setMatchCorrect(0)
  }

  // ===== 数字广度（显示阶段） =====
  if (test.type === 'digit' && showSeq) {
    return (
      <div>
        <PageHead step={`3/6 · 认知 ${idx + 1}/${total}`} title={test.type === 'backward' ? '倒序记忆' : '数字广度'} />
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
            {test.type === 'backward' ? '记住后要<b>倒着</b>说出来' : '记住这串数字'}（{test.sequence.length} 位）：
          </p>
          <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 600, letterSpacing: '0.4em', color: 'var(--color-primary-dark)' }}>
            {test.sequence.join(' ')}
          </div>
        </div>
      </div>
    )
  }

  // ===== 数字广度（输入阶段） =====
  if (test.type === 'digit') {
    const expected = test.type === 'backward' ? [...test.sequence].reverse() : test.sequence
    return (
      <div>
        <PageHead step={`3/6 · 认知 ${idx + 1}/${total}`} title="数字回忆" />
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>{test.type === 'backward' ? '倒序输入' : '按顺序输入'}（空格分隔）：</p>
          <input className="input-field" style={{ textAlign: 'center', maxWidth: 300, margin: '0 auto' }} placeholder="如 7 3 9" value={input} onChange={e => setInput(e.target.value)} autoFocus />
          <button className="btn-primary" style={{ marginTop: 'var(--space-md)' }} disabled={!input.trim()}
            onClick={() => submitScore(input.trim().split(/\s+/).map(Number).join(',') === expected.join(',') ? 100 : 0)}>
            提交
          </button>
        </div>
      </div>
    )
  }

  // ===== 矩阵推理 =====
  if (test.type === 'matrix') {
    const correct = test.svg.options[test.correctIndex]
    return (
      <div>
        <PageHead step={`3/6 · 认知 ${idx + 1}/${total}`} title="矩阵推理" />
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>找出 3×3 矩阵中问号处应填入的图形：</p>
          <div dangerouslySetInnerHTML={{ __html: test.svg.matrixSVG }} />
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
            {test.svg.options.map((optSvg: string, i: number) => (
              <div key={i} className="option-item" style={{ padding: 8, borderColor: selected === i ? (i === test.correctIndex ? 'var(--color-success)' : 'var(--color-danger)') : undefined }}
                onClick={() => { if (selected !== null) return; setSelected(i); setTimeout(() => submitScore(i === test.correctIndex ? 100 : 0), 500) }}>
                <div dangerouslySetInnerHTML={{ __html: optSvg }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ===== 精灵记忆 =====
  if (test.type === 'sprite') {
    const pair = spritePairs.find((p: any) => p.id === test.pair_id)
    return (
      <div>
        <PageHead step={`3/6 · 认知 ${idx + 1}/${total}`} title="精灵记忆" />
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>这个精灵叫什么名字？</p>
          <div style={{ fontSize: 72, marginBottom: 'var(--space-lg)' }}>{pair?.emoji}</div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {test.options.map((opt: string, i: number) => (
              <button key={i} className="btn-secondary" style={{ minWidth: 100, borderColor: selected === i ? (i === test.correctIndex ? 'var(--color-success)' : 'var(--color-danger)') : undefined }}
                onClick={() => { if (selected !== null) return; setSelected(i); setTimeout(() => submitScore(i === test.correctIndex ? 100 : 0), 500) }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ===== 符号匹配 =====
  if (test.type === 'symbol') {
    const keyMap = test.key
    const seq = test.sequence
    if (timerLeft <= 0) return <TimeUpCard title="符号匹配" onDone={() => submitScore(Math.round(matchCorrect / seq.length * 100))} />
    const cur = seq[matchIdx]
    return (
      <div>
        <PageHead step={`3/6 · 认知 ${idx + 1}/${total}`} title={`符号匹配 · 剩余 ${timerLeft}s`} />
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>对照表：</p>
          <div style={{ display: 'flex', gap: 'var(--space-lg)', justifyContent: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
            {Object.entries(keyMap).map(([sym, num]) => (
              <div key={sym} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32 }}>{sym}</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{num}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 56, marginBottom: 'var(--space-lg)' }}>{cur}</div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
            {Object.values(keyMap).map((num, i) => (
              <button key={i} className="btn-secondary" style={{ minWidth: 60 }}
                onClick={() => {
                  const correct = keyMap[cur] === String(num)
                  const nc = matchCorrect + (correct ? 1 : 0)
                  setMatchCorrect(nc)
                  const ni = matchIdx + 1
                  if (ni >= seq.length) { setTimerLeft(0); submitScore(Math.round(nc / seq.length * 100)) }
                  else setMatchIdx(ni)
                }}>
                {num}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 'var(--space-md)' }}>
            <span className="badge">{matchIdx + 1} / {seq.length}</span>
          </div>
        </div>
      </div>
    )
  }

  // ===== Stroop 颜色 =====
  if (test.type === 'stroop') {
    return (
      <div>
        <PageHead step={`3/6 · 认知 ${idx + 1}/${total}`} title="颜色判断" />
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>这个字<strong>显示的颜色</strong>是？（忽略字义）</p>
          <div style={{ fontSize: 72, fontWeight: 700, color: test.inkColor, marginBottom: 'var(--space-xl)' }}>{test.word}</div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {test.options.map((opt: string, i: number) => (
              <button key={i} className="btn-secondary" style={{ minWidth: 80, borderColor: selected === i ? (i === test.correctIndex ? 'var(--color-success)' : 'var(--color-danger)') : undefined }}
                onClick={() => { if (selected !== null) return; setSelected(i); setTimeout(() => submitScore(i === test.correctIndex ? 100 : 0), 500) }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return <div>题目加载中...</div>
}

function TimeUpCard({ title, onDone }: { title: string; onDone: () => void }) {
  return (
    <div>
      <PageHead step="3/6" title={title} />
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>时间到 ⏰</p>
        <button className="btn-primary" onClick={onDone}>继续</button>
      </div>
    </div>
  )
}

function PageHead({ step, title }: { step: string; title: string }) {
  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <h1 className="page-title" style={{ marginBottom: 'var(--space-xs)' }}>{title}</h1>
      <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{step}</div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { api } from '../api'

// ============ 测试数据 ============
const ANALOGY_QUESTIONS = [
  { q: '老师 : 学生 = 医生 : ？', options: ['医院', '病人', '药', '护士'], answer: 1 },
  { q: '鸟 : 天空 = 鱼 : ？', options: ['水', '海藻', '船', '潜水'], answer: 0 },
  { q: '手 : 手指 = 树 : ？', options: ['森林', '树叶', '根', '果实'], answer: 1 },
  { q: '火 : 热 = 冰 : ？', options: ['冷', '水', '滑', '硬'], answer: 0 },
  { q: '书籍 : 阅读 = 乐器 : ？', options: ['声音', '演奏', '音符', '舞台'], answer: 1 }
]

const STROOP_ITEMS = [
  { word: '红', colorIndex: 1 }, // 字"红"，颜色是绿色
  { word: '蓝', colorIndex: 2 },
  { word: '绿', colorIndex: 0 },
  { word: '黄', colorIndex: 3 },
  { word: '蓝', colorIndex: 0 },
  { word: '红', colorIndex: 3 },
  { word: '绿', colorIndex: 2 },
  { word: '黄', colorIndex: 1 }
]
const STROOP_COLORS = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B']
const STROOP_NAMES = ['红', '绿', '蓝', '黄']

const SUBJECTS = [
  { key: 'chinese', label: '语文' }, { key: 'math', label: '数学' }, { key: 'english', label: '英语' },
  { key: 'physics', label: '物理' }, { key: 'chemistry', label: '化学' }, { key: 'biology', label: '生物' },
  { key: 'politics', label: '政治' }, { key: 'history', label: '历史' }, { key: 'geography', label: '地理' }
]

const SURVEY_ITEMS = [
  { key: 'curiosity', label: '好奇心', desc: '遇到新知识时，我很好奇想弄明白' },
  { key: 'selfDrive', label: '自主性', desc: '我不需要别人催，自己就会去学' },
  { key: 'resilience', label: '韧性', desc: '做错题/考砸后，我能很快振作继续' },
  { key: 'mindset', label: '成长心态', desc: '我相信能力是可以练出来的' },
  { key: 'metacognition', label: '元认知', desc: '学完后我会反思"我是怎么学会的"' }
]

// ============ 主组件 ============
export default function Diagnosis() {
  const [hasProfile, setHasProfile] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(-1)  // -1=报告页, 0=欢迎, 1=成绩, 2=数字广度, 3=舒尔特, 4=类比, 5=stroop, 6=问卷

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

  // 已有报告 → 展示（可重新诊断）
  if (hasProfile && step === -1) {
    const rc = profile.roleCard
    const tierNames = ['', '初心者', '修学者', '探索者', '攻坚者', '精进者', '大师']
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>学力诊断报告</h1>
          <button className="btn-secondary" onClick={() => setStep(0)}>重新诊断</button>
        </div>

        <div className="role-card" style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
            {tierNames[rc.tier]} · {rc.talent}
          </div>
          <div style={{ fontSize: 'var(--text-lg)', opacity: 0.9, marginBottom: 'var(--space-md)' }}>{rc.mindsetType}</div>
          <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginBottom: 'var(--space-md)' }}>弱点：{rc.weakness}</div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {rc.trainingTips.map((tip: string, i: number) => (
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
          {['fluidReasoning', 'learningAbility', 'workingMemory', 'processingSpeed', 'cognitiveFlexibility'].map(dim => {
            const labels: Record<string, string> = { fluidReasoning: '流体推理', learningAbility: '学习能力', workingMemory: '工作记忆', processingSpeed: '加工速度', cognitiveFlexibility: '认知灵活性' }
            const val = profile.cognitive[dim]
            return (
              <div key={dim} style={{ marginBottom: 'var(--space-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                  <span style={{ fontSize: 'var(--text-sm)' }}>{labels[dim]}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{val}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${val}%`, background: val >= 60 ? 'var(--color-success)' : 'var(--color-primary)' }}></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ============ 各步骤 ============
  if (step === -1) return null

  if (step === 0) {
    return (
      <div>
        <h1 className="page-title">学力诊断</h1>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
            通过 5 个小测试，测量你的认知能力（工作记忆 / 加工速度 / 流体推理 / 认知灵活性）
            和学习特质，生成专属诊断报告。约需 5 分钟。
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-lg)' }}>
            第 1 步：成绩自评 → 第 2 步：数字记忆 → 第 3 步：舒尔特方格 → 第 4 步：类比推理 → 第 5 步：颜色干扰 → 第 6 步：问卷
          </p>
          <button className="btn-primary" onClick={() => setStep(1)}>开始诊断</button>
        </div>
      </div>
    )
  }

  if (step === 1) return <GradeStep onNext={() => setStep(2)} onBack={() => setStep(0)} />
  if (step === 2) return <DigitSpanStep onNext={() => setStep(3)} onBack={() => setStep(1)} />
  if (step === 3) return <SchulteStep onNext={() => setStep(4)} onBack={() => setStep(2)} />
  if (step === 4) return <AnalogyStep onNext={() => setStep(5)} onBack={() => setStep(3)} />
  if (step === 5) return <StroopStep onNext={() => setStep(6)} onBack={() => setStep(4)} />
  if (step === 6) return <SurveyStep onSubmit={submitAll} onBack={() => setStep(5)} />

  async function submitAll(answers: any) {
    setLoading(true)
    try {
      const res = await api.submitDiagnosis(answers)
      setProfile(res.profile)
      setHasProfile(true)
      setStep(-1)
    } catch (err: any) {
      alert('提交失败：' + (err.message || '未知错误'))
    }
    setLoading(false)
  }

  return null
}

// ============ 步骤1：成绩自评 ============
function GradeStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [grades, setGrades] = useState<Record<string, number>>({})
  return (
    <div>
      <StepHeader step={1} total={6} title="成绩自评" />
      <div className="card">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>最近一次考试成绩（满分 100），想不起来就留空（按 50 计）。</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
          {SUBJECTS.map(s => (
            <div key={s.key}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{s.label}</label>
              <input className="input-field" type="number" min={0} max={100} placeholder="80"
                value={grades[s.key] ?? ''} onChange={e => setGrades(g => ({ ...g, [s.key]: Number(e.target.value) }))} />
            </div>
          ))}
        </div>
      </div>
      <StepNav onBack={onBack} onNext={onNext} nextLabel="下一步：数字记忆" />
      {/* 把成绩存到全局以便提交 */}
      <GlobalStore field="grades" value={grades} />
    </div>
  )
}

// ============ 步骤2：数字广度（工作记忆） ============
function DigitSpanStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [showDigits, setShowDigits] = useState(false)
  const [input, setInput] = useState('')
  const [results, setResults] = useState<boolean[]>([])
  const [phase, setPhase] = useState<'show' | 'input'>('show')
  const timerRef = useRef<any>(null)

  const sequences = [
    [7, 3, 9, 2, 5],
    [4, 8, 1, 6, 9, 3, 7],
    [2, 9, 5, 3, 8, 4, 7, 1, 6]
  ]

  useEffect(() => {
    if (phase === 'show') {
      setShowDigits(true)
      timerRef.current = setTimeout(() => { setShowDigits(false); setPhase('input') }, 3000)
    }
    return () => clearTimeout(timerRef.current)
  }, [round, phase])

  const handleSubmit = () => {
    const seq = sequences[round]
    const correct = input.trim().split(/\s+/).map(Number).join(',') === seq.join(',')
    const newResults = [...results, correct]
    setResults(newResults)
    setInput('')
    if (round < 2) {
      setRound(r => r + 1)
      setPhase('show')
    } else {
      const score = Math.round(newResults.filter(Boolean).length / 3 * 100)
      GlobalStore.save('cognitive_workingMemory', score)
      GlobalStore.save('_digitResults', newResults)
      onNext()
    }
  }

  if (round >= sequences.length) return null

  return (
    <div>
      <StepHeader step={2} total={6} title="数字记忆（测工作记忆）" />
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>记住下面这串数字（{sequences[round].length} 位），3 秒后消失，凭记忆输入。</p>
        {phase === 'show' ? (
          <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 600, letterSpacing: '0.5em', color: 'var(--color-primary-dark)', minHeight: 60 }}>
            {showDigits ? sequences[round].join(' ') : ''}
          </div>
        ) : (
          <div>
            <input className="input-field" style={{ textAlign: 'center', maxWidth: 300, margin: '0 auto' }}
              placeholder="数字之间用空格分隔，如 7 3 9 2 5" value={input} onChange={e => setInput(e.target.value)} autoFocus />
            <div style={{ marginTop: 'var(--space-md)' }}>
              <button className="btn-primary" onClick={handleSubmit} disabled={!input.trim()}>提交回忆</button>
            </div>
          </div>
        )}
      </div>
      <StepNav onBack={onBack} onNext={() => {}} nextLabel="" hideNext />
    </div>
  )
}

// ============ 步骤3：舒尔特方格（加工速度） ============
function SchulteStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [numbers] = useState(() => shuffle(Array.from({ length: 25 }, (_, i) => i + 1)))
  const [next, setNext] = useState(1)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const handleClick = (n: number) => {
    if (n !== next) return
    if (!startTime) setStartTime(Date.now())
    if (n === 25) {
      const ms = Date.now() - (startTime || Date.now())
      const sec = Math.round(ms / 1000)
      setElapsed(sec)
      setDone(true)
      const score = sec <= 25 ? 95 : sec <= 35 ? 80 : sec <= 45 ? 60 : sec <= 60 ? 40 : 25
      GlobalStore.save('cognitive_processingSpeed', score)
    } else {
      setNext(n + 1)
    }
  }

  if (done) {
    return (
      <div>
        <StepHeader step={3} total={6} title="舒尔特方格（测加工速度）" />
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>用时 {elapsed} 秒</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>{elapsed <= 35 ? '注意力很集中！' : '没关系，加工速度可以靠限时训练提升。'}</p>
          <button className="btn-primary" onClick={onNext}>下一步：类比推理</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <StepHeader step={3} total={6} title="舒尔特方格（测加工速度）" />
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>按顺序从 1 点到 25，越快越好。下一个要点的数字：<strong style={{ color: 'var(--color-primary-dark)' }}>{next}</strong></p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 56px)', gap: 4, justifyContent: 'center' }}>
          {numbers.map(n => (
            <button key={n} onClick={() => handleClick(n)}
              style={{ width: 56, height: 56, borderRadius: 8, border: n < next ? '2px solid var(--color-success)' : '1px solid var(--border-subtle)', background: n < next ? 'rgba(16,185,129,0.08)' : 'var(--bg-card)', fontSize: 'var(--text-lg)', color: n < next ? 'var(--color-success)' : 'var(--text-primary)' }}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <StepNav onBack={onBack} onNext={() => {}} nextLabel="" hideNext />
    </div>
  )
}

// ============ 步骤4：类比推理（流体推理） ============
function AnalogyStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)

  const q = ANALOGY_QUESTIONS[idx]

  const handleSelect = (optIdx: number) => {
    if (selected !== null) return
    setSelected(optIdx)
    const isCorrect = optIdx === q.answer
    setTimeout(() => {
      const newCorrect = correct + (isCorrect ? 1 : 0)
      setCorrect(newCorrect)
      setSelected(null)
      if (idx < ANALOGY_QUESTIONS.length - 1) {
        setIdx(i => i + 1)
      } else {
        setFinished(true)
        GlobalStore.save('cognitive_fluidReasoning', Math.round(newCorrect / ANALOGY_QUESTIONS.length * 100))
      }
    }, 600)
  }

  if (finished) {
    return (
      <div>
        <StepHeader step={4} total={6} title="类比推理（测流体推理）" />
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>答对 {correct}/{ANALOGY_QUESTIONS.length} 题</div>
          <button className="btn-primary" onClick={onNext}>下一步：颜色干扰</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <StepHeader step={4} total={6} title="类比推理（测流体推理）" />
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
          <span className="badge">第 {idx + 1} / {ANALOGY_QUESTIONS.length} 题</span>
        </div>
        <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-lg)' }}>{q.q}</p>
        <div>
          {q.options.map((opt, i) => (
            <div key={i} className="option-item" onClick={() => handleSelect(i)}
              style={{ borderColor: selected === i ? (i === q.answer ? 'var(--color-success)' : 'var(--color-danger)') : undefined, background: selected === i ? (i === q.answer ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)') : undefined }}>
              <div className="option-label">{'ABCD'[i]}</div>
              <div>{opt}</div>
            </div>
          ))}
        </div>
      </div>
      <StepNav onBack={onBack} onNext={() => {}} nextLabel="" hideNext />
    </div>
  )
}

// ============ 步骤5：Stroop 颜色干扰（认知灵活性） ============
function StroopStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)

  const item = STROOP_ITEMS[idx]

  const handleSelect = (colorIdx: number) => {
    if (selected !== null) return
    setSelected(colorIdx)
    const isCorrect = colorIdx === item.colorIndex
    setTimeout(() => {
      const newCorrect = correct + (isCorrect ? 1 : 0)
      setCorrect(newCorrect)
      setSelected(null)
      if (idx < STROOP_ITEMS.length - 1) {
        setIdx(i => i + 1)
      } else {
        setFinished(true)
        GlobalStore.save('cognitive_cognitiveFlexibility', Math.round(newCorrect / STROOP_ITEMS.length * 100))
      }
    }, 600)
  }

  if (finished) {
    return (
      <div>
        <StepHeader step={5} total={6} title="颜色干扰（测认知灵活性）" />
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>答对 {correct}/{STROOP_ITEMS.length} 题</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>颜色干扰题测的是你忽略无关信息、灵活切换的能力。</p>
          <button className="btn-primary" onClick={onNext}>下一步：学习问卷</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <StepHeader step={5} total={6} title="颜色干扰（测认知灵活性）" />
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>下面这个字<strong>显示的颜色</strong>是什么？（忽略字本身的意思）</p>
        <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 700, color: STROOP_COLORS[item.colorIndex], marginBottom: 'var(--space-xl)' }}>
          {item.word}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {STROOP_NAMES.map((name, i) => (
            <button key={i} className="btn-secondary" onClick={() => handleSelect(i)}
              style={{ minWidth: 80, borderColor: selected === i ? (i === item.colorIndex ? 'var(--color-success)' : 'var(--color-danger)') : undefined, background: selected === i ? (i === item.colorIndex ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)') : undefined }}>
              {name}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 'var(--space-md)' }}>
          <span className="badge">第 {idx + 1} / {STROOP_ITEMS.length} 题</span>
        </div>
      </div>
      <StepNav onBack={onBack} onNext={() => {}} nextLabel="" hideNext />
    </div>
  )
}

// ============ 步骤6：学习特质问卷 ============
function SurveyStep({ onSubmit, onBack }: { onSubmit: (answers: any) => void; onBack: () => void }) {
  const [survey, setSurvey] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    setSubmitting(true)
    const answers = {
      grades: GlobalStore.get('grades') || {},
      cognitive: {
        workingMemory: GlobalStore.get('cognitive_workingMemory') || 50,
        processingSpeed: GlobalStore.get('cognitive_processingSpeed') || 50,
        fluidReasoning: GlobalStore.get('cognitive_fluidReasoning') || 50,
        cognitiveFlexibility: GlobalStore.get('cognitive_cognitiveFlexibility') || 50,
        learningAbility: Math.round(((GlobalStore.get('cognitive_workingMemory') || 50) + (GlobalStore.get('cognitive_fluidReasoning') || 50)) / 2)
      },
      survey
    }
    onSubmit(answers)
  }

  return (
    <div>
      <StepHeader step={6} total={6} title="学习特质问卷" />
      <div className="card">
        {SURVEY_ITEMS.map(item => (
          <div key={item.key} style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-primary-dark)' }}>{survey[item.key] ?? 50}</span>
            </div>
            <input type="range" min={0} max={100} value={survey[item.key] ?? 50}
              onChange={e => setSurvey(s => ({ ...s, [item.key]: Number(e.target.value) }))}
              style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <span>完全不像我</span><span>非常像我</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
        <button className="btn-secondary" onClick={onBack}>上一步</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'AI 生成报告中...' : '生成诊断报告'}</button>
      </div>
    </div>
  )
}

// ============ 公共小组件 ============
function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <h1 className="page-title" style={{ marginBottom: 'var(--space-xs)' }}>{title}</h1>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${(step / total) * 100}%` }}></div>
      </div>
    </div>
  )
}

function StepNav({ onBack, onNext, nextLabel, hideNext }: { onBack: () => void; onNext: () => void; nextLabel: string; hideNext?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
      <button className="btn-secondary" onClick={onBack}>上一步</button>
      {!hideNext && <button className="btn-primary" onClick={onNext}>{nextLabel || '下一步'}</button>}
    </div>
  )
}

// ============ 全局数据暂存 ============
const store: Record<string, any> = {}
function GlobalStore({ field, value }: { field: string; value: any }) {
  store[field] = value
  return null
}
GlobalStore.save = (field: string, value: any) => { store[field] = value }
GlobalStore.get = (field: string) => store[field]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

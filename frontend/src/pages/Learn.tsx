import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'

interface Prereq { title: string; content: string }
interface Concept { title: string; content: string; analogy?: string; formula?: string; example?: string }
interface WorkedStep { text: string; detail: string }
interface WorkedExample { title: string; question: string; steps: WorkedStep[]; answer: string; tip?: string }
interface Question {
  id: string
  type: string
  method: string
  title: string
  content: string
  options: { label: string; text: string; isCorrect: boolean; hint: string | null }[]
  hints: string[]
  answer: string
  explanation: string
}

interface Content {
  knowledgePointId: string
  title: string
  chapter: string
  goal: string
  prerequisites: Prereq[]
  concepts: Concept[]
  workedExample: WorkedExample
  questions: Question[]
  methodSwitchTexts: Record<string, string>
}

const TYPE_LABEL: Record<string, string> = { base: '基础题', common: '常考题', variation: '变式题' }
const METHOD_LABEL: Record<string, string> = { deduction: '演绎法', analogy: '类比法', chunking: '拆解法', speedrun: '速记法' }

export default function Learn() {
  const { kpId } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'prereq' | 'concept' | 'example' | 'practice'>('prereq')
  const [conceptIndex, setConceptIndex] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [attemptCount, setAttemptCount] = useState(0)
  const [feedback, setFeedback] = useState<{ correct: boolean; hint?: string; errorReason?: string; shouldSwitchMethod?: boolean; methodSwitchText?: string } | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!kpId) return
    loadContent()
  }, [kpId])

  const loadContent = async () => {
    try {
      const res = await api.getContent(kpId!)
      if (res.hasContent) {
        setContent(res.content)
      } else {
        setContent(null)
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleAnswer = async (optionIndex: number) => {
    if (!content || selectedOption !== null) return
    const question = content.questions[qIndex]
    setSelectedOption(optionIndex)

    try {
      const res = await api.submitAnswer({
        knowledgePointId: kpId!,
        questionId: question.id,
        optionIndex,
        attemptCount: attemptCount + 1
      })

      setFeedback(res)

      if (!res.correct && attemptCount + 1 >= 1) {
        await api.submitWrong({
          knowledgePointId: kpId!,
          questionId: question.id,
          errorReason: res.errorReason || '答错',
          attemptCount: attemptCount + 1
        }).catch(() => {})
      }
    } catch (err) { console.error(err) }
  }

  const handleNextAttempt = () => {
    setAttemptCount(prev => prev + 1)
    setSelectedOption(null)
    setFeedback(null)
  }

  const handleNextQuestion = () => {
    if (qIndex + 1 < content!.questions.length) {
      setQIndex(prev => prev + 1)
      setAttemptCount(0)
      setSelectedOption(null)
      setFeedback(null)
      setShowExplanation(false)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    try {
      await api.completeLearning(kpId!)
      setCompleted(true)
    } catch (err) { console.error(err) }
  }

  if (loading) return <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>加载中...</div>

  if (!content) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>该知识点内容开发中，敬请期待</p>
        <button className="btn-secondary" onClick={() => navigate('/')}>返回今日计划</button>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-md)' }}>🎉</div>
        <h2 style={{ marginBottom: 'var(--space-md)' }}>「{content.title}」学完了！</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
          掌握度已更新，做错的题已自动加入复习排期。
        </p>
        <button className="btn-primary" onClick={() => navigate('/')}>返回今日计划</button>
      </div>
    )
  }

  // ============ 阶段1：前置知识回顾 ============
  if (phase === 'prereq') {
    return (
      <div>
        <PageHeader content={content} phase="prereq" />
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)', color: 'var(--color-primary-dark)' }}>第一步：先捡起基础</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-lg)' }}>
            别担心忘了高一的，这里用大白话帮你快速捡起来。
          </p>
          {content.prerequisites.map((p, i) => (
            <div key={i} className="prereq-item">
              <div className="prereq-title">{p.title}</div>
              <div className="prereq-content">{p.content}</div>
            </div>
          ))}
        </div>
        <StepButtons onBack={() => navigate('/')} onNext={() => setPhase('concept')} nextLabel="我懂了，进入讲解" />
      </div>
    )
  }

  // ============ 阶段2：分层概念讲解 ============
  if (phase === 'concept') {
    const concept = content.concepts[conceptIndex]
    const isLast = conceptIndex === content.concepts.length - 1
    return (
      <div>
        <PageHeader content={content} phase="concept" />
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>概念讲解进度</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-dark)' }}>{conceptIndex + 1} / {content.concepts.length}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${((conceptIndex + 1) / content.concepts.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="concept-card">
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)', color: 'var(--color-primary-dark)' }}>{concept.title}</h2>
          <p style={{ lineHeight: 1.9, marginBottom: 'var(--space-md)' }}>{concept.content}</p>
          {concept.analogy && (
            <div className="analogy-box">
              <div className="analogy-label">💡 生活类比</div>
              <div>{concept.analogy}</div>
            </div>
          )}
          {concept.formula && (
            <div className="formula-box">
              <div className="formula-label">📐 公式 / 结论</div>
              <div className="formula-text">{concept.formula}</div>
            </div>
          )}
          {concept.example && (
            <div className="example-box">
              <div className="example-label">✅ 举个例子</div>
              <div>{concept.example}</div>
            </div>
          )}
        </div>

        <StepButtons
          onBack={conceptIndex === 0 ? () => setPhase('prereq') : () => setConceptIndex(i => i - 1)}
          onNext={isLast ? () => setPhase('example') : () => setConceptIndex(i => i + 1)}
          nextLabel={isLast ? '进入例题精讲' : '下一个概念'}
        />
      </div>
    )
  }

  // ============ 阶段3：例题精讲 ============
  if (phase === 'example') {
    const ex = content.workedExample
    return (
      <div>
        <PageHeader content={content} phase="example" />
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)', color: 'var(--color-primary-dark)' }}>{ex.title}</h2>
          <div className="example-question">{ex.question}</div>
          <div style={{ marginTop: 'var(--space-lg)' }}>
            {ex.steps.map((s, i) => (
              <div key={i} className="step-item">
                <div className="step-num">{i + 1}</div>
                <div className="step-body">
                  <div className="step-title">{s.text}</div>
                  <div className="step-detail">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="answer-box">
            <strong>答案：</strong>{ex.answer}
          </div>
          {ex.tip && (
            <div className="tip-box">
              <strong>💡 关键提醒：</strong>{ex.tip}
            </div>
          )}
        </div>
        <StepButtons onBack={() => setPhase('concept')} onNext={() => setPhase('practice')} nextLabel="我学会了，开始练习" />
      </div>
    )
  }

  // ============ 阶段4：练习 ============
  const question = content.questions[qIndex]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{content.title}</h1>
        <span className="badge">第 {qIndex + 1} / {content.questions.length} 题</span>
      </div>

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${(qIndex / content.questions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="question-card">
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
          <span className="badge">{TYPE_LABEL[question.type] || question.type}</span>
          <span className="badge" style={{ background: 'rgba(155,124,184,0.12)', color: 'var(--color-purple)' }}>教法：{METHOD_LABEL[question.method] || question.method}</span>
        </div>
        <h2 className="question-title">{question.title}</h2>
        <p style={{ marginBottom: 'var(--space-lg)', lineHeight: 1.8, fontSize: 'var(--text-lg)' }}>{question.content}</p>

        <div>
          {question.options.map((opt, i) => {
            let className = 'option-item'
            if (selectedOption === i) {
              className += opt.isCorrect ? ' correct' : ' wrong'
            }
            if (selectedOption !== null && opt.isCorrect) {
              className += ' correct'
            }
            return (
              <div key={i} className={className} onClick={() => selectedOption === null && handleAnswer(i)}>
                <div className="option-label">{opt.label}</div>
                <div>{opt.text}</div>
              </div>
            )
          })}
        </div>

        {feedback && !feedback.correct && feedback.hint && (
          <div className="hint-box">
            <strong>追问第 {Math.min(attemptCount + 1, 3)} 层：</strong> {feedback.hint}
            {feedback.errorReason && (
              <div style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--text-xs)' }}>错因：{feedback.errorReason}</div>
            )}
            {feedback.shouldSwitchMethod && feedback.methodSwitchText && (
              <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'rgba(155,124,184,0.1)', borderRadius: 'var(--radius-sm)' }}>
                <strong>切换教法：</strong>{feedback.methodSwitchText}
              </div>
            )}
          </div>
        )}

        {feedback && feedback.correct && (
          <div className="hint-box" style={{ background: 'rgba(16,185,129,0.1)', borderLeftColor: 'var(--color-success)', color: '#065f46' }}>
            <strong>答对了！</strong> {question.explanation}
          </div>
        )}

        <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)' }}>
          {feedback && !feedback.correct && attemptCount < 3 && !feedback.shouldSwitchMethod && (
            <button className="btn-secondary" onClick={handleNextAttempt}>再试一次</button>
          )}
          {feedback && (feedback.correct || attemptCount >= 3 || feedback.shouldSwitchMethod) && !showExplanation && (
            <button className="btn-secondary" onClick={() => setShowExplanation(true)}>查看解析</button>
          )}
          {showExplanation && (
            <div className="answer-box" style={{ flex: 1 }}>{question.explanation}</div>
          )}
          {showExplanation && (
            <button className="btn-primary" onClick={handleNextQuestion}>
              {qIndex + 1 < content.questions.length ? '下一题' : '完成学习'}
            </button>
          )}
          <button className="btn-secondary" onClick={() => navigate('/')}>返回</button>
        </div>
      </div>
    </div>
  )
}

function PageHeader({ content, phase }: { content: Content; phase: string }) {
  const labels: Record<string, string> = {
    prereq: '前置回顾',
    concept: '概念讲解',
    example: '例题精讲',
    practice: '练习'
  }
  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{content.title}</h1>
        <span className="badge">{labels[phase]}</span>
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
        {content.chapter}
      </div>
      <div className="goal-box">
        <strong>🎯 本节目标：</strong>{content.goal}
      </div>
    </div>
  )
}

function StepButtons({ onBack, onNext, nextLabel }: { onBack: () => void; onNext: () => void; nextLabel: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
      <button className="btn-secondary" onClick={onBack}>上一步</button>
      <button className="btn-primary" onClick={onNext}>{nextLabel}</button>
    </div>
  )
}

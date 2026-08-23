import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'

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
  title: string
  concept: { intro: string; keyPoints: string[] }
  questions: Question[]
  methodSwitchTexts: Record<string, string>
}

export default function Learn() {
  const { kpId } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'concept' | 'practice'>('concept')
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

  if (loading) return <div style={{padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)'}}>加载中...</div>

  if (!content) {
    return (
      <div className="card" style={{textAlign: 'center', padding: 'var(--space-2xl)'}}>
        <p style={{color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)'}}>该知识点内容开发中，敬请期待</p>
        <button className="btn-secondary" onClick={() => navigate('/')}>返回今日计划</button>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="card" style={{textAlign: 'center', padding: 'var(--space-2xl)'}}>
        <div style={{fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-md)'}}>🎉</div>
        <h2 style={{marginBottom: 'var(--space-md)'}}>知识点学习完成！</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)'}}>
          掌握度已更新，错题已自动加入复习排期。
        </p>
        <button className="btn-primary" onClick={() => navigate('/')}>返回今日计划</button>
      </div>
    )
  }

  if (phase === 'concept') {
    return (
      <div>
        <h1 className="page-title">{content.title}</h1>
        <div className="card" style={{marginBottom: 'var(--space-lg)'}}>
          <h2 style={{fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)', color: 'var(--color-primary-dark)'}}>概念讲解</h2>
          <p style={{marginBottom: 'var(--space-lg)', lineHeight: 1.8}}>{content.concept.intro}</p>
          <div>
            <h3 style={{fontSize: 'var(--text-base)', marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)'}}>核心要点：</h3>
            <ul style={{listStyle: 'none', paddingLeft: 0}}>
              {content.concept.keyPoints.map((point, i) => (
                <li key={i} style={{padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 'var(--text-sm)'}}>
                  <span style={{color: 'var(--color-primary)', marginRight: 'var(--space-sm)'}}>•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setPhase('practice')}>开始练习</button>
      </div>
    )
  }

  const question = content.questions[qIndex]

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)'}}>
        <h1 className="page-title" style={{marginBottom: 0}}>{content.title}</h1>
        <span className="badge">第 {qIndex + 1} / {content.questions.length} 题</span>
      </div>

      <div style={{marginBottom: 'var(--space-lg)'}}>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{width: `${((qIndex) / content.questions.length) * 100}%`}}></div>
        </div>
      </div>

      <div className="question-card">
        <div className="badge" style={{marginBottom: 'var(--space-sm)'}}>教法：{question.method}</div>
        <h2 className="question-title">{question.title}</h2>
        <p style={{marginBottom: 'var(--space-lg)', lineHeight: 1.8, fontSize: 'var(--text-lg)'}}>{question.content}</p>

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
              <div style={{marginTop: 'var(--space-sm)', fontSize: 'var(--text-xs)'}}>错因：{feedback.errorReason}</div>
            )}
            {feedback.shouldSwitchMethod && feedback.methodSwitchText && (
              <div style={{marginTop: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'rgba(155,124,184,0.1)', borderRadius: 'var(--radius-sm)'}}>
                <strong>切换教法：</strong>{feedback.methodSwitchText}
              </div>
            )}
          </div>
        )}

        {feedback && feedback.correct && (
          <div className="hint-box" style={{background: 'rgba(16,185,129,0.1)', borderLeftColor: 'var(--color-success)', color: '#065f46'}}>
            <strong>答对了！</strong> {question.explanation}
          </div>
        )}

        <div style={{marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)'}}>
          {feedback && !feedback.correct && attemptCount < 3 && !feedback.shouldSwitchMethod && (
            <button className="btn-secondary" onClick={handleNextAttempt}>再试一次</button>
          )}
          {feedback && (feedback.correct || attemptCount >= 3 || feedback.shouldSwitchMethod) && !showExplanation && (
            <button className="btn-secondary" onClick={() => setShowExplanation(true)}>查看解析</button>
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

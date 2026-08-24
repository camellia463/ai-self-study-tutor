import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import EnergyMapPicker from '../components/EnergyMapPicker'

export default function SetGoal() {
  const [targetExam, setTargetExam] = useState('高考数学')
  const [targetScore, setTargetScore] = useState(130)
  const [deadline, setDeadline] = useState('2027-06-07')
  const [dailyBudget, setDailyBudget] = useState(120)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.setGoal({ targetExam, targetScore, deadline, dailyBudgetMinutes: dailyBudget })
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="page-title">设置学习目标</h1>
      <p style={{color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)'}}>
        告诉 AI 你的目标，它会根据你的诊断结果和知识点掌握度，自动生成周计划。
      </p>
      <div className="card" style={{maxWidth: 500}}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">目标考试</label>
            <input className="input-field" value={targetExam} onChange={e => setTargetExam(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">目标分数</label>
            <input className="input-field" type="number" value={targetScore} onChange={e => setTargetScore(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">截止日期</label>
            <input className="input-field" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">每日可学习时长（分钟）</label>
            <input className="input-field" type="number" value={dailyBudget} onChange={e => setDailyBudget(Number(e.target.value))} />
            <div style={{fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-sm)'}}>
              按你真实可学习时长排课，不按6小时满排
            </div>
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading} style={{width: '100%'}}>
            {loading ? 'AI 排课中...' : '生成周计划'}
          </button>
        </form>
      </div>

      <EnergyMapPicker />
    </div>
  )
}

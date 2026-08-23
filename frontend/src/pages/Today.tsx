import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

interface Block {
  type: string
  knowledgePointId?: string
  knowledgeName?: string
  hasContent?: boolean
  plannedMinutes: number
  status: string
  logId?: string
  label?: string
  reviewCount?: number
}

interface TodayData {
  hasPlan: boolean
  goal?: { targetExam: string; targetScore?: number; deadline: string }
  dailyBudgetMinutes?: number
  dayName?: string
  blocks?: Block[]
  stats?: { total: number; done: number; skipped: number; pending: number }
}

export default function Today() {
  const [data, setData] = useState<TodayData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadToday() }, [])

  const loadToday = async () => {
    try {
      const res = await api.getToday()
      setData(res)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleComplete = async (block: Block, status: 'done' | 'skipped') => {
    if (!block.logId) return
    try {
      await api.completeBlock(block.logId, block.plannedMinutes, status, block.knowledgePointId)
      loadToday()
    } catch (err) { console.error(err) }
  }

  if (loading) return <div style={{padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)'}}>加载中...</div>

  if (!data?.hasPlan) {
    return (
      <div>
        <h1 className="page-title">欢迎来到 AI 自学提分</h1>
        <div className="card" style={{textAlign: 'center', padding: 'var(--space-2xl)'}}>
          <p style={{color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)'}}>
            你还没有设置学习目标。告诉 AI 你的目标，让它帮你排课。
          </p>
          <Link to="/goal"><button className="btn-primary">设置学习目标</button></Link>
        </div>
      </div>
    )
  }

  const stats = data.stats || { total: 0, done: 0, skipped: 0, pending: 0 }
  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)'}}>
        <div>
          <h1 className="page-title" style={{marginBottom: 0}}>今日计划</h1>
          <div style={{color: 'var(--text-muted)', fontSize: 'var(--text-sm)'}}>
            {data.dayName} · 目标：{data.goal?.targetExam} {data.goal?.targetScore ? `${data.goal.targetScore}分` : ''} · 距考试 {Math.ceil((new Date(data.goal!.deadline).getTime() - Date.now()) / 86400000)} 天
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-value">{stats.done}/{stats.total}</div>
          <div className="stat-card-label">今日完成</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{color: 'var(--color-success)'}}>{progress}%</div>
          <div className="stat-card-label">完成进度</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{color: 'var(--color-purple)'}}>{data.dailyBudgetMinutes}</div>
          <div className="stat-card-label">今日预算(分钟)</div>
        </div>
      </div>

      <div style={{marginBottom: 'var(--space-lg)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)'}}>
          <span style={{fontSize: 'var(--text-sm)', color: 'var(--text-secondary)'}}>整体进度</span>
          <span style={{fontSize: 'var(--text-sm)', color: 'var(--color-primary-dark)'}}>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill success" style={{width: `${progress}%`}}></div>
        </div>
      </div>

      <div className="timeline">
        {data.blocks?.map((block, idx) => (
          <div key={idx} className={`time-block ${block.type} ${block.status}`}>
            <div className="time-block-time">
              {block.type === 'review' ? '复习' : block.type === 'attack' ? '攻克' : '周测'}
            </div>
            <div className="time-block-content">
              <div className="time-block-title">
                {block.label || block.knowledgeName || (block.type === 'weekly_test' ? '本周测试' : '复习错题')}
                {block.reviewCount && <span className="badge" style={{marginLeft: 'var(--space-sm)'}}>{block.reviewCount}题</span>}
              </div>
              <div className="time-block-meta">
                {block.plannedMinutes} 分钟
                {block.hasContent === false && block.knowledgePointId && ' · 内容开发中'}
                {block.status === 'done' && ' · 已完成'}
                {block.status === 'skipped' && ' · 已跳过'}
              </div>
            </div>
            <div style={{display: 'flex', gap: 'var(--space-sm)'}}>
              {block.status === 'pending' && block.knowledgePointId && block.hasContent && (
                <Link to={`/learn/${block.knowledgePointId}`}>
                  <button className="btn-primary" style={{padding: '6px 16px', fontSize: 'var(--text-sm)'}}>开始</button>
                </Link>
              )}
              {block.status === 'pending' && (
                <>
                  <button className="btn-secondary" style={{padding: '6px 12px', fontSize: 'var(--text-sm)'}} onClick={() => handleComplete(block, 'done')}>完成</button>
                  <button className="btn-secondary" style={{padding: '6px 12px', fontSize: 'var(--text-sm)'}} onClick={() => handleComplete(block, 'skipped')}>跳过</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

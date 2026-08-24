import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function KnowledgeMap() {
  const [points, setPoints] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await api.getKnowledgeMastery()
      setPoints(res.points)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (loading) return <div style={{padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)'}}>加载中...</div>

  const filtered = filter === 'all' ? points : points.filter(p => p.grade === filter)
  const grades = ['high1', 'high2', 'high3']
  const gradeLabels: Record<string, string> = { high1: '高一', high2: '高二', high3: '高三' }

  const masteryColor = (m: number) => {
    if (m >= 80) return 'var(--color-success)'
    if (m >= 50) return 'var(--color-warning)'
    if (m > 0) return 'var(--color-danger)'
    return 'var(--border-subtle)'
  }

  return (
    <div>
      <h1 className="page-title">知识图谱</h1>
      <div style={{display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)'}}>
        <button className={filter === 'all' ? 'btn-primary' : 'btn-secondary'} style={{padding: '6px 16px', fontSize: 'var(--text-sm)'}} onClick={() => setFilter('all')}>全部</button>
        {grades.map(g => (
          <button key={g} className={filter === g ? 'btn-primary' : 'btn-secondary'} style={{padding: '6px 16px', fontSize: 'var(--text-sm)'}} onClick={() => setFilter(g)}>{gradeLabels[g]}</button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)'}}>
        {filtered.map(p => {
          const cardBody = (
            <>
              <div style={{fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-xs)'}}>{p.name}</div>
              <div style={{fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)'}}>
                {p.chapter} · 权重{p.score_weight}
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)'}}>
                <span style={{fontSize: 'var(--text-xs)', color: 'var(--text-muted)'}}>掌握度</span>
                <span style={{fontSize: 'var(--text-xs)', fontWeight: 500}}>{Math.round(p.mastery)}%</span>
              </div>
              <div className="progress-bar" style={{height: '6px'}}>
                <div className="progress-bar-fill" style={{width: `${p.mastery}%`, background: masteryColor(p.mastery)}}></div>
              </div>
              <div style={{marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-xs)', alignItems: 'center'}}>
                {p.has_content
                  ? <span className="badge" style={{fontSize: '10px', background: 'rgba(16,185,129,0.12)', color: '#065f46'}}>可学习 →</span>
                  : <span className="badge" style={{fontSize: '10px'}}>目录</span>}
                <span style={{fontSize: '10px', color: 'var(--text-muted)'}}>优先级 {p.priority}</span>
              </div>
            </>
          )
          return p.has_content ? (
            <Link key={p.id} to={`/learn/${p.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
              <div className="card" style={{padding: 'var(--space-md)', borderLeft: `4px solid ${masteryColor(p.mastery)}`, cursor: 'pointer', transition: 'box-shadow .15s ease'}} onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')} onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
                {cardBody}
              </div>
            </Link>
          ) : (
            <div key={p.id} className="card" style={{padding: 'var(--space-md)', borderLeft: `4px solid ${masteryColor(p.mastery)}`, opacity: 0.85}}>
              {cardBody}
            </div>
          )
        })}
      </div>
    </div>
  )
}

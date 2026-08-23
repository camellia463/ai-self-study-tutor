import { useState, useEffect } from 'react'
import { api } from '../api'

export default function WrongBook() {
  const [items, setItems] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await api.getReviewAll()
      setItems(res.items)
      setStats(res.stats)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleCheckin = async (id: string, correct: boolean) => {
    try {
      await api.reviewCheckin(id, correct)
      load()
    } catch (err) { console.error(err) }
  }

  if (loading) return <div style={{padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)'}}>加载中...</div>

  const categoryColors: Record<string, string> = { '粗心': 'var(--color-warning)', '半懂': 'var(--color-primary)', '盲区': 'var(--color-danger)' }

  return (
    <div>
      <h1 className="page-title">错题本</h1>

      <div className="stat-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
        <div className="stat-card">
          <div className="stat-card-value">{stats.total || 0}</div>
          <div className="stat-card-label">总错题</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{color: 'var(--color-warning)'}}>{stats.pending || 0}</div>
          <div className="stat-card-label">待复习</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{color: 'var(--color-success)'}}>{stats.mastered || 0}</div>
          <div className="stat-card-label">已掌握</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{color: 'var(--color-purple)'}}>{stats.半懂 || 0}</div>
          <div className="stat-card-label">半懂</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{textAlign: 'center', padding: 'var(--space-2xl)'}}>
          <p style={{color: 'var(--text-muted)'}}>还没有错题。开始学习后会自动收录。</p>
        </div>
      ) : (
        <div className="timeline">
          {items.map(item => (
            <div key={item.id} className={`time-block ${item.status === 'mastered' ? 'done' : 'attack'}`}>
              <div className="time-block-time">
                <span className="badge" style={{background: 'transparent', color: categoryColors[item.category] || 'var(--text-muted)', border: `1px solid ${categoryColors[item.category] || 'var(--border-subtle)'}`}}>{item.category}</span>
              </div>
              <div className="time-block-content">
                <div className="time-block-title">{item.kp_name}</div>
                <div className="time-block-meta">
                  错因：{item.error_reason}
                  {item.status === 'pending' && ` · 下次复习：${item.next_review_at?.split('T')[0]}`}
                  {item.status === 'mastered' && ' · 已掌握'}
                  {` · 连续答对 ${item.streak} 次`}
                </div>
              </div>
              {item.status === 'pending' && (
                <div style={{display: 'flex', gap: 'var(--space-sm)'}}>
                  <button className="btn-primary" style={{padding: '6px 12px', fontSize: 'var(--text-sm)'}} onClick={() => handleCheckin(item.id, true)}>答对</button>
                  <button className="btn-secondary" style={{padding: '6px 12px', fontSize: 'var(--text-sm)'}} onClick={() => handleCheckin(item.id, false)}>答错</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

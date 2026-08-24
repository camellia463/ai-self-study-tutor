import { useState, useEffect } from 'react'
import { api } from '../api'

interface ErrorDist { 粗心: number; 半懂: number; 盲区: number }
interface TodayData {
  date: string
  tasksTotal: number
  tasksDone: number
  completionRate: number
  focusMinutes: number
  wrongCount: number
  errorDist: ErrorDist
  mastery: number
  predictedScore: number
  masteryDelta: number
  scoreDelta: number
  reflection: string
}
interface TrendPoint {
  date: string
  mastery: number
  predictedScore: number
  focusMinutes: number
  completionRate: number
  wrongCount: number
}

export default function Growth() {
  const [today, setToday] = useState<TodayData | null>(null)
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [reflection, setReflection] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedTip, setSavedTip] = useState('')

  // 提醒设置
  const [reviewTime, setReviewTime] = useState('21:00')
  const [studyStartEnabled, setStudyStartEnabled] = useState(false)
  const [studyStartTime, setStudyStartTime] = useState('08:00')
  const [breakEnabled, setBreakEnabled] = useState(false)
  const [breakInterval, setBreakInterval] = useState(45)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([api.getGrowthToday(), api.getGrowthTrend(30), api.getReminders()])
      .then(([t, tr, r]) => {
        if (!alive) return
        setToday(t)
        setReflection(t.reflection || '')
        setTrend(tr.trend)
        setReviewTime(r.reviewTime)
        setStudyStartEnabled(!!r.studyStartEnabled)
        setStudyStartTime(r.studyStartTime)
        setBreakEnabled(!!r.breakEnabled)
        setBreakInterval(r.breakIntervalMinutes)
      })
      .catch(err => console.error(err))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  const saveReflection = async () => {
    setSaving(true)
    try {
      await api.saveReflection(reflection)
      setSavedTip('✅ 已保存今天的复盘')
      setTimeout(() => setSavedTip(''), 2500)
    } catch (err: any) {
      setSavedTip(err.message)
    }
    setSaving(false)
  }

  const saveReminders = async () => {
    try {
      await api.saveReminders({
        reviewTime, studyStartEnabled, studyStartTime,
        breakEnabled, breakIntervalMinutes: breakInterval
      })
      setSavedTip('✅ 提醒设置已保存')
      setTimeout(() => setSavedTip(''), 2500)
    } catch (err: any) {
      setSavedTip(err.message)
    }
  }

  if (loading) return <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>加载中...</div>
  if (!today) return <div style={{ color: 'var(--text-muted)' }}>暂无数据</div>

  const deltaColor = (n: number) => (n > 0 ? 'var(--color-success)' : n < 0 ? 'var(--color-danger)' : 'var(--text-muted)')

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="page-title" style={{ marginBottom: 'var(--space-xs)' }}>成长档案 · 知识档案柜</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          {today.date} · 每天的学习数据都会沉淀成可回溯的成长轨迹
        </div>
      </div>

      {/* 今日数据反馈（AI 自动汇总） */}
      <div className="stat-grid">
        <Stat value={`${today.completionRate}%`} label="任务完成度" sub={`${today.tasksDone}/${today.tasksTotal}`} />
        <Stat value={`${today.focusMinutes}分`} label="今日专注时长" sub="实际学习分钟" />
        <Stat value={String(today.predictedScore)} label="当前预估分" sub={`满分150`} />
        <Stat
          value={(today.scoreDelta > 0 ? '+' : '') + today.scoreDelta}
          label="今日涨分"
          sub="相对上次记录"
          color={deltaColor(today.scoreDelta)}
        />
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        {/* 掌握度 + 错题 */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-lg)' }}>今日概览</h3>
          <Row label="整体掌握率" value={`${today.mastery}%`} color={deltaColor(today.masteryDelta)} delta={`${today.masteryDelta > 0 ? '+' : ''}${today.masteryDelta}`} />
          <Row label="今日新增错题" value={`${today.wrongCount} 题`} />
          <div style={{ marginTop: 'var(--space-md)', fontSize: 'var(--text-sm)' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>错因分布</div>
            {Object.entries(today.errorDist).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                <span style={{ minWidth: 34, color: 'var(--text-secondary)' }}>{k}</span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${today.wrongCount ? Math.round((v / today.wrongCount) * 100) : 0}%` }}
                  />
                </div>
                <span style={{ minWidth: 20, textAlign: 'right', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 自我反思 */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-lg)' }}>今日复盘（自我反思）</h3>
          <textarea
            className="feynman-input"
            rows={7}
            placeholder={'今天哪里没做好？明天怎么改？\n\n连续 3 天正确率低，AI 会帮你降难度；专注度下降，AI 建议你多休息。'}
            value={reflection}
            onChange={e => setReflection(e.target.value)}
          />
          <button className="btn-primary" style={{ marginTop: 'var(--space-md)' }} onClick={saveReflection} disabled={saving}>
            {saving ? '保存中...' : '保存复盘'}
          </button>
        </div>
      </div>

      {/* 30 天成长轨迹 */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-sm)', fontSize: 'var(--text-lg)' }}>成长轨迹 · 30 天趋势</h3>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-md)' }}>
          每日预估分变化曲线——让你直观看到「自己真的在进步」
        </div>
        {trend.length < 2 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-xl)' }}>
            数据还不够画曲线，明天再来看看就会长出来了 🌱
          </div>
        ) : (
          <TrendChart points={trend} />
        )}
      </div>

      {/* 定时提醒设置 */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-lg)' }}>定时提醒</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <div>
            <label className="form-label">每日复盘提醒</label>
            <input className="input-field" type="time" value={reviewTime} onChange={e => setReviewTime(e.target.value)} />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>到点提醒你写复盘</div>
          </div>
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={studyStartEnabled} onChange={e => setStudyStartEnabled(e.target.checked)} />
              学习开始提醒
            </label>
            <input className="input-field" type="time" value={studyStartTime} disabled={!studyStartEnabled} onChange={e => setStudyStartTime(e.target.value)} />
          </div>
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={breakEnabled} onChange={e => setBreakEnabled(e.target.checked)} />
              超时休息提醒
            </label>
            <input className="input-field" type="number" value={breakInterval} min={15} max={120} disabled={!breakEnabled} onChange={e => setBreakInterval(Number(e.target.value))} />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>学习 N 分钟后提醒休息</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-primary" style={{ width: '100%' }} onClick={saveReminders}>保存提醒</button>
          </div>
        </div>
        {savedTip && <div style={{ color: 'var(--color-success)', fontSize: 'var(--text-sm)' }}>{savedTip}</div>}
      </div>
    </div>
  )
}

function Stat({ value, label, sub, color }: { value: string; label: string; sub?: string; color?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card-value" style={{ color: color || 'var(--color-primary-dark)' }}>{value}</div>
      <div className="stat-card-label">{label}</div>
      {sub && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Row({ label, value, color, delta }: { label: string; value: string; color?: string; delta?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>
        {value}
        {delta !== undefined && <span style={{ color: color || 'var(--text-muted)', fontSize: 'var(--text-xs)', marginLeft: 6 }}>{`(${delta})`}</span>}
      </span>
    </div>
  )
}

/* 30 天趋势 · SVG 折线图（预估分） */
function TrendChart({ points }: { points: TrendPoint[] }) {
  const W = 680, H = 220, PAD = 30
  const values = points.map(p => p.predictedScore)
  const maxV = Math.max(150, ...values)
  const minV = Math.min(0, ...values)
  const range = maxV - minV || 1

  const x = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2)
  const y = (v: number) => H - PAD - ((v - minV) / range) * (H - PAD * 2)

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.predictedScore).toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${x(points.length - 1).toFixed(1)} ${H - PAD} L ${x(0).toFixed(1)} ${H - PAD} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="预估分 30 天趋势">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4A5B8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F4A5B8" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* 网格线 + 刻度 */}
      {[0, 0.5, 1].map(t => {
        const v = minV + t * range
        return (
          <g key={t}>
            <line x1={PAD} x2={W - PAD} y1={y(v)} y2={y(v)} stroke="var(--border-subtle)" strokeDasharray="3 3" strokeWidth="1" />
            <text x={4} y={y(v) + 4} fontSize="10" fill="var(--text-muted)">{Math.round(v)}</text>
          </g>
        )
      })}
      {/* 面积 + 折线 */}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="var(--color-primary-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* 数据点 + 末点标注 */}
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.predictedScore)} r={i === points.length - 1 ? 4 : 2.5} fill={i === points.length - 1 ? 'var(--color-primary-dark)' : 'var(--color-primary)'} />
      ))}
      {/* 日期刻度（首/中/尾） */}
      {[0, Math.floor(points.length / 2), points.length - 1].map(i => (
        <text key={i} x={x(i)} y={H - 10} fontSize="10" fill="var(--text-muted)" textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}>
          {points[i].date.slice(5)}
        </text>
      ))}
    </svg>
  )
}
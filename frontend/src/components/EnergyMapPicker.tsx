import { useState, useEffect } from 'react'

// 时间能量地图采集器：7天×24小时网格点选
// 状态：0=未标记 1=✅可用 2=⚡黄金 3=❌不可用

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const STATE_CONFIG = [
  { label: '', color: '#F0EFEB', title: '未标记' },
  { label: '✅', color: '#C4DFEE', title: '可用' },
  { label: '⚡', color: '#F4A5B8', title: '黄金时段' },
  { label: '✕', color: '#E5E5E0', title: '不可用' },
]

export default function EnergyMapPicker() {
  const [grid, setGrid] = useState<number[][]>(() => {
    const saved = localStorage.getItem('energyMap')
    if (saved) {
      try { return JSON.parse(saved) } catch { /* fallthrough */ }
    }
    // 默认：工作日 7-9点和19-21点为黄金，9-17点为可用
    const g = Array.from({ length: 7 }, () => Array(24).fill(0))
    for (let d = 0; d < 5; d++) {
      for (let h = 7; h <= 9; h++) g[d][h] = 2
      for (let h = 10; h <= 17; h++) g[d][h] = 1
      for (let h = 19; h <= 21; h++) g[d][h] = 2
    }
    for (let d = 5; d < 7; d++) {
      for (let h = 9; h <= 12; h++) g[d][h] = 1
      for (let h = 19; h <= 21; h++) g[d][h] = 2
    }
    return g
  })

  useEffect(() => {
    localStorage.setItem('energyMap', JSON.stringify(grid))
  }, [grid])

  const toggle = (day: number, hour: number) => {
    setGrid(prev => {
      const next = prev.map(row => [...row])
      next[day][hour] = (next[day][hour] + 1) % 4
      return next
    })
  }

  const goldCount = grid.flat().filter(v => v === 2).length
  const availCount = grid.flat().filter(v => v === 1).length

  return (
    <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
      <h3 style={{ marginBottom: 'var(--space-xs)' }}>⏰ 时间能量地图</h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
        点选你每周各时段的状态：⚡黄金（大脑最清醒）→ AI 优先排攻克新知识；✅可用 → 练习巩固；❌不可用 → 不排课
      </p>

      {/* 图例 */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
        {STATE_CONFIG.map((s, i) => i > 0 && (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)' }}>
            <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 4, background: s.color, textAlign: 'center', lineHeight: '18px', fontSize: 11 }}>{s.label}</span>
            {s.title}
          </span>
        ))}
      </div>

      {/* 网格 */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(24, 26px)', gap: 2, minWidth: 680 }}>
          {/* 表头：小时 */}
          <div></div>
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-muted)' }}>{h}</div>
          ))}
          {/* 每天一行 */}
          {DAYS.map((day, d) => (
            <>
              <div key={`label-${d}`} style={{ fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>{day}</div>
              {Array.from({ length: 24 }, (_, h) => {
                const state = grid[d][h]
                const cfg = STATE_CONFIG[state]
                return (
                  <div
                    key={`${d}-${h}`}
                    onClick={() => toggle(d, h)}
                    title={`${day} ${h}:00 - ${cfg.title}`}
                    style={{
                      width: 26, height: 26, borderRadius: 4, cursor: 'pointer',
                      background: cfg.color, textAlign: 'center', lineHeight: '26px',
                      fontSize: 12, transition: 'transform 0.1s',
                      border: state === 2 ? '1.5px solid #F4A5B8' : '1px solid rgba(0,0,0,0.05)',
                    }}
                  >
                    {cfg.label}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>

      {/* 统计 */}
      <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
        <span>⚡ 黄金时段：<strong style={{ color: '#c4476a' }}>{goldCount}</strong> 小时/周</span>
        <span>✅ 可用时段：<strong style={{ color: '#5b8fb9' }}>{availCount}</strong> 小时/周</span>
        <span style={{ color: 'var(--text-muted)' }}>AI 会把高难度知识点排进⚡黄金时段</span>
      </div>
    </div>
  )
}

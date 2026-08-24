import { useState, useEffect } from 'react'
import { api } from '../api'

interface Prediction {
  overallMastery: number
  weightedMastery: number
  predictedScore: number
  fullScore: number
  knowledgePointCount: number
}

interface Stats {
  mastered: number
  learning: number
  unlearned: number
}

export default function ScoreDashboard({ targetScore }: { targetScore?: number }) {
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    api.getScorePrediction()
      .then(res => {
        setPrediction(res.prediction)
        setStats(res.stats)
      })
      .catch(() => {})
  }, [])

  if (!prediction) return null

  const gap = targetScore ? targetScore - prediction.predictedScore : null
  const progress = Math.min(100, (prediction.predictedScore / prediction.fullScore) * 100)

  return (
    <div className="score-dashboard">
      <div className="score-main">
        <div className="score-label">预估分数（掌握率映射）</div>
        <div className="score-value">{prediction.predictedScore}<span className="score-unit">/ {prediction.fullScore} 分</span></div>
        {gap !== null && (
          <div className="score-gap">
            {gap > 0 ? `距目标还差 ${gap} 分` : `已达成目标！超出 ${-gap} 分`}
          </div>
        )}
        <div className="progress-bar" style={{ marginTop: 'var(--space-sm)' }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="score-metrics">
        <div className="score-metric">
          <div className="score-metric-value">{prediction.overallMastery}%</div>
          <div className="score-metric-label">知识掌握率</div>
        </div>
        <div className="score-metric">
          <div className="score-metric-value" style={{ color: 'var(--color-purple)' }}>{prediction.weightedMastery}%</div>
          <div className="score-metric-label">转化率（加权）</div>
        </div>
        <div className="score-metric">
          <div className="score-metric-value" style={{ color: 'var(--color-success)' }}>{stats?.mastered ?? 0}</div>
          <div className="score-metric-label">已掌握</div>
        </div>
        <div className="score-metric">
          <div className="score-metric-value" style={{ color: 'var(--color-warning)' }}>{stats?.learning ?? 0}</div>
          <div className="score-metric-label">学习中</div>
        </div>
      </div>
    </div>
  )
}

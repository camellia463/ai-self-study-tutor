import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Diagnosis() {
  const [hasProfile, setHasProfile] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    try {
      const res = await api.getProfile()
      setHasProfile(res.hasProfile)
      if (res.hasProfile) setProfile(res.profile)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleQuickDiagnosis = async () => {
    setLoading(true)
    try {
      const res = await api.submitDiagnosis({
        answers: {
          grades: { math: 65, chinese: 70, english: 55, physics: 60, chemistry: 58, biology: 62, politics: 65, history: 60, geography: 55 },
          cognitive: { fluidReasoning: 60, learningAbility: 55, workingMemory: 50, processingSpeed: 65, cognitiveFlexibility: 58 },
          survey: { curiosity: 70, selfDrive: 65, resilience: 60, mindset: 55, metacognition: 50 }
        }
      })
      setProfile(res.profile)
      setHasProfile(true)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (loading) return <div style={{padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)'}}>加载中...</div>

  if (!hasProfile) {
    return (
      <div>
        <h1 className="page-title">学力诊断</h1>
        <div className="card" style={{textAlign: 'center', padding: 'var(--space-2xl)'}}>
          <p style={{marginBottom: 'var(--space-lg)', color: 'var(--text-secondary)'}}>
            诊断你的认知能力、学习特质、知识水平，生成专属角色卡。
          </p>
          <button className="btn-primary" onClick={handleQuickDiagnosis}>开始诊断（快速版）</button>
        </div>
      </div>
    )
  }

  const rc = profile.roleCard
  const tierNames = ['', '初心者', '修学者', '探索者', '攻坚者', '精进者', '大师']

  return (
    <div>
      <h1 className="page-title">学力诊断报告</h1>

      <div className="role-card" style={{marginBottom: 'var(--space-xl)'}}>
        <div style={{fontSize: 'var(--text-3xl)', fontWeight: 600, marginBottom: 'var(--space-sm)'}}>
          {tierNames[rc.tier]} · {rc.talent}
        </div>
        <div style={{fontSize: 'var(--text-lg)', opacity: 0.9, marginBottom: 'var(--space-md)'}}>{rc.mindsetType}</div>
        <div style={{fontSize: 'var(--text-sm)', opacity: 0.8, marginBottom: 'var(--space-md)'}}>
          弱点：{rc.weakness}
        </div>
        <div style={{display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap'}}>
          {rc.trainingTips.map((tip: string, i: number) => (
            <span key={i} style={{background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: 'var(--text-xs)'}}>{tip}</span>
          ))}
        </div>
      </div>

      <div className="stat-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
        <div className="stat-card">
          <div className="stat-card-value">{profile.overall}</div>
          <div className="stat-card-label">综合评分</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{profile.knowledge.overall}</div>
          <div className="stat-card-label">知识水平</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{profile.cognitive.overall}</div>
          <div className="stat-card-label">认知能力</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{profile.traits.overall}</div>
          <div className="stat-card-label">学习特质</div>
        </div>
      </div>

      <div className="card" style={{marginTop: 'var(--space-lg)'}}>
        <h3 style={{marginBottom: 'var(--space-md)'}}>认知维度详情</h3>
        {['fluidReasoning', 'learningAbility', 'workingMemory', 'processingSpeed', 'cognitiveFlexibility'].map(dim => {
          const labels: Record<string, string> = { fluidReasoning: '流体推理', learningAbility: '学习能力', workingMemory: '工作记忆', processingSpeed: '加工速度', cognitiveFlexibility: '认知灵活性' }
          const val = profile.cognitive[dim]
          return (
            <div key={dim} style={{marginBottom: 'var(--space-md)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)'}}>
                <span style={{fontSize: 'var(--text-sm)'}}>{labels[dim]}</span>
                <span style={{fontSize: 'var(--text-sm)', color: 'var(--text-muted)'}}>{val}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{width: `${val}%`, background: val >= 60 ? 'var(--color-success)' : 'var(--color-primary)'}}></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

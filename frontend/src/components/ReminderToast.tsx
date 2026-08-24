import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

interface Reminders {
  reviewTime: string
  studyStartEnabled: boolean
  studyStartTime: string
  breakEnabled: boolean
  breakIntervalMinutes: number
}

interface Toast { title: string; body: string; to?: string }

/**
 * 全局定时提醒：前端定时器，到点弹出提示
 * 到点提醒 = 复盘提醒 + 学习开始提醒 + 休息提醒
 */
export default function ReminderToast() {
  const [toast, setToast] = useState<Toast | null>(null)
  const reminders = useRef<Reminders | null>(null)
  const fired = useRef<Set<string>>(new Set())
  const navigate = useNavigate()

  // 加载提醒配置
  useEffect(() => {
    api.getReminders()
      .then(r => { reminders.current = r })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    const tick = () => {
      const cfg = reminders.current
      if (!cfg) return
      const date = new Date()
      const now = new Date()
      const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      // 本地日期 key（YYY-MM-DD），避免依赖 locale 格式
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

      // 复盘提醒（定点）
      if (cfg.reviewTime === hm) {
        const k = `${dayKey}_review`
        if (!fired.current.has(k)) {
          fired.current.add(k)
          setToast({ title: '🔔 该复盘了', body: '今天的核心知识点学得怎么样了？去成长档案写下复盘，看看自己的成长轨迹吧。', to: '/growth' })
        }
      }

      // 学习开始提醒（定点）
      if (cfg.studyStartEnabled && cfg.studyStartTime === hm) {
        const k = `${dayKey}_study`
        if (!fired.current.has(k)) {
          fired.current.add(k)
          setToast({ title: '📚 学习时间到', body: '趁大脑最清醒，去完成今天的聚焦知识点吧。', to: '/' })
        }
      }

      // 休息提醒（每 N 分钟一轮）
      if (cfg.breakEnabled) {
        const minutesOfDay = now.getHours() * 60 + now.getMinutes()
        const interval = Math.max(15, cfg.breakIntervalMinutes || 45)
        const slot = Math.floor(minutesOfDay / interval)
        const k = `${dayKey}_break_${slot}`
        if (!fired.current.has(k)) {
          fired.current.add(k)
          setToast({ title: '🧘 休息一会儿', body: `已学习一段时间了，起来活动一下、看看远处，对大脑更好哦。` })
        }
      }
    }

    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])

  if (!toast) return null

  const close = () => setToast(null)

  return (
    <div className="reminder-toast" role="alert">
      <div className="reminder-toast-title">{toast.title}</div>
      <div className="reminder-toast-body">{toast.body}</div>
      <div className="reminder-toast-actions">
        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 'var(--text-sm)' }} onClick={close}>知道了</button>
        {toast.to && (
          <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 'var(--text-sm)' }} onClick={() => { navigate(toast.to!); close() }}>
            去看看
          </button>
        )}
      </div>
    </div>
  )
}
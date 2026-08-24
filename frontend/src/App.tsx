import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'
import Today from './pages/Today'
import Learn from './pages/Learn'
import Diagnosis from './pages/Diagnosis'
import KnowledgeMap from './pages/KnowledgeMap'
import WrongBook from './pages/WrongBook'
import SetGoal from './pages/SetGoal'
import { api, getToken } from './api'

function App() {
  const [token, setToken] = useState<string | null>(() => getToken())
  const [checking, setChecking] = useState<boolean>(() => !!getToken())

  // 监听 token 变化（login/register/logout 时通过 setAuth/clearAuth 派发）
  useEffect(() => {
    const handler = () => setToken(getToken())
    window.addEventListener('auth-change', handler)
    return () => window.removeEventListener('auth-change', handler)
  }, [])

  // 启动时校验 token 有效性（仅 401 未登录才清除；限流 429 等不误踢）
  useEffect(() => {
    if (!token) {
      setChecking(false)
      return
    }
    api.me()
      .catch((err: any) => {
        const msg = err?.message || ''
        const isUnauthorized = msg.includes('未登录') || msg.includes('登录已过期')
        if (isUnauthorized) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
        }
      })
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        正在校验登录状态...
      </div>
    )
  }

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" />} />
      <Route path="/register" element={<Navigate to="/" />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Today />} />
        <Route path="/goal" element={<SetGoal />} />
        <Route path="/diagnosis" element={<Diagnosis />} />
        <Route path="/learn/:kpId" element={<Learn />} />
        <Route path="/knowledge" element={<KnowledgeMap />} />
        <Route path="/wrongbook" element={<WrongBook />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App

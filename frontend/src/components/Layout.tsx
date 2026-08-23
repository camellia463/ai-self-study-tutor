import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { api, clearAuth } from '../api'

export default function Layout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = async () => {
    try { await api.logout() } catch (_) {}
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">AI 自学提分</div>
        <NavLink to="/" className={({isActive}) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          今日计划
        </NavLink>
        <NavLink to="/knowledge" className={({isActive}) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          知识图谱
        </NavLink>
        <NavLink to="/wrongbook" className={({isActive}) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          错题本
        </NavLink>
        <NavLink to="/diagnosis" className={({isActive}) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          学力诊断
        </NavLink>
        <NavLink to="/goal" className={({isActive}) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          学习目标
        </NavLink>
        <div style={{marginTop: 'auto', paddingTop: 'var(--space-2xl)', borderTop: '1px solid var(--border-subtle)'}}>
          <div style={{fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)'}}>
            {user.username || '用户'}
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{width: '100%', fontSize: 'var(--text-sm)'}}>
            退出
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

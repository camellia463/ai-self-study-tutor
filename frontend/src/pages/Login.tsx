import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = await api.login(username, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">AI 自学提分</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} placeholder="输入用户名" />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="输入密码" />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: 'var(--space-md)'}}>登录</button>
        </form>
        <div style={{textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)'}}>
          没有账号？<Link to="/register">注册</Link>
        </div>
      </div>
    </div>
  )
}

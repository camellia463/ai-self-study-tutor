import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [gradeLevel, setGradeLevel] = useState('high2')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = await api.register(username, password, gradeLevel)
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
        <h1 className="login-title">注册账号</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} placeholder="2-20位中英文数字" />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="至少6位" />
          </div>
          <div className="form-group">
            <label className="form-label">年级</label>
            <select className="input-field" value={gradeLevel} onChange={e => setGradeLevel(e.target.value)}>
              <option value="high1">高一</option>
              <option value="high2">高二</option>
              <option value="high3">高三</option>
            </select>
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: 'var(--space-md)'}}>注册</button>
        </form>
        <div style={{textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)'}}>
          已有账号？<Link to="/login">登录</Link>
        </div>
      </div>
    </div>
  )
}

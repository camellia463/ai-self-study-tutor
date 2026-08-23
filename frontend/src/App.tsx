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

function App() {
  const token = localStorage.getItem('token')

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

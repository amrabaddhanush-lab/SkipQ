import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Book from './pages/Book'
import MyToken from './pages/MyToken'
import History from './pages/History'
import Settings from './pages/Settings'
import AdminOverview from './pages/AdminOverview'
import AdminQueue from './pages/AdminQueue'
import Analytics from './pages/Analytics'
import Verify from './pages/Verify'
import Info from './pages/Info'
import Layout from './components/Layout'
import { useAuth } from './lib/auth'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-10 text-slate-500">Loading SkipQ…</p>
  return user ? children : <Navigate to="/login" replace />
}

function Role({ role, children }) {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'
  if (role === 'admin' && !isAdmin) return <Navigate to="/" replace />
  if (role === 'customer' && isAdmin) return <Navigate to="/admin" replace />
  return children
}

const C = ({ children }) => <Role role="customer">{children}</Role>
const A = ({ children }) => <Role role="admin">{children}</Role>

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/" element={<C><Dashboard /></C>} />
        <Route path="/book" element={<C><Book /></C>} />
        <Route path="/token" element={<C><MyToken /></C>} />
        <Route path="/history" element={<C><History /></C>} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<A><AdminOverview /></A>} />
        <Route path="/admin/queue" element={<A><AdminQueue /></A>} />
        <Route path="/admin/analytics" element={<A><Analytics /></A>} />
        <Route path="/admin/verify" element={<A><Verify /></A>} />
        <Route path="/p/:slug" element={<Info />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

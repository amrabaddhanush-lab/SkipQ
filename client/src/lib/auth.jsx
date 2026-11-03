import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem('skipq_token'))

  useEffect(() => {
    if (!localStorage.getItem('skipq_token')) return
    api('/me')
      .then(d => setUser(d.user))
      .catch(() => localStorage.removeItem('skipq_token'))
      .finally(() => setLoading(false))
  }, [])

  const save = d => {
    localStorage.setItem('skipq_token', d.token)
    setUser(d.user)
  }
  const login = async (email, password) =>
    save(await api('/login', { method: 'POST', body: { email, password } }))
  const register = async (name, email, password, phone) =>
    save(await api('/register', { method: 'POST', body: { name, email, password, phone } }))
  const updatePhone = async phone => {
    const d = await api('/me/phone', { method: 'PATCH', body: { phone } })
    setUser(d.user)
    return d.user
  }
  const logout = () => {
    localStorage.removeItem('skipq_token')
    setUser(null)
  }

  return <Ctx.Provider value={{ user, loading, login, register, logout, updatePhone }}>{children}</Ctx.Provider>
}

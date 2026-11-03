import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, QrCode, Clock, Sparkles } from 'lucide-react'
import { Button, Input, Logo } from '../components/ui'
import { useAuth } from '../lib/auth'
import SkipQ3DLogo from '../components/SkipQ3DLogo'

const perks = [
  [Clock, 'Live queue position and dynamic wait estimation'],
  [Bell, 'Instant turn alerts with WhatsApp integration'],
  [Sparkles, 'Direct voice execution in English, हिन्दी and తెలుగు'],
  [QrCode, 'High-contrast QR ticket for 1-second check-in'],
]

export default function Login() {
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(f.email, f.password)
      else await register(f.name, f.email, f.password, f.phone)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[1.1fr_1fr] bg-[#f8fafc] text-slate-900">
      {/* Left 3D Showcase Presentation */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 border-r border-slate-800 p-12 text-white md:flex">
        {/* Subtle Ambient Glow */}
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 size-80 rounded-full bg-slate-700/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <Logo light />
          <span className="flex items-center gap-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-xs font-mono font-bold text-orange-400">
            <Sparkles size={13} className="text-orange-400" />
            OFFICIAL 3D EMBLEM
          </span>
        </div>

        <div className="relative z-10 my-auto py-6">
          <div className="flex items-center justify-center my-6">
            <SkipQ3DLogo size={240} interactive={true} scrollReact={false} />
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-black leading-[1.08] text-white tracking-tight">
            Skip the physical line.<br />
            <span className="text-orange-400">
              Keep your exact place.
            </span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-slate-300 leading-relaxed">
            Book digital queue tokens at 26 verified hospitals, banks, and citizen service centres.
            Watch your position live and arrive right when it's your turn.
          </p>
        </div>

        <ul className="relative z-10 space-y-2.5 text-xs text-slate-400 border-t border-slate-800 pt-6">
          {perks.map(([Icon, text]) => (
            <li key={text} className="flex items-center gap-2.5">
              <span className="size-5 rounded-md bg-slate-800 border border-slate-700 grid place-items-center text-orange-400 shrink-0">
                <Icon size={12} />
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Right Login / Register Card */}
      <main className="flex items-center justify-center px-6 py-12 relative bg-[#f8fafc]">
        <div className="w-full max-w-sm relative z-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 md:hidden">
            <Logo />
          </div>

          <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create citizen account'}
          </h1>
          <p className="mb-6 mt-1 text-xs text-slate-500">
            {mode === 'login' ? 'Sign in to manage and track your live queue tokens.' : 'Takes less than 30 seconds.'}
          </p>

          <form onSubmit={submit}>
            {mode === 'register' && (
              <Input label="Full Name" name="name" autoComplete="name" placeholder="Rohan Sharma" required />
            )}
            <Input
              label="Email Address"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
            {mode === 'register' && (
              <Input
                label="WhatsApp / Mobile Number"
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="+91 98765 43210"
              />
            )}
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />

            {error && (
              <p role="alert" className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-700 font-medium">
                {error}
              </p>
            )}

            <Button type="submit" disabled={busy} className="w-full py-3 text-sm mt-2">
              {busy ? 'Verifying credentials…' : mode === 'login' ? 'Sign in to SkipQ' : 'Create my account'}
            </Button>
          </form>

          {/* Demo Credentials Reminder */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-center">
            <span className="font-bold text-orange-600">Admin Login:</span> admin@skipq.app / admin123
          </div>

          <p className="mt-5 text-center text-xs text-slate-500">
            {mode === 'login' ? 'First time using SkipQ?' : 'Already have an account?'}{' '}
            <button
              type="button"
              className="font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            >
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}

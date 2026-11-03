import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, Sun, Moon, Laptop, Bell, Shield, Volume2, Globe, Sparkles,
  Info, LogOut, CheckCircle2, AlertCircle, KeyRound, Smartphone, Check,
  Sliders, ShieldCheck, Heart, ExternalLink
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { api } from '../lib/api'
import { Button, Card, Input } from '../components/ui'
import WhatsAppIcon from '../components/WhatsAppIcon'
import { getLang, setLang, getMode, setMode, speak, LANGS } from '../lib/voice'

export default function Settings() {
  const { user, logout, updatePhone } = useAuth()
  const { theme, setTheme, isDark } = useTheme()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('account')

  // Profile Edit State
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passSaving, setPassSaving] = useState(false)
  const [passMsg, setPassMsg] = useState('')
  const [passError, setPassError] = useState('')

  // Preferences State
  const [autoOpenWa, setAutoOpenWa] = useState(() => {
    try {
      return localStorage.getItem('skipq_auto_wa') !== 'false'
    } catch {
      return true
    }
  })

  const [soundAlerts, setSoundAlerts] = useState(() => {
    try {
      return localStorage.getItem('skipq_sound') !== 'false'
    } catch {
      return true
    }
  })

  const [voiceLang, setVoiceLang] = useState(() => getMode())

  // Handle Profile Update
  async function handleProfileSubmit(e) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg('')
    setProfileError('')
    try {
      const res = await api('/me', {
        method: 'PATCH',
        body: { name, email, phone },
      })
      setProfileMsg('Profile details updated successfully.')
      setTimeout(() => setProfileMsg(''), 4000)
    } catch (err) {
      setProfileError(err.message)
    } finally {
      setProfileSaving(false)
    }
  }

  // Handle Password Update
  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPassSaving(true)
    setPassMsg('')
    setPassError('')

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.')
      setPassSaving(false)
      return
    }

    try {
      await api('/me/password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      })
      setPassMsg('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPassMsg(''), 4000)
    } catch (err) {
      setPassError(err.message)
    } finally {
      setPassSaving(false)
    }
  }

  const toggleAutoWa = val => {
    setAutoOpenWa(val)
    try {
      localStorage.setItem('skipq_auto_wa', val ? 'true' : 'false')
    } catch {}
  }

  const toggleSound = val => {
    setSoundAlerts(val)
    try {
      localStorage.setItem('skipq_sound', val ? 'true' : 'false')
    } catch {}
  }

  const handleLangChange = m => {
    setVoiceLang(m)
    setMode(m)
    if (m !== 'auto') setLang(m)
    speak(m === 'hi' ? 'भाषा हिन्दी सेट हो गई है' : m === 'te' ? 'భాష తెలుగుగా మార్చబడింది' : 'Voice assistant language updated', m === 'auto' ? 'en' : m)
  }

  const initials = (user?.name || 'Citizen').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  const tabs = [
    { id: 'account', label: 'My Account', icon: User },
    { id: 'appearance', label: 'Themes & Colors', icon: Sun },
    { id: 'alerts', label: 'WhatsApp & Alerts', icon: Bell },
    { id: 'voice', label: 'Voice Assistant', icon: Volume2 },
    { id: 'about', label: 'About SkipQ', icon: Info },
  ]

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Preferences
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account profile, choose light or dark themes, configure WhatsApp alerts, and manage system preferences.
        </p>
      </div>

      {/* Navigation Segment Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer select-none ${
                active
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: MY ACCOUNT & PROFILE */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* User Overview Profile Header Card */}
          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-display text-2xl font-black shadow-md">
                {initials}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    {user?.name}
                  </h2>
                  <span className="rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {user?.role === 'admin' ? 'Staff Authority' : 'Verified Citizen'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
                {user?.phone ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <WhatsAppIcon size={13} className="text-[#25D366]" /> Linked: {user.phone}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                    No WhatsApp number saved yet
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-4 py-2 text-xs font-bold transition cursor-pointer"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </Card>

          {/* Edit Profile Form Card */}
          <Card>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-1">
              Edit Account Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Update your citizen display name, registered email address, and WhatsApp contact for live queue telemetry.
            </p>

            {profileMsg && (
              <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>{profileMsg}</span>
              </div>
            )}
            {profileError && (
              <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 dark:text-rose-400" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
              <Input
                label="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Rohan Sharma"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <Input
                label="WhatsApp / Mobile Number"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />

              <div className="pt-2">
                <Button type="submit" disabled={profileSaving} className="px-6">
                  {profileSaving ? 'Saving changes…' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password Card */}
          <Card>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <KeyRound size={18} className="text-orange-600" /> Change Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Ensure your account uses a secure password of at least 6 characters.
            </p>

            {passMsg && (
              <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>{passMsg}</span>
              </div>
            )}
            {passError && (
              <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 dark:text-rose-400" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="New Password (min. 6 characters)"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <div className="pt-2">
                <Button type="submit" disabled={passSaving} variant="outline" className="px-6">
                  {passSaving ? 'Updating password…' : 'Update Password'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 2: APPEARANCE & THEMES (LIGHT / DARK SWITCHER) */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">
              Theme & Appearance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Switch seamlessly between daylight white and dark obsidian themes. The entire layout, cards, sidebar, and 3D backgrounds update instantly.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Light (White) Card */}
              <div
                onClick={() => setTheme('light')}
                className={`flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition select-none ${
                  theme === 'light'
                    ? 'border-orange-600 ring-2 ring-orange-500/20 bg-orange-50/50 dark:bg-slate-800'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                      <Sun size={20} />
                    </span>
                    {theme === 'light' && (
                      <span className="size-5 rounded-full bg-orange-600 text-white grid place-items-center text-xs">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-extrabold text-base text-slate-900 dark:text-white">Light Mode</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Crisp daylight slate, pure white cards, and warm orange accents.
                  </p>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-[#f8fafc] p-2.5 shadow-2xs">
                  <div className="h-2 w-16 rounded-full bg-orange-600 mb-1.5" />
                  <div className="h-2 w-28 rounded-full bg-slate-300" />
                </div>
              </div>

              {/* Dark Mode Card */}
              <div
                onClick={() => setTheme('dark')}
                className={`flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition select-none ${
                  theme === 'dark'
                    ? 'border-orange-600 ring-2 ring-orange-500/20 bg-orange-50/50 dark:bg-slate-800'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-slate-800 text-amber-400">
                      <Moon size={20} />
                    </span>
                    {theme === 'dark' && (
                      <span className="size-5 rounded-full bg-orange-600 text-white grid place-items-center text-xs">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-extrabold text-base text-slate-900 dark:text-white">Dark Mode</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Deep obsidian charcoal slate, soft ambient glow, and high-contrast night readability.
                  </p>
                </div>

                <div className="mt-5 rounded-xl border border-slate-700 bg-[#0b1120] p-2.5 shadow-2xs">
                  <div className="h-2 w-16 rounded-full bg-orange-500 mb-1.5" />
                  <div className="h-2 w-28 rounded-full bg-slate-700" />
                </div>
              </div>

              {/* System Preference Card */}
              <div
                onClick={() => setTheme('system')}
                className={`flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition select-none ${
                  theme === 'system'
                    ? 'border-orange-600 ring-2 ring-orange-500/20 bg-orange-50/50 dark:bg-slate-800'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <Laptop size={20} />
                    </span>
                    {theme === 'system' && (
                      <span className="size-5 rounded-full bg-orange-600 text-white grid place-items-center text-xs">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-extrabold text-base text-slate-900 dark:text-white">System Auto</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Automatically matches your operating system’s dark/light schedule.
                  </p>
                </div>

                <div className="mt-5 flex gap-1 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5">
                  <div className="flex-1 bg-slate-100 p-1.5 rounded-md">
                    <div className="h-1.5 w-8 rounded-full bg-slate-400" />
                  </div>
                  <div className="flex-1 bg-slate-900 p-1.5 rounded-md">
                    <div className="h-1.5 w-8 rounded-full bg-orange-400" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: WHATSAPP & ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white">
                <WhatsAppIcon size={20} />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  WhatsApp Direct Integration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connect your live queue slips directly to WhatsApp Web or mobile app.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    Auto-Open WhatsApp on Booking
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Automatically launch WhatsApp with your pre-filled digital token slip whenever you book a ticket.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoOpenWa}
                  onChange={e => toggleAutoWa(e.target.checked)}
                  className="size-5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    Audio Chime on Turn Call
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Play a gentle audio notification chime when your counter is called by staff.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={e => toggleSound(e.target.checked)}
                  className="size-5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: VOICE ASSISTANT */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <span className="grid size-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                <Volume2 size={20} />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Voice Assistant & Language Autodetection
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure speech synthesis, language preferences, and direct action behavior.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Preferred Language Mode
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    ['auto', 'Auto-detect (All 3)'],
                    ['en', 'English (en-IN)'],
                    ['hi', 'हिन्दी (Hindi)'],
                    ['te', 'తెలుగు (Telugu)'],
                  ].map(([m, label]) => (
                    <button
                      key={m}
                      onClick={() => handleLangChange(m)}
                      className={`rounded-xl border p-3 text-xs font-bold transition cursor-pointer text-left ${
                        voiceLang === m
                          ? 'border-orange-600 bg-orange-50 dark:bg-slate-800 text-orange-700 dark:text-orange-400 ring-2 ring-orange-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white text-sm">Direct Action Booking Mode</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Active by default. The assistant parses entity names (Apollo, SBI, HDFC, Passport, RTO) and executes immediately without asking confirmation prompts.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: ABOUT SKIPQ & GITHUB READINESS */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-orange-600 text-white font-display text-xl font-black shadow-xs">
                  SQ
                </span>
                <div>
                  <h3 className="font-display text-2xl font-black text-slate-900 dark:text-white">
                    Skip<span className="text-orange-600">Q</span> Platform
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Version 2.8.0 · Production Ready Release
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1 text-xs font-mono font-bold">
                ● ALL 26 TELEMETRY QUEUES LIVE
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50">
                <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">Architecture & Stack</p>
                <ul className="space-y-1 text-slate-500 dark:text-slate-400">
                  <li>• React 19 + Vite 8 + Tailwind CSS v4</li>
                  <li>• Express.js + SQLite with WAL Mode</li>
                  <li>• Socket.IO Real-Time Telemetry</li>
                  <li>• Native Web Speech Recognition API</li>
                  <li>• Dynamic 3D Perspective Canvas Engine</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50">
                <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">GitHub Publishing Readiness</p>
                <ul className="space-y-1 text-slate-500 dark:text-slate-400">
                  <li>• Clean component tree, 0 console errors</li>
                  <li>• Production build certified passing</li>
                  <li>• Secure JWT authentication + bcrypt hashing</li>
                  <li>• Comprehensive seed dataset with 26 centres</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Link to="/p/help" className="hover:text-orange-600">Documentation</Link>
                <Link to="/p/faq" className="hover:text-orange-600">Citizen FAQ</Link>
                <Link to="/p/contact" className="hover:text-orange-600">Support Helpline</Link>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                © {new Date().getFullYear()} SkipQ Citizen Queue Infrastructure
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

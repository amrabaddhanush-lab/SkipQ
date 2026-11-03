import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom'
import {
  Bell, Menu, X, LayoutDashboard, CalendarPlus, Ticket, History, LifeBuoy,
  ListChecks, BarChart3, ScanLine, Stethoscope, Landmark, Building2,
  GraduationCap, Headphones, FileText, HelpCircle, PhoneCall,
  Settings, Sun, Moon,
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { api } from '../lib/api'
import { useLive } from '../lib/uselive'
import { Logo } from './ui'
import Background3D from './background3d'
import TopSearch from './Topsearch'
import VoiceAssistant from './voiceassistant'
import Footer from './footer'

const coreCustomerNav = [
  ['/', 'Dashboard', LayoutDashboard, true],
  ['/book', 'Book a Token', CalendarPlus, false],
  ['/token', 'My Active Token', Ticket, false],
  ['/history', 'Visit History', History, false],
  ['/settings', 'Settings & Preferences', Settings, false],
]

const sectorNav = [
  ['/book?cat=Hospital', 'Hospitals & Health', Stethoscope, false],
  ['/book?cat=Bank', 'Banking & Finance', Landmark, false],
  ['/book?cat=Government', 'Govt & Citizen Desks', Building2, false],
  ['/book?cat=College', 'Colleges & Universities', GraduationCap, false],
  ['/book?cat=Support', 'Customer Support', Headphones, false],
]

const resourceNav = [
  ['/p/help', 'Required Documents', FileText, false],
  ['/p/faq', 'Citizen FAQs', HelpCircle, false],
  ['/p/contact', 'Helpline & Contacts', PhoneCall, false],
]

const adminNav = [
  ['/admin', 'Overview', LayoutDashboard, true],
  ['/admin/queue', 'Queue Control', ListChecks, false],
  ['/admin/analytics', 'Telemetry Analytics', BarChart3, false],
  ['/admin/verify', 'Verify Token', ScanLine, false],
  ['/settings', 'Settings & Profile', Settings, false],
  ['/p/help', 'Help & Support', LifeBuoy, false],
]

function Notifications() {
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)

  const load = () =>
    api('/notifications')
      .then(d => {
        setItems(d.items)
        setUnread(d.unread)
      })
      .catch(() => {})

  useEffect(() => {
    load()
  }, [])

  useLive(load)

  function toggle() {
    setOpen(o => !o)

    if (!open && unread) {
      api('/notifications/read', { method: 'POST' })
        .then(() => setUnread(0))
        .catch(() => {})
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-label={`Notifications, ${unread} unread`}
        className="relative grid size-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 cursor-pointer shadow-2xs"
      >
        <Bell size={18} />

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-orange-600 text-[10px] font-bold text-white shadow-2xs animate-pulse">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl text-slate-900 dark:text-white">
          <p className="px-3 py-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800">
            Live Notifications
          </p>

          {items.length === 0 && (
            <p className="px-3 py-5 text-sm text-slate-400 text-center">
              No new notifications.
            </p>
          )}

          {items.map(n => (
            <div
              key={n.id}
              className="rounded-xl px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {n.title}
              </p>

              <p className="whitespace-pre-line text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {n.body}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const admin = user?.role === 'admin'

  const [open, setOpen] = useState(() => window.innerWidth >= 1024)

  const initials = (user?.name || 'Citizen')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const closeOnMobile = () => {
    if (window.innerWidth < 1024) setOpen(false)
  }

  const isLinkActive = (to, end) => {
    if (to.includes('?')) {
      return location.pathname + location.search === to
    }

    return end
      ? location.pathname === to
      : location.pathname.startsWith(to)
  }

  const renderNavItem = ([to, label, Icon, end]) => {
    const active = isLinkActive(to, end)

    return (
      <NavLink
        key={to}
        to={to}
        onClick={closeOnMobile}
        className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
          active
            ? 'bg-orange-50 dark:bg-slate-800 text-orange-700 dark:text-orange-400 font-bold border-l-3 border-orange-600'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-lg transition ${
            active
              ? 'bg-orange-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-800 dark:group-hover:text-white'
          }`}
        >
          <Icon size={15} />
        </span>

        <span className="truncate">{label}</span>
      </NavLink>
    )
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col bg-[#f8fafc] dark:bg-[#0b1120] transition-colors duration-250">
      <Background3D />

      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Main menu"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-slate-800">
          <Logo />

          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
          {admin ? (
            <div>
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Staff Console
              </p>

              <div className="space-y-1">
                {adminNav.map(renderNavItem)}
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Main Portal
                </p>

                <div className="space-y-1">
                  {coreCustomerNav.map(renderNavItem)}
                </div>
              </div>

              <div>
                <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Verified Sectors
                </p>

                <div className="space-y-1">
                  {sectorNav.map(renderNavItem)}
                </div>
              </div>

              <div>
                <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Citizen Resources
                </p>

                <div className="space-y-1">
                  {resourceNav.map(renderNavItem)}
                </div>
              </div>
            </>
          )}
        </nav>

        <div className="space-y-2 p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70">
          <Link
            to="/settings"
            onClick={closeOnMobile}
            className="flex items-center gap-2.5 rounded-xl bg-white dark:bg-slate-800/80 p-2.5 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:border-orange-400 transition group cursor-pointer"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-orange-600 text-xs font-bold text-white shadow-2xs">
              {initials}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition">
                {user?.name}
              </p>

              <p className="text-[10px] uppercase font-bold tracking-wider text-orange-600 dark:text-orange-400">
                {admin ? 'Staff Authority' : 'Verified Citizen'}
              </p>
            </div>
          </Link>

          <Link
            to="/settings"
            onClick={closeOnMobile}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-orange-700 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-700 py-2 text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
          >
            <Settings size={15} className="text-orange-600" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      <div className={`flex min-h-screen flex-col transition-[padding] duration-300 ${open ? 'lg:pl-64' : ''}`}>
        <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <button
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Hide menu' : 'Show menu'}
              aria-expanded={open}
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <Menu size={18} />
            </button>

            <TopSearch />

            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {!admin && <Notifications />}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          <Outlet />
        </main>

        <Footer />
      </div>

      <VoiceAssistant />
    </div>
  )
}
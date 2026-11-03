import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Clock, Sparkles } from 'lucide-react'
import { Logo } from './ui'
import { useAuth } from '../lib/auth'
import { SITE } from '../lib/site'

const linkCls = 'text-xs text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:underline transition'

function Col({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

export default function Footer() {
  const { user } = useAuth()
  const admin = user?.role === 'admin'

  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{SITE.tagline}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 px-3 py-1 text-[11px] font-semibold text-orange-700 dark:text-orange-400">
            <Sparkles size={12} className="text-orange-600 dark:text-orange-400" /> English · हिन्दी · తెలుగు
          </div>
        </div>

        <Col title="Navigation">
          {admin ? (
            <>
              <li><Link className={linkCls} to="/admin">Overview</Link></li>
              <li><Link className={linkCls} to="/admin/queue">Queue control</Link></li>
              <li><Link className={linkCls} to="/admin/analytics">Analytics</Link></li>
              <li><Link className={linkCls} to="/admin/verify">Verify token</Link></li>
              <li><Link className={linkCls} to="/settings">Settings</Link></li>
            </>
          ) : (
            <>
              <li><Link className={linkCls} to="/">Dashboard</Link></li>
              <li><Link className={linkCls} to="/book">Book a token</Link></li>
              <li><Link className={linkCls} to="/token">My active token</Link></li>
              <li><Link className={linkCls} to="/history">Visit history</Link></li>
              <li><Link className={linkCls} to="/settings">Settings & Account</Link></li>
            </>
          )}
        </Col>

        <Col title="Citizen Resources">
          <li><Link className={linkCls} to="/p/help">Help centre</Link></li>
          <li><Link className={linkCls} to="/p/faq">Frequently Asked Questions</Link></li>
          <li><Link className={linkCls} to="/p/contact">Support contact</Link></li>
          <li><Link className={linkCls} to="/p/contact">Report a problem</Link></li>
        </Col>

        <Col title="Operations Care">
          <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Phone size={14} className="mt-0.5 shrink-0 text-orange-600 dark:text-orange-400" />
            <span>Toll-Free Helpline: <b className="text-slate-800 dark:text-slate-200">{SITE.supportPhone}</b></span>
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Mail size={14} className="mt-0.5 shrink-0 text-orange-600 dark:text-orange-400" />
            <span>{SITE.supportEmail}</span>
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <MapPin size={14} className="mt-0.5 shrink-0 text-orange-600 dark:text-orange-400" />
            <span>{SITE.city}</span>
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock size={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Support: 8:00 AM – 8:00 PM</span>
          </li>
        </Col>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} SkipQ Citizen Queue Infrastructure. All verified centres active.
      </div>
    </footer>
  )
}

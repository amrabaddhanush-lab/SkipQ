import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Ticket, CheckCircle2, Timer, MessageSquareHeart, Stethoscope, Landmark, Building2,
  GraduationCap, Headphones, ArrowRight, MapPin, ChevronRight,
} from 'lucide-react'
import { api } from '../lib/api'
import { useLive } from '../lib/useLive'
import { useAuth } from '../lib/auth'
import { Card } from '../components/ui'
import Badge from '../components/Badge'
import SearchBar from '../components/SearchBar'
import RateCard from '../components/RateCard'
import { Stars } from '../components/Stars'
import ThumbnailHero from '../components/ThumbnailHero'

const cats = [
  ['Hospital', Stethoscope, 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'],
  ['Bank', Landmark, 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'],
  ['Government', Building2, 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'],
  ['College', GraduationCap, 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'],
  ['Support', Headphones, 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50'],
]

const Stat = ({ icon: Icon, label, value }) => (
  <Card className="flex items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-2xs">
    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/60">
      <Icon size={22} />
    </span>
    <div>
      <p className="font-display text-3xl font-extrabold leading-none text-slate-900 dark:text-white tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
    </div>
  </Card>
)

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [d, setD] = useState(null)
  const [services, setServices] = useState([])
  const [q, setQ] = useState('')
  const [error, setError] = useState('')
  const contentRef = useRef(null)

  const load = () => {
    api('/dashboard').then(setD).catch(e => setError(e.message))
    api('/services').then(r => setServices(r.services)).catch(() => {})
  }
  useEffect(() => { load() }, [])
  useLive(load)

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const first = (user?.name || 'Citizen').split(' ')[0]
  const top = [...services]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.ratingCount - a.ratingCount)
    .slice(0, 5)

  const countFor = catName => services.filter(s => s.category === catName).length

  if (!d) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 gap-3">
        <div className="size-8 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold">{error || 'Initializing SkipQ real-time telemetry…'}</p>
      </div>
    )
  }

  const a = d.active

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 3D Official Logo Animated Thumbnail Hero Showcase */}
      <ThumbnailHero
        onScrollToContent={scrollToContent}
        totalServices={services.length || 26}
      />

      <div ref={contentRef} className="space-y-6">
        {/* Welcome & Fast Search Bar */}
        <section className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-white shadow-2xs sm:p-8 relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold tracking-wider uppercase text-orange-600 dark:text-orange-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              TELEMETRY LIVE
            </span>
          </div>

          <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            {greet}, <span className="text-orange-600 dark:text-orange-400">{first}</span>
          </h2>
          <p className="mb-6 mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            Choose from 26 verified hospitals, banks, and citizen service centres, or use the voice assistant to book directly.
          </p>

          <SearchBar value={q} onChange={setQ} onSubmit={v => navigate(`/book?q=${encodeURIComponent(v)}`)} />
        </section>

        {/* Active Ticket Banner */}
        {a ? (
          <Link to="/token" className="block group">
            <Card className="flex flex-wrap items-center gap-5 border-orange-300 dark:border-orange-500/50 bg-orange-50/40 dark:bg-slate-900/90 hover:bg-orange-50/70 dark:hover:bg-slate-800/80 transition shadow-2xs">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">ACTIVE TOKEN IN LINE</p>
                <p className="font-display text-5xl font-black text-slate-900 dark:text-white">
                  {a.label}
                </p>
              </div>
              <div className="min-w-44 flex-1">
                <p className="font-bold text-slate-900 dark:text-white text-base leading-snug">{a.serviceName}</p>
                {a.serviceLocation && (
                  <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <MapPin size={13} className="text-orange-600 dark:text-orange-400" /> {a.serviceLocation}
                  </p>
                )}
                {a.status === 'serving' ? (
                  <p className="mt-1.5 font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 text-sm">
                    <span className="size-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                    Now your turn! Go to Counter {a.counter}.
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                    Queue Position: <b className="text-slate-900 dark:text-white">#{a.position}</b> · Approx. <b className="text-orange-700 dark:text-orange-400">{a.etaMinutes} min</b> wait
                  </p>
                )}
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2.5 rounded-xl transition shadow-xs">
                View Live Ticket <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
              </span>
            </Card>
          </Link>
        ) : (
          <Card className="flex flex-wrap items-center justify-between gap-4 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">No active queue token held</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Browse 26 verified centres below to get your digital ticket in seconds.</p>
            </div>
            <Link
              to="/book"
              className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
            >
              Browse all 26 centres <ChevronRight size={15} />
            </Link>
          </Card>
        )}

        {/* 4 KPI Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={Ticket}
            label="Total visits held"
            value={d.stats.visits}
          />
          <Stat
            icon={CheckCircle2}
            label="Visits completed"
            value={d.stats.completed}
          />
          <Stat
            icon={Timer}
            label="Average wait time (min)"
            value={d.stats.avgWait}
          />
          <Stat
            icon={MessageSquareHeart}
            label="Pending feedback"
            value={d.stats.pendingFeedback}
          />
        </div>

        {/* Pending Ratings Card */}
        {d.pendingRatings.length > 0 && (
          <section>
            <h3 className="mb-3 font-display text-xl font-extrabold text-slate-900 dark:text-white">Rate your recent visit</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {d.pendingRatings.map(t => <RateCard key={t.id} token={t} onDone={load} />)}
            </div>
          </section>
        )}

        {/* Browse by Category */}
        <section>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-display text-xl font-extrabold text-slate-900 dark:text-white">Explore by sector</h3>
            <Link to="/book" className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline">
              View all ({services.length})
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
            {cats.map(([name, Icon, style]) => {
              const count = countFor(name)
              return (
                <Link
                  key={name}
                  to={`/book?cat=${name}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs transition hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-xs"
                >
                  <span className={`grid size-11 place-items-center rounded-xl ${style}`}>
                    <Icon size={20} />
                  </span>
                  <div>
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">{name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{count} {count === 1 ? 'centre' : 'centres'}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Top Rated & Recent Telemetry */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Rated Centres */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl font-extrabold text-slate-900 dark:text-white">Top rated centres</h3>
              <Link to="/book" className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline">See all 26</Link>
            </div>
            <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden shadow-2xs">
              {top.length === 0 && <p className="p-4 text-slate-500 dark:text-slate-400">Loading verified centres…</p>}
              {top.map(s => (
                <Link
                  key={s.id}
                  to={`/book?q=${encodeURIComponent(s.name)}`}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{s.name}</p>
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0 border border-slate-200 dark:border-slate-700">
                        {s.category}
                      </span>
                    </div>
                    {s.location && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{s.location}</p>
                    )}
                    <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {s.rating ? (
                        <>
                          <Stars value={s.rating} size={12} />
                          <b className="text-amber-600 dark:text-amber-400 font-bold">{s.rating}</b>
                          <span className="text-slate-400">({s.ratingCount} reviews)</span>
                        </>
                      ) : (
                        <span className="text-slate-400">New centre</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {s.waiting} waiting
                    </span>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">~{s.etaMinutes} min</p>
                  </div>
                </Link>
              ))}
            </Card>
          </section>

          {/* Recent Visits */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl font-extrabold text-slate-900 dark:text-white">Recent visit logs</h3>
              <Link to="/history" className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline">Full history</Link>
            </div>
            <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden shadow-2xs">
              {d.recent.length === 0 && (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                  <p>No prior visits recorded for this account yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Your token check-ins and ratings will appear here.</p>
                </div>
              )}
              {d.recent.map(t => (
                <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {t.label} <span className="font-normal text-slate-500 dark:text-slate-400">· {t.serviceName}</span>
                    </p>
                    <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge status={t.status} />
                </div>
              ))}
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}

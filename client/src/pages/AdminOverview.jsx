import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Clock, Headset, CheckCircle2, Timer, Star, ScanLine, BarChart3, ListChecks } from 'lucide-react'
import { api } from '../lib/api'
import { useLive } from '../lib/useLive'
import { Card } from '../components/ui'
import { Stars } from '../components/Stars'

const Kpi = ({ icon: Icon, label, value }) => (
  <Card className="flex items-center gap-3.5 hover:border-slate-300 transition shadow-xs">
    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
      <Icon size={22} />
    </span>
    <div>
      <p className="font-display text-2xl font-black text-slate-900 leading-none">{value}</p>
      <p className="mt-1 text-xs text-slate-500 font-medium">{label}</p>
    </div>
  </Card>
)

const fmtHour = h => (h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`)

export default function AdminOverview() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')

  const load = () => api('/admin/overview').then(setD).catch(e => setError(e.message))
  useEffect(() => {
    load()
    const t = setInterval(load, 20000)
    return () => clearInterval(t)
  }, [])
  useLive(load)

  if (!d) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
        <div className="size-8 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold">{error || 'Loading operations overview…'}</p>
      </div>
    )
  }
  const { kpis: k, services, hours, feedback } = d
  const max = Math.max(1, ...hours.map(h => h.count))

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Operations Telemetry</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · LIVE SYNC
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <Link to="/admin/queue" className="flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 px-4 py-2 text-white shadow-xs transition">
            <ListChecks size={15} /> Manage queues
          </Link>
          <Link to="/admin/verify" className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 hover:border-orange-500 transition shadow-xs">
            <ScanLine size={15} /> Verify token
          </Link>
          <Link to="/admin/analytics" className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 hover:border-orange-500 transition shadow-xs">
            <BarChart3 size={15} /> Analytics
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi
          icon={Users}
          label="Visitors today"
          value={k.visitors}
        />
        <Kpi
          icon={Clock}
          label="Waiting now"
          value={k.waiting}
        />
        <Kpi
          icon={Headset}
          label="Being served"
          value={k.serving}
        />
        <Kpi
          icon={CheckCircle2}
          label="Completed today"
          value={k.completed}
        />
        <Kpi
          icon={Timer}
          label="Avg wait (min)"
          value={k.avgWait}
        />
        <Kpi
          icon={Star}
          label={`Avg rating (${k.ratingCount} reviews)`}
          value={k.rating ?? '–'}
        />
      </div>

      <Card className="p-0 overflow-hidden shadow-xs">
        <h2 className="border-b border-slate-100 p-4 font-bold text-slate-900 text-base">Live status by service ({services.length})</h2>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full min-w-[580px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 sticky top-0 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Waiting</th>
                <th className="px-4 py-3">Serving</th>
                <th className="px-4 py-3">Today</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {s.name}
                    <span className="block text-xs font-normal text-slate-500">{s.category} · {s.counters} counters</span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${s.waiting > 8 ? 'bg-rose-50 text-rose-800 border-rose-300' : s.waiting > 3 ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300'}`}>
                      {s.waiting}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-800 font-bold">{s.serving}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{s.today}</td>
                  <td className="px-4 py-3">
                    {s.rating ? <span className="flex items-center gap-1 text-amber-600 font-semibold"><Stars value={s.rating} size={12} /> {s.rating}</span> : <span className="text-slate-400">New</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${s.paused ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-800 border-emerald-300'}`}>
                      {s.paused ? 'Paused' : 'Open'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-bold text-slate-900 text-base">Tokens booked by hour</h2>
          <div className="flex h-44 items-end gap-1.5" role="img" aria-label="Bar chart of tokens booked per hour">
            {hours.map(h => (
              <div key={h.hour} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-orange-600 font-mono font-bold">{h.count || ''}</span>
                <div
                  className="w-full rounded-t-md bg-orange-500 transition-all duration-300"
                  style={{ height: `${(h.count / max) * 100}%`, minHeight: h.count ? 4 : 2, opacity: h.count ? 1 : 0.2 }}
                />
                <span className="text-[10px] text-slate-500">{fmtHour(h.hour)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden shadow-xs">
          <h2 className="border-b border-slate-100 p-4 font-bold text-slate-900 text-base">Latest customer feedback</h2>
          {feedback.length === 0 && <p className="p-4 text-slate-500">No reviews yet.</p>}
          <div className="divide-y divide-slate-100">
            {feedback.map((f, i) => (
              <div key={i} className="p-4 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between">
                  <Stars value={f.stars} size={13} />
                  <span className="text-xs text-slate-400">{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
                {f.comment && <p className="mt-1 text-sm text-slate-700">“{f.comment}”</p>}
                <p className="text-xs text-orange-600 mt-1 font-semibold">{f.user} · <span className="text-slate-500 font-normal">{f.service}</span></p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

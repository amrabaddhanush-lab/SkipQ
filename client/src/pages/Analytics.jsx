import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useLive } from '../lib/useLive'
import { Card } from '../components/ui'

const Stat = ({ label, value, highlight = '' }) => (
  <Card className="hover:border-slate-300 transition shadow-xs">
    <p className={`text-3xl font-extrabold text-slate-900 font-display ${highlight}`}>{value}</p>
    <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
  </Card>
)

export default function Analytics() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')

  const load = () => api('/admin/analytics').then(setD).catch(e => setError(e.message))
  useEffect(() => {
    load()
  }, [])
  useLive(load)

  if (!d) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
        <div className="size-8 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold">{error || 'Compiling queue analytics…'}</p>
      </div>
    )
  }
  const max = Math.max(1, ...d.byService.map(s => s.total))

  return (
    <section className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Performance Telemetry</h1>
        <p className="text-xs text-slate-500 mt-1 font-mono">24-HOUR AGGREGATE SYSTEM STATS</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Visitors today" value={d.visitors} highlight="text-orange-600" />
        <Stat label="Completed" value={d.completed} highlight="text-emerald-700" />
        <Stat label="Skipped / cancelled" value={d.dropped} highlight="text-rose-600" />
        <Stat label="Avg wait time (min)" value={d.avgWait} highlight="text-amber-600" />
        <Stat label="Avg service time (min)" value={d.avgService} highlight="text-slate-700" />
      </div>

      <Card className="shadow-xs">
        <h2 className="mb-4 font-bold text-slate-900 text-base">Tokens Booked by Centre (Top Activity)</h2>
        <div className="space-y-4">
          {d.byService.map(s => (
            <div key={s.name}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-slate-700 font-medium">{s.name}</span>
                <b className="text-orange-600 font-mono">{s.total} tokens</b>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${(s.total / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}

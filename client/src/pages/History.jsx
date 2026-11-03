import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Card } from '../components/ui'
import Badge from '../components/Badge'
import RateCard from '../components/RateCard'
import { Stars } from '../components/stars'

export default function History() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  const load = () => api('/tokens/me').then(d => setRows(d.history)).catch(e => setError(e.message))
  useEffect(() => { load() }, [])

  return (
    <section className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Your visit history</h1>
        <p className="mt-1 text-sm text-slate-500">Review past tokens held across hospitals, banks, and citizen service centres.</p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {!rows && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
          <div className="size-8 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold">Loading your telemetry logs…</p>
        </div>
      )}

      {rows && (
        <Card className="divide-y divide-slate-100 p-0 overflow-hidden shadow-xs">
          {rows.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              <p className="font-semibold text-slate-900">No visits recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">Book a token at any centre to start seeing your logs here.</p>
            </div>
          )}
          {rows.map(t => (
            <div key={t.id} className="p-5 hover:bg-slate-50 transition">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900 text-base">
                    {t.label} <span className="font-normal text-slate-500">· {t.serviceName}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge status={t.status} />
                  {t.myRating && <Stars value={t.myRating} size={13} />}
                </div>
              </div>
              {t.status === 'done' && !t.myRating && (
                <div className="mt-4"><RateCard token={t} onDone={load} /></div>
              )}
            </div>
          ))}
        </Card>
      )}
    </section>
  )
}

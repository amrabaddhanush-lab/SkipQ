import { useEffect, useState } from 'react'
import { Pause, Play, Plus, Minus, UserPlus } from 'lucide-react'
import { api } from '../lib/api'
import { useLive } from '../lib/useLive'
import { Button, Card } from '../components/ui'

export default function AdminQueue() {
  const [services, setServices] = useState([])
  const [sid, setSid] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/admin/services')
      .then(d => {
        setServices(d.services)
        setSid(d.services[0]?.id ?? null)
      })
      .catch(e => setError(e.message))
  }, [])

  const load = () => {
    if (!sid) return
    api(`/admin/services/${sid}/queue`).then(setData).catch(e => setError(e.message))
  }

  useEffect(() => {
    setData(null)
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [sid])
  useLive(load)

  async function act(path, body) {
    try {
      await api(path, { method: 'POST', body })
      setError('')
    } catch (e) {
      setError(e.message)
    }
    load()
  }

  if (!data) return <p className="text-slate-600">{error || 'Loading queue…'}</p>
  const { service, counters, waiting } = data
  const cats = [...new Set(services.map(s => s.category))]

  return (
    <section className="space-y-5 animate-fadeIn">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Queue Control Desk</h1>
        <p className="text-xs text-slate-500 mt-1">Manage active counter dispatches, call next tokens, and control walk-in flows.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Service centre"
          value={sid}
          onChange={e => setSid(Number(e.target.value))}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-semibold text-sm max-w-md shadow-xs text-slate-800"
        >
          {cats.map(cat => (
            <optgroup key={cat} label={`${cat}s`}>
              {services.filter(s => s.category === cat).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </optgroup>
          ))}
        </select>

        <Button variant="outline" onClick={() => act(`/admin/services/${sid}/pause`)}>
          <span className="flex items-center gap-2">
            {service.paused ? <Play size={16} /> : <Pause size={16} />}
            {service.paused ? 'Resume queue' : 'Pause queue'}
          </span>
        </Button>
        <Button variant="outline" onClick={() => act(`/admin/services/${sid}/walkin`, { name: 'Walk-in' })}>
          <span className="flex items-center gap-2"><UserPlus size={16} /> Add walk-in</span>
        </Button>

        <div className="ml-auto flex items-center gap-2 text-sm">
          <button aria-label="Remove counter" className="rounded-lg border border-slate-300 bg-white p-2 hover:bg-slate-50 cursor-pointer text-slate-700 shadow-2xs"
            onClick={() => act(`/admin/services/${sid}/counters`, { delta: -1 })}><Minus size={14} /></button>
          <span className="font-semibold text-slate-800">{service.counters} counters</span>
          <button aria-label="Add counter" className="rounded-lg border border-slate-300 bg-white p-2 hover:bg-slate-50 cursor-pointer text-slate-700 shadow-2xs"
            onClick={() => act(`/admin/services/${sid}/counters`, { delta: 1 })}><Plus size={14} /></button>
        </div>
      </div>

      {service.paused && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 border border-amber-200">
          This queue is paused. Customers can’t book and you can’t call the next token.
        </p>
      )}
      {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 border border-rose-200">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counters.map(c => (
          <Card key={c.counter} className="shadow-xs">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Counter {c.counter}</h2>
            {c.token ? (
              <>
                <p className="text-4xl font-extrabold text-orange-600 font-display">{c.token.label}</p>
                <p className="mb-4 text-sm font-medium text-slate-700">{c.token.name}</p>
                <div className="flex gap-2">
                  <Button onClick={() => act(`/admin/tokens/${c.token.id}/complete`)}>Complete</Button>
                  <Button variant="danger" onClick={() => act(`/admin/tokens/${c.token.id}/skip`)}>Skip</Button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 text-lg font-semibold text-slate-400">Counter Free</p>
                <Button
                  disabled={!waiting.length || service.paused}
                  onClick={() => act(`/admin/services/${sid}/call-next`, { counter: c.counter })}
                >
                  Call next
                </Button>
              </>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden shadow-xs">
        <h2 className="border-b border-slate-100 p-4 font-bold text-slate-900">Waiting in line ({waiting.length})</h2>
        {waiting.length === 0 && <p className="p-4 text-slate-500">Nobody is waiting right now.</p>}
        {waiting.map(t => (
          <div key={t.id} className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 last:border-0 hover:bg-slate-50 transition">
            <div>
              <p className="font-bold text-slate-900">{t.label} <span className="font-normal text-slate-500">· {t.name}</span></p>
              <p className="text-xs text-slate-400">
                Waiting {Math.round((Date.now() - t.createdAt) / 60000)} min
              </p>
            </div>
            <Button variant="danger" onClick={() => act(`/admin/tokens/${t.id}/cancel`)}>Cancel</Button>
          </div>
        ))}
      </Card>
    </section>
  )
}

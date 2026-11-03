import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Stethoscope, Landmark, Building2, GraduationCap, Headphones, Ticket,
  MapPin, Clock, Phone, Mail, FileText, CheckCircle2,
  Info, X, CheckSquare, Square, Search
} from 'lucide-react'
import { api } from '../lib/api'
import { useLive } from '../lib/useLive'
import { Button, Card } from '../components/ui'
import { Stars } from '../components/Stars'
import WhatsAppIcon from '../components/WhatsAppIcon'

const look = {
  Hospital: [Stethoscope, 'bg-rose-50 text-rose-600 border border-rose-200'],
  Bank: [Landmark, 'bg-blue-50 text-blue-600 border border-blue-200'],
  Government: [Building2, 'bg-slate-100 text-slate-700 border border-slate-200'],
  College: [GraduationCap, 'bg-amber-50 text-amber-600 border border-amber-200'],
  Support: [Headphones, 'bg-orange-50 text-orange-600 border border-orange-200'],
}

const level = n =>
  n <= 3 ? ['Quiet Queue', 'bg-emerald-50 text-emerald-800 border-emerald-300']
  : n <= 8 ? ['Moderate Queue', 'bg-amber-50 text-amber-800 border-amber-300']
  : ['Busy Queue', 'bg-rose-50 text-rose-800 border-rose-300']

const quickSuggestions = [
  'Cardiology',
  'Forex',
  'Passport',
  'Aadhaar',
  'Driving Licence',
  'eSIM',
  'Apple Care',
  'Transcripts',
]

function ServiceModal({ service, onClose, onBook, booking }) {
  const [checkedDocs, setCheckedDocs] = useState({})
  const [openWhatsApp, setOpenWhatsApp] = useState(true)
  const [Icon, tint] = look[service.category] || look.Government
  const [lvl, lvlTint] = level(service.waiting)

  const toggleDoc = doc => {
    setCheckedDocs(prev => ({ ...prev, [doc]: !prev[doc] }))
  }

  const docs = service.docsRequired || []
  const checkedCount = docs.filter(d => checkedDocs[d]).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl text-slate-900">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 pr-10">
          <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${tint} shadow-xs`}>
            <Icon size={26} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600">{service.category}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${service.paused ? 'bg-slate-100 text-slate-500 border-slate-200' : lvlTint}`}>
                {service.paused ? 'Queue Paused' : lvl}
              </span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 leading-tight mt-1">
              {service.name}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              {service.rating ? (
                <span className="flex items-center gap-1 font-semibold text-amber-600">
                  <Stars value={service.rating} size={15} /> {service.rating}
                  <span className="font-normal text-slate-400">({service.ratingCount} reviews)</span>
                </span>
              ) : (
                <span className="text-slate-400">New verified centre</span>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
          <div>
            <p className="text-xs text-slate-500 font-medium">Waiting now</p>
            <p className="font-display text-2xl font-extrabold text-slate-900">{service.waiting}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Est. wait</p>
            <p className="font-display text-2xl font-extrabold text-orange-600">~{service.etaMinutes} <span className="text-xs font-normal">min</span></p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Counters</p>
            <p className="font-display text-2xl font-extrabold text-emerald-700">{service.counters}</p>
          </div>
        </div>

        {/* Description */}
        {service.description && (
          <div className="mt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Overview</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{service.description}</p>
          </div>
        )}

        {/* Location & Timings */}
        <div className="mt-5 space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          {service.location && (
            <div className="flex items-start gap-2.5">
              <MapPin size={18} className="mt-0.5 shrink-0 text-orange-600" />
              <div>
                <p className="font-semibold text-slate-900">Address</p>
                <p className="text-slate-600 text-xs">{service.location}</p>
              </div>
            </div>
          )}

          {service.hours && (
            <div className="flex items-start gap-2.5">
              <Clock size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-slate-900">Working Hours</p>
                <p className="text-slate-600 text-xs">{service.hours}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-slate-200">
            {service.phone && (
              <a href={`tel:${service.phone}`} className="flex items-center gap-1.5 font-medium text-orange-600 hover:underline text-xs">
                <Phone size={14} /> {service.phone}
              </a>
            )}
            {service.email && (
              <a href={`mailto:${service.email}`} className="flex items-center gap-1.5 font-medium text-orange-600 hover:underline text-xs">
                <Mail size={14} /> {service.email}
              </a>
            )}
          </div>
        </div>

        {/* Services & Desks Offered */}
        {service.servicesOffered && service.servicesOffered.length > 0 && (
          <div className="mt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Available Desks & Services</h3>
            <div className="flex flex-wrap gap-2">
              {service.servicesOffered.map((svc, idx) => (
                <span
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs"
                >
                  {svc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* What to Bring Checklist */}
        {docs.length > 0 && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <FileText size={16} /> Checklist: Documents to Bring
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {checkedCount}/{docs.length} verified
              </span>
            </div>
            <p className="mb-3 text-xs text-slate-600">
              Check off items as you prepare them before visiting the counter:
            </p>
            <ul className="space-y-2">
              {docs.map((doc, idx) => {
                const isChecked = !!checkedDocs[doc]
                return (
                  <li
                    key={idx}
                    onClick={() => toggleDoc(doc)}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 text-xs transition select-none ${
                      isChecked
                        ? 'border-emerald-300 bg-emerald-100/70 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="mt-0.5 text-emerald-600 shrink-0">
                      {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                    </span>
                    <span className={isChecked ? 'line-through text-slate-400' : ''}>{doc}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Fee Info */}
        {service.feeInfo && (
          <div className="mt-4 rounded-xl bg-slate-100 p-3 text-xs text-slate-700 border border-slate-200">
            <span className="font-bold text-amber-800">Fees & Tariffs:</span> {service.feeInfo}
          </div>
        )}

        {/* WhatsApp Notification Direct Connect Toggle */}
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 select-none">
            <input
              type="checkbox"
              checked={openWhatsApp}
              onChange={e => setOpenWhatsApp(e.target.checked)}
              className="size-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5 text-emerald-800">
              <WhatsAppIcon size={16} className="text-[#25D366]" />
              Connect to WhatsApp direct after booking
            </span>
          </label>
          <span className="text-[11px] font-mono text-emerald-700 hidden sm:inline">1-Click Live Pass</span>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            disabled={service.paused || booking}
            onClick={() => onBook(service.id, openWhatsApp)}
            className="px-6"
          >
            <Ticket size={16} /> {booking ? 'Holding your place…' : 'Book token directly'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Book() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const cat = params.get('cat') || ''
  const [services, setServices] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)
  const [modalService, setModalService] = useState(null)
  const navigate = useNavigate()

  const setParam = (key, v) =>
    setParams(p => {
      const n = new URLSearchParams(p)
      v ? n.set(key, v) : n.delete(key)
      return n
    }, { replace: true })

  const load = () => api('/services').then(d => setServices(d.services)).catch(e => setError(e.message))
  useEffect(() => { load() }, [])
  useLive(load)

  async function book(id, autoOpenWhatsApp = true) {
    setError('')
    setBusy(id)
    try {
      const d = await api('/tokens', { method: 'POST', body: { serviceId: id } })
      if (autoOpenWhatsApp && d.whatsappUrl) {
        try {
          window.open(d.whatsappUrl, '_blank')
        } catch {
          // Handled on token page if popup blocked
        }
      }
      navigate('/token?booked=1')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  // Calculate counts per category
  const counts = (services || []).reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1
    return acc
  }, {})

  // Enhanced search across name, category, location, and services offered
  const query = q.trim().toLowerCase()
  const shown = services?.filter(s => {
    if (cat && s.category !== cat) return false
    if (!query) return true
    const haystack = [
      s.name,
      s.category,
      s.location,
      s.description,
      ...(s.servicesOffered || [])
    ].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(query)
  })

  return (
    <section className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Book a queue token</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hold your place across 26 verified hospitals, banks, and citizen service centres with live telemetry.
        </p>
      </div>

      {/* Search Bar with clear button */}
      <div className="relative max-w-2xl">
        <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-xs border border-slate-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
          <Search size={20} className="ml-2.5 shrink-0 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={e => setParam('q', e.target.value)}
            placeholder="Search by hospital, bank, department, service, or locality (e.g. Jubilee Hills, Forex)..."
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          {q && (
            <button
              onClick={() => setParam('q', '')}
              aria-label="Clear search"
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 mr-1 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-500 mr-1">Popular:</span>
          {quickSuggestions.map(tag => (
            <button
              key={tag}
              onClick={() => setParam('q', tag)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600 transition hover:border-orange-400 hover:text-orange-600 shadow-2xs cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setParam('cat', '')}
          aria-pressed={!cat}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition cursor-pointer ${
            !cat
              ? 'border-orange-600 bg-orange-600 text-white shadow-xs'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>All Centres</span>
          <span className={`rounded-full px-1.5 py-0.2 text-xs font-mono ${!cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {services?.length || 0}
          </span>
        </button>

        {Object.keys(look).map(c => {
          const [Icon] = look[c]
          const count = counts[c] || 0
          const active = cat === c
          return (
            <button
              key={c}
              onClick={() => setParam('cat', c)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                active
                  ? 'border-orange-600 bg-orange-600 text-white shadow-xs'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} />
              <span>{c}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-xs font-mono ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {/* Service Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {!services && !error && [1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-72 animate-pulse rounded-2xl bg-white border border-slate-200" />
        ))}

        {shown?.map(s => {
          const [Icon, style] = look[s.category] || look.Government
          const [lvl, lvlTint] = level(s.waiting)
          return (
            <Card key={s.id} className="flex flex-col justify-between transition hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-md">
              <div>
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-12 place-items-center rounded-2xl ${style} shadow-2xs`}>
                      <Icon size={22} />
                    </span>
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600">{s.category}</span>
                      <p className="flex items-center gap-1 text-xs">
                        {s.rating ? (
                          <>
                            <Stars value={s.rating} size={13} />
                            <b className="font-semibold text-amber-600">{s.rating}</b>
                            <span className="text-slate-400">({s.ratingCount})</span>
                          </>
                        ) : (
                          <span className="text-slate-400">New verified</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${s.paused ? 'bg-slate-100 text-slate-500 border-slate-200' : lvlTint}`}>
                    {s.paused ? 'Paused' : lvl}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-display text-xl font-bold leading-tight text-slate-900">
                  {s.name}
                </h2>

                {/* Location */}
                {s.location && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500 line-clamp-1">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-orange-600" />
                    <span>{s.location}</span>
                  </p>
                )}

                {/* Hours */}
                {s.hours && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={14} className="shrink-0 text-amber-600" />
                    <span>{s.hours}</span>
                  </p>
                )}

                {/* Services Preview Pills */}
                {s.servicesOffered && s.servicesOffered.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.servicesOffered.slice(0, 2).map((item, i) => (
                      <span key={i} className="rounded-lg bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {item}
                      </span>
                    ))}
                    {s.servicesOffered.length > 2 && (
                      <span className="rounded-lg bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
                        +{s.servicesOffered.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                {/* Queue Summary Box */}
                <div className="mb-4 mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                  <div>
                    <p className="font-display text-2xl font-extrabold text-slate-900">{s.waiting}</p>
                    <p className="text-[11px] text-slate-500 font-medium">waiting now</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-extrabold text-orange-600">~{s.etaMinutes}<span className="text-xs font-semibold"> min</span></p>
                    <p className="text-[11px] text-slate-500 font-medium">estimated wait</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  className="flex-1 py-2 text-xs"
                  onClick={() => setModalService(s)}
                >
                  <Info size={15} /> Info & Docs
                </Button>
                <Button
                  className="flex-1 py-2 text-xs"
                  disabled={s.paused || busy === s.id}
                  onClick={() => book(s.id, true)}
                >
                  <Ticket size={15} /> {busy === s.id ? 'Booking…' : 'Book & WhatsApp'}
                </Button>
              </div>
            </Card>
          )
        })}

        {shown?.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white">
            <p className="font-bold text-slate-900 text-base">No service centres match your search</p>
            <p className="mt-1 text-sm text-slate-500">Try clearing your filters or searching for general keywords like "Hospital", "SBI", "Passport", or "Aadhaar".</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setParam('q', ''); setParam('cat', '') }}
            >
              Reset search & filters
            </Button>
          </div>
        )}
      </div>

      {/* Service Detail Modal */}
      {modalService && (
        <ServiceModal
          service={modalService}
          onClose={() => setModalService(null)}
          onBook={book}
          booking={busy === modalService.id}
        />
      )}
    </section>
  )
}

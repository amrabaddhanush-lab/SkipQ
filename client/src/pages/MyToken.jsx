import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Bell, MapPin, Ticket, Clock, Phone, FileText, CheckCircle2, Share2, Check } from 'lucide-react'
import { api } from '../lib/api'
import { useLive } from '../lib/useLive'
import { useAuth } from '../lib/auth'
import { Button, Card } from '../components/ui'
import Badge from '../components/Badge'
import WhatsAppIcon from '../components/WhatsAppIcon'

const Stat = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
    <p className="text-xs text-slate-500 font-medium">{label}</p>
    <p className="font-display text-2xl font-extrabold text-slate-900 mt-0.5">{value}</p>
  </div>
)

export default function MyToken() {
  const { user, updatePhone } = useAuth()
  const [params] = useSearchParams()
  const justBooked = params.get('booked') === '1'
  const [active, setActive] = useState(undefined)
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [perm, setPerm] = useState('Notification' in window ? Notification.permission : 'denied')
  const [checkedDocs, setCheckedDocs] = useState({})
  const [copied, setCopied] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [savingPhone, setSavingPhone] = useState(false)
  const [showPhoneEdit, setShowPhoneEdit] = useState(false)
  const sent = useRef(new Set())

  const load = () =>
    api('/tokens/me').then(d => {
      setActive(d.active)
      if (d.whatsappUrl) setWhatsappUrl(d.whatsappUrl)
    }).catch(e => setError(e.message))

  useEffect(() => {
    load()
    const t = setInterval(load, 20000)
    return () => clearInterval(t)
  }, [])
  useLive(load)

  useEffect(() => {
    if (!active) return
    let msg = ''
    let key = ''
    if (active.status === 'serving') {
      key = active.id + 's'
      msg = `Your turn! Please go to counter ${active.counter}.`
    } else if (active.position <= 2) {
      key = active.id + 'n'
      msg = active.position === 1 ? 'You are next. Please head to the counter.' : 'Almost there: 1 person ahead of you.'
    }
    if (!msg || sent.current.has(key)) return
    sent.current.add(key)
    setNote(msg)
    navigator.vibrate?.([200, 100, 200])
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SkipQ', { body: msg })
    }
  }, [active])

  async function cancel() {
    if (!confirm('Cancel this token? You will lose your place in line.')) return
    try {
      await api(`/tokens/${active.id}/cancel`, { method: 'POST' })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  const toggleDoc = doc => {
    setCheckedDocs(prev => ({ ...prev, [doc]: !prev[doc] }))
  }

  // Construct direct WhatsApp URL if not provided by server
  const getDirectWhatsAppUrl = () => {
    if (whatsappUrl) return whatsappUrl
    if (!active) return '#'
    const cleanPhone = (user?.phone || '').replace(/[^\d]/g, '')
    const origin = window.location.origin
    const text =
`*🎟️ SkipQ Digital Token Confirmation*
━━━━━━━━━━━━━━━━━━
*Token Number:* ${active.label}
*Service Centre:* ${active.serviceName}
*Current Queue Position:* #${active.position || 1}
*Estimated Wait:* ~${active.etaMinutes || 5} mins
*Live Status Tracker:* ${origin}/token
━━━━━━━━━━━━━━━━━━
_Show this digital token or QR code at counter when called._`

    if (cleanPhone) {
      return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
    }
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
  }

  const handleCopyLink = () => {
    const origin = window.location.origin
    navigator.clipboard?.writeText(`${origin}/token`)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const handleSavePhone = async e => {
    e.preventDefault()
    if (!phoneInput) return
    setSavingPhone(true)
    try {
      await updatePhone(phoneInput)
      setShowPhoneEdit(false)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingPhone(false)
    }
  }

  if (active === undefined && !error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
        <div className="size-8 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold">Loading your active ticket…</p>
      </div>
    )
  }

  if (!active) {
    return (
      <Card className="mx-auto max-w-md py-12 text-center border-slate-200 bg-white shadow-sm">
        <span className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 shadow-xs">
          <Ticket size={28} />
        </span>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">No active token</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500 max-w-xs mx-auto">
          You don't hold any queue tokens right now. Explore 26 verified centres to get in line.
        </p>
        <Link to="/book">
          <Button className="px-6">Browse & book a token</Button>
        </Link>
      </Card>
    )
  }

  const serving = active.status === 'serving'
  const lane = Math.min(active.ahead || 0, 10)
  const docs = active.docsRequired || []
  const finalWaUrl = getDirectWhatsAppUrl()

  return (
    <div className="space-y-5 animate-fadeIn">
      {justBooked && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            Token {active.label} booked successfully! Live WhatsApp alerts are connected.
          </span>
          <a
            href={finalWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-1 text-xs font-bold shadow-xs transition"
          >
            <WhatsAppIcon size={14} /> Open WhatsApp
          </a>
        </div>
      )}

      {note && (
        <div role="status" className="flex items-center gap-2 rounded-2xl bg-orange-50 border border-orange-300 px-4 py-3 text-sm font-semibold text-orange-800 shadow-xs animate-pulse">
          <Bell size={16} className="text-orange-600" /> {note}
        </div>
      )}
      {error && <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {/* Ticket Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
        <div className="grid md:grid-cols-[1fr_240px]">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600">{active.serviceCategory}</span>
                <p className="font-bold text-slate-900 text-xl leading-tight mt-0.5">{active.serviceName}</p>
              </div>
              <Badge status={active.status} />
            </div>

            <p className="mt-4 font-display text-7xl font-black leading-none text-slate-900">
              {active.label}
            </p>

            {serving ? (
              <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 text-emerald-900 border border-emerald-300 shadow-xs">
                <p className="font-display text-xl font-extrabold text-emerald-800 flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  It’s your turn!
                </p>
                <p className="font-semibold text-lg text-emerald-700 mt-1">Please go directly to Counter {active.counter}.</p>
                <p className="text-xs text-slate-600 mt-1">Display your QR ticket on the right to the desk attendant.</p>
              </div>
            ) : (
              <>
                <div className="mt-6 grid max-w-sm grid-cols-2 gap-3">
                  <Stat label="Queue Position" value={`#${active.position}`} />
                  <Stat label="Estimated Wait" value={active.etaMinutes ? `${active.etaMinutes} min` : 'Any moment'} />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-1.5" aria-label={`${active.ahead} people ahead`}>
                  {Array.from({ length: lane }).map((_, i) => (
                    <span key={i} className="size-3 rounded-full bg-slate-200 border border-slate-300" />
                  ))}
                  <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                    You
                  </span>
                  {active.ahead > 10 && <span className="text-xs text-slate-500">+{active.ahead - 10} more ahead</span>}
                </div>
              </>
            )}

            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-mono font-bold">Now serving</span>
              <span className="font-display text-2xl font-extrabold tabular-nums text-orange-600">
                {active.nowServing.join(', ') || '—'}
              </span>
            </div>
            {active.paused && (
              <p className="mt-3 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg w-fit">
                Queue paused by counter staff.
              </p>
            )}
          </div>

          {/* QR Code Section */}
          <div className="relative flex flex-col items-center justify-center gap-3 border-t-2 border-dashed border-slate-200 p-6 md:border-l-2 md:border-t-0 bg-slate-50/60">
            <span className="absolute -left-3 -top-3 size-6 rounded-full bg-[#f8fafc] md:hidden border border-slate-200" />
            <span className="absolute -right-3 -top-3 size-6 rounded-full bg-[#f8fafc] md:hidden border border-slate-200" />
            <span className="absolute -left-3 -top-3 hidden size-6 rounded-full bg-[#f8fafc] md:block border border-slate-200" />
            <span className="absolute -bottom-3 -left-3 hidden size-6 rounded-full bg-[#f8fafc] md:block border border-slate-200" />
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-md">
              <QRCodeSVG value={`SKIPQ|${active.id}|${active.label}`} size={145} />
            </div>
            <span className="text-xs text-slate-500 font-mono font-bold tracking-wider">SCAN AT COUNTER</span>
          </div>
        </div>
      </div>

      {/* Direct WhatsApp Confirmation & Notification Integration Box */}
      <div className="rounded-3xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#25D366] text-white shadow-xs">
              <WhatsAppIcon size={24} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-extrabold text-slate-900 text-base">Direct WhatsApp Connection</p>
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {user?.phone ? (
                  <>
                    Connected to <b className="text-slate-800">{user.phone}</b>. Receive turn alerts and live token slip.
                  </>
                ) : (
                  'Connect your mobile number to receive live turn notifications directly on WhatsApp.'
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={finalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <WhatsAppIcon size={16} /> Open in WhatsApp
            </a>

            {!user?.phone && (
              <button
                onClick={() => setShowPhoneEdit(s => !s)}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 text-xs font-semibold shadow-2xs transition"
              >
                {showPhoneEdit ? 'Cancel' : '+ Add Number'}
              </button>
            )}

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2.5 text-xs font-semibold shadow-2xs transition"
              title="Copy live ticket link"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Inline Add/Edit Phone Form */}
        {showPhoneEdit && (
          <form onSubmit={handleSavePhone} className="mt-4 pt-3 border-t border-emerald-200/70 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">WhatsApp Number:</span>
            <input
              type="tel"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              placeholder="+91 98765 43210"
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-emerald-500 min-w-48"
              required
            />
            <Button type="submit" disabled={savingPhone} className="py-1.5 px-3 text-xs">
              {savingPhone ? 'Saving…' : 'Save & Link WhatsApp'}
            </Button>
          </form>
        )}
      </div>

      {/* Centre Details & Preparation Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 mb-3">Centre Information</h2>
          <div className="space-y-3 text-sm">
            {active.serviceLocation && (
              <p className="flex items-start gap-2.5 text-slate-700">
                <MapPin size={17} className="mt-0.5 shrink-0 text-orange-600" />
                <span className="text-xs leading-relaxed">{active.serviceLocation}</span>
              </p>
            )}
            {active.serviceHours && (
              <p className="flex items-center gap-2.5 text-slate-700 text-xs">
                <Clock size={16} className="shrink-0 text-amber-600" />
                <span>{active.serviceHours}</span>
              </p>
            )}
            {active.servicePhone && (
              <p className="flex items-center gap-2.5 text-xs text-slate-700">
                <Phone size={16} className="shrink-0 text-emerald-600" />
                <a href={`tel:${active.servicePhone}`} className="text-orange-600 hover:underline">{active.servicePhone}</a>
              </p>
            )}
            {active.feeInfo && (
              <p className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="font-bold text-amber-800">Tariff:</span> {active.feeInfo}
              </p>
            )}
          </div>
        </Card>

        {/* What to Keep Ready Checklist */}
        <Card className="border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              <FileText size={15} className="text-orange-600" /> Documents to Keep Ready
            </h2>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Handy checklist
            </span>
          </div>
          {docs.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-700 mt-2">
              {docs.map((doc, idx) => (
                <li
                  key={idx}
                  onClick={() => toggleDoc(doc)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition select-none ${
                    checkedDocs[doc] ? 'line-through text-slate-400 bg-slate-100' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 size={15} className={checkedDocs[doc] ? 'text-emerald-600' : 'text-slate-400'} />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              Please have a valid government photo ID ready when your token number is called.
            </p>
          )}
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex gap-2">
          {perm === 'default' && (
            <Button variant="outline" onClick={() => Notification.requestPermission().then(setPerm)}>
              <Bell size={16} /> Enable turn alerts
            </Button>
          )}
        </div>
        {active.status === 'waiting' && (
          <Button variant="danger" onClick={cancel}>
            Cancel token
          </Button>
        )}
      </div>
    </div>
  )
}

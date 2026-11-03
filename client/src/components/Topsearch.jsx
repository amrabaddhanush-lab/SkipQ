import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Mic, Sparkles, Volume2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useCommands } from '../lib/useCommands'
import { speak } from '../lib/voice'

export default function TopSearch() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { run, hear } = useCommands()
  const [text, setText] = useState('')
  const [note, setNote] = useState('')
  const [listening, setListening] = useState(false)
  const stop = useRef(null)
  const timer = useRef(null)

  const flash = m => {
    setNote(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setNote(''), 6000)
  }

  function submit(e) {
    e.preventDefault()
    const q = text.trim()
    if (!q) return
    if (user.role === 'admin') {
      const lower = q.toLowerCase()
      if (lower.includes('queue') || lower.includes('counter')) navigate('/admin/queue')
      else if (lower.includes('analytic') || lower.includes('report')) navigate('/admin/analytics')
      else if (lower.includes('verify') || lower.includes('scan')) navigate('/admin/verify')
      else navigate('/admin')
    } else {
      navigate(`/book?q=${encodeURIComponent(q)}`)
    }
    setText('')
  }

  function toggleMic() {
    if (listening) {
      stop.current?.()
      setListening(false)
      return
    }

    setListening(true)
    setNote('')
    stop.current = hear({
      onHeard: t => setText(t),
      onDone: r => {
        setListening(false)
        if (r.reply) {
          flash(r.reply)
          speak(r.reply, r.lang)
        }
        if (r.ok) setText('')
      },
    })
  }

  return (
    <form onSubmit={submit} className="relative min-w-0 flex-1 md:max-w-xl">
      <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/15 transition-all">
        <Search size={18} className="ml-2.5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
        <label htmlFor="top-search" className="sr-only">Search services</label>
        <input
          id="top-search"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={
            listening
              ? 'Listening… say: “Book Apollo”, “SBI bank”, or “My position”'
              : user.role === 'admin'
              ? 'Search queue, analytics, or verify...'
              : 'Search 26 centres or tap mic to book directly…'
          }
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />

        {/* Integrated Voice Assistant inside Search Bar */}
        <button
          type="button"
          onClick={toggleMic}
          aria-label={listening ? 'Stop listening' : 'Direct Voice Assistant'}
          title="Direct Voice Assistant (English, हिन्दी, తెలుగు)"
          className={`grid size-8 place-items-center rounded-xl transition cursor-pointer ${
            listening
              ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200 dark:ring-rose-950 shadow-xs'
              : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 dark:hover:text-orange-400'
          }`}
        >
          <Mic size={16} />
        </button>

        <button
          type="submit"
          className="rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
        >
          Find
        </button>
      </div>

      {note && (
        <div role="status" className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-xl text-slate-900 dark:text-white flex items-start gap-2.5 animate-fadeIn">
          <Volume2 size={16} className="text-orange-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-orange-600">Voice Assistant</p>
            <p className="mt-0.5 text-slate-700 dark:text-slate-300">{note}</p>
          </div>
        </div>
      )}
    </form>
  )
}

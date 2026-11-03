import { useRef, useState } from 'react'
import { Search, Mic, Volume2 } from 'lucide-react'
import { useCommands } from '../lib/useCommands'
import { speak } from '../lib/voice'

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search 26 hospitals, banks, RTO, passport, clinics…',
  className = ''
}) {
  const { run, hear } = useCommands()
  const [listening, setListening] = useState(false)
  const [voiceNote, setVoiceNote] = useState('')
  const stop = useRef(null)
  const timer = useRef(null)

  const flash = m => {
    setVoiceNote(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setVoiceNote(''), 6000)
  }

  function toggleMic() {
    if (listening) {
      stop.current?.()
      setListening(false)
      return
    }

    setListening(true)
    setVoiceNote('')
    stop.current = hear({
      onHeard: t => {
        onChange?.(t)
      },
      onDone: r => {
        setListening(false)
        if (r.reply) {
          flash(r.reply)
          speak(r.reply, r.lang)
        }
        if (r.ok && onSubmit) {
          onSubmit(r.q || value)
        }
      },
    })
  }

  return (
    <div className="relative">
      <form
        onSubmit={e => { e.preventDefault(); onSubmit?.(value) }}
        className={`flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all ${className}`}
      >
        <Search size={20} className="ml-3 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
        <label htmlFor="svc-search" className="sr-only">Search service centres</label>
        <input
          id="svc-search"
          type="search"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={listening ? 'Listening… speak: “Book Apollo”, “SBI”, or “Passport”' : placeholder}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />

        {/* Integrated Voice Assistant Mic Button in Search Bar */}
        <button
          type="button"
          onClick={toggleMic}
          aria-label={listening ? 'Stop listening' : 'Voice Assistant'}
          title="Direct Voice Assistant (English, हिन्दी, తెలుగు)"
          className={`grid size-9 place-items-center rounded-xl transition cursor-pointer ${
            listening
              ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200 dark:ring-rose-950 shadow-xs'
              : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 dark:hover:text-orange-400'
          }`}
        >
          <Mic size={18} />
        </button>

        <button
          type="submit"
          className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-sm font-semibold transition active:scale-95 cursor-pointer shadow-xs"
        >
          Search
        </button>
      </form>

      {voiceNote && (
        <div role="status" className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-xl text-slate-900 dark:text-white flex items-start gap-2.5 animate-fadeIn">
          <Volume2 size={16} className="text-orange-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-orange-600">Voice Assistant Feedback</p>
            <p className="mt-0.5 text-slate-700 dark:text-slate-300">{voiceNote}</p>
          </div>
        </div>
      )}
    </div>
  )
}

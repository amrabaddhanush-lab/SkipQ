import { useEffect, useRef, useState } from 'react'
import { Mic } from 'lucide-react'
import { LANGS, getLang, setLang, listen, speechSupported } from '../lib/voice'

export default function MicButton({ onText }) {
  const [lang, setL] = useState(getLang())
  const [on, setOn] = useState(false)
  const [msg, setMsg] = useState('')
  const rec = useRef(null)

  useEffect(() => () => rec.current?.abort?.(), [])

  function start() {
    if (!speechSupported()) return setMsg('Voice needs Chrome or Edge')
    setMsg('')
    setOn(true)
    rec.current = listen(lang, {
      onResult: onText,
      onEnd: () => setOn(false),
      onError: c => {
        setOn(false)
        setMsg(c === 'not-allowed' ? 'Allow microphone access' : c === 'no-speech' ? 'Didn’t hear anything' : 'Voice error, try again')
      },
    })
  }

  return (
    <div className="relative flex items-center gap-1.5 pr-1">
      <select
        aria-label="Voice language"
        value={lang}
        onChange={e => { setL(e.target.value); setLang(e.target.value) }}
        className="rounded-lg border border-white/15 bg-slate-900/90 px-2 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-md outline-none focus:border-cyan-400"
      >
        {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k} className="bg-slate-900 text-white">{v.label}</option>)}
      </select>
      <button
        type="button"
        onClick={start}
        aria-label={on ? 'Listening' : 'Search by voice'}
        className={`grid size-10 place-items-center rounded-xl text-white transition ${
          on ? 'animate-pulse bg-gradient-to-r from-rose-500 to-pink-600 shadow-[0_0_16px_rgba(244,63,94,0.6)]' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 shadow-[0_0_12px_rgba(37,99,235,0.4)]'
        }`}
      >
        <Mic size={18} />
      </button>
      {msg && (
        <span role="status" className="absolute right-0 top-12 z-10 whitespace-nowrap rounded-lg bg-slate-900 border border-white/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 shadow-2xl backdrop-blur-md">
          {msg}
        </span>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Mic, X, Sparkles, Volume2, Globe } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useCommands } from '../lib/useCommands'
import { LANGS, R, getLang, getMode, setMode, speak } from '../lib/voice'

const modes = [['auto', 'Auto-detect'], ['en', 'English'], ['hi', 'हिन्दी'], ['te', 'తెలుగు']]

export default function VoiceAssistant() {
  const { user } = useAuth()
  const { run, hear } = useCommands()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState('idle')
  const [lang, setL] = useState(getLang())
  const [mode, setM] = useState(getMode())
  const [heard, setHeard] = useState('')
  const [reply, setReply] = useState('')
  const stop = useRef(null)
  const timer = useRef(null)

  useEffect(() => {
    if ('speechSynthesis' in window) speechSynthesis.getVoices()
    return () => { stop.current?.(); clearTimeout(timer.current) }
  }, [])

  const L = R[lang] || R.en
  const hints = user?.role === 'admin' ? L.adminHints : L.hints

  function finish(r) {
    setState('idle')
    if (r.lang) setL(r.lang)
    setReply(r.reply)
    speak(r.reply, r.lang)
    if (r.ok) timer.current = setTimeout(() => setOpen(false), 7000)
  }

  function start() {
    stop.current?.()
    clearTimeout(timer.current)
    setHeard('')
    setReply('')
    setState('listening')
    stop.current = hear({
      onStatus: s => { if (s.lang) setL(s.lang); setState(s.state) },
      onHeard: setHeard,
      onDone: finish,
    })
  }

  function toggle() {
    if (open) {
      stop.current?.()
      setState('idle')
      setOpen(false)
    } else {
      setOpen(true)
      start()
    }
  }

  async function quick(text) {
    stop.current?.()
    clearTimeout(timer.current)
    setHeard(text)
    finish(await run(text))
  }

  function chooseMode(m) {
    setMode(m)
    setM(m)
    if (m !== 'auto') setL(m)
  }

  const listening = state !== 'idle'

  return (
    <>
      {/* Floating Assistant Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        <button
          onClick={toggle}
          aria-label={open ? 'Close voice assistant' : 'Speak to SkipQ Assistant'}
          className={`group flex items-center gap-2.5 rounded-full px-4 py-3 text-white font-semibold shadow-lg transition-all active:scale-95 cursor-pointer ${
            listening
              ? 'bg-rose-600 ring-4 ring-rose-200 dark:ring-rose-950 animate-pulse'
              : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/25 hover:shadow-orange-600/40'
          }`}
        >
          {open ? <X size={20} /> : <Mic size={20} />}
          <span className="text-sm font-display tracking-wide hidden sm:inline">
            {listening ? 'Listening…' : 'Voice Assistant'}
          </span>
          <span className="text-[10px] uppercase font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
            {LANGS[lang]?.short || 'EN'}
          </span>
        </button>
      </div>

      {/* Floating Dialog Popover */}
      {open && (
        <section
          aria-label="SkipQ Voice Assistant"
          className="fixed bottom-20 right-6 z-50 w-[min(24rem,calc(100vw-3rem))] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl text-slate-900 dark:text-white transition-all duration-300"
        >
          <div className="mb-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                <Sparkles size={16} />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Direct Voice Assistant</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Auto-detects English, हिन्दी, తెలుగు</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Language selector chips */}
          <div className="mb-4 flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <Globe size={14} className="ml-1.5 text-slate-400 shrink-0" />
            <div className="flex flex-1 justify-around text-xs font-semibold">
              {modes.map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => chooseMode(m)}
                  className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                    mode === m
                      ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Assistant Visualizer Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 text-center">
            {listening ? (
              <div className="py-2">
                <div className="mx-auto mb-2.5 flex items-center justify-center gap-1">
                  <span className="size-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="size-3 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="size-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{L.listening}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Direct booking & status execution active</p>
              </div>
            ) : reply ? (
              <div className="text-left py-1">
                <p className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
                  <Volume2 size={14} /> Action Completed
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">{reply}</p>
              </div>
            ) : (
              <div className="py-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">Tap below or say any command:</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">“Book Apollo hospital”, “Book SBI”, “My position”</p>
              </div>
            )}

            {heard && (
              <p className="mt-3 border-t border-slate-200/80 dark:border-slate-700/80 pt-2 text-xs italic text-slate-500 dark:text-slate-400 text-left">
                Heard: “{heard}”
              </p>
            )}
          </div>

          {/* Quick Action Suggestion Buttons */}
          <div className="mt-3.5 space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Direct Actions</p>
            <div className="flex flex-wrap gap-1.5">
              {hints?.slice(0, 4).map((h, i) => (
                <button
                  key={i}
                  onClick={() => quick(h)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition shadow-2xs cursor-pointer"
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Microphone Tap-to-Speak Control */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
            <button
              onClick={start}
              disabled={listening}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs ${
                listening
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer active:scale-95'
              }`}
            >
              <Mic size={14} />
              {listening ? 'Listening…' : 'Tap to speak'}
            </button>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">No confirmation needed</span>
          </div>
        </section>
      )}
    </>
  )
}

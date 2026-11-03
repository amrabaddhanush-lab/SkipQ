import { useNavigate } from 'react-router-dom'
import { api } from './api'
import { useAuth } from './auth'
import {
  R, CATN, parse, parseAdmin, detectLang, listen, speechSupported, getLang, setLang, getMode,
} from './voice'

const KNOWN_ENTITIES = [
  { keywords: ['apollo', 'अपोलो', 'అపోలో'], match: 'Apollo' },
  { keywords: ['care', 'केयर', 'కేర్'], match: 'Care Hospitals' },
  { keywords: ['yashoda', 'यशोदा', 'యశోద'], match: 'Yashoda' },
  { keywords: ['kims', 'किम्स', 'కిమ్స్'], match: 'KIMS' },
  { keywords: ['aig', 'asian institute', 'एआईजी'], match: 'AIG' },
  { keywords: ['continental', 'कॉन्टिनेंटल'], match: 'Continental' },
  { keywords: ['rainbow', 'चिल्ड्रन', 'రెయిన్‌బో'], match: 'Rainbow' },
  { keywords: ['sbi', 'state bank', 'एसबीआई', 'స్టేట్ బ్యాంక్'], match: 'State Bank of India' },
  { keywords: ['hdfc', 'एचडीएफसी', 'హెచ్‌డీఎఫ్‌సీ'], match: 'HDFC' },
  { keywords: ['icici', 'आईसीआईसीआई', 'ఐసీఐసీఐ'], match: 'ICICI' },
  { keywords: ['axis', 'एक्सिस', 'యాక్సిస్'], match: 'Axis' },
  { keywords: ['pnb', 'punjab national', 'पीएनबी'], match: 'Punjab National' },
  { keywords: ['canara', 'केनरा', 'కెనరా'], match: 'Canara' },
  { keywords: ['kotak', 'कोटक', 'కోటక్'], match: 'Kotak' },
  { keywords: ['passport', 'पासपोर्ट', 'పాస్‌పోర్ట్'], match: 'Passport' },
  { keywords: ['rto', 'driving licence', 'आरटीओ', 'ఆర్టీవో'], match: 'Regional Transport' },
  { keywords: ['aadhaar', 'uidai', 'आधार', 'ఆధార్'], match: 'Aadhaar' },
  { keywords: ['ghmc', 'citizen', 'जीएचएमसी', 'జీహెచ్‌ఎంసీ'], match: 'GHMC' },
  { keywords: ['electricity', 'power', 'tsspdcl', 'बिजली', 'విద్యుత్'], match: 'TSSPDCL' },
  { keywords: ['water', 'hmws', 'जल', 'నీటి'], match: 'Water Supply' },
  { keywords: ['osmania', 'उस्मानिया', 'ఉస్మానియా'], match: 'Osmania' },
  { keywords: ['jntu', 'जेएनटीयू', 'జేఎన్‌టీయూ'], match: 'JNTU' },
  { keywords: ['cbit', 'सीबीआईटी'], match: 'CBIT' },
  { keywords: ['bits', 'pilani', 'बिट्स'], match: 'BITS' },
  { keywords: ['airtel', 'एयरटेल', 'ఎయిర్‌టెల్'], match: 'Airtel' },
  { keywords: ['jio', 'जियो', 'జియో'], match: 'Jio' },
  { keywords: ['apple', 'एप्पल', 'యాపిల్'], match: 'Apple' },
]

export function useCommands() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const admin = user?.role === 'admin'

  // Executes customer command directly without asking for confirmation, autodetecting language
  async function run(text, { voice = false } = {}) {
    // 1. Autodetect language on the fly based on customer spoken words
    const lang = detectLang(text)
    setLang(lang)
    const L = R[lang]
    const done = reply => ({ ok: true, reply, lang })
    const fail = (reply, unknown = false) => ({ ok: false, unknown, reply, lang })

    try {
      if (admin) {
        const p = parseAdmin(text)
        if (p.intent === 'count') {
          const d = await api('/admin/overview')
          return done(L.adminWaiting(d.kpis.waiting))
        }
        if (p.intent === 'go') {
          navigate(p.route)
          return done(L.adminGo(p.name))
        }
        return fail(L.adminHelp, voice)
      }

      const p = parse(text)
      const lower = text.toLowerCase()

      // Direct Status Check
      if (p.intent === 'status') {
        const { active } = await api('/tokens/me')
        if (!active) return done(L.noToken)
        navigate('/token')
        return done(L.status(active))
      }

      // Direct Cancellation (no confirmation asked)
      if (p.intent === 'cancel') {
        const { active } = await api('/tokens/me')
        if (!active) return done(L.noToken)
        if (active.status !== 'waiting') return fail(L.cantCancel)
        await api(`/tokens/${active.id}/cancel`, { method: 'POST' })
        navigate('/token')
        return done(L.cancelled)
      }

      // Direct Booking (no confirmation asked, automatically matches service or picks best available)
      if (p.intent === 'book' || p.cat) {
        const { services } = await api('/services')
        let targetSvc = null

        // 1. Match specific named entity (e.g. Apollo, SBI, HDFC, Passport, RTO)
        for (const ent of KNOWN_ENTITIES) {
          if (ent.keywords.some(k => lower.includes(k))) {
            targetSvc = services.find(s => s.name.toLowerCase().includes(ent.match.toLowerCase()) && !s.paused)
              || services.find(s => s.name.toLowerCase().includes(ent.match.toLowerCase()))
            if (targetSvc) break
          }
        }

        // 2. If no entity matched, match by category
        if (!targetSvc && p.cat) {
          targetSvc = services.find(s => s.category === p.cat && !s.paused)
            || services.find(s => s.category === p.cat)
        }

        // 3. Fallback: match any word inside service name or offered services
        if (!targetSvc) {
          const words = lower.split(/[^a-z0-9]+/).filter(w => w.length >= 3)
          targetSvc = services.find(s => !s.paused && words.some(w => s.name.toLowerCase().includes(w)))
        }

        // 4. Ultimate fallback: pick the top rated active service
        if (!targetSvc) {
          const activeList = services.filter(s => !s.paused)
          activeList.sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.waiting - b.waiting)
          targetSvc = activeList[0] || services[0]
        }

        // Execute booking immediately without asking confirmation!
        const d = await api('/tokens', { method: 'POST', body: { serviceId: targetSvc.id } })
        if (d.whatsappUrl) {
          try { window.open(d.whatsappUrl, '_blank') } catch {}
        }
        navigate('/token?booked=1')
        return done(L.booked(d.token.label, targetSvc.name))
      }

      if (p.intent === 'history') { navigate('/history'); return done(L.history) }
      if (p.intent === 'home') { navigate('/'); return done(L.home) }
      if (p.intent === 'help') { navigate('/p/contact'); return done(L.help) }
      if (p.intent === 'rate') { navigate('/history'); return done(L.rate) }

      if (p.intent === 'browse') {
        navigate(`/book?cat=${p.cat}`)
        return done(L.browse(CATN[lang][p.cat]))
      }

      if (p.intent === 'wait') {
        const { services } = await api('/services')
        const s = services.find(x => x.category === p.cat) || services[0]
        navigate(`/book?cat=${p.cat}`)
        return done(L.wait(s.name, s.waiting, s.etaMinutes))
      }

      if (p.intent === 'best') {
        const { services } = await api('/services')
        const pool = services.filter(s => (!p.cat || s.category === p.cat) && s.rating)
        if (!pool.length) return done(L.noRatings)
        pool.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount)
        navigate(`/book?q=${encodeURIComponent(pool[0].name)}`)
        return done(L.best(pool[0].name, pool[0].rating))
      }

      // Plain search
      navigate(`/book?q=${encodeURIComponent(p.q || text)}`)
      return done(L.searching(p.q || text))
    } catch (e) {
      return fail(e.message)
    }
  }

  // Listens and routes directly through run
  function hear({ onStatus, onHeard, onDone }) {
    if (!speechSupported()) {
      setTimeout(() => onDone?.({ ok: false, lang: 'en', reply: R.en.unsupported }), 0)
      return () => {}
    }
    const currentLang = getLang()
    let stopped = false
    let rec = null
    let settled = false

    onStatus?.({ state: 'listening', lang: currentLang })
    rec = listen(currentLang, {
      onResult: async text => {
        settled = true
        if (stopped) return
        onHeard?.(text)
        const r = await run(text, { voice: true })
        if (stopped) return
        onDone?.(r)
      },
      onError: c => {
        if (settled || stopped) return
        settled = true
        onDone?.({ ok: false, lang: currentLang, reply: R[currentLang][c === 'not-allowed' ? 'mic' : 'noSpeech'] })
      },
      onEnd: () => {
        if (settled || stopped) return
        settled = true
        onDone?.({ ok: false, lang: currentLang, reply: R[currentLang].noSpeech })
      },
    })

    return () => {
      stopped = true
      try { rec?.abort() } catch { /* ignore */ }
    }
  }

  return { run, hear }
}

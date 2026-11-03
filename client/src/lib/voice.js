export const LANGS = {
  en: { label: 'English', short: 'EN', code: 'en-IN' },
  hi: { label: 'हिन्दी', short: 'हिं', code: 'hi-IN' },
  te: { label: 'తెలుగు', short: 'తె', code: 'te-IN' },
}

const store = {
  get: k => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k, v) => { try { localStorage.setItem(k, v) } catch { /* ignore */ } },
}
export const getLang = () => store.get('skipq_lang') || 'en'
export const setLang = l => store.set('skipq_lang', l)
export const getMode = () => store.get('skipq_vmode') || 'auto'
export const setMode = m => store.set('skipq_vmode', m)

const SR = () => window.SpeechRecognition || window.webkitSpeechRecognition
export const speechSupported = () => !!SR()

let active = null
export function listen(lang, { onResult, onEnd, onError }) {
  const Rec = SR()
  if (!Rec) {
    onError?.('unsupported')
    return null
  }
  try { active?.abort() } catch { /* ignore */ }
  const r = new Rec()
  r.lang = LANGS[lang]?.code || 'en-IN'
  r.interimResults = false
  r.maxAlternatives = 1
  r.onresult = e => onResult(e.results[0][0].transcript)
  r.onerror = e => { if (e.error !== 'aborted') onError?.(e.error) }
  r.onend = () => {
    if (active === r) active = null
    onEnd?.()
  }
  try {
    r.start()
    active = r
  } catch {
    onError?.('start-failed')
    return null
  }
  return r
}

export function speak(text, lang = 'en') {
  if (!('speechSynthesis' in window)) return false
  const targetCode = LANGS[lang]?.code || 'en-IN'
  const prefix = targetCode.slice(0, 2)
  const voices = speechSynthesis.getVoices()
  const voice = voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith(prefix))
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = targetCode
  if (voice) u.voice = voice
  u.rate = 1.0
  u.pitch = 1.0
  speechSynthesis.speak(u)
  return true
}

/* ---------- Intelligent Real-Time Language Detection ---------- */
const ROMAN_HI = [
  'mera', 'meri', 'mere', 'mujhe', 'hum', 'karo', 'kijiye', 'dikhao', 'batao',
  'kitna', 'kitne', 'kahan', 'kidhar', 'nahi', 'haan', 'chahiye', 'mein', 'hai',
  'kya', 'jaldi', 'dijiye', 'lelo', 'aspatal', 'sabse', 'accha', 'kripya',
  'shukriya', 'dhanyawad', 'namaste', 'bataiye', 'dena', 'karna', 'hoga'
]

const ROMAN_TE = [
  'naa', 'naaku', 'maaku', 'cheyyi', 'cheyyandi', 'chupinchu', 'chudandi',
  'ekkada', 'entha', 'kavali', 'ledu', 'avunu', 'cheppu', 'undi', 'chesuko',
  'tisuko', 'andari', 'manchi', 'dhanyavadamulu', 'dayachesi', 'ippudu',
  'namaskaram', 'cheyandi', 'pettandi', 'ivvandi', 'kavala'
]

export function detectLang(text) {
  if (!text) return 'en'
  // Detect native scripts directly
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'
  if (/[\u0900-\u097F]/.test(text)) return 'hi'

  // Detect phonetic / Roman transliterations
  const words = text.toLowerCase().split(/[^a-z]+/).filter(Boolean)
  let hiScore = 0
  let teScore = 0

  for (const w of words) {
    if (ROMAN_HI.includes(w)) hiScore += 1
    if (ROMAN_TE.includes(w)) teScore += 1
  }

  if (teScore > hiScore && teScore > 0) return 'te'
  if (hiScore > teScore && hiScore > 0) return 'hi'
  return 'en'
}

/* ---------- Vocabulary & Service Entities Mapping ---------- */
export const CATS = {
  Hospital: ['hospital', 'doctor', 'clinic', 'aspatal', 'apollo', 'care', 'yashoda', 'kims', 'aig', 'maxcure', 'rainbow', 'medicover', 'अस्पताल', 'हॉस्पिटल', 'डॉक्टर', 'ఆసుపత్రి', 'హాస్పిటల్', 'డాక్టర్'],
  Bank: ['bank', 'sbi', 'hdfc', 'icici', 'axis', 'pnb', 'canara', 'kotak', 'bob', 'बैंक', 'బ్యాంక్', 'బ్యాంకు'],
  Government: ['government', 'govt', 'passport', 'rto', 'aadhaar', 'ghmc', 'electricity', 'water', 'tsspdcl', 'meeseva', 'सरकारी', 'दफ्तर', 'ప్రభుత్వ', 'ఆఫీస్'],
  College: ['college', 'university', 'osmania', 'jntu', 'cbit', 'bits', 'vnr', 'कॉलेज', 'కాలేజీ', 'కళాశాల'],
  Support: ['support', 'customer care', 'airtel', 'jio', 'apple', 'samsung', 'bsnl', 'सपोर्ट', 'కస్టమర్ కేర్', 'సపోర్ట్'],
}

const W = {
  cancel: ['cancel', 'radd karo', 'cancel karo', 'cancel cheyyi', 'vaddu', 'రద్దు', 'క్యాన్సిల్', 'रद्द', 'कैंसल'],
  help: ['help', 'contact', 'customer care', 'madad', 'sahayata', 'sahayam', 'मदद', 'सहायता', 'సహాయం'],
  best: ['best', 'top rated', 'highest rated', 'recommend', 'sabse accha', 'सबसे अच्छा', 'बेस्ट', 'ఉత్తమ', 'బెస్ట్'],
  rate: ['rate', 'rating', 'review', 'feedback', 'रेटिंग', 'रेट', 'రేటింగ్', 'సమీక్ష'],
  wait: ['wait', 'busy', 'crowd', 'queue', 'how many', 'intezar', 'bheed', 'भीड़', 'इंतज़ार', 'రద్దీ', 'నిరీక్షణ'],
  status: [
    'status', 'position', 'my token', 'my number', 'where am i', 'how long',
    'mera token', 'mera number', 'kitna time', 'kahan hai', 'kya status hai',
    'naa token', 'naa number', 'ekkada undi', 'entha time',
    'मेरा टोकन', 'मेरा नंबर', 'कितना', 'स्थिति', 'నా టోకెన్', 'నా నంబర్', 'స్థానం'
  ],
  history: ['history', 'past visits', 'pichle', 'purane', 'record', 'इतिहास', 'पुराने', 'చరిత్ర'],
  home: ['dashboard', 'home', 'go back', 'होम', 'डैशबोर्ड', 'హోమ్', 'డాష్‌బోర్డ్'],
  book: [
    'book', 'get token', 'take token', 'token chahiye', 'book karo', 'book cheyyi',
    'token kavali', 'appointment', 'slip', 'line', 'कतार', 'बुक', 'बुकिंग',
    'टोकन चाहिए', 'టోకెన్ కావాలి', 'టోకెన్ తీసుకో', 'బుక్'
  ],
}

const has = (t, list) => list.some(w => t.includes(w))

export function parse(text) {
  const t = text.toLowerCase().trim()
  const cat = Object.keys(CATS).find(c => has(t, CATS[c])) || null

  if (has(t, W.cancel)) return { intent: 'cancel', text: t }
  if (has(t, W.help)) return { intent: 'help', text: t }
  if (has(t, W.best)) return { intent: 'best', cat, text: t }
  if (has(t, W.rate)) return { intent: 'rate', text: t }
  if (cat && has(t, W.wait)) return { intent: 'wait', cat, text: t }
  if (has(t, W.status)) return { intent: 'status', text: t }
  if (has(t, W.history)) return { intent: 'history', text: t }
  if (has(t, W.home)) return { intent: 'home', text: t }
  if (has(t, W.book)) return { intent: 'book', cat, text: t }
  if (cat) return { intent: 'book', cat, text: t } // Direct action: naming a place books it directly!
  return { intent: 'search', q: text, text: t }
}

const ADMIN = [
  ['/admin', 'Overview', ['overview', 'home', 'dashboard', 'ओवरव्यू', 'होम', 'డాష్‌బోర్డ్', 'ఓవర్‌వ్యూ']],
  ['/admin/queue', 'Queue control', ['queue', 'counter', 'call', 'क्यू', 'कतार', 'క్యూ', 'కౌంటర్']],
  ['/admin/analytics', 'Analytics', ['analytic', 'report', 'stats', 'statistics', 'एनालिटिक्स', 'అనలిటిక్స్']],
  ['/admin/verify', 'Verify', ['verify', 'scan', 'qr', 'वेरिफ़ाई', 'వెరిఫై', 'స్కాన్']],
]

export function parseAdmin(text) {
  const t = text.toLowerCase()
  if (has(t, ['how many', 'waiting', 'kitne', 'कितने', 'ఎంత మంది'])) return { intent: 'count' }
  const hit = ADMIN.find(a => has(t, a[2]))
  return hit ? { intent: 'go', route: hit[0], name: hit[1] } : { intent: 'unknown' }
}

export const CATN = {
  en: { Hospital: 'hospital', Bank: 'bank', Government: 'government', College: 'college', Support: 'support' },
  hi: { Hospital: 'अस्पताल', Bank: 'बैंक', Government: 'सरकारी दफ़्तर', College: 'कॉलेज', Support: 'सपोर्ट' },
  te: { Hospital: 'ఆసుపత్రి', Bank: 'బ్యాంక్', Government: 'ప్రభుత్వ కార్యాలయం', College: 'కాలేజీ', Support: 'సపోర్ట్' },
}

export const R = {
  en: {
    listening: 'Listening… speak your command.',
    noSpeech: 'Didn’t catch that. Tap the mic and speak.',
    unsupported: 'Voice input requires Chrome or Edge.',
    mic: 'Please allow microphone access in your browser.',
    hello: 'Try: “book a token at Apollo hospital”, “book SBI”, “what is my position”.',
    noToken: 'You have no active token right now.',
    status: t => t.status === 'serving'
      ? `Your token ${t.label} is being served now! Please proceed to counter ${t.counter}.`
      : `Your token ${t.label} is number ${t.position} in line, about ${t.etaMinutes} minutes wait.`,
    which: 'Selecting the best available verified centre for you.',
    booked: (l, n) => `Token ${l} booked directly at ${n}. WhatsApp confirmation sent!`,
    cancelled: 'Your active token has been cancelled directly.',
    cantCancel: 'Only a waiting token can be cancelled.',
    history: 'Opening your visit history.',
    home: 'Navigating to your dashboard.',
    help: 'Opening help and support.',
    rate: 'Opening your visits to rate.',
    browse: c => `Displaying verified ${c} centres.`,
    wait: (n, w, e) => `${n} has ${w} people waiting, approx ${e} minutes.`,
    best: (n, r) => `${n} is top rated with ${r} stars.`,
    noRatings: 'No ratings recorded yet.',
    searching: q => `Finding matches for ${q}.`,
    adminGo: p => `Navigating to ${p}.`,
    adminWaiting: n => `Currently ${n} people are waiting across queues.`,
    adminHelp: 'Try: “open analytics”, “queue control”, or “how many are waiting”.',
    hints: ['Book token at Apollo Hospital', 'Book SBI Bank', 'What is my position?', 'Cancel my token'],
    adminHints: ['Open analytics', 'Queue control', 'Verify a token', 'How many are waiting?'],
  },
  hi: {
    listening: 'सुन रहा हूँ… अपना आदेश बोलें।',
    noSpeech: 'आवाज़ नहीं आई। माइक दबाकर फिर बोलें।',
    unsupported: 'वॉइस के लिए Chrome या Edge का उपयोग करें।',
    mic: 'कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।',
    hello: 'बोलिए: “अपोलो अस्पताल में टोकन बुक करो”, “एसबीआई बैंक”, “मेरा नंबर क्या है”।',
    noToken: 'आपका अभी कोई सक्रिय टोकन नहीं है।',
    status: t => t.status === 'serving'
      ? `आपका टोकन ${t.label} बुलाया गया है! कृपया काउंटर ${t.counter} पर जाएँ।`
      : `आपका टोकन ${t.label} कतार में ${t.position} नंबर पर है, लगभग ${t.etaMinutes} मिनट बाकी हैं।`,
    which: 'आपके लिए सबसे अच्छा केंद्र चुना जा रहा है।',
    booked: (l, n) => `टोकन ${l} सीधे ${n} में बुक कर दिया गया है! WhatsApp पर पुष्टि भेज दी गई है।`,
    cancelled: 'आपका टोकन सीधे रद्द कर दिया गया है।',
    cantCancel: 'केवल इंतज़ार वाला टोकन ही रद्द हो सकता है।',
    history: 'आपका इतिहास खोल रहा हूँ।',
    home: 'डैशबोर्ड पर जा रहा हूँ।',
    help: 'सहायता केंद्र खोल रहा हूँ।',
    rate: 'रेटिंग देने के लिए दौरे खोल रहा हूँ।',
    browse: c => `${c} केंद्र दिखा रहा हूँ।`,
    wait: (n, w, e) => `${n} में ${w} लोग इंतज़ार में हैं, लगभग ${e} मिनट लगेंगे।`,
    best: (n, r) => `सबसे बेहतरीन रेटिंग ${n} की है, ${r} स्टार।`,
    noRatings: 'अभी कोई रेटिंग नहीं है।',
    searching: q => `${q} के नतीजे खोज रहा हूँ।`,
    adminGo: p => `${p} खोल रहा हूँ।`,
    adminWaiting: n => `अभी कुल ${n} लोग कतार में हैं।`,
    adminHelp: 'बोलें: “एनालिटिक्स खोलो”, “क्यू कंट्रोल”, “कितने लोग इंतज़ार में हैं”।',
    hints: ['अपोलो अस्पताल में टोकन बुक करो', 'एसबीआई बैंक बुक करो', 'मेरा नंबर क्या है', 'टोकन रद्द करो'],
    adminHints: ['एनालिटिक्स खोलो', 'क्यू कंट्रोल', 'टोकन वेरिफ़ाई करो', 'कितने लोग इंतज़ार में हैं'],
  },
  te: {
    listening: 'వింటున్నాను… మీ ఆదేశం చెప్పండి.',
    noSpeech: 'వాయిస్ అందలేదు. మైక్ నొక్కి మళ్లీ చెప్పండి.',
    unsupported: 'వాయిస్ కోసం Chrome లేదా Edge వాడండి.',
    mic: 'దయచేసి బ్రౌజర్‌లో మైక్రోఫోన్ అనుమతి ఇవ్వండి.',
    hello: 'ఇలా చెప్పండి: “అపోలో హాస్పిటల్‌లో టోకెన్ బుక్ చేయి”, “ఎస్బీఐ బ్యాంక్”, “నా టోకెన్ ఎక్కడ ఉంది”.',
    noToken: 'మీకు ప్రస్తుతం యాక్టివ్ టోకెన్ లేదు.',
    status: t => t.status === 'serving'
      ? `మీ టోకెన్ ${t.label} పిలవబడింది! దయచేసి కౌంటర్ ${t.counter} వద్దకు వెళ్లండి.`
      : `మీ టోకెన్ ${t.label} వరుసలో ${t.position}వ స్థానంలో ఉంది, సుమారు ${t.etaMinutes} నిమిషాలు వేచి ఉండాలి.`,
    which: 'ఉత్తమమైన కేంద్రాన్ని ఎంచుకుంటున్నాను.',
    booked: (l, n) => `టోకెన్ ${l} నేరుగా ${n} లో బుక్ చేయబడింది! WhatsApp కన్ఫర్మేషన్ పంపబడింది.`,
    cancelled: 'మీ టోకెన్ నేరుగా రద్దు చేయబడింది.',
    cantCancel: 'వేచి ఉన్న టోకెన్‌ను మాత్రమే రద్దు చేయవచ్చు.',
    history: 'మీ చరిత్రను తెరుస్తున్నాను.',
    home: 'డాష్‌బోర్డ్‌కు వెళ్తున్నాను.',
    help: 'సహాయ పేజీని తెరుస్తున్నాను.',
    rate: 'రేటింగ్ ఇవ్వడానికి మీ సందర్శనలను తెరుస్తున్నాను.',
    browse: c => `${c} కేంద్రాలను చూపిస్తున్నాను.`,
    wait: (n, w, e) => `${n} లో ${w} మంది వేచి ఉన్నారు, సుమారు ${e} నిమిషాలు.`,
    best: (n, r) => `${n} కు అత్యుత్తమ రేటింగ్ ఉంది, ${r} స్టార్లు.`,
    noRatings: 'ఇంకా రేటింగ్‌లు లేవు.',
    searching: q => `${q} ఫలితాలను చూపిస్తున్నాను.`,
    adminGo: p => `${p} తెరుస్తున్నాను.`,
    adminWaiting: n => `ప్రస్తుతం మొత్తం ${n} మంది వేచి ఉన్నారు.`,
    adminHelp: 'చెప్పండి: “అనలిటిక్స్ తెరువు”, “క్యూ కంట్రోల్”, “ఎంత మంది వేచి ఉన్నారు”.',
    hints: ['అపోలో హాస్పిటల్‌లో బుక్ చేయి', 'ఎస్బీఐ బ్యాంక్ టోకెన్', 'నా టోకెన్ ఎక్కడ ఉంది', 'టోకెన్ రద్దు చేయి'],
    adminHints: ['అనలిటిక్స్ తెరువు', 'క్యూ కంట్రోల్', 'టోకెన్ వెరిఫై చేయి', 'ఎంత మంది ఉన్నారు'],
  },
}

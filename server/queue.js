const router = require('express').Router()
const db = require('./db')
const { requireAuth, requireAdmin } = require('./auth')
const { notify } = require('./mailer')

const getService = id => db.prepare('SELECT * FROM services WHERE id=?').get(id)
const label = (svc, n) => `${svc.prefix}-${String(n).padStart(3, '0')}`
const emit = (req, serviceId) => req.app.get('io').emit('queue:update', { serviceId })
const when = ts =>
  new Date(ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
const userOf = id => (id ? db.prepare('SELECT * FROM users WHERE id=?').get(id) : null)
const round1 = v => Math.round(v * 10) / 10

const parseJson = str => {
  try {
    return str ? JSON.parse(str) : []
  } catch {
    return []
  }
}

function ratingOf(serviceId) {
  const r = db.prepare('SELECT AVG(stars) a, COUNT(*) c FROM ratings WHERE service_id=?').get(serviceId)
  return { rating: r.c ? round1(r.a) : null, ratingCount: r.c }
}

function avgMinutes(svc) {
  const r = db.prepare(`SELECT COUNT(*) c, AVG(done_at - called_at) a FROM (
    SELECT done_at, called_at FROM tokens
    WHERE service_id=? AND status='done' AND called_at IS NOT NULL
    ORDER BY done_at DESC LIMIT 20)`).get(svc.id)
  return r.c >= 3 ? Math.max(1, r.a / 60000) : svc.avg_minutes
}

const waitingCount = id =>
  db.prepare("SELECT COUNT(*) c FROM tokens WHERE service_id=? AND status='waiting'").get(id).c

const nowServing = id =>
  db.prepare("SELECT number FROM tokens WHERE service_id=? AND status='serving' ORDER BY called_at").all(id)

function shape(t) {
  const svc = getService(t.service_id)
  const out = {
    id: t.id,
    serviceId: svc.id,
    serviceName: svc.name,
    serviceCategory: svc.category,
    serviceLocation: svc.location || '',
    serviceHours: svc.hours || '',
    servicePhone: svc.phone || '',
    serviceEmail: svc.email || '',
    docsRequired: parseJson(svc.docs_required),
    feeInfo: svc.fee_info || '',
    label: label(svc, t.number),
    status: t.status,
    counter: t.counter,
    createdAt: t.created_at,
    paused: !!svc.paused,
    nowServing: nowServing(svc.id).map(x => label(svc, x.number)),
    myRating: (db.prepare('SELECT stars FROM ratings WHERE token_id=?').get(t.id) || {}).stars || null,
  }
  if (t.status === 'waiting') {
    const ahead = db.prepare(
      "SELECT COUNT(*) c FROM tokens WHERE service_id=? AND status='waiting' AND number<?"
    ).get(svc.id, t.number).c
    out.ahead = ahead
    out.position = ahead + 1
    out.etaMinutes = Math.round((ahead / svc.counters) * avgMinutes(svc))
  }
  return out
}

const book = db.transaction((svc, userId, guest) => {
  db.prepare('UPDATE services SET seq = seq + 1 WHERE id=?').run(svc.id)
  const { seq } = db.prepare('SELECT seq FROM services WHERE id=?').get(svc.id)
  return db.prepare(
    'INSERT INTO tokens(service_id,user_id,guest_name,number,created_at) VALUES(?,?,?,?,?)'
  ).run(svc.id, userId, guest, seq, Date.now()).lastInsertRowid
})

// ---------- Customer routes ----------
function makeWhatsAppUrl(user, token, svc, req) {
  if (!svc || !token) return null
  const cleanPhone = (user && user.phone ? user.phone : '').replace(/[^\d]/g, '')
  const host = (req && req.headers && req.headers.origin) ? req.headers.origin : 'http://localhost:5173'
  const text =
`*🎟️ SkipQ Digital Token Confirmation*
━━━━━━━━━━━━━━━━━━
*Token Number:* ${token.label}
*Service Centre:* ${svc.name}
*Current Queue Position:* #${token.position || 1}
*Estimated Wait:* ~${token.etaMinutes || 5} mins
*Live Status Tracker:* ${host}/token
━━━━━━━━━━━━━━━━━━
_Show this digital token or QR code at the counter when called._`

  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
}

router.get('/services', requireAuth, (req, res) => {
  const list = db.prepare('SELECT * FROM services ORDER BY id').all().map(s => {
    const waiting = waitingCount(s.id)
    return {
      id: s.id,
      name: s.name,
      category: s.category,
      prefix: s.prefix,
      counters: s.counters,
      paused: !!s.paused,
      waiting,
      etaMinutes: Math.round((waiting / s.counters) * avgMinutes(s)),
      location: s.location || '',
      hours: s.hours || '',
      phone: s.phone || '',
      email: s.email || '',
      description: s.description || '',
      servicesOffered: parseJson(s.services_offered),
      docsRequired: parseJson(s.docs_required),
      feeInfo: s.fee_info || '',
      ...ratingOf(s.id),
    }
  })
  res.json({ services: list })
})

router.post('/tokens', requireAuth, (req, res) => {
  const svc = getService(Number(req.body.serviceId))
  if (!svc) return res.status(404).json({ error: 'Service not found.' })
  if (svc.paused) return res.status(409).json({ error: 'This queue is paused. Please try again shortly.' })
  const active = db.prepare(
    "SELECT 1 FROM tokens WHERE user_id=? AND status IN ('waiting','serving')"
  ).get(req.user.id)
  if (active) return res.status(409).json({ error: 'You already have an active token. Cancel it to book another.' })
  const id = book(svc, req.user.id, null)
  const s = shape(db.prepare('SELECT * FROM tokens WHERE id=?').get(id))
  emit(req, svc.id)
  notify(req.user, `Token ${s.label} confirmed – ${svc.name}`, [
    `Hi ${req.user.name}, your token is booked.`,
    `Token: ${s.label}`,
    `Service: ${svc.name}`,
    `Booked at: ${when(Date.now())}`,
    `Position in line: #${s.position}`,
    `Estimated wait: ${s.etaMinutes} min`,
    'Open SkipQ to track your place live.',
  ]).catch(console.error)
  const whatsappUrl = makeWhatsAppUrl(req.user, s, svc, req)
  res.status(201).json({ token: s, whatsappUrl })
})

router.get('/tokens/me', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM tokens WHERE user_id=? ORDER BY created_at DESC LIMIT 30').all(req.user.id)
  const active = rows.find(t => ['waiting', 'serving'].includes(t.status))
  let whatsappUrl = null
  if (active) {
    const svc = getService(active.service_id)
    const s = shape(active)
    whatsappUrl = makeWhatsAppUrl(req.user, s, svc, req)
  }
  res.json({ active: active ? shape(active) : null, history: rows.map(shape), whatsappUrl })
})

router.post('/tokens/:id/cancel', requireAuth, (req, res) => {
  const t = db.prepare('SELECT * FROM tokens WHERE id=? AND user_id=?').get(req.params.id, req.user.id)
  if (!t) return res.status(404).json({ error: 'Token not found.' })
  if (t.status !== 'waiting') return res.status(409).json({ error: 'Only waiting tokens can be cancelled.' })
  db.prepare("UPDATE tokens SET status='cancelled', done_at=? WHERE id=?").run(Date.now(), t.id)
  emit(req, t.service_id)
  res.json({ ok: true })
})

router.get('/dashboard', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM tokens WHERE user_id=? ORDER BY created_at DESC').all(req.user.id)
  const active = rows.find(t => ['waiting', 'serving'].includes(t.status))
  const done = rows.filter(t => t.status === 'done')
  const called = rows.filter(t => t.called_at)
  const avgWait = called.length
    ? round1(called.reduce((a, t) => a + (t.called_at - t.created_at), 0) / called.length / 60000)
    : 0
  const unrated = done.filter(t => !db.prepare('SELECT 1 FROM ratings WHERE token_id=?').get(t.id))
  res.json({
    stats: { visits: rows.length, completed: done.length, avgWait, pendingFeedback: unrated.length },
    active: active ? shape(active) : null,
    recent: rows.slice(0, 5).map(shape),
    pendingRatings: unrated.slice(0, 3).map(shape),
  })
})

router.post('/ratings', requireAuth, (req, res) => {
  const tokenId = Number(req.body.tokenId)
  const stars = Math.round(Number(req.body.stars))
  const comment = String(req.body.comment || '').trim().slice(0, 300)
  if (!(stars >= 1 && stars <= 5)) return res.status(400).json({ error: 'Please choose 1 to 5 stars.' })
  const t = db.prepare('SELECT * FROM tokens WHERE id=? AND user_id=?').get(tokenId, req.user.id)
  if (!t) return res.status(404).json({ error: 'Visit not found.' })
  if (t.status !== 'done') return res.status(409).json({ error: 'You can rate a visit after it is completed.' })
  if (db.prepare('SELECT 1 FROM ratings WHERE token_id=?').get(t.id))
    return res.status(409).json({ error: 'You already rated this visit.' })
  db.prepare('INSERT INTO ratings(token_id,service_id,user_id,stars,comment,created_at) VALUES(?,?,?,?,?,?)')
    .run(t.id, t.service_id, req.user.id, stars, comment, Date.now())
  emit(req, t.service_id)
  res.status(201).json({ ok: true })
})

router.get('/notifications', requireAuth, (req, res) => {
  const items = db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 15').all(req.user.id)
  const unread = db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND read=0').get(req.user.id).c
  res.json({ items, unread })
})

router.post('/notifications/read', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET read=1 WHERE user_id=?').run(req.user.id)
  res.json({ ok: true })
})

// ---------- Admin routes ----------
router.use('/admin', requireAuth, requireAdmin)

router.get('/admin/services', (req, res) => {
  res.json({ services: db.prepare('SELECT id,name,category,counters,paused FROM services ORDER BY id').all() })
})

router.get('/admin/services/:id/queue', (req, res) => {
  const svc = getService(req.params.id)
  if (!svc) return res.status(404).json({ error: 'Service not found.' })
  const name = `COALESCE(u.name, t.guest_name, 'Walk-in')`
  const base = `SELECT t.*, ${name} AS name FROM tokens t LEFT JOIN users u ON u.id=t.user_id`
  const waiting = db.prepare(`${base} WHERE t.service_id=? AND t.status='waiting' ORDER BY t.number`).all(svc.id)
  const serving = db.prepare(`${base} WHERE t.service_id=? AND t.status='serving'`).all(svc.id)
  const counters = Array.from({ length: svc.counters }, (_, i) => {
    const t = serving.find(x => x.counter === i + 1)
    return { counter: i + 1, token: t ? { id: t.id, label: label(svc, t.number), name: t.name } : null }
  })
  res.json({
    service: { id: svc.id, name: svc.name, paused: !!svc.paused, counters: svc.counters },
    counters,
    waiting: waiting.map(t => ({ id: t.id, label: label(svc, t.number), name: t.name, createdAt: t.created_at })),
  })
})

router.post('/admin/services/:id/call-next', (req, res) => {
  const svc = getService(req.params.id)
  const counter = Number(req.body.counter)
  if (!svc) return res.status(404).json({ error: 'Service not found.' })
  if (svc.paused) return res.status(409).json({ error: 'Resume the queue first.' })
  if (!(counter >= 1 && counter <= svc.counters)) return res.status(400).json({ error: 'Invalid counter.' })
  const busy = db.prepare("SELECT 1 FROM tokens WHERE service_id=? AND status='serving' AND counter=?").get(svc.id, counter)
  if (busy) return res.status(409).json({ error: 'That counter is already serving someone.' })
  const next = db.prepare("SELECT * FROM tokens WHERE service_id=? AND status='waiting' ORDER BY number LIMIT 1").get(svc.id)
  if (!next) return res.status(409).json({ error: 'No one is waiting.' })
  db.prepare("UPDATE tokens SET status='serving', counter=?, called_at=? WHERE id=?").run(counter, Date.now(), next.id)
  emit(req, svc.id)
  const owner = userOf(next.user_id)
  if (owner) {
    notify(owner, `Your turn – token ${label(svc, next.number)}`, [
      `Hi ${owner.name}, it’s your turn.`,
      `Please go to counter ${counter} at ${svc.name}.`,
      `Token: ${label(svc, next.number)}`,
    ]).catch(console.error)
  }
  res.json({ ok: true })
})

function close(status, from) {
  return (req, res) => {
    const t = db.prepare('SELECT * FROM tokens WHERE id=?').get(req.params.id)
    if (!t) return res.status(404).json({ error: 'Token not found.' })
    if (!from.includes(t.status)) return res.status(409).json({ error: `Cannot do that to a ${t.status} token.` })
    db.prepare('UPDATE tokens SET status=?, done_at=? WHERE id=?').run(status, Date.now(), t.id)
    emit(req, t.service_id)
    const owner = userOf(t.user_id)
    if (owner && status === 'skipped') {
      const svc = getService(t.service_id)
      notify(owner, `Token ${label(svc, t.number)} was skipped`, [
        `Hi ${owner.name}, your token was skipped because you were not at the counter.`,
        `Please book a new token at ${svc.name} when you are ready.`,
      ]).catch(console.error)
    }
    if (owner && status === 'done') {
      const svc = getService(t.service_id)
      notify(owner, `Visit completed – ${svc.name}`, [
        `Thanks for visiting, ${owner.name}.`,
        'Open SkipQ and rate your visit. It takes 10 seconds and helps others.',
      ]).catch(console.error)
    }
    res.json({ ok: true })
  }
}
router.post('/admin/tokens/:id/complete', close('done', ['serving']))
router.post('/admin/tokens/:id/skip', close('skipped', ['serving', 'waiting']))
router.post('/admin/tokens/:id/cancel', close('cancelled', ['serving', 'waiting']))

router.post('/admin/services/:id/pause', (req, res) => {
  const svc = getService(req.params.id)
  if (!svc) return res.status(404).json({ error: 'Service not found.' })
  db.prepare('UPDATE services SET paused=? WHERE id=?').run(svc.paused ? 0 : 1, svc.id)
  emit(req, svc.id)
  res.json({ paused: !svc.paused })
})

router.post('/admin/services/:id/counters', (req, res) => {
  const svc = getService(req.params.id)
  if (!svc) return res.status(404).json({ error: 'Service not found.' })
  const n = Math.max(1, Math.min(8, svc.counters + (Number(req.body.delta) > 0 ? 1 : -1)))
  db.prepare('UPDATE services SET counters=? WHERE id=?').run(n, svc.id)
  emit(req, svc.id)
  res.json({ counters: n })
})

router.post('/admin/services/:id/walkin', (req, res) => {
  const svc = getService(req.params.id)
  if (!svc) return res.status(404).json({ error: 'Service not found.' })
  book(svc, null, (req.body.name || 'Walk-in').trim() || 'Walk-in')
  emit(req, svc.id)
  res.status(201).json({ ok: true })
})

router.get('/admin/analytics', (req, res) => {
  const start = new Date().setHours(0, 0, 0, 0)
  const one = (sql, ...a) => db.prepare(sql).get(...a)
  const min = v => (v ? Math.round((v / 60000) * 10) / 10 : 0)
  res.json({
    visitors: one('SELECT COUNT(*) c FROM tokens WHERE created_at>=?', start).c,
    completed: one("SELECT COUNT(*) c FROM tokens WHERE status='done' AND created_at>=?", start).c,
    dropped: one("SELECT COUNT(*) c FROM tokens WHERE status IN ('skipped','cancelled') AND created_at>=?", start).c,
    avgWait: min(one('SELECT AVG(called_at-created_at) a FROM tokens WHERE called_at IS NOT NULL AND created_at>=?', start).a),
    avgService: min(one("SELECT AVG(done_at-called_at) a FROM tokens WHERE status='done' AND created_at>=?", start).a),
    byService: db.prepare(`SELECT s.name, COUNT(t.id) AS total FROM services s
      LEFT JOIN tokens t ON t.service_id=s.id AND t.created_at>=? GROUP BY s.id ORDER BY s.id`).all(start),
  })
})

router.get('/admin/overview', (req, res) => {
  const start = new Date().setHours(0, 0, 0, 0)
  const one = (sql, ...a) => db.prepare(sql).get(...a)
  const min = v => (v ? round1(v / 60000) : 0)
  const services = db.prepare('SELECT * FROM services ORDER BY id').all().map(s => ({
    id: s.id, name: s.name, category: s.category, counters: s.counters, paused: !!s.paused,
    waiting: waitingCount(s.id), serving: nowServing(s.id).length,
    today: one('SELECT COUNT(*) c FROM tokens WHERE service_id=? AND created_at>=?', s.id, start).c,
    ...ratingOf(s.id),
  }))
  const hours = Array(24).fill(0)
  db.prepare('SELECT created_at FROM tokens WHERE created_at>=?').all(start)
    .forEach(r => hours[new Date(r.created_at).getHours()]++)
  const feedback = db.prepare(`SELECT r.stars, r.comment, r.created_at, u.name AS user, s.name AS service
    FROM ratings r JOIN users u ON u.id=r.user_id JOIN services s ON s.id=r.service_id
    ORDER BY r.created_at DESC LIMIT 6`).all()
  const overall = one('SELECT AVG(stars) a, COUNT(*) c FROM ratings')
  res.json({
    kpis: {
      visitors: one('SELECT COUNT(*) c FROM tokens WHERE created_at>=?', start).c,
      completed: one("SELECT COUNT(*) c FROM tokens WHERE status='done' AND created_at>=?", start).c,
      waiting: services.reduce((a, s) => a + s.waiting, 0),
      serving: services.reduce((a, s) => a + s.serving, 0),
      avgWait: min(one('SELECT AVG(called_at-created_at) a FROM tokens WHERE called_at IS NOT NULL AND created_at>=?', start).a),
      rating: overall.c ? round1(overall.a) : null,
      ratingCount: overall.c,
    },
    services,
    hours: hours.slice(7, 21).map((count, i) => ({ hour: i + 7, count })),
    feedback,
  })
})

router.post('/admin/verify', (req, res) => {
  const [tag, id] = String(req.body.code || '').split('|')
  if (tag !== 'SKIPQ' || !Number(id)) return res.status(400).json({ error: 'That is not a SkipQ code.' })
  const t = db.prepare(`SELECT t.*, COALESCE(u.name, t.guest_name, 'Walk-in') AS name
    FROM tokens t LEFT JOIN users u ON u.id=t.user_id WHERE t.id=?`).get(Number(id))
  if (!t) return res.status(404).json({ error: 'Token not found.' })
  const svc = getService(t.service_id)
  res.json({
    label: label(svc, t.number), name: t.name, service: svc.name,
    status: t.status, counter: t.counter,
    valid: ['waiting', 'serving'].includes(t.status),
  })
})

module.exports = router

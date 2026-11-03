const bcrypt = require('bcryptjs')
const { realisticServices, sampleUsers, sampleFeedback, sampleWalkins } = require('./seedData')

function migrateAndSeed(db) {
  const hasCol = (t, c) => db.prepare(`PRAGMA table_info(${t})`).all().some(x => x.name === c)

  // Ensure user columns
  if (!hasCol('users', 'phone')) db.exec('ALTER TABLE users ADD COLUMN phone TEXT')

  // Ensure service columns
  const cols = ['location', 'hours', 'phone', 'email', 'description', 'services_offered', 'docs_required', 'fee_info']
  cols.forEach(c => {
    if (!hasCol('services', c)) db.exec(`ALTER TABLE services ADD COLUMN ${c} TEXT`)
  })

  // Ensure admin user
  if (!db.prepare("SELECT 1 FROM users WHERE role='admin'").get()) {
    db.prepare('INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)')
      .run('Admin', 'admin@skipq.app', bcrypt.hashSync('admin123', 10), 'admin')
  }

  // Check if we need to clean up old initial placeholders
  const firstOld = db.prepare('SELECT name FROM services WHERE id=1').get()
  if (firstOld && firstOld.name === 'City General Hospital') {
    db.prepare('DELETE FROM ratings').run()
    db.prepare('DELETE FROM tokens').run()
    db.prepare('DELETE FROM services').run()
  }

  // Upsert realistic services
  const findSvc = db.prepare('SELECT id FROM services WHERE prefix=? OR name=?')
  const updateSvc = db.prepare(`
    UPDATE services SET
      name=?, category=?, prefix=?, avg_minutes=?, counters=?,
      location=?, hours=?, phone=?, email=?, description=?,
      services_offered=?, docs_required=?, fee_info=?
    WHERE id=?
  `)
  const insertSvc = db.prepare(`
    INSERT INTO services (
      name, category, prefix, avg_minutes, counters,
      location, hours, phone, email, description,
      services_offered, docs_required, fee_info
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `)

  for (const s of realisticServices) {
    const existing = findSvc.get(s.prefix, s.name)
    if (existing) {
      updateSvc.run(
        s.name, s.category, s.prefix, s.avg_minutes, s.counters,
        s.location, s.hours, s.phone, s.email, s.description,
        s.services_offered, s.docs_required, s.fee_info,
        existing.id
      )
    } else {
      insertSvc.run(
        s.name, s.category, s.prefix, s.avg_minutes, s.counters,
        s.location, s.hours, s.phone, s.email, s.description,
        s.services_offered, s.docs_required, s.fee_info
      )
    }
  }

  // Seed sample customer users
  const defaultPass = bcrypt.hashSync('pass123', 10)
  const insUser = db.prepare('INSERT OR IGNORE INTO users(name, email, password, phone, role) VALUES(?,?,?,?,?)')
  for (const u of sampleUsers) {
    insUser.run(u.name, u.email, defaultPass, u.phone, u.role)
  }

  // Seed sample completed tokens & authentic reviews if 0 ratings
  const rateCount = db.prepare('SELECT COUNT(*) c FROM ratings').get().c
  if (rateCount === 0) {
    const now = Date.now()
    for (const f of sampleFeedback) {
      const svc = db.prepare('SELECT * FROM services WHERE prefix=?').get(f.servicePrefix)
      const usr = db.prepare('SELECT * FROM users WHERE email=?').get(f.userEmail)
      if (svc && usr) {
        db.prepare('UPDATE services SET seq = seq + 1 WHERE id=?').run(svc.id)
        const { seq } = db.prepare('SELECT seq FROM services WHERE id=?').get(svc.id)
        const created = now - Math.floor(Math.random() * 86400000 * 2) - 3600000
        const called = created + Math.floor(svc.avg_minutes * 60000)
        const done = called + Math.floor(svc.avg_minutes * 60000)
        const tokId = db.prepare(
          'INSERT INTO tokens(service_id, user_id, number, status, counter, created_at, called_at, done_at) VALUES(?,?,?,?,?,?,?,?)'
        ).run(svc.id, usr.id, seq, 'done', 1, created, called, done).lastInsertRowid

        db.prepare(
          'INSERT INTO ratings(token_id, service_id, user_id, stars, comment, created_at) VALUES(?,?,?,?,?,?)'
        ).run(tokId, svc.id, usr.id, f.stars, f.comment, done + 60000)
      }
    }
  }

  // Seed realistic waiting tokens if waiting count is 0
  const waitCount = db.prepare("SELECT COUNT(*) c FROM tokens WHERE status='waiting'").get().c
  if (waitCount === 0) {
    const now = Date.now()
    for (const w of sampleWalkins) {
      const svc = db.prepare('SELECT * FROM services WHERE prefix=?').get(w.prefix)
      if (svc) {
        for (let i = 0; i < w.names.length; i++) {
          db.prepare('UPDATE services SET seq = seq + 1 WHERE id=?').run(svc.id)
          const { seq } = db.prepare('SELECT seq FROM services WHERE id=?').get(svc.id)
          db.prepare(
            'INSERT INTO tokens(service_id, guest_name, number, status, created_at) VALUES(?,?,?,?,?)'
          ).run(svc.id, w.names[i], seq, 'waiting', now - (w.names.length - i) * 120000)
        }
      }
    }
  }
}

module.exports = { migrateAndSeed }

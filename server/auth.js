const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('./db')

const sign = u => jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone })

router.post('/register', (req, res) => {
  const name = (req.body.name || '').trim()
  const email = (req.body.email || '').trim().toLowerCase()
  const password = req.body.password || ''
  const raw = (req.body.phone || '').replace(/[\s-]/g, '')
  let phone = null
  if (raw) {
    const p = /^\d{10}$/.test(raw) ? '+91' + raw : raw
    if (!/^\+\d{11,14}$/.test(p))
      return res.status(400).json({ error: 'Enter a valid mobile number, for example +91 98765 43210.' })
    phone = p
  }
  if (!name) return res.status(400).json({ error: 'Please enter your name.' })
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' })
  if (password.length < 6) return res.status(400).json({ error: 'Use a password of at least 6 characters.' })
  if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email))
    return res.status(409).json({ error: 'That email is already registered. Try logging in.' })
  const id = db.prepare('INSERT INTO users(name,email,password,phone) VALUES(?,?,?,?)')
    .run(name, email, bcrypt.hashSync(password, 10), phone).lastInsertRowid
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(id)
  res.status(201).json({ token: sign(user), user: publicUser(user) })
})

router.post('/login', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase()
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email)
  if (!user || !bcrypt.compareSync(req.body.password || '', user.password))
    return res.status(401).json({ error: 'Email or password is incorrect.' })
  res.json({ token: sign(user), user: publicUser(user) })
})

function requireAuth(req, res, next) {
  const h = req.headers.authorization || ''
  try {
    const p = jwt.verify(h.replace('Bearer ', ''), process.env.JWT_SECRET)
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(p.id)
    if (!user) throw new Error('no user')
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Please log in again.' })
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' })
  next()
}

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }))

// Update profile details (Name, Email, WhatsApp Phone)
router.patch('/me', requireAuth, (req, res) => {
  const name = req.body.name !== undefined ? req.body.name.trim() : req.user.name
  const email = req.body.email !== undefined ? req.body.email.trim().toLowerCase() : req.user.email
  const raw = req.body.phone !== undefined ? req.body.phone.replace(/[\s-]/g, '') : null

  if (!name) return res.status(400).json({ error: 'Name cannot be empty.' })
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' })

  // Check email uniqueness if changed
  if (email !== req.user.email) {
    const exists = db.prepare('SELECT 1 FROM users WHERE email=? AND id != ?').get(email, req.user.id)
    if (exists) return res.status(409).json({ error: 'That email is already registered to another account.' })
  }

  let phone = req.user.phone
  if (raw !== null) {
    if (raw === '') {
      phone = null
    } else {
      const p = /^\d{10}$/.test(raw) ? '+91' + raw : raw
      if (!/^\+\d{11,14}$/.test(p)) {
        return res.status(400).json({ error: 'Enter a valid mobile number (e.g. +91 98765 43210).' })
      }
      phone = p
    }
  }

  db.prepare('UPDATE users SET name=?, email=?, phone=? WHERE id=?').run(name, email, phone, req.user.id)
  const updated = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id)
  res.json({ user: publicUser(updated) })
})

// Update password
router.post('/me/password', requireAuth, (req, res) => {
  const currentPassword = req.body.currentPassword || ''
  const newPassword = req.body.newPassword || ''

  if (!bcrypt.compareSync(currentPassword, req.user.password)) {
    return res.status(401).json({ error: 'Current password is incorrect.' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' })
  }

  db.prepare('UPDATE users SET password=? WHERE id=?').run(bcrypt.hashSync(newPassword, 10), req.user.id)
  res.json({ ok: true, message: 'Password updated successfully.' })
})

router.patch('/me/phone', requireAuth, (req, res) => {
  const raw = (req.body.phone || '').replace(/[\s-]/g, '')
  let phone = null
  if (raw) {
    const p = /^\d{10}$/.test(raw) ? '+91' + raw : raw
    if (!/^\+\d{11,14}$/.test(p))
      return res.status(400).json({ error: 'Enter a valid mobile number, for example +91 98765 43210.' })
    phone = p
  }
  db.prepare('UPDATE users SET phone=? WHERE id=?').run(phone, req.user.id)
  const updated = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id)
  res.json({ user: publicUser(updated) })
})

module.exports = { router, requireAuth, requireAdmin }

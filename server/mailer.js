const db = require('./db')

const waConfigured = () =>
  !!(process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_WHATSAPP_FROM)

async function sendWhatsApp(to, text) {
  const { TWILIO_SID, TWILIO_TOKEN, TWILIO_WHATSAPP_FROM } = process.env
  const from = TWILIO_WHATSAPP_FROM.startsWith('whatsapp:')
    ? TWILIO_WHATSAPP_FROM
    : 'whatsapp:' + TWILIO_WHATSAPP_FROM

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64') },
    body: new URLSearchParams({ To: `whatsapp:${to}`, From: from, Body: text }),
  })

  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    const hint =
      j.code === 63015
        ? ' (this phone has not joined the sandbox: send the join message to the sandbox number)'
        : j.code === 63016
        ? ' (outside the 24-hour window: send "join <code>" again from that phone)'
        : ''
    throw new Error(`WhatsApp failed [${j.code || res.status}] ${j.message || ''}${hint}`)
  }
}

// Saves an in-app notification, then sends it on WhatsApp if the user has a number saved
async function notify(user, title, lines) {
  if (!user) return
  const text = lines.join('\n')

  db.prepare('INSERT INTO notifications(user_id,title,body,created_at) VALUES(?,?,?,?)')
    .run(user.id, title, text, Date.now())

  if (!user.phone) {
    console.log(`[no WhatsApp sent] ${user.name} has no phone number saved. Message: ${title}`)
    return
  }
  if (!waConfigured()) {
    console.log(`[WhatsApp not configured] To ${user.phone}: ${title}\n${text}\n`)
    return
  }

  try {
    await sendWhatsApp(user.phone, `*${title}*\n${text}`)
    console.log(`WhatsApp sent to ${user.phone}: ${title}`)
  } catch (e) {
    console.error('Notify error:', e.message)
  }
}

module.exports = { notify }
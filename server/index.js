const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'SkipQ server running' }))
app.use('/api', require('./auth').router)
app.use('/api', require('./queue'))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: true } })
app.set('io', io)

const PORT = process.env.PORT || 4000
server.listen(PORT, () => console.log(`SkipQ server on http://localhost:${PORT}`))
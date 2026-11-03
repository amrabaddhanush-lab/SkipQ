import { useState } from 'react'
import { api } from '../lib/api'
import { Button } from './ui'
import { StarInput } from './Stars'

export default function RateCard({ token, onDone }) {
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!stars) return setError('Please choose a star rating.')
    setBusy(true)
    setError('')
    try {
      await api('/ratings', { method: 'POST', body: { tokenId: token.id, stars, comment } })
      onDone?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 text-slate-900 shadow-xs">
      <p className="font-bold text-slate-900 text-base">How was your visit to {token.serviceName}?</p>
      <p className="mb-3 text-xs text-amber-800 font-mono">Token {token.label}</p>
      <StarInput value={stars} onChange={setStars} />
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        maxLength={300}
        rows={2}
        placeholder="Share your experience (staff friendliness, counter wait speed, etc.)..."
        aria-label="Comment"
        className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-orange-500 transition shadow-2xs"
      />
      {error && <p role="alert" className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      <Button className="mt-3" onClick={submit} disabled={busy}>
        {busy ? 'Recording feedback…' : 'Submit rating'}
      </Button>
    </div>
  )
}

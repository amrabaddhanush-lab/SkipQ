import { useEffect, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { CheckCircle2, XCircle, Camera } from 'lucide-react'
import { api } from '../lib/api'
import { Button, Card } from '../components/ui'
import Badge from '../components/Badge'

export default function Verify() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function check(code) {
    setError('')
    setResult(null)
    try {
      setResult(await api('/admin/verify', { method: 'POST', body: { code } }))
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    if (!scanning) return
    const scanner = new Html5Qrcode('reader')
    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: 220 },
        text => {
          setScanning(false)
          check(text)
        },
        () => {}
      )
      .catch(() => {
        setError('Camera not accessible. Allow browser camera permission and try again.')
        setScanning(false)
      })
    return () => {
      scanner.stop().then(() => scanner.clear()).catch(() => {})
    }
  }, [scanning])

  return (
    <section className="mx-auto max-w-md space-y-5 animate-fadeIn">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Verify QR Token</h1>
        <p className="text-xs text-slate-500 mt-1">Scan citizen ticket QR codes to validate live queue standing.</p>
      </div>

      <Card className="shadow-xs">
        {scanning ? (
          <>
            <div id="reader" className="overflow-hidden rounded-2xl border border-slate-300 bg-black" />
            <Button variant="outline" className="mt-4 w-full" onClick={() => setScanning(false)}>
              Stop camera
            </Button>
          </>
        ) : (
          <Button className="flex w-full items-center justify-center gap-2 py-3.5" onClick={() => { setResult(null); setError(''); setScanning(true) }}>
            <Camera size={18} /> Launch Camera Scanner
          </Button>
        )}

        {error && <p role="alert" className="mt-3 text-xs text-rose-600 font-medium">{error}</p>}
      </Card>

      {result && (
        <Card className={`border ${result.valid ? 'border-emerald-300 bg-emerald-50/50' : 'border-rose-300 bg-rose-50/50'} animate-fadeIn shadow-xs`}>
          <div className="flex items-start gap-3">
            {result.valid ? (
              <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle size={24} className="mt-0.5 shrink-0 text-rose-600" />
            )}
            <div className="flex-1">
              <p className="font-display text-3xl font-black text-slate-900">{result.label}</p>
              <p className="font-bold text-slate-800 mt-0.5">{result.name}</p>
              <p className="text-xs text-slate-500">{result.service}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <Badge status={result.status} />
                <span className={`text-xs font-mono font-bold ${result.valid ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {result.valid ? 'VALID ACTIVE TOKEN' : 'EXPIRED / CANCELLED'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Manual Code Input Fallback */}
      <Card className="shadow-xs">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Or Verify by Token Code</p>
        <form onSubmit={e => {
          e.preventDefault()
          const code = e.target.code.value.trim()
          if (code) check(code)
        }} className="flex gap-2">
          <input
            name="code"
            placeholder="e.g. SKIPQ|6|APH-001"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-orange-500"
          />
          <Button type="submit" variant="outline" className="text-xs py-2">
            Verify
          </Button>
        </form>
      </Card>
    </section>
  )
}

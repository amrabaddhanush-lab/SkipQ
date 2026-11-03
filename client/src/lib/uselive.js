import { useEffect, useRef } from 'react'
import { socket } from './socket'

export function useLive(fn) {
  const ref = useRef(fn)
  useEffect(() => {
    ref.current = fn
  })
  useEffect(() => {
    const handler = d => ref.current(d)
    socket.on('queue:update', handler)
    return () => socket.off('queue:update', handler)
  }, [])
}
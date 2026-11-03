import { useEffect, useRef, useState } from 'react'

export default function SkipQ3DLogo({ size = 280, interactive = true, scrollReact = true }) {
  const containerRef = useRef(null)
  const [rotation, setRotation] = useState({ x: 12, y: -20, z: 0 })
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetRotRef = useRef({ x: 12, y: -20, z: 0 })
  const currentRotRef = useRef({ x: 12, y: -20, z: 0 })
  const scrollRef = useRef(0)
  const animFrameRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY
    }

    const handleMouseMove = (e) => {
      if (!interactive || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2)
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2)
      mouseRef.current = { x: deltaX * 25, y: -deltaY * 25 }
    }

    if (scrollReact) {
      window.addEventListener('scroll', handleScroll, { passive: true })
    }
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    let time = 0
    const animate = () => {
      time += 0.02
      // Base auto floating motion
      const floatY = Math.sin(time * 1.5) * 8
      const floatRotY = Math.sin(time * 0.8) * 15
      const floatRotX = Math.cos(time * 1.2) * 8

      // Scroll-driven 3D spinning
      const scrollRotation = scrollReact ? scrollRef.current * 0.45 : 0
      const scrollTilt = scrollReact ? Math.sin(scrollRef.current * 0.005) * 12 : 0

      // Combine with mouse parallax
      targetRotRef.current = {
        x: floatRotX + mouseRef.current.y + scrollTilt + 8,
        y: floatRotY + mouseRef.current.x + scrollRotation - 15,
        z: Math.sin(time * 0.5) * 4 + (scrollReact ? scrollRef.current * 0.05 : 0)
      }

      // Smooth lerp damping
      currentRotRef.current.x += (targetRotRef.current.x - currentRotRef.current.x) * 0.08
      currentRotRef.current.y += (targetRotRef.current.y - currentRotRef.current.y) * 0.08
      currentRotRef.current.z += (targetRotRef.current.z - currentRotRef.current.z) * 0.08

      setRotation({
        x: currentRotRef.current.x,
        y: currentRotRef.current.y,
        z: currentRotRef.current.z
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [interactive, scrollReact])

  const scale = size / 280

  return (
    <div
      ref={containerRef}
      className="relative select-none flex items-center justify-center"
      style={{
        width: `${size}px`,
        height: `${size * 1.05}px`,
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Ambient Glow Aura in Warm Orange & Soft Slate */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-60 pointer-events-none transition-all duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.35) 0%, rgba(245, 158, 11, 0.25) 40%, rgba(100, 116, 139, 0.15) 70%, transparent 85%)',
          transform: 'translateZ(-60px) scale(1.3)',
        }}
      />

      {/* Orbiting 3D Slate/Orange Ring */}
      <div
        className="absolute rounded-full border border-orange-500/30 pointer-events-none"
        style={{
          width: `${size * 1.25}px`,
          height: `${size * 1.25}px`,
          transform: `rotateX(72deg) rotateY(${rotation.y * 1.2}deg) translateZ(-20px)`,
          borderStyle: 'dashed',
          boxShadow: '0 0 20px rgba(234, 88, 12, 0.25), inset 0 0 15px rgba(234, 88, 12, 0.15)',
          transition: 'transform 0.05s ease-out',
        }}
      />

      {/* Secondary Slate Orbit Ring */}
      <div
        className="absolute rounded-full border border-slate-400/30 pointer-events-none"
        style={{
          width: `${size * 1.1}px`,
          height: `${size * 1.1}px`,
          transform: `rotateX(-65deg) rotateY(${-rotation.y * 1.4}deg) translateZ(10px)`,
          boxShadow: '0 0 16px rgba(148, 163, 184, 0.2)',
          transition: 'transform 0.05s ease-out',
        }}
      />

      {/* Orbiting Live Badge Nodes */}
      <div
        className="absolute pointer-events-none text-[11px] font-mono font-bold tracking-wider text-orange-400 bg-slate-900/95 border border-orange-500/40 rounded-full px-2.5 py-1 shadow-md backdrop-blur-md"
        style={{
          transform: `rotateY(${rotation.y * 1.5}deg) translateZ(${size * 0.72}px) rotateY(${-rotation.y * 1.5}deg)`,
          transition: 'transform 0.05s ease-out',
        }}
      >
        #001·NEXT
      </div>
      <div
        className="absolute pointer-events-none text-[10px] font-mono font-bold tracking-wider text-slate-200 bg-slate-900/95 border border-slate-700/60 rounded-full px-2 py-0.5 shadow-md backdrop-blur-md"
        style={{
          transform: `rotateY(${rotation.y * 1.5 + 180}deg) translateZ(${size * 0.72}px) rotateY(${-(rotation.y * 1.5 + 180)}deg)`,
          transition: 'transform 0.05s ease-out',
        }}
      >
        ACTIVE·QUEUE
      </div>

      {/* Main 3D SkipQ Official Ticket Emblem */}
      <div
        className="relative"
        style={{
          width: `${190 * scale}px`,
          height: `${230 * scale}px`,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
          willChange: 'transform',
        }}
      >
        {/* Layer 1: Back Shadow Depth Plate */}
        <div
          className="absolute inset-0 rounded-[28px] bg-slate-950/90 border border-slate-800"
          style={{
            transform: 'translateZ(-18px)',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(234, 88, 12, 0.2)',
          }}
        />

        {/* Layer 2: Extruded Middle Core (Metallic Edge) */}
        <div
          className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-orange-500/30"
          style={{
            transform: 'translateZ(-8px)',
          }}
        />

        {/* Layer 3: Main Front Ticket Body */}
        <div
          className="absolute inset-0 rounded-[28px] overflow-hidden border border-slate-700/80 shadow-2xl flex flex-col justify-between p-5"
          style={{
            transform: 'translateZ(10px)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -2px 8px rgba(0, 0, 0, 0.8), 0 16px 36px -8px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Holographic Specular Sweep */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
            style={{
              background: 'linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.6) 48%, rgba(234, 88, 12, 0.7) 52%, transparent 70%)',
              transform: `translateX(${(rotation.y * 3) % 250 - 50}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          />

          {/* Ticket Side Notch (Left) */}
          <div
            className="absolute -left-3.5 top-1/2 -translate-y-1/2 size-7 rounded-full bg-slate-950 border border-slate-700 shadow-[inset_-3px_0_6px_rgba(0,0,0,0.8)]"
          />

          {/* Ticket Side Notch (Right) */}
          <div
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 size-7 rounded-full bg-slate-950 border border-slate-700 shadow-[inset_3px_0_6px_rgba(0,0,0,0.8)]"
          />

          {/* Ticket Header */}
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">SKIPQ OFFICIAL</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">
              3D PASS
            </span>
          </div>

          {/* Center 3D Logo Icon & Typography */}
          <div className="my-auto text-center relative z-10 py-1">
            <div className="relative mx-auto mb-2 flex items-center justify-center">
              <div
                className="size-14 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-600 to-orange-500 p-0.5 shadow-md flex items-center justify-center"
                style={{
                  transform: 'translateZ(14px)',
                }}
              >
                <div className="size-full rounded-[14px] bg-slate-950 flex items-center justify-center border border-white/10">
                  <span className="font-display text-2xl font-black tracking-tight text-white">
                    S<span className="text-orange-500">Q</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Official Wordmark */}
            <h1
              className="font-display text-2xl font-black tracking-tight leading-none text-white drop-shadow-md"
              style={{ transform: 'translateZ(16px)' }}
            >
              Skip<span className="text-orange-500">Q</span>
            </h1>

            <p className="mt-1 text-[10px] uppercase font-bold tracking-widest text-slate-400" style={{ transform: 'translateZ(12px)' }}>
              Virtual Queue Telemetry
            </p>
          </div>

          {/* Ticket Barcode & Number Footer */}
          <div className="border-t border-dashed border-slate-700/80 pt-2.5 flex items-center justify-between relative z-10">
            <div className="flex gap-0.5 items-end h-4 opacity-75">
              <span className="w-0.5 h-full bg-orange-400" />
              <span className="w-1 h-3 bg-white" />
              <span className="w-0.5 h-full bg-white" />
              <span className="w-1.5 h-2 bg-slate-400" />
              <span className="w-0.5 h-full bg-white" />
              <span className="w-1 h-3.5 bg-orange-500" />
              <span className="w-0.5 h-full bg-white" />
              <span className="w-1.5 h-2.5 bg-slate-300" />
              <span className="w-0.5 h-full bg-white" />
            </div>
            <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
              #Q-ACTIVE
            </span>
          </div>
        </div>

        {/* Floating Top Shimmer Badge */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-md pointer-events-none"
          style={{
            transform: 'translateZ(24px) translateX(-50%)',
            background: 'linear-gradient(90deg, #ea580c, #f59e0b)',
          }}
        >
          OFFICIAL 3D
        </div>
      </div>
    </div>
  )
}

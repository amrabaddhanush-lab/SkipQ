const cubes = [
  { x: '6%', y: '12%', s: 80, c: '234 88 12', d: '26s', b: '8s' },
  { x: '88%', y: '16%', s: 65, c: '100 116 139', d: '32s', b: '10s' },
  { x: '78%', y: '58%', s: 100, c: '245 158 11', d: '36s', b: '12s' },
  { x: '8%', y: '65%', s: 70, c: '71 85 105', d: '28s', b: '9s' },
  { x: '45%', y: '5%', s: 50, c: '234 88 12', d: '24s', b: '7s' },
]

export default function Background3D() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-[#f8fafc] dark:bg-[#0b1120] transition-colors duration-300"
    >
      {/* Ambient professional glows */}
      <div className="orb -left-36 -top-20 size-[32rem] bg-orange-500/[0.04] dark:bg-orange-500/[0.08]" />
      <div className="orb right-0 top-1/4 size-[34rem] bg-slate-400/[0.05] dark:bg-slate-700/[0.12]" style={{ animationDelay: '-6s' }} />
      <div className="orb bottom-10 left-1/4 size-[28rem] bg-amber-500/[0.03] dark:bg-amber-500/[0.06]" style={{ animationDelay: '-12s' }} />
      <div className="orb -bottom-20 right-1/4 size-[30rem] bg-orange-400/[0.03] dark:bg-orange-600/[0.06]" style={{ animationDelay: '-18s' }} />

      {/* Grid Floor */}
      <div className="bg-scene absolute inset-0 opacity-40 dark:opacity-25">
        <div className="floor" />

        {/* 3D Floating Geometry */}
        {cubes.map((q, i) => (
          <div
            key={i}
            className="bob"
            style={{
              left: q.x,
              top: q.y,
              animationDuration: q.b,
              animationDelay: `-${i * 2.2}s`,
              willChange: 'transform',
            }}
          >
            <div
              className="cube"
              style={{
                '--s': `${q.s}px`,
                animationDuration: q.d,
                willChange: 'transform',
              }}
            >
              <i /><i /><i /><i /><i /><i />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

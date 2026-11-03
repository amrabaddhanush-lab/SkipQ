import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, Sparkles, ShieldCheck, ChevronUp, ChevronDown, Ticket, Zap } from 'lucide-react'
import SkipQ3DLogo from './SkipQ3DLogo'

export default function ThumbnailHero({ onScrollToContent, totalServices = 26 }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-950 p-6 sm:p-10 shadow-xl text-white transition-all duration-500">
      {/* Subtle Warm Orange & Slate Ambient Glow */}
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 size-80 rounded-full bg-slate-500/10 blur-3xl pointer-events-none" />

      {/* Top Banner Bar (FPS REMOVED as requested) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-xs font-semibold text-orange-400">
            <Sparkles size={14} className="text-orange-400" />
            Official 3D Showcase
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-mono font-medium text-slate-300">
            <span className="size-2 rounded-full bg-emerald-500" />
            LIVE TELEMETRY
          </span>
        </div>

        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
        >
          {collapsed ? (
            <><span>Expand 3D Thumbnail</span> <ChevronDown size={14} /></>
          ) : (
            <><span>Collapse</span> <ChevronUp size={14} /></>
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="grid lg:grid-cols-[1.15fr_1fr] items-center gap-8 relative z-10">
          {/* Left Column: Headline & Features */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/30 px-3.5 py-1 text-xs font-bold text-orange-400">
              <ShieldCheck size={14} /> Intelligent Virtual Queue Platform
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight leading-[1.08] text-white">
              Zero Physical Lines.<br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-200 bg-clip-text text-transparent">
                Real-Time Digital Queue
              </span> Telemetry.
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
              Experience seamless queue dispatch for hospitals, banks, and citizen services.
              Watch your live counter place evolve with instant updates, direct voice booking, and digital QR tokens.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-3.5 backdrop-blur-md">
                <p className="font-display text-2xl font-extrabold text-orange-400">{totalServices}</p>
                <p className="text-xs text-slate-400 font-medium">Verified Centres</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-3.5 backdrop-blur-md">
                <p className="font-display text-2xl font-extrabold text-white">&lt;6 min</p>
                <p className="text-xs text-slate-400 font-medium">Avg Counter Wait</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-3.5 backdrop-blur-md col-span-2 sm:col-span-1">
                <p className="font-display text-2xl font-extrabold text-emerald-400">100%</p>
                <p className="text-xs text-slate-400 font-medium">Live Synchronized</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onScrollToContent}
                className="flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 px-5 py-3 text-sm font-bold text-white shadow-md active:scale-95 transition cursor-pointer"
              >
                <span>Enter Live Dashboard</span>
                <ArrowDown size={16} />
              </button>
              <Link
                to="/book"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:text-white transition"
              >
                <Ticket size={16} className="text-orange-400" />
                <span>Book Token Now</span>
              </Link>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-2 pt-1">
              <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
              Interactive 3D official logo with scroll-reactive perspective.
            </p>
          </div>

          {/* Right Column: 3D Official SkipQ Logo with Scroll-Reactive Animation */}
          <div className="flex flex-col items-center justify-center p-2 relative">
            <SkipQ3DLogo size={280} interactive={true} scrollReact={true} />

            <div className="mt-4 flex items-center gap-3 rounded-full bg-slate-950/80 border border-slate-800 px-4 py-1.5 text-xs text-slate-300 shadow-md">
              <span className="flex items-center gap-1.5 text-orange-400 font-mono font-bold">
                <Zap size={13} className="text-orange-400" />
                3D SCROLL REACTIVE
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-medium">Official Logo Emblem</span>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex items-center justify-between py-1 relative z-10">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-extrabold text-white">
              Skip<span className="text-orange-500">Q</span>
            </span>
            <span className="text-xs text-slate-400">3D Thumbnail Minimized</span>
          </div>
          <button
            onClick={() => setCollapsed(false)}
            className="text-xs font-semibold text-orange-400 hover:underline cursor-pointer"
          >
            Show 3D Logo Showcase
          </button>
        </div>
      )}
    </div>
  )
}

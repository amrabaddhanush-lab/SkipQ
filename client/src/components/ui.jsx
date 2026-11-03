import { Ticket } from 'lucide-react'

const variants = {
  primary: 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm font-semibold active:scale-95 transition cursor-pointer',
  outline: 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-orange-500 hover:text-orange-600 transition shadow-2xs cursor-pointer',
  danger: 'border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition font-semibold cursor-pointer',
  ghost: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer',
}

export const Button = ({ variant = 'primary', className = '', ...p }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    {...p}
  />
)

export const Card = ({ className = '', ...p }) => (
  <div
    className={`rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_25px_-5px_rgba(0,0,0,0.03)] text-slate-900 dark:text-slate-100 transition-all duration-300 ${
      className.includes('p-0') ? '' : 'p-5'
    } ${className}`}
    {...p}
  />
)

export const Input = ({ label, ...p }) => (
  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
    {label}
    <input
      className="mt-1.5 mb-4 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-orange-500 focus-visible:outline-2 focus-visible:outline-orange-500/20 transition shadow-2xs"
      {...p}
    />
  </label>
)

export const Logo = ({ light = false, size = 'default' }) => {
  const isSm = size === 'sm'
  return (
    <span className="inline-flex items-center gap-2.5 font-display font-black tracking-tight select-none">
      <span
        className={`grid place-items-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-xs ${
          isSm ? 'size-7' : 'size-9'
        }`}
      >
        <Ticket size={isSm ? 14 : 18} className="rotate-[-10deg]" />
      </span>
      <span className={`leading-none ${isSm ? 'text-lg' : 'text-2xl'} ${light ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
        Skip<span className="text-orange-600">Q</span>
      </span>
    </span>
  )
}

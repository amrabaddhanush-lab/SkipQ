const styles = {
  waiting: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/90 dark:border-amber-800/60 font-medium',
  serving: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 font-bold',
  done: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium',
  skipped: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/90 dark:border-rose-900/60 font-medium',
  cancelled: 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-700 line-through',
}

export default function Badge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs capitalize font-mono ${styles[status] || styles.done}`}
    >
      {status === 'serving' && <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />}
      {status}
    </span>
  )
}

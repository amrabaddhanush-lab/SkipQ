import { Star } from 'lucide-react'

export function Stars({ value = 0, size = 14 }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size}
          className={n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
      ))}
    </span>
  )
}

export function StarInput({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Your rating" className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" role="radio" aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)} className="rounded p-0.5">
          <Star size={30}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'} />
        </button>
      ))}
    </div>
  )
}
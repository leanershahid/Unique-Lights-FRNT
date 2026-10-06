import { Star } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/utils/cn'

export function Rating({ value, count, size = 14, className }: { value: number; count?: number; size?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative inline-flex" role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
        <span className="flex text-line-strong">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
          ))}
        </span>
        <span className="absolute inset-0 flex overflow-hidden text-brass" style={{ width: `${pct}%` }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={size} fill="currentColor" strokeWidth={0} className="shrink-0" />
          ))}
        </span>
      </span>
      {count !== undefined && <span className="text-[0.78rem] text-subtle tabular">({count})</span>}
    </span>
  )
}

/** Interactive 1–5 star picker. */
export function RatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']
  return (
    <div className="flex items-center gap-3">
      <div className="flex" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            whileTap={{ scale: 0.8 }}
            animate={{ scale: shown >= n ? 1.08 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className={cn('p-1 transition-colors', shown >= n ? 'text-brass' : 'text-line-strong')}
          >
            <Star size={26} fill="currentColor" strokeWidth={0} />
          </motion.button>
        ))}
      </div>
      <span className="text-[0.88rem] text-muted">{labels[shown]}</span>
    </div>
  )
}

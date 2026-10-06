import { Minus, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/utils/cn'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  disabled?: boolean
  label?: string
}

export function QuantitySelector({ value, onChange, min = 1, max = 99, size = 'md', disabled, label = 'Quantity' }: QuantitySelectorProps) {
  const [direction, setDirection] = useState(1)
  const set = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next))
    if (clamped === value) return
    setDirection(clamped > value ? 1 : -1)
    onChange(clamped)
  }
  const btn = cn(
    'flex items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-2 hover:text-brass disabled:opacity-30 disabled:hover:bg-transparent',
    size === 'md' ? 'size-10' : 'size-8',
  )
  return (
    <div
      className={cn('inline-flex items-center rounded-full border border-line', disabled && 'opacity-50')}
      role="group"
      aria-label={label}
    >
      <motion.button type="button" whileTap={{ scale: 0.85 }} className={btn} onClick={() => set(value - 1)} disabled={disabled || value <= min} aria-label="Decrease quantity">
        <Minus size={size === 'md' ? 16 : 14} />
      </motion.button>
      <span className={cn('relative flex justify-center overflow-hidden font-mono tabular', size === 'md' ? 'w-9 text-[0.95rem]' : 'w-7 text-[0.85rem]')} aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.span
            key={value}
            custom={direction}
            initial={{ y: direction * 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction * -14, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <motion.button type="button" whileTap={{ scale: 0.85 }} className={btn} onClick={() => set(value + 1)} disabled={disabled || value >= max} aria-label="Increase quantity">
        <Plus size={size === 'md' ? 16 : 14} />
      </motion.button>
    </div>
  )
}

import { motion } from 'motion/react'
import { useId, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  description?: ReactNode
  count?: number
  disabled?: boolean
  id?: string
}

/** Checkbox with an animated tick. */
export function Checkbox({ checked, onChange, label, description, count, disabled, id }: CheckboxProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <label htmlFor={inputId} className={cn('group flex cursor-pointer items-start gap-3 py-1.5', disabled && 'cursor-not-allowed opacity-50')}>
      <input id={inputId} type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brass',
          checked ? 'border-brass bg-brass text-on-brass' : 'border-line-strong group-hover:border-brass',
        )}
      >
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
          <motion.path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </svg>
      </span>
      <span className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
        <span className="min-w-0">
          <span className="block text-[0.92rem] text-ink">{label}</span>
          {description && <span className="block text-[0.8rem] text-subtle">{description}</span>}
        </span>
        {count !== undefined && <span className="font-mono text-[0.72rem] text-subtle tabular">{count}</span>}
      </span>
    </label>
  )
}

interface RadioCardProps {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  title: ReactNode
  description?: ReactNode
  aside?: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

/** Large selectable card used for delivery, payment and address choices. */
export function RadioCard({ name, value, checked, onChange, title, description, aside, icon, disabled }: RadioCardProps) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className={cn(
        'relative flex cursor-pointer items-start gap-4 rounded-[var(--radius-card)] border p-4 transition-[border-color,background-color,box-shadow] duration-200',
        checked ? 'border-brass bg-brass/8 shadow-[0_0_0_1px_var(--ul-brass)]' : 'border-line hover:border-line-strong',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <input id={id} type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={() => onChange(value)} className="peer sr-only" />
      <span
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brass',
          checked ? 'border-brass' : 'border-line-strong',
        )}
      >
        <motion.span
          className="size-2.5 rounded-full bg-brass"
          initial={false}
          animate={{ scale: checked ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        />
      </span>
      {icon && <span className="text-brass">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-[0.85rem] text-muted">{description}</span>}
      </span>
      {aside && <span className="shrink-0 text-right text-[0.9rem]">{aside}</span>}
    </label>
  )
}

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

export function Switch({ checked, onChange, label, description }: SwitchProps) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 py-1">
      <span>
        <span className="block text-[0.92rem] text-ink">{label}</span>
        {description && <span className="block text-[0.8rem] text-subtle">{description}</span>}
      </span>
      <input id={id} type="checkbox" role="switch" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        className={cn(
          'flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brass',
          checked ? 'justify-end bg-brass' : 'justify-start bg-line-strong',
        )}
      >
        <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 32 }} className="size-5 rounded-full bg-surface shadow" />
      </span>
    </label>
  )
}

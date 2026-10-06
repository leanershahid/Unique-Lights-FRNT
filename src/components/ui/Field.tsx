import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

const control =
  'w-full rounded-xl border border-line bg-surface px-4 text-[0.95rem] text-ink placeholder:text-subtle transition-[border-color,box-shadow,background-color] duration-200 outline-none hover:border-line-strong focus:border-brass focus:shadow-[0_0_0_4px_var(--ul-glow)] disabled:opacity-60 aria-[invalid=true]:border-danger'

interface FieldShellProps {
  id: string
  label?: string
  hint?: string
  error?: string
  optional?: boolean
  children: ReactNode
  className?: string
}

export function FieldShell({ id, label, hint, error, optional, children, className }: FieldShellProps) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="flex items-baseline justify-between text-[0.82rem] font-medium text-muted">
          <span>{label}</span>
          {optional && <span className="text-[0.72rem] text-subtle">Optional</span>}
        </label>
      )}
      {children}
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="text-[0.8rem] text-danger"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p key="hint" id={`${id}-hint`} initial={false} className="text-[0.8rem] text-subtle">
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  optional?: boolean
  leading?: ReactNode
  trailing?: ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, optional, leading, trailing, id, className, containerClassName, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} optional={optional} className={containerClassName}>
      <div className="relative">
        {leading && <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-subtle">{leading}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(control, 'h-12', leading && 'pl-11', trailing && 'pr-12', className)}
          {...rest}
        />
        {trailing && <span className="absolute inset-y-0 right-2 flex items-center">{trailing}</span>}
      </div>
    </FieldShell>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  optional?: boolean
  containerClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, optional, id, className, containerClassName, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} optional={optional} className={containerClassName}>
      <textarea
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(control, 'min-h-28 py-3 leading-relaxed', className)}
        {...rest}
      />
    </FieldShell>
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, hint, error, id, className, children, ...rest }, ref) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(control, 'h-12 cursor-pointer appearance-none pr-10', className)}
          {...rest}
        >
          {children}
        </select>
        <svg className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-subtle" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m5 8 5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </FieldShell>
  )
})

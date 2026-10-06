import { Check, Copy } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

/** Copies text; falls back to selecting it when the clipboard is unavailable. */
export function CopyButton({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.body.removeChild(el)
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : label}
      className={cn('relative inline-flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-brass', className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={copied ? 'y' : 'n'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
          {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

/** Hover/focus tooltip. */
export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[0.75rem] font-medium text-bg shadow-lg"
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

export function SectionHeading({ eyebrow, title, description, action, className }: { eyebrow?: string; title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-[clamp(1.9rem,4vw,3rem)]">{title}</h2>
        {description && <p className="mt-3 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-[var(--radius-card)] border border-line bg-surface', className)}>{children}</div>
}

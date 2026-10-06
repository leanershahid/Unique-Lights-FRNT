import { Check, X } from 'lucide-react'
import { motion } from 'motion/react'
import type { OrderTimelineEntryDto } from '@/types/api'
import { cn } from '@/utils/cn'
import { formatDateTime, orderStatusLabel } from '@/utils/format'

/**
 * Vertical tracking timeline. Completed steps fill in sequence; the current step pulses.
 * Re-animates when the status changes because entries are keyed by status + completion.
 */
export function OrderTimeline({ timeline }: { timeline: OrderTimelineEntryDto[] }) {
  const lastDone = timeline.reduce((acc, t, i) => (t.completed ? i : acc), -1)
  return (
    <ol className="relative grid gap-0" aria-label="Order progress">
      {timeline.map((entry, i) => {
        const done = entry.completed
        const current = i === lastDone + 1 && entry.status !== 'Cancelled'
        const cancelled = entry.status === 'Cancelled'
        const isLast = i === timeline.length - 1
        return (
          <li key={`${entry.status}-${done}`} className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span className="absolute left-[1.06rem] top-9 bottom-0 w-0.5 bg-line" aria-hidden="true">
                <motion.span
                  className="block w-full origin-top bg-brass"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: i < lastDone ? 1 : 0 }}
                  transition={{ duration: 0.45, delay: 0.2 + i * 0.25, ease: 'easeOut' }}
                  style={{ height: '100%' }}
                />
              </span>
            )}
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: i * 0.25 }}
              className={cn(
                'relative z-10 flex size-9 items-center justify-center rounded-full border-2',
                done && !cancelled && 'border-brass bg-brass text-on-brass',
                done && cancelled && 'border-danger bg-danger text-bg',
                !done && current && 'border-brass bg-bg',
                !done && !current && 'border-line-strong bg-bg',
              )}
            >
              {done ? cancelled ? <X size={16} strokeWidth={3} /> : <Check size={16} strokeWidth={3} /> : current ? <span className="size-2.5 animate-pulse rounded-full bg-brass shadow-[0_0_10px_var(--ul-brass)]" /> : null}
            </motion.span>
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.25 }} className="pt-1.5">
              <p className={cn('font-semibold', done || current ? 'text-ink' : 'text-subtle', cancelled && 'text-danger')}>{orderStatusLabel[entry.status]}</p>
              <p className="text-[0.82rem] text-subtle">{entry.at ? formatDateTime(entry.at) : current ? 'In progress' : 'Pending'}</p>
            </motion.div>
          </li>
        )
      })}
    </ol>
  )
}

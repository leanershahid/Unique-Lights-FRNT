import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toastDismissed, type Toast } from '@/store/slices/toastSlice'
import { cn } from '@/utils/cn'

const DURATION: Record<Toast['kind'], number> = { success: 3800, info: 3400, error: 6000 }

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch()
  const dismiss = () => dispatch(toastDismissed(toast.id))

  useEffect(() => {
    const id = window.setTimeout(dismiss, DURATION[toast.kind])
    return () => window.clearTimeout(id)
  }, [toast.id])

  const Icon = toast.kind === 'success' ? CheckCircle2 : toast.kind === 'error' ? XCircle : Info
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.8 }}
      onDragEnd={(_, info) => info.offset.x > 80 && dismiss()}
      role={toast.kind === 'error' ? 'alert' : 'status'}
      className="glass pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-line p-3 pr-2 shadow-[0_18px_50px_-20px_rgb(0_0_0/0.6)]"
    >
      {toast.imageUrl ? (
        <img src={toast.imageUrl} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
      ) : (
        <Icon
          size={20}
          className={cn('mt-0.5 shrink-0', toast.kind === 'success' && 'text-success', toast.kind === 'error' && 'text-danger', toast.kind === 'info' && 'text-brass')}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[0.9rem] font-semibold text-ink">{toast.title}</p>
        {toast.description && <p className="mt-0.5 line-clamp-2 text-[0.82rem] text-muted">{toast.description}</p>}
        {toast.action && (
          <Link to={toast.action.to} onClick={dismiss} className="mt-1 inline-block text-[0.82rem] font-semibold text-brass hover:underline">
            {toast.action.label}
          </Link>
        )}
      </div>
      <button type="button" onClick={dismiss} aria-label="Dismiss notification" className="rounded-full p-1.5 text-subtle transition-colors hover:bg-surface-2 hover:text-ink">
        <X size={16} />
      </button>
    </motion.li>
  )
}

export function Toaster() {
  const toasts = useAppSelector((s) => s.toasts.items)
  return (
    <ol
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[90] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px]"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </ol>
  )
}

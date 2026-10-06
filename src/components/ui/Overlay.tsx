import { X } from 'lucide-react'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { backdrop, bottomSheet, drawer, modal } from '@/animations/variants'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { cn } from '@/utils/cn'
import { IconButton } from './Button'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Escape to close, focus moves in on open and back on close, Tab stays inside. */
function useDialogBehaviour(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })
  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const t = window.setTimeout(() => {
      const panel = panelRef.current
      const target = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel?.querySelector<HTMLElement>(FOCUSABLE)
      ;(target ?? panel)?.focus()
    }, 40)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
      }
      if (e.key === 'Tab' && panelRef.current) {
        const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null)
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (!first || !last) return
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [open])

  return panelRef
}

interface BaseProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-overlay backdrop-blur-[3px]"
      onClick={onClick}
      aria-hidden="true"
    />
  )
}

function Header({ title, description, onClose, titleId }: { title?: ReactNode; description?: ReactNode; onClose: () => void; titleId: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
      <div className="min-w-0">
        {title && (
          <h2 id={titleId} className="text-[1.35rem]">
            {title}
          </h2>
        )}
        {description && <p className="mt-0.5 text-[0.88rem] text-muted">{description}</p>}
      </div>
      <IconButton label="Close" size="sm" onClick={onClose} className="-mr-2 shrink-0">
        <X size={18} />
      </IconButton>
    </div>
  )
}

export function Modal({ open, onClose, title, description, children, footer, className, size = 'md' }: BaseProps & { size?: 'sm' | 'md' | 'lg' }) {
  const panelRef = useDialogBehaviour(open, onClose)
  const titleId = useId()
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <Backdrop onClick={onClose} />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl outline-none sm:rounded-3xl',
              size === 'sm' && 'sm:max-w-md',
              size === 'md' && 'sm:max-w-xl',
              size === 'lg' && 'sm:max-w-3xl',
              className,
            )}
          >
            <Header title={title} description={description} onClose={onClose} titleId={titleId} />
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function Drawer({ open, onClose, title, description, children, footer, className, side = 'right' }: BaseProps & { side?: 'left' | 'right' }) {
  const panelRef = useDialogBehaviour(open, onClose)
  const titleId = useId()
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <Backdrop onClick={onClose} />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            variants={drawer(side)}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'absolute inset-y-0 flex w-full max-w-[440px] flex-col bg-surface pt-[env(safe-area-inset-top)] shadow-2xl outline-none',
              side === 'right' ? 'right-0 border-l border-line' : 'left-0 border-r border-line',
              className,
            )}
          >
            {title !== undefined && <Header title={title} description={description} onClose={onClose} titleId={titleId} />}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/** Mobile sheet that slides up; drag the handle down to dismiss. */
export function BottomSheet({ open, onClose, title, description, children, footer, className }: BaseProps) {
  const panelRef = useDialogBehaviour(open, onClose)
  const titleId = useId()
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose()
  }
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <Backdrop onClick={onClose} />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            variants={bottomSheet}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
            className={cn('absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl border-t border-line bg-surface shadow-2xl outline-none', className)}
          >
            <div className="flex justify-center pt-3" aria-hidden="true">
              <span className="h-1.5 w-12 rounded-full bg-line-strong" />
            </div>
            <Header title={title} description={description} onClose={onClose} titleId={titleId} />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
            {footer && <div className="border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

interface ConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: ReactNode
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
}

/** In-page confirmation (no window.confirm). */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger, loading }: ConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <ButtonLike onClick={onClose}>Keep it</ButtonLike>
          <ButtonLike onClick={onConfirm} danger={danger} primary loading={loading}>
            {confirmLabel}
          </ButtonLike>
        </>
      }
    >
      <div className="text-muted">{message}</div>
    </Modal>
  )
}

function ButtonLike({ children, onClick, danger, primary, loading }: { children: ReactNode; onClick: () => void; danger?: boolean; primary?: boolean; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        'h-11 rounded-full px-5 text-[0.9rem] font-semibold transition-colors disabled:opacity-60',
        primary ? (danger ? 'bg-danger text-bg hover:opacity-90' : 'bg-ink text-bg hover:bg-brass') : 'border border-line-strong hover:border-brass',
      )}
    >
      {loading ? 'Working…' : children}
    </button>
  )
}

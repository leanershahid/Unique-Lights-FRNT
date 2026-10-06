import { AlertTriangle } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { getErrorMessage } from '@/api/axios'
import { scaleIn } from '@/animations/variants'
import { cn } from '@/utils/cn'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className={cn('mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center', className)}
    >
      {icon && (
        <div className="relative mb-6 flex size-20 items-center justify-center rounded-full bg-surface-2 text-brass">
          <span className="absolute inset-0 rounded-full bg-brass/10 blur-xl" aria-hidden="true" />
          <span className="relative">{icon}</span>
        </div>
      )}
      <h2 className="text-[1.6rem]">{title}</h2>
      {description && <p className="mt-2 text-muted">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </motion.div>
  )
}

export function ErrorState({ error, onRetry, title = 'We could not load this', className }: { error: unknown; onRetry?: () => void; title?: string; className?: string }) {
  return (
    <div role="alert" className={cn('mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center', className)}>
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-danger/12 text-danger">
        <AlertTriangle size={28} />
      </div>
      <h2 className="text-[1.4rem]">{title}</h2>
      <p className="mt-2 text-muted">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

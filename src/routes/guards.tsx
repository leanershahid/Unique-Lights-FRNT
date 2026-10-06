import { ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LinkButton } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/States'
import { selectIsAdmin, useAppSelector } from '@/store/hooks'

function SessionCheck() {
  return (
    <div className="container-page grid gap-4 py-16" role="status" aria-label="Checking your session">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96 max-w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

/**
 * Client-side route protection for UX only. The API enforces authentication and roles on every request.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAppSelector((s) => s.auth.status)
  const location = useLocation()
  if (status === 'checking') return <SessionCheck />
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return children
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const status = useAppSelector((s) => s.auth.status)
  const isAdmin = useAppSelector(selectIsAdmin)
  const location = useLocation()
  if (status === 'checking') return <SessionCheck />
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!isAdmin)
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <EmptyState
          icon={<ShieldAlert size={30} />}
          title="Admins only"
          description="Your account does not have access to the admin dashboard."
          action={<LinkButton to="/">Back to the store</LinkButton>}
        />
      </div>
    )
  return children
}

/** Sends signed-in users away from the sign-in and register pages. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const status = useAppSelector((s) => s.auth.status)
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/account'
  if (status === 'authenticated') return <Navigate to={from} replace />
  return children
}

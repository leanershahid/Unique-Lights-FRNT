import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { ApiError, refreshSession } from '@/api/axios'
import { Toaster } from '@/components/ui/Toaster'
import { router } from '@/routes/router'
import { store } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loggedOut } from '@/store/slices/authSlice'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      // Retry only transient failures (network / 5xx), never 4xx.
      retry: (count, error) => count < 2 && (!(error instanceof ApiError) || error.status === 0 || error.status >= 500),
    },
    mutations: { retry: false },
  },
  mutationCache: new MutationCache(),
})

/** Restores the session from the refresh cookie once, and keeps <html data-theme> in sync. */
function AppEffects() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((s) => s.preferences.theme)

  useEffect(() => {
    refreshSession().catch(() => dispatch(loggedOut()))
  }, [dispatch])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#120f13' : '#f7f2ea')
  }, [theme])

  return null
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <AppEffects />
          <RouterProvider router={router} />
          <Toaster />
        </MotionConfig>
      </QueryClientProvider>
    </Provider>
  )
}

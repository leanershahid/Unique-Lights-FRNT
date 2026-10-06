import { useLocation } from 'react-router-dom'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { SearchOverlay } from '@/components/search/SearchOverlay'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedOutlet } from '@/routes/AnimatedOutlet'

function PageFallback() {
  return (
    <div className="container-page grid gap-6 py-10" role="status" aria-label="Loading page">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-5 w-1/2" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-[4/5]" />
        ))}
      </div>
    </div>
  )
}

export function StoreLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-[100] rounded-full bg-brass px-4 py-2 text-on-brass focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Header overlay={isHome} />
      <main id="main" className={isHome ? 'flex-1' : 'flex-1 pt-[calc(4rem+env(safe-area-inset-top))]'}>
        <AnimatedOutlet fallback={<PageFallback />} />
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <MobileNav />
    </div>
  )
}

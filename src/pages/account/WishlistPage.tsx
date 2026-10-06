import { Heart } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { ProductCard } from '@/components/product/ProductCard'
import { LinkButton } from '@/components/ui/Button'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useWishlist } from '@/features/wishlist/hooks'

export default function WishlistPage() {
  const { data, isPending, isError, error, refetch } = useWishlist()
  useEffect(() => {
    document.title = 'Wishlist · Unique Lights'
  }, [])

  if (isPending) return <ProductGridSkeleton count={3} />
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (!data.items.length)
    return (
      <EmptyState
        icon={<Heart size={30} />}
        title="Your wishlist is empty"
        description="Tap the heart on any light to save it here for later."
        action={
          <LinkButton to="/products" variant="accent">
            Find something you love
          </LinkButton>
        }
      />
    )

  return (
    <div>
      <h2 className="mb-6 text-[1.5rem]">
        Saved lights <span className="font-mono text-[0.85rem] text-subtle">({data.items.length})</span>
      </h2>
      <motion.ul layout className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3">
        <AnimatePresence initial={false}>
          {data.items.map((item, i) => (
            <motion.li key={item.productId} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }} exit={{ opacity: 0, scale: 0.9 }}>
              <ProductCard product={item.product} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  )
}

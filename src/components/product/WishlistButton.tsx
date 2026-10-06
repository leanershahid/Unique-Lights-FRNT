import { Heart } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useIsWishlisted, useToggleWishlist } from '@/features/wishlist/hooks'
import { cn } from '@/utils/cn'

interface WishlistButtonProps {
  productId: string
  productName: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  withLabel?: boolean
}

const BURST = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2)

/** ♡ → ♥ with a scale pop and a small burst of light. */
export function WishlistButton({ productId, productName, className, size = 'md', withLabel }: WishlistButtonProps) {
  const saved = useIsWishlisted(productId)
  const { toggle, isPending } = useToggleWishlist()
  const iconSize = size === 'lg' ? 22 : size === 'md' ? 18 : 16

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(productId, productName, saved)
      }}
      disabled={isPending}
      whileTap={{ scale: 0.85 }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-full transition-colors duration-200',
        withLabel ? 'h-12 border border-line-strong px-5 font-semibold hover:border-brass' : size === 'sm' ? 'size-9' : size === 'md' ? 'size-10' : 'size-12',
        !withLabel && 'glass text-ink hover:text-brass',
        saved && 'text-brass',
        className,
      )}
    >
      <span className="relative inline-flex">
        <AnimatePresence initial={false}>
          {saved &&
            BURST.map((angle) => (
              <motion.span
                key={angle}
                className="absolute left-1/2 top-1/2 size-1 rounded-full bg-brass"
                initial={{ x: '-50%', y: '-50%', opacity: 1, scale: 1 }}
                animate={{ x: `calc(-50% + ${Math.cos(angle) * 16}px)`, y: `calc(-50% + ${Math.sin(angle) * 16}px)`, opacity: 0, scale: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            ))}
        </AnimatePresence>
        <motion.span key={saved ? 'on' : 'off'} initial={{ scale: saved ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 520, damping: 12 }}>
          <Heart size={iconSize} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.8} />
        </motion.span>
      </span>
      {withLabel && <span>{saved ? 'Saved' : 'Save'}</span>}
    </motion.button>
  )
}

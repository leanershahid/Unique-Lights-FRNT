import { useQueryClient } from '@tanstack/react-query'
import { Check, Plus, ShoppingBag } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { productApi } from '@/api/productApi'
import { queryKeys } from '@/api/queryKeys'
import { flyToCart } from '@/animations/flyToCart'
import { Badge } from '@/components/ui/Badge'
import { Price } from '@/components/ui/Price'
import { Rating } from '@/components/ui/Rating'
import { useAddToCart } from '@/features/cart/hooks'
import { useToast } from '@/hooks/useToast'
import type { ProductListItemDto } from '@/types/api'
import { cn } from '@/utils/cn'
import { WishlistButton } from './WishlistButton'

interface ProductCardProps {
  product: ProductListItemDto
  priority?: boolean
  className?: string
}

/**
 * Hover (pointer devices): image zooms, the second image fades in, Quick add slides up, details lift.
 * Touch devices: quick add and wishlist are always visible; nothing depends on hover.
 */
export function ProductCard({ product, priority, className }: ProductCardProps) {
  const qc = useQueryClient()
  const addToCart = useAddToCart()
  const toast = useToast()
  const imgRef = useRef<HTMLImageElement>(null)
  const [added, setAdded] = useState(false)
  const [busy, setBusy] = useState(false)
  const href = `/products/${product.slug}`

  const prefetch = () => {
    void qc.prefetchQuery({ queryKey: queryKeys.products.detail(product.slug), queryFn: () => productApi.bySlug(product.slug), staleTime: 60_000 })
  }

  const quickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      const detail = await qc.fetchQuery({ queryKey: queryKeys.products.detail(product.slug), queryFn: () => productApi.bySlug(product.slug), staleTime: 60_000 })
      const variant = detail.variants.find((v) => v.id === product.defaultVariantId && v.inStock) ?? detail.variants.find((v) => v.inStock)
      if (!variant) {
        toast.info({ title: 'Out of stock', description: `${product.name} is not available right now.` })
        return
      }
      await addToCart.mutateAsync({
        product: { id: product.id, name: product.name, slug: product.slug, imageUrl: product.primaryImage?.url ?? null },
        variant: { id: variant.id, name: variant.name, sku: variant.sku, price: variant.price, compareAtPrice: variant.compareAtPrice, stock: variant.stock },
        quantity: 1,
        openDrawer: false,
      })
      flyToCart(imgRef.current)
      setAdded(true)
      window.setTimeout(() => setAdded(false), 1800)
    } catch {
      // useAddToCart already shows the error toast.
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.article className={cn('group relative', className)} onPointerEnter={prefetch} onFocus={prefetch}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-media)] bg-surface-2">
        <Link to={href} className="absolute inset-0 block rounded-[var(--radius-media)] outline-offset-4" aria-label={product.name}>
          {product.primaryImage ? (
            <img
              ref={imgRef}
              src={product.primaryImage.url}
              alt={product.primaryImage.altText ?? product.name}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-subtle">No image</div>
          )}
          {product.secondaryImage && (
            <img
              src={product.secondaryImage.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full scale-[1.06] object-cover opacity-0 transition-[opacity,transform] duration-700 ease-[var(--ease-out-soft)] [@media(hover:hover)]:group-hover:scale-100 [@media(hover:hover)]:group-hover:opacity-100"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.discountPercent ? <Badge tone="solid">−{product.discountPercent}%</Badge> : null}
          {product.isNew && <Badge className="glass text-ink">New</Badge>}
          {!product.inStock && <Badge className="glass text-muted">Sold out</Badge>}
        </div>

        <div className="absolute right-3 top-3 transition-[opacity,transform] duration-300 [@media(hover:hover)]:translate-y-[-4px] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
          <WishlistButton productId={product.id} productName={product.name} size="sm" />
        </div>

        {product.inStock && (
        <div className="absolute inset-x-3 bottom-3 hidden justify-center [@media(hover:hover)]:flex">
          <motion.button
            type="button"
            onClick={quickAdd}
            whileTap={{ scale: 0.96 }}
            className={cn(
              'glass flex h-11 w-full translate-y-3 items-center justify-center gap-2 rounded-full text-[0.85rem] font-semibold opacity-0 transition-[opacity,transform,background-color,color] duration-300 ease-[var(--ease-out-soft)] group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100',
              added ? 'bg-success text-bg' : 'text-ink hover:bg-brass hover:text-on-brass',
            )}
            aria-label={`Quick add ${product.name} to cart`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={added ? 'done' : busy ? 'busy' : 'idle'} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.15 }} className="flex items-center gap-2">
                {added ? <Check size={16} /> : <ShoppingBag size={16} />}
                {added ? 'Added' : busy ? 'Adding…' : 'Quick add'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
        )}
      </div>

      <div className="mt-3.5 transition-transform duration-300 ease-[var(--ease-out-soft)] [@media(hover:hover)]:group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.68rem] font-medium uppercase tracking-[0.1em] text-subtle sm:text-[0.72rem] sm:tracking-[0.12em]">{product.brand ?? product.categoryName}</p>
            <Link to={href} className="mt-1 line-clamp-2 font-display text-[1rem] leading-snug text-ink transition-colors hover:text-brass sm:text-[1.12rem]">
              {product.name}
            </Link>
          </div>
          {product.inStock && (
            <motion.button
              type="button"
              onClick={quickAdd}
              whileTap={{ scale: 0.88 }}
              aria-label={`Add ${product.name} to cart`}
              className={cn('-mr-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-line transition-colors [@media(hover:hover)]:hidden', added && 'border-success bg-success text-bg')}
            >
              {added ? <Check size={16} /> : <Plus size={16} />}
            </motion.button>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
          {product.reviewCount > 0 && <Rating value={product.averageRating} count={product.reviewCount} size={12} />}
        </div>
      </div>
    </motion.article>
  )
}

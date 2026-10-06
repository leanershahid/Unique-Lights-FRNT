import { Check, PackageCheck, RotateCcw, SearchX, ShieldCheck, ShoppingBag, Truck, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { inViewProps } from '@/animations/animations'
import { flyToCart } from '@/animations/flyToCart'
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants'
import { ProductCard } from '@/components/product/ProductCard'
import { GallerySkeleton, ProductGallery } from '@/components/product/ProductGallery'
import { ReviewsSection } from '@/components/product/ReviewsSection'
import { WishlistButton } from '@/components/product/WishlistButton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Price } from '@/components/ui/Price'
import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { Rating } from '@/components/ui/Rating'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { ApiError } from '@/api/axios'
import { useAddToCart } from '@/features/cart/hooks'
import { useProduct, useRelatedProducts } from '@/features/products/hooks'
import type { ProductDetailDto, ProductVariantDto } from '@/types/api'
import { cn } from '@/utils/cn'
import { formatDate, formatPrice } from '@/utils/format'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function StockIndicator({ variant }: { variant: ProductVariantDto | undefined }) {
  if (!variant) return null
  const tone = !variant.inStock ? 'bg-danger' : variant.stock <= 5 ? 'bg-warning' : 'bg-success'
  const text = !variant.inStock ? 'Out of stock' : variant.stock <= 5 ? `Only ${variant.stock} left in stock` : 'In stock, ready to ship'
  return (
    <motion.p key={variant.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-[0.88rem] text-muted">
      <span className="relative flex size-2.5">
        {variant.inStock && <span className={cn('absolute inset-0 animate-ping rounded-full opacity-60', tone)} />}
        <span className={cn('relative size-2.5 rounded-full', tone)} />
      </span>
      {text}
    </motion.p>
  )
}

function VariantPicker({ product, selected, onSelect }: { product: ProductDetailDto; selected: ProductVariantDto | undefined; onSelect: (v: ProductVariantDto) => void }) {
  if (product.variants.length <= 1) return null
  const label = product.variants.some((v) => v.finish) ? 'Finish' : product.variants.some((v) => v.colorTemperature) ? 'Colour temperature' : 'Option'
  return (
    <fieldset>
      <legend className="mb-3 text-[0.85rem] text-muted">
        {label}: <span className="font-semibold text-ink">{selected?.name}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {product.variants.map((v) => {
          const active = v.id === selected?.id
          return (
            <motion.button
              key={v.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(v)}
              aria-pressed={active}
              className={cn(
                'relative rounded-full border px-4 py-2.5 text-[0.88rem] transition-colors',
                active ? 'border-transparent text-on-brass' : 'border-line text-ink hover:border-line-strong',
                !v.inStock && 'text-subtle line-through decoration-1',
              )}
            >
              {active && <motion.span layoutId="variant-pill" className="absolute inset-0 rounded-full bg-brass" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
              <span className="relative">{v.name}</span>
            </motion.button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: product, isPending, isError, error, refetch } = useProduct(slug)
  const related = useRelatedProducts(slug)
  const addToCart = useAddToCart()
  const [variantId, setVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [tab, setTab] = useState<'details' | 'specs' | 'delivery'>('details')
  const imageRef = useRef<HTMLImageElement>(null)
  const buyRef = useRef<HTMLDivElement>(null)
  const [showSticky, setShowSticky] = useState(false)

  const variant = useMemo(() => {
    if (!product) return undefined
    return product.variants.find((v) => v.id === variantId) ?? product.variants.find((v) => v.isDefault) ?? product.variants[0]
  }, [product, variantId])

  useEffect(() => {
    setVariantId(null)
    setQuantity(1)
  }, [slug])

  useEffect(() => {
    if (product) document.title = `${product.name} · Unique Lights`
  }, [product])

  // Mobile: show the sticky buy bar once the main buttons scroll out of view.
  useEffect(() => {
    const el = buyRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShowSticky(!(e?.isIntersecting ?? true) && (e?.boundingClientRect.top ?? 0) < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [product])

  if (isPending) {
    return (
      <div className="container-page grid grid-cols-1 gap-10 py-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <GallerySkeleton />
        <div className="grid content-start gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <EmptyState
          className="py-28"
          icon={<SearchX size={30} />}
          title="This light is no longer available"
          description="It may have been discontinued. Here is everything we have in stock."
          action={
            <Link to="/products" className="font-semibold text-brass">
              Browse all lighting
            </Link>
          }
        />
      )
    }
    return <ErrorState error={error} onRetry={() => void refetch()} className="py-28" />
  }

  const maxQty = Math.max(1, Math.min(99, variant?.stock ?? 1))
  const discount = variant?.compareAtPrice && variant.compareAtPrice > variant.price ? Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100) : null

  const add = async (thenCheckout = false) => {
    if (!variant) return
    try {
      await addToCart.mutateAsync({
        product: { id: product.id, name: product.name, slug: product.slug, imageUrl: product.primaryImage?.url ?? product.images[0]?.url ?? null },
        variant: { id: variant.id, name: variant.name, sku: variant.sku, price: variant.price, compareAtPrice: variant.compareAtPrice, stock: variant.stock },
        quantity,
        openDrawer: false,
        silent: thenCheckout,
      })
      if (thenCheckout) {
        navigate('/checkout')
        return
      }
      flyToCart(imageRef.current)
      setAdded(true)
      window.setTimeout(() => setAdded(false), 2000)
    } catch {
      // Error toast is shown by the mutation.
    }
  }

  const addButton = (
    <Button variant="primary" size="lg" fullWidth onClick={() => void add()} disabled={!variant?.inStock} loading={addToCart.isPending && !added} className={cn(added && '!bg-success !text-bg')}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={added ? 'added' : 'add'} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.18 }} className="flex items-center gap-2">
          {added ? <Check size={18} /> : <ShoppingBag size={18} />}
          {!variant?.inStock ? 'Out of stock' : added ? 'Added to cart' : 'Add to cart'}
        </motion.span>
      </AnimatePresence>
    </Button>
  )

  const specs = Object.entries(product.specifications)

  return (
    <div className="pb-24 lg:pb-0">
      <div className="container-page py-6 lg:py-10">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-2 text-[0.8rem] text-subtle">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <Link to={`/categories/${product.category.slug}`} className="hover:text-ink">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-muted">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          <ProductGallery images={product.images} productName={product.name} imageRef={imageRef} />

          <div className="lg:sticky lg:top-24 lg:self-start">
            <motion.div variants={staggerContainer(0.06, 0.05)} initial="hidden" animate="visible" className="grid gap-5">
              <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-2">
                <span className="text-[0.75rem] font-medium uppercase tracking-[0.14em] text-subtle">{product.brand ?? product.category.name}</span>
                {product.isNew && <Badge tone="brass">New</Badge>}
                {discount && <Badge tone="solid">−{discount}%</Badge>}
              </motion.div>
              <motion.h1 variants={staggerItem} className="text-[clamp(2rem,4vw,3.1rem)] leading-[1.05]">
                {product.name}
              </motion.h1>
              {product.reviewCount > 0 && (
                <motion.a variants={staggerItem} href="#reviews" className="w-fit">
                  <Rating value={product.averageRating} count={product.reviewCount} size={15} />
                </motion.a>
              )}
              <motion.div variants={staggerItem}>
                <Price price={variant?.price ?? product.price} compareAtPrice={variant?.compareAtPrice ?? product.compareAtPrice} size="lg" showSaving />
                <p className="mt-1.5 text-[0.8rem] text-subtle">Plus GST, added at checkout. Free delivery over {formatPrice(2000)}.</p>
              </motion.div>
              {product.shortDescription && (
                <motion.p variants={staggerItem} className="text-muted">
                  {product.shortDescription}
                </motion.p>
              )}
              <motion.div variants={staggerItem}>
                <VariantPicker
                  product={product}
                  selected={variant}
                  onSelect={(v) => {
                    setVariantId(v.id)
                    setQuantity((q) => Math.min(q, Math.max(1, v.stock)))
                  }}
                />
              </motion.div>
              <motion.div variants={staggerItem}>
                <StockIndicator variant={variant} />
              </motion.div>

              <motion.div variants={staggerItem} ref={buyRef} className="grid gap-3">
                <div className="flex items-center gap-3">
                  <QuantitySelector value={quantity} onChange={setQuantity} max={maxQty} disabled={!variant?.inStock} />
                  <div className="min-w-0 flex-1">{addButton}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="accent" size="lg" className="min-w-0 flex-1" disabled={!variant?.inStock} onClick={() => void add(true)}>
                    <Zap size={17} /> Buy now
                  </Button>
                  <WishlistButton productId={product.id} productName={product.name} size="lg" className="shrink-0 border border-line-strong !bg-transparent" />
                </div>
              </motion.div>

              <motion.ul variants={staggerItem} className="grid gap-3 rounded-[var(--radius-card)] border border-line p-4 text-[0.88rem]">
                <li className="flex gap-3">
                  <Truck size={18} className="shrink-0 text-brass" />
                  <span>
                    <b className="font-semibold text-ink">Standard delivery by {formatDate(addDays(5), { weekday: 'short', day: 'numeric', month: 'short' })}</b>
                    <span className="block text-muted">Express by {formatDate(addDays(2), { weekday: 'short', day: 'numeric', month: 'short' })} for ₹349</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <ShieldCheck size={18} className="shrink-0 text-brass" />
                  <span className="text-muted">{product.specifications['Warranty'] ?? 'Manufacturer warranty'} · Genuine product</span>
                </li>
                <li className="flex gap-3">
                  <RotateCcw size={18} className="shrink-0 text-brass" />
                  <span className="text-muted">30-day returns on unused items, free pickup</span>
                </li>
              </motion.ul>

              {variant && (
                <motion.p variants={staggerItem} className="font-mono text-[0.75rem] text-subtle">
                  SKU {variant.sku}
                </motion.p>
              )}
            </motion.div>
          </div>
        </div>

        <motion.section {...inViewProps} variants={fadeUp} className="mt-20 max-w-4xl">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: 'details', label: 'Details' },
              { value: 'specs', label: 'Specifications', count: specs.length },
              { value: 'delivery', label: 'Delivery & returns' },
            ]}
          />
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className="py-6">
              {tab === 'details' && <p className="whitespace-pre-line leading-relaxed text-muted">{product.description ?? product.shortDescription ?? 'Details coming soon.'}</p>}
              {tab === 'specs' && (
                <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                  {specs.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 border-b border-line py-3 text-[0.92rem]">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-right text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {tab === 'delivery' && (
                <div className="grid grid-cols-1 gap-4 text-muted sm:grid-cols-3">
                  <div>
                    <PackageCheck className="mb-2 text-brass" />
                    <p className="font-semibold text-ink">Packed with care</p>
                    <p className="text-[0.9rem]">Glass and crystal ship in double-walled boxes with foam inserts.</p>
                  </div>
                  <div>
                    <Truck className="mb-2 text-brass" />
                    <p className="font-semibold text-ink">2–5 day delivery</p>
                    <p className="text-[0.9rem]">Standard is free over {formatPrice(2000)}, otherwise ₹149. Express is ₹349.</p>
                  </div>
                  <div>
                    <RotateCcw className="mb-2 text-brass" />
                    <p className="font-semibold text-ink">30-day returns</p>
                    <p className="text-[0.9rem]">Unused items in original packaging. We arrange the pickup.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.section>

        <div className="mt-16">
          <ReviewsSection productId={product.id} />
        </div>

        {related.data && related.data.length > 0 && (
          <motion.section {...inViewProps} variants={fadeUp} className="mt-24" aria-labelledby="related-title">
            <h2 id="related-title" className="mb-8 text-[clamp(1.8rem,3vw,2.4rem)]">
              You may also like
            </h2>
            <motion.div variants={staggerContainer(0.06)} {...inViewProps} className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
              {related.data.slice(0, 4).map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}
      </div>

      {/* Mobile sticky add-to-cart */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden"
          >
            <div className="flex items-center gap-3">
              {product.primaryImage && <img src={product.primaryImage.url} alt="" className="size-12 shrink-0 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.88rem] font-semibold">{product.name}</p>
                <p className="font-mono text-[0.82rem] text-muted tabular">{formatPrice(variant?.price ?? product.price)}</p>
              </div>
              <Button variant="accent" onClick={() => void add()} disabled={!variant?.inStock} loading={addToCart.isPending}>
                {added ? <Check size={17} /> : <ShoppingBag size={17} />} {added ? 'Added' : 'Add'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

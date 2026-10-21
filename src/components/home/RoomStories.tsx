import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategories } from '@/features/categories/hooks'
import { useProducts } from '@/features/products/hooks'
import { useStoreSettings } from '@/features/store/hooks'
import type { CategoryDto } from '@/types/api'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/format'

/** One category, its photo and its top products, all from the API. Photo unmasks and drifts on scroll. */
function CategoryStory({ category, flip }: { category: CategoryDto; flip: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion() ?? false
  const { data: products, isPending } = useProducts({ category: category.slug, sort: 'featured', pageSize: 3 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const reveal = useTransform(scrollYProgress, [0, 0.42], [0, 1], { clamp: true })
  const inset = useTransform(reveal, (r) => {
    const i = (1 - r) * 16
    return flip ? `inset(${i}% 0% ${i}% ${i * 3}% round 10px)` : `inset(${i}% ${i * 3}% ${i}% 0% round 10px)`
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-12%', '4%'])
  const imgScale = useTransform(reveal, [0, 1], [1.25, 1])
  const textY = useTransform(scrollYProgress, [0, 1], [60, -30])
  const href = `/categories/${category.slug}`

  return (
    <article ref={ref} className={cn('grid grid-cols-1 items-center gap-[clamp(24px,5vw,72px)] md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]', flip && 'md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]')}>
      <Link to={href} className={cn('block', flip && 'md:order-2')} aria-label={category.name}>
        <motion.div style={reduce ? undefined : { clipPath: inset }} className="aspect-[3/2] overflow-hidden rounded-[var(--radius-media)] bg-surface-2">
          {category.imageUrl && <motion.img src={category.imageUrl} alt="" loading="lazy" style={reduce ? undefined : { y: imgY, scale: imgScale }} className="h-[118%] w-full object-cover" />}
        </motion.div>
      </Link>
      <motion.div style={reduce ? undefined : { y: textY }}>
        <h3 className="text-[clamp(1.8rem,3.2vw,2.6rem)]">{category.name}</h3>
        {category.description && <p className="mb-5 mt-3 max-w-[42ch] text-muted">{category.description}</p>}
        <ul className="border-t border-line text-[0.92rem]">
          {isPending
            ? [0, 1, 2].map((i) => (
                <li key={i} className="border-b border-line py-3">
                  <Skeleton className="h-4 w-3/4" />
                </li>
              ))
            : products?.items.map((p) => (
                <li key={p.id} className="border-b border-line">
                  <Link to={`/products/${p.slug}`} className="flex justify-between gap-4 py-2.5 transition-colors hover:text-brass">
                    <span className="min-w-0 truncate">{p.name}</span>
                    <span className="flex shrink-0 items-baseline gap-2 font-mono tabular">
                      {p.discountPercent ? <span className="text-[0.75rem] text-success">−{p.discountPercent}%</span> : null}
                      {p.compareAtPrice && p.compareAtPrice > p.price ? <s className="text-[0.8rem] text-subtle">{formatPrice(p.compareAtPrice)}</s> : null}
                      <b className="font-medium">{formatPrice(p.price)}</b>
                    </span>
                  </Link>
                </li>
              ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[0.8rem] text-brass">
            {category.productCount} {category.productCount === 1 ? 'style' : 'styles'}
          </p>
          <Link to={href} className="text-[0.88rem] font-semibold text-ink underline decoration-brass underline-offset-4 hover:text-brass">
            Shop {category.name.toLowerCase()}
          </Link>
        </div>
      </motion.div>
    </article>
  )
}

function Word({ children, progress, range, reduce }: { children: string; progress: ReturnType<typeof useScroll>['scrollYProgress']; range: [number, number]; reduce: boolean }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  const glow = useTransform(progress, [range[0], range[1], range[1] + 0.06], [0, 1, 0])
  const color = useTransform(glow, (g) => (g > 0.5 ? 'var(--ul-brass)' : 'var(--ul-ink)'))
  return (
    <motion.span style={reduce ? undefined : { opacity, color }} className="transition-colors duration-300">
      {children}{' '}
    </motion.span>
  )
}

/** The store's tagline lights up word by word, then the top categories (with photos and products) reveal. */
export function RoomStories() {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion() ?? false
  const { data: store } = useStoreSettings()
  const { data: categories, isPending } = useCategories()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const stories = (categories ?? []).filter((c) => c.productCount > 0 && c.imageUrl).slice(0, 3)
  const words = store?.tagline?.split(' ') ?? []

  if (!isPending && stories.length === 0) return null

  return (
    <section className="container-page grid gap-[clamp(80px,14vh,160px)] py-[clamp(80px,12vh,140px)]" aria-labelledby="stories-title">
      <div className="max-w-[980px]">
        <p className="eyebrow mb-3">Shop by category</p>
        <h2 id="stories-title" className="text-[clamp(2rem,4.6vw,3.6rem)]">
          Find the light for every room
        </h2>
        {words.length > 0 && (
          <p ref={ref} className="mt-6 font-display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.3]">
            {words.map((w, i) => (
              <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} reduce={reduce}>
                {w}
              </Word>
            ))}
          </p>
        )}
      </div>
      {isPending ? <Skeleton className="aspect-[3/2] w-full md:w-3/5" /> : stories.map((c, i) => <CategoryStory key={c.id} category={c} flip={i % 2 === 1} />)}
    </section>
  )
}

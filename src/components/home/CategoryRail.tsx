import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategories } from '@/features/categories/hooks'
import { useCanHover, useIsShortScreen } from '@/hooks/useMediaQuery'
import type { CategoryDto } from '@/types/api'

function CategoryCard({ category, index, tilt }: { category: CategoryDto; index: number; tilt: boolean }) {
  const [style, setStyle] = useState<{ transform?: string; gx?: string; gy?: string }>({})
  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (!tilt) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    setStyle({ transform: `perspective(900px) rotateY(${(px - 0.5) * 14}deg) rotateX(${(0.5 - py) * 12}deg) scale(1.02)`, gx: `${px * 100}%`, gy: `${py * 100}%` })
  }
  return (
    <Link
      to={`/categories/${category.slug}`}
      onPointerMove={onMove}
      onPointerLeave={() => setStyle({})}
      className="group grid w-[clamp(250px,32vw,440px)] shrink-0 gap-4"
    >
      <figure
        className="relative m-0 aspect-[4/5] overflow-hidden rounded-[var(--radius-media)] bg-surface-2 transition-[transform,box-shadow] duration-200 ease-out group-hover:shadow-[0_30px_60px_-20px_var(--ul-glow)]"
        style={{ transform: style.transform }}
      >
        {category.imageUrl && (
          <img src={category.imageUrl} alt="" loading="lazy" className="size-full object-cover transition-[filter,transform] duration-700 group-hover:scale-[1.04] group-hover:brightness-110" />
        )}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at ${style.gx ?? '50%'} ${style.gy ?? '0%'}, rgba(255,226,180,0.32), transparent 55%)` }}
        />
        <span className="glass absolute left-3.5 top-3 rounded-full px-2.5 py-0.5 font-mono text-[0.72rem] text-ink">
          {String(index + 1).padStart(2, '0')} · {category.productCount === 0 ? 'Coming soon' : `${category.productCount} ${category.productCount === 1 ? 'style' : 'styles'}`}
        </span>
      </figure>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[1.5rem] transition-colors group-hover:text-brass">{category.name}</h3>
        <span className="text-[0.82rem] text-muted transition-transform group-hover:translate-x-1">Shop →</span>
      </div>
    </Link>
  )
}

/** Vertical scroll moves the category row sideways while the section is pinned. Falls back to a swipeable row. */
export function CategoryRail() {
  const { data: categories, isPending } = useCategories()
  const reduce = useReducedMotion() ?? false
  const canHover = useCanHover()
  const short = useIsShortScreen()
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const distance = useMotionValue(0)
  const { scrollYProgress, scrollY } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform([scrollYProgress, distance], ([p, d]: number[]) => -(p ?? 0) * (d ?? 0))
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 300, damping: 40 })
  const skew = useTransform(velocity, [-2500, 2500], [5, -5], { clamp: true })
  const [progress, setProgress] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', setProgress)

  const list = categories?.filter((c) => c.imageUrl) ?? []
  const pinned = !reduce && !short && list.length > 2

  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current
      if (track) distance.set(Math.max(0, track.scrollWidth - document.documentElement.clientWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [list.length, pinned, distance])

  const header = (
    <div className="container-page flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-3">Shop by fixture</p>
        <h2 className="text-[clamp(2rem,4.6vw,3.6rem)]">Ways to light a room</h2>
      </div>
      <p className="max-w-[40ch] text-muted">Start with what hangs, mounts or stands. {pinned ? 'Keep scrolling to move through the collection.' : 'Swipe to see every category.'}</p>
    </div>
  )

  if (isPending) {
    return (
      <section className="py-24">
        {header}
        <div className="container-page mt-10 flex gap-6 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="aspect-[4/5] w-[clamp(250px,32vw,440px)] shrink-0" />
          ))}
        </div>
      </section>
    )
  }

  if (!pinned) {
    return (
      <section className="py-24" aria-label="Shop by fixture">
        {header}
        <div className="scrollbar-none mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[clamp(16px,4vw,48px)] pb-4">
          {list.map((c, i) => (
            <div key={c.id} className="snap-start">
              <CategoryCard category={c} index={i} tilt={false} />
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${Math.max(240, list.length * 70)}vh` }} aria-label="Shop by fixture">
      <div className="sticky top-0 flex h-svh flex-col justify-center gap-8 overflow-hidden">
        {header}
        <motion.div ref={trackRef} style={{ x, skewX: skew }} className="flex gap-[clamp(14px,2vw,28px)] px-[clamp(16px,4vw,48px)]">
          {list.map((c, i) => (
            <CategoryCard key={c.id} category={c} index={i} tilt={canHover} />
          ))}
        </motion.div>
        <div className="container-page">
          <div className="h-0.5 overflow-hidden rounded-full bg-line">
            <div className="h-full origin-left bg-brass shadow-[0_0_8px_var(--ul-brass)]" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      </div>
    </section>
  )
}

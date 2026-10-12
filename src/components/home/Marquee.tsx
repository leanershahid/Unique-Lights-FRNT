import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { useRef } from 'react'
import { useCategories } from '@/features/categories/hooks'

function Row({ items, outline, direction }: { items: string[]; outline?: boolean; direction: 1 | -1 }) {
  const reduce = useReducedMotion() ?? false
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const speed = useTransform(velocity, [-3000, 0, 3000], [-6, 0, 6], { clamp: false })
  const skew = useTransform(velocity, [-3000, 3000], [14, -14], { clamp: true })
  const dir = useRef(direction)

  // Base drift plus a boost from scroll speed; reverses when scrolling up.
  useAnimationFrame((_, delta) => {
    if (reduce || !ref.current) return
    const v = speed.get()
    if (v < -0.2) dir.current = (direction * -1) as 1 | -1
    else if (v > 0.2) dir.current = direction
    const third = ref.current.scrollWidth / 3
    let next = x.get() - dir.current * (0.04 * delta + Math.abs(v) * delta * 0.06)
    if (next <= -third) next += third
    if (next > 0) next -= third
    x.set(next)
  })

  return (
    <motion.div
      ref={ref}
      style={{ x, skewX: reduce ? 0 : skew }}
      className={`flex whitespace-nowrap font-display text-[clamp(3rem,10vw,8.5rem)] leading-[1.05] ${outline ? 'text-transparent [-webkit-text-stroke:1px_var(--ul-line-strong)]' : 'text-ink'}`}
      aria-hidden="true"
    >
      {[0, 1, 2].map((copy) =>
        items.map((t) => (
          <span key={`${copy}-${t}`} className="flex items-center">
            <span className="px-[0.28em]">{t}</span>
            <span className="inline-block size-[0.16em] rounded-full bg-brass shadow-[0_0_0.3em_0.08em_var(--ul-glow)]" />
          </span>
        )),
      )}
    </motion.div>
  )
}

/** Two rows of the store's category names (from the API) that speed up and lean with scroll velocity. */
export function Marquee() {
  const { data: categories } = useCategories()
  const items = (categories ?? []).map((c) => c.name)
  if (items.length < 2) return null
  return (
    <section aria-label={items.join(', ')} className="grid gap-1 overflow-hidden border-y border-line py-[clamp(40px,8vh,90px)]">
      <Row items={items} direction={1} />
      <Row items={items} outline direction={-1} />
    </section>
  )
}

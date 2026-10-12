import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useTransform, useVelocity } from 'motion/react'
import { useRef } from 'react'
import { LinkButton } from '@/components/ui/Button'
import { useCategories } from '@/features/categories/hooks'
import { useProducts } from '@/features/products/hooks'
import { formatPrice } from '@/utils/format'

/** Closing call to action under a swinging brass pendant. Figures come from the live catalogue. */
export function PendantCta() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion() ?? false
  const { data: categories } = useCategories()
  const { data: all } = useProducts({ pageSize: 1, sort: 'price_asc' })
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const angle = useMotionValue(0)
  const rotate = useTransform(angle, (a) => a * 57.3)
  const state = useRef({ a: 0, v: 0, push: 0 })

  // Damped pendulum driven by scroll velocity (and a nudge from the pointer).
  useAnimationFrame(() => {
    if (reduce) return
    const s = state.current
    s.v += -s.a * 0.012 + Math.max(-60, Math.min(60, velocity.get() / 60)) * -0.00035 + s.push
    s.push = 0
    s.v *= 0.975
    s.a = Math.max(-0.6, Math.min(0.6, s.a + s.v))
    angle.set(s.a)
  })

  const total = all?.totalCount ?? 0
  const from = all?.items[0]?.price
  const categoryCount = categories?.filter((c) => c.productCount > 0).length ?? 0
  const backdrop = categories?.find((c) => c.imageUrl)?.imageUrl

  if (!all || total === 0) return null

  return (
    <section
      ref={ref}
      onPointerMove={(e) => (state.current.push += Math.max(-40, Math.min(40, e.movementX)) * 0.00012)}
      className="relative overflow-hidden px-[clamp(16px,4vw,48px)] pb-[clamp(90px,14vh,160px)] pt-[clamp(300px,42vh,380px)] text-center text-[#f4ece1]"
    >
      <div className="absolute inset-0 bg-[#120f13]" />
      {backdrop && <motion.img src={backdrop} alt="" loading="lazy" style={reduce ? undefined : { y: bgY }} className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover brightness-[0.3]" />}
      <motion.svg
        viewBox="0 0 1000 1000"
        aria-hidden="true"
        style={{ rotate, transformOrigin: '500px 0px' }}
        className="pointer-events-none absolute left-1/2 top-0 -ml-[500px] h-[1000px] w-[1000px]"
      >
        <defs>
          <linearGradient id="pendant-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffc47e" stopOpacity=".55" />
            <stop offset=".7" stopColor="#ffc47e" stopOpacity=".08" />
            <stop offset="1" stopColor="#ffc47e" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="pendant-bulb">
            <stop offset="0" stopColor="#fff1d6" />
            <stop offset=".4" stopColor="#ffc47e" stopOpacity=".8" />
            <stop offset="1" stopColor="#ffc47e" stopOpacity="0" />
          </radialGradient>
        </defs>
        <polygon points="452,236 548,236 820,1000 180,1000" fill="url(#pendant-cone)" style={{ mixBlendMode: 'screen' }} />
        <line x1="500" y1="0" x2="500" y2="180" stroke="#8a7d72" strokeWidth="2" />
        <rect x="490" y="176" width="20" height="16" rx="3" fill="#b8874a" />
        <path d="M500 190 C 460 192 446 214 444 236 L 556 236 C 554 214 540 192 500 190 Z" fill="#c9954f" />
        <motion.circle cx="500" cy="240" fill="url(#pendant-bulb)" animate={reduce ? undefined : { r: [66, 70, 65, 68, 66] }} transition={{ duration: 3, repeat: Infinity }} r={66} />
        <ellipse cx="500" cy="236" rx="56" ry="5" fill="#fff1d6" />
      </motion.svg>
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }} className="relative mx-auto grid max-w-3xl justify-items-center gap-5">
        <p className="eyebrow !text-[#e9b877]">The full collection</p>
        <h2 className="max-w-[16ch] text-[clamp(2.4rem,6.4vw,5.2rem)]">
          {total} lights across {categoryCount} {categoryCount === 1 ? 'category' : 'categories'}.
        </h2>
        {from !== undefined && <p className="max-w-[46ch] text-[#e3d8ca]">Starting from {formatPrice(from)}.</p>}
        <LinkButton to="/products" variant="accent" size="lg">
          Browse everything
        </LinkButton>
      </motion.div>
    </section>
  )
}

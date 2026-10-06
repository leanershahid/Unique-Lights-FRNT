import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import { revealLine, staggerContainer } from '@/animations/variants'
import { LinkButton } from '@/components/ui/Button'

const LINES = [['Illuminate', 'your', 'space'], ['with', 'something'], ['extraordinary.']]

/** Dust motes that drift up and glow brighter near the light. Canvas, paused when off-screen. */
function useDust(canvasRef: React.RefObject<HTMLCanvasElement | null>, light: React.RefObject<{ x: number; y: number }>, enabled: boolean) {
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !enabled) return
    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    let motes: { x: number; y: number; r: number; vy: number; ph: number; sp: number }[] = []

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(Math.min(140, Math.max(40, (w * h) / 9000)))
      motes = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.8,
        vy: -(0.08 + Math.random() * 0.35),
        ph: Math.random() * 6.28,
        sp: 0.4 + Math.random(),
      }))
    }
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      if (!visible) return
      ctx.clearRect(0, 0, w, h)
      const { x: lx, y: ly } = light.current
      for (const m of motes) {
        m.y += m.vy
        m.x += Math.sin(t * 0.0006 * m.sp + m.ph) * 0.25
        if (m.y < -5) {
          m.y = h + 5
          m.x = Math.random() * w
        }
        const near = Math.max(0, 1 - Math.hypot(m.x - lx, m.y - ly) / 300)
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r * (1 + near), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 214, 160, ${0.08 + 0.85 * near})`
        ctx.fill()
      }
    }
    const io = new IntersectionObserver(([e]) => (visible = e?.isIntersecting ?? true))
    io.observe(canvas)
    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef, light, enabled])
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const light = useRef({ x: 0, y: 0 })
  const reduce = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.22])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const shade = useTransform(scrollYProgress, [0, 1], [0, 0.75])

  useDust(canvasRef, light, !reduce)

  // Warm light follows the pointer; drifts by itself when idle or on touch screens.
  useEffect(() => {
    const el = ref.current
    if (!el || reduce) return
    let raf = 0
    let tx = el.clientWidth * 0.62
    let ty = el.clientHeight * 0.38
    let lastMove = -1e9
    light.current = { x: tx, y: ty }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tx = e.clientX - r.left
      ty = e.clientY - r.top
      lastMove = performance.now()
    }
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (t - lastMove > 2500) {
        tx = el.clientWidth * (0.55 + 0.28 * Math.sin(t * 0.00035))
        ty = el.clientHeight * (0.4 + 0.16 * Math.sin(t * 0.00061))
      }
      const l = light.current
      l.x += (tx - l.x) * 0.08
      l.y += (ty - l.y) * 0.08
      el.style.setProperty('--lx', `${l.x}px`)
      el.style.setProperty('--ly', `${l.y}px`)
    }
    el.addEventListener('pointermove', onMove)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
    }
  }, [reduce])

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#120f13] pt-28 [--lx:62%] [--ly:38%] sm:min-h-[600px] md:h-[min(96svh,880px)] md:min-h-[600px] md:pt-0" aria-label="Unique Lights">
      <motion.img
        src="/images/hero-living.jpg"
        alt="A dark blue living room with a velvet daybed lit by a brass floor lamp"
        fetchPriority="high"
        style={reduce ? undefined : { y: imgY, scale: imgScale }}
        initial={{ opacity: 0, scale: 1.18 }}
        animate={{ opacity: 1, scale: 1.08 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 -top-[6%] h-[112%] w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_560px_at_var(--lx)_var(--ly),transparent_0%,rgba(10,7,10,0.62)_80%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen bg-[radial-gradient(circle_360px_at_var(--lx)_var(--ly),rgba(255,184,104,0.34),rgba(255,184,104,0.08)_45%,transparent_70%)]" />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 size-full" aria-hidden="true" />

      {/* Floating decorative light orbs */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {[
            { l: '12%', t: '22%', s: 10, d: 0 },
            { l: '82%', t: '18%', s: 7, d: 1.2 },
            { l: '68%', t: '58%', s: 5, d: 2.1 },
          ].map((o, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-[#ffcf8f]"
              style={{ left: o.l, top: o.t, width: o.s, height: o.s, boxShadow: `0 0 ${o.s * 3}px ${o.s}px rgba(255,190,110,0.55)` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4], y: [0, -18, 0] }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: o.d }}
            />
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(18,15,19,0.6)_0%,transparent_32%,rgba(18,15,19,0.3)_62%,var(--ul-bg)_100%)]" />
      <motion.div className="pointer-events-none absolute inset-0 bg-bg" style={{ opacity: reduce ? 0 : shade }} />

      <motion.div style={reduce ? undefined : { y: copyY, opacity: copyOpacity }} className="container-page relative pb-[clamp(48px,9vh,96px)] text-[#f4ece1]">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }} className="eyebrow mb-5 !text-[#e9b877]">
          Designer lighting · Delivered across India
        </motion.p>
        <motion.h1 variants={staggerContainer(0.07, 0.35)} initial="hidden" animate="visible" className="max-w-[16ch] text-[clamp(2.15rem,9vw,6.6rem)] leading-[1.04] tracking-[-0.01em]">
          {LINES.map((line, li) => (
            <span key={li} className="block">
              {line.map((word) => (
                <span key={word} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom last:mr-0">
                  <motion.span variants={revealLine} className={li === 2 ? 'inline-block text-[#e9b877] [text-shadow:0_0_40px_rgba(220,165,97,0.45)]' : 'inline-block'}>
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.6 }} className="mt-5 max-w-[46ch] text-[clamp(0.95rem,1.4vw,1.15rem)] text-[#e7ddd0] sm:mt-6">
          Pendants, chandeliers, wall lights and lamps chosen for how they make a room feel after dark. Every fixture is dimmable and ships within three days.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.6 }} className="pointer-events-auto mt-8 flex flex-col gap-3 min-[400px]:flex-row min-[400px]:flex-wrap">
          <LinkButton to="/products?featured=true" variant="accent" size="lg">
            Shop the collection
          </LinkButton>
          <LinkButton to="/products" variant="outline" size="lg" className="!border-white/35 !text-[#f4ece1] hover:!border-[#e9b877] hover:!text-[#e9b877]">
            Explore all lights
          </LinkButton>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="absolute bottom-8 right-[clamp(16px,4vw,48px)] hidden items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[#b5a99c] md:flex" aria-hidden="true">
        Scroll
        <motion.span className="block h-11 w-px origin-top bg-gradient-to-b from-[#dca561] to-transparent" animate={{ scaleY: [0, 1, 1], opacity: [1, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
      </motion.div>
    </section>
  )
}

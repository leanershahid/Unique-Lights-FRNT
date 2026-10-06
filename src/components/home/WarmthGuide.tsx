import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'

/** Tanner Helland's approximation of black-body colour for a Kelvin value. */
export function kelvinToRgb(k: number): string {
  const t = k / 100
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v)))
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592)
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492)
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`
}

const STOPS = [
  { k: 2200, use: 'Candlelight' },
  { k: 2700, use: 'Living rooms' },
  { k: 3000, use: 'Kitchens' },
  { k: 3500, use: 'Home office' },
  { k: 4000, use: 'Utility, garage' },
]

/** Kelvin scale that fills as you scroll; a glowing bulb travels along it and changes colour. */
export function WarmthGuide() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'center 0.45'] })
  const p = useTransform(scrollYProgress, [0, 1], [0, 1], { clamp: true })
  const [kelvin, setKelvin] = useState(reduce ? 4000 : 2200)
  useMotionValueEvent(p, 'change', (v) => setKelvin(Math.round((2200 + v * 1800) / 10) * 10))
  const color = kelvinToRgb(kelvin)
  const left = useTransform(p, (v) => `${v * 100}%`)
  const clip = useTransform(p, (v) => `inset(0 ${(1 - v) * 100}% 0 0 round 14px)`)

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-line py-[clamp(64px,10vh,110px)]" aria-labelledby="warmth-title">
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]" style={{ background: `radial-gradient(50% 80% at ${(kelvin - 2200) / 18}% 70%, ${color}, transparent 70%)` }} />
      <div className="container-page relative grid gap-9">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">Lighting guide</p>
            <h2 id="warmth-title" className="text-[clamp(2rem,4.6vw,3.6rem)]">
              Pick your warmth
            </h2>
            <p className="mt-4 max-w-[46ch] text-muted">
              Colour temperature is measured in Kelvin. Lower numbers glow amber like candlelight; higher numbers look crisp and neutral. Most homes feel best between 2700 K and 3000 K.
            </p>
          </div>
          <p className="font-display text-[clamp(3rem,9vw,7rem)] leading-none tabular" style={{ color, textShadow: `0 0 40px ${color}` }} aria-hidden="true">
            {kelvin}
            <small className="ml-2 text-[0.35em] text-muted [text-shadow:none]">K</small>
          </p>
        </div>
        <div className="relative pt-9">
          <motion.span className="absolute top-0 -ml-[13px] size-[26px] rounded-full" style={{ left: reduce ? '100%' : left, background: color, boxShadow: `0 0 24px 10px ${color}` }} aria-hidden="true" />
          <motion.div
            className="h-3.5 rounded-full bg-[linear-gradient(90deg,#ff8b27,#ffad5e,#ffc995,#ffe3c8,#fff4ea)]"
            style={{ clipPath: reduce ? undefined : clip }}
            role="img"
            aria-label="Colour temperature scale from 2200 K amber to 4000 K cool white"
          />
        </div>
        <ol className="grid grid-cols-5 gap-2 font-mono text-[0.78rem] tabular">
          {STOPS.map((s, i) => (
            <li key={s.k} className={`grid gap-0.5 transition-opacity duration-300 ${i === 0 ? '' : i === STOPS.length - 1 ? 'text-right' : 'text-center'} ${kelvin >= s.k - 10 ? 'opacity-100' : 'opacity-35'}`}>
              <b className="font-medium">{s.k} K</b>
              <span className="hidden text-muted sm:block">{s.use}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

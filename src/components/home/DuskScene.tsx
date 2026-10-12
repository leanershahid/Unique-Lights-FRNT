import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { useIsShortScreen } from '@/hooks/useMediaQuery'

const STEPS = [
  { eyebrow: '7:42 pm', title: 'The sun goes down.', text: 'Daylight fades and the room goes flat and grey. This is when lighting does its real work.' },
  { eyebrow: 'Switch on', title: 'One warm light changes everything.', text: 'A single wall sconce at 2700 K pulls the walls in and makes the space feel lived in.' },
  { eyebrow: 'Settle in', title: 'Dim it to the evening you want.', text: 'A dimmer lets one fixture carry both a bright dinner and a quiet late evening.' },
]

/** Pinned scene: scrolling switches the light on (with a flicker), then dims it. */
export function DuskScene() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion() ?? false
  const short = useIsShortScreen()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const on = useTransform(scrollYProgress, [0.25, 0.6], [0, 1], { clamp: true })
  const dim = useTransform(scrollYProgress, [0.7, 1], [0, 1], { clamp: true })
  const level = useTransform([on, dim], ([o, d]: number[]) => (o ?? 0) * (1 - (d ?? 0) * 0.55))
  const filter = useTransform([level, on], ([l, o]: number[]) => `brightness(${0.22 + (l ?? 0) * 0.86}) saturate(${0.5 + (o ?? 0) * 0.65})`)
  const scale = useTransform(scrollYProgress, [0, 1], [1.14, 1])
  const [step, setStep] = useState(0)
  const [reading, setReading] = useState({ lm: 0, pct: 0, isOn: false })
  const [flicker, setFlicker] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setStep(p < 0.25 ? 0 : p < 0.7 ? 1 : 2)
  })
  useMotionValueEvent(level, 'change', (l) => {
    const isOn = on.get() > 0
    if (isOn && !reading.isOn) setFlicker((f) => f + 1)
    setReading({ lm: Math.round(450 * l), pct: Math.round(l * 100), isOn })
  })

  // Static version for reduced motion and for screens too short to pin a full-height scene.
  if (reduce || short) {
    return (
      <section className="relative min-h-[80vh] overflow-hidden" aria-label="From dusk to lamplight">
        <img src="/images/sconce-warm.jpg" alt="A fabric wall sconce casting warm light across a dark wall" className="absolute inset-0 size-full object-cover" loading="lazy" />
        <div className="container-page relative flex min-h-[80vh] items-end py-16 text-[#f4ece1]">
          <div>
            <p className="eyebrow mb-3">{STEPS[1]!.eyebrow}</p>
            <h2 className="text-[clamp(2rem,5vw,4rem)]">{STEPS[1]!.title}</h2>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="relative h-[280vh]" aria-label="From dusk to lamplight">
      <div className="sticky top-0 grid h-svh place-items-center overflow-hidden">
        <motion.img
          src="/images/sconce-warm.jpg"
          alt="A fabric wall sconce casting warm light across a dark wall"
          loading="lazy"
          style={{ filter, scale }}
          className="absolute inset-0 size-full object-cover"
        />
        <motion.div style={{ opacity: level }} className="pointer-events-none absolute inset-0 mix-blend-screen bg-[radial-gradient(60%_55%_at_58%_40%,rgba(255,176,92,0.5),transparent_70%)]" />
        <motion.div
          key={flicker}
          className="pointer-events-none absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={flicker ? { opacity: [0.75, 0.1, 0.65, 0, 0.35, 0] } : { opacity: 0 }}
          transition={{ duration: 0.7, times: [0, 0.18, 0.32, 0.48, 0.6, 1], ease: 'linear' }}
        />

        <div className="container-page relative grid grid-cols-1 items-end gap-6 text-[#f4ece1] md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative min-h-[11em]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 bottom-0"
              >
                <p className="eyebrow mb-3 !text-[#e9b877]">{STEPS[step]!.eyebrow}</p>
                <h2 className="max-w-[18ch] text-[clamp(2rem,5vw,4rem)]">{STEPS[step]!.title}</h2>
                <p className="mt-3 max-w-[40ch] text-[#e3d8ca]">{STEPS[step]!.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="grid min-w-56 gap-1.5 rounded-2xl border border-white/15 bg-black/45 p-5 font-mono text-[0.85rem] tabular backdrop-blur-md" aria-hidden="true">
            <div className="flex justify-between gap-6">
              <span className="text-[#b5a99c]">Output</span>
              <b className="font-medium">{reading.lm} lm</b>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-[#b5a99c]">Colour temp</span>
              <b className="font-medium">{reading.isOn ? '2700 K' : '—'}</b>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-[#b5a99c]">Dimmer</span>
              <b className="font-medium">{reading.pct}%</b>
            </div>
            <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/15">
              <motion.i className="block h-full origin-left bg-[#dca561] shadow-[0_0_8px_#dca561]" style={{ scaleX: level }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

const ROOMS = [
  {
    name: 'Living room',
    image: '/images/room-living.jpg',
    alt: 'A bright living room with a drum pendant over white sofas',
    text: 'A drum pendant sets the base glow. Add a reading lamp by the sofa and a sconce to wash the wall behind your art.',
    layers: [
      ['Ambient', 'Drum pendant, 2700 K'],
      ['Task', 'Arc floor lamp'],
      ['Accent', 'Picture-light sconce'],
    ],
    lux: '100–300 lux',
    to: '/categories/pendant-lights',
  },
  {
    name: 'Kitchen',
    image: '/images/room-kitchen.jpg',
    alt: 'A white kitchen with two glass pendants above the island',
    text: 'Hang pendants 75–85 cm above the island so they light the worktop without glare. Go a little cooler here for prep.',
    layers: [
      ['Ambient', 'Recessed downlights'],
      ['Task', 'Island pendants, 3000 K'],
      ['Accent', 'Under-cabinet strip'],
    ],
    lux: '300–500 lux on worktops',
    to: '/categories/pendant-lights',
  },
  {
    name: 'Open-plan loft',
    image: '/images/room-loft.jpg',
    alt: 'An open loft living area with tall windows and a steel staircase',
    text: 'Tall ceilings swallow light. Use floor lamps to bring it down to eye level and zone the space into smaller areas.',
    layers: [
      ['Ambient', 'Large statement pendant'],
      ['Task', 'Floor lamps per zone'],
      ['Accent', 'Stair wall lights'],
    ],
    lux: '150–300 lux',
    to: '/categories/floor-lamps',
  },
] as const

function Room({ room, flip }: { room: (typeof ROOMS)[number]; flip: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const reveal = useTransform(scrollYProgress, [0, 0.42], [0, 1], { clamp: true })
  const inset = useTransform(reveal, (r) => {
    const i = (1 - r) * 16
    return flip ? `inset(${i}% 0% ${i}% ${i * 3}% round 10px)` : `inset(${i}% ${i * 3}% ${i}% 0% round 10px)`
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-12%', '4%'])
  const imgScale = useTransform(reveal, [0, 1], [1.25, 1])
  const textY = useTransform(scrollYProgress, [0, 1], [60, -30])

  return (
    <article ref={ref} className={cn('grid items-center gap-[clamp(24px,5vw,72px)] md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]', flip && 'md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]')}>
      <motion.div style={reduce ? undefined : { clipPath: inset }} className={cn('aspect-[3/2] overflow-hidden rounded-[var(--radius-media)]', flip && 'md:order-2')}>
        <motion.img src={room.image} alt={room.alt} loading="lazy" style={reduce ? undefined : { y: imgY, scale: imgScale }} className="h-[118%] w-full object-cover" />
      </motion.div>
      <motion.div style={reduce ? undefined : { y: textY }}>
        <h3 className="text-[clamp(1.8rem,3.2vw,2.6rem)]">{room.name}</h3>
        <p className="mb-5 mt-3 max-w-[42ch] text-muted">{room.text}</p>
        <ul className="border-t border-line text-[0.92rem]">
          {room.layers.map(([layer, fixture]) => (
            <li key={layer} className="flex justify-between gap-4 border-b border-line py-2.5">
              <span className="text-muted">{layer}</span>
              <b className="text-right font-medium">{fixture}</b>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[0.8rem] text-brass">Target: {room.lux}</p>
          <Link to={room.to} className="text-[0.88rem] font-semibold text-ink underline decoration-brass underline-offset-4 hover:text-brass">
            Shop this look
          </Link>
        </div>
      </motion.div>
    </article>
  )
}

const STATEMENT =
  'Good rooms use three layers of light. Ambient light fills the space, task light lands where you work, and accent light gives the room its character.'

/** Statement words light up as you read, then three room recipes reveal as they scroll in. */
export function RoomStories() {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = STATEMENT.split(' ')

  return (
    <section className="container-page grid gap-[clamp(80px,14vh,160px)] py-[clamp(80px,12vh,140px)]" aria-labelledby="rooms-title">
      <div className="max-w-[980px]">
        <p className="eyebrow mb-3">Light a room</p>
        <h2 id="rooms-title" className="text-[clamp(2rem,4.6vw,3.6rem)]">
          Layer your light, room by room
        </h2>
        <p ref={ref} className="mt-6 font-display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.3]">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} reduce={reduce}>
              {w}
            </Word>
          ))}
        </p>
      </div>
      {ROOMS.map((room, i) => (
        <Room key={room.name} room={room} flip={i % 2 === 1} />
      ))}
    </section>
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

import { motion } from 'motion/react'
import { LinkButton } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <section className="container-page flex flex-col items-center py-28 text-center">
      <motion.p
        className="font-display text-[clamp(6rem,20vw,12rem)] leading-none text-brass"
        initial={{ opacity: 0.1 }}
        animate={{ opacity: [0.1, 0.9, 0.2, 1, 0.5, 1], textShadow: '0 0 60px var(--ul-glow)' }}
        transition={{ duration: 1.4, times: [0, 0.2, 0.3, 0.5, 0.6, 1] }}
      >
        404
      </motion.p>
      <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.8rem)]">This room is unlit.</h1>
      <p className="mt-3 max-w-md text-muted">The page you are looking for has moved or never existed.</p>
      <div className="mt-8 flex gap-3">
        <LinkButton to="/" variant="outline">
          Go home
        </LinkButton>
        <LinkButton to="/products" variant="accent">
          Browse lighting
        </LinkButton>
      </div>
    </section>
  )
}

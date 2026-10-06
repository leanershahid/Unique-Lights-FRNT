import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Suspense, useState, type ReactNode } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { pageTransition, pageTransitionReduced } from '@/animations/pageTransitions'

/** Keeps the previous page rendered while it animates out. */
function FrozenOutlet() {
  const outlet = useOutlet()
  const [frozen] = useState(outlet)
  return frozen
}

/**
 * Route content with a fade + slight vertical movement between pages.
 * `scope` lets nested layouts animate only their own segment (e.g. admin pages inside the admin shell).
 */
export function AnimatedOutlet({ fallback, scope = 'full' }: { fallback: ReactNode; scope?: 'full' | 'segment' }) {
  const location = useLocation()
  const reduce = useReducedMotion()
  const key = scope === 'full' ? location.pathname : location.pathname.split('/').slice(0, 4).join('/')
  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0 })}>
      <motion.div key={key} variants={reduce ? pageTransitionReduced : pageTransition} initial="initial" animate="animate" exit="exit">
        <Suspense fallback={fallback}>
          <FrozenOutlet />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

import type { Variants } from 'motion/react'
import { ease } from './transitions'

/** Route transition: fade with a slight vertical movement. Subtle on purpose. */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: ease.out } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: ease.in } },
}

/** Reduced-motion variant: opacity only, very short. */
export const pageTransitionReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.08 } },
}

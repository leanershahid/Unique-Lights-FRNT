import { useReducedMotion } from 'motion/react'

export * from './pageTransitions'
export * from './transitions'
export * from './variants'

/** Shared props for "animate when scrolled into view" sections. Animates once per section, not per element. */
export const inViewProps = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount: 0.2, margin: '0px 0px -60px 0px' },
} as const

/** Hover/tap feedback for buttons and cards. */
export const pressable = {
  whileHover: { y: -1 },
  whileTap: { scale: 0.97 },
} as const

/** True when large motion (parallax, long reveals) should be skipped. */
export function useCalmMotion(): boolean {
  return useReducedMotion() ?? false
}

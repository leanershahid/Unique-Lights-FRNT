import type { Transition } from 'motion/react'

/**
 * One timing scale for the whole app.
 *  micro      150–200 ms  hover, press, toggles
 *  component  250–400 ms  drawers, modals, cards entering
 *  hero       400–700 ms  page hero and large reveals
 */
export const duration = {
  micro: 0.18,
  component: 0.32,
  hero: 0.6,
} as const

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  in: [0.55, 0, 1, 0.45] as const,
}

export const transitions = {
  micro: { duration: duration.micro, ease: ease.out } satisfies Transition,
  component: { duration: duration.component, ease: ease.out } satisfies Transition,
  hero: { duration: duration.hero, ease: ease.out } satisfies Transition,
  exit: { duration: 0.2, ease: ease.in } satisfies Transition,
  spring: { type: 'spring', stiffness: 420, damping: 30, mass: 0.8 } satisfies Transition,
  bouncy: { type: 'spring', stiffness: 520, damping: 14 } satisfies Transition,
  drawer: { type: 'spring', stiffness: 380, damping: 38 } satisfies Transition,
} as const

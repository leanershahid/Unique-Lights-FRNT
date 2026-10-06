import type { Variants } from 'motion/react'
import { duration, ease, transitions } from './transitions'

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.component },
  exit: { opacity: 0, transition: transitions.exit },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: ease.out } },
  exit: { opacity: 0, y: 12, transition: transitions.exit },
}

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: transitions.component },
  exit: { opacity: 0, y: -8, transition: transitions.exit },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: transitions.component },
  exit: { opacity: 0, scale: 0.97, transition: transitions.exit },
}

export const slideIn = (from: 'left' | 'right' = 'left', distance = 40): Variants => ({
  hidden: { opacity: 0, x: from === 'left' ? -distance : distance },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: ease.out } },
  exit: { opacity: 0, x: from === 'left' ? -distance / 2 : distance / 2, transition: transitions.exit },
})

/** Parent for staggered children. Keep stagger short so content is usable quickly. */
export const staggerContainer = (stagger = 0.05, delayChildren = 0.05): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
})

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.component, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

/** Masked line/word reveal used by headlines. */
export const revealLine: Variants = {
  hidden: { y: '110%', rotate: 3 },
  visible: { y: '0%', rotate: 0, transition: { duration: 0.7, ease: ease.out } },
}

export const modal: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: transitions.spring },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: transitions.exit },
}

export const backdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const drawer = (side: 'left' | 'right' = 'right'): Variants => ({
  hidden: { x: side === 'right' ? '100%' : '-100%' },
  visible: { x: 0, transition: transitions.drawer },
  exit: { x: side === 'right' ? '100%' : '-100%', transition: { duration: 0.28, ease: ease.inOut } },
})

export const bottomSheet: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: transitions.drawer },
  exit: { y: '100%', transition: { duration: 0.28, ease: ease.inOut } },
}

export const dropdown: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: transitions.micro },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
}

export const collapse: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { height: transitions.component, opacity: { duration: 0.2, delay: 0.05 } } },
  exit: { height: 0, opacity: 0, transition: { height: { duration: 0.25, ease: ease.inOut }, opacity: { duration: 0.12 } } },
}

/** Cross-fade with a small slide, used by galleries and checkout steps. `custom` is the direction (1 or -1). */
export const slideSwap: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0, transition: transitions.component },
  leave: (dir: number) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.22, ease: ease.in } }),
}

import { useEffect } from 'react'

let locks = 0

/** Locks page scroll while an overlay is open. Reference-counted so stacked overlays behave. */
export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return
    locks += 1
    const { body, documentElement } = document
    const scrollbar = window.innerWidth - documentElement.clientWidth
    if (locks === 1) {
      body.style.overflow = 'hidden'
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
    }
    return () => {
      locks -= 1
      if (locks === 0) {
        body.style.overflow = ''
        body.style.paddingRight = ''
      }
    }
  }, [active])
}

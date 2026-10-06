/**
 * Sends a small copy of a product image to the header cart icon.
 * Uses transform/opacity only (Web Animations API) and is skipped for reduced motion.
 */
export const CART_ANCHOR_ID = 'cart-anchor'

export function flyToCart(source: HTMLElement | null) {
  if (!source || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const target = document.getElementById(CART_ANCHOR_ID)
  if (!target) return

  const from = source.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  if (!from.width || !to.width) return

  const size = Math.min(120, from.width * 0.6)
  const ghost = document.createElement('div')
  const img = source instanceof HTMLImageElement ? source.currentSrc || source.src : null
  Object.assign(ghost.style, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    zIndex: '95',
    pointerEvents: 'none',
    backgroundColor: 'var(--ul-brass)',
    backgroundImage: img ? `url("${img}")` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxShadow: '0 0 24px 6px var(--ul-glow)',
  })
  document.body.appendChild(ghost)

  const x0 = from.left + from.width / 2 - size / 2
  const y0 = from.top + from.height / 2 - size / 2
  const x1 = to.left + to.width / 2 - size / 2
  const y1 = to.top + to.height / 2 - size / 2
  const midX = (x0 + x1) / 2
  const midY = Math.min(y0, y1) - 80

  const animation = ghost.animate(
    [
      { transform: `translate(${x0}px, ${y0}px) scale(0.9)`, opacity: 0.95 },
      { transform: `translate(${midX}px, ${midY}px) scale(0.55)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${x1}px, ${y1}px) scale(0.12)`, opacity: 0.6 },
    ],
    { duration: 650, easing: 'cubic-bezier(0.55, 0, 0.3, 1)' },
  )
  animation.onfinish = () => ghost.remove()
  animation.oncancel = () => ghost.remove()
}

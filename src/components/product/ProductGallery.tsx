import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { slideSwap } from '@/animations/variants'
import { useCanHover } from '@/hooks/useMediaQuery'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import type { ProductImageDto } from '@/types/api'
import { cn } from '@/utils/cn'

interface GalleryProps {
  images: ProductImageDto[]
  productName: string
  imageRef?: React.RefObject<HTMLImageElement | null>
}

const SWIPE = 60

function Viewer({ images, index, onIndex, onClose, productName }: { images: ProductImageDto[]; index: number; onIndex: (i: number, dir: number) => void; onClose: () => void; productName: string }) {
  useLockBodyScroll(true)
  const [dir, setDir] = useState(1)
  const go = useCallback(
    (delta: number) => {
      setDir(delta)
      onIndex((index + delta + images.length) % images.length, delta)
    },
    [index, images.length, onIndex],
  )
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [go, onClose])
  const img = images[index]
  if (!img) return null

  return createPortal(
    <motion.div role="dialog" aria-modal="true" aria-label={`${productName} images`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[85] flex flex-col bg-black/95 text-white">
      <div className="flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="font-mono text-[0.8rem] text-white/70">
          {index + 1} / {images.length}
        </span>
        <button type="button" onClick={onClose} autoFocus aria-label="Close image viewer" className="rounded-full p-2.5 hover:bg-white/10">
          <X size={22} />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={img.id}
            src={img.url}
            alt={img.altText ?? productName}
            custom={dir}
            variants={slideSwap}
            initial="enter"
            animate="center"
            exit="leave"
            drag={images.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(_, info: PanInfo) => {
              if (info.offset.x < -SWIPE) go(1)
              else if (info.offset.x > SWIPE) go(-1)
            }}
            className="max-h-full max-w-full cursor-grab select-none object-contain active:cursor-grabbing"
            draggable={false}
          />
        </AnimatePresence>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="absolute left-3 rounded-full bg-white/10 p-3 backdrop-blur hover:bg-white/20">
              <ChevronLeft size={22} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" className="absolute right-3 rounded-full bg-white/10 p-3 backdrop-blur hover:bg-white/20">
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>
      <div className="flex justify-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {images.map((im, i) => (
          <button key={im.id} type="button" onClick={() => onIndex(i, i > index ? 1 : -1)} aria-label={`Show image ${i + 1}`} className={cn('size-14 overflow-hidden rounded-lg border-2 transition', i === index ? 'border-[#dca561]' : 'border-transparent opacity-50 hover:opacity-100')}>
            <img src={im.url} alt="" className="size-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>,
    document.body,
  )
}

/**
 * Main image with crossfade/slide on change, hover zoom (pointer devices), swipe (touch),
 * animated thumbnail indicator and a full-screen viewer.
 */
export function ProductGallery({ images, productName, imageRef }: GalleryProps) {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [viewer, setViewer] = useState(false)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const [loaded, setLoaded] = useState<Record<string, boolean>>({})
  const canHover = useCanHover()
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => setIndex(0), [images])

  const select = useCallback((i: number, d?: number) => {
    setDir(d ?? 1)
    setIndex(i)
  }, [])
  const go = (delta: number) => select((index + delta + images.length) % images.length, delta)
  const current = images[index]

  if (!current) {
    return <div className="flex aspect-[4/5] items-center justify-center rounded-[var(--radius-media)] bg-surface-2 text-subtle">No images yet</div>
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[76px_minmax(0,1fr)] lg:gap-4">
      <div className="scrollbar-none order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col" role="tablist" aria-label="Product images">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Image ${i + 1}`}
            onClick={() => select(i, i > index ? 1 : -1)}
            className="relative size-[68px] shrink-0 overflow-hidden rounded-lg bg-surface-2 lg:size-[76px]"
          >
            <img src={img.url} alt="" loading="lazy" className={cn('size-full object-cover transition-[opacity,transform] duration-300', i === index ? 'opacity-100' : 'opacity-55 hover:scale-105 hover:opacity-90')} />
            {i === index && <motion.span layoutId="thumb-ring" className="absolute inset-0 rounded-lg ring-2 ring-brass ring-inset" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
          </button>
        ))}
      </div>

      <div
        ref={stageRef}
        className={cn('relative order-1 aspect-[4/5] overflow-hidden rounded-[var(--radius-media)] bg-surface-2 lg:order-2', canHover && 'cursor-zoom-in')}
        onPointerMove={(e) => {
          if (!canHover || e.pointerType !== 'mouse') return
          const r = e.currentTarget.getBoundingClientRect()
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
        }}
        onPointerLeave={() => setZoom(null)}
        onClick={() => setViewer(true)}
      >
        {!loaded[current.id] && <div className="skeleton absolute inset-0 rounded-none" aria-hidden="true" />}
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={current.id}
            ref={imageRef}
            src={current.url}
            alt={current.altText ?? productName}
            custom={dir}
            variants={slideSwap}
            initial="enter"
            animate="center"
            exit="leave"
            onLoad={() => setLoaded((l) => ({ ...l, [current.id]: true }))}
            drag={!canHover && images.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            onDragEnd={(_, info: PanInfo) => {
              if (info.offset.x < -SWIPE) go(1)
              else if (info.offset.x > SWIPE) go(-1)
            }}
            draggable={false}
            style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            className={cn('absolute inset-0 size-full select-none object-cover transition-[scale] duration-300 ease-out', zoom && 'scale-[1.8]')}
          />
        </AnimatePresence>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setViewer(true)
          }}
          aria-label="Open full-screen images"
          className="glass absolute bottom-3 right-3 rounded-full p-2.5 text-ink transition-transform hover:scale-105"
        >
          <Expand size={18} />
        </button>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 lg:hidden" aria-hidden="true">
            {images.map((im, i) => (
              <span key={im.id} className={cn('h-1.5 rounded-full bg-white/80 transition-all duration-300', i === index ? 'w-5' : 'w-1.5 opacity-50')} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>{viewer && <Viewer images={images} index={index} onIndex={select} onClose={() => setViewer(false)} productName={productName} />}</AnimatePresence>
    </div>
  )
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[76px_minmax(0,1fr)] lg:gap-4" aria-hidden="true">
      <div className="order-2 flex gap-2 lg:order-1 lg:flex-col">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton size-[68px] lg:size-[76px]" />
        ))}
      </div>
      <div className="skeleton order-1 aspect-[4/5] lg:order-2" />
    </div>
  )
}

import { motion } from 'motion/react'
import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/layout/Logo'

/** Split screen: lit-room photograph on the left, form on the right. Photo hides on small screens. */
export function AuthLayout() {
  return (
    <div className="grid grid-cols-1 min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <motion.img
          src="/images/sconce-warm.jpg"
          alt="A fabric wall sconce casting warm light across a dark wall"
          initial={{ scale: 1.12, filter: 'brightness(0.3)' }}
          animate={{ scale: 1, filter: 'brightness(0.85)' }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-[#f4ece1]">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="max-w-md font-display text-[2.6rem] leading-[1.08]">
            Every room has an evening. Light it well.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4 max-w-sm text-[#d8ccbe]">
            Save favourites, track deliveries and check out faster with a Unique Lights account.
          </motion.p>
        </div>
      </div>
      <div className="flex flex-col px-[clamp(16px,6vw,72px)] pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
        <Logo />
        <div className="flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-[420px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

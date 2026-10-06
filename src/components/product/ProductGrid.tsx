import { motion } from 'motion/react'
import { staggerContainer, staggerItem } from '@/animations/variants'
import type { ProductListItemDto } from '@/types/api'
import { cn } from '@/utils/cn'
import { ProductCard } from './ProductCard'

/** Staggered grid. Stagger is 50 ms per card so products are usable almost immediately. */
export function ProductGrid({ products, className, columns = 'default' }: { products: ProductListItemDto[]; className?: string; columns?: 'default' | 'wide' }) {
  return (
    <motion.div
      key={products.map((p) => p.id).join('|')}
      variants={staggerContainer(0.05, 0.05)}
      initial="hidden"
      animate="visible"
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5',
        columns === 'default' ? 'md:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-3',
        className,
      )}
    >
      {products.map((p, i) => (
        <motion.div key={p.id} variants={staggerItem}>
          <ProductCard product={p} priority={i < 4} />
        </motion.div>
      ))}
    </motion.div>
  )
}

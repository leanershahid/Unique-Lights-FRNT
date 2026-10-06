import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { inViewProps } from '@/animations/animations'
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants'
import { ProductCard } from '@/components/product/ProductCard'
import { LinkButton } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/Misc'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { useProducts } from '@/features/products/hooks'
import type { ProductQuery } from '@/types/api'

interface ProductShowcaseProps {
  eyebrow: string
  title: string
  description?: string
  query: ProductQuery
  viewAllTo: string
  layout?: 'grid' | 'rail'
}

/** A product section that fades up as one group, then staggers its cards. */
export function ProductShowcase({ eyebrow, title, description, query, viewAllTo, layout = 'grid' }: ProductShowcaseProps) {
  const { data, isPending, isError, error, refetch } = useProducts(query)
  const products = data?.items ?? []
  if (!isPending && !isError && products.length === 0) return null

  return (
    <motion.section {...inViewProps} variants={fadeUp} className="container-page py-[clamp(64px,10vh,110px)]">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <LinkButton to={viewAllTo} variant="outline" size="sm">
            View all <ArrowRight size={15} />
          </LinkButton>
        }
      />
      <div className="mt-10">
        {isPending ? (
          <ProductGridSkeleton count={4} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : layout === 'rail' ? (
          <motion.div variants={staggerContainer(0.06)} {...inViewProps} className="scrollbar-none -mx-[clamp(16px,4vw,48px)] flex snap-x gap-5 overflow-x-auto px-[clamp(16px,4vw,48px)] pb-2">
            {products.map((p) => (
              <motion.div key={p.id} variants={staggerItem} className="w-[min(72vw,300px)] shrink-0 snap-start">
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer(0.06)} {...inViewProps} className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
            {products.map((p) => (
              <motion.div key={p.id} variants={staggerItem}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}

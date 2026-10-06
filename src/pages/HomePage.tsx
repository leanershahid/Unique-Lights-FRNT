import { CategoryRail } from '@/components/home/CategoryRail'
import { DuskScene } from '@/components/home/DuskScene'
import { Hero } from '@/components/home/Hero'
import { Marquee } from '@/components/home/Marquee'
import { PendantCta } from '@/components/home/PendantCta'
import { ProductShowcase } from '@/components/home/ProductShowcase'
import { RoomStories } from '@/components/home/RoomStories'
import { WarmthGuide } from '@/components/home/WarmthGuide'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductShowcase
        eyebrow="Bestsellers"
        title="What people are hanging this season"
        description="Our most-loved fixtures, all dimmable, all ready to ship."
        query={{ featured: true, pageSize: 8, sort: 'featured' }}
        viewAllTo="/products?featured=true"
      />
      <DuskScene />
      <CategoryRail />
      <Marquee />
      <RoomStories />
      <ProductShowcase eyebrow="New arrivals" title="Just landed" query={{ isNew: true, pageSize: 8, sort: 'newest' }} viewAllTo="/products?isNew=true" layout="rail" />
      <WarmthGuide />
      <PendantCta />
    </>
  )
}

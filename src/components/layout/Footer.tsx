import { Mail, MapPin, Phone, ShieldCheck, Truck, Undo2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCategories } from '@/features/categories/hooks'
import { Logo } from './Logo'

const YEAR = new Date().getFullYear()

const promises = [
  { icon: Truck, title: 'Delivered in 2–5 days', text: 'Free standard delivery over ₹2,000' },
  { icon: ShieldCheck, title: 'Up to 5-year warranty', text: 'On every LED fixture we sell' },
  { icon: Undo2, title: '30-day returns', text: 'Unused items, free pickup' },
]

export function Footer() {
  const { data: categories } = useCategories()
  return (
    <footer className="mt-24 border-t border-line bg-surface/40">
      <div className="container-page grid grid-cols-1 gap-6 border-b border-line py-10 sm:grid-cols-3">
        {promises.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brass/12 text-brass">
              <Icon size={20} />
            </span>
            <div>
              <p className="font-semibold text-ink">{title}</p>
              <p className="text-[0.88rem] text-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="container-page grid grid-cols-1 gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-[0.92rem] text-muted">
            Designer lighting for Indian homes. Pendants, chandeliers, wall lights and lamps, chosen for how they make a room feel after dark.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-4">Shop</p>
          <ul className="grid gap-2.5 text-[0.92rem]">
            {categories?.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to={`/categories/${c.slug}`} className="text-muted transition-colors hover:text-ink">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Help</p>
          <ul className="grid gap-2.5 text-[0.92rem]">
            <li>
              <Link to="/account/orders" className="text-muted transition-colors hover:text-ink">
                Track an order
              </Link>
            </li>
            <li>
              <Link to="/account" className="text-muted transition-colors hover:text-ink">
                My account
              </Link>
            </li>
            <li>
              <Link to="/cart" className="text-muted transition-colors hover:text-ink">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/products" className="text-muted transition-colors hover:text-ink">
                All products
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Visit or call</p>
          <ul className="grid gap-3 text-[0.92rem] text-muted">
            <li className="flex gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0 text-brass" /> Unique Lights Experience Centre, India
            </li>
            <li className="flex gap-3">
              <Phone size={17} className="mt-0.5 shrink-0 text-brass" /> Mon–Sat, 10 am – 7 pm
            </li>
            <li className="flex gap-3">
              <Mail size={17} className="mt-0.5 shrink-0 text-brass" /> Lighting advice by email within one working day
            </li>
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[0.8rem] text-subtle">
        <p>© {YEAR} Unique Lights. Prices exclude GST, which is added at checkout.</p>
        <p>Cash on delivery · UPI · Cards</p>
      </div>
    </footer>
  )
}

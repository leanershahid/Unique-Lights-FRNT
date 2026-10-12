import { Clock, Mail, MapPin, Phone, Truck, Undo2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCategories } from '@/features/categories/hooks'
import { useStoreSettings } from '@/features/store/hooks'
import { formatPrice } from '@/utils/format'
import { Logo } from './Logo'

const YEAR = new Date().getFullYear()

export function Footer() {
  const { data: categories } = useCategories()
  const { data: store } = useStoreSettings()

  // Delivery and return promises come from the store settings API, never from the code.
  const promises = store
    ? [
        {
          icon: Truck,
          title: `Delivered in ${store.expressDeliveryDays}–${store.standardDeliveryDays} days`,
          text: store.freeShippingThreshold > 0 ? `Free standard delivery over ${formatPrice(store.freeShippingThreshold)}` : 'Free standard delivery',
        },
        ...(store.returnDays > 0 ? [{ icon: Undo2, title: `${store.returnDays}-day returns`, text: 'On unused items in original packaging' }] : []),
      ]
    : []
  const contact = store
    ? [
        { icon: MapPin, value: store.address, href: undefined },
        { icon: Phone, value: store.supportPhone, href: store.supportPhone ? `tel:${store.supportPhone.replace(/\s/g, '')}` : undefined },
        { icon: Mail, value: store.supportEmail, href: store.supportEmail ? `mailto:${store.supportEmail}` : undefined },
        { icon: Clock, value: store.businessHours, href: undefined },
      ].filter((c) => c.value)
    : []

  return (
    <footer className="mt-24 border-t border-line bg-surface/40">
      {promises.length > 0 && (
        <div className="container-page grid grid-cols-1 gap-6 border-b border-line py-10 sm:grid-cols-2">
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
      )}

      <div className="container-page grid grid-cols-1 gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-sm">
          <Logo />
          {store?.tagline && <p className="mt-4 text-[0.92rem] text-muted">{store.tagline}</p>}
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
        {contact.length > 0 && (
          <div>
            <p className="eyebrow mb-4">Contact</p>
            <ul className="grid gap-3 text-[0.92rem] text-muted">
              {contact.map(({ icon: Icon, value, href }) => (
                <li key={value} className="flex gap-3">
                  <Icon size={17} className="mt-0.5 shrink-0 text-brass" />
                  {href ? (
                    <a href={href} className="break-all transition-colors hover:text-ink">
                      {value}
                    </a>
                  ) : (
                    <span className="whitespace-pre-line">{value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="container-page flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[0.8rem] text-subtle">
        <p>
          © {YEAR} {store?.name ?? 'Unique Lighting Studio'}.
          {store && store.taxRate > 0 && ` Prices exclude GST (${Math.round(store.taxRate * 100)}%), added at checkout.`}
        </p>
      </div>
    </footer>
  )
}

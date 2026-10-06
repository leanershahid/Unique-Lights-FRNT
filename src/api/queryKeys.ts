import type { AdminInventoryQuery, AdminOrderQuery, AdminProductQuery, AdminSearchQuery, PageQuery, ProductQuery } from '@/types/api'

/** Central React Query keys so invalidation stays consistent. */
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (q: ProductQuery) => ['products', 'list', q] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
    related: (slug: string) => ['products', 'related', slug] as const,
    filters: (category?: string) => ['products', 'filters', category ?? 'all'] as const,
    suggest: (q: string) => ['products', 'suggest', q] as const,
  },
  reviews: {
    all: (productId: string) => ['reviews', productId] as const,
    list: (productId: string, q: PageQuery) => ['reviews', productId, 'list', q] as const,
    summary: (productId: string) => ['reviews', productId, 'summary'] as const,
  },
  categories: {
    tree: ['categories'] as const,
    detail: (slug: string) => ['categories', slug] as const,
  },
  cart: ['cart'] as const,
  wishlist: ['wishlist'] as const,
  orders: {
    all: ['orders'] as const,
    list: (q: PageQuery) => ['orders', 'list', q] as const,
    detail: (orderNumber: string) => ['orders', 'detail', orderNumber] as const,
    quote: (deliveryMethod: string, coupon: string | null) => ['orders', 'quote', deliveryMethod, coupon] as const,
  },
  me: {
    profile: ['me'] as const,
    addresses: ['me', 'addresses'] as const,
  },
  admin: {
    all: ['admin'] as const,
    dashboard: ['admin', 'dashboard'] as const,
    products: (q: AdminProductQuery) => ['admin', 'products', q] as const,
    product: (id: string) => ['admin', 'product', id] as const,
    categories: ['admin', 'categories'] as const,
    orders: (q: AdminOrderQuery) => ['admin', 'orders', q] as const,
    order: (orderNumber: string) => ['admin', 'order', orderNumber] as const,
    customers: (q: AdminSearchQuery) => ['admin', 'customers', q] as const,
    customer: (id: string) => ['admin', 'customer', id] as const,
    inventory: (q: AdminInventoryQuery) => ['admin', 'inventory', q] as const,
    coupons: ['admin', 'coupons'] as const,
  },
}

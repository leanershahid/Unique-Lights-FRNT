// Mirrors docs/API.md. Keep in sync with the backend DTOs.

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string | null
  errors: Record<string, string[]> | null
  traceId?: string | null
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface PageQuery {
  page?: number
  pageSize?: number
}

// ---------- Auth & customers ----------
export type Role = 'Customer' | 'Admin'

export interface UserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  roles: string[]
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  expiresAt: string
  user: UserDto
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  phone?: string | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AddressDto {
  id: string
  label: string | null
  fullName: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface AddressRequest {
  label?: string | null
  fullName: string
  phone: string
  line1: string
  line2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

// ---------- Catalogue ----------
export interface CategoryDto {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: string | null
  sortOrder: number
  productCount: number
  children: CategoryDto[]
}

export interface CategoryRef {
  id: string
  name: string
  slug: string
}

export type ProductSort = 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'name'

export interface ProductImageDto {
  id: string
  url: string
  altText: string | null
  sortOrder: number
  isPrimary: boolean
}

export interface ProductListItemDto {
  id: string
  name: string
  slug: string
  brand: string | null
  shortDescription: string | null
  price: number
  compareAtPrice: number | null
  discountPercent: number | null
  primaryImage: ProductImageDto | null
  secondaryImage: ProductImageDto | null
  categoryName: string
  categorySlug: string
  averageRating: number
  reviewCount: number
  inStock: boolean
  isNew: boolean
  isFeatured: boolean
  defaultVariantId: string | null
}

export interface ProductVariantDto {
  id: string
  sku: string
  name: string
  color: string | null
  finish: string | null
  colorTemperature: string | null
  wattage: number | null
  price: number
  compareAtPrice: number | null
  stock: number
  inStock: boolean
  isDefault: boolean
}

export interface ProductDetailDto extends ProductListItemDto {
  sku: string
  description: string | null
  specifications: Record<string, string>
  images: ProductImageDto[]
  variants: ProductVariantDto[]
  category: CategoryRef
}

export interface ProductFiltersDto {
  brands: string[]
  finishes: string[]
  colorTemperatures: string[]
  minPrice: number
  maxPrice: number
}

export interface ProductQuery extends PageQuery {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  brands?: string[]
  finishes?: string[]
  colorTemperatures?: string[]
  inStock?: boolean
  featured?: boolean
  isNew?: boolean
  sort?: ProductSort
}

export interface SearchSuggestionsDto {
  products: ProductListItemDto[]
  categories: CategoryRef[]
}

// ---------- Reviews ----------
export interface ReviewDto {
  id: string
  productId: string
  rating: number
  title: string | null
  comment: string | null
  authorName: string
  isVerifiedPurchase: boolean
  createdAt: string
  isMine: boolean
}

export interface ReviewSummaryDto {
  averageRating: number
  reviewCount: number
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>
}

export interface CreateReviewRequest {
  productId: string
  rating: number
  title?: string | null
  comment?: string | null
}

// ---------- Cart & wishlist ----------
export interface CartItemDto {
  id: string
  variantId: string
  productId: string
  productName: string
  productSlug: string
  variantName: string
  sku: string
  imageUrl: string | null
  unitPrice: number
  compareAtPrice: number | null
  quantity: number
  lineTotal: number
  availableStock: number
}

export interface CartDto {
  id: string
  items: CartItemDto[]
  itemCount: number
  subtotal: number
}

export interface AddCartItemRequest {
  variantId: string
  quantity: number
}

export interface WishlistItemDto {
  id: string
  productId: string
  addedAt: string
  product: ProductListItemDto
}

export interface WishlistDto {
  items: WishlistItemDto[]
}

// ---------- Checkout & orders ----------
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'OutForDelivery' | 'Delivered' | 'Cancelled'
export type DeliveryMethod = 'Standard' | 'Express'
export type PaymentMethod = 'CashOnDelivery' | 'Card' | 'Upi'
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded'

export interface CouponValidationDto {
  code: string
  description: string | null
  discountAmount: number
}

export interface CheckoutQuoteRequest {
  deliveryMethod: DeliveryMethod
  couponCode?: string | null
}

export interface CheckoutQuoteDto {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  couponCode: string | null
  couponMessage: string | null
  estimatedDelivery: string
}

export interface CreateOrderRequest {
  addressId: string
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  couponCode?: string | null
  notes?: string | null
}

export interface OrderItemDto {
  id: string
  productId: string
  variantId: string
  productName: string
  productSlug: string
  variantName: string
  sku: string
  imageUrl: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface OrderAddressDto {
  fullName: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

export interface PaymentDto {
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  transactionReference: string | null
  paidAt: string | null
}

export interface OrderTimelineEntryDto {
  status: OrderStatus
  at: string | null
  completed: boolean
}

export interface OrderSummaryDto {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  itemCount: number
  placedAt: string
  previewImages: string[]
  customerName?: string | null
  customerEmail?: string | null
}

export interface OrderDto {
  id: string
  orderNumber: string
  status: OrderStatus
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  couponCode: string | null
  deliveryMethod: DeliveryMethod
  notes: string | null
  trackingNumber: string | null
  placedAt: string
  estimatedDelivery: string | null
  shippingAddress: OrderAddressDto
  payment: PaymentDto
  items: OrderItemDto[]
  timeline: OrderTimelineEntryDto[]
  customerName?: string | null
  customerEmail?: string | null
}

// ---------- Admin ----------
export interface InventoryItemDto {
  variantId: string
  productId: string
  productName: string
  variantName: string
  sku: string
  imageUrl: string | null
  quantityOnHand: number
  reservedQuantity: number
  available: number
  lowStockThreshold: number
  isLowStock: boolean
}

export interface DashboardDto {
  totalRevenue: number
  ordersCount: number
  customersCount: number
  productsCount: number
  averageOrderValue: number
  revenueLast30Days: number
  revenuePrevious30Days: number
  salesByDay: { date: string; revenue: number; orders: number }[]
  ordersByStatus: { status: OrderStatus; count: number }[]
  topProducts: { productId: string; name: string; imageUrl: string | null; unitsSold: number; revenue: number }[]
  recentOrders: OrderSummaryDto[]
  lowStock: InventoryItemDto[]
}

export interface AdminProductListItemDto {
  id: string
  name: string
  slug: string
  sku: string
  categoryName: string
  price: number
  compareAtPrice: number | null
  totalStock: number
  variantCount: number
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  primaryImageUrl: string | null
  updatedAt: string
}

export interface AdminVariantDto extends ProductVariantDto {
  isActive: boolean
  quantityOnHand: number
  reservedQuantity: number
  lowStockThreshold: number
}

export interface AdminProductDetailDto {
  id: string
  name: string
  slug: string
  sku: string
  shortDescription: string | null
  description: string | null
  brand: string | null
  basePrice: number
  compareAtPrice: number | null
  categoryId: string
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  specifications: Record<string, string>
  images: ProductImageDto[]
  variants: AdminVariantDto[]
  createdAt: string
  updatedAt: string
}

export interface UpsertProductRequest {
  name: string
  slug?: string | null
  sku: string
  shortDescription?: string | null
  description?: string | null
  brand?: string | null
  basePrice: number
  compareAtPrice?: number | null
  categoryId: string
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  specifications: Record<string, string>
}

export interface UpsertVariantRequest {
  sku: string
  name: string
  color?: string | null
  finish?: string | null
  colorTemperature?: string | null
  wattage?: number | null
  price: number
  compareAtPrice?: number | null
  isDefault: boolean
  isActive: boolean
  initialStock?: number | null
  lowStockThreshold?: number | null
}

export interface AddImageUrlRequest {
  url: string
  altText?: string | null
  isPrimary: boolean
}

export interface UpdateImageRequest {
  altText?: string | null
  sortOrder: number
  isPrimary: boolean
}

export interface UpsertCategoryRequest {
  name: string
  slug?: string | null
  description?: string | null
  imageUrl?: string | null
  parentId?: string | null
  sortOrder: number
  isActive: boolean
}

export interface AdminCategoryDto extends CategoryDto {
  isActive: boolean
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  trackingNumber?: string | null
}

export interface AdminCustomerDto {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  isActive: boolean
  roles: string[]
  ordersCount: number
  totalSpent: number
  createdAt: string
  lastOrderAt: string | null
}

export interface AdminCustomerDetailDto extends AdminCustomerDto {
  addresses: AddressDto[]
  recentOrders: OrderSummaryDto[]
}

export interface UpdateInventoryRequest {
  quantityOnHand?: number | null
  adjustment?: number | null
  lowStockThreshold?: number | null
}

export type DiscountType = 'Percentage' | 'FixedAmount'

export interface CouponDto {
  id: string
  code: string
  description: string | null
  discountType: DiscountType
  value: number
  minOrderAmount: number | null
  maxDiscountAmount: number | null
  startsAt: string | null
  endsAt: string | null
  usageLimit: number | null
  usedCount: number
  isActive: boolean
  createdAt: string
}

export interface UpsertCouponRequest {
  code: string
  description?: string | null
  discountType: DiscountType
  value: number
  minOrderAmount?: number | null
  maxDiscountAmount?: number | null
  startsAt?: string | null
  endsAt?: string | null
  usageLimit?: number | null
  isActive: boolean
}

export interface AdminProductQuery extends PageQuery {
  search?: string
  categoryId?: string
  status?: 'active' | 'inactive' | 'all'
}

export interface AdminOrderQuery extends PageQuery {
  status?: OrderStatus
  search?: string
}

export interface AdminSearchQuery extends PageQuery {
  search?: string
}

export interface AdminInventoryQuery extends PageQuery {
  search?: string
  lowStockOnly?: boolean
}

// ---------- Store settings ----------
export interface StoreSettingsDto {
  name: string
  tagline: string | null
  currency: string
  taxRate: number
  freeShippingThreshold: number
  standardShipping: number
  expressShipping: number
  standardDeliveryDays: number
  expressDeliveryDays: number
  returnDays: number
  supportEmail: string | null
  supportPhone: string | null
  address: string | null
  businessHours: string | null
}

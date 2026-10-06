import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/adminApi'
import { queryKeys } from '@/api/queryKeys'
import { useToast } from '@/hooks/useToast'
import type {
  AddImageUrlRequest,
  AdminInventoryQuery,
  AdminOrderQuery,
  AdminProductDetailDto,
  AdminProductQuery,
  AdminSearchQuery,
  UpdateImageRequest,
  UpdateInventoryRequest,
  UpdateOrderStatusRequest,
  UpsertCategoryRequest,
  UpsertCouponRequest,
  UpsertProductRequest,
  UpsertVariantRequest,
} from '@/types/api'

export function useAdminDashboard() {
  return useQuery({ queryKey: queryKeys.admin.dashboard, queryFn: adminApi.dashboard, staleTime: 60_000 })
}

// ---------- Products ----------
export function useAdminProducts(query: AdminProductQuery) {
  return useQuery({
    queryKey: queryKeys.admin.products(query),
    queryFn: () => adminApi.products.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.product(id ?? ''),
    queryFn: () => adminApi.products.get(id!),
    enabled: Boolean(id),
  })
}

/** Writes a fresh product detail into the cache and refreshes lists that show it. */
function useProductCacheSync() {
  const qc = useQueryClient()
  return (product: AdminProductDetailDto) => {
    qc.setQueryData(queryKeys.admin.product(product.id), product)
    void qc.invalidateQueries({ queryKey: ['admin', 'products'] })
    void qc.invalidateQueries({ queryKey: ['admin', 'inventory'] })
    void qc.invalidateQueries({ queryKey: queryKeys.products.all })
  }
}

export function useSaveProduct() {
  const sync = useProductCacheSync()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: UpsertProductRequest }) =>
      id ? adminApi.products.update(id, body) : adminApi.products.create(body),
    onSuccess: (product, { id }) => {
      sync(product)
      toast.success({ title: id ? 'Product saved' : 'Product created', description: product.name })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: string) => adminApi.products.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      void qc.invalidateQueries({ queryKey: queryKeys.products.all })
      toast.info({ title: 'Product deleted' })
    },
    onError: (e) => toast.fromError(e, 'Could not delete product'),
  })
}

export function useSaveVariant(productId: string) {
  const sync = useProductCacheSync()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ variantId, body }: { variantId?: string; body: UpsertVariantRequest }) =>
      variantId ? adminApi.products.updateVariant(productId, variantId, body) : adminApi.products.addVariant(productId, body),
    onSuccess: (product, { variantId }) => {
      sync(product)
      toast.success({ title: variantId ? 'Variant updated' : 'Variant added' })
    },
  })
}

export function useDeleteVariant(productId: string) {
  const sync = useProductCacheSync()
  const toast = useToast()
  return useMutation({
    mutationFn: (variantId: string) => adminApi.products.removeVariant(productId, variantId),
    onSuccess: (product) => {
      sync(product)
      toast.info({ title: 'Variant removed' })
    },
    onError: (e) => toast.fromError(e, 'Could not remove variant'),
  })
}

export function useUploadProductImage(productId: string) {
  const sync = useProductCacheSync()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ file, altText, isPrimary, onProgress }: { file: File; altText: string; isPrimary: boolean; onProgress?: (p: number) => void }) =>
      adminApi.products.uploadImage(productId, file, altText, isPrimary, onProgress),
    onSuccess: (product) => {
      sync(product)
      toast.success({ title: 'Image uploaded' })
    },
    onError: (e) => toast.fromError(e, 'Upload failed'),
  })
}

export function useAddProductImageUrl(productId: string) {
  const sync = useProductCacheSync()
  const toast = useToast()
  return useMutation({
    mutationFn: (body: AddImageUrlRequest) => adminApi.products.addImageUrl(productId, body),
    onSuccess: (product) => {
      sync(product)
      toast.success({ title: 'Image added' })
    },
    onError: (e) => toast.fromError(e, 'Could not add image'),
  })
}

export function useUpdateProductImage(productId: string) {
  const sync = useProductCacheSync()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ imageId, body }: { imageId: string; body: UpdateImageRequest }) => adminApi.products.updateImage(productId, imageId, body),
    onSuccess: sync,
    onError: (e) => toast.fromError(e, 'Could not update image'),
  })
}

export function useDeleteProductImage(productId: string) {
  const sync = useProductCacheSync()
  const toast = useToast()
  return useMutation({
    mutationFn: (imageId: string) => adminApi.products.removeImage(productId, imageId),
    onSuccess: (product) => {
      sync(product)
      toast.info({ title: 'Image removed' })
    },
    onError: (e) => toast.fromError(e, 'Could not remove image'),
  })
}

// ---------- Categories ----------
export function useAdminCategories() {
  return useQuery({ queryKey: queryKeys.admin.categories, queryFn: adminApi.categories.list })
}

export function useSaveCategory() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: UpsertCategoryRequest }) =>
      id ? adminApi.categories.update(id, body) : adminApi.categories.create(body),
    onSuccess: (cat, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.categories })
      void qc.invalidateQueries({ queryKey: queryKeys.categories.tree })
      toast.success({ title: id ? 'Category saved' : 'Category created', description: cat.name })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: string) => adminApi.categories.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.categories })
      void qc.invalidateQueries({ queryKey: queryKeys.categories.tree })
      toast.info({ title: 'Category deleted' })
    },
    onError: (e) => toast.fromError(e, 'Could not delete category'),
  })
}

// ---------- Orders ----------
export function useAdminOrders(query: AdminOrderQuery) {
  return useQuery({ queryKey: queryKeys.admin.orders(query), queryFn: () => adminApi.orders.list(query), placeholderData: keepPreviousData })
}

export function useAdminOrder(orderNumber: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.order(orderNumber ?? ''),
    queryFn: () => adminApi.orders.get(orderNumber!),
    enabled: Boolean(orderNumber),
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ orderNumber, body }: { orderNumber: string; body: UpdateOrderStatusRequest }) =>
      adminApi.orders.updateStatus(orderNumber, body),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.admin.order(order.orderNumber), order)
      void qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
      void qc.invalidateQueries({ queryKey: queryKeys.admin.dashboard })
      toast.success({ title: `Order ${order.orderNumber} updated` })
    },
    onError: (e) => toast.fromError(e, 'Could not update order'),
  })
}

// ---------- Customers ----------
export function useAdminCustomers(query: AdminSearchQuery) {
  return useQuery({
    queryKey: queryKeys.admin.customers(query),
    queryFn: () => adminApi.customers.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminCustomer(id: string | undefined) {
  return useQuery({ queryKey: queryKeys.admin.customer(id ?? ''), queryFn: () => adminApi.customers.get(id!), enabled: Boolean(id) })
}

export function useSetCustomerStatus() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.customers.setStatus(id, isActive),
    onSuccess: (c) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'customers'] })
      void qc.invalidateQueries({ queryKey: queryKeys.admin.customer(c.id) })
      toast.success({ title: c.isActive ? 'Customer reactivated' : 'Customer deactivated', description: c.email })
    },
    onError: (e) => toast.fromError(e),
  })
}

// ---------- Inventory ----------
export function useAdminInventory(query: AdminInventoryQuery) {
  return useQuery({
    queryKey: queryKeys.admin.inventory(query),
    queryFn: () => adminApi.inventory.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useUpdateInventory() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ variantId, body }: { variantId: string; body: UpdateInventoryRequest }) => adminApi.inventory.update(variantId, body),
    onSuccess: (item) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'inventory'] })
      void qc.invalidateQueries({ queryKey: queryKeys.admin.product(item.productId) })
      void qc.invalidateQueries({ queryKey: queryKeys.admin.dashboard })
      void qc.invalidateQueries({ queryKey: queryKeys.products.all })
      toast.success({ title: 'Stock updated', description: `${item.productName} · ${item.available} available` })
    },
    onError: (e) => toast.fromError(e, 'Could not update stock'),
  })
}

// ---------- Coupons ----------
export function useAdminCoupons() {
  return useQuery({ queryKey: queryKeys.admin.coupons, queryFn: adminApi.coupons.list })
}

export function useSaveCoupon() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: UpsertCouponRequest }) =>
      id ? adminApi.coupons.update(id, body) : adminApi.coupons.create(body),
    onSuccess: (c, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.coupons })
      toast.success({ title: id ? 'Coupon saved' : 'Coupon created', description: c.code })
    },
  })
}

export function useDeleteCoupon() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: string) => adminApi.coupons.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.coupons })
      toast.info({ title: 'Coupon deleted' })
    },
    onError: (e) => toast.fromError(e, 'Could not delete coupon'),
  })
}

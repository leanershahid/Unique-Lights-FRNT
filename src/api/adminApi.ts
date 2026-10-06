import type {
  AddImageUrlRequest,
  AdminCategoryDto,
  AdminCustomerDetailDto,
  AdminCustomerDto,
  AdminInventoryQuery,
  AdminOrderQuery,
  AdminProductDetailDto,
  AdminProductListItemDto,
  AdminProductQuery,
  AdminSearchQuery,
  ApiResponse,
  CouponDto,
  DashboardDto,
  InventoryItemDto,
  OrderDto,
  OrderSummaryDto,
  PagedResult,
  UpdateImageRequest,
  UpdateInventoryRequest,
  UpdateOrderStatusRequest,
  UpsertCategoryRequest,
  UpsertCouponRequest,
  UpsertProductRequest,
  UpsertVariantRequest,
} from '@/types/api'
import { http, unwrap } from './axios'

const p = (id: string) => `/admin/products/${id}`

export const adminApi = {
  dashboard: async () => unwrap(await http.get<ApiResponse<DashboardDto>>('/admin/dashboard')),

  products: {
    list: async (query: AdminProductQuery) =>
      unwrap(await http.get<ApiResponse<PagedResult<AdminProductListItemDto>>>('/admin/products', { params: query })),
    get: async (id: string) => unwrap(await http.get<ApiResponse<AdminProductDetailDto>>(p(id))),
    create: async (body: UpsertProductRequest) =>
      unwrap(await http.post<ApiResponse<AdminProductDetailDto>>('/admin/products', body)),
    update: async (id: string, body: UpsertProductRequest) => unwrap(await http.put<ApiResponse<AdminProductDetailDto>>(p(id), body)),
    remove: async (id: string) => {
      await http.delete<ApiResponse<null>>(p(id))
    },
    addVariant: async (id: string, body: UpsertVariantRequest) =>
      unwrap(await http.post<ApiResponse<AdminProductDetailDto>>(`${p(id)}/variants`, body)),
    updateVariant: async (id: string, variantId: string, body: UpsertVariantRequest) =>
      unwrap(await http.put<ApiResponse<AdminProductDetailDto>>(`${p(id)}/variants/${variantId}`, body)),
    removeVariant: async (id: string, variantId: string) =>
      unwrap(await http.delete<ApiResponse<AdminProductDetailDto>>(`${p(id)}/variants/${variantId}`)),
    uploadImage: async (id: string, file: File, altText: string, isPrimary: boolean, onProgress?: (pct: number) => void) => {
      const form = new FormData()
      form.append('file', file)
      form.append('altText', altText)
      form.append('isPrimary', String(isPrimary))
      return unwrap(
        await http.post<ApiResponse<AdminProductDetailDto>>(`${p(id)}/images`, form, {
          timeout: 60000,
          onUploadProgress: (e) => {
            if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
          },
        }),
      )
    },
    addImageUrl: async (id: string, body: AddImageUrlRequest) =>
      unwrap(await http.post<ApiResponse<AdminProductDetailDto>>(`${p(id)}/images/url`, body)),
    updateImage: async (id: string, imageId: string, body: UpdateImageRequest) =>
      unwrap(await http.patch<ApiResponse<AdminProductDetailDto>>(`${p(id)}/images/${imageId}`, body)),
    removeImage: async (id: string, imageId: string) =>
      unwrap(await http.delete<ApiResponse<AdminProductDetailDto>>(`${p(id)}/images/${imageId}`)),
  },

  categories: {
    list: async () => unwrap(await http.get<ApiResponse<AdminCategoryDto[]>>('/admin/categories')),
    create: async (body: UpsertCategoryRequest) => unwrap(await http.post<ApiResponse<AdminCategoryDto>>('/admin/categories', body)),
    update: async (id: string, body: UpsertCategoryRequest) =>
      unwrap(await http.put<ApiResponse<AdminCategoryDto>>(`/admin/categories/${id}`, body)),
    remove: async (id: string) => {
      await http.delete<ApiResponse<null>>(`/admin/categories/${id}`)
    },
  },

  orders: {
    list: async (query: AdminOrderQuery) =>
      unwrap(await http.get<ApiResponse<PagedResult<OrderSummaryDto>>>('/admin/orders', { params: query })),
    get: async (orderNumber: string) =>
      unwrap(await http.get<ApiResponse<OrderDto>>(`/admin/orders/${encodeURIComponent(orderNumber)}`)),
    updateStatus: async (orderNumber: string, body: UpdateOrderStatusRequest) =>
      unwrap(await http.patch<ApiResponse<OrderDto>>(`/admin/orders/${encodeURIComponent(orderNumber)}/status`, body)),
  },

  customers: {
    list: async (query: AdminSearchQuery) =>
      unwrap(await http.get<ApiResponse<PagedResult<AdminCustomerDto>>>('/admin/customers', { params: query })),
    get: async (id: string) => unwrap(await http.get<ApiResponse<AdminCustomerDetailDto>>(`/admin/customers/${id}`)),
    setStatus: async (id: string, isActive: boolean) =>
      unwrap(await http.patch<ApiResponse<AdminCustomerDto>>(`/admin/customers/${id}/status`, { isActive })),
  },

  inventory: {
    list: async (query: AdminInventoryQuery) =>
      unwrap(await http.get<ApiResponse<PagedResult<InventoryItemDto>>>('/admin/inventory', { params: query })),
    update: async (variantId: string, body: UpdateInventoryRequest) =>
      unwrap(await http.patch<ApiResponse<InventoryItemDto>>(`/admin/inventory/${variantId}`, body)),
  },

  coupons: {
    list: async () => unwrap(await http.get<ApiResponse<CouponDto[]>>('/admin/coupons')),
    create: async (body: UpsertCouponRequest) => unwrap(await http.post<ApiResponse<CouponDto>>('/admin/coupons', body)),
    update: async (id: string, body: UpsertCouponRequest) => unwrap(await http.put<ApiResponse<CouponDto>>(`/admin/coupons/${id}`, body)),
    remove: async (id: string) => {
      await http.delete<ApiResponse<null>>(`/admin/coupons/${id}`)
    },
  },
}

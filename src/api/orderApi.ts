import type {
  ApiResponse,
  CheckoutQuoteDto,
  CheckoutQuoteRequest,
  CouponValidationDto,
  CreateOrderRequest,
  OrderDto,
  OrderSummaryDto,
  PagedResult,
  PageQuery,
} from '@/types/api'
import { http, unwrap } from './axios'

export const orderApi = {
  quote: async (body: CheckoutQuoteRequest) => unwrap(await http.post<ApiResponse<CheckoutQuoteDto>>('/orders/quote', body)),
  create: async (body: CreateOrderRequest) => unwrap(await http.post<ApiResponse<OrderDto>>('/orders', body)),
  list: async (query: PageQuery) => unwrap(await http.get<ApiResponse<PagedResult<OrderSummaryDto>>>('/orders', { params: query })),
  byNumber: async (orderNumber: string) =>
    unwrap(await http.get<ApiResponse<OrderDto>>(`/orders/${encodeURIComponent(orderNumber)}`)),
  cancel: async (orderNumber: string) =>
    unwrap(await http.post<ApiResponse<OrderDto>>(`/orders/${encodeURIComponent(orderNumber)}/cancel`)),
  validateCoupon: async (code: string, subtotal: number) =>
    unwrap(await http.post<ApiResponse<CouponValidationDto>>('/coupons/validate', { code, subtotal })),
}

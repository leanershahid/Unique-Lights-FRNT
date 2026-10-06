import type { AddCartItemRequest, ApiResponse, CartDto } from '@/types/api'
import { http, unwrap } from './axios'

export const cartApi = {
  get: async () => unwrap(await http.get<ApiResponse<CartDto>>('/cart')),
  addItem: async (body: AddCartItemRequest) => unwrap(await http.post<ApiResponse<CartDto>>('/cart/items', body)),
  updateItem: async (itemId: string, quantity: number) =>
    unwrap(await http.patch<ApiResponse<CartDto>>(`/cart/items/${itemId}`, { quantity })),
  removeItem: async (itemId: string) => unwrap(await http.delete<ApiResponse<CartDto>>(`/cart/items/${itemId}`)),
  clear: async () => unwrap(await http.delete<ApiResponse<CartDto>>('/cart')),
  merge: async (items: AddCartItemRequest[]) => unwrap(await http.post<ApiResponse<CartDto>>('/cart/merge', { items })),
}

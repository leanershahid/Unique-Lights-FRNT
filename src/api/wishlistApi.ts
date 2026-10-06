import type { ApiResponse, WishlistDto } from '@/types/api'
import { http, unwrap } from './axios'

export const wishlistApi = {
  get: async () => unwrap(await http.get<ApiResponse<WishlistDto>>('/wishlist')),
  add: async (productId: string) => unwrap(await http.post<ApiResponse<WishlistDto>>('/wishlist', { productId })),
  remove: async (productId: string) => unwrap(await http.delete<ApiResponse<WishlistDto>>(`/wishlist/${productId}`)),
}

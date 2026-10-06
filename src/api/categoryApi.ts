import type { ApiResponse, CategoryDto } from '@/types/api'
import { http, unwrap } from './axios'

export const categoryApi = {
  tree: async () => unwrap(await http.get<ApiResponse<CategoryDto[]>>('/categories')),
  bySlug: async (slug: string) => unwrap(await http.get<ApiResponse<CategoryDto>>(`/categories/${encodeURIComponent(slug)}`)),
}

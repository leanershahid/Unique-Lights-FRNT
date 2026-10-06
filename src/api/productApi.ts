import type {
  ApiResponse,
  CreateReviewRequest,
  PagedResult,
  PageQuery,
  ProductDetailDto,
  ProductFiltersDto,
  ProductListItemDto,
  ProductQuery,
  ReviewDto,
  ReviewSummaryDto,
  SearchSuggestionsDto,
} from '@/types/api'
import { http, unwrap } from './axios'

export const productApi = {
  list: async (query: ProductQuery) =>
    unwrap(await http.get<ApiResponse<PagedResult<ProductListItemDto>>>('/products', { params: query })),
  filters: async (category?: string) =>
    unwrap(await http.get<ApiResponse<ProductFiltersDto>>('/products/filters', { params: { category } })),
  suggest: async (q: string, signal?: AbortSignal) =>
    unwrap(await http.get<ApiResponse<SearchSuggestionsDto>>('/products/suggest', { params: { q }, signal })),
  bySlug: async (slug: string) => unwrap(await http.get<ApiResponse<ProductDetailDto>>(`/products/${encodeURIComponent(slug)}`)),
  related: async (slug: string) =>
    unwrap(await http.get<ApiResponse<ProductListItemDto[]>>(`/products/${encodeURIComponent(slug)}/related`)),
}

export const reviewApi = {
  list: async (productId: string, query: PageQuery) =>
    unwrap(await http.get<ApiResponse<PagedResult<ReviewDto>>>(`/reviews/product/${productId}`, { params: query })),
  summary: async (productId: string) =>
    unwrap(await http.get<ApiResponse<ReviewSummaryDto>>(`/reviews/product/${productId}/summary`)),
  create: async (body: CreateReviewRequest) => unwrap(await http.post<ApiResponse<ReviewDto>>('/reviews', body)),
  remove: async (id: string) => {
    await http.delete<ApiResponse<null>>(`/reviews/${id}`)
  },
}

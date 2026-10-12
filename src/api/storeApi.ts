import type { ApiResponse, StoreSettingsDto } from '@/types/api'
import { http, unwrap } from './axios'

export const storeApi = {
  settings: async () => unwrap(await http.get<ApiResponse<StoreSettingsDto>>('/store')),
}

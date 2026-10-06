import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserDto } from '@/types/api'
import { http, unwrap } from './axios'

export const authApi = {
  login: async (body: LoginRequest) => unwrap(await http.post<ApiResponse<AuthResponse>>('/auth/login', body)),
  register: async (body: RegisterRequest) => unwrap(await http.post<ApiResponse<AuthResponse>>('/auth/register', body)),
  logout: async () => {
    await http.post<ApiResponse<null>>('/auth/logout')
  },
  me: async () => unwrap(await http.get<ApiResponse<UserDto>>('/auth/me')),
}

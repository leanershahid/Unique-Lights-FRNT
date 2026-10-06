import type { AddressDto, AddressRequest, ApiResponse, ChangePasswordRequest, UpdateProfileRequest, UserDto } from '@/types/api'
import { http, unwrap } from './axios'

export const customerApi = {
  me: async () => unwrap(await http.get<ApiResponse<UserDto>>('/customers/me')),
  updateProfile: async (body: UpdateProfileRequest) => unwrap(await http.put<ApiResponse<UserDto>>('/customers/me', body)),
  changePassword: async (body: ChangePasswordRequest) => {
    await http.put<ApiResponse<null>>('/customers/me/password', body)
  },
  addresses: async () => unwrap(await http.get<ApiResponse<AddressDto[]>>('/customers/me/addresses')),
  createAddress: async (body: AddressRequest) => unwrap(await http.post<ApiResponse<AddressDto>>('/customers/me/addresses', body)),
  updateAddress: async (id: string, body: AddressRequest) =>
    unwrap(await http.put<ApiResponse<AddressDto>>(`/customers/me/addresses/${id}`, body)),
  setDefaultAddress: async (id: string) =>
    unwrap(await http.patch<ApiResponse<AddressDto>>(`/customers/me/addresses/${id}/default`)),
  deleteAddress: async (id: string) => {
    await http.delete<ApiResponse<null>>(`/customers/me/addresses/${id}`)
  },
}

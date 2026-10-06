import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { customerApi } from '@/api/customerApi'
import { queryKeys } from '@/api/queryKeys'
import { useToast } from '@/hooks/useToast'
import { selectIsAuthenticated, useAppDispatch, useAppSelector } from '@/store/hooks'
import { userUpdated } from '@/store/slices/authSlice'
import type { AddressRequest, ChangePasswordRequest, UpdateProfileRequest } from '@/types/api'

export function useUpdateProfile() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => customerApi.updateProfile(body),
    onSuccess: (user) => {
      dispatch(userUpdated(user))
      toast.success({ title: 'Profile updated' })
    },
  })
}

export function useChangePassword() {
  const toast = useToast()
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => customerApi.changePassword(body),
    onSuccess: () => toast.success({ title: 'Password changed' }),
  })
}

export function useAddresses() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  return useQuery({ queryKey: queryKeys.me.addresses, queryFn: customerApi.addresses, enabled: isAuthenticated })
}

export function useSaveAddress() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: AddressRequest }) =>
      id ? customerApi.updateAddress(id, body) : customerApi.createAddress(body),
    onSuccess: (_a, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.me.addresses })
      toast.success({ title: id ? 'Address updated' : 'Address saved' })
    },
  })
}

export function useSetDefaultAddress() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: string) => customerApi.setDefaultAddress(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.me.addresses }),
    onError: (e) => toast.fromError(e),
  })
}

export function useDeleteAddress() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: string) => customerApi.deleteAddress(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.me.addresses })
      toast.info({ title: 'Address removed' })
    },
    onError: (e) => toast.fromError(e),
  })
}

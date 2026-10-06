import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { authApi } from '@/api/authApi'
import { cartApi } from '@/api/cartApi'
import { queryKeys } from '@/api/queryKeys'
import { wishlistApi } from '@/api/wishlistApi'
import { useToast } from '@/hooks/useToast'
import { store } from '@/store'
import { useAppDispatch } from '@/store/hooks'
import { credentialsReceived, loggedOut } from '@/store/slices/authSlice'
import { guestCartCleared } from '@/store/slices/guestCartSlice'
import { wishlistIntentCleared } from '@/store/slices/wishlistSlice'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/api'

/**
 * After sign-in: move the guest cart into the account and finish a wishlist save that was
 * interrupted by the sign-in prompt. Failures here never block the sign-in itself.
 */
async function syncAfterSignIn(qc: QueryClient) {
  const { guestCart, wishlistUi } = store.getState()
  if (guestCart.items.length) {
    try {
      const cart = await cartApi.merge(guestCart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })))
      qc.setQueryData(queryKeys.cart, cart)
      store.dispatch(guestCartCleared())
    } catch {
      // Keep the guest cart so nothing is lost; the user can retry from the cart.
    }
  }
  if (wishlistUi.pendingProductId) {
    try {
      qc.setQueryData(queryKeys.wishlist, await wishlistApi.add(wishlistUi.pendingProductId))
    } finally {
      store.dispatch(wishlistIntentCleared())
    }
  }
}

function useAuthSuccess() {
  const dispatch = useAppDispatch()
  const qc = useQueryClient()
  return useCallback(
    async (auth: AuthResponse) => {
      dispatch(credentialsReceived(auth))
      await syncAfterSignIn(qc)
      void qc.invalidateQueries({ queryKey: queryKeys.cart })
      void qc.invalidateQueries({ queryKey: queryKeys.wishlist })
    },
    [dispatch, qc],
  )
}

export function useLogin() {
  const onSuccess = useAuthSuccess()
  const toast = useToast()
  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: async (auth) => {
      await onSuccess(auth)
      toast.success({ title: `Welcome back, ${auth.user.firstName}` })
    },
  })
}

export function useRegister() {
  const onSuccess = useAuthSuccess()
  const toast = useToast()
  return useMutation({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
    onSuccess: async (auth) => {
      await onSuccess(auth)
      toast.success({ title: `Welcome to Unique Lights, ${auth.user.firstName}`, description: 'Your account is ready.' })
    },
  })
}

export function useLogout() {
  const dispatch = useAppDispatch()
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      dispatch(loggedOut())
      qc.removeQueries({ queryKey: queryKeys.cart })
      qc.removeQueries({ queryKey: queryKeys.wishlist })
      qc.removeQueries({ queryKey: queryKeys.orders.all })
      qc.removeQueries({ queryKey: queryKeys.me.profile })
      qc.removeQueries({ queryKey: queryKeys.admin.all })
      toast.info({ title: 'You are signed out' })
    },
  })
}

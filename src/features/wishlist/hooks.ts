import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { queryKeys } from '@/api/queryKeys'
import { wishlistApi } from '@/api/wishlistApi'
import { useToast } from '@/hooks/useToast'
import { selectIsAuthenticated, useAppDispatch, useAppSelector } from '@/store/hooks'
import { pulseWishlist } from '@/store/slices/uiSlice'
import { wishlistIntentSaved } from '@/store/slices/wishlistSlice'
import type { WishlistDto } from '@/types/api'

export function useWishlist() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: wishlistApi.get,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}

export function useIsWishlisted(productId: string): boolean {
  const { data } = useWishlist()
  return data?.items.some((i) => i.productId === productId) ?? false
}

/** Adds or removes a product. Guests are sent to sign in, and the save completes afterwards. */
export function useToggleWishlist() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const dispatch = useAppDispatch()
  const qc = useQueryClient()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const mutation = useMutation({
    mutationFn: ({ productId, add }: { productId: string; add: boolean; name: string }) =>
      add ? wishlistApi.add(productId) : wishlistApi.remove(productId),
    onMutate: async ({ productId, add }) => {
      await qc.cancelQueries({ queryKey: queryKeys.wishlist })
      const previous = qc.getQueryData<WishlistDto>(queryKeys.wishlist)
      if (previous && !add) {
        qc.setQueryData<WishlistDto>(queryKeys.wishlist, { items: previous.items.filter((i) => i.productId !== productId) })
      }
      return { previous }
    },
    onSuccess: (wishlist, { add, name }) => {
      qc.setQueryData(queryKeys.wishlist, wishlist)
      dispatch(pulseWishlist())
      toast.success({
        title: add ? 'Saved to wishlist' : 'Removed from wishlist',
        description: name,
        action: add ? { label: 'View wishlist', to: '/account/wishlist' } : undefined,
      })
    },
    onError: (e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.wishlist, ctx.previous)
      toast.fromError(e, 'Could not update wishlist')
    },
  })

  return {
    ...mutation,
    toggle: (productId: string, name: string, currentlySaved: boolean) => {
      if (!isAuthenticated) {
        dispatch(wishlistIntentSaved(productId))
        toast.info({ title: 'Sign in to save favourites', description: 'We will add it to your wishlist right after.' })
        navigate('/login', { state: { from: location.pathname + location.search } })
        return
      }
      mutation.mutate({ productId, add: !currentlySaved, name })
    },
  }
}

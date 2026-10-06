import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '@/api/cartApi'
import { queryKeys } from '@/api/queryKeys'
import { useToast } from '@/hooks/useToast'
import { selectIsAuthenticated, useAppDispatch, useAppSelector } from '@/store/hooks'
import { guestItemAdded, guestItemRemoved, guestQuantityChanged } from '@/store/slices/guestCartSlice'
import { pulseCart, setCartOpen } from '@/store/slices/uiSlice'
import type { CartDto, CartItemDto } from '@/types/api'

export interface CartView {
  items: CartItemDto[]
  itemCount: number
  subtotal: number
}

const summarize = (items: CartItemDto[]): CartView => ({
  items,
  itemCount: items.reduce((n, i) => n + i.quantity, 0),
  subtotal: Math.round(items.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100,
})

/**
 * One cart for the whole UI. Signed-in shoppers use the server cart (React Query);
 * guests use the browser cart in Redux, which is merged into the account on sign-in.
 */
export function useCart() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const guestItems = useAppSelector((s) => s.guestCart.items)
  const query = useQuery({
    queryKey: queryKeys.cart,
    queryFn: cartApi.get,
    enabled: isAuthenticated,
    staleTime: 30_000,
  })

  if (!isAuthenticated) return { cart: summarize(guestItems), isLoading: false, isError: false, isGuest: true, refetch: query.refetch }
  return {
    cart: query.data ? { items: query.data.items, itemCount: query.data.itemCount, subtotal: query.data.subtotal } : summarize([]),
    isLoading: query.isPending,
    isError: query.isError,
    isGuest: false,
    refetch: query.refetch,
  }
}

export interface AddToCartInput {
  product: { id: string; name: string; slug: string; imageUrl: string | null }
  variant: { id: string; name: string; sku: string; price: number; compareAtPrice: number | null; stock: number }
  quantity: number
  /** Open the cart drawer after adding (default true). */
  openDrawer?: boolean
  silent?: boolean
}

export function useAddToCart() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const dispatch = useAppDispatch()
  const qc = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async (input: AddToCartInput): Promise<CartDto | null> => {
      if (!isAuthenticated) {
        dispatch(
          guestItemAdded({
            id: input.variant.id,
            variantId: input.variant.id,
            productId: input.product.id,
            productName: input.product.name,
            productSlug: input.product.slug,
            variantName: input.variant.name,
            sku: input.variant.sku,
            imageUrl: input.product.imageUrl,
            unitPrice: input.variant.price,
            compareAtPrice: input.variant.compareAtPrice,
            quantity: input.quantity,
            lineTotal: input.variant.price * input.quantity,
            availableStock: input.variant.stock,
          }),
        )
        return null
      }
      return cartApi.addItem({ variantId: input.variant.id, quantity: input.quantity })
    },
    onSuccess: (cart, input) => {
      if (cart) qc.setQueryData(queryKeys.cart, cart)
      dispatch(pulseCart())
      if (input.openDrawer ?? true) dispatch(setCartOpen(true))
      if (!input.silent && !(input.openDrawer ?? true)) {
        toast.success({ title: 'Added to cart', description: `${input.product.name} · ${input.variant.name}`, imageUrl: input.product.imageUrl, action: { label: 'View cart', to: '/cart' } })
      }
    },
    onError: (e) => toast.fromError(e, 'Could not add to cart'),
  })
}

export function useUpdateCartItem() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const dispatch = useAppDispatch()
  const qc = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ item, quantity }: { item: CartItemDto; quantity: number }) => {
      if (!isAuthenticated) {
        dispatch(guestQuantityChanged({ variantId: item.variantId, quantity }))
        return null
      }
      return cartApi.updateItem(item.id, quantity)
    },
    // Optimistic: the stepper responds instantly, and rolls back if the server refuses.
    onMutate: async ({ item, quantity }) => {
      if (!isAuthenticated) return { previous: undefined }
      await qc.cancelQueries({ queryKey: queryKeys.cart })
      const previous = qc.getQueryData<CartDto>(queryKeys.cart)
      if (previous) {
        const items = previous.items.map((i) => (i.id === item.id ? { ...i, quantity, lineTotal: i.unitPrice * quantity } : i))
        qc.setQueryData<CartDto>(queryKeys.cart, { ...previous, ...summarize(items) })
      }
      return { previous }
    },
    onError: (e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.cart, ctx.previous)
      toast.fromError(e, 'Could not update quantity')
    },
    onSuccess: (cart) => {
      if (cart) qc.setQueryData(queryKeys.cart, cart)
    },
  })
}

export function useRemoveCartItem() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const dispatch = useAppDispatch()
  const qc = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async (item: CartItemDto) => {
      if (!isAuthenticated) {
        dispatch(guestItemRemoved(item.variantId))
        return null
      }
      return cartApi.removeItem(item.id)
    },
    onSuccess: (cart, item) => {
      if (cart) qc.setQueryData(queryKeys.cart, cart)
      toast.info({ title: 'Removed from cart', description: item.productName })
    },
    onError: (e) => toast.fromError(e, 'Could not remove item'),
  })
}

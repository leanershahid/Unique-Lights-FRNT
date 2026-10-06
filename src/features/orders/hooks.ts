import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '@/api/orderApi'
import { queryKeys } from '@/api/queryKeys'
import { useToast } from '@/hooks/useToast'
import { selectIsAuthenticated, useAppSelector } from '@/store/hooks'
import type { CreateOrderRequest, DeliveryMethod, PageQuery } from '@/types/api'

export function useOrders(query: PageQuery) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  return useQuery({
    queryKey: queryKeys.orders.list(query),
    queryFn: () => orderApi.list(query),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  })
}

export function useOrder(orderNumber: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderNumber ?? ''),
    queryFn: () => orderApi.byNumber(orderNumber!),
    enabled: Boolean(orderNumber),
  })
}

export function useCheckoutQuote(deliveryMethod: DeliveryMethod, couponCode: string | null, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.orders.quote(deliveryMethod, couponCode),
    queryFn: () => orderApi.quote({ deliveryMethod, couponCode }),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) => orderApi.validateCoupon(code, subtotal),
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateOrderRequest) => orderApi.create(body),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.orders.detail(order.orderNumber), order)
      void qc.invalidateQueries({ queryKey: queryKeys.cart })
      void qc.invalidateQueries({ queryKey: queryKeys.orders.all })
      void qc.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (orderNumber: string) => orderApi.cancel(orderNumber),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.orders.detail(order.orderNumber), order)
      void qc.invalidateQueries({ queryKey: queryKeys.orders.all })
      toast.info({ title: `Order ${order.orderNumber} cancelled`, description: 'Any payment will be refunded within 5–7 working days.' })
    },
    onError: (e) => toast.fromError(e, 'Could not cancel order'),
  })
}

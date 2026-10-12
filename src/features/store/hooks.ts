import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { storeApi } from '@/api/storeApi'

/** Delivery fees, delivery times, tax rate, return window and contact details, all from the API. */
export function useStoreSettings() {
  return useQuery({ queryKey: queryKeys.store, queryFn: storeApi.settings, staleTime: 30 * 60_000 })
}

/** ISO date `days` from today, for delivery estimates. */
export function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

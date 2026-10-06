import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CartItemDto } from '@/types/api'
import { readJson } from '@/utils/storage'

/**
 * Cart for visitors who are not signed in. It is kept in the browser and merged into the
 * server cart (POST /api/cart/merge) as soon as the visitor signs in. Signed-in carts live
 * only in React Query.
 */
export const GUEST_CART_KEY = 'ul.guestCart'

interface GuestCartState {
  items: CartItemDto[]
}

const MAX_QTY = 99

const initialState: GuestCartState = { items: readJson<CartItemDto[]>(GUEST_CART_KEY, []) }

const withTotal = (item: CartItemDto): CartItemDto => ({
  ...item,
  lineTotal: Math.round(item.unitPrice * item.quantity * 100) / 100,
})

const guestCartSlice = createSlice({
  name: 'guestCart',
  initialState,
  reducers: {
    guestItemAdded(state, action: PayloadAction<CartItemDto>) {
      const incoming = action.payload
      const limit = Math.max(1, Math.min(MAX_QTY, incoming.availableStock))
      const existing = state.items.find((i) => i.variantId === incoming.variantId)
      if (existing) {
        Object.assign(existing, withTotal({ ...existing, quantity: Math.min(limit, existing.quantity + incoming.quantity) }))
      } else {
        state.items.unshift(withTotal({ ...incoming, quantity: Math.min(limit, incoming.quantity) }))
      }
    },
    guestQuantityChanged(state, action: PayloadAction<{ variantId: string; quantity: number }>) {
      const item = state.items.find((i) => i.variantId === action.payload.variantId)
      if (!item) return
      const quantity = Math.max(1, Math.min(MAX_QTY, item.availableStock, action.payload.quantity))
      Object.assign(item, withTotal({ ...item, quantity }))
    },
    guestItemRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.variantId !== action.payload)
    },
    guestCartCleared(state) {
      state.items = []
    },
  },
})

export const { guestItemAdded, guestQuantityChanged, guestItemRemoved, guestCartCleared } = guestCartSlice.actions
export default guestCartSlice.reducer

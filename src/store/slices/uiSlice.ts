import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  cartOpen: boolean
  searchOpen: boolean
  mobileNavOpen: boolean
  filterSheetOpen: boolean
  /** Incremented whenever something is added to the cart so the header icon can bounce. */
  cartPulse: number
  /** Incremented whenever the wishlist changes so the header heart can pulse. */
  wishlistPulse: number
}

const initialState: UiState = {
  cartOpen: false,
  searchOpen: false,
  mobileNavOpen: false,
  filterSheetOpen: false,
  cartPulse: 0,
  wishlistPulse: 0,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.cartOpen = action.payload
      if (action.payload) state.searchOpen = state.mobileNavOpen = false
    },
    setSearchOpen(state, action: PayloadAction<boolean>) {
      state.searchOpen = action.payload
      if (action.payload) state.cartOpen = state.mobileNavOpen = false
    },
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload
    },
    setFilterSheetOpen(state, action: PayloadAction<boolean>) {
      state.filterSheetOpen = action.payload
    },
    pulseCart(state) {
      state.cartPulse += 1
    },
    pulseWishlist(state) {
      state.wishlistPulse += 1
    },
    closeAllOverlays(state) {
      state.cartOpen = state.searchOpen = state.mobileNavOpen = state.filterSheetOpen = false
    },
  },
})

export const { setCartOpen, setSearchOpen, setMobileNavOpen, setFilterSheetOpen, pulseCart, pulseWishlist, closeAllOverlays } =
  uiSlice.actions
export default uiSlice.reducer

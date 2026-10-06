import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/**
 * Wishlist UI state only. The wishlist itself is server state (React Query).
 * `pendingProductId` remembers which product a guest tried to save so it can be added right after sign-in.
 */
interface WishlistUiState {
  pendingProductId: string | null
}

const initialState: WishlistUiState = { pendingProductId: null }

const wishlistSlice = createSlice({
  name: 'wishlistUi',
  initialState,
  reducers: {
    wishlistIntentSaved(state, action: PayloadAction<string>) {
      state.pendingProductId = action.payload
    },
    wishlistIntentCleared(state) {
      state.pendingProductId = null
    },
  },
})

export const { wishlistIntentSaved, wishlistIntentCleared } = wishlistSlice.actions
export default wishlistSlice.reducer

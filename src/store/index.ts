import { configureStore } from '@reduxjs/toolkit'
import { writeJson } from '@/utils/storage'
import authReducer from './slices/authSlice'
import guestCartReducer, { GUEST_CART_KEY } from './slices/guestCartSlice'
import preferencesReducer, { PREFERENCES_KEY } from './slices/preferencesSlice'
import toastReducer from './slices/toastSlice'
import uiReducer from './slices/uiSlice'
import wishlistUiReducer from './slices/wishlistSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    guestCart: guestCartReducer,
    wishlistUi: wishlistUiReducer,
    preferences: preferencesReducer,
    toasts: toastReducer,
  },
})

// Persist only small client-owned slices. Access tokens stay in memory; the refresh token is an httpOnly cookie.
let lastPrefs = store.getState().preferences
let lastCart = store.getState().guestCart.items
store.subscribe(() => {
  const state = store.getState()
  if (state.preferences !== lastPrefs) {
    lastPrefs = state.preferences
    writeJson(PREFERENCES_KEY, lastPrefs)
  }
  if (state.guestCart.items !== lastCart) {
    lastCart = state.guestCart.items
    writeJson(GUEST_CART_KEY, lastCart)
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

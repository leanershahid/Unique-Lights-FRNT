import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthResponse, UserDto } from '@/types/api'

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'

interface AuthState {
  accessToken: string | null
  expiresAt: string | null
  user: UserDto | null
  status: AuthStatus
}

const initialState: AuthState = { accessToken: null, expiresAt: null, user: null, status: 'checking' }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsReceived(state, action: PayloadAction<AuthResponse>) {
      state.accessToken = action.payload.accessToken
      state.expiresAt = action.payload.expiresAt
      state.user = action.payload.user
      state.status = 'authenticated'
    },
    userUpdated(state, action: PayloadAction<UserDto>) {
      state.user = action.payload
    },
    loggedOut(state) {
      state.accessToken = null
      state.expiresAt = null
      state.user = null
      state.status = 'anonymous'
    },
  },
})

export const { credentialsReceived, userUpdated, loggedOut } = authSlice.actions
export default authSlice.reducer

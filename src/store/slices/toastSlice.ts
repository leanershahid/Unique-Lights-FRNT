import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  kind: ToastKind
  title: string
  description?: string
  imageUrl?: string | null
  action?: { label: string; to: string }
}

interface ToastState {
  items: Toast[]
}

const initialState: ToastState = { items: [] }

const toastSlice = createSlice({
  name: 'toasts',
  initialState,
  reducers: {
    toastAdded: {
      reducer(state, action: PayloadAction<Toast>) {
        state.items = [...state.items.slice(-3), action.payload]
      },
      prepare(toast: Omit<Toast, 'id'>) {
        return { payload: { ...toast, id: nanoid() } }
      },
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload)
    },
  },
})

export const { toastAdded, toastDismissed } = toastSlice.actions
export default toastSlice.reducer

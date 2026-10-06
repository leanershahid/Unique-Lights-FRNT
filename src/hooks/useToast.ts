import { useMemo } from 'react'
import { getErrorMessage } from '@/api/axios'
import { useAppDispatch } from '@/store/hooks'
import { toastAdded, type Toast } from '@/store/slices/toastSlice'

type ToastInput = Omit<Toast, 'id' | 'kind'>

export function useToast() {
  const dispatch = useAppDispatch()
  return useMemo(
    () => ({
      success: (t: ToastInput) => dispatch(toastAdded({ ...t, kind: 'success' })),
      info: (t: ToastInput) => dispatch(toastAdded({ ...t, kind: 'info' })),
      error: (t: ToastInput) => dispatch(toastAdded({ ...t, kind: 'error' })),
      /** Shows an API/unknown error with a sensible title. */
      fromError: (error: unknown, title = 'That did not work') =>
        dispatch(toastAdded({ kind: 'error', title, description: getErrorMessage(error) })),
    }),
    [dispatch],
  )
}

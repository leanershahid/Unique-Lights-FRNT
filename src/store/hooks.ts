import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './index'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export const selectIsAuthenticated = (s: RootState) => s.auth.status === 'authenticated'
export const selectIsAdmin = (s: RootState) => s.auth.user?.roles.includes('Admin') ?? false

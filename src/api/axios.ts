import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, AuthResponse } from '@/types/api'

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api'

/** Normalised error thrown by every API call. */
export class ApiError extends Error {
  readonly status: number
  readonly errors: Record<string, string[]> | null
  readonly traceId: string | null

  constructor(message: string, status: number, errors: Record<string, string[]> | null = null, traceId: string | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.traceId = traceId
  }

  /** First validation message for a field, if any. */
  fieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0]
  }
}

type Primitive = string | number | boolean
type QueryValue = Primitive | Primitive[] | null | undefined

/** Serialises arrays as comma lists (`brands=a,b`) and drops empty values, as the API expects. */
function serializeParams(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(','))
    } else {
      search.set(key, String(value))
    }
  }
  return search.toString()
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // Allows for the API waking from sleep on its free hosting plan.
  timeout: 60000,
  headers: { Accept: 'application/json' },
  paramsSerializer: { serialize: (p) => serializeParams(p as Record<string, QueryValue>) },
})

interface HttpHooks {
  getAccessToken: () => string | null
  onTokenRefreshed: (auth: AuthResponse) => void
  onSessionExpired: () => void
}

let hooks: HttpHooks = {
  getAccessToken: () => null,
  onTokenRefreshed: () => undefined,
  onSessionExpired: () => undefined,
}

/** Wires the HTTP client to the auth store without a circular import. Called once in main.tsx. */
export function configureHttp(next: HttpHooks): void {
  hooks = next
}

let refreshInFlight: Promise<AuthResponse> | null = null

/** Exchanges the httpOnly refresh cookie for a new access token. Concurrent callers share one request. */
export function refreshSession(): Promise<AuthResponse> {
  refreshInFlight ??= axios
    .post<ApiResponse<AuthResponse>>(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true, timeout: 15000 })
    .then((res) => {
      const auth = res.data.data
      if (!auth) throw new ApiError('Session expired', 401)
      hooks.onTokenRefreshed(auth)
      return auth
    })
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

http.interceptors.request.use((config) => {
  const token = hooks.getAccessToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

function toApiError(error: AxiosError<ApiResponse<unknown>>): ApiError {
  if (error.response) {
    const body = error.response.data
    const status = error.response.status
    const fallback =
      status === 429
        ? 'Too many attempts. Please wait a minute and try again.'
        : status >= 500
          ? 'Something went wrong on our side. Please try again.'
          : 'The request could not be completed.'
    return new ApiError(body?.message || fallback, status, body?.errors ?? null, body?.traceId ?? null)
  }
  if (error.code === 'ECONNABORTED') return new ApiError('The server took too long to respond. Please try again.', 0)
  return new ApiError('We could not reach Unique Lights. Check your connection and try again.', 0)
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const config = error.config as RetriableConfig | undefined
    const isAuthCall = config?.url?.startsWith('/auth/') ?? false

    if (error.response?.status === 401 && config && !config._retried && !isAuthCall) {
      config._retried = true
      try {
        await refreshSession()
        return http(config)
      } catch {
        hooks.onSessionExpired()
      }
    }
    return Promise.reject(toApiError(error))
  },
)

/** Unwraps the `{ success, data }` envelope. */
export function unwrap<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data as T
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong.'
}

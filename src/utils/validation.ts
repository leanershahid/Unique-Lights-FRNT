import { ApiError } from '@/api/axios'

export type Errors<T> = Partial<Record<keyof T, string>>

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
export const isIndianPhone = (v: string) => /^(\+91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ''))
export const isPin = (v: string) => /^[1-9]\d{5}$/.test(v.trim())

export function passwordProblem(v: string): string | undefined {
  if (v.length < 8) return 'Use at least 8 characters.'
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Include at least one letter and one number.'
  return undefined
}

/** Merges server-side validation errors (camelCase keys) into a form's error map. */
export function serverErrors<T>(error: unknown): Errors<T> {
  if (!(error instanceof ApiError) || !error.errors) return {}
  const out: Record<string, string> = {}
  for (const [key, messages] of Object.entries(error.errors)) {
    const field = key.charAt(0).toLowerCase() + key.slice(1)
    if (messages[0]) out[field] = messages[0]
  }
  return out as Errors<T>
}

export const hasErrors = (e: object) => Object.values(e).some(Boolean)

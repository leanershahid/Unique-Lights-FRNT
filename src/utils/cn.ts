import { clsx, type ClassValue } from 'clsx'

/** Joins class names, dropping falsy values. */
export const cn = (...values: ClassValue[]) => clsx(values)

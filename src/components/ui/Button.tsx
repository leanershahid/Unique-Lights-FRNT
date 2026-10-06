import { motion, type HTMLMotionProps } from 'motion/react'
import { forwardRef, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'subtle'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[background-color,color,border-color,box-shadow,opacity] duration-200 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-bg hover:bg-brass hover:text-on-brass',
  accent: 'bg-brass text-on-brass hover:bg-brass-strong shadow-[0_8px_30px_-10px_var(--ul-glow)]',
  outline: 'border border-line-strong text-ink hover:border-brass hover:text-brass',
  ghost: 'text-ink hover:bg-surface-2',
  subtle: 'bg-surface-2 text-ink hover:bg-line',
  danger: 'bg-danger/15 text-danger hover:bg-danger hover:text-bg',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[0.82rem]',
  md: 'h-11 px-5 text-[0.9rem]',
  lg: 'h-13 px-7 text-[0.95rem]',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, fullWidth, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClasses(variant, size), fullWidth && 'w-full', className)}
      {...rest}
    >
      {loading && <Spinner className="size-4" />}
      <span className={cn('inline-flex items-center gap-2', loading && 'opacity-80')}>{children}</span>
    </motion.button>
  )
})

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export function LinkButton({ variant = 'primary', size = 'md', fullWidth, className, ...rest }: LinkButtonProps) {
  return <Link className={cn(buttonClasses(variant, size), fullWidth && 'w-full', 'active:scale-[0.97]', className as string)} {...rest} />
}

interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  label: string
  children: ReactNode
  size?: 'sm' | 'md'
  badge?: ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, children, size = 'md', className, badge, type = 'button', ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-surface-2 hover:text-brass disabled:opacity-40',
        size === 'md' ? 'size-11' : 'size-9',
        className,
      )}
      {...rest}
    >
      {children}
      {badge}
    </motion.button>
  )
})

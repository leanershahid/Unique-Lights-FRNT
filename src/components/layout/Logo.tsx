import { Link } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/utils/cn'

interface LogoProps {
  className?: string
  to?: string
  /** `auto` follows the theme; `onDark` forces the white-lettered logo (e.g. over the hero photo). */
  tone?: 'auto' | 'onDark'
  size?: 'sm' | 'md'
}

/** Unique Lighting Studio wordmark. White lettering for dark surfaces, dark lettering for light ones. */
export function Logo({ className, to = '/', tone = 'auto', size = 'md' }: LogoProps) {
  const theme = useAppSelector((s) => s.preferences.theme)
  const onDark = tone === 'onDark' || theme === 'dark'
  const src = onDark ? '/brand/logo-on-dark' : '/brand/logo-on-light'
  return (
    <Link to={to} className={cn('group inline-flex shrink-0 items-center', className)} aria-label="Unique Lighting Studio, home">
      <picture>
        <source srcSet={`${src}.webp`} type="image/webp" />
        <img
          src={`${src}.png`}
          alt="Unique Lighting Studio"
          width={344}
          height={132}
          className={cn(
            'w-auto transition-[filter] duration-300 group-hover:drop-shadow-[0_0_10px_rgba(255,214,0,0.45)]',
            size === 'md' ? 'h-10 sm:h-11' : 'h-9',
          )}
        />
      </picture>
    </Link>
  )
}

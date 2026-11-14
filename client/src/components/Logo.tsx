import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'

interface LogoProps {
  tone?: 'light' | 'dark'
  to?: string
  className?: string
}

export function Logo({ tone = 'light', to = '/', className }: LogoProps) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center rounded-md text-[15px] font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        tone === 'dark' ? 'text-white' : 'text-slate-900',
        className,
      )}
    >
      IT Helpdesk
    </Link>
  )
}

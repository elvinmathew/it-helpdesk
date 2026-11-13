import { LifeBuoy } from 'lucide-react'
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
        'inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        className,
      )}
    >
      <span
        className={cn(
          'grid size-9 place-items-center rounded-md',
          tone === 'dark'
            ? 'bg-white/10 text-white'
            : 'bg-brand-600 text-white',
        )}
      >
        <LifeBuoy className="size-5" strokeWidth={1.9} aria-hidden="true" />
      </span>
      <span
        className={cn(
          'text-[15px] font-semibold tracking-tight',
          tone === 'dark' ? 'text-white' : 'text-slate-900',
        )}
      >
        IT Helpdesk
      </span>
    </Link>
  )
}

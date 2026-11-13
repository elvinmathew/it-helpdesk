import { CircleCheckBig, CircleExclamationPoint } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface AlertProps {
  variant?: 'error' | 'success'
  children: ReactNode
  className?: string
}

export function Alert({
  variant = 'error',
  children,
  className,
}: AlertProps) {
  const Icon =
    variant === 'error' ? CircleExclamationPoint : CircleCheckBig

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex gap-2.5 rounded-md border px-3.5 py-3 text-sm',
        variant === 'error'
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800',
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

import { CircleCheckBig, CircleExclamationPoint } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription } from './alert'
import { cn } from '@/lib/utils'

interface FeedbackAlertProps {
  tone?: 'error' | 'success'
  children: ReactNode
  className?: string
}

export function FeedbackAlert({
  tone = 'error',
  children,
  className,
}: FeedbackAlertProps) {
  return (
    <Alert
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        tone === 'error'
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800',
        className,
      )}
    >
      {tone === 'error' ? (
        <CircleExclamationPoint aria-hidden="true" />
      ) : (
        <CircleCheckBig aria-hidden="true" />
      )}
      <AlertDescription className="text-current">{children}</AlertDescription>
    </Alert>
  )
}

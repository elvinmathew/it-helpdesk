import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TicketEmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function TicketEmptyState({
  title,
  description,
  action,
  className,
}: TicketEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Inbox className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

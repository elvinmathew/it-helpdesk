import { Clock3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Priority } from '../../api/types'
import { PRIORITY_LABELS, priorityTone, statusTone } from '../../lib/ticket-meta'

export function StatusBadge({ name }: { name: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('rounded-full px-2.5 py-0.5 font-medium', statusTone(name))}
    >
      {name}
    </Badge>
  )
}

export function PriorityBadge({ priority }: { priority: Priority | null }) {
  if (!priority) {
    return <span className="text-xs text-slate-400">No priority</span>
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-2.5 py-0.5 font-medium',
        priorityTone(priority),
      )}
    >
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}

export function OverdueBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1 rounded-full border-red-200 bg-red-50 px-2 py-0.5 font-medium text-red-700"
    >
      <Clock3 className="size-3" aria-hidden="true" />
      Overdue
    </Badge>
  )
}

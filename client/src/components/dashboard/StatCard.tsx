import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type StatTone = 'brand' | 'amber' | 'red' | 'emerald' | 'slate'

const TONES: Record<StatTone, string> = {
  brand: 'bg-brand-50 text-brand-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-slate-100 text-slate-600',
}

interface StatCardProps {
  label: string
  value: number
  hint?: string
  icon: LucideIcon
  tone?: StatTone
  loading?: boolean
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'brand',
  loading = false,
}: StatCardProps) {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-12" />
          ) : (
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              {value}
            </p>
          )}
          {hint ? (
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          ) : null}
        </div>

        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md',
            TONES[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  )
}

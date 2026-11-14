import {
  ArrowLeft,
  CircleCheckBig,
  Clock3,
  Inbox,
  UserX,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/dashboard'
import type { CategoryCount, PriorityCount } from '../api/types'
import { AppShell } from '../components/layout/AppShell'
import { AgentWorkload } from '../components/dashboard/AgentWorkload'
import { StatCard } from '../components/dashboard/StatCard'
import { TicketsChart } from '../components/dashboard/TicketsChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FeedbackAlert } from '../components/ui/FeedbackAlert'
import { PRIORITY_LABELS } from '../lib/ticket-meta'
import { useAsyncData } from '../lib/use-async-data'
import { cn } from '@/lib/utils'

function BreakdownRow({
  label,
  count,
  total,
}: {
  label: string
  count: number
  total: number
}) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <li className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate text-slate-700">{label}</span>
        <span className="shrink-0 font-medium text-slate-900">
          {count}
          <span className="ml-1 text-xs font-normal text-slate-500">
            {percent}%
          </span>
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-slate-100"
        role="presentation"
      >
        <div
          className={cn('h-full rounded-full bg-brand-500')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </li>
  )
}

function CategoryBreakdown({ data }: { data: CategoryCount[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const rows = [...data].sort((left, right) => right.count - left.count)

  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <CardTitle className="text-sm font-semibold text-slate-900">
          Tickets by category
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {total === 0 ? (
          <p className="text-sm text-slate-500">No tickets to break down yet.</p>
        ) : (
          <ul className="space-y-4">
            {rows.map((item) => (
              <BreakdownRow
                key={item.categoryId}
                label={item.categoryName}
                count={item.count}
                total={total}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function PriorityBreakdown({ data }: { data: PriorityCount[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <CardTitle className="text-sm font-semibold text-slate-900">
          Tickets by priority
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {total === 0 ? (
          <p className="text-sm text-slate-500">No tickets to break down yet.</p>
        ) : (
          <ul className="space-y-4">
            {data.map((item) => (
              <BreakdownRow
                key={item.priority ?? 'none'}
                label={
                  item.priority
                    ? PRIORITY_LABELS[item.priority]
                    : 'No priority'
                }
                count={item.count}
                total={total}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function AdminInsightsPage() {
  const dashboard = useAsyncData(() => dashboardApi.admin(), 'admin-insights')
  const data = dashboard.data
  const loading = dashboard.loading && !data

  return (
    <AppShell>
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to overview
      </Link>

      <div className="mt-4">
        <p className="text-sm font-medium text-brand-700">Admin workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Insights
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Where tickets come from, how they are prioritised, and who is
          carrying the load.
        </p>
      </div>

      {dashboard.error ? (
        <FeedbackAlert className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span>{dashboard.error}</span>
            <button
              type="button"
              onClick={dashboard.reload}
              className="font-medium underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </FeedbackAlert>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Open tickets"
          value={data?.openTickets ?? 0}
          icon={Inbox}
          tone="amber"
          loading={dashboard.loading}
        />
        <StatCard
          label="Resolved tickets"
          value={data?.resolvedTickets ?? 0}
          icon={CircleCheckBig}
          tone="emerald"
          loading={dashboard.loading}
        />
        <StatCard
          label="Overdue tickets"
          value={data?.overdueTickets ?? 0}
          icon={Clock3}
          tone="red"
          loading={dashboard.loading}
        />
        <StatCard
          label="Unassigned tickets"
          value={data?.unassignedTickets ?? 0}
          icon={UserX}
          tone="slate"
          loading={dashboard.loading}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <TicketsChart data={data?.byStatus ?? []} />
        )}

        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <AgentWorkload data={data?.byAgent ?? []} />
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <CategoryBreakdown data={data?.byCategory ?? []} />
        )}

        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <PriorityBreakdown data={data?.byPriority ?? []} />
        )}
      </div>
    </AppShell>
  )
}

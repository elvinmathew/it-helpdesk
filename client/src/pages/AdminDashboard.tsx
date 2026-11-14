import {
  ArrowUpRight,
  ChartColumn,
  Clock3,
  Inbox,
  ListChecks,
  Settings,
  Ticket as TicketIcon,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/dashboard'
import { AppShell } from '../components/layout/AppShell'
import { AgentWorkload } from '../components/dashboard/AgentWorkload'
import { StatCard } from '../components/dashboard/StatCard'
import { TicketsChart } from '../components/dashboard/TicketsChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FeedbackAlert } from '../components/ui/FeedbackAlert'
import { useAsyncData } from '../lib/use-async-data'

export function AdminDashboard() {
  const dashboard = useAsyncData(() => dashboardApi.admin(), 'admin')

  return (
    <AppShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700">Admin workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            A live snapshot of the helpdesk and the people working it.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/insights">
              <ChartColumn className="size-4" aria-hidden="true" />
              Insights
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/settings">
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {dashboard.error ? (
        <FeedbackAlert className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span>{dashboard.error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={dashboard.reload}
              className="border-red-200 bg-white text-red-800"
            >
              Try again
            </Button>
          </div>
        </FeedbackAlert>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total tickets"
          value={dashboard.data?.totalTickets ?? 0}
          icon={TicketIcon}
          loading={dashboard.loading}
        />
        <StatCard
          label="Open tickets"
          value={dashboard.data?.openTickets ?? 0}
          icon={Inbox}
          tone="amber"
          loading={dashboard.loading}
        />
        <StatCard
          label="Overdue tickets"
          value={dashboard.data?.overdueTickets ?? 0}
          icon={Clock3}
          tone="red"
          loading={dashboard.loading}
        />
        <StatCard
          label="Active agents"
          value={dashboard.data?.activeAgents ?? 0}
          icon={Users}
          tone="emerald"
          loading={dashboard.loading}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {dashboard.loading && !dashboard.data ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <TicketsChart data={dashboard.data?.byStatus ?? []} />
        )}

        {dashboard.loading && !dashboard.data ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <AgentWorkload data={dashboard.data?.byAgent ?? []} />
        )}
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/admin/insights" className="group">
          <Card className="h-full gap-0 py-0 shadow-none transition-colors group-hover:border-brand-300">
            <CardContent className="flex items-start gap-4 p-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <ChartColumn className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="flex items-center gap-1 text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                  Insights
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Category and priority breakdowns, status mix, and agent load.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/settings" className="group">
          <Card className="h-full gap-0 py-0 shadow-none transition-colors group-hover:border-brand-300">
            <CardContent className="flex items-start gap-4 p-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                <ListChecks className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="flex items-center gap-1 text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                  Settings
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Manage users, statuses, categories, and the overdue rule.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>
    </AppShell>
  )
}

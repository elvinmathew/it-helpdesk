import {
  Clock3,
  Inbox,
  LayoutList,
  ListChecks,
  Tags,
  Ticket as TicketIcon,
  Timer,
  UserCog,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/dashboard'
import { AppShell } from '../components/layout/AppShell'
import { AgentWorkload } from '../components/dashboard/AgentWorkload'
import { StatCard } from '../components/dashboard/StatCard'
import { TicketsChart } from '../components/dashboard/TicketsChart'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FeedbackAlert } from '../components/ui/FeedbackAlert'
import { useResource } from '../lib/use-resource'

const SETTINGS = [
  {
    to: '/admin/users',
    title: 'Users',
    description: 'Change roles and deactivate accounts.',
    icon: UserCog,
  },
  {
    to: '/admin/statuses',
    title: 'Statuses',
    description: 'Rename, recolour, reorder, or retire statuses.',
    icon: ListChecks,
  },
  {
    to: '/admin/categories',
    title: 'Categories',
    description: 'Manage the categories employees can pick.',
    icon: Tags,
  },
  {
    to: '/admin/rules',
    title: 'Auto-rules',
    description: 'Edit the timers behind automatic status changes.',
    icon: Timer,
  },
]

export function AdminDashboard() {
  const dashboard = useResource(() => dashboardApi.admin(), 'admin')

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

        <Link
          to="/agent"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <LayoutList className="size-4" aria-hidden="true" />
          Open ticket queue
        </Link>
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

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-slate-900">Settings</h2>
        <p className="mt-1 text-sm text-slate-600">
          Manage the pieces that shape the ticket workflow.
        </p>

        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SETTINGS.map((item) => {
            const Icon = item.icon

            return (
              <Link key={item.to} to={item.to} className="group">
                <Card className="h-full gap-0 py-0 shadow-none transition-colors group-hover:border-brand-300">
                  <CardContent className="p-5">
                    <span className="flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </AppShell>
  )
}

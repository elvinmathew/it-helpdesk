import { CircleCheckBig, Plus, Ticket as TicketIcon } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { catalogApi } from '../api/catalog'
import { dashboardApi } from '../api/dashboard'
import { ticketsApi } from '../api/tickets'
import type { Priority, TicketFilters as Filters } from '../api/types'
import { AppShell } from '../components/layout/AppShell'
import { StatCard } from '../components/dashboard/StatCard'
import { TicketEmptyState } from '../components/tickets/TicketEmptyState'
import { TicketFilters } from '../components/tickets/TicketFilters'
import { TicketTable } from '../components/tickets/TicketTable'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FeedbackAlert } from '../components/ui/FeedbackAlert'
import { useResource } from '../lib/use-resource'

function readFilters(params: URLSearchParams): Filters {
  return {
    statusId: params.get('status') ?? undefined,
    priority: (params.get('priority') as Priority | null) ?? undefined,
    search: params.get('q') ?? undefined,
  }
}

function writeFilters(filters: Filters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.statusId) params.set('status', filters.statusId)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.search) params.set('q', filters.search)

  return params
}

export function EmployeeDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readFilters(searchParams)

  const dashboard = useResource(() => dashboardApi.employee(), 'employee')
  const catalog = useResource(
    () => catalogApi.statuses(),
    'employee-statuses',
  )
  const tickets = useResource(
    () => ticketsApi.list(filters),
    JSON.stringify(filters),
  )

  const applyFilters = (next: Filters) => {
    setSearchParams(writeFilters(next), { replace: true })
  }

  const statuses = catalog.data ?? []
  const hasFilters = Boolean(filters.statusId || filters.priority || filters.search)

  return (
    <AppShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700">
            Employee workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            My tickets
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Raise a ticket and follow it from open to resolved.
          </p>
        </div>

        <Button asChild>
          <Link to="/tickets/new">
            <Plus className="size-4" aria-hidden="true" />
            Raise new ticket
          </Link>
        </Button>
      </div>

      {dashboard.error ? (
        <FeedbackAlert className="mt-6">{dashboard.error}</FeedbackAlert>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="My open tickets"
          value={dashboard.data?.openCount ?? 0}
          hint="Not resolved or closed"
          icon={TicketIcon}
          loading={dashboard.loading}
        />
        <StatCard
          label="My resolved tickets"
          value={dashboard.data?.resolvedCount ?? 0}
          hint="Marked as resolved"
          icon={CircleCheckBig}
          tone="emerald"
          loading={dashboard.loading}
        />
      </div>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent tickets
          </h2>
          {!tickets.loading && tickets.data ? (
            <p className="text-xs text-slate-500">
              {tickets.data.length}{' '}
              {tickets.data.length === 1 ? 'ticket' : 'tickets'}
            </p>
          ) : null}
        </div>

        <div className="mt-3">
          <TicketFilters
            value={filters}
            onChange={applyFilters}
            statuses={statuses}
            showSearch
          />
        </div>

        <div className="mt-4">
          {tickets.error ? (
            <FeedbackAlert>
              <div className="flex flex-wrap items-center gap-3">
                <span>{tickets.error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={tickets.reload}
                  className="border-red-200 bg-white text-red-800"
                >
                  Try again
                </Button>
              </div>
            </FeedbackAlert>
          ) : tickets.loading && !tickets.data ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((row) => (
                <Skeleton key={row} className="h-16 w-full" />
              ))}
            </div>
          ) : tickets.data && tickets.data.length > 0 ? (
            <TicketTable tickets={tickets.data} perspective="employee" />
          ) : (
            <TicketEmptyState
              title={hasFilters ? 'No matching tickets' : 'No tickets yet'}
              description={
                hasFilters
                  ? 'Try a different status, priority, or search term.'
                  : 'When you raise a ticket it will appear here, with its status and priority.'
              }
              action={
                hasFilters ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyFilters({})}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <Link to="/tickets/new">
                      <Plus className="size-4" aria-hidden="true" />
                      Raise new ticket
                    </Link>
                  </Button>
                )
              }
            />
          )}
        </div>
      </section>
    </AppShell>
  )
}

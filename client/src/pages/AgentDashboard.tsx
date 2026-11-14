import { Clock3, Inbox } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { catalogApi } from '../api/catalog'
import { dashboardApi } from '../api/dashboard'
import { ticketsApi } from '../api/tickets'
import type {
  Priority,
  Ticket,
  TicketFilters as Filters,
} from '../api/types'
import { useAuth } from '../auth/context'
import { AppShell } from '../components/layout/AppShell'
import { StatCard } from '../components/dashboard/StatCard'
import { KanbanBoard } from '../components/tickets/KanbanBoard'
import { TicketEmptyState } from '../components/tickets/TicketEmptyState'
import { TicketFilters } from '../components/tickets/TicketFilters'
import { TicketTable } from '../components/tickets/TicketTable'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeedbackAlert } from '../components/ui/FeedbackAlert'
import { errorMessage } from '../lib/errors'
import { PRIORITY_LABELS } from '../lib/ticket-meta'
import { useAsyncData } from '../lib/use-async-data'

type View = 'kanban' | 'table'

function readFilters(params: URLSearchParams): Filters {
  return {
    statusId: params.get('status') ?? undefined,
    priority: (params.get('priority') as Priority | null) ?? undefined,
    categoryId: params.get('category') ?? undefined,
    assignee: params.get('assignee') ?? undefined,
    search: params.get('q') ?? undefined,
  }
}

function writeFilters(filters: Filters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.statusId) params.set('status', filters.statusId)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.categoryId) params.set('category', filters.categoryId)
  if (filters.assignee) params.set('assignee', filters.assignee)
  if (filters.search) params.set('q', filters.search)

  return params
}

export function AgentDashboard() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<View>('kanban')
  const [pendingTicketId, setPendingTicketId] = useState<string | null>(null)
  const filters = readFilters(searchParams)

  const dashboard = useAsyncData(() => dashboardApi.agent(), 'agent')
  const catalog = useAsyncData(
    () =>
      Promise.all([catalogApi.statuses(), catalogApi.categories()]).then(
        ([statuses, categories]) => ({ statuses, categories }),
      ),
    'agent-catalog',
  )
  const tickets = useAsyncData(
    () => ticketsApi.list(filters),
    JSON.stringify(filters),
  )

  const statuses = catalog.data?.statuses ?? []
  const categories = catalog.data?.categories ?? []
  const hasFilters = Boolean(
    filters.statusId ||
      filters.priority ||
      filters.categoryId ||
      filters.assignee ||
      filters.search,
  )

  const applyFilters = (next: Filters) => {
    setSearchParams(writeFilters(next), { replace: true })
  }

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action()
      toast.success(message)
      dashboard.reload()
      tickets.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const handleMove = async (ticketId: string, statusId: string) => {
    const status = statuses.find((item) => item.id === statusId)
    if (!status) return

    setPendingTicketId(ticketId)

    try {
      await ticketsApi.setStatus(ticketId, statusId)
      toast.success(`Moved to ${status.name}`)
      dashboard.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setPendingTicketId(null)
      tickets.reload()
    }
  }

  const handleStatusChange = (ticket: Ticket, statusId: string) => {
    const status = statuses.find((item) => item.id === statusId)
    void run(
      () => ticketsApi.setStatus(ticket.id, statusId),
      `Moved to ${status?.name ?? 'the new status'}`,
    )
  }

  const handleAssign = (ticket: Ticket, assigneeId: string | null) => {
    const message =
      assigneeId === null
        ? 'Ticket unassigned'
        : assigneeId === user?.id
          ? 'Ticket assigned to you'
          : 'Ticket reassigned'

    void run(() => ticketsApi.assign(ticket.id, assigneeId), message)
  }

  const handlePriority = (ticket: Ticket, priority: Priority | null) => {
    void run(
      () => ticketsApi.setPriority(ticket.id, priority),
      priority
        ? `Priority set to ${PRIORITY_LABELS[priority]}`
        : 'Priority cleared',
    )
  }

  const assigneeOptions = user
    ? [
        { value: 'unassigned', label: 'Unassigned' },
        { value: user.id, label: 'Assigned to me' },
      ]
    : []

  return (
    <AppShell>
      <div>
        <p className="text-sm font-medium text-brand-700">
          {user?.role === 'admin' ? 'Admin workspace' : 'Agent workspace'}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Ticket queue
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Work the queue, pick up tickets, and keep every status up to date.
        </p>
      </div>

      {dashboard.error ? (
        <FeedbackAlert className="mt-6">{dashboard.error}</FeedbackAlert>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Unassigned tickets"
          value={dashboard.data?.unassignedCount ?? 0}
          hint="Open or in progress with no owner"
          icon={Inbox}
          loading={dashboard.loading}
        />
        <StatCard
          label="Overdue tickets"
          value={dashboard.data?.overdueCount ?? 0}
          hint="Open, unassigned, older than 24 hours"
          icon={Clock3}
          tone="red"
          loading={dashboard.loading}
        />
      </div>

      <div className="mt-8">
        <TicketFilters
          value={filters}
          onChange={applyFilters}
          statuses={statuses}
          categories={categories}
          assigneeOptions={assigneeOptions}
          showSearch
          showCategory
          showAssignee
        />
      </div>

      <Tabs
        value={view}
        onValueChange={(next) => setView(next as View)}
        className="mt-4"
      >
        <div className="flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          {!tickets.loading && tickets.data ? (
            <p className="text-xs text-slate-500">
              {tickets.data.length}{' '}
              {tickets.data.length === 1 ? 'ticket' : 'tickets'}
            </p>
          ) : null}
        </div>

        {tickets.error ? (
          <FeedbackAlert className="mt-4">
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
          <div className="mt-4 space-y-2">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-16 w-full" />
            ))}
          </div>
        ) : tickets.data && tickets.data.length === 0 ? (
          <TicketEmptyState
            className="mt-4"
            title={hasFilters ? 'No matching tickets' : 'The queue is clear'}
            description={
              hasFilters
                ? 'Try a different status, priority, category, assignee, or search term.'
                : 'There are no tickets in the queue right now.'
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
              ) : undefined
            }
          />
        ) : (
          <>
            <TabsContent value="kanban" className="mt-4">
              <KanbanBoard
                tickets={tickets.data ?? []}
                statuses={statuses}
                onMove={handleMove}
                pendingTicketId={pendingTicketId}
              />
            </TabsContent>

            <TabsContent value="table" className="mt-4">
              <TicketTable
                tickets={tickets.data ?? []}
                perspective="agent"
                statuses={statuses}
                currentUserId={user?.id}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriority}
                onAssign={handleAssign}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </AppShell>
  )
}

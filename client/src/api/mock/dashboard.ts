import type {
  AdminDashboard,
  AgentDashboard,
  EmployeeDashboard,
  Status,
} from '../types'
import { currentUser, getStatuses, listTickets, loadData } from './db'

const LATENCY_MS = 300

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
}

const INACTIVE_STATUS_NAMES = new Set(['resolved', 'closed'])

function isOpen(status: Status): boolean {
  return !INACTIVE_STATUS_NAMES.has(status.name.toLowerCase())
}

export async function mockEmployeeDashboard(): Promise<EmployeeDashboard> {
  await wait()
  const user = currentUser()
  const tickets = listTickets(user)

  return {
    openCount: tickets.filter(
      (ticket) => !INACTIVE_STATUS_NAMES.has(ticket.statusName.toLowerCase()),
    ).length,
    resolvedCount: tickets.filter(
      (ticket) => ticket.statusName.toLowerCase() === 'resolved',
    ).length,
  }
}

export async function mockAgentDashboard(): Promise<AgentDashboard> {
  await wait()
  const user = currentUser()
  const tickets = listTickets(user)
  const statuses = getStatuses()
  const openStatusIds = new Set(
    statuses.filter(isOpen).map((status) => status.id),
  )

  return {
    unassignedCount: tickets.filter(
      (ticket) => !ticket.assignedTo && openStatusIds.has(ticket.statusId),
    ).length,
    overdueCount: tickets.filter((ticket) => ticket.overdue).length,
  }
}

export async function mockAdminDashboard(): Promise<AdminDashboard> {
  await wait()
  const data = loadData()
  const tickets = listTickets(currentUser(), {})
  const statuses = getStatuses()

  const byStatus = statuses.map((status) => ({
    statusId: status.id,
    statusName: status.name,
    count: tickets.filter((ticket) => ticket.statusId === status.id).length,
  }))

  const byAgent = data.users
    .filter((user) => user.role === 'agent' && user.active !== false)
    .map((user) => ({
      agentId: user.id,
      agentName: user.name,
      count: tickets.filter((ticket) => ticket.assignedTo === user.id).length,
    }))
    .sort((left, right) => right.count - left.count)

  const openStatusIds = new Set(
    statuses.filter(isOpen).map((status) => status.id),
  )

  return {
    totalTickets: tickets.length,
    openTickets: tickets.filter((ticket) => openStatusIds.has(ticket.statusId))
      .length,
    overdueTickets: tickets.filter((ticket) => ticket.overdue).length,
    activeAgents: data.users.filter(
      (user) => user.role === 'agent' && user.active !== false,
    ).length,
    byStatus,
    byAgent,
  }
}

import { firstString, isRecord } from '../lib/guards'
import { request, USE_MOCK } from './client'
import {
  mockAdminDashboard,
  mockAgentDashboard,
  mockEmployeeDashboard,
} from './mock/dashboard'
import {
  ApiError,
  type AdminDashboard,
  type AgentCount,
  type AgentDashboard,
  type EmployeeDashboard,
  type StatusCount,
} from './types'

function unwrap(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new ApiError('The server returned an unexpected dashboard.', 500)
  }

  if (isRecord(value.data)) {
    return value.data
  }

  return value
}

function count(
  record: Record<string, unknown>,
  keys: string[],
): number {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value)
    }
  }

  return 0
}

function normalizeStatusCounts(value: unknown): StatusCount[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (!isRecord(item)) return []
    const statusId =
      typeof item.statusId === 'string'
        ? item.statusId
        : typeof item.id === 'string'
          ? item.id
          : firstString(item.statusName) ?? firstString(item.name)
    const statusName = firstString(item.statusName) ?? firstString(item.name)
    const total = count(item, ['count', 'total', 'tickets'])

    return statusId && statusName
      ? [{ statusId, statusName, count: total }]
      : []
  })
}

function normalizeAgentCounts(value: unknown): AgentCount[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (!isRecord(item)) return []
    const agentId =
      typeof item.agentId === 'string'
        ? item.agentId
        : typeof item.id === 'string'
          ? item.id
          : firstString(item.agentName) ?? firstString(item.name)
    const agentName = firstString(item.agentName) ?? firstString(item.name)
    const total = count(item, ['count', 'total', 'tickets', 'handled'])

    return agentId && agentName
      ? [{ agentId, agentName, count: total }]
      : []
  })
}

export const dashboardApi = {
  async employee(): Promise<EmployeeDashboard> {
    if (USE_MOCK) {
      return mockEmployeeDashboard()
    }

    const record = unwrap(await request<unknown>('/dashboard/employee'))

    return {
      openCount: count(record, ['openCount', 'myOpenTickets', 'openTickets']),
      resolvedCount: count(record, [
        'resolvedCount',
        'myResolvedTickets',
        'resolvedTickets',
      ]),
    }
  },

  async agent(): Promise<AgentDashboard> {
    if (USE_MOCK) {
      return mockAgentDashboard()
    }

    const record = unwrap(await request<unknown>('/dashboard/agent'))

    return {
      unassignedCount: count(record, ['unassignedCount', 'unassignedTickets']),
      overdueCount: count(record, ['overdueCount', 'overdueTickets']),
    }
  },

  async admin(): Promise<AdminDashboard> {
    if (USE_MOCK) {
      return mockAdminDashboard()
    }

    const record = unwrap(await request<unknown>('/dashboard/admin'))
    const byStatus = normalizeStatusCounts(
      record.byStatus ?? record.ticketsByStatus ?? record.statusCounts,
    )
    const byAgent = normalizeAgentCounts(
      record.byAgent ?? record.ticketsPerAgent ?? record.agentCounts,
    )

    return {
      totalTickets: count(record, ['totalTickets', 'total']),
      openTickets: count(record, ['openTickets', 'openCount']),
      overdueTickets: count(record, ['overdueTickets', 'overdueCount']),
      activeAgents: count(record, ['activeAgents', 'agentCount']),
      byStatus,
      byAgent,
    }
  },
}

import { firstString, isRecord } from '../lib/guards'
import { request, USE_MOCK } from './client'
import {
  mockAddComment,
  mockAssignTicket,
  mockCreateTicket,
  mockGetTicket,
  mockListTickets,
  mockSetPriority,
  mockSetStatus,
} from './mock/tickets'
import {
  ApiError,
  type Comment,
  type CreateTicketInput,
  type Priority,
  type StatusChange,
  type Ticket,
  type TicketDetail,
  type TicketFilters,
} from './types'

function idOf(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number') return String(value)
  return null
}

function priorityOf(value: unknown): Priority | null {
  if (typeof value !== 'string') return null
  const priority = value.trim().toLowerCase()
  return priority === 'low' || priority === 'medium' || priority === 'high'
    ? priority
    : null
}

function asRecord(value: unknown, message: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new ApiError(message, 500)
  }
  return value
}

/**
 * The backend may wrap payloads in `data` or name the record after the
 * resource. This helper keeps that tolerance in one place.
 */
function unwrapRecord(value: unknown, keys: string[] = []): Record<string, unknown> {
  const record = asRecord(value, 'The server returned an unexpected response.')

  for (const key of keys) {
    if (isRecord(record[key])) {
      return record[key] as Record<string, unknown>
    }
  }

  if (isRecord(record.data)) {
    for (const key of keys) {
      if (isRecord(record.data[key])) {
        return record.data[key] as Record<string, unknown>
      }
    }
    return record.data
  }

  return record
}

function relatedName(
  record: Record<string, unknown>,
  key: string,
  nameKey: string,
): string | null {
  const related = record[key]

  if (isRecord(related)) {
    return firstString(related.name) ?? null
  }

  return firstString(record[nameKey]) ?? null
}

function relatedId(
  record: Record<string, unknown>,
  key: string,
  idKey: string,
): string | null {
  const related = record[key]

  if (isRecord(related)) {
    return idOf(related.id)
  }

  return idOf(record[idKey]) ?? idOf(related)
}

export function normalizeTicket(value: unknown): Ticket {
  const record = unwrapRecord(value, ['ticket'])
  const statusName =
    relatedName(record, 'status', 'statusName') ??
    firstString(record.status) ??
    'Open'
  const statusId =
    relatedId(record, 'status', 'statusId') ?? statusName.toLowerCase()
  const assignedTo = relatedId(record, 'assignedTo', 'assignedToId')
  const createdAt = firstString(record.createdAt) ?? new Date().toISOString()
  const updatedAt = firstString(record.updatedAt) ?? createdAt
  const assignedName =
    relatedName(record, 'assignedTo', 'assignedToName') ?? null

  const overdue =
    typeof record.overdue === 'boolean'
      ? record.overdue
      : statusName.toLowerCase() === 'open' &&
        !assignedTo &&
        Date.now() - new Date(createdAt).getTime() > 24 * 60 * 60 * 1000

  const title = firstString(record.title)

  if (!title) {
    throw new ApiError('The server returned a ticket without a title.', 500)
  }

  return {
    id:
      idOf(record.id) ??
      (() => {
        throw new ApiError('The server returned a ticket without an id.', 500)
      })(),
    title,
    description: firstString(record.description) ?? '',
    categoryId:
      relatedId(record, 'category', 'categoryId') ?? 'uncategorised',
    categoryName:
      relatedName(record, 'category', 'categoryName') ?? 'Uncategorised',
    priority: priorityOf(record.priority),
    statusId,
    statusName,
    createdBy: relatedId(record, 'createdBy', 'createdById') ?? '',
    createdByName:
      relatedName(record, 'createdBy', 'createdByName') ?? 'Unknown user',
    assignedTo,
    assignedToName: assignedName,
    createdAt,
    updatedAt,
    overdue,
  }
}

function ticketList(value: unknown): Ticket[] {
  if (Array.isArray(value)) {
    return value.map(normalizeTicket)
  }

  if (isRecord(value)) {
    if (Array.isArray(value.data)) return value.data.map(normalizeTicket)
    if (Array.isArray(value.tickets)) return value.tickets.map(normalizeTicket)
    if (isRecord(value.data) && Array.isArray(value.data.tickets)) {
      return value.data.tickets.map(normalizeTicket)
    }
  }

  throw new ApiError('The server returned an unexpected ticket list.', 500)
}

function normalizeComment(value: unknown): Comment | null {
  if (!isRecord(value)) return null

  const author = isRecord(value.author) ? value.author : null
  const message = firstString(value.message) ?? firstString(value.text)

  if (!message) return null

  return {
    id: idOf(value.id) ?? crypto.randomUUID(),
    ticketId: idOf(value.ticketId) ?? '',
    authorId: idOf(value.authorId) ?? idOf(author?.id) ?? '',
    authorName:
      firstString(value.authorName) ?? firstString(author?.name) ?? 'Unknown user',
    message,
    createdAt: firstString(value.createdAt) ?? new Date().toISOString(),
  }
}

function normalizeHistory(value: unknown): StatusChange | null {
  if (!isRecord(value)) return null

  const fromStatus = isRecord(value.fromStatus) ? value.fromStatus : null
  const toStatus = isRecord(value.toStatus) ? value.toStatus : null
  const changedBy = isRecord(value.changedBy) ? value.changedBy : null
  const toStatusName =
    firstString(value.toStatusName) ?? firstString(toStatus?.name)

  if (!toStatusName) return null

  return {
    id: idOf(value.id) ?? crypto.randomUUID(),
    ticketId: idOf(value.ticketId) ?? '',
    fromStatusId:
      idOf(value.fromStatusId) ?? idOf(fromStatus?.id) ?? null,
    fromStatusName:
      firstString(value.fromStatusName) ??
      firstString(fromStatus?.name) ??
      null,
    toStatusId: idOf(value.toStatusId) ?? idOf(toStatus?.id) ?? '',
    toStatusName,
    changedBy:
      idOf(value.changedById) ?? idOf(changedBy?.id) ?? idOf(value.changedBy) ?? '',
    changedByName:
      firstString(value.changedByName) ??
      firstString(changedBy?.name) ??
      'System',
    changedAt: firstString(value.changedAt) ?? new Date().toISOString(),
  }
}

function normalizeDetail(value: unknown): TicketDetail {
  const container =
    isRecord(value) && isRecord(value.data) ? value.data : value
  const record = asRecord(
    container,
    'The server returned an unexpected ticket record.',
  )
  const ticketRecord = isRecord(record.ticket) ? record.ticket : record
  const ticket = normalizeTicket(ticketRecord)

  const commentsSource = Array.isArray(record.comments)
    ? record.comments
    : Array.isArray(ticketRecord.comments)
      ? ticketRecord.comments
      : []
  const historySource = Array.isArray(record.history)
    ? record.history
    : Array.isArray(record.statusHistory)
      ? record.statusHistory
      : Array.isArray(ticketRecord.history)
        ? ticketRecord.history
        : Array.isArray(ticketRecord.statusHistory)
          ? ticketRecord.statusHistory
          : []

  return {
    ...ticket,
    comments: commentsSource
      .map(normalizeComment)
      .filter((comment): comment is Comment => comment !== null),
    history: historySource
      .map(normalizeHistory)
      .filter((entry): entry is StatusChange => entry !== null),
  }
}

/* -------------------------------------------------------------------------- */
/*                                   API                                      */
/* -------------------------------------------------------------------------- */

/**
 * Mutation endpoints may answer with the updated ticket or with 204. When the
 * body is empty, fall back to a detail read so callers always get a ticket.
 */
async function readUpdatedTicket(
  raw: unknown,
  ticketId: string,
): Promise<Ticket> {
  if (raw == null) {
    return ticketsApi.get(ticketId)
  }

  return normalizeTicket(raw)
}

export const ticketsApi = {
  list(filters: TicketFilters = {}): Promise<Ticket[]> {
    if (USE_MOCK) {
      return mockListTickets(filters)
    }

    const params = new URLSearchParams()

    if (filters.statusId) params.set('statusId', filters.statusId)
    if (filters.priority) params.set('priority', filters.priority)
    if (filters.categoryId) params.set('categoryId', filters.categoryId)
    if (filters.assignee) params.set('assignee', filters.assignee)
    if (filters.search) params.set('search', filters.search)

    const query = params.toString()

    return request<unknown>(`/tickets${query ? `?${query}` : ''}`).then(
      ticketList,
    )
  },

  get(ticketId: string): Promise<TicketDetail> {
    if (USE_MOCK) {
      return mockGetTicket(ticketId)
    }

    return request<unknown>(`/tickets/${ticketId}`).then(normalizeDetail)
  },

  create(input: CreateTicketInput): Promise<Ticket> {
    if (USE_MOCK) {
      return mockCreateTicket(input)
    }

    return request<unknown>('/tickets', { method: 'POST', body: input }).then(
      normalizeTicket,
    )
  },

  setStatus(ticketId: string, statusId: string): Promise<Ticket> {
    if (USE_MOCK) {
      return mockSetStatus(ticketId, statusId)
    }

    return request<unknown>(`/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: { statusId },
    }).then((raw) => readUpdatedTicket(raw, ticketId))
  },

  assign(ticketId: string, assigneeId: string | null): Promise<Ticket> {
    if (USE_MOCK) {
      return mockAssignTicket(ticketId, assigneeId)
    }

    return request<unknown>(`/tickets/${ticketId}/assign`, {
      method: 'PATCH',
      body: { assigneeId },
    }).then((raw) => readUpdatedTicket(raw, ticketId))
  },

  // The spec lists status and assign endpoints only. Priority is part of the
  // ticket requirements, so the client assumes an analogous endpoint.
  setPriority(ticketId: string, priority: Priority | null): Promise<Ticket> {
    if (USE_MOCK) {
      return mockSetPriority(ticketId, priority)
    }

    return request<unknown>(`/tickets/${ticketId}/priority`, {
      method: 'PATCH',
      body: { priority },
    }).then((raw) => readUpdatedTicket(raw, ticketId))
  },

  async addComment(ticketId: string, message: string): Promise<Comment | null> {
    if (USE_MOCK) {
      return mockAddComment(ticketId, message)
    }

    const raw = await request<unknown>(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: { message },
    })

    return normalizeComment(raw)
  },
}

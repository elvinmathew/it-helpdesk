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
import type {
  Comment,
  CreateTicketInput,
  Priority,
  Ticket,
  TicketDetail,
  TicketFilters,
} from './types'

/**
 * The ticket contract:
 *
 *   GET    /tickets                  -> Ticket[]
 *   GET    /tickets/{id}             -> TicketDetail
 *   POST   /tickets                  -> Ticket
 *   PATCH  /tickets/{id}/status      -> 204 (callers reload)
 *   PATCH  /tickets/{id}/assign      -> 204 (callers reload)
 *   PATCH  /tickets/{id}/priority    -> 204 (callers reload)
 *   POST   /tickets/{id}/comments    -> Comment
 */
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

    return request<Ticket[]>(`/tickets${query ? `?${query}` : ''}`)
  },

  get(ticketId: string): Promise<TicketDetail> {
    if (USE_MOCK) {
      return mockGetTicket(ticketId)
    }

    return request<TicketDetail>(`/tickets/${ticketId}`)
  },

  create(input: CreateTicketInput): Promise<Ticket> {
    if (USE_MOCK) {
      return mockCreateTicket(input)
    }

    return request<Ticket>('/tickets', { method: 'POST', body: input })
  },

  async setStatus(ticketId: string, statusId: string): Promise<void> {
    if (USE_MOCK) {
      await mockSetStatus(ticketId, statusId)
      return
    }

    await request(`/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: { statusId },
    })
  },

  async assign(ticketId: string, assigneeId: string | null): Promise<void> {
    if (USE_MOCK) {
      await mockAssignTicket(ticketId, assigneeId)
      return
    }

    await request(`/tickets/${ticketId}/assign`, {
      method: 'PATCH',
      body: { assigneeId },
    })
  },

  async setPriority(
    ticketId: string,
    priority: Priority | null,
  ): Promise<void> {
    if (USE_MOCK) {
      await mockSetPriority(ticketId, priority)
      return
    }

    await request(`/tickets/${ticketId}/priority`, {
      method: 'PATCH',
      body: { priority },
    })
  },

  addComment(ticketId: string, message: string): Promise<Comment> {
    if (USE_MOCK) {
      return mockAddComment(ticketId, message)
    }

    return request<Comment>(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: { message },
    })
  },
}

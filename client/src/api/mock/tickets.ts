import type {
  Category,
  Comment,
  CreateTicketInput,
  Priority,
  Status,
  Ticket,
  TicketDetail,
  TicketFilters,
} from '../types'
import {
  addCommentRecord,
  assignTicketRecord,
  changePriorityRecord,
  changeStatusRecord,
  createTicketRecord,
  currentUser,
  getCategories,
  getStatuses,
  getTicketDetail,
  listTickets,
  requireRole,
} from './db'

const LATENCY_MS = 350

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
}

export async function mockListTickets(
  filters: TicketFilters = {},
): Promise<Ticket[]> {
  await wait()
  return listTickets(currentUser(), filters)
}

export async function mockGetTicket(ticketId: string): Promise<TicketDetail> {
  await wait()
  const { ticket, comments, history } = getTicketDetail(ticketId, currentUser())
  return { ...ticket, comments, history }
}

export async function mockCreateTicket(
  input: CreateTicketInput,
): Promise<Ticket> {
  await wait()
  const user = currentUser()
  requireRole(user, ['employee'])
  return createTicketRecord(input, user)
}

export async function mockSetStatus(
  ticketId: string,
  statusId: string,
): Promise<Ticket> {
  await wait()
  const user = currentUser()
  requireRole(user, ['agent', 'admin'])
  return changeStatusRecord(ticketId, statusId, user)
}

export async function mockAssignTicket(
  ticketId: string,
  assigneeId: string | null,
): Promise<Ticket> {
  await wait()
  const user = currentUser()
  requireRole(user, ['agent', 'admin'])
  return assignTicketRecord(ticketId, assigneeId)
}

export async function mockSetPriority(
  ticketId: string,
  priority: Priority | null,
): Promise<Ticket> {
  await wait()
  const user = currentUser()
  requireRole(user, ['agent', 'admin'])
  return changePriorityRecord(ticketId, priority)
}

export async function mockAddComment(
  ticketId: string,
  message: string,
): Promise<Comment> {
  await wait()
  const user = currentUser()

  // Reuses the detail lookup so employees cannot comment on other people's
  // tickets (it throws a 404 in that case).
  getTicketDetail(ticketId, user)

  return addCommentRecord(ticketId, message, user)
}

export async function mockListStatuses(): Promise<Status[]> {
  await wait()
  return getStatuses()
}

export async function mockListCategories(activeOnly = false): Promise<Category[]> {
  await wait()
  const categories = getCategories()
  return activeOnly ? categories.filter((category) => category.active) : categories
}


export type Role = 'employee' | 'agent' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export type FieldErrors = Partial<Record<string, string>>

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: FieldErrors

  constructor(message: string, status: number, fieldErrors?: FieldErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export type Priority = 'low' | 'medium' | 'high'

export interface Status {
  id: string
  name: string
  active: boolean
}

export interface Category {
  id: string
  name: string
  active: boolean
}

export interface Ticket {
  id: string
  title: string
  description: string
  categoryId: string
  categoryName: string
  priority: Priority | null
  statusId: string
  statusName: string
  createdBy: string
  createdByName: string
  assignedTo: string | null
  assignedToName: string | null
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  ticketId: string
  authorId: string
  authorName: string
  message: string
  createdAt: string
}

export interface StatusChange {
  id: string
  ticketId: string
  fromStatusId: string | null
  fromStatusName: string | null
  toStatusId: string
  toStatusName: string
  changedBy: string
  changedByName: string
  changedAt: string
}

export interface TicketDetail extends Ticket {
  comments: Comment[]
  history: StatusChange[]
}

export interface CreateTicketInput {
  title: string
  description: string
  categoryId: string
}

export interface TicketFilters {
  statusId?: string
  priority?: Priority
  categoryId?: string
  /** 'unassigned' matches tickets without an assignee. */
  assignee?: string
  search?: string
}

export interface EmployeeDashboard {
  openCount: number
  resolvedCount: number
}

export interface AgentDashboard {
  unassignedCount: number
  overdueCount: number
}

export interface StatusCount {
  statusId: string
  statusName: string
  count: number
}

export interface CategoryCount {
  categoryId: string
  categoryName: string
  count: number
}

export interface PriorityCount {
  priority: Priority | null
  count: number
}

export interface AgentCount {
  agentId: string
  agentName: string
  count: number
}

export interface AdminDashboard {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  overdueTickets: number
  unassignedTickets: number
  activeAgents: number
  byStatus: StatusCount[]
  byCategory: CategoryCount[]
  byPriority: PriorityCount[]
  byAgent: AgentCount[]
}

export interface HelpdeskSettings {
  overdueHours: number
}

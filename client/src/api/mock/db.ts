import {
  ApiError,
  type Category,
  type Comment,
  type Priority,
  type Role,
  type Status,
  type StatusChange,
  type Ticket,
  type TicketFilters,
  type User,
} from '../types'
import { readSession } from '../../auth/session'
import { readUsers } from './storage'

const PREFIX = 'it-helpdesk.mock'
const VERSION_KEY = `${PREFIX}.data-version`
const DATA_VERSION = '1'

const TICKETS_KEY = `${PREFIX}.tickets`
const COMMENTS_KEY = `${PREFIX}.comments`
const HISTORY_KEY = `${PREFIX}.history`
const STATUSES_KEY = `${PREFIX}.statuses`
const CATEGORIES_KEY = `${PREFIX}.categories`

const HOUR = 60 * 60 * 1000
const OVERDUE_HOURS = 24

export const OPEN_STATUS_ID = 'status-open'

const SEED_STATUSES: Status[] = [
  { id: OPEN_STATUS_ID, name: 'Open', active: true },
  { id: 'status-in-progress', name: 'In progress', active: true },
  { id: 'status-resolved', name: 'Resolved', active: true },
  { id: 'status-closed', name: 'Closed', active: true },
]

const CATEGORY_NAMES = [
  'Hardware',
  'Software',
  'Network',
  'VPN / Remote Access',
  'Email and Collaboration',
  'Account and Access',
  'Printer and Scanner',
  'Security',
  'New Request',
  'Other',
]

const SEED_CATEGORIES: Category[] = CATEGORY_NAMES.map((name) => ({
  id: `category-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
  name,
  active: true,
}))

export interface StoredTicket {
  id: string
  title: string
  description: string
  categoryId: string
  priority: Priority | null
  statusId: string
  createdBy: string
  assignedTo: string | null
  createdAt: string
  updatedAt: string
}

export interface StoredComment {
  id: string
  ticketId: string
  authorId: string
  message: string
  createdAt: string
}

export interface StoredHistory {
  id: string
  ticketId: string
  fromStatusId: string | null
  toStatusId: string
  changedBy: string
  changedAt: string
}

interface MockData {
  statuses: Status[]
  categories: Category[]
  users: User[]
  tickets: StoredTicket[]
  comments: StoredComment[]
  history: StoredHistory[]
}

/* -------------------------------------------------------------------------- */
/*                                Seed data                                   */
/* -------------------------------------------------------------------------- */

interface SeedTicket {
  title: string
  description: string
  categoryId: string
  priority: Priority | null
  statusId: string
  assignedTo: 'agent' | 'admin' | null
  createdHoursAgo: number
}

function categoryId(slug: string): string {
  return `category-${slug}`
}

const SEED_TICKETS: SeedTicket[] = [
  {
    title: 'Laptop will not power on',
    description:
      'My work laptop shows no lights and does not start, even with the charger connected. I have an important client review tomorrow morning.',
    categoryId: categoryId('hardware'),
    priority: 'high',
    statusId: 'status-open',
    assignedTo: null,
    createdHoursAgo: 30,
  },
  {
    title: 'VPN disconnects every few minutes',
    description:
      'The VPN drops roughly every ten minutes when I work from home. Reconnecting works for a short while, then it drops again.',
    categoryId: categoryId('vpn-remote-access'),
    priority: 'high',
    statusId: 'status-open',
    assignedTo: null,
    createdHoursAgo: 26,
  },
  {
    title: 'Outlook calendar is not syncing',
    description:
      'Events created on my phone are not appearing in Outlook on the desktop. The last sync appears to be from two days ago.',
    categoryId: categoryId('email-and-collaboration'),
    priority: 'medium',
    statusId: 'status-open',
    assignedTo: null,
    createdHoursAgo: 8,
  },
  {
    title: 'Request a second monitor for design work',
    description:
      'I mostly work with wide design files and would like a second 27-inch monitor to speed up reviews.',
    categoryId: categoryId('new-request'),
    priority: 'low',
    statusId: 'status-open',
    assignedTo: null,
    createdHoursAgo: 20,
  },
  {
    title: 'Printer on the third floor keeps jamming',
    description:
      'Paper jams every few pages on the shared printer near the kitchen. The display shows a paper jam message even after clearing it.',
    categoryId: categoryId('printer-and-scanner'),
    priority: 'medium',
    statusId: 'status-open',
    assignedTo: 'agent',
    createdHoursAgo: 22,
  },
  {
    title: 'Wi-Fi drops in meeting room 2',
    description:
      'The connection drops during video calls in meeting room 2. Other rooms seem fine, so it may be the access point.',
    categoryId: categoryId('network'),
    priority: 'high',
    statusId: 'status-in-progress',
    assignedTo: 'agent',
    createdHoursAgo: 40,
  },
  {
    title: 'Excel crashes when opening a shared file',
    description:
      'The quarterly forecast file crashes Excel on open. Other spreadsheets work, and the file opens fine for my colleague.',
    categoryId: categoryId('software'),
    priority: 'medium',
    statusId: 'status-in-progress',
    assignedTo: 'admin',
    createdHoursAgo: 18,
  },
  {
    title: 'Need admin rights for the design tool',
    description:
      'The design application needs to install an update, but it asks for administrator credentials.',
    categoryId: categoryId('account-and-access'),
    priority: 'low',
    statusId: 'status-in-progress',
    assignedTo: 'agent',
    createdHoursAgo: 15,
  },
  {
    title: 'Teams audio is not working on calls',
    description:
      'I can hear others but nobody can hear me. The microphone works in other applications.',
    categoryId: categoryId('email-and-collaboration'),
    priority: 'medium',
    statusId: 'status-in-progress',
    assignedTo: 'agent',
    createdHoursAgo: 12,
  },
  {
    title: 'Cannot connect to the office VPN from home',
    description:
      'The client shows "authentication failed" after the first step. It worked yesterday from the same network.',
    categoryId: categoryId('vpn-remote-access'),
    priority: 'high',
    statusId: 'status-in-progress',
    assignedTo: 'agent',
    createdHoursAgo: 34,
  },
  {
    title: 'Replace failing keyboard',
    description:
      'Several keys on my keyboard stick or do not register. I have swapped it with a spare for now.',
    categoryId: categoryId('hardware'),
    priority: 'low',
    statusId: 'status-resolved',
    assignedTo: 'agent',
    createdHoursAgo: 72,
  },
  {
    title: 'Shared drive access denied',
    description:
      'I cannot open the finance shared drive. The folder appears, but opening it returns an access denied message.',
    categoryId: categoryId('account-and-access'),
    priority: 'medium',
    statusId: 'status-resolved',
    assignedTo: 'admin',
    createdHoursAgo: 96,
  },
  {
    title: 'Slow internet on the fourth floor',
    description:
      'Pages take a long time to load and calls drop on the fourth floor. The ground floor is fine.',
    categoryId: categoryId('network'),
    priority: 'medium',
    statusId: 'status-resolved',
    assignedTo: 'agent',
    createdHoursAgo: 120,
  },
  {
    title: 'Request a licence renewal for the PDF editor',
    description:
      'My PDF editor licence expired this morning and I need it for the weekly report pack.',
    categoryId: categoryId('software'),
    priority: 'low',
    statusId: 'status-resolved',
    assignedTo: 'agent',
    createdHoursAgo: 100,
  },
  {
    title: 'Set up a laptop for a new starter',
    description:
      'A new designer starts on Monday and needs a laptop with the standard design software installed.',
    categoryId: categoryId('new-request'),
    priority: 'medium',
    statusId: 'status-closed',
    assignedTo: 'agent',
    createdHoursAgo: 200,
  },
  {
    title: 'Badge printer is not printing',
    description:
      'The printer used for visitor badges prints blank cards. It happens with every badge we try.',
    categoryId: categoryId('printer-and-scanner'),
    priority: 'low',
    statusId: 'status-closed',
    assignedTo: 'agent',
    createdHoursAgo: 180,
  },
  {
    title: 'Report a suspicious phishing email',
    description:
      'I received an email asking me to confirm my password. I did not click anything. Forwarding it for review.',
    categoryId: categoryId('security'),
    priority: 'high',
    statusId: 'status-closed',
    assignedTo: 'admin',
    createdHoursAgo: 240,
  },
  {
    title: 'Second monitor flickers after waking up',
    description:
      'The monitor flickers for a minute or two after the laptop wakes from sleep, then settles.',
    categoryId: categoryId('hardware'),
    priority: 'medium',
    statusId: 'status-open',
    assignedTo: null,
    createdHoursAgo: 5,
  },
  {
    title: 'Calendar invites are not arriving',
    description:
      'Invites sent from outside the company never arrive in my inbox. Internal invites work fine.',
    categoryId: categoryId('email-and-collaboration'),
    priority: 'low',
    statusId: 'status-open',
    assignedTo: null,
    createdHoursAgo: 3,
  },
  {
    title: 'New starter access request',
    description:
      'The new project coordinator needs access to the intranet, the shared drive, and the payroll system.',
    categoryId: categoryId('new-request'),
    priority: 'medium',
    statusId: 'status-open',
    assignedTo: null,
    createdHoursAgo: 1,
  },
]

const SEED_COMMENTS: Array<{
  index: number
  author: 'employee' | 'agent'
  message: string
  afterHours: number
}> = [
  {
    index: 0,
    author: 'employee',
    message:
      'Tried a different charger and a different outlet, still no lights. I can drop it at the service desk if that helps.',
    afterHours: 1,
  },
  {
    index: 0,
    author: 'agent',
    message:
      'Thanks for checking. Please bring it in and we will test the power adapter and motherboard.',
    afterHours: 2,
  },
  {
    index: 5,
    author: 'agent',
    message:
      'I have ordered a replacement access point for meeting room 2. It should arrive tomorrow.',
    afterHours: 3,
  },
  {
    index: 10,
    author: 'employee',
    message: 'The replacement keyboard works perfectly, thank you.',
    afterHours: 3,
  },
  {
    index: 11,
    author: 'agent',
    message:
      'Access was missing from the finance group. It has been restored and tested.',
    afterHours: 4,
  },
]

/* -------------------------------------------------------------------------- */
/*                              Local storage                                 */
/* -------------------------------------------------------------------------- */

function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * HOUR).toISOString()
}

function findUser(users: User[], email: string, role: Role): User {
  return (
    users.find((user) => user.email === email) ??
    users.find((user) => user.role === role) ??
    users[0]
  )
}

function buildSeed(): MockData {
  const allUsers = readUsers() as User[]
  const employee = findUser(allUsers, 'employee@helpdesk.local', 'employee')
  const agent = findUser(allUsers, 'agent@helpdesk.local', 'agent')
  const admin = findUser(allUsers, 'admin@helpdesk.local', 'admin')

  const assigneeFor = (value: SeedTicket['assignedTo']) =>
    value === 'agent' ? agent.id : value === 'admin' ? admin.id : null

  const tickets: StoredTicket[] = SEED_TICKETS.map((ticket, index) => {
    const createdAt = isoHoursAgo(ticket.createdHoursAgo)
    const updatedAt =
      ticket.statusId === 'status-open' && !ticket.assignedTo
        ? createdAt
        : isoHoursAgo(Math.max(0.5, ticket.createdHoursAgo * 0.5))

    return {
      id: `TCK-${1001 + index}`,
      title: ticket.title,
      description: ticket.description,
      categoryId: ticket.categoryId,
      priority: ticket.priority,
      statusId: ticket.statusId,
      createdBy: employee.id,
      assignedTo: assigneeFor(ticket.assignedTo),
      createdAt,
      updatedAt,
    }
  })

  const comments: StoredComment[] = SEED_COMMENTS.map((comment, index) => {
    const ticket = tickets[comment.index]
    const author = comment.author === 'employee' ? employee : agent

    return {
      id: `comment-${index + 1}`,
      ticketId: ticket.id,
      authorId: author.id,
      message: comment.message,
      createdAt: new Date(
        new Date(ticket.createdAt).getTime() + comment.afterHours * HOUR,
      ).toISOString(),
    }
  })

  const history: StoredHistory[] = []
  let historyId = 1

  for (const ticket of tickets) {
    if (ticket.statusId === 'status-open') continue

    const start = new Date(ticket.createdAt).getTime()
    const end = new Date(ticket.updatedAt).getTime()
    const step = (offset: number) =>
      new Date(start + (end - start) * offset).toISOString()

    history.push({
      id: `history-${historyId++}`,
      ticketId: ticket.id,
      fromStatusId: 'status-open',
      toStatusId: 'status-in-progress',
      changedBy: agent.id,
      changedAt: step(0.25),
    })

    if (ticket.statusId === 'status-in-progress') continue

    history.push({
      id: `history-${historyId++}`,
      ticketId: ticket.id,
      fromStatusId: 'status-in-progress',
      toStatusId: 'status-resolved',
      changedBy: agent.id,
      changedAt: step(0.6),
    })

    if (ticket.statusId === 'status-resolved') continue

    history.push({
      id: `history-${historyId++}`,
      ticketId: ticket.id,
      fromStatusId: 'status-resolved',
      toStatusId: 'status-closed',
      changedBy: admin.id,
      changedAt: step(0.9),
    })
  }

  return {
    statuses: SEED_STATUSES,
    categories: SEED_CATEGORIES,
    users: allUsers,
    tickets,
    comments,
    history,
  }
}

function ensureSeeded(): void {
  if (localStorage.getItem(VERSION_KEY) === DATA_VERSION) return

  const data = buildSeed()
  writeJson(STATUSES_KEY, data.statuses)
  writeJson(CATEGORIES_KEY, data.categories)
  writeJson(TICKETS_KEY, data.tickets)
  writeJson(COMMENTS_KEY, data.comments)
  writeJson(HISTORY_KEY, data.history)
  localStorage.setItem(VERSION_KEY, DATA_VERSION)
}

/* -------------------------------------------------------------------------- */
/*                                  Access                                    */
/* -------------------------------------------------------------------------- */

export function loadData(): MockData {
  ensureSeeded()

  return {
    statuses: readJson<Status[]>(STATUSES_KEY) ?? SEED_STATUSES,
    categories: readJson<Category[]>(CATEGORIES_KEY) ?? SEED_CATEGORIES,
    users: readUsers() as User[],
    tickets: readJson<StoredTicket[]>(TICKETS_KEY) ?? [],
    comments: readJson<StoredComment[]>(COMMENTS_KEY) ?? [],
    history: readJson<StoredHistory[]>(HISTORY_KEY) ?? [],
  }
}

export function saveTickets(tickets: StoredTicket[]): void {
  writeJson(TICKETS_KEY, tickets)
}

export function saveComments(comments: StoredComment[]): void {
  writeJson(COMMENTS_KEY, comments)
}

export function saveHistory(history: StoredHistory[]): void {
  writeJson(HISTORY_KEY, history)
}

export function currentUser(): User {
  const session = readSession()

  if (!session) {
    throw new ApiError('Your session has expired. Please sign in again.', 401)
  }

  return session.user
}

export function requireRole(user: User, roles: Role[]): void {
  if (!roles.includes(user.role)) {
    throw new ApiError('You do not have permission to do that.', 403)
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Read model                                 */
/* -------------------------------------------------------------------------- */

export function isOverdue(ticket: StoredTicket): boolean {
  if (ticket.assignedTo || ticket.statusId !== OPEN_STATUS_ID) return false

  const age = Date.now() - new Date(ticket.createdAt).getTime()
  return age > OVERDUE_HOURS * HOUR
}

export function enrichTicket(ticket: StoredTicket, data: MockData): Ticket {
  const status = data.statuses.find((item) => item.id === ticket.statusId)
  const category = data.categories.find(
    (item) => item.id === ticket.categoryId,
  )
  const creator = data.users.find((user) => user.id === ticket.createdBy)
  const assignee = ticket.assignedTo
    ? data.users.find((user) => user.id === ticket.assignedTo)
    : null

  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    categoryId: ticket.categoryId,
    categoryName: category?.name ?? 'Uncategorised',
    priority: ticket.priority,
    statusId: ticket.statusId,
    statusName: status?.name ?? 'Unknown',
    createdBy: ticket.createdBy,
    createdByName: creator?.name ?? 'Unknown user',
    assignedTo: ticket.assignedTo,
    assignedToName: assignee?.name ?? null,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    overdue: isOverdue(ticket),
  }
}

export function listTickets(
  user: User,
  filters: TicketFilters = {},
): Ticket[] {
  const data = loadData()
  const search = filters.search?.trim().toLowerCase()

  return data.tickets
    .filter((ticket) => user.role !== 'employee' || ticket.createdBy === user.id)
    .filter((ticket) => !filters.statusId || ticket.statusId === filters.statusId)
    .filter((ticket) => !filters.priority || ticket.priority === filters.priority)
    .filter(
      (ticket) => !filters.categoryId || ticket.categoryId === filters.categoryId,
    )
    .filter((ticket) => {
      if (!filters.assignee) return true
      if (filters.assignee === 'unassigned') return ticket.assignedTo === null
      return ticket.assignedTo === filters.assignee
    })
    .filter((ticket) => !search || ticket.title.toLowerCase().includes(search))
    .map((ticket) => enrichTicket(ticket, data))
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() -
        new Date(left.updatedAt).getTime(),
    )
}

export function getTicketDetail(
  ticketId: string,
  user: User,
): { ticket: Ticket; comments: Comment[]; history: StatusChange[] } {
  const data = loadData()
  const stored = data.tickets.find((ticket) => ticket.id === ticketId)

  if (!stored) {
    throw new ApiError('That ticket could not be found.', 404)
  }

  if (user.role === 'employee' && stored.createdBy !== user.id) {
    throw new ApiError('That ticket could not be found.', 404)
  }

  const ticket = enrichTicket(stored, data)

  const comments = data.comments
    .filter((comment) => comment.ticketId === ticketId)
    .map((comment) => ({
      id: comment.id,
      ticketId: comment.ticketId,
      authorId: comment.authorId,
      authorName:
        data.users.find((candidate) => candidate.id === comment.authorId)
          ?.name ?? 'Unknown user',
      message: comment.message,
      createdAt: comment.createdAt,
    }))
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    )

  const statusName = (statusId: string | null) =>
    data.statuses.find((status) => status.id === statusId)?.name ?? null

  const history = data.history
    .filter((entry) => entry.ticketId === ticketId)
    .map((entry) => ({
      id: entry.id,
      ticketId: entry.ticketId,
      fromStatusId: entry.fromStatusId,
      fromStatusName: statusName(entry.fromStatusId),
      toStatusId: entry.toStatusId,
      toStatusName: statusName(entry.toStatusId) ?? 'Unknown',
      changedBy: entry.changedBy,
      changedByName:
        data.users.find((candidate) => candidate.id === entry.changedBy)?.name ??
        'System',
      changedAt: entry.changedAt,
    }))
    .sort(
      (left, right) =>
        new Date(left.changedAt).getTime() -
        new Date(right.changedAt).getTime(),
    )

  return { ticket, comments, history }
}

export function getStatuses(): Status[] {
  return loadData().statuses
}

export function getCategories(): Category[] {
  return loadData().categories
}

/* -------------------------------------------------------------------------- */
/*                                 Mutations                                  */
/* -------------------------------------------------------------------------- */

export function nextTicketId(tickets: StoredTicket[]): string {
  const highest = tickets.reduce((max, ticket) => {
    const value = Number(ticket.id.replace(/^TCK-/, ''))
    return Number.isFinite(value) ? Math.max(max, value) : max
  }, 1000)

  return `TCK-${highest + 1}`
}

export function createTicketRecord(
  input: { title: string; description: string; categoryId: string },
  user: User,
): Ticket {
  const data = loadData()
  const category = data.categories.find(
    (item) => item.id === input.categoryId && item.active,
  )

  if (!category) {
    throw new ApiError('Please pick an active category.', 400, {
      categoryId: 'Please pick a category.',
    })
  }

  const now = new Date().toISOString()
  const stored: StoredTicket = {
    id: nextTicketId(data.tickets),
    title: input.title.trim(),
    description: input.description.trim(),
    categoryId: category.id,
    priority: null,
    statusId: OPEN_STATUS_ID,
    createdBy: user.id,
    assignedTo: null,
    createdAt: now,
    updatedAt: now,
  }

  const nextData: MockData = {
    ...data,
    tickets: [stored, ...data.tickets],
  }

  saveTickets(nextData.tickets)

  return enrichTicket(stored, nextData)
}

export function changeStatusRecord(
  ticketId: string,
  statusId: string,
  user: User,
): Ticket {
  const data = loadData()
  const stored = data.tickets.find((ticket) => ticket.id === ticketId)

  if (!stored) throw new ApiError('That ticket could not be found.', 404)

  const status = data.statuses.find(
    (item) => item.id === statusId && item.active,
  )

  if (!status) {
    throw new ApiError('That status is not available.', 400, {
      statusId: 'Pick an available status.',
    })
  }

  if (stored.statusId === statusId) {
    return enrichTicket(stored, data)
  }

  const now = new Date().toISOString()
  const updated: StoredTicket = { ...stored, statusId, updatedAt: now }
  const tickets = data.tickets.map((ticket) =>
    ticket.id === ticketId ? updated : ticket,
  )
  const history: StoredHistory[] = [
    ...data.history,
    {
      id: `history-${crypto.randomUUID()}`,
      ticketId,
      fromStatusId: stored.statusId,
      toStatusId: statusId,
      changedBy: user.id,
      changedAt: now,
    },
  ]

  saveTickets(tickets)
  saveHistory(history)

  return enrichTicket(updated, { ...data, tickets, history })
}

export function assignTicketRecord(
  ticketId: string,
  assigneeId: string | null,
): Ticket {
  const data = loadData()
  const stored = data.tickets.find((ticket) => ticket.id === ticketId)

  if (!stored) throw new ApiError('That ticket could not be found.', 404)

  if (assigneeId) {
    const assignee = data.users.find(
      (candidate) =>
        candidate.id === assigneeId && candidate.active !== false,
    )

    if (!assignee || assignee.role === 'employee') {
      throw new ApiError('Pick an active agent or admin.', 400)
    }
  }

  const updated: StoredTicket = {
    ...stored,
    assignedTo: assigneeId,
    updatedAt: new Date().toISOString(),
  }
  const tickets = data.tickets.map((ticket) =>
    ticket.id === ticketId ? updated : ticket,
  )

  saveTickets(tickets)

  return enrichTicket(updated, { ...data, tickets })
}

export function changePriorityRecord(
  ticketId: string,
  priority: Priority | null,
): Ticket {
  const data = loadData()
  const stored = data.tickets.find((ticket) => ticket.id === ticketId)

  if (!stored) throw new ApiError('That ticket could not be found.', 404)

  const updated: StoredTicket = {
    ...stored,
    priority,
    updatedAt: new Date().toISOString(),
  }
  const tickets = data.tickets.map((ticket) =>
    ticket.id === ticketId ? updated : ticket,
  )

  saveTickets(tickets)

  return enrichTicket(updated, { ...data, tickets })
}

export function addCommentRecord(
  ticketId: string,
  message: string,
  user: User,
): Comment {
  const data = loadData()
  const stored = data.tickets.find((ticket) => ticket.id === ticketId)

  if (!stored) throw new ApiError('That ticket could not be found.', 404)

  const trimmed = message.trim()

  if (!trimmed) {
    throw new ApiError('Write a comment before sending.', 400, {
      message: 'Write a comment before sending.',
    })
  }

  const now = new Date().toISOString()
  const comment: StoredComment = {
    id: `comment-${crypto.randomUUID()}`,
    ticketId,
    authorId: user.id,
    message: trimmed,
    createdAt: now,
  }

  const tickets = data.tickets.map((ticket) =>
    ticket.id === ticketId ? { ...ticket, updatedAt: now } : ticket,
  )

  saveComments([...data.comments, comment])
  saveTickets(tickets)

  return {
    id: comment.id,
    ticketId,
    authorId: user.id,
    authorName: user.name,
    message: trimmed,
    createdAt: now,
  }
}

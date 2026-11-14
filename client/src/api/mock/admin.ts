import {
  ApiError,
  type Category,
  type HelpdeskSettings,
  type Role,
  type Status,
  type User,
} from '../types'
import {
  createCategoryRecord,
  createStatusRecord,
  currentUser,
  readSettings,
  requireRole,
  setCategoryActiveRecord,
  setStatusActiveRecord,
  writeSettings,
} from './db'
import {
  persistUsers,
  readUsers,
  toPublicUser,
  type StoredUser,
} from './storage'

const LATENCY_MS = 250

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
}

function updateUser(
  userId: string,
  update: (user: StoredUser) => StoredUser,
): User {
  const users = readUsers()
  const stored = users.find((user) => user.id === userId)

  if (!stored) {
    throw new ApiError('That user could not be found.', 404)
  }

  const updated = update(stored)
  persistUsers(users.map((user) => (user.id === userId ? updated : user)))
  return toPublicUser(updated)
}

function otherActiveAdmins(userId: string): number {
  return readUsers().filter(
    (user) => user.id !== userId && user.role === 'admin' && user.active,
  ).length
}

export async function mockListUsers(): Promise<User[]> {
  await wait()
  requireRole(currentUser(), ['admin'])
  return readUsers().map(toPublicUser)
}

export async function mockSetUserRole(
  userId: string,
  role: Role,
): Promise<User> {
  await wait()
  const actor = currentUser()
  requireRole(actor, ['admin'])

  if (actor.id === userId) {
    throw new ApiError('You cannot change your own role.', 400)
  }

  return updateUser(userId, (user) => {
    if (user.role === 'admin' && role !== 'admin' && otherActiveAdmins(userId) === 0) {
      throw new ApiError('Keep at least one active admin.', 400)
    }

    return { ...user, role }
  })
}

export async function mockSetUserActive(
  userId: string,
  active: boolean,
): Promise<User> {
  await wait()
  const actor = currentUser()
  requireRole(actor, ['admin'])

  if (actor.id === userId) {
    throw new ApiError('You cannot deactivate your own account.', 400)
  }

  return updateUser(userId, (user) => {
    if (user.role === 'admin' && !active && otherActiveAdmins(userId) === 0) {
      throw new ApiError('Keep at least one active admin.', 400)
    }

    return { ...user, active }
  })
}

export async function mockCreateStatus(name: string): Promise<Status> {
  await wait()
  requireRole(currentUser(), ['admin'])
  return createStatusRecord(name)
}

export async function mockSetStatusActive(
  statusId: string,
  active: boolean,
): Promise<Status> {
  await wait()
  requireRole(currentUser(), ['admin'])
  return setStatusActiveRecord(statusId, active)
}

export async function mockCreateCategory(name: string): Promise<Category> {
  await wait()
  requireRole(currentUser(), ['admin'])
  return createCategoryRecord(name)
}

export async function mockSetCategoryActive(
  categoryId: string,
  active: boolean,
): Promise<Category> {
  await wait()
  requireRole(currentUser(), ['admin'])
  return setCategoryActiveRecord(categoryId, active)
}

export async function mockGetSettings(): Promise<HelpdeskSettings> {
  await wait()
  requireRole(currentUser(), ['admin'])
  return readSettings()
}

export async function mockSaveSettings(
  input: HelpdeskSettings,
): Promise<HelpdeskSettings> {
  await wait()
  requireRole(currentUser(), ['admin'])

  if (!Number.isFinite(input.overdueHours) || input.overdueHours < 1 || input.overdueHours > 168) {
    throw new ApiError('Use a number of hours between 1 and 168.', 400, {
      overdueHours: 'Use a number of hours between 1 and 168.',
    })
  }

  return writeSettings(input)
}

import { firstString, isRecord } from '../lib/guards'
import { request, USE_MOCK } from './client'
import { mockListCategories, mockListStatuses } from './mock/tickets'
import { ApiError, type Category, type Status } from './types'

function unwrapList(value: unknown, key: string): unknown[] {
  if (Array.isArray(value)) return value

  if (isRecord(value)) {
    if (Array.isArray(value.data)) return value.data
    if (Array.isArray(value[key])) return value[key]
    if (isRecord(value.data) && Array.isArray(value.data[key])) {
      return value.data[key]
    }
  }

  throw new ApiError('The server returned an unexpected list.', 500)
}

function normalizeStatus(value: unknown): Status {
  if (!isRecord(value)) {
    throw new ApiError('The server returned an unexpected status.', 500)
  }

  const id = value.id
  const name = firstString(value.name)

  if (
    (typeof id !== 'string' && typeof id !== 'number') ||
    !name
  ) {
    throw new ApiError('The server returned an unexpected status.', 500)
  }

  return {
    id: String(id),
    name,
    active: value.active !== false,
  }
}

function normalizeCategory(value: unknown): Category {
  if (!isRecord(value)) {
    throw new ApiError('The server returned an unexpected category.', 500)
  }

  const id = value.id
  const name = firstString(value.name)

  if (
    (typeof id !== 'string' && typeof id !== 'number') ||
    !name
  ) {
    throw new ApiError('The server returned an unexpected category.', 500)
  }

  return {
    id: String(id),
    name,
    active: value.active !== false,
  }
}

export const catalogApi = {
  async statuses(): Promise<Status[]> {
    if (USE_MOCK) {
      return mockListStatuses()
    }

    const raw = await request<unknown>('/statuses')
    return unwrapList(raw, 'statuses').map(normalizeStatus)
  },

  async categories(activeOnly = false): Promise<Category[]> {
    if (USE_MOCK) {
      return mockListCategories(activeOnly)
    }

    const raw = await request<unknown>('/categories')
    const categories = unwrapList(raw, 'categories').map(normalizeCategory)

    return activeOnly
      ? categories.filter((category) => category.active)
      : categories
  },
}

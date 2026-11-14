import { request, USE_MOCK } from './client'
import { mockListCategories, mockListStatuses } from './mock/tickets'
import type { Category, Status } from './types'

/**
 *   GET /statuses   -> Status[]
 *   GET /categories -> Category[]
 */
export const catalogApi = {
  statuses(): Promise<Status[]> {
    if (USE_MOCK) {
      return mockListStatuses()
    }

    return request<Status[]>('/statuses')
  },

  categories(): Promise<Category[]> {
    if (USE_MOCK) {
      return mockListCategories()
    }

    return request<Category[]>('/categories')
  },
}

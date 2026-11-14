import { request, USE_MOCK } from './client'
import {
  mockCreateCategory,
  mockCreateStatus,
  mockGetSettings,
  mockListUsers,
  mockSaveSettings,
  mockSetCategoryActive,
  mockSetStatusActive,
  mockSetUserActive,
  mockSetUserRole,
} from './mock/admin'
import type {
  Category,
  HelpdeskSettings,
  Role,
  Status,
  User,
} from './types'

/**
 * Admin contract:
 *
 *   GET   /admin/users                 -> User[]
 *   PATCH /admin/users/{id}/role       -> User
 *   PATCH /admin/users/{id}/active     -> User
 *   POST  /admin/statuses              -> Status
 *   PATCH /admin/statuses/{id}         -> Status
 *   POST  /admin/categories            -> Category
 *   PATCH /admin/categories/{id}       -> Category
 *   GET   /admin/settings              -> HelpdeskSettings
 *   PUT   /admin/settings              -> HelpdeskSettings
 */
export const adminApi = {
  users(): Promise<User[]> {
    if (USE_MOCK) {
      return mockListUsers()
    }

    return request<User[]>('/admin/users')
  },

  setUserRole(userId: string, role: Role): Promise<User> {
    if (USE_MOCK) {
      return mockSetUserRole(userId, role)
    }

    return request<User>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: { role },
    })
  },

  setUserActive(userId: string, active: boolean): Promise<User> {
    if (USE_MOCK) {
      return mockSetUserActive(userId, active)
    }

    return request<User>(`/admin/users/${userId}/active`, {
      method: 'PATCH',
      body: { active },
    })
  },

  createStatus(name: string): Promise<Status> {
    if (USE_MOCK) {
      return mockCreateStatus(name)
    }

    return request<Status>('/admin/statuses', {
      method: 'POST',
      body: { name },
    })
  },

  setStatusActive(statusId: string, active: boolean): Promise<Status> {
    if (USE_MOCK) {
      return mockSetStatusActive(statusId, active)
    }

    return request<Status>(`/admin/statuses/${statusId}`, {
      method: 'PATCH',
      body: { active },
    })
  },

  createCategory(name: string): Promise<Category> {
    if (USE_MOCK) {
      return mockCreateCategory(name)
    }

    return request<Category>('/admin/categories', {
      method: 'POST',
      body: { name },
    })
  },

  setCategoryActive(categoryId: string, active: boolean): Promise<Category> {
    if (USE_MOCK) {
      return mockSetCategoryActive(categoryId, active)
    }

    return request<Category>(`/admin/categories/${categoryId}`, {
      method: 'PATCH',
      body: { active },
    })
  },

  settings(): Promise<HelpdeskSettings> {
    if (USE_MOCK) {
      return mockGetSettings()
    }

    return request<HelpdeskSettings>('/admin/settings')
  },

  saveSettings(input: HelpdeskSettings): Promise<HelpdeskSettings> {
    if (USE_MOCK) {
      return mockSaveSettings(input)
    }

    return request<HelpdeskSettings>('/admin/settings', {
      method: 'PUT',
      body: input,
    })
  },
}

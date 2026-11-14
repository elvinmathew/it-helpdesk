import { request, USE_MOCK } from './client'
import {
  mockAdminDashboard,
  mockAgentDashboard,
  mockEmployeeDashboard,
} from './mock/dashboard'
import type {
  AdminDashboard,
  AgentDashboard,
  EmployeeDashboard,
} from './types'

export const dashboardApi = {
  employee(): Promise<EmployeeDashboard> {
    if (USE_MOCK) {
      return mockEmployeeDashboard()
    }

    return request<EmployeeDashboard>('/dashboard/employee')
  },

  agent(): Promise<AgentDashboard> {
    if (USE_MOCK) {
      return mockAgentDashboard()
    }

    return request<AgentDashboard>('/dashboard/agent')
  },

  admin(): Promise<AdminDashboard> {
    if (USE_MOCK) {
      return mockAdminDashboard()
    }

    return request<AdminDashboard>('/dashboard/admin')
  },
}

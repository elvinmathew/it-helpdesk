import type { Role } from '../api/types'

export const ROLE_LABELS: Record<Role, string> = {
  employee: 'Employee',
  agent: 'Agent',
  admin: 'Admin',
}

export const ROLE_HOME: Record<Role, string> = {
  employee: '/employee',
  agent: '/agent',
  admin: '/admin',
}

export function homePath(role: Role): string {
  return ROLE_HOME[role]
}

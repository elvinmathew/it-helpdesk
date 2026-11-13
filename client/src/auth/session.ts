import type { AuthResponse, Role, User } from '../api/types'

const TOKEN_KEY = 'it-helpdesk.token'
const USER_KEY = 'it-helpdesk.user'

const ROLES: Role[] = ['employee', 'agent', 'admin']

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && ROLES.includes(value as Role)
}

export function saveSession({ token, user }: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function readSession(): AuthResponse | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const rawUser = localStorage.getItem(USER_KEY)

  if (!token || !rawUser) {
    return null
  }

  try {
    const user = JSON.parse(rawUser) as Partial<User>

    if (
      typeof user.id !== 'string' ||
      typeof user.name !== 'string' ||
      typeof user.email !== 'string' ||
      !isRole(user.role)
    ) {
      clearSession()
      return null
    }

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  } catch {
    clearSession()
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

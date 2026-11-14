import type { Role, User } from '../types'

// Mock users are stored in the browser only. Passwords are plain text here
// because this data never leaves the browser. Do not copy this into the backend.
export interface StoredUser extends User {
  password: string
  active: boolean
  createdAt: string
}

const USERS_KEY = 'it-helpdesk.mock.users'

export interface DemoAccount {
  label: string
  email: string
  password: string
  role: Role
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Employee',
    email: 'employee@helpdesk.local',
    password: 'Password123!',
    role: 'employee',
  },
  {
    label: 'Agent',
    email: 'agent@helpdesk.local',
    password: 'Password123!',
    role: 'agent',
  },
  {
    label: 'Admin',
    email: 'admin@helpdesk.local',
    password: 'Password123!',
    role: 'admin',
  },
]

function seedUsers(): StoredUser[] {
  const createdAt = new Date().toISOString()

  return DEMO_ACCOUNTS.map((account) => ({
    id: `demo-${account.role}`,
    name: `Demo ${account.label}`,
    email: account.email,
    role: account.role,
    password: account.password,
    active: true,
    createdAt,
  }))
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function readUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY)

  if (!raw) {
    const users = seedUsers()
    writeUsers(users)
    return users
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Invalid mock user store')
    }

    return parsed as StoredUser[]
  } catch {
    const users = seedUsers()
    writeUsers(users)
    return users
  }
}

export function persistUsers(users: StoredUser[]): void {
  writeUsers(users)
}

export function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
  }
}

import {
  ApiError,
  type AuthResponse,
  type LoginInput,
  type RegisterInput,
  type User,
} from '../types'
import {
  persistUsers,
  readUsers,
  toPublicUser,
  type StoredUser,
} from './storage'

const LATENCY_MS = 500

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function mockLogin(input: LoginInput): Promise<AuthResponse> {
  await wait()

  const email = normalizeEmail(input.email)
  const user = readUsers().find((candidate) => candidate.email === email)

  if (!user || user.password !== input.password) {
    throw new ApiError('Incorrect email or password.', 401)
  }

  return {
    token: `mock-${crypto.randomUUID()}`,
    user: toPublicUser(user),
  }
}

export async function mockRegister(input: RegisterInput): Promise<User> {
  await wait()

  const email = normalizeEmail(input.email)
  const users = readUsers()

  if (users.some((candidate) => candidate.email === email)) {
    throw new ApiError('That email is already registered.', 409, {
      email: 'An account with this email already exists.',
    })
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    role: 'employee',
    password: input.password,
    active: true,
    createdAt: new Date().toISOString(),
  }

  persistUsers([...users, user])

  return toPublicUser(user)
}

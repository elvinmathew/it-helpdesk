import { firstString, isRecord } from '../lib/guards'
import { request, USE_MOCK } from './client'
import { mockLogin, mockRegister } from './mock/auth'
import {
  ApiError,
  type AuthResponse,
  type LoginInput,
  type RegisterInput,
  type Role,
  type User,
} from './types'

interface RawUser {
  id?: unknown
  name?: unknown
  fullName?: unknown
  email?: unknown
  role?: unknown
}

interface RawAuthResponse extends RawUser {
  token?: unknown
  accessToken?: unknown
  jwt?: unknown
  user?: RawUser
  data?: RawUser & { token?: unknown; accessToken?: unknown; user?: RawUser }
}

/**
 * Keeps token/role naming differences in one place. If the Spring Boot
 * response shape changes, this is the only section that needs updating.
 */
function normalizeAuthResponse(raw: RawAuthResponse): AuthResponse {
  const data = isRecord(raw.data) ? raw.data : raw
  const token =
    firstString(data.token) ??
    firstString(data.accessToken) ??
    firstString(raw.token) ??
    firstString(raw.accessToken) ??
    firstString(raw.jwt)

  if (!token) {
    throw new ApiError('The server did not return an access token.', 500)
  }

  const user = isRecord(data.user)
    ? data.user
    : isRecord(raw.user)
      ? raw.user
      : data

  return { token, user: normalizeUser(user) }
}

function normalizeUser(raw: unknown): User {
  if (!isRecord(raw)) {
    throw new ApiError('The server returned an unexpected response.', 500)
  }

  const id = raw.id
  const name = raw.name ?? raw.fullName
  const email = raw.email
  const role = normalizeRole(raw.role)

  if (
    (typeof id !== 'string' && typeof id !== 'number') ||
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    !role
  ) {
    throw new ApiError('The server returned an unexpected user record.', 500)
  }

  return {
    id: String(id),
    name,
    email,
    role,
  }
}

function normalizeRole(value: unknown): Role | null {
  if (typeof value !== 'string') {
    return null
  }

  const role = value.trim().toLowerCase().replace(/^role_/, '')

  return role === 'employee' || role === 'agent' || role === 'admin'
    ? role
    : null
}

export const authApi = {
  login(input: LoginInput): Promise<AuthResponse> {
    if (USE_MOCK) {
      return mockLogin(input)
    }

    return request<RawAuthResponse>('/auth/login', {
      method: 'POST',
      body: input,
    }).then(normalizeAuthResponse)
  },

  async register(input: RegisterInput): Promise<User> {
    if (USE_MOCK) {
      return mockRegister(input)
    }

    const raw = await request<RawAuthResponse>('/auth/register', {
      method: 'POST',
      body: input,
    })

    const data = isRecord(raw.data) ? raw.data : raw
    const user = isRecord(data.user) ? data.user : data

    return normalizeUser(user)
  },
}

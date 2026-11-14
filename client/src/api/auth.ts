import { request, USE_MOCK } from './client'
import { mockLogin, mockRegister } from './mock/auth'
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from './types'

/**
 *
 *
 *   POST /auth/login    -> { token, user }
 *   POST /auth/register -> { user }
 *
 * 
 */
export const authApi = {
  login(input: LoginInput): Promise<AuthResponse> {
    if (USE_MOCK) {
      return mockLogin(input)
    }

    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: input,
    })
  },

  async register(input: RegisterInput): Promise<User> {
    if (USE_MOCK) {
      return mockRegister(input)
    }

    const { user } = await request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: input,
    })

    return user
  },
}

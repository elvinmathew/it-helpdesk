import { createContext, useContext } from 'react'
import type { LoginInput, RegisterInput, User } from '../api/types'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth must be used inside <AuthProvider>.')
  }

  return value
}

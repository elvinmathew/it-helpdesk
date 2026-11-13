import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import type { AuthResponse, LoginInput, RegisterInput } from '../api/types'
import { AuthContext, type AuthContextValue } from './context'
import { clearSession, readSession, saveSession } from './session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(() => readSession())

  const login = useCallback(async (input: LoginInput) => {
    const next = await authApi.login(input)
    saveSession(next)
    setSession(next)
    return next.user
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    return authApi.register(input)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

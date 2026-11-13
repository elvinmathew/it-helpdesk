export type Role = 'employee' | 'agent' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export type FieldErrors = Partial<Record<string, string>>

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: FieldErrors

  constructor(message: string, status: number, fieldErrors?: FieldErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

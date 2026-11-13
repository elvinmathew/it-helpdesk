import { getToken } from '../auth/session'
import { firstString, isRecord } from '../lib/guards'
import { ApiError, type FieldErrors } from './types'

const API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

// Mock mode is enabled in .env.development. Production builds talk to the real API.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: Method
  body?: unknown
  signal?: AbortSignal
}

export async function request<T>(
  path: string,
  { method = 'GET', body, signal }: RequestOptions = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { Accept: 'application/json' }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new ApiError(
      'Unable to reach the server. Check your connection and try again.',
      0,
    )
  }

  const data = await readBody(response)

  if (!response.ok) {
    throw toApiError(response.status, data)
  }

  return data as T
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }

  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function toApiError(status: number, payload: unknown): ApiError {
  if (typeof payload === 'string' && payload.trim()) {
    return new ApiError(payload, status)
  }

  const data = isRecord(payload) ? payload : {}
  const message =
    firstString(data.message) ??
    firstString(data.error) ??
    defaultMessage(status)

  return new ApiError(message, status, readFieldErrors(data.fieldErrors ?? data.errors))
}

function readFieldErrors(value: unknown): FieldErrors | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const entries = Object.entries(value).flatMap(([field, raw]) => {
    const message = Array.isArray(raw) ? firstString(raw[0]) : firstString(raw)
    return message ? [[field, message] as const] : []
  })

  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

function defaultMessage(status: number): string {
  switch (status) {
    case 0:
      return 'Unable to reach the server. Check your connection and try again.'
    case 400:
      return 'Please check the information you entered and try again.'
    case 401:
      return 'Your email or password is incorrect.'
    case 403:
      return 'You do not have permission to do that.'
    case 404:
      return 'We could not find what you were looking for.'
    case 409:
      return 'That action conflicts with existing data.'
    case 429:
      return 'Too many attempts. Please wait a moment and try again.'
    default:
      return status >= 500
        ? 'Something went wrong on the server. Please try again.'
        : 'Something went wrong. Please try again.'
  }
}

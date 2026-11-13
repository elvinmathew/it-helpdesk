import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '../api/types'

/**
 * Maps backend errors onto form fields when possible, and falls back to a
 * single form-level message for errors that are not field-specific.
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  setFormError: (message: string | null) => void,
  fields: ReadonlyArray<Path<T>>,
): void {
  if (error instanceof ApiError) {
    let mapped = false

    for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
      if (!message) {
        continue
      }

      if (fields.includes(field as Path<T>)) {
        setError(field as Path<T>, { type: 'server', message })
        mapped = true
      }
    }

    setFormError(mapped ? null : error.message)
    return
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return
  }

  setFormError('Something went wrong. Please try again.')
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from './errors'

interface ResourceResult<T> {
  key: string
  data: T | null
  error: string | null
}

/**
 * Loads an async resource and reloads it when `key` changes. The key is a
 * string (for example a serialised filter object) so callers stay explicit
 * about what triggers a refetch.
 *
 * The result is keyed by request, which means `loading` is derived instead of
 * being set synchronously inside an effect. Previous data stays visible while
 * a reload is in flight.
 */
export function useResource<T>(load: () => Promise<T>, key = '') {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<ResourceResult<T> | null>(null)
  const requestKey = `${key}::${version}`
  const loadRef = useRef(load)

  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    let active = true

    loadRef
      .current()
      .then((data) => {
        if (active) {
          setResult({ key: requestKey, data, error: null })
        }
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof DOMException && error.name === 'AbortError') return

        setResult({
          key: requestKey,
          data: null,
          error: errorMessage(error),
        })
      })

    return () => {
      active = false
    }
  }, [requestKey])

  const reload = useCallback(() => setVersion((value) => value + 1), [])

  const mutate = useCallback(
    (updater: (current: T | null) => T | null) => {
      setResult((previous) => {
        const current =
          previous && previous.key === requestKey ? previous.data : null
        return { key: requestKey, data: updater(current), error: null }
      })
    },
    [requestKey],
  )

  const isCurrent = result?.key === requestKey

  return {
    data: result?.data ?? null,
    loading: !isCurrent,
    error: isCurrent ? result.error : null,
    reload,
    mutate,
  }
}

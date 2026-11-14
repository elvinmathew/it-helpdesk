import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from './errors'

interface Result<T> {
  key: string
  data: T | null
  error: string | null
}

export function useAsyncData<T>(load: () => Promise<T>, key = '') {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<Result<T> | null>(null)
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
        if (active) setResult({ key: requestKey, data, error: null })
      })
      .catch((cause: unknown) => {
        if (active) {
          setResult({ key: requestKey, data: null, error: errorMessage(cause) })
        }
      })

    return () => {
      active = false
    }
  }, [requestKey])

  const reload = useCallback(() => setVersion((value) => value + 1), [])
  const current = result && result.key === requestKey ? result : null

  return {
    data: result?.data ?? null,
    loading: current === null,
    error: current?.error ?? null,
    reload,
  }
}

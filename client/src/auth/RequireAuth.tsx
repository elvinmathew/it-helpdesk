import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '../api/types'
import { useAuth } from './context'
import { homePath } from './roles'

interface RequireAuthProps {
  roles?: Role[]
}

export function RequireAuth({ roles }: RequireAuthProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePath(user.role)} replace />
  }

  return <Outlet />
}

export function GuestOnly() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to={homePath(user.role)} replace />
  }

  return <Outlet />
}

export function HomeRedirect() {
  const { user } = useAuth()

  return <Navigate to={user ? homePath(user.role) : '/login'} replace />
}

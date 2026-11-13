import { LayoutDashboard, LogOut, Ticket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context'
import { ROLE_LABELS } from '../../auth/roles'
import type { Role } from '../../api/types'
import { Button } from '@/components/ui/button'
import { Logo } from '../Logo'
import { cn } from '@/lib/utils'

const NAV: Record<Role, Array<{ to: string; label: string; icon: LucideIcon }>> =
  {
    employee: [{ to: '/employee', label: 'My tickets', icon: Ticket }],
    agent: [{ to: '/agent', label: 'Queue', icon: LayoutDashboard }],
    admin: [{ to: '/admin', label: 'Overview', icon: LayoutDashboard }],
  }

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <Logo />

            <nav className="flex items-center gap-1" aria-label="Main">
              {NAV[user.role].map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                      )
                    }
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-40 truncate text-sm font-medium text-slate-900">
                {user.name}
              </p>
              <p className="text-xs text-slate-500">
                {ROLE_LABELS[user.role]}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              aria-label="Sign out"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
